// biome-ignore-all lint/performance/useDomNodeTextContent: Measure typeset point labels and actual diagram boundaries.
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4412/stoicheia/",
  output = process.argv[3] ?? "/tmp/stoicheia-gnomon-layout.json";
const report = { checkedAt: new Date().toISOString(), base, cases: [], problems: [] };
const settings = [];
for (const u of [15, 35, 85])
  for (const v of [15, 65, 85])
    for (const h of [-40, 0, 40])
      settings.push({
        kind: "complements",
        hash: `u=${u}&v=${v}&h=${h}&d=0&s=0`,
        container: "#gn-complement-drawing",
      });
for (const [a, b] of [
  [90, 40],
  [160, 10],
  [10, 160],
  [160, 159],
  [159, 160],
  [10, 10],
  [160, 160],
])
  for (const g of [0, 1, 2, 3, 4, 5])
    settings.push({
      kind: "gnomon",
      hash: `a=${a}&b=${b}&g=${g}`,
      container: "#gn-gnomon-drawing",
    });
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [375, 900, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      for (const setting of settings) {
        await page.goto(`${base}gnomon.html#${setting.hash}`);
        await page.evaluate(() => document.fonts.ready);
        const result = await page.locator(setting.container).evaluate((root) => {
          const svg = root.querySelector("svg").getBoundingClientRect();
          const labels = [...root.querySelectorAll("text")].map((e) => ({
            text: e.textContent,
            box: e.getBoundingClientRect(),
          }));
          const overlaps = [],
            clipped = [];
          for (let i = 0; i < labels.length; i++) {
            const a = labels[i];
            if (
              a.box.left < svg.left - 1 ||
              a.box.right > svg.right + 1 ||
              a.box.top < svg.top - 1 ||
              a.box.bottom > svg.bottom + 1
            )
              clipped.push(a.text);
            for (let j = i + 1; j < labels.length; j++) {
              const b = labels[j];
              if (
                Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left) > 2 &&
                Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top) > 2
              )
                overlaps.push([a.text, b.text]);
            }
          }
          return { overlaps, clipped, scroll: document.documentElement.scrollWidth };
        });
        const row = { engine: name, width, ...setting, ...result };
        report.cases.push(row);
        if (result.overlaps.length || result.clipped.length || result.scroll > width + 1)
          report.problems.push(row);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ cases: report.cases.length, problems: report.problems }));
assert.equal(report.problems.length, 0);
