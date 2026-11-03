import { verifiedTransfer } from "./core/verified-transfer";
export interface StudyAsset {
  bytes: number;
  sha256: string;
}
interface AssetRead {
  promise: Promise<Uint8Array<ArrayBuffer>>;
  controller: AbortController;
  readers: number;
  settled: boolean;
}
interface QueuedRead {
  file: string;
  priority: number;
  start: () => void;
}
const pending = new Map<string, AssetRead>();
const queue: QueuedRead[] = [];
let active = 0;
function acquire(signal: AbortSignal, priority: number, file: string): Promise<() => void> {
  return new Promise((resolve, reject) => {
    const entry: QueuedRead = { file, priority, start: () => {} };
    const abort = () => {
      const i = queue.indexOf(entry);
      if (i >= 0) queue.splice(i, 1);
      reject(new DOMException("The reading was cancelled.", "AbortError"));
    };
    entry.start = () => {
      signal.removeEventListener("abort", abort);
      active++;
      resolve(() => {
        active--;
        const next = queue.shift();
        next?.start();
      });
    };
    if (signal.aborted) {
      abort();
      return;
    }
    if (active < 3) entry.start();
    else {
      signal.addEventListener("abort", abort, { once: true });
      queue.push(entry);
      queue.sort((a, b) => b.priority - a.priority);
    }
  });
}
export function studyAssetIdentity(file: string): StudyAsset {
  const identity = __STOICHEIA_STUDY_FILES__[file];
  if (!identity) throw new Error(`The current edition does not identify ${file}.`);
  return identity;
}
function verifiedBytes(
  file: string,
  signal?: AbortSignal,
  priority = 0,
): Promise<Uint8Array<ArrayBuffer>> {
  signal?.throwIfAborted();
  const identity = studyAssetIdentity(file);
  let read = pending.get(file);
  if (!read) {
    const controller = new AbortController();
    const entry: AssetRead = {
      promise: Promise.resolve(new Uint8Array()),
      controller,
      readers: 0,
      settled: false,
    };
    entry.promise = (async () => {
      const release = await acquire(controller.signal, priority, file);
      try {
        return await verifiedTransfer(`${import.meta.env.BASE_URL}${file}`, identity, {
          signal: controller.signal,
        });
      } finally {
        release();
      }
    })().then(
      (bytes) => {
        entry.settled = true;
        return bytes;
      },
      (error: unknown) => {
        entry.settled = true;
        if (pending.get(file) === entry) pending.delete(file);
        throw new Error(
          `${file}: ${error instanceof Error ? error.message : "the source could not be read"}`,
        );
      },
    );
    read = entry;
    pending.set(file, entry);
  }
  const waiting = queue.find((item) => item.file === file);
  if (waiting && priority > waiting.priority) {
    waiting.priority = priority;
    queue.sort((a, b) => b.priority - a.priority);
  }
  const entry = read;
  entry.readers++;
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (bytes?: Uint8Array<ArrayBuffer>, error?: unknown) => {
      if (done) return;
      done = true;
      signal?.removeEventListener("abort", abort);
      entry.readers--;
      if (!entry.readers && !entry.settled) {
        if (pending.get(file) === entry) pending.delete(file);
        entry.controller.abort();
      }
      if (bytes) resolve(bytes);
      else reject(error);
    };
    const abort = () =>
      finish(undefined, new DOMException("The reading was cancelled.", "AbortError"));
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    entry.promise.then(
      (bytes) => finish(bytes),
      (error) => finish(undefined, error),
    );
  });
}
export async function studyDataUrl(
  file: string,
  type: string,
  signal?: AbortSignal,
): Promise<string> {
  const bytes = await verifiedBytes(file, signal);
  signal?.throwIfAborted();
  let raw = "";
  for (let i = 0; i < bytes.length; i += 8192)
    raw += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return `data:${type};base64,${btoa(raw)}`;
}
export async function studyText(file: string, signal?: AbortSignal): Promise<string> {
  return new TextDecoder().decode(await verifiedBytes(file, signal));
}
/** Cancelling one viewer does not cancel a shared export's read of the same file. */
export async function studyBlobUrl(
  file: string,
  type: string,
  signal?: AbortSignal,
): Promise<string> {
  const bytes = await verifiedBytes(file, signal, 1);
  signal?.throwIfAborted();
  return URL.createObjectURL(new Blob([bytes], { type }));
}
