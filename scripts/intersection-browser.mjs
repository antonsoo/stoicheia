// biome-ignore-all lint/performance/useDomNodeTextContent: Verify what learners can actually read.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";
import { openLesson } from "./navigation.mjs";

const upstream = process.argv[2] ?? "http://127.0.0.1:4327/stoicheia/";
const output = resolve(process.argv[3] ?? join(tmpdir(), "stoicheia-intersection-review"));
await mkdir(output, { recursive: true });
let holdSource = false,
  sourceStarted = () => {},
  releaseSource = () => {};
let online = true,
  tamper = false,
  rejected = 0;
const gate = createServer(async (req, res) => {
  if (!online) {
    rejected++;
    req.socket.destroy();
    return;
  }
  try {
    const r = await fetch(new URL(req.url, upstream));
    const bytes = Buffer.from(await r.arrayBuffer());
    if (holdSource && req.url.endsWith("heiberg-012.jpg")) {
      sourceStarted();
      await new Promise((resolve) => {
        releaseSource = resolve;
        setTimeout(resolve, 15000).unref();
      });
    }
    if (tamper && req.url.endsWith("heiberg-012.jpg")) bytes[0] ^= 1;
    res.writeHead(r.status, {
      "Content-Type": r.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(bytes);
  } catch {
    req.socket.destroy();
  }
});
await new Promise((r) => gate.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${gate.address().port}/stoicheia/`;
const report = {
  scope: "Local production build; no public deployment",
  configurations: [],
  sourceFailure: null,
};
const hash = (b) => createHash("sha256").update(b).digest("hex");
async function visible(page, selector, expected) {
  await page.waitForFunction(
    ({ selector, expected }) => document.querySelector(selector)?.textContent.includes(expected),
    { selector, expected },
  );
}
async function audit(page, label) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  assert.deepEqual(
    violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
    [],
    label,
  );
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    `Overflow: ${label}`,
  );
}
async function download(page, selector, name) {
  const pending = page.waitForEvent("download");
  await page.locator(selector).click();
  const d = await pending;
  const file = join(output, name ?? d.suggestedFilename());
  await d.saveAs(file);
  return file;
}
try {
  for (const [engineName, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
  ]) {
    const browser = await engine.launch();
    try {
      for (const width of [1440, 375]) {
        online = true;
        const label = `${engineName}-${width}`;
        const context = await browser.newContext({
          viewport: { width, height: 950 },
          acceptDownloads: true,
        });
        const page = await context.newPage(),
          errors = [],
          externals = [];
        page.on("pageerror", (e) => errors.push(String(e)));
        page.on("request", (r) => {
          if (/^https?:/.test(r.url()) && !r.url().startsWith(url)) externals.push(r.url());
        });
        await page.addInitScript(() => {
          window.policyErrors = [];
          addEventListener("securitypolicyviolation", (e) =>
            window.policyErrors.push(e.violatedDirective),
          );
        });
        await page.goto(`${url}#p=1&s=3`);
        const geometry = await page.locator("#diagram").boundingBox();
        assert.ok(
          geometry && geometry.y < 800,
          `Opening geometry is below the viewport: ${JSON.stringify(geometry)}`,
        );
        await page.locator("#lesson-select").selectOption("23");
        await visible(page, "#book-label", "Proposition 23");
        await page.locator("#course-contents > summary").focus();
        await page.keyboard.press("Enter");
        await page.locator('.course-contents [data-lesson="1"]').click();
        assert.equal(await page.locator("#course-contents").evaluate((e) => e.open), false);
        assert.equal(
          await page.locator("#step-title").evaluate((e) => e === document.activeElement),
          true,
        );
        await page.locator('#step-list [data-step="3"]').click();
        await page.locator("#companion-workshops > summary").focus();
        await page.keyboard.press("Enter");
        assert.equal(
          await page.locator('#companion-workshops a[href="./areas.html"]').isVisible(),
          true,
        );
        await page.keyboard.press("Enter");
        await page.locator("#investigate-intersection").focus();
        await page.keyboard.press("Enter");
        assert.equal(
          await page.locator("#intersection-title").evaluate((e) => e === document.activeElement),
          true,
        );
        await visible(page, "#intersection-verdict", "numbers agree");
        assert.match(
          await page.locator('[data-exact="coordinates"]').innerText(),
          /120\/241, 209\/241/,
        );
        await visible(page, '[data-exact="residual"]', "1/241");
        await audit(page, `${label} opening experiment`);
        await page.locator("#intersection-bench").scrollIntoViewIfNeeded();
        await page
          .locator("#intersection-bench")
          .screenshot({ path: join(output, `${label}.png`) });
        await page.locator("#intersection-places").selectOption("4");
        await visible(page, "#intersection-second", "1.0021");
        await visible(page, "#intersection-verdict", "numbers differ");
        await page.locator("#intersection-trial").selectOption("6");
        await visible(page, "#intersection-second", "1.0000");
        await visible(page, "#intersection-verdict", "numbers agree");
        await visible(page, '[data-exact="residual"]', "-1/12545");
        await page.locator("#intersection-places").selectOption("6");
        await visible(page, "#intersection-second", "0.999960");
        await page.locator("#intersection-real").check();
        await visible(page, "#intersection-real-note", "±√3/2");
        await page.locator("#intersection-real").uncheck();
        await page.locator("#intersection-trial").selectOption("custom");
        await page.locator("#intersection-m").fill("564719");
        await page.locator("#intersection-n").fill("978122");
        await page.locator("#intersection-form button").click();
        await visible(page, "#intersection-second", "1.000000");
        await visible(page, "#intersection-verdict", "nonzero");
        const prior = await page.locator('[data-exact="residual"]').innerText();
        await page.locator("#intersection-n").fill("0");
        await page.locator("#intersection-form button").click();
        await visible(page, "#intersection-error", "1 to 1,000,000");
        assert.equal(await page.locator('[data-exact="residual"]').innerText(), prior);
        await page.locator("#intersection-n").fill("978122");
        await page.locator("#intersection-form button").click();
        await page.locator("#intersection-share").click();
        const shared = await page.locator("#share-url").inputValue();
        assert.match(shared, /intersection=1/);
        assert.match(shared, /im=564719/);
        await page.locator('[data-close="share-dialog"]').click();
        await page.reload();
        assert.equal(await page.locator("#intersection-m").inputValue(), "564719");
        assert.equal(await page.locator("#intersection-n").inputValue(), "978122");
        assert.equal(await page.locator("#intersection-places").inputValue(), "6");
        await openLesson(page, 2);
        assert.equal(await page.locator("#intersection-root").isVisible(), false);
        await page.goBack();
        await page.waitForSelector("#intersection-bench:visible");
        assert.equal(await page.locator("#intersection-m").inputValue(), "564719");
        // Both original-language sources use the existing verified source viewer.
        const readings = page.locator(".intersection-explanation details").nth(1);
        await readings.locator("summary").click();
        await readings.locator('[data-gloss="intersect"]').first().click();
        await visible(page, "#gloss-content", "present active");
        await page.locator('[data-close="vocabulary-dialog"]').first().click();
        await readings.locator('[data-gloss="intersect"]').last().click();
        await visible(page, "#gloss-content", "seco");
        await page.locator('[data-close="vocabulary-dialog"]').first().click();
        await readings.locator('[data-source="12"]').click();
        await page.waitForFunction(
          () =>
            document.querySelector("#source-image")?.complete &&
            !document.querySelector("#source-image")?.hidden,
        );
        assert.equal(await page.locator("#source-title").innerText(), "Printed page 12");
        await page.locator('[data-close="source-dialog"]').click();
        await readings.locator('[data-source="9"]').click();
        await visible(page, "#source-title", "Printed page 9");
        await page.waitForFunction(
          () =>
            document.querySelector("#source-image")?.complete &&
            !document.querySelector("#source-image")?.hidden,
        );
        await page.locator('[data-close="source-dialog"]').click();
        await readings.locator("summary").click();
        const csvFile = await download(page, "#intersection-csv", `${label}.csv`);
        const csv = await readFile(csvFile, "utf8");
        assert.match(csv, /BP_rounded,1.000000,approximate/);
        assert.match(csv, /BP_squared_minus_1,-?\d+\/\d+,signed/);
        await page.waitForFunction(
          () =>
            document
              .querySelector("#offline-state")
              ?.textContent.startsWith("Edition ready offline"),
          null,
          { timeout: 120000 },
        );
        online = false;
        await context.setOffline(true);
        await page.reload();
        await visible(page, "#intersection-second", "1.000000");
        assert.ok(await page.evaluate(() => !!navigator.serviceWorker.controller));
        const savedFile = await download(page, "#intersection-save", `${label}.html`);
        const savedText = await readFile(savedFile, "utf8");
        assert.match(savedText, /564719\/978122/);
        assert.match(savedText, /nonzero/);
        assert.equal((savedText.match(/data-source-page=/g) ?? []).length, 10);
        assert.doesNotMatch(savedText, /<script|<link/);
        const savedPage = await context.newPage(),
          requests = [];
        savedPage.on("request", (r) => {
          if (/^https?:/.test(r.url())) requests.push(r.url());
        });
        await savedPage.goto(pathToFileURL(savedFile).href);
        await savedPage.locator(".intersection-saved").scrollIntoViewIfNeeded();
        assert.equal(await savedPage.locator(".intersection-saved svg").count(), 1);
        assert.equal(
          await savedPage.evaluate(() =>
            [...document.images].every((i) => i.complete && i.naturalWidth > 0),
          ),
          true,
        );
        assert.deepEqual(requests, []);
        await audit(savedPage, `${label} independent reading`);
        await savedPage.close();
        await page.locator("#intersection-next").click();
        await visible(page, '[data-exact="residual"]', "-1/5");
        await page.locator("#intersection-close").click();
        assert.equal(
          await page.locator("#intersection-open").evaluate((e) => e === document.activeElement),
          true,
        );
        await page.locator("#intersection-open").click();
        await page.locator("#intersection-trial").selectOption("3");
        await audit(page, `${label} offline experiment`);
        await openLesson(page, 2);
        const ordinaryFile = await download(page, "#save-sheet", `${label}-I2.html`);
        const ordinary = await readFile(ordinaryFile, "utf8");
        assert.doesNotMatch(ordinary, /<section class="intersection-saved">/);
        assert.match(ordinary, /Stoicheia I.2/);

        assert.deepEqual(errors, []);
        assert.deepEqual(externals, []);
        assert.deepEqual(await page.evaluate(() => window.policyErrors), []);
        report.configurations.push({
          engine: engineName,
          width,
          keyboard: true,
          openingGeometryTop: geometry.y,
          compactContentsAndWorkshopMenu: true,
          exactVsRounded: true,
          customAndInvalid: true,
          shareAndReturn: true,
          greekAndLatinScans: true,
          offlineWithDeadOrigin: true,
          nativeCsv: true,
          ordinaryCourseReadingWithoutExperiment: true,
          independentReading: {
            bytes: Buffer.byteLength(savedText),
            sha256: hash(savedText),
            pages: 10,
            externalRequests: 0,
          },
          accessibility: "no violations in live and independent readings",
          pageErrors: 0,
          cspViolations: 0,
        });
        await context.close();
        online = true;
      }
      if (engineName === "chromium") {
        const context = await browser.newContext({ serviceWorkers: "block" });
        const page = await context.newPage();
        tamper = true;
        await page.goto(`${url}#p=1&s=3&intersection=1`);
        const pending = page.waitForEvent("download", { timeout: 2000 }).catch(() => null);
        await page.locator("#intersection-save").click();
        await visible(page, "#intersection-save-status", "does not match this edition");
        assert.equal(await pending, null);
        assert.equal(await page.locator("#intersection-save").isEnabled(), true);
        tamper = false;
        const file = await download(page, "#intersection-save", "recovered.html");
        assert.match(await readFile(file, "utf8"), /120\/241/);
        report.sourceFailure =
          "Substituted source bytes prevent export; retry after recovery saves the complete reading";
        await context.close();
        // Freeze the request, then alter the live candidate while its reading loads.
        const snapshotContext = await browser.newContext({ serviceWorkers: "block" });
        const snapshotPage = await snapshotContext.newPage();
        await snapshotPage.goto(`${url}#p=1&s=3&intersection=1`);
        await download(snapshotPage, "#intersection-csv", "initial.csv");
        const started = new Promise((resolve) => {
          sourceStarted = resolve;
        });
        holdSource = true;
        const pendingSnapshot = snapshotPage.waitForEvent("download");
        await snapshotPage.locator("#intersection-save").click();
        await Promise.race([
          started,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Source request did not start")), 15000).unref(),
          ),
        ]);
        assert.equal(await snapshotPage.locator("#save-sheet").isDisabled(), true);
        assert.equal(await snapshotPage.locator("#intersection-save").isDisabled(), true);
        await snapshotPage.locator("#intersection-trial").selectOption("6");
        holdSource = false;
        releaseSource();
        const snapshotDownload = await pendingSnapshot;
        const snapshotFile = join(output, "frozen-reading.html");
        await snapshotDownload.saveAs(snapshotFile);
        const snapshot = await readFile(snapshotFile, "utf8");
        assert.match(snapshot, /m\/n = 11\/19/);
        assert.doesNotMatch(snapshot, /m\/n = 56\/97/);
        assert.equal(await snapshotPage.locator("#intersection-m").inputValue(), "56");
        report.snapshot =
          "A delayed source keeps the starting candidate in the saved reading while the live controls change";
        await snapshotContext.close();
      }
    } finally {
      await browser.close();
    }
  }
  report.rejectedOriginConnections = rejected;
  const files = await readdir(output);
  report.artifacts = await Promise.all(
    files
      .filter((f) => /\.(csv|html)$/.test(f))
      .map(async (file) => {
        const bytes = await readFile(join(output, file));
        return { file, bytes: bytes.length, sha256: hash(bytes) };
      }),
  );
  await writeFile(join(output, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  online = true;
  await new Promise((r) => gate.close(r));
}
