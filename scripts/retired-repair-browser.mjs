// biome-ignore-all lint/performance/useDomNodeTextContent: Observe visible edition and repair state.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { chromium, firefox } from "playwright";

const first = resolve(process.argv[2] ?? ""),
  next = resolve(process.argv[3] ?? "");
assert.ok(process.argv[2] && process.argv[3] && first !== next);
const output = process.argv[4] ?? "/tmp/claude-1000/stoicheia-retirement.json";
const reports = [];
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  let root = first,
    hold = false,
    release,
    held = false;
  const network = [];
  const server = createServer(async (req, res) => {
    const file = new URL(req.url, "http://localhost").pathname.slice(11) || "index.html";
    try {
      const bytes = await readFile(join(root, file));
      network.push({ file, bytes: bytes.length, edition: root === first ? "first" : "next" });
      res.writeHead(200, {
        "Content-Type":
          {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css",
            ".jpg": "image/jpeg",
            ".json": "application/json",
            ".svg": "image/svg+xml",
            ".ttf": "font/ttf",
          }[extname(file)] ?? "application/octet-stream",
        "Cache-Control": "no-store",
      });
      if (hold && file === "sources/heiberg-012.jpg") {
        hold = false;
        held = true;
        release = () => {
          if (!res.destroyed) res.end(bytes);
        };
      } else res.end(bytes);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}/stoicheia/`;
  const browser = await engine.launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    let address = `${base}#p=1&s=3&intersection=1&im=56&in=97&ip=4`;
    await page.goto(address);
    address = page.url();
    await page.waitForFunction(
      () => document.querySelector("#offline-state")?.textContent.includes("ready offline"),
      undefined,
      { timeout: 120000 },
    );
    console.log(name, "initial edition ready");
    const old = await page.evaluate(async () =>
      (await caches.keys()).find((k) => k.startsWith("stoicheia-")),
    );
    // Correct bytes with wrong response metadata are still damaged. Offline
    // repair can salvage them without redownloading the source bundle.
    await page.evaluate(async (key) => {
      const cache = await caches.open(key);
      const url = new URL("assets/geometry-4f0nyLSJ.js", location.href).href;
      const response = await cache.match(url);
      await cache.put(
        url,
        new Response(await response.arrayBuffer(), { headers: { "Content-Type": "text/plain" } }),
      );
    }, old);
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await page.waitForFunction(() =>
      document.querySelector("#offline-state")?.textContent.includes("damaged"),
    );
    await page.locator(".offline-repair").click();
    await page.waitForFunction(() =>
      document.querySelector("#offline-state")?.textContent.includes("ready offline"),
    );
    await context.setOffline(false);
    await page.evaluate(
      async (key) =>
        (await caches.open(key)).delete(new URL("sources/heiberg-012.jpg", location.href).href),
      old,
    );
    hold = true;
    await page.locator(".offline-repair").click();
    const end = Date.now() + 10000;
    while (!held) {
      assert.ok(Date.now() < end);
      await new Promise((r) => setTimeout(r, 20));
    }
    console.log(name, "repair held; switching origin");
    root = next;
    const second = await context.newPage();
    await second.goto(base, { waitUntil: "domcontentloaded", timeout: 15000 });
    console.log(name, "second document loaded", await second.locator("#offline-state").innerText());
    void second
      .evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update())
      .catch(() => {});
    await second.waitForFunction(
      async () => Boolean((await navigator.serviceWorker.getRegistration())?.waiting),
      undefined,
      { timeout: 120000 },
    );
    console.log(name, "new worker installed; completing the old event before activation");
    release();
    await second.waitForFunction(
      () => document.querySelector("#offline-state")?.textContent.includes("ready offline"),
      undefined,
      { timeout: 120000 },
    );
    const newKey = await second.evaluate(async () =>
      (await caches.keys()).find((k) => k.startsWith("stoicheia-")),
    );
    assert.notEqual(newKey, old);
    assert.equal(await second.evaluate(async (key) => caches.has(key), old), false);
    await page.waitForFunction(() => !document.querySelector("#reload-edition").hidden);
    await new Promise((r) => setTimeout(r, 300));
    assert.equal(await second.evaluate(async (key) => caches.has(key), old), false);
    assert.equal(page.url(), address);
    const sourceNetwork = network.filter(
      (r) => r.edition === "next" && /\.(jpg|ttf)$/.test(r.file),
    );
    assert.ok(sourceNetwork.length <= 1);
    assert.ok(sourceNetwork.every((r) => r.file === "sources/heiberg-012.jpg"));
    await page.locator("#reload-edition").click();
    await page.waitForFunction(() =>
      document.querySelector("#offline-state")?.textContent.includes("ready offline"),
    );
    assert.equal(page.url(), address);
    console.log(name, "explicit reload ready");
    assert.deepEqual(errors, []);
    reports.push({
      browser: name,
      version: browser.version(),
      wrongTypeDetected: true,
      metadataRepairedOffline: true,
      delayedRepairThenRetirementLeavesNoOldCache: true,
      installationWaitedForOldEvent: true,
      unchangedSourceFilesReused: true,
      sourceDownloadsDuringUpdate: sourceNetwork,
      explicitReloadPreservesAddress: true,
      pageErrors: errors.length,
    });
    await context.close();
  } finally {
    release?.();
    await browser.close();
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
}
await writeFile(output, `${JSON.stringify(reports, null, 2)}\n`);
console.log(JSON.stringify(reports, null, 2));
