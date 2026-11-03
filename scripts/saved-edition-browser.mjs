// biome-ignore-all lint/performance/useDomNodeTextContent: Audit the visible promise and recovery controls.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const root = resolve(process.argv[2] ?? "dist"),
  output = resolve(process.argv[3] ?? join(tmpdir(), "stoicheia-saved-edition"));
await mkdir(output, { recursive: true });
const manifest = JSON.parse(
  /const IDENTITIES = (\{[^\n]+\});/.exec(await readFile(join(root, "sw.js"), "utf8"))[1],
);
const inventory = Object.keys(manifest);
const rooms = [
  ["", "offline-state"],
  ["triangle.html", "offline-status"],
  ["quadrature.html", "qa-offline"],
  ["gnomon.html", "gn-offline"],
  ["mesolabe.html", "ml-offline"],
  ["desk.html", "dk-offline"],
  ["measure.html", "mr-offline"],
  ["circle.html", "ci-offline"],
  ["horn.html", "hn-offline"],
  ["quadratrix.html", "qx-offline"],
  ["ratios.html", "rt-offline"],
  ["solids.html", "sl-offline"],
  ["primes.html", "pr-offline"],
  ["areas.html", "ar-offline"],
];
let online = true,
  navMode = "normal";
const requests = new Map();
const server = createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  if (!online) {
    req.socket.destroy();
    return;
  }
  if (!path.startsWith("/stoicheia/")) {
    res.writeHead(404);
    res.end();
    return;
  }
  const file = path.slice("/stoicheia/".length) || "index.html";
  if (file.includes("..")) {
    res.writeHead(400);
    res.end();
    return;
  }
  requests.set(file, (requests.get(file) ?? 0) + 1);
  if (file.endsWith(".html") && navMode !== "normal") {
    if (navMode === "503") {
      res.writeHead(503, { "Content-Type": "text/html" });
      res.end("maintenance");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(
      "<!doctype html><title>Maintenance</title><p>The origin is temporarily unavailable.</p>",
    );
    if (navMode !== "stall") res.end();
    return;
  }
  try {
    const b = await readFile(join(root, file));
    res.writeHead(200, {
      "Content-Type":
        {
          ".html": "text/html",
          ".js": "text/javascript",
          ".css": "text/css",
          ".ttf": "font/ttf",
          ".jpg": "image/jpeg",
          ".svg": "image/svg+xml",
          ".json": "application/json",
        }[extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(b);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}/stoicheia/`;
const report = {
  scope:
    "Local production readers, cache damage and independent recovery; no public delivery claim",
  configurations: [],
};
const hash = (b) => createHash("sha256").update(b).digest("hex");
async function text(page, selector, value) {
  await page.waitForFunction(
    ({ selector, value }) => document.querySelector(selector)?.textContent.includes(value),
    { selector, value },
    { timeout: 120000 },
  );
}
async function ready(page, id) {
  await text(page, `#${id}`, "Edition ready offline");
}
async function audit(page, label) {
  const a = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  assert.deepEqual(
    a.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    [],
    label,
  );
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    `${label}: overflow`,
  );
}
async function cacheKey(page) {
  return page.evaluate(async () => {
    const keys = (await caches.keys()).filter((k) => k.startsWith("stoicheia-"));
    if (keys.length !== 1) throw new Error(`Expected one edition cache, got ${keys}`);
    return keys[0];
  });
}
async function mutate(page, kind, path) {
  await page.evaluate(
    async ({ kind, path }) => {
      const key = (await caches.keys()).find((k) => k.startsWith("stoicheia-"));
      if (!key) throw new Error("No saved edition");
      const c = await caches.open(key);
      if (kind === "remove") await c.delete(path);
      else
        await c.put(
          path,
          new Response("substituted source bytes", { headers: { "Content-Type": "image/jpeg" } }),
        );
    },
    { kind, path },
  );
}
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
  ]) {
    const browser = await engine.launch();
    try {
      for (const width of [1440, 375]) {
        online = true;
        navMode = "normal";
        const label = `${name}-${width}`,
          context = await browser.newContext({
            viewport: { width, height: 950 },
            acceptDownloads: true,
          });
        await context.addInitScript(() => {
          window.policyErrors = [];
          addEventListener("securitypolicyviolation", (e) =>
            window.policyErrors.push(e.violatedDirective),
          );
        });
        const errors = [];
        context.on("page", (p) => p.on("pageerror", (e) => errors.push(String(e))));
        const pages = [];
        // One shared edition, operated through every room's own status and control.
        for (const [file, id] of rooms) {
          const p = await context.newPage();
          await p.goto(`${base}${file}${file ? "" : "#p=1&s=3&intersection=1"}`);
          await ready(p, id);
          pages.push(p);
        }
        const page = pages[0];
        await page.bringToFront();
        await page.locator("#intersection-trial").selectOption("custom");
        await page.locator("#intersection-m").fill("123");
        await page.locator("#intersection-places").selectOption("4");
        await page.locator("#intersection-real").check();
        assert.equal(await page.locator("#intersection-m").inputValue(), "123");
        await text(page, "#intersection-draft-note", "Unapplied edits");
        assert.match(await page.locator('[data-exact="coordinates"]').innerText(), /120\/241/);
        await page.locator("#intersection-n").fill("0");
        await page.locator('#intersection-form button[type="submit"]').click();
        await text(page, "#intersection-error", "Denominator n");
        assert.equal(await page.locator("#intersection-n").getAttribute("aria-invalid"), "true");
        await page.locator("#intersection-places").selectOption("6");
        assert.equal(await page.locator("#intersection-n").inputValue(), "0");
        await page.locator("#intersection-revert").click();
        assert.equal(await page.locator("#intersection-m").inputValue(), "11");
        assert.equal(await page.locator("#intersection-n").inputValue(), "19");
        await page.locator("#open-edition").click();
        await page.locator("#source-next").click();
        await page.locator("#source-next").click();
        await page.waitForFunction(
          () => document.querySelector("#source-image")?.dataset.sourcePage === "6",
        );
        await text(page, "#course-source-status", "cropped");
        assert.equal(await page.locator("#course-source-limits").isVisible(), true);
        assert.match(await page.locator("#source-image").getAttribute("alt"), /cropped/);
        await audit(page, `${label} cropped source`);
        await page
          .locator("#source-dialog")
          .screenshot({ path: join(output, `${label}-cropped.png`) });
        await page.locator('[data-close="source-dialog"]').click();
        // A full byte audit finds the damage without needing to display that source.
        await mutate(page, "corrupt", "/stoicheia/sources/heiberg-012.jpg");
        await mutate(page, "remove", "/stoicheia/areas.html");
        online = false;
        await context.setOffline(true);
        await page.evaluate(() => dispatchEvent(new Event("focus")));
        await Promise.all(pages.map((p, i) => text(p, `#${rooms[i][1]}`, "incomplete")));
        const damaged = await page.locator("#offline-state").innerText();
        assert.match(damaged, /1 missing, 1 damaged/);
        await page.locator(".offline-repair").click();
        await text(page, "#offline-state", "could not be repaired");
        assert.equal(await page.locator(".offline-repair").isEnabled(), true);
        // A real reconnection repairs both records and updates every open room.
        online = true;
        await context.setOffline(false);
        await page.waitForFunction(() => !document.querySelector(".offline-repair").disabled);
        await page.locator(".offline-repair").click();
        await Promise.all(pages.map((p, i) => ready(p, rooms[i][1])));
        const repairedKey = await cacheKey(page);
        const checked = await page.evaluate(
          async ({ key, manifest }) => {
            let count = 0;
            for (const [url, id] of Object.entries(manifest)) {
              const r = await caches.match(url, { cacheName: key });
              if (!r) throw new Error(`Missing ${url}`);
              const b = await r.arrayBuffer();
              const h = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", b)), (x) =>
                x.toString(16).padStart(2, "0"),
              ).join("");
              if (b.byteLength !== id.bytes || h !== id.sha256)
                throw new Error(`Wrong bytes ${url}`);
              count++;
            }
            return count;
          },
          { key: repairedKey, manifest },
        );
        assert.equal(checked, inventory.length);
        online = false;
        await context.setOffline(true);
        await page.reload();
        const savedReading = page.waitForEvent("download");
        await page.locator("#intersection-save").click();
        const readingFile = join(output, `${label}-offline-reading.html`);
        await (await savedReading).saveAs(readingFile);
        assert.equal(
          ((await readFile(readingFile, "utf8")).match(/data-source-page=/g) ?? []).length,
          10,
        );
        online = true;
        await context.setOffline(false);
        // Successful maintenance bodies and stalled HTML must not replace a saved lesson.
        const address = page.url();
        for (const mode of ["503", "maintenance", "stall"]) {
          navMode = mode;
          const started = performance.now();
          const response = await page.reload({ waitUntil: "domcontentloaded" });
          assert.equal(response.fromServiceWorker(), true);
          await text(page, "#step-position", "Step 4 of 10");
          assert.equal(page.url(), address);
          if (mode === "stall") assert.ok(performance.now() - started < 4000);
        }
        navMode = "normal";
        await ready(page, "offline-state");
        // Removing a bootstrap module must not produce an empty page offline.
        const html = await readFile(join(root, "index.html"), "utf8"),
          modulePath = /<script[^>]+src="([^"]+)"/.exec(html)[1];
        await mutate(page, "remove", modulePath);
        online = false;
        await context.setOffline(true);
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForSelector("#recovery-repair");
        await page.locator("details > summary").click();
        assert.equal(
          await page.locator("#recovery-address").innerText(),
          new URL(address).pathname + new URL(address).hash,
        );
        await page.locator("details > summary").click();
        await audit(page, `${label} independent recovery`);
        await page.screenshot({ path: join(output, `${label}-recovery.png`) });
        await page.locator("#recovery-repair").click();
        await text(page, "#recovery-status", "still incomplete");
        assert.equal(await page.locator("#recovery-repair").isEnabled(), true);
        online = true;
        await context.setOffline(false);
        await page.locator("#recovery-repair").click();
        await text(page, "#recovery-status", "reader is repaired");
        await page.locator("#recovery-repair").click();
        await ready(page, "offline-state");
        assert.equal(page.url(), address);
        assert.equal(await page.locator("#intersection-m").inputValue(), "11");
        // Remove the cache after the worker read a saved response but before
        // a stalled origin can fall back. An in-memory snapshot is not readiness.
        navMode = "stall";
        const beforeRequest = requests.get("index.html") ?? 0;
        const navigating = page.reload({ waitUntil: "domcontentloaded" });
        const until = Date.now() + 5000;
        while ((requests.get("index.html") ?? 0) === beforeRequest) {
          assert.ok(Date.now() < until);
          await new Promise((r) => setTimeout(r, 20));
        }
        await pages[1].evaluate(async () => {
          for (const key of await caches.keys())
            if (key.startsWith("stoicheia-")) await caches.delete(key);
        });
        await navigating;
        await page.waitForSelector("#recovery-repair");
        assert.deepEqual(await page.evaluate(() => caches.keys()), []);
        navMode = "normal";
        await page.locator("#recovery-repair").click();
        await text(page, "#recovery-status", "reader is repaired");
        await page.locator("#recovery-repair").click();
        await ready(page, "offline-state");
        // Evict the whole namespace: merely reading the recovery page must not recreate it.
        await page.evaluate(async () => {
          for (const key of await caches.keys())
            if (key.startsWith("stoicheia-")) await caches.delete(key);
        });
        online = false;
        await context.setOffline(true);
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForSelector("#recovery-repair");
        assert.deepEqual(await page.evaluate(() => caches.keys()), []);
        online = true;
        await context.setOffline(false);
        await page.locator("#recovery-repair").click();
        await text(page, "#recovery-status", "reader is repaired");
        await page.locator("#recovery-repair").click();
        await ready(page, "offline-state");
        assert.equal(page.url(), address);
        assert.deepEqual(errors, []);
        for (const p of pages) assert.deepEqual(await p.evaluate(() => window.policyErrors), []);
        await audit(page, `${label} recovered reader`);
        report.configurations.push({
          engine: name,
          width,
          rooms: rooms.length,
          damagedStatus: damaged,
          verifiedRepairedFiles: checked,
          draftAndInvalidInputPreserved: true,
          croppedSourceHonest: true,
          allTabsWithdrawAndRecover: true,
          maintenanceAndStalledNavigation: true,
          bootstrapRecovery: true,
          completeEvictionRecovery: true,
          evictionDuringStalledNavigation: true,
          readingAddressPreserved: true,
          illustratedReadingSavedOffline: true,
          cspViolations: 0,
          pageErrors: 0,
        });
        await context.close();
        console.log(`${label}: all rooms, damaged bytes, repair, navigation and recovery passed`);
      }
    } finally {
      await browser.close();
    }
  }
  await writeFile(
    join(output, "review.json"),
    `${JSON.stringify(
      { ...report, workerSha256: hash(await readFile(join(root, "sw.js"))) },
      null,
      2,
    )}\n`,
  );
} finally {
  online = true;
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
}
