// biome-ignore-all lint/performance/useDomNodeTextContent: Verify the live reader's visible argument.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, firefox } from "playwright";

const base = process.argv[2];
assert.ok(base?.startsWith("https://"));
const output = process.argv[3] ?? "docs/case-study-hosted.json";
const report = {
  scope: "Direct HTTPS case-study journeys; not a local proxy",
  url: base,
  checkedAt: new Date().toISOString(),
  configurations: [],
};
const folder = await mkdtemp(join(tmpdir(), "stoicheia-live-case-"));
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const expected = sha(await readFile("examples/I7-inside-case-study.html"));
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        acceptDownloads: true,
      });
      const page = await context.newPage();
      const receipt = { browser: name, width, errors: [], externalRequests: [] };
      page.on("pageerror", (e) => receipt.errors.push(String(e)));
      page.on("request", (r) => {
        if (r.url().startsWith("http") && new URL(r.url()).origin !== new URL(base).origin)
          receipt.externalRequests.push(r.url());
      });
      await page.goto(`${base}#p=7&case=1&turn=55&case-step=2`);
      assert.equal(await page.locator("#case-placement").innerText(), "Δ inside the triangle");
      const landing = await page.locator("#case-heading").evaluate((e) => ({
        top: e.getBoundingClientRect().top,
        bottom: e.getBoundingClientRect().bottom,
        viewport: innerHeight,
        focus: document.activeElement.id,
      }));
      assert.ok(landing.top >= 0 && landing.bottom <= landing.viewport);
      assert.equal(landing.focus, "case-heading");
      receipt.landing = landing;
      for (const [placement, phrase] of [
        ["boundary", "flattened triangle"],
        ["reflection", "opposite sides"],
        ["coincident", "distinct points"],
        ["outside", "equal interior angles"],
      ]) {
        await page.locator(`[data-case="${placement}"]`).click();
        assert.match(await page.locator("#case-explanation").innerText(), new RegExp(phrase, "i"));
      }
      await page.locator('[data-case="inside"]').click();
      assert.equal(await page.locator('[data-entity="case-CE"]').count(), 1);
      const waiting = page.waitForEvent("download");
      await page.locator("#case-save").click();
      const download = await waiting;
      const path = join(folder, `${name}-${width}.html`);
      await download.saveAs(path);
      const hash = sha(await readFile(path));
      assert.equal(hash, expected);
      receipt.downloadSha256 = hash;
      await page.locator("#case-share").click();
      const shared = await page.locator("#case-url").inputValue();
      assert.equal(new URL(shared).origin, new URL(base).origin);
      const fresh = await context.newPage();
      await fresh.goto(shared);
      assert.equal(await fresh.locator("#case-placement").innerText(), "Δ inside the triangle");
      await fresh.close();
      await page.locator(".case-reading summary").click();
      for (const number of [20, 21]) {
        await page.locator(`.case-reading [data-source="${number}"]`).click();
        await page.locator("#source-image").evaluate((img) => img.decode());
        assert.equal(await page.locator("#source-title").innerText(), `Printed page ${number}`);
        await page.keyboard.press("Escape");
      }
      assert.deepEqual(receipt.errors, []);
      assert.deepEqual(receipt.externalRequests, []);
      report.configurations.push(receipt);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      configurations: report.configurations.length,
      exactDownloads: report.configurations.length,
      output,
    },
    null,
    2,
  ),
);
