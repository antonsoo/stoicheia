export interface QuadratrixPassage {
  title: string;
  greek: string;
  latin: string;
  english: string;
  pages: readonly [number, number];
  note: string;
  words: readonly { greek: string; latin: string; english: string }[];
}
export const quadratrixBoundary =
  "Selected clauses from Pappus, Collection IV.30–32, Hultsch 1876 I pp.250–259. Greek and Hultsch’s Latin are retained edition readings; English, coordinates, clock experiments and limit calculation are new. This is not a complete translation or a physical instrument reconstruction. The program uses π to prescribe the motion; it does not construct or discover π independently.";
export const quadratrixPassages: readonly QuadratrixPassage[] = [
  {
    title: "A name from a property",
    greek: "καλεῖται γὰρ ὑπ’ αὐτῶν τετραγωνίζουσα καὶ γένεσιν ἔχει τοιαύτην.",
    latin: "Quadratrix enim ab illis vocatur et huiusmodi ortum habet.",
    english: "For they call it the squaring curve, and it comes into being in the following way.",
    pages: [252, 253],
    note: "The preceding sentence names Dinostratus, Nicomedes and other later geometers as users of the curve. This passage does not supply a biography of its inventor. The participle names a task: making square.",
    words: [
      {
        greek: "τετραγωνίζουσα",
        latin: "quadratrix",
        english:
          "‘squaring’: a feminine participle agreeing with the understood γραμμή, line or curve.",
      },
      {
        greek: "γένεσιν",
        latin: "ortum",
        english:
          "coming into being, generation. Here the following motion describes how the curve is produced.",
      },
    ],
  },
  {
    title: "In the same time",
    greek:
      "καὶ ἐν ἴσῳ χρόνῳ ἥ τε ΑΒ κινουμένη ὁμαλῶς τὴν ὑπὸ ΒΑΔ γωνίαν, τουτέστιν τὸ Β σημεῖον τὴν ΒΕΔ περιφέρειαν, διανυέτω, καὶ ἡ ΒΓ τὴν ΒΑ εὐθεῖαν παροδευέτω, τουτέστιν τὸ Β σημεῖον κατὰ τῆς ΒΑ φερέσθω.",
    latin:
      "atque eodem tempore et recta ΑΒ aequabiliter progrediens angulum ΒΑΔ, id est punctum Β circumferentiam ΒΕΔ, percurrat, et recta ΒΓ ipsam ΒΑ praetervehatur, id est punctum Β rectam ΒΑ permeet.",
    english:
      "In the same time, let AB move uniformly through the angle BAD—that is, let the point B traverse the arc BED—and let BG travel over the straight line BA, that is, let the point B move along BA.",
    pages: [252, 253],
    note: "The source uses B for two moving points: the end rotating along the arc and the end sliding down BA. Hultsch explains this in his p.253 footnote. Our plate calls them E and S to keep them distinct. Both motions are uniform in this model; reading 4 supplies their proportional progress.",
    words: [
      {
        greek: "ἐν ἴσῳ χρόνῳ",
        latin: "eodem tempore",
        english:
          "in an equal time. Equal arrival times do not mean equal distances or equal linear speeds.",
      },
      {
        greek: "ὁμαλῶς",
        latin: "aequabiliter",
        english:
          "uniformly, at an even rate. This is a condition on the motion, not an effect of drawing a smooth curve.",
      },
    ],
  },
  {
    title: "One moving intersection",
    greek:
      "τοιαύτης δὴ γινομένης κινήσεως τεμοῦσιν ἀλλήλας ἐν τῇ φορᾷ αἱ ΒΓ ΒΑ εὐθεῖαι κατά τι σημεῖον αἰεὶ συμμεθιστάμενον αὐταῖς",
    latin:
      "Itaque, dum huiusmodi motus peragitur, rectae ΒΑ ΒΓ in eo motu sese invicem secabunt in puncto aliquo semper cum ipsis progrediente",
    english:
      "As this motion takes place, the straight lines BG and BA intersect one another during their movement at a point that continually changes position along with them.",
    pages: [252, 253],
    note: "This is a selected clause, ending before the description of the curve it draws. Follow Z: it must lie on both moving lines, not merely on a pre-drawn curve. In the timing experiments the full lines can meet outside the square, or cease to meet altogether.",
    words: [
      {
        greek: "τεμοῦσιν ἀλλήλας",
        latin: "sese invicem secabunt",
        english:
          "they will cut one another. The future tense describes the consequence of the prescribed motion.",
      },
      {
        greek: "συμμεθιστάμενον",
        latin: "cum ipsis progrediente",
        english:
          "changing position together with them; a participle describing the intersection point.",
      },
    ],
  },
  {
    title: "The same fraction of the journey",
    greek:
      "ἥτις γὰρ ἂν διαχθῇ τυχοῦσα πρὸς τὴν περιφέρειαν, ὡς ἡ ΑΖΕ, ἔσται ὡς ὅλη ἡ περιφέρεια πρὸς τὴν ΕΔ, ἡ ΒΑ εὐθεῖα πρὸς τὴν ΖΘ· τοῦτο γὰρ ἐκ τῆς γενέσεως τῆς γραμμῆς φανερόν ἐστιν.",
    latin:
      "Principalis autem eius proprietas haec est, ut, si quaelibet recta, velut ΑΖΕ, ad circumferentiam ducatur, sit ut tota circumferentia ΒΕΔ ad ΕΔ, ita recta ΒΑ ad ΖΘ; hoc enim ex ortu lineae manifestum est.",
    english:
      "For any line drawn to the circumference, such as AZE, the whole arc is to ED as the straight line BA is to ZΘ. This follows plainly from the generation of the curve.",
    pages: [252, 253],
    note: "With the side set to one, this says remaining arc / quarter-arc = ZΘ / BA = u. The experiment writes the angle in radians as θ = πu/2. That coordinate notation and the function cotangent are modern explanatory tools.",
    words: [
      {
        greek: "περιφέρεια",
        latin: "circumferentia",
        english:
          "circumference or arc, depending on context. Here the ‘whole’ arc is only a quarter-circle.",
      },
      {
        greek: "ὡς … πρὸς …",
        latin: "ut … ad …",
        english: "as … is to …: the two matching comparisons state a proportion.",
      },
    ],
  },
  {
    title: "A ratio already assumed?",
    greek: "ἐν γὰρ τούτῳ τῷ λόγῳ καὶ τὰ τάχη τῶν κινήσεων ἀνάγκη εἶναι.",
    latin: "Nam in eadem proportione etiam celeritates motuum esse oportet.",
    english: "For the speeds of the motions must also be in this ratio.",
    pages: [254, 255],
    note: "Pappus reports Sporus’s question: how can the two points arrive together without first knowing the ratio of the straight path to the arc? These are distances travelled per time, not an equality between angular and linear units. This is a reported objection; Hultsch’s note on p.253 disputes its force. The program supplies π when programming the motion.",
    words: [
      {
        greek: "λόγῳ",
        latin: "proportione",
        english:
          "ratio, in this geometric setting. The same Greek word can mean an account or argument elsewhere.",
      },
      {
        greek: "τάχη",
        latin: "celeritates",
        english:
          "speeds, plural. Matching completion times for different path lengths requires different speeds.",
      },
    ],
  },
  {
    title: "The missing end",
    greek:
      "ἔπειτα δὲ τὸ πέρας αὐτῆς ᾧ χρῶνται πρὸς τὸν τετραγωνισμὸν τοῦ κύκλου, τουτέστιν καθ’ ὃ τέμνει σημεῖον τὴν ΑΔ εὐθεῖαν, οὐχ εὑρίσκεται.",
    latin:
      "Praeterea lineae terminus, quem ad quadraturam circuli adhibent, id est punctum, in quo linea rectam ΑΔ secat, nequaquam invenitur.",
    english:
      "Next, its endpoint, which they use for squaring the circle—that is, the point where it cuts the straight line AD—is not found.",
    pages: [254, 255],
    note: "The negative concerns obtaining the point by the stated generation. It is not a claim that the mathematical limit does not exist. Stop a little before the finish, then reach the finish exactly.",
    words: [
      {
        greek: "πέρας",
        latin: "terminus",
        english:
          "end or boundary. Here it is the intercept used in the quadrature, not the current moving point.",
      },
      {
        greek: "οὐχ εὑρίσκεται",
        latin: "nequaquam invenitur",
        english:
          "is not found. Do not turn this statement about the procedure into ‘there is no limit’.",
      },
    ],
  },
  {
    title: "Coincidence removes the unique point",
    greek:
      "ὁπόταν γὰρ αἱ ΓΒ ΒΑ φερόμεναι συναποκατασταθῶσιν, ἐφαρμόσουσιν τῇ ΑΔ καὶ τομὴν οὐκέτι ποιήσουσιν ἐν ἀλλήλαις",
    latin:
      "Nam si rectae ΑΒ ΒΓ simul ad finem motus deductae erunt, cum ipsa ΑΔ congruent neque amplius sese invicem secabunt.",
    english:
      "When the moving lines GB and BA arrive together, they coincide with AD and no longer make an intersection with one another.",
    pages: [254, 255],
    note: "The Greek selection ends before its explanatory continuation. In modern set language the coincident lines have infinitely many common points. ‘No intersection’ here means no distinct crossing that selects the moving point. Our end state therefore records ‘coincident’, with no unique Z; it never substitutes H for that result.",
    words: [
      {
        greek: "ἐφαρμόσουσιν",
        latin: "congruent",
        english: "they will fit or coincide. This is different from crossing at one point.",
      },
      {
        greek: "οὐκέτι",
        latin: "neque amplius",
        english: "no longer: the change at the exact final instant matters.",
      },
    ],
  },
  {
    title: "The theorem after the objection",
    greek: "δείκνυται, ὡς ἡ ΔΕΒ περιφέρεια πρὸς τὴν ΒΓ εὐθεῖαν, οὕτως ἡ ΒΓ πρὸς τὴν ΓΘ εὐθεῖαν.",
    latin: "demonstratur esse ut circumferentiam ΒΕΔ ad rectam ΒΓ, ita rectam ΒΓ ad ΓΘ.",
    english:
      "It is proved that the arc DEB is to the straight line BG as BG is to the straight line GΘ.",
    pages: [256, 257],
    note: "The source changes its diagram labels: Γ is now the centre and Θ the intercept, corresponding to A and H in our motion plate. For a unit side, the theorem is (π/2) : 1 = 1 : AH. Pappus gives a geometric argument by contradiction on pp.256–259. Our limit calculation is a different, modern argument. The following paragraph explains rectification and then squaring, invoking Archimedes.",
    words: [
      {
        greek: "δείκνυται",
        latin: "demonstratur",
        english:
          "it is shown or proved. The text continues with mathematical reasoning after reporting the objections.",
      },
      {
        greek: "εὐθεῖαν",
        latin: "rectam",
        english:
          "straight line, with γραμμή understood. In a ratio this means the length of the indicated segment.",
      },
    ],
  },
];
