import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

const before = process.argv[2],
  output = process.argv[3] ?? "/tmp/stoicheia-offline-claim.json",
  intermediate = process.argv[4];
async function until(predicate, description) {
  const end = Date.now() + 12000;
  while (Date.now() < end) {
    const result = await predicate();
    if (result) return result;
    await new Promise((r) => setTimeout(r, 20));
  }
  throw new Error(`Timed out: ${description}`);
}
async function workerState(page) {
  return page.evaluate(
    async () => (await navigator.serviceWorker.getRegistration())?.active?.state ?? null,
  );
}
const report = {
  method:
    "Missed activation claim: suppress the initial claim only. For the activating gap, start navigation during installation, hold its HTML, finish caching, then release the HTML during a deliberately prolonged activation. Observe actual browser registration/controller states.",
  configurations: [],
};
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const [label, directory, gap] of [
      ...(before
        ? [
            ["before", before, "activated"],
            ["before", before, "activating"],
          ]
        : []),
      ...(intermediate
        ? [
            ["intermediate", intermediate, "activated"],
            ["intermediate", intermediate, "activating"],
          ]
        : []),
      ["after", "dist", "activated"],
      ["after", "dist", "activating"],
    ]) {
      const root = path.resolve(directory),
        heldFile = "sources/mesolabe/eutocius-102.jpg";
      let online = true,
        sourceHeld = gap === "activating",
        navigationHeld = gap === "activating",
        suppressed = 0;
      const sourceResponses = [],
        navigationResponses = [];
      const send = async (res, file) => {
        if (file === "monitor.html") {
          res
            .writeHead(200, { "Content-Type": "text/html" })
            .end("<!doctype html><title>Registration state observer</title>");
          return;
        }
        try {
          let bytes = await readFile(path.join(root, file));
          if (file === "sw.js") {
            const original = bytes.toString(),
              needle = ".then(() => self.clients.claim()));";
            assert(original.includes(needle));
            bytes = Buffer.from(
              original.replace(
                needle,
                gap === "activating"
                  ? ".then(() => new Promise(resolve => setTimeout(resolve, 3000))));"
                  : ".then(() => undefined));",
              ),
            );
            suppressed++;
          }
          res
            .writeHead(200, {
              "Content-Type":
                {
                  ".html": "text/html",
                  ".js": "text/javascript",
                  ".css": "text/css",
                  ".jpg": "image/jpeg",
                  ".json": "application/json",
                  ".svg": "image/svg+xml",
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
        if (sourceHeld && file === heldFile) {
          sourceResponses.push(res);
          return;
        }
        if (
          navigationHeld &&
          file === "mesolabe.html" &&
          (req.headers["sec-fetch-dest"] === "document" ||
            req.headers["sec-fetch-mode"] === "navigate")
        ) {
          navigationResponses.push(res);
          return;
        }
        void send(res, file);
      });
      await new Promise((r) => server.listen(0, "127.0.0.1", r));
      const base = `http://127.0.0.1:${server.address().port}/stoicheia/`,
        ctx = await browser.newContext(),
        page = await ctx.newPage(),
        monitor = await ctx.newPage();
      try {
        await monitor.goto(`${base}monitor.html`);
        if (gap === "activating") {
          await page.goto(base);
          await until(() => sourceResponses.length > 0, "initial install held on source image");
          const navigating = page.goto(`${base}mesolabe.html`);
          await until(() => navigationResponses.length > 0, "navigation began before activation");
          sourceHeld = false;
          await Promise.all(sourceResponses.splice(0).map((res) => send(res, heldFile)));
          await until(
            async () => (await workerState(monitor)) === "activating",
            "worker entered held activation",
          );
          navigationHeld = false;
          await Promise.all(navigationResponses.splice(0).map((res) => send(res, "mesolabe.html")));
          await navigating;
        } else await page.goto(`${base}mesolabe.html`);
        const stateOnArrival = await workerState(page);
        if (gap === "activating") assert.equal(stateOnArrival, "activating");
        await until(async () => (await workerState(monitor)) === "activated", "worker activated");
        const expectRecovery =
          label === "after" || (label === "intermediate" && gap === "activated");
        if (expectRecovery)
          await page
            .locator("#ml-offline")
            .filter({ hasText: /ready offline/ })
            .waitFor();
        else await page.waitForTimeout(300);
        const evidence = await page.evaluate(async () => {
          const r = await navigator.serviceWorker.getRegistration();
          return {
            controller: navigator.serviceWorker.controller?.state ?? null,
            active: r.active.state,
            status: document.querySelector("#ml-offline").textContent,
            caches: await Promise.all(
              (await caches.keys()).map(async (n) => ({
                name: n,
                count: (await (await caches.open(n)).keys()).length,
              })),
            ),
          };
        });
        assert(suppressed > 0);
        assert.equal(evidence.active, "activated");
        if (!expectRecovery) {
          assert.equal(evidence.controller, null);
          assert.doesNotMatch(evidence.status, /ready offline/);
        } else {
          assert.equal(evidence.controller, "activated");
          assert.match(evidence.status, /ready offline/);
          online = false;
          server.closeAllConnections();
          await assert.rejects(fetch(base));
          await page.reload();
          await page.locator("#ml-machine svg").waitFor();
          await page
            .locator("#ml-offline")
            .filter({ hasText: /ready offline/ })
            .waitFor();
        }
        report.configurations.push({
          browser: name,
          phase: label,
          gap,
          stateOnArrival,
          initialClaimSuppressed: true,
          ...evidence,
          originDisabledReload: expectRecovery,
        });
        console.log(`${name} ${label} ${gap}: ${evidence.status}`);
      } finally {
        for (const res of [...sourceResponses, ...navigationResponses]) res.destroy();
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
