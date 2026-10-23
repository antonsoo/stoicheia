import type { ReadingExercise } from "./practice";

export const nestedExercises: ReadingExercise[] = [
  {
    proposition: 21,
    step: "statement",
    language: "grc",
    focus: "ἐλάττονες μὲν ἔσονται, μείζονα δὲ",
    prompt: "What contrast does μέν … δέ organize here?",
    options: [
      "Smaller combined lengths, but a larger included angle",
      "Each inner side is smaller than each outer side",
      "A smaller angle before construction, then a larger one after it",
    ],
    correct: 0,
    explanations: [
      "Yes. ἐλάττονες describes the joined lines compared as a sum; μείζονα describes their one included angle. The contrast joins two claims requiring separate proofs.",
      "The source compares the two pairs together. Individual corresponding sides need not both decrease.",
      "The sentence contrasts lengths with an angle, not two moments of an animation. ἔσονται states the consequence of the interior meeting.",
    ],
  },
  {
    proposition: 21,
    step: 0,
    language: "lat",
    focus: "intus coniungantur",
    prompt: "What does intus require of the meeting point?",
    options: [
      "It may lie anywhere on the same side of the base",
      "It must be inside the original triangle",
      "It must be the midpoint of the triangle",
    ],
    correct: 1,
    explanations: [
      "Being on the same side of the base is insufficient: a point can be beyond the outer sides.",
      "Yes. The interior placement makes both auxiliary triangles nondegenerate and fixes the point orders needed to combine segments.",
      "The text specifies no midpoint. The two controls let the meeting point vary while retaining its interior placement.",
    ],
  },
];
