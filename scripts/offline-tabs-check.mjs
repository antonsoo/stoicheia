// biome-ignore-all lint/performance/useDomNodeTextContent: Check a visible reload action and the retained reading position.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { chromium, firefox } from "playwright";

const first = resolve(process.argv[2] ?? "");
const next = resolve(process.argv[3] ?? "");
const output = process.argv[4] ?? "docs/offline-tabs-verification.json";
if (!process.argv[2] || !process.argv[3] || first === next)
  throw new Error("Pass two distinct production build directories.");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const firstWorker = hash(await readFile(join(first, "sw.js")));
const nextWorker = hash(await readFile(join(next, "sw.js")));
assert.notEqual(firstWorker, nextWorker);
const report = {
  scope:
    "Two distinct edition-aware builds; explicit reload preserves the original reading state before an origin-disabled offline reload",
  firstWorkerSha256: firstWorker,
  nextWorkerSha256: nextWorker,
  configurations: [],
};
for (const [name, type] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  let root = first,
    online = true;
  const server = createServer(async (request, response) => {
    if (!online) {
      request.socket.destroy();
      return;
    }
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (!pathname.startsWith("/stoicheia/")) {
      response.writeHead(404);
      response.end();
      return;
    }
    const path = pathname.slice("/stoicheia/".length) || "index.html";
    try {
      const bytes = await readFile(join(root, path));
      response.writeHead(200, {
        "Content-Type":
          {
            ".js": "text/javascript",
            ".css": "text/css",
            ".html": "text/html",
            ".jpg": "image/jpeg",
            ".svg": "image/svg+xml",
            ".json": "application/json",
            ".ttf": "font/ttf",
          }[extname(path)] ?? "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(bytes);
    } catch {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${server.address().port}/stoicheia/`;
  const browser = await type.launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    context.on("page", (p) => p.on("pageerror", (e) => errors.push(String(e))));
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${url}#p=9&s=7&a=45&v=1`);
    await page.waitForFunction(() =>
      document.querySelector("#offline-state")?.textContent?.includes("ready offline"),
    );
    const original = page.url();
    assert.match(await page.locator("#diagram-notice").innerText(), /opposite bisector ray/);
    root = next;
    const second = await context.newPage();
    await second.goto(url);
    await second.waitForFunction(() =>
      document.querySelector("#offline-state")?.textContent?.includes("ready offline"),
    );
    await page.waitForFunction(() => document.querySelector("#reload-edition")?.hidden === false);
    assert.doesNotMatch(await page.locator("#offline-state").innerText(), /ready offline/);
    assert.equal(page.url(), original, "updating another tab must not navigate the reading tab");
    const prompt = await page.locator("#offline-state").innerText();
    await page.locator("#reload-edition").click();
    await page.waitForFunction(() =>
      document.querySelector("#offline-state")?.textContent?.includes("ready offline"),
    );
    assert.equal(page.url(), original);
    assert.equal(await page.locator("#variant").inputValue(), "1");
    assert.equal(await page.locator("#angle").inputValue(), "90");
    assert.match(await page.locator("#diagram-notice").innerText(), /opposite bisector ray/);
    assert.equal(await page.locator("#reload-edition").isHidden(), true);
    online = false;
    server.closeAllConnections();
    await assert.rejects(fetch(url));
    await context.setOffline(true);
    const reload = await page.reload();
    assert.equal(reload.fromServiceWorker(), true);
    assert.equal(page.url(), original);
    assert.equal(await page.locator("#step-position").innerText(), "Step 8 of 9");
    assert.match(await page.locator("#hypothesis-warning").innerText(), /outside/);
    assert.deepEqual(errors, []);
    report.configurations.push({
      browser: name,
      version: browser.version(),
      prompt,
      readingTabNotAutomaticallyReloaded: true,
      explicitReloadPreservesPropositionStepAngleAndChoice: true,
      originDisabledOfflineReload: true,
      retainedOppositeRayWarning: true,
      pageErrors: errors.length,
    });
    await context.close();
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
}
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
