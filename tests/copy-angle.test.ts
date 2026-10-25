import assert from "node:assert/strict";
import test from "node:test";
import { copiedAngle, courseTriangle } from "../src/core/copy-angle";
import { distance } from "../src/core/geometry";
import { decodeState, defaults, encodeState } from "../src/core/state";

test("I.22 excludes both tangencies and both ways circles can miss", () => {
  for (const [a, c, expected] of [
    [65, 120, "crossing"],
    [40, 60, "external-tangent"],
    [140, 40, "internal-tangent"],
    [30, 30, "separate"],
    [140, 30, "contained"],
  ] as const) {
    const m = courseTriangle(180, a, c);
    assert.equal(m.kind, expected);
    assert.equal(m.kind === "crossing", m.area > 0);
    if (expected === "separate" || expected === "contained") assert.equal(m.k, null);
  }
});
test("I.23 constructs its point from all three sides at a rotated baseline, including the reflected branch", () => {
  for (const ratio of [0.2, 0.65, 1, 1.4])
    for (const opening of [20, 64, 90, 150])
      for (const tilt of [-45, 0, 45])
        for (const side of [-1, 1] as const)
          for (const reflected of [false, true]) {
            const m = copiedAngle(137, ratio, opening, tilt, side, reflected);
            assert.ok(Math.abs(distance(m.a, m.z) - m.first) < 1e-9);
            assert.ok(Math.abs(distance(m.a, m.h) - m.second) < 1e-9);
            assert.ok(Math.abs(distance(m.z, m.h) - m.base) < 1e-9);
            assert.ok(Math.abs(m.copied - opening) < 1e-9);
            assert.ok(m.margin > 0);
          }
});
test("new course links preserve their construction and bound the new baseline control", () => {
  const state = {
    ...defaults,
    proposition: 23 as const,
    step: 6,
    ratio: 1.15,
    angle: 32,
    offset: 0.25,
    variant: 1 as const,
  };
  assert.deepEqual(decodeState(encodeState(state)), state);
  assert.equal(decodeState("#p=23&x=2&s=100").offset, 0.45);
  assert.equal(decodeState("#p=23&x=-2").offset, -0.45);
  assert.equal(decodeState("#p=22&s=99").step, 7);
  assert.equal(decodeState("#p=24").proposition, 1);
});
