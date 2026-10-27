import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const hosted = process.argv[3]?.startsWith("https://") ? process.argv[3] : null;
if (hosted) assert.match(hosted, /^https:\/\/.+\/$/);
const selectedEngine = process.argv[hosted ? 4 : 3];
const selectedWidth = Number(process.argv[hosted ? 5 : 4]);
const out = path.resolve(process.argv[2] ?? "/tmp/claude-1000/ratios-browser");
await mkdir(out, { recursive: true });
const hash = (b) => createHash("sha256").update(b).digest("hex");
const manifest = JSON.parse(await readFile("public/sources/ratios/manifest.json", "utf8"));
const passages = JSON.parse(
  execFileSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      "import {ratioPassages} from './src/content/ratios.ts';console.log(JSON.stringify(ratioPassages))",
    ],
    { encoding: "utf8" },
  ),
);
const worker = await readFile("dist/sw.js", "utf8");
const inventory = JSON.parse(/const FILES = (\[[^;]+\]);/.exec(worker)[1]);
const edition = /const EDITION = "([a-f0-9]+)"/.exec(worker)[1];
const report = {
  checkedAt: new Date().toISOString(),
  scope: hosted
    ? "Public HTTPS learner journeys and actual native downloads. Browser networking disabled for offline checks; public origin not stopped. Fault injection is covered by the separate local review."
    : "Local production build. Complete learner journeys, native files and origin-disabled offline reloads. No hosted-publication claim.",
  base: hosted,
  edition,
  configurations: [],
  guards: [],
};

