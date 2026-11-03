// biome-ignore-all lint/performance/useDomNodeTextContent: Assert the learner's visible feedback.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { chromium, firefox } from "playwright";

const root = resolve(process.argv[2] ?? "dist");
const output = resolve(process.argv[3] ?? "/tmp/claude-1000/stoicheia-cancellation");
await mkdir(output, { recursive: true });
let held = new Map(),
  requests = [];
const server = createServer(async (req, res) => {
  const file =
    new URL(req.url, "http://localhost").pathname.replace(/^\/stoicheia\//, "") || "index.html";
  requests.push(file);
  try {
    const bytes = await readFile(join(root, file));
    res.writeHead(200, {
      "Content-Type":
        {
          ".html": "text/html",
          ".js": "text/javascript",
          ".css": "text/css",
          ".jpg": "image/jpeg",
          ".ttf": "font/ttf",
        }[extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    const gate = held.get(file);
    if (gate) {
      gate.started = true;
      gate.response = res;
      gate.release = () => {
        if (!res.destroyed) res.end(bytes.subarray(1));
      };
      res.on("close", () => {
        gate.closed = true;
      });
      res.write(bytes.subarray(0, 1));
    } else res.end(bytes);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}/stoicheia/#p=1&s=3&intersection=1`;
const wait = async (predicate) => {
  const end = Date.now() + 10000;
  while (!predicate()) {
    assert.ok(Date.now() < end, "fault gate did not reach the expected state");
    await new Promise((r) => setTimeout(r, 25));
  }
};
const reports = [];
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
  ]) {
    requests = [];
    const browser = await engine.launch();
    try {
      const context = await browser.newContext({ serviceWorkers: "block" });
      const errors = [];
      context.on("page", (p) => p.on("pageerror", (e) => errors.push(String(e))));
      // Closing a viewer must leave a second consumer's shared transfer alive.
      let page = await context.newPage();
      held = new Map([["sources/heiberg-012.jpg", {}]]);
      await page.goto(url);
      const download = page.waitForEvent("download").catch(() => null);
      await page.locator("#intersection-save").click();
      let gate = held.get("sources/heiberg-012.jpg");
      await wait(() => gate.started);
      await page.locator('[data-source="12"]').first().click();
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => !document.querySelector("#source-dialog").open);
      assert.equal(gate.closed, undefined);
      gate.release();
      const saved = await download;
      const target = join(output, `${name}-shared.html`);
      await saved.saveAs(target);
      const html = await readFile(target, "utf8");
      assert.equal((html.match(/data-source-page=/g) ?? []).length, 10);
      assert.equal(requests.filter((f) => f === "sources/heiberg-012.jpg").length, 1);
      await page.close();
      // A cancelled export relinquishes its final consumer and permits a clean retry.
      page = await context.newPage();
      held = new Map([["sources/heiberg-012.jpg", {}]]);
      await page.goto(url);
      let downloads = 0;
      page.on("download", () => downloads++);
      await page.locator("#intersection-save").click();
      gate = held.get("sources/heiberg-012.jpg");
      await wait(() => gate.started);
      await page.locator("#intersection-cancel").click();
      await wait(() => gate.closed);
      await page.waitForFunction(() =>
        document.querySelector("#intersection-save-status").textContent.includes("cancelled"),
      );
      assert.equal(downloads, 0);
      assert.equal(await page.locator("#intersection-save").isEnabled(), true);
      held.clear();
      const retry = page.waitForEvent("download").catch(() => null);
      await page.locator("#intersection-save").click();
      assert.equal(await (await retry).failure(), null);
      await page.close();
      // An interactive page already queued by an export moves ahead of unused pages.
      page = await context.newPage();
      held = new Map([
        ["sources/heiberg-004.jpg", {}],
        ["sources/heiberg-005.jpg", {}],
        ["sources/heiberg-006.jpg", {}],
      ]);
      requests = [];
      await page.goto(url);
      const final = page.waitForEvent("download").catch(() => null);
      await page.locator("#intersection-save").click();
      await wait(() => [...held.values()].every((g) => g.started));
      await page.locator('[data-source="12"]').first().click();
      held.get("sources/heiberg-004.jpg").release();
      await page.waitForFunction(() => document.querySelector("#source-image").hidden === false);
      // One slot may remain for the font; the direct source must precede page 7.
      assert.ok(
        requests.indexOf("sources/heiberg-012.jpg") < requests.indexOf("sources/heiberg-007.jpg") ||
          !requests.includes("sources/heiberg-007.jpg"),
      );
      for (const g of held.values()) g.release();
      await page.keyboard.press("Escape");
      await final;
      await page.close();
      assert.deepEqual(errors, []);
      reports.push({
        browser: name,
        version: browser.version(),
        sharedReadSurvivesClosingViewer: true,
        exportCancellationClosesUnusedBody: true,
        retryDownloads: true,
        interactivePagePromoted: true,
        pageErrors: errors.length,
      });
      await context.close();
    } finally {
      held.clear();
      await browser.close();
    }
  }
} finally {
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
}
await writeFile(join(output, "review.json"), `${JSON.stringify(reports, null, 2)}\n`);
console.log(JSON.stringify(reports, null, 2));
