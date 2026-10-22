// biome-ignore-all lint/performance/useDomNodeTextContent: Inspect learner-visible relations and rendered coordinates.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";
import { openLesson } from "./navigation.mjs";

const base = process.argv[2] ?? "http://127.0.0.1:4385/stoicheia/";
const out = resolve(process.argv[3] ?? "/tmp/claude-1000/stoicheia-inequalities/browser");
await mkdir(out, { recursive: true });
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const report = {
  base,
  checkedAt: new Date().toISOString(),
  scope:
    "Native controls, rendered SVG coordinates, source bytes, standalone downloads and shared comparison state; numerical checks are not formal proofs",
  configurations: [],
};
const length = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
const cross = (a, b) => a.x * b.y - a.y * b.x;
const angle = (a, b, c) => {
  const u = sub(a, b),
    v = sub(c, b);
  return (Math.atan2(Math.abs(cross(u, v)), u.x * v.x + u.y * v.y) * 180) / Math.PI;
};
const near = (a, b, t = 0.012) => assert.ok(Math.abs(a - b) < t, `${a} differs from ${b}`);
const inside = (a, b, c) => {
  const sign = cross(a, c);
  assert.ok(cross(a, b) * sign > 0 && cross(b, c) * sign > 0);
};
async function points(page) {
  return page.locator("#diagram [data-point]").evaluateAll((nodes) =>
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
}
async function parameters(page, open = true) {
  if ((await page.locator("#parameters").evaluate((e) => e.open)) !== open)
    await page.locator("#parameters summary").click();
}
async function reset(page, p, s) {
  await openLesson(page, p);
  await parameters(page);
  await page.locator("#reset").click();
  await page.locator(`#step-list [data-step="${s}"]`).click();
}
async function audit(page, label, result) {
  const violations = (
    await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()
  ).violations;
  assert.deepEqual(violations, [], label);
  result.accessibility.push(label);
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
      context.setDefaultTimeout(15000);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const result = {
        browser: name,
        width,
        readingSteps: 0,
        renderedCases: 0,
        comparisons: 0,
        accessibility: [],
        downloads: [],
        sources: [],
      };
      await page.goto(base);
      await page.evaluate(() => document.fonts.ready);
      for (const [p, count] of [
        [17, 7],
        [18, 7],
        [19, 6],
        [20, 9],
      ]) {
        await openLesson(page, p);
        for (let s = 0; s < count; s++) {
          assert.equal(
            await page.locator("#step-position").innerText(),
            `Step ${s + 1} of ${count}`,
          );
          assert.ok(await page.locator("#current-passage p[lang=grc]").innerText());
          assert.ok(await page.locator("#current-passage p[lang=la]").innerText());
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            true,
          );
          const transform = await page.locator("#diagram svg").evaluate((e) => {
            const m = e.getScreenCTM();
            return [Math.hypot(m.a, m.b), Math.hypot(m.c, m.d)];
          });
          near(...transform, 1e-8);
          assert.doesNotMatch(await page.locator("#diagram").innerHTML(), /NaN|Infinity/);
          result.readingSteps++;
          if (s < count - 1) await page.locator("#next").click();
        }
        await audit(page, `I.${p} conclusion`, result);
      }
      for (const [p, s, form, meaning] of [
        [17, 0, "ἐλάττονές", "lesser"],
        [17, 6, "πάντῃ", "every choice"],
        [18, 5, "multo", "all the more"],
        [19, 1, "ἤτοι", "either"],
        [19, 1, "minus", "si minus means"],
        [20, 8, "reliquo", "remaining"],
      ]) {
        await openLesson(page, p);
        await page.locator(`#step-list [data-step="${s}"]`).click();
        const word = page.locator(`#current-passage .word[data-form="${form}"]`).first();
        await word.focus();
        await page.keyboard.press("Enter");
        assert.match(await page.locator("#gloss-content").innerText(), new RegExp(meaning));
        await page.keyboard.press("Escape");
        assert.equal(await word.evaluate((e) => e === document.activeElement), true);
      }
      for (const p of [17, 20]) {
        await reset(page, p, p === 17 ? 5 : 7);
        for (const ratio of [20, 65, 140])
          for (const degrees of [20, 90, 150])
            for (const side of [1, -1]) {
              await page.locator("#ratio").fill(String(ratio));
              await page.locator("#angle").fill(String(degrees));
              if (
                new URLSearchParams(new URL(page.url()).hash.slice(1)).get("side") !== String(side)
              )
                await page.locator("#flip").click();
              for (const pair of [0, 1, 2]) {
                await page.locator("#pair").selectOption(String(pair));
                const v = await points(page);
                if (p === 17) {
                  const [x, y, z] = [
                    [v.Α, v.Β, v.Γ],
                    [v.Β, v.Α, v.Γ],
                    [v.Γ, v.Α, v.Β],
                  ][pair];
                  const exterior = angle(x, z, v.Δ),
                    opposite = angle(x, y, z),
                    common = angle(x, z, y);
                  assert.ok(exterior > opposite);
                  near(exterior + common, 180);
                  assert.ok(opposite + common < 180);
                  result.comparisons += 3;
                } else {
                  const [x, y, z] = [
                    [v.Α, v.Β, v.Γ],
                    [v.Β, v.Α, v.Γ],
                    [v.Γ, v.Β, v.Α],
                  ][pair];
                  near(length(x, v.Δ), length(x, z));
                  near(length(y, v.Δ), length(y, x) + length(x, z));
                  near(angle(x, v.Δ, z), angle(x, z, v.Δ));
                  inside(sub(y, z), sub(x, z), sub(v.Δ, z));
                  assert.ok(angle(y, z, v.Δ) > angle(y, v.Δ, z));
                  assert.ok(length(y, v.Δ) > length(y, z));
                  result.comparisons += 7;
                }
                result.renderedCases++;
              }
            }
      }
      await reset(page, 18, 6);
      for (const ratio of [101, 125, 140])
        for (const degrees of [20, 90, 150])
          for (const side of [1, -1]) {
            await page.locator("#ratio").fill(String(ratio));
            await page.locator("#angle").fill(String(degrees));
            if (new URLSearchParams(new URL(page.url()).hash.slice(1)).get("side") !== String(side))
              await page.locator("#flip").click();
            const v = await points(page);
            near(length(v.Α, v.Δ), length(v.Α, v.Β));
            near(length(v.Α, v.Δ) + length(v.Δ, v.Γ), length(v.Α, v.Γ));
            assert.ok(angle(v.Α, v.Δ, v.Β) > angle(v.Δ, v.Γ, v.Β));
            near(angle(v.Α, v.Δ, v.Β), angle(v.Α, v.Β, v.Δ));
            inside(sub(v.Α, v.Β), sub(v.Δ, v.Β), sub(v.Γ, v.Β));
            result.comparisons += 6;
            result.renderedCases++;
          }
      for (const ratio of [20, 100]) {
        await page.locator("#ratio").fill(String(ratio));
        assert.equal(await page.locator('#diagram [data-point="Δ"]').count(), 0);
        assert.match(await page.locator("#hypothesis-warning").innerText(), /requires|Restore/);
        assert.doesNotMatch(await page.locator("#equations").innerText(), /∠ΑΒΓ > ∠ΑΓΒ/);
      }
      await page.locator("#ratio").focus();
      await page.keyboard.press("End");
      assert.match(page.url(), /r=1.4/);
      assert.equal(await page.locator("#hypothesis-warning").isHidden(), true);
      await reset(page, 19, 2);
      for (const s of [2, 3, 4]) {
        await page.locator(`#step-list [data-step="${s}"]`).click();
        const v = await points(page);
        const b = angle(v.Α, v.Β, v.Γ),
          c = angle(v.Α, v.Γ, v.Β);
        if (s === 2) near(b, c);
        else assert.ok(s === 3 ? b < c : b > c);
        assert.deepEqual(await page.locator("#comparison thead th").allTextContents(), [
          "Quantity / premise",
          "Original given",
          s === 4 ? "Displayed original" : "Temporary case",
        ]);
        assert.match(
          await page.locator("#comparison").innerText(),
          s === 4 ? /Satisfied/ : /Not satisfied/,
        );
        result.comparisons += 3;
        result.renderedCases++;
      }
      await page.locator('#step-list [data-step="2"]').click();
      await audit(page, "I.19 temporary premise", result);
      async function save(kind, label, expected) {
        const [download] = await Promise.all([
          page.waitForEvent("download"),
          page.locator(kind === "svg" ? "#save-diagram" : "#save-sheet").click(),
        ]);
        const path = join(out, `${name}-${width}-${label}.${kind}`);
        await download.saveAs(path);
        const bytes = await readFile(path);
        assert.match(bytes.toString(), expected);
        assert.doesNotMatch(bytes.toString(), /NaN|Infinity|<script/);
        result.downloads.push({ file: path, bytes: bytes.length, sha256: hash(bytes) });
        return path;
      }
      const counter = await save("html", "I19-countercase", /Temporary supposition/);
      await page.locator("#toast").waitFor({ state: "hidden" });
      await parameters(page, false);
      await page.locator("#workbench").evaluate((e) => e.scrollIntoView({ block: "start" }));
      if (name === "chromium") await page.screenshot({ path: join(out, `I19-${width}.png`) });
      await reset(page, 20, 7);
      await page.locator("#pair").focus();
      await page.keyboard.press("End");
      await page.keyboard.press("Enter");
      assert.match(page.url(), /pair=2/);
      await page.locator("#share").click();
      const shared = await page.locator("#share-url").inputValue();
      assert.match(shared, /p=20.*pair=2/);
      await page.keyboard.press("Escape");
      const copy = await context.newPage();
      await copy.goto(shared);
      assert.equal(await copy.locator("#pair").inputValue(), "2");
      assert.match(await copy.locator("#equations").innerText(), /ΒΓ \+ ΓΑ/);
      await copy.close();
      await page.locator("#previous").click();
      assert.equal(await page.locator("#pair").isDisabled(), true);
      assert.match(await page.locator("#equations").innerText(), /ΒΑ \+ ΑΓ/);
      await page.locator("#next").click();
      assert.equal(await page.locator("#pair").inputValue(), "2");
      await save("svg", "I20-third-pair", /copy ΓΑ to ΓΔ/);
      const study = await save("html", "I20-third-pair", /A modern expansion/);
      await page.locator("#toast").waitFor({ state: "hidden" });
      await parameters(page, false);
      await page.locator("#workbench").evaluate((e) => e.scrollIntoView({ block: "start" }));
      if (name === "chromium") await page.screenshot({ path: join(out, `I20-${width}.png`) });
      await page.locator("#next").click();
      await page.locator('#current-passage [data-source="51"]').click();
      await page.waitForFunction(() => document.querySelector("#source-image").naturalWidth > 0);
      assert.equal(await page.locator("#source-next").isDisabled(), true);
      await audit(page, "Last new source page", result);
      await page.keyboard.press("Escape");
      const manifest = JSON.parse(await readFile("public/sources/manifest.json", "utf8"));
      for (const source of manifest.pages.filter((p) => p.printed_page >= 44)) {
        const response = await page.request.get(new URL(`sources/${source.file}`, base).href);
        assert.equal(response.status(), 200);
        const bytes = await response.body();
        assert.equal(hash(bytes), source.sha256);
        result.sources.push({ page: source.printed_page, sha256: hash(bytes) });
      }
      const saved = await context.newPage();
      const requests = [];
      saved.on("request", (r) => {
        if (/^https?:/.test(r.url())) requests.push(r.url());
      });
      await context.setOffline(true);
      for (const path of [counter, study]) {
        await saved.goto(pathToFileURL(path).href);
        await audit(
          saved,
          `Standalone ${path.endsWith("countercase.html") ? "countercase" : "third pair"}`,
          result,
        );
        assert.equal(
          await saved.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          true,
        );
      }
      assert.deepEqual(requests, []);
      if (name === "chromium" && width === 1440) {
        await saved.pdf({
          path: join(out, "I20-third-pair.pdf"),
          format: "A4",
          printBackground: true,
        });
      }
      await context.setOffline(false);
      await saved.close();
      assert.deepEqual(errors, []);
      await context.close();
      report.configurations.push(result);
      console.log(
        `${name} ${width}: ${result.readingSteps} steps, ${result.renderedCases} rendered cases, ${result.comparisons} relations`,
      );
    }
  } finally {
    await browser.close();
  }
}
await writeFile(join(out, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
