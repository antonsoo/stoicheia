import assert from "node:assert/strict";
import test from "node:test";
import { closureDrawing } from "../src/closure-drawing";
import { closurePassages } from "../src/content/closure";
import {
  closureDefaults,
  closureModel,
  decodeClosure,
  encodeClosure,
  trialPoint,
} from "../src/core/triangle-closure";

test("the five circle outcomes distinguish tangencies from triangles", () => {
  for (const [a, b, c, kind] of [
    [50, 60, 40, "crossing"],
    [20, 60, 40, "external-tangent"],
    [19, 60, 40, "separate"],
    [100, 60, 40, "internal-tangent"],
    [101, 60, 40, "contained"],
    [40, 60, 100, "internal-tangent"],
    [40, 60, 101, "contained"],
  ] as const) {
    const m = closureModel({ a, b, c });
    assert.equal(m.kind, kind);
    assert.equal(
      m.margins.every((v) => v > 0),
      kind === "crossing",
    );
    if (m.intersection) {
      assert.ok(Math.abs(Math.hypot(m.intersection.x, m.intersection.y) - a / 10) < 1e-12);
      assert.ok(Math.abs(Math.hypot(m.intersection.x - b / 10, m.intersection.y) - c / 10) < 1e-12);
    }
    const drawing = closureDrawing({ ...closureDefaults, a, b, c });
    assert.equal(drawing.includes('data-triangle="true"'), kind === "crossing");
    assert.doesNotMatch(drawing, /NaN|Infinity/);
  }
});

test("every allowed length triple agrees with the sorted longest-side criterion", () => {
  for (let a = 10; a <= 120; a++)
    for (let b = 10; b <= 120; b++)
      for (let c = 10; c <= 120; c++) {
        const sides = [a, b, c].sort((x, y) => x - y);
        const [small, middle, large] = sides as [number, number, number];
        const expected = small + middle > large;
        const actual = closureModel({ a, b, c });
        assert.equal(actual.kind === "crossing", expected, `${a},${b},${c}`);
        assert.equal(actual.height > 0, expected);
        assert.equal(actual.area > 0, expected);
      }
});

test("a trial tip at the second hinge does not create NaN or a false triangle", () => {
  const state = { ...closureDefaults, a: 60, b: 60, c: 40, trial: true, turn: 0 };
  const trial = trialPoint(state);
  assert.equal(trial.needed, 0);
  assert.equal(trial.residual, -4);
  for (const narrow of [false, true])
    assert.doesNotMatch(closureDrawing(state, narrow), /NaN|Infinity/);
});

test("share state keeps impossible givens; invalid URL values fall back without entering markup", () => {
  const state = {
    ...closureDefaults,
    a: 101,
    b: 60,
    c: 40,
    turn: 180,
    side: -1 as const,
    trial: true,
    step: 3,
    passage: 8,
  };
  assert.deepEqual(decodeClosure(encodeClosure(state)), state);
  assert.deepEqual(decodeClosure("#a=Infinity&b=0&c=121&turn=<script>&read=9"), closureDefaults);
  for (const a of [NaN, Infinity, 9, 121, 10.5])
    assert.throws(() => closureModel({ a, b: 60, c: 40 }), RangeError);
});

test("the source preserves editorial brackets, three pairings, and both circle-name orders", () => {
  assert.match(closurePassages[0]?.grc ?? "", /\[διὰ τὸ/);
  assert.doesNotMatch(closurePassages[0]?.lat ?? "", /because|διὰ/);
  assert.match(closurePassages[1]?.lat ?? "", /Α \+ Β > Γ, Α \+ Γ > Β, Β \+ Γ > Α/);
  assert.match(closurePassages[4]?.grc ?? "", /ΚΛΘ/);
  assert.match(closurePassages[6]?.grc ?? "", /ΛΚΘ/);
});
