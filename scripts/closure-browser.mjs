// biome-ignore-all lint/performance/useDomNodeTextContent: Read what a learner actually sees.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const upstream = process.argv[2] ?? "http://127.0.0.1:4397/stoicheia/";
const out = resolve(process.argv[3] ?? "/tmp/claude-1000/stoicheia-triangle/browser");
await mkdir(out, { recursive: true });
const digest = (data) => createHash("sha256").update(data).digest("hex");
let available = true;
const gate = createServer(async (request, response) => {
  if (!available) {
    request.socket.destroy();
    return;
  }
  try {
    const original = await fetch(new URL(request.url, upstream));
    response.writeHead(original.status, {
      "Content-Type": original.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(Buffer.from(await original.arrayBuffer()));
  } catch {
    response.writeHead(502);
    response.end();
  }
});
await new Promise((r) => gate.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${gate.address().port}/stoicheia/`;
const report = {
  checkedAt: new Date().toISOString(),
  upstream,
  scope:
    "Actual controls, rendered geometry, complete source reading, downloads, print and both offline entry pages",
  configurations: [],
};
const near = (a, b, tolerance = 1e-9) =>
  assert.ok(Math.abs(a - b) < tolerance, `${a} differs from ${b}`);
const readPoints = (page) =>
  page.locator("#closure-diagram [data-point]").evaluateAll((nodes) =>
    Object.fromEntries(
      nodes.map((n) => [
        n.dataset.point,
        {
          x: +n.dataset.x,
          y: +n.dataset.y,
          cx: +n.querySelector("circle").getAttribute("cx"),
          cy: +n.querySelector("circle").getAttribute("cy"),
        },
      ]),
    ),
  );
const nativeLengths = async (page, a, b, c) => {
  for (const [key, value] of [
    ["a", a],
    ["b", b],
    ["c", c],
  ])
    await page.locator(`#length-${key}`).fill(String(value));
};
const screenshot = async (page, path, selector) => {
  await page.evaluate(() => document.fonts.ready);
  await page.locator(selector).screenshot({ path });
};

try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
  ]) {
    const browser = await engine.launch();
    try {
      for (const width of [1440, 375]) {
        available = true;
        const context = await browser.newContext({
          viewport: { width, height: 1000 },
          acceptDownloads: true,
          reducedMotion: "reduce",
        });
        context.setDefaultTimeout(15000);
        const page = await context.newPage(),
          errors = [],
          external = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("request", (r) => {
          if (/^https?:/.test(r.url()) && !r.url().startsWith(new URL(base).origin))
            external.push(r.url());
        });
        const result = {
          browser: name,
          width,
          cases: [],
          steps: 0,
          passages: 0,
          sources: [],
          downloads: [],
          accessibility: [],
          offline: [],
          screenshots: [],
        };
        const audit = async (label) => {
          const violations = (
            await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
              .analyze()
          ).violations;
          assert.deepEqual(
            violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
            [],
            label,
          );
          result.accessibility.push(label);
        };
        await page.goto(`${base}triangle.html`);
        await page.waitForFunction(() =>
          document.querySelector("#offline-status").textContent.includes("ready offline"),
        );
        await audit("initial workshop");
        for (const [a, b, c, kind] of [
          [5, 6, 4, "crossing"],
          [2, 6, 4, "external-tangent"],
          [1.9, 6, 4, "separate"],
          [10, 6, 4, "internal-tangent"],
          [10.1, 6, 4, "contained"],
          [4, 6, 10, "internal-tangent"],
          [4, 6, 10.1, "contained"],
          [1, 1, 1, "crossing"],
          [12, 12, 12, "crossing"],
          [1, 12, 11.1, "crossing"],
          [12, 1, 11.1, "crossing"],
        ]) {
          await nativeLengths(page, a, b, c);
          assert.equal(await page.locator("#closure-diagram svg").getAttribute("data-kind"), kind);
          assert.equal(
            await page.locator('[data-triangle="true"]').count(),
            Number(kind === "crossing"),
          );
          assert.equal(await page.locator("#source-premise").isVisible(), kind !== "crossing");
          const table = await page
            .locator(".cl-conditions tbody tr")
            .evaluateAll((rows) => rows.map((r) => r.dataset.valid));
          assert.deepEqual(table, [a + b > c, a + c > b, b + c > a].map(String));
          const points = await readPoints(page);
          if (kind === "crossing") {
            const k = points.Κ,
              z = points.Ζ,
              h = points.Η;
            // Check both the numerical world coordinates and actual plotted distances.
            near(Math.hypot(k.x - z.x, k.y - z.y), a);
            near(Math.hypot(k.x - h.x, k.y - h.y), c);
            const factor = Math.hypot(h.cx - z.cx, h.cy - z.cy) / b;
            near(Math.hypot(k.cx - z.cx, k.cy - z.cy) / factor, a);
            near(Math.hypot(k.cx - h.cx, k.cy - h.cy) / factor, c);
          } else assert.equal(points.Κ, undefined);
          assert.doesNotMatch(await page.locator("#closure-diagram").innerHTML(), /NaN|Infinity/);
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            true,
          );
          result.cases.push({ a, b, c, kind });
        }
        await nativeLengths(page, 10.1, 6, 4);
        await audit("impossible nested circles");
        const impossibleShot = `${name}-${width}-contained.png`;
        await screenshot(page, join(out, impossibleShot), "#workshop");
        result.screenshots.push(impossibleShot);
        await page.locator("#share-state").click();
        const url = await page.locator("#share-url").inputValue();
        await page.goto(url);
        assert.equal(await page.locator("#length-a").inputValue(), "10.1");
        await page.locator(".cl-header a[href='#reading']").click();
        assert.equal(
          await page.locator("#length-a").inputValue(),
          "10.1",
          "Section links retain givens",
        );
        await page.locator("#length-a").fill("0");
        assert.equal(await page.locator("#length-error").isVisible(), true);
        assert.equal(await page.locator("#save-study").isDisabled(), true);
        assert.equal(
          await page.locator("#closure-diagram svg").getAttribute("data-kind"),
          "contained",
        );
        await nativeLengths(page, 5, 6, 4);
        for (let step = 0; step < 5; step++) {
          await page.locator(`[data-stage="${step}"]`).click();
          assert.equal(
            await page.locator(`[data-stage="${step}"]`).getAttribute("aria-current"),
            "true",
          );
          assert.equal(
            await page.locator("#closure-diagram [data-circle]").count(),
            Math.max(0, Math.min(2, step - 1)),
          );
          result.steps++;
        }
        await page.locator("#flip-side").click();
        assert.ok((await readPoints(page)).Κ.y < 0);
        await page.locator("#flip-side").click();
        await page.locator("#trial-toggle").click();
        await page.locator("#trial-angle").focus();
        await page.keyboard.press("Home");
        await page.keyboard.press("ArrowRight");
        assert.equal(await page.locator("#trial-angle").inputValue(), "1");
        await nativeLengths(page, 6, 6, 4);
        await page.keyboard.press("Home");
        await page.locator("#trial-angle").focus();
        await page.keyboard.press("Home");
        assert.match(await page.locator("#trial-feedback").innerText(), /0\.0000/);
        assert.doesNotMatch(await page.locator("#closure-diagram").innerHTML(), /NaN|Infinity/);
        await nativeLengths(page, 5, 6, 4);
        await page.locator("#trial-angle").focus();
        await page.keyboard.press("End");
        const before = await page.locator("#trial-angle").inputValue();
        await page.locator('#closure-diagram [data-point="P"] circle').scrollIntoViewIfNeeded();
        const from = await page.locator('#closure-diagram [data-point="P"] circle').boundingBox();
        const centre = await page.locator('#closure-diagram [data-point="Ζ"] circle').boundingBox();
        await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
        await page.mouse.down();
        await page.mouse.move(centre.x + centre.width / 2, centre.y - 60, { steps: 8 });
        await page.mouse.up();
        assert.notEqual(await page.locator("#trial-angle").inputValue(), before);
        near(+(await page.locator("#trial-angle").inputValue()), 90, 2);
        await audit("trial hinge");
        await screenshot(page, join(out, `${name}-${width}-trial.png`), "#workshop");
        result.screenshots.push(`${name}-${width}-trial.png`);
        await page.locator("#reveal").click();
        assert.equal(
          await page.locator("#trial-toggle").evaluate((n) => n === document.activeElement),
          true,
        );
        for (let i = 0; i < 9; i++) {
          await page.locator("#passage-select").selectOption(String(i));
          assert.ok((await page.locator('#passage-text p[lang="grc"]').innerText()).length > 40);
          assert.ok((await page.locator('#passage-text p[lang="la"]').innerText()).length > 30);
          result.passages++;
        }
        await audit("reading and language notes");
        for (let i = 0; i < 3; i++) {
          const correct = [1, 2, 0][i];
          await page.locator(`#question-options input[value="${correct}"]`).check();
          await page.locator('#closure-question button[type="submit"]').click();
          assert.match(await page.locator("#question-feedback").innerText(), /^Yes\./);
          if (i < 2) await page.locator("#question-next").click();
        }
        for (const p of [52, 53, 54, 55]) {
          await page.locator("#source-page").selectOption(String(p));
          await page.locator("#source-image").scrollIntoViewIfNeeded();
          await page.locator("#source-image").evaluate((img) => img.decode());
          const bytes = Buffer.from(
            await page.evaluate(async () =>
              Array.from(
                new Uint8Array(
                  await (await fetch(document.querySelector("#source-image").src)).arrayBuffer(),
                ),
              ),
            ),
          );
          const expected = await readFile(
            `public/sources/heiberg-${String(p).padStart(3, "0")}.jpg`,
          );
          assert.equal(digest(bytes), digest(expected));
          result.sources.push({ page: p, sha256: digest(bytes) });
        }
        await screenshot(page, join(out, `${name}-${width}-source.png`), "#evidence");
        result.screenshots.push(`${name}-${width}-source.png`);
        // Keep a successful, reflected construction in the exported artifacts.
        await page.locator("#flip-side").click();
        await page.locator("#share-state").click();
        const shared = await page.locator("#share-url").inputValue();
        const files = {};
        for (const [button, extension] of [
          ["save-study", "html"],
          ["save-svg", "svg"],
          ["save-csv", "csv"],
        ]) {
          const waiting = page.waitForEvent("download");
          await page.locator(`#${button}`).click();
          const download = await waiting,
            path = join(out, `${name}-${width}-reading.${extension}`);
          await download.saveAs(path);
          files[extension] = path;
          result.downloads.push({
            file: path.split("/").at(-1),
            sha256: digest(await readFile(path)),
          });
        }
        const html = await readFile(files.html, "utf8");
        assert.match(html, /SIL OPEN FONT LICENSE/);
        assert.match(html, /Copyright \(c\) 2026 Anton Soloviev/);
        assert.equal((html.match(/data:image\/jpeg;base64,/g) || []).length, 4);
        const embeddedScans = [...html.matchAll(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/g)];
        for (let i = 0; i < 4; i++)
          assert.equal(
            digest(Buffer.from(embeddedScans[i][1], "base64")),
            result.sources[i].sha256,
          );
        assert.match(await readFile(files.csv, "utf8"), /"triangle_exists","true"/);
        assert.match(await readFile(files.svg, "utf8"), /<style>/);
        available = false;
        await context.setOffline(true);
        await page.reload();
        assert.equal(await page.locator("#length-a").inputValue(), "5.0");
        assert.equal(new URL(page.url()).hash, new URL(shared).hash);
        assert.ok((await readPoints(page)).Κ.y < 0);
        result.offline.push("workshop reload with dead HTTP origin");
        await page.goto(`${base}#p=20&s=8`);
        assert.match(
          await page.locator("#lesson-title").innerText(),
          /two sides|remaining side|triangle/i,
        );
        result.offline.push("existing I.20 reader navigation");
        await page.locator('a[href="./triangle.html"]').click();
        await page.locator("#source-page").selectOption("55");
        await page.locator("#source-image").scrollIntoViewIfNeeded();
        await page.waitForFunction(() => {
          const img = document.querySelector("#source-image");
          return img.complete && img.naturalWidth > 0;
        });
        await page.locator("#source-image").evaluate((n) => n.decode());
        result.offline.push("reader to workshop and new source image");
        const offlineDownload = page.waitForEvent("download");
        await page.locator("#save-study").click();
        await (await offlineDownload).saveAs(join(out, `${name}-${width}-offline.html`));
        result.offline.push("illustrated reading generated offline");
        const standalone = await context.newPage();
        const requests = [];
        standalone.on("request", (r) => {
          if (/^https?:/.test(r.url())) requests.push(r.url());
        });
        await standalone.goto(pathToFileURL(files.html).href);
        await standalone.evaluate(() => document.fonts.ready);
        assert.equal(await standalone.locator(".cl-saved-passage").count(), 9);
        for (const img of await standalone.locator("img").all())
          await img.evaluate((n) => n.decode());
        assert.equal(
          await standalone.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          true,
        );
        assert.deepEqual(
          (await new AxeBuilder({ page: standalone }).withTags(["wcag2a", "wcag2aa"]).analyze())
            .violations,
          [],
        );
        if (name === "chromium" && width === 1440) {
          await standalone.pdf({
            path: join(out, "I22-illustrated-reading.pdf"),
            format: "A4",
            printBackground: true,
            margin: { top: "12mm", bottom: "12mm", left: "14mm", right: "14mm" },
          });
        }
        assert.deepEqual(requests, []);
        result.offline.push("standalone HTML with embedded scans and font; zero external requests");
        await standalone.close();
        assert.deepEqual(errors, []);
        assert.deepEqual(external, []);
        report.configurations.push(result);
        await context.close();
        console.log(`${name} ${width}: controls, sources, artifacts and offline routes passed`);
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  gate.closeAllConnections();
  await new Promise((r) => gate.close(r));
  await writeFile(join(out, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
}
