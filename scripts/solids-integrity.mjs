import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4365/stoicheia/",
  out = process.argv[3] ?? "/tmp/claude-1000/solids-integrity";
await mkdir(out, { recursive: true });
const results = [];
const until = async (test) => {
  const deadline = Date.now() + 15000;
  while (!(await test())) {
    assert(Date.now() < deadline, "Expected fault-injection checkpoint was not reached");
    await new Promise((r) => setTimeout(r, 30));
  }
};
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true }),
      page = await context.newPage();
    const late = [],
      errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await context.route("**/sources/solids/heiberg-336.jpg", (route) => late.push(route));
    let corrupt = true;
    await context.route("**/sources/solids/heiberg-337.jpg", async (route) => {
      if (corrupt)
        await route.fulfill({
          status: 200,
          contentType: "image/jpeg",
          body: await readFile("public/sources/solids/heiberg-338.jpg"),
        });
      else await route.continue();
    });
    await page.goto(`${base}solids.html`);
    await page.locator("#sl-title").waitFor();
    await until(() => late.length > 0);
    await page.selectOption("#sl-page", "337");
    await page.waitForFunction(() =>
      document
        .getElementById("sl-source-status")
        .textContent.includes("does not match this edition"),
    );
    assert(await page.locator("#sl-source-image").isHidden());
    let downloads = 0;
    page.on("download", () => downloads++);
    await page.locator('[data-sl-save="html"]').click();
    await page.waitForFunction(() =>
      document.getElementById("sl-save-status").textContent.includes("does not match this edition"),
    );
    assert.equal(downloads, 0);
    corrupt = false;
    await page.locator("#sl-source-retry").click();
    await page.waitForFunction(() =>
      document.getElementById("sl-source-status").textContent.startsWith("Verified complete page"),
    );
    await context.unroute("**/sources/solids/heiberg-336.jpg");
    for (const route of late) await route.continue();
    await page.waitForTimeout(150);
    assert.equal(await page.locator("#sl-page").inputValue(), "337");
    assert.match(await page.locator("#sl-source-image").getAttribute("alt"), /page 337/);
    assert.deepEqual(errors, []);
    await context.close();

    const second = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true }),
      work = await second.newPage(),
      held = [];
    let fontMode = "wrong";
    await second.route("**/fonts/NotoSerif-Regular.ttf", async (route) => {
      if (route.request().resourceType() !== "fetch") return route.continue();
      if (fontMode === "wrong")
        return route.fulfill({
          status: 200,
          contentType: "font/ttf",
          body: Buffer.from("A successful HTTP response is not the required font."),
        });
      if (fontMode === "held") {
        held.push(route);
        return;
      }
      await route.continue();
    });
    await work.goto(`${base}solids.html?example=bipyramid&vertex=2`);
    await work.locator("#sl-title").waitFor();
    await work.locator('[data-sl-save="html"]').click();
    await work.waitForFunction(() =>
      document
        .getElementById("sl-save-status")
        .textContent.includes("fonts/NotoSerif-Regular.ttf does not match"),
    );
    fontMode = "held";
    await work.locator('[data-sl-save="html"]').click();
    await until(() => held.length > 0);
    await work.locator("#sl-tip").click();
    fontMode = "correct";
    const event = work.waitForEvent("download");
    for (const route of held) await route.continue();
    const download = await event,
      filename = path.join(out, `${name}-captured.html`);
    assert.equal(await download.failure(), null);
    await download.saveAs(filename);
    const html = await readFile(filename, "utf8"),
      match = html.match(/href="(data:application\/json[^"]+)" download="stoicheia-solids.json"/);
    assert(match);
    const saved = JSON.parse(decodeURIComponent(match[1].slice(match[1].indexOf(",") + 1)));
    assert.equal(saved.settings.vertex, 2);
    assert.equal(saved.settings.example, "bipyramid");
    assert.match(await work.locator("#sl-vertex-result").textContent(), /vertex 1: 3 faces/);
    await work.evaluate(() => {
      const original = File.prototype.text;
      File.prototype.text = function () {
        return new Promise((resolve) => {
          window.__releaseSolidImport = async () => resolve(await original.call(this));
        });
      };
    });
    await work.locator("#sl-open").setInputFiles({
      name: "earlier.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(saved)),
    });
    await work.waitForFunction(() => typeof window.__releaseSolidImport === "function");
    await work.locator("#sl-q").focus();
    await work.keyboard.press("Home");
    await work.evaluate(() => window.__releaseSolidImport());
    await work.waitForFunction(() =>
      document.getElementById("sl-save-status").textContent.includes("Newer settings were kept"),
    );
    assert.equal(await work.locator("#sl-q").inputValue(), "2");
    assert.match(await work.locator("#sl-result").textContent(), /Two faces make a hinge/);
    await second.close();
    results.push({
      engine: name,
      lateSourceIgnored: true,
      substitutedHTTP200SourceRefused: true,
      invalidSourceExportDownloads: downloads,
      substitutedHTTP200FontRefused: true,
      recoveredCapturedReading: filename,
      exportPreservedEarlierVertex: 2,
      newerVisibleVertex: 0,
      delayedImportPreservedNewerQ: 2,
    });
    console.log(
      `${name}: late sources, wrong HTTP 200 bytes, captured export and newer-work preservation passed`,
    );
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(out, "review.json"), `${JSON.stringify({ base, results }, null, 2)}\n`);
