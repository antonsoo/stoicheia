import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

if (!process.argv[2]) throw new Error("Pass the pre-desk production dist directory.");
const previous = path.resolve(process.argv[2]),
  current = path.resolve(process.argv[3] ?? "dist");
const output = process.argv[4] ?? "/tmp/desk-upgrade.json";
// Hold a source page this edition must download. Since 408ce61 the new worker reuses
// cached files whose bytes still match, so a page the earlier edition already saved
// (heiberg-015.jpg before) is never requested.
const absent = (file) =>
  access(path.join(previous, file)).then(
    () => false,
    () => true,
  );
const sources = (await readdir(path.join(current, "sources"), { recursive: true }))
  .filter((file) => file.endsWith(".jpg"))
  .map((file) => `sources/${file.split(path.sep).join("/")}`)
  .sort();
let target;
for (const file of sources)
  if (await absent(file)) {
    target = file;
    break;
  }
assert(target, "the current edition must add at least one source page");
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const report = {
  scope:
    "Pre-desk five-room edition to six rooms; held or failed source install; existing-tab controller transition; disabled-origin construction after recovery.",
  previousWorker: digest(await readFile(path.join(previous, "sw.js"))),
  currentWorker: digest(await readFile(path.join(current, "sw.js"))),
  configurations: [],
};
assert.notEqual(report.previousWorker, report.currentWorker);
for (const [name, type] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await type.launch();
  try {
    for (const fail of [false, true]) {
      let edition = previous,
        online = true,
        hold = true,
        unavailable = false,
        held = 0;
      const pending = [];
      const send = async (response, file) => {
        try {
          const bytes = await readFile(path.join(edition, file));
          response
            .writeHead(200, {
              "Content-Type":
                {
                  ".html": "text/html",
                  ".js": "text/javascript",
                  ".css": "text/css",
                  ".jpg": "image/jpeg",
                  ".svg": "image/svg+xml",
                  ".json": "application/json",
                  ".ttf": "font/ttf",
                }[path.extname(file)] ?? "application/octet-stream",
              "Cache-Control": "no-store",
            })
            .end(bytes);
        } catch {
          response.writeHead(404).end();
        }
      };
      const server = createServer((request, response) => {
        if (!online) {
          request.socket.destroy();
          return;
        }
        const file =
          new URL(request.url, "http://local").pathname.slice("/stoicheia/".length) || "index.html";
        if (edition === current && file === target) {
          if (unavailable) {
            response.writeHead(503).end();
            return;
          }
          if (hold) {
            held++;
            pending.push(response);
            return;
          }
        }
        void send(response, file);
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const base = `http://127.0.0.1:${server.address().port}/stoicheia/`;
      const context = await browser.newContext(),
        old = await context.newPage(),
        desk = await context.newPage();
      try {
        await old.goto(base);
        await old
          .locator("#offline-state")
          .filter({ hasText: /Edition ready offline/ })
          .waitFor();
        assert.equal(await old.locator('a[href="./desk.html"]').count(), 0);
        edition = current;
        await desk.goto(`${base}desk.html`);
        await desk.waitForFunction(() => document.querySelector("#dk-offline"));
        // Since 408ce61 the install verifies each file as it goes, so it can reach this
        // page later than 10 s after the desk opens.
        const started = Date.now(),
          deadline = started + 60000;
        while (!held && Date.now() < deadline)
          await new Promise((resolve) => setTimeout(resolve, 25));
        assert(held > 0, "new worker must attempt the held source page");
        console.log(
          `${name} ${fail ? "failed" : "held"}: held page requested after ${Date.now() - started} ms`,
        );
        assert.doesNotMatch(await desk.locator("#dk-offline").textContent(), /ready offline/);
        hold = false;
        if (fail) {
          unavailable = true;
          for (const response of pending.splice(0)) response.writeHead(503).end();
          await desk
            .locator("#dk-offline")
            .filter({ hasText: /could not be saved/ })
            .waitFor();
          unavailable = false;
          await desk.evaluate(() => dispatchEvent(new Event("online")));
        } else await Promise.all(pending.splice(0).map((response) => send(response, target)));
        await desk
          .locator("#dk-offline")
          .filter({ hasText: /Edition ready offline/ })
          .waitFor({ timeout: 60000 });
        await old.locator("#reload-edition").waitFor();
        assert.doesNotMatch(await old.locator("#offline-state").textContent(), /ready offline/);
        await old.locator("#reload-edition").click();
        await old
          .locator("#offline-state")
          .filter({ hasText: /Edition ready offline/ })
          .waitFor();
        assert.equal(await old.locator('a[href="./desk.html"]').count(), 1);
        online = false;
        server.closeAllConnections();
        await context.setOffline(true);
        await desk.reload();
        await desk
          .locator("#dk-offline")
          .filter({ hasText: /Edition ready offline/ })
          .waitFor();
        await desk.locator("#dk-draw").click();
        assert.match(await desk.locator("#dk-position").textContent(), /Operation 1 of 1/);
        const inventory = await desk.evaluate(async () => {
          const keys = await caches.keys(),
            key = keys.find((key) => key.startsWith("stoicheia-"));
          return {
            caches: keys,
            files: (await (await caches.open(key)).keys()).map((req) => new URL(req.url).pathname),
          };
        });
        assert(inventory.files.includes("/stoicheia/desk.html"));
        assert(inventory.files.includes("/stoicheia/sources/heiberg-015.jpg"));
        assert(inventory.files.includes(`/stoicheia/${target}`));
        report.configurations.push({
          browser: name,
          failedInstallRecovered: fail,
          heldSource: target,
          heldSourceRequests: held,
          oldTabReloaded: true,
          currentCaches: inventory.caches.length,
          cachedFiles: inventory.files.length,
          offlineConstruction: true,
        });
        console.log(
          `${name}, source ${fail ? "failed then recovered" : "held then released"}: edition transition and offline construction verified`,
        );
      } finally {
        for (const response of pending) response.destroy();
        await context.close();
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
      }
    }
  } finally {
    await browser.close();
  }
}
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
