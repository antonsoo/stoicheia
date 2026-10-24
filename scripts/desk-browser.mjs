import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/claude-1000/stoicheia-desk-review");
await mkdir(out, { recursive: true });
const report = {
  checkedAt: new Date().toISOString(),
  scope:
    "Local production build, browser operations, real native downloads and origin-disabled offline use. No deployment claim.",
  configurations: [],
};
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
report.workerSha256 = hash(await readFile("dist/sw.js"));
async function serve() {
  let online = true;
  const server = createServer(async (req, res) => {
    if (!online) {
      req.socket.destroy();
      return;
    }
    try {
      const file =
        new URL(req.url, "http://local").pathname.replace(/^\/stoicheia\//, "") || "index.html";
      assert(!file.includes(".."));
      const bytes = await readFile(path.join("dist", file));
      res
        .writeHead(200, {
          "Content-Type":
            {
              ".html": "text/html",
              ".js": "text/javascript",
              ".css": "text/css",
              ".svg": "image/svg+xml",
              ".jpg": "image/jpeg",
              ".json": "application/json",
              ".ttf": "font/ttf",
            }[path.extname(file)] ?? "application/octet-stream",
          "Cache-Control": "no-store",
        })
        .end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    base: `http://127.0.0.1:${server.address().port}/stoicheia/`,
    offline() {
      online = false;
      server.closeAllConnections();
    },
    async close() {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}
async function save(page, selector, destination) {
  const pending = page.waitForEvent("download");
  await page.locator(selector).click();
  await (await pending).saveAs(destination);
  return readFile(destination);
}
async function operation(page, kind, first, second, branch = 0) {
  await page.locator(`[data-tool="${kind}"]`).click();
  await page.locator("#dk-first").selectOption(first);
  await page.locator("#dk-second").selectOption(second);
  if (kind === "meet") await page.locator(`[data-keep="${branch}"]`).click();
  else await page.locator("#dk-draw").click();
}
async function noOverflow(page) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "page must fit the viewport",
  );
}
for (const [name, type] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await type.launch();
  try {
    for (const width of [1440, 375]) {
      const folder = path.join(out, `${name}-${width}`);
      await mkdir(folder, { recursive: true });
      const server = await serve();
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      });
      const page = await context.newPage(),
        errors = [],
        external = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      page.on("request", (r) => {
        if (/^https?:/.test(r.url()) && !r.url().startsWith(server.base)) external.push(r.url());
      });
      try {
        await page.goto(server.base);
        await page.getByRole("link", { name: /Make I.2 yourself/ }).click();
        await page
          .locator("#dk-offline")
          .filter({ hasText: /Edition ready offline/ })
          .waitFor({ timeout: 60000 });
        await noOverflow(page);
        await page.screenshot({ path: path.join(folder, "opening.png") });
        // Native keyboard control remains focused when choices change.
        await page.locator("#dk-second").focus();
        await page.keyboard.press("ArrowDown");
        assert.equal(await page.evaluate(() => document.activeElement.id), "dk-second");
        for (const [id, key] of [
          ["A", "Enter"],
          ["B", " "],
        ]) {
          await page.locator(`[data-choose="${id}"]`).focus();
          await page.keyboard.press(key);
          assert.equal(await page.evaluate(() => document.activeElement.dataset.choose), id);
        }
        await operation(page, "line", "A", "B");
        await operation(page, "circle", "A", "B");
        await operation(page, "circle", "B", "A");
        await page.locator('[data-tool="meet"]').click();
        await page.locator("#dk-first").selectOption("c2");
        await page.locator("#dk-second").selectOption("c3");
        if (width === 1440) {
          await page.locator('[data-branch="0"]').focus();
          await page.keyboard.press("Enter");
        } else await page.locator('[data-keep="0"]').click();
        assert.match(await page.locator("#dk-status").textContent(), /Point P1/);
        await operation(page, "line", "P1", "B");
        await operation(page, "circle", "B", "C");
        await operation(page, "meet", "l4", "c5", 0); // Wrong side, deliberately.
        assert.match(await page.locator("#dk-proof-state").textContent(), /not complete/);
        await page.locator("#dk-hint-toggle").click();
        assert.match(await page.locator("#dk-hint-text").textContent(), /BEYOND B/);
        await page.locator("#dk-hint-toggle").click();
        await page.locator("#dk-undo").click();
        await operation(page, "meet", "l4", "c5", 1);
        assert.match(await page.locator("#dk-position").textContent(), /Operation 7 of 7/);
        await operation(page, "line", "P1", "A");
        await operation(page, "circle", "P1", "P2");
        await operation(page, "meet", "l6", "c7", 0); // Wrong final side.
        await operation(page, "line", "A", "P3");
        assert.match(await page.locator("#dk-proof-state").textContent(), /not complete/);
        await page.locator("#dk-undo").click();
        await page.locator("#dk-undo").click();
        await operation(page, "meet", "l6", "c7", 1);
        await operation(page, "line", "A", "P3");
        assert.match(await page.locator("#dk-proof-state").textContent(), /chain is present/);
        await page.locator("#dk-measure-point").selectOption("P3");
        assert.match(
          await page.locator("#dk-measurements").textContent(),
          /Difference: -?0\.000000/,
        );
        await page.locator("#dk-undo").click();
        assert.match(await page.locator("#dk-proof-state").textContent(), /not complete/);
        await page.locator("#dk-redo").click();
        await page.locator(".dk-transcript summary").click();
        await page.locator('[data-review="5"]').click();
        assert.match(await page.locator("#dk-position").textContent(), /Operation 5 of 11/);
        await page.locator('[data-review="11"]').click();
        await page.locator(".dk-transcript summary").click();
        await page.locator("#dk-circles").uncheck();
        await noOverflow(page);
        await page.locator("#dk-board").screenshot({ path: path.join(folder, "constructed.png") });
        await page
          .locator(".dk-proof")
          .screenshot({ path: path.join(folder, "equal-remainders.png") });
        await page.locator("#dk-circles").check();
        await page.locator(".dk-layout").screenshot({ path: path.join(folder, "whole-desk.png") });
        const drawingUrl = page.url();
        await page.locator("#dk-share").click();
        assert.equal(await page.locator("#dk-share-link").inputValue(), drawingUrl);
        await page.getByRole("link", { name: "Read the commands", exact: true }).click();
        assert.equal(page.url(), drawingUrl, "reading anchors must preserve the construction URL");
        await page.reload();
        assert.match(await page.locator("#dk-position").textContent(), /Operation 11 of 11/);
        await page.locator("#dk-layout").selectOption("turned");
        assert.match(await page.locator("#dk-position").textContent(), /Operation 0 of 0/);
        await page.locator("#dk-layout").selectOption("separate");
        assert.match(await page.locator("#dk-position").textContent(), /Operation 11 of 11/);
        const json = await save(page, "#dk-json", path.join(folder, "construction.json"));
        const decoded = JSON.parse(json);
        assert.equal(decoded.actions.length, 11);
        assert.equal(decoded.actions[6].branch, 1);
        assert.equal(decoded.actions[9].branch, 1);
        await page.locator("#dk-import").setInputFiles({
          name: "forged.json",
          mimeType: "application/json",
          buffer: Buffer.from(
            JSON.stringify({
              ...decoded,
              actions: [...decoded.actions, { kind: "point", x: 0, y: 0 }],
            }),
          ),
        });
        await page
          .locator("#dk-file-status")
          .filter({ hasText: /unchanged/ })
          .waitFor();
        assert.match(await page.locator("#dk-proof-state").textContent(), /chain is present/);
        await page.locator("#dk-start").click();
        await page.locator("#dk-import").setInputFiles(path.join(folder, "construction.json"));
        await page
          .locator("#dk-file-status")
          .filter({ hasText: /Opened 11/ })
          .waitFor();
        assert.match(await page.locator("#dk-proof-state").textContent(), /chain is present/);
        const svg = await save(page, "#dk-svg", path.join(folder, "construction.svg"));
        assert.match(svg.toString(), /dk-result/);
        // Capture click-time state, then alter the live drawing in the same task.
        const waiting = page.waitForEvent("download");
        await page.evaluate(() => {
          document.querySelector("#dk-study").click();
          document.querySelector("#dk-undo").click();
        });
        const htmlFile = path.join(folder, "construction-reading.html");
        await (await waiting).saveAs(htmlFile);
        const html = await readFile(htmlFile, "utf8");
        assert.match(html, /11 chosen operations/);
        assert.match(await page.locator("#dk-position").textContent(), /Operation 10 of 11/);
        await page.locator("#dk-redo").click();
        const manifest = JSON.parse(await readFile("public/sources/manifest.json", "utf8"));
        const images = [
          ...html.matchAll(/data-source-page="(\d+)" src="data:image\/jpeg;base64,([^"]+)"/g),
        ];
        assert.equal(images.length, 4);
        for (const [, number, data] of images) {
          const expected = manifest.pages.find((p) => p.printed_page === Number(number));
          assert.equal(hash(Buffer.from(data, "base64")), expected.sha256);
        }
        for (const number of [12, 13, 14, 15]) {
          await page.locator(`[data-page="${number}"]`).click();
          await page.locator("#dk-scan").scrollIntoViewIfNeeded();
          await page.waitForFunction(() => {
            const image = document.querySelector("#dk-scan");
            return image.complete && image.naturalWidth > 0;
          });
          await page
            .locator(".dk-scan")
            .screenshot({ path: path.join(folder, `source-${number}.png`) });
        }
        const axe = await new AxeBuilder({ page }).analyze();
        assert.deepEqual(
          axe.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.map((n) => n.target),
          })),
          [],
        );
        await noOverflow(page);
        const portableContext = await browser.newContext({
          viewport: { width, height: 1000 },
          offline: true,
          acceptDownloads: true,
        });
        const portable = await portableContext.newPage(),
          remote = [];
        portable.on("request", (req) => {
          if (/^https?:/.test(req.url())) remote.push(req.url());
        });
        await portable.goto(pathToFileURL(htmlFile).href);
        await portable.evaluate(() => document.fonts.ready);
        assert.equal(await portable.locator(".dk-step").count(), 11);
        assert.equal(await portable.locator(".dk-passage[open]").count(), 11);
        assert(
          await portable
            .locator(".dk-source-page img")
            .evaluateAll((imgs) => imgs.every((i) => i.complete && i.naturalWidth > 0)),
        );
        await noOverflow(portable);
        await portable
          .locator(".dk-proof")
          .screenshot({ path: path.join(folder, "portable-proof.png") });
        assert.deepEqual(remote, []);
        if (name === "chromium" && width === 1440)
          await portable.pdf({
            path: path.join(folder, "construction-reading.pdf"),
            format: "A4",
            printBackground: true,
          });
        const embedded = await save(
          portable,
          'a[download="stoicheia-construction.json"]',
          path.join(folder, "embedded.json"),
        );
        assert.deepEqual(JSON.parse(embedded), decoded);
        await portable.goto(pathToFileURL(path.join(folder, "construction.svg")).href);
        const resultColor = await portable
          .locator(".dk-result")
          .evaluate((node) => getComputedStyle(node).stroke);
        assert.equal(resultColor, "rgb(23, 99, 77)");
        await portable.screenshot({ path: path.join(folder, "native-svg.png") });
        await portableContext.close();
        // A disabled origin, rather than a warm online reload, verifies the entire saved edition.
        server.offline();
        await context.setOffline(true);
        await page.goto(drawingUrl);
        await page
          .locator("#dk-offline")
          .filter({ hasText: /Edition ready offline/ })
          .waitFor();
        assert.match(await page.locator("#dk-proof-state").textContent(), /chain is present/);
        await save(page, "#dk-study", path.join(folder, "offline-reading.html"));
        await page.goto(`${server.base}index.html#p=2&s=8`);
        await page
          .locator("#offline-state")
          .filter({ hasText: /Edition ready offline/ })
          .waitFor();
        await page.getByRole("link", { name: /Make I.2 yourself/ }).click();
        await page
          .locator("#dk-offline")
          .filter({ hasText: /Edition ready offline/ })
          .waitFor();
        await page.locator("#dk-layout").selectOption("long");
        await operation(page, "circle", "A", "C");
        await operation(page, "circle", "C", "A");
        await operation(page, "meet", "c1", "c2", 1);
        await operation(page, "line", "A", "C");
        await operation(page, "line", "P1", "C");
        await operation(page, "circle", "C", "B");
        await operation(page, "meet", "l4", "c5", 1);
        await operation(page, "line", "P1", "A");
        await operation(page, "circle", "P1", "P2");
        await operation(page, "meet", "l6", "c7", 1);
        await operation(page, "line", "A", "P3");
        assert.match(await page.locator("#dk-proof-state").textContent(), /chain is present/);
        assert.match(await page.locator(".dk-correspondence caption").textContent(), /exchanged/);
        await page.locator("#dk-hint-toggle").click();
        assert(await page.locator("#dk-load-hint").isHidden());
        const offlineRooms = [];
        for (const room of [
          "index.html",
          "triangle.html",
          "quadrature.html",
          "gnomon.html",
          "mesolabe.html",
          "desk.html",
        ]) {
          await page.goto(server.base + room);
          await page.locator("main").waitFor();
          offlineRooms.push(room);
        }
        assert.deepEqual(errors, []);
        assert.deepEqual(external, []);
        report.configurations.push({
          browser: name,
          browserVersion: browser.version(),
          width,
          operations: 11,
          wrongCrossingsRejected: 2,
          imageHashesVerified: images.length,
          nativeJsonSha256: hash(json),
          nativeSvgSha256: hash(svg),
          savedReadingSha256: hash(Buffer.from(html)),
          axeViolations: 0,
          pageErrors: errors,
          externalRequests: external,
          portableRemoteRequests: remote,
          offlineOriginDisabled: true,
          offlineRooms,
          offlineAlternateConstruction: {
            layout: "long",
            anchor: "C",
            reflected: true,
            operations: 11,
          },
        });
        console.log(
          `${name} ${width}: actual construction, wrong branches, replay, native files, sources and origin-disabled offline work verified`,
        );
      } finally {
        await context.close();
        await server.close();
      }
    }
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(out, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
