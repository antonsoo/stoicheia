import assert from "node:assert/strict";
import test from "node:test";
import { casebookDefaults } from "../src/core/casebook";
import { decodeState, defaults, encodeState } from "../src/core/state";

test("shared I.7 explorations retain exact boundary/reflection modes and reject unbounded controls", () => {
  for (const mode of ["turn", "boundary", "reflection"] as const) {
    const state = {
      ...defaults,
      proposition: 7 as const,
      casebook: { ...casebookDefaults, open: true, mode, turn: 55, stage: 2 },
    };
    assert.deepEqual(decodeState(encodeState(state)), state);
  }
  assert.deepEqual(
    decodeState("#p=7&case=1&turn=Infinity&case-step=-7&case-mode=unknown").casebook,
    { ...casebookDefaults, open: true },
  );
  assert.deepEqual(decodeState("#p=7&case=1&turn=900&case-step=99&case-mode=reflection").casebook, {
    open: true,
    turn: 65,
    stage: 3,
    mode: "reflection",
  });
});
