import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4368/stoicheia/";
const out = path.resolve(process.argv[3] ?? "/tmp/stoicheia-areas-review");
await mkdir(out, { recursive: true });
const decodeHtml = (s) =>
  s
    .replaceAll("&quot;", String.fromCharCode(34))
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
const hash = (b) => createHash("sha256").update(b).digest("hex");
const manifest = JSON.parse(await readFile("public/sources/areas/manifest.json", "utf8"));
const worker = await readFile("dist/sw.js", "utf8");
const edition = /const EDITION = "([a-f0-9]+)"/.exec(worker)[1];
const inventory = JSON.parse(/const FILES = (\[[^;]+\]);/.exec(worker)[1]);
const report = {
  checkedAt: new Date().toISOString(),
  scope:
    "Local production browser operation, actual native downloads and browser-offline use after the complete current worker takes control. No hosted-publication claim.",
  edition,
  inventory: inventory.length,
  records: [],
};

async function download(page, id, dest) {
  const pending = page.waitForEvent("download", { timeout: 60000 });
  await page.locator(`#${id}`).click();
  const d = await pending;
  assert.equal(await d.failure(), null);
  await d.saveAs(dest);
  return readFile(dest);
}
const contents = async (page, id, match) =>
  assert.match(await page.locator(`#${id}`).textContent(), match);
const sourceHash = async (page) =>
  page.locator("#ar-source-image").evaluate(async (img) => {
    const b = await window.__areaBlobs.get(img.src).arrayBuffer();
    return [...new Uint8Array(await crypto.subtle.digest("SHA-256", b))]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("");
  });
