export const ratioSourceUrl =
  "https://archive.org/download/euclidisoperaomn02eucluoft/euclidisoperaomn02eucluoft.pdf";
export const ratioBoundary =
  "Euclid V definitions 3–7, Heiberg’s 1884 Greek edition and nineteenth-century Latin translation, pp.2–5. English, examples, search, exact symbolic arithmetic and proof explanations are new teaching work. The square diagonal and comparison fractions are not examples printed in these definitions. A finite search can supply a counterexample to equality; agreement throughout that search is not a proof for every multiplier.";
export interface RatioPassage {
  title: string;
  location: string;
  greek: string;
  latin: string;
  english: string;
  note: string;
  pages: readonly [number, number];
  words: readonly { greek: string; latin: string; meaning: string }[];
}
export const ratioPassages: readonly RatioPassage[] = [
  {
    title: "A relation of magnitudes",
    location: "V · definition 3",
    greek: "Λόγος ἐστὶ δύο μεγεθῶν ὁμογενῶν ἡ κατὰ πηλικότητά ποια σχέσις.",
    latin: "Ratio est duarum eiusdem generis magnitudinum secundum quantitatem quaelibet habitudo.",
    english: "A ratio is a certain relation in size between two magnitudes of the same kind.",
    note: "Here λόγος means ratio. ὁμογενῶν is genitive plural, agreeing with μεγεθῶν: ‘of the same kind’. We compare lengths with lengths. A square’s diagonal and side can have a ratio even when no length measures them both a whole number of times.",
    pages: [2, 3],
    words: [
      {
        greek: "λόγος",
        latin: "ratio",
        meaning: "ratio; the word has other meanings in other contexts.",
      },
      {
        greek: "μεγεθῶν",
        latin: "magnitudinum",
        meaning: "of magnitudes; genitive plural, not a word for decimal numbers.",
      },
      {
        greek: "ὁμογενῶν",
        latin: "eiusdem generis",
        meaning: "of the same kind. Both members of each ratio here are lengths.",
      },
    ],
  },
  {
    title: "Able to exceed one another",
    location: "V · definition 4",
    greek: "Λόγον ἔχειν πρὸς ἄλληλα μεγέθη λέγεται, ἃ δύναται πολλαπλασιαζόμενα ἀλλήλων ὑπερέχειν.",
    latin:
      "Rationem inter se habere magnitudines dicuntur, quae multiplicatae altera alteram superare possunt.",
    english:
      "Magnitudes are said to have a ratio to one another when, on being multiplied, they can exceed one another.",
    note: "The condition concerns possible multiples, not the particular copies currently displayed. All positive lengths on this bench satisfy it. The horn-angle workshop shows why that condition deserves attention for other kinds of magnitude.",
    pages: [2, 3],
    words: [
      {
        greek: "πολλαπλασιαζόμενα",
        latin: "multiplicatae",
        meaning: "being multiplied, or taken repeatedly.",
      },
      {
        greek: "ὑπερέχειν",
        latin: "superare",
        meaning: "to exceed. Equality does not satisfy this word.",
      },
    ],
  },
  {
    title: "The complete test for the same ratio",
    location: "V · definition 5, complete",
    greek:
      "Ἐν τῷ αὐτῷ λόγῳ μεγέθη λέγεται εἶναι πρῶτον πρὸς δεύτερον καὶ τρίτον πρὸς τέταρτον, ὅταν τὰ τοῦ πρώτου καὶ τρίτου ἰσάκις πολλαπλάσια τῶν τοῦ δευτέρου καὶ τετάρτου ἰσάκις πολλαπλασίων καθ’ ὁποιονοῦν πολλαπλασιασμὸν ἑκάτερον ἑκατέρου ἢ ἅμα ὑπερέχῃ ἢ ἅμα ἴσα ᾖ ἢ ἅμα ἐλλείπῃ ληφθέντα κατάλληλα.",
    latin:
      "In eadem ratione magnitudines esse dicuntur prima ad secundam et tertia ad quartam, si primae et tertiae aeque multiplices secundae et quartae aeque multiplices aut simul superant aut simul aequales sunt aut simul minores sunt suo ordine sumptae.",
    english:
      "Magnitudes are said to have the same ratio, the first to the second and the third to the fourth, when equal-times multiples of the first and third, compared respectively with equal-times multiples of the second and fourth, for whatever multiplication, either both exceed, both are equal, or both fall short.",
    note: "‘Equal-times’ pairs the first with the third, and separately the second with the fourth. It does not require all four to have the same multiplier. Heiberg’s p.5 footnote makes that distinction explicit. The modern letters m and n name those two choices. The universal condition ranges over every pair of positive integers.",
    pages: [2, 3],
    words: [
      {
        greek: "ἰσάκις",
        latin: "aeque",
        meaning: "an equal number of times, within the specified pair.",
      },
      {
        greek: "ἅμα",
        latin: "simul",
        meaning: "together, alike: the corresponding comparisons must have the same outcome.",
      },
      {
        greek: "κατάλληλα",
        latin: "suo ordine",
        meaning: "in corresponding order: first with second; third with fourth.",
      },
    ],
  },
  {
    title: "Whatever multiplication",
    location: "V · definition 5, selected clause",
    greek: "καθ’ ὁποιονοῦν πολλαπλασιασμὸν",
    latin: "primae et tertiae aeque multiplices secundae et quartae aeque multiplices",
    english:
      "For whatever multiplication: choose any positive whole number m for the first and third, and independently any positive whole number n for the second and fourth.",
    note: "The Latin displayed here is the surrounding multiplier clause, not a word-for-word counterpart of the short Greek phrase. Heiberg supplies no separate phrase for ‘whatever multiplication’ in his Latin sentence. His p.3 footnote gives a symbolic explanation. That printed algebra is nineteenth-century commentary, not ancient notation. No finite upper limit occurs in the Greek condition.",
    pages: [2, 3],
    words: [
      {
        greek: "ὁποιονοῦν",
        latin: "no separate phrase here",
        meaning: "of whatever kind; the indefinite force is essential to the test.",
      },
      {
        greek: "πολλαπλασιασμόν",
        latin: "multiplices (in context)",
        meaning: "multiplication, taking a multiple; accusative after κατά.",
      },
    ],
  },
  {
    title: "Three outcomes, all retained",
    location: "V · definition 5, selected clause",
    greek: "ἢ ἅμα ὑπερέχῃ ἢ ἅμα ἴσα ᾖ ἢ ἅμα ἐλλείπῃ",
    latin: "aut simul superant aut simul aequales sunt aut simul minores sunt",
    english: "Either both exceed, or both are equal, or both fall short.",
    note: "A less-than comparison paired with equality is already a disagreement. Do not throw away the equality case because a drawing’s endpoints look coincident. The modern exact check compares integer squares for m√2 and n, and integer products for mp and nq.",
    pages: [2, 3],
    words: [
      {
        greek: "ἴσα",
        latin: "aequales",
        meaning: "equal; one of three separate comparison outcomes.",
      },
      {
        greek: "ἐλλείπῃ",
        latin: "minores sunt",
        meaning: "falls short; the Latin expresses this as ‘are smaller’.",
      },
    ],
  },
  {
    title: "Give the relation its name",
    location: "V · definition 6",
    greek: "Τὰ δὲ τὸν αὐτὸν ἔχοντα λόγον μεγέθη ἀνάλογον καλείσθω.",
    latin: "Magnitudines autem eandem rationem habentes proportionales uocentur.",
    english: "Let magnitudes having the same ratio be called proportional.",
    note: "The name follows the previous definition’s condition. It does not replace that condition with ‘the displayed decimal values look the same’. The threefold pair on this bench has the same ratio by a general scaling argument.",
    pages: [2, 3],
    words: [
      {
        greek: "ἀνάλογον",
        latin: "proportionales",
        meaning: "proportional, having the same ratio.",
      },
      {
        greek: "καλείσθω",
        latin: "uocentur",
        meaning: "let them be called; a naming instruction.",
      },
    ],
  },
  {
    title: "Greater, with a witness",
    location: "V · definition 7, complete",
    greek:
      "Ὅταν δὲ τῶν ἰσάκις πολλαπλασίων τὸ μὲν τοῦ πρώτου πολλαπλάσιον ὑπερέχῃ τοῦ τοῦ δευτέρου πολλαπλασίου, τὸ δὲ τοῦ τρίτου πολλαπλάσιον μὴ ὑπερέχῃ τοῦ τοῦ τετάρτου πολλαπλασίου, τότε τὸ πρῶτον πρὸς τὸ δεύτερον μείζονα λόγον ἔχειν λέγεται, ἤπερ τὸ τρίτον πρὸς τὸ τέταρτον.",
    latin:
      "Sin ex aeque multiplicibus primae multiplex multiplicem secundae superat, tertiae autem multiplex multiplicem quartae non superat, tum prima ad secundam maiorem rationem habere dicitur quam tertia ad quartam.",
    english:
      "When, among the equal-times multiples, the multiple of the first exceeds that of the second, while the multiple of the third does not exceed that of the fourth, the first is said to have a greater ratio to the second than the third has to the fourth.",
    note: "‘Does not exceed’ allows equality. A disagreement always refutes the condition for equal ratios, but a particular disagreement need not have definition 7’s strict-excess/non-excess form. The bench distinguishes those two conclusions. If the second pair supplies the excess, exchange the two ratio pairs to apply the definition.",
    pages: [4, 5],
    words: [
      {
        greek: "μὴ ὑπερέχῃ",
        latin: "non superat",
        meaning: "does not exceed: less than or equal, not only strictly less.",
      },
      {
        greek: "μείζονα λόγον",
        latin: "maiorem rationem",
        meaning: "a greater ratio. The witness determines which pair has it.",
      },
    ],
  },
];
