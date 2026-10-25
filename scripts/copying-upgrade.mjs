import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

const previous = path.resolve(process.argv[2] ?? ""),
  current = path.resolve("dist"),
  output = path.resolve(process.argv[3] ?? "/tmp/stoicheia-copying-upgrade.json");
await mkdir(path.dirname(output), { recursive: true });
const oldWorker = await readFile(path.join(previous, "sw.js")),
  newWorker = await readFile("dist/sw.js"),
  hash = (b) => createHash("sha256").update(b).digest("hex"),
  oldEdition = /const EDITION = "([a-f0-9]+)"/.exec(oldWorker.toString())[1],
  newEdition = /const EDITION = "([a-f0-9]+)"/.exec(newWorker.toString())[1];
assert.notEqual(oldEdition, newEdition);
async function inspect(p) {
  return p.evaluate(
    () =>
      new Promise((resolve) => {
        const worker = navigator.serviceWorker.controller;
        if (!worker) {
          resolve(null);
          return;
        }
        const ch = new MessageChannel(),
          timeout = setTimeout(() => {
            ch.port1.close();
            resolve(null);
          }, 2500);
        ch.port1.onmessage = (e) => {
          clearTimeout(timeout);
          ch.port1.close();
          resolve(e.data);
        };
        worker.postMessage({ type: "STOICHEIA_INSPECT_EDITION" }, [ch.port2]);
      }),
  );
}
const rows = [];
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const b = await engine.launch();
  try {
    for (const wrong of [false, true]) {
      let root = previous,
        hold = true,
        corrupt = false,
        online = true;
      const pending = [];
      const target = "sources/heiberg-057.jpg";
      const send = async (res, file) => {
        try {
          const body = await readFile(
            path.join(root, corrupt && file === target ? "sources/heiberg-056.jpg" : file),
          );
          res
            .writeHead(200, {
              "cache-control": "no-store",
              "content-type":
                {
                  ".html": "text/html",
                  ".js": "text/javascript",
                  ".css": "text/css",
                  ".jpg": "image/jpeg",
                  ".ttf": "font/ttf",
                  ".json": "application/json",
                  ".svg": "image/svg+xml",
                }[path.extname(file)] ?? "application/octet-stream",
            })
            .end(body);
        } catch {
          res.writeHead(404).end();
        }
      };
      const server = http.createServer((req, res) => {
        if (!online) {
          req.socket.destroy();
          return;
        }
        const f =
          new URL(req.url, "http://local").pathname.replace(/^\/stoicheia\//, "") || "index.html";
        assert(!f.includes(".."));
        if (root === current && f === target && hold) {
          pending.push(res);
          return;
        }
        void send(res, f);
      });
      await new Promise((r) => server.listen(0, "127.0.0.1", r));
      const base = `http://127.0.0.1:${server.address().port}/stoicheia/`,
        c = await b.newContext({ viewport: { width: 375, height: 1000 }, acceptDownloads: true }),
        old = await c.newPage(),
        fresh = await c.newPage();
      let downloads = 0;
      fresh.on("download", () => {
        downloads++;
      });
      try {
        await old.goto(`${base}#p=21&s=9`);
        await old
          .locator("#offline-state")
          .filter({ hasText: /Edition ready offline/ })
          .waitFor({ timeout: 60000 });
        assert.equal((await inspect(old)).edition, oldEdition);
        await old.evaluate(async () => {
          window.installStates = [];
          const r = await navigator.serviceWorker.getRegistration();
          r.addEventListener("updatefound", () => {
            const w = r.installing;
            w?.addEventListener("statechange", () => window.installStates.push(w.state));
          });
        });
        root = current;
        await fresh.goto(`${base}#p=23&s=5`);
        await fresh.locator('#current-passage [data-source="57"]').click();
        for (let i = 0; i < 80 && !pending.length; i++)
          await new Promise((r) => setTimeout(r, 100));
        assert(pending.length);
        await new Promise((r) => setTimeout(r, 8500));
        assert(!(await fresh.locator("#offline-state").textContent()).includes("ready offline"));
        assert.equal((await inspect(old)).edition, oldEdition);
        hold = false;
        corrupt = wrong;
        for (const response of pending.splice(0)) await send(response, target);
        if (wrong) {
          await fresh
            .locator("#course-source-status")
            .filter({ hasText: /does not match/ })
            .waitFor();
          assert.equal(await fresh.locator("#source-image").isVisible(), false);
          await fresh.keyboard.press("Escape");
          await fresh.locator("#save-sheet").click();
          await fresh
            .locator("#save-feedback")
            .filter({ hasText: /does not match/ })
            .waitFor();
          assert.equal(downloads, 0);
          await old.waitForFunction(() => window.installStates.includes("redundant"));
          assert.equal((await inspect(old)).edition, oldEdition);
          corrupt = false;
          await fresh.evaluate(async () => {
            const r = await navigator.serviceWorker.getRegistration();
            await r.update();
          });
          await fresh.locator('#current-passage [data-source="57"]').click();
        }
        await fresh
          .locator("#course-source-status")
          .filter({ hasText: /page verified/ })
          .waitFor();
        await fresh.keyboard.press("Escape");
        await fresh
          .locator("#offline-state")
          .filter({ hasText: /Edition ready offline/ })
          .waitFor({ timeout: 60000 });
        const result = await inspect(fresh);
        assert.equal(result.edition, newEdition);
        assert.equal(result.complete, true);
        await old
          .locator("#offline-state")
          .filter({ hasText: /different edition/ })
          .waitFor();
        await old.getByRole("button", { name: "Reload saved edition" }).click();
        await old
          .locator("#offline-state")
          .filter({ hasText: /Edition ready offline/ })
          .waitFor();
        assert.equal(await old.locator("#lesson-select option").count(), 23);
        online = false;
        server.closeAllConnections();
        await c.setOffline(true);
        await fresh.reload();
        assert.match(await fresh.locator("#step-position").textContent(), /Step 6 of 7/);
        await fresh.locator('#current-passage [data-source="57"]').click();
        await fresh
          .locator("#course-source-status")
          .filter({ hasText: /page verified/ })
          .waitFor();
        await fresh.keyboard.press("Escape");
        const d = fresh.waitForEvent("download");
        await fresh.locator("#save-sheet").click();
        const saved = await d;
        await saved.saveAs(
          path.join(path.dirname(output), `${name}-${wrong ? "wrong" : "held"}-upgraded-I23.html`),
        );
        assert.equal(await saved.failure(), null);
        const cache = await fresh.evaluate(async () => {
          const keys = (await caches.keys()).filter((k) => k.startsWith("stoicheia-"));
          return {
            keys,
            files: (await (await caches.open(keys[0])).keys()).map((r) => new URL(r.url).pathname),
          };
        });
        assert.deepEqual(cache.keys, [`stoicheia-${newEdition}`]);
        assert(cache.files.includes("/stoicheia/sources/heiberg-057.jpg"));
        await fresh.evaluate(async (edition) => {
          await caches.delete(`stoicheia-${edition}`);
        }, newEdition);
        assert.equal((await inspect(fresh)).complete, false);
        assert.equal(
          await fresh.evaluate(
            async (edition) => (await caches.keys()).includes(`stoicheia-${edition}`),
            newEdition,
          ),
          false,
        );
        rows.push({
          browser: name,
          version: b.version(),
          wrongPageThenRecovery: wrong,
          oldEdition,
          newEdition,
          heldMilliseconds: 8500,
          inspectionDoesNotRecreateDeletedCache: true,
          oldCompleteWorkerRetained: true,
          newPageNotReadyPrematurely: true,
          existingTabAcknowledgedAndReloaded: true,
          newCoursePropositions: 23,
          originDisabledStudyAndSource: true,
          cache,
        });
        console.log(
          `${name}/${wrong ? "wrong page" : "held page"}: existing edition retained, new course and native study work after stopped-origin upgrade.`,
        );
      } finally {
        for (const response of pending) response.destroy();
        await c.close();
        server.closeAllConnections();
        await new Promise((r) => server.close(r));
      }
    }
  } finally {
    await b.close();
  }
}
await writeFile(
  output,
  `${JSON.stringify({ checkedAt: new Date().toISOString(), scope: "Actual previous I.1-21 seven-room edition to I.1-23 seven-room edition; held/substituted new page, old tabs, current controller and origin-disabled native source/study", previousWorkerSha256: hash(oldWorker), currentWorkerSha256: hash(newWorker), rows }, null, 2)}\n`,
);
