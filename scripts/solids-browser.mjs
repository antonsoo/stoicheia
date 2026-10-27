import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4365/stoicheia/",
  out = path.resolve(process.argv[3] ?? "/tmp/claude-1000/solids-review");
await mkdir(out, { recursive: true });
const manifest = JSON.parse(await readFile("public/sources/solids/manifest.json", "utf8")),
  records = [];
const keyboard = async (page, selector, key = "Enter") => {
  await page.locator(selector).focus();
  await page.keyboard.press(key);
};
async function save(page, selector, file) {
  const event = page.waitForEvent("download");
  await page.locator(selector).click();
  const d = await event;
  assert.equal(await d.failure(), null);
  await d.saveAs(file);
}
async function source(page, printed) {
  await page.waitForFunction((p) => {
    const im = document.getElementById("sl-source-image");
    return (
      document.getElementById("sl-page").value === String(p) &&
      document
        .getElementById("sl-source-status")
        .textContent.startsWith("Verified complete page") &&
      !im.hidden &&
      im.complete &&
      im.naturalHeight > 0
    );
  }, printed);
}
async function review(name, browser, width) {
  console.log(
    `${name} ${width}: corner obstruction, mixed vertices, source readings, retained files, offline`,
  );
  const dir = path.join(out, `${name}-${width}`);
  await mkdir(dir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
    acceptDownloads: true,
  });
  if (name === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base);
  await page.locator("#lesson-title").waitFor();
  const companions = page.locator("#companion-workshops");
  if (!(await companions.evaluate((n) => n.open))) await companions.locator("summary").click();
  await keyboard(page, 'a[href="./solids.html"]');
  await page.locator("#sl-title").waitFor();
  await source(page, 336);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.locator("#sl-bench").screenshot({ path: path.join(dir, "corner.png") });
  await keyboard(page, '.sl-controls [data-sl-case="3,6"]');
  assert.match(await page.locator("#sl-result").textContent(), /360°.*lies flat/s);
  await keyboard(page, "#sl-q", "Home");
  assert.match(await page.locator("#sl-result").textContent(), /Two faces make a hinge/);
  await keyboard(page, '.sl-controls [data-sl-case="5,4"]');
  assert.match(await page.locator("#sl-result").textContent(), /432°.*cannot be a convex/s);
  // Native keyboard operation changes the actual regular face, not a screenshot.
  await keyboard(page, "#sl-q", "ArrowLeft");
  assert.match(await page.locator("#sl-result").textContent(), /36°.*dodecahedron/s);
  assert.equal(await page.locator("#sl-models figure").first().locator("polygon").count(), 12);
  await keyboard(page, "#sl-p", "ArrowRight");
  assert.match(await page.locator("#sl-result").textContent(), /360°.*lies flat/s);
  for (const [p, q, faces, name] of [
    [3, 3, 4, "Tetrahedron"],
    [3, 4, 8, "Octahedron"],
    [3, 5, 20, "Icosahedron"],
    [4, 3, 6, "Cube"],
    [5, 3, 12, "Dodecahedron"],
  ]) {
    await page.locator("#sl-bench details summary").click();
    await keyboard(page, `#sl-bench details [data-sl-case="${p},${q}"]`);
    assert.equal(await page.locator("#sl-models figure").first().locator("h3").textContent(), name);
    assert.equal(await page.locator("#sl-models figure").first().locator("polygon").count(), faces);
    await page.locator("#sl-bench details summary").click();
  }
  await page.locator("#sl-bench details summary").click();
  await keyboard(page, '#sl-bench details [data-sl-case="3,3"]');
  await page.locator("#sl-bench details summary").click();
  await keyboard(page, "#sl-tip");
  assert.match(await page.locator("#sl-inference").textContent(), /Vertices V4.*5/s);
  assert.match(await page.locator("#sl-vertex-result").textContent(), /vertex 1: 3 faces.*180°/);
  assert.equal(
    await page.locator("#sl-models figure").nth(1).locator('polygon[fill="#cedde3"]').count(),
    3,
  );
  await keyboard(page, "#sl-belt");
  assert.match(await page.locator("#sl-inference").textContent(), /Vertices V6.*5/s);
  assert.match(
    await page.locator("#sl-vertex-result").textContent(),
    /vertex 3: 4 faces.*240°.*120°/,
  );
  assert.equal(
    await page.locator("#sl-models figure").nth(1).locator('polygon[fill="#cedde3"]').count(),
    4,
  );
  const drawing = await page.locator("#sl-models").innerHTML();
  await keyboard(page, "#sl-yaw", "ArrowRight");
  assert.notEqual(await page.locator("#sl-models").innerHTML(), drawing);
  await keyboard(page, "#sl-pitch", "ArrowUp");
  await page.locator("#sl-comparison").screenshot({ path: path.join(dir, "mixed-corners.png") });
  const readings = [];
  for (let i = 0; i < 9; i++) {
    await page.selectOption("#sl-reading-select", String(i));
    await source(page, [336, 336, 336, 336, 338, 338, 338, 4, 338][i]);
    readings.push(await page.locator("#sl-reading-text").textContent());
    assert(await page.locator('#sl-reading-text [lang="grc"]').first().isVisible());
    if (i === 3) {
      await keyboard(page, "#sl-continuation");
      await source(page, 339);
    }
  }
  const sources = [];
  for (const entry of manifest.pages) {
    await page.selectOption("#sl-page", String(entry.printedPage));
    await source(page, entry.printedPage);
    const actual = await page.locator("#sl-source-image").evaluate(async (im, url) => {
      const b = await (await fetch(url)).arrayBuffer();
      const digest = async (bytes) =>
        Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (v) =>
          v.toString(16).padStart(2, "0"),
        ).join("");
      const reference = new Image();
      reference.src = url;
      await reference.decode();
      const pixels = async (image) => {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        return digest(context.getImageData(0, 0, canvas.width, canvas.height).data);
      };
      return {
        bytes: b.byteLength,
        sha256: await digest(b),
        displayedPixels: await pixels(im),
        referencePixels: await pixels(reference),
      };
    }, `${base}sources/${entry.file}`);
    assert.equal(actual.sha256, entry.sha256);
    assert.equal(actual.bytes, entry.bytes);
    assert.equal(actual.displayedPixels, actual.referencePixels);
    sources.push(actual);
  }
  await keyboard(page, "#sl-zoom");
  assert(await page.locator("#sl-dialog").evaluate((d) => d.open));
  const scroll = await page.locator("#sl-source-viewport").evaluate((e) => e.scrollLeft);
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(
    (previous) => document.getElementById("sl-source-viewport").scrollLeft > previous,
    scroll,
  );
  await page.keyboard.press("Escape");
  await page.selectOption("#sl-reading-select", "0");
  await keyboard(page, "#sl-latin-page");
  await source(page, 337);
  await page.locator("#sl-evidence").screenshot({ path: path.join(dir, "source.png") });
  await keyboard(page, "#sl-copy");
  const address = await page.locator("#sl-share").inputValue();
  assert.match(address, /example=bipyramid/);
  const shared = await context.newPage();
  await shared.goto(address);
  await shared.locator("#sl-title").waitFor();
  await source(shared, 337);
  assert.match(await shared.locator("#sl-vertex-result").textContent(), /4 faces.*240°/);
  await shared.close();
  const files = {};
  for (const kind of ["json", "csv", "svg", "html"]) {
    const file = path.join(dir, `study.${kind}`);
    await save(page, `[data-sl-save="${kind}"]`, file);
    files[kind] = file;
  }
  const settings = JSON.parse(await readFile(files.json, "utf8")).settings;
  await keyboard(page, "#sl-tip");
  await page.locator("#sl-open").setInputFiles(files.json);
  await page.waitForFunction(
    () => document.getElementById("sl-save-status").textContent === "Saved experiment reopened.",
  );
  assert.match(await page.locator("#sl-vertex-result").textContent(), /4 faces.*240°/);
  await page.locator("#sl-open").setInputFiles({
    name: "unsupported.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        format: "stoicheia-solids",
        version: 1,
        settings: { ...settings, vertex: 80 },
      }),
    ),
  });
  await page.waitForFunction(() =>
    document.getElementById("sl-save-status").textContent.includes("does not belong"),
  );
  assert.match(await page.locator("#sl-vertex-result").textContent(), /4 faces.*240°/);
  await keyboard(page, "#sl-tip");
  await page.goBack();
  assert.match(await page.locator("#sl-vertex-result").textContent(), /4 faces.*240°/);
  await page.goForward();
  assert.match(await page.locator("#sl-vertex-result").textContent(), /3 faces.*180°/);
  await page.goBack();
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  assert.deepEqual(
    axe.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
    [],
  );
  assert.deepEqual(errors, []);
  const offline = { supported: name !== "webkit" };
  if (!process.env.SOLIDS_DEVELOPMENT) {
    await page.waitForFunction(
      () => document.getElementById("sl-offline").textContent.startsWith("Edition ready offline"),
      null,
      { timeout: 60000 },
    );
    const inventory = await page.evaluate(async () => {
      const keys = (await caches.keys()).filter((k) => k.startsWith("stoicheia-"));
      return Promise.all(
        keys.map(async (key) => ({
          key,
          paths: (await (await caches.open(key)).keys()).map((r) => new URL(r.url).pathname).sort(),
        })),
      );
    });
    assert.equal(inventory.length, 1);
    assert(inventory[0].paths.includes(new URL(`${base}solids.html`).pathname));
    const build = JSON.parse(await readFile(path.join(out, "inventory.json"), "utf8"));
    assert.deepEqual(inventory[0].paths, build.paths);
    await context.setOffline(true);
    await page.reload();
    await page.locator("#sl-title").waitFor();
    await source(page, 337);
    await keyboard(page, "#sl-tip");
    await keyboard(page, "#sl-belt");
    await save(page, '[data-sl-save="html"]', path.join(dir, "offline.html"));
    for (const route of [
      "",
      "triangle.html",
      "quadrature.html",
      "gnomon.html",
      "mesolabe.html",
      "desk.html",
      "measure.html",
      "circle.html",
      "horn.html",
      "quadratrix.html",
      "ratios.html",
      "solids.html",
    ]) {
      await page.goto(base + route);
      await page.locator("h1").waitFor();
      assert(await page.locator("body").textContent());
    }
    offline.cache = inventory[0];
    offline.rooms = 12;
  }
  await context.close();
  const portable = await browser.newContext({
      viewport: { width, height: 1000 },
      javaScriptEnabled: false,
      acceptDownloads: true,
    }),
    doc = await portable.newPage(),
    requests = [];
  doc.on("request", (r) => {
    if (/^https?:/.test(r.url())) requests.push(r.url());
  });
  await doc.goto(pathToFileURL(files.html).href);
  await doc.locator("h1").waitFor();
  let ready = false;
  for (let i = 0; i < 100 && !ready; i++) {
    ready = await doc.evaluate(
      () =>
        document.fonts.status === "loaded" &&
        [...document.images].every((i) => i.complete && i.naturalWidth > 0),
    );
    if (!ready) await doc.waitForTimeout(100);
  }
  assert(ready);
  assert.equal(await doc.locator(".sl-source-sheet img").count(), 15);
  assert.equal(await doc.locator(".sl-reading-full").count(), 9);
  assert.equal(await doc.locator("script").count(), 0);
  assert(await doc.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(requests, []);
  for (const kind of ["json", "csv", "svg"])
    await save(doc, `.sl-native a[download$=".${kind}"]`, path.join(dir, `native.${kind}`));
  if (name === "chromium" && width === 1440) {
    await doc.pdf({
      path: path.join(dir, "reading.pdf"),
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
      outline: true,
    });
    await doc.screenshot({ path: path.join(dir, "portable.png") });
  }
  await portable.close();
  records.push({
    engine: name,
    version: browser.version(),
    width,
    readings: readings.length,
    sourceImages: sources,
    settings,
    offline,
    portableRemoteRequests: requests,
    axeViolations: axe.violations.length,
    errors,
  });
  await writeFile(path.join(out, "review.json"), `${JSON.stringify({ base, records }, null, 2)}\n`);
}
// The complete current build, including all retained older course sources.
const { readdir } = await import("node:fs/promises");
async function walk(dir) {
  return (
    await Promise.all(
      (
        await readdir(dir, { withFileTypes: true })
      ).map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name))),
    )
  ).flat();
}
await writeFile(
  path.join(out, "inventory.json"),
  `${JSON.stringify(
    {
      paths: (await walk("dist"))
        .filter((p) => !p.endsWith("/sw.js"))
        .map((p) => new URL(p.slice(5), base).pathname)
        .sort(),
    },
    null,
    2,
  )}\n`,
);
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  if (process.env.SOLIDS_ENGINE && process.env.SOLIDS_ENGINE !== name) continue;
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      if (process.env.SOLIDS_WIDTH && Number(process.env.SOLIDS_WIDTH) !== width) continue;
      await review(name, browser, width);
    }
  } catch (error) {
    for (const context of browser.contexts())
      for (const page of context.pages()) {
        console.error(
          await page
            .evaluate(() => ({
              url: location.href,
              source: document.getElementById("sl-source-status")?.textContent,
              image: document.getElementById("sl-source-image")?.getAttribute("src"),
              page: document.getElementById("sl-page")?.value,
              reading: document.getElementById("sl-reading-select")?.value,
              offline: document.getElementById("sl-offline")?.textContent,
            }))
            .catch(() => null),
        );
        await page
          .screenshot({ path: path.join(out, `${name}-failure.png`), timeout: 5000 })
          .catch(() => {});
      }
    throw error;
  } finally {
    await browser.close();
  }
}
console.log(`Completed ${records.length} solid workshop journeys.`);
