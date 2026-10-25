import assert from "node:assert/strict";
import test from "node:test";
import {
  activeDivision,
  approximate,
  changeLength,
  commonMeasure,
  compare,
  decodeMeasure,
  diagonal,
  divide,
  divisions,
  encodeMeasure,
  equal,
  exact,
  initialMeasure,
  length,
  measureLimit,
  multiply,
  quotient,
  scaleFactor,
  sign,
  subtract,
  times,
  unit,
} from "../src/core/measure";

test("rational lengths terminate with a unit that exactly tiles both original lengths", () => {
  for (const [n, d, counts] of [
    [3, 2, [3n, 2n]],
    [14, 10, [7n, 5n]],
    [577, 408, [577n, 408n]],
    [2, 2, [1n, 1n]],
  ] as const) {
    const state = { ...initialMeasure, kind: "fraction" as const, n, d };
    const rows = divisions(state),
      last = rows.at(-1);
    assert(last);
    assert.equal(sign(last.r), 0);
    assert.equal(commonMeasure({ ...state, row: last.index, copies: last.q - 1 }), null);
    const measure = commonMeasure({ ...state, row: last.index, copies: last.q });
    assert(measure);
    assert.deepEqual([measure.longCount, measure.shortCount], counts);
    assert(equal(times(measure.unit, measure.longCount), length(BigInt(n), 0n, BigInt(d))));
    assert(equal(times(measure.unit, measure.shortCount), unit));
  }
});
test("a close fraction shares eight quotients yet terminates where the diagonal does not", () => {
  const root = divisions(initialMeasure),
    rational = divisions({ ...initialMeasure, kind: "fraction" });
  assert.deepEqual(
    rational.map((r) => r.q),
    [1, 2, 2, 2, 2, 2, 2, 2],
  );
  assert.deepEqual(
    root.slice(0, 8).map((r) => r.q),
    rational.map((r) => r.q),
  );
  assert.equal(sign(rational[7]?.r ?? unit), 0);
  assert.equal(sign(root[7]?.r ?? length(0n)), 1);
  assert.equal(approximate(diagonal).toFixed(4), approximate(length(577n, 0n, 408n)).toFixed(4));
});
test("every diagonal turn has an exact positive remainder and the recurring pair scales by sqrt2-1", () => {
  const rows = divisions(initialMeasure);
  assert.equal(rows.length, measureLimit);
  for (const r of rows) {
    assert.equal(sign(r.r), 1);
    assert.equal(compare(r.r, r.b), -1);
    assert.equal(compare(times(r.r, 2n), r.a), -1);
    assert(equal(subtract(r.a, times(r.b, BigInt(r.q))), r.r));
    if (r.index > 0) {
      assert.equal(r.q, 2);
      assert(equal(divide(r.a, r.b), length(1n, 1n)));
      assert(equal(multiply(r.a, scaleFactor), r.b));
      assert(equal(multiply(r.b, scaleFactor), r.r));
    }
    assert(approximate(r.r) > 0);
  }
  assert.equal(exact(scaleFactor), "√2 − 1");
});
test("surd sign and division stay exact under cancellation", () => {
  const tiny = length(131836323n, -93222358n);
  assert.equal(sign(tiny), 1);
  assert(approximate(tiny) > 0);
  assert(equal(divide(scaleFactor, scaleFactor), unit));
  assert(equal(multiply(diagonal, diagonal), length(2n)));
  assert.equal(quotient(length(9999n), unit), 9999);
  assert.throws(() => divide(unit, length(0n)));
});
test("links retain exact stages and reject malformed or inconsistent states", () => {
  const state = { ...initialMeasure, row: 23, copies: 2, passage: 7, page: 9 };
  assert.deepEqual(decodeMeasure(encodeMeasure(state)), state);
  for (const hash of [
    "#n=0",
    "#n=1&d=2",
    "#row=24",
    "#row=1&row=2",
    "#copies=3",
    "#kind=other",
    "#n=2.5",
    "#page=15",
    "#passage=10",
    "#x=2",
    "#kind=fraction&n=3&d=2&row=2",
  ])
    assert.throws(() => decodeMeasure(hash), hash);
  const changed = changeLength(state, "fraction", 3, 2);
  assert.equal(changed.row, 1);
  assert.equal(changed.copies, activeDivision(changed).q);
});
