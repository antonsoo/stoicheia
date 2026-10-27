import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeRatios,
  encodeRatios,
  initialRatios,
  ratiosJson,
  ratioTrial,
  readRatiosJson,
  scanRatios,
  validateRatios,
} from "../src/core/ratios";

test("finite agreement, a failure of equality, and the stricter V.7 witness stay distinct", () => {
  assert.equal(scanRatios(initialRatios).disagreements, 0);
  const scan = scanRatios({ ...initialRatios, bound: 100 });
  assert.deepEqual(scan.first, { m: 70, n: 99 });
  assert.equal(scan.firstExcess, null);
  assert.equal(ratioTrial({ ...initialRatios, m: 70, n: 99 }).greater, null);
  assert.deepEqual(scanRatios({ ...initialRatios, bound: 600 }).firstExcess, { m: 239, n: 338 });
  assert.equal(ratioTrial({ ...initialRatios, m: 239, n: 338 }).greater, "second");
  assert.equal(ratioTrial({ ...initialRatios, p: 140, q: 99, m: 99, n: 140 }).greater, "first");
});

test("scaling preserves comparisons without asserting a common length measure", () => {
  const scaled = { ...initialRatios, kind: "scaled" as const, bound: 1000 };
  assert.equal(scanRatios(scaled).disagreements, 0);
  for (const [m, n] of [
    [1, 1000],
    [1000, 1],
    [408, 577],
  ]) {
    assert.equal(ratioTrial({ ...scaled, m: m ?? 1, n: n ?? 1 }).agrees, true);
  }
});

test("records round-trip and malformed links or files cannot silently change the experiment", () => {
  assert.deepEqual(decodeRatios(encodeRatios(initialRatios)), initialRatios);
  assert.deepEqual(readRatiosJson(ratiosJson(initialRatios)), initialRatios);
  for (const query of [
    "?m=1&m=2",
    "?m=NaN",
    "?m=1e2",
    "?bound=0",
    "?p=9999&q=1",
    "?constructor=1",
    "?__proto__=1",
    "?page=6",
    "?reading=7",
  ])
    assert.throws(() => decodeRatios(query));
  for (const state of [
    { ...initialRatios, m: "7" },
    { ...initialRatios, m: true },
    { ...initialRatios, q: 0 },
    { ...initialRatios, bound: 1001 },
    { ...initialRatios, p: 2.5 },
    { ...initialRatios, unknown: 1 },
  ])
    assert.throws(() => validateRatios(state));
  assert.throws(() =>
    readRatiosJson(
      JSON.stringify({ format: "stoicheia-ratios", version: 2, state: initialRatios }),
    ),
  );
});
