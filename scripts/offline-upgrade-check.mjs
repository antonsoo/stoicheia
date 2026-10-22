// biome-ignore-all lint/performance/useDomNodeTextContent: Compare the visible readiness promise with an actual offline reload.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { chromium, firefox } from "playwright";

const previous = resolve(process.argv[2] ?? "");
const current = resolve(process.argv[3] ?? "dist");
if (!process.argv[2] || previous === current)
  throw new Error("Pass distinct previous and current production build directories.");
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const oldWorker = await readFile(join(previous, "sw.js"));
const newWorker = await readFile(join(current, "sw.js"));
assert.notEqual(digest(oldWorker), digest(newWorker));
const scenario = process.argv[4] ?? "bisections";
const editions = {
  bisections: {
    previous: 6,
    current: 10,
    lesson: 10,
    step: 6,
    steps: 8,
    source: 31,
    receipt: "offline-upgrade-verification.json",
  },
  "right-angles": {
    previous: 10,
    current: 16,
    lesson: 16,
    step: 8,
    steps: 10,
    source: 45,
    receipt: "right-angle-upgrade.json",
  },
};
const editionCheck = editions[scenario];
assert.ok(editionCheck, "Choose bisections or right-angles.");
const sourceFile = `sources/heiberg-${String(editionCheck.source).padStart(3, "0")}.jpg`;
const position = `Step ${editionCheck.step + 1} of ${editionCheck.steps}`;
const expectedScanHash = digest(await readFile(join(current, sourceFile)));
const report = {
  scope: `Upgrade from ${editionCheck.previous} to ${editionCheck.current} propositions; held and failed source downloads, followed by an origin-disabled offline reload`,
  previousWorkerSha256: digest(oldWorker),
  currentWorkerSha256: digest(newWorker),
  heldFile: sourceFile,
  configurations: [],
};
for (const [name, type] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await type.launch();
  try {
    for (const failOnce of [false, true]) {
      let edition = previous,
        online = true,
        hold = true,
        held = 0;
      let unavailable = false;
      const pending = [];
      const send = async (response, path, root) => {
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
                ".woff2": "font/woff2",
              }[extname(path)] ?? "application/octet-stream",
            "Cache-Control": "no-store",
          });
          response.end(bytes);
        } catch {
          response.writeHead(404);
          response.end();
        }
      };
      const server = createServer((request, response) => {
        if (!online) {
          request.socket.destroy();
          return;
        }
        const pathname = new URL(request.url, "http://localhost").pathname;
        if (!pathname.startsWith("/stoicheia/") || pathname.includes("..")) {
          response.writeHead(404);
          response.end();
          return;
        }
        const path = pathname.slice("/stoicheia/".length) || "index.html";
        if (edition === current && path === sourceFile && unavailable) {
          response.writeHead(503);
          response.end("Source scan temporarily unavailable");
          return;
        }
        if (edition === current && path === sourceFile && hold) {
          held++;
          pending.push(response);
          return;
        }
        void send(response, path, edition);
      });
      await new Promise((r) => server.listen(0, "127.0.0.1", r));
      const url = `http://127.0.0.1:${server.address().port}/stoicheia/`;
      const context = await browser.newContext();
      try {
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(String(e)));
        await page.goto(url);
        await page.waitForFunction(
          () =>
            navigator.serviceWorker.controller &&
            document.querySelector("#offline-state").textContent.includes("ready offline"),
        );
        assert.equal(await page.locator(".lesson-tab").count(), editionCheck.previous);
        edition = current;
        await page.reload();
        await page.waitForFunction(
          (count) => document.querySelectorAll(".lesson-tab").length === count,
          editionCheck.current,
        );
        await page.locator(`.lesson-tab[data-lesson="${editionCheck.lesson}"]`).click();
        await page.locator(`#step-list [data-step="${editionCheck.step}"]`).click();
        const deadline = Date.now() + 15000;
        while (!held && Date.now() < deadline) await new Promise((r) => setTimeout(r, 25));
        assert.ok(held, "the new scan must actually be blocked in the installer");
        // This promise resolves while the old worker is active, exposing why it
        // cannot establish readiness for the newly loaded edition.
        assert.equal(
          await page.evaluate(async () => (await navigator.serviceWorker.ready).active.state),
          "activated",
        );
        console.log(name, failOnce, "new edition installer held");
        const pendingStatus = await page.locator("#offline-state").innerText();
        assert.doesNotMatch(pendingStatus, /ready offline/);
        assert.equal(await page.locator("#step-position").innerText(), position);
        hold = false;
        if (failOnce) {
          unavailable = true;
          for (const response of pending.splice(0)) {
            response.writeHead(503);
            response.end("Source scan temporarily unavailable");
          }
          await page.waitForFunction(() =>
            /could not be saved|not saved offline/.test(
              document.querySelector("#offline-state").textContent,
            ),
          );
          assert.doesNotMatch(await page.locator("#offline-state").innerText(), /ready offline/);
          // Recover in the same open lesson on reconnect, without losing the step.
          unavailable = false;
          await context.setOffline(true);
          await context.setOffline(false);
          await page.evaluate(() => window.dispatchEvent(new Event("online")));
        } else
          await Promise.all(
            pending.splice(0).map((response) => send(response, sourceFile, current)),
          );
        await page.waitForFunction(
          () => document.querySelector("#offline-state").textContent.includes("ready offline"),
          null,
          { timeout: 30000 },
        );
        const readyStatus = await page.locator("#offline-state").innerText();
        const before = page.url();
        online = false;
        server.closeAllConnections();
        await assert.rejects(fetch(url));
        await context.setOffline(true);
        const navigation = await page.reload();
        assert.equal(navigation.fromServiceWorker(), true);
        assert.equal(page.url(), before);
        assert.equal(await page.locator(".lesson-tab").count(), editionCheck.current);
        assert.equal(await page.locator("#step-position").innerText(), position);
        await page.locator(`#current-passage [data-source="${editionCheck.source}"]`).click();
        await page.waitForFunction(() => {
          const img = document.querySelector("#source-image");
          return img.complete && img.naturalWidth > 0;
        });
        const scanHash = await page.evaluate(async () => {
          const bytes = await (
            await fetch(document.querySelector("#source-image").src)
          ).arrayBuffer();
          return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (b) =>
            b.toString(16).padStart(2, "0"),
          ).join("");
        });
        assert.equal(scanHash, expectedScanHash);
        assert.deepEqual(errors, []);
        const record = {
          browser: name,
          version: browser.version(),
          failedDownloadThenRecovered: failOnce,
          pendingStatus,
          readyStatus,
          oldReadyPromiseResolvedDuringUpdate: true,
          heldRequests: held,
          offlineReloadFromWorker: true,
          offlineLesson: editionCheck.lesson,
          offlineStep: editionCheck.step + 1,
          offlineScanSha256: scanHash,
          pageErrors: errors.length,
        };
        report.configurations.push(record);
        console.log(JSON.stringify(record));
      } finally {
        for (const response of pending) response.destroy();
        await context.close();
        server.closeAllConnections();
        await new Promise((r) => server.close(r));
      }
    }
  } finally {
    await browser.close();
  }
}
await writeFile(`docs/${editionCheck.receipt}`, `${JSON.stringify(report, null, 2)}\n`);
