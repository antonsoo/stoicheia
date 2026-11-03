export interface TransferIdentity {
  bytes: number;
  sha256: string;
}
export interface TransferOptions {
  signal?: AbortSignal;
  onProgress?: (loaded: number) => void;
  inactivityMs?: number;
  deadlineMs?: number;
  cache?: RequestCache;
}

/** Self-contained so the build can use this same function in the classic worker. */
export async function verifiedTransfer(
  url: string,
  identity: TransferIdentity,
  options: TransferOptions = {},
): Promise<Uint8Array<ArrayBuffer>> {
  if (
    !Number.isSafeInteger(identity.bytes) ||
    identity.bytes < 0 ||
    !/^[a-f0-9]{64}$/.test(identity.sha256)
  )
    throw new Error("This file has no valid edition identity.");
  const controller = new AbortController();
  const idleMs = options.inactivityMs ?? 15000;
  const deadlineMs = options.deadlineMs ?? 180000;
  let idle: ReturnType<typeof setTimeout> | undefined;
  let reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>> | undefined;
  let reason = "";
  let receivedHeaders = false;
  const stop = (message: string) => {
    reason = message;
    controller.abort();
  };
  const resetIdle = () => {
    clearTimeout(idle);
    idle = setTimeout(
      () => stop("The transfer stopped sending data. Reconnect and try again."),
      idleMs,
    );
  };
  const deadline = setTimeout(
    () => stop("The transfer exceeded its total time limit. Please try again."),
    deadlineMs,
  );
  const abort = () => {
    reason = "The transfer was cancelled.";
    controller.abort();
  };
  const cancelReader = () => {
    void reader?.cancel().catch(() => {});
  };
  options.signal?.addEventListener("abort", abort, { once: true });
  controller.signal.addEventListener("abort", cancelReader, { once: true });
  if (options.signal?.aborted) abort();
  // A browser may queue a fetch behind other connections. The total deadline
  // bounds that wait; inactivity starts only once response headers arrive.
  try {
    controller.signal.throwIfAborted();
    // Keep ordinary reader requests eligible for a controlling worker's saved
    // response, including Firefox's offline mode. Worker-originated repair reads
    // explicitly bypass the HTTP cache; byte verification still applies to both.
    const response = await fetch(url, {
      cache: options.cache ?? "default",
      signal: controller.signal,
    });
    receivedHeaders = true;
    if (!response.ok)
      throw new Error(`The server returned HTTP ${response.status}. Reconnect and try again.`);
    if (!response.body) throw new Error("The server returned no file body.");
    resetIdle();
    reader = response.body.getReader();
    const bytes = new Uint8Array(identity.bytes);
    let loaded = 0;
    while (true) {
      const chunk = await reader.read();
      controller.signal.throwIfAborted();
      if (chunk.done) break;
      if (loaded + chunk.value.byteLength > bytes.length)
        throw new Error("The file does not match this edition (too many bytes).");
      bytes.set(chunk.value, loaded);
      loaded += chunk.value.byteLength;
      resetIdle();
      options.onProgress?.(loaded);
    }
    clearTimeout(idle);
    if (loaded !== identity.bytes)
      throw new Error("The file does not match this edition (incomplete body).");
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
    const actual = Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("");
    controller.signal.throwIfAborted();
    if (actual !== identity.sha256)
      throw new Error("The file does not match this edition (different bytes).");
    return bytes;
  } catch (error) {
    // A wrong or oversized response must not keep streaming after verification fails.
    if (!controller.signal.aborted) controller.abort();
    throw new Error(
      reason ||
        (!receivedHeaders && error instanceof TypeError
          ? "The file could not be transferred. Reconnect and try again."
          : error instanceof Error
            ? error.message
            : "The file could not be read."),
    );
  } finally {
    clearTimeout(idle);
    clearTimeout(deadline);
    options.signal?.removeEventListener("abort", abort);
    controller.signal.removeEventListener("abort", cancelReader);
    reader?.releaseLock();
  }
}
