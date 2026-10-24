import assert from "node:assert/strict";
import test from "node:test";
import {
  complementModel,
  encodeGnomon,
  gnomonModel,
  initialGnomon,
  parseGnomon,
} from "../src/core/gnomon";

test("freeing the point preserves small pairs but breaks the large-half subtraction", () => {
  const m = complementModel({ ...initialGnomon, diagonal: false, v: 65 });
  assert.equal(m.onDiagonal, false);
  assert.ok(Math.abs(m.leftArea - 7.35) < 1e-12);
  assert.ok(Math.abs(m.rightArea - 25.35) < 1e-12);
  assert.ok(Math.abs(m.difference + 18) < 1e-12);
  assert.ok(Math.abs((m.triangleAreas[0] ?? 0) - (m.triangleAreas[1] ?? 0)) < 1e-12);
  assert.ok(Math.abs((m.triangleAreas[2] ?? 0) - (m.triangleAreas[3] ?? 0)) < 1e-12);
  assert.notEqual(30 - (m.triangleAreas[0] ?? 0) - (m.triangleAreas[3] ?? 0), m.leftArea);
});
test("a free point can still satisfy the diagonal condition; a lock restores it", () => {
  assert.equal(complementModel({ ...initialGnomon, diagonal: false }).onDiagonal, true);
  assert.equal(complementModel({ ...initialGnomon, diagonal: true, v: 65 }).onDiagonal, true);
});
test("shared state retains the counterexample and rejects ambiguous controls", () => {
  const original = {
    ...initialGnomon,
    v: 65,
    diagonal: false,
    shear: -40,
    book: "II5" as const,
    passage: 10,
    gstep: 5,
  };
  assert.deepEqual(parseGnomon(encodeGnomon(original)), { state: original, notice: "" });
  assert.deepEqual(parseGnomon("#u=35&u=65").state, initialGnomon);
  assert.match(parseGnomon("#r=10&book=I43").notice, /invalid/);
  assert.equal(parseGnomon("#d=1&u=63&v=22").state.v, 63);
});
test("equal cuts are labelled as a limit and tiny unequal cuts stay unequal", () => {
  assert.equal(gnomonModel({ a: 65, b: 65 }).equal, true);
  const m = gnomonModel({ a: 160, b: 159 });
  assert.equal(m.equal, false);
  assert.ok(Math.abs(m.missing - 0.0025) < 1e-14);
  assert.equal(m.area, 254.4);
});
