/* Offline edition df552a2b04b453dc. Generated from the complete build. */
const CACHE = "stoicheia-df552a2b04b453dc";
const BASE = "/stoicheia/";
const FILES = ["/stoicheia/assets/index-BG9Jbv_R.css","/stoicheia/assets/index-CpJz_uWN.js","/stoicheia/favicon.svg","/stoicheia/fonts/NotoSerif-Regular.ttf","/stoicheia/fonts/OFL.txt","/stoicheia/index.html","/stoicheia/sources/heiberg-004.jpg","/stoicheia/sources/heiberg-005.jpg","/stoicheia/sources/heiberg-006.jpg","/stoicheia/sources/heiberg-007.jpg","/stoicheia/sources/heiberg-008.jpg","/stoicheia/sources/heiberg-009.jpg","/stoicheia/sources/heiberg-010.jpg","/stoicheia/sources/heiberg-011.jpg","/stoicheia/sources/heiberg-012.jpg","/stoicheia/sources/heiberg-013.jpg","/stoicheia/sources/heiberg-014.jpg","/stoicheia/sources/heiberg-015.jpg","/stoicheia/sources/heiberg-016.jpg","/stoicheia/sources/heiberg-017.jpg","/stoicheia/sources/heiberg-018.jpg","/stoicheia/sources/heiberg-019.jpg","/stoicheia/sources/heiberg-020.jpg","/stoicheia/sources/heiberg-021.jpg","/stoicheia/sources/heiberg-022.jpg","/stoicheia/sources/heiberg-023.jpg","/stoicheia/sources/heiberg-024.jpg","/stoicheia/sources/heiberg-025.jpg","/stoicheia/sources/manifest.json"];
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
