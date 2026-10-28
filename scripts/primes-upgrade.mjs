import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

const [oldDirectory, newDirectory, output] = process.argv.slice(2);
assert(
  oldDirectory && newDirectory && output,
  "Supply the previous dist, new dist and output directory.",
);
const before = path.resolve(oldDirectory),
  after = path.resolve(newDirectory),
  out = path.resolve(output);
await mkdir(out, { recursive: true });
const identity = async (directory) => {
  const worker = await readFile(path.join(directory, "sw.js"), "utf8");
  return {
    edition: /const EDITION = "([^"]+)"/.exec(worker)[1],
    files: JSON.parse(/const FILES = (\[[^;]+\]);/.exec(worker)[1]),
  };
};
const old = await identity(before),
  current = await identity(after);
assert.notEqual(old.edition, current.edition);
const report = {
  checkedAt: new Date().toISOString(),
  scope:
    "Local actual edition transition. Previous public build first controls a complete cache; new build then replaces canonical files while older hashed assets remain available. Import an actual version 1 download, propose H, and save the verified current edition offline. No public-upgrade claim.",
  before: old.edition,
  after: current.edition,
  records: [],
};
async function download(p, id, file) {
  const pending = p.waitForEvent("download");
  await p.locator(id).click();
  const d = await pending;
  assert.equal(await d.failure(), null);
  await d.saveAs(file);
  return readFile(file);
}
for (const [engine, launcher] of [
  ["chromium", chromium],
  ["firefox", firefox],
])
  for (const width of [1440, 375]) {
    let active = before,
      online = true;
    const server = createServer(async (req, res) => {
      if (!online) {
        req.socket.destroy();
        return;
      }
      try {
        const pathname = new URL(req.url, "http://local").pathname;
        assert(pathname.startsWith("/stoicheia/"));
        const file = pathname.slice(11) || "index.html";
        assert(!file.includes(".."));
        let bytes;
        try {
          bytes = await readFile(path.join(active, file));
        } catch (e) {
          if (active === after && file.startsWith("assets/"))
            bytes = await readFile(path.join(before, file));
          else throw e;
        }
        res
          .writeHead(200, {
            "content-type":
              {
                ".html": "text/html",
                ".js": "text/javascript",
                ".css": "text/css",
                ".jpg": "image/jpeg",
                ".ttf": "font/ttf",
                ".svg": "image/svg+xml",
                ".json": "application/json",
                ".txt": "text/plain",
              }[path.extname(file)] ?? "application/octet-stream",
            "cache-control": "no-store",
          })
          .end(bytes);
      } catch {
        res.writeHead(404).end();
      }
    });
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    const base = `http://127.0.0.1:${server.address().port}/stoicheia/`,
      browser = await launcher.launch(),
      context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      }),
      p = await context.newPage(),
      errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    const folder = path.join(out, `${engine}-${width}`);
    await mkdir(folder, { recursive: true });
    try {
      await p.goto(`${base}primes.html`);
      await p.locator("#pr-title").waitFor();
      await p
        .locator("#pr-offline")
        .filter({ hasText: "Edition ready offline" })
        .waitFor({ timeout: 90000 });
      assert.equal(await p.locator("#pr-candidate").count(), 0);
      const inspect = () =>
        p.evaluate(async () =>
          Promise.all(
            (await caches.keys())
              .filter((k) => k.startsWith("stoicheia-"))
              .map(async (name) => ({
                name,
                paths: (await (await caches.open(name)).keys())
                  .map((r) => new URL(r.url).pathname)
                  .sort(),
              })),
          ),
        );
      assert.deepEqual(await inspect(), [
        { name: `stoicheia-${old.edition}`, paths: [...old.files].sort() },
      ]);
      await p.locator("#pr-import").setInputFiles("examples/primes/experiment-v1.json");
      await p.locator("#pr-save-status").filter({ hasText: "Reopened the exact" }).waitFor();
      const original = await download(p, "#pr-json", path.join(folder, "original-v1.json"));
      assert.equal(JSON.parse(original).version, 1);
      assert.deepEqual(
        JSON.parse(original),
        JSON.parse(await readFile("examples/primes/experiment-v1.json", "utf8")),
      );
      active = after;
      await p.reload({ waitUntil: "domcontentloaded" });
      await p.locator("#pr-candidate").waitFor();
      await p
        .locator("#pr-offline")
        .filter({ hasText: "Edition ready offline" })
        .waitFor({ timeout: 90000 });
      const snapshot = await inspect();
      assert.deepEqual(
        snapshot.find((cache) => cache.name === `stoicheia-${current.edition}`),
        { name: `stoicheia-${current.edition}`, paths: [...current.files].sort() },
      );
      const previousCacheRetired = !snapshot.some(
        (cache) => cache.name === `stoicheia-${old.edition}`,
      );
      await p.locator("#pr-import").setInputFiles({
        name: "original-v1.json",
        mimeType: "application/json",
        buffer: original,
      });
      await p.locator("#pr-save-status").filter({ hasText: "Reopened the exact" }).waitFor();
      assert.equal(await p.locator("#pr-candidate").inputValue(), "");
      await p.locator("#pr-limit").selectOption("13");
      await p.locator("#pr-candidate").fill("59");
      await p.getByRole("button", { name: "Check this H", exact: true }).click();
      assert.match(await p.locator("#pr-result").textContent(), /Unresolved at this bound/);
      assert.match(await p.locator("#pr-proposal").textContent(), /completes the composite branch/);
      const revised = await download(p, "#pr-json", path.join(folder, "revised-v2.json"));
      assert.equal(JSON.parse(revised).version, 2);
      assert.equal(JSON.parse(revised).settings.candidate, "59");
      await p.locator("#pr-share").click();
      const link = await p.locator("#pr-share-url").inputValue();
      online = false;
      await context.setOffline(true);
      await p.goto(link, { waitUntil: "domcontentloaded" });
      await p.locator("#pr-candidate").waitFor();
      assert.equal(await p.locator("#pr-candidate").inputValue(), "59");
      await p.locator("#pr-source-caption").filter({ hasText: "Printed p.390" }).waitFor();
      const reading = await download(p, "#pr-save", path.join(folder, "reading.html"));
      assert(!/<script\b/i.test(reading.toString()));
      const actual = await download(p, "#pr-json", path.join(folder, "offline-v2.json"));
      assert.deepEqual(actual, revised);
      await p.locator("#pr-propose").scrollIntoViewIfNeeded();
      await p.screenshot({ path: path.join(folder, "offline-proposal.png") });
      assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
      // A later ordinary asset read must not recreate an explicitly removed cache.
      online = true;
      await context.setOffline(false);
      await p.evaluate(async () => {
        for (const key of await caches.keys())
          if (key.startsWith("stoicheia-")) await caches.delete(key);
      });
      await p.evaluate(async () => {
        const response = await fetch(new URL("sources/primes/heiberg-390.jpg", location.href), {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Source did not reload after eviction");
        await response.arrayBuffer();
      });
      assert.deepEqual(
        await p.evaluate(async () =>
          (await caches.keys()).filter((k) => k.startsWith("stoicheia-")),
        ),
        [],
      );
      report.records.push({
        engine,
        width,
        originalSettings: JSON.parse(original).settings,
        settings: JSON.parse(revised).settings,
        previousCacheComplete: true,
        currentCacheComplete: true,
        previousCacheRetired,
        assetReadDoesNotRecreateDeletedCache: true,
        version1Reopened: true,
        candidatePreservedOffline: true,
        reading: `${engine}-${width}/reading.html`,
        pageErrors: errors,
      });
      console.log(
        JSON.stringify({ engine, width, version1Reopened: true, candidatePreservedOffline: true }),
      );
    } finally {
      await context.close();
      await browser.close();
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    }
  }
await writeFile(path.join(out, "upgrade.json"), `${JSON.stringify(report, null, 2)}\n`);
