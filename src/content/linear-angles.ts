import type { Lesson, Reason } from "./lessons";

export const linearAngleReasons: Record<string, Reason> = {
  rightPairCase: {
    title: "Definition 10 · first handle equal adjacent angles",
    text: "If the two adjacent angles are equal, definition 10 already calls each right. The remaining argument concerns the unequal case. Selecting 90° follows this first branch rather than inventing a nonzero angle between coincident rays.",
    kind: "definition",
  },
  raiseForPair: {
    title: "I.11 · construct a pair of right angles",
    text: "Raise ΒΕ perpendicular to ΓΔ at Β using I.11. This provides a known pair of right angles to compare with the original pair. The plate uses the arrangement in the printed diagram, with ΒΑ between ΒΓ and ΒΕ.",
    kind: "construction",
    lesson: 11,
  },
  addFirstAngles: {
    title: "Common notion 2 · add the same angle to equals",
    text: "Angle ΓΒΕ consists of ΓΒΑ and ΑΒΕ. Add ΕΒΔ to both descriptions. The two right angles now equal the three parts ΓΒΑ, ΑΒΕ and ΕΒΔ. Their containment is visible on this plate; it is not obtained by adding arbitrary angles that overlap.",
    kind: "deduction",
  },
  addSecondAngles: {
    title: "Common notion 2 · compare the original pair with the same three parts",
    text: "Angle ΔΒΑ consists of ΔΒΕ and ΕΒΑ. Add ΑΒΓ. This expresses the original pair as the same three parts, with reversed point names and a different ordering. The shared vertex remains Β.",
    kind: "deduction",
  },
  equalAngleSums: {
    title: "Common notion 1 · two sums equal the same sum",
    text: "Both the constructed right-angle pair and the original pair equal the same three angle parts. Therefore the two pairs are equal. ‘Equal to two right angles’ refers to their total; it does not make each original angle right.",
    kind: "deduction",
  },
  converseSupposition: {
    title: "Suppose a different continuation exists",
    text: "The proof supposes ΒΔ is not the continuation of ΓΒ, and names a different continuation ΒΕ. That supposition cannot be drawn together with every original premise. The printed-style sketch keeps the given angle pair and draws Ε separately; it does not actually make Γ, Β and Ε collinear. Its numerical table shows that distinction.",
    kind: "assumption",
  },
  conditionalLinearPair: {
    title: "I.13 · the consequence if ΓΒΕ were one line",
    text: "Under the temporary claim that Γ, Β and Ε are collinear, I.13 would make angles ΑΒΓ and ΑΒΕ equal to two right angles together. This is a conditional assertion in the proof, not a measured property of the hypothetical sketch, whose Ε is deliberately drawn off the line.",
    kind: "deduction",
    lesson: 13,
  },
  compareGivenPair: {
    title: "The original premise and common notion 1",
    text: "The original hypothesis gives ΑΒΓ + ΑΒΔ equal to two right angles. The temporary continuation would give ΑΒΓ + ΑΒΕ the same total. Common notion 1 therefore makes those pairs equal under the supposition.",
    kind: "deduction",
  },
  removeCommonAngle: {
    title: "Common notion 3 · subtract the shared angle",
    text: "Remove ΓΒΑ from both conditionally equal pairs. The remainders would be ΑΒΕ and ΑΒΔ. The diagram's measured remainders remain unequal; the proof is showing why the temporary claim cannot coexist with the given premise.",
    kind: "deduction",
  },
  impossibleAnglePart: {
    title: "Common notion 5 · a smaller angle cannot equal the larger",
    text: "In the printed arrangement ΑΒΕ is a proper part of ΑΒΔ. The supposed continuation forces them equal, contradicting the whole being greater than its part. The same reasoning excludes any different continuation; ΒΔ is the straight continuation of ΓΒ.",
    kind: "deduction",
  },
};

