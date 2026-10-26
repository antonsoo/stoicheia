import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/stoicheia-circle");
await mkdir(out, { recursive: true });
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const readings = JSON.parse(
  execFileSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      "import {circlePassages} from './src/content/circle.ts';console.log(JSON.stringify(circlePassages));",
    ],
    { encoding: "utf8" },
  ),
);
const manifest = JSON.parse(await readFile("public/sources/circle/manifest.json", "utf8"));
const workerBytes = await readFile("dist/sw.js"),
  worker = workerBytes.toString();
const edition = /const EDITION = "([a-f0-9]+)"/.exec(worker)?.[1];
const files = JSON.parse(/const FILES = (\[[^;]+\]);/.exec(worker)?.[1] ?? "null");
assert(edition && files);
assert(files.includes("/stoicheia/circle.html"));
const report = {
  checkedAt: new Date().toISOString(),
  scope:
    "Local production build and actual downloaded artifacts. No public-hosting or physical-printing claim.",
  edition,
  workerSha256: hash(workerBytes),
  configurations: [],
};

async function serve() {
  let online = true,
    requests = 0;
  const server = createServer(async (req, res) => {
    requests++;
    if (!online) {
      req.socket.destroy();
      return;
    }
    try {
      const raw = new URL(req.url, "http://local").pathname;
      assert(raw.startsWith("/stoicheia/"));
      const relative = raw.slice("/stoicheia/".length) || "index.html";
      assert(!relative.includes(".."));
      const bytes = await readFile(path.join("dist", relative));
      res
        .writeHead(200, {
          "cache-control": "no-store",
          "content-type":
            {
              ".html": "text/html",
              ".js": "text/javascript",
              ".css": "text/css",
              ".jpg": "image/jpeg",
              ".svg": "image/svg+xml",
              ".ttf": "font/ttf",
              ".txt": "text/plain",
              ".json": "application/json",
            }[path.extname(relative)] ?? "application/octet-stream",
        })
        .end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    base: `http://127.0.0.1:${server.address().port}/stoicheia/`,
    offline() {
      online = false;
      server.closeAllConnections();
    },
    get requests() {
      return requests;
    },
    async close() {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    },
  };
}
async function fits(page) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "Document overflows",
  );
}
async function save(page, selector, file) {
  const pending = page.waitForEvent("download");
  await page.locator(selector).click();
  const item = await pending;
  assert.equal(await item.failure(), null);
  await item.saveAs(file);
  return readFile(file);
}
async function ready(page) {
  await page
    .locator("#ci-offline")
    .filter({ hasText: "Edition ready offline" })
    .waitFor({ timeout: 60000 });
}
async function source(page, n) {
  await page.locator("#ci-page").selectOption(String(n));
  await page
    .locator("#ci-source-caption")
    .filter({ hasText: `Printed p.${n} ·` })
    .waitFor();
  const bytes = await page
    .locator("#ci-source-image")
    .evaluate(async (img) => window.circleBlobBytes[img.src]);
  assert.equal(hash(Buffer.from(bytes)), manifest.pages.find((p) => p.page === n).sha256);
}
async function artifactReview(browser, file, width, engine, folder, label = "reading") {
  const bytes = await readFile(file),
    html = bytes.toString();
  assert(!/<script\b/i.test(html));
  const images = [...html.matchAll(/<img src="data:image\/jpeg;base64,([^"]+)"/g)].map((m) =>
    Buffer.from(m[1], "base64"),
  );
  assert.equal(images.length, 10);
  for (const [i, b] of images.entries()) assert.equal(hash(b), manifest.pages[i].sha256);
  const font = /src:url\("(data:font\/ttf;base64,[^"]+)"\)/.exec(html);
  assert(font);
  assert.equal(
    hash(Buffer.from(font[1].split(",")[1], "base64")),
    hash(await readFile("public/fonts/NotoSerif-Regular.ttf")),
  );
  assert(html.includes((await readFile("public/fonts/OFL.txt", "utf8")).slice(0, 100)));
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width, height: 950 },
  });
  const page = await context.newPage(),
    remote = [];
  await page.route(/^https?:/, (route) => {
    remote.push(route.request().url());
    return route.abort();
  });
  await page.goto(pathToFileURL(file).href);
  await page.waitForLoadState("load");
  await fits(page);
  assert.equal(await page.locator(".ci-full-passage").count(), 8);
  assert.equal(await page.locator(".ci-source-sheet img").count(), 10);
  assert(
    await page
      .locator(".ci-source-sheet img")
      .evaluateAll((imgs) => imgs.every((i) => i.complete && i.naturalWidth > 1000)),
  );
  assert.deepEqual(remote, []);
  await page.screenshot({ path: path.join(folder, `${label}-saved.png`) });
  let pdf = null;
  if (engine === "chromium" && width === 1440) {
    pdf = path.join(folder, `${label}.pdf`);
    await page.pdf({ path: pdf, format: "A4", printBackground: true, preferCSSPageSize: true });
  }
  await context.close();
  return {
    bytes: bytes.length,
    sha256: hash(bytes),
    verifiedImages: images.length,
    remoteRequests: remote.length,
    pdf: pdf ? path.relative(out, pdf) : null,
  };
}

