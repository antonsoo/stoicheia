import assert from "node:assert/strict";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { chromium, firefox } from "playwright";

const [repo, distArg, output, expectation = "fixed"] = process.argv.slice(2);
assert(["stoicheia", "pyknon"].includes(repo) && distArg && output);
assert(["before", "fixed"].includes(expectation));
const dist = path.resolve(distArg),
  base = `/${repo}/`,
  before = expectation === "before";
const profile =
  repo === "stoicheia"
    ? {
        file: "solids.html",
        title: "#sl-title",
        status: "#sl-offline",
        prefix: "Edition ready offline",
        query: "?p=3&q=4&yaw=11&pitch=6&vertex=2&example=bipyramid&reading=3&page=337",
        result: "#sl-vertex-result",
        pattern: /4 faces.*120°/s,
      }
    : {
        file: "helikon.html",
        title: "#hk-title",
        status: "#offline-status",
        prefix: "Ready offline",
        query: "?target=enharmonic&x1=72&x2=126&scale=9&page=98",
        result: "#hk-retuning-result",
        pattern: /All four/,
      };
let mode = "live",
  held = new Set(),
  aborts = 0;
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain",
};
async function respond(req, res) {
  const url = new URL(req.url, "http://localhost");
  if (!url.pathname.startsWith(base)) {
    res.writeHead(404);
    res.end();
    return;
  }
  const relative = decodeURIComponent(url.pathname.slice(base.length)) || "index.html";
  const file = path.resolve(dist, relative);
  if (!file.startsWith(dist + path.sep)) {
    res.writeHead(400);
    res.end();
    return;
  }
  // An origin-local observer can inspect storage after the lesson's navigation fails.
  if (relative === "__inspect.html") {
    res.writeHead(200, { "content-type": "text/html" });
    res.end("<!doctype html><title>Local cache observer</title>");
    return;
  }
  const html = relative.endsWith(".html");
  if (html && ["hold", "body"].includes(mode) && relative === profile.file) {
    const entry = { req, res, kind: mode };
    held.add(entry);
    if (mode === "body") {
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "content-length": original.length,
      });
      res.write(original.subarray(0, 32));
    }
    res.on("close", () => {
      if (held.delete(entry)) aborts++;
    });
    return;
  }
  if (html && mode === "unavailable") {
    res.writeHead(503, { "content-type": "text/plain" });
    res.end("Temporary local test failure");
    return;
  }
  if (html && mode === "missing") {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Missing local test page");
    return;
  }
  try {
    let data = await readFile(file);
    if (relative === profile.file && mode === "marker")
      data = Buffer.concat([data, Buffer.from("\n<!-- fresh controlled network response -->")]);
    res.writeHead(200, {
      "content-type": mime[path.extname(file)] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(data);
  } catch (e) {
    res.writeHead(e.code === "ENOENT" ? 404 : 500);
    res.end();
  }
}
const server = createServer((req, res) => {
  void respond(req, res).catch((e) => {
    res.destroy(e);
  });
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`,
  target = origin + base + profile.file + profile.query;
const original = await readFile(path.join(dist, profile.file)),
  records = [];
async function files(folder) {
  return (
    await Promise.all(
      (
        await readdir(folder, { withFileTypes: true })
      ).map((entry) => {
        const file = path.join(folder, entry.name);
        return entry.isDirectory() ? files(file) : file;
      }),
    )
  ).flat();
}
const expectedFiles = (await files(dist))
  .filter((file) => path.basename(file) !== "sw.js")
  .map((file) => base + path.relative(dist, file).split(path.sep).join("/"))
  .sort();

async function release() {
  mode = "live";
  for (const entry of [...held]) {
    held.delete(entry);
    if (!entry.res.destroyed) {
      if (entry.kind === "body") entry.res.end(original.subarray(32));
      else await respond(entry.req, entry.res);
    }
  }
}
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
  ]) {
    const browser = await engine.launch();
    try {
      const context = await browser.newContext();
      context.setDefaultTimeout(10000);
      context.setDefaultNavigationTimeout(10000);
      const page = await context.newPage();
      await page.goto(target);
      await page.locator(profile.title).waitFor();
      await page.waitForFunction(
        ({ selector, prefix }) => document.querySelector(selector).textContent.startsWith(prefix),
        { selector: profile.status, prefix: profile.prefix },
        { timeout: 60000 },
      );
      console.log(name, "complete edition ready");
      const cache = await page.evaluate(async () => {
        const keys = await caches.keys();
        return Promise.all(
          keys.map(async (name) => ({
            name,
            files: (await (await caches.open(name)).keys()).map((r) => new URL(r.url).pathname),
          })),
        );
      });
      assert.equal(cache.length, 1);
      assert.deepEqual([...cache[0].files].sort(), expectedFiles);
      const heldOrigins = [];
      let response;
      for (const kind of ["hold", "body"]) {
        const beforeAborts = aborts;
        mode = kind;
        const started = performance.now();
        response = null;
        let failure = null;
        try {
          response = await page.reload({ waitUntil: "domcontentloaded", timeout: 3500 });
        } catch (e) {
          failure = e.name;
        }
        const heldResult = {
          kind,
          documentCompleted: !!response,
          milliseconds: Math.round(performance.now() - started),
          failure,
          originRequestsStillHeld: held.size,
          originRequestsAborted: aborts - beforeAborts,
        };
        if (before) {
          assert.equal(response, null);
          assert.equal(failure, "TimeoutError");
        } else {
          assert(response, "The saved lesson still waited for the held origin.");
          assert.equal(response.status(), 200);
          assert(response.fromServiceWorker());
          assert.deepEqual(await response.body(), original);
          assert.equal(page.url(), target);
          assert.match(await page.locator(profile.result).textContent(), profile.pattern);
          assert(aborts > beforeAborts, "The expired origin request was not aborted.");
        }
        // Release the held response before asking the pending document to execute code.
        const committed = before ? page.waitForEvent("domcontentloaded", { timeout: 10000 }) : null;
        await release();
        if (committed) await committed;
        await page.goto(target);
        await page.locator(profile.title).waitFor();
        heldOrigins.push(heldResult);
      }
      mode = "unavailable";
      response = await page.reload({ waitUntil: "domcontentloaded" });
      const unavailable = {
        status: response.status(),
        savedLessonVisible: (await page.locator(profile.title).count()) === 1,
      };
      assert.equal(unavailable.status, before ? 503 : 200);
      assert.equal(unavailable.savedLessonVisible, !before);
      if (!before) {
        assert.deepEqual(await response.body(), original);
        assert.equal(page.url(), target);
        assert.match(await page.locator(profile.result).textContent(), profile.pattern);
      }
      response = await page.goto(`${origin + base}never-cached.html`, {
        waitUntil: "domcontentloaded",
      });
      assert.equal(response.status(), 503);
      assert.equal(await page.locator(profile.title).count(), 0);
      mode = "missing";
      response = await page.goto(target, { waitUntil: "domcontentloaded" });
      assert.equal(response.status(), 404);
      assert.equal(await page.locator(profile.title).count(), 0);
      mode = "marker";
      response = await page.goto(target, { waitUntil: "domcontentloaded" });
      assert.equal(response.status(), 200);
      assert((await response.text()).endsWith("<!-- fresh controlled network response -->"));
      await page.locator(profile.title).waitFor();
      const unchanged = await page.evaluate(
        async ({ key, url, expected }) =>
          (await (await caches.match(url, { cacheName: key })).text()) === expected,
        { key: cache[0].name, url: base + profile.file, expected: original.toString() },
      );
      assert(unchanged);
      mode = "live";
      await page.reload();
      await page.locator(profile.title).waitFor();
      await context.setOffline(true);
      response = await page.reload({ waitUntil: "domcontentloaded" });
      assert.equal(response.status(), 200);
      assert.deepEqual(await response.body(), original);
      assert.equal(page.url(), target);
      assert.match(await page.locator(profile.result).textContent(), profile.pattern);
      await page.waitForFunction(
        (selector) =>
          document.querySelector(selector).textContent.startsWith("Verified complete page"),
        repo === "stoicheia" ? "#sl-source-status" : "#hk-source-status",
      );
      await context.setOffline(false);
      const observer = await context.newPage();
      await observer.goto(`${origin}${base}__inspect.html`);
      mode = "hold";
      const evictionStart = performance.now();
      const pending = page.reload({ waitUntil: "domcontentloaded", timeout: 3500 }).then(
        (result) => ({ status: result.status() }),
        (error) => ({ error: error.name }),
      );
      const untilHeld = Date.now() + 1000;
      while (!held.size && Date.now() < untilHeld) await new Promise((r) => setTimeout(r, 5));
      assert(held.size, "The eviction scenario must begin during a real origin request.");
      await observer.evaluate(async () => {
        for (const name of await caches.keys()) await caches.delete(name);
      });
      const outcome = await pending;
      assert.equal(
        outcome.status,
        undefined,
        "A removed edition supplied HTML without its companion files.",
      );
      assert(outcome.error, "Cache removal must not manufacture a successful document response.");
      const cachesAfterEviction = await observer.evaluate(() => caches.keys());
      assert.deepEqual(cachesAfterEviction, []);
      const removedEdition = {
        ...outcome,
        milliseconds: Math.round(performance.now() - evictionStart),
        cacheNamesAfter: cachesAfterEviction,
        noRetiredHtmlOrRecreatedCache: true,
      };
      records.push({
        engine: name,
        version: browser.version(),
        cache,
        heldOrigins,
        unavailableOrigin: unavailable,
        uncachedFailureRemains503: true,
        explicitDeletionRemains404: true,
        fastNetworkResponseUsed: true,
        completeSavedHtmlUnchanged: true,
        offlineReloadPreservesSettings: true,
        removedEditionDuringNavigation: removedEdition,
      });
      console.log(name, JSON.stringify({ heldOrigins, unavailableOrigin: unavailable }));
    } finally {
      await browser.close();
      await release();
    }
  }
  await writeFile(
    output,
    `${JSON.stringify(
      {
        repository: repo,
        scope:
          "Actual local HTTP origin, complete production worker and native navigations. The origin withholds headers or a successful body, returns 503 or 404, or provides a marked fresh 200 response. This is not a public-origin fault injection.",
        expectation,
        records,
      },
      null,
      2,
    )}\n`,
  );
} finally {
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
}
