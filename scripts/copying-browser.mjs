import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";
import { openLesson } from "./navigation.mjs";

const out = path.resolve(process.argv[2] ?? "/tmp/stoicheia-copying-review"),
  hosted = process.argv[3];
await mkdir(out, { recursive: true });
if (hosted) assert.match(hosted, /^https:\/\/.+\/$/);
const hash = (b) => createHash("sha256").update(b).digest("hex"),
  manifest = JSON.parse(await readFile("public/sources/manifest.json", "utf8")),
  metadata = JSON.parse(
    execFileSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "--input-type=module",
        "-e",
        "import {lessons} from './src/content/lessons.ts';import {courseSourcePages} from './src/study-pages.ts';console.log(JSON.stringify([22,23].map(id=>({lesson:lessons[id],pages:courseSourcePages(lessons[id])}))));",
      ],
      { encoding: "utf8" },
    ),
  );
const worker = await readFile("dist/sw.js", "utf8"),
  edition = /const EDITION = "([a-f0-9]+)"/.exec(worker)[1],
  files = JSON.parse(/const FILES = (\[[^;]+\]);/.exec(worker)[1]);
const norm = (s) => s.normalize("NFC").replace(/\s+/g, "");
async function serve() {
  let online = true;
  const server = createServer(async (req, res) => {
    if (!online) {
      req.socket.destroy();
      return;
    }
    try {
      const f =
        new URL(req.url, "http://local").pathname.replace(/^\/stoicheia\//, "") || "index.html";
      assert(!f.includes(".."));
      const b = await readFile(path.join("dist", f));
      res
        .writeHead(200, {
          "cache-control": "no-store",
          "content-type":
            {
              ".html": "text/html",
              ".js": "text/javascript",
              ".css": "text/css",
              ".jpg": "image/jpeg",
              ".ttf": "font/ttf",
              ".svg": "image/svg+xml",
              ".json": "application/json",
            }[path.extname(f)] ?? "application/octet-stream",
        })
        .end(b);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    base: `http://127.0.0.1:${server.address().port}/stoicheia/`,
    offline() {
      online = false;
      server.closeAllConnections();
    },
    async close() {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    },
  };
}
async function ready(p) {
  await p.getByText("Edition ready offline", { exact: false }).first().waitFor({ timeout: 60000 });
}
async function fits(p) {
  assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
}
async function save(p, selector, file) {
  const pending = p.waitForEvent("download");
  await p.locator(selector).click();
  const d = await pending;
  assert.equal(await d.failure(), null);
  await d.saveAs(file);
  return readFile(file);
}
async function source(p, num) {
  await p.locator(`[data-source="${num}"]`).first().click();
  await p
    .locator("#course-source-status")
    .filter({ hasText: /page verified/ })
    .waitFor();
  const image = p.locator("#source-image");
  assert.equal(await image.getAttribute("data-source-page"), String(num));
  const bytes = await image.evaluate(async (i) => [
    ...new Uint8Array(await window.copyingBlobs.get(i.src).arrayBuffer()),
  ]);
  assert.equal(hash(Buffer.from(bytes)), manifest.pages.find((x) => x.printed_page === num).sha256);
  if (num === 57) {
    await p.locator("#source-zoom").click();
    await p.locator("#source-previous").click();
    await p
      .locator("#course-source-status")
      .filter({ hasText: /page verified/ })
      .waitFor();
    assert.equal(
      await p.locator("#source-image").evaluate((i) => i.classList.contains("zoomed")),
      true,
    );
    assert.equal(await p.locator("#source-zoom").getAttribute("aria-pressed"), "true");
    await p.locator("#source-zoom").click();
    await p.locator("#source-next").click();
    await p
      .locator("#course-source-status")
      .filter({ hasText: /page verified/ })
      .waitFor();
  }
  await p.keyboard.press("Escape");
}
async function rendered(p, description) {
  return {
    description,
    points: await p.locator("#diagram [data-point]").evaluateAll((nodes) =>
      Object.fromEntries(
        nodes
          .filter((n) => n.querySelector("circle"))
          .map((n) => [
            n.dataset.point,
            {
              x: Number(n.querySelector("circle").getAttribute("cx")),
              y: Number(n.querySelector("circle").getAttribute("cy")),
            },
          ]),
      ),
    ),
    segments: await p.locator("#diagram [data-entity]").evaluateAll((nodes) =>
      nodes
        .filter((e) => e.tagName === "line")
        .map((e) => ({
          id: e.dataset.entity,
          x1: Number(e.getAttribute("x1")),
          y1: Number(e.getAttribute("y1")),
          x2: Number(e.getAttribute("x2")),
          y2: Number(e.getAttribute("y2")),
        })),
    ),
    hash: p.url().split("#")[1],
  };
}
const report = {
  checkedAt: new Date().toISOString(),
  scope: hosted
    ? "Actual public source, downloads, browser offline; public origin remains running"
    : "Local production; browser offline and stopped origin",
  base: hosted ?? null,
  edition,
  workerSha256: hash(Buffer.from(worker)),
  configurations: [],
};
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const b = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const dir = path.join(out, `${name}-${width}`);
      await mkdir(dir, { recursive: true });
      const server = hosted ? null : await serve(),
        base = hosted ?? server.base,
        c = await b.newContext({ viewport: { width, height: 1000 }, acceptDownloads: true }),
        p = await c.newPage(),
        errors = [];
      p.on("pageerror", (e) => errors.push(e.message));
      try {
        await c.addInitScript(() => {
          window.copyingBlobs = new Map();
          const make = URL.createObjectURL,
            revoke = URL.revokeObjectURL;
          URL.createObjectURL = (blob) => {
            const u = make.call(URL, blob);
            window.copyingBlobs.set(u, blob);
            return u;
          };
          URL.revokeObjectURL = (u) => {
            window.copyingBlobs.delete(u);
            return revoke.call(URL, u);
          };
        });
        await p.goto(`${base}#p=23&s=5&r=1.15&a=32&x=.25`);
        await ready(p);
        await fits(p);
        assert.equal(
          (await p.locator("#companion-workshops").getAttribute("open")) !== null,
          width > 700,
        );
        if (width === 375) {
          await p.locator("#companion-workshops summary").focus();
          await p.keyboard.press("Enter");
          await p.getByRole("link", { name: /Can three lengths close/ }).waitFor();
          await p.locator("#companion-workshops summary").click();
        }
        const views = [],
          downloads = [];
        for (const item of metadata) {
          const { lesson, pages } = item;
          await openLesson(p, lesson.id);
          for (let i = 0; i < lesson.steps.length; i++) {
            await p.locator(`#step-list [data-step="${i}"]`).click();
            for (const [lang, key] of [
              ["grc", "grc"],
              ["la", "lat"],
            ])
              assert.equal(
                norm(await p.locator(`#current-passage p[lang="${lang}"]`).textContent()),
                norm(lesson.steps[i][key]),
              );
            assert.equal(
              await p.locator("#step-position").textContent(),
              `Step ${i + 1} of ${lesson.steps.length}`,
            );
            await fits(p);
          }
          const answer = p.locator(".question input").nth(0);
          await answer.check();
          assert.match(
            await p.locator("#question-feedback").textContent(),
            /Yes|yes|Correct|correct/,
          );
          if ((await p.locator("#full-reading").getAttribute("open")) === null)
            await p.locator("#full-reading summary").click();
          for (const page of [
            lesson.statement.greekPages[0],
            lesson.statement.latinPages[0],
            lesson.steps.at(-1).greekPages[0],
            lesson.steps.at(-1).latinPages[0],
          ])
            await source(p, page);
          const htmlFile = path.join(dir, `I${lesson.id}-study.html`),
            svgFile = path.join(dir, `I${lesson.id}.svg`),
            html = await save(p, "#save-sheet", htmlFile),
            svg = await save(p, "#save-diagram", svgFile);
          assert.match(svg.toString(), /<svg/);
          assert(!/<script\b|\son\w+=/i.test(html.toString()));
          const native = await c.newPage(),
            network = [];
          native.on("request", (r) => {
            if (/^https?:/.test(r.url())) network.push(r.url());
          });
          await native.goto(pathToFileURL(htmlFile).href);
          await native.evaluate(() => document.fonts.ready);
          assert.equal(await native.locator(".lesson-passage").count(), lesson.steps.length);
          const actual = await native.locator(".source-page img").evaluateAll((imgs) =>
            imgs.map((i) => ({
              page: Number(i.dataset.sourcePage),
              url: i.src,
              complete: i.complete,
              width: i.naturalWidth,
            })),
          );
          assert.equal(actual.length, pages.length);
          for (const img of actual) {
            assert(img.complete && img.width > 0);
            assert(pages.includes(img.page));
            assert.equal(
              hash(Buffer.from(img.url.split(",")[1], "base64")),
              manifest.pages.find((x) => x.printed_page === img.page).sha256,
            );
          }
          assert.deepEqual(network, []);
          await fits(native);
          if (name === "chromium" && width === 1440)
            await native.pdf({
              path: path.join(dir, `I${lesson.id}-study.pdf`),
              format: "A4",
              printBackground: true,
              preferCSSPageSize: true,
            });
          await native.close();
          downloads.push({
            lesson: lesson.id,
            html: { file: path.basename(htmlFile), bytes: html.length, sha256: hash(html) },
            svg: { file: path.basename(svgFile), bytes: svg.length, sha256: hash(svg) },
            sourcePages: pages,
          });
        }
        await openLesson(p, 22);
        await p.locator("#parameters summary").click();
        for (const [a, t, title] of [
          [40, 60, "external tangent"],
          [140, 40, "internal tangent"],
          [30, 30, "separate"],
          [140, 30, "contained"],
          [65, 120, "crossing"],
        ]) {
          await p.locator("#ratio").evaluate((el, v) => {
            el.value = String(v);
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }, a);
          await p.locator("#third").evaluate((el, v) => {
            el.value = String(v);
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }, t);
          await p.locator('#step-list [data-step="7"]').click();
          assert.equal(await p.locator("#hypothesis-warning").isVisible(), title !== "crossing");
          views.push(await rendered(p, { proposition: 22, a, c: t, case: title }));
        }
        await openLesson(p, 23);
        await p.locator('#step-list [data-step="5"]').click();
        if ((await p.locator("#parameters").getAttribute("open")) === null)
          await p.locator("#parameters summary").click();
        await p.locator("#ratio").focus();
        await p.keyboard.press("End");
        assert.equal(await p.locator("#ratio").inputValue(), "140");
        await p.locator("#angle").focus();
        await p.keyboard.press("Home");
        assert.equal(await p.locator("#angle").inputValue(), "20");
        await p.locator("#offset").focus();
        await p.keyboard.press("End");
        assert.equal(await p.locator("#offset").inputValue(), "45");
        views.push(
          await rendered(p, { proposition: 23, opening: 20, ratio: 1.4, tilt: 45, variant: 0 }),
        );
        await p.locator("#variant").selectOption("1");
        views.push(
          await rendered(p, { proposition: 23, opening: 20, ratio: 1.4, tilt: 45, variant: 1 }),
        );
        await p.locator("#ratio").focus();
        await p.keyboard.press("Home");
        await p.locator("#angle").focus();
        await p.keyboard.press("End");
        views.push(
          await rendered(p, { proposition: 23, opening: 150, ratio: 0.2, tilt: 45, variant: 1 }),
        );
        await p.locator("#share").click();
        const link = await p.locator("#share-url").inputValue();
        assert.equal(new URLSearchParams(new URL(link).hash.slice(1)).get("x"), "0.45");
        await p.keyboard.press("Escape");
        const shared = await c.newPage();
        await shared.goto(link);
        assert.equal(await shared.locator("#offset").inputValue(), "45");
        assert.equal(await shared.locator("#variant").inputValue(), "1");
        await shared.close();
        await p.goBack().catch(() => {});
        await p.goto(`${base}#p=23&s=1`);
        await p.locator('#current-passage [lang="grc"] [data-gloss="arbitrary"]').click();
        assert.match(
          await p.locator("#vocabulary-dialog").textContent(),
          /need not|not.*equal|arbitrary/,
        );
        await p.keyboard.press("Escape");
        await openLesson(p, 22);
        await p.locator("#open-practice").click();
        const exercises = [];
        for (let i = 0; i < 4; i++) {
          exercises.push(await p.locator("#practice-position").textContent());
          await p.locator("#practice-options input").nth(0).check();
          assert(await p.locator("#practice-feedback").textContent());
          if (i < 3) await p.locator("#practice-next").click();
        }
        await p.keyboard.press("Escape");
        await p.goto(`${base}#p=23&s=5&r=1.15&a=32&x=.25`);
        await source(p, 57);
        await p.locator('[data-source="57"]').first().click();
        await p
          .locator("#course-source-status")
          .filter({ hasText: /page verified/ })
          .waitFor();
        await p.goto(`${base}triangle.html`);
        await p.goBack();
        await p.locator("#source-dialog").waitFor({ state: "attached" });
        if (await p.locator("#source-dialog").evaluate((d) => d.open))
          await p
            .locator("#course-source-status")
            .filter({ hasText: /page verified/ })
            .waitFor();
        await p.keyboard.press("Escape");
        await source(p, 56);
        const axe = await new AxeBuilder({ page: p })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        assert.deepEqual(
          axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.length })),
          [],
        );
        await fits(p);
        await p.locator("#workbench").evaluate((el) => el.scrollIntoView({ block: "start" }));
        await p.screenshot({ path: path.join(dir, "workbench.png") });
        const inventory = await p.evaluate(async () => {
          const keys = (await caches.keys()).filter((k) => k.startsWith("stoicheia-"));
          return Promise.all(
            keys.map(async (key) => ({
              key,
              files: (await (await caches.open(key)).keys())
                .map((r) => new URL(r.url).pathname)
                .sort(),
            })),
          );
        });
        assert.equal(inventory.length, 1);
        assert.equal(inventory[0].key, `stoicheia-${edition}`);
        assert.deepEqual(inventory[0].files, files.slice().sort());
        server?.offline();
        await c.setOffline(true);
        const offlineRooms = [];
        for (const room of [
          "triangle.html",
          "quadrature.html",
          "gnomon.html",
          "mesolabe.html",
          "desk.html",
          "measure.html",
          "index.html",
        ]) {
          await p.goto(base + room);
          await ready(p);
          offlineRooms.push(room);
        }
        await openLesson(p, 23);
        await p.locator('#step-list [data-step="5"]').click();
        await source(p, 57);
        const offline = await save(p, "#save-sheet", path.join(dir, "offline-I23.html"));
        assert(offline.length > 2000000);
        await p.reload();
        assert.match(await p.locator("#step-position").textContent(), /Step 6 of 7/);
        await p.locator("#offset").focus();
        await p.keyboard.press("ArrowRight");
        await p.reload();
        assert.equal(await p.locator("#offset").inputValue(), "1");
        assert.deepEqual(errors, []);
        report.configurations.push({
          browser: name,
          version: b.version(),
          width,
          readingUnits: 15,
          downloads,
          views,
          exercises,
          axeViolations: 0,
          inventory,
          offlineRooms,
          offlineSourceAndReading: true,
          pageErrors: errors,
        });
        await writeFile(path.join(out, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
        console.log(
          `${name}/${width}: full readings, constructions, exact source bytes, native files and seven rooms offline passed.`,
        );
      } finally {
        await c.close();
        await server?.close();
      }
    }
  } finally {
    await b.close();
  }
}
