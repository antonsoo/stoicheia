import { closurePassages } from "./closure";
import type { Lesson, Reason, Step } from "./lessons";

const phase = (i: number): Step["phase"] =>
  i === 0 ? "Given" : i <= 3 ? "Construct" : i === 7 ? "Conclude" : "Prove";
export const copyingReasons: Record<string, Reason> = {
  ...Object.fromEntries(
    closurePassages.slice(1).map((p, i) => [
      `closureCourse${i}`,
      {
        title: p.title,
        text: p.reason,
        kind: i === 0 ? "given" : i <= 3 ? "construction" : "deduction",
        ...(i === 1 ? { lesson: 3 } : {}),
      } as Reason,
    ]),
  ),
  angleChoose: {
    title: "Postulate 1 · close the given angle into a triangle",
    kind: "construction",
    text: "Choose a positive distance on each ray of the given angle, then join those points. Their distances need not be equal. This auxiliary triangle supplies three lengths; its angle at Γ remains the given angle.",
  },
  angleConstruct: {
    title: "I.22 · construct a triangle from those three lengths",
    kind: "construction",
    lesson: 22,
    text: "The three lengths already form triangle ΔΓΕ, so I.20 supplies all three strict triangle inequalities. I.22 can therefore construct ΑΖΗ at the new point, with ΑΗ on the given ray. The construction places the second copied side, ΓΕ, along ΑΒ.",
  },
  angleCorrespond: {
    title: "Keep the three side correspondences in order",
    kind: "construction",
    lesson: 22,
    text: "ΓΔ is copied as ΑΖ, ΓΕ as ΑΗ, and ΔΕ as ΖΗ. The order identifies the corresponding vertices: Γ ↔ Α, Δ ↔ Ζ, Ε ↔ Η. The equal-side marks show this relation without treating a degree reading as the construction.",
  },
  angleSSS: {
    title: "I.8 · three sides determine the included angle",
    kind: "deduction",
    lesson: 8,
    text: "The two sides around Γ equal the two sides around Α, and their closing bases are also equal. I.8 proves the included angles equal. I.4 would require that angle equality as an input, so using it here would assume the desired conclusion.",
  },
  angleConclude: {
    title: "A new construction has been earned",
    kind: "deduction",
    text: "An angle equal to the given rectilinear angle has been made at the specified point on the given line. Earlier line-copy, triangle-construction and SSS results supplied the operation. A reflected triangle has the same angular magnitude; its orientation is a separate choice.",
  },
};
const first = closurePassages[0];
if (!first) throw new Error("Missing I.22 statement.");
export const copyingLessons: Record<22 | 23, Lesson> = {
  22: {
    id: 22,
    numeral: "I.22",
    greekNumeral: "κβʹ",
    title: "Construct a triangle from three lengths",
    shortTitle: "Three lengths, one triangle",
    introduction:
      "Lay three given lengths on a line. Two circles can supply a triangle—but every pair of lengths must exceed the remaining one. This construction will become I.23’s angle-copying tool.",
    statement: {
      grc: first.grc,
      lat: first.lat,
      en: first.en,
      greekPages: first.greekPages,
      latinPages: first.latinPages,
    },
    steps: closurePassages.slice(1).map((p, i) => ({
      title: p.title,
      phase: phase(i),
      reason: `closureCourse${i}`,
      grc: p.grc,
      lat: p.lat,
      en: p.en,
      greekPages: p.greekPages,
      latinPages: p.latinPages,
      language: p.note,
    })),
    insight: {
      title: "From a necessary condition to a usable construction",
      text: "I.20 established what the sides of an existing triangle must satisfy. I.22 now turns suitable lengths into a triangle. Try a limiting equality: a tangent point lies on the line of centres and does not make a genuine triangle. The separate I.22 workshop includes a trial hinge and exact tenths. Continue to I.23 to use this earned construction to copy an angle.",
      link: "https://mathcs.clarku.edu/~djoyce/elements/bookI/propI22.html",
    },
    question: {
      prompt: "Why must all three pairings be checked?",
      options: [
        "Checking only the sum of the circle radii misses internal tangency and containment.",
        "The three given lengths must all be equal.",
        "A single point of contact always produces a triangle.",
      ],
      correct: 0,
      explanations: [
        "Yes. The circles may lie inside one another even if their radii together exceed the base. The other strict comparisons rule out that failure.",
        "The sides may be unequal. The requirement concerns sums, not equality of all lengths.",
        "A tangent point is collinear with the centres. Its zero height does not supply a genuine triangle.",
      ],
    },
  },
  23: {
    id: 23,
    numeral: "I.23",
    greekNumeral: "κγʹ",
    title: "Copy an angle by constructing a triangle",
    shortTitle: "Copy the opening",
    introduction:
      "Choose any point on each side of the given angle. Copy the three sides of the resulting triangle at a new point. The side equalities then prove the angle equality, without using a protractor.",
    statement: {
      grc: "Πρὸς τῇ δοθείσῃ εὐθείᾳ καὶ τῷ πρὸς αὐτῇ σημείῳ τῇ δοθείσῃ γωνίᾳ εὐθυγράμμῳ ἴσην γωνίαν εὐθύγραμμον συστήσασθαι.",
      lat: "Ad datam rectam et punctum in ea datum angulum rectilineum dato angulo rectilineo aequalem construere.",
      en: "At a given straight line and a point on it, to construct a rectilinear angle equal to a given rectilinear angle.",
      greekPages: [54],
      latinPages: [55],
    },
    steps: [
      {
        title: "A line, its point, and a separate angle",
        phase: "Given",
        reason: "given",
        grc: "Ἔστω ἡ μὲν δοθεῖσα εὐθεῖα ἡ ΑΒ, τὸ δὲ πρὸς αὐτῇ σημεῖον τὸ Α, ἡ δὲ δοθεῖσα γωνία εὐθύγραμμος ἡ ὑπὸ ΔΓΕ· δεῖ δὴ πρὸς τῇ δοθείσῃ εὐθείᾳ τῇ ΑΒ καὶ τῷ πρὸς αὐτῇ σημείῳ τῷ Α τῇ δοθείσῃ γωνίᾳ εὐθυγράμμῳ τῇ ὑπὸ ΔΓΕ ἴσην γωνίαν εὐθύγραμμον συστήσασθαι.",
        lat: "Sit data recta ΑΒ et punctum in ea datum Α et datus angulus rectilineus ΔΓΕ. oportet igitur ad datam rectam ΑΒ et punctum in ea datum Α angulum rectilineum dato angulo rectilineo ΔΓΕ aequalem construere.",
        en: "Let ΑΒ be the given straight line, Α the point on it, and ΔΓΕ the given rectilinear angle. We must construct, at Α on ΑΒ, a rectilinear angle equal to ΔΓΕ.",
        greekPages: [56],
        latinPages: [57],
        language:
          "πρὸς with the dative locates the construction at a line and its point. δοθείσῃ εὐθείᾳ and δοθείσῃ γωνίᾳ have the same endings but different roles: one is the new support, the other the reference angle. Latin aequalem takes the dative dato angulo.",
      },
      {
        title: "Choose any two points and join them",
        phase: "Construct",
        reason: "angleChoose",
        grc: "Εἰλήφθω ἐφ’ ἑκατέρας τῶν ΓΔ, ΓΕ τυχόντα σημεῖα τὰ Δ, Ε, καὶ ἐπεζεύχθω ἡ ΔΕ·",
        lat: "sumantur in utraque ΓΔ, ΓΕ quaelibet puncta Δ, Ε et ducatur ΔΕ.",
        en: "On each of ΓΔ and ΓΕ let arbitrary points Δ and Ε be taken, and let ΔΕ be joined.",
        greekPages: [56],
        latinPages: [57],
        language:
          "τυχόντα / quaelibet means arbitrary: the two distances are not required to agree. Εἰλήφθω is a singular perfect passive imperative with neuter plural σημεῖα as subject, a familiar Greek agreement pattern; Latin sumantur is plural. ἐπεζεύχθω is another instruction, now for the joining line.",
      },
      {
        title: "Reuse the three-length construction",
        phase: "Construct",
        reason: "angleConstruct",
        grc: "καὶ ἐκ τριῶν εὐθειῶν, αἵ εἰσιν ἴσαι τρισὶ ταῖς ΓΔ, ΔΕ, ΓΕ, τρίγωνον συνεστάτω τὸ ΑΖΗ,",
        lat: "et ex tribus rectis, quae aequales sunt tribus rectis ΓΔ, ΔΕ, ΓΕ, triangulum construatur ΑΖΗ,",
        en: "From three straight lines equal to ΓΔ, ΔΕ and ΓΕ, let triangle ΑΖΗ be constructed…",
        greekPages: [56],
        latinPages: [57],
        language:
          "ἐκ / ex introduces what the triangle is made from. τρισί and tribus are datives after the equality: equal to the three given lengths. συνεστάτω / construatur requests a completed triangle. The Latin’s inline reference identifies I.22; the reader opens that earned result rather than treating it as a primitive operation.",
      },
      {
        title: "Keep the side correspondence",
        phase: "Construct",
        reason: "angleCorrespond",
        grc: "ὥστε ἴσην εἶναι τὴν μὲν ΓΔ τῇ ΑΖ, τὴν δὲ ΓΕ τῇ ΑΗ, καὶ ἔτι τὴν ΔΕ τῇ ΖΗ.",
        lat: "ita ut sit ΓΔ = ΑΖ, ΓΕ = ΑΗ, ΔΕ = ΖΗ.",
        en: "…so that ΓΔ equals ΑΖ, ΓΕ equals ΑΗ, and ΔΕ equals ΖΗ.",
        greekPages: [56],
        latinPages: [57],
        language:
          "ὥστε with εἶναι states the resulting configuration. μέν … δέ distinguishes the first two equalities, and καὶ ἔτι adds the third. The Latin writes the three equations explicitly. ΑΗ lies on the new line ΑΒ in the printed figure; our placement makes that required incidence explicit.",
      },
      {
        title: "Compare two sides and the closing base",
        phase: "Prove",
        reason: "angleSSS",
        grc: "Ἐπεὶ οὖν δύο αἱ ΔΓ, ΓΕ δύο ταῖς ΖΑ, ΑΗ ἴσαι εἰσὶν ἑκατέρα ἑκατέρᾳ, καὶ βάσις ἡ ΔΕ βάσει τῇ ΖΗ ἴση,",
        lat: "iam quoniam duae rectae ΔΓ, ΓΕ duabus ΖΑ, ΑΗ aequales sunt altera alteri, et basis ΔΕ basi ΖΗ aequalis,",
        en: "Since the two sides ΔΓ and ΓΕ equal ΖΑ and ΑΗ respectively, and base ΔΕ equals base ΖΗ…",
        greekPages: [56],
        latinPages: [57],
        language:
          "ἑκατέρα ἑκατέρᾳ / altera alteri pairs each side with its counterpart. βάσις is nominative and βάσει dative: base ΔΕ is equal to base ΖΗ. The angle at Γ corresponds to the angle at Α; changing the names’ order must not change the correspondence.",
      },
      {
        title: "Infer equality of the included angles",
        phase: "Prove",
        reason: "angleSSS",
        grc: "γωνία ἄρα ἡ ὑπὸ ΔΓΕ γωνίᾳ τῇ ὑπὸ ΖΑΗ ἐστιν ἴση.",
        lat: "erit ∠ ΔΓΕ = ΖΑΗ.",
        en: "…the angle ΔΓΕ therefore equals the angle ΖΑΗ.",
        greekPages: [56],
        latinPages: [57],
        language:
          "ἄρα marks an inference, not an additional construction. γωνία is the subject; γωνίᾳ is the dative comparison after ἴση. Heiberg’s Latin cites I.8. It does not cite I.4, whose side–angle–side hypothesis would already require the angle equality we are proving.",
      },
      {
        title: "The requested angle has been made",
        phase: "Conclude",
        reason: "angleConclude",
        grc: "Πρὸς ἄρα τῇ δοθείσῃ εὐθείᾳ τῇ ΑΒ καὶ τῷ πρὸς αὐτῇ σημείῳ τῷ Α τῇ δοθείσῃ γωνίᾳ εὐθυγράμμῳ τῇ ὑπὸ ΔΓΕ ἴση γωνία εὐθύγραμμος συνέσταται ἡ ὑπὸ ΖΑΗ· ὅπερ ἔδει ποιῆσαι.",
        lat: "Ergo ad datam rectam ΑΒ et punctum in ea datum Α dato angulo rectilineo ΔΓΕ aequalis constructus est angulus rectilineus ΖΑΗ; quod oportebat fieri.",
        en: "Thus angle ΖΑΗ has been constructed at Α on ΑΒ, equal to the given rectilinear angle ΔΓΕ: which was required to be made.",
        greekPages: [56],
        latinPages: [57],
        language:
          "συνέσταται announces the completed construction, answering the heading’s συστήσασθαι. Latin constructus est and quod oportebat fieri likewise close a task of making. Equal angular magnitude does not require the two triangles to occupy the same position or orientation.",
      },
    ],
    insight: {
      title: "A construction becomes a more capable tool",
      text: "The points Δ and Ε are arbitrary, so the three auxiliary lengths can change while the given angle stays fixed. Every successful side copy still gives the same opening. I.22 earns the triangle; I.8 earns the angle equality. Rotating the destination line changes its absolute direction, and reflecting the triangle changes its orientation, without changing that opening.",
      link: "https://mathcs.clarku.edu/~djoyce/elements/bookI/propI23.html",
    },
    question: {
      prompt: "Why does the proof invoke I.8 rather than I.4?",
      options: [
        "I.8 infers the angle equality from three side equalities; I.4 would require that angle equality already.",
        "I.8 allows the two copied distances to be unequal to their references.",
        "I.4 constructs a triangle from any three lengths, even failing ones.",
      ],
      correct: 0,
      explanations: [
        "Yes. Using side–angle–side here would assume the very angle equality being proved. Three-side comparison supplies it.",
        "Every corresponding side must equal its reference. The two distances from Γ may differ from each other, not from their copies.",
        "I.22 is the three-length construction and requires all three strict inequalities. I.4 is a congruence theorem, not that construction.",
      ],
    },
  },
};
