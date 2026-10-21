// biome-ignore-all lint/performance/useDomNodeTextContent: Checks visible learner state and drawn output.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { openLesson } from "./navigation.mjs";

async function reset(page, proposition) {
  await openLesson(page, proposition);
  if (!(await page.locator("#parameters").evaluate((e) => e.open)))
    await page.locator("#parameters summary").click();
  await page.locator("#reset").click();
  await page.locator("#parameters summary").click();
}
async function range(page, id, value) {
  await page.locator(`#${id}`).fill(String(value));
}
async function drawnLength(page, id) {
  return page
    .locator(`#diagram [data-entity="${id}"]`)
    .evaluate((e) =>
      Math.hypot(
        +e.getAttribute("x2") - +e.getAttribute("x1"),
        +e.getAttribute("y2") - +e.getAttribute("y1"),
      ),
    );
}
async function snapshot(page, name, width) {
  await page.locator("#workbench").evaluate((e) => e.scrollIntoView({ block: "start" }));
  await page.screenshot({ path: `docs/assets/${name}-${width}.png` });
}

export async function verifyBisections(page, viewport, browser, accessible, audits, artifacts) {
  const downloads = [];
  async function download(kind, label, expected) {
    const [file] = await Promise.all([
      page.waitForEvent("download"),
      page.locator(kind === "svg" ? "#save-diagram" : "#save-sheet").click(),
    ]);
    const path = join(artifacts, `${browser}-${viewport.width}-${label}.${kind}`);
    await file.saveAs(path);
    const content = await readFile(path, "utf8");
    assert.match(content, expected);
    assert.doesNotMatch(content, /NaN|Infinity|<script/);
    downloads.push(path);
    if (browser === "chromium" && viewport.width === 1440)
      await writeFile(`examples/${label}.${kind}`, content);
  }
  await reset(page, 7);
  await page.locator('#step-list [data-step="5"]').click();
  assert.match(await page.locator("#diagram-notice").innerText(), /cannot also make ΒΓ = ΒΔ/);
  assert.ok(Math.abs((await drawnLength(page, "AC")) - (await drawnLength(page, "AD"))) < 0.01);
  assert.ok(Math.abs((await drawnLength(page, "BC")) - (await drawnLength(page, "BD"))) > 1);
  await accessible(page, "I.7 conditional angle equality", audits);
  if (browser === "chromium") await snapshot(page, "uniqueness", viewport.width);
  await page.locator("#variant").selectOption("1");
  assert.equal(await page.locator("#probe-control").isHidden(), true);
  assert.match(await page.locator("#diagram-notice").innerText(), /opposite sides/);
  assert.ok(Math.abs((await drawnLength(page, "BC")) - (await drawnLength(page, "BD"))) < 0.01);
  await download("svg", "stoicheia-I7-reflection", /same-side hypothesis/);
  await page.locator("#variant").selectOption("0");
  await page.locator("#probe").focus();
  await page.keyboard.press("Home");
  assert.match(await page.locator("#diagram-notice").innerText(), /same point/);
  assert.equal(await page.locator('#diagram [data-entity="CD"]').count(), 0);
  await page.keyboard.press("End");
  assert.match(page.url(), /q=32/);

  await reset(page, 8);
  await page.locator('#step-list [data-step="6"]').click();
  const before = await page.locator('#diagram [data-entity="AB"]').getAttribute("data-length");
  await range(page, "motion", 37);
  assert.equal(
    await page.locator('#diagram [data-entity="AB"]').getAttribute("data-length"),
    before,
  );
  if (browser === "chromium") await snapshot(page, "three-sides", viewport.width);
  await page.locator("#motion").focus();
  await page.keyboard.press("End");
  assert.equal(await page.locator('#diagram [data-point="Α"] text').textContent(), "Α / Δ");
  await page.locator("#parameters summary").click();
  await range(page, "ratio", 20);
  await range(page, "third", 180);
  assert.match(await page.locator("#hypothesis-warning").innerText(), /do not form/);
  assert.equal(await page.locator('#diagram [data-point="Α"]').count(), 0);
  assert.equal(await page.locator("#diagram [data-angle]").count(), 0);
  await accessible(page, "I.8 impossible three-length input", audits);
  await range(page, "size", 101);
  await range(page, "third", 120);
  assert.equal(await page.locator('#diagram [data-point="Α"]').count(), 0);
  assert.equal(await page.locator("#hypothesis-warning").isVisible(), true);
  await range(page, "ratio", 140);
  assert.equal(await page.locator("#hypothesis-warning").isHidden(), true);
  await download("html", "stoicheia-I8-study", /three side pairs/i);

  await openLesson(page, 7);
  await page.locator("#variant").selectOption("1");
  await openLesson(page, 9);
  assert.equal(await page.locator("#variant").inputValue(), "0");
  await reset(page, 9);
  await page.locator("#variant").selectOption("1");
  assert.equal(await page.locator("#step-position").innerText(), "Step 4 of 9");
  await page.locator('#step-list [data-step="7"]').click();
  await range(page, "angle", 40);
  assert.match(await page.locator("#diagram-notice h3").innerText(), /still inside/);
  assert.equal(await page.locator("#hypothesis-warning").isHidden(), true);
  await range(page, "angle", 60);
  assert.match(await page.locator("#diagram-notice h3").innerText(), /coincides/);
  assert.equal(await page.locator('#diagram [data-entity="AZ"]').count(), 0);
  assert.equal(await page.locator("#diagram [data-angle]").count(), 0);
  assert.match(await page.locator("#hypothesis-warning").innerText(), /zero length/);
  await accessible(page, "I.9 collapsed crossing", audits);
  await download("svg", "stoicheia-I9-collapsed", /zero length/);
  await range(page, "angle", 90);
  assert.match(await page.locator("#diagram-notice h3").innerText(), /outside/);
  await page.locator("#parameters summary").click();
  assert.match(await page.locator("#measurements").innerText(), /135.00/);
  assert.doesNotMatch(await page.locator("#equations").innerText(), /½/);
  await download("html", "stoicheia-I9-opposite-ray", /does not divide it/);
  await page.locator("#share").click();
  const link = await page.locator("#share-url").inputValue();
  await page.keyboard.press("Escape");
  await page.goto(link);
  await page.reload();
  assert.equal(await page.locator("#variant").inputValue(), "1");
  assert.equal(await page.locator("#angle").inputValue(), "90");
  assert.match(await page.locator("#diagram-notice").innerText(), /opposite bisector ray/);
  await page.locator("#variant").selectOption("0");
  assert.equal(await page.locator("#hypothesis-warning").isHidden(), true);
  if (!(await page.locator("#parameters").evaluate((e) => e.open)))
    await page.locator("#parameters summary").click();
  assert.match(await page.locator("#measurements").innerText(), /45.00/);
  await page.locator("#parameters summary").click();
  await accessible(page, "I.9 internal angle bisector", audits);
  if (browser === "chromium") await snapshot(page, "angle-bisection", viewport.width);

  await reset(page, 10);
  await page.locator('#step-list [data-step="6"]').click();
  assert.ok(Math.abs((await drawnLength(page, "AD")) - (await drawnLength(page, "BD"))) < 0.01);
  assert.equal(await page.locator("#diagram .curve").count(), 2);
  await page.locator('[data-trace="first"]').click();
  assert.equal(await page.locator("#diagram").getAttribute("data-trace"), "first");
  await page.locator('[data-trace="both"]').click();
  await accessible(page, "I.10 midpoint construction with reused circles", audits);
  if (browser === "chromium") await snapshot(page, "segment-bisection", viewport.width);
  await download("html", "stoicheia-I10-study", /not a coordinate assigned in advance/);
  await page.locator('#current-passage [data-source="31"]').click();
  await page.waitForFunction(() => {
    const i = document.querySelector("#source-image");
    return i.complete && i.naturalWidth > 0;
  });
  await page.keyboard.press("Escape");

  // Read actual saved files with network disabled, including failure explanations.
  const saved = await page.context().newPage();
  await page.context().setOffline(true);
  try {
    for (const path of downloads) {
      await saved.goto(pathToFileURL(path).href);
      assert.equal(await saved.locator("script").count(), 0);
      assert.equal(await saved.getByRole("img", { name: /I\./ }).count(), 1);
      if (path.endsWith(".html")) {
        assert.ok((await saved.locator(".lesson-passage").count()) >= 8);
        assert.ok(await saved.locator("svg").isVisible());
        const size = await saved.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
        assert.ok(size[0] <= size[1] + 1);
        await accessible(saved, `standalone ${path.split("/").at(-1)}`, audits);
      }
    }
  } finally {
    await saved.close();
    await page.context().setOffline(false);
  }
  return {
    scenarios: [
      "I.7 same-side, reflected and coincident candidates",
      "I.8 rigid superposition and impossible triples",
      "I.9 both crossings below, at and above 60 degrees",
      "I.9 warning survives shared link",
      "I.10 reused circles and computed midpoint",
    ],
    downloadsReopenedOffline: downloads.length,
  };
}
