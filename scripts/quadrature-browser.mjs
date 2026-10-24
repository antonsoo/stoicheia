// biome-ignore-all lint/performance/useDomNodeTextContent: Inspect the visible learning workflow.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/stoicheia-quadrature-browser"),
  external = process.argv[3];
const production = !external || process.argv[4] === "--hosted";
await mkdir(out, { recursive: true });
const digest = (b) => createHash("sha256").update(b).digest("hex");
const report = {
  checkedAt: new Date().toISOString(),
  mode: external ? (production ? "hosted" : "development") : "local production",
  base: external ?? "local review server",
  workerSha256: digest(await readFile("dist/sw.js")),
  configurations: [],
};
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
};
async function serve() {
  let online = true;
  const server = createServer(async (req, res) => {
    if (!online) {
      req.socket.destroy();
      return;
    }
    try {
      const u = new URL(req.url, "http://local"),
        f = decodeURIComponent(u.pathname).replace(/^\/stoicheia\//, "") || "index.html";
      assert(u.pathname.startsWith("/stoicheia/") && !f.includes(".."));
      res
        .writeHead(200, {
          "Content-Type": mime[path.extname(f)] ?? "application/octet-stream",
          "Cache-Control": "no-store",
        })
        .end(await readFile(path.join("dist", f)));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    base: `http://127.0.0.1:${server.address().port}/stoicheia/`,
    offline: () => {
      online = false;
    },
    close: async () => {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    },
  };
}
async function download(page, id, file) {
  const pending = page.waitForEvent("download");
  await page.locator(id).click();
  await (await pending).saveAs(file);
  return readFile(file);
}
async function overflow(page) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "horizontal page overflow",
  );
}
async function picture(page, id, file) {
  await page.locator(id).scrollIntoViewIfNeeded();
  await page.screenshot({ path: file });
}
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const server = await serve(),
        base = external ?? server.base,
        folder = path.join(out, `${name}-${width}`);
      await mkdir(folder, { recursive: true });
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      });
      context.setDefaultTimeout(20000);
      try {
        const page = await context.newPage(),
          errors = [],
          requests = [],
          csp = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("request", (r) => {
          if (/^https?:/.test(r.url()) && !r.url().startsWith(base)) requests.push(r.url());
        });
        await page.exposeFunction("recordCsp", (directive) => csp.push(directive));
        await page.addInitScript(() =>
          document.addEventListener("securitypolicyviolation", (e) =>
            window.recordCsp(e.violatedDirective),
          ),
        );
        await page.goto(`${base}quadrature.html`);
        await page.evaluate(() => document.fonts.ready);
        await overflow(page);
        assert.match(await page.locator("#qa-result").innerText(), /Same area: 36 u²/);
        const initialTable = await page.locator("#qa-table tbody").innerText();
        assert.match(initialTable, /42.25/);
        assert.match(initialTable, /24 u/);
        await page.locator('[data-qa-stage="5"]').click();
        assert.equal(await page.locator(".qa-constructed-square").count(), 1);
        const square = await page
          .locator(".qa-constructed-square")
          .evaluate((e) => [Number(e.getAttribute("width")), Number(e.getAttribute("height"))]);
        assert.equal(square[0], square[1]);
        await picture(page, "#qa-workshop", path.join(folder, "completed-square.png"));
        await page.locator('[data-qa-stage="4"]').click();
        await picture(page, "#qa-workshop", path.join(folder, "workshop.png"));
        await page.locator("#qa-lock").check();
        await page.locator("#qa-range-a").focus();
        await page.keyboard.press("ArrowRight");
        assert.equal(await page.locator("#qa-a").inputValue(), "9.1");
        assert.equal(await page.locator("#qa-b").inputValue(), "3.9");
        await page.locator("#qa-a").fill("11");
        await page.locator("#qa-a").press("Tab");
        assert.equal(await page.locator("#qa-b").inputValue(), "2");
        assert.match(await page.locator("#qa-result").innerText(), /Same area: 22 u²/);
        await page.locator("#qa-a").fill("12.5");
        await page.locator("#qa-a").press("Tab");
        assert.equal(await page.locator("#qa-a").getAttribute("aria-invalid"), "true");
        assert.match(await page.locator("#qa-result").innerText(), /Same area: 22 u²/);
        await page.locator('[data-qa-preset="65,65"]').click();
        assert.match(await page.locator("#qa-result").innerText(), /Already a square/);
        assert.equal(await page.locator("#qa-construction .qa-circle").count(), 0);
        assert.equal(await page.locator('[data-qa-stage="4"]').isDisabled(), true);
        await page.locator('[data-qa-preset="90,40"]').click();
        await page.locator("#qa-lock").uncheck();
        await page.locator("#qa-a").fill("4");
        await page.locator("#qa-a").press("Tab");
        await page.locator("#qa-b").fill("9");
        await page.locator("#qa-b").press("Tab");
        assert.match(await page.locator("#qa-orientation").innerText(), /Side 2 is longer/);
        assert.match(await page.locator("#qa-result").innerText(), /Same area: 36 u²/);
        await page.locator('[data-qa-preset="90,40"]').click();
        await page.locator("#qa-fold").focus();
        await page.keyboard.press("Enter");
        assert.equal(await page.locator("#qa-move").inputValue(), "100");
        await picture(page, "#qa-rearrange", path.join(folder, "pieces.png"));
        const before = await page.locator("#qa-pieces .qa-piece-two").getAttribute("points");
        await page.locator("#qa-move").focus();
        await page.keyboard.press("ArrowLeft");
        assert.notEqual(
          await page.locator("#qa-pieces .qa-piece-two").getAttribute("points"),
          before,
        );
        await page.locator("#qa-fold").click();
        await page.locator("#qa-cancel").click();
        assert.match(await page.locator("#qa-proof-note").innerText(), /Remove 6.25 u²/);
        await page.goBack();
        assert.equal(await page.locator("#qa-cancel").getAttribute("aria-pressed"), "false");
        await page.locator("#qa-cancel").click();
        await page.locator("#qa-read-subtract").click();
        assert.match(
          await page.locator('#qa-passage-text [lang="grc"]').first().innerText(),
          /^κοινὸν ἀφῃρήσθω/,
        );
        assert.equal(await page.locator("#qa-passage").inputValue(), "8");
        const sharedState = page.url();
        await page.getByRole("link", { name: "Printed evidence", exact: true }).click();
        assert.equal(page.url(), sharedState, "Section navigation replaced the experiment hash");
        await page.locator("#qa-source-page").selectOption("163");
        await page.locator("#qa-source-image").scrollIntoViewIfNeeded();
        await page.waitForFunction(() => {
          const i = document.querySelector("#qa-source-image");
          return i.complete && i.naturalWidth > 0 && i.currentSrc === i.src;
        });
        await page.locator("#qa-zoom").click();
        const pan = page.locator("#qa-scan-scroll");
        await pan.focus();
        await page.keyboard.press("End");
        assert(await pan.evaluate((e) => e.scrollWidth > e.clientWidth));
        await page.locator("#qa-zoom").click();
        await picture(page, "#qa-sources", path.join(folder, "source.png"));
        await page.locator('#qa-question-options input[value="0"]').check();
        await page.getByRole("button", { name: "Check the reading", exact: true }).click();
        assert.match(await page.locator("#qa-feedback").innerText(), /^Yes/);
        await page.locator("#qa-question-next").click();
        await page.locator('#qa-question-options input[value="1"]').check();
        await page.getByRole("button", { name: "Check the reading", exact: true }).click();
        assert.match(await page.locator("#qa-feedback").innerText(), /^Yes/);
        await page.locator('[data-qa-stage="5"]').click();
        await page.locator("#qa-share").click();
        const share = await page.locator("#qa-share-url").inputValue();
        assert.match(share, /#a=90&b=40&s=5&m=100&c=1&k=0&r=8/);
        const csv = await download(page, "#qa-save-csv", path.join(folder, "measurements.csv"));
        await download(page, "#qa-save-svg", path.join(folder, "construction.svg"));
        const vector = await context.newPage();
        await vector.goto(pathToFileURL(path.join(folder, "construction.svg")).href);
        assert.equal(await vector.locator("parsererror").count(), 0);
        assert.equal(await vector.locator("svg .qa-constructed-square").count(), 1);
        await vector.close();
        const reading = await download(page, "#qa-save-study", path.join(folder, "reading.html"));
        assert(reading.length < 5000000, "Study exceeds repository's per-file size budget");
        const saved = await context.newPage(),
          savedRequests = [];
        saved.on("request", (r) => {
          if (/^https?:/.test(r.url())) savedRequests.push(r.url());
        });
        await saved.goto(pathToFileURL(path.join(folder, "reading.html")).href);
        await saved.evaluate(() => document.fonts.ready);
        await saved.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
        await overflow(saved);
        const images = await saved.evaluate(async () =>
          Promise.all(
            [...document.images].map(async (image) => {
              const bytes = Uint8Array.from(atob(image.src.split(",")[1]), (c) => c.charCodeAt(0));
              const hash = await crypto.subtle.digest("SHA-256", bytes);
              return {
                width: image.naturalWidth,
                hash: Array.from(new Uint8Array(hash), (v) => v.toString(16).padStart(2, "0")).join(
                  "",
                ),
              };
            }),
          ),
        );
        const manifest = JSON.parse(await readFile("public/sources/manifest.json", "utf8"));
        assert.deepEqual(
          images.map((i) => i.hash),
          [160, 161, 162, 163, 128, 129, 110, 111].map(
            (p) => manifest.pages.find((e) => e.printed_page === p).sha256,
          ),
        );
        assert(images.every((i) => i.width > 1000));
        assert.deepEqual(savedRequests, []);
        assert.equal(await saved.locator(".qa-full-passage").count(), 11);
        const embedded = await download(saved, "a[download]", path.join(folder, "embedded.csv"));
        assert.equal(digest(embedded), digest(csv));
        if (name === "chromium" && width === 1440)
          await saved.pdf({
            path: path.join(folder, "reading.pdf"),
            format: "A4",
            printBackground: true,
          });
        await saved.screenshot({ path: path.join(folder, "saved.png") });
        await saved.close();
        const axe = await new AxeBuilder({ page }).analyze();
        assert.deepEqual(
          axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
          [],
        );
        const offlineRooms = [];
        if (production) {
          await page.waitForFunction(
            () => document.querySelector("#qa-offline").textContent.includes("ready offline"),
            null,
            { timeout: 60000 },
          );
          if (!external) server.offline();
          await context.setOffline(true);
          for (const room of ["index.html", "triangle.html", "quadrature.html"]) {
            await page.goto(base + room);
            assert((await page.locator("h1").innerText()).length > 5);
            await overflow(page);
            offlineRooms.push(room);
          }
          await page.locator('[data-qa-preset="110,20"]').click();
          await download(page, "#qa-save-study", path.join(folder, "offline-reading.html"));
        }
        assert.deepEqual(errors, []);
        assert.deepEqual(requests, []);
        assert.deepEqual(csp, []);
        report.configurations.push({
          engine: name,
          version: browser.version(),
          width,
          lockedPerimeter: true,
          invalidComplementRejected: true,
          squareBranch: true,
          swappedInputs: true,
          rigidMoveKeyboard: true,
          commonSquareSubtracted: true,
          historyRestored: true,
          sectionNavigationPreservesState: true,
          sourceZoom: true,
          passageQuestions: true,
          readingBytes: reading.length,
          sourceImages: images,
          embeddedCsvMatches: true,
          offlineRooms,
          offlineMethod: production
            ? external
              ? "Browser context offline mode; public origin not controlled"
              : "Local origin physically disabled plus browser context offline mode"
            : "Not tested in development",
          standaloneSvgOpened: true,
          axeViolations: axe.violations.length,
          pageErrors: errors,
          externalRequests: requests,
          csp,
        });
        await writeFile(path.join(out, "browser.json"), `${JSON.stringify(report, null, 2)}\n`);
        console.log(
          `${name} ${width}: construction, reading, downloads and ${offlineRooms.length} offline rooms`,
        );
      } finally {
        await context.close();
        await server.close();
      }
    }
  } finally {
    await browser.close();
  }
}
