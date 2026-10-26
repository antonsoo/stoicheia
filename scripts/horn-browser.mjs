import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/stoicheia-horn"),
  hosted = process.argv[3];
if (hosted) assert.match(hosted, /^https:\/\/.+\/$/);
await mkdir(out, { recursive: true });
const hash = (b) => createHash("sha256").update(b).digest("hex");
const manifest = JSON.parse(await readFile("public/sources/horn/manifest.json", "utf8"));
const passages = JSON.parse(
  execFileSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      "import {hornPassages} from './src/content/horn.ts';console.log(JSON.stringify(hornPassages))",
    ],
    { encoding: "utf8" },
  ),
);
const worker = await readFile("dist/sw.js", "utf8");
const edition = /const EDITION = "([a-f0-9]+)"/.exec(worker)?.[1];
const files = JSON.parse(/const FILES = (\[[^;]+\]);/.exec(worker)?.[1] ?? "null");
assert(edition && files.includes("/stoicheia/horn.html"));
const report = {
  checkedAt: new Date().toISOString(),
  base: hosted ?? null,
  edition,
  workerSha256: hash(worker),
  scope: hosted
    ? "Public site and actual native downloads. Browser networking disabled for offline checks; public origin not stopped."
    : "Local production build, actual native files and origin-disabled offline journey. No public-hosting claim.",
  configurations: [],
};
async function serve() {
  if (hosted) return { base: hosted, offline() {}, async close() {} };
  let online = true;
  const server = createServer(async (req, res) => {
    if (!online) {
      req.socket.destroy();
      return;
    }
    try {
      const raw = new URL(req.url, "http://local").pathname;
      assert(raw.startsWith("/stoicheia/"));
      const file = raw.slice("/stoicheia/".length) || "index.html";
      assert(!file.includes(".."));
      const bytes = await readFile(path.join("dist", file));
      res
        .writeHead(200, {
          "cache-control": "no-store",
          "content-type":
            {
              ".html": "text/html",
              ".js": "text/javascript",
              ".css": "text/css",
              ".jpg": "image/jpeg",
              ".json": "application/json",
              ".ttf": "font/ttf",
              ".svg": "image/svg+xml",
              ".txt": "text/plain",
            }[path.extname(file)] ?? "application/octet-stream",
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
    async close() {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    },
  };
}
async function save(page, selector, file) {
  const event = page.waitForEvent("download");
  await page.locator(selector).click();
  const download = await event;
  assert.equal(await download.failure(), null);
  await download.saveAs(file);
  return readFile(file);
}
async function ready(page) {
  await page
    .locator("#hn-offline")
    .filter({ hasText: "Edition ready offline" })
    .waitFor({ timeout: 60000 });
}
async function fits(page) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "document overflows",
  );
}
async function source(page, p) {
  await page.locator("#hn-page").selectOption(String(p));
  await page
    .locator("#hn-source-caption")
    .filter({ hasText: `Printed p.${p} ·` })
    .waitFor({ timeout: 20000 });
  const bytes = await page
    .locator("#hn-source-image")
    .evaluate(async (im) => window.hornBlobBytes[im.src]);
  assert.equal(hash(Buffer.from(bytes)), manifest.pages.find((x) => x.page === p).sha256);
}
async function drawing(page) {
  const rise = Number(await page.locator("#hn-rise").inputValue()),
    run = Number(await page.locator("#hn-run").inputValue());
  return page.locator("#hn-detail svg").evaluate(
    (svg, { rise, run }) => {
      const ctm = svg.getScreenCTM();
      if (Math.abs(ctm.a - ctm.d) > 1e-9) throw new Error("Unequal rendered axis scales");
      const text = svg.querySelector("desc").textContent;
      const cropWidth = /crop width is ([\de.+-]+)/.exec(text)[1];
      const d = svg.querySelector(".hn-boundary")?.getAttribute("d");
      const nums = d?.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g)?.map(Number) ?? [];
      return {
        rise,
        run,
        cropWidth,
        renderedScaleX: ctm.a,
        renderedScaleY: ctm.d,
        boundary: nums.reduce((a, n, i) => {
          if (i % 2 === 0) a.push([n, nums[i + 1]]);
          return a;
        }, []),
      };
    },
    { rise, run },
  );
}
async function artifact(browser, file, folder, width, engine) {
  const bytes = await readFile(file),
    html = bytes.toString();
  assert(!/<script\b|\son\w+=/i.test(html));
  const images = [...html.matchAll(/<img src="data:image\/jpeg;base64,([^"]+)"/g)];
  assert.equal(images.length, 6);
  images.forEach((m, i) => {
    assert.equal(hash(Buffer.from(m[1], "base64")), manifest.pages[i].sha256);
  });
  const font = /src:url\('(data:font\/ttf;base64,[^']+)'\)/.exec(html);
  assert(font);
  assert.equal(
    hash(Buffer.from(font[1].split(",")[1], "base64")),
    hash(await readFile("public/fonts/NotoSerif-Regular.ttf")),
  );
  assert(html.includes("MIT License"));
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width, height: 1000 },
    acceptDownloads: true,
  });
  const page = await context.newPage(),
    remote = [];
  await page.route(/^https?:/, (route) => {
    remote.push(route.request().url());
    return route.abort();
  });
  await page.goto(pathToFileURL(file).href);
  await page.waitForFunction(
    () =>
      document.fonts.status === "loaded" &&
      [...document.fonts].some((f) => f.family.includes("Noto Serif") && f.status === "loaded"),
  );
  await fits(page);
  assert(
    (await page.locator(".hn-license pre").textContent()).includes(
      await readFile("LICENSE", "utf8"),
    ),
  );
  assert(
    (await page.locator(".hn-license pre").textContent()).includes(
      await readFile("public/fonts/OFL.txt", "utf8"),
    ),
  );
  assert.equal(await page.locator(".hn-full-passage").count(), 8);
  assert(
    await page
      .locator(".hn-source-sheet img")
      .evaluateAll((imgs) => imgs.every((i) => i.complete && i.naturalWidth > 1000)),
  );
  for (let i = 0; i < passages.length; i++) {
    assert.equal(
      await page.locator(".hn-full-passage").nth(i).locator('[lang="grc"]').first().textContent(),
      passages[i].greek,
    );
    assert.equal(
      await page.locator(".hn-full-passage").nth(i).locator('[lang="la"]').first().textContent(),
      passages[i].latin,
    );
  }
  const embeddedJson = await save(
    page,
    'a[download="stoicheia-horn.json"]',
    path.join(folder, "embedded.json"),
  );
  assert.deepEqual(
    JSON.parse(embeddedJson.toString()),
    JSON.parse(await page.locator("#hn-saved-record").textContent()),
  );
  const embeddedCsv = await save(
    page,
    'a[download="stoicheia-horn.csv"]',
    path.join(folder, "embedded.csv"),
  );
  assert.equal(hash(embeddedCsv), hash(await readFile(path.join(folder, "tiny.csv"))));
  await page.screenshot({ path: path.join(folder, "saved-reading.png") });
  let pdf = null;
  if (engine === "chromium" && width === 1440) {
    pdf = path.join(folder, "reading.pdf");
    await page.pdf({ path: pdf, format: "A4", printBackground: true, preferCSSPageSize: true });
  }
  assert.deepEqual(remote, []);
  await context.close();
  return {
    file,
    sha256: hash(bytes),
    bytes: bytes.length,
    embeddedNativeData: true,
    sourceImages: 6,
    readings: 8,
    automaticRemoteRequests: remote,
    pdf,
  };
}
for (const [engine, type] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  if (process.env.HORN_REVIEW_ENGINE && process.env.HORN_REVIEW_ENGINE !== engine) continue;
  const browser = await type.launch();
  try {
    for (const width of [1440, 375]) {
      if (process.env.HORN_REVIEW_WIDTH && Number(process.env.HORN_REVIEW_WIDTH) !== width)
        continue;
      const server = await serve(),
        folder = path.join(out, `${engine}-${width}`);
      await mkdir(folder, { recursive: true });
      const context = await browser.newContext({
          viewport: { width, height: 1100 },
          acceptDownloads: true,
        }),
        page = await context.newPage(),
        errors = [];
      await page.addInitScript(() => {
        const original = URL.createObjectURL;
        window.hornBlobBytes = {};
        URL.createObjectURL = function (blob) {
          const url = original.call(this, blob);
          window.hornBlobBytes[url] = blob.arrayBuffer().then((b) => Array.from(new Uint8Array(b)));
          return url;
        };
      });
      page.on("pageerror", (e) => errors.push(String(e)));
      const config = { engine, version: browser.version(), width, csv: [], drawings: [], errors };
      const csv = async (name) => {
        const file = path.join(folder, `${name}.csv`);
        await save(page, "#hn-csv", file);
        config.csv.push(path.relative(out, file));
      };
      try {
        await page.goto(server.base);
        await page.locator("#lesson-title").waitFor();
        const companions = page.locator("#companion-workshops");
        if (!(await companions.evaluate((d) => d.open)))
          await companions.locator("summary").click();
        await page.getByRole("link", { name: /A line that will not fit/ }).click();
        await ready(page);
        await fits(page);
        assert.match(await page.locator("#hn-verdict").textContent(), /16\/17 < 1/);
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: path.join(folder, "opening.png") });
        await csv("normal");
        const before = page.url();
        await page.locator("#hn-rise").fill("2");
        await page.locator("#hn-run").fill("1");
        await page.locator("#hn-form button").click();
        assert.match(await page.locator("#hn-edit-status").textContent(), /unchanged/);
        assert.equal(page.url(), before);
        await page.locator("#hn-rise").fill("777");
        const draft = JSON.parse(
          (await save(page, "#hn-json", path.join(folder, "draft.json"))).toString(),
        );
        assert.equal(draft.state.rise, 1);
        assert.equal(draft.state.run, 4);
        await page.locator("#hn-rise").fill("1000000");
        await page.locator("#hn-run").fill("1000000");
        await page.locator("#hn-form button").click();
        assert.match(await page.locator("#hn-verdict").textContent(), /1\/2 < 1/);
        await csv("diagonal");
        await page
          .locator("#hn-bench")
          .screenshot({ path: path.join(folder, "diagonal-bench.png") });
        await page.locator('[data-hn-preset="tiny"]').focus();
        await page.keyboard.press("Enter");
        assert.match(await page.locator("#hn-certificate").textContent(), /1\/1000000000001/);
        config.drawings.push(await drawing(page));
        await csv("tiny");
        await page.locator('[data-hn-focus="crossing"]').focus();
        await page.keyboard.press("Space");
        assert.match(await page.locator("#hn-coordinate-proof").textContent(), /other root/);
        await page.locator("#hn-rise").fill("1");
        await page.locator("#hn-run").fill("10000");
        await page.locator("#hn-form button").click();
        config.drawings.push(await drawing(page));
        await csv("small");
        await page.locator('[data-hn-preset="tangent"]').click();
        assert.match(
          await page.locator("#hn-verdict").textContent(),
          /angle with the tangent is zero/,
        );
        await csv("tangent");
        await page.locator('[data-hn-preset="away"]').click();
        assert.match(await page.locator("#hn-verdict").textContent(), /other side of the tangent/);
        await csv("away");
        await page.locator('[data-hn-preset="tiny"]').click();
        for (let i = 0; i < 8; i++) {
          await page.locator("#hn-passage").selectOption(String(i));
          assert.equal(
            await page.locator('#hn-reading [lang="grc"]').first().textContent(),
            passages[i].greek,
          );
          assert.equal(
            await page.locator('#hn-reading [lang="la"]').first().textContent(),
            passages[i].latin,
          );
          assert.equal(await page.locator(".hn-words dt").count(), 2);
        }
        assert.match(await page.locator("#hn-reading").textContent(), /NOT A TRANSLATION/);
        for (const p of manifest.pages) await source(page, p.page);
        await page.locator("#hn-zoom").click();
        await page.locator("#hn-source-scroll").focus();
        await page.keyboard.press("ArrowRight");
        await page.waitForFunction(
          () => document.querySelector("#hn-source-scroll").scrollLeft > 0,
        );
        await page.locator("#hn-zoom").click();
        await page.locator("#hn-see-page").click();
        await page.locator("#hn-source-caption").filter({ hasText: "Printed p.212" }).waitFor();
        await source(page, 213);
        await page.goBack();
        await page.locator("#hn-source-caption").filter({ hasText: "Printed p.212" }).waitFor();
        await source(page, 213);
        const json = path.join(folder, "experiment.json");
        await save(page, "#hn-json", json);
        await page.locator('[data-hn-preset="away"]').click();
        await page.locator("#hn-open").setInputFiles(json);
        await page.locator("#hn-open-status").filter({ hasText: "Reopened" }).waitFor();
        assert.equal(await page.locator("#hn-run").inputValue(), "1000000");
        const bad = path.join(folder, "bad.json");
        await writeFile(
          bad,
          (await readFile(json, "utf8")).replace('"version": 1', '"version": 99'),
        );
        const beforeBad = page.url();
        await page.locator("#hn-open").setInputFiles(bad);
        await page.locator("#hn-open-status").filter({ hasText: "unchanged" }).waitFor();
        assert.equal(page.url(), beforeBad);
        await page.locator("#hn-share").click();
        await page.locator('[data-hn-focus="foot"]').click();
        assert.equal(
          new URL(await page.locator("#hn-share-url").inputValue()).searchParams.get("focus"),
          "foot",
        );
        await page.locator('[data-hn-focus="crossing"]').click();
        assert.equal(
          new URL(await page.locator("#hn-share-url").inputValue()).searchParams.get("focus"),
          "crossing",
        );
        const share = await page.locator("#hn-share-url").inputValue();
        await page.goto(share);
        await ready(page);
        assert.equal(await page.locator("#hn-passage").inputValue(), "7");
        await page.locator('input[name="hn-answer"][value="inside"]').check();
        await page.locator("#hn-question button").click();
        assert.match(await page.locator("#hn-feedback").textContent(), /^Correct/);
        const svg = await save(page, "#hn-svg", path.join(folder, "plates.svg"));
        const svgDocument = await page.evaluate((text) => {
          const doc = new DOMParser().parseFromString(text, "image/svg+xml");
          return {
            error: doc.querySelector("parsererror")?.textContent ?? null,
            metadata: doc.querySelector("metadata")?.textContent ?? null,
          };
        }, svg.toString());
        assert.equal(svgDocument.error, null, "The native SVG must be well-formed XML");
        const svgMetadata = svgDocument.metadata;
        assert(svgMetadata);
        assert(svgMetadata.includes(await readFile("LICENSE", "utf8")));
        assert(svgMetadata.includes(await readFile("public/fonts/OFL.txt", "utf8")));
        const svgContext = await browser.newContext({ javaScriptEnabled: false }),
          svgPage = await svgContext.newPage();
        await svgPage.goto(pathToFileURL(path.join(folder, "plates.svg")).href);
        // Firefox can leave FontFaceSet.ready pending in a standalone SVG
        // after the face has loaded. Observe the actual embedded face instead.
        await svgPage.waitForFunction(() =>
          [...document.fonts].some((f) => f.family.includes("Noto Serif") && f.status === "loaded"),
        );
        assert(await svgPage.evaluate(() => document.fonts.check('18px "Noto Serif"')));
        await svgPage.screenshot({ path: path.join(folder, "plates-opened.png") });
        await svgContext.close();
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        assert.deepEqual(
          axe.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
          [],
        );
        config.axeViolations = 0;
        await fits(page);
        await page.locator("#hn-bench").screenshot({ path: path.join(folder, "tiny-bench.png") });
        const inventory = await page.evaluate(async () => {
          const keys = await caches.keys(),
            key = keys.find((k) => k.startsWith("stoicheia-"));
          return {
            keys,
            key,
            paths: (await (await caches.open(key)).keys())
              .map((r) => new URL(r.url).pathname)
              .sort(),
          };
        });
        assert.equal(inventory.key, `stoicheia-${edition}`);
        assert.deepEqual(inventory.paths, [...files].sort());
        config.cachedFiles = inventory.paths.length;
        server.offline();
        if (hosted) await context.setOffline(true);
        else
          assert.equal(
            await fetch(server.base).then(
              () => true,
              () => false,
            ),
            false,
          );
        await page.reload();
        await ready(page);
        await source(page, 213);
        await page.locator('[data-hn-preset="normal"]').click();
        await page.locator("#hn-shallower").click();
        assert.equal(await page.locator("#hn-run").inputValue(), "40");
        await page.locator('[data-hn-preset="tiny"]').click();
        const reading = path.join(folder, "reading.html");
        await save(page, "#hn-save", reading);
        config.reading = await artifact(browser, reading, folder, width, engine);
        await page.getByRole("link", { name: "Euclid course", exact: true }).click();
        await page.locator("#lesson-title").waitFor();
        if (!(await page.locator("#companion-workshops").evaluate((d) => d.open)))
          await page.locator("#companion-workshops summary").click();
        await page.getByRole("link", { name: /A line that will not fit/ }).click();
        await ready(page);
        assert.deepEqual(errors, []);
        config.offline = hosted
          ? "Browser networking disabled; reload, source, new trial, illustrated export, course and return passed"
          : "Local origin connections destroyed; reload, source, new trial, illustrated export, course and return passed";
        report.configurations.push(config);
        console.log(
          `${engine} ${width}: geometry, readings, native files, accessibility and offline journey passed`,
        );
      } catch (error) {
        await page.screenshot({ path: path.join(folder, "failure.png") });
        console.error(
          JSON.stringify({
            engine,
            width,
            url: page.url(),
            sourceStatus: await page.locator("#hn-source-status").textContent(),
            errors,
          }),
        );
        throw error;
      } finally {
        await context.close();
        await server.close();
      }
    }
    const server = await serve(),
      context = await browser.newContext({ serviceWorkers: "block" });
    try {
      const page = await context.newPage();
      let release;
      const held = new Promise((r) => {
        release = r;
      });
      await page.route("**/sources/horn/heiberg-212.jpg", async (route) => {
        await held;
        await route.continue();
      });
      await page.goto(`${server.base}horn.html`);
      await page.locator("#hn-source-caption").filter({ hasText: "Printed p.210" }).waitFor();
      await page.locator("#hn-page").selectOption("212");
      await page.locator("#hn-page").selectOption("210");
      const response = page.waitForResponse((r) => r.url().endsWith("heiberg-212.jpg"));
      release();
      await (await response).finished();
      await page.waitForLoadState("networkidle");
      assert.match(await page.locator("#hn-source-caption").textContent(), /Printed p.210/);
      report[`${engine}LateSourceIgnored`] = true;
    } finally {
      await context.close();
      await server.close();
    }
    const corruptServer = await serve(),
      corruptContext = await browser.newContext({ serviceWorkers: "block" });
    try {
      const page = await corruptContext.newPage();
      await page.route("**/sources/horn/heiberg-210.jpg", (route) =>
        route.fulfill({ path: "dist/sources/horn/heiberg-212.jpg", contentType: "image/jpeg" }),
      );
      await page.goto(`${corruptServer.base}horn.html`);
      await page.locator("#hn-source-status").filter({ hasText: "does not match" }).waitFor();
      assert(await page.locator("#hn-source-image").isHidden());
      let downloads = 0;
      page.on("download", () => downloads++);
      await page.locator("#hn-save").click();
      await page.locator("#hn-save-status").filter({ hasText: "No file was saved" }).waitFor();
      assert.equal(downloads, 0);
      report[`${engine}SourceAndExportSubstitutionRejected`] = true;
    } finally {
      await corruptContext.close();
      await corruptServer.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(out, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Review: ${path.join(out, "review.json")}`);
