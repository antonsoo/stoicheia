// biome-ignore-all lint/performance/useDomNodeTextContent: Inspect complete saved readings.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";
import { openLesson } from "./navigation.mjs";

const output = resolve(process.argv[2] ?? "/tmp/stoicheia-illustrated");
await mkdir(output, { recursive: true });
const metadata = JSON.parse(
  execFileSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      `import {lessons} from './src/content/lessons.ts';import {courseSourcePages} from './src/study-pages.ts';console.log(JSON.stringify(Object.values(lessons).map(l=>({lesson:l,pages:courseSourcePages(l)}))));`,
    ],
    { encoding: "utf8" },
  ),
);
const digest = (b) => createHash("sha256").update(b).digest("hex");
const normalize = (s) => s.normalize("NFC").replace(/\s+/g, "");
const expectedFont = digest(await readFile("public/fonts/NotoSerif-Regular.ttf"));
const manifest = JSON.parse(await readFile("public/sources/manifest.json", "utf8"));
const report = { checkedAt: new Date().toISOString(), configurations: [], negativeCases: [] };
async function serve() {
  let online = true,
    rejected = 0;
  const server = createServer(async (req, res) => {
    if (!online) {
      rejected++;
      req.socket.destroy();
      return;
    }
    try {
      const pathname = new URL(req.url, "http://localhost").pathname;
      const name = pathname.replace(/^\/stoicheia\//, "") || "index.html";
      assert.ok(!name.includes("..") && !name.startsWith("/"));
      const bytes = await readFile(join("dist", name));
      const type =
        {
          html: "text/html",
          js: "text/javascript",
          css: "text/css",
          jpg: "image/jpeg",
          ttf: "font/ttf",
          svg: "image/svg+xml",
          json: "application/json",
          txt: "text/plain",
        }[name.split(".").at(-1)] ?? "application/octet-stream";
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
      res.end(bytes);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    base: `http://127.0.0.1:${server.address().port}/stoicheia/`,
    disconnect() {
      online = false;
    },
    rejected: () => rejected,
    close: () =>
      new Promise((r) => {
        server.closeAllConnections();
        server.close(r);
      }),
  };
}
async function save(page, button, file) {
  const pending = page.waitForEvent("download");
  await page.locator(button).click();
  const d = await pending;
  await d.saveAs(file);
  return d.suggestedFilename();
}
async function checkFile(context, file, proposition, print = false) {
  const bytes = await readFile(file),
    html = bytes.toString();
  const row = metadata.find((m) => m.lesson.id === proposition);
  const pages = proposition === 22 ? [52, 53, 54, 55] : row.pages;
  if (proposition === 21) assert.deepEqual(pages, [8, 9, 50, 51, 52, 53]);
  const images = [
    ...html.matchAll(
      /<img[^>]+data-source-page="(\d+)"[^>]+src="data:image\/jpeg;base64,([^"]+)"/g,
    ),
  ];
  assert.deepEqual(
    images.map((m) => Number(m[1])),
    pages,
  );
  for (const image of images) {
    const p = manifest.pages.find((p) => p.printed_page === Number(image[1]));
    assert.equal(digest(Buffer.from(image[2], "base64")), p.sha256);
  }
  const font = html.match(/src:url\(data:font\/ttf;base64,([^)]*)\)/);
  assert.ok(font);
  assert.equal(digest(Buffer.from(font[1], "base64")), expectedFont);
  assert.match(html, /SIL OPEN FONT LICENSE/);
  assert.match(html, /MIT License/);
  const saved = await context.newPage(),
    requests = [];
  saved.on("request", (r) => {
    if (/^https?:/.test(r.url())) requests.push(r.url());
  });
  await saved.goto(pathToFileURL(file).href);
  await saved.evaluate(() => document.fonts.ready);
  await saved.locator("img").evaluateAll((ims) => Promise.all(ims.map((im) => im.decode())));
  assert.equal(await saved.evaluate(() => document.fonts.check('16px "Noto Serif"')), true);
  const text = normalize(await saved.locator("body").innerText());
  if (row)
    for (const p of [row.lesson.statement, ...row.lesson.steps])
      for (const field of ["grc", "lat", "en"])
        assert.ok(text.includes(normalize(p[field])), `I.${proposition} ${field}`);
  assert.equal(
    await saved.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    true,
  );
  if (proposition === 21 || proposition === 22)
    assert.deepEqual(
      (
        await new AxeBuilder({ page: saved })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
      [],
    );
  if (print)
    await saved.pdf({
      path: join(output, `I${proposition}-illustrated.pdf`),
      format: "A4",
      printBackground: true,
    });
  assert.deepEqual(requests, []);
  await saved.close();
  return {
    proposition,
    file: file.split("/").at(-1),
    bytes: bytes.length,
    sha256: digest(bytes),
    sourcePages: pages,
    fontVerified: true,
    standaloneComplete: true,
  };
}
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const host = await serve(),
        context = await browser.newContext({
          viewport: { width, height: 1000 },
          acceptDownloads: true,
        });
      context.setDefaultTimeout(30000);
      try {
        const page = await context.newPage(),
          errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(host.base);
        await page.waitForFunction(() =>
          document.querySelector("#offline-state").textContent.includes("ready offline"),
        );
        const files = [];
        const ids =
          name === "chromium" && width === 1440 ? metadata.map((m) => m.lesson.id) : [1, 15, 21];
        for (const id of ids) {
          await openLesson(page, id);
          await page
            .locator(`#step-list [data-step="${metadata[id - 1].lesson.steps.length - 1}"]`)
            .click();
          const file = join(output, `${name}-${width}-I${id}.html`);
          assert.equal(await save(page, "#save-sheet", file), `stoicheia-I${id}-study.html`);
          files.push(
            await checkFile(context, file, id, name === "chromium" && width === 1440 && id === 21),
          );
        }
        await page.goto(`${host.base}triangle.html`);
        const closure = join(output, `${name}-${width}-I22.html`);
        await save(page, "#save-study", closure);
        files.push(await checkFile(context, closure, 22, name === "chromium" && width === 1440));
        host.disconnect();
        await context.setOffline(true);
        await page.goto(host.base);
        await openLesson(page, 21);
        const offline = join(output, `${name}-${width}-offline-I21.html`);
        await save(page, "#save-sheet", offline);
        await checkFile(context, offline, 21);
        await page.goto(`${host.base}triangle.html`);
        const offline22 = join(output, `${name}-${width}-offline-I22.html`);
        await save(page, "#save-study", offline22);
        await checkFile(context, offline22, 22);
        assert.deepEqual(errors, []);
        report.configurations.push({
          browser: name,
          version: browser.version(),
          width,
          files,
          originDisconnected: true,
          originRejectedConnections: host.rejected(),
          offlineExports: [21, 22],
          pageErrors: errors,
        });
        console.log(
          `${name} ${width}: ${files.length} complete illustrated readings and both disconnected exports`,
        );
      } finally {
        await context.close();
        await host.close();
      }
    }
    for (const kind of ["course", "closure"]) {
      for (const target of [
        "sources/heiberg-052.jpg",
        "fonts/NotoSerif-Regular.ttf",
        "fonts/OFL.txt",
      ]) {
        const host = await serve(),
          context = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true });
        try {
          const wrong = target.endsWith("jpg")
            ? await readFile("public/sources/heiberg-050.jpg")
            : Buffer.from("wrong edition");
          await context.route(`**/${target}`, (r) => r.fulfill({ status: 200, body: wrong }));
          const page = await context.newPage();
          let downloads = 0;
          page.on("download", () => downloads++);
          await page.goto(`${host.base}${kind === "course" ? "#p=21&s=9" : "triangle.html"}`);
          const button = kind === "course" ? "#save-sheet" : "#save-study",
            status = kind === "course" ? "#save-feedback" : "#save-status";
          await page.locator(button).click();
          await page.waitForFunction(
            (selector) => document.querySelector(selector).textContent.includes("does not match"),
            status,
          );
          assert.equal(downloads, 0);
          assert.equal(await page.locator(button).isEnabled(), true);
          await context.unroute(`**/${target}`);
          const file = join(output, `${name}-${kind}-${target.split("/").at(-1)}-recovered.html`);
          await save(page, button, file);
          await checkFile(context, file, kind === "course" ? 21 : 22);
          report.negativeCases.push({
            browser: name,
            kind,
            target,
            wrongHttp200Blocked: true,
            retryRecovered: true,
          });
        } finally {
          await context.close();
          await host.close();
        }
      }
    }
    const host = await serve(),
      context = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true });
    try {
      let release,
        held = false;
      const gate = new Promise((r) => {
        release = r;
      });
      await context.route("**/sources/heiberg-053.jpg", async (route) => {
        held = true;
        await gate;
        await route.continue();
      });
      const page = await context.newPage();
      await page.goto(`${host.base}#p=21&s=9&m=55`);
      const pending = page.waitForEvent("download");
      await page.locator("#save-sheet").click();
      for (let i = 0; i < 100 && !held; i++) await page.waitForTimeout(20);
      assert.ok(held);
      assert.equal(await page.locator("#save-sheet").isDisabled(), true);
      await openLesson(page, 1);
      release();
      const download = await pending;
      assert.equal(download.suggestedFilename(), "stoicheia-I21-study.html");
      const file = join(output, `${name}-snapshot-I21.html`);
      await download.saveAs(file);
      await checkFile(context, file, 21);
      assert.match(await page.locator("#book-label").innerText(), /Proposition 1$/i);
      report.negativeCases.push({
        browser: name,
        kind: "snapshot",
        heldSource: true,
        navigatedTo: 1,
        savedProposition: 21,
      });
    } finally {
      await context.close();
      await host.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(join(output, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
