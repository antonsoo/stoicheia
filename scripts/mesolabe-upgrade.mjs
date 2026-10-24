import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

if (!process.argv[2]) throw new Error("Pass the previous four-room dist directory.");
const previous = path.resolve(process.argv[2]),
  current = path.resolve("dist");
const output = process.argv[3] ?? "/tmp/stoicheia-mesolabe-upgrade.json";
const heldFile = "sources/mesolabe/eutocius-102.jpg";
const digest = (b) => createHash("sha256").update(b).digest("hex");
const edition = async (root) =>
  /const EDITION = "([a-f0-9]+)"/.exec(await readFile(path.join(root, "sw.js"), "utf8"))?.[1];
const oldEdition = await edition(previous),
  newEdition = await edition(current);
assert(oldEdition && newEdition && oldEdition !== newEdition);
const report = {
  oldEdition,
  newEdition,
  scope:
    "Existing four-room tab, new five-room tab, held new image, failed-and-retried install, origin-disabled navigation",
  configurations: [],
};
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const fail of [false, true]) {
      let root = previous,
        online = true,
        hold = true,
        unavailable = false,
        held = 0;
      const pending = [];
      const send = async (res, file) => {
        try {
          const bytes = await readFile(path.join(root, file));
          res
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
          res.writeHead(404).end();
        }
      };
      const server = createServer((req, res) => {
        if (!online) {
          req.socket.destroy();
          return;
        }
        const file =
          new URL(req.url, "http://local").pathname.slice("/stoicheia/".length) || "index.html";
        if (root === current && file === heldFile) {
          if (unavailable) {
            res.writeHead(503).end();
            return;
          }
          if (hold) {
            held++;
            pending.push(res);
            return;
          }
        }
        void send(res, file);
      });
      await new Promise((r) => server.listen(0, "127.0.0.1", r));
      const base = `http://127.0.0.1:${server.address().port}/stoicheia/`,
        ctx = await browser.newContext();
      const old = await ctx.newPage(),
        errors = [];
      old.on("pageerror", (e) => errors.push(String(e)));
      try {
        await old.goto(base);
        await old
          .locator("#offline-state")
          .filter({ hasText: /ready offline/ })
          .waitFor();
        root = current;
        const page = await ctx.newPage();
        page.on("pageerror", (e) => errors.push(String(e)));
        await page.goto(`${base}mesolabe.html#r=3&m=ideal`);
        await page.locator("#ml-machine svg").waitFor();
        const deadline = Date.now() + 15000;
        while (!held && Date.now() < deadline) await new Promise((r) => setTimeout(r, 20));
        assert(held > 0);
        const status = await page.locator("#ml-offline").textContent();
        assert.doesNotMatch(status, /ready offline/);
        const activeEdition = await page.evaluate(async () => {
          const r = await navigator.serviceWorker.getRegistration();
          return await new Promise((resolve) => {
            const ch = new MessageChannel();
            ch.port1.onmessage = (e) => resolve(e.data.edition);
            r.active.postMessage({ type: "STOICHEIA_INSPECT_EDITION" }, [ch.port2]);
          });
        });
        assert.equal(activeEdition, oldEdition);
        hold = false;
        if (fail) {
          unavailable = true;
          for (const res of pending.splice(0)) res.writeHead(503).end();
          await page
            .locator("#ml-offline")
            .filter({ hasText: /could not be saved|not saved offline/ })
            .waitFor();
          assert.equal(await page.locator("#ml-reload").isVisible(), false);
          unavailable = false;
          await page.evaluate(() => dispatchEvent(new Event("online")));
        } else await Promise.all(pending.splice(0).map((res) => send(res, heldFile)));
        await page
          .locator("#ml-offline")
          .filter({ hasText: /ready offline/ })
          .waitFor();
        await old.locator("#reload-edition").waitFor({ state: "visible" });
        assert.match(await old.locator("#offline-state").textContent(), /different edition/);
        online = false;
        server.closeAllConnections();
        await assert.rejects(fetch(base));
        await old.locator("#reload-edition").click();
        await old.getByRole("link", { name: /Twice the stone/ }).waitFor();
        await old
          .locator("#offline-state")
          .filter({ hasText: /ready offline/ })
          .waitFor();
        await page.reload();
        assert.match(await page.locator("#ml-volume").textContent(), /Volume 3 ×/);
        await page.locator("#ml-page").selectOption("102");
        const savedHash = await page.evaluate(async () => {
          const bytes = await (
            await fetch(document.querySelector("#ml-source-image").src)
          ).arrayBuffer();
          return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        });
        assert.equal(savedHash, digest(await readFile(path.join(current, heldFile))));
        const caches = await page.evaluate(async () =>
          Promise.all(
            (await globalThis.caches.keys()).map(async (name) => ({
              name,
              count: (await (await globalThis.caches.open(name)).keys()).length,
            })),
          ),
        );
        assert.equal(caches.length, 1);
        assert.equal(caches[0].name, `stoicheia-${newEdition}`);
        assert.deepEqual(errors, []);
        report.configurations.push({
          browser: name,
          failedAndRecovered: fail,
          heldImage: heldFile,
          heldRequests: held,
          pendingStatus: status,
          oldActiveEditionWhileHeld: activeEdition,
          existingTabReloadOffer: true,
          oldTabReloadsNewCourseOffline: true,
          newRoomPreservesFactorOffline: 3,
          sourceSha256: savedHash,
          caches,
          errors,
        });
        console.log(
          `${name}: ${fail ? "failed installation and recovery" : "held installation"}; existing tab and new room verified offline`,
        );
      } finally {
        for (const res of pending) res.destroy();
        await ctx.close();
        server.closeAllConnections();
        await new Promise((r) => server.close(r));
      }
    }
  } finally {
    await browser.close();
  }
}
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
