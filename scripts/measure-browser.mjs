import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/stoicheia-measure");
await mkdir(out, { recursive: true });
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const manifest = JSON.parse(await readFile("public/sources/measure/manifest.json", "utf8"));
const report = {
  checkedAt: new Date().toISOString(),
  scope:
    "Local production build and native downloaded files; no hosted publication or physical printing claim",
  configurations: [],
};
async function files(root) {
  return (
    await Promise.all(
      (
        await readdir(root, { withFileTypes: true })
      ).map((e) => (e.isDirectory() ? files(path.join(root, e.name)) : [path.join(root, e.name)])),
    )
  ).flat();
}
report.build = await Promise.all(
  (await files("dist"))
    .sort()
    .map(async (file) => ({ file: file.slice(5), sha256: hash(await readFile(file)) })),
);
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".ttf": "font/ttf",
  ".txt": "text/plain",
};
async function serve() {
  let online = true;
  const server = createServer(async (req, res) => {
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
          "Content-Type": mime[path.extname(relative)] ?? "application/octet-stream",
          "Cache-Control": "no-store",
        })
        .end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    base: `http://127.0.0.1:${server.address().port}/stoicheia/`,
    offline() {
      online = false;
      server.closeAllConnections();
    },
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
async function noOverflow(page) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "Document overflows horizontally",
  );
}
async function download(page, button, dir, name) {
  const event = page.waitForEvent("download");
  await page.locator(button).click();
  const item = await event,
    file = path.join(dir, name ?? item.suggestedFilename());
  await item.saveAs(file);
  assert.equal(await item.failure(), null);
  return file;
}
async function capture(page) {
  return page.locator("#mr-drawing svg").evaluate((svg) => {
    const width = svg.viewBox.baseVal.width - 52;
    const remaining = svg.querySelector('[data-length="remaining"]');
    const b = svg.querySelector('[data-length="b"]');
    return {
      a: Number(svg.dataset.a),
      b: Number(svg.dataset.b),
      remaining: Number(svg.dataset.remaining),
      bWidth: Number(b.getAttribute("width")) / width,
      remainingWidth: Number(remaining.getAttribute("width")) / width,
    };
  });
}
for (const engine of [chromium, firefox])
  for (const width of [1440, 375]) {
    const server = await serve(),
      browser = await engine.launch({ headless: true });
    const dir = path.join(out, `${engine.name()}-${width}`);
    await mkdir(dir, { recursive: true });
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      acceptDownloads: true,
    });
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const result = { engine: engine.name(), width, drawings: [] };
    try {
      await page.goto(server.base);
      await page.locator('a[href="./measure.html"]').click();
      await page.locator("#mr-source-status").filter({ hasText: "Verified p.2" }).waitFor();
      await noOverflow(page);
      await page.screenshot({ path: path.join(dir, "start.png") });
      assert.equal(await page.locator("#mr-fit").isEnabled(), true);
      await page.locator("#mr-fit").focus();
      await page.keyboard.press("Enter");
      assert.equal(await page.evaluate(() => document.activeElement.id), "mr-turn");
      result.drawings.push(await capture(page));
      await page.keyboard.press("Enter");
      assert.equal(await page.evaluate(() => document.activeElement.id), "mr-fit");
      assert.match(await page.locator("#mr-turn-title").textContent(), /Turn 2/);

      await page.locator('[data-fraction="3,2"]').click();
      await page.locator("#mr-fit").click();
      await page.locator("#mr-turn").click();
      await page.locator("#mr-fit").click();
      await page.locator("#mr-fit").click();
      assert.match(await page.locator("#mr-conclusion").textContent(), /1\/2/);
      assert.match(
        await page.locator("#mr-conclusion").textContent(),
        /longer original 3 times and the side 2 times/,
      );
      assert.equal(await page.evaluate(() => document.activeElement.id), "mr-conclusion");
      result.drawings.push(await capture(page));

      await page.locator('[data-fraction="577,408"]').click();
      for (let turn = 0; turn < 8; turn++) {
        const q = turn === 0 ? 1 : 2;
        for (let i = 0; i < q; i++) await page.locator("#mr-fit").click();
        result.drawings.push(await capture(page));
        if (turn < 7) await page.locator("#mr-turn").click();
      }
      assert.match(await page.locator("#mr-conclusion").textContent(), /1\/408/);
      assert.match(
        await page.locator("#mr-conclusion").textContent(),
        /577 times and the side 408 times/,
      );
      await page.locator("#mr-compare-length").click();
      assert.match(await page.locator("#mr-status").textContent(), /positive remainder/);
      result.drawings.push(await capture(page));
      assert(result.drawings.at(-1).remaining > 0);
      assert.equal(result.drawings.at(-2).remaining, 0);
      const compared = await page.locator("#mr-comparison tbody tr").last().textContent();
      assert.match(compared, /> 0/);
      assert.match(compared, /= 0 · stops/);
      await page.locator("#mr-comparison").scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(dir, "comparison.png") });
      const csvFile = await download(page, "#mr-csv", dir);
      const svgFile = await download(page, "#mr-svg", dir);
      const studyFile = await download(page, "#mr-save", dir);
      const csv = await readFile(csvFile, "utf8"),
        svg = await readFile(svgFile, "utf8"),
        html = await readFile(studyFile, "utf8");
      assert.equal(csv.trim().split("\r\n").length, 9);
      assert(csv.includes('"diagonal"') && csv.includes('"8","2","true"'));
      assert.match(svg, /<metadata>.*Modern exact-length illustration/s);
      assert(!html.includes("<script"));
      const images = [...html.matchAll(/<img src="data:image\/jpeg;base64,([^"]+)"/g)];
      assert.equal(images.length, 12);
      for (const [i, image] of images.entries())
        assert.equal(hash(Buffer.from(image[1], "base64")), manifest.pages[i].sha256);
      result.downloads = {
        csvBytes: Buffer.byteLength(csv),
        svgBytes: Buffer.byteLength(svg),
        studyBytes: Buffer.byteLength(html),
        studySha256: hash(Buffer.from(html)),
        verifiedImages: images.length,
      };

      await page.locator("#mr-share").click();
      const share = await page.locator("#mr-share-url").inputValue();
      assert.match(share, /row=7&copies=2/);
      await page.locator("#mr-passage").selectOption("3");
      await page.locator('[data-page="7"]').click();
      await page.locator("#mr-source-status").filter({ hasText: "Verified p.7" }).waitFor();
      await page.locator("#mr-page").selectOption("6");
      await page.locator("#mr-source-status").filter({ hasText: "Verified p.6" }).waitFor();
      await page.goBack();
      await page.locator("#mr-source-status").filter({ hasText: "Verified p.7" }).waitFor();
      assert.equal(await page.locator("#mr-passage").inputValue(), "3");
      await page.locator("#mr-zoom").click();
      await page.locator("#mr-source-scroll").focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForFunction(() => document.querySelector("#mr-source-scroll").scrollLeft > 0);
      result.source = await page.locator("#mr-source-image").evaluate((img) => ({
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        verifiedBlob: img.src.startsWith("blob:"),
      }));
      assert(result.source.verifiedBlob && result.source.naturalHeight > 1000);
      await page.locator("#mr-zoom").click();
      await page.locator("#mr-proof summary").click();
      await page.locator("#mr-read-never").click();
      assert.equal(await page.locator("#mr-passage").inputValue(), "3");
      assert.match(await page.locator("#mr-reading-text").textContent(), /μηδέποτε/);
      await page.locator('input[name="mr-answer"][value="no"]').check();
      await page.locator('#mr-question button[type="submit"]').click();
      assert.match(await page.locator("#mr-feedback").textContent(), /^Yes/);
      const beforeInvalid = page.url();
      await page.locator("#mr-n").fill("1");
      await page.locator("#mr-d").fill("2");
      await page.locator("#mr-use-fraction").click();
      assert.equal(page.url(), beforeInvalid);
      assert.match(await page.locator("#mr-input-status").textContent(), /between 1 and 2/);
      await page.locator("#mr-n").fill("10000");
      await page.locator("#mr-d").fill("9999");
      await page.locator("#mr-use-fraction").click();
      await page.locator("#mr-reset").click();
      await page.locator("#mr-fit").click();
      await page.locator("#mr-turn").click();
      await page.locator("#mr-many").click();
      assert.match(
        await page.locator("#mr-conclusion").textContent(),
        /10000 times and the side 9999 times/,
      );
      await noOverflow(page);
      await page.goto(`${server.base}measure.html#row=23&copies=2`);
      await page.locator("#mr-status").filter({ hasText: "stops at 24 turns" }).waitFor();
      result.drawings.push(await capture(page));
      assert(result.drawings.at(-1).remaining > 0);
      const axe = await new AxeBuilder({ page }).analyze();
      assert.deepEqual(
        axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
        [],
      );
      result.axeViolations = axe.violations.length;
      await noOverflow(page);
      await page.goto(`${server.base}measure.html#row=24`);
      await page.locator("#mr-notice").filter({ hasText: "does not exist" }).waitFor();
      assert.match(await page.locator("#mr-turn-title").textContent(), /Turn 1/);
      await page.goto(share);
      await page
        .locator("#mr-offline")
        .filter({ hasText: "Edition ready offline" })
        .waitFor({ timeout: 90000 });
      result.offlineReady = await page.locator("#mr-offline").textContent();
      server.offline();
      await context.setOffline(true);
      await page.reload();
      await page.locator("#mr-source-status").filter({ hasText: "Verified p.2" }).waitFor();
      await page.locator("#mr-passage").selectOption("8");
      await page.locator('[data-page="9"]').click();
      await page.locator("#mr-source-status").filter({ hasText: "Verified p.9" }).waitFor();
      await download(page, "#mr-save", dir, "offline-reading.html");
      result.offlineDownload = true;
      await page.locator('a[href="./"]').first().click();
      await page.locator('a[href="./measure.html"]').click();
      await page.locator("#mr-fit").click();
      assert.match(await page.locator("#mr-status").textContent(), /positive remainder/);
      result.offlineCourseJourney = true;

      const fileContext = await browser.newContext({ viewport: { width, height: 1000 } });
      await fileContext.setOffline(true);
      const filePage = await fileContext.newPage(),
        requests = [];
      filePage.on("request", (r) => {
        if (/^https?:/.test(r.url())) requests.push(r.url());
      });
      await filePage.goto(pathToFileURL(studyFile).href);
      await filePage.evaluate(() => document.fonts.ready);
      await filePage.waitForFunction(() =>
        [...document.images].every((img) => img.complete && img.naturalWidth > 0),
      );
      assert.equal(await filePage.locator("script").count(), 0);
      assert.equal(await filePage.locator(".mr-source-sheet img").count(), 12);
      assert.deepEqual(requests, []);
      await noOverflow(filePage);
      const embedded = await download(
        filePage,
        'a[download="stoicheia-common-measure.csv"]',
        dir,
        "from-saved-reading.csv",
      );
      assert.equal(await readFile(embedded, "utf8"), csv);
      if (engine.name() === "chromium" && width === 1440) {
        await filePage.pdf({
          path: path.join(dir, "reading.pdf"),
          format: "A4",
          printBackground: true,
        });
        result.pdfBytes = (await readFile(path.join(dir, "reading.pdf"))).length;
      }
      await filePage.screenshot({ path: path.join(dir, "saved-file.png") });
      result.nativeStudyOpenedOffline = true;
      await fileContext.close();
      assert.deepEqual(errors, []);
      result.pageErrors = errors;
      report.configurations.push(result);
      console.log(
        `${engine.name()} ${width}: keyboard, exact-zero comparison, source/history, files, offline and accessibility passed`,
      );
    } finally {
      await browser.close();
      await server.close();
    }
  }
await writeFile(path.join(out, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Saved ${path.join(out, "review.json")}`);
