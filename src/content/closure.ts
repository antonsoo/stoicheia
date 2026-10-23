export const closureSteps = [
  "Take three lengths",
  "Lay them on a line",
  "Circle at Ζ",
  "Circle at Η",
  "Join the crossings",
];
export const closureTitles = {
  crossing: "Two crossings. A triangle on either side.",
  "external-tangent": "One touch. No triangle.",
  "internal-tangent": "One touch inside. Still no triangle.",
  separate: "The circles cannot reach each other.",
  contained: "One circle cannot reach out of the other.",
};
export const closureExplanations = {
  crossing:
    "All three strict inequalities hold. Each crossing supplies the two radii and the base; reflecting the vertex keeps the same three lengths.",
  "external-tangent":
    "Α + Γ equals Β. The radii reach exactly across the base. The only meeting point lies on the line of centres: the height and area are zero.",
  "internal-tangent":
    "The larger radius equals the base plus the smaller radius. The circles meet on the line of centres, outside the base segment. Three collinear points do not make a triangle.",
  separate:
    "Α + Γ is shorter than Β. Even stretched directly towards one another, the two radii leave a gap. There is no common point to join.",
  contained:
    "The larger radius exceeds the base plus the smaller radius. One circumference lies wholly inside the other, without touching. Checking only Α + Γ > Β would miss this failure.",
};
export interface ClosurePassage {
  title: string;
  grc: string;
  lat: string;
  en: string;
  greekPages: number[];
  latinPages: number[];
  stage: number;
  note: string;
  reason: string;
}
export const closurePassages: ClosurePassage[] = [
  {
    title: "A construction, with a condition",
    stage: 0,
    grc: "Ἐκ τριῶν εὐθειῶν, αἵ εἰσιν ἴσαι τρισὶ ταῖς δοθείσαις [εὐθείαις], τρίγωνον συστήσασθαι· δεῖ δὲ τὰς δύο τῆς λοιπῆς μείζονας εἶναι πάντῃ μεταλαμβανομένας [διὰ τὸ καὶ παντὸς τριγώνου τὰς δύο πλευρὰς τῆς λοιπῆς μείζονας εἶναι πάντῃ μεταλαμβανομένας].",
    lat: "Ex tribus rectis, quae tribus datis aequales sunt, triangulum construere (oportet autem duas reliqua maiores esse quoquo modo coniunctas).",
    en: "To construct a triangle from three straight lines equal to three given [straight lines]. The two must be greater than the remaining one, however they are taken [because in every triangle, too, two sides are greater than the remaining side, however they are taken].",
    greekPages: [52],
    latinPages: [53],
    note: "συστήσασθαι / construere is an infinitive naming the task. δεῖ / oportet introduces a requirement. πάντῃ μεταλαμβανομένας / quoquo modo coniunctas means that every choice of two must be checked. Heiberg brackets the final Greek explanation; the Latin instead cites I.20 in an inline reference, omitted here.",
    reason:
      "I.20 proves the requirement for an existing triangle. I.22 now attempts the converse task: construct a triangle from lengths that meet that requirement.",
  },
  {
    title: "Check all three pairings",
    stage: 0,
    grc: "Ἔστωσαν αἱ δοθεῖσαι τρεῖς εὐθεῖαι αἱ Α, Β, Γ, ὧν αἱ δύο τῆς λοιπῆς μείζονες ἔστωσαν πάντῃ μεταλαμβανόμεναι, αἱ μὲν Α, Β τῆς Γ, αἱ δὲ Α, Γ τῆς Β, καὶ ἔτι αἱ Β, Γ τῆς Α· δεῖ δὴ ἐκ τῶν ἴσων ταῖς Α, Β, Γ τρίγωνον συστήσασθαι.",
    lat: "Sint tres datae rectae Α, Β, Γ, quarum duae reliqua maiores sint quoquo modo coniunctae, Α + Β > Γ, Α + Γ > Β, Β + Γ > Α. oportet igitur ex rectis aequalibus rectis Α, Β, Γ triangulum construere.",
    en: "Let Α, Β and Γ be the three given straight lines, and let any two be greater than the remaining one: Α and Β greater than Γ, Α and Γ greater than Β, and also Β and Γ greater than Α. We must construct a triangle from lines equal to Α, Β and Γ.",
    greekPages: [52],
    latinPages: [53],
    note: "ἔστωσαν / sint: ‘let them be’, plural. The genitive τῆς Γ follows the comparative μείζονες: ‘greater than Γ’. Here Α, Β and Γ name whole lengths, not the vertices of a triangle.",
    reason:
      "The givens include three strict inequalities. The experiments deliberately allow failures, but Euclid's proof below applies only while all three hold.",
  },
  {
    title: "Place the lengths consecutively",
    stage: 1,
    grc: "Ἐκκείσθω τις εὐθεῖα ἡ ΔΕ πεπερασμένη μὲν κατὰ τὸ Δ ἄπειρος δὲ κατὰ τὸ Ε, καὶ κείσθω τῇ μὲν Α ἴση ἡ ΔΖ, τῇ δὲ Β ἴση ἡ ΖΗ, τῇ δὲ Γ ἴση ἡ ΗΘ.",
    lat: "sumatur recta ΔΕ terminata in Δ, uersus Ε autem infinita, et ponatur ΔΖ = Α, ΖΗ = Β, ΗΘ = Γ.",
    en: "Set out a straight line ΔΕ, ending at Δ and extending without end towards Ε. Place ΔΖ equal to Α, ΖΗ equal to Β, and ΗΘ equal to Γ.",
    greekPages: [52, 54],
    latinPages: [53, 55],
    note: "πεπερασμένη μὲν … ἄπειρος δὲ contrasts an endpoint on one side with no endpoint on the other. κείσθω / ponatur commands the placement. The line on the screen is necessarily only a finite part of that ray.",
    reason:
      "The preceding length-transfer and cut-off constructions (I.2–3) supply the three copies. These are reused results, not a new permission to carry an arbitrary compass opening. ΖΗ, the middle copy, becomes the base.",
  },
  {
    title: "Draw the first circle",
    stage: 2,
    grc: "καὶ κέντρῳ μὲν τῷ Ζ, διαστήματι δὲ τῷ ΖΔ κύκλος γεγράφθω ὁ ΔΚΛ·",
    lat: "et centro Ζ radio autem ΖΔ circulus describatur ΔΚΛ.",
    en: "With centre Ζ and distance ΖΔ, let the circle ΔΚΛ be drawn.",
    greekPages: [54],
    latinPages: [55],
    note: "κέντρῳ … διαστήματι are datives specifying centre and distance; Latin uses centro … radio. γεγράφθω is a perfect passive imperative: ‘let it have been drawn’. Κ and Λ name the crossings anticipated in the successful construction.",
    reason:
      "Postulate 3 supplies the circle at an available centre through an available point. Every point of this circumference is the required distance Α from Ζ.",
  },
  {
    title: "Draw the second; join at Κ",
    stage: 4,
    grc: "πάλιν κέντρῳ μὲν τῷ Η, διαστήματι δὲ τῷ ΗΘ κύκλος γεγράφθω ὁ ΚΛΘ, καὶ ἐπεζεύχθωσαν αἱ ΚΖ, ΚΗ· λέγω, ὅτι ἐκ τριῶν εὐθειῶν τῶν ἴσων ταῖς Α, Β, Γ τρίγωνον συνέσταται τὸ ΚΖΗ.",
    lat: "rursus centro Η radio autem ΗΘ circulus describatur ΚΛΘ, et ducantur ΚΖ, ΚΗ. dico, ex tribus rectis aequalibus rectis Α, Β, Γ triangulum constructum esse ΚΖΗ.",
    en: "Again, with centre Η and distance ΗΘ, let the circle ΚΛΘ be drawn, and join ΚΖ and ΚΗ. I say that triangle ΚΖΗ has been constructed from three straight lines equal to Α, Β and Γ.",
    greekPages: [54],
    latinPages: [55],
    note: "πάλιν / rursus repeats the operation with another centre. ἐπεζεύχθωσαν / ducantur is plural: two lines are to be joined. συνέσταται says that the triangle has now been constructed. The interface separates drawing the second circle from joining the vertex.",
    reason:
      "Euclid proceeds directly to joining Κ. The existence of the common point needs justification beyond merely drawing two circles. The modern inequality and coordinate explanation below supplies a model, not a missing sentence in the ancient proof.",
  },
  {
    title: "The first radius supplies Α",
    stage: 4,
    grc: "Ἐπεὶ γὰρ τὸ Ζ σημεῖον κέντρον ἐστὶ τοῦ ΔΚΛ κύκλου, ἴση ἐστὶν ἡ ΖΔ τῇ ΖΚ· ἀλλὰ ἡ ΖΔ τῇ Α ἐστιν ἴση· καὶ ἡ ΚΖ ἄρα τῇ Α ἐστιν ἴση.",
    lat: "nam quoniam Ζ punctum centrum est circuli ΔΚΛ, erit ΖΔ = ΖΚ; uerum ΖΔ = Α; quare etiam ΚΖ = Α.",
    en: "Since point Ζ is the centre of circle ΔΚΛ, ΖΔ equals ΖΚ. But ΖΔ equals Α; therefore ΚΖ also equals Α.",
    greekPages: [54],
    latinPages: [55],
    note: "ἐπεὶ γάρ / nam quoniam begins the reason. ἀλλά / uerum supplies the previously established equality. ἄρα / quare signals the conclusion obtained by connecting them.",
    reason:
      "Radii of one circle are equal (definition 15 in this course). Common notion 1 carries the equality through the copied length ΖΔ. A measurement is a check of this drawing, not Euclid's reason.",
  },
  {
    title: "The other radius supplies Γ",
    stage: 4,
    grc: "πάλιν, ἐπεὶ τὸ Η σημεῖον κέντρον ἐστὶ τοῦ ΛΚΘ κύκλου, ἴση ἐστὶν ἡ ΗΘ τῇ ΗΚ· ἀλλὰ ἡ ΗΘ τῇ Γ ἐστιν ἴση· καὶ ἡ ΚΗ ἄρα τῇ Γ ἐστιν ἴση.",
    lat: "rursus quoniam Η punctum centrum est circuli ΛΚΘ, erit ΗΘ = ΗΚ; uerum ΗΘ = Γ; quare etiam ΚΗ = Γ.",
    en: "Again, since point Η is the centre of circle ΛΚΘ, ΗΘ equals ΗΚ. But ΗΘ equals Γ; therefore ΚΗ also equals Γ.",
    greekPages: [54],
    latinPages: [55],
    note: "The same reasoning returns with Η as centre and Γ as the given length. The circle is named ΛΚΘ here, rather than ΚΛΘ as in the construction; the transcription retains that change of order.",
    reason:
      "The second circumference certifies the second copied radius. A point on the first circle alone is not enough: this same Κ must also lie on the circle at Η.",
  },
  {
    title: "Keep the middle copy as the base",
    stage: 4,
    grc: "ἐστὶ δὲ καὶ ἡ ΖΗ τῇ Β ἴση· αἱ τρεῖς ἄρα εὐθεῖαι αἱ ΚΖ, ΖΗ, ΗΚ τρισὶ ταῖς Α, Β, Γ ἴσαι εἰσίν.",
    lat: "et praeterea ΖΗ = Β. itaque tres rectae ΚΖ, ΖΗ, ΗΚ tribus Α, Β, Γ aequales sunt.",
    en: "And ΖΗ also equals Β. The three straight lines ΚΖ, ΖΗ and ΗΚ therefore equal the three Α, Β and Γ.",
    greekPages: [54],
    latinPages: [55],
    note: "τρεῖς is nominative, the three lines being discussed; τρισί is dative, the three lengths to which they are equal. The Latin likewise contrasts tres and tribus.",
    reason:
      "ΖΗ was copied before either circle was drawn. The two circles supply the other two sides; they do not change the base to make the triangle fit.",
  },
  {
    title: "What was required to be made",
    stage: 4,
    grc: "Ἐκ τριῶν ἄρα εὐθειῶν τῶν ΚΖ, ΖΗ, ΗΚ, αἵ εἰσιν ἴσαι τρισὶ ταῖς δοθείσαις εὐθείαις ταῖς Α, Β, Γ, τρίγωνον συνέσταται τὸ ΚΖΗ· ὅπερ ἔδει ποιῆσαι.",
    lat: "Ergo ex tribus rectis ΚΖ, ΖΗ, ΗΚ, quae tribus datis rectis Α, Β, Γ aequales sunt, triangulus constructus est ΚΖΗ; quod oportebat fieri.",
    en: "Thus triangle ΚΖΗ has been constructed from the three straight lines ΚΖ, ΖΗ and ΗΚ, equal to the three given straight lines Α, Β and Γ: which was required to be made.",
    greekPages: [54],
    latinPages: [55],
    note: "ὅπερ ἔδει ποιῆσαι / quod oportebat fieri closes a construction. Compare ὅπερ ἔδει δεῖξαι, ‘what was required to be shown’, at the end of I.20's theorem.",
    reason:
      "The conclusion belongs to the successful case with the original three strict inequalities. At a tangent there is only a straight configuration; when the circles miss, there is no common vertex at all.",
  },
];

