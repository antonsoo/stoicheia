import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

const before = process.argv[2],
  output = process.argv[3] ?? "/tmp/stoicheia-offline-claim.json";
const report = {
  method:
    "Simulate a navigation missed by the activation claim: suppress only the worker's initial claim; retain message handler and complete build inventory. Compare old and repaired helpers.",
  configurations: [],
};
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const [label, directory] of [...(before ? [["before", before]] : []), ["after", "dist"]]) {
      const root = path.resolve(directory);
      let suppressed = 0,
        online = true;
      const server = createServer(async (req, res) => {
        if (!online) {
          req.socket.destroy();
          return;
        }
        try {
          const file =
            new URL(req.url, "http://local").pathname.slice("/stoicheia/".length) || "index.html";
          let data = await readFile(path.join(root, file));
          if (file === "sw.js") {
            const original = data.toString(),
              needle = ".then(() => self.clients.claim()));";
            assert(original.includes(needle));
            data = Buffer.from(original.replace(needle, ".then(() => undefined));"));
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
            .end(data);
        } catch {
          res.writeHead(404).end();
        }
      });
      await new Promise((r) => server.listen(0, "127.0.0.1", r));
      const base = `http://127.0.0.1:${server.address().port}/stoicheia/`,
        ctx = await browser.newContext(),
        page = await ctx.newPage();
      try {
        await page.goto(`${base}mesolabe.html`);
        await page.waitForFunction(
          async () =>
            (await navigator.serviceWorker.getRegistration())?.active?.state === "activated",
        );
        if (label === "after")
          await page
            .locator("#ml-offline")
            .filter({ hasText: /ready offline/ })
            .waitFor();
        else await page.waitForTimeout(1000);
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
        if (label === "before") {
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
          initialClaimSuppressed: true,
          ...evidence,
          originDisabledReload: label === "after",
        });
        console.log(`${name} ${label}: ${evidence.status}`);
      } finally {
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
