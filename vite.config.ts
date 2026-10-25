import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { defineConfig } from "vite";

const base = "/stoicheia/";

async function filesIn(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? filesIn(path.join(directory, entry.name))
        : Promise.resolve([path.join(directory, entry.name)]),
    ),
  );
  return nested.flat();
}

export default defineConfig(async ({ command }) => {
  const inputFiles = [
    ...(await filesIn("src")),
    ...(await filesIn("public")),
    "index.html",
    "triangle.html",
    "quadrature.html",
    "gnomon.html",
    "mesolabe.html",
    "desk.html",
    "measure.html",
    "circle.html",
    "LICENSE",
    "vite.config.ts",
    "tsconfig.json",
    "package.json",
    "package-lock.json",
  ].sort();
  const inputHash = createHash("sha256");
  for (const file of inputFiles) {
    inputHash.update(file);
    inputHash.update(await readFile(file));
  }
  const edition = command === "build" ? inputHash.digest("hex") : "development";
  const studyFiles: Record<string, { bytes: number; sha256: string }> = {};
  for (const manifest of [
    "public/sources/manifest.json",
    "public/sources/mesolabe/manifest.json",
    "public/sources/measure/manifest.json",
    "public/sources/circle/manifest.json",
  ]) {
    const sourceManifest = JSON.parse(await readFile(manifest, "utf8")) as {
      pages: { file: string; bytes: number; sha256: string }[];
    };
    for (const page of sourceManifest.pages) {
      const file = `sources/${page.file}`;
      const bytes = await readFile(`public/${file}`);
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      if (bytes.length !== page.bytes || sha256 !== page.sha256)
        throw new Error(
          `Source manifest does not match ${file}. Review the source identity before building.`,
        );
      studyFiles[file] = { bytes: bytes.length, sha256 };
    }
  }
  for (const file of ["fonts/NotoSerif-Regular.ttf", "fonts/OFL.txt"]) {
    const bytes = await readFile(`public/${file}`);
    studyFiles[file] = {
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  }
  return {
    base,
    build: {
      rollupOptions: {
        input: {
          reader: "index.html",
          triangle: "triangle.html",
          quadrature: "quadrature.html",
          gnomon: "gnomon.html",
          mesolabe: "mesolabe.html",
          desk: "desk.html",
          measure: "measure.html",
          circle: "circle.html",
        },
      },
    },
    define: {
      __STOICHEIA_EDITION__: JSON.stringify(edition),
      __STOICHEIA_STUDY_FILES__: JSON.stringify(studyFiles),
    },
    plugins: [
      {
        name: "offline-book",
        apply: "build",
        async closeBundle() {
          const files = (await filesIn("dist")).filter((f) => !f.endsWith("sw.js")).sort();
          const urls = files.map(
            (file) => base + path.relative("dist", file).split(path.sep).join("/"),
          );
          const integrity = Object.fromEntries(
            await Promise.all(
              files.map(async (file, index) => [
                urls[index],
                `sha256-${createHash("sha256")
                  .update(await readFile(file))
                  .digest("base64")}`,
              ]),
            ),
          );
          await writeFile(
            "dist/sw.js",
            `/* Offline edition ${edition}. Generated from the complete build. */
const CACHE = "stoicheia-${edition}";
const EDITION = ${JSON.stringify(edition)};
const BASE = ${JSON.stringify(base)};
const FILES = ${JSON.stringify(urls)};
const INTEGRITY = ${JSON.stringify(integrity)};
self.addEventListener("install", event => {
  // HTTP success does not establish edition identity. A stale entry page or
  // substituted scan must fail the complete install before this worker activates.
  const requests = FILES.map(url => new Request(url, { cache: "reload", integrity: INTEGRITY[url] }));
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(requests)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("stoicheia-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("message", event => {
  if (event.data?.type === "STOICHEIA_CLAIM_EDITION" && event.data.edition === EDITION) {
    event.waitUntil(self.clients.claim());
    return;
  }
  if (event.data?.type !== "STOICHEIA_INSPECT_EDITION" || !event.ports[0]) return;
  // Inspection must not recreate a deleted or retired edition cache.
  event.waitUntil(Promise.all(FILES.map(file => caches.match(file, { cacheName: CACHE }))).then(saved => {
    event.ports[0].postMessage({ type: "STOICHEIA_EDITION", edition: EDITION, complete: saved.every(Boolean) });
  }).catch(() => event.ports[0].postMessage({ type: "STOICHEIA_EDITION", edition: EDITION, complete: false })));
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (event.request.mode === "navigate") {
    const page = url.pathname === BASE ? BASE + "index.html" : url.pathname;
    event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(async cache => (await cache.match(page)) || Response.error())));
  } else if (FILES.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(url.pathname)).then(cached => cached || fetch(event.request)));
  }
});
`,
          );
        },
      },
    ],
  };
});
