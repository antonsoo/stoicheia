// biome-ignore-all lint/performance/useDomNodeTextContent: Inspect edition readiness shown to the learner.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { chromium, firefox } from "playwright";

if (!process.argv[2]) throw new Error("Pass the previous two-page dist directory.");
const previous = resolve(process.argv[2]),
  current = resolve(process.argv[3] ?? "dist");
const output = process.argv[4] ?? "/tmp/stoicheia-quadrature-upgrade.json";
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const sourceFile = "sources/heiberg-162.jpg",
  sourceHash = digest(await readFile(join(current, sourceFile)));
const report = {
  previousWorker: digest(await readFile(join(previous, "sw.js"))),
  currentWorker: digest(await readFile(join(current, "sw.js"))),
  scope:
    "Two-page edition to quadrature, with a new source held or substituted; origin-disabled navigation after recovery",
  configurations: [],
};
assert.notEqual(report.previousWorker, report.currentWorker);
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const fail of [false, true]) {
      let edition = previous,
        online = true,
        hold = true,
        unavailable = false,
        held = 0;
      const pending = [];
      const send = async (response, path) => {
        try {
          const bytes = await readFile(join(edition, path));
          response.writeHead(200, {
            "Content-Type":
              {
                ".html": "text/html",
                ".js": "text/javascript",
                ".css": "text/css",
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
      };
      const server = createServer((request, response) => {
        if (!online) {
          request.socket.destroy();
          return;
        }
        const path =
          new URL(request.url, "http://localhost").pathname.slice("/stoicheia/".length) ||
          "index.html";
        if (edition === current && path === sourceFile && unavailable) {
          response.writeHead(200, { "Content-Type": "image/jpeg" });
          response.end("Substituted bytes must fail the edition integrity check");
          return;
        }
        if (edition === current && path === sourceFile && hold) {
          held++;
          pending.push(response);
          return;
        }
        void send(response, path);
      });
      await new Promise((r) => server.listen(0, "127.0.0.1", r));
      const base = `http://127.0.0.1:${server.address().port}/stoicheia/`;
      const context = await browser.newContext(),
        page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      try {
        await page.goto(base);
        await page.waitForFunction(() =>
          document.querySelector("#offline-state").textContent.includes("ready offline"),
        );
        assert.equal(await page.locator(".lesson-tab").count(), 21);
        edition = current;
        await page.goto(`${base}quadrature.html#a=110&b=20&s=4&m=100&c=1&k=0&r=8`);
        const deadline = Date.now() + 15000;
        while (!held && Date.now() < deadline) await new Promise((r) => setTimeout(r, 25));
        assert.ok(held);
        assert.equal(
          await page.evaluate(async () => (await navigator.serviceWorker.ready).active.state),
          "activated",
        );
        const pendingStatus = await page.locator("#qa-offline").innerText();
        assert.doesNotMatch(pendingStatus, /ready offline/);
        assert.match(await page.locator("#qa-result").innerText(), /Same area: 22 u²/);
        hold = false;
        if (fail) {
          unavailable = true;
          for (const response of pending.splice(0)) {
            response.writeHead(200, { "Content-Type": "image/jpeg" });
            response.end("Substituted bytes must fail the edition integrity check");
          }
          await page.waitForFunction(() =>
            /could not be saved|not saved offline/.test(
              document.querySelector("#qa-offline").textContent,
            ),
          );
          online = false;
          server.closeAllConnections();
          await assert.rejects(fetch(base));
          await context.setOffline(true);
          await page.goto(base);
          await page.locator(".lesson-tab").first().waitFor();
          assert.equal(await page.locator(".lesson-tab").count(), 21);
          await page.goto(`${base}triangle.html`);
          assert.equal(await page.locator("#givens-title").innerText(), "Choose the three givens");
          unavailable = false;
          online = true;
          await context.setOffline(false);
          await page.goto(`${base}quadrature.html#a=110&b=20&s=4&m=100&c=1&k=0&r=8`);
          await page.evaluate(() => window.dispatchEvent(new Event("online")));
        } else await Promise.all(pending.splice(0).map((response) => send(response, sourceFile)));
        await page.waitForFunction(() =>
          document.querySelector("#qa-offline").textContent.includes("ready offline"),
        );
        online = false;
        server.closeAllConnections();
        await assert.rejects(fetch(base));
        await context.setOffline(true);
        const navigation = await page.reload();
        assert.equal(navigation.fromServiceWorker(), true);
        assert.equal(await page.locator("#qa-a").inputValue(), "11");
        await page.locator("#qa-source-page").selectOption("162");
        await page.locator("#qa-source-image").scrollIntoViewIfNeeded();
        await page.waitForFunction(() => {
          const img = document.querySelector("#qa-source-image");
          return img.complete && img.naturalWidth > 0;
        });
        const hash = await page.evaluate(async () => {
          const bytes = await (
            await fetch(document.querySelector("#qa-source-image").src)
          ).arrayBuffer();
          return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (n) =>
            n.toString(16).padStart(2, "0"),
          ).join("");
        });
        assert.equal(hash, sourceHash);
        await page.goto(`${base}#p=21&s=9`);
        assert.equal(await page.locator(".lesson-tab").count(), 21);
        await page.locator('a[href="./triangle.html"]').click();
        assert.equal(await page.locator("#givens-title").innerText(), "Choose the three givens");
        await page.locator('a[href="./quadrature.html"]').click();
        assert.match(await page.locator("h1").innerText(), /nothing added/);
        assert.deepEqual(errors, []);
        report.configurations.push({
          browser: name,
          version: browser.version(),
          substitutionRejectedAndRecovered: fail,
          heldRequests: held,
          pendingStatus,
          offlineQuadrature: true,
          offlineTriangle: true,
          offlineReader: true,
          offlineScanSha256: hash,
        });
        console.log(
          `${name} ${fail ? "failure and recovery" : "held installation"}: all three offline pages passed`,
        );
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
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
