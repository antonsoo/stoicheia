import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const output = path.resolve(process.argv[2] ?? "/tmp/stoicheia-gnomon-hosted");
const base = "https://antonsoo.github.io/stoicheia/";
await mkdir(output, { recursive: true });
const expected = JSON.parse(await readFile("docs/gnomon-build.json", "utf8"));
const report = {
  checkedAt: new Date().toISOString(),
  base,
  runtimeCommit: expected.runtimeCommit,
  files: [],
};
for (const file of expected.files) {
  const response = await fetch(`${base}${file.file}?review=${Date.now()}`);
  assert.equal(response.status, 200, file.file);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(createHash("sha256").update(bytes).digest("hex"), file.sha256, file.file);
  report.files.push(file);
}
await writeFile(path.join(output, "files.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`${report.files.length} public files match the reviewed build`);
const result = spawnSync(
  process.execPath,
  ["scripts/gnomon-browser.mjs", output, base, "--hosted"],
  { stdio: "inherit" },
);
assert.equal(result.status, 0, "Public browser review failed");
