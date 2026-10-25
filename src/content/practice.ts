import type { PropositionId } from "../core/state";
import { angleExercises } from "./angle-practice";
import { copyingExercises } from "./copying-practice";
import { inequalityExercises } from "./inequality-practice";
import { laterExercises } from "./later-practice";
import { lessons, type Passage } from "./lessons";
import { nestedExercises } from "./nested-practice";

export interface ReadingExercise {
  proposition: PropositionId;
  step: number | "statement";
  language: "grc" | "lat";
  focus: string;
  prompt: string;
  options: string[];
  correct: number;
  explanations: string[];
}

export const readingExercises: ReadingExercise[] = [
  {
    proposition: 1,
    step: 1,
    language: "grc",
    focus: "γεγράφθω",
    prompt: "What is the sentence doing with γεγράφθω?",
    options: [
      "Requesting that the circle be drawn",
      "Stating that the circle has already been drawn",
      "Making the drawing conditional on equal sides",
    ],
    correct: 0,
    explanations: [
      "γεγράφθω is a third-person perfect passive imperative: let it have been drawn. The completed drawing is requested so the proof can use it.",
      "The perfect stem presents a completed state, but the imperative makes this an instruction, not a past-tense report.",
      "The imperative asks for the drawing. There is no if-clause here; the side equalities will be established after the construction.",
    ],
  },
  {
    proposition: 1,
    step: 1,
    language: "lat",
    focus: "centro Α et radio ΑΒ",
    prompt: "What do centro Α and radio ΑΒ supply to describatur?",
    options: [
      "The two objects to prove equal",
      "The centre and radius with which to draw",
      "The names of two circles",
    ],
    correct: 1,
    explanations: [
      "The two ablative phrases specify the drawing. The sentence does not yet assert equality of the sides.",
      "Both are ablatives specifying the operation: with centre Α and radius ΑΒ. Compare the Greek datives κέντρῳ and διαστήματι.",
      "ΒΓΔ names the circle. Α is its centre; ΑΒ specifies the radius.",
    ],
  },
  {
    proposition: 2,
    step: 7,
    language: "grc",
    focus: "ὧν",
    prompt: "What does ὧν connect to the equality ΔΛ = ΔΗ?",
    options: [
      "The whole radii ΔΛ and ΔΗ as the parts to remove",
      "The remainders ΑΛ and ΒΗ after subtraction",
      "The equal parts ΔΑ and ΔΒ inside those lengths",
    ],
    correct: 2,
    explanations: [
      "ὧν refers back to ΔΛ and ΔΗ, but these are the wholes containing the parts. ΔΑ and ΔΒ, named after ὧν, are the parts to remove.",
      "The remainders come in the next sentence. Here ὧν introduces the equal parts ΔΑ and ΔΒ inside the equal whole lengths.",
      "ὧν means ‘of which’. The whole lengths ΔΛ and ΔΗ contain the equal parts ΔΑ and ΔΒ. Heiberg’s Latin makes partes explicit.",
    ],
  },
  {
    proposition: 2,
    step: 10,
    language: "lat",
    focus: "constituta est",
    prompt: "What does constituta est tell you at the end of I.2?",
    options: [
      "The requested line has been placed",
      "A new line must still be placed",
      "The line is still being placed",
    ],
    correct: 0,
    explanations: [
      "The perfect passive constituta est states the completed result. The task’s constituere, ‘to place’, has been fulfilled.",
      "A new instruction would use a form such as constituatur, ‘let it be placed’. Here est with the participle announces completion.",
      "The perfect passive reports completion. It is not a present passive describing an operation still in progress.",
    ],
  },
  {
    proposition: 3,
    step: "statement",
    language: "grc",
    focus: "τῇ ἐλάσσονι",
    prompt: "Which phrase identifies the length that the cut must equal?",
    options: ["ἀπὸ τῆς μείζονος", "τῇ ἐλάσσονι", "δύο δοθεισῶν"],
    correct: 1,
    explanations: [
      "ἀπὸ τῆς μείζονος means ‘from the greater’. It names the segment being cut, not the length to match.",
      "The dative τῇ ἐλάσσονι goes with ἴσην: equal to the lesser. The greater segment is introduced by ἀπό plus the genitive.",
      "δύο δοθεισῶν begins the given condition, ‘two [lines] having been given’. It does not distinguish the reference from the segment being cut.",
    ],
  },
  {
    proposition: 3,
    step: "statement",
    language: "lat",
    focus: "minori aequalem a maiore",
    prompt: "How should minori aequalem a maiore be connected?",
    options: [
      "Cut a length equal to the greater from the lesser",
      "Cut off the difference between the two lengths",
      "Equal to the lesser, cut from the greater",
    ],
    correct: 2,
    explanations: [
      "This reverses the cases. minori is the lesser length to match; a maiore identifies the greater segment from which the part is cut.",
      "aequalem asks for a part equal to the lesser length. The difference is the part left over, not the requested cut.",
      "minori is dative after aequalem; a maiore uses the ablative after a. The case endings distinguish the two jobs even when word order differs from English.",
    ],
  },
  {
    proposition: 4,
    step: 0,
    language: "grc",
    focus: "ἑκατέραν ἑκατέρᾳ",
    prompt: "How do the words ἑκατέραν ἑκατέρᾳ organize the two pairs of sides?",
    options: [
      "ΑΒ matches ΔΕ, and ΑΓ matches ΔΖ",
      "All four sides must share a single length",
      "ΑΒ must match ΑΓ within the first triangle",
    ],
    correct: 0,
    explanations: [
      "‘Each to each’ means respectively: first side to first side, second to second. The following μὲν … δὲ clauses spell out those pairs.",
      "The two pairwise equalities may have different values. I.4 does not require equilateral triangles.",
      "The pairing is between triangles. Making the two sides within each triangle equal would add a different hypothesis.",
    ],
  },
  {
    proposition: 4,
    step: 2,
    language: "lat",
    focus: "adplicuerimus",
    prompt: "Compared with the Greek passive phrasing, who acts in adplicuerimus … posuerimus?",
    options: [
      "The triangle: if it has been applied and placed",
      "We: if we have applied and placed",
      "You: if you have applied and placed",
    ],
    correct: 1,
    explanations: [
      "That would fit a passive paraphrase. These Latin verbs are active, first-person plural; the triangle and point are their objects.",
      "Heiberg uses first-person plural forms in the if-clause: if we have applied the triangle and placed the point. Greek frames the same setup with passive participles.",
      "The ending -imus is first-person plural, ‘we’, not second-person ‘you’. The reader is included in the proposed act of applying the triangle.",
    ],
  },
  {
    proposition: 5,
    step: 8,
    language: "grc",
    focus: "λοιπὴ ἄρα",
    prompt: "What does λοιπὴ ἄρα announce after the equal whole angles and equal parts?",
    options: [
      "The equal whole angles are being introduced for the first time",
      "The removed parts, rather than the remainders, are being proved equal",
      "The remaining base angles are equal",
    ],
    correct: 2,
    explanations: [
      "The whole angles have already been shown equal by the first triangle comparison. λοιπή shifts attention to what remains after subtraction.",
      "The second triangle comparison already supplied the equal parts. λοιπή identifies the remaining base angle, and ἄρα draws the conclusion.",
      "λοιπή means remaining; ἄρα marks therefore. Removing the equal angle parts leaves equal base angles. The same language of remainder appeared with lengths in I.2.",
    ],
  },
  {
    proposition: 5,
    step: 10,
    language: "lat",
    focus: "productis rectis aequalibus",
    prompt: "What job does productis rectis aequalibus perform?",
    options: [
      "It gives the condition: with the equal lines extended",
      "It commands the reader to extend the lines at this point",
      "It names the equal lines as the subject of the main sentence",
    ],
    correct: 0,
    explanations: [
      "This ablative absolute gives the setting for the exterior-angle conclusion. Compare the Greek genitive absolute προσεκβληθεισῶν τῶν ἴσων εὐθειῶν.",
      "productis is a participle in an ablative absolute, not a new imperative. The extension is already in place when the conclusion is repeated.",
      "rectis and aequalibus are ablatives within the detached phrase. The main sentence makes a claim about the angles, not about lines as its subject.",
    ],
  },
  {
    proposition: 6,
    step: 5,
    language: "grc",
    focus: "οὐκ ἄρα ἄνισός",
    prompt: "How do οὐκ and ἄνισός combine in the conclusion?",
    options: [
      "ΑΒ is proved greater than ΑΓ",
      "ΑΒ is not unequal to ΑΓ, so it is equal",
      "ΑΒ has not yet been shown equal to ΑΓ",
    ],
    correct: 1,
    explanations: [
      "The proof rejects the supposition that one side is greater. οὐκ negates the inequality; it does not choose a direction for it.",
      "οὐκ negates ἄνισος (‘unequal’). The short next clause, ἴση ἄρα, states the positive result: equal, therefore.",
      "The sentence denies inequality itself, rather than saying that a proof of equality is missing. ἴση ἄρα immediately states the positive conclusion.",
    ],
  },
  {
    proposition: 6,
    step: 4,
    language: "lat",
    focus: "minus maiori; quod absurdum est",
    prompt: "What is left understood in minus maiori?",
    options: [
      "The lesser triangle is smaller than the greater",
      "A smaller side is equal to a greater side",
      "The lesser triangle would be equal to the greater",
    ],
    correct: 2,
    explanations: [
      "That comparison is true, but the missing relation comes from the preceding equality. The supposed equality of a proper part with its whole is what makes the result absurd.",
      "minus is neuter, agreeing with the triangle understood from the preceding clause. The contradiction concerns the two triangles, one contained in the other.",
      "The preceding equality supplies the missing relation: the lesser [equal] to the greater. That conflicts with the whole–part principle and rejects the added inequality.",
    ],
  },
  ...laterExercises,
  ...angleExercises,
  ...inequalityExercises,
  ...nestedExercises,
  ...copyingExercises,
];

export function exercisePassage(exercise: ReadingExercise): Passage {
  const lesson = lessons[exercise.proposition];
  const passage = exercise.step === "statement" ? lesson.statement : lesson.steps[exercise.step];
  if (!passage) throw new RangeError("Reading exercise references a missing passage.");
  return passage;
}
