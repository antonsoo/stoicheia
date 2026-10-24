// biome-ignore-all lint/performance/useDomNodeTextContent: Verify the actual exported reading and visible failure.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4412/stoicheia/";
const out = path.resolve(process.argv[3] ?? "/tmp/stoicheia-gnomon-exports");
await mkdir(out, { recursive: true });
const report = {
  checkedAt: new Date().toISOString(),
  base,
  workerSha256: createHash("sha256")
    .update(await readFile("dist/sw.js"))
    .digest("hex"),
  configurations: [],
};
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true });
    // Keep this source-download probe independent of service-worker installation.
    // The main browser/upgrade reviews exercise workers with the origin disabled.
    await context.addInitScript(() => {
      delete Navigator.prototype.serviceWorker;
    });
    let release;
    const held = new Promise((r) => {
      release = r;
    });
    let arrived;
    const seen = new Promise((r) => {
      arrived = r;
    });
    await context.route("**/sources/heiberg-133.jpg", async (route) => {
      arrived();
      await held;
      await route.continue();
    });
    const page = await context.newPage();
    await page.goto(`${base}gnomon.html`);
    assert.equal(await page.evaluate(() => "serviceWorker" in navigator), false);
    const pending = page.waitForEvent("download");
    await page.locator("#gn-save").click();
    await seen;
    await page.locator("#gn-a").fill("11");
    await page.locator("#gn-a").press("Tab");
    assert.match(await page.locator("#gn-gnomon-status").innerText(), /44 \+ 12.25 = 56.25/);
    release();
    const download = await pending;
    const file = path.join(out, `${name}-snapshot.html`);
    await download.saveAs(file);
    const html = await readFile(file, "utf8");
    assert.match(html, /ΑΔ = 9, ΔΒ = 4/);
    assert.match(html, /rectangle_and_gnomon_area%22%2C%2236%22/);
    await context.close();
    const retry = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true });
    await retry.addInitScript(() => {
      delete Navigator.prototype.serviceWorker;
    });
    let corrupt = true,
      downloads = 0,
      intercepted = 0;
    await retry.route("**/sources/heiberg-131.jpg", async (route) => {
      intercepted++;
      if (corrupt)
        await route.fulfill({
          status: 200,
          contentType: "image/jpeg",
          body: await readFile("public/sources/heiberg-130.jpg"),
        });
      else await route.continue();
    });
    const p = await retry.newPage();
    p.on("download", () => downloads++);
    await p.goto(`${base}gnomon.html`);
    assert.equal(await p.evaluate(() => "serviceWorker" in navigator), false);
    await p.locator("#gn-save").click();
    await p.waitForFunction(() => !document.querySelector("#gn-save").disabled);
    const failure = await p.locator("#gn-save-status").innerText();
    assert.match(
      failure,
      /does not match this edition/,
      JSON.stringify({ engine: name, intercepted, downloads, failure }),
    );
    assert.equal(intercepted, 1);
    assert.equal(downloads, 0);
    assert.equal(await p.locator("#gn-save").isEnabled(), true);
    corrupt = false;
    const repaired = p.waitForEvent("download");
    await p.locator("#gn-save").click();
    const good = await repaired;
    await good.saveAs(path.join(out, `${name}-recovered.html`));
    assert.equal(downloads, 1);
    await retry.close();
    report.configurations.push({
      engine: name,
      version: browser.version(),
      snapshotRectangle: [9, 4],
      changedRectangle: [11, 4],
      substitutedPage: 131,
      substituteBytesFromPage: 130,
      substitutedHttpStatus: 200,
      wrongEditionDownloaded: false,
      retryDownloaded: true,
      workerIsolation:
        "Service-worker capability removed before page startup; direct verified fetches",
    });
    console.log(`${name}: snapshot preserved; substituted scan rejected; retry downloaded`);
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(out, "exports.json"), `${JSON.stringify(report, null, 2)}\n`);
