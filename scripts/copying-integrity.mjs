import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

const output = path.resolve(process.argv[2] ?? "/tmp/stoicheia-copying-integrity.json");
await mkdir(path.dirname(output), { recursive: true });
const results = [];
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const b = await engine.launch();
  try {
    for (const mode of ["hold-new", "wrong-new", "wrong-existing"]) {
      const target = mode === "wrong-existing" ? 53 : 57,
        other = target - 1;
      let fault = true,
        pending = [],
        bad = 0;
      const server = http.createServer(async (req, res) => {
        try {
          const f =
            new URL(req.url, "http://local").pathname.replace(/^\/stoicheia\//, "") || "index.html";
          assert(!f.includes(".."));
          let bytes = await readFile(path.join("dist", f));
          const send = () =>
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
                    ".svg": "image/svg+xml",
                    ".json": "application/json",
                  }[path.extname(f)] ?? "application/octet-stream",
              })
              .end(bytes);
          if (f === `sources/heiberg-${String(target).padStart(3, "0")}.jpg` && fault) {
            if (mode === "hold-new") {
              pending.push(send);
              return;
            }
            bytes = await readFile(`dist/sources/heiberg-${String(other).padStart(3, "0")}.jpg`);
            bad++;
          }
          send();
        } catch {
          res.writeHead(404).end();
        }
      });
      await new Promise((r) => server.listen(0, "127.0.0.1", r));
      const base = `http://127.0.0.1:${server.address().port}/stoicheia/`,
        c = await b.newContext({ viewport: { width: 375, height: 1000 }, acceptDownloads: true }),
        p = await c.newPage();
      let downloads = 0;
      p.on("download", () => {
        downloads++;
      });
      try {
        await p.goto(`${base}#p=${target === 53 ? 21 : 23}&s=${target === 53 ? 9 : 5}`);
        await p.locator(`#current-passage [data-source="${target}"]`).click();
        if (mode === "hold-new") {
          for (let n = 0; n < 80 && pending.length < 1; n++)
            await new Promise((r) => setTimeout(r, 100));
          assert(pending.length >= 1);
          await new Promise((r) => setTimeout(r, 8500));
          assert.equal(await p.locator("#source-image").isVisible(), false);
          assert(!(await p.locator("#offline-state").textContent()).includes("ready offline"));
          fault = false;
          for (const release of pending.splice(0)) release();
        } else {
          await p
            .locator("#course-source-status")
            .filter({ hasText: /does not match/ })
            .waitFor();
          assert.equal(await p.locator("#source-image").isVisible(), false);
          assert.equal(await p.locator("#source-language").textContent(), "Latin translation");
          await p.keyboard.press("Escape");
          await p.locator("#save-sheet").click();
          await p
            .locator("#save-feedback")
            .filter({ hasText: /does not match/ })
            .waitFor();
          assert.equal(downloads, 0);
          await p
            .locator("#offline-state")
            .filter({ hasText: /could not be saved|not saved/ })
            .waitFor();
          assert.equal(await p.evaluate(() => navigator.serviceWorker.controller), null);
          assert(bad >= 3);
          fault = false;
          await p.evaluate(() => window.dispatchEvent(new Event("online")));
          await p.locator(`#current-passage [data-source="${target}"]`).click();
        }
        await p
          .locator("#course-source-status")
          .filter({ hasText: /page verified/ })
          .waitFor();
        assert.equal(
          await p.locator("#source-image").getAttribute("data-source-page"),
          String(target),
        );
        await p.keyboard.press("Escape");
        await p
          .locator("#offline-state")
          .filter({ hasText: /Edition ready offline/ })
          .waitFor({ timeout: 60000 });
        const pendingDownload = p.waitForEvent("download");
        await p.locator("#save-sheet").click();
        const d = await pendingDownload;
        await d.saveAs(path.join(path.dirname(output), `${name}-${mode}-recovered.html`));
        assert.equal(await d.failure(), null);
        results.push({
          browser: name,
          version: b.version(),
          mode,
          targetPrintedPage: target,
          substitutePrintedPage: mode === "hold-new" ? null : other,
          validWrongJpegResponses: bad,
          heldMilliseconds: mode === "hold-new" ? 8500 : 0,
          incompleteNeverReady: true,
          wrongViewerAndExportRefused: mode !== "hold-new",
          correctedPageAndWorkerRecovered: true,
        });
        console.log(
          `${name}/${mode}: incomplete source refused; exact page, native study and worker recovered.`,
        );
      } finally {
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
  `${JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2)}\n`,
);
