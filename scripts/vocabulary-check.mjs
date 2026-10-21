// biome-ignore-all lint/performance/useDomNodeTextContent: Check the meaning a learner actually sees.
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4327/stoicheia/";
const output = process.argv[3] ?? "/tmp/claude-1000/stoicheia-casebook/vocabulary-after.json";
const report = {
  scope: "Actual positive and negative I.7 vocabulary popups; no full philological certification",
  url: base,
  checkedAt: new Date().toISOString(),
  configurations: [],
};
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      const receipt = { browser: name, width, forms: [], errors: [] };
      page.on("pageerror", (e) => receipt.errors.push(String(e)));
      for (const [step, form, heading, meaning] of [
        [0, "δυνατόν", "δυνατός", "possible; able / can"],
        [0, "potest", "δυνατός", "possible; able / can"],
        [6, "ἀδύνατον", "ἀδύνατος", "impossible"],
        [6, "potest", "δυνατός", "possible; able / can"],
      ]) {
        await page.goto(`${base}#p=7&s=${step}`);
        const word = page
          .locator("#current-passage .word")
          .filter({ hasText: new RegExp(`^${form}$`) });
        await word.focus();
        await page.keyboard.press("Enter");
        assert.equal(await page.locator("#gloss-title").innerText(), heading);
        assert.equal(await page.locator(".gloss-meaning").innerText(), meaning);
        if (form === "potest")
          assert.match(
            await page.locator("#gloss-content").innerText(),
            /non supplies the negation/,
          );
        const a11y = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        assert.deepEqual(
          a11y.violations.map((v) => v.id),
          [],
        );
        receipt.forms.push({ step, form, heading, meaning, accessibilityViolations: 0 });
        await page.keyboard.press("Escape");
        assert.equal(await page.evaluate(() => document.activeElement.textContent), form);
      }
      await page.locator(".wordbook summary").click();
      assert.equal(await page.locator(".glossary-list > button").count(), 37);
      const a11y = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      assert.deepEqual(
        a11y.violations.map((v) => v.id),
        [],
      );
      const dimensions = await page.evaluate(() => ({
        viewport: innerWidth,
        width: document.documentElement.scrollWidth,
      }));
      assert.ok(dimensions.width <= dimensions.viewport + 1);
      assert.deepEqual(receipt.errors, []);
      report.configurations.push(receipt);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      configurations: report.configurations.length,
      wordPopups: report.configurations.flatMap((c) => c.forms).length,
      output,
    },
    null,
    2,
  ),
);
