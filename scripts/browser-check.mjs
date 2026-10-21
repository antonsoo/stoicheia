// biome-ignore-all lint/performance/useDomNodeTextContent: Playwright assertions deliberately check rendered text, not hidden DOM content.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";
import { verifyBisections } from "./bisection-workflows.mjs";
import { verifyLearning } from "./learning-workflows.mjs";
import { openLesson } from "./navigation.mjs";

const url = process.argv[2] ?? "http://127.0.0.1:4327/stoicheia/";
// Cut access below the browser when checking offline behaviour. Request routing
// interferes with Firefox service-worker reloads, and its worker fetches do not
// consistently honour Playwright's offline flag. Both flags and a dead origin are
// therefore used; the navigation must still be fulfilled by the worker.
let originAvailable = true;
let rejectedConnections = 0;
const gate = createServer(async (request, response) => {
  if (!originAvailable) {
    rejectedConnections++;
    request.socket.destroy();
    return;
  }
  try {
    const upstream = await fetch(new URL(request.url, url));
    response.writeHead(upstream.status, {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    request.socket.destroy();
  }
});
await new Promise((resolve) => gate.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${gate.address().port}`;
const browserUrl = new URL(new URL(url).pathname, origin).href;
const report = {
  scope: "Locally served production build; no public deployment",
  configurations: [],
};
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const counts = { 1: 10, 2: 11, 3: 5, 4: 8, 5: 11, 6: 7, 7: 8, 8: 8, 9: 9, 10: 8 };
const artifacts = await mkdtemp(join(tmpdir(), "stoicheia-export-"));

async function accessible(page, label, results) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const violations = result.violations.map((v) => ({
    id: v.id,
    targets: v.nodes.map((n) => n.target),
    summaries: v.nodes.map((n) => n.failureSummary),
  }));
  assert.deepEqual(violations, [], `Accessibility ${label}: ${JSON.stringify(violations)}`);
  results.push(label);
}

async function noOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  assert.ok(
    dimensions.document <= dimensions.viewport + 1,
    `Horizontal overflow: ${JSON.stringify(dimensions)}`,
  );
}

async function renderedEqualities(page, proposition, step) {
  if (proposition >= 4) return;
  if (
    (proposition === 1 && step < 3) ||
    (proposition === 2 && step < 5) ||
    (proposition === 3 && step < 2)
  )
    return;
  const pairs =
    proposition === 1
      ? [
          ["AB", "AC"],
          ["AB", "BC"],
        ]
      : proposition === 2
        ? [["BC", "AL"]]
        : [["reference", "AE"]];
  for (const [first, second] of pairs) {
    const lengths = await page.evaluate(
      ([x, y]) => {
        const length = (id) => {
          const line = document.querySelector(`#diagram [data-entity="${id}"]`);
          return Math.hypot(
            Number(line.getAttribute("x2")) - Number(line.getAttribute("x1")),
            Number(line.getAttribute("y2")) - Number(line.getAttribute("y1")),
          );
        };
        return [length(x), length(y)];
      },
      [first, second],
    );
    assert.ok(Math.abs(lengths[0] - lengths[1]) < 0.01, `Rendered ${first} != ${second}`);
  }
}

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory() ? filesIn(join(directory, entry.name)) : [join(directory, entry.name)],
      ),
    )
  ).flat();
}

