// biome-ignore-all lint/performance/useDomNodeTextContent: Inspect visible learner-facing results.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/stoicheia-gnomon-browser"),
  external = process.argv[3];
const production = !external || process.argv[4] === "--hosted";
await mkdir(out, { recursive: true });
const digest = (b) => createHash("sha256").update(b).digest("hex");
const report = {
  checkedAt: new Date().toISOString(),
  mode: external ? (production ? "hosted" : "development") : "local production",
  workerSha256: digest(await readFile("dist/sw.js")),
  configurations: [],
};
async function serve() {
  let online = true;
  const server = createServer(async (req, res) => {
    if (!online) {
      req.socket.destroy();
      return;
    }
    try {
      const file =
        new URL(req.url, "http://local").pathname.replace(/^\/stoicheia\//, "") || "index.html";
      assert(!file.includes(".."));
      res
        .writeHead(200, {
          "Content-Type":
            {
              ".html": "text/html",
              ".js": "text/javascript",
              ".css": "text/css",
              ".svg": "image/svg+xml",
              ".jpg": "image/jpeg",
              ".json": "application/json",
              ".ttf": "font/ttf",
            }[path.extname(file)] ?? "application/octet-stream",
          "Cache-Control": "no-store",
        })
        .end(await readFile(path.join("dist", file)));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    base: `http://127.0.0.1:${server.address().port}/stoicheia/`,
    offline: () => {
      online = false;
      server.closeAllConnections();
    },
    close: async () => {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    },
  };
}
async function save(page, selector, file) {
  const pending = page.waitForEvent("download");
  await page.locator(selector).click();
  await (await pending).saveAs(file);
  return readFile(file);
}
async function overflow(page) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "page overflow",
  );
}
async function renderedAreas(page, container, selectors) {
  return page.locator(container).evaluate((root, names) => {
    const area = (selector) => {
      const p = [...root.querySelector(selector).points].map((p) => [p.x, p.y]);
      return (
        Math.abs(
          p.reduce((sum, a, i) => {
            const b = p[(i + 1) % p.length];
            return sum + a[0] * b[1] - a[1] * b[0];
          }, 0),
        ) / 2
      );
    };
    const whole = area(".gn-outline");
    return names.map((name) => area(name) / whole);
  }, selectors);
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
      context.setDefaultTimeout(25000);
      try {
        const page = await context.newPage(),
          errors = [],
          consoleErrors = [],
          requests = [],
          workers = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("console", (m) => {
          if (m.type() === "error") consoleErrors.push(m.text());
        });
        page.on("request", (r) => {
          if (/^https?:/.test(r.url()) && !r.url().startsWith(base)) requests.push(r.url());
          if (r.url().endsWith("/sw.js")) workers.push(r.url());
        });
        await page.goto(`${base}gnomon.html`);
        await page.evaluate(() => document.fonts.ready);
        await overflow(page);
        assert.match(await page.locator("#gn-complement-status").innerText(), /13.65 u²/);
        for (const area of await renderedAreas(page, "#gn-complement-drawing", [
          ".gn-complement-a",
          ".gn-complement-b",
        ]))
          assert(Math.abs(area - 13.65 / 60) < 1e-5);
        await page
          .locator("#gn-complements")
          .screenshot({ path: path.join(folder, "complements.png") });
        await page.locator("#gn-u").focus();
        await page.keyboard.press("ArrowRight");
        assert.equal(await page.locator("#gn-v").inputValue(), "36");
        await page.locator("#gn-break").focus();
        await page.keyboard.press("Enter");
        assert.match(await page.locator("#gn-complement-status").innerText(), /7.35 u².*25.35 u²/s);
        assert.match(
          await page.locator("#gn-complement-note").innerText(),
          /small triangle pairs remain equal/,
        );
        assert.equal(await page.locator('[data-gn-step="3"]').isDisabled(), true);
        const brokenUrl = page.url();
        const brokenAreas = await renderedAreas(page, "#gn-complement-drawing", [
          ".gn-complement-a",
          ".gn-complement-b",
        ]);
        assert(Math.abs(brokenAreas[0] - 7.35 / 60) < 1e-5);
        assert(Math.abs(brokenAreas[1] - 25.35 / 60) < 1e-5);
        await page
          .locator("#gn-complements")
          .screenshot({ path: path.join(folder, "off-diagonal.png") });
        await page.locator("#gn-shear").focus();
        await page.keyboard.press("End");
        assert.match(await page.locator("#gn-complement-status").innerText(), /7.35 u².*25.35 u²/s);
        await page.locator("#gn-restore").click();
        assert.match(await page.locator("#gn-complement-status").innerText(), /13.65 u²/);
        await page.goBack();
        assert.equal(await page.locator("#gn-diagonal").isChecked(), false);
        await page.locator("#gn-restore").click();
        for (let i = 0; i < 4; i++) await page.locator(`[data-gn-step="${i}"]`).click();
        assert.equal(await page.locator(".gn-removed").count(), 4);
        await page.locator("#gn-read-complements").click();
        assert.match(await page.locator('#gn-passage-text [lang="grc"]').innerText(), /λοιπὸν/);
        await page.locator("#gn-a").fill("11");
        await page.locator("#gn-a").press("Tab");
        await page.locator("#gn-b").fill("2");
        await page.locator("#gn-b").press("Tab");
        assert.match(await page.locator("#gn-gnomon-status").innerText(), /22 \+ 20.25 = 42.25/);
        await page.locator("#gn-a").fill("1.05");
        await page.locator("#gn-a").press("Tab");
        assert.equal(await page.locator("#gn-a").getAttribute("aria-invalid"), "true");
        assert.match(await page.locator("#gn-gnomon-status").innerText(), /22 \+ 20.25/);
        await page.locator('[data-gn-preset="65,65"]').click();
        assert.match(await page.locator("#gn-gnomon-status").innerText(), /Equal-cut limit/);
        assert.equal(await page.locator('[data-gn-gstep="5"]').isDisabled(), true);
        await page.locator('[data-gn-preset="90,40"]').click();
        assert.equal(await page.locator("#gn-input-note").innerText(), "");
        for (let i = 0; i < 6; i++) await page.locator(`[data-gn-gstep="${i}"]`).click();
        assert.match(await page.locator("#gn-gnomon-status").innerText(), /36 \+ 6.25 = 42.25/);
        const gnomonAreas = await renderedAreas(page, "#gn-gnomon-drawing", [
          ".gn-complement-b",
          ".gn-missing",
        ]);
        assert(Math.abs(gnomonAreas[0] - 36 / 42.25) < 1e-5);
        assert(Math.abs(gnomonAreas[1] - 6.25 / 42.25) < 1e-5);
        await page.locator("#gn-gnomon").screenshot({ path: path.join(folder, "gnomon.png") });
        await page.locator("#gn-read-gnomon").click();
        assert.equal(await page.locator("#gn-passage").inputValue(), "9");
        let passages = 0;
        for (const [book, count] of [
          ["I43", 7],
          ["II5", 11],
        ]) {
          await page.locator(`[data-gn-book="${book}"]`).click();
          for (let i = 0; i < count; i++) {
            await page.locator("#gn-passage").selectOption(String(i));
            assert((await page.locator('#gn-passage-text [lang="grc"]').innerText()).length > 30);
            assert((await page.locator('#gn-passage-text [lang="la"]').innerText()).length > 20);
            passages++;
          }
        }
        for (const answer of [0, 1, 1, 2]) {
          await page.locator(`input[name=gn-answer][value="${answer}"]`).check();
          await page.getByRole("button", { name: "Check the reasoning", exact: true }).click();
          assert.match(await page.locator("#gn-feedback").innerText(), /^Yes/);
          await page.locator("#gn-question-next").click();
        }
        // Read the first facsimile before replacing it. Firefox reports an
        // interrupted lazy JPEG as "corrupt or truncated" when rapid navigation
        // cancels its request; waiting also verifies that this actual page decodes.
        await page.locator("#gn-source-image").scrollIntoViewIfNeeded();
        await page.waitForFunction(() => {
          const image = document.querySelector("#gn-source-image");
          return image.complete && image.naturalWidth > 0 && image.currentSrc === image.src;
        });
        await page.locator("#gn-source-image").evaluate((image) => image.decode());
        assert.equal(await page.locator("#gn-source-image").evaluate((i) => i.naturalWidth), 987);
        await page.locator('[data-gn-page="131"]').first().click();
        await page.waitForFunction(() => {
          const i = document.querySelector("#gn-source-image");
          return i.complete && i.naturalWidth > 0 && i.currentSrc === i.src;
        });
        await page.locator("#gn-zoom").click();
        const pan = page.locator("#gn-source-scroll");
        await pan.focus();
        await page.keyboard.press("End");
        assert(await pan.evaluate((e) => e.scrollWidth > e.clientWidth));
        await page.locator("#gn-zoom").click();
        await page
          .locator("#gn-source-image")
          .screenshot({ path: path.join(folder, "printed-page.png") });
        await page.locator("#gn-share").click();
        const shared = await page.locator("#gn-share-url").inputValue();
        const before = page.url();
        await page.getByRole("link", { name: "Read both proofs", exact: true }).click();
        assert.equal(page.url(), before);
        await page.locator("#gn-reading").screenshot({ path: path.join(folder, "reading.png") });
        const csv = await save(page, "#gn-csv", path.join(folder, "measurements.csv"));
        for (const [id, book] of [
          ["complements", "I43"],
          ["gnomon", "II5"],
        ]) {
          const file = path.join(folder, `${book}.svg`);
          await save(page, `#gn-svg-${id}`, file);
          const svg = await context.newPage();
          await svg.goto(pathToFileURL(file).href);
          assert.equal(await svg.locator("parsererror").count(), 0);
          assert.equal(await svg.locator("svg").count(), 1);
          await svg.close();
        }
        const html = await save(page, "#gn-save", path.join(folder, "reading.html"));
        assert(html.length < 5000000, `Saved reading too large: ${html.length}`);
        const saved = await context.newPage(),
          savedRequests = [];
        saved.on("request", (r) => {
          if (/^https?:/.test(r.url())) savedRequests.push(r.url());
        });
        await saved.goto(pathToFileURL(path.join(folder, "reading.html")).href);
        await saved.evaluate(() => document.fonts.ready);
        await saved.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
        await overflow(saved);
        assert.equal(await saved.locator(".gn-full-passage").count(), 18);
        assert.deepEqual(savedRequests, []);
        const images = await saved.evaluate(async () =>
          Promise.all(
            [...document.images].map(async (i) => {
              const b = Uint8Array.from(atob(i.src.split(",")[1]), (c) => c.charCodeAt(0));
              return {
                width: i.naturalWidth,
                sha256: Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", b)), (v) =>
                  v.toString(16).padStart(2, "0"),
                ).join(""),
              };
            }),
          ),
        );
        const manifest = JSON.parse(await readFile("public/sources/manifest.json", "utf8"));
        assert.deepEqual(
          images.map((i) => i.sha256),
          [100, 101, 102, 103, 128, 129, 130, 131, 132, 133].map(
            (p) => manifest.pages.find((e) => e.printed_page === p).sha256,
          ),
        );
        assert(images.every((i) => i.width > 900));
        const embedded = await save(saved, "a[download]", path.join(folder, "embedded.csv"));
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
        const rooms = [];
        if (production) {
          await page.waitForFunction(
            () => document.querySelector("#gn-offline").textContent.includes("ready offline"),
            null,
            { timeout: 60000 },
          );
          if (!external) {
            server.offline();
            await assert.rejects(fetch(`${base}sources/heiberg-131.jpg`));
          }
          await context.setOffline(true);
          for (const room of ["index.html", "triangle.html", "quadrature.html", "gnomon.html"]) {
            await page.goto(base + room);
            assert((await page.locator("h1").innerText()).length > 5);
            await overflow(page);
            rooms.push(room);
          }
          await page.locator("#gn-break").click();
          await save(page, "#gn-save", path.join(folder, "offline-reading.html"));
        } else {
          assert.match(await page.locator("#gn-offline").innerText(), /Development preview/);
          assert.deepEqual(workers, []);
        }
        assert.deepEqual(errors, []);
        assert.deepEqual(consoleErrors, []);
        assert.deepEqual(requests, []);
        report.configurations.push({
          engine: name,
          version: browser.version(),
          width,
          passages,
          offDiagonalAreas: [7.35, 25.35],
          smallPairsRemainEqual: true,
          shearPreservesAreas: true,
          historyRestored: true,
          invalidLengthRejected: true,
          equalCutLimit: true,
          allStages: true,
          initialSourceDecoded: true,
          sourceZoom: true,
          sectionHashPreserved: true,
          shared,
          brokenUrl,
          sourceImages: images,
          readingBytes: html.length,
          standaloneSvgsOpened: true,
          embeddedCsvMatches: true,
          renderedPolygonAreaRatios: { brokenAreas, gnomonAreas },
          offlineRooms: rooms,
          offlineMethod: production
            ? external
              ? "Browser context offline mode; public origin not controlled"
              : "Local HTTP origin physically disabled and independently unreachable"
            : "Not enabled in development",
          axeViolations: axe.violations.length,
          pageErrors: errors,
          consoleErrors,
          externalRequests: requests,
        });
        await writeFile(path.join(out, "browser.json"), `${JSON.stringify(report, null, 2)}\n`);
        console.log(
          `${name} ${width}: both proofs, broken hypothesis, native files, ${rooms.length} offline rooms`,
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
