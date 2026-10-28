import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const hosted = process.argv[2]?.startsWith("https://") ? process.argv[2] : null;
const out = path.resolve(process.argv[hosted ? 3 : 2] ?? "/tmp/stoicheia-primes-review");
await mkdir(out, { recursive: true });
const hash = (b) => createHash("sha256").update(b).digest("hex");
const manifest = JSON.parse(await readFile("public/sources/primes/manifest.json", "utf8"));
const worker = await readFile("dist/sw.js", "utf8"),
  edition = /const EDITION = "([a-f0-9]+)"/.exec(worker)[1],
  inventory = JSON.parse(/const FILES = (\[[^;]+\]);/.exec(worker)[1]);
const report = {
  checkedAt: new Date().toISOString(),
  base: hosted,
  edition,
  scope: hosted
    ? "Public HTTPS operation and native downloads; browser networking disabled for offline checks. Local fault injection remains separate."
    : "Local production operation and native downloads; origin disabled and browser offline after current complete worker takeover. No publication claim.",
  records: [],
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
      const p = new URL(req.url, "http://local").pathname;
      assert(p.startsWith("/stoicheia/"));
      const file = p.slice(11) || "index.html";
      assert(!file.includes(".."));
      const b = await readFile(path.join("dist", file));
      res
        .writeHead(200, {
          "content-type":
            {
              ".html": "text/html",
              ".js": "text/javascript",
              ".css": "text/css",
              ".jpg": "image/jpeg",
              ".ttf": "font/ttf",
              ".svg": "image/svg+xml",
              ".json": "application/json",
              ".txt": "text/plain",
            }[path.extname(file)] ?? "application/octet-stream",
          "cache-control": "no-store",
        })
        .end(b);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    base: `http://127.0.0.1:${server.address().port}/stoicheia/`,
    online(v) {
      online = v;
    },
    async close() {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    },
  };
}
async function blobs(c) {
  await c.addInitScript(() => {
    const create = URL.createObjectURL.bind(URL);
    window.prBlobBytes = {};
    URL.createObjectURL = (blob) => {
      const u = create(blob);
      window.prBlobBytes[u] = blob.arrayBuffer();
      return u;
    };
  });
}
async function save(page, selector, file) {
  const pending = page.waitForEvent("download");
  await page.locator(selector).click();
  const d = await pending;
  assert.equal(await d.failure(), null);
  await d.saveAs(file);
  return readFile(file);
}
async function fits(page) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "Horizontal document overflow",
  );
}
async function source(page, printed) {
  await page.locator("#pr-page").selectOption(String(printed));
  await page
    .locator("#pr-source-caption")
    .filter({ hasText: printed ? `Printed p.${printed} ·` : "Title ·" })
    .waitFor();
  const b = await page
    .locator("#pr-source-image")
    .evaluate(async (img) => [...new Uint8Array(await window.prBlobBytes[img.src])]);
  const p = manifest.pages.find((p) => p.printed === (printed || "title"));
  assert.equal(hash(Buffer.from(b)), p.sha256);
}
async function retained(browser, folder, width, engine, record, csv, svg) {
  const file = path.join(folder, "reading.html"),
    html = await readFile(file, "utf8");
  assert(!/<script\b|\son\w+=/i.test(html));
  const images = [...html.matchAll(/<img src="data:image\/jpeg;base64,([^"]+)"/g)];
  assert.equal(images.length, 11);
  images.forEach((m, i) => {
    assert.equal(hash(Buffer.from(m[1], "base64")), manifest.pages[i].sha256);
  });
  const font = /src:url\('(data:font\/ttf;base64,[^']+)'\)/.exec(html);
  assert(font);
  assert.equal(
    hash(Buffer.from(font[1].split(",")[1], "base64")),
    hash(await readFile("public/fonts/NotoSerif-Regular.ttf")),
  );
  const c = await browser.newContext({
      javaScriptEnabled: false,
      acceptDownloads: true,
      viewport: { width, height: 1000 },
    }),
    p = await c.newPage(),
    requests = [];
  await p.route(/^https?:/, (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  await p.goto(pathToFileURL(file).href);
  await p.waitForFunction(() =>
    [...document.images].every((i) => i.complete && i.naturalWidth > 1000),
  );
  assert.equal(await p.locator("[lang=grc]").count(), 22);
  assert.equal(await p.locator(".pr-translation").count(), 11);
  await fits(p);
  for (const [name, expected] of [
    ["json", record],
    ["csv", csv],
    ["svg", svg],
  ]) {
    const pending = p.waitForEvent("download");
    await p.locator(`a[download="stoicheia-primes.${name}"]`).click();
    const d = await pending;
    await d.saveAs(path.join(folder, `native.${name}`));
    assert.deepEqual(await readFile(path.join(folder, `native.${name}`)), expected);
  }
  const sources = await save(
    p,
    'a[download="stoicheia-primes-sources.json"]',
    path.join(folder, "native-sources.json"),
  );
  assert.deepEqual(JSON.parse(sources), manifest);
  await p.screenshot({ path: path.join(folder, "retained.png"), fullPage: false });
  if (engine === "chromium" && width === 1440) {
    await p.pdf({
      path: path.join(out, "reading.pdf"),
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
      outline: true,
    });
  }
  assert.deepEqual(requests, []);
  await c.close();
}
for (const [engine, type] of [
  ["chromium", chromium],
  ["firefox", firefox],
])
  for (const width of [1440, 375]) {
    const server = await serve(),
      browser = await type.launch({ headless: true }),
      c = await browser.newContext({ viewport: { width, height: 1000 }, acceptDownloads: true }),
      page = await c.newPage();
    const folder = path.join(out, `${engine}-${width}`);
    await mkdir(folder, { recursive: true });
    await blobs(c);
    const errors = [],
      external = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (/^https?:/.test(r.url()) && !r.url().startsWith(server.base)) external.push(r.url());
    });
    try {
      await page.goto(server.base);
      await page.locator("#lesson-title").waitFor();
      if ((await page.locator("#companion-workshops").getAttribute("open")) === null)
        await page.locator("#companion-workshops summary").click();
      await page.getByRole("link", { name: /Euclid’s extra prime/ }).click();
      await page.locator("#pr-title").waitFor();
      assert.match(page.url(), /primes\.html/);
      assert.match(await page.locator("#pr-result").textContent(), /Unresolved at this bound/);
      await fits(page);
      const initialUrl = page.url();
      await page.locator("#pr-list").fill("1, 2, 3");
      await page.getByRole("button", { name: "Use these primes", exact: true }).click();
      assert.match(await page.locator("#pr-input-status").textContent(), /not a prime/);
      assert.match(await page.locator("#pr-construction").textContent(), /30031/);
      assert.equal(page.url(), initialUrl);
      await page.locator('[data-pr-case="six"]').click();
      await page.locator('[data-pr-select="5"]').focus();
      await page.keyboard.press("Enter");
      assert.match(await page.locator("#pr-equation").textContent(), /13 × 2310/);
      await page.screenshot({ path: path.join(folder, "opening.png") });
      await page.locator("#pr-extend").focus();
      await page.keyboard.press("Enter");
      assert.match(await page.locator("#pr-result").textContent(), /30031 = 59 × 509/);
      assert.match(await page.locator("#pr-branches").textContent(), /H = 59/);
      await page.locator('[data-pr-add="59"]').click();
      assert.equal(await page.locator("#pr-list").inputValue(), "2, 3, 5, 7, 11, 13, 59");
      assert.match(await page.locator("#pr-construction").textContent(), /1771771/);
      await page.locator('[data-pr-case="three"]').click();
      assert.match(await page.locator("#pr-result").textContent(), /sum itself is prime/);
      assert.match(await page.locator("#pr-result").textContent(), /31 = 31/);
      await page.locator('[data-pr-case="smaller"]').click();
      assert.match(await page.locator("#pr-result").textContent(), /106 = 2 × 53/);
      assert.match(await page.locator("#pr-branches").textContent(), /H = 2/);
      for (const n of [1155, 385, 77, 11]) await page.locator(`[data-pr-divisor="${n}"]`).click();
      assert.match(await page.locator("#pr-chain").textContent(), /reached a prime/);
      assert.equal(await page.locator(".pr-chain li").count(), 5);
      await page.locator("#pr-undo").click();
      await page.locator('[data-pr-divisor="11"]').click();
      for (let i = 0; i < 11; i++) {
        await page.locator("#pr-reading-select").selectOption(String(i));
        assert.equal(await page.locator(".pr-word").count(), 1);
        assert.equal(await page.locator("#pr-reading-text [lang=grc]").count(), 2);
      }
      for (const p of manifest.pages) await source(page, p.printed === "title" ? 0 : p.printed);
      await page.locator("#pr-zoom").click();
      await page.locator("#pr-source-pan").focus();
      await page.keyboard.press("ArrowRight");
      assert((await page.locator("#pr-source-pan").evaluate((e) => e.scrollLeft)) > 0);
      await page.locator("#pr-zoom").click();
      await page.locator('input[value="divisor"]').check();
      await page.getByRole("button", { name: "Check the reasoning", exact: true }).click();
      assert.match(await page.locator("#pr-feedback").textContent(), /^Yes/);
      const huge =
        "9999999967, 9999999943, 9999999929, 9999999881, 9999999851, 9999999833, 9999999817, 9999999787, 9999999781, 9999999769, 9999999727, 9999999707";
      const start = performance.now();
      await page.locator("#pr-list").fill(huge);
      await page.getByRole("button", { name: "Use these primes", exact: true }).click();
      await page.locator("#pr-limit").selectOption("100000");
      const largeOperationMs = Math.round(performance.now() - start);
      assert.match(await page.locator("#pr-units").textContent(), /too large for individual/);
      assert.equal(
        (await page.locator(".pr-construction .pr-exact").first().textContent()).length,
        120,
      );
      await fits(page);
      await page.locator('[data-pr-case="six"]').click();
      await page.locator("#pr-extend").click();
      await page.locator('[data-pr-select="5"]').click();
      await page.locator("#pr-reading-select").selectOption("5");
      await source(page, 390);
      await page.locator("#pr-share").click();
      const link = await page.locator("#pr-share-url").inputValue();
      assert.equal(page.url(), initialUrl);
      const shared = await c.newPage();
      await shared.goto(link);
      await shared.locator("#pr-title").waitFor();
      assert.match(await shared.locator("#pr-result").textContent(), /30031 = 59 × 509/);
      assert.equal(await shared.locator("#pr-reading-select").inputValue(), "5");
      await shared.close();
      await page.locator("#pr-import").setInputFiles({
        name: "bad.json",
        mimeType: "application/json",
        buffer: Buffer.from('{"format":"stoicheia-primes","version":1,"settings":{}}'),
      });
      await page.locator("#pr-save-status").filter({ hasText: "six documented" }).waitFor();
      const record = await save(page, "#pr-json", path.join(folder, "study.json")),
        csv = await save(page, "#pr-csv", path.join(folder, "study.csv")),
        svg = await save(page, "#pr-svg", path.join(folder, "study.svg"));
      await page.locator('[data-pr-case="three"]').click();
      await page
        .locator("#pr-import")
        .setInputFiles({ name: "study.json", mimeType: "application/json", buffer: record });
      await page.locator("#pr-save-status").filter({ hasText: "Reopened the exact" }).waitFor();
      assert.match(await page.locator("#pr-result").textContent(), /30031 = 59 × 509/);
      await save(page, "#pr-save", path.join(folder, "reading.html"));
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      assert.deepEqual(axe.violations, []);
      await fits(page);
      await page.locator("#pr-search").scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(folder, "composite.png") });
      await page.locator("#pr-reading").scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(folder, "reading.png") });
      await page
        .locator("#pr-offline")
        .filter({ hasText: "Edition ready offline" })
        .waitFor({ timeout: 90000 });
      const cache = await page.evaluate(async () => {
        const names = (await caches.keys()).filter((k) => k.startsWith("stoicheia-"));
        return Promise.all(
          names.map(async (name) => ({
            name,
            files: (await (await caches.open(name)).keys()).map((r) => new URL(r.url).pathname),
          })),
        );
      });
      assert.equal(cache.length, 1);
      assert.equal(cache[0].name, `stoicheia-${edition}`);
      assert.deepEqual(cache[0].files.sort(), [...inventory].sort());
      await c.setOffline(true);
      server.online(false);
      await page.goto(link, { waitUntil: "domcontentloaded" });
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator("#pr-title").waitFor();
      for (const p of manifest.pages) await source(page, p.printed === "title" ? 0 : p.printed);
      await source(page, 390);
      await save(page, "#pr-save", path.join(folder, "offline-reading.html"));
      const offlineRecord = await save(page, "#pr-json", path.join(folder, "offline.json"));
      assert.deepEqual(JSON.parse(offlineRecord), JSON.parse(record));
      const rooms = [
        "",
        "triangle.html",
        "quadrature.html",
        "gnomon.html",
        "mesolabe.html",
        "desk.html",
        "measure.html",
        "circle.html",
        "horn.html",
        "quadratrix.html",
        "ratios.html",
        "solids.html",
        "primes.html",
      ];
      const mounts = rooms.map((room) => (room ? "h1" : "#lesson-title"));
      for (let i = 0; i < rooms.length; i++) {
        await page.goto(server.base + rooms[i], { waitUntil: "domcontentloaded" });
        await page.locator(mounts[i]).waitFor({ timeout: 15000 });
      }
      assert.deepEqual(errors, []);
      assert.deepEqual(external, []);
      server.online(true);
      await retained(browser, folder, width, engine, record, csv, svg);
      const row = {
        engine,
        width,
        settings: JSON.parse(record).settings,
        sourceImagesVerified: 11,
        readings: 11,
        offlineRooms: rooms.length,
        inventoryFiles: inventory.length,
        axeViolations: 0,
        pageErrors: errors,
        externalRequests: external,
        largeOperationIncludingBrowserRoundTripsMs: largeOperationMs,
      };
      report.records.push(row);
      console.log(JSON.stringify(row));
    } finally {
      await c.close();
      await browser.close();
      await server.close();
    }
  }
