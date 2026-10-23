import type { Lesson, Reason } from "./lessons";

export const nestedReasons: Record<string, Reason> = {
  nestedExtend: {
    title: "Postulate 2 · continue ΒΔ to the opposite side",
    kind: "construction",
    text: "Because Δ is strictly inside ΑΒΓ, the ray from Β through Δ meets ΑΓ at an interior point Ε. The point ordering and intersection are geometric assumptions used by the source. A modern treatment must justify them; the drawing does not supply a separate proof.",
  },
  nestedFirst: {
    title: "I.20 · the two sides of ΑΒΕ exceed the third",
    kind: "deduction",
    lesson: 20,
    text: "Apply the triangle inequality in ΑΒΕ: ΑΒ + ΑΕ > ΒΕ. These are three sides of one auxiliary triangle, not the two routes that the proposition ultimately compares.",
  },
  nestedAdd: {
    title: "Add the common segment ΕΓ",
    kind: "assumption",
    text: "Adding the same positive length preserves a strict inequality. Since Ε lies between Α and Γ, ΑΕ + ΕΓ = ΑΓ. Thus the outer route Β–Α–Γ exceeds the intermediate route Β–Ε–Γ. Heiberg cites expanded common notion 4 here; it is not the usual common notion 4 about coincidence.",
  },
  nestedSecond: {
    title: "I.20 again · use ΓΕΔ and add ΔΒ",
    kind: "deduction",
    lesson: 20,
    text: "In ΓΕΔ, ΓΕ + ΕΔ > ΓΔ. Add ΔΒ to both sides. Because Δ lies between Β and Ε, ΕΔ + ΔΒ = ΕΒ. Therefore the intermediate route Γ–Ε–Β exceeds the inner route Γ–Δ–Β. Its reversed reading direction changes no length.",
  },
  nestedLengths: {
    title: "Chain the two strict length inequalities",
    kind: "deduction",
    text: "The outer route exceeds the intermediate route, which exceeds the inner route. Strict order is transitive. The total shortening equals the sum of the two positive triangle-inequality excesses; the measurements expose that identity as an additional modern observation.",
  },
  nestedFirstAngle: {
    title: "I.16 · the exterior angle at Δ",
    kind: "deduction",
    lesson: 16,
    text: "In triangle ΓΔΕ, continue ΕΔ past Δ toward Β. The exterior angle ΒΔΓ exceeds the opposite interior angle ΓΕΔ. Since ΕΔ and ΕΒ are the same ray, ΓΕΔ equals ΓΕΒ. No theorem about the sum of three triangle angles is used.",
  },
  nestedSecondAngle: {
    title: "I.16 again · the exterior angle at Ε",
    kind: "deduction",
    lesson: 16,
    text: "In triangle ΑΒΕ, continue ΑΕ past Ε toward Γ. Its exterior angle ΓΕΒ exceeds the opposite interior angle ΒΑΕ, which is ΒΑΓ because ΑΕ and ΑΓ are the same ray.",
  },
  nestedAngles: {
    title: "Chain the angle comparisons",
    kind: "deduction",
    text: "The inner angle ΒΔΓ exceeds the intermediate angle ΓΕΒ, which exceeds the outer angle ΒΑΓ. This proves the angle claim independently of the length claim. A shorter pair of segments does not by itself prove a greater included angle.",
  },
  nestedConclude: {
    title: "Both parts of the proposition are proved",
    kind: "deduction",
    text: "For the given interior meeting point, the inner two sides together are shorter, but their included angle is greater. The inequalities compare sums of lengths, not each corresponding side individually. The controls preserve the strict interior hypothesis.",
  },
};

