import assert from "node:assert/strict";
import test from "node:test";
import {
  bisectAngle,
  bisectSegment,
  radialCandidate,
  sideOfLine,
  triangleFromSides,
} from "../src/core/bisection";
import { distance } from "../src/core/geometry";
import { angleAt, radians, rigidMotion } from "../src/core/triangles";

const near = (a: number, b: number) =>
  assert.ok(Math.abs(a - b) <= 1e-10 * Math.max(1, Math.abs(a), Math.abs(b)), `${a} != ${b}`);

test("I.7's reflected point meets both length equalities but fails the same-side condition", () => {
  for (const rotation of [-120, 0, 63]) {
    const transform = (p: { x: number; y: number }) => rigidMotion(p, rotation, { x: 37, y: -81 });
    const [a, b, c] = [
      { x: 0, y: 0 },
      { x: 180, y: 0 },
      { x: 75, y: 145 },
    ].map(transform);
    assert.ok(a && b && c);
    const reflected = radialCandidate(a, b, c, 0, true);
    assert.equal(reflected.sameSide, false);
    assert.equal(reflected.distinct, true);
    near(reflected.firstDifference, 0);
    near(reflected.secondDifference, 0);
    const coincident = radialCandidate(a, b, c, 0);
    assert.equal(coincident.distinct, false);
    assert.equal(coincident.sameSide, true);
    const displaced = radialCandidate(a, b, c, 12);
    assert.equal(displaced.sameSide, true);
    near(displaced.firstDifference, 0);
    assert.ok(Math.abs(displaced.secondDifference) > 1);
  }
});

test("I.8 reconstructs acute and obtuse triangles and refuses impossible triples", () => {
  for (const [ab, ac, bc] of [
    [3, 4, 5],
    [2, 2, 3.8],
    [7, 3, 5],
    [8, 7, 2],
  ]) {
    assert.ok(ab && ac && bc);
    for (const side of [1, -1] as const) {
      const { a, b, c } = triangleFromSides(ab, ac, bc, side);
      near(distance(a, b), ab);
      near(distance(a, c), ac);
      near(distance(b, c), bc);
      assert.equal(Math.sign(sideOfLine(b, c, a)), side);
    }
  }
  for (const [a, b, c] of [
    [1, 1, 2],
    [1, 2, 4],
    [0, 2, 2],
    [-1, 2, 2],
    [1, NaN, 1],
  ]) {
    assert.throws(() => triangleFromSides(a ?? 0, b ?? 0, c ?? 0), RangeError);
  }
});

test("I.9's safe circle intersection bisects the angle; the other has three distinct behaviours", () => {
  for (const angle of [20, 40, 60, 90, 140]) {
    const a = { x: 17, y: 31 },
      b = { x: 217, y: 31 };
    const c = { x: 17 + 240 * Math.cos(radians(angle)), y: 31 + 240 * Math.sin(radians(angle)) };
    const proof = bisectAngle(a, b, c, 80);
    near(distance(a, proof.d), distance(a, proof.e));
    near(distance(proof.d, proof.z), distance(proof.e, proof.z));
    near(angleAt(b, a, proof.z), angle / 2);
    near(angleAt(proof.z, a, c), angle / 2);
    assert.equal(
      proof.otherKind,
      angle < 60 ? "internal" : angle === 60 ? "collapsed" : "opposite",
    );
    near(distance(a, proof.cut.copy.l), 80);
  }
});

test("I.10 earns the midpoint by intersecting the constructed bisector, on rotated bases too", () => {
  for (const rotation of [-150, -35, 0, 83, 175])
    for (const side of [1, -1] as const) {
      const a = rigidMotion({ x: 0, y: 0 }, rotation, { x: 40, y: 93 });
      const b = rigidMotion({ x: 217, y: 0 }, rotation, { x: 40, y: 93 });
      const result = bisectSegment(a, b, side);
      near(distance(a, result.d), 108.5);
      near(distance(b, result.d), 108.5);
      near(sideOfLine(a, b, result.d), 0);
      near(angleAt(a, result.c, result.d), 30);
      near(angleAt(result.d, result.c, b), 30);
      assert.ok(sideOfLine(a, b, result.c) * sideOfLine(a, b, result.auxiliary) < 0);
    }
});
