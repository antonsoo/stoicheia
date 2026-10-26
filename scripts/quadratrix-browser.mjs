import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/claude-1000/quadratrix-browser");
await mkdir(out, { recursive: true });
const hash = (b) => createHash("sha256").update(b).digest("hex");
const manifest = JSON.parse(await readFile("public/sources/quadratrix/manifest.json", "utf8"));
const passages = JSON.parse(
  execFileSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      "import {quadratrixPassages} from './src/content/quadratrix.ts';console.log(JSON.stringify(quadratrixPassages))",
    ],
    { encoding: "utf8" },
  ),
);
const worker = await readFile("dist/sw.js", "utf8");
const edition = /const EDITION = "([a-f0-9]+)"/.exec(worker)[1];
const inventory = JSON.parse(/const FILES = (\[[^;]+\]);/.exec(worker)[1]);
const report = {
  checkedAt: new Date().toISOString(),
  scope: "Local production build and real saved files. No publication claim.",
  edition,
  configurations: [],
  guards: [],
};

async function serve() {
  let online = true;
  const server = createServer(async (req, res) => {
    if (!online) {
      req.socket.destroy();
      return;
    }
    try {
      const raw = new URL(req.url, "http://local").pathname;
      assert(raw.startsWith("/stoicheia/"));
      const file = raw.slice("/stoicheia/".length) || "index.html";
      assert(!file.includes(".."));
      const bytes = await readFile(path.join("dist", file));
      const mime =
        {
          ".html": "text/html",
          ".js": "text/javascript",
          ".css": "text/css",
          ".jpg": "image/jpeg",
          ".ttf": "font/ttf",
          ".svg": "image/svg+xml",
          ".json": "application/json",
          ".txt": "text/plain",
        }[path.extname(file)] ?? "application/octet-stream";
      res.writeHead(200, { "content-type": mime, "cache-control": "no-store" }).end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    base: `http://127.0.0.1:${server.address().port}/stoicheia/`,
    offline() {
      online = false;
      server.closeAllConnections();
    },
    async close() {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    },
  };
}
async function save(page, selector, filename) {
  const event = page.waitForEvent("download");
  await page.locator(selector).click();
  const download = await event;
  assert.equal(await download.failure(), null);
  await download.saveAs(filename);
  return readFile(filename);
}
async function ready(page) {
  await page
    .locator("#qx-offline")
    .filter({ hasText: "Edition ready offline" })
    .waitFor({ timeout: 60000 });
}
async function fits(page) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "Document overflow",
  );
}
async function source(page, printed) {
  await page.locator("#qx-page").selectOption(String(printed));
  await page
    .locator("#qx-source-caption")
    .filter({ hasText: `Printed p.${printed} ·` })
    .waitFor();
  const actual = await page.locator("#qx-source-image").evaluate(async (image) => {
    const bytes = new Uint8Array(await window.qxBlobBytes[image.src]);
    return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (x) =>
      x.toString(16).padStart(2, "0"),
    ).join("");
  });
  assert.equal(actual, manifest.pages.find((p) => p.page === printed).sha256);
}
async function savedReading(browser, filename, folder, engine, width) {
  const html = await readFile(filename, "utf8");
  assert(!/<script\b|\son\w+=/i.test(html));
  const images = [...html.matchAll(/<img src="data:image\/jpeg;base64,([^"]+)"/g)];
  assert.equal(images.length, 10);
  images.forEach((m, i) => {
    assert.equal(hash(Buffer.from(m[1], "base64")), manifest.pages[i].sha256);
  });
  const font = /src:url\('(data:font\/ttf;base64,[^']+)'\)/.exec(html);
  assert(font);
  assert.equal(
    hash(Buffer.from(font[1].split(",")[1], "base64")),
    hash(await readFile("public/fonts/NotoSerif-Regular.ttf")),
  );
  const context = await browser.newContext({
    javaScriptEnabled: false,
    acceptDownloads: true,
    viewport: { width, height: 1050 },
  });
  const page = await context.newPage(),
    remote = [];
  await page.route(/^https?:/, (route) => {
    remote.push(route.request().url());
    return route.abort();
  });
  await page.goto(pathToFileURL(filename).href);
  await page.bringToFront();
  await page.waitForFunction(
    () => [...document.fonts].some((f) => f.family.includes("Noto Serif") && f.status === "loaded"),
    undefined,
    { polling: 100 },
  );
  await fits(page);
  assert(
    await page
      .locator(".qx-source-sheet img")
      .evaluateAll((imgs) => imgs.every((im) => im.complete && im.naturalHeight === 1800)),
  );
  assert.equal(await page.locator(".qx-full-passage").count(), passages.length);
  for (let i = 0; i < passages.length; i++) {
    const block = page.locator(".qx-full-passage").nth(i);
    assert.equal(
      await block.locator('.qx-languages [lang="grc"]').textContent(),
      passages[i].greek,
    );
    assert.equal(await block.locator('.qx-languages [lang="la"]').textContent(), passages[i].latin);
  }
  const licenses = await page.locator(".qx-license pre").textContent();
  assert(licenses.includes(await readFile("LICENSE", "utf8")));
  assert(licenses.includes(await readFile("public/fonts/OFL.txt", "utf8")));
  const native = await save(
    page,
    'a[download="stoicheia-quadratrix.json"]',
    path.join(folder, "embedded.json"),
  );
  assert.deepEqual(
    JSON.parse(native),
    JSON.parse(await page.locator("#qx-saved-record").textContent()),
  );
  const csv = await save(
    page,
    'a[download="stoicheia-quadratrix.csv"]',
    path.join(folder, "embedded.csv"),
  );
  assert.equal(hash(csv), hash(await readFile(path.join(folder, "end.csv"))));
  await page.screenshot({ path: path.join(folder, "saved-reading.png") });
  if (engine === "chromium" && width === 1440)
    await page.pdf({
      path: path.join(folder, "reading.pdf"),
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
  assert.deepEqual(remote, []);
  await context.close();
  return {
    bytes: Buffer.byteLength(html),
    sha256: hash(html),
    images: images.length,
    readings: passages.length,
    javaScript: false,
    automaticRemoteRequests: remote,
  };
}

for (const [engine, type] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await type.launch();
  try {
    for (const width of [1440, 375]) {
      const server = await serve(),
        folder = path.join(out, `${engine}-${width}`);
      await mkdir(folder, { recursive: true });
      const context = await browser.newContext({
        viewport: { width, height: 1100 },
        acceptDownloads: true,
      });
      const page = await context.newPage(),
        errors = [],
        csp = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.addInitScript(() => {
        const create = URL.createObjectURL;
        window.qxBlobBytes = {};
        URL.createObjectURL = function (blob) {
          const url = create.call(this, blob);
          window.qxBlobBytes[url] = blob.arrayBuffer().then((b) => Array.from(new Uint8Array(b)));
          return url;
        };
        window.qxCsp = [];
        document.addEventListener("securitypolicyviolation", (e) =>
          window.qxCsp.push(e.violatedDirective),
        );
      });
      const config = {
        engine,
        version: browser.version(),
        width,
        csv: [],
        geometry: [],
        errors,
        csp,
      };
      const csv = async (name) => {
        const filename = path.join(folder, `${name}.csv`);
        await save(page, "#qx-csv", filename);
        config.csv.push(path.relative(out, filename));
        config.geometry.push(
          await page.locator("#qx-plate svg").evaluate((svg) => {
            const line = (selector) => {
              const node = svg.querySelector(selector);
              return Object.fromEntries(
                ["x1", "y1", "x2", "y2"].map((k) => [k, Number(node.getAttribute(k))]),
              );
            };
            const point = svg.querySelector(".qx-z"),
              square = svg.querySelector(".qx-square").getBBox();
            return {
              tick: Number(document.querySelector("#qx-time").value),
              timing: document.querySelector("#qx-timing").value,
              square: { x: square.x, y: square.y, width: square.width, height: square.height },
              ray: line(".qx-ray"),
              slider: line(".qx-slider"),
              marker: point
                ? { x: Number(point.getAttribute("cx")), y: Number(point.getAttribute("cy")) }
                : null,
            };
          }),
        );
      };
      try {
        await page.goto(server.base);
        const companions = page.locator("#companion-workshops");
        if (!(await companions.evaluate((d) => d.open)))
          await companions.locator("summary").click();
        await page.getByRole("link", { name: /The point the motion cannot draw/ }).click();
        await ready(page);
        await fits(page);
        await page.evaluate(() => document.fonts.ready);
        assert.match(await page.locator("#qx-numbers").textContent(), /\(0\.5, 0\.5\)/);
        await page.screenshot({ path: path.join(folder, "opening.png") });
        await page.locator("#qx-bench").screenshot({ path: path.join(folder, "midpoint.png") });
        await csv("midpoint");
        const scales = await page
          .locator("#qx-plate svg")
          .evaluate((svg) => ({ x: svg.getScreenCTM().a, y: svg.getScreenCTM().d }));
        assert(Math.abs(scales.x - scales.y) < 1e-12);
        config.axisScales = scales;
        await page.locator("#qx-time").focus();
        await page.keyboard.press("Home");
        assert.equal(await page.locator("#qx-time").inputValue(), "0");
        await page.keyboard.press("ArrowRight");
        assert.equal(await page.locator("#qx-time").inputValue(), "1");
        await page.keyboard.press("End");
        assert.equal(await page.locator("#qx-time").inputValue(), "1000000");
        assert.match(await page.locator("#qx-verdict").textContent(), /lines coincide/);
        await page.locator('[data-qx-time="999999"]').focus();
        await page.keyboard.press("Enter");
        assert.equal(await page.locator(".qx-z").count(), 1);
        assert.match(await page.locator("#qx-numbers").textContent(), /5\.235988e-13/);
        await csv("near");
        await page.locator('[data-qx-time="1000000"]').click();
        assert.match(await page.locator("#qx-verdict").textContent(), /lines coincide/);
        assert.equal(await page.locator(".qx-z").count(), 0);
        assert.equal(await page.locator(".qx-limit").count(), 0);
        await csv("end-no-limit");
        await page.locator("#qx-limit").focus();
        await page.keyboard.press("Space");
        assert.equal(await page.locator(".qx-limit").count(), 1);
        assert.equal(await page.locator(".qx-z").count(), 0);
        await page.locator("#qx-bench").screenshot({ path: path.join(folder, "finish.png") });
        await page.locator("#qx-timing").selectOption("slider-first");
        assert.match(await page.locator("#qx-verdict").textContent(), /unique intersection is A/);
        await csv("slider-first-end");
        await page.locator("#qx-timing").selectOption("rotation-first");
        await page.locator('[data-qx-time="999999"]').click();
        assert.match(await page.locator("#qx-verdict").textContent(), /parallel and distinct/);
        await csv("rotation-first-parallel");
        await page.locator("#qx-bench").screenshot({ path: path.join(folder, "parallel.png") });
        await page.locator("#qx-time").evaluate((input) => {
          input.value = "899999";
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
        assert.match(await page.locator("#qx-verdict").textContent(), /beyond the square/);
        await csv("rotation-first-outside");
        await page.locator("#qx-timing").selectOption("together");
        await page.locator('[data-qx-time="0"]').click();
        await page.evaluate(() => {
          const raf = window.requestAnimationFrame;
          let first = true;
          window.requestAnimationFrame = (callback) =>
            raf((time) => {
              const earlier = first;
              first = false;
              callback(earlier ? time - 1000 : time);
            });
        });
        await page.locator("#qx-play").click();
        await page.waitForFunction(() => Number(document.querySelector("#qx-time").value) > 3000);
        await page.locator("#qx-play").click();
        const paused = await page.locator("#qx-time").inputValue();
        await page.evaluate(
          () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
        );
        assert.equal(await page.locator("#qx-time").inputValue(), paused);
        config.animationPause = true;
        await page.locator('[data-qx-time="500000"]').click();
        await page.locator("#qx-closer").click();
        assert.equal(await page.locator("#qx-time").inputValue(), "950000");
        for (let i = 0; i < passages.length; i++) {
          await page.locator("#qx-passage").selectOption(String(i));
          assert.equal(
            await page.locator('#qx-reading .qx-languages [lang="grc"]').textContent(),
            passages[i].greek,
          );
          assert.equal(
            await page.locator('#qx-reading .qx-languages [lang="la"]').textContent(),
            passages[i].latin,
          );
          assert.equal(await page.locator(".qx-words dt").count(), 2);
        }
        for (const p of manifest.pages) await source(page, p.page);
        await page.locator("#qx-zoom").click();
        await page.locator("#qx-source-scroll").focus();
        await page.keyboard.press("ArrowRight");
        await page.waitForFunction(
          () => document.querySelector("#qx-source-scroll").scrollLeft > 0,
        );
        await page.locator("#qx-zoom").click();
        await source(page, 254);
        await source(page, 255);
        await page.goBack();
        await page.locator("#qx-source-caption").filter({ hasText: "Printed p.254" }).waitFor();
        const filename = path.join(folder, "experiment.json");
        await save(page, "#qx-json", filename);
        await page.locator('[data-qx-time="0"]').click();
        await page.locator("#qx-open").setInputFiles(filename);
        await page.locator("#qx-open-status").filter({ hasText: "Reopened" }).waitFor();
        assert.equal(await page.locator("#qx-time").inputValue(), "950000");
        const bad = path.join(folder, "invalid.json");
        await writeFile(
          bad,
          (await readFile(filename, "utf8")).replace('"tick": 950000', '"tick": -1'),
        );
        const before = page.url();
        await page.locator("#qx-open").setInputFiles(bad);
        await page.locator("#qx-open-status").filter({ hasText: "unchanged" }).waitFor();
        assert.equal(page.url(), before);
        await page.locator("#qx-share").click();
        await page.locator('[data-qx-time="1000000"]').click();
        const share = await page.locator("#qx-share-url").inputValue();
        assert.equal(new URL(share).searchParams.get("tick"), "1000000");
        await page.goto(share);
        await ready(page);
        assert.equal(await page.locator("#qx-passage").inputValue(), "7");
        assert.equal(await page.locator("#qx-limit").isChecked(), true);
        await page.locator('input[name="qx-answer"][value="limit"]').check();
        await page.locator("#qx-question button").click();
        assert.match(await page.locator("#qx-feedback").textContent(), /^Correct/);
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        assert.deepEqual(
          axe.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
          [],
        );
        config.axeViolations = 0;
        csp.push(...(await page.evaluate(() => window.qxCsp)));
        assert.deepEqual(csp, []);
        await fits(page);
        const cache = await page.evaluate(async () => {
          const keys = await caches.keys(),
            key = keys.find((k) => k.startsWith("stoicheia-"));
          return {
            key,
            paths: (await (await caches.open(key)).keys())
              .map((r) => new URL(r.url).pathname)
              .sort(),
          };
        });
        assert.equal(cache.key, `stoicheia-${edition}`);
        assert.deepEqual(cache.paths, [...inventory].sort());
        config.cachedFiles = cache.paths.length;
        server.offline();
        assert.equal(
          await fetch(server.base).then(
            () => true,
            () => false,
          ),
          false,
        );
        await page.reload();
        await ready(page);
        await source(page, 259);
        await csv("end");
        const svgFile = path.join(folder, "plate.svg");
        const svg = await save(page, "#qx-svg", svgFile);
        assert(svg.toString().includes("MIT License"));
        const svgContext = await browser.newContext({ javaScriptEnabled: false });
        try {
          const svgPage = await svgContext.newPage();
          await svgPage.goto(pathToFileURL(svgFile).href);
          await svgPage.bringToFront();
          assert.equal(await svgPage.locator("parsererror").count(), 0);
          assert.equal(await svgPage.locator("svg").count(), 1);
          const metadata = await svgPage.locator("metadata").textContent();
          assert(metadata.includes(await readFile("LICENSE", "utf8")));
          assert(metadata.includes(await readFile("public/fonts/OFL.txt", "utf8")));
          await svgPage.waitForFunction(
            () =>
              [...document.fonts].some(
                (f) => f.family.includes("Noto Serif") && f.status === "loaded",
              ),
            undefined,
            { polling: 100 },
          );
          await svgPage.screenshot({ path: path.join(folder, "saved-svg.png") });
        } finally {
          await svgContext.close();
        }
        const html = path.join(folder, "reading.html");
        await save(page, "#qx-save", html);
        config.reading = await savedReading(browser, html, folder, engine, width);
        await page.getByRole("link", { name: "Euclid course", exact: true }).click();
        await page.locator("#lesson-title").waitFor();
        if (!(await page.locator("#companion-workshops").evaluate((d) => d.open)))
          await page.locator("#companion-workshops summary").click();
        await page.getByRole("link", { name: /The point the motion cannot draw/ }).click();
        await ready(page);
        assert.deepEqual(errors, []);
        config.offline =
          "Origin connections destroyed; source, native files, saved script-free reading, course and return passed";
        report.configurations.push(config);
        console.log(
          `${engine} ${width}: real controls, source identities, native files, saved reading and offline journey passed`,
        );
      } catch (error) {
        await page.screenshot({ path: path.join(folder, "failure.png") });
        console.error({ engine, width, url: page.url(), errors });
        throw error;
      } finally {
        await context.close();
        await server.close();
      }
    }
    const server = await serve(),
      context = await browser.newContext({ serviceWorkers: "block" });
    try {
      const page = await context.newPage();
      await page.addInitScript(() => {
        const create = URL.createObjectURL;
        window.qxBlobBytes = {};
        URL.createObjectURL = function (blob) {
          const url = create.call(this, blob);
          window.qxBlobBytes[url] = blob.arrayBuffer().then((b) => Array.from(new Uint8Array(b)));
          return url;
        };
      });
      let release, requested;
      const held = new Promise((r) => {
          release = r;
        }),
        hit = new Promise((r) => {
          requested = r;
        });
      await page.route("**/sources/quadratrix/hultsch-254.jpg", async (route) => {
        requested();
        await held;
        await route.continue();
      });
      await page.goto(`${server.base}quadratrix.html`);
      await source(page, 252);
      await page.locator("#qx-page").selectOption("254");
      await hit;
      await page.locator("#qx-page").selectOption("252");
      await page.locator("#qx-source-caption").filter({ hasText: "Printed p.252" }).waitFor();
      const response = page.waitForResponse((r) => r.url().endsWith("hultsch-254.jpg"));
      release();
      await (await response).finished();
      await page.waitForLoadState("networkidle");
      assert.match(await page.locator("#qx-source-caption").textContent(), /Printed p.252/);
      assert(await page.locator("#qx-source-image").isVisible());
      report.guards.push({ engine, returnedToDisplayedPage: true, lateSourceIgnored: true });
    } finally {
      await context.close();
      await server.close();
    }
    const corrupt = await serve(),
      corruptContext = await browser.newContext({ serviceWorkers: "block" });
    try {
      const page = await corruptContext.newPage();
      await page.route("**/sources/quadratrix/hultsch-252.jpg", (route) =>
        route.fulfill({
          path: "dist/sources/quadratrix/hultsch-254.jpg",
          contentType: "image/jpeg",
        }),
      );
      await page.goto(`${corrupt.base}quadratrix.html`);
      await page.locator("#qx-source-status").filter({ hasText: "does not match" }).waitFor();
      assert(await page.locator("#qx-source-image").isHidden());
      let downloads = 0;
      page.on("download", () => downloads++);
      await page.locator("#qx-save").click();
      await page.locator("#qx-save-status").filter({ hasText: "No file was saved" }).waitFor();
      assert.equal(downloads, 0);
      report.guards.push({ engine, substitutedSourceRejected: true, exportRefused: true });
    } finally {
      await corruptContext.close();
      await corrupt.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(out, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Review: ${path.join(out, "review.json")}`);
