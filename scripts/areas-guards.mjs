import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4368/stoicheia/";
const out = path.resolve(process.argv[3] ?? "/tmp/stoicheia-areas-guards");
await mkdir(out, { recursive: true });
const records = [];
for (const [engine, launcher] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await launcher.launch();
  try {
    const context = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true });
    const page = await context.newPage();
    let corrupt = true;
    await page.route("**/sources/areas/heiberg-162.jpg", async (route) => {
      if (corrupt)
        return route.fulfill({
          status: 200,
          contentType: "image/jpeg",
          body: await readFile("public/sources/areas/heiberg-164.jpg"),
        });
      return route.continue();
    });
    await page.goto(`${base}areas.html`);
    await page.waitForFunction(() =>
      document.querySelector("#ar-source-status")?.textContent.includes("does not match"),
    );
    assert.equal(await page.locator("#ar-source-image").isHidden(), true);
    let downloads = 0;
    page.on("download", () => downloads++);
    await page.locator("#ar-save").click();
    await page.waitForFunction(() =>
      document.querySelector("#ar-save-status")?.textContent.includes("does not match"),
    );
    assert.equal(downloads, 0);
    corrupt = false;
    await page.locator("#ar-retry").click();
    await page.waitForFunction(() =>
      document.querySelector("#ar-source-status")?.textContent.includes("verified"),
    );
    const recovered = page.waitForEvent("download");
    await page.locator("#ar-save").click();
    await (await recovered).saveAs(path.join(out, `${engine}-recovered.html`));
    await context.close();

    const second = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true });
    await second.addInitScript(() => {
      const original = File.prototype.text;
      File.prototype.text = async function () {
        if (this.name === "slow.json")
          await new Promise((resolve) => {
            window.__releaseAreaImport = resolve;
          });
        return original.call(this);
      };
    });
    const p = await second.newPage();
    let releaseSource, sourceHeld;
    const held = new Promise((resolve) => {
      sourceHeld = resolve;
    });
    await p.route("**/sources/areas/heiberg-162.jpg", async (route) => {
      const response = await route.fetch();
      sourceHeld();
      await new Promise((resolve) => {
        releaseSource = resolve;
      });
      await route.fulfill({ response });
    });
    await p.goto(`${base}areas.html`);
    await held;
    await p.locator("#ar-page").selectOption("163");
    await p.waitForFunction(() =>
      document.querySelector("#ar-source-caption")?.textContent.includes("p.163"),
    );
    releaseSource();
    await p.waitForFunction(() =>
      document.querySelector("#ar-source-status")?.textContent.includes("verified"),
    );
    assert.match(await p.locator("#ar-source-caption").textContent(), /p\.163/);
    await p.unroute("**/sources/areas/heiberg-162.jpg");
    const json = Buffer.from(
      JSON.stringify({
        format: "stoicheia-areas",
        version: 1,
        state: {
          mode: "short",
          base: 12,
          target: "27",
          shape: "equal",
          shear: 0,
          trial: "9",
          reading: 0,
          page: 162,
        },
      }),
    );
    await p
      .locator("#ar-import")
      .setInputFiles({ name: "slow.json", mimeType: "application/json", buffer: json });
    await p.waitForFunction(() => typeof window.__releaseAreaImport === "function");
    await p.locator('[data-ar-case="impossible"]').click();
    await p.evaluate(() => window.__releaseAreaImport());
    await p.waitForFunction(() => document.querySelector("#ar-import").value === "");
    assert.equal(await p.locator("#ar-target").inputValue(), "45");
    assert.match(await p.locator("#ar-solutions").textContent(), /No fit/);
    await p.locator('[data-ar-case="two"]').click();
    let releaseExport, exportHeld;
    const exportPending = new Promise((resolve) => {
      exportHeld = resolve;
    });
    await p.route("**/sources/areas/heiberg-159.jpg", async (route) => {
      const response = await route.fetch();
      exportHeld();
      await new Promise((resolve) => {
        releaseExport = resolve;
      });
      await route.fulfill({ response });
    });
    const exported = p.waitForEvent("download");
    await p.locator("#ar-save").click();
    await exportPending;
    await p.locator('[data-ar-case="excess"]').click();
    releaseExport();
    const dest = path.join(out, `${engine}-snapshot.html`);
    await (await exported).saveAs(dest);
    assert.match(
      await readFile(dest, "utf8"),
      /falling short, given line 12, target area 27, trial 3/,
    );
    assert.equal(await p.locator("#ar-target").inputValue(), "45");
    await second.close();
    const third = await browser.newContext({ serviceWorkers: "block" });
    const q = await third.newPage();
    await q.route("**/fonts/NotoSerif-Regular.ttf", (route) =>
      route.fulfill({ status: 200, body: "substituted font", contentType: "font/ttf" }),
    );
    await q.goto(`${base}areas.html`);
    await q.locator("#ar-title").waitFor();
    await q.locator("#ar-svg").click();
    await q.waitForFunction(() =>
      document.querySelector("#ar-save-status")?.textContent.includes("does not match"),
    );
    await third.close();
    records.push({
      engine,
      wrongScanHidden: true,
      exportRejectsWrongScan: true,
      sourceRetryRecovers: true,
      lateSourceCannotReplaceNewPage: true,
      lateImportCannotReplaceWork: true,
      exportRetainsClickSnapshot: true,
      svgRejectsWrongFont: true,
    });
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(out, "guards.json"), `${JSON.stringify(records, null, 2)}\n`);
console.log(JSON.stringify(records, null, 2));
