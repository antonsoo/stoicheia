import assert from "node:assert/strict";
import test from "node:test";
import { foundationById, foundations, reasonFoundations } from "../src/content/foundations";
import { lessons } from "../src/content/lessons";
import { exercisePassage, readingExercises } from "../src/content/practice";
import { makeScene } from "../src/core/scene";
import { defaults } from "../src/core/state";
import { studySheet } from "../src/render";

test("practice prompts remain anchored to real source wording, not invented fragments", () => {
  for (const exercise of readingExercises) {
    const source = exercisePassage(exercise);
    assert.ok(source[exercise.language].includes(exercise.focus), `Missing ${exercise.focus}`);
    assert.equal(exercise.options.length, exercise.explanations.length);
    assert.ok(exercise.options[exercise.correct]);
  }
});

test("reason links resolve to bilingual statements with explicit edition numbering", () => {
  for (const ids of Object.values(reasonFoundations))
    for (const id of ids) assert.ok(foundationById.has(id));
  assert.equal(foundations.filter((f) => f.category === "Postulate").length, 5);
  assert.match(foundationById.get("cn4")?.editionLabel ?? "", /VII/);
  assert.match(foundationById.get("cn5")?.grc ?? "", /\[ἐστιν\]/);
  assert.doesNotMatch(foundationById.get("d15")?.lat ?? "", /\[/);
});

test("downloaded proofs retain reasons and the original foundations they invoke", () => {
  const sheet = studySheet(lessons[5], makeScene({ ...defaults, proposition: 5, step: 8 }), 8);
  assert.match(sheet, /Reason: Common notion 3/);
  assert.match(sheet, /τὰ καταλειπόμενα/);
  assert.match(sheet, /ab aequalibus aequalia subtrahuntur/);
  assert.match(sheet, /Printed source: Greek pp\. 10; Latin pp\. 11/);
  assert.doesNotMatch(sheet, /<script/);
});
