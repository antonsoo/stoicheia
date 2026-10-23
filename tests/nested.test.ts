import assert from "node:assert/strict";
import test from "node:test";
import { distance } from "../src/core/geometry";
import { nestedTriangle } from "../src/core/nested";
import { decodeState, encodeState } from "../src/core/state";

test("I.21 compares sums, not both individual corresponding sides", () => {
  const a = { x: 0, y: 0 },
    b = { x: 180, y: 0 },
    c = { x: 75, y: 90 };
  const m = nestedTriangle(a, b, c, 0.55, 0.1);
  assert.ok(distance(m.d, c) > distance(a, c));
  assert.ok(m.outer > m.middle && m.middle > m.inner);
  assert.ok(m.innerAngle > m.middleAngle && m.middleAngle > m.outerAngle);
  assert.ok(Math.abs(m.outer - m.inner - m.firstExcess - m.secondExcess) < 1e-10);
});

test("I.21's strict interior hypothesis excludes boundary and degenerate inputs", () => {
  const a = { x: 0, y: 0 },
    b = { x: 10, y: 0 },
    c = { x: 0, y: 10 };
  for (const [e, d] of [
    [0, 0.5],
    [1, 0.5],
    [0.5, 0],
    [0.5, 1],
    [NaN, 0.5],
  ] as const)
    assert.throws(() => nestedTriangle(a, b, c, e, d), RangeError);
  assert.throws(() => nestedTriangle(a, b, { x: 20, y: 0 }, 0.5, 0.5), RangeError);
  const state = decodeState("#p=21&s=100&m=0&k=1");
  assert.equal(state.step, 9);
  assert.equal(state.motion, 10);
  assert.equal(state.take, 0.9);
  assert.deepEqual(decodeState(encodeState(state)), state);
});