export const nestedLessons: Record<21, Lesson> = {
  21: {
    id: 21,
    numeral: "I.21",
    greekNumeral: "καʹ",
    title: "Shorten the route, enlarge the angle",
    shortTitle: "Inside the triangle",
    introduction:
      "Two segments meet inside a triangle. Their total length falls below the outer two sides, yet their included angle exceeds the outer angle. One intermediate route explains both comparisons.",
    statement: {
      grc: "Ἐὰν τριγώνου ἐπὶ μιᾶς τῶν πλευρῶν ἀπὸ τῶν περάτων δύο εὐθεῖαι ἐντὸς συσταθῶσιν, αἱ συσταθεῖσαι τῶν λοιπῶν τοῦ τριγώνου δύο πλευρῶν ἐλάττονες μὲν ἔσονται, μείζονα δὲ γωνίαν περιέξουσιν.",
      lat: "Si in uno latere trianguli a terminis duae rectae intus coniunguntur, rectae coniunctae reliquis duobus lateribus trianguli minores erunt, maiorem autem angulum comprehendent.",
      en: "If two straight lines from the endpoints of one side of a triangle meet inside it, the lines so joined will together be less than the remaining two sides of the triangle, but will contain a greater angle.",
      greekPages: [50],
      latinPages: [51],
    },
    steps: [
      {
        title: "Join the endpoints to an interior point",
        phase: "Given",
        reason: "given",
        grc: "Τριγώνου γὰρ τοῦ ΑΒΓ ἐπὶ μιᾶς τῶν πλευρῶν τῆς ΒΓ ἀπὸ τῶν περάτων τῶν Β, Γ δύο εὐθεῖαι ἐντὸς συνεστάτωσαν αἱ ΒΔ, ΔΓ· λέγω, ὅτι αἱ ΒΔ, ΔΓ τῶν λοιπῶν τοῦ τριγώνου δύο πλευρῶν τῶν ΒΑ, ΑΓ ἐλάσσονες μέν εἰσιν, μείζονα δὲ γωνίαν περιέχουσι τὴν ὑπὸ ΒΔΓ τῆς ὑπὸ ΒΑΓ.",
        lat: "In triangulo enim ΑΒΓ in uno latere ΒΓ a terminis Β, Γ duae rectae intus coniungantur ΒΔ, ΔΓ. dico, esse ΒΔ + ΔΓ < ΒΑ + ΑΓ et ∠ ΒΔΓ > ΒΑΓ.",
        en: "In triangle ΑΒΓ, let ΒΔ and ΔΓ meet inside it from the endpoints Β and Γ of side ΒΓ. I say that ΒΔ and ΔΓ together are less than ΒΑ and ΑΓ together, but contain an angle ΒΔΓ greater than ΒΑΓ.",
        greekPages: [50],
        latinPages: [51],
        language:
          "ἐντός / intus means inside: it is a hypothesis, not decoration. μέν … δέ balances the two surprising claims: smaller lengths, but a larger angle. Heiberg makes the sums explicit with + signs in Latin.",
      },
      {
        title: "Continue ΒΔ to Ε on ΑΓ",
        phase: "Construct",
        reason: "nestedExtend",
        grc: "Διήχθω γὰρ ἡ ΒΔ ἐπὶ τὸ Ε.",
        lat: "educatur enim ΒΔ ad Ε.",
        en: "For let ΒΔ be continued to Ε [on ΑΓ].",
        greekPages: [50],
        latinPages: [51],
        language:
          "Διήχθω is a third-person perfect passive imperative: let it have been carried through. Latin educatur is a passive subjunctive used as an instruction. The English bracket explains the intersection supplied by the figure.",
      },
      {
        title: "Compare the first auxiliary triangle",
        phase: "Prove",
        reason: "nestedFirst",
        grc: "καὶ ἐπεὶ παντὸς τριγώνου αἱ δύο πλευραὶ τῆς λοιπῆς μείζονές εἰσιν, τοῦ ΑΒΕ ἄρα τριγώνου αἱ δύο πλευραὶ αἱ ΑΒ, ΑΕ τῆς ΒΕ μείζονές εἰσιν·",
        lat: "et quoniam in quouis triangulo duo latera reliquo maiora sunt, in triangulo ΑΒΕ erunt ΑΒ + ΑΕ > ΒΕ.",
        en: "Since any two sides of a triangle together are greater than the remaining side, the sides ΑΒ and ΑΕ of triangle ΑΒΕ are together greater than ΒΕ.",
        greekPages: [50],
        latinPages: [51],
        language:
          "τῆς λοιπῆς is genitive after μείζονες: greater than the remaining side. The noun πλευρᾶς is understood. Latin reliquo is ablative of comparison, with latere understood.",
      },
      {
        title: "Add the same remaining piece",
        phase: "Prove",
        reason: "nestedAdd",
        grc: "κοινὴ προσκείσθω ἡ ΕΓ· αἱ ἄρα ΒΑ, ΑΓ τῶν ΒΕ, ΕΓ μείζονές εἰσιν.",
        lat: "communis adiciatur ΕΓ. itaque ΒΑ + ΑΓ > ΒΕ + ΕΓ.",
        en: "Let ΕΓ be added in common. Therefore ΒΑ and ΑΓ together are greater than ΒΕ and ΕΓ together.",
        greekPages: [50],
        latinPages: [51],
        language:
          "κοινή / communis says the same segment is added to both sides of the inequality. ΑΕ and ΕΓ become the single whole ΑΓ. ΒΑ and ΑΒ name the same length.",
      },
      {
        title: "Shorten the intermediate route once more",
        phase: "Prove",
        reason: "nestedSecond",
        grc: "πάλιν, ἐπεὶ τοῦ ΓΕΔ τριγώνου αἱ δύο πλευραὶ αἱ ΓΕ, ΕΔ τῆς ΓΔ μείζονές εἰσιν, κοινὴ προσκείσθω ἡ ΔΒ· αἱ ΓΕ, ΕΒ ἄρα τῶν ΓΔ, ΔΒ μείζονές εἰσιν.",
        lat: "rursus quoniam in ΓΕΔ triangulo ΓΕ + ΕΔ > ΓΔ, communis adiciatur ΔΒ. itaque ΓΕ + ΕΒ > ΓΔ + ΔΒ.",
        en: "Again, since ΓΕ and ΕΔ in triangle ΓΕΔ are together greater than ΓΔ, let ΔΒ be added in common. Therefore ΓΕ and ΕΒ together are greater than ΓΔ and ΔΒ together.",
        greekPages: [50],
        latinPages: [51],
        language:
          "πάλιν / rursus announces a second application of the same idea to a different triangle. ΕΔ plus ΔΒ becomes ΕΒ because the points occur in the order Ε, Δ, Β.",
      },
      {
        title: "Chain the length comparisons",
        phase: "Prove",
        reason: "nestedLengths",
        grc: "ἀλλὰ τῶν ΒΕ, ΕΓ μείζονες ἐδείχθησαν αἱ ΒΑ, ΑΓ· πολλῷ ἄρα αἱ ΒΑ, ΑΓ τῶν ΒΔ, ΔΓ μείζονές εἰσιν.",
        lat: "sed demonstratum est ΒΑ + ΑΓ > ΒΕ + ΕΓ. itaque multo magis ΒΑ + ΑΓ > ΒΔ + ΔΓ.",
        en: "But ΒΑ and ΑΓ together were shown to exceed ΒΕ and ΕΓ together. Therefore, all the more, ΒΑ and ΑΓ together exceed ΒΔ and ΔΓ together.",
        greekPages: [50],
        latinPages: [51],
        language:
          "ἐδείχθησαν is aorist passive: they were shown. πολλῷ and multo strengthen the comparison—by much, or all the more—without claiming a fixed numerical margin.",
      },
      {
        title: "Compare the exterior angle at Δ",
        phase: "Prove",
        reason: "nestedFirstAngle",
        grc: "Πάλιν, ἐπεὶ παντὸς τριγώνου ἡ ἐκτὸς γωνία τῆς ἐντὸς καὶ ἀπεναντίον μείζων ἐστίν, τοῦ ΓΔΕ ἄρα τριγώνου ἡ ἐκτὸς γωνία ἡ ὑπὸ ΒΔΓ μείζων ἐστὶ τῆς ὑπὸ ΓΕΔ.",
        lat: "rursus quoniam in quouis triangulo angulus extrinsecus positus maior est angulo interiore et opposito, in triangulo ΓΔΕ erit ∠ ΒΔΓ > ΓΕΔ.",
        en: "Again, since an exterior angle of any triangle is greater than an interior and opposite angle, the exterior angle ΒΔΓ of triangle ΓΔΕ is greater than ΓΕΔ.",
        greekPages: [52],
        latinPages: [53],
        language:
          "ἐκτός now means outside the small triangle ΓΔΕ, even though Δ is inside the original triangle. interiore et opposito preserves both qualifications: interior and opposite, not adjacent.",
      },
      {
        title: "Compare the exterior angle at Ε",
        phase: "Prove",
        reason: "nestedSecondAngle",
        grc: "διὰ ταὐτὰ τοίνυν καὶ τοῦ ΑΒΕ τριγώνου ἡ ἐκτὸς γωνία ἡ ὑπὸ ΓΕΒ μείζων ἐστὶ τῆς ὑπὸ ΒΑΓ.",
        lat: "eadem de causa igitur etiam in triangulo ΑΒΕ erit ∠ ΓΕΒ > ΒΑΓ.",
        en: "For the same reason, the exterior angle ΓΕΒ of triangle ΑΒΕ is also greater than ΒΑΓ.",
        greekPages: [52],
        latinPages: [53],
        language:
          "διὰ ταὐτά means for the same reasons; ταὐτά contracts τὰ αὐτά. Latin eadem de causa uses the singular cause. The unchanged direction of rays ΕΔ and ΕΒ identifies the intermediate angle.",
      },
      {
        title: "Chain the angle comparisons",
        phase: "Prove",
        reason: "nestedAngles",
        grc: "ἀλλὰ τῆς ὑπὸ ΓΕΒ μείζων ἐδείχθη ἡ ὑπὸ ΒΔΓ· πολλῷ ἄρα ἡ ὑπὸ ΒΔΓ μείζων ἐστὶ τῆς ὑπὸ ΒΑΓ.",
        lat: "uerum demonstratum est ∠ ΒΔΓ > ΓΕΒ. multo igitur magis ΒΔΓ > ΒΑΓ.",
        en: "But ΒΔΓ was shown to be greater than ΓΕΒ. Therefore, all the more, ΒΔΓ is greater than ΒΑΓ.",
        greekPages: [52],
        latinPages: [53],
        language:
          "ἐδείχθη is singular here because its subject is one angle; the length argument used plural ἐδείχθησαν. The same rhetorical pattern carries a separate mathematical comparison.",
      },
      {
        title: "Keep both conclusions together",
        phase: "Conclude",
        reason: "nestedConclude",
        grc: "Ἐὰν ἄρα τριγώνου ἐπὶ μιᾶς τῶν πλευρῶν ἀπὸ τῶν περάτων δύο εὐθεῖαι ἐντὸς συσταθῶσιν, αἱ συσταθεῖσαι τῶν λοιπῶν τοῦ τριγώνου δύο πλευρῶν ἐλάττονες μὲν ἔσονται, μείζονα δὲ γωνίαν περιέξουσιν· ὅπερ ἔδει δεῖξαι.",
        lat: "Ergo si in uno latere trianguli a terminis duae rectae intus coniunguntur, rectae coniunctae reliquis duobus lateribus trianguli minores erunt, maiorem autem angulum comprehendent; quod erat demonstrandum.",
        en: "Therefore, if two straight lines from the endpoints of one side of a triangle meet inside it, they will together be less than the remaining two sides, but contain a greater angle; which was to be proved.",
        greekPages: [52],
        latinPages: [53],
        language:
          "συσταθῶσιν follows ἐάν as an aorist passive subjunctive. The futures ἔσονται and περιέξουσιν state what will follow. Latin minores erunt and maiorem … comprehendent reproduce the two consequences.",
      },
    ],
    insight: {
      title: "One intermediate route, two different proofs",
      text: "Β–Ε–Γ sits between the outer and inner routes in length. The angle at Ε also sits between their included angles, in the reverse order. I.20 proves the length chain; I.16 proves the angle chain. Neither conclusion is inferred just by watching the controls. The numeric shortening is the sum of the two auxiliary triangles’ positive excesses.",
      link: "https://archive.org/details/euclidisoperaomn01eucluoft/page/50/mode/2up",
    },
    question: {
      prompt: "What does I.21 prove about the two inner segments?",
      options: [
        "Each inner segment is shorter than its corresponding outer side.",
        "Their sum is smaller, while their included angle is greater.",
        "Their sum is smaller, so the angle claim needs no separate proof.",
      ],
      correct: 1,
      explanations: [
        "The source compares the sums. Individual corresponding sides need not both decrease; move Δ near Β to explore this.",
        "Yes. Two uses of I.20 establish the length result, and two uses of I.16 establish the angle result.",
        "The angle result has its own proof. A comparison of sums alone does not establish this included-angle order.",
      ],
    },
  },
};
