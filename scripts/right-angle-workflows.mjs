// biome-ignore-all lint/performance/useDomNodeTextContent: Inspect learner-visible text and rendered geometry.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { openLesson } from "./navigation.mjs";

async function parameters(page, open = true) {
  if ((await page.locator("#parameters").evaluate((e) => e.open)) !== open)
    await page.locator("#parameters summary").click();
}
async function reset(page, p, step) {
  await openLesson(page, p);
  await parameters(page);
  await page.locator("#reset").click();
  await page.locator(`#step-list [data-step="${step}"]`).click();
}
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
const length = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const angle = (a, b, c) => {
  const u = { x: a.x - b.x, y: a.y - b.y },
    v = { x: c.x - b.x, y: c.y - b.y };
  return (Math.atan2(Math.abs(u.x * v.y - u.y * v.x), u.x * v.x + u.y * v.y) * 180) / Math.PI;
};
const near = (a, b, t = 0.006) => assert.ok(Math.abs(a - b) < t, `${a} != ${b}`);

export async function verifyRightAngles(page, viewport, browser, accessible, audits, artifacts) {
  const downloads = [];
  let checks = 0;
  async function save(kind, label, expected) {
    const [file] = await Promise.all([
      page.waitForEvent("download"),
      page.locator(kind === "svg" ? "#save-diagram" : "#save-sheet").click(),
    ]);
    const path = join(artifacts, `${browser}-${viewport.width}-${label}.${kind}`);
    await file.saveAs(path);
    const text = await readFile(path, "utf8");
    assert.match(text, expected);
    assert.doesNotMatch(text, /NaN|Infinity|<script/);
    downloads.push(path);
    if (browser === "chromium" && viewport.width === 1440)
      await writeFile(`examples/${label}.${kind}`, text);
    return path;
  }
  async function screenshot(label) {
    if (browser === "chromium") {
      await page.locator("#toast").waitFor({ state: "hidden" });
      await parameters(page, false);
      await page.locator("#workbench").evaluate((e) => e.scrollIntoView({ block: "start" }));
      await page.screenshot({ path: `docs/assets/${label}-${viewport.width}.png` });
    }
  }
  await reset(page, 11, 7);
  for (const take of [10, 55, 90])
    for (const side of [1, -1]) {
      await page.locator("#take").fill(String(take));
      if (new URL(page.url()).hash.includes("side=-1") !== (side === -1))
        await page.locator("#flip").click();
      const v = await points(page);
      near(length(v.Δ, v.Γ), length(v.Γ, v.Ε));
      near(length(v.Δ, v.Ζ), length(v.Ε, v.Ζ));
      near(angle(v.Δ, v.Γ, v.Ζ), 90);
      checks += 3;
    }
  await page.locator("#take").focus();
  await page.keyboard.press("Home");
  assert.match(page.url(), /k=0.1/);
  await page.keyboard.press("End");
  assert.match(page.url(), /k=0.9/);
  await page.locator('#step-list [data-step="6"]').click();
  await page.locator('#reason [data-foundation="d10"]').click();
  assert.match(await page.locator("#foundation-content").innerText(), /adjacent/);
  await page.locator('#foundation-content [data-source="2"]').click();
  await page.waitForFunction(() => document.querySelector("#source-image").naturalWidth > 0);
  assert.match(await page.locator("#source-title").innerText(), /page 2/);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await reset(page, 12, 8);
  for (const choice of ["miss", "touch", "cross", "source"]) {
    await page.locator(`[data-circle-example="${choice}"]`).click();
    const valid = ["cross", "source"].includes(choice);
    assert.equal(await page.locator('#diagram [data-point="Θ"]').count(), valid ? 1 : 0);
    assert.equal(await page.locator('#diagram [data-entity="CT"]').count(), valid ? 1 : 0);
    if (choice === "touch") {
      assert.equal(await page.locator('#diagram [data-point="touch"]').count(), 1);
      await save("svg", "stoicheia-I12-tangent", /One contact|one contact/);
      await save("html", "stoicheia-I12-tangent", /zero-length/);
    }
    if (valid) {
      const v = await points(page);
      near(length(v.Ε, v.Θ), length(v.Θ, v.Η));
      near(angle(v.Ε, v.Θ, v.Γ), 90);
      checks += 2;
    }
  }
  await page.locator('[data-circle-example="miss"]').click();
  await parameters(page);
  await page.locator("#third").fill("65");
  assert.match(await page.locator("#diagram-notice").innerText(), /zero radius/);
  assert.equal(await page.locator("#diagram .curve").count(), 0);
  await accessible(page, "I.12 zero-radius alternative", audits);
  await page.locator('[data-circle-example="source"]').click();
  await parameters(page);
  for (const x of [-200, 0, 200]) {
    await page.locator("#offset").fill(String(x));
    const v = await points(page);
    near(v.Γ.x, v.Θ.x);
    near(length(v.Ε, v.Θ), length(v.Η, v.Θ));
    checks += 2;
  }
  await page.locator("#offset").fill("-125");
  const shared = page.url();
  await page.reload();
  assert.equal(page.url(), shared);
  await parameters(page);
  assert.equal(await page.locator("#offset").inputValue(), "-125");
  await save("html", "stoicheia-I12-study", /other side matters/);
  await screenshot("perpendicular");
  await reset(page, 13, 4);
  await page.locator("#angle").focus();
  await page.keyboard.press("End");
  assert.equal(await page.locator("#angle").inputValue(), "90");
  assert.match(await page.locator("#hypothesis-warning").innerText(), /first branch/);
  assert.equal(await page.locator('#diagram [data-angle="ABE"]').count(), 0);
  await page.reload();
  await parameters(page);
  assert.equal(await page.locator("#angle").inputValue(), "90");
  await page.locator("#angle").fill("25");
  assert.equal(await page.locator("#hypothesis-warning").isHidden(), true);
  await accessible(page, "I.13 branches", audits);
  await reset(page, 14, 5);
  const v14 = await points(page);
  assert.ok(angle(v14.Α, v14.Β, v14.Ε) < angle(v14.Α, v14.Β, v14.Δ));
  near(angle(v14.Α, v14.Β, v14.Γ) + angle(v14.Α, v14.Β, v14.Δ), 180);
  checks += 2;
  assert.match(await page.locator("#equations").innerText(), /If ΓΒΕ were straight/);
  assert.match(await page.locator("#equations").getAttribute("aria-label"), /temporary/);
  await save("svg", "stoicheia-I14-hypothetical", /not all premises can hold/);
  await save("html", "stoicheia-I14-hypothetical", /Under that supposition/);
  await screenshot("linear-converse");
  await page.locator('#step-list [data-step="6"]').click();
  assert.equal(await page.locator('#diagram [data-point="Ε"]').count(), 0);
  await reset(page, 15, 6);
  assert.match(await page.locator("#edition-extra").innerText(), /no corresponding translation/);
  await page.locator('#edition-extra [data-source="42"]').click();
  await page.waitForFunction(() => document.querySelector("#source-image").naturalWidth > 0);
  assert.match(await page.locator("#source-title").innerText(), /page 42/);
  await page.keyboard.press("Escape");
  await save("html", "stoicheia-I15-study", /\[Πόρισμα/);
  await accessible(page, "I.15 Greek-only corollary", audits);
  await reset(page, 16, 7);
  for (const degrees of [20, 50, 90, 150])
    for (const ratio of [20, 65, 140])
      for (const flip of [false, true]) {
        await page.locator("#angle").fill(String(degrees));
        await page.locator("#ratio").fill(String(ratio));
        if (flip) await page.locator("#flip").click();
        for (const step of [7, 8]) {
          await page.locator(`#step-list [data-step="${step}"]`).click();
          const v = await points(page);
          const exterior = angle(v.Α, v.Γ, v.Δ);
          assert.ok(exterior > angle(v.Β, v.Α, v.Γ));
          assert.ok(exterior > angle(v.Α, v.Β, v.Γ));
          if (step === 7) {
            near(length(v.Α, v.Ε), length(v.Ε, v.Γ));
            near(length(v.Β, v.Ε), length(v.Ε, v.Ζ));
            near(angle(v.Β, v.Α, v.Ε), angle(v.Ε, v.Γ, v.Ζ), 0.04);
            assert.ok(angle(v.Ε, v.Γ, v.Ζ) < exterior);
          } else {
            near(length(v.Β, v.Θ), length(v.Θ, v.Γ));
            near(length(v.Α, v.Θ), length(v.Θ, v.Κ));
            near(angle(v.Α, v.Β, v.Γ), angle(v.Θ, v.Γ, v.Κ), 0.04);
            assert.ok(angle(v.Θ, v.Γ, v.Κ) < angle(v.Β, v.Γ, v.Η));
          }
          checks += 6;
        }
      }
  await page.locator("#reset").click();
  await page.locator('#step-list [data-step="8"]').click();
  await save("svg", "stoicheia-I16-second-construction", /modern labels/);
  assert.deepEqual(
    await page.locator("#comparison tbody tr").first().locator("td").allTextContents(),
    ["ΒΘ", "ΓΘ", "equal halves · I.10"],
  );
  const sheet = await save("html", "stoicheia-I16-study", /Θ and Κ/);
  await screenshot("exterior-angle");
  await accessible(page, "I.16 expanded second construction", audits);
  const saved = await page.context().newPage();
  await saved.goto(pathToFileURL(sheet).href);
  assert.equal(await saved.locator(".lesson-passage").count(), 10);
  assert.equal(await saved.locator("script").count(), 0);
  assert.equal(
    await saved.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    true,
  );
  await accessible(saved, "I.16 standalone study sheet", audits);
  if (browser === "chromium" && viewport.width === 1440)
    await saved.pdf({
      path: "examples/stoicheia-I16-study.pdf",
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
    });
  await saved.close();
  await parameters(page, false);
  return {
    renderedGeometryChecks: checks,
    downloads: downloads.length,
    constructions:
      "I.11 endpoints; I.12 miss/tangent/crossing/zero radius and offset; I.13 both branches; I.14 conditional sketch; I.15 edition omission; I.16 both constructions across 48 rendered cases",
  };
}
