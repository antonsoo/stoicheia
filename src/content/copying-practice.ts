import type { ReadingExercise } from "./practice";
export const copyingExercises: ReadingExercise[] = [
  {
    proposition: 22,
    step: "statement",
    language: "grc",
    focus: "πάντῃ μεταλαμβανομένας",
    prompt: "What does the condition require of the two lengths?",
    options: [
      "Every pair must exceed the remaining length.",
      "Only the two circle radii must exceed the base.",
      "Only the longest pair must be checked.",
    ],
    correct: 0,
    explanations: [
      "Yes. πάντῃ makes the choice unrestricted: Α+Β>Γ, Α+Γ>Β and Β+Γ>Α.",
      "That single check does not rule out one circle lying inside the other. The other pairings matter too.",
      "The largest pair is not the difficult case. Every choice of the remaining length must satisfy the comparison.",
    ],
  },
  {
    proposition: 22,
    step: 6,
    language: "lat",
    focus: "tres rectae",
    prompt: "How does tres rectae relate to tribus later in the sentence?",
    options: [
      "Three lines are the subject, and the other three are the dative comparison.",
      "Both name vertices of the triangle.",
      "Both mean the two equal circle radii.",
    ],
    correct: 0,
    explanations: [
      "Yes. The constructed three lines are equal to the given three; nominative tres contrasts with dative tribus.",
      "Α, Β and Γ name the given lengths here. The triangle's vertices are Κ, Ζ and Η.",
      "The sentence collects all three copied lengths, including the middle base ΖΗ. It does not concern only two radii.",
    ],
  },
  {
    proposition: 23,
    step: 1,
    language: "grc",
    focus: "τυχόντα σημεῖα",
    prompt: "What freedom does the instruction give for Δ and Ε?",
    options: [
      "Choose a point on each side, with no requirement that the two distances be equal.",
      "Choose the midpoint of each side.",
      "Choose any two points on the same side.",
    ],
    correct: 0,
    explanations: [
      "Yes. τυχόντα leaves the point distances arbitrary. ἐφ’ ἑκατέρας still requires one point on each of the two sides.",
      "No bisection is requested. Equal distances are a permissible special choice, not the condition of this proof.",
      "The phrase ἐφ’ ἑκατέρας specifies each of the two sides. Arbitrary does not remove that location requirement.",
    ],
  },
  {
    proposition: 23,
    step: 4,
    language: "lat",
    focus: "altera alteri",
    prompt: "What relation does altera alteri express?",
    options: [
      "Each given side equals its corresponding copied side.",
      "All four sides equal one common length.",
      "The triangles must lie in the same place.",
    ],
    correct: 0,
    explanations: [
      "Yes. ΔΓ corresponds to ΖΑ, and ΓΕ to ΑΗ. The closing bases ΔΕ and ΖΗ give the third equality.",
      "The two side lengths around the angle may differ from each other. Their respective copies must match them.",
      "This phrase concerns pairwise side equality, not position. The new triangle is constructed at a different point.",
    ],
  },
];
