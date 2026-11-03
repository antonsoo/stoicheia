import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const base = process.argv[2] ?? "https://antonsoo.github.io/stoicheia/";
const output = process.argv[3];
assert.ok(output, "Supply the hosted base URL and a receipt path");
const build = JSON.parse(
  await readFile(process.argv[4] ?? "docs/evidence/saved-reader/build.json", "utf8"),
);
const rows = new Array(build.artifacts.length);
let cursor = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (cursor < build.artifacts.length) {
      const index = cursor++,
        expected = build.artifacts[index];
      const url = new URL(expected.file, base).href;
      // Exact canonical URLs: no cache-busting query or alternate raw origin.
      const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
      assert.equal(response.status, 200, url);
      const bytes = Buffer.from(await response.arrayBuffer());
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      assert.equal(bytes.length, expected.bytes, url);
      assert.equal(sha256, expected.sha256, url);
      rows[index] = {
        file: expected.file,
        url,
        status: response.status,
        bytes: bytes.length,
        sha256,
        etag: response.headers.get("etag"),
      };
    }
  }),
);
const report = {
  checkedAt: new Date().toISOString(),
  base,
  runtimeCommit: build.runtimeCommit,
  canonicalUrlsWithoutQueries: true,
  verifiedFiles: rows.length,
  verifiedBytes: rows.reduce((n, row) => n + row.bytes, 0),
  files: rows,
};
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`${report.verifiedFiles} canonical hosted files match; ${report.verifiedBytes} bytes`);
