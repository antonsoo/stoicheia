export interface MeasurePassage {
  title: string;
  location: string;
  greek: string;
  latin: string;
  english: string;
  word: string;
  note: string;
  pages: readonly [number, number];
}
export const measurePassages: readonly MeasurePassage[] = [
  {
    title: "One measure for both",
    location: "X · first definitions · 1",
    greek:
      "Σύμμετρα μεγέθη λέγεται τὰ τῷ αὐτῷ μέτρῳ μετρούμενα, ἀσύμμετρα δέ, ὧν μηδὲν ἐνδέχεται κοινὸν μέτρον γενέσθαι.",
    latin:
      "Magnitudines commensurabiles uocantur, quas eadem mensura metiri licet, incommensurabiles autem, quarum communis mensura inueniri nequit.",
    english:
      "Magnitudes measured by the same measure are called commensurable; those for which no common measure can exist are called incommensurable.",
    word: "σύμμετρα · commensurabiles · sharing a measure",
    note: "τῷ αὐτῷ μέτρῳ is dative: ‘by the same measure’. μετρούμενα is passive: ‘being measured’. For these lengths, a measure fits a whole number of times, with no remainder. The starting unit need not itself be that measure.",
    pages: [2, 3],
  },
  {
    title: "A different question about squares",
    location: "X · first definitions · 2, opening clause",
    greek: "Εὐθεῖαι δυνάμει σύμμετροί εἰσιν, ὅταν τὰ ἀπ’ αὐτῶν τετράγωνα τῷ αὐτῷ χωρίῳ μετρῆται",
    latin: "Rectae potentia commensurabiles sunt, ubi quadrata earum eadem mensura metiri licet",
    english:
      "Straight lines are commensurable in square when the squares on them are measured by the same area.",
    word: "δυνάμει · potentia · in square",
    note: "In this definition, δύναμις concerns the square on a line. The diagonal and side of a square have no common length measure, yet their squares have areas 2 and 1 in side-square units. Do not carry the conclusion about lengths over to areas. A further word trap appears in definition 3 on the same pages: ῥητή / rationalis includes a line commensurable only in square with the chosen reference. Thus the diagonal can be ‘rational’ in that Book X classification while √2 is not a rational number in modern usage.",
    pages: [2, 3],
  },
  {
    title: "Keep subtracting in turn",
    location: "X.2 · hypothesis, first clause",
    greek: "Ἐὰν δύο μεγεθῶν [ἐκκειμένων] ἀνίσων ἀνθυφαιρουμένου ἀεὶ τοῦ ἐλάσσονος ἀπὸ τοῦ μείζονος",
    latin: "Si ex duabus magnitudinibus inaequalibus minore semper uicissim a maiore subtracta",
    english:
      "If, for two unequal magnitudes [set out], the smaller is always subtracted in turn from the greater…",
    word: "ἀνθυφαιρουμένου · uicissim … subtracta · being subtracted in turn",
    note: "The Greek uses a genitive absolute. ἐλάσσονος and μείζονος mean ‘smaller’ and ‘greater’; their roles change after the turn. Latin uicissim means ‘in turn’. The brackets around ἐκκειμένων belong to Heiberg’s edition; they are not an extra condition added by this app.",
    pages: [6, 7],
  },
  {
    title: "Never means never",
    location: "X.2 · hypothesis and conclusion",
    greek: "τὸ καταλειπόμενον μηδέποτε καταμετρῇ τὸ πρὸ ἑαυτοῦ, ἀσύμμετρα ἔσται τὰ μεγέθη.",
    latin:
      "reliquum nunquam praecedentem magnitudinem metitur, magnitudines incommensurabiles erunt.",
    english:
      "…what remains never measures the magnitude before it, then the magnitudes will be incommensurable.",
    word: "μηδέποτε · nunquam · never",
    note: "This is a condition on the entire process, not ‘not yet after twenty-four stages’. καταμετρῇ means measures exactly. A finite run can find a final measure; an unfinished run alone cannot establish that there is none.",
    pages: [6, 7],
  },
  {
    title: "Suppose there were a measure",
    location: "X.2 · beginning of the contradiction",
    greek: "Εἰ γάρ ἐστι σύμμετρα, μετρήσει τι αὐτὰ μέγεθος.",
    latin: "Nam si commensurabiles sunt, magnitudo aliqua eas metietur.",
    english: "For if they are commensurable, some magnitude will measure them.",
    word: "μετρήσει · metietur · will measure",
    note: "The proof temporarily assumes a common measure, named Ε in the next sentence. It does not assign Ε a numerical size. If Ε measures both lengths, it also measures any whole-number multiple and the remainder after subtracting one.",
    pages: [6, 7],
  },
  {
    title: "Smaller than the supposed measure",
    location: "X.2 · continued subtraction",
    greek: "καὶ τοῦτο ἀεὶ γινέσθω, ἕως οὗ λειφθῇ τι μέγεθος, ὅ ἐστιν ἔλασσον τοῦ Ε.",
    latin: "et hoc semper fiat, donec relinquatur magnitudo minor magnitudine Ε.",
    english: "And let this keep happening until some magnitude is left that is smaller than Ε.",
    word: "ἕως οὗ · donec · until",
    note: "This supplies the size comparison needed by the contradiction. In our modern grouped divisions, every nonzero remainder is less than half the larger input: either the smaller input is at most half, or one subtraction already passes half. Repeated turns therefore fall below any supposed positive Ε. This explanation expands a step of the printed argument.",
    pages: [8, 9],
  },
  {
    title: "The greater cannot measure the less",
    location: "X.2 · contradiction",
    greek: "καὶ λοιπὸν ἄρα τὸ ΑΗ μετρήσει, τὸ μεῖζον τὸ ἔλασσον· ὅπερ ἐστὶν ἀδύνατον.",
    latin: "quare etiam reliquam ΑΗ metietur, maior minorem: quod fieri non potest.",
    english:
      "So it will also measure the remainder ΑΗ—the greater measuring the less—which is impossible.",
    word: "ἀδύνατον · fieri non potest · impossible",
    note: "The subject is still the supposed measure Ε, carried through the preceding subtractions. A positive length smaller than Ε cannot contain even one whole Ε. The drawing’s shrinking remainder illustrates the contradiction; its pixel size does not prove it.",
    pages: [8, 9],
  },
  {
    title: "No common measure",
    location: "X.2 · conclusion",
    greek: "οὐκ ἄρα τὰ ΑΒ, ΓΔ μεγέθη μετρήσει τι μέγεθος· ἀσύμμετρα ἄρα ἐστὶ τὰ ΑΒ, ΓΔ μεγέθη.",
    latin:
      "itaque magnitudines ΑΒ, ΓΔ nulla magnitudo metietur. ergo magnitudines ΑΒ, ΓΔ incommensurabiles erunt [def. 1].",
    english:
      "Therefore no magnitude will measure the magnitudes ΑΒ and ΓΔ; therefore ΑΒ and ΓΔ are incommensurable.",
    word: "ἄρα · ergo · therefore",
    note: "The conclusion returns to the first definition. A display reading 0.000000 is not this conclusion: the remainder may be positive. The exact record keeps symbolic lengths separate from rounded decimal readings.",
    pages: [8, 9],
  },
  {
    title: "When the process does stop",
    location: "X.3 · problem statement",
    greek: "Δύο μεγεθῶν συμμέτρων δοθέντων τὸ μέγιστον αὐτῶν κοινὸν μέτρον εὑρεῖν.",
    latin:
      "Datis duabus magnitudinibus commensurabilibus maximam earum mensuram communem inuenire.",
    english: "Given two commensurable magnitudes, to find their greatest common measure.",
    word: "μέγιστον · maximam · greatest",
    note: "δοθέντων says ‘given’; εὑρεῖν is an infinitive stating the task. The last nonzero remainder measures every preceding length by working backward. Any other common measure must measure each remainder and hence the last one, so it cannot be greater. The complete printed proof continues through pp.10–13.",
    pages: [8, 9],
  },
  {
    title: "Read the definition again, at the end",
    location: "X · first definitions · 1, final clause",
    greek: "ἀσύμμετρα δέ, ὧν μηδὲν ἐνδέχεται κοινὸν μέτρον γενέσθαι.",
    latin: "incommensurabiles autem, quarum communis mensura inueniri nequit.",
    english: "And incommensurable are those for which no common measure can exist.",
    word: "κοινόν · communis · common",
    note: "‘No common measure’ does not mean ‘no length’, ‘unmeasurable with a ruler’, or ‘not a real number’. In this workshop the diagonal has a definite length; what fails is a shared unit that fits both it and the side an exact whole number of times.",
    pages: [2, 3],
  },
];

export const measureBoundary =
  "The printed X.2 concerns two magnitudes in general. The square diagonal, the rational examples, normalized magnifier, symbolic √2 notation and self-similarity specialization below are modern teaching choices. No discovery story or ancient use of these numerical examples is claimed. Heiberg’s Latin is an 1886 translation, not an ancient witness. English and grammar notes are new reading aids.";