for (const [engine, type] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  if (process.env.CIRCLE_REVIEW_ENGINE && process.env.CIRCLE_REVIEW_ENGINE !== engine) continue;
  const browser = await type.launch();
  try {
    for (const width of [1440, 375]) {
      if (process.env.CIRCLE_REVIEW_WIDTH && Number(process.env.CIRCLE_REVIEW_WIDTH) !== width)
        continue;
      const server = await serve(),
        folder = path.join(out, `${engine}-${width}`);
      await mkdir(folder, { recursive: true });
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      });
      const page = await context.newPage(),
        errors = [],
        csv = [],
        sources = [];
      // Capture the exact Blob supplied to the image without bypassing CSP.
      await page.addInitScript(() => {
        const original = URL.createObjectURL;
        window.circleBlobBytes = {};
        URL.createObjectURL = function (blob) {
          const url = original.call(this, blob);
          window.circleBlobBytes[url] = blob
            .arrayBuffer()
            .then((b) => Array.from(new Uint8Array(b)));
          return url;
        };
      });
      page.on("pageerror", (e) => errors.push(String(e)));
      const config = { engine, version: browser.version(), width, csv, sources, errors };
      try {
        await page.goto(server.base);
        const companion = page.locator("#companion-workshops");
        if (!(await companion.evaluate((d) => d.open))) await companion.locator("summary").click();
        await page.getByRole("link", { name: /Keep the safe side/ }).click();
        assert(new URL(page.url()).pathname.endsWith("circle.html"));
        await page
          .locator("#ci-stage-heading")
          .filter({ hasText: "0 bisections · 6 sides" })
          .waitFor();
        await ready(page);
        await fits(page);
        await page.screenshot({ path: path.join(folder, "opening.png") });
        await page.locator('[data-stage="4"]').focus();
        await page.keyboard.press("Space");
        await page.locator("#ci-bounds").filter({ hasText: "29376/9347" }).waitFor();
        await page
          .locator("#ci-next")
          .isDisabled()
          .then((v) => assert(v));
        await page.locator("#ci-back").click();
        await page.locator("#ci-next").click();
        for (let i = 0; i < 8; i++) {
          await page.locator("#ci-passage").selectOption(String(i));
          assert(
            (await page.locator('#ci-reading [lang="grc"]').first().textContent()).length > 30,
          );
          assert.equal(
            await page.locator('#ci-reading [lang="la"]').first().textContent(),
            readings[i].latin,
          );
          assert.equal(await page.locator("#ci-reading .ci-words dt").count(), 2);
        }
        await page.locator("#ci-near-miss").focus();
        await page.keyboard.press("Enter");
        await page.locator("#ci-bound-status").filter({ hasText: "chain has a gap" }).waitFor();
        assert.match(await page.locator("#ci-square-test").textContent(), /wrong side/);
        assert.equal(
          await page.locator(".ci-table tbody tr").nth(2).locator("td").nth(2).textContent(),
          "safe",
        );
        assert.equal(
          await page.locator(".ci-table tbody tr").nth(2).locator("td").nth(3).textContent(),
          "broken",
        );
        const brokenCsv = path.join(folder, "broken.csv");
        await save(page, "#ci-csv", brokenCsv);
        csv.push({
          file: path.relative(out, brokenCsv),
          alteration: { branch: "outer", row: 1, value: "11823/20" },
        });
        await page.locator('[data-stage="1"]').click();
        assert.match(
          await page.locator("#ci-bound-status").textContent(),
          /Both perimeter bounds.*later bisection/,
        );
        await page.locator('[data-stage="4"]').click();
        const before = new URL(page.url()).search;
        await page.locator("#ci-value").fill("1/0");
        await page.locator('#ci-edit-form button[type="submit"]').click();
        assert.equal(new URL(page.url()).search, before);
        assert.match(await page.locator("#ci-edit-status").textContent(), /unchanged/);
        await page.locator("#ci-value").fill("591.124");
        await page.locator('#ci-edit-form button[type="submit"]').click();
        assert.match(await page.locator("#ci-bound-status").textContent(), /Both perimeter bounds/);
        await page.locator("#ci-value").fill("600");
        const jsonFile = path.join(folder, "editable.json"),
          savedJson = JSON.parse((await save(page, "#ci-json", jsonFile)).toString());
        assert.equal(savedJson.state.alteration.value, "147781/250");
        await page.locator("#ci-share").click();
        const share = await page.locator("#ci-share-url").inputValue();
        await page.goto(share);
        assert.match(await page.locator("#ci-edit-status").textContent(), /147781\/250/);
        await page.locator("#ci-restore").click();
        await page.locator("#ci-open").setInputFiles(jsonFile);
        await page.locator("#ci-open-status").filter({ hasText: "Reopened" }).waitFor();
        assert.match(await page.locator("#ci-edit-status").textContent(), /147781\/250/);
        const bad = path.join(folder, "unsupported.json");
        await writeFile(bad, JSON.stringify({ ...savedJson, version: 99 }));
        const recordBeforeBad = new URL(page.url()).search;
        await page.locator("#ci-open").setInputFiles(bad);
        await page.locator("#ci-open-status").filter({ hasText: "unchanged" }).waitFor();
        assert.equal(new URL(page.url()).search, recordBeforeBad);
        await page.locator("#ci-low-inner").click();
        assert.match(await page.locator("#ci-bound-status").textContent(), /inner chain has a gap/);
        const innerCsv = path.join(folder, "inner-broken.csv");
        await save(page, "#ci-csv", innerCsv);
        csv.push({
          file: path.relative(out, innerCsv),
          alteration: { branch: "inner", row: 4, value: "50431/25" },
        });
        const brokenHtml = path.join(folder, "broken-reading.html");
        await save(page, "#ci-save", brokenHtml);
        assert((await readFile(brokenHtml, "utf8")).includes("unproved candidate"));
        await page.locator("#ci-restore").click();
        await page.locator('input[name="ci-answer"][value="gap"]').check();
        await page.locator("#ci-question button").click();
        assert.match(await page.locator("#ci-feedback").textContent(), /^Correct/);
        for (const p of manifest.pages) {
          await source(page, p.page);
          sources.push({ page: p.page, sha256: p.sha256 });
        }
        await page.locator("#ci-zoom").click();
        await page.locator("#ci-source-scroll").focus();
        await page.keyboard.press("ArrowRight");
        await page.waitForFunction(
          () => document.querySelector("#ci-source-scroll").scrollLeft > 0,
        );
        await page.locator("#ci-zoom").click();
        await page.locator("#ci-passage").selectOption("1");
        await page.locator("#ci-see-page").click();
        await page.locator("#ci-source-caption").filter({ hasText: "Printed p.262" }).waitFor();
        const afterSource = new URL(page.url()).search;
        await page.locator("#ci-page").selectOption("263");
        await page.goBack();
        assert.equal(new URL(page.url()).search, afterSource);
        const goodCsv = path.join(folder, "printed.csv");
        await save(page, "#ci-csv", goodCsv);
        csv.push({ file: path.relative(out, goodCsv), alteration: null });
        const svg = await save(page, "#ci-svg", path.join(folder, "polygons.svg"));
        assert(svg.toString().includes("data:font/ttf;base64,"));
        const svgNotice = await page.evaluate(
          (text) =>
            new DOMParser().parseFromString(text, "image/svg+xml").querySelector("metadata")
              ?.textContent,
          svg.toString(),
        );
        assert(svgNotice.includes(await readFile("LICENSE", "utf8")));
        config.svgFullMitNotice = true;
        const readingFile = path.join(folder, "reading.html");
        await save(page, "#ci-save", readingFile);
        config.reading = await artifactReview(browser, readingFile, width, engine, folder);
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        assert.deepEqual(
          axe.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
          [],
        );
        config.axeViolations = axe.violations.length;
        await fits(page);
        await page.locator("#ci-audit").screenshot({ path: path.join(folder, "audit.png") });
        const inventory = await page.evaluate(async () => {
          const keys = await caches.keys(),
            key = keys.find((k) => k.startsWith("stoicheia-"));
          const cache = await caches.open(key);
          return { key, paths: (await cache.keys()).map((r) => new URL(r.url).pathname).sort() };
        });
        assert.equal(inventory.key, `stoicheia-${edition}`);
        assert.deepEqual(inventory.paths, [...files].sort());
        config.cachedFiles = inventory.paths.length;
        server.offline();
        assert.equal(
          await fetch(server.base).then(
            () => true,
            () => false,
          ),
          false,
        );
        await page.reload();
        await ready(page);
        await source(page, 271);
        await page.locator("#ci-near-miss").click();
        assert.match(await page.locator("#ci-bound-status").textContent(), /chain has a gap/);
        const offlineHtml = path.join(folder, "offline-reading.html");
        await save(page, "#ci-save", offlineHtml);
        const offlineCsv = path.join(folder, "offline.csv");
        await save(page, "#ci-csv", offlineCsv);
        csv.push({
          file: path.relative(out, offlineCsv),
          alteration: { branch: "outer", row: 1, value: "11823/20" },
        });
        await save(page, "#ci-json", path.join(folder, "offline-settings.json"));
        config.offlineReading = await artifactReview(
          browser,
          offlineHtml,
          width,
          engine,
          folder,
          "offline-reading",
        );
        await page.getByRole("link", { name: "Euclid course", exact: true }).click();
        await page.locator("#lesson-title").waitFor();
        if (!(await page.locator("#companion-workshops").evaluate((d) => d.open)))
          await page.locator("#companion-workshops summary").click();
        await page.getByRole("link", { name: /Keep the safe side/ }).click();
        await page.locator("#ci-stage-heading").waitFor();
        await ready(page);
        config.offline =
          "origin connections destroyed; reload, source, arithmetic, export, course and return succeeded";
        assert.deepEqual(errors, []);
        report.configurations.push(config);
        console.log(
          `${engine} ${width}: controls, exact records, sources, native files and origin-disabled offline journey passed`,
        );
      } catch (error) {
        await page.screenshot({ path: path.join(folder, "failure.png") });
        console.error(
          JSON.stringify({
            engine,
            width,
            url: page.url(),
            sourceStatus: await page.locator("#ci-source-status").textContent(),
            caption: await page.locator("#ci-source-caption").textContent(),
            errors,
          }),
        );
        throw error;
      } finally {
        await context.close();
        await server.close();
      }
    }
    // Hold a previous page request, return to the displayed page, then release it.
    const raceServer = await serve(),
      raceContext = await browser.newContext({ serviceWorkers: "block" });
    try {
      const page = await raceContext.newPage();
      let release;
      const held = new Promise((resolve) => {
        release = resolve;
      });
      await page.route("**/sources/circle/heiberg-266.jpg", async (route) => {
        await held;
        await route.continue();
      });
      await page.goto(`${raceServer.base}circle.html`);
      await page.locator("#ci-source-caption").filter({ hasText: "Printed p.264" }).waitFor();
      await page.locator("#ci-page").selectOption("266");
      await page.locator("#ci-page").selectOption("264");
      await page.locator("#ci-source-caption").filter({ hasText: "Printed p.264" }).waitFor();
      const response = page.waitForResponse((r) => r.url().endsWith("heiberg-266.jpg"));
      release();
      await (await response).finished();
      await page.waitForLoadState("networkidle");
      assert.match(await page.locator("#ci-source-caption").textContent(), /Printed p.264/);
      assert(await page.locator("#ci-source-image").isVisible());
      report[`${engine}LateSourceIgnored`] = true;
    } finally {
      await raceContext.close();
      await raceServer.close();
    }
    // A fresh context cannot accept another page's bytes under a source caption.
    const server = await serve(),
      context = await browser.newContext({ serviceWorkers: "block" });
    try {
      const page = await context.newPage();
      await page.route("**/sources/circle/heiberg-264.jpg", (route) =>
        route.fulfill({ path: "dist/sources/circle/heiberg-266.jpg", contentType: "image/jpeg" }),
      );
      await page.goto(`${server.base}circle.html`);
      await page.locator("#ci-source-status").filter({ hasText: "does not match" }).waitFor();
      assert(await page.locator("#ci-source-image").isHidden());
      let downloads = 0;
      page.on("download", () => downloads++);
      await page.locator("#ci-save").click();
      await page.locator("#ci-save-status").filter({ hasText: "No file was saved" }).waitFor();
      assert.equal(downloads, 0);
      report[`${engine}SubstitutionRejected`] = true;
    } finally {
      await context.close();
      await server.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(out, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Review: ${path.join(out, "review.json")}`);
