import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/stoicheia-areas-review");
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 }, offline: true });
  await page.goto(pathToFileURL(path.join(out, "chromium-1440/reading.html")).href);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator(".ar-whole-page img").count(), 15);
  await page.pdf({
    path: path.join(out, "reading.pdf"),
    printBackground: true,
    preferCSSPageSize: true,
    tagged: true,
    outline: true,
  });
} finally {
  await browser.close();
}
console.log(`Printed ${path.join(out, "reading.pdf")}`);
