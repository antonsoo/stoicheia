import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { chromium, firefox } from "playwright";
import { openLesson } from "./navigation.mjs";

const url = process.argv[2] ?? "http://127.0.0.1:4327/stoicheia/";
const report = { scope: "Documented development quickstart", configurations: [] };

for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext();
    context.setDefaultTimeout(15000);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    const rendered = await page.evaluate(() => ({
      display: getComputedStyle(document.querySelector(".workbench")).display,
      ink: getComputedStyle(document.body).color,
      fontLoaded: document.fonts.check('20px "Noto Serif"'),
      mode: document.querySelector("#offline-state").textContent,
    }));
    assert.equal(rendered.display, "grid");
    assert.equal(rendered.ink, "rgb(25, 61, 96)");
    assert.equal(rendered.fontLoaded, true);
    assert.equal(rendered.mode, "Development preview");
    await openLesson(page, 2);
    await page.locator("#next").click();
    assert.equal(await page.locator("#step-position").textContent(), "Step 2 of 11");
    await openLesson(page, 20);
    await page.locator('#step-list [data-step="7"]').click();
    await page.locator("#pair").selectOption("2");
    assert.match(await page.locator("#equations").textContent(), /ΒΓ \+ ΓΑ/);
    await openLesson(page, 19);
    await page.locator('#step-list [data-step="2"]').click();
    assert.match(
      await page.locator("#diagram-notice").textContent(),
      /given angle inequality no longer holds/,
    );
    const measurement = [];
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(new URL("measure.html", url).href);
      await page.locator("#mr-source-status").filter({ hasText: "Verified p.2" }).waitFor();
      await page.locator("#mr-fit").click();
      assert.match(await page.locator("#mr-status").textContent(), /positive remainder/);
      await page.locator("#mr-turn").click();
      assert.match(await page.locator("#mr-turn-title").textContent(), /Turn 2/);
      const appearance = await page.evaluate(() => ({
        layout: getComputedStyle(document.querySelector(".mr-bench")).display,
        stroke: getComputedStyle(document.querySelector(".mr-remainder")).stroke,
        mode: document.querySelector("#mr-offline").textContent,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      }));
      assert.equal(appearance.layout, "grid");
      assert.equal(appearance.stroke, "rgb(40, 101, 84)");
      assert.match(appearance.mode, /Development preview/);
      assert.equal(appearance.overflow, false);
      const event = page.waitForEvent("download");
      await page.locator("#mr-save").click();
      const saved = await event,
        html = await readFile(await saved.path(), "utf8");
      assert.equal((html.match(/<img src="data:image\/jpeg;base64,/g) ?? []).length, 12);
      assert.equal(context.serviceWorkers().length, 0);
      measurement.push({ width, ...appearance, savedReadingBytes: Buffer.byteLength(html) });
    }
    const ratios = [];
    for (const width of [1440, 375]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(new URL("ratios.html", url).href);
      await page
        .locator("#rt-source-status")
        .filter({ hasText: "Source identity verified" })
        .waitFor();
      await page.locator('[data-rt-bound="100"]').click();
      await page.locator("#rt-find").click();
      assert.equal(await page.locator("#rt-m").inputValue(), "70");
      assert.equal(await page.locator("#rt-n").inputValue(), "99");
      assert.match(await page.locator("#rt-verdict").textContent(), /counterexample/);
      const appearance = await page.evaluate(() => ({
        display: getComputedStyle(document.querySelector(".rt-workspace")).display,
        mode: document.querySelector("#rt-offline").textContent,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      }));
      assert.match(appearance.mode, /Development preview/);
      assert.equal(appearance.overflow, false);
      const download = page.waitForEvent("download");
      await page.locator("#rt-save").click();
      const saved = await download;
      const html = await readFile(await saved.path(), "utf8");
      assert.equal((html.match(/<img src="data:image\/jpeg;base64,/g) ?? []).length, 5);
      ratios.push({ width, ...appearance, savedReadingBytes: Buffer.byteLength(html) });
    }
    assert.deepEqual(errors, []);
    report.configurations.push({
      browser: name,
      version: browser.version(),
      ...rendered,
      measurement,
      ratios,
      errors,
    });
  } finally {
    await browser.close();
  }
}

await writeFile(
  process.argv[3] ?? "docs/quickstart-verification.json",
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(JSON.stringify(report, null, 2));
