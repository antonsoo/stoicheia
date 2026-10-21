// biome-ignore-all lint/performance/useDomNodeTextContent: Verify the reader's visible explanations.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const upstream = process.argv[2] ?? "http://127.0.0.1:4327/stoicheia/";
const output = process.argv[3] ?? "/tmp/claude-1000/stoicheia-casebook/browser";
await mkdir(output, { recursive: true });
let online = true;
let rejectedConnections = 0;
const gate = createServer(async (request, response) => {
  if (!online) {
    rejectedConnections++;
    request.socket.destroy();
    return;
  }
  try {
    const result = await fetch(new URL(request.url, upstream));
    response.writeHead(result.status, {
      "Content-Type": result.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(Buffer.from(await result.arrayBuffer()));
  } catch {
    request.socket.destroy();
  }
});
await new Promise((resolve) => gate.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${gate.address().port}`;
const base = new URL(new URL(upstream).pathname, origin).href;
const report = {
  scope: `Production case-study workflows through a local origin gate; upstream ${upstream}`,
  checkedAt: new Date().toISOString(),
  configurations: [],
};
const labels = {
  outside: "Δ outside the triangle",
  inside: "Δ inside the triangle",
  boundary: "Δ on side ΒΓ",
  reflection: "Δ across the base",
  coincident: "Δ coincides with Γ",
};
const texts = {
  outside: "printed part relation fits",
  inside: "printed part relation no longer fits",
  boundary: "flattened triangle",
  reflection: "opposite sides",
  coincident: "distinct points",
};
const hash = (data) => createHash("sha256").update(data).digest("hex");
async function checkAxe(page, name, receipt) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  assert.deepEqual(
    result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    [],
    name,
  );
  receipt.accessibility.push(name);
}
async function noOverflow(page) {
  const result = await page.evaluate(() => ({
    width: innerWidth,
    content: document.documentElement.scrollWidth,
    duplicateIds: [...document.querySelectorAll("[id]")]
      .map((e) => e.id)
      .filter((id, i, all) => all.indexOf(id) !== i),
  }));
  assert.ok(result.content <= result.width + 1, JSON.stringify(result));
  assert.deepEqual(result.duplicateIds, []);
}
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
  ]) {
    const browser = await engine.launch();
    try {
      for (const width of [1440, 375]) {
        console.log(`Case study ${name} ${width}px`);
        online = true;
        const context = await browser.newContext({
          viewport: { width, height: 1000 },
          acceptDownloads: true,
        });
        const page = await context.newPage();
        page.setDefaultTimeout(20000);
        const receipt = {
          browser: name,
          version: browser.version(),
          width,
          accessibility: [],
          downloads: [],
          errors: [],
          externalRequests: [],
        };
        page.on("pageerror", (e) => receipt.errors.push(String(e)));
        page.on("request", (request) => {
          if (request.url().startsWith("http") && !request.url().startsWith(origin))
            receipt.externalRequests.push(request.url());
        });
        await page.goto(`${base}#p=7&s=3`);
        await page.locator("#open-casebook").focus();
        await page.keyboard.press("Enter");
        assert.equal(await page.locator("#casebook").evaluate((e) => e.open), true);
        assert.equal(await page.locator("#case-placement").innerText(), labels.outside);
        // Cross the boundary continuously using the native keyboard control.
        const slider = page.locator("#case-turn");
        await slider.focus();
        await page.keyboard.press("Home");
        assert.equal(await page.locator("#case-placement").innerText(), labels.coincident);
        for (let turn = 1; turn <= 65; turn++) {
          await page.keyboard.press("ArrowRight");
          assert.equal(await slider.inputValue(), String(turn));
          assert.equal(
            await page.locator("#case-placement").innerText(),
            turn <= 41 ? labels.outside : labels.inside,
          );
        }
        for (const placement of ["outside", "inside", "boundary", "reflection", "coincident"]) {
          await page.locator(`[data-case="${placement}"]`).click();
          await page.locator('[data-case-stage="0"]').click();
          assert.equal(await page.locator("#case-placement").innerText(), labels[placement]);
          assert.match(
            await page.locator("#case-explanation").innerText(),
            new RegExp(texts[placement], "i"),
          );
          assert.equal(
            await slider.isDisabled(),
            placement === "boundary" || placement === "reflection",
          );
          if (placement === "inside" || placement === "outside") {
            for (let stage = 0; stage < 4; stage++) {
              await page.locator(`[data-case-stage="${stage}"]`).click();
              assert.equal(
                await page.locator(`[data-case-stage="${stage}"]`).getAttribute("aria-current"),
                "step",
              );
              assert.equal(
                await page.locator('[data-entity="case-CE"]').count(),
                placement === "inside" && stage > 0 ? 1 : 0,
              );
              await noOverflow(page);
            }
          } else {
            assert.equal(await page.locator('[data-case-stage="1"]').isDisabled(), true);
            assert.equal(await page.locator('[data-entity="case-CE"]').count(), 0);
          }
          await checkAxe(page, placement, receipt);
          const waiting = page.waitForEvent("download");
          await page.locator("#case-save").click();
          const download = await waiting;
          const path = resolve(output, `${name}-${width}-${placement}.html`);
          await download.saveAs(path);
          const bytes = await readFile(path);
          const saved = await context.newPage();
          const requests = [];
          saved.on("request", (r) => {
            if (r.url().startsWith("http")) requests.push(r.url());
          });
          await saved.goto(pathToFileURL(path).href);
          assert.equal(await saved.locator("h2").first().innerText(), labels[placement]);
          assert.equal(await saved.locator("script").count(), 0);
          assert.equal(
            await saved.locator('[data-entity="case-CE"]').count(),
            placement === "inside" ? 1 : 0,
          );
          assert.match(
            await saved.locator("body").innerText(),
            /Modern exploration, not an additional Greek or Latin passage/,
          );
          assert.match(await saved.locator('p[lang="grc"]').first().innerText(), /ὑπὸ τὴν βάσιν/);
          assert.match(await saved.locator('p[lang="la"]').first().innerText(), /sub basi/);
          await noOverflow(saved);
          if (name === "chromium" && width === 1440) {
            const pdf = path.replace(".html", ".pdf");
            await saved.pdf({ path: pdf, format: "A4", printBackground: true });
            const text = execFileSync("pdftotext", [pdf, "-"], { encoding: "utf8" });
            assert.match(text, /The case left to the reader/);
            assert.match(text, /Heiberg/);
            assert.match(text, /Modern exploration/);
            const normalize = (value) => value.normalize("NFC").replace(/\s+/gu, "");
            for (const language of ["grc", "la"]) {
              const paragraph = await saved.locator(`p[lang="${language}"]`).first().innerText();
              assert.ok(
                normalize(text).includes(normalize(paragraph)),
                `PDF omitted ${language} source paragraph`,
              );
            }
            receipt.downloads.push({
              placement,
              bytes: bytes.length,
              sha256: hash(bytes),
              nativePdfBytes: (await readFile(pdf)).length,
            });
          } else receipt.downloads.push({ placement, bytes: bytes.length, sha256: hash(bytes) });
          assert.deepEqual(requests, []);
          await saved.close();
        }
        await page.locator('[data-case="inside"]').click();
        await page.locator('[data-case-stage="2"]').click();
        await page.locator("#case-share").click();
        const shared = await page.locator("#case-url").inputValue();
        const fresh = await context.newPage();
        await fresh.goto(shared);
        assert.equal(await fresh.locator("#casebook").evaluate((e) => e.open), true);
        assert.equal(await fresh.locator("#case-placement").innerText(), labels.inside);
        assert.equal(
          await fresh.locator('[data-case-stage="2"]').getAttribute("aria-current"),
          "step",
        );
        const landing = await fresh.locator("#case-heading").evaluate((element) => ({
          top: element.getBoundingClientRect().top,
          bottom: element.getBoundingClientRect().bottom,
          viewport: innerHeight,
          focus: document.activeElement.id,
        }));
        assert.ok(landing.top >= 0 && landing.bottom <= landing.viewport, JSON.stringify(landing));
        assert.equal(landing.focus, "case-heading");
        receipt.sharedLanding = landing;
        await fresh.close();
        await page.locator(".case-reading summary").click();
        await page.locator('.case-reading [data-source="20"]').click();
        assert.equal(await page.locator("#source-title").innerText(), "Printed page 20");
        await page.locator("#source-image").evaluate((img) => img.decode());
        await page.keyboard.press("Escape");
        await page.locator('.case-reading [data-source="21"]').click();
        assert.equal(await page.locator("#source-title").innerText(), "Printed page 21");
        await page.locator("#source-image").evaluate((img) => img.decode());
        await page.keyboard.press("Escape");
        await checkAxe(page, "source clause", receipt);
        if (width === 375) {
          await page.locator("#case-read").click();
          assert.equal(await page.evaluate(() => document.activeElement.id), "case-explanation");
          await page.locator("#case-back").click();
          assert.equal(await page.evaluate(() => document.activeElement.id), "case-placement");
        }
        await page.locator('.case-reading [data-lesson="5"]').click();
        assert.match(await page.locator("#book-label").innerText(), /Proposition 5/i);
        await page.goBack();
        assert.equal(await page.locator("#casebook").evaluate((e) => e.open), true);
        assert.equal(await page.locator("#case-placement").innerText(), labels.inside);
        await page.goto(page.url());
        await page.evaluate(() => document.fonts.ready);
        // Capture a fresh reader, without a transient save or expanded share field.
        await page.waitForFunction(() => document.querySelector("#toast").hidden);
        await page
          .locator("#casebook-root")
          .screenshot({ path: resolve(output, `${name}-${width}.png`) });
        await page.waitForFunction(
          () =>
            document.querySelector("#offline-state").textContent ===
            "Edition ready offline, including source pages",
          {},
          { timeout: 90000 },
        );
        online = false;
        const countBefore = rejectedConnections;
        await fetch(base).then(
          () => assert.fail("Origin gate was still online"),
          () => {},
        );
        assert.ok(rejectedConnections > countBefore);
        await context.setOffline(true);
        await page.reload();
        assert.equal(await page.locator("#casebook").evaluate((e) => e.open), true);
        assert.equal(await page.locator("#case-placement").innerText(), labels.inside);
        await page.locator('[data-case="boundary"]').click();
        assert.match(await page.locator("#case-explanation").innerText(), /flattened triangle/);
        await page.locator(".case-reading summary").click();
        await page.locator('.case-reading [data-source="21"]').click();
        await page.locator("#source-image").evaluate((img) => img.decode());
        assert.equal(await page.locator("#source-title").innerText(), "Printed page 21");
        receipt.offline = {
          originUnavailable: true,
          rejectedConnections: rejectedConnections - countBefore,
          sharedInteriorReload: true,
          boundaryInteraction: true,
          source21Decoded: true,
        };
        assert.deepEqual(receipt.errors, []);
        assert.deepEqual(receipt.externalRequests, []);
        report.configurations.push(receipt);
        await context.close();
        online = true;
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await new Promise((resolve) => gate.close(resolve));
}
await writeFile(resolve(output, "verification.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      configurations: report.configurations.length,
      accessibility: report.configurations.flatMap((c) => c.accessibility).length,
      downloads: report.configurations.flatMap((c) => c.downloads).length,
      output,
    },
    null,
    2,
  ),
);
