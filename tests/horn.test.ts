import assert from "node:assert/strict";
import { test } from "node:test";
import { add, compare, exact, multiply, rational, square, subtract } from "../src/core/circle";
import {
  decodeHorn,
  encodeHorn,
  hornJson,
  hornWitness,
  initialHorn,
  parseHornJson,
  validateHorn,
} from "../src/core/horn";

test("the foot is on the line, perpendicular to the radius and inside the circle", () => {
  const w = hornWitness(initialHorn);
  assert.equal(exact(w.foot.x), "4/17");
  assert.equal(exact(w.foot.y), "1/17");
  assert.equal(exact(w.centreDistanceSquared), "16/17");
  const dot = add(multiply(w.foot.x, rational(4)), subtract(w.foot.y, rational(1)));
  assert.equal(exact(dot), "0");
  const distance = add(square(w.foot.x), square(subtract(w.foot.y, rational(1))));
  assert.equal(compare(distance, rational(1)), -1);
  assert.equal(compare(distance, w.centreDistanceSquared), 0);
});
test("the added second crossing is on the circle and twice as far along the ray", () => {
  const w = hornWitness({ rise: 7, run: 13 });
  assert.equal(exact(w.second.x), exact(multiply(w.foot.x, rational(2))));
  assert.equal(exact(add(square(w.second.x), square(subtract(w.second.y, rational(1))))), "1");
  assert.equal(exact(w.secondParameter), "7/109");
});
test("the smallest supported positive slope retains a strictly positive exact deficit", () => {
  const w = hornWitness({ rise: 1, run: 1000000 });
  assert.equal(exact(w.radiusSquaredMinusDistanceSquared), "1/1000000000001");
  assert.equal(w.relation, "cuts");
  assert.equal(compare(w.centreDistanceSquared, rational(1)), -1);
});
test("turning away moves the circle crossings onto the backward extension", () => {
  const w = hornWitness({ rise: -1, run: 4 });
  assert.equal(w.relation, "away");
  assert.equal(compare(w.footParameter, rational(0)), -1);
  assert.equal(compare(w.secondParameter, rational(0)), -1);
});
test("the tangent has a double root at A, not another positive crossing", () => {
  const w = hornWitness({ rise: 0, run: 999999 });
  assert.equal(w.relation, "tangent");
  assert.equal(exact(w.centreDistanceSquared), "1");
  assert.equal(exact(w.secondParameter), "0");
});
test("saved and shared states preserve the learner's entire chosen reading", () => {
  const s = {
    ...initialHorn,
    rise: 9,
    run: 999991,
    focus: "crossing" as const,
    passage: 7,
    page: 213,
  };
  assert.deepEqual(parseHornJson(hornJson(s)), s);
  assert.deepEqual(decodeHorn(encodeHorn(s)), s);
  for (const bad of ["?rise=1&rise=2", "?run=0", "?page=214", "?read=8", "?rise=2.5", "?extra=1"])
    assert.throws(() => decodeHorn(bad));
  assert.throws(() => parseHornJson(hornJson(s).replace('"version": 1', '"version": 2')));
  assert.throws(() => validateHorn({ ...s, surprise: true }));
  assert.throws(() => validateHorn({ ...s, rise: 1000000, run: 999999 }));
});
