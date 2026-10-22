import assert from "node:assert/strict";
import test from "node:test";
import { lessons } from "../src/content/lessons";
import { dropPerpendicular } from "../src/core/right-angles";
import { makeScene } from "../src/core/scene";
import { decodeState, defaults, encodeState } from "../src/core/state";
import { drawScene, studySheet } from "../src/render";

test("I.12 does not bisect a missed, tangent, or zero-radius circle", () => {
  const a = { x: -180, y: 0 },
    b = { x: 180, y: 0 },
    c = { x: 0, y: 117 };
  for (const [y, kind] of [
    [216, "miss"],
    [234, "tangent"],
    [117, "degenerate"],
    [324, "crossings"],
    [-216, "crossings"],
  ] as const) {
    const result = dropPerpendicular(a, b, c, { x: 0, y });
    assert.equal(result.intersection.kind, kind);
    assert.equal(Boolean(result.foot), kind === "crossings");
    const scene = makeScene({
      ...defaults,
      proposition: 12,
      step: 8,
      variant: y < 0 ? 0 : 1,
      third: Math.abs(y) / 180,
    });
    assert.equal(
      scene.vertices.some((p) => p.id === "Θ"),
      kind === "crossings",
    );
    assert.equal(
      scene.equalities.some((s) => s.includes("perpendicular")),
      kind === "crossings",
    );
    if (kind !== "crossings")
      assert.match(
        studySheet(lessons[12], scene, 8),
        /no chord|no.*endpoints|zero-length|no midpoint|no circle/i,
      );
  }
});

test("I.13's equal-angle branch cannot invent a third angle between coincident rays", () => {
  const state = { ...defaults, proposition: 13 as const, angle: 90, step: 4 };
  assert.equal(decodeState(encodeState(state)).angle, 90);
  const scene = makeScene(state);
  assert.match(scene.warning, /first branch/);
  assert.equal(
    scene.angles?.some((a) => a.id === "ABE"),
    false,
  );
  assert.equal(
    scene.equalities.some((s) => s.includes("three parts")),
    false,
  );
  assert.match(studySheet(lessons[13], scene, 4), /unequal-angle branch/);
});

test("I.14 exports the conditional status and the actual unequal remainders", () => {
  const scene = makeScene({ ...defaults, proposition: 14, step: 5 });
  const smaller = scene.measurements.find((m) => m.label === "Drawn ∠ΑΒΕ (°)")?.value;
  const larger = scene.measurements.find((m) => m.label === "Drawn ∠ΑΒΔ (°)")?.value;
  assert.ok(smaller !== undefined && larger !== undefined && smaller < larger);
  assert.match(drawScene(scene, "I.14", true), /not all premises can hold/);
  assert.match(studySheet(lessons[14], scene, 5), /Under that supposition/);
});

test("The Greek-only corollary remains an edition note and I.16 names its modern additions", () => {
  assert.ok(lessons[15].editionNote?.grc.startsWith("[Πόρισμα."));
  assert.match(
    studySheet(lessons[15], makeScene({ ...defaults, proposition: 15, step: 6 }), 6),
    /no corresponding translation/,
  );
  const first = makeScene({ ...defaults, proposition: 16, step: 7 });
  const second = makeScene({ ...defaults, proposition: 16, step: 8 });
  assert.ok(first.vertices.some((p) => p.id === "Ζ"));
  assert.ok(!first.vertices.some((p) => p.id === "Κ"));
  assert.ok(second.vertices.some((p) => p.id === "Κ"));
  assert.match(second.notice?.text ?? "", /modern labels/);
  assert.equal(decodeState("#p=16&s=999").step, 9);
  const share = decodeState("#p=12&s=8&v=1&r=.65&t=1.3&x=-1.25");
  assert.deepEqual(decodeState(encodeState(share)), share);
});
