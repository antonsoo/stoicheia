import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

if (!process.argv[2]) throw new Error("Pass the pre-measure production dist directory.");
const previous = path.resolve(process.argv[2]),
  current = path.resolve("dist");
const output = process.argv[3] ?? "/tmp/measure-upgrade.json";
const digest = (b) => createHash("sha256").update(b).digest("hex");
const target = "sources/measure/heiberg-013.jpg";
const report = {
  checkedAt: new Date().toISOString(),
  scope:
    "Actual six-room edition to seven rooms; held/substituted new source, export refusal, existing-tab controller transition and origin-disabled recovery",
  previousWorker: digest(await readFile(path.join(previous, "sw.js"))),
  currentWorker: digest(await readFile("dist/sw.js")),
  configurations: [],
};
assert.notEqual(report.previousWorker, report.currentWorker);
for (const engine of [chromium, firefox]) {
  const browser = await engine.launch();
  try {
    for (const substitute of [false, true]) {
      let root = previous,
        online = true,
        hold = true,
        corrupt = false,
        held = 0;
      const pending = [];
      const send = async (res, file) => {
        try {
          const actual = corrupt && file === target ? "sources/measure/heiberg-012.jpg" : file;
          const bytes = await readFile(path.join(root, actual));
          const type =
            {
              ".html": "text/html",
              ".css": "text/css",
              ".js": "text/javascript",
              ".jpg": "image/jpeg",
              ".json": "application/json",
              ".ttf": "font/ttf",
              ".svg": "image/svg+xml",
            }[path.extname(actual)] ?? "text/plain";
          res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" }).end(bytes);
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
        assert(!file.includes(".."));
        if (root === current && file === target && hold) {
          held++;
          pending.push(res);
          return;
        }
        void send(res, file);
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const base = `http://127.0.0.1:${server.address().port}/stoicheia/`;
      const context = await browser.newContext({ acceptDownloads: true }),
        old = await context.newPage(),
        fresh = await context.newPage();
      try {
        await old.goto(base);
        await old.locator("#offline-state").filter({ hasText: "Edition ready offline" }).waitFor();
        assert.equal(await old.locator('a[href="./measure.html"]').count(), 0);
        root = current;
        await fresh.goto(`${base}measure.html#page=13`);
        await fresh.waitForFunction(() =>
          document
            .querySelector("#mr-source-status")
            ?.textContent.includes("Verifying printed p.13"),
        );
        const deadline = Date.now() + 10000;
        while (held < 2 && Date.now() < deadline)
          await new Promise((resolve) => setTimeout(resolve, 25));
        assert(held >= 2, "Both visible source and new worker requested the held page");
        assert.doesNotMatch(await fresh.locator("#mr-offline").textContent(), /ready offline/);
        assert.equal(await fresh.locator("#mr-source-image").isVisible(), false);
        hold = false;
        corrupt = substitute;
        await Promise.all(pending.splice(0).map((res) => send(res, target)));
        if (substitute) {
          await fresh.locator("#mr-offline").filter({ hasText: "could not be saved" }).waitFor();
          await fresh
            .locator("#mr-source-status")
            .filter({ hasText: "does not match this edition" })
            .waitFor();
          let downloads = 0;
          fresh.on("download", () => downloads++);
          await fresh.locator("#mr-save").click();
          await fresh
            .locator("#mr-save-status")
            .filter({ hasText: "does not match this edition" })
            .waitFor();
          assert.equal(downloads, 0);
          assert.equal(await fresh.locator("#mr-source-image").isVisible(), false);
          corrupt = false;
          await fresh.evaluate(() => dispatchEvent(new Event("online")));
          await fresh.locator("#mr-page").selectOption("12");
          await fresh.locator("#mr-page").selectOption("13");
        }
        await fresh.locator("#mr-source-status").filter({ hasText: "Verified p.13" }).waitFor();
        await fresh
          .locator("#mr-offline")
          .filter({ hasText: "Edition ready offline" })
          .waitFor({ timeout: 60000 });
        await old.locator("#reload-edition").waitFor();
        assert.doesNotMatch(await old.locator("#offline-state").textContent(), /ready offline/);
        await old.locator("#reload-edition").click();
        await old.locator("#offline-state").filter({ hasText: "Edition ready offline" }).waitFor();
        assert.equal(await old.locator('a[href="./measure.html"]').count(), 1);
        online = false;
        server.closeAllConnections();
        await context.setOffline(true);
        await fresh.reload();
        await fresh.locator("#mr-source-status").filter({ hasText: "Verified p.13" }).waitFor();
        await fresh.locator("#mr-offline").filter({ hasText: "Edition ready offline" }).waitFor();
        await fresh.locator("#mr-fit").click();
        assert.match(await fresh.locator("#mr-status").textContent(), /positive remainder/);
        const inventory = await fresh.evaluate(async () => {
          const cachesHere = await caches.keys(),
            key = cachesHere.find((k) => k.startsWith("stoicheia-"));
          return {
            caches: cachesHere,
            files: (await (await caches.open(key)).keys()).map((req) => new URL(req.url).pathname),
          };
        });
        assert.equal(inventory.caches.length, 1);
        assert(inventory.files.includes("/stoicheia/measure.html"));
        for (let p = 2; p <= 13; p++)
          assert(
            inventory.files.includes(
              `/stoicheia/sources/measure/heiberg-${String(p).padStart(3, "0")}.jpg`,
            ),
          );
        report.configurations.push({
          engine: engine.name(),
          substitutedSource: substitute,
          heldSourceRequests: held,
          refusedSubstitutedSourceAndExport: substitute,
          oldTabReloaded: true,
          cacheCount: inventory.caches.length,
          cachedFiles: inventory.files.length,
          originDisabledMeasurement: true,
        });
        console.log(
          `${engine.name()} ${substitute ? "substituted then restored" : "held then released"}: source, edition transition and offline measurement passed`,
        );
      } finally {
        for (const res of pending) res.destroy();
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
