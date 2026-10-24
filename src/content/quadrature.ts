export interface AreaPassage {
  title: string;
  grc: string;
  lat: string;
  en: string;
  note: string;
  word: string;
  gloss: string;
  pages: readonly number[];
  stage: number;
}
export const areaPassages: readonly AreaPassage[] = [
  {
    title: "A square equal to a figure",
    grc: "Τῷ δοθέντι εὐθυγράμμῳ ἴσον τετράγωνον συστήσασθαι. Ἔστω τὸ δοθὲν εὐθύγραμμον τὸ Α· δεῖ δὴ τῷ Α εὐθυγράμμῳ ἴσον τετράγωνον συστήσασθαι.",
    lat: "Quadratum datae figurae rectilineae aequale construere. Sit data figura rectilinea Α. oportet igitur figurae rectilineae Α aequale quadratum construere.",
    en: "To construct a square equal to the given rectilinear figure. Let Α be the given rectilinear figure. We must therefore construct a square equal to the rectilinear figure Α.",
    word: "ἴσον · aequale",
    gloss: "equal — here, in area",
    note: "ἴσον agrees with τετράγωνον, ‘square’. The dative τῷ … εὐθυγράμμῳ names what it is equal to. Equal area does not require equal sides or the same shape. Α names a whole figure, not a point. Our workshop starts with a rectangle; the proposition's opening claim is more general.",
    pages: [160, 161],
    stage: 0,
  },
  {
    title: "An earlier construction supplies a rectangle",
    grc: "Συνεστάτω γὰρ τῷ Α εὐθυγράμμῳ ἴσον παραλληλόγραμμον ὀρθογώνιον τὸ ΒΔ·",
    lat: "construatur enim figurae rectilineae Α aequale parallelogrammum rectangulum ΒΔ.",
    en: "For let the rectangular parallelogram ΒΔ be constructed equal to the rectilinear figure Α.",
    word: "ὀρθογώνιον · rectangulum",
    gloss: "right-angled",
    note: "A parallelogram alone need not be a rectangle: ὀρθογώνιον adds the right-angle condition. Heiberg's Latin cites I.45 here. That earlier construction converts a rectilinear figure to an equal-area parallelogram at a specified angle. It is a prerequisite, not an operation carried out by this rectangle workshop. ΒΔ names the rectangle by opposite corners.",
    pages: [160, 161],
    stage: 0,
  },
  {
    title: "Already a square? Stop here",
    grc: "εἰ μὲν οὖν ἴση ἐστὶν ἡ ΒΕ τῇ ΕΔ, γεγονὸς ἂν εἴη τὸ ἐπιταχθέν. συνέσταται γὰρ τῷ Α εὐθυγράμμῳ ἴσον τετράγωνον τὸ ΒΔ· εἰ δὲ οὔ, μία τῶν ΒΕ, ΕΔ μείζων ἐστίν.",
    lat: "si igitur ΒΕ = ΕΔ, effectum erit, quod propositum erat. constructum enim est quadratum ΒΔ datae figurae rectilineae Α aequale. sin minus, alterutra rectarum ΒΕ, ΕΔ maior est.",
    en: "If ΒΕ equals ΕΔ, what was required would already be done: the square ΒΔ has been constructed equal to the rectilinear figure Α. If not, one of ΒΕ and ΕΔ is greater.",
    word: "εἰ μὲν … εἰ δὲ οὔ",
    gloss: "if … but if not",
    note: "The two conditions divide the argument. γεγονὸς ἂν εἴη uses a perfect participle with a potential optative: the task would stand accomplished. The semicircle is unnecessary when the given rectangle is a square. Choosing the larger side as ΒΕ fixes the orientation of the remaining construction.",
    pages: [160, 161],
    stage: 0,
  },
  {
    title: "Copy a side and bisect the whole",
    grc: "ἔστω μείζων ἡ ΒΕ, καὶ ἐκβεβλήσθω ἐπὶ τὸ Ζ, καὶ κείσθω τῇ ΕΔ ἴση ἡ ΕΖ, καὶ τετμήσθω ἡ ΒΖ δίχα κατὰ τὸ Η,",
    lat: "sit maior ΒΕ, et producatur ad Ζ, et ponatur ΕΖ = ΕΔ, et ΒΖ in Η in duas partes aequales secetur,",
    en: "Let ΒΕ be greater. Extend it to Ζ, set ΕΖ equal to ΕΔ, and bisect ΒΖ at Η.",
    word: "δίχα · in duas partes aequales",
    gloss: "into two equal parts",
    note: "The single adverb δίχα is expanded in the Latin. We bisect the whole ΒΖ, not the original side ΒΕ. Ε and Η are distinct cuts of the same line when the sides differ. Η is Greek eta: it is the centre label in this edition, not the English label H for the top of the semicircle.",
    pages: [160, 161],
    stage: 2,
  },
  {
    title: "Draw the semicircle and meet it",
    grc: "καὶ κέντρῳ τῷ Η, διαστήματι δὲ ἑνὶ τῶν ΗΒ, ΗΖ ἡμικύκλιον γεγράφθω τὸ ΒΘΖ, καὶ ἐκβεβλήσθω ἡ ΔΕ ἐπὶ τὸ Θ, καὶ ἐπεζεύχθω ἡ ΗΘ.",
    lat: "et centro Η radio autem alterutra rectarum ΗΒ, ΗΖ semicirculus describatur ΒΘΖ, et producatur ΔΕ ad Θ, et ducatur ΗΘ.",
    en: "With centre Η and radius either ΗΒ or ΗΖ, draw the semicircle ΒΘΖ. Extend ΔΕ to Θ, and join ΗΘ.",
    word: "κέντρῳ … διαστήματι",
    gloss: "with centre … with radius",
    note: "Both datives specify how to draw. ἑνὶ τῶν means ‘one of the’, because the two half-lengths are equal. ΔΕ continues through Ε into the semicircle. The rectangle supplies a right angle at Ε. The lengths and coordinate orientation shown here are modern choices.",
    pages: [160, 161],
    stage: 4,
  },
  {
    title: "The first account of one square",
    grc: "Ἐπεὶ οὖν εὐθεῖα ἡ ΒΖ τέτμηται εἰς μὲν ἴσα κατὰ τὸ Η, εἰς δὲ ἄνισα κατὰ τὸ Ε, τὸ ἄρα ὑπὸ τῶν ΒΕ, ΕΖ περιεχόμενον ὀρθογώνιον μετὰ τοῦ ἀπὸ τῆς ΕΗ τετραγώνου ἴσον ἐστὶ τῷ ἀπὸ τῆς ΗΖ τετραγώνῳ.",
    lat: "iam quoniam recta ΒΖ in partes aequales secta est in Η in inaequales autem in Ε, erunt ΒΕ × ΕΖ + ΕΗ² = ΗΖ².",
    en: "Since ΒΖ has been cut into equal parts at Η and unequal parts at Ε, the rectangle contained by ΒΕ and ΕΖ, together with the square on ΕΗ, equals the square on ΗΖ.",
    word: "μετὰ τοῦ … τετραγώνου",
    gloss: "together with the square",
    note: "μετά with the genitive adds a figure to the comparison. This is II.5, whose statement is available among the source pages. Heiberg compresses the Greek sentence into an equation in his Latin translation. The multiplication sign and squared notation belong to that nineteenth-century rendering; they are not printed in this Greek sentence.",
    pages: [160, 162, 161, 163],
    stage: 5,
  },
  {
    title: "Equal radii exchange the square",
    grc: "ἴση δὲ ἡ ΗΖ τῇ ΗΘ· τὸ ἄρα ὑπὸ τῶν ΒΕ, ΕΖ μετὰ τοῦ ἀπὸ τῆς ΗΕ ἴσον ἐστὶ τῷ ἀπὸ τῆς ΗΘ.",
    lat: "sed ΗΖ = ΗΘ. itaque ΒΕ × ΕΖ + ΗΕ² = ΗΘ².",
    en: "But ΗΖ equals ΗΘ. So the rectangle contained by ΒΕ and ΕΖ, together with the square on ΗΕ, equals the square on ΗΘ.",
    word: "τὸ ἀπὸ τῆς ΗΘ",
    gloss: "the [square] on ΗΘ",
    note: "The noun ‘square’ is understood after its earlier use. Both ΗΖ and ΗΘ run from the centre to the circle. Reversing ΕΗ to ΗΕ changes the order of the endpoints, not the segment or its square.",
    pages: [162, 163],
    stage: 5,
  },
  {
    title: "The second account of the same square",
    grc: "τῷ δὲ ἀπὸ τῆς ΗΘ ἴσα ἐστὶ τὰ ἀπὸ τῶν ΘΕ, ΕΗ τετράγωνα· τὸ ἄρα ὑπὸ τῶν ΒΕ, ΕΖ μετὰ τοῦ ἀπὸ ΗΕ ἴσα ἐστὶ τοῖς ἀπὸ τῶν ΘΕ, ΕΗ.",
    lat: "uerum ΘΕ² + ΕΗ² = ΗΘ². itaque ΒΕ × ΕΖ + ΗΕ² = ΘΕ² + ΕΗ².",
    en: "The squares on ΘΕ and ΕΗ equal the square on ΗΘ. Therefore the rectangle contained by ΒΕ and ΕΖ, together with the square on ΗΕ, equals the squares on ΘΕ and ΕΗ.",
    word: "τὰ … τετράγωνα",
    gloss: "the squares, taken together",
    note: "The plural names two squares whose combined area is compared with one. I.47 applies to the right triangle ΗΕΘ. It does not say that each of the smaller squares separately equals the square on the hypotenuse.",
    pages: [162, 163],
    stage: 5,
  },
  {
    title: "Remove what both sides have",
    grc: "κοινὸν ἀφῃρήσθω τὸ ἀπὸ τῆς ΗΕ τετράγωνον· λοιπὸν ἄρα τὸ ὑπὸ τῶν ΒΕ, ΕΖ περιεχόμενον ὀρθογώνιον ἴσον ἐστὶ τῷ ἀπὸ τῆς ΕΘ τετραγώνῳ.",
    lat: "subtrahatur, quod commune est, ΗΕ². itaque ΒΕ × ΕΖ = ΕΘ².",
    en: "Let the common square on ΗΕ be subtracted. The remaining rectangle contained by ΒΕ and ΕΖ therefore equals the square on ΕΘ.",
    word: "κοινὸν ἀφῃρήσθω",
    gloss: "let the common part be subtracted",
    note: "ἀφῃρήσθω is a third-person perfect passive imperative of ἀφαιρέω, ‘take away’. Latin subtrahatur is a passive subjunctive used as a command. The same area leaves both totals. This is an application of the common notion about subtracting equals from equals.",
    pages: [162, 163],
    stage: 5,
  },
  {
    title: "Return to the given figure",
    grc: "ἀλλὰ τὸ ὑπὸ τῶν ΒΕ, ΕΖ τὸ ΒΔ ἐστιν· ἴση γὰρ ἡ ΕΖ τῇ ΕΔ· τὸ ἄρα ΒΔ παραλληλόγραμμον ἴσον ἐστὶ τῷ ἀπὸ τῆς ΘΕ τετραγώνῳ. ἴσον δὲ τὸ ΒΔ τῷ Α εὐθυγράμμῳ. καὶ τὸ Α ἄρα εὐθύγραμμον ἴσον ἐστὶ τῷ ἀπὸ τῆς ΕΘ ἀναγραφησομένῳ τετραγώνῳ.",
    lat: "uerum ΒΕ × ΕΖ = ΒΔ; nam ΕΖ = ΕΔ. itaque ΒΔ = ΘΕ². sed ΒΔ = Α. itaque etiam figura rectilinea Α quadrato, quod in ΕΘ construi poterit, aequale est.",
    en: "But the rectangle contained by ΒΕ and ΕΖ is ΒΔ, because ΕΖ equals ΕΔ. Thus ΒΔ equals the square on ΘΕ. And ΒΔ equals the rectilinear figure Α. So Α also equals the square that can be drawn on ΕΘ.",
    word: "ἀναγραφησομένῳ",
    gloss: "that will be drawn",
    note: "This future passive participle agrees with τετραγώνῳ. The argument has found the side of the required square; actually drawing the square uses the earlier construction I.46. Latin ‘quod … construi poterit’ expresses what can be constructed. The final square on our plate makes this last operation visible.",
    pages: [162, 163],
    stage: 5,
  },
  {
    title: "The task has been accomplished",
    grc: "Τῷ ἄρα δοθέντι εὐθυγράμμῳ τῷ Α ἴσον τετράγωνον συνέσταται τὸ ἀπὸ τῆς ΕΘ ἀναγραφησόμενον· ὅπερ ἔδει ποιῆσαι.",
    lat: "Ergo datae figurae rectilineae Α aequale quadratum constructum est, id quod in ΕΘ describi poterit; quod oportebat fieri.",
    en: "A square equal to the given rectilinear figure Α has therefore been constructed: the one that can be drawn on ΕΘ. This is what had to be done.",
    word: "ὅπερ ἔδει ποιῆσαι",
    gloss: "which is what had to be done",
    note: "ποιῆσαι means ‘to do’ or ‘to make’. A construction ends with something made. A theorem commonly ends with δεῖξαι, ‘to show’. The opening infinitive συστήσασθαι sets the task; the perfect συνέσταται now presents the achieved result.",
    pages: [162, 163],
    stage: 5,
  },
];
export const areaStages = [
  "The given rectangle",
  "Copy the short side",
  "Bisect the whole",
  "Draw the semicircle",
  "Meet the circle",
  "Account for the area",
] as const;
export const areaQuestions = [
  {
    prompt: "In ‘ἴσον τετράγωνον’, what must be equal to the rectangle?",
    passage: 0,
    answers: ["The square's area", "The square's perimeter", "Every side of the square"],
    correct: 0,
    feedback:
      "Here equal figures have equal area. For a 9 by 4 rectangle, the 6 by 6 square has area 36, but its perimeter is 24 rather than 26.",
  },
  {
    prompt: "What does ‘τετμήσθω ἡ ΒΖ δίχα’ tell you to bisect?",
    passage: 3,
    answers: ["The original long side ΒΕ", "The extended whole ΒΖ", "The vertical side ΕΔ"],
    correct: 1,
    feedback:
      "ΒΖ includes both copied lengths. Its midpoint Η gives a radius equal to half their sum. Ε is the unequal division, not the midpoint.",
  },
  {
    prompt: "Why may the square on ΗΕ disappear from the last comparison?",
    passage: 8,
    answers: [
      "It becomes too small to measure",
      "Its side is zero in every rectangle",
      "The same area is subtracted from equal totals",
    ],
    correct: 2,
    feedback:
      "κοινὸν means common to both accounts. Subtracting that same square preserves equality, whatever its positive size. For equal input sides the earlier branch already finishes the construction.",
  },
  {
    prompt:
      "The Greek proof writes out an area comparison. Where do the compact squared formulas on the facing page come from?",
    passage: 5,
    answers: [
      "Heiberg's nineteenth-century Latin rendering",
      "The Greek sentence uses the same formulas",
      "A measurement made by this app",
    ],
    correct: 0,
    feedback:
      "Compare printed pages 162 and 163: the Latin translator renders the geometric comparisons as equations. The workshop's numbers are another, explicitly modern, explanatory layer.",
  },
] as const;
export const quadraturePages = [160, 161, 162, 163, 128, 129, 110, 111] as const;