if (!hosted)
  for (const [engine, type] of [
    ["chromium", chromium],
    ["firefox", firefox],
  ]) {
    const server = await serve(),
      browser = await type.launch({ headless: true }),
      c = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true }),
      p = await c.newPage();
    await blobs(c);
    try {
      let corrupt = true;
      const pattern = "**/sources/primes/heiberg-388.jpg";
      await c.route(pattern, async (route) =>
        corrupt
          ? route.fulfill({
              status: 200,
              contentType: "image/jpeg",
              body: await readFile("public/sources/primes/heiberg-390.jpg"),
            })
          : route.continue(),
      );
      await p.goto(`${server.base}primes.html`);
      await p.locator("#pr-source-status").filter({ hasText: "does not match" }).waitFor();
      assert(await p.locator("#pr-source-image").isHidden());
      let downloaded = false;
      p.on("download", () => {
        downloaded = true;
      });
      await p.locator("#pr-save").click();
      await p.locator("#pr-save-status").filter({ hasText: "does not match" }).waitFor();
      assert.equal(downloaded, false);
      corrupt = false;
      await p.locator("#pr-retry").click();
      await source(p, 388);
      await c.unroute(pattern);
      // A refused parallel export may already have fetched the other pages.
      // Start a new document before testing a genuinely outstanding source.
      await p.reload();
      await source(p, 388);
      let release;
      const held = new Promise((r) => {
        release = r;
      });
      let arrived;
      const arrival = new Promise((r) => {
        arrived = r;
      });
      await c.route("**/sources/primes/heiberg-391.jpg", async (route) => {
        arrived();
        await held;
        await route.continue();
      });
      await p.locator("#pr-page").selectOption("391");
      await arrival;
      await p.locator("#pr-page").selectOption("0");
      await source(p, 0);
      release();
      await p.waitForFunction(() => Object.keys(window.prBlobBytes).length >= 3);
      await p.locator("#pr-source-caption").filter({ hasText: "Title ·" }).waitFor();
      await source(p, 0);
      await c.unroute("**/sources/primes/heiberg-391.jpg");
      // Hold a source not yet read: export must retain the state at the original click.
      let releaseExport;
      const waitExport = new Promise((r) => {
        releaseExport = r;
      });
      let exportArrived;
      const arrivalExport = new Promise((r) => {
        exportArrived = r;
      });
      await c.route("**/sources/primes/heiberg-253.jpg", async (route) => {
        exportArrived();
        await waitExport;
        await route.continue();
      });
      const download = p.waitForEvent("download");
      await p.locator("#pr-save").click();
      await arrivalExport;
      await p.locator('[data-pr-case="smaller"]').click();
      await p.locator("#pr-page").selectOption("390");
      releaseExport();
      const d = await download;
      await d.saveAs(path.join(out, `snapshot-${engine}.html`));
      const text = await readFile(path.join(out, `snapshot-${engine}.html`), "utf8");
      const m = /download="stoicheia-primes.json"/.exec(text);
      assert(m);
      const native = /href="(data:application\/json[^"]+)" download="stoicheia-primes.json"/.exec(
        text,
      );
      assert(native);
      const record = JSON.parse(
        decodeURIComponent(native[1].split(",")[1])
          .replaceAll("&quot;", '"')
          .replaceAll("&amp;", "&"),
      );
      assert.deepEqual(record.settings.primes, ["2", "3", "5", "7", "11", "13"]);
      assert.equal(record.settings.page, 0);
      assert.equal(await p.locator("#pr-list").inputValue(), "3, 5, 7");
      report.guards.push({
        engine,
        wrongHttp200JpegRefused: true,
        retry: true,
        lateSourceCannotReplaceTitle: true,
        exportRetainsClickSettings: true,
      });
    } finally {
      await c.close();
      await browser.close();
      await server.close();
    }
  }
await writeFile(path.join(out, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
