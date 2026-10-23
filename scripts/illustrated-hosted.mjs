// biome-ignore-all lint/performance/useDomNodeTextContent: Inspect public learner workflows.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, firefox } from "playwright";

const base = "https://antonsoo.github.io/stoicheia/",
  out = resolve(process.argv[2] ?? "/tmp/stoicheia-illustrated-hosted");
await mkdir(out, { recursive: true });
const hash = (b) => createHash("sha256").update(b).digest("hex");
const build = JSON.parse(await readFile("docs/illustrated-review/build.json", "utf8"));
const report = {
  checkedAt: new Date().toISOString(),
  base,
  runtimeCommit: build.runtimeCommit,
  files: [],
  configurations: [],
};
for (const file of build.files) {
  const r = await fetch(`${base}${file.file}?review=${Date.now()}`);
  assert.equal(r.status, 200, file.file);
  assert.equal(hash(Buffer.from(await r.arrayBuffer())), file.sha256, file.file);
  report.files.push(file);
}
console.log(`All ${report.files.length} public files match`);
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const b = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const c = await b.newContext({ viewport: { width, height: 1000 }, acceptDownloads: true });
      try {
        const p = await c.newPage(),
          errors = [];
        p.on("pageerror", (e) => errors.push(e.message));
        await p.goto(`${base}#p=21&s=9&m=55`);
        await p.waitForFunction(
          () => document.querySelector("#offline-state").textContent.includes("ready offline"),
          null,
          { timeout: 60000 },
        );
        await p.locator("#motion").focus();
        await p.keyboard.press("Home");
        await p.keyboard.press("ArrowRight");
        assert.equal(await p.locator("#motion").inputValue(), "11");
        const cells = await p.locator("#comparison tbody td:not(:first-child)").allTextContents();
        assert.ok(Number(cells[3]) > Number(cells[2]) && Number(cells[5]) < Number(cells[4]));
        await p.locator('#current-passage [data-source="53"]').click();
        await p.waitForFunction(() => {
          const im = document.querySelector("#source-image");
          return im.complete && im.naturalWidth > 0;
        });
        await p.keyboard.press("Escape");
        const files = [];
        for (const id of [21, 22]) {
          if (id === 22) await p.goto(`${base}triangle.html`);
          const pending = p.waitForEvent("download");
          await p.locator(id === 21 ? "#save-sheet" : "#save-study").click();
          const d = await pending,
            file = join(out, `${name}-${width}-I${id}.html`);
          await d.saveAs(file);
          const bytes = await readFile(file);
          assert.equal(
            bytes.toString().match(/data:image\/jpeg;base64,/g).length,
            id === 21 ? 6 : 4,
          );
          const saved = await c.newPage();
          await saved.goto(pathToFileURL(file).href);
          await saved
            .locator("img")
            .evaluateAll((ims) => Promise.all(ims.map((im) => im.decode())));
          await saved.evaluate(() => document.fonts.ready);
          assert.equal(await saved.evaluate(() => document.fonts.check('16px "Noto Serif"')), true);
          await saved.close();
          files.push({ file: file.split("/").at(-1), bytes: bytes.length, sha256: hash(bytes) });
        }
        await c.setOffline(true);
        await p.goto(`${base}#p=21&s=9&m=55`);
        await p.locator("#motion").fill("70");
        await p.locator('#current-passage [data-source="53"]').click();
        await p.waitForFunction(() => {
          const im = document.querySelector("#source-image");
          return im.complete && im.naturalWidth > 0;
        });
        await p.keyboard.press("Escape");
        const pending = p.waitForEvent("download");
        await p.locator("#save-sheet").click();
        const d = await pending;
        await d.saveAs(join(out, `${name}-${width}-offline.html`));
        await p.goto(`${base}triangle.html`);
        assert.ok(await p.locator("#save-study").isEnabled());
        assert.deepEqual(errors, []);
        report.configurations.push({
          browser: name,
          version: b.version(),
          width,
          files,
          largerIndividualSegmentWithSmallerSum: true,
          offlineLessonAndSource: true,
          offlineExport: true,
        });
        console.log(
          `${name} ${width}: public proof, source images, illustrated files and offline export passed`,
        );
      } finally {
        await c.close();
      }
    }
  } finally {
    await b.close();
  }
}
await writeFile(join(out, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
