export interface MesolabePassage {
  title: string;
  greek: string;
  latin: string;
  english: string;
  word: string;
  note: string;
  pages: readonly number[];
}
export const mesolabePassages: readonly MesolabePassage[] = [
  {
    title: "Double which magnitude?",
    greek:
      "τῶν γὰρ πλευρῶν διπλασιασθεισῶν τὸ μὲν ἐπίπεδον γίνεται τετραπλάσιον, τὸ δὲ στερεὸν ὀκταπλάσιον.",
    latin: "nam lateribus conduplicatis planum quadruplo maius fit, solidum uero octuplo maius.",
    english:
      "For when the sides have been doubled, the plane figure becomes fourfold, but the solid eightfold.",
    word: "διπλασιασθεισῶν · conduplicatis",
    note: "The Greek genitive absolute makes the doubled sides a condition for what follows; Latin uses an ablative absolute. τὸ μὲν … τὸ δὲ contrasts the plane figure with the solid. Eutocius transmits this correction within a story about Minos and a tomb. The story is a literary report, not evidence of an excavated building.",
    pages: [104, 105],
  },
  {
    title: "Two means, one continuing ratio",
    greek:
      "δεδόσθωσαν δύο ἄνισοι εὐθεῖαι, ὧν δεῖ δύο μέσας ἀνάλογον εὑρεῖν ἐν συνεχεῖ ἀναλογίᾳ, αἱ ΑΕ, ΔΘ.",
    latin:
      "datae sint duae lineae inaequales, inter quas duas medias proportionales inueniri oportet in proportione continua, ΑΕ, ΔΘ.",
    english:
      "Let two unequal straight lines, ΑΕ and ΔΘ, be given, between which two mean proportionals must be found in a continuing proportion.",
    word: "μέσας ἀνάλογον · medias proportionales",
    note: "μέσας is feminine plural: supply εὐθείας, straight lines. A mean here is an intermediate length, rather than the arithmetic average. ἐν συνεχεῖ ἀναλογίᾳ requires one continuing ratio: a:b = b:c = c:d. The next command places ΑΕ perpendicular to the baseline; this is where the p.109 diagram begins.",
    pages: [106, 107],
  },
  {
    title: "Keep the middle fixed",
    greek:
      "μένοντος δὴ τοῦ μέσου παραλληλογράμμου τοῦ ΖΙ συνωσθήτω τὸ μὲν ΑΖ ἐπάνω τοῦ μέσου, τὸ δὲ ΙΘ ὑποκάτω,",
    latin:
      "itaque manente parallelogrammo medio ΖΙ inter se adpropinquent ΑΖ supra medium, ΙΘ infra,",
    english:
      "While the middle parallelogram ΖΙ remains in place, let ΑΖ be pushed together above the middle one, and ΙΘ below it.",
    word: "μένοντος · manente",
    note: "Another absolute construction gives the condition during the movement. ἐπάνω / ὑποκάτω specifies the layers of the plates. The diagonal of the next plate becomes visible at each preceding plate's edge. The parallelograms are named by opposite corners; ΑΖ is also a diagonal. This workshop chooses square panels.",
    pages: [108, 109],
  },
  {
    title: "Until all four are on one line",
    greek:
      "καθάπερ ἐπὶ τοῦ δευτέρου σχήματος, ἕως οὗ γένηται τὰ Α, Β, Γ, Δ κατ᾽ εὐθεῖαν, καὶ διήχθω διὰ τῶν Α, Β, Γ, Δ σημείων εὐθεῖα καὶ συμπιπτέτω τῇ ΕΘ ἐκβληθείσῃ κατὰ τὸ Κ.",
    latin:
      "ut in figura secunda, dum puncta Α, Β, Γ, Δ in eadem linea recta sint, et per Α, Β, Γ, Δ puncta ducatur linea et concurrat cum ΕΘ producta in Κ.",
    english:
      "As in the second figure, until Α, Β, Γ and Δ lie on a straight line; draw a straight line through these points and let it meet ΕΘ extended at Κ.",
    word: "ἕως οὗ γένηται · dum … sint",
    note: "Until sets the stopping condition. Lining up just one contact is insufficient. διήχθω and συμπιπτέτω command a line to be drawn through the points and to meet the extended baseline. Latin's inline page reference is omitted here. In the experiment the straightedge always joins Α and Δ, while Β and Γ remain independent tests.",
    pages: [108, 109],
  },
  {
    title: "What the parallel lines establish",
    greek:
      "ἀλλ᾽ ὡς ἡ ΕΚ πρὸς ΚΖ, ἡ ΑΕ πρὸς ΒΖ, ὡς δὲ ἡ ΖΚ πρὸς ΚΗ, ἡ ΒΖ πρὸς ΓΗ, ὡς δὲ ἡ ΗΚ πρὸς ΚΘ, ἡ ΓΗ πρὸς ΔΘ. καὶ ὡς ἄρα ἡ ΑΕ πρὸς ΒΖ, ἡ ΒΖ πρὸς ΓΗ, καὶ ἡ ΓΗ πρὸς ΔΘ. ηὕρηνται ἄρα τῶν ΑΕ, ΔΘ δύο μέσαι ἥ τε ΒΖ καὶ ἡ ΓΗ.",
    latin:
      "sed ΕΚ : ΚΖ = ΑΕ : ΒΖ et ΖΚ : ΚΗ = ΒΖ : ΓΗ, et ΗΚ : ΚΘ = ΓΗ : ΔΘ. itaque etiam erit ΑΕ : ΒΖ = ΒΖ : ΓΗ = ΓΗ : ΔΘ. itaque inter ΑΕ, ΔΘ duae mediae inuentae sunt, ΒΖ et ΓΗ.",
    english:
      "But as ΕΚ is to ΚΖ, so ΑΕ is to ΒΖ; as ΖΚ to ΚΗ, so ΒΖ to ΓΗ; and as ΗΚ to ΚΘ, so ΓΗ to ΔΘ. Therefore ΑΕ is to ΒΖ as ΒΖ to ΓΗ and ΓΗ to ΔΘ. The two means between ΑΕ and ΔΘ have therefore been found: ΒΖ and ΓΗ.",
    word: "ὡς … πρὸς … · :",
    note: "Greek writes the comparisons out; Heiberg's nineteenth-century Latin translation uses ratio symbols and equality signs. The preceding proof first establishes the equal baseline ratios using both vertical and diagonal parallels. The diagram below expands that intermediate step. It is not enough for one pair of triangles to be similar.",
    pages: [108, 109],
  },
  {
    title: "A physical instrument",
    greek:
      "ἵνα δὲ καὶ ὀργανικῶς δυνώμεθα τὰς δύο μέσας λαμβάνειν, διαπήγνυται πλινθίον ξύλινον ἢ ἐλεφάντινον ἢ χαλκοῦν ἔχον τρεῖς πινακίσκους ἴσους ὡς λεπτοτάτους, ὧν ὁ μὲν μέσος ἐνήρμοσται, οἱ δὲ δύο ἐπωστοί εἰσιν ἐν χολέδραις,",
    latin:
      "sed ut per instrumenta etiam duas medias sumere possimus, construatur laterculus ligneus uel eburneus uel aheneus tres tabellulas aequales complectens quam maxime exiles, quarum media adfixa sit, duae autem in strigis moueri possint,",
    english:
      "So that we may also take the two means by an instrument, a wooden, ivory or bronze frame is put together, holding three equal plates as thin as possible: the middle one is fitted in place, and the other two can slide in grooves.",
    word: "πινακίσκους · tabellulas",
    note: "The diminutive means small panels or plates. ὡς with the superlative λεπτοτάτους means as thin as possible. The passage later asks for parallel, close-fitting motion; Heiberg's p.111 footnote questions how easy this is. The digital model assumes exact rails and zero thickness. Its paper sheet is an exploration aid, not evidence of an ancient surviving instrument or a verified fabrication plan.",
    pages: [110, 111],
  },
  {
    title: "Bring the plates together",
    greek: "συνάγω δὴ τοὺς ἐν τῷ ὀργάνῳ πίνακας, ἕως ἂν κατ᾽ εὐθεῖαν γένηται τὰ Α, Β, Γ, Δ σημεῖα.",
    latin:
      "admoueo igitur tabellulas instrumenti, dum puncta Α, Β, Γ, Δ in eadem linea recta sint.",
    english:
      "I bring the plates in the instrument together, until the points Α, Β, Γ and Δ lie on a straight line.",
    word: "συνάγω · admoueo",
    note: "The letter now gives a shorter account said to accompany a dedication. The first-person present describes operating the device; it does not itself establish the accuracy of a physical example. The second figure is on p.112. Heiberg's editorial discussion of the repeated figure remains visible on p.111.",
    pages: [110, 111, 112],
  },
  {
    title: "One more plate than means",
    greek:
      "ἐὰν δὲ πλείους μέσας ἐπιταχθῇ εὑρεῖν, ἀεὶ ἑνὶ πλείους πινακίσκους καταστησόμεθα ἐν τῷ ὀργανίῳ τῶν ληφθησομένων μέσων· ἡ δὲ ἀπόδειξις ἡ αὐτή.",
    latin:
      "sin plures medias sumere iussi erimus, una plures tabellas in instrumento inserentes, quam quot mediae sumendae sunt; et demonstratio eadem est.",
    english:
      "If we are instructed to find more means, we shall always place in the instrument one more plate than the means to be taken; the proof is the same.",
    word: "ἑνὶ πλείους · una plures",
    note: "ἑνί is a dative of measure: more by one. Three plates give two means and a cube-root ratio. Four would give three means and a fourth-root ratio. This workshop operates the three-plate case only. The Latin's footnote marker is omitted; the remainder of the letter and its poem are available in the scans but are not fully translated here.",
    pages: [112, 113],
  },
];

