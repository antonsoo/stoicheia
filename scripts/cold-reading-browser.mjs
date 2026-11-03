// biome-ignore-all lint/performance/useDomNodeTextContent: Check the learner's actual foreground save and offline claim.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { chromium, firefox } from "playwright";

const root = resolve(process.argv[2] ?? "dist"),
  out = resolve(process.argv[3] ?? "/tmp/stoicheia-cold-reading"),
  before = process.argv.includes("--before");
await mkdir(out, { recursive: true });
const report = {
  scope:
    "Cold foreground illustrated reading against simultaneous background installation, shared 128000-byte/s origin",
  rateBytesPerSecond: 128000,
  before,
  configurations: [],
};
for (const [name, engine] of before
  ? [["chromium", chromium]]
  : [
      ["chromium", chromium],
      ["firefox", firefox],
    ]) {
  const streams = new Set();
  let total = 0,
    peak = 0,
    budget = 0,
    last = performance.now();
  const rows = [],
    sockets = new Set();
  const server = createServer(async (req, res) => {
    const path = new URL(req.url, "http://localhost").pathname;
    if (!path.startsWith("/stoicheia/")) {
      res.writeHead(404);
      res.end();
      return;
    }
    const file = path.slice(11) || "index.html";
    if (file.includes("..")) {
      res.writeHead(400);
      res.end();
      return;
    }
    try {
      const bytes = await readFile(join(root, file)),
        row = { file, bytes: bytes.length, sent: 0, started: performance.now(), ended: null };
      rows.push(row);
      res.writeHead(200, {
        "Content-Type":
          {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css",
            ".ttf": "font/ttf",
            ".jpg": "image/jpeg",
            ".svg": "image/svg+xml",
            ".json": "application/json",
          }[extname(file)] ?? "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.flushHeaders();
      const stream = { res, bytes, row };
      streams.add(stream);
      peak = Math.max(peak, streams.size);
      res.on("close", () => {
        row.ended = performance.now();
        streams.delete(stream);
      });
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  server.on("connection", (s) => {
    sockets.add(s);
    s.on("close", () => sockets.delete(s));
  });
  const timer = setInterval(() => {
    const now = performance.now();
    budget = Math.min(64000, budget + (now - last) * 128);
    last = now;
    if (!streams.size) return;
    const each = Math.max(1, Math.floor(budget / streams.size));
    for (const s of streams) {
      if (s.res.destroyed) {
        streams.delete(s);
        continue;
      }
      const amount = Math.min(each, budget, s.bytes.length - s.row.sent);
      if (amount <= 0) continue;
      s.res.write(s.bytes.subarray(s.row.sent, s.row.sent + amount));
      s.row.sent += amount;
      total += amount;
      budget -= amount;
      if (s.row.sent === s.bytes.length) {
        streams.delete(s);
        s.res.end();
      }
    }
  }, 20);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${server.address().port}/stoicheia/#p=1&s=3&intersection=1`;
  const browser = await engine.launch();
  let heartbeat;
  let repairs = 0;
  try {
    const context = await browser.newContext({
        viewport: { width: 1440, height: 950 },
        acceptDownloads: true,
      }),
      page = await context.newPage(),
      errors = [];
    const attempts = [];
    context.on("serviceworker", (worker) =>
      attempts.push({ url: worker.url(), seconds: performance.now() / 1000 }),
    );
    page.on("pageerror", (e) => errors.push(String(e)));
    const started = performance.now();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    const progress = [];
    heartbeat = setInterval(async () => {
      try {
        const state = await page.locator("#offline-state").innerText();
        progress.push({ seconds: (performance.now() - started) / 1000, state });
        console.log(`${name}: ${Math.round((performance.now() - started) / 1000)}s ${state}`);
        await writeFile(join(out, `${name}-streams.json`), JSON.stringify(rows, null, 2));
        if (!before && /could not be saved|saving paused/.test(state) && repairs < 3) {
          repairs++;
          await page.locator(".offline-repair").click();
          console.log(`${name}: resumed retained verified files after interruption ${repairs}`);
        }
      } catch {}
    }, 30000);
    const saving = performance.now(),
      pending = page
        .waitForEvent("download", { timeout: 240000 })
        .then((d) => ({ kind: "download", d }));
    const failure = page
      .waitForFunction(
        () =>
          /stopped|could not|does not match|Timed out|time limit/i.test(
            document.querySelector("#save-feedback")?.textContent ?? "",
          ),
        null,
        { timeout: 240000 },
      )
      .then(() => ({ kind: "failure" }));
    await page.locator("#intersection-save").click();
    const result = await Promise.race([pending, failure]);
    const foregroundSeconds = (performance.now() - saving) / 1000;
    if (before) {
      assert.equal(result.kind, "failure");
      report.configurations.push({
        engine: name,
        foregroundSeconds,
        error: await page.locator("#save-feedback").innerText(),
        offlineStatus: await page.locator("#offline-state").innerText(),
        totalBytesSent: total,
        peakStreams: peak,
      });
    } else {
      assert.equal(result.kind, "download", await page.locator("#save-feedback").innerText());
      assert.ok(foregroundSeconds > 15, "The case must exceed the old fixed deadline");
      const file = join(out, `${name}-reading.html`);
      await result.d.saveAs(file);
      const html = await readFile(file, "utf8");
      assert.equal((html.match(/data-source-page=/g) ?? []).length, 10);
      assert.match(html, /120\/241/);
      await page.waitForFunction(
        () =>
          document.querySelector("#offline-state")?.textContent.includes("Edition ready offline"),
        null,
        { timeout: 900000 },
      );
      assert.equal(await page.locator("#intersection-m").inputValue(), "11");
      assert.deepEqual(errors, []);
      report.configurations.push({
        engine: name,
        foregroundSeconds,
        editionSeconds: (performance.now() - started) / 1000,
        readingBytes: Buffer.byteLength(html),
        readingSha256: createHash("sha256").update(html).digest("hex"),
        sourcePages: 10,
        totalBytesSent: total,
        peakStreams: peak,
        progress,
        repairClicks: repairs,
        observedWorkerEvents: attempts.length,
        installationAttempts: attempts.length || null,
      });
      console.log(`${name}: foreground reading and complete edition passed`);
    }
  } finally {
    clearInterval(heartbeat);
    await browser.close();
    clearInterval(timer);
    for (const socket of sockets) socket.destroy();
    await new Promise((r) => server.close(r));
  }
}
await writeFile(join(out, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
