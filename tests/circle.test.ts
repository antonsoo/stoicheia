import assert from "node:assert/strict";
import test from "node:test";
import {
  audit,
  circleJson,
  compare,
  decodeCircle,
  encodeCircle,
  exact,
  initialCircle,
  parseFraction,
  rational,
  readCircleJson,
  validateCircle,
} from "../src/core/circle";

test("the printed numbers give strict bounds narrower than the stated endpoints", () => {
  const outer = audit("outer"),
    inner = audit("inner");
  assert(outer.every((r) => r.localSafe && r.boundSafe));
  assert(inner.every((r) => r.localSafe && r.boundSafe));
  assert.equal(exact(outer[4]?.bound ?? rational(0)), "29376/9347");
  assert.equal(exact(inner[4]?.bound ?? rational(0)), "25344/8069");
  assert.equal(compare(inner[4]?.bound ?? rational(0), rational(223, 71)), 1);
  assert.equal(compare(outer[4]?.bound ?? rational(0), rational(22, 7)), -1);
});
test("the seed square differences retain the two missing units and one excess unit", () => {
  assert.equal(exact(audit("outer")[0]?.squareGap ?? rational(0)), "2");
  assert.equal(exact(audit("inner")[0]?.squareGap ?? rational(0)), "-1");
});
test("a wrong outer H affects the next bisection, not the endpoint already obtained from A", () => {
  const rows = audit("outer", { branch: "outer", row: 1, value: "591.15" });
  assert.equal(rows[1]?.localSafe, false);
  assert.equal(rows[1]?.chainSafe, false);
  assert.equal(rows[1]?.boundSafe, true);
  assert(rows.slice(2).every((r) => !r.boundSafe));
  assert(rows.slice(2).every((r) => r.localSafe));
});
test("the exact inscribed hexagon bound survives an unsafe cotangent seed", () => {
  const rows = audit("inner", { branch: "inner", row: 0, value: "1350" });
  assert.equal(rows[0]?.chainSafe, false);
  assert.equal(rows[0]?.boundSafe, true);
  assert.equal(exact(rows[0]?.bound ?? rational(0)), "3");
  assert(rows.slice(1).every((r) => !r.boundSafe));
});
test("the low final inner hypotenuse immediately loses its lower-bound justification", () => {
  const rows = audit("inner", { branch: "inner", row: 4, value: "2017.24" });
  assert(rows.slice(0, 4).every((r) => r.boundSafe));
  assert.equal(rows[4]?.localSafe, false);
  assert.equal(rows[4]?.boundSafe, false);
});
test("safe roundings weaken bounds without turning approximation into equality", () => {
  const original = audit("outer")[4],
    weakened = audit("outer", { branch: "outer", row: 1, value: "591.124" })[4];
  assert(original && weakened);
  assert.equal(weakened.boundSafe, true);
  assert.equal(compare(weakened.bound, original.bound), 1);
});
test("a locally safe change can make a later unchanged printed value unsafe", () => {
  const rows = audit("outer", { branch: "outer", row: 1, value: "591" });
  assert.equal(rows[1]?.localSafe, true);
  assert.equal(rows[2]?.localSafe, false);
  assert.equal(rows[2]?.boundSafe, true);
  assert.equal(rows[3]?.boundSafe, false);
});
test("exact input normalization, link roundtrip and file roundtrip retain an alteration", () => {
  assert.equal(exact(parseFraction("591.125")), "4729/8");
  const state = validateCircle({
    ...initialCircle,
    stage: 4,
    branch: "inner",
    passage: 6,
    page: 271,
    alteration: { branch: "outer", row: 1, value: "591.15" },
  });
  assert.deepEqual(decodeCircle(encodeCircle(state)), state);
  assert.deepEqual(readCircleJson(circleJson(state)), state);
});
test("malformed, ambiguous or excessive settings are rejected before replacing a record", () => {
  for (const value of [
    "0",
    "-1",
    "1/0",
    "NaN",
    "1e5",
    "1.0000001",
    "1000001",
    "1/1000001",
    "5 + 1/8",
  ])
    assert.throws(() => parseFraction(value));
  for (const search of [
    "?stage=1&stage=2",
    "?value=591",
    "?stage=1.5",
    "?row=2&change=outer",
    "?page=272",
    "?stage=5",
    "?branch=none",
  ])
    assert.throws(() => decodeCircle(search));
  assert.throws(() =>
    readCircleJson(
      JSON.stringify({ format: "stoicheia-circle", version: 2, state: initialCircle }),
    ),
  );
  assert.throws(() => validateCircle({ ...initialCircle, extra: true }));
  assert.throws(() => readCircleJson(" ".repeat(8193)));
});