async function serve() {
  if (hosted) return { base: hosted, online() {}, async close() {} };
  let online = true;
  const server = createServer(async (req, res) => {
    if (!online) {
      req.socket.destroy();
      return;
    }
    try {
      const pathname = new URL(req.url, "http://local").pathname;
      assert(pathname.startsWith("/stoicheia/"));
      const file = pathname.slice(11) || "index.html";
      assert(!file.includes(".."));
      const bytes = await readFile(path.join("dist", file));
      const mime =
        {
          ".html": "text/html",
          ".js": "text/javascript",
          ".css": "text/css",
          ".jpg": "image/jpeg",
          ".ttf": "font/ttf",
          ".svg": "image/svg+xml",
          ".json": "application/json",
          ".txt": "text/plain",
        }[path.extname(file)] ?? "application/octet-stream";
      res.writeHead(200, { "content-type": mime, "cache-control": "no-store" }).end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    base: `http://127.0.0.1:${server.address().port}/stoicheia/`,
    online(value) {
      online = value;
    },
    async close() {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    },
  };
}
async function trackBlobs(context) {
  await context.addInitScript(() => {
    const create = URL.createObjectURL.bind(URL);
    window.rtBlobBytes = {};
    URL.createObjectURL = (blob) => {
      const url = create(blob);
      window.rtBlobBytes[url] = blob.arrayBuffer();
      return url;
    };
  });
}
async function save(page, selector, filename) {
  const event = page.waitForEvent("download");
  await page.locator(selector).click();
  const download = await event;
  assert.equal(await download.failure(), null);
  await download.saveAs(filename);
  return readFile(filename);
}
async function fits(page) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "Document overflows horizontally",
  );
}
async function source(page, printed) {
  await page.locator("#rt-page").selectOption(String(printed));
  await page
    .locator("#rt-source-caption")
    .filter({ hasText: printed ? `Printed p.${printed} ·` : "Title ·" })
    .waitFor();
  const bytes = await page
    .locator("#rt-source-image")
    .evaluate(async (img) => [...new Uint8Array(await window.rtBlobBytes[img.src])]);
  assert.equal(hash(Buffer.from(bytes)), manifest.pages.find((p) => p.page === printed).sha256);
}
async function retained(browser, filename, folder, width, engine, record, csv) {
  const html = await readFile(filename, "utf8");
  assert(!/<script\b|\son\w+=/i.test(html));
  const images = [...html.matchAll(/<img src="data:image\/jpeg;base64,([^"]+)"/g)];
  assert.equal(images.length, manifest.pages.length);
  images.forEach((m, i) => {
    assert.equal(hash(Buffer.from(m[1], "base64")), manifest.pages[i].sha256);
  });
  const font = /src:url\('(data:font\/ttf;base64,[^']+)'\)/.exec(html);
  assert(font);
  assert.equal(
    hash(Buffer.from(font[1].split(",")[1], "base64")),
    hash(await readFile("public/fonts/NotoSerif-Regular.ttf")),
  );
  const context = await browser.newContext({
    javaScriptEnabled: false,
    acceptDownloads: true,
    viewport: { width, height: 1000 },
  });
  const page = await context.newPage(),
    requests = [];
  await page.route(/^https?:/, (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  await page.goto(pathToFileURL(filename).href);
  await page.waitForFunction(() =>
    [...document.fonts].some((f) => f.family.includes("Noto Serif") && f.status === "loaded"),
  );
  assert(
    await page
      .locator(".rt-source-sheet img")
      .evaluateAll((imgs) => imgs.every((i) => i.complete && i.naturalHeight >= 1400)),
  );
  assert.equal(await page.locator(".rt-full-reading").count(), passages.length);
  for (const [i, p] of passages.entries()) {
    const block = page.locator(".rt-full-reading").nth(i);
    assert.equal(await block.locator('.rt-reading-grid [lang="grc"]').textContent(), p.greek);
    assert.equal(await block.locator('.rt-reading-grid [lang="la"]').textContent(), p.latin);
    for (const word of p.words)
      assert((await block.locator(".rt-words").textContent()).includes(word.meaning));
  }
  assert.deepEqual(JSON.parse(await page.locator("#rt-saved-record").textContent()), record);
  const embedded = await save(
    page,
    'a[download="stoicheia-ratios.json"]',
    path.join(folder, "embedded.json"),
  );
  assert.deepEqual(JSON.parse(embedded), record);
  const embeddedCsv = await save(
    page,
    'a[download="stoicheia-ratios.csv"]',
    path.join(folder, "embedded.csv"),
  );
  assert.equal(hash(embeddedCsv), hash(csv));
  const licenses = await page.locator(".rt-license pre").textContent();
  assert(licenses.includes(await readFile("LICENSE", "utf8")));
  assert(licenses.includes(await readFile("public/fonts/OFL.txt", "utf8")));
  await fits(page);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: path.join(folder, "retained-reading.png") });
  if (engine === "chromium" && width === 1440)
    await page.pdf({
      path: path.join(folder, "reading.pdf"),
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
  assert.deepEqual(requests, []);
  await context.close();
  return {
    bytes: Buffer.byteLength(html),
    sha256: hash(html),
    sourceImages: images.length,
    readings: passages.length,
    scripts: 0,
    remoteSubrequests: 0,
  };
}

for (const [engine, type] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  if (selectedEngine && selectedEngine !== engine) continue;
  const browser = await type.launch({ headless: true });
  try {
    for (const width of [1440, 375]) {
      if (selectedWidth && selectedWidth !== width) continue;
      const server = await serve(),
        folder = path.join(out, `${engine}-${width}`);
      await mkdir(folder, { recursive: true });
      const context = await browser.newContext({
        viewport: { width, height: 1050 },
        acceptDownloads: true,
      });
      await trackBlobs(context);
      const page = await context.newPage(),
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      try {
        await page.goto(server.base);
        await page.locator("#lesson-title").waitFor();
        const companions = page.locator("#companion-workshops");
        if (
          !(await companions.getAttribute("open")) &&
          (await companions.getAttribute("open")) !== ""
        )
          await companions.locator("summary").click();
        await page.locator('a[href="./ratios.html"]').click();
        await page.locator("#rt-title").waitFor();
        assert.match(
          await page.locator("#rt-scan-result").textContent(),
          /4,761 comparisons agree/,
        );
        await fits(page);
        await page.screenshot({ path: path.join(folder, "opening.png") });
        await page.locator('[data-rt-bound="100"]').click();
        assert.match(await page.locator("#rt-scan-result").textContent(), /1 of 10,000/);
        await page.locator("#rt-find").click();
        assert.equal(await page.locator("#rt-m").inputValue(), "70");
        assert.equal(await page.locator("#rt-n").inputValue(), "99");
        assert.match(await page.locator("#rt-signs").textContent(), /70√2 < 99.*6930 = 6930/);
        assert.match(await page.locator("#rt-verdict").textContent(), /not itself.*definition 7/);
        await page.locator("#rt-m").focus();
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("Tab");
        assert.equal(await page.locator("#rt-m").inputValue(), "71");
        await page.goBack();
        assert.equal(await page.locator("#rt-m").inputValue(), "70");
        await page.locator("#rt-m-range").focus();
        await page.keyboard.press("ArrowRight");
        assert.equal(await page.locator("#rt-m").inputValue(), "71");
        assert.equal(await page.evaluate(() => document.activeElement.id), "rt-m-range");
        await page.locator('[data-rt-bound="600"]').click();
        await page.locator("#rt-excess").click();
        assert.equal(await page.locator("#rt-m").inputValue(), "239");
        assert.equal(await page.locator("#rt-n").inputValue(), "338");
        assert.match(await page.locator("#rt-verdict").textContent(), /second ratio is greater/);
        await page.locator('[data-rt-pair="140,99"]').click();
        await page.locator("#rt-find").click();
        assert.equal(await page.locator("#rt-m").inputValue(), "99");
        assert.equal(await page.locator("#rt-n").inputValue(), "140");
        assert.match(await page.locator("#rt-verdict").textContent(), /first ratio is greater/);
        await page.locator('[data-rt-pair="scaled"]').click();
        assert.match(
          await page.locator("#rt-scan-result").textContent(),
          /360,000 comparisons agree/,
        );
        await page.locator(".rt-proof summary").click();
        assert.match(await page.locator("#rt-proof").textContent(), /any positive integers/);
        await page.locator("#rt-p").fill("9999");
        await page.locator("#rt-q").fill("1");
        await page.locator('#rt-fraction button[type="submit"]').click();
        assert.match(await page.locator("#rt-fraction-status").textContent(), /between 1 and 2/);
        assert.match(await page.locator("#rt-title").textContent(), /3√2/);
        await page.locator('[data-rt-pair="99,70"]').click();
        await page.locator('[data-rt-bound="100"]').click();
        await page.locator("#rt-find").click();
        await page.locator("#rt-title").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(folder, "witness.png") });
        for (const [i, passage] of passages.entries()) {
          await page.locator("#rt-reading-select").selectOption(String(i));
          assert.equal(
            await page.locator('#rt-reading-text .rt-reading-grid [lang="grc"]').textContent(),
            passage.greek,
          );
          assert.equal(
            await page.locator('#rt-reading-text .rt-reading-grid [lang="la"]').textContent(),
            passage.latin,
          );
          for (const [j, word] of passage.words.entries()) {
            await page.locator(`[data-rt-word="${j}"]`).click();
            assert((await page.locator("#rt-word-note").textContent()).includes(word.meaning));
          }
        }
        await page.locator("#rt-find-greek").click();
        assert.equal(await page.locator("#rt-page").inputValue(), "4");
        await page.locator("#rt-find-latin").click();
        assert.equal(await page.locator("#rt-page").inputValue(), "5");
        for (const p of manifest.pages) await source(page, p.page);
        await page.locator("#rt-zoom").click();
        await page.locator("#rt-source-pan").focus();
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowDown");
        await page.waitForFunction(() => document.getElementById("rt-source-pan").scrollLeft > 0);
        await page.locator("#rt-question input[value=bounded]").check();
        await page.locator("#rt-question button").click();
        assert.match(await page.locator("#rt-feedback").textContent(), /single counterexample/);
        await page.locator("#rt-share").click();
        const shared = await page.locator("#rt-share-url").inputValue();
        const sharedPage = await context.newPage();
        await sharedPage.goto(shared);
        assert.equal(await sharedPage.locator("#rt-m").inputValue(), "70");
        assert.equal(await sharedPage.locator("#rt-reading-select").inputValue(), "6");
        assert.equal(await sharedPage.locator("#rt-page").inputValue(), "5");
        await sharedPage.close();
        const json = await save(page, "#rt-json", path.join(folder, "experiment.json")),
          record = JSON.parse(json);
        const csv = await save(page, "#rt-csv", path.join(folder, "comparison.csv"));
        await page.locator("#rt-import").setInputFiles({
          name: "invalid.json",
          mimeType: "application/json",
          buffer: Buffer.from(JSON.stringify({ ...record, state: { ...record.state, m: "70" } })),
        });
        await page
          .locator("#rt-save-status")
          .filter({ hasText: "current experiment is preserved" })
          .waitFor();
        assert.equal(await page.locator("#rt-m").inputValue(), "70");
        await page.locator('[data-rt-pair="scaled"]').click();
        await page
          .locator("#rt-import")
          .setInputFiles({ name: "experiment.json", mimeType: "application/json", buffer: json });
        await page.locator("#rt-save-status").filter({ hasText: "Experiment restored" }).waitFor();
        assert.match(await page.locator("#rt-title").textContent(), /99 : 70/);
        const filename = path.join(folder, "reading.html");
        await save(page, "#rt-save", filename);
        const saved = await retained(browser, filename, folder, width, engine, record, csv);
        const audit = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        assert.deepEqual(audit.violations, [], JSON.stringify(audit.violations));
        await page
          .locator("#rt-offline")
          .filter({ hasText: "Edition ready offline" })
          .waitFor({ timeout: 60000 });
        const cache = await page.evaluate(async () => {
          const channel = new MessageChannel();
          const response = new Promise((r) => {
            channel.port1.onmessage = (e) => r(e.data);
          });
          navigator.serviceWorker.controller.postMessage({ type: "STOICHEIA_INSPECT_EDITION" }, [
            channel.port2,
          ]);
          const reply = await response;
          const files = (await (await caches.open(`stoicheia-${reply.edition}`)).keys()).map(
            (r) => new URL(r.url).pathname,
          );
          return { reply, files };
        });
        assert.equal(cache.reply.edition, edition);
        assert.equal(cache.reply.complete, true);
        assert.deepEqual(cache.files.sort(), [...inventory].sort());
        server.online(false);
        await context.setOffline(true);
        await page.reload();
        await page.locator("#rt-offline").filter({ hasText: "Edition ready offline" }).waitFor();
        await source(page, 0);
        await page.locator('[data-rt-pair="577,408"]').click();
        await page.locator('[data-rt-bound="600"]').click();
        await page.locator("#rt-find").click();
        assert.equal(await page.locator("#rt-m").inputValue(), "408");
        assert.equal(await page.locator("#rt-n").inputValue(), "577");
        await save(page, "#rt-save", path.join(folder, "offline-reading.html"));
        await fits(page);
        assert.deepEqual(errors, []);
        report.configurations.push({
          engine,
          width,
          comparison: record.state,
          share: new URL(shared).search,
          saved,
          offline: {
            originServing: hosted ? "public origin not stopped" : false,
            browserNetworkEnabled: false,
            cacheFiles: cache.files.length,
            sourceAndDownloadWorked: true,
          },
          accessibilityViolations: audit.violations.length,
          pageErrors: errors,
        });
        await writeFile(path.join(out, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
        console.log(
          `${engine} ${width}: course journey, exact witnesses, seven readings, five source identities, native files, accessibility and offline reload verified`,
        );
      } catch (error) {
        await writeFile(
          path.join(folder, "failure.json"),
          JSON.stringify(
            {
              message: String(error),
              url: page.url(),
              sourceStatus: await page.locator("#rt-source-status").textContent(),
              caption: await page.locator("#rt-source-caption").textContent(),
              image: await page.locator("#rt-source-image").evaluate((img) => ({
                src: img.src,
                complete: img.complete,
                height: img.naturalHeight,
                hidden: img.hidden,
              })),
              errors,
            },
            null,
            2,
          ),
        );
        await page.screenshot({ path: path.join(folder, "failure.png") });
        throw error;
      } finally {
        await context.close();
        await server.close();
      }
    }
    if (hosted) continue;
    const server = await serve();
    try {
      const context = await browser.newContext({ serviceWorkers: "block" });
      await trackBlobs(context);
      const page = await context.newPage();
      let release, started;
      const gate = new Promise((r) => {
          release = r;
        }),
        began = new Promise((r) => {
          started = r;
        });
      await page.route("**/sources/ratios/heiberg-004.jpg", async (route) => {
        started();
        await gate;
        await route.continue();
      });
      await page.goto(`${server.base}ratios.html`);
      await page.locator("#rt-source-caption").filter({ hasText: "Printed p.2" }).waitFor();
      await page.locator("#rt-page").selectOption("4");
      await began;
      await source(page, 5);
      release();
      await page.waitForTimeout(600);
      assert.match(await page.locator("#rt-source-caption").textContent(), /Printed p.5/);
      assert.equal(await page.locator("#rt-page").inputValue(), "5");
      await context.close();
      report.guards.push({
        engine,
        case: "Late Greek page response cannot replace the subsequently selected Latin page",
        passed: true,
      });
      const fault = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true });
      const fp = await fault.newPage();
      const original = await readFile("public/sources/ratios/heiberg-003.jpg"),
        wrong = Buffer.from(original);
      wrong[wrong.length - 8] ^= 1;
      await fp.route("**/sources/ratios/heiberg-003.jpg", (route) =>
        route.fulfill({ status: 200, contentType: "image/jpeg", body: wrong }),
      );
      await fp.goto(`${server.base}ratios.html?page=3`);
      await fp
        .locator("#rt-source-status")
        .filter({ hasText: "does not match this edition" })
        .waitFor();
      assert.equal(await fp.locator("#rt-source-image").isVisible(), false);
      let downloads = 0;
      fp.on("download", () => downloads++);
      await fp.locator("#rt-save").click();
      await fp
        .locator("#rt-save-status")
        .filter({ hasText: "does not match this edition" })
        .waitFor();
      assert.equal(downloads, 0);
      await fault.close();
      report.guards.push({
        engine,
        case: "HTTP 200 substituted source is not displayed or included in a saved reading",
        passed: true,
      });
    } finally {
      await server.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(out, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Full review: ${path.join(out, "review.json")}`);
