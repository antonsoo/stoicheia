import assert from "node:assert/strict";
import test from "node:test";
import { lookup } from "../src/content/glossary";
import { lessons, reasons } from "../src/content/lessons";
import { cutOff, distance, equilateral, transfer } from "../src/core/geometry";
import { makeScene } from "../src/core/scene";
import { decodeState, defaults, encodeState, stepCounts } from "../src/core/state";
import { annotated, drawScene, studySheet } from "../src/render";

function near(a: number, b: number) {
  assert.ok(Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)), `${a} != ${b}`);
}

test("I.1 gives equal sides on either side of translated, rotated segments", () => {
  for (let angle = 0; angle < 360; angle += 7) {
    for (const side of [-1, 1] as const) {
      const a = { x: -37, y: 83 };
      const b = { x: a.x + 179 * Math.cos(angle), y: a.y + 179 * Math.sin(angle) };
      const c = equilateral(a, b, side);
      near(distance(a, b), distance(a, c));
      near(distance(a, b), distance(b, c));
      const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      assert.equal(Math.sign(cross), side);
    }
  }
});

test("I.2 constructs the copied length, with equal whole-minus-part evidence", () => {
  for (const size of [100, 180, 240]) {
    for (const ratio of [0.2, 0.65, 1, 1.4]) {
      for (const side of [-1, 1] as const) {
        const a = { x: 11, y: -39 };
        const b = { x: a.x + size, y: a.y };
        const c = {
          x: b.x + size * ratio * Math.cos(0.63),
          y: b.y + size * ratio * Math.sin(0.63),
        };
        const t = transfer(a, b, c, side);
        near(distance(b, c), distance(b, t.g));
        near(distance(t.d, t.l), distance(t.d, t.g));
        near(distance(t.d, a), distance(t.d, b));
        near(distance(t.d, t.l) - distance(t.d, a), distance(a, t.l));
        near(distance(a, t.l), distance(b, c));
      }
    }
  }
});

test("I.3 cuts inside the larger segment with a radius supplied by I.2", () => {
  const a = { x: 0, y: 0 },
    b = { x: 180, y: 70 };
  for (const r of [1, 75, 190]) {
    const c = { x: 60, y: -90 },
      d = { x: 60 + r, y: -90 };
    const cut = cutOff(a, b, c, d);
    near(distance(a, cut.e), distance(c, d));
    near(distance(a, cut.copy.l), cut.radius);
    near(distance(a, cut.e) + distance(cut.e, b), distance(a, b));
  }
});

test("invalid hypotheses do not fabricate construction points", () => {
  const a = { x: 0, y: 0 },
    b = { x: 2, y: 0 };
  assert.throws(() => equilateral(a, a), /different/);
  assert.throws(() => transfer(a, b, b), /positive/);
  assert.throws(() => equilateral({ x: NaN, y: 0 }, b), /finite/);
  assert.throws(() => cutOff(a, b, { x: 1, y: 1 }, { x: 3, y: 1 }), /shorter/);
  assert.throws(() => cutOff(a, b, { x: 1, y: 1 }, { x: 4, y: 1 }), /shorter/);
  const invalid = makeScene({ ...defaults, proposition: 3, step: 4, ratio: 1 });
  assert.ok(invalid.warning);
  assert.equal(
    invalid.segments.some((edge) => edge.id === "AE"),
    false,
  );
  assert.equal(invalid.circles.length, 0);
});

test("every lesson has source pages, a reason, and a renderable scene for every step", () => {
  for (const id of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const) {
    const lesson = lessons[id];
    assert.equal(lesson.steps.length, stepCounts[id]);
    assert.equal(lesson.question.options.length, lesson.question.explanations.length);
    for (const [step, passage] of lesson.steps.entries()) {
      assert.ok(reasons[passage.reason]);
      assert.ok(passage.grc && passage.lat && passage.en && passage.language);
      assert.ok(passage.greekPages.every((p) => p >= 10 && p <= 30 && p % 2 === 0));
      assert.ok(passage.latinPages.every((p) => p >= 11 && p <= 31 && p % 2 === 1));
      for (const ratio of [0.2, 0.65, 0.99, 1, 1.4]) {
        for (const side of [-1, 1] as const) {
          const scene = makeScene({ ...defaults, proposition: id, step, ratio, side });
          const svg = drawScene(scene, passage.title);
          assert.ok(!/NaN|Infinity|undefined/.test(svg));
          assert.match(svg, /<desc/);
        }
      }
    }
  }
});

test("shared links round-trip the complete reading state", () => {
  const state = {
    ...defaults,
    proposition: 2,
    step: 8,
    size: 137,
    ratio: 1.21,
    angle: 73,
    side: -1,
    motion: 37,
  } as const;
  assert.deepEqual(decodeState(encodeState(state)), state);
  assert.deepEqual(decodeState(""), defaults);
  assert.deepEqual(decodeState("#p=3&s=999&size=NaN&r=9&a=-500&side=-1"), {
    ...defaults,
    proposition: 3,
    step: 4,
    size: 180,
    ratio: 1.4,
    angle: 10,
    side: -1,
    motion: 0,
  });
  assert.equal(decodeState("#p=2&s=Infinity&r=&size=0").step, 0);
  assert.equal(decodeState("#p=<script>&s=-2").proposition, 1);
  const fractional = decodeState("#p=2&size=137.6&r=0.654&a=25.4");
  assert.equal(fractional.size, 138);
  assert.equal(fractional.ratio, 0.65);
  assert.equal(fractional.angle, 25);
});

test("vocabulary recognizes accented inflected forms in both languages", () => {
  assert.equal(lookup("ἘΠΕΖΕΎΧΘΩΣΑΝ")?.id, "join");
  assert.equal(lookup("κέντρῳ".normalize("NFD"))?.id, "centre");
  assert.equal(lookup("describatur")?.id, "draw");
  assert.equal(lookup("ἴσην")?.id, "equal");
  assert.match(annotated("Κέντρῳ τῷ Α"), /data-gloss="centre"/);
  assert.equal(lookup("ΑΒ"), undefined);
});

test("source editorial brackets and a real I.2 subconstruction survive export", () => {
  assert.match(lessons[1].steps.at(-1)?.grc ?? "", /^\[/);
  assert.equal(lessons[3].steps[1]?.reason, "i2");
  const sheet = studySheet(lessons[2], makeScene({ ...defaults, proposition: 2, step: 8 }), 8);
  assert.match(sheet, /lang="grc"/);
  assert.match(sheet, /lang="la"/);
  assert.match(sheet, /1883/);
  assert.match(sheet, /ΑΛ = ΒΗ/);
  assert.doesNotMatch(sheet, /<script|<link|src="https:/);
});

test("annotation escapes markup rather than turning external text into HTML", () => {
  const text = annotated('<img src=x onerror="alert(1)"> κέντρῳ &');
  assert.doesNotMatch(text, /<img|onerror="/);
  assert.match(text, /&lt;img/);
  assert.match(text, /&amp;/);
});
