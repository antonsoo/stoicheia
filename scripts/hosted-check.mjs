// biome-ignore-all lint/performance/useDomNodeTextContent: Check text as presented to the reader.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { chromium, firefox } from "playwright";
import { openLesson } from "./navigation.mjs";

const base = process.argv[2];
const sourceCommit = process.argv[3];
assert.ok(base?.startsWith("https://"), "Supply the actual HTTPS deployment URL.");
assert.match(sourceCommit ?? "", /^[a-f0-9]{40}$/, "Supply the reviewed source commit.");
const url = new URL(base);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) =>
      e.isDirectory() ? filesIn(join(directory, e.name)) : [join(directory, e.name)],
    ),
  );
  return files.flat().sort();
}
const report = {
  scope: "Direct HTTPS deployment: exact build bytes and real hosted browser workflows",
  checkedAt: new Date().toISOString(),
  url: url.href,
  sourceCommit,
  files: [],
  configurations: [],
};
for (const path of await filesIn("dist")) {
  const file = relative("dist", path).split("\\").join("/");
  const response = await fetch(new URL(file, url), { cache: "no-store" });
  assert.equal(response.status, 200, file);
  const bytes = await response.bytes();
  const hash = digest(bytes);
  assert.equal(hash, digest(await readFile(path)), `Hosted bytes differ: ${file}`);
  report.files.push({ file, bytes: bytes.length, sha256: hash });
}
console.log(`Matched ${report.files.length} hosted files to the reviewed build.`);
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const viewport of [
      { width: 1440, height: 1000 },
      { width: 375, height: 812 },
    ]) {
      console.log(`Hosted ${name} ${viewport.width}px`);
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const errors = [];
      const external = [];
      const assets = new Map();
      page.on("pageerror", (error) => errors.push(String(error)));
      page.on("request", (request) => {
        if (request.url().startsWith("http") && new URL(request.url()).origin !== url.origin)
          external.push(request.url());
      });
      page.on("response", (response) => {
        if (/\.(js|css|ttf)(\?|$)/.test(response.url()))
          assets.set(response.url(), response.status());
      });
      await page.addInitScript(() => {
        window.__policyViolations = [];
        document.addEventListener("securitypolicyviolation", (event) => {
          window.__policyViolations.push(`${event.violatedDirective}: ${event.blockedURI}`);
        });
      });
      await page.goto(url.href);
      await page.waitForFunction(
        () =>
          document
            .querySelector("#offline-state")
            ?.textContent?.startsWith("Edition ready offline"),
        null,
        { timeout: 60000 },
      );
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => document.fonts.check('20px "Noto Serif"')), true);
      for (const [proposition, count] of [
        [1, 10],
        [2, 11],
        [3, 5],
        [4, 8],
        [5, 11],
        [6, 7],
        [7, 8],
        [8, 8],
        [9, 9],
        [10, 8],
      ]) {
        await openLesson(page, proposition);
        await page.locator(`#step-list [data-step="${count - 1}"]`).click();
        assert.equal(await page.locator("#step-position").innerText(), `Step ${count} of ${count}`);
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          true,
        );
      }
      await openLesson(page, 4);
      await page.locator('#step-list [data-step="3"]').click();
      await page.locator("#motion").focus();
      await page.keyboard.press("End");
      assert.equal(await page.locator("#motion-output").innerText(), "100%");
      assert.match(await page.locator("#diagram").textContent(), /Α \/ Δ/);
      await openLesson(page, 5);
      await page.locator('#step-list [data-step="8"]').click();
      assert.match(
        await page.locator(".comparison-table caption").innerText(),
        /Subtract equal parts/,
      );
      await page.locator('#reason [data-foundation="cn3"]').click();
      assert.match(await page.locator("#foundation-content").innerText(), /subtrahuntur/);
      await page.locator('#foundation-content [data-source="10"]').click();
      await page.waitForFunction(() => {
        const image = document.querySelector("#source-image");
        return image.complete && image.naturalWidth > 0;
      });
      await page.keyboard.press("Escape");
      await page.keyboard.press("Escape");
      await openLesson(page, 6);
      await page.locator('#step-list [data-step="4"]').click();
      assert.match(await page.locator("#diagram-notice").innerText(), /Hypothetical sketch/);
      await page.locator("#reading-mode").selectOption("greek");
      assert.equal(await page.locator("#current-passage .english").isHidden(), true);
      await page.locator("#reveal-translations").click();
      assert.equal(await page.locator("#current-passage .english").isVisible(), true);
      await page.locator("#open-practice").click();
      assert.match(await page.locator("#practice-position").innerText(), /Reading 11 of 20/i);
      await page.locator("#practice-options input").nth(1).check();
      assert.equal(
        await page.locator("#practice-feedback").getAttribute("class"),
        "correct-feedback",
      );
      await page.keyboard.press("Escape");
      await openLesson(page, 7);
      await page.locator("#variant").selectOption("1");
      assert.match(await page.locator("#diagram-notice").innerText(), /opposite sides/);
      await openLesson(page, 8);
      await page.locator('#step-list [data-step="6"]').click();
      await page.locator("#motion").fill("100");
      assert.match(await page.locator("#diagram").textContent(), /Α \/ Δ/);
      await openLesson(page, 9);
      await page.locator('#step-list [data-step="7"]').click();
      await page.locator("#variant").selectOption("1");
      await page.locator("#angle").fill("60");
      assert.equal(await page.locator('#diagram [data-entity="AZ"]').count(), 0);
      assert.match(await page.locator("#hypothesis-warning").innerText(), /zero length/);
      await page.locator("#angle").fill("90");
      assert.match(await page.locator("#diagram-notice").innerText(), /opposite bisector ray/);
      await page.locator("#variant").selectOption("0");
      assert.equal(await page.locator("#hypothesis-warning").isHidden(), true);
      await openLesson(page, 10);
      await page.locator('#step-list [data-step="6"]').click();
      assert.match(await page.locator("#equations").innerText(), /ΑΔ = ΒΔ/);
      await page.locator('#current-passage [data-source="31"]').click();
      await page.waitForFunction(() => {
        const i = document.querySelector("#source-image");
        return i.complete && i.naturalWidth > 0;
      });
      await page.keyboard.press("Escape");
      await openLesson(page, 6);
      await page.locator('#step-list [data-step="4"]').click();
      const shared = page.url();
      await page.reload();
      assert.equal(page.url(), shared);
      assert.equal(await page.locator("#step-position").innerText(), "Step 5 of 7");
      assert.match(await page.locator("#diagram-notice").innerText(), /Hypothetical sketch/);
      // This emulates loss of connectivity at the browser. The separate local
      // suite additionally kills its origin below the browser for a stronger control.
      await context.setOffline(true);
      const offline = await page.reload();
      assert.equal(offline.fromServiceWorker(), true);
      assert.equal(await page.locator("#step-position").innerText(), "Step 5 of 7");
      await page.locator('#current-passage [data-source="24"]').click();
      await page.waitForFunction(() => {
        const image = document.querySelector("#source-image");
        return image.complete && image.naturalWidth > 0;
      });
      assert.deepEqual(errors, []);
      assert.deepEqual(external, []);
      assert.deepEqual(await page.evaluate(() => window.__policyViolations), []);
      assert.ok(assets.size >= 3);
      assert.ok([...assets.values()].every((status) => status === 200));
      report.configurations.push({
        browser: name,
        version: browser.version(),
        viewport,
        finalSteps: 10,
        workflows: [
          "rigid superposition",
          "I.5 angle subtraction",
          "foundation and nested source scan",
          "I.6 hypothetical sketch",
          "Greek-first reveal",
          "passage exercise",
          "shared URL reload",
          "I.7 reflected candidate",
          "I.8 three-side superposition",
          "I.9 collapsed and outward crossing, then internal bisector",
          "I.10 midpoint and printed page 31",
        ],
        offline:
          "Worker-served reload and source scan under browser offline emulation; public origin not disabled",
        pageErrors: errors.length,
        externalRequests: external.length,
        cspViolations: 0,
        browserAssets: [...assets].map(([address, status]) => ({ url: address, status })),
      });
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile("docs/publication-verification.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(
  `Direct hosted workflows passed in ${report.configurations.length} browser/viewport configurations.`,
);
