import assert from "node:assert/strict";
import test from "node:test";
import {
  CLOCK,
  decodeQuadratrix,
  encodeQuadratrix,
  idealPoint,
  interceptDeficit,
  parseQuadratrixJson,
  quadratrixJson,
  quadratrixMotion,
  initialQuadratrix as start,
  validateQuadratrix,
} from "../src/core/quadratrix";

test("the final coincident lines never acquire a fabricated intersection", () => {
  const near = quadratrixMotion({ ...start, tick: CLOCK - 1 });
  const end = quadratrixMotion({ ...start, tick: CLOCK });
  assert.equal(near.kind, "point");
  assert.equal(near.point?.y, 1e-6);
  assert.equal(end.kind, "coincident");
  assert.equal(end.point, null);
  assert.equal(end.inSquare, false);
  assert.deepEqual(quadratrixMotion({ ...start, tick: CLOCK, limit: true }), end);
  assert.throws(() => idealPoint(0), /positive/);
});
test("an early rotation leaves the square, then becomes parallel, then coincident", () => {
  const s = { ...start, timing: "rotation-first" as const };
  assert.equal(quadratrixMotion({ ...s, tick: 899999 }).kind, "point");
  assert.equal(quadratrixMotion({ ...s, tick: 899999 }).inSquare, false);
  for (const tick of [900000, 900001, 999999]) {
    assert.equal(quadratrixMotion({ ...s, tick }).kind, "parallel");
    assert.equal(quadratrixMotion({ ...s, tick }).point, null);
  }
  assert.equal(quadratrixMotion({ ...s, tick: CLOCK }).kind, "coincident");
});
test("a late rotation meets the completed slider at A", () => {
  const m = quadratrixMotion({ ...start, tick: CLOCK, timing: "slider-first" });
  assert.equal(m.kind, "point");
  assert.deepEqual(m.point, { x: 0, y: 0 });
  assert.equal(m.inSquare, true);
  assert(m.angle > 0);
});
test("the synchronized midpoint is (1/2,1/2) and its deficit stays positive near the end", () => {
  assert(Math.abs(idealPoint(0.5).x - 0.5) < 1e-15);
  for (const u of [0.5, 0.1, 0.01, 0.001, 0.000001]) {
    assert(interceptDeficit(u) > 0);
    assert(Math.abs(interceptDeficit(u) / ((Math.PI * u * u) / 6) - 1) < u * u);
  }
});
test("addresses and editable records preserve timing, added limit, reading and source", () => {
  const state = {
    ...start,
    tick: CLOCK,
    timing: "rotation-first" as const,
    limit: true,
    passage: 7,
    page: 259,
  };
  assert.deepEqual(decodeQuadratrix(encodeQuadratrix(state)), state);
  assert.deepEqual(parseQuadratrixJson(quadratrixJson(state)), state);
  for (const query of [
    "?tick=1&tick=2",
    "?tick=1e6",
    "?limit=true",
    "?timing=slow",
    "?reading=8",
    "?page=260",
    "?tick=NaN",
    "?tick=1000001",
    "?mystery=1",
  ])
    assert.throws(() => decodeQuadratrix(query));
  for (const v of [
    { ...start, tick: NaN },
    { ...start, tick: 1.1 },
    { ...start, page: "252" },
    { ...start, extra: true },
  ])
    assert.throws(() => validateQuadratrix(v));
  assert.throws(() =>
    parseQuadratrixJson(quadratrixJson(start).replace('"version": 1', '"version": 2')),
  );
});
