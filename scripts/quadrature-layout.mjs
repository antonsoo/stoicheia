// biome-ignore-all lint/performance/useDomNodeTextContent: Measure actual typeset diagram labels.
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4412/stoicheia/";
const output = process.argv[3] ?? "/tmp/stoicheia-quadrature-layout.json";
const report = { checkedAt: new Date().toISOString(), base, cases: [], problems: [] };
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [375, 900, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      for (const [a, b] of [
        [90, 40],
        [160, 10],
        [10, 160],
        [160, 159],
        [159, 160],
        [10, 10],
        [160, 160],
      ]) {
        for (const stage of [0, 2, 3, 4, 5]) {
          await page.goto(`${base}quadrature.html#a=${a}&b=${b}&s=${stage}&m=50&c=0&k=0&r=8`);
          await page.evaluate(() => document.fonts.ready);
          const check = await page.evaluate(() => {
            const labels = [
              ...document.querySelectorAll(
                "#qa-construction .qa-point-label,#qa-construction .qa-area-label,#qa-construction .qa-dimension",
              ),
            ].map((e) => ({ text: e.textContent, b: e.getBoundingClientRect() }));
            const overlaps = [];
            for (let i = 0; i < labels.length; i++)
              for (let j = i + 1; j < labels.length; j++) {
                const a = labels[i],
                  b = labels[j];
                if (
                  Math.min(a.b.right, b.b.right) - Math.max(a.b.left, b.b.left) > 2 &&
                  Math.min(a.b.bottom, b.b.bottom) - Math.max(a.b.top, b.b.top) > 2
                )
                  overlaps.push([a.text, b.text]);
              }
            return { scroll: document.documentElement.scrollWidth, width: innerWidth, overlaps };
          });
          const row = { engine: name, width, a, b, stage, ...check };
          report.cases.push(row);
          if (check.scroll > width + 1 || check.overlaps.length) report.problems.push(row);
        }
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ cases: report.cases.length, problems: report.problems }));
assert.equal(report.problems.length, 0, "Overlapping point/measurement labels or page overflow");
