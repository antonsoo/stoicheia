export const primeSourceUrl =
  "https://archive.org/download/euclidisoperaomn02eucluoft/euclidisoperaomn02eucluoft.pdf";
export const primeBoundary =
  "Euclid IX.20, VII definitions 1–2 and selected clauses of VII.31, in Heiberg’s 1884 Greek edition and nineteenth-century Latin translation. English, numerical examples, division ledger, trial search and descent controls are new teaching work. The bounded computation illustrates cases; the argument for any given finite list is a separate reason.";
export interface PrimePassage {
  title: string;
  location: string;
  greek: string;
  latin: string;
  english: string;
  note: string;
  pages: readonly [number, number];
  latinEnd?: number;
  word: string;
  counterpart: string;
  meaning: string;
}
export const primePassages: readonly PrimePassage[] = [
  {
    title: "More than the given multitude",
    location: "IX.20 · statement and givens",
    greek:
      "Οἱ πρῶτοι ἀριθμοὶ πλείους εἰσὶ παντὸς τοῦ προτεθέντος πλήθους πρώτων ἀριθμῶν. Ἔστωσαν οἱ προτεθέντες πρῶτοι ἀριθμοὶ οἱ Α, Β, Γ· λέγω, ὅτι τῶν Α, Β, Γ πλείους εἰσὶ πρῶτοι ἀριθμοί.",
    latin:
      "Primi numeri plures sunt quauis data multitudine primorum numerorum. Sint dati numeri primi Α, Β, Γ. dico, plures esse primos numeros quam Α, Β, Γ.",
    english:
      "There are more prime numbers than any given multitude of prime numbers. Let the given primes be A, B, Γ. I say that there are more primes than A, B, Γ.",
    note: "The comparison is about how many primes, not about making the next prime larger than every given one. The printed proof names three givens. The modern bench accepts up to twelve; the same divisibility reason applies to any nonempty finite list. That extension is explained below, rather than inferred from the app’s finite limit.",
    pages: [388, 389],
    word: "πλείους",
    counterpart: "plures",
    meaning:
      "more in number; not ‘larger in value’. The genitive τῶν Α, Β, Γ supplies the comparison.",
  },
  {
    title: "Take the least common multiple, then a unit",
    location: "IX.20 · construction",
    greek:
      "Εἰλήφθω γὰρ ὁ ὑπὸ τῶν Α, Β, Γ ἐλάχιστος μετρούμενος καὶ ἔστω ὁ ΔΕ, καὶ προσκείσθω τῷ ΔΕ μονὰς ἡ ΔΖ.",
    latin:
      "sumatur enim, quem minimum metiuntur Α, Β, Γ, et sit ΔΕ, et numero ΔΕ adiiciatur unitas ΔΖ.",
    english:
      "Take the least number measured by A, B, Γ, and let it be ΔE; let the unit ΔZ be added to ΔE.",
    note: "‘Measured by’ means divisible by, without a remainder. The source takes a least common multiple, citing VII.36 in the Latin edition. For distinct primes this equals their product, our M. Any common multiple would suffice for the contradiction. The product formula, equals sign and letter M are modern aids. On p.389 the printed line orders Δ–E–Z, although the text names ΔZ as the unit and EZ as the sum; the bench does not copy that endpoint order.",
    pages: [388, 389],
    word: "ἐλάχιστος μετρούμενος",
    counterpart: "quem minimum metiuntur",
    meaning:
      "the least [number] measured [by them]; minimum is a common multiple, not a new prime.",
  },
  {
    title: "Either prime, or not",
    location: "IX.20 · the two branches",
    greek:
      "ὁ δὴ ΕΖ ἤτοι πρῶτός ἐστιν ἢ οὔ. ἔστω πρότερον πρῶτος· εὑρημένοι ἄρα εἰσὶ πρῶτοι ἀριθμοὶ οἱ Α, Β, Γ, ΕΖ πλείους τῶν Α, Β, Γ.",
    latin:
      "ΕΖ igitur aut primus est aut non primus. prius sit primus. ergo inuenti sunt primi numeri Α, Β, Γ, ΕΖ plures numeris Α, Β, Γ.",
    english:
      "The number EZ is therefore either prime or not. First suppose it prime: then the primes A, B, Γ, EZ have been found, more than A, B, Γ.",
    note: "Greek begins on p.388 and continues on p.390; the Latin crosses pp.389–391. This is a case distinction, not a claim that adding a unit always produces a prime. On the bench N = M + 1 is EZ. If N is prime it supplies the additional prime itself.",
    pages: [388, 389],
    latinEnd: 391,
    word: "ἤτοι … ἢ οὔ",
    counterpart: "aut … aut non",
    meaning:
      "either … or not. Both possibilities belong to the proof. Greek πρῶτος literally has the sense ‘first’, here ‘prime’.",
  },
  {
    title: "Suppose it is not prime",
    location: "IX.20 · the composite branch",
    greek:
      "Ἀλλὰ δὴ μὴ ἔστω ὁ ΕΖ πρῶτος· ὑπὸ πρώτου ἄρα τινὸς ἀριθμοῦ μετρεῖται. μετρείσθω ὑπὸ πρώτου τοῦ Η· λέγω, ὅτι ὁ Η οὐδενὶ τῶν Α, Β, Γ ἐστιν ὁ αὐτός.",
    latin:
      "uerum ne sit ΕΖ primus. itaque primus aliquis numerus eum metitur. metiatur primus numerus Η. dico, numerum Η nulli numerorum Α, Β, Γ aequalem esse.",
    english:
      "Now suppose EZ is not prime. It is therefore measured by some prime number. Let the prime H measure it. I say that H is the same as none of A, B, Γ.",
    note: "VII.31 supplies the existence of a prime divisor. It does not depend on the trial search in this app. For the opening six-prime list, 30031 = 59 × 509. Either proven prime factor supplies H. The sum itself need not be prime, and you do not need a complete factorization to obtain one prime divisor.",
    pages: [390, 391],
    word: "μετρεῖται / μετρείσθω",
    counterpart: "metitur / metiatur",
    meaning:
      "is measured / let it be measured. The Greek passive construction puts the measured number first; Latin makes the prime the measuring subject.",
  },
  {
    title: "Assume that divisor was already given",
    location: "IX.20 · temporary assumption",
    greek:
      "εἰ γὰρ δυνατόν, ἔστω. οἱ δὲ Α, Β, Γ τὸν ΔΕ μετροῦσιν· καὶ ὁ Η ἄρα τὸν ΔΕ μετρήσει. μετρεῖ δὲ καὶ τὸν ΕΖ·",
    latin:
      "nam si fieri potest, sit. uerum Α, Β, Γ numerum ΔΕ metiuntur. itaque etiam Η numerum ΔΕ metitur. uerum etiam numerum ΕΖ metitur.",
    english:
      "For if possible, let it be so. A, B, Γ measure ΔE; H will therefore measure ΔE too. But it also measures EZ.",
    note: "This is a temporary supposition: H equals one of the given primes. It is not an extra condition placed on H. In modern symbols H would divide both M and N. Subtracting two whole multiples of H leaves another whole multiple of H.",
    pages: [390, 391],
    word: "εἰ … δυνατόν",
    counterpart: "si fieri potest",
    meaning: "if it is possible; introduces the assumption that will be rejected.",
  },
  {
    title: "Then a number would measure the unit",
    location: "IX.20 · contradiction",
    greek:
      "καὶ λοιπὴν τὴν ΔΖ μονάδα μετρήσει ὁ Η ἀριθμὸς ὤν· ὅπερ ἄτοπον. οὐκ ἄρα ὁ Η ἑνὶ τῶν Α, Β, Γ ἐστιν ὁ αὐτός. καὶ ὑπόκειται πρῶτος.",
    latin:
      "quare etiam quae relinquitur, unitatem ΔΖ metietur Η, qui numerus est; quod absurdum est. ergo Η nulli numerum Α, Β, Γ aequalis est. et suppositum est, Η primum esse.",
    english:
      "It would therefore also measure the remaining unit ΔZ, though H is a number: which is impossible. H is therefore the same as none of A, B, Γ, and it was assumed prime.",
    note: "In this arithmetic, a number is a multitude of units (VII definition 2), distinct from the unit. H is at least two, so cannot divide one into a whole number of copies. Compare the exact remainder 1 in every ledger row. Heiberg’s printed Latin has ‘nulli numerum’ here; this selection retains that wording rather than silently rewriting it as ‘nulli numerorum’.",
    pages: [390, 391],
    word: "ἀριθμὸς ὤν",
    counterpart: "qui numerus est",
    meaning: "being a number; the distinction between number and unit is doing mathematical work.",
  },
  {
    title: "An additional prime has been found",
    location: "IX.20 · conclusion",
    greek:
      "εὑρημένοι ἄρα εἰσὶ πρῶτοι ἀριθμοὶ πλείους τοῦ προτεθέντος πλήθους τῶν Α, Β, Γ οἱ Α, Β, Γ, Η· ὅπερ ἔδει δεῖξαι.",
    latin:
      "ergo inuenti sunt primi numeri Α, Β, Γ, Η plures data multitudine Α, Β, Γ; quod erat demonstrandum.",
    english:
      "The primes A, B, Γ, H have therefore been found, more than the given multitude A, B, Γ: which was to be shown.",
    note: "Neither branch needs H to be the next prime in numerical order. With givens 3, 5, 7 the sum 106 has prime divisor 2, smaller than all three givens. A finite list cannot be the complete collection: the argument always supplies an additional prime outside it. Repeating a few numerical examples illustrates this reason but does not prove it by enumeration.",
    pages: [390, 391],
    word: "εὑρημένοι",
    counterpart: "inuenti",
    meaning:
      "having been found; a completed result in either branch, without a promise of a fast factoring algorithm.",
  },
  {
    title: "The unit",
    location: "VII · definition 1",
    greek: "Μονάς ἐστιν, καθ’ ἣν ἕκαστον τῶν ὄντων ἓν λέγεται.",
    latin: "Unitas est ea, secundum quam unaquaeque res una nominatur.",
    english: "A unit is that by virtue of which each existing thing is called one.",
    note: "This is Euclid’s definition of a unit, not a modern set-theoretic definition of 1. The bench writes the added unit as 1, while retaining the historical distinction needed in the contradiction.",
    pages: [184, 185],
    word: "μονάς / μονάδα",
    counterpart: "unitas / unitatem",
    meaning:
      "unit: nominative names it, accusative is used as the object of ‘will measure’ in IX.20.",
  },
  {
    title: "A number is a multitude of units",
    location: "VII · definition 2",
    greek: "Ἀριθμὸς δὲ τὸ ἐκ μονάδων συγκείμενον πλῆθος.",
    latin: "Numerus autem est multitudo ex unitatibus composita.",
    english: "A number is a multitude composed of units.",
    note: "Do not read this as a claim about every modern use of the word number. The source distinguishes the unit from a multitude. The given-prime controls require integers at least two; accepting 1 as a prime would destroy the ‘none of the givens divides N’ step, since 1 divides everything.",
    pages: [184, 185],
    word: "ἐκ μονάδων",
    counterpart: "ex unitatibus",
    meaning: "out of units; Greek ἐκ takes the genitive, Latin ex the ablative.",
  },
  {
    title: "Where does a prime divisor come from?",
    location: "VII.31 · statement",
    greek: "Ἅπας σύνθετος ἀριθμὸς ὑπὸ πρώτου τινὸς ἀριθμοῦ μετρεῖται.",
    latin: "Quemuis numerum compositum primus aliquis numerus metitur.",
    english: "Every composite number is measured by some prime number.",
    note: "The full printed proof is on pp.250–253. It repeatedly takes a divisor of a composite divisor; a divisor of a divisor also divides the original. The separate 2310 descent lets you choose such proper divisors. It does not require you to know which of them is prime before choosing.",
    pages: [250, 251],
    word: "σύνθετος",
    counterpart: "compositus",
    meaning: "composite, put together; the divisor chain eventually reaches a prime.",
  },
  {
    title: "A descent cannot continue forever",
    location: "VII.31 · selected impossibility clause",
    greek:
      "τὸν Α ἀριθμὸν ἄπειροι ἀριθμοί, ὧν ἕτερος ἑτέρου ἐλάσσων ἐστίν· ὅπερ ἐστὶν ἀδύνατον ἐν ἀριθμοῖς.",
    latin:
      "infiniti numeri numerum Α metientur, alter semper altero deinceps minores; quod in numeris fieri non potest.",
    english:
      "Infinitely many numbers would measure A, each successively smaller than another: which is impossible among numbers.",
    note: "The Greek selection starts in the middle of the sentence continuing from p.250; its introductory ‘would measure’ is there. This is a strict descent through whole numbers at least two. Below a fixed starting number only finitely many such numbers exist. If every chosen divisor were composite, you could descend again, so eventually one must be prime. This is an existence argument, not an assertion that our chosen search bound will find it.",
    pages: [252, 253],
    word: "ἐλάσσων",
    counterpart: "minores",
    meaning: "smaller; unlike πλείους in IX.20, this comparison is about numerical size.",
  },
];
