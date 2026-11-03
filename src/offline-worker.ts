/// <reference lib="webworker" />

declare const CACHE: string;
declare const EDITION: string;
declare const BASE: string;
declare const FILES: string[];
declare const RECOVERY_HTML: string;
declare const IDENTITIES: Record<string, { bytes: number; sha256: string }>;
declare const transfer: typeof import("./core/verified-transfer").verifiedTransfer;
const book = self as unknown as ServiceWorkerGlobalScope;
let ownActive = book.registration.active;
let ownInstalling = book.registration.installing;
let installing = false;
let fillTask: Promise<void> | undefined;
let inspection: Promise<Inventory> | undefined;
let generation = 0;
let damageGeneration = -1;
const ports = new Set<MessagePort>();
const lockName = `stoicheia-cache:${BASE}`;
interface Inventory {
  complete: boolean;
  missing: number;
  corrupt: number;
  retired?: boolean;
  changed?: boolean;
}
const current = () =>
  Boolean(ownActive && book.registration.active === ownActive && ownActive.state !== "redundant");

async function concurrent<T>(items: readonly T[], action: (item: T) => Promise<void>, limit = 4) {
  let index = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (index < items.length) {
        const item = items[index++];
        if (item !== undefined) await action(item);
      }
    }),
  );
}
async function locked<T>(action: () => Promise<T>): Promise<T> {
  if (!book.navigator.locks)
    throw new Error(
      "This browser cannot coordinate offline repair. Save an illustrated reading instead.",
    );
  return book.navigator.locks.request(lockName, action);
}
async function announce(type: string) {
  if (!installing && !current()) return;
  for (const client of await book.clients.matchAll({ includeUncontrolled: true }))
    if (new URL(client.url).pathname.startsWith(BASE))
      client.postMessage({ type, edition: EDITION });
}
async function damaged() {
  if (installing || !current() || damageGeneration === generation) return;
  damageGeneration = generation;
  await announce("STOICHEIA_CACHE_DAMAGED");
}
async function matches(response: Response, url: string, checkType = true): Promise<boolean> {
  const identity = IDENTITIES[url];
  if (!identity || !response.ok) return false;
  if (
    checkType &&
    response.headers.get("Content-Type")?.split(";")[0]?.trim().toLowerCase() !==
      mediaType(url).split(";")[0]
  )
    return false;
  try {
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength !== identity.bytes) return false;
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
    return Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("") === identity.sha256;
  } catch {
    return false;
  }
}
async function cached(url: string): Promise<Response | undefined> {
  // Read-only: an evicted or retired edition must never reappear during a read.
  const response = await caches.match(url, { cacheName: CACHE });
  return response && (await matches(response.clone(), url)) ? response : undefined;
}
async function inspect(): Promise<Inventory> {
  if (inspection) return inspection;
  const start = generation;
  const task = (async () => {
    let missing = 0,
      corrupt = 0;
    await concurrent(FILES, async (url) => {
      const response = await caches.match(url, { cacheName: CACHE });
      if (!response) missing++;
      else if (!(await matches(response, url))) corrupt++;
    });
    const retired = !installing && !current();
    if (missing || corrupt) await damaged();
    else if (start === generation && !retired) damageGeneration = -1;
    return {
      complete: !missing && !corrupt && start === generation && !retired,
      missing,
      corrupt,
      ...(retired ? { retired: true } : {}),
      ...(start !== generation ? { changed: true } : {}),
    };
  })();
  inspection = task;
  try {
    return await task;
  } finally {
    if (inspection === task) inspection = undefined;
  }
}
function mediaType(url: string): string {
  const extension = url.split(".").pop();
  return (
    (
      {
        html: "text/html;charset=utf-8",
        js: "text/javascript;charset=utf-8",
        css: "text/css;charset=utf-8",
        json: "application/json",
        svg: "image/svg+xml",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        ttf: "font/ttf",
        txt: "text/plain;charset=utf-8",
      } as Record<string, string>
    )[extension ?? ""] ?? "application/octet-stream"
  );
}
async function network(
  url: string,
  signal?: AbortSignal,
  onProgress?: (loaded: number) => void,
): Promise<Response> {
  const identity = IDENTITIES[url];
  if (!identity) throw new Error("This file is not part of the saved edition.");
  const bytes = await transfer(url, identity, {
    cache: "reload",
    ...(signal ? { signal } : {}),
    ...(onProgress ? { onProgress } : {}),
  });
  return new Response(bytes, { headers: { "Content-Type": mediaType(url) } });
}
async function reusable(url: string): Promise<Response | undefined> {
  // Reuse only cryptographically matching bytes. Old metadata is replaced with
  // the current type; a damaged Content-Type must not break a saved module.
  const names = [
    CACHE,
    ...(await caches.keys()).filter((name) => name.startsWith("stoicheia-") && name !== CACHE),
  ];
  for (const name of names) {
    const response = await caches.match(url, { cacheName: name });
    if (response && (await matches(response.clone(), url, false)))
      return new Response(await response.arrayBuffer(), {
        headers: { "Content-Type": mediaType(url) },
      });
  }
}
async function store(url: string, response: Response, duringInstall = false): Promise<void> {
  // Activation and writes share a short lock. Network transfer never holds it.
  // An old worker finishing a delayed repair cannot recreate its retired cache.
  await locked(async () => {
    if (
      duringInstall &&
      (!ownInstalling ||
        book.registration.installing !== ownInstalling ||
        ownInstalling.state === "redundant")
    )
      throw new Error("This installation was replaced.");
    if (!duringInstall && !current())
      throw new Error("A newer edition has replaced this one. Reload before repairing.");
    const cache = await caches.open(CACHE);
    await cache.put(url, response);
    generation++;
  });
}
async function discard(url: string) {
  await locked(async () => {
    if (!current() || !(await caches.has(CACHE))) return;
    if (await (await caches.open(CACHE)).delete(url)) generation++;
  });
}
async function fill(duringInstall: boolean) {
  if (fillTask) return fillTask;
  const task = (async () => {
    if (inspection) await inspection;
    const controller = new AbortController();
    let finished = 0,
      loaded = 0,
      lastProgress = 0;
    const progress = (delta = 0, force = false) => {
      loaded += delta;
      const now = Date.now();
      if (!force && now - lastProgress < 750) return;
      lastProgress = now;
      for (const port of ports) {
        try {
          port.postMessage({
            type: "STOICHEIA_PROGRESS",
            edition: EDITION,
            finished,
            total: FILES.length,
            loaded,
          });
        } catch {
          ports.delete(port);
        }
      }
    };
    try {
      // Two background streams leave room for the learner's foreground source reads.
      const order = [...FILES].sort(
        (a, b) => (IDENTITIES[b]?.bytes ?? 0) - (IDENTITIES[a]?.bytes ?? 0),
      );
      await concurrent(
        order,
        async (url) => {
          controller.signal.throwIfAborted();
          if (!duringInstall && !current())
            throw new Error("A newer edition has replaced this one.");
          if (!(await cached(url))) {
            let previous = 0;
            const response =
              (await reusable(url)) ??
              (await network(url, controller.signal, (bytes) => {
                progress(bytes - previous);
                previous = bytes;
              }));
            controller.signal.throwIfAborted();
            await store(url, response, duringInstall);
          }
          finished++;
          progress(0, true);
        },
        2,
      );
      const result = await inspect();
      if (!result.complete)
        throw new Error("The saved edition is still incomplete. Reconnect and repair again.");
    } catch (error) {
      controller.abort();
      throw error;
    } finally {
      for (const port of ports) {
        try {
          port.postMessage({ type: "STOICHEIA_FILL_FINISHED", edition: EDITION });
        } catch {
          /* Closed page. */
        }
      }
    }
  })();
  fillTask = task;
  try {
    await task;
  } finally {
    if (fillTask === task) fillTask = undefined;
  }
}
book.addEventListener("install", (event) => {
  installing = true;
  ownInstalling = book.registration.installing;
  event.waitUntil(fill(true).then(() => book.skipWaiting()));
});
book.addEventListener("activate", (event) => {
  ownActive = book.registration.active;
  installing = false;
  event.waitUntil(
    (async () => {
      await locked(async () => {
        await Promise.all(
          (await caches.keys())
            .filter((key) => key.startsWith("stoicheia-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        );
      });
      await book.clients.claim();
      await announce("STOICHEIA_CACHE_CHANGED");
    })(),
  );
});
book.addEventListener("message", (event) => {
  if (event.data?.type === "STOICHEIA_CLAIM_EDITION" && event.data.edition === EDITION) {
    event.waitUntil(book.clients.claim());
    return;
  }
  const port = event.ports[0];
  if (!port) return;
  if (event.data?.type === "STOICHEIA_WATCH_INSTALL") {
    ports.add(port);
    event.waitUntil(
      (fillTask ?? Promise.resolve()).catch(() => {}).finally(() => ports.delete(port)),
    );
    return;
  }
  if (!["STOICHEIA_INSPECT_EDITION", "STOICHEIA_REPAIR_EDITION"].includes(event.data?.type)) return;
  event.waitUntil(
    (async () => {
      try {
        if (event.data.type === "STOICHEIA_REPAIR_EDITION") {
          if (event.data.edition !== EDITION || !current())
            throw new Error("A different edition is open. Reload before repairing it.");
          ports.add(port);
          await announce("STOICHEIA_CACHE_CHECKING");
          await fill(false);
        }
        if (fillTask) {
          if (event.data.protocol === 2) ports.add(port);
          await fillTask.catch(() => {});
        }
        const inventory = await inspect();
        port.postMessage({
          type: "STOICHEIA_EDITION",
          protocol: 2,
          edition: EDITION,
          ...inventory,
        });
        if (event.data.type === "STOICHEIA_REPAIR_EDITION")
          await announce("STOICHEIA_CACHE_CHANGED");
      } catch (error) {
        port.postMessage({
          type: "STOICHEIA_EDITION",
          protocol: 2,
          edition: EDITION,
          complete: false,
          error: error instanceof Error ? error.message : "The saved files could not be checked.",
        });
        await damaged();
      } finally {
        ports.delete(port);
      }
    })(),
  );
});

async function asset(url: string): Promise<Response> {
  const response = await cached(url);
  if (response) return response;
  const recovered = await reusable(url);
  await discard(url);
  await damaged();
  const fresh = recovered ?? (await network(url));
  try {
    await store(url, fresh.clone());
    await announce("STOICHEIA_CACHE_CHANGED");
  } catch {
    await damaged();
  }
  return fresh;
}
async function bootstrapAvailable(response: Response): Promise<boolean> {
  const html = await response.clone().text();
  const tags = html.match(/<(?:script|link)\b[^>]*>/gi) ?? [];
  const files = new Set<string>();
  for (const tag of tags) {
    if (!/^<script\b/i.test(tag) && !/rel=["'](?:stylesheet|modulepreload)["']/i.test(tag))
      continue;
    const value = /(?:src|href)=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!value) continue;
    const url = new URL(value, `${book.location.origin}${BASE}`);
    if (url.origin === book.location.origin && FILES.includes(url.pathname))
      files.add(url.pathname);
  }
  for (const file of files) if (!(await cached(file))) return false;
  return true;
}
function recovery(): Response {
  return new Response(RECOVERY_HTML, {
    status: 503,
    headers: { "Content-Type": "text/html;charset=utf-8", "Cache-Control": "no-store" },
  });
}
async function navigation(request: Request, url: string): Promise<Response> {
  const saved = await cached(url);
  const usable = saved && (await bootstrapAvailable(saved));
  if (!usable) {
    await discard(url);
    await damaged();
  }
  // Recheck at fallback time: an edition can be evicted or replaced while
  // the origin is stalled. A previously read response is not a saved copy.
  const fallback = async () => {
    const latest = current() ? await cached(url) : undefined;
    return latest && (await bootstrapAvailable(latest)) ? latest : recovery();
  };
  const controller = new AbortController();
  const cancel = () => controller.abort();
  request.signal.addEventListener("abort", cancel, { once: true });
  if (request.signal.aborted) cancel();
  let deadline: ReturnType<typeof setTimeout> | undefined;
  try {
    const live = fetch(request, { signal: controller.signal })
      .then(async (response) => {
        if (response.status >= 500) {
          controller.abort();
          return fallback();
        }
        if (!response.ok) return response;
        const body = await response.clone().text();
        // A maintenance page with HTTP 200 is not a lesson. A genuine new edition
        // can pass through and install its own worker and complete inventory.
        if (!/<meta\s+name=["']stoicheia-edition["']\s+content=["'][a-f0-9]{64}["']/i.test(body)) {
          controller.abort();
          return fallback();
        }
        return response;
      })
      .catch(() => fallback());
    const expired = new Promise<Response>((resolve) => {
      deadline = setTimeout(
        () => {
          controller.abort();
          resolve(fallback());
        },
        saved ? 2000 : 15000,
      );
    });
    return await Promise.race([live, expired]);
  } finally {
    clearTimeout(deadline);
    request.signal.removeEventListener("abort", cancel);
  }
}

book.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    url.origin !== book.location.origin ||
    !url.pathname.startsWith(BASE)
  )
    return;
  const file = url.pathname === BASE ? `${BASE}index.html` : url.pathname;
  if (!FILES.includes(file)) return;
  event.respondWith(
    event.request.mode === "navigate"
      ? navigation(event.request, file)
      : asset(file).catch(() => Response.error()),
  );
});
