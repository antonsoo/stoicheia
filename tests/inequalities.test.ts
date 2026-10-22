import assert from "node:assert/strict";
import test from "node:test";
import { lessons } from "../src/content/lessons";
import { makeScene } from "../src/core/scene";
import { decodeState, encodeState } from "../src/core/state";
import { comparisonTable, studySheet } from "../src/render";

test("I.18 loses the construction at equality and at a shorter given side", () => {
  for (const ratio of [0.2, 1]) {
    const scene = makeScene(decodeState(`#p=18&s=6&r=${ratio}`));
    assert.ok(scene.warning);
    assert.equal(
      scene.vertices.some((v) => v.id === "Δ"),
      false,
    );
    assert.deepEqual(scene.equalities, []);
    assert.match(studySheet(lessons[18], scene, 6), /required conditions are not satisfied/);
  }
});

test("I.19 exports the lost premise under the correctly named columns", () => {
  for (const step of [2, 3]) {
    const scene = makeScene(decodeState(`#p=19&s=${step}`));
    assert.deepEqual(scene.comparison?.headers, [
      "Quantity / premise",
      "Original given",
      "Temporary case",
    ]);
    assert.match(comparisonTable(scene), /Not satisfied/);
    assert.match(studySheet(lessons[19], scene, step), /given angle inequality no longer holds/);
    assert.ok(scene.equalities.every((line) => !line.startsWith("Given:")));
  }
  assert.match(makeScene(decodeState("#p=19&s=4")).notice?.title ?? "", /original given/);
});

test("The saved pair is bounded and applies only from the source's similarly step", () => {
  for (const p of [17, 20])
    for (const pair of [0, 1, 2]) {
      const state = decodeState(`#p=${p}&s=99&pair=${pair}`);
      assert.equal(decodeState(encodeState(state)).pair, pair);
      assert.match(makeScene(state).notice?.title ?? "", pair ? /modern expansion/ : /source/);
      assert.deepEqual(makeScene({ ...state, step: 0 }), makeScene({ ...state, step: 0, pair: 0 }));
    }
  assert.equal(decodeState("#p=20&pair=999").pair, 2);
  assert.equal(decodeState("#p=20&pair=NaN").pair, 0);
});
