import type { Gloss } from "./glossary";

export const inequalityGlossary: Gloss[] = [
  {
    id: "every-choice",
    greek: "πάντῃ",
    latin: "quoquo modo",
    transliteration: "pantēi",
    meaning: "in every way; for every choice",
    note: "With μεταλαμβανόμεναι in I.17 and I.20, this covers every choice of two angles or sides. Latin quoquo modo coniuncti/coniuncta likewise describes all combinations. It does not replace ‘two’ with ‘all three’.",
    forms: ["πάντῃ", "μεταλαμβανόμεναι", "quoquo", "coniuncti", "coniunctos", "coniuncta"],
  },
  {
    id: "either-or",
    greek: "ἤτοι … ἤ",
    latin: "aut … aut",
    transliteration: "ētoi … ē",
    meaning: "either … or",
    note: "I.19 uses this pair after denying ‘greater’: the remaining alternatives are equal or less. Both alternatives must be excluded. This language records the proof’s cases, not a command to choose a construction point.",
    forms: ["ἤτοι", "aut"],
  },
  {
    id: "all-the-more",
    greek: "πολλῷ",
    latin: "multo magis",
    transliteration: "pollōi",
    meaning: "by much; all the more",
    note: "In I.18, the full angle exceeds a part that already exceeds the comparison angle. πολλῷ is a dative of degree of difference; multo is ablative. The phrase strengthens the comparison without specifying a numerical factor.",
    forms: ["πολλῷ", "multo", "magis"],
  },
];
