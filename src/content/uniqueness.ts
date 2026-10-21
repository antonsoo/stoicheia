import type { Lesson, Reason } from "./lessons";

export const uniquenessReasons: Record<string, Reason> = {
  i5: {
    title: "I.5 · equal sides give equal base angles",
    text: "Use the triangle named in this sentence. ΑΓ = ΑΔ gives equal angles in ΑΓΔ. The second application, to ΓΒΔ, is conditional on ΓΒ = ΔΒ, which the distinct same-side sketch cannot also satisfy.",
    kind: "deduction",
    lesson: 5,
  },
  anglePart: {
    title: "Whole and part in the pictured configuration",
    text: "Here ∠ΔΓΒ is a proper part of ∠ΑΓΔ. I.5 made ∠ΑΓΔ equal to ∠ΑΔΓ, so ∠ΑΔΓ is greater than ∠ΔΓΒ. This uses the drawn placement of Δ outside ΑΒΓ and compatibility of equality with order. The printed proof does not discuss every possible placement.",
    kind: "assumption",
  },
  angleOrder: {
    title: "Order passes through the two comparisons",
    text: "In this configuration ∠ΓΔΒ contains ∠ΑΔΓ, which was already greater than ∠ΔΓΒ. Thus ∠ΓΔΒ is greater still. Transitivity of strict comparison is used here without being separately stated in the usual five common notions.",
    kind: "assumption",
  },
  impossibleOrder: {
    title: "The same two angles cannot be both equal and unequal",
    text: "The first radius equality and the pictured placement give ∠ΓΔΒ > ∠ΔΓΒ. The added equality ΓΒ = ΔΒ would give ∠ΓΔΒ = ∠ΔΓΒ by I.5. The conjunction is impossible. A reflected point escapes this contradiction by failing the same-side hypothesis.",
    kind: "deduction",
  },
  i7: {
    title: "I.7 · one meeting point on the same side",
    text: "After the equal bases have been aligned, two distinct meeting points on the same side cannot have the same two distances from the corresponding base endpoints. The side condition matters: the two circle intersections on opposite sides are both possible.",
    kind: "deduction",
    lesson: 7,
  },
  sssCoincidence: {
    title: "I.7 excludes the second apex; coincidence gives equality",
    text: "With Β on Ε and Γ on Ζ, the remaining vertex must fall on Δ on the selected side. The angle then coincides with ∠ΕΔΖ and is equal to it. The source still relies on superposition, as I.4 did; the three numerical side checks do not justify that assumption.",
    kind: "deduction",
  },
};

