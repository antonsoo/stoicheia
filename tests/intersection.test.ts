import assert from "node:assert/strict";
import test from "node:test";
import { approximate, exact } from "../src/core/circle";
import {
  candidateInteger,
  decodeIntersection,
  initialIntersection,
  intersectionCsv,
  intersectionModel,
  intersectionTrials,
} from "../src/core/intersection";
import { decodeState, defaults, encodeState } from "../src/core/state";

test("I.1 candidate can pass a rounded reading while failing the second circle exactly", () => {
  const p = intersectionModel({ ...initialIntersection, m: 4, n: 7 });
  assert.equal(exact(p.x), "33/65");
  assert.equal(exact(p.y), "56/65");
  assert.equal(exact(p.firstSquared), "1");
  assert.equal(exact(p.secondSquared), "64/65");
  assert.equal(exact(p.residual), "-1/65");
  assert.equal(p.shownLength, "0.99");
  assert.equal(p.roundedEqual, false);
  const q = intersectionModel({ m: 11, n: 19, places: 2 });
  assert.equal(q.shownLength, "1.00");
  assert.equal(q.roundedEqual, true);
  assert.equal(exact(q.residual), "1/241");
  assert.equal(q.position, "outside");
  assert.equal(intersectionModel({ m: 11, n: 19, places: 4 }).shownLength, "1.0021");
});

test("the approach sequence alternates sides and strictly decreases the exact residual magnitude", () => {
  let last = Infinity,
    sign = -1n;
  for (const [m, n] of intersectionTrials) {
    const p = intersectionModel({ m, n, places: 6 });
    assert.equal(exact(p.firstSquared), "1");
    assert.equal(p.residual.n < 0 ? -1n : 1n, sign);
    sign = -sign;
    const error = Math.abs(approximate(p.residual));
    assert.ok(error < last);
    last = error;
  }
});

test("cardinal and extreme candidates stay exact and never invent a common rational point", () => {
  for (const [m, n, x, y] of [
    [0, 1, "1", "0"],
    [1, 1, "0", "1"],
    [1, 2, "3/5", "4/5"],
  ] as const) {
    const p = intersectionModel({ m, n, places: 2 });
    assert.equal(exact(p.x), x);
    assert.equal(exact(p.y), y);
  }
  for (const m of [0, 1, 97, 564719, 999999, 1000000]) {
    for (const n of [1, 265, 978122, 1000000]) {
      const p = intersectionModel({ m, n, places: 6 });
      assert.equal(exact(p.firstSquared), "1");
      assert.notEqual(p.residual.n, 0n);
      assert.equal(typeof p.witness, "bigint");
    }
  }
  assert.throws(() => intersectionModel({ m: 1, n: 0, places: 2 }));
});

test("malformed candidates are bounded before BigInt arithmetic and share links preserve settings", () => {
  for (const text of ["", "-1", "1.5", "NaN", "Infinity", "1e6", "1000001", "0".repeat(100000)])
    assert.throws(() => candidateInteger(text));
  assert.throws(() => candidateInteger("0", true));
  assert.equal(candidateInteger("1000000"), 1000000);
  const intersection = { open: true, m: 56, n: 97, places: 6, real: true } as const;
  const s = { ...defaults, step: 3, intersection };
  assert.deepEqual(decodeState(encodeState(s)), s);
  const invalid = decodeIntersection(
    new URLSearchParams("intersection=1&im=5&in=0&ip=999&ir=blah"),
  );
  assert.deepEqual(invalid, { ...initialIntersection, open: true });
  assert.equal(decodeState("#p=1&s=3").intersection.open, false);
});

test("exact CSV retains the residual beside the labeled approximate reading", () => {
  const csv = intersectionCsv({ ...initialIntersection, m: 11, n: 19 });
  assert.match(csv, /BP_squared_minus_1,1\/241,signed exact residual/);
  assert.match(csv, /BP_rounded,1.00,approximate length to 2 decimal places/);
  for (const row of csv.trim().split("\n")) assert.equal(row.split(",").length, 3);
});
