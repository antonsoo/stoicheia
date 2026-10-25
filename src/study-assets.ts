export interface StudyAsset {
  bytes: number;
  sha256: string;
}

const pending = new Map<string, Promise<Uint8Array<ArrayBuffer>>>();

export function studyAssetIdentity(file: string): StudyAsset {
  const identity = __STOICHEIA_STUDY_FILES__[file];
  if (!identity) throw new Error(`The current edition does not identify ${file}.`);
  return identity;
}

async function verifiedBytes(file: string): Promise<Uint8Array<ArrayBuffer>> {
  const identity = studyAssetIdentity(file);
  const existing = pending.get(file);
  if (existing) return existing;
  const task = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}${file}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Could not read ${file}. Reconnect and try saving again.`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
      if (bytes.length !== identity.bytes || digest !== identity.sha256)
        throw new Error(
          `${file} does not match this edition. Reload the current edition and try again.`,
        );
      return bytes;
    } catch (error) {
      if (controller.signal.aborted)
        throw new Error(`Timed out reading ${file}. Reconnect and try saving again.`);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  })();
  pending.set(file, task);
  try {
    return await task;
  } catch (error) {
    pending.delete(file);
    throw error;
  }
}

export async function studyDataUrl(file: string, type: string): Promise<string> {
  const bytes = await verifiedBytes(file);
  let raw = "";
  for (let i = 0; i < bytes.length; i += 8192)
    raw += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return `data:${type};base64,${btoa(raw)}`;
}

export async function studyText(file: string): Promise<string> {
  return new TextDecoder().decode(await verifiedBytes(file));
}

/** Caller owns and revokes the URL. Source viewing uses the same verified bytes as export. */
export async function studyBlobUrl(file: string, type: string): Promise<string> {
  return URL.createObjectURL(new Blob([await verifiedBytes(file)], { type }));
}
