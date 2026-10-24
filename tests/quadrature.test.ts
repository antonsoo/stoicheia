import assert from "node:assert/strict";
import test from "node:test";
import {
  changedLength,
  decodeQuadrature,
  encodeQuadrature,
  quadratureDefault,
  quadratureModel,
} from "../src/core/quadrature";

test("same perimeter does not establish equal area", () => {
  const rectangle = quadratureModel({ a: 90, b: 40 });
  assert.equal(rectangle.height, 6);
  assert.equal(rectangle.radius, 6.5);
  assert.equal(rectangle.area, 36);
  assert.equal(rectangle.radiusArea, 42.25);
  assert.equal(rectangle.offsetArea, 6.25);
  const thin = quadratureModel({ a: 110, b: 20 });
  assert.equal(thin.perimeter, rectangle.perimeter);
  assert.equal(thin.area, 22);
  assert.equal(quadratureModel({ a: 65, b: 65 }).equal, true);
});
test("locked perimeter rejects changes that would invalidate the other side", () => {
  const locked = { ...quadratureDefault, lock: true };
  assert.equal(changedLength(locked, "a", 125), null);
  assert.equal(changedLength(locked, "a", NaN), null);
  assert.equal(changedLength(locked, "a", 91.2), null);
  assert.deepEqual(changedLength(locked, "a", 100), { ...locked, a: 100, b: 30 });
});
test("sharing preserves the experiment and rejects ambiguous or nonfinite lengths", () => {
  const state = {
    ...quadratureDefault,
    a: 160,
    b: 10,
    stage: 5,
    passage: 8,
    move: 100,
    lock: true,
    cancel: true,
  };
  assert.deepEqual(decodeQuadrature(encodeQuadrature(state)), { ...state, adjusted: false });
  for (const bad of [
    "#a=90&a=40",
    "#a=Infinity",
    "#a=9e1",
    "#a=90.5",
    "#a=0",
    "#a=9007199254740992",
  ]) {
    assert.equal(decodeQuadrature(bad).adjusted, true);
    assert.equal(decodeQuadrature(bad).a, 90);
  }
});