try {
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
        const context = await browser.newContext({
          viewport,
          acceptDownloads: true,
          reducedMotion: "reduce",
        });
        context.setDefaultTimeout(15000);
        context.setDefaultNavigationTimeout(20000);
        const errors = [],
          externalRequests = [],
          cspViolations = [];
        await context.addInitScript(() => {
          window.__policyViolations = [];
          document.addEventListener("securitypolicyviolation", (event) =>
            window.__policyViolations.push(`${event.violatedDirective}: ${event.blockedURI}`),
          );
        });
        context.on("request", (request) => {
          const address = request.url();
          if (/^https?:/.test(address) && new URL(address).origin !== origin) {
            externalRequests.push(address);
          }
        });
        context.on("page", (p) => p.on("pageerror", (error) => errors.push(String(error))));
        const page = await context.newPage();
        const audits = [];
        const result = {
          browser: name,
          version: browser.version(),
          viewport,
          readingSteps: 0,
          accessibility: audits,
        };
        console.log(`Checking ${name} ${viewport.width}px`);
        await page.goto(browserUrl, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(
          () =>
            Boolean(navigator.serviceWorker.controller) &&
            document.querySelector("#offline-state").textContent.includes("ready offline"),
        );
        assert.match(await page.locator("#offline-state").innerText(), /ready offline/);
        assert.equal(await page.evaluate(() => document.fonts.check('20px "Noto Serif"')), true);

        for (const proposition of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
          await openLesson(page, proposition);
          for (let step = 0; step < counts[proposition]; step++) {
            assert.equal(
              await page.locator("#step-position").innerText(),
              `Step ${step + 1} of ${counts[proposition]}`,
            );
            assert.ok(await page.locator("#current-passage p[lang=grc]").innerText());
            assert.ok(await page.locator("#current-passage p[lang=la]").innerText());
            assert.ok(await page.locator("#reason h3").innerText());
            await noOverflow(page);
            await renderedEqualities(page, proposition, step);
            result.readingSteps++;
            if (step < counts[proposition] - 1) await page.locator("#next").click();
          }
          assert.equal(await page.locator("#next").isDisabled(), true);
          await accessible(page, `I.${proposition} final step`, audits);
          const question = page.locator(".question input");
          const correctAnswer = { 1: 0, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0, 7: 1, 8: 2, 9: 0, 10: 1 }[
            proposition
          ];
          await question.nth((correctAnswer + 1) % 3).check();
          assert.ok(await page.locator("#question-feedback").innerText());
          await question.nth(correctAnswer).check();
          assert.equal(
            await page.locator("#question-feedback").getAttribute("class"),
            "correct-feedback",
          );
        }

        // Each focusable word opens a modal, Escape returns focus to that exact word.
        const word = page.locator("#current-passage .word").first();
        await word.focus();
        await page.keyboard.press("Enter");
        assert.equal(await page.locator("#vocabulary-dialog").evaluate((d) => d.open), true);
        await accessible(page, "vocabulary dialog", audits);
        await page.keyboard.press("Escape");
        assert.equal(await word.evaluate((button) => button === document.activeElement), true);

        // Verify original printed pages, including zoom/pan and keyboard dismissal.
        await page.locator("#open-edition").click();
        for (let printedPage = 4; printedPage <= 31; printedPage++) {
          await page.waitForFunction(() => {
            const image = document.querySelector("#source-image");
            return image.complete && image.naturalWidth > 0;
          });
          assert.equal(
            await page.locator("#source-title").innerText(),
            `Printed page ${printedPage}`,
          );
          if (printedPage < 31) await page.locator("#source-next").click();
        }
        await page.locator("#source-zoom").click();
        assert.equal(await page.locator("#source-zoom").getAttribute("aria-pressed"), "true");
        assert.ok(
          await page
            .locator("#source-image")
            .evaluate((image) => image.getBoundingClientRect().width >= 980),
        );
        await page.locator(".scan-scroll").focus();
        await page.keyboard.press("ArrowDown");
        await page.waitForFunction(() => document.querySelector(".scan-scroll").scrollTop > 0);
        if (viewport.width === 375) {
          await page.keyboard.press("ArrowRight");
          await page.waitForFunction(() => document.querySelector(".scan-scroll").scrollLeft > 0);
        }
        await page.locator("#source-zoom").click();
        await accessible(page, "source dialog", audits);
        await page.keyboard.press("Escape");

        await verifyLearning(page, viewport, accessible, audits);
        result.bisections = await verifyBisections(
          page,
          viewport,
          name,
          accessible,
          audits,
          artifacts,
        );
        await openLesson(page, 3);
        await page.locator('#step-list [data-step="4"]').click();
        // Native keyboard range changes must update the picture and the shared state.
        await page.locator("#parameters summary").click();
        await page.locator("#ratio").focus();
        await page.keyboard.press("End");
        assert.match(await page.locator("#hypothesis-warning").innerText(), /shorter/);
        assert.equal(await page.locator('#diagram [data-entity="AE"]').count(), 0);
        assert.equal(await page.locator("#diagram .curve").count(), 0);
        assert.equal(await page.locator("#next").innerText(), "End of text");
        assert.match(await page.locator("#reason h3").innerText(), /shorter reference/);
        await accessible(page, "I.3 invalid greater-lesser hypothesis", audits);
        await page.keyboard.press("Home");
        await page.keyboard.press("ArrowRight");
        assert.equal(await page.locator("#ratio").inputValue(), "21");
        assert.equal(await page.locator("#hypothesis-warning").isHidden(), true);
        await renderedEqualities(page, 3, 4);
        await page.locator("#flip").click();
        assert.match(page.url(), /side=-1/);
        await renderedEqualities(page, 3, 4);
        await page.locator("#reset").click();
        assert.equal(await page.locator("#ratio").inputValue(), "65");
        assert.equal(
          await page.locator("#reset").evaluate((b) => b === document.activeElement),
          true,
        );

        console.log(`  ${name}: source pages and hypothesis passed`);
        await page.locator("#share").click();
        const sharedUrl = await page.locator("#share-url").inputValue();
        assert.match(sharedUrl, /#p=3&s=4/);
        await page.locator("#copy-link").click();
        await page.waitForFunction(
          () => document.querySelector("#copy-status").textContent.length > 0,
        );
        await page.keyboard.press("Escape");
        await page.goto(sharedUrl);
        assert.equal(await page.locator("#step-position").innerText(), "Step 5 of 5");
        await renderedEqualities(page, 3, 4);

        await page.locator("#full-reading summary").click();
        assert.equal(await page.locator(".full-step").count(), 5);
        await accessible(page, "complete aligned passage", audits);
        await page.locator('.full-step-heading[data-step="1"]').click();
        assert.equal(await page.locator("#step-position").innerText(), "Step 2 of 5");
        await page.locator(".reason-link").click();
        assert.equal(await page.locator("#step-position").innerText(), "Step 11 of 11");
        assert.match(await page.locator("#book-label").innerText(), /Proposition 2/i);
        await page.goBack();
        assert.equal(await page.locator("#step-position").innerText(), "Step 2 of 5");
        await page.goForward();
        assert.equal(await page.locator("#step-position").innerText(), "Step 11 of 11");

        // The new lessons must do more than render text: inspect their actual SVG geometry.
        await openLesson(page, 4);
        await page.locator('#step-list [data-step="3"]').click();
        const renderedLength = async (id) =>
          page
            .locator(`#diagram [data-entity="${id}"]`)
            .evaluate((line) =>
              Math.hypot(
                +line.getAttribute("x2") - +line.getAttribute("x1"),
                +line.getAttribute("y2") - +line.getAttribute("y1"),
              ),
            );
        const originalBase = await renderedLength("BC");
        await page.locator("#motion").focus();
        for (let index = 0; index < 37; index++) await page.keyboard.press("ArrowRight");
        assert.equal(await page.locator("#motion").inputValue(), "37");
        assert.ok(Math.abs((await renderedLength("BC")) - originalBase) < 0.01);
        await page.keyboard.press("End");
        assert.equal(await page.locator("#motion").inputValue(), "100");
        assert.match(page.url(), /m=100/);
        const overlay = await page.evaluate(() => {
          const endpoints = (id) => {
            const line = document.querySelector(`#diagram [data-entity="${id}"]`);
            return ["x1", "y1", "x2", "y2"].map((key) => Number(line.getAttribute(key)));
          };
          return [endpoints("AB"), endpoints("DE"), endpoints("AC"), endpoints("DZ")];
        });
        assert.deepEqual(overlay[0], overlay[1]);
        assert.deepEqual(overlay[2], overlay[3]);
        await accessible(page, "I.4 exact superposition", audits);
        await openLesson(page, 5);
        await page.locator('#step-list [data-step="4"]').click();
        assert.match(
          await page.locator(".comparison-table caption").innerText(),
          /First comparison/,
        );
        await page.locator('button[data-trace="first"]').click();
        assert.equal(
          await page
            .locator("#diagram .figure-second")
            .evaluate((el) => getComputedStyle(el).visibility),
          "hidden",
        );
        await page.locator('button[data-trace="second"]').click();
        assert.equal(
          await page
            .locator("#diagram .figure-first")
            .evaluate((el) => getComputedStyle(el).visibility),
          "hidden",
        );
        await page.locator('button[data-trace="both"]').click();
        assert.ok(Math.abs((await renderedLength("ZC")) - (await renderedLength("HB"))) < 0.01);
        await page.locator('#step-list [data-step="7"]').click();
        assert.match(
          await page.locator(".comparison-table caption").innerText(),
          /Second comparison/,
        );
        assert.ok(Math.abs((await renderedLength("BZ")) - (await renderedLength("CH"))) < 0.01);
        await page.locator('#step-list [data-step="8"]').click();
        assert.match(await page.locator(".comparison-table").innerText(), /equal remainders/);
        await accessible(page, "I.5 angle subtraction", audits);
        if (viewport.width === 375) {
          await page.locator("#read-sentence").click();
          assert.equal(
            await page.locator("#step-title").evaluate((el) => el === document.activeElement),
            true,
          );
          await page.locator("#back-to-plate").click();
          assert.equal(
            await page.locator("#workbench").evaluate((el) => el === document.activeElement),
            true,
          );
        }
        await openLesson(page, 6);
        await page.locator('#step-list [data-step="4"]').click();
        assert.match(
          await page.locator("#diagram-notice").innerText(),
          /no Euclidean triangle satisfies both/,
        );
        assert.equal(await page.locator("#diagram [data-angle]").count(), 0);
        await accessible(page, "I.6 hypothetical sketch", audits);
        const [contradictionSheet] = await Promise.all([
          page.waitForEvent("download"),
          page.locator("#save-sheet").click(),
        ]);
        const contradictionPath = join(artifacts, `${name}-${viewport.width}-contradiction.html`);
        await contradictionSheet.saveAs(contradictionPath);
        assert.match(
          await readFile(contradictionPath, "utf8"),
          /no Euclidean triangle satisfies both/,
        );
        const [contradictionSvg] = await Promise.all([
          page.waitForEvent("download"),
          page.locator("#save-diagram").click(),
        ]);
        const contradictionSvgPath = join(artifacts, `${name}-${viewport.width}-contradiction.svg`);
        await contradictionSvg.saveAs(contradictionSvgPath);
        assert.match(await readFile(contradictionSvgPath, "utf8"), /Hypothetical sketch/);
        if (name === "chromium" && viewport.width === 1440) {
          await writeFile("examples/stoicheia-I6-study.html", await readFile(contradictionPath));
        }
        await page.locator('#step-list [data-step="5"]').click();
        assert.equal(await page.locator("#diagram-notice").isHidden(), true);
        assert.equal(await page.locator("#diagram [data-angle]").count(), 2);
        await openLesson(page, 2);
        await page.locator('#step-list [data-step="10"]').click();

        // Downloads are exercised as actual files, with networking disabled on reopen.
        const [sheet] = await Promise.all([
          page.waitForEvent("download"),
          page.locator("#save-sheet").click(),
        ]);
        const sheetPath = join(artifacts, `${name}-${viewport.width}-study.html`);
        await sheet.saveAs(sheetPath);
        if (name === "chromium" && viewport.width === 1440) {
          await writeFile("examples/stoicheia-I2-study.html", await readFile(sheetPath));
        }
        const [svg] = await Promise.all([
          page.waitForEvent("download"),
          page.locator("#save-diagram").click(),
        ]);
        const svgPath = join(artifacts, `${name}-${viewport.width}-diagram.svg`);
        await svg.saveAs(svgPath);
        assert.match(await readFile(sheetPath, "utf8"), /ΑΛ = ΒΗ/);
        assert.match(await readFile(svgPath, "utf8"), /<desc/);

        console.log(`  ${name}: exports saved; disconnecting origin`);
        originAvailable = false;
        await assert.rejects(fetch(browserUrl));
        await context.setOffline(true);
        const offlineResponse = await page.reload();
        assert.equal(offlineResponse.fromServiceWorker(), true);
        assert.equal(await page.locator("#step-position").innerText(), "Step 11 of 11");
        await page.locator("#current-passage [data-source]").first().click();
        await page.waitForFunction(() => {
          const image = document.querySelector("#source-image");
          return image.complete && image.naturalWidth > 0;
        });
        await page.keyboard.press("Escape");
        await openLesson(page, 1);
        await page.locator('#step-list [data-step="3"]').click();
        await renderedEqualities(page, 1, 3);
        await noOverflow(page);
        if (name === "chromium") {
          if (viewport.width === 1440) {
            await page.screenshot({ path: "docs/assets/first-construction.png", fullPage: true });
            await openLesson(page, 2);
            await page.locator('#step-list [data-step="8"]').click();
            await page.screenshot({ path: "docs/assets/length-transfer.png", fullPage: true });
            await page.locator(".workbench").screenshot({ path: "docs/assets/hero.png" });
          } else {
            await page
              .locator("#workbench")
              .evaluate((el) => el.scrollIntoView({ block: "start" }));
            await page.screenshot({ path: "docs/assets/phone-plate.png" });
            await openLesson(page, 2);
            await page.locator('#step-list [data-step="8"]').click();
            await page.locator(".reader").evaluate((el) => el.scrollIntoView({ block: "start" }));
            await page.screenshot({ path: "docs/assets/phone-passage.png" });
          }
        }
        await openLesson(page, 5);
        await page.locator('#step-list [data-step="8"]').click();
        await page.locator('#reason [data-foundation="cn3"]').click();
        assert.match(await page.locator("#foundation-content").innerText(), /subtrahuntur/);
        await page.keyboard.press("Escape");
        assert.match(
          await page.locator(".comparison-table caption").innerText(),
          /Subtract equal parts/,
        );
        await page.locator('#current-passage [data-source="22"]').click();
        await page.waitForFunction(() => {
          const img = document.querySelector("#source-image");
          return img.complete && img.naturalWidth > 0;
        });
        await page.keyboard.press("Escape");
        if (name === "chromium") {
          await page.locator("#workbench").evaluate((el) => el.scrollIntoView({ block: "start" }));
          await page.screenshot({
            path: `docs/assets/isosceles-${viewport.width}.png`,
            fullPage: viewport.width === 1440,
          });
          await openLesson(page, 6);
          await page.locator('#step-list [data-step="4"]').click();
          await page.locator("#workbench").evaluate((el) => el.scrollIntoView({ block: "start" }));
          await page.screenshot({
            path: `docs/assets/contradiction-${viewport.width}.png`,
            fullPage: viewport.width === 1440,
          });
          await openLesson(page, 4);
          await page.locator('#step-list [data-step="3"]').click();
          await page.locator("#motion").focus();
          await page.keyboard.press("Home");
          await page.locator("#workbench").evaluate((el) => el.scrollIntoView({ block: "start" }));
          await page.screenshot({
            path: `docs/assets/superposition-${viewport.width}.png`,
            fullPage: viewport.width === 1440,
          });
        }
        console.log(`  ${name}: offline reader passed; reopening exports`);
        const saved = await context.newPage();
        await saved.goto(pathToFileURL(sheetPath).href);
        assert.equal(await saved.locator(".lesson-passage").count(), 11);
        assert.equal(await saved.locator("script").count(), 0);
        assert.ok((await saved.locator("[lang=grc]").count()) >= 11);
        await noOverflow(saved);
        await accessible(saved, "standalone study sheet", audits);
        await saved.goto(pathToFileURL(contradictionPath).href);
        assert.equal(await saved.locator(".lesson-passage").count(), 7);
        assert.match(
          await saved.locator("aside").innerText(),
          /no Euclidean triangle satisfies both/,
        );
        await noOverflow(saved);
        await accessible(saved, "standalone contradiction study sheet", audits);
        await saved.goto(pathToFileURL(contradictionSvgPath).href);
        assert.match(await saved.locator(".plate-notice").textContent(), /Hypothetical sketch/);
        await saved.goto(pathToFileURL(svgPath).href);
        assert.equal(await saved.locator("svg").count(), 1);
        await saved.close();
        result.offline =
          "Offline emulation plus unavailable origin: worker-served reload, proposition changes, source scan and standalone exports passed";

        cspViolations.push(...(await page.evaluate(() => window.__policyViolations)));
        assert.deepEqual(errors, []);
        assert.deepEqual(externalRequests, []);
        assert.deepEqual(cspViolations, []);
        result.pageErrors = errors.length;
        result.externalRequests = externalRequests.length;
        result.cspViolations = cspViolations.length;
        report.configurations.push(result);
        await context.close();
        originAvailable = true;
      }
    } finally {
      await browser.close();
    }
  }

  // This uses HTTP responses, independently of the page/service-worker cache.
  const files = await filesIn("dist");
  const matches = [];
  for (const file of files) {
    const address = new URL(relative("dist", file).split("\\").join("/"), url);
    const response = await fetch(address);
    assert.equal(response.status, 200);
    assert.equal(
      sha256(await response.bytes()),
      sha256(await readFile(file)),
      `Served bytes: ${file}`,
    );
    matches.push(relative("dist", file));
  }
  const inputFiles = [
    ...(await filesIn("src")),
    ...(await filesIn("public")),
    "index.html",
    "vite.config.ts",
    "tsconfig.json",
    "package.json",
    "package-lock.json",
  ].sort();
  const inputHash = createHash("sha256");
  for (const file of inputFiles) {
    inputHash.update(file);
    inputHash.update(await readFile(file));
  }
  report.buildInputsSha256 = inputHash.digest("hex");
  report.servedByteMatches = matches.sort();
  report.offlineOriginProbeRejections = rejectedConnections;
  await writeFile("docs/browser-verification.json", `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  gate.closeAllConnections();
  await new Promise((resolve) => gate.close(resolve));
  await rm(artifacts, { recursive: true, force: true });
}
