import assert from "node:assert/strict";
import test from "node:test";
import { lessons } from "../src/content/lessons";
import { cutOff, distance } from "../src/core/geometry";
import { makeScene } from "../src/core/scene";
import { decodeState, defaults, encodeState } from "../src/core/state";
import {
  angleAt,
  area,
  congruentPair,
  isoscelesBridge,
  unequalSketch,
} from "../src/core/triangles";
import { drawScene, studySheet } from "../src/render";

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test("I.3 handles the shared reference endpoint needed by the actual I.5 construction", () => {
  const a = { x: 21, y: -39 },
    b = { x: 91, y: 11 },
    c = { x: 31, y: -29 };
  for (const [first, last] of [
    [a, c],
    [c, a],
  ] as const) {
    const cut = cutOff(a, b, first, last);
    close(distance(a, cut.e), distance(first, last));
    close(distance(a, cut.e) + distance(cut.e, b), distance(a, b));
  }
});

test("I.4 motion preserves shape between endpoints instead of interpolating vertices", () => {
  const reference = congruentPair(180, 0.65, 50, 1, 0).source;
  for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
    const pair = congruentPair(180, 0.65, 50, 1, progress);
    close(area(...pair.moving), area(...reference));
    close(distance(pair.moving[1], pair.moving[2]), distance(reference[1], reference[2]));
    if (progress === 1) assert.deepEqual(pair.moving, pair.target);
  }
});

test("I.5 obtains two comparisons and equal angle remainders", () => {
  const { a, b, c, z, h } = isoscelesBridge(180, 25, 0.65, 1);
  close(distance(a, z), distance(a, h));
  close(distance(z, c), distance(h, b));
  close(distance(b, z), distance(c, h));
  close(angleAt(a, b, h) - angleAt(c, b, h), angleAt(a, b, c));
  close(angleAt(a, b, c), angleAt(a, c, b));
  const first = makeScene({ ...defaults, proposition: 5, step: 4 });
  const second = makeScene({ ...defaults, proposition: 5, step: 7 });
  assert.equal(first.comparison?.first, "ΑΖΓ");
  assert.equal(second.comparison?.first, "ΒΖΓ");
});

test("I.6 preserves the impossible-conjunction explanation in the diagram and exported sheet", () => {
  const { a, b, c, d } = unequalSketch(180, 25, 0.7, 1);
  assert.ok(Math.abs(angleAt(a, b, c) - angleAt(a, c, b)) > 1);
  assert.ok(area(d, b, c) < area(a, b, c));
  const scene = makeScene({ ...defaults, proposition: 6, step: 4 });
  assert.equal(scene.angles?.length, 0, "Do not mark the unequal drawn angles as equal");
  assert.match(drawScene(scene, "I.6", true), /Hypothetical sketch/);
  assert.match(studySheet(lessons[6], scene, 4), /no Euclidean triangle satisfies both/);
  const conclusion = makeScene({ ...defaults, proposition: 6, step: 5 });
  assert.equal(conclusion.notice, undefined);
  assert.ok(conclusion.equalities.includes("ΑΒ = ΑΓ (conclusion)"));
});

test("new lessons and superposition positions survive shared links with bounded input", () => {
  for (const proposition of [4, 5, 6] as const) {
    const state = { ...defaults, proposition, step: 3, motion: 43 };
    assert.deepEqual(decodeState(encodeState(state)), state);
  }
  assert.equal(decodeState("#p=6&s=999&m=999").step, 6);
  assert.equal(decodeState("#p=4&m=-9").motion, 0);
  assert.equal(decodeState("#p=4&m=Infinity").motion, 0);
  assert.equal(decodeState("#p=4&m=999").motion, 100);
});
