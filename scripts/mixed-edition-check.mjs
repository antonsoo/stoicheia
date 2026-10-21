// biome-ignore-all lint/performance/useDomNodeTextContent: Compare the readiness promise with a real offline reader.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { chromium, firefox } from "playwright";

const [oldPath, currentPath, mode] = process.argv.slice(2);
assert.ok(oldPath && currentPath, "Pass the six-proposition and current build directories.");
const previous = resolve(oldPath);
const current = resolve(currentPath);
const before = mode === "--before";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const index = await readFile(join(current, "index.html"));
const oldIndex = await readFile(join(previous, "index.html"));
const scan = await readFile(join(current, "sources/heiberg-031.jpg"));
const otherScan = await readFile(join(current, "sources/heiberg-030.jpg"));
assert.notEqual(hash(index), hash(oldIndex));
assert.notEqual(hash(scan), hash(otherScan));
const report = {
  scope:
    "Controlled mixed HTTP 200 responses during installation, not an observed public-host incident",
  phase: before ? "reproduced before" : "corrected after",
  workerSha256: hash(await readFile(join(current, "sw.js"))),
  substitutions: {
    index: { expectedSha256: hash(index), receivedSha256: hash(oldIndex) },
    source: { expectedSha256: hash(scan), receivedSha256: hash(otherScan) },
  },
  configurations: [],
};
for (const [name, type] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await type.launch();
  try {
    for (const substitution of ["index", "source"]) {
      let online = true,
        mixed = true,
        substitutions = 0;
      const server = createServer(async (request, response) => {
        if (!online) {
          request.socket.destroy();
          return;
        }
        const pathname = new URL(request.url, "http://localhost").pathname;
        if (!pathname.startsWith("/stoicheia/")) {
          response.writeHead(404).end();
          return;
        }
        const relative = pathname.slice("/stoicheia/".length);
        const path = relative || "index.html";
        try {
          let bytes;
          // Navigation at the directory URL receives the new reader. Its worker
          // independently fetches index.html and the named source page.
          if (mixed && substitution === "index" && relative === "index.html") {
            bytes = oldIndex;
            substitutions++;
          } else if (mixed && substitution === "source" && path === "sources/heiberg-031.jpg") {
            bytes = otherScan;
            substitutions++;
          } else bytes = await readFile(join(current, path));
          response.writeHead(200, {
            "Content-Type":
              {
                ".html": "text/html",
                ".js": "text/javascript",
                ".css": "text/css",
                ".jpg": "image/jpeg",
                ".json": "application/json",
                ".ttf": "font/ttf",
                ".svg": "image/svg+xml",
              }[extname(path)] ?? "application/octet-stream",
            "Cache-Control": "no-store",
          });
          response.end(bytes);
        } catch {
          response.writeHead(404).end();
        }
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const base = `http://127.0.0.1:${server.address().port}/stoicheia/`;
      const context = await browser.newContext();
      try {
        const page = await context.newPage();
        const pageErrors = [];
        page.on("pageerror", (error) => pageErrors.push(String(error)));
        await page.goto(`${base}#p=10&s=6`);
        await page.waitForFunction(() => {
          const status = document.querySelector("#offline-state")?.textContent;
          return status?.includes("ready offline") || status?.includes("could not be saved");
        });
        assert.ok(substitutions > 0);
        const status = await page.locator("#offline-state").innerText();
        const record = {
          browser: name,
          version: browser.version(),
          substitution,
          substitutions,
          status,
        };
        if (before) {
          assert.match(status, /ready offline/);
        } else {
          assert.match(status, /could not be saved/);
          assert.equal(
            await page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
            false,
          );
          assert.equal(await page.locator("#step-position").innerText(), "Step 7 of 8");
          mixed = false;
          await context.setOffline(true);
          await context.setOffline(false);
          await page.evaluate(() => window.dispatchEvent(new Event("online")));
          await page.waitForFunction(() =>
            document.querySelector("#offline-state")?.textContent?.includes("ready offline"),
          );
          record.recoveredAfterCorrectResponses = true;
        }
        online = false;
        server.closeAllConnections();
        await assert.rejects(fetch(base));
        await context.setOffline(true);
        const reload = await page.reload();
        assert.equal(reload.fromServiceWorker(), true);
        record.offlineReloadFromWorker = true;
        record.offlineIndexSha256 = hash(await reload.body());
        if (before && substitution === "index") {
          assert.equal(record.offlineIndexSha256, hash(oldIndex));
          assert.equal(await page.locator("#step-position").count(), 0);
          record.readerMissingAfterReload = true;
        } else {
          assert.equal(record.offlineIndexSha256, hash(index));
          assert.equal(await page.locator("#step-position").innerText(), "Step 7 of 8");
          await page.locator('#current-passage [data-source="31"]').click();
          await page.waitForFunction(() => {
            const image = document.querySelector("#source-image");
            return image?.complete && image.naturalWidth > 0;
          });
          record.offlineSourceSha256 = await page.evaluate(async () => {
            const bytes = await (
              await fetch(document.querySelector("#source-image").src)
            ).arrayBuffer();
            return Array.from(
              new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
              (value) => value.toString(16).padStart(2, "0"),
            ).join("");
          });
          assert.equal(record.offlineSourceSha256, hash(before ? otherScan : scan));
          record.sourcePageCorrect = !before;
        }
        if (!before) assert.deepEqual(pageErrors, []);
        record.pageErrors = pageErrors;
        report.configurations.push(record);
        console.log(JSON.stringify(record));
      } finally {
        await context.close();
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
      }
    }
  } finally {
    await browser.close();
  }
}
await writeFile(
  `docs/mixed-edition-${before ? "before" : "verification"}.json`,
  `${JSON.stringify(report, null, 2)}\n`,
);
