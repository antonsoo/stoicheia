// biome-ignore-all lint/performance/useDomNodeTextContent: Verify the hosted interface as shown.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium, firefox } from "playwright";

const base = "https://antonsoo.github.io/stoicheia/";
const out = resolve(process.argv[2] ?? "/tmp/stoicheia-hosted");
await mkdir(out, { recursive: true });
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const expected = JSON.parse(await readFile("docs/closure-build.json", "utf8"));
const report = {
  checkedAt: new Date().toISOString(),
  url: base,
  runtimeCommit: expected.runtimeCommit,
  scope: "Direct HTTPS workshop, actual native controls and downloads, offline routes",
  configurations: [],
};
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(`${base}triangle.html`);
      await page.waitForFunction(
        () =>
          document.querySelector("#offline-status")?.textContent?.includes("Edition ready offline"),
        null,
        { timeout: 60000 },
      );
      const cases = [];
      for (const [a, kind] of [
        [5, "crossing"],
        [2, "external-tangent"],
        [1.9, "separate"],
        [10, "internal-tangent"],
        [10.1, "contained"],
      ]) {
        await page.locator("#length-a").fill(String(a));
        assert.equal(await page.locator("#closure-diagram svg").getAttribute("data-kind"), kind);
        cases.push({ a, kind });
      }
      await page.locator("#length-a").fill("5");
      await page.locator("#trial-toggle").click();
      await page.locator("#trial-angle").focus();
      const before = Number(await page.locator("#trial-angle").inputValue());
      await page.keyboard.press("ArrowRight");
      assert.equal(Number(await page.locator("#trial-angle").inputValue()), before + 1);
      await page.locator("#reveal").click();
      await page.locator("#source-page").selectOption("55");
      await page.locator("#source-image").scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const image = document.querySelector("#source-image");
        return image.complete && image.naturalWidth > 0;
      });
      const response = await context.request.get(`${base}sources/heiberg-055.jpg`);
      assert.equal(
        digest(await response.body()),
        expected.inventory["sources/heiberg-055.jpg"].sha256,
      );
      const downloads = [];
      for (const [button, extension] of [
        ["save-svg", "svg"],
        ["save-study", "html"],
      ]) {
        const waiting = page.waitForEvent("download");
        await page.locator(`#${button}`).click();
        const download = await waiting;
        const file = join(out, `${name}-${width}.${extension}`);
        await download.saveAs(file);
        const text = await readFile(file, "utf8");
        if (extension === "svg") {
          assert.equal(
            await page.evaluate(
              (xml) =>
                new DOMParser()
                  .parseFromString(xml, "image/svg+xml")
                  .querySelector("parsererror") === null,
              text,
            ),
            true,
          );
        } else assert.match(text, /SIL OPEN FONT LICENSE/);
        downloads.push({ file: file.split("/").at(-1), sha256: digest(text) });
      }
      await context.setOffline(true);
      await page.reload();
      assert.equal(await page.locator("#length-a").inputValue(), "5.0");
      await page.goto(`${base}#p=20&s=8`);
      assert.match(
        await page.locator("#lesson-title").innerText(),
        /two sides|remaining side|triangle/i,
      );
      await page.locator('a[href="./triangle.html"]').click();
      await page.locator("#source-page").selectOption("55");
      await page.locator("#source-image").scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const image = document.querySelector("#source-image");
        return image.complete && image.naturalWidth > 0;
      });
      assert.deepEqual(errors, []);
      report.configurations.push({
        browser: name,
        version: browser.version(),
        width,
        cases,
        downloads,
        offlineWorkshop: true,
        offlineCourse: true,
        offlineScan: true,
      });
      await context.close();
      console.log(`${name} ${width}: direct hosted controls, downloads and offline routes passed`);
    }
  } finally {
    await browser.close();
  }
}
await writeFile(join(out, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
