import assert from "node:assert/strict";
import test from "node:test";
import {
  encodeMesolabe,
  initialMesolabe,
  mesolabeModel,
  parseMesolabe,
} from "../src/core/mesolabe";
import { mesolabeTemplate } from "../src/mesolabe-drawing";

test("an exact rational pose gives an eightfold cube", () => {
  const m = mesolabeModel({ ...initialMesolabe, factor: 8, left: 0.5, right: 0.75 });
  assert.equal(m.aligned, true);
  assert.deepEqual(m.lengths, [8, 4, 2, 1]);
  assert.deepEqual(m.ratios, [2, 2, 2]);
  assert.equal(m.volume, 8);
});
test("doubling takes the last mean; the first would quadruple the volume", () => {
  const m = mesolabeModel({ ...initialMesolabe, mode: "ideal" });
  assert.equal(m.aligned, true);
  assert.ok(Math.abs(m.candidate - 1.2599210498948732) < 1e-14);
  assert.ok(Math.abs(m.volume - 2) < 1e-13);
  assert.ok(Math.abs((m.lengths[1] ?? 0) ** 3 - 4) < 1e-13);
});
test("one contact can align while the other is wrong", () => {
  const m = mesolabeModel({ ...initialMesolabe, mode: "first" });
  assert.ok(Math.abs(m.residuals[0] ?? 1) < 1e-14);
  assert.ok(Math.abs(m.residuals[1] ?? 0) > 0.05);
  assert.equal(m.aligned, false);
  assert.ok(Math.abs(m.volume - 2) > 0.5);
});
test("a physical displacement preserves the unperturbed contact geometry", () => {
  const ideal = mesolabeModel({ ...initialMesolabe, mode: "ideal" });
  const moved = mesolabeModel({
    ...initialMesolabe,
    mode: "trial",
    left: ideal.p,
    right: ideal.q + 0.5 / 60,
  });
  assert.equal(moved.lengths[1], ideal.lengths[1]);
  assert.ok(Math.abs((ideal.lengths[2] ?? 0) - (moved.lengths[2] ?? 0) - 1 / 60) < 1e-14);
  assert.equal(moved.aligned, false);
  assert.ok(moved.volume < 2);
});
test("shared poses preserve full precision and reject invalid fields individually", () => {
  const pose = {
    ...initialMesolabe,
    factor: 5.3,
    left: 0.3984732346547,
    mode: "first" as const,
    passage: 7,
    page: 113,
  };
  assert.deepEqual(parseMesolabe(encodeMesolabe(pose)), { state: pose, repaired: false });
  const parsed = parseMesolabe("#r=Infinity&l=-1&q=0.8&m=invalid&s=99&p=2&page=109.1");
  assert.equal(parsed.repaired, true);
  assert.equal(parsed.state.factor, 2);
  assert.equal(parsed.state.left, 0.12);
  assert.equal(parsed.state.right, 0.8);
  assert.equal(parsed.state.passage, 2);
  assert.equal(parsed.state.page, 109);
});
test("paper sheet declares millimetres and keeps calibration in the SVG coordinate system", () => {
  const svg = mesolabeTemplate(2);
  assert.match(svg, /width="297mm" height="210mm" viewBox="0 0 297 210"/);
  assert.match(svg, /M242 155v3m0-1.5h25/);
  assert.match(svg, /M206 150h8/);
  assert.match(svg, /divide that height by 30 mm/);
});