export const linearAngleLessons: Record<13 | 14, Lesson> = {
  13: {
    id: 13,
    numeral: "I.13",
    greekNumeral: "ιγʹ",
    title: "Compare a linear pair with two right angles",
    shortTitle: "A linear pair",
    introduction:
      "Do not begin by assuming a straight angle measures 180°. Construct a perpendicular, split the surrounding angles into shared parts, and compare the two totals.",
    statement: {
      grc: "Ἐὰν εὐθεῖα ἐπ᾽ εὐθεῖαν σταθεῖσα γωνίας ποιῇ, ἤτοι δύο ὀρθὰς ἢ δυσὶν ὀρθαῖς ἴσας ποιήσει.",
      lat: "Si recta super rectam lineam erecta angulos effecerit, aut duos rectos aut duobus rectis aequales angulos efficiet.",
      en: "If a line standing on a line makes angles, it makes either two right angles or angles equal to two right angles together.",
      greekPages: [36],
      latinPages: [37],
    },
    steps: [
      {
        title: "Take the two angles made on a straight line",
        phase: "Given",
        reason: "given",
        grc: "Εὐθεῖα γάρ τις ἡ ΑΒ ἐπ᾽ εὐθεῖαν τὴν ΓΔ σταθεῖσα γωνίας ποιείτω τὰς ὑπὸ ΓΒΑ, ΑΒΔ· λέγω, ὅτι αἱ ὑπὸ ΓΒΑ, ΑΒΔ γωνίαι ἤτοι δύο ὀρθαί εἰσιν ἢ δυσὶν ὀρθαῖς ἴσαι.",
        lat: "nam recta aliqua ΑΒ super rectam ΓΔ erecta angulos efficiat ΓΒΑ, ΑΒΔ. dico, angulos ΓΒΑ, ΑΒΔ aut duos rectos esse aut duobus rectis aequales.",
        en: "Let ΑΒ stand on the straight line ΓΔ and make angles ΓΒΑ and ΑΒΔ. I claim that they are either two right angles or equal to two right angles together.",
        greekPages: [36],
        latinPages: [37],
        language:
          "ἤτοι … ἤ / aut … aut separates two cases. In the second, δυσὶν ὀρθαῖς ἴσαι compares the pair's total with two right angles; it does not say the two original angles are equal to one another.",
      },
      {
        title: "If the adjacent angles are equal, use the definition",
        phase: "Prove",
        reason: "rightPairCase",
        grc: "Εἰ μὲν οὖν ἴση ἐστὶν ἡ ὑπὸ ΓΒΑ τῇ ὑπὸ ΑΒΔ, δύο ὀρθαί εἰσιν.",
        lat: "iam si ΓΒΑ = ΑΒΔ, duo recti sunt.",
        en: "If ΓΒΑ equals ΑΒΔ, they are two right angles.",
        greekPages: [36],
        latinPages: [37],
        language:
          "εἰ μέν introduces the first conditional branch. Set ΓΒΑ to 90° to inspect it. The definition requires both equality and adjacency; the following unequal-angle branch is unnecessary in that case.",
      },
      {
        title: "Otherwise construct a perpendicular at Β",
        phase: "Construct",
        reason: "raiseForPair",
        grc: "εἰ δὲ οὔ, ἤχθω ἀπὸ τοῦ Β σημείου τῇ ΓΔ [εὐθείᾳ] πρὸς ὀρθὰς ἡ ΒΕ· αἱ ἄρα ὑπὸ ΓΒΕ, ΕΒΔ δύο ὀρθαί εἰσιν·",
        lat: "sin minus, a Β puncto ad rectam ΓΔ perpendicularis ducatur ΒΕ. itaque ΓΒΕ, ΕΒΔ duo recti sunt.",
        en: "If not, draw ΒΕ from Β at right angles to ΓΔ. Thus ΓΒΕ and ΕΒΔ are two right angles.",
        greekPages: [36],
        latinPages: [37],
        language:
          "εἰ δὲ οὔ / sin minus means ‘if not’. Heiberg brackets εὐθείᾳ in the Greek; those brackets are retained. ΒΕ is constructed by I.11 rather than chosen by a protractor.",
      },
      {
        title: "Express the right-angle pair as three parts",
        phase: "Prove",
        reason: "addFirstAngles",
        grc: "καὶ ἐπεὶ ἡ ὑπὸ ΓΒΕ δυσὶ ταῖς ὑπὸ ΓΒΑ, ΑΒΕ ἴση ἐστίν, κοινὴ προσκείσθω ἡ ὑπὸ ΕΒΔ· αἱ ἄρα ὑπὸ ΓΒΕ, ΕΒΔ τρισὶ ταῖς ὑπὸ ΓΒΑ, ΑΒΕ, ΕΒΔ ἴσαι εἰσίν.",
        lat: "et quoniam ΓΒΕ = ΓΒΑ + ΑΒΕ, communis adiciatur ΕΒΔ. itaque ΓΒΕ + ΕΒΔ = ΓΒΑ + ΑΒΕ + ΕΒΔ.",
        en: "ΓΒΕ equals the two parts ΓΒΑ and ΑΒΕ. Add the common angle ΕΒΔ. Thus ΓΒΕ and ΕΒΔ together equal ΓΒΑ, ΑΒΕ and ΕΒΔ together.",
        greekPages: [36],
        latinPages: [37],
        language:
          "προσκείσθω / adiciatur commands addition to both equal descriptions. δυσί names two parts and τρισί three. Latin writes their sum with plus signs where Greek names the angles in prose.",
      },
      {
        title: "Express the original pair as those same parts",
        phase: "Prove",
        reason: "addSecondAngles",
        grc: "πάλιν, ἐπεὶ ἡ ὑπὸ ΔΒΑ δυσὶ ταῖς ὑπὸ ΔΒΕ, ΕΒΑ ἴση ἐστίν, κοινὴ προσκείσθω ἡ ὑπὸ ΑΒΓ· αἱ ἄρα ὑπὸ ΔΒΑ, ΑΒΓ τρισὶ ταῖς ὑπὸ ΔΒΕ, ΕΒΑ, ΑΒΓ ἴσαι εἰσίν.",
        lat: "rursus quoniam ΔΒΑ = ΔΒΕ + ΕΒΑ, communis adiiciatur ΑΒΓ. itaque ΔΒΑ + ΑΒΓ = ΔΒΕ + ΕΒΑ + ΑΒΓ.",
        en: "Again, ΔΒΑ equals ΔΒΕ and ΕΒΑ together. Add the common angle ΑΒΓ. The original pair ΔΒΑ and ΑΒΓ therefore equals the three parts ΔΒΕ, ΕΒΑ and ΑΒΓ.",
        greekPages: [36],
        latinPages: [37],
        language:
          "πάλιν / rursus repeats the addition strategy. Reversing an angle's outer letters leaves the same angle: ΔΒΕ is ΕΒΔ, ΕΒΑ is ΑΒΕ, and ΑΒΓ is ΓΒΑ. These are the same three parts in another order.",
      },
      {
        title: "Connect the two totals through the shared three parts",
        phase: "Prove",
        reason: "equalAngleSums",
        grc: "ἐδείχθησαν δὲ καὶ αἱ ὑπὸ ΓΒΕ, ΕΒΔ τρισὶ ταῖς αὐταῖς ἴσαι· τὰ δὲ τῷ αὐτῷ ἴσα καὶ ἀλλήλοις ἐστὶν ἴσα· καὶ αἱ ὑπὸ ΓΒΕ, ΕΒΔ ἄρα ταῖς ὑπὸ ΔΒΑ, ΑΒΓ ἴσαι εἰσίν·",
        lat: "sed demonstratum est, etiam ΓΒΕ + ΕΒΔ isdem tribus aequales esse. quae autem eidem aequalia sunt, etiam inter se aequalia sunt. quare etiam ΓΒΕ + ΕΒΔ = ΔΒΑ + ΑΒΓ.",
        en: "The right-angle pair ΓΒΕ and ΕΒΔ was also shown equal to those same three parts. Things equal to the same thing are equal to one another. Therefore ΓΒΕ and ΕΒΔ together equal ΔΒΑ and ΑΒΓ together.",
        greekPages: [36],
        latinPages: [37],
        language:
          "ἐδείχθησαν / demonstratum est recalls a result already proved. ταῖς αὐταῖς / isdem means ‘the same’, not merely ‘equal-looking’. This is the point where common notion 1 connects the two sums.",
      },
      {
        title: "The original pair equals two right angles",
        phase: "Prove",
        reason: "equalAngleSums",
        grc: "ἀλλὰ αἱ ὑπὸ ΓΒΕ, ΕΒΔ δύο ὀρθαί εἰσιν· καὶ αἱ ὑπὸ ΔΒΑ, ΑΒΓ ἄρα δυσὶν ὀρθαῖς ἴσαι εἰσίν.",
        lat: "uerum ΓΒΕ + ΕΒΔ duo recti sunt. itaque etiam ΔΒΑ + ΑΒΓ duobus rectis sunt aequales.",
        en: "ΓΒΕ and ΕΒΔ are two right angles. Hence ΔΒΑ and ΑΒΓ together equal two right angles.",
        greekPages: [36],
        latinPages: [37],
        language:
          "ἀλλά / uerum returns to the known right-angle pair. The numerical 180° check is a modern way to measure the resulting total, not an extra premise used in the source argument.",
      },
      {
        title: "The two cases establish the proposition",
        phase: "Conclude",
        reason: "finish",
        grc: "Ἐὰν ἄρα εὐθεῖα ἐπ᾽ εὐθεῖαν σταθεῖσα γωνίας ποιῇ, ἤτοι δύο ὀρθὰς ἢ δυσὶν ὀρθαῖς ἴσας ποιήσει· ὅπερ ἔδει δεῖξαι.",
        lat: "Ergo si recta super rectam lineam erecta angulos effecerit, aut duos rectos aut duobus rectis aequales angulos efficiet; quod erat demonstrandum.",
        en: "Therefore a line standing on a line makes either two right angles or angles equal to two right angles together. This is what had to be shown.",
        greekPages: [36, 38],
        latinPages: [37, 39],
        language:
          "The conclusion crosses a page break in both languages. δεῖξαι / demonstrandum closes a theorem, in contrast with the construction endings ποιῆσαι / fieri in I.11 and I.12.",
      },
    ],
    insight: {
      title: "A shared sum can prove an angle total",
      text: "The perpendicular divides the original pair into three pieces. Group them once as two right angles and again as the original pair. Their common sum connects the totals without assuming the theorem in advance. At the 90° setting the source's first branch applies directly.",
      link: "https://mathcs.clarku.edu/~djoyce/elements/bookI/propI13.html",
    },
    question: {
      prompt: "What does ‘equal to two right angles’ describe in the unequal case?",
      options: [
        "The sum of the two adjacent angles",
        "Each angle individually",
        "The angle between two parallel lines",
      ],
      correct: 0,
      explanations: [
        "Yes. Each original angle may differ from a right angle, while their total equals the constructed pair.",
        "That would force the equal-angle case. The second branch allows one acute and one obtuse angle.",
        "No parallel lines or parallel postulate are used here.",
      ],
    },
  },
  14: {
    id: 14,
    numeral: "I.14",
    greekNumeral: "ιδʹ",
    title: "Recover a straight line from its angle condition",
    shortTitle: "The converse",
    introduction:
      "Now reverse the implication. Adjacent angles totaling two right angles force the two outer rays to form one straight line. A different supposed continuation leads to unequal angles being declared equal.",
    statement: {
      grc: "Ἐὰν πρός τινι εὐθείᾳ καὶ τῷ πρὸς αὐτῇ σημείῳ δύο εὐθεῖαι μὴ ἐπὶ τὰ αὐτὰ μέρη κείμεναι τὰς ἐφεξῆς γωνίας δυσὶν ὀρθαῖς ἴσας ποιῶσιν, ἐπ᾽ εὐθείας ἔσονται ἀλλήλαις αἱ εὐθεῖαι.",
      lat: "Si duae rectae ad rectam aliquam et punctum eius non in eadem parte positae angulos deinceps positos duobus rectis aequales effecerint, in eadem erunt linea recta.",
      en: "If two lines at a point on a line, lying on different sides of it, make adjacent angles equal to two right angles together, then those two lines lie in one straight line.",
      greekPages: [38],
      latinPages: [39],
    },
    steps: [
      {
        title: "Keep the two-right-angle premise",
        phase: "Given",
        reason: "given",
        grc: "Πρὸς γάρ τινι εὐθείᾳ τῇ ΑΒ καὶ τῷ πρὸς αὐτῇ σημείῳ τῷ Β δύο εὐθεῖαι αἱ ΒΓ, ΒΔ μὴ ἐπὶ τὰ αὐτὰ μέρη κείμεναι τὰς ἐφεξῆς γωνίας τὰς ὑπὸ ΑΒΓ, ΑΒΔ δύο ὀρθαῖς ἴσας ποιείτωσαν· λέγω, ὅτι ἐπ᾽ εὐθείας ἐστὶ τῇ ΓΒ ἡ ΒΔ.",
        lat: "Nam ad rectam aliquam ΑΒ et punctum eius Β duae rectae ΒΓ, ΒΔ non in eadem parte positae angulos deinceps positos ΑΒΓ, ΑΒΔ duobus rectis aequales efficiant. dico, ΓΒ et ΒΔ in eadem recta esse.",
        en: "Let ΒΓ and ΒΔ stand on different sides of ΑΒ at Β, making adjacent angles ΑΒΓ and ΑΒΔ equal to two right angles together. I claim that ΓΒ and ΒΔ lie in one straight line.",
        greekPages: [38],
        latinPages: [39],
        language:
          "μὴ ἐπὶ τὰ αὐτὰ μέρη / non in eadem parte excludes placing both outer rays on the same side of ΑΒ. Heiberg's Greek body text prints δύο ὀρθαῖς, while the proposition statement uses δυσίν; the printed forms are retained.",
      },
      {
        title: "Suppose a different straight continuation ΒΕ",
        phase: "Prove",
        reason: "converseSupposition",
        grc: "Εἰ γὰρ μή ἐστι τῇ ΒΓ ἐπ᾽ εὐθείας ἡ ΒΔ, ἔστω τῇ ΓΒ ἐπ᾽ εὐθείας ἡ ΒΕ.",
        lat: "nam si ΒΓ et ΒΔ non sunt in eadem recta, ΓΒ et ΒΕ in eadem recta sint.",
        en: "If ΒΔ is not in a straight line with ΒΓ, let ΒΕ be the straight continuation of ΓΒ instead.",
        greekPages: [38],
        latinPages: [39],
        language:
          "εἰ … μή / si … non opens a temporary negative supposition. ἔστω / sint introduces its alternative. The hypothetical sketch cannot realize both the given angle condition and a different straight continuation; the plate states that limit explicitly.",
      },
      {
        title: "Apply I.13 under that temporary claim",
        phase: "Prove",
        reason: "conditionalLinearPair",
        grc: "Ἐπεὶ οὖν εὐθεῖα ἡ ΑΒ ἐπ᾽ εὐθεῖαν τὴν ΓΒΕ ἐφέστηκεν, αἱ ἄρα ὑπὸ ΑΒΓ, ΑΒΕ γωνίαι δύο ὀρθαῖς ἴσαι εἰσίν·",
        lat: "iam quoniam recta ΑΒ super rectam ΓΒΕ erecta est, ∠ ΑΒΓ + ΑΒΕ duobus rectis aequales sunt.",
        en: "Under the supposition that ΑΒ stands on the straight line ΓΒΕ, angles ΑΒΓ and ΑΒΕ together equal two right angles.",
        greekPages: [38],
        latinPages: [39],
        language:
          "ἐφέστηκεν / erecta est describes the standing-on relationship assumed in this branch. The English marks its conditional status; the source need not repeat ‘if’ at each consequence of the supposition.",
      },
      {
        title: "Compare with the originally given angle pair",
        phase: "Prove",
        reason: "compareGivenPair",
        grc: "εἰσὶ δὲ καὶ αἱ ὑπὸ ΑΒΓ, ΑΒΔ δύο ὀρθαῖς ἴσαι· αἱ ἄρα ὑπὸ ΓΒΑ, ΑΒΕ ταῖς ὑπὸ ΓΒΑ, ΑΒΔ ἴσαι εἰσίν.",
        lat: "uerum etiam ΑΒΓ + ΑΒΔ duobus rectis aequales sunt. itaque ΓΒΑ + ΑΒΕ = ΓΒΑ + ΑΒΔ.",
        en: "The given pair ΑΒΓ and ΑΒΔ also equals two right angles. Thus ΓΒΑ and ΑΒΕ together would equal ΓΒΑ and ΑΒΔ together.",
        greekPages: [38],
        latinPages: [39],
        language:
          "καί / etiam means ‘also’: it links the conditional total to the original premise. The source changes ΑΒΓ to ΓΒΑ; the outer-letter reversal leaves the same angle.",
      },
      {
        title: "Remove the common angle",
        phase: "Prove",
        reason: "removeCommonAngle",
        grc: "κοινὴ ἀφῃρήσθω ἡ ὑπὸ ΓΒΑ· λοιπὴ ἄρα ἡ ὑπὸ ΑΒΕ λοιπῇ τῇ ὑπὸ ΑΒΔ ἐστιν ἴση,",
        lat: "subtrahatur, qui communis est, ∠ ΓΒΑ. itaque ∠ ΑΒΕ = ΑΒΔ,",
        en: "Subtract the common angle ΓΒΑ. The remainder ΑΒΕ would therefore equal the remainder ΑΒΔ.",
        greekPages: [38],
        latinPages: [39],
        language:
          "ἀφῃρήσθω / subtrahatur commands subtraction. λοιπή names what remains after removing the same angle from both sums. The resulting equality is still under the supposition, not a measured equality of the sketch.",
      },
      {
        title: "The smaller cannot equal the larger",
        phase: "Prove",
        reason: "impossibleAnglePart",
        grc: "ἡ ἐλάσσων τῇ μείζονι· ὅπερ ἐστὶν ἀδύνατον.",
        lat: "minor maiori; quod fieri non potest.",
        en: "That would make the smaller equal to the larger, which is impossible.",
        greekPages: [38],
        latinPages: [39],
        language:
          "ἡ ἐλάσσων / minor identifies the smaller angle as the subject; τῇ μείζονι / maiori names the larger one it would equal. ἀδύνατον is negative: impossible. The actual sketch shows the proper-part inequality, not the conditional equality.",
      },
      {
        title: "Exclude other continuations and retain ΒΔ",
        phase: "Prove",
        reason: "impossibleAnglePart",
        grc: "οὐκ ἄρα ἐπ᾽ εὐθείας ἐστὶν ἡ ΒΕ τῇ ΓΒ. ὁμοίως δὴ δείξομεν, ὅτι οὐδὲ ἄλλη τις πλὴν τῆς ΒΔ· ἐπ᾽ εὐθείας ἄρα ἐστὶν ἡ ΓΒ τῇ ΒΔ.",
        lat: "quare ΒΕ et ΓΒ non sunt in eadem recta. similiter idem de quauis alia recta praeter ΒΔ demonstrabimus. itaque ΓΒ et ΒΔ in eadem recta sunt.",
        en: "Therefore ΒΕ cannot be the straight continuation of ΓΒ. Likewise any other line except ΒΔ is excluded. Hence ΓΒ and ΒΔ lie in one straight line.",
        greekPages: [38],
        latinPages: [39],
        language:
          "πλὴν / praeter means ‘except’. The rejection is not merely of the one drawn Ε: ὁμοίως / similiter extends it to any different proposed continuation.",
      },
      {
        title: "The angle condition forces a straight line",
        phase: "Conclude",
        reason: "finish",
        grc: "Ἐὰν ἄρα πρός τινι εὐθείᾳ καὶ τῷ πρὸς αὐτῇ σημείῳ δύο εὐθεῖαι μὴ ἐπὶ τὰ αὐτὰ μέρη κείμεναι τὰς ἐφεξῆς γωνίας δυσὶν ὀρθαῖς ἴσας ποιῶσιν, ἐπ᾽ εὐθείας ἔσονται ἀλλήλαις αἱ εὐθεῖαι· ὅπερ ἔδει δεῖξαι.",
        lat: "Ergo si duae rectae ad rectam aliquam et punctum eius non in eadem parte positae angulos deinceps positos duobus rectis aequales effecerint, in eadem erunt linea recta; quod erat demonstrandum.",
        en: "Therefore two lines on different sides of a line at its point, making adjacent angles equal to two right angles together, lie in one straight line. This is what had to be shown.",
        greekPages: [40],
        latinPages: [41],
        language:
          "The conclusion restores the full placement condition. I.13 went from a straight line to an angle total; I.14 has proved the converse rather than simply reading the earlier implication backward.",
      },
    ],
    insight: {
      title: "A contradiction sketch cannot satisfy everything",
      text: "The source supposes a different continuation while retaining the original angle premise. No plane figure can realize that combination. The plate follows the printed arrangement, labels its temporary sketch, and keeps measured angles distinct from the equality that the supposition would force. The original given figure returns when that supposition is rejected.",
      link: "https://mathcs.clarku.edu/~djoyce/elements/bookI/propI14.html",
    },
    question: {
      prompt: "Why does the plate not display the hypothetical remainders as numerically equal?",
      options: [
        "Their forced equality contradicts the smaller/larger relationship; no such plane figure realizes all the premises",
        "The numerical calculation is being used as Euclid's proof",
        "I.14 allows two different straight continuations",
      ],
      correct: 0,
      explanations: [
        "Yes. The conditional equality belongs to the contradiction argument. The sketch must not pretend to realize it.",
        "The logical contradiction uses the established angle relations and the whole–part principle. Measurements only check the displayed sketch.",
        "The contradiction excludes every different continuation under the stated angle and placement conditions.",
      ],
    },
  },
};