export const uniquenessLessons: Record<7 | 8, Lesson> = {
  7: {
    id: 7,
    numeral: "I.7",
    greekNumeral: "ζʹ",
    title: "Test why the same side matters",
    shortTitle: "Locate one apex",
    introduction:
      "Two distances locate a meeting point on one side of a base. Follow the pictured case, then reflect the point to see exactly which condition the second solution fails.",
    statement: {
      grc: "Ἐπὶ τῆς αὐτῆς εὐθείας δύο ταῖς αὐταῖς εὐθείαις ἄλλαι δύο εὐθεῖαι ἴσαι ἑκατέρα ἑκατέρᾳ οὐ συσταθήσονται πρὸς ἄλλῳ καὶ ἄλλῳ σημείῳ ἐπὶ τὰ αὐτὰ μέρη τὰ αὐτὰ πέρατα ἔχουσαι ταῖς ἐξ ἀρχῆς εὐθείαις.",
      lat: "In eadem recta iisdem duabus rectis aliae duae rectae aequales altera alteri non constituentur ad aliud atque aliud punctum ad eandem partem eosdem terminos, quos priores rectae, habentes.",
      en: "On the same straight line, two further straight lines respectively equal to the original two cannot be set up to meet at a different point on the same side, with each starting from the same endpoint as its counterpart.",
      greekPages: [24],
      latinPages: [25],
    },
    steps: [
      {
        title: "Suppose there is a second meeting point",
        phase: "Given",
        reason: "given",
        grc: "Εἰ γὰρ δυνατόν, ἐπὶ τῆς αὐτῆς εὐθείας τῆς ΑΒ δύο ταῖς αὐταῖς εὐθείαις ταῖς ΑΓ, ΓΒ ἄλλαι δύο εὐθεῖαι αἱ ΑΔ, ΔΒ ἴσαι ἑκατέρα ἑκατέρᾳ συνεστάτωσαν πρὸς ἄλλῳ καὶ ἄλλῳ σημείῳ τῷ τε Γ καὶ Δ ἐπὶ τὰ αὐτὰ μέρη τὰ αὐτὰ πέρατα ἔχουσαι, ὥστε ἴσην εἶναι τὴν μὲν ΓΑ τῇ ΔΑ τὸ αὐτὸ πέρας ἔχουσαν αὐτῇ τὸ Α, τὴν δὲ ΓΒ τῇ ΔΒ τὸ αὐτὸ πέρας ἔχουσαν αὐτῇ τὸ Β,",
        lat: "Nam si fieri potest, in eadem recta ΑΒ duabus iisdem rectis ΑΓ, ΓΒ aliae duae rectae ΑΔ, ΔΒ aequales altera alteri constituantur ad aliud atque aliud punctum Γ et Δ ad eandem partem eosdem terminos habentes, ita ut ΓΑ = ΔΑ, quacum terminum habet communem Α, et ΓΒ = ΔΒ, quacum terminum habet communem Β,",
        en: "Suppose this is possible. On the same base ΑΒ let ΑΔ and ΔΒ meet at Δ, distinct from Γ but on the same side. Let ΓΑ equal ΔΑ, both with endpoint Α, and ΓΒ equal ΔΒ, both with endpoint Β.",
        greekPages: [24],
        latinPages: [25],
        language:
          "Εἰ … δυνατόν / si fieri potest introduces a possibility to be tested. The repeated αὐτός / idem keeps the base, side and paired endpoints fixed; ἄλλῳ / aliud makes the meeting points different. These conditions must be read together.",
      },
      {
        title: "Join the two proposed meeting points",
        phase: "Construct",
        reason: "p1",
        grc: "καὶ ἐπεζεύχθω ἡ ΓΔ.",
        lat: "et ducatur ΓΔ.",
        en: "And join Γ to Δ.",
        greekPages: [24],
        latinPages: [25],
        language:
          "The singular imperative ἐπεζεύχθω asks for one joining line. It only makes sense as a new segment when Γ and Δ are distinct; moving the candidate onto Γ removes that hypothesis.",
      },
      {
        title: "Use the first isosceles triangle",
        phase: "Prove",
        reason: "i5",
        grc: "Ἐπεὶ οὖν ἴση ἐστὶν ἡ ΑΓ τῇ ΑΔ, ἴση ἐστὶ καὶ γωνία ἡ ὑπὸ ΑΓΔ τῇ ὑπὸ ΑΔΓ·",
        lat: "Iam quoniam ΑΓ = ΑΔ, etiam ∠ ΑΓΔ = ΑΔΓ.",
        en: "Since ΑΓ equals ΑΔ, the angles ΑΓΔ and ΑΔΓ are equal as well.",
        greekPages: [24, 26],
        latinPages: [25, 27],
        language:
          "Ἐπεὶ … / quoniam introduces the reason. Read the middle letter of each three-letter angle name as its vertex: first Γ, then Δ. The conclusion is an application of I.5, not a new given.",
      },
      {
        title: "Compare an angle with a proper part",
        phase: "Prove",
        reason: "anglePart",
        grc: "μείζων ἄρα ἡ ὑπὸ ΑΔΓ τῆς ὑπὸ ΔΓΒ·",
        lat: "quare ∠ ΑΔΓ > ΔΓΒ.",
        en: "Therefore angle ΑΔΓ is greater than angle ΔΓΒ.",
        greekPages: [26],
        latinPages: [27],
        language:
          "τῆς … is the genitive after the comparative μείζων: ‘greater than’. Latin compresses the comparison into the > sign. The angle containing the smaller part is the equal angle at Γ from the preceding step.",
      },
      {
        title: "Pass the strict comparison to the larger angle",
        phase: "Prove",
        reason: "angleOrder",
        grc: "πολλῷ ἄρα ἡ ὑπὸ ΓΔΒ μείζων ἐστὶ τῆς ὑπὸ ΔΓΒ.",
        lat: "itaque multo magis ∠ ΓΔΒ > ΔΓΒ.",
        en: "Angle ΓΔΒ is therefore greater still than angle ΔΓΒ.",
        greekPages: [26],
        latinPages: [27],
        language:
          "πολλῷ and multo express degree of difference: ‘by much’. They are not numerical angle measurements. The argument has added another whole–part comparison to the one already established.",
      },
      {
        title: "Apply the second supposed side equality",
        phase: "Prove",
        reason: "i5",
        grc: "πάλιν ἐπεὶ ἴση ἐστὶν ἡ ΓΒ τῇ ΔΒ, ἴση ἐστὶ καὶ γωνία ἡ ὑπὸ ΓΔΒ γωνίᾳ τῇ ὑπὸ ΔΓΒ.",
        lat: "rursus quoniam ΓΒ = ΔΒ, erit ∠ ΓΔΒ = ΔΓΒ.",
        en: "Again, if ΓΒ equals ΔΒ as supposed, the angles ΓΔΒ and ΔΓΒ must be equal by I.5.",
        greekPages: [26],
        latinPages: [27],
        language:
          "πάλιν / rursus means ‘again’, marking a second application of the same result to a different triangle. The English ‘as supposed’ makes the temporary status explicit; the Greek and Latin directly use the equality introduced at the start.",
      },
      {
        title: "The same angle cannot be equal and greater",
        phase: "Prove",
        reason: "impossibleOrder",
        grc: "ἐδείχθη δὲ αὐτῆς καὶ πολλῷ μείζων· ὅπερ ἐστὶν ἀδύνατον.",
        lat: "sed demonstratum est, eundem multo maiorem esse; quod fieri non potest.",
        en: "But that same angle was shown to be greater than the other. The two claims cannot both hold.",
        greekPages: [26],
        latinPages: [27],
        language:
          "αὐτῆς supplies ‘than it’ after μείζων. Latin eundem refers to the same angle already compared, with angulum understood. ἀδύνατον says ‘impossible’; compare I.6’s ἄτοπον, ‘absurd’.",
      },
      {
        title: "Keep every condition in the conclusion",
        phase: "Conclude",
        reason: "theorem",
        grc: "Οὐκ ἄρα ἐπὶ τῆς αὐτῆς εὐθείας δύο ταῖς αὐταῖς εὐθείαις ἄλλαι δύο εὐθεῖαι ἴσαι ἑκατέρα ἑκατέρᾳ συσταθήσονται πρὸς ἄλλῳ καὶ ἄλλῳ σημείῳ ἐπὶ τὰ αὐτὰ μέρη τὰ αὐτὰ πέρατα ἔχουσαι ταῖς ἐξ ἀρχῆς εὐθείαις· ὅπερ ἔδει δεῖξαι.",
        lat: "Ergo in eadem recta iisdem duabus rectis aliae duae rectae aequales altera alteri non constituentur ad aliud atque aliud punctum ad eandem partem eosdem terminos, quos priores rectae, habentes; quod erat demonstrandum.",
        en: "Thus the original two lengths cannot be reproduced from their respective endpoints of the same base to meet at a different point on the same side. Which was to be shown.",
        greekPages: [26],
        latinPages: [27],
        language:
          "The future passive συσταθήσονται / constituentur returns from the heading, now with the rejection established. ‘On the same side’ remains part of the conclusion: the reflected example does not contradict this statement.",
      },
    ],
    insight: {
      title: "A reflected solution shows what the hypothesis does",
      text: "Reflecting Γ across ΑΒ preserves both distances to Α and Β, yet gives a different meeting point. It is excluded precisely by ‘on the same side’. The printed proof treats the configuration with Δ outside ΑΒΓ; other placements need additional case work. Our default same-side probe stays in that pictured configuration, preserves ΑΓ = ΑΔ, and measures the second pair honestly. It does not draw an impossible pair of distinct same-side circle intersections.",
      link: "https://mathcs.clarku.edu/~djoyce/elements/bookI/propI7.html",
    },
    question: {
      prompt: "The reflected point has the same two distances. Why does it not refute I.7?",
      options: [
        "Reflection changes one of the two distances",
        "It lies on the other side of ΑΒ",
        "I.7 requires the two distances to equal one another",
      ],
      correct: 1,
      explanations: [
        "Reflection in a line through both endpoints preserves both distances. The failed condition is the side of the base.",
        "Yes. Both paired length equalities hold, but the second point is on the opposite side. I.7 explicitly excludes that configuration.",
        "The two radii may differ. Each must equal its own counterpart from the same endpoint; they need not equal one another.",
      ],
    },
  },
  8: {
    id: 8,
    numeral: "I.8",
    greekNumeral: "ηʹ",
    title: "Let three sides determine the angle",
    shortTitle: "Use three sides",
    introduction:
      "Now the base is given equal instead of the included angle. Align the bases, then use I.7 to exclude a second apex on the selected side.",
    statement: {
      grc: "Ἐὰν δύο τρίγωνα τὰς δύο πλευρὰς [ταῖς] δύο πλευραῖς ἴσας ἔχῃ ἑκατέραν ἑκατέρᾳ, ἔχῃ δὲ καὶ τὴν βάσιν τῇ βάσει ἴσην, καὶ τὴν γωνίαν τῇ γωνίᾳ ἴσην ἕξει τὴν ὑπὸ τῶν ἴσων εὐθειῶν περιεχομένην.",
      lat: "Si duo trianguli duo latera duobus lateribus aequalia habent alterum alteri et praeterea basim basi aequalem habent, etiam angulos aequalibus rectis comprehensos aequales habebunt.",
      en: "When two triangles have two respective sides equal and their bases equal too, the angles enclosed by those equal sides will also be equal.",
      greekPages: [26],
      latinPages: [27],
    },
    steps: [
      {
        title: "Name the three side pairs and the angle to prove",
        phase: "Given",
        reason: "given",
        grc: "Ἔστω δύο τρίγωνα τὰ ΑΒΓ, ΔΕΖ τὰς δύο πλευρὰς τὰς ΑΒ, ΑΓ ταῖς δύο πλευραῖς ταῖς ΔΕ, ΔΖ ἴσας ἔχοντα ἑκατέραν ἑκατέρᾳ, τὴν μὲν ΑΒ τῇ ΔΕ τὴν δὲ ΑΓ τῇ ΔΖ· ἐχέτω δὲ καὶ βάσιν τὴν ΒΓ βάσει τῇ ΕΖ ἴσην· λέγω, ὅτι καὶ γωνία ἡ ὑπὸ ΒΑΓ γωνίᾳ τῇ ὑπὸ ΕΔΖ ἐστιν ἴση.",
        lat: "Sint duo trianguli ΑΒΓ, ΔΕΖ duo latera ΑΒ, ΑΓ duobus lateribus ΔΕ, ΔΖ aequalia habentes alterum alteri, ΑΒ = ΔΕ et ΑΓ = ΔΖ, et praeterea habeant ΒΓ = ΕΖ. dico, etiam esse ∠ ΒΑΓ = ΕΔΖ.",
        en: "Let ΑΒΓ and ΔΕΖ have ΑΒ = ΔΕ, ΑΓ = ΔΖ and ΒΓ = ΕΖ. I claim that angle ΒΑΓ also equals angle ΕΔΖ.",
        greekPages: [26],
        latinPages: [27],
        language:
          "ἐχέτω / habeant adds the equal-base condition. Compare I.4: there the included angle was given and the equal base was proved. Here those roles are exchanged. λέγω / dico introduces a claim still to be justified.",
      },
      {
        title: "Apply one equal base to the other",
        phase: "Prove",
        reason: "superposition",
        grc: "Ἐφαρμοζομένου γὰρ τοῦ ΑΒΓ τριγώνου ἐπὶ τὸ ΔΕΖ τρίγωνον καὶ τιθεμένου τοῦ μὲν Β σημείου ἐπὶ τὸ Ε σημεῖον τῆς δὲ ΒΓ εὐθείας ἐπὶ τὴν ΕΖ ἐφαρμόσει καὶ τὸ Γ σημεῖον ἐπὶ τὸ Ζ διὰ τὸ ἴσην εἶναι τὴν ΒΓ τῇ ΕΖ·",
        lat: "nam triangulo ΑΒΓ ad triangulum ΔΕΖ adplicato et puncto Β in Ε puncto posito recta autem ΒΓ in ΕΖ etiam Γ punctum in Ζ cadet, quia ΒΓ = ΕΖ.",
        en: "Apply ΑΒΓ to ΔΕΖ, placing Β on Ε and ΒΓ along ΕΖ. Then Γ falls on Ζ because the bases are equal.",
        greekPages: [26],
        latinPages: [27],
        language:
          "The Greek genitive absolutes ἐφαρμοζομένου and τιθεμένου set up the placement. Heiberg’s Latin uses ablative absolutes adplicato and posito. The corresponding endpoints are now Β → Ε and Γ → Ζ.",
      },
      {
        title: "Claim that the remaining sides must coincide",
        phase: "Prove",
        reason: "i7",
        grc: "ἐφαρμοσάσης δὴ τῆς ΒΓ ἐπὶ τὴν ΕΖ ἐφαρμόσουσι καὶ αἱ ΒΑ, ΓΑ ἐπὶ τὰς ΕΔ, ΔΖ.",
        lat: "adplicata iam ΒΓ rectae ΕΖ etiam ΒΑ, ΓΑ cum ΕΔ, ΔΖ congruent.",
        en: "Once ΒΓ is on ΕΖ, the sides ΒΑ and ΓΑ must also coincide with ΕΔ and ΔΖ. The next step explains why.",
        greekPages: [26, 28],
        latinPages: [27, 29],
        language:
          "The future ἐφαρμόσουσι / congruent states what must follow from applying the base. ΓΑ is the same segment as ΑΓ, named from the base endpoint here. The English last sentence marks the source’s claim-then-justification structure.",
      },
      {
        title: "Suppose the sides meet at another apex",
        phase: "Prove",
        reason: "i7",
        grc: "εἰ γὰρ βάσις μὲν ἡ ΒΓ ἐπὶ βάσιν τὴν ΕΖ ἐφαρμόσει, αἱ δὲ ΒΑ, ΑΓ πλευραὶ ἐπὶ τὰς ΕΔ, ΔΖ οὐκ ἐφαρμόσουσιν ἀλλὰ παραλλάξουσιν ὡς αἱ ΕΗ, ΗΖ, συσταθήσονται ἐπὶ τῆς αὐτῆς εὐθείας δύο ταῖς αὐταῖς εὐθείαις ἄλλαι δύο εὐθεῖαι ἴσαι ἑκατέρα ἑκατέρᾳ πρὸς ἄλλῳ καὶ ἄλλῳ σημείῳ ἐπὶ τὰ αὐτὰ μέρη τὰ αὐτὰ πέρατα ἔχουσαι.",
        lat: "nam si basis ΒΓ cum basi ΕΖ congruet, latera autem ΒΑ, ΑΓ cum ΕΔ, ΔΖ non congruent, uerum extra cadent, ut ΕΗ, ΗΖ, in eadem recta iisdem duabus rectis aliae duae rectae aequales altera alteri constituentur ad aliud atque aliud punctum ad eandem partem eosdem terminos habentes.",
        en: "Suppose the bases coincide but the other sides fall elsewhere, along ΕΗ and ΗΖ. There would then be a different meeting point Η on the same side of ΕΖ, with the same two lengths from the same respective endpoints.",
        greekPages: [28],
        latinPages: [29],
        language:
          "μὲν … δὲ separates what coincides (the base) from what is supposed not to coincide (the other sides). παραλλάξουσιν / extra cadent introduces a displaced candidate. The long final clause deliberately repeats the conditions of I.7.",
      },
      {
        title: "Exclude that candidate by I.7",
        phase: "Prove",
        reason: "i7",
        grc: "οὐ συνίστανται δέ·",
        lat: "sed non constituuntur.",
        en: "But I.7 rules out such a second pair on the same side.",
        greekPages: [28],
        latinPages: [29],
        language:
          "This brief denial relies on the entire description just given. The English names I.7 to make the reference explicit; Heiberg prints the proposition reference beside the Latin.",
      },
      {
        title: "Unpack the double negative",
        phase: "Prove",
        reason: "i7",
        grc: "οὐκ ἄρα ἐφαρμοζομένης τῆς ΒΓ βάσεως ἐπὶ τὴν ΕΖ βάσιν οὐκ ἐφαρμόσουσι καὶ αἱ ΒΑ, ΑΓ πλευραὶ ἐπὶ τὰς ΕΔ, ΔΖ. ἐφαρμόσουσιν ἄρα·",
        lat: "itaque fieri non potest, ut basi ΒΓ ad basim ΕΖ adplicata non congruant etiam latera ΒΑ, ΑΓ cum ΕΔ, ΔΖ. congruent igitur.",
        en: "Therefore, with the bases aligned, it cannot be that the remaining sides fail to coincide with ΕΔ and ΔΖ. They must coincide.",
        greekPages: [28],
        latinPages: [29],
        language:
          "The outer οὐκ denies the proposed failure expressed by the inner οὐκ. Latin separates the scopes clearly: non potest … non congruant, ‘it cannot happen that they do not coincide’. The final short clause gives the positive result.",
      },
      {
        title: "Conclude equality of the included angles",
        phase: "Prove",
        reason: "sssCoincidence",
        grc: "ὥστε καὶ γωνία ἡ ὑπὸ ΒΑΓ ἐπὶ γωνίαν τὴν ὑπὸ ΕΔΖ ἐφαρμόσει καὶ ἴση αὐτῇ ἔσται.",
        lat: "quare etiam angulus ΒΑΓ cum angulo ΕΔΖ congruet et ei aequalis erit.",
        en: "Consequently angle ΒΑΓ coincides with angle ΕΔΖ and is equal to it.",
        greekPages: [28],
        latinPages: [29],
        language:
          "αὐτῇ and ei are datives referring to the angle ΕΔΖ: ‘equal to it’. The angle equality is the result, not an extra premise supplied by the drawing.",
      },
      {
        title: "Three side pairs have determined the angle",
        phase: "Conclude",
        reason: "theorem",
        grc: "Ἐὰν ἄρα δύο τρίγωνα τὰς δύο πλευρὰς [ταῖς] δύο πλευραῖς ἴσας ἔχῃ ἑκατέραν ἑκατέρᾳ καὶ τὴν βάσιν τῇ βάσει ἴσην ἔχῃ, καὶ τὴν γωνίαν τῇ γωνίᾳ ἴσην ἕξει τὴν ὑπὸ τῶν ἴσων εὐθειῶν περιεχομένην· ὅπερ ἔδει δεῖξαι.",
        lat: "Ergo si duo trianguli duo latera duobus lateribus aequalia habent alterum alteri et basim basi aequalem habent, etiam angulos aequalibus rectis comprehensos aequales habebunt; quod erat demonstrandum.",
        en: "Thus two triangles with those three respective side pairs equal have equal angles between the first two sides. Which was to be shown.",
        greekPages: [28],
        latinPages: [29],
        language:
          "The bracketed [ταῖς] remains as in Heiberg’s printed Greek. The result’s future ἕξει / habebunt returns to the general statement, beyond the particular labelled triangles.",
      },
    ],
    insight: {
      title: "The angle is earned, not set as a hidden given",
      text: "The model reconstructs an apex from three lengths. You can enter lengths that do not close into a triangle; the reader then withholds the triangle. When they do close, I.7 supplies the source argument for the apex after the equal bases are applied. The motion still illustrates an additional superposition assumption. Changing the data is a numerical exploration, not a replacement proof of I.7.",
      link: "https://mathcs.clarku.edu/~djoyce/elements/bookI/propI8.html",
    },
    question: {
      prompt: "What prevents a distinct apex Η after the bases have been aligned?",
      options: [
        "The included angle was already given equal",
        "The sketch looks symmetric",
        "I.7, with the same-side and corresponding-endpoint conditions",
      ],
      correct: 2,
      explanations: [
        "That was I.4’s premise. In I.8 the included angle is what must be proved equal.",
        "The triangles need not be isosceles or symmetric. The exclusion uses the two distances from the same endpoints.",
        "Yes. After fixing the base, I.7 excludes a different meeting point with those two distances on the selected side.",
      ],
    },
  },
};