export const closureQuestions = [
  {
    prompt: "Α = 10, Β = 6, Γ = 4. Α + Γ > Β holds. Can the triangle be constructed?",
    options: [
      "Yes: the two radii exceed the base.",
      "No: Β + Γ = Α, so the internal touch is collinear.",
      "Yes: one meeting point is enough.",
    ],
    correct: 1,
    explanation:
      "All three pairings must be strict. Here the second and third lengths only equal the first. The internal tangency has zero height.",
  },
  {
    prompt: "Why does Euclid place ΔΖ, ΖΗ and ΗΘ before drawing the circles?",
    options: [
      "To add all three lengths into a triangle's base.",
      "To choose a convenient angle in degrees.",
      "To put the copied radii at their centres, with the middle length as base.",
    ],
    correct: 2,
    explanation:
      "ΖΔ supplies the first radius and ΗΘ the second. ΖΗ stays equal to Β. Earlier length constructions justify these copies.",
  },
  {
    prompt: "What does πάντῃ μεταλαμβανομένας require here?",
    options: [
      "Every choice of two lengths exceeds the remaining one.",
      "Only the two lengths used as circle radii must be added.",
      "All three lengths must be equal.",
    ],
    correct: 0,
    explanation:
      "The following sentence spells out all three pairings. The Latin quoquo modo coniunctas carries the same requirement.",
  },
];
