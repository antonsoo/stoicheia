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

export default defineConfig({
  base,
  plugins: [
    {
      name: "offline-book",
      apply: "build",
      async closeBundle() {
        const files = (await filesIn("dist")).filter((f) => !f.endsWith("sw.js")).sort();
        const hash = createHash("sha256");
        for (const file of files) {
          hash.update(file);
          hash.update(await readFile(file));
        }
        const version = hash.digest("hex").slice(0, 16);
        const urls = files.map(
          (file) => base + path.relative("dist", file).split(path.sep).join("/"),
        );
        await writeFile(
          "dist/sw.js",
          `/* Offline edition ${version}. Generated from the complete build. */
const CACHE = "stoicheia-${version}";
const BASE = ${JSON.stringify(base)};
const FILES = ${JSON.stringify(urls)};
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("stoicheia-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(cache => cache.match(BASE + "index.html"))));
  } else if (FILES.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(url.pathname)).then(cached => cached || fetch(event.request)));
  }
});
`,
        );
      },
    },
  ],
});
