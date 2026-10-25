export interface CirclePassage {
  title: string;
  greek: string;
  latin: string;
  english: string;
  pages: readonly [number, number];
  note: string;
  words: readonly { greek: string; latin: string; english: string }[];
}
export const circlePassages: readonly CirclePassage[] = [
  {
    title: "The circumference and the diameter",
    greek: "Παντὸς κύκλου ἡ περίμετρος τῆς διαμέτρου τριπλασίων ἐστί",
    latin: "Cuiusuis sphaerae perimetrus diametro triplo maior est",
    english: "For every circle, the circumference is three times the diameter …",
    pages: [262, 263],
    note: "The sentence continues with an excess: it does not assert C = 3d. Heiberg's Latin actually prints sphaerae, ‘of a sphere’, where the Greek has κύκλου, ‘of a circle’. We retain that discrepancy. Read this English from the Greek; the diagrams concern a plane circle.",
    words: [
      {
        greek: "περίμετρος",
        latin: "perimetrus / ambitus",
        english: "the boundary's length; for this circle, circumference",
      },
      {
        greek: "τῆς διαμέτρου",
        latin: "diametro",
        english: "‘of the diameter’ in the Greek comparison; the whole way across, not the radius",
      },
    ],
  },
  {
    title: "Two directions of excess",
    greek:
      "καὶ ἔτι ὑπερέχει ἐλάσσονι μὲν ἢ ἑβδόμῳ μέρει τῆς διαμέτρου, μείζονι δὲ ἢ δέκα ἑβδομηκοστομόνοις.",
    latin:
      "et praeterea excedit spatio minore, quam septima pars diametri est, maiore autem quam 10/71.",
    english:
      "… and exceeds that by less than a seventh part of the diameter, but by more than ten seventy-first parts.",
    pages: [262, 263],
    note: "The paired μὲν … δὲ keeps two different comparisons together. Adding three to each excess gives 223/71 < C/d < 22/7. The Latin's stacked fraction is written 10/71 here. Neither endpoint is an equality.",
    words: [
      {
        greek: "ἐλάσσονι μὲν … μείζονι δὲ",
        latin: "minore … maiore autem",
        english: "less on the one hand … greater on the other; two sides of a bound",
      },
      {
        greek: "ἑβδόμῳ μέρει",
        latin: "septima pars",
        english: "a seventh part; ‘seventh’ is an ordinal used for a fractional part",
      },
    ],
  },
  {
    title: "The line that touches",
    greek: "ἔστω κύκλος, καὶ διάμετρος ἡ ΑΓ, καὶ κέντρον τὸ Ε, καὶ ἡ ΓΛΖ ἐφαπτομένη",
    latin: "sit circulus, et diametrus ΑΓ, et centrum Ε, et ΓΛΖ linea circulum contingens.",
    english: "Let there be a circle, with diameter ΑΓ, centre Ε, and tangent ΓΛΖ.",
    pages: [264, 265],
    note: "The radius at the point of contact is perpendicular to the tangent. The outer half-side sits on that tangent. Our diagrams rotate the construction and use O, T and P so the modern arithmetic does not masquerade as a facsimile.",
    words: [
      {
        greek: "ἔστω",
        latin: "sit",
        english: "let there be; an instruction to establish the figure",
      },
      {
        greek: "ἐφαπτομένη",
        latin: "contingens",
        english: "touching; the feminine participle supplies ‘tangent [line]’",
      },
    ],
  },
  {
    title: "Halve the angle",
    greek: "τετμήσθω οὖν ἡ ὑπὸ ΖΕΓ δίχα τῇ ΕΗ.",
    latin: "iam secetur ∠ ΖΕΓ in duas partes aequales linea ΕΗ.",
    english: "Therefore let angle ΖΕΓ be cut in two by ΕΗ.",
    pages: [264, 265],
    note: "δίχα says ‘in two’. The argument uses equal halves: Heiberg's Latin makes aequales explicit. Halving the angle doubles the polygon's side count; it does not halve the circumference. Four bisections take six sides to ninety-six.",
    words: [
      {
        greek: "τετμήσθω",
        latin: "secetur",
        english: "let it have been cut; a geometrical command",
      },
      {
        greek: "δίχα",
        latin: "in duas partes aequales",
        english: "in two; here two equal angular parts",
      },
    ],
  },
  {
    title: "Greater is useful",
    greek: "ὥστε ἡ ΓΕ πρὸς ΓΗ μείζονα λόγον ἔχει, ἤπερ φοαʹ πρὸς ρνγʹ.",
    latin: "quare ΓΕ : ΓΗ > 571 : 153.",
    english: "Thus ΓΕ has to ΓΗ a greater ratio than 571 has to 153.",
    pages: [264, 265],
    note: "φοαʹ = 500 + 70 + 1; ρνγʹ = 100 + 50 + 3. These Greek letters are numerals, distinct from the diagram's point labels. A lower bound on radius / half-side gives an upper bound on perimeter / diameter when the positive ratio is inverted.",
    words: [
      {
        greek: "μείζονα λόγον ἔχει",
        latin: "maiorem rationem habet",
        english: "has a greater ratio; a strict comparison, not an approximate equality",
      },
      { greek: "πρὸς", latin: "ad / :", english: "to, in comparing one magnitude with another" },
    ],
  },
  {
    title: "The circle stays inside",
    greek:
      "ἡ τοῦ κύκλου ἄρα περίμετρος πολὺ μᾶλλον ἐλάσσων ἐστίν, ἢ τριπλασίων καὶ ἑβδόμῳ μέρει μείζων.",
    latin:
      "quare ambitus circuli multo magis minor est quam triplo et septima parte maior diametro.",
    english:
      "The circle's circumference, then, is all the more less than three and a seventh times the diameter.",
    pages: [266, 267],
    note: "The circumscribed polygon already falls below the claimed upper limit. The circle's circumference is smaller still. πολὺ μᾶλλον strengthens the implication; it is not a numerical estimate of the gap.",
    words: [
      {
        greek: "πολὺ μᾶλλον",
        latin: "multo magis",
        english: "all the more; the comparison passes from outer polygon to circle",
      },
      {
        greek: "ἐλάσσων",
        latin: "minor",
        english: "smaller; keep its direction when following the nested perimeters",
      },
    ],
  },
  {
    title: "Invert, and change direction",
    greek: "ἀνάπαλιν ἄρα ἡ περίμετρος τοῦ πολυγώνου πρὸς τὴν διάμετρον μείζονα λόγον ἔχει",
    latin: "perimetrus polygoni ad diametrum maiorem rationem habet quam 6336 : 2017¼",
    english: "Inversely, therefore, the polygon's perimeter has to the diameter a greater ratio …",
    pages: [270, 271],
    note: "These selections align the resulting comparison rather than identical sentence boundaries. The Latin's preceding bracketed passage supplies the inversion and the 96 sides. Our 2017¼ writes the printed mixed fraction on one line. The inner construction bounds diameter / chord from above; inversion supplies a lower perimeter bound.",
    words: [
      {
        greek: "ἀνάπαλιν",
        latin: "e contrario [in the preceding passage]",
        english: "inversely; a positive reciprocal reverses an inequality",
      },
      {
        greek: "τοῦ πολυγώνου",
        latin: "polygoni",
        english: "of the polygon; at this step it is inscribed in the circle",
      },
    ],
  },
  {
    title: "A conclusion with an excess",
    greek: "ἡ ἄρα τοῦ κύκλου περίμετρος τῆς διαμέτρου τριπλασίων ἐστί",
    latin: "itaque ambitus circuli triplo maior est diametro",
    english: "Therefore the circle's circumference is three times the diameter …",
    pages: [270, 271],
    note: "The following words again retain an excess strictly between 10/71 and 1/7. This excerpt ends before them, just as the opening excerpt did. Read both halves together. The conclusion supplies bounds, not a final value π = 22/7.",
    words: [
      {
        greek: "ἄρα",
        latin: "itaque",
        english: "therefore; marks the conclusion carried by the preceding argument",
      },
      {
        greek: "τριπλασίων",
        latin: "triplo",
        english: "threefold; the continuing excess prevents reading this as exact equality",
      },
    ],
  },
];
export const circleBoundary =
  "Selections from J. L. Heiberg's 1880 volume I, pp.262–271. Greek is the ancient text in a later critical edition; Latin is Heiberg's translation, not an ancient parallel. English and teaching notes are new. Line breaks, hyphenation and geometric-letter shapes are normalized; inline reference markers are omitted. Full pages retain apparatus, brackets and adjacent proposition 2. That proposition's 11:14 area ratio must not be imported into proposition 3 as an exact equality.";
