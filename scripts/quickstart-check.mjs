import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { chromium, firefox } from "playwright";

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
    await page.locator('.lesson-tab[data-lesson="2"]').click();
    await page.locator("#next").click();
    assert.equal(await page.locator("#step-position").textContent(), "Step 2 of 11");
    assert.deepEqual(errors, []);
    report.configurations.push({ browser: name, version: browser.version(), ...rendered, errors });
  } finally {
    await browser.close();
  }
}

await writeFile("docs/quickstart-verification.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