export const mesolabeStages = [
  {
    title: "Four lengths",
    text: "ΑΕ and ΔΘ are given. The exposed contacts Β and Γ supply candidate lengths ΒΖ and ΓΗ. Move both plates until all four upper points lie on the straightedge.",
    passage: 1,
  },
  {
    title: "Vertical parallels",
    text: "With Α, Β, Γ, Δ on the line to Κ, vertical parallels give ΑΚ/ΒΚ = ΕΚ/ΖΚ = ΑΕ/ΒΖ. The blue triangles share their angle at Κ.",
    passage: 3,
  },
  {
    title: "Diagonal parallels",
    text: "The parallel diagonals ΑΖ and ΒΗ also give ΑΚ/ΒΚ = ΖΚ/ΗΚ. So ΕΚ/ΖΚ = ΖΚ/ΗΚ. The purple triangles use the same sloping upper line, with different lower sides.",
    passage: 4,
  },
  {
    title: "Repeat at Γ",
    text: "Repeat with Β, Γ: vertical parallels give ΒΚ/ΓΚ = ΖΚ/ΗΚ; parallel diagonals ΒΗ and ΓΘ give ΒΚ/ΓΚ = ΗΚ/ΘΚ. Thus all three successive baseline ratios agree, and so do the corresponding vertical ratios.",
    passage: 4,
  },
  {
    title: "A cube follows",
    text: "Write the common ratio as r. Then a/d = (a/b)(b/c)(c/d) = r³. The new edge is c/d = r times the old edge; its cube has a/d times the volume. The source's ratios become the modern algebra shown here.",
    passage: 4,
  },
] as const;
