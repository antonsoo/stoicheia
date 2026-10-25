import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/stoicheia-mesolabe");
const hostedBase = process.argv[3];
if (hostedBase)
  assert.match(hostedBase, /^https:\/\/.+\/$/, "Hosted base must be HTTPS with a trailing slash");
await mkdir(out, { recursive: true });
const report = {
  checkedAt: new Date().toISOString(),
  scope: hostedBase
    ? "Public production site; browser and native-file evidence. Hosted offline checks disable browser networking. No physical assembly claim."
    : "Local production build; source, browser and native-file evidence. No public deployment or physical assembly claim.",
  base: hostedBase ?? null,
  configurations: [],
};
const hash = (b) => createHash("sha256").update(b).digest("hex");
async function filesIn(root) {
  const items = await readdir(root, { withFileTypes: true });
  return (
    await Promise.all(
      items.map((e) =>
        e.isDirectory() ? filesIn(path.join(root, e.name)) : [path.join(root, e.name)],
      ),
    )
  ).flat();
}
report.build = await Promise.all(
  (await filesIn("dist"))
    .sort()
    .map(async (f) => ({ file: f.slice(5), sha256: hash(await readFile(f)) })),
);
async function serve() {
  let online = true;
  const server = createServer(async (req, res) => {
    if (!online) {
      req.socket.destroy();
      return;
    }
    try {
      const relative =
        new URL(req.url, "http://local").pathname.replace(/^\/stoicheia\//, "") || "index.html";
      assert(!relative.includes(".."));
      const bytes = await readFile(path.join("dist", relative));
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
            }[path.extname(relative)] ?? "application/octet-stream",
          "Cache-Control": "no-store",
        })
        .end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    base: `http://127.0.0.1:${server.address().port}/stoicheia/`,
    offline: () => {
      online = false;
      server.closeAllConnections();
    },
    close: async () => {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    },
  };
}
async function save(page, selector, target) {
  const waiting = page.waitForEvent("download");
  await page.locator(selector).click();
  await (await waiting).saveAs(target);
  return readFile(target);
}
async function slider(page, selector, value) {
  await page.locator(selector).evaluate((e, v) => {
    e.value = String(v);
    e.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}
async function noOverflow(page) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "horizontal page overflow",
  );
}
for (const [browserName, browserType] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await browserType.launch();
  try {
    for (const width of [1440, 375]) {
      const folder = path.join(out, `${browserName}-${width}`);
      await mkdir(folder, { recursive: true });
      const server = await serve();
      const base = hostedBase ?? server.base;
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      });
      const page = await context.newPage(),
        errors = [],
        csp = [],
        external = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.addInitScript(() =>
        addEventListener("securitypolicyviolation", (e) => {
          globalThis.__csp ??= [];
          globalThis.__csp.push({ directive: e.violatedDirective, uri: e.blockedURI });
        }),
      );
      page.on("request", (req) => {
        if (/^https?:/.test(req.url()) && !req.url().startsWith(base)) external.push(req.url());
      });
      try {
        await page.goto(`${base}index.html`);
        if ((await page.locator("#companion-workshops").getAttribute("open")) === null)
          await page.locator("#companion-workshops summary").click();
        await page.getByRole("link", { name: /Twice the stone/ }).click();
        await page.locator("#ml-machine svg").waitFor();
        await page
          .locator("#ml-offline")
          .filter({ hasText: /Edition ready offline/ })
          .waitFor({ timeout: 60000 });
        await noOverflow(page);
        await page.locator("#ml-workshop").screenshot({ path: path.join(folder, "trial.png") });
        assert.equal(
          await page.locator("#ml-machine svg").getAttribute("data-narrow"),
          String(width === 375),
        );
        assert(await page.locator('[data-step="1"]').isDisabled());

        await page.locator("#ml-left").focus();
        const before = await page.locator("#ml-left").inputValue();
        await page.keyboard.press("ArrowRight");
        assert.notEqual(await page.locator("#ml-left").inputValue(), before);
        assert.equal(await page.evaluate(() => document.activeElement.id), "ml-left");

        const grip = page.locator('[data-plate="left"] .ml-grip');
        await grip.scrollIntoViewIfNeeded();
        const box = await grip.boundingBox();
        assert(box);
        const oldHash = new URL(page.url()).hash;
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(
          box.x + box.width / 2 + (width === 375 ? 0 : 24),
          box.y + box.height / 2 + (width === 375 ? 24 : 0),
          { steps: 4 },
        );
        await page.mouse.up();
        assert.notEqual(new URL(page.url()).hash, oldHash, "pointer movement changed the plate");

        const rightGrip = page.locator('[data-plate="right"] .ml-grip');
        await rightGrip.scrollIntoViewIfNeeded();
        const rightBox = await rightGrip.boundingBox();
        assert(rightBox);
        const rightHash = new URL(page.url()).hash;
        await page.mouse.move(rightBox.x + rightBox.width / 2, rightBox.y + rightBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(
          rightBox.x + rightBox.width / 2 - (width === 375 ? 0 : 20),
          rightBox.y + rightBox.height / 2 - (width === 375 ? 20 : 0),
          { steps: 4 },
        );
        await page.mouse.up();
        assert.notEqual(new URL(page.url()).hash, rightHash, "right grip moves its plate");
        await page.locator("#ml-reset").click();
        await page.locator("#ml-first").click();
        assert.equal(await page.locator("#ml-alignment").getAttribute("data-aligned"), "false");
        assert.match(await page.locator("#ml-alignment").textContent(), /Β offset 0 mm/);
        assert(await page.locator("#ml-left").isDisabled());
        await slider(page, "#ml-right", 50);
        assert.match(await page.locator("#ml-alignment").textContent(), /Β offset 0 mm/);
        await page
          .locator("#ml-workshop")
          .screenshot({ path: path.join(folder, "one-contact.png") });

        await page.locator("#ml-ideal").click();
        assert.equal(await page.locator("#ml-alignment").getAttribute("data-aligned"), "true");
        assert.match(await page.locator("#ml-volume").textContent(), /Volume 2 ×/);
        const rows = await page.locator("#ml-ratios tbody tr").allTextContents();
        assert.match(rows[2], /1.25992/);
        assert.match(rows[1], /1.5874/);
        await page.locator("#ml-workshop").screenshot({ path: path.join(folder, "aligned.png") });
        for (let i = 0; i < 5; i++) {
          await page.locator(`[data-step="${i}"]`).click();
          assert.equal(
            await page.locator(`[data-step="${i}"]`).getAttribute("aria-pressed"),
            "true",
          );
          await noOverflow(page);
        }
        await page.locator('[data-step="2"]').click();
        await page.locator("#ml-proof").screenshot({ path: path.join(folder, "proof.png") });
        const proofBounds = await page.locator("#ml-proof-plate svg").evaluate((svg) => {
          const v = svg.viewBox.baseVal;
          return [...svg.querySelectorAll("text")].map((t) => {
            const b = t.getBBox();
            return {
              label: t.textContent,
              inside:
                b.x >= 0 && b.y >= 0 && b.x + b.width <= v.width && b.y + b.height <= v.height,
            };
          });
        });
        assert(
          proofBounds.every((x) => x.inside),
          JSON.stringify(proofBounds),
        );
        await page.locator("#ml-nudge").click();
        assert.equal(await page.locator("#ml-alignment").getAttribute("data-aligned"), "false");
        assert.match(await page.locator("#ml-volume").textContent(), /signed error −?-?3\./);
        await page.locator("#ml-ideal").click();
        await page.locator('[data-factor="8"]').click();
        assert.match(await page.locator("#ml-volume").textContent(), /Volume 8 ×/);
        await page.locator('[data-factor="2"]').click();
        for (let i = 0; i < 8; i++) {
          await page.locator("#ml-passage").selectOption(String(i));
          assert.match(
            await page.locator("#ml-reading-title").textContent(),
            new RegExp(`^${i + 1}\\.`),
          );
          for (const button of await page.locator("#ml-passage-text [data-page]").all()) {
            const p = await button.getAttribute("data-page");
            await button.click();
            assert.equal(await page.locator("#ml-page").inputValue(), p);
            await page.waitForFunction(() => {
              const img = document.querySelector("#ml-source-image");
              return img.complete && img.naturalWidth > 0;
            });
          }
        }
        for (let p = 102; p <= 113; p++) {
          await page.locator("#ml-page").selectOption(String(p));
          await page.waitForFunction(() => {
            const i = document.querySelector("#ml-source-image");
            return i.complete && i.naturalWidth > 0;
          });
        }
        await page.locator("#ml-zoom").click();
        await page.locator("#ml-source-scroll").focus();
        await page.keyboard.press("ArrowDown");
        await page.waitForTimeout(400);
        assert(await page.locator("#ml-source-scroll").evaluate((e) => e.scrollTop > 0));
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(150);
        if (width === 375)
          assert(await page.locator("#ml-source-scroll").evaluate((e) => e.scrollLeft > 0));
        await page.locator("#ml-zoom").click();
        await page.locator("#ml-page").selectOption("112");
        await page.locator("#ml-evidence").screenshot({ path: path.join(folder, "source.png") });
        const answers = [1, 2, 0, 2];
        for (const answer of answers) {
          await page.locator(`input[name=ml-answer][value="${answer}"]`).check();
          await page.locator('#ml-question button[type="submit"]').click();
          assert.match(await page.locator("#ml-feedback").textContent(), /^Yes\./);
          await page.locator("#ml-question-next").click();
        }
        await page.locator("#ml-passage").selectOption("3");
        await page.locator("#ml-reading").screenshot({ path: path.join(folder, "reading.png") });
        await page.locator("#ml-share").click();
        const shared = await page.locator("#ml-share-url").inputValue();
        await page.goto(shared);
        assert.equal(await page.locator("#ml-passage").inputValue(), "3");
        assert.equal(await page.locator("#ml-page").inputValue(), "112");
        const csv = await save(page, "#ml-csv", path.join(folder, "measurements.csv"));
        const svg = await save(page, "#ml-svg", path.join(folder, "machine.svg"));
        const template = await save(page, "#ml-template", path.join(folder, "paper.svg"));
        const html = await save(page, "#ml-save", path.join(folder, "reading.html"));
        assert.match(template.toString(), /width="297mm" height="210mm"/);
        assert.match(svg.toString(), /<style>/);
        assert.match(csv.toString(), /"candidate_volume","2/);
        assert.equal((html.toString().match(/data:image\/jpeg;base64,/g) || []).length, 12);
        const axe = await new AxeBuilder({ page }).analyze();
        assert.deepEqual(
          axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
          [],
        );
        csp.push(...(await page.evaluate(() => globalThis.__csp ?? [])));

        // Local review removes the origin itself. Public hosting is checked with
        // browser networking disabled; the report keeps those claims distinct.
        if (hostedBase) await context.setOffline(true);
        else server.offline();
        await page.reload();
        await page.locator("#ml-machine svg").waitFor();
        assert.equal(await page.evaluate(() => navigator.onLine), !hostedBase);
        await page
          .locator("#ml-offline")
          .filter({ hasText: /Edition ready offline/ })
          .waitFor();
        const offlineHtml = await save(page, "#ml-save", path.join(folder, "offline-reading.html"));
        assert.equal(
          hash(offlineHtml),
          hash(html),
          "offline export preserves the same saved pose and source bytes",
        );
        const rooms = [];
        for (const room of [
          "index.html",
          "triangle.html",
          "quadrature.html",
          "gnomon.html",
          "mesolabe.html",
        ]) {
          await page.goto(base + room);
          await page.locator("main").waitFor();
          rooms.push(room);
        }
        assert.equal(external.length, 0);
        assert.deepEqual(errors, []);
        assert.deepEqual(csp, []);

        const native = await browser.newContext({
          viewport: { width, height: 1000 },
          offline: true,
        });
        const file = await native.newPage(),
          requests = [];
        file.on("request", (r) => {
          if (/^https?:/.test(r.url())) requests.push(r.url());
        });
        const fileErrors = [];
        file.on("pageerror", (e) => fileErrors.push(String(e)));
        await file.goto(pathToFileURL(path.join(folder, "reading.html")).href);
        await file.evaluate(() => document.fonts.ready);
        assert(
          await file.evaluate(() =>
            [...document.images].every((i) => i.complete && i.naturalWidth > 0),
          ),
        );
        assert.equal(await file.locator(".ml-full-passage").count(), 8);
        const embedded = await save(
          file,
          'a[download="stoicheia-mesolabe-measurements.csv"]',
          path.join(folder, "embedded.csv"),
        );
        assert.equal(hash(embedded), hash(csv));
        const paper = await save(
          file,
          'a[download="stoicheia-mesolabe-paper.svg"]',
          path.join(folder, "embedded-paper.svg"),
        );
        assert.equal(hash(paper), hash(template));
        await file.screenshot({ path: path.join(folder, "native-file.png"), fullPage: false });
        if (browserName === "chromium" && width === 1440)
          await file.pdf({
            path: path.join(folder, "reading.pdf"),
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
          });
        await file.goto(pathToFileURL(path.join(folder, "paper.svg")).href);
        assert.equal(await file.locator("svg").getAttribute("width"), "297mm");
        assert.equal(await file.locator("svg").getAttribute("height"), "210mm");
        await file.screenshot({ path: path.join(folder, "paper.png"), fullPage: false });
        if (browserName === "chromium" && width === 1440)
          await file.pdf({
            path: path.join(folder, "paper.pdf"),
            width: "297mm",
            height: "210mm",
            margin: { top: 0, bottom: 0, left: 0, right: 0 },
            printBackground: true,
          });
        assert.deepEqual(requests, []);
        assert.deepEqual(fileErrors, []);
        await native.close();
        await page.goto(`${base}mesolabe.html#r=NaN&q=0.4&m=unknown&p=7`);
        assert.match(await page.locator("#ml-notice").textContent(), /reset/);
        assert.equal(await page.locator("#ml-passage").inputValue(), "7");
        const item = {
          browser: browserName,
          width,
          keyboard: true,
          pointer: true,
          oneContactRemainsInsufficient: true,
          idealCubeEdge: 1.2599210498948732,
          proofStages: 5,
          passages: 8,
          sourcePages: 12,
          readingQuestions: 4,
          proofLabelsInsideViewBox: true,
          axeViolations: axe.violations.length,
          sourceZoom: true,
          sharedPose: true,
          downloadSha256: {
            html: hash(html),
            csv: hash(csv),
            svg: hash(svg),
            paper: hash(template),
          },
          nativeFile: { images: 12, externalRequests: 0, csvMatches: true, paperMatches: true },
          offlineRooms: rooms,
          offlineMethod: hostedBase
            ? "Browser networking disabled; navigator.onLine is false"
            : "Origin server destroys all sockets; navigator.onLine remains true",
          pageErrors: errors,
          cspViolations: csp,
          externalRequests: external,
        };
        report.configurations.push(item);
        console.log(
          `${browserName} ${width}: interaction, sources, native downloads, offline navigation verified`,
        );
      } catch (error) {
        console.log(
          "Failure diagnostics",
          await page
            .evaluate(async () => {
              const r = await navigator.serviceWorker.getRegistration();
              return {
                url: location.href,
                status: document.querySelector("#ml-offline")?.textContent,
                controller: navigator.serviceWorker.controller?.scriptURL,
                active: r?.active?.state,
                installing: r?.installing?.state,
                waiting: r?.waiting?.state,
                caches: await Promise.all(
                  (await caches.keys()).map(async (k) => ({
                    name: k,
                    count: (await (await caches.open(k)).keys()).length,
                  })),
                ),
              };
            })
            .catch(String),
        );
        throw error;
      } finally {
        await context.close();
        await server.close();
      }
    }
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(out, "browser.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Evidence: ${out}`);
