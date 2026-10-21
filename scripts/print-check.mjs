import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, firefox } from "playwright";

const url = process.argv[2] ?? "http://127.0.0.1:4327/stoicheia/";
const artifacts = await mkdtemp(join(tmpdir(), "stoicheia-print-"));
const normalize = (text) => text.normalize("NFC").replace(/\s+/g, "");
const report = {
  scope:
    "Actual Chromium print PDFs, text extracted independently by Poppler pdftotext; Firefox print-layout lifecycle checked separately",
  pdfs: [],
  firefox: [],
};
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (let proposition = 1; proposition <= 6; proposition++) {
    await page.goto(`${url}#p=${proposition}&s=0`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator("#reading-mode").selectOption("greek");
    const paragraphs = await page.locator("#full-reading .translation p").allTextContents();
    const titles = await page.locator("#full-reading .full-step-title").allTextContents();
    for (const open of [false, true]) {
      await page.locator("#full-reading").evaluate((element, open) => {
        element.open = open;
      }, open);
      const address = page.url();
      const file = join(artifacts, `I${proposition}-${open ? "open" : "closed"}.pdf`);
      await page.pdf({ path: file, format: "A4", printBackground: false });
      const text = execFileSync("pdftotext", [file, "-"], { encoding: "utf8" });
      const extracted = normalize(text);
      for (const passage of [...paragraphs, ...titles])
        assert.ok(
          extracted.includes(normalize(passage)),
          `I.${proposition}: missing printed passage: ${passage}`,
        );
      assert.match(text, /nineteenth-century translation/);
      assert.equal(await page.locator("#full-reading").evaluate((e) => e.open), open);
      assert.equal(await page.locator("#reading-mode").inputValue(), "greek");
      assert.equal(page.url(), address);
      const bytes = await readFile(file);
      report.pdfs.push({
        proposition,
        passageInitiallyOpen: open,
        languageParagraphs: paragraphs.length,
        stepTitles: titles.length,
        pages: text.split("\f").length - 1,
        extractedCharacters: text.length,
        bytes: bytes.length,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        readingStateRestored: true,
      });
      if (proposition === 5 && !open) await writeFile("examples/stoicheia-I5-reading.pdf", bytes);
    }
  }
  report.chromiumVersion = browser.version();
} finally {
  await browser.close();
  await rm(artifacts, { recursive: true, force: true });
}
const fox = await firefox.launch();
try {
  const page = await fox.newPage();
  await page.goto(`${url}#p=5&s=8`);
  await page.emulateMedia({ media: "print" });
  for (const open of [false, true]) {
    await page.locator("#full-reading").evaluate((e, open) => {
      e.open = open;
    }, open);
    await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
    assert.equal(await page.locator("#full-reading").evaluate((e) => e.open), true);
    assert.equal(await page.locator("#full-reading .full-step").last().isVisible(), true);
    assert.equal(await page.locator(".reader-tools").isHidden(), true);
    await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
    assert.equal(await page.locator("#full-reading").evaluate((e) => e.open), open);
    report.firefox.push({
      passageInitiallyOpen: open,
      fullTextVisibleForPrint: true,
      stateRestored: true,
      boundary: "Emulated print media and dispatched lifecycle events, not a native Firefox PDF",
    });
  }
  report.firefoxVersion = fox.version();
} finally {
  await fox.close();
}
await writeFile("docs/print-verification.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
