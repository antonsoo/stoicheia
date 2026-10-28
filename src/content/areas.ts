export interface AreaReading {
  title: string;
  location: string;
  pages: readonly [number, number];
  greek: string;
  latin: string;
  english: string;
  note: string;
  words: readonly (readonly [string, string, string])[];
}
export const areaSourceUrl =
  "https://archive.org/download/euclidisoperaomn02eucluoft/euclidisoperaomn02eucluoft.pdf";
export const areaBoundary =
  "The coordinates, trial numbers, graph and square-completion identities are modern teaching work. The readings are selected passages, not complete transcriptions of the three proofs. The whole printed pages retain the complete arguments and editorial apparatus. Heiberg’s Latin is a nineteenth-century translation; the English and language guidance are new and have not had independent philological review.";
export const areaReadings: readonly AreaReading[] = [
  {
    title: "Apply, while falling short",
    location: "VI.28 · opening problem, first clause",
    pages: [162, 163],
    greek:
      "Παρὰ τὴν δοθεῖσαν εὐθεῖαν τῷ δοθέντι εὐθυγράμμῳ ἴσον παραλληλόγραμμον παραβαλεῖν ἐλλεῖπον εἴδει παραλληλογράμμῳ ὁμοίῳ τῷ δοθέντι·",
    latin:
      "Datae rectae datae figurae rectilineae aequale parallelogrammum adplicare deficiens figura parallelogramma datae simili.",
    english:
      "To apply to the given straight line a parallelogram equal to the given rectilinear figure, falling short by a parallelogram similar to the given one.",
    note: "The line, target figure and shape of the shortfall are three different givens. ἴσον concerns area; ὁμοίῳ concerns shape. In the plate, a names the line, c the target area, and the hatched region stays similar to the displayed given shape. Our a, c and t are modern labels, not the source’s point names.",
    words: [
      [
        "παραβαλεῖν",
        "adplicare",
        "to apply or lay alongside; an infinitive stating the construction problem",
      ],
      [
        "ἐλλεῖπον",
        "deficiens",
        "falling short; the participle describes the parallelogram to be made",
      ],
    ],
  },
  {
    title: "The condition belongs to the problem",
    location: "VI.28 · opening problem, restriction",
    pages: [162, 163],
    greek:
      "δεῖ δὲ τὸ διδόμενον εὐθύγραμμον [ᾧ δεῖ ἴσον παραβαλεῖν] μὴ μεῖζον εἶναι τοῦ ἀπὸ τῆς ἡμισείας ἀναγραφομένου ὁμοίου τῷ ἐλλείμματι [τοῦ τε ἀπὸ τῆς ἡμισείας καὶ ᾧ δεῖ ὅμοιον ἐλλείπειν].",
    latin:
      "oportet autem, figuram rectilineam datam maiorem non esse figura in dimidia recta descripta defectui simili.",
    english:
      "But the given rectilinear figure [to which an equal figure must be applied] must not be greater than the figure drawn on half the line, similar to the shortfall [both the one on half the line and the one to which the shortfall must be similar].",
    note: "μὴ μεῖζον / maiorem non means ‘not greater’, so equality is allowed. Square brackets are Heiberg’s editorial brackets, retained here; the final bracketed Greek explanation is not separately repeated in his Latin. The target 45 exceeds 36 for a = 12 and k = 1. That is a failed premise, not a failure to move the control precisely enough.",
    words: [
      ["μὴ μεῖζον", "maiorem non", "not greater; includes equality"],
      [
        "τῆς ἡμισείας",
        "in dimidia",
        "of or on the half; the understood object is the given straight line",
      ],
    ],
  },
  {
    title: "The greatest is on the half",
    location: "VI.27 · conclusion",
    pages: [160, 161],
    greek:
      "Πάντων ἄρα τῶν παρὰ τὴν αὐτὴν εὐθεῖαν παραβαλλομένων παραλληλογράμμων καὶ ἐλλειπόντων εἴδεσι παραλληλογράμμοις ὁμοίοις τε καὶ ὁμοίως κειμένοις τῷ ἀπὸ τῆς ἡμισείας ἀναγραφομένῳ μέγιστόν ἐστι τὸ ἀπὸ τῆς ἡμισείας παραβληθέν· ὅπερ ἔδει δεῖξαι.",
    latin:
      "Ergo omnium parallelogrammorum eidem rectae adplicatorum et deficientium figuris parallelogrammis similibus et similiter positis ei, quae in dimidia describitur, maximum est, quod dimidiae adplicatur; quod erat demonstrandum.",
    english:
      "Therefore, of all the parallelograms applied to the same straight line and falling short by parallelograms similar and similarly placed to the one drawn on half the line, the greatest is the one applied on half the line; which was to be proved.",
    note: "Euclid compares regions through equal complements and a gnomon. Our identity maximum − trial = k(t − a/2)² explains this coordinate family in modern algebra. It is not a transcription of Euclid’s proof. Heiberg’s p.161 note discusses an additional manuscript case that he removed to the appendix. The app’s reflected trial is a modern operation, not a claim that this edition presents two separate constructions.",
    words: [
      ["μέγιστον", "maximum", "greatest, the superlative rather than merely ‘greater’"],
      [
        "ὁμοίως κειμένοις",
        "similiter positis",
        "similarly placed; the shortfall cannot be an arbitrary shape of the right area",
      ],
    ],
  },
  {
    title: "If it is equal, the job is done",
    location: "VI.28 · equal case after bisection",
    pages: [164, 165],
    greek: "Εἰ μὲν οὖν ἴσον ἐστὶ τὸ ΑΗ τῷ Γ, γεγονὸς ἂν εἴη τὸ ἐπιταχθέν·",
    latin: "iam si ΑΗ = Γ, effectum erit propositum.",
    english: "If, then, AH is equal to Γ, what was required would have been accomplished.",
    note: "The source has already bisected AB and constructed a similar figure on the half. Here AH and Γ name areas, not lengths. The equality case is part of the construction: there is no positive difference left to construct. With the opening shape, change the target to 36 and set t = 6.",
    words: [
      ["εἰ μὲν", "si", "if, introducing the first of the cases; εἰ δὲ οὔ follows in the source"],
      ["τὸ ἐπιταχθέν", "propositum", "what was required or proposed; a substantivized participle"],
    ],
  },
  {
    title: "Construct the difference with the same shape",
    location: "VI.28 · smaller target",
    pages: [164, 165],
    greek:
      "ᾧ δὴ μεῖζόν ἐστι τὸ ΗΒ τοῦ Γ, ταύτῃ τῇ ὑπεροχῇ ἴσον, τῷ δὲ Δ ὅμοιον καὶ ὁμοίως κείμενον τὸ αὐτὸ συνεστάτω τὸ ΚΛΜΝ.",
    latin:
      "iam excessui, quo maius est ΗΒ figura Γ, aequale et parallelogrammo Δ simile et similiter positum idem construatur ΚΛΜΝ.",
    english:
      "Construct KΛMN equal to the excess by which HB is greater than Γ, and at the same time similar and similarly placed to Δ.",
    note: "There are two constraints on one new figure: its area is a difference, and its shape is prescribed. VI.25 supplies that construction. For a square shortfall our modern normalized equation is (t − a/2)² = a²/4 − c/k. If the right side is negative, there is no real length to construct.",
    words: [
      [
        "ὑπεροχῇ",
        "excessui",
        "to the excess or difference; here the amount by which one area exceeds another",
      ],
      [
        "τὸ αὐτό",
        "idem",
        "the same figure must satisfy the area and similarity requirements together",
      ],
    ],
  },
  {
    title: "Equal remainders",
    location: "VI.28 · first remainder step",
    pages: [166, 167],
    greek:
      "ἐπεὶ οὖν ἴσον ἐστὶ τὸ ΒΗ τοῖς Γ, ΚΜ, ὧν τὸ ΗΠ τῷ ΚΜ ἐστιν ἴσον, λοιπὸς ἄρα ὁ ΥΧΦ γνώμων λοιπῷ τῷ Γ ἴσος ἐστίν.",
    latin: "iam quoniam ΒΗ = Γ + ΚΜ, quorum ΗΠ = ΚΜ, erit etiam ΥΧΦ = Γ.",
    english:
      "Since BH is equal to Γ and KM together, and of these HΠ is equal to KM, the remaining gnomon YXΦ is therefore equal to the remaining Γ.",
    note: "Subtract equal regions from equal totals. Euclid then uses equal complements to turn this gnomon into the required parallelogram. The Latin compresses the relation into equations; the Greek keeps ‘remaining’ twice. The companion I.43/II.5 workshop operates that earlier argument.",
    words: [
      [
        "λοιπὸς … λοιπῷ",
        "erit etiam",
        "remaining … to the remaining; the explicit remainder wording is compressed in the Latin equation",
      ],
      [
        "γνώμων",
        "ΥΧΦ",
        "gnomon, the L-shaped region; the Latin here uses only its three-letter name",
      ],
    ],
  },
  {
    title: "Change one word: exceed",
    location: "VI.29 · opening problem",
    pages: [166, 167],
    greek:
      "Παρὰ τὴν δοθεῖσαν εὐθεῖαν τῷ δοθέντι εὐθυγράμμῳ ἴσον παραλληλόγραμμον παραβαλεῖν ὑπερβάλλον εἴδει παραλληλογράμμῳ ὁμοίῳ τῷ δοθέντι.",
    latin:
      "Datae rectae datae figurae rectilineae aequale parallelogrammum adplicare excedens figura parallelogramma simili datae.",
    english:
      "To apply to the given straight line a parallelogram equal to the given rectilinear figure, exceeding it by a parallelogram similar to the given one.",
    note: "Compare ὑπερβάλλον / excedens with ἐλλεῖπον / deficiens in VI.28. The beyond-end region is now part of the applied area. For target 45 the falling-short family has no fit, but the exceeding family fits at t = 3: (12 + 3) × 3 = 45. Changing the mode changes the problem’s geometric condition.",
    words: [
      [
        "ὑπερβάλλον",
        "excedens",
        "exceeding, extending beyond; a different participle changes the construction",
      ],
      [
        "ὁμοίῳ τῷ δοθέντι",
        "simili datae",
        "similar to the given one; the requirement on shape remains",
      ],
    ],
  },
  {
    title: "Use the sum instead of the difference",
    location: "VI.29 · construction on the half",
    pages: [168, 169],
    greek:
      "Τετμήσθω ἡ ΑΒ δίχα κατὰ τὸ Ε, καὶ ἀναγεγράφθω ἀπὸ τῆς ΕΒ τῷ Δ ὅμοιον καὶ ὁμοίως κείμενον παραλληλόγραμμον τὸ ΒΖ, καὶ συναμφοτέροις μὲν τοῖς ΒΖ, Γ ἴσον, τῷ δὲ Δ ὅμοιον καὶ ὁμοίως κείμενον τὸ αὐτὸ συνεστάτω τὸ ΗΘ.",
    latin:
      "secetur ΑΒ in duas partes aequales in puncto Ε, et in ΕΒ figurae Δ simile et similiter positum construatur parallelogrammum ΒΖ, et ΒΖ + Γ magnitudini aequale, parallelogrammo Δ autem simile et similiter positum idem construatur ΗΘ.",
    english:
      "Bisect AB at E, and on EB construct BZ similar and similarly placed to Δ; construct HΘ equal to BZ and Γ together, and at the same time similar and similarly placed to Δ.",
    note: "Both constructions begin with the half-line. VI.28 constructs an area difference; VI.29 constructs a sum. Our corresponding normalized identity is (t + a/2)² = a²/4 + c/k. The right side is positive for every positive target; the positive solution has no counterpart to VI.28’s area ceiling.",
    words: [
      ["δίχα", "in duas partes aequales", "in two equal parts; bisect the line"],
      [
        "συναμφοτέροις",
        "ΒΖ + Γ magnitudini",
        "to both together; the Latin writes the sum explicitly",
      ],
    ],
  },
  {
    title: "Subtract what is common",
    location: "VI.29 · the gnomon remainder",
    pages: [168, 169],
    greek: "κοινὸν ἀφῃρήσθω τὸ ΕΛ· λοιπὸς ἄρα ὁ ΨΧΦ γνώμων τῷ Γ ἐστιν ἴσος.",
    latin: "subtrahatur, quod commune est, ΕΛ. itaque est ΨΧΦ = Γ.",
    english: "Subtract the common EΛ; the remaining gnomon ΨXΦ is therefore equal to Γ.",
    note: "ἀφῃρήσθω and subtrahatur direct the subtraction. The source then uses equal complements and adds a common region to obtain the applied parallelogram. An algebraic positive root models the resulting relation; finding it numerically does not perform every construction in Euclid’s proof.",
    words: [
      ["κοινόν", "quod commune est", "what is common to the two totals"],
      ["ἀφῃρήσθω", "subtrahatur", "let it be subtracted; a passive construction command"],
    ],
  },
];
