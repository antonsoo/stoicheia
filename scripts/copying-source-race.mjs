import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { chromium, firefox } from "playwright";

const base = process.argv[2],
  output = process.argv[3];
assert(base && output, "Supply a served production base and JSON output path.");
const manifest = JSON.parse(await readFile("public/sources/manifest.json", "utf8")),
  rows = [];
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const b = await engine.launch();
  try {
    const c = await b.newContext({
      serviceWorkers: "block",
      viewport: { width: 375, height: 1000 },
    });
    try {
      await c.addInitScript(() => {
        const original = URL.createObjectURL.bind(URL);
        window.raceBlobs = new Map();
        URL.createObjectURL = (blob) => {
          const url = original(blob);
          window.raceBlobs.set(url, blob);
          return url;
        };
      });
      const p = await c.newPage(),
        errors = [];
      p.on("pageerror", (e) => errors.push(e.message));
      let release,
        held = false;
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      await p.route("**/sources/heiberg-053.jpg", async (route) => {
        held = true;
        await gate;
        await route.fulfill({
          contentType: "image/jpeg",
          body: await readFile("public/sources/heiberg-053.jpg"),
        });
      });
      await p.goto(`${base}#p=21&s=9`);
      await p.locator('#current-passage [data-source="53"]').click();
      await p.waitForFunction(() =>
        document.querySelector("#course-source-status").textContent.includes("Verifying"),
      );
      for (let i = 0; i < 100 && !held; i++) await new Promise((r) => setTimeout(r, 20));
      assert(held);
      await p.locator("#source-next").click();
      await p.locator("#source-next").click();
      await p.waitForFunction(
        () =>
          document.querySelector("#source-image").dataset.sourcePage === "55" &&
          !document.querySelector("#source-image").hidden,
      );
      await p.locator("#source-zoom").click();
      release();
      await p.waitForResponse((r) => r.url().endsWith("heiberg-053.jpg"));
      // Let the deliberately late response finish decoding and any rendering
      // tasks run before checking the visible image and its actual blob bytes.
      await p.waitForTimeout(300);
      assert.equal(await p.locator("#source-title").textContent(), "Printed page 55");
      assert.equal(await p.locator("#source-language").textContent(), "Latin translation");
      async function bytes(page) {
        const n = Number(await p.locator("#source-image").getAttribute("data-source-page"));
        assert.equal(n, page);
        const data = await p
          .locator("#source-image")
          .evaluate(async (i) => [
            ...new Uint8Array(await window.raceBlobs.get(i.src).arrayBuffer()),
          ]);
        assert.equal(
          createHash("sha256").update(Buffer.from(data)).digest("hex"),
          manifest.pages.find((x) => x.printed_page === page).sha256,
        );
      }
      await bytes(55);
      await p.locator("#source-previous").click();
      await p.locator("#source-previous").click();
      await p.waitForFunction(
        () =>
          document.querySelector("#source-image").dataset.sourcePage === "53" &&
          !document.querySelector("#source-image").hidden,
      );
      await bytes(53);
      assert(await p.locator("#source-image").evaluate((i) => i.classList.contains("zoomed")));
      assert.deepEqual(errors, []);
      rows.push({
        browser: name,
        version: b.version(),
        width: 375,
        heldPage: 53,
        navigatedThrough: [54, 55],
        latePageDoesNotReplaceVisiblePage: true,
        actualDisplayedBytesVerified: [55, 53],
        zoomPreserved: true,
        pageErrors: errors,
      });
      console.log(`${name}: late p.53 cannot replace p.55; exact p.53 returns with zoom intact.`);
    } finally {
      await c.close();
    }
  } finally {
    await b.close();
  }
}
await writeFile(
  output,
  `${JSON.stringify({ checkedAt: new Date().toISOString(), base, scope: "Real production viewer with service workers blocked; deliberately reordered source responses", rows }, null, 2)}\n`,
);
