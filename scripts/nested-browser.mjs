// biome-ignore-all lint/performance/useDomNodeTextContent: Review actual learner-visible content.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";
import { openLesson } from "./navigation.mjs";

const base = process.argv[2] ?? "http://127.0.0.1:4405/stoicheia/";
const output = resolve(process.argv[3] ?? "/tmp/claude-1000/stoicheia-nested/browser");
await mkdir(output, { recursive: true });
const lesson = JSON.parse(
  execFileSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      "import {lessons} from './src/content/lessons.ts';console.log(JSON.stringify(lessons[21]));",
    ],
    { encoding: "utf8" },
  ),
);
const report = { checkedAt: new Date().toISOString(), base, configurations: [] };
const hash = (b) => createHash("sha256").update(b).digest("hex");
const near = (a, b, t = 0.015) => assert.ok(Math.abs(a - b) < t, `${a} != ${b}`);
const len = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const angle = (a, b, c) => {
  const u = { x: a.x - b.x, y: a.y - b.y },
    v = { x: c.x - b.x, y: c.y - b.y };
  return (Math.atan2(Math.abs(u.x * v.y - u.y * v.x), u.x * v.x + u.y * v.y) * 180) / Math.PI;
};
const norm = (s) => s.normalize("NFC").replace(/\s+/g, "");
async function audit(page) {
  assert.deepEqual(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
    [],
  );
}
async function rendered(page, e, d) {
  const p = await page.locator("#diagram [data-point]").evaluateAll((nodes) =>
    Object.fromEntries(
      nodes.map((n) => [
        n.dataset.point,
        {
          x: +n.querySelector("circle").getAttribute("cx"),
          y: +n.querySelector("circle").getAttribute("cy"),
        },
      ]),
    ),
  );
  const { Α: a, Β: b, Γ: c, Δ: q, Ε: r } = p;
  for (const k of ["x", "y"]) {
    near(r[k], a[k] + e * (c[k] - a[k]));
    near(q[k], b[k] + d * (r[k] - b[k]));
  }
  const outer = len(b, a) + len(a, c),
    middle = len(b, r) + len(r, c),
    inner = len(b, q) + len(q, c);
  assert.ok(outer > middle && middle > inner);
  assert.ok(angle(b, q, c) > angle(c, r, b) && angle(c, r, b) > angle(b, a, c));
  const matrix = await page.locator("#diagram svg").evaluate((el) => {
    const m = el.getScreenCTM();
    return [Math.hypot(m.a, m.b), Math.hypot(m.c, m.d)];
  });
  near(...matrix, 1e-9);
  const scale = Number(await page.locator("#size").inputValue()) / len(a, b);
  const cells = await page.locator("#comparison tbody td:not(:first-child)").allTextContents();
  near(Number(cells[4]), outer * scale);
  near(Number(cells[5]), inner * scale);
  near(parseFloat(cells[6]), angle(b, a, c));
  near(parseFloat(cells[7]), angle(b, q, c));
  return {
    outer: outer * scale,
    inner: inner * scale,
    outerAngle: angle(b, a, c),
    innerAngle: angle(b, q, c),
  };
}
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
        reducedMotion: "reduce",
      });
      await context.addInitScript(() => {
        window.nestedBlobs = new Map();
        const make = URL.createObjectURL,
          revoke = URL.revokeObjectURL;
        URL.createObjectURL = (blob) => {
          const url = make.call(URL, blob);
          window.nestedBlobs.set(url, blob);
          return url;
        };
        URL.revokeObjectURL = (url) => {
          window.nestedBlobs.delete(url);
          return revoke.call(URL, url);
        };
      });
      context.setDefaultTimeout(20000);
      try {
        const page = await context.newPage(),
          errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(base);
        await page.waitForFunction(
          () =>
            document.querySelector("#offline-state").textContent.includes("Edition ready offline"),
          null,
          { timeout: 60000 },
        );
        await openLesson(page, 21);
        assert.equal(await page.locator("#motion").inputValue(), "55");
        let steps = 0,
          cases = 0;
        for (let s = 0; s < 10; s++) {
          await page.locator(`#step-list [data-step="${s}"]`).click();
          for (const [lang, field] of [
            ["grc", "grc"],
            ["la", "lat"],
          ])
            assert.equal(
              norm(await page.locator(`#current-passage p[lang="${lang}"]`).innerText()),
              norm(lesson.steps[s][field]),
            );
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            true,
          );
          assert.equal(await page.locator('#diagram [data-point="Ε"]').count(), s ? 1 : 0);
          steps++;
        }
        await page.locator("#parameters summary").click();
        for (const side of [1, -1]) {
          if (side === -1) await page.locator("#flip").click();
          for (const r of [20, 65, 140])
            for (const a of [20, 90, 150])
              for (const e of [10, 55, 90])
                for (const d of [10, 55, 90]) {
                  await page.locator("#ratio").fill(String(r));
                  await page.locator("#angle").fill(String(a));
                  await page.locator("#take").fill(String(e));
                  await page.locator("#motion").fill(String(d));
                  await rendered(page, e / 100, d / 100);
                  cases++;
                }
        }
        await page.locator("#reset").click();
        assert.equal(await page.locator("#motion").inputValue(), "55");
        await page.locator("#motion").focus();
        await page.keyboard.press("Home");
        await page.keyboard.press("ArrowRight");
        assert.equal(await page.locator("#motion").inputValue(), "11");
        const counter = await rendered(page, 0.55, 0.11);
        const individual = await page
          .locator("#comparison tbody td:not(:first-child)")
          .allTextContents();
        assert.ok(Number(individual[3]) > Number(individual[2]), "One inner segment can be longer");
        assert.ok(counter.inner < counter.outer);
        await page.locator('#question-options input[value="0"]').check();
        assert.match(await page.locator("#question-feedback").innerText(), /sums/);
        await page.locator('#question-options input[value="1"]').check();
        assert.equal(
          await page.locator("#question-feedback").getAttribute("class"),
          "correct-feedback",
        );
        await page.locator("#open-practice").click();
        assert.match(await page.locator("#practice-title").innerText(), /contrast/);
        await page.locator('#practice-options input[value="0"]').check();
        assert.match(await page.locator("#practice-feedback").innerText(), /separate proofs/);
        await page.locator("#practice-next").click();
        await page.locator('#practice-options input[value="1"]').check();
        assert.match(await page.locator("#practice-feedback").innerText(), /interior placement/);
        await page.keyboard.press("Escape");
        await page.locator('#step-list [data-step="1"]').click();
        const word = page.locator('#current-passage [data-form="Διήχθω"]');
        await word.focus();
        await page.keyboard.press("Enter");
        assert.match(await page.locator("#gloss-content").innerText(), /singular perfect passive/);
        await page.keyboard.press("Escape");
        assert.equal(await word.evaluate((el) => el === document.activeElement), true);
        await page.locator('#step-list [data-step="9"]').click();
        await page.locator("#share").click();
        const shared = await page.locator("#share-url").inputValue();
        await page.keyboard.press("Escape");
        const copy = await context.newPage();
        await copy.goto(shared);
        assert.equal(await copy.locator("#motion").inputValue(), "11");
        await copy.close();
        const sourceHashes = [];
        for (const n of [50, 51, 52, 53]) {
          const s = n < 52 ? 0 : 9;
          await page.locator(`#step-list [data-step="${s}"]`).click();
          await page.locator(`#current-passage [data-source="${n}"]`).click();
          await page.waitForFunction(() => {
            const im = document.querySelector("#source-image");
            return !im.hidden && im.complete && im.naturalWidth > 0 && im.currentSrc === im.src;
          });
          assert.equal(await page.locator("#source-title").innerText(), `Printed page ${n}`);
          const bytes = Buffer.from(
            await page
              .locator("#source-image")
              .evaluate(async (image) => [
                ...new Uint8Array(await window.nestedBlobs.get(image.src).arrayBuffer()),
              ]),
          );
          const file = `sources/heiberg-${String(n).padStart(3, "0")}.jpg`;
          assert.equal(hash(bytes), hash(await readFile(`public/${file}`)));
          sourceHashes.push({ page: n, sha256: hash(bytes) });
          if (n === 53) assert.equal(await page.locator("#source-next").isDisabled(), false);
          await page.keyboard.press("Escape");
        }
        await audit(page);
        await page.locator("#parameters summary").click();
        await page.locator("#motion").fill("55");
        await page.locator("#workbench").scrollIntoViewIfNeeded();
        await page
          .locator("#workbench")
          .screenshot({ path: join(output, `${name}-${width}-proof.png`) });
        const downloads = [];
        for (const [selector, ext] of [
          ["#save-sheet", "html"],
          ["#save-diagram", "svg"],
        ]) {
          const pending = page.waitForEvent("download");
          await page.locator(selector).click();
          const download = await pending;
          const file = join(output, `${name}-${width}.${ext}`);
          await download.saveAs(file);
          const bytes = await readFile(file);
          assert.doesNotMatch(bytes.toString(), /NaN|Infinity|<script/);
          downloads.push({
            file: file.split("/").at(-1),
            bytes: bytes.length,
            sha256: hash(bytes),
          });
        }
        const saved = await context.newPage(),
          requests = [];
        saved.on("request", (r) => {
          if (/^https?:/.test(r.url())) requests.push(r.url());
        });
        await context.setOffline(true);
        await saved.goto(pathToFileURL(join(output, `${name}-${width}.svg`)).href);
        assert.equal(await saved.locator("parsererror").count(), 0);
        await saved.goto(pathToFileURL(join(output, `${name}-${width}.html`)).href);
        for (const step of lesson.steps)
          for (const field of ["grc", "lat", "en", "language"])
            assert.ok(norm(await saved.locator("body").innerText()).includes(norm(step[field])));
        await audit(saved);
        assert.equal(
          await saved.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          true,
        );
        if (name === "chromium" && width === 1440)
          await saved.pdf({
            path: join(output, "I21-study.pdf"),
            format: "A4",
            printBackground: true,
          });
        assert.deepEqual(requests, []);
        await saved.close();
        await page.reload();
        assert.equal(await page.locator("#motion").inputValue(), "55");
        await page.locator('#current-passage [data-source="53"]').click();
        await page.waitForFunction(() => {
          const im = document.querySelector("#source-image");
          return im.complete && im.naturalWidth > 0;
        });
        await page.keyboard.press("Escape");
        await openLesson(page, 20);
        assert.match(await page.locator("h1").innerText(), /sides/);
        await openLesson(page, 21);
        await page.locator("#motion").fill("70");
        assert.equal(await page.locator("#motion").inputValue(), "70");
        assert.deepEqual(errors, []);
        report.configurations.push({
          browser: name,
          version: browser.version(),
          width,
          steps,
          renderedCases: cases,
          sourceHashes,
          downloads,
          standaloneCompleteFields: 40,
          offlineReload: true,
          offlineSource: true,
          offlineControls: true,
          axeViolations: 0,
        });
        console.log(
          `${name} ${width}: ${steps} readings, ${cases} drawn cases, source/download/offline journeys passed`,
        );
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
await writeFile(join(output, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
