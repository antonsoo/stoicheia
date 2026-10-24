// biome-ignore-all lint/performance/useDomNodeTextContent: Verify the actual exported reading and visible failure.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4412/stoicheia/";
const out = path.resolve(process.argv[3] ?? "/tmp/stoicheia-quadrature-exports");
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
    let release;
    const held = new Promise((r) => {
      release = r;
    });
    let arrived;
    const seen = new Promise((r) => {
      arrived = r;
    });
    await context.route("**/sources/heiberg-128.jpg", async (route) => {
      arrived();
      await held;
      await route.continue();
    });
    const page = await context.newPage();
    await page.goto(`${base}quadrature.html`);
    const pending = page.waitForEvent("download");
    await page.locator("#qa-save-study").click();
    await seen;
    await page.locator("#qa-a").fill("11");
    await page.locator("#qa-a").press("Tab");
    assert.match(await page.locator("#qa-result").innerText(), /Same area: 44 u²/);
    release();
    const download = await pending;
    const file = path.join(out, `${name}-snapshot.html`);
    await download.saveAs(file);
    const html = await readFile(file, "utf8");
    assert.match(html, /Given rectangle: 9 by 4 drawing units/);
    assert.match(html, /rectangle_area%22%2C%2236%22/);
    await context.close();
    const retry = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true });
    let corrupt = true,
      downloads = 0;
    await retry.route("**/sources/heiberg-162.jpg", async (route) => {
      if (corrupt)
        await route.fulfill({
          status: 200,
          contentType: "image/jpeg",
          body: await readFile("public/sources/heiberg-161.jpg"),
        });
      else await route.continue();
    });
    const p = await retry.newPage();
    p.on("download", () => downloads++);
    await p.goto(`${base}quadrature.html`);
    await p.locator("#qa-save-study").click();
    await p.waitForFunction(() =>
      document.querySelector("#qa-save-status").textContent.includes("does not match this edition"),
    );
    assert.equal(downloads, 0);
    assert.equal(await p.locator("#qa-save-study").isEnabled(), true);
    corrupt = false;
    const repaired = p.waitForEvent("download");
    await p.locator("#qa-save-study").click();
    const good = await repaired;
    await good.saveAs(path.join(out, `${name}-recovered.html`));
    assert.equal(downloads, 1);
    await retry.close();
    report.configurations.push({
      engine: name,
      version: browser.version(),
      snapshotRectangle: [9, 4],
      changedRectangle: [11, 4],
      substitutedPage: 162,
      substituteBytesFromPage: 161,
      substitutedHttpStatus: 200,
      wrongEditionDownloaded: false,
      retryDownloaded: true,
    });
    console.log(`${name}: snapshot preserved; substituted scan rejected; retry downloaded`);
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(out, "exports.json"), `${JSON.stringify(report, null, 2)}\n`);
