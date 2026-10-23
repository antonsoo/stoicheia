import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { lessons, reasons } from "../src/content/lessons.ts";

const file = process.argv[2];
if (!file) throw new Error("Pass the I.21 study PDF saved by the browser review.");
const normalize = (s: string) => s.normalize("NFC").replace(/\s+/g, "");
// Content-stream order preserves the parallel columns; layout mode interleaves their lines.
const printed = normalize(execFileSync("pdftotext", ["-raw", file, "-"], { encoding: "utf8" }));
const checks = lessons[21].steps.flatMap((step, index) => [
  ...(["grc", "lat", "en", "language"] as const).map((field) => ({
    step: index + 1,
    field,
    present: printed.includes(normalize(step[field])),
  })),
  {
    step: index + 1,
    field: "reason",
    present: printed.includes(normalize(reasons[step.reason]?.text ?? "MISSING REASON")),
  },
]);
assert.ok(
  checks.every((c) => c.present),
  JSON.stringify(checks.filter((c) => !c.present)),
);
console.log(
  JSON.stringify(
    {
      method:
        "Poppler content-stream text extraction (-raw), NFC and whitespace normalization, complete paragraph inclusion",
      pdfSha256: createHash("sha256").update(readFileSync(file)).digest("hex"),
      checks,
    },
    null,
    2,
  ),
);