for (const [engine, launcher] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await launcher.launch();
  try {
    for (const width of [1440, 375]) {
      console.log(`${engine} ${width}`);
      const dir = path.join(out, `${engine}-${width}`);
      await mkdir(dir, { recursive: true });
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      });
      const page = await context.newPage(),
        errors = [],
        violations = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.addInitScript(() => {
        window.__areaCsp = [];
        window.__areaBlobs = new Map();
        const original = URL.createObjectURL;
        URL.createObjectURL = (blob) => {
          const url = original.call(URL, blob);
          window.__areaBlobs.set(url, blob);
          return url;
        };
        document.addEventListener("securitypolicyviolation", (e) =>
          window.__areaCsp.push(`${e.violatedDirective} ${e.blockedURI}`),
        );
      });
      await page.goto(base);
      await page.locator("#lesson-title").waitFor();
      await page.locator("#companion-workshops").evaluate((d) => {
        d.open = true;
      });
      await page.getByRole("link", { name: "Two fits. One limit.", exact: false }).click();
      await page.locator("#ar-title").waitFor();
      await page.waitForFunction(() =>
        document.querySelector("#ar-source-status")?.textContent.includes("verified"),
      );
      await contents(page, "ar-result", /fits exactly/);
      await contents(page, "ar-solutions", /Two fits/);
      await page.locator("#ar-reflect").focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.locator("#ar-trial").inputValue(), "9");
      await contents(page, "ar-result", /fits exactly/);
      await page.locator("#ar-slide").focus();
      await page.keyboard.press("ArrowLeft");
      await contents(page, "ar-result", /does not fit exactly/);
      await page.locator('[data-ar-case="limit"]').click();
      await contents(page, "ar-solutions", /One limiting fit/);
      await contents(page, "ar-result", /fits exactly/);
      await page.locator('[data-ar-case="impossible"]').click();
      await contents(page, "ar-solutions", /No fit: target 45 exceeds the maximum 36/);
      await page.locator("#ar-read-condition").click();
      await contents(page, "ar-reading-text", /μὴ μεῖζον/);
      await page.locator("#ar-greek").click();
      await page.waitForFunction(() => !document.querySelector("#ar-source-image").hidden);
      assert.equal(await sourceHash(page), manifest.pages.find((p) => p.page === 162).sha256);
      await page.locator("#ar-latin").click();
      await page.waitForFunction(() =>
        document.querySelector("#ar-source-caption")?.textContent.includes("p.163"),
      );
      assert.equal(await sourceHash(page), manifest.pages.find((p) => p.page === 163).sha256);
      await page.locator("#ar-zoom").click();
      await page.keyboard.press("ArrowRight");
      await page.waitForFunction(() => document.querySelector("#ar-source-pan").scrollLeft > 0);
      await page.locator('[data-ar-case="excess"]').click();
      await contents(page, "ar-result", /fits exactly/);
      await contents(page, "ar-solutions", /One positive fit/);
      await page.locator('[data-ar-case="irrational"]').click();
      await page.locator('[data-ar-fit="0"]').click();
      await contents(page, "ar-result", /does not fit exactly/);
      await contents(page, "ar-solutions", /Irrational fit/);
      const trial = await page.locator("#ar-trial").inputValue();
      await page.locator("#ar-trial").fill("1/0");
      await page.locator("#ar-trial-form button").click();
      await contents(page, "ar-trial-status", /denominator/);
      await page.locator("#ar-trial").fill(trial);
      await page.locator("#ar-trial-form button").click();
      await page.locator("#ar-shear").fill("40");
      await page.locator("#ar-givens button").click();
      await contents(page, "ar-result", /does not fit exactly/);
      await page.locator("#ar-share").click();
      const shared = await page.locator("#ar-share-url").inputValue();
      assert.equal(new URL(shared).searchParams.get("shear"), "40");
      const json = await download(page, "ar-json", path.join(dir, "experiment.json"));
      const record = JSON.parse(json);
      assert.equal(record.state.target, "28");
      assert.equal(record.state.trial, trial);
      const csv = await download(page, "ar-csv", path.join(dir, "areas.csv"));
      assert.match(csv.toString(), /irrational/);
      assert.ok(csv.toString().includes(trial));
      const svg = await download(page, "ar-svg", path.join(dir, "plate.svg"));
      assert.match(svg.toString(), /data:font\/ttf;base64,/);
      assert.ok(
        decodeHtml(svg.toString()).includes(
          (await readFile("public/fonts/OFL.txt", "utf8")).trim(),
        ),
      );
      await page.locator('[data-ar-case="two"]').click();
      await page.locator("#ar-import").setInputFiles(path.join(dir, "experiment.json"));
      await page.waitForFunction(() => document.querySelector("#ar-target").value === "28");
      assert.equal(await page.locator("#ar-trial").inputValue(), trial);
      const html = await download(page, "ar-save", path.join(dir, "reading.html"));
      const htmlText = html.toString();
      const images = [...htmlText.matchAll(/<img src="data:image\/jpeg;base64,([^"]+)"/g)].map(
        (m) => Buffer.from(m[1], "base64"),
      );
      assert.equal(images.length, 15);
      for (const [i, image] of images.entries())
        assert.equal(hash(image), manifest.pages[i].sha256);
      const font = /url\('data:font\/ttf;base64,([^']+)'\)/.exec(htmlText);
      assert.ok(font);
      assert.equal(
        hash(Buffer.from(font[1], "base64")),
        hash(await readFile("public/fonts/NotoSerif-Regular.ttf")),
      );
      assert.ok(decodeHtml(htmlText).includes((await readFile("LICENSE", "utf8")).trim()));
      assert.ok(
        decodeHtml(htmlText).includes((await readFile("public/fonts/OFL.txt", "utf8")).trim()),
      );
      assert.ok(!/<script|src="(?:https?:|\/)|url\("?\//.test(htmlText));
      const axe = await new AxeBuilder({ page }).analyze();
      violations.push(
        ...axe.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => n.target),
        })),
      );
      assert.deepEqual(violations, []);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (width === 375) {
        await page.locator("#ar-drawing").focus();
        await page.keyboard.press("ArrowRight");
        await page.waitForFunction(() => document.querySelector("#ar-drawing").scrollLeft > 0);
      }
      await page.locator('[data-ar-case="two"]').click();
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(dir, "workshop.png"), fullPage: true });
      await page.waitForFunction(
        () =>
          navigator.serviceWorker.controller &&
          document.querySelector("#ar-offline")?.textContent.includes("ready offline"),
        undefined,
        { timeout: 60000 },
      );
      const saved = await page.evaluate(async (name) => {
        const cache = await caches.open(name);
        return (await cache.keys()).map((r) => new URL(r.url).pathname);
      }, `stoicheia-${edition}`);
      assert.deepEqual(saved.sort(), [...inventory].sort());
      assert.deepEqual(await page.evaluate(() => window.__areaCsp), []);
      await context.setOffline(true);
      await page.reload();
      await page.locator("#ar-title").waitFor();
      await page.waitForFunction(() =>
        document.querySelector("#ar-offline")?.textContent.includes("ready offline"),
      );
      await page.locator('[data-ar-case="impossible"]').click();
      await contents(page, "ar-solutions", /No fit/);
      const offlineHtml = await download(page, "ar-save", path.join(dir, "offline-reading.html"));
      assert.match(offlineHtml.toString(), /target area 45/);
      for (const room of [
        "index",
        "triangle",
        "quadrature",
        "gnomon",
        "mesolabe",
        "desk",
        "measure",
        "circle",
        "horn",
        "quadratrix",
        "ratios",
        "solids",
        "primes",
        "areas",
      ]) {
        await page.goto(`${base}${room}.html`);
        await page.locator("main").waitFor();
      }
      const fileContext = await browser.newContext({
        viewport: { width, height: 1000 },
        offline: true,
        javaScriptEnabled: false,
      });
      const filePage = await fileContext.newPage(),
        requests = [];
      filePage.on("request", (r) => {
        if (!/^(file:|data:)/.test(r.url())) requests.push(r.url());
      });
      await filePage.goto(pathToFileURL(path.join(dir, "reading.html")).href);
      assert.equal(await filePage.locator(".ar-reading-full").count(), 9);
      assert.equal(await filePage.locator(".ar-whole-page img").count(), 15);
      assert.deepEqual(requests, []);
      await filePage.screenshot({ path: path.join(dir, "saved-reading.png"), fullPage: true });
      await fileContext.close();
      assert.deepEqual(errors, []);
      report.records.push({
        engine,
        width,
        nativeDownloads: ["JSON", "CSV", "SVG", "HTML", "offline HTML"],
        sourceImagesVerified: images.length,
        fontVerified: true,
        licensesVerified: true,
        offlineRooms: 14,
        cacheFiles: saved.length,
        standaloneReading: "local file with networking and scripts disabled",
        axeViolations: violations,
        errors,
      });
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(out, "browser.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(
  JSON.stringify(
    report.records.map(({ engine, width, offlineRooms }) => ({ engine, width, offlineRooms })),
  ),
);
