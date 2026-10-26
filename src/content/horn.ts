export interface HornPassage {
  title: string;
  greek: string;
  latin: string;
  latinRole: string;
  english: string;
  note: string;
  pages: readonly [number, number];
  words: readonly { greek: string; latin: string; english: string }[];
}
export const hornBoundary =
  "Euclid, Elements III.16, selected Greek and J. L. Heiberg’s Latin, 1883 volume I, pp.208–213. The coordinate certificate and magnifier are modern teaching devices. The source calls the curved remainder smaller than every acute rectilinear angle; we do not assign that curved region a positive number of degrees or construct a system of infinitesimal numbers.";
export const hornPassages: readonly HornPassage[] = [
  {
    title: "Smaller than every rectilinear angle",
    greek:
      "Ἡ τῇ διαμέτρῳ τοῦ κύκλου πρὸς ὀρθὰς ἀπ’ ἄκρας ἀγομένη ἐκτὸς πεσεῖται τοῦ κύκλου, καὶ εἰς τὸν μεταξὺ τόπον τῆς τε εὐθείας καὶ τῆς περιφερείας ἑτέρα εὐθεῖα οὐ παρεμπεσεῖται, καὶ ἡ μὲν τοῦ ἡμικυκλίου γωνία ἁπάσης γωνίας ὀξείας εὐθυγράμμου μείζων ἐστίν, ἡ δὲ λοιπὴ ἐλάττων.",
    latin:
      "Recta, quae ad diametrum circuli in termino perpendicularis erigitur, extra circulum cadet, nec in spatium inter rectam et ambitum ulla alia recta interponetur, et angulus semicirculi quouis acuto angulo rectilineo maior est, reliquus autem minor.",
    latinRole: "HEIBERG’S LATIN",
    english:
      "The line drawn at right angles to a circle’s diameter from its end will fall outside the circle. No other straight line will fit between that line and the circumference. The angle of the semicircle is greater than every acute rectilinear angle, and the remaining angle is smaller.",
    note: "The remaining angle has one curved boundary. Rectilinear means bounded by straight lines. The horn angle is a later descriptive name; this statement calls it the remaining angle.",
    pages: [208, 209],
    words: [
      {
        greek: "ἁπάσης",
        latin: "quouis",
        english:
          "Every / any: the universal comparison carries the claim. Trying many slopes cannot replace it.",
      },
      {
        greek: "εὐθυγράμμου",
        latin: "rectilineo",
        english:
          "Straight-lined. Greek genitive singular agrees with γωνίας; Latin ablative gives the object of comparison after maior/minor.",
      },
    ],
  },
  {
    title: "Why the perpendicular stays outside",
    greek:
      "Ἐπεὶ ἴση ἐστὶν ἡ ΔΑ τῇ ΔΓ, ἴση ἐστὶ καὶ γωνία ἡ ὑπὸ ΔΑΓ γωνίᾳ τῇ ὑπὸ ΑΓΔ. ὀρθὴ δὲ ἡ ὑπὸ ΔΑΓ· ὀρθὴ ἄρα καὶ ἡ ὑπὸ ΑΓΔ· τριγώνου δὴ τοῦ ΑΓΔ αἱ δύο γωνίαι αἱ ὑπὸ ΔΑΓ, ΑΓΔ δύο ὀρθαῖς ἴσαι εἰσίν· ὅπερ ἐστὶν ἀδύνατον.",
    latin:
      "quoniam ΔΑ = ΔΓ, erit etiam ∠ ΔΑΓ = ΑΓΔ. uerum ∠ ΔΑΓ rectus est. itaque etiam ∠ ΑΓΔ rectus. ergo trianguli ΑΓΔ duo anguli ΔΑΓ + ΑΓΔ duobus rectis aequales sunt; quod fieri non potest.",
    latinRole: "HEIBERG’S LATIN",
    english:
      "Since ΔΑ equals ΔΓ, angle ΔΑΓ also equals angle ΑΓΔ. But ΔΑΓ is right, so ΑΓΔ is right too. Thus two angles of triangle ΑΓΔ equal two right angles, which is impossible.",
    note: "This is the first contradiction, before the gap argument: suppose the perpendicular met the circumference again at Γ. Equal radii give equal base angles (I.5), whereas any two triangle angles together are less than two right angles (I.17). Γ belongs to that hypothetical diagram; Κ in our experiment is a separately added crossing of a tilted ray.",
    pages: [208, 209],
    words: [
      {
        greek: "ἴση … τῇ",
        latin: "aequales",
        english:
          "Equal to: the Greek dative names the other magnitude. The repeated equality propagates a right angle to the other vertex.",
      },
      {
        greek: "ἀδύνατον",
        latin: "fieri non potest",
        english:
          "Impossible / cannot happen. The proof rejects its temporary supposition, rather than accepting a triangle with two right angles.",
      },
    ],
  },
  {
    title: "Try to put a line into the gap",
    greek:
      "Πιπτέτω ὡς ἡ ΑΕ· λέγω δή, ὅτι εἰς τὸν μεταξὺ τόπον τῆς τε ΑΕ εὐθείας καὶ τῆς ΓΘΑ περιφερείας ἑτέρα εὐθεῖα οὐ παρεμπεσεῖται.",
    latin:
      "cadat ut ΑΕ. dico, in spatium inter rectam ΑΕ et ambitum ΓΘΑ aliam rectam interponi non posse.",
    latinRole: "HEIBERG’S LATIN",
    english:
      "Let it fall as ΑΕ. I now say that no other straight line can be put into the space between straight line ΑΕ and circumference ΓΘΑ.",
    note: "The ray must start at A on the circle’s side of the tangent. A ray directed below the tangent stays outside, but it is on the wrong side to occupy this gap. A coincident tangent supplies no positive rectilinear angle.",
    pages: [210, 211],
    words: [
      {
        greek: "μεταξὺ τόπον",
        latin: "spatium inter",
        english:
          "The space between: τόπον is accusative after εἰς. Both boundaries matter; merely staying outside the circle is insufficient.",
      },
      {
        greek: "οὐ παρεμπεσεῖται",
        latin: "interponi non posse",
        english:
          "Will not fall between / cannot be interposed. The Greek future denies the proposed construction; the Latin uses an infinitive after dico.",
      },
    ],
  },
  {
    title: "Drop the perpendicular",
    greek:
      "Εἰ γὰρ δυνατόν, παρεμπιπτέτω ὡς ἡ ΖΑ, καὶ ἤχθω ἀπὸ τοῦ Δ σημείου ἐπὶ τὴν ΖΑ κάθετος ἡ ΔΗ. καὶ ἐπεὶ ὀρθή ἐστιν ἡ ὑπὸ ΑΗΔ, ἐλάττων δὲ ὀρθῆς ἡ ὑπὸ ΔΑΗ, μείζων ἄρα ἡ ΑΔ τῆς ΔΗ. ἴση δὲ ἡ ΔΑ τῇ ΔΘ· μείζων ἄρα ἡ ΔΘ τῆς ΔΗ, ἡ ἐλάττων τῆς μείζονος· ὅπερ ἐστὶν ἀδύνατον.",
    latin:
      "nam, si fieri potest, interponatur ut ΖΑ, et a Δ puncto ad ΖΑ perpendicularis ducatur ΔΗ. et quoniam ∠ ΑΗΔ rectus est, et ∠ ΔΑΗ minor recto, erit ΑΔ > ΔΗ. sed ΔΑ = ΔΘ. ergo ΔΘ > ΔΗ, minor maiore; quod fieri non potest.",
    latinRole: "HEIBERG’S LATIN",
    english:
      "For, if possible, let a line be put between them as ΖΑ, and draw ΔΗ perpendicular from Δ to ΖΑ. Since ΑΗΔ is right and ΔΑΗ is less than right, ΑΔ is greater than ΔΗ. But ΔΑ equals ΔΘ. So ΔΘ is greater than ΔΗ—the smaller greater than the larger—which is impossible.",
    note: "The contradiction uses the temporary assumption that the line lies beyond the circumference: along ΔH, the circle would be reached at Θ before H. The right triangle instead puts H closer to Δ than a radius. Our realizable diagram shows H inside the circle; it does not pretend to realize the impossible outside arrangement. The print’s Latin reference is to I.19.",
    pages: [210, 211],
    words: [
      {
        greek: "ἤχθω",
        latin: "ducatur",
        english:
          "Let it be drawn: Greek perfect passive imperative, Latin present passive subjunctive. Both issue a construction instruction.",
      },
      {
        greek: "ἐλάττων … μείζων",
        latin: "minor … maiore",
        english:
          "Smaller / greater. The opposed comparatives expose the contradiction about the same two distances.",
      },
    ],
  },
  {
    title: "One right angle, two curved parts",
    greek:
      "Λέγω, ὅτι καὶ ἡ μὲν τοῦ ἡμικυκλίου γωνία ἡ περιεχομένη ὑπό τε τῆς ΒΑ εὐθείας καὶ τῆς ΓΘΑ περιφερείας ἁπάσης γωνίας ὀξείας εὐθυγράμμου μείζων ἐστίν, ἡ δὲ λοιπὴ ἡ περιεχομένη ὑπό τε τῆς ΓΘΑ περιφερείας καὶ τῆς ΑΕ εὐθείας ἁπάσης γωνίας ὀξείας εὐθυγράμμου ἐλάττων ἐστίν.",
    latin:
      "dico etiam, angulum semicirculi recta ΒΑ et arcu ΓΘΑ comprehensum quouis acuto angulo rectilineo maiorem esse, reliquum autem arcu ΓΘΑ et recta ΑΕ comprehensum quouis acuto angulo rectilineo minorem esse.",
    latinRole: "HEIBERG’S LATIN",
    english:
      "I also say that the semicircle’s angle, bounded by straight line ΒΑ and circumference ΓΘΑ, exceeds every acute rectilinear angle; the remaining angle, bounded by circumference ΓΘΑ and straight line ΑΕ, is less than every acute rectilinear angle.",
    note: "Do not confuse the ‘angle of the semicircle’ here with an inscribed angle in a semicircle. This one has a curved side. The two curved parts divide the right-angle region at A. Our displayed degree value always belongs to the candidate ray and the tangent, never to the curved remainder.",
    pages: [210, 211],
    words: [
      {
        greek: "ἡ μὲν … ἡ δὲ",
        latin: "… autem",
        english:
          "The one … the other: the paired articles organize two different comparisons, not two numerical degree measurements.",
      },
      {
        greek: "περιεχομένη",
        latin: "comprehensum",
        english:
          "Bounded / enclosed. The following straight line and circumference specify the angle’s two sides.",
      },
    ],
  },
  {
    title: "The missing line decides both comparisons",
    greek:
      "οὐ παρεμπίπτει δέ· οὐκ ἄρα τῆς περιεχομένης γωνίας ὑπό τε τῆς ΒΑ εὐθείας καὶ τῆς ΓΘΑ περιφερείας ἔσται μείζων ὀξεῖα ὑπὸ εὐθειῶν περιεχομένη, οὐδὲ μὴν ἐλάττων τῆς περιεχομένης ὑπό τε τῆς ΓΘΑ περιφερείας καὶ τῆς ΑΕ εὐθείας.",
    latin:
      "uerum non interponitur recta. itaque nullus angulus acutus rectis comprehensus maior erit angulo comprehenso recta ΒΑ et arcu ΓΘΑ nec minor angulo comprehenso arcu ΓΘΑ et recta ΑΕ.",
    latinRole: "HEIBERG’S LATIN",
    english:
      "But no line falls between them. Therefore no acute angle bounded by straight lines will be greater than the angle bounded by ΒΑ and circumference ΓΘΑ, nor smaller than the angle bounded by circumference ΓΘΑ and straight line ΑΕ.",
    note: "This selected conclusion follows the intervening reductio across pp.210–213; the whole printed argument is available in the source viewer. Euclid’s geometric comparison is the historical argument. Our algebra supplies an additional exact witness for every permitted coordinate trial.",
    pages: [212, 213],
    words: [
      {
        greek: "οὐκ ἄρα",
        latin: "itaque nullus",
        english:
          "Therefore not / therefore none: the conclusion depends on the excluded line, rather than the number of examples tried.",
      },
      {
        greek: "οὐδὲ μήν",
        latin: "nec",
        english: "Nor indeed: the second denial completes the paired angle comparisons.",
      },
    ],
  },
  {
    title: "A corollary about touching",
    greek:
      "Ἐκ δὴ τούτου φανερόν, ὅτι ἡ τῇ διαμέτρῳ τοῦ κύκλου πρὸς ὀρθὰς ἀπ’ ἄκρας ἀγομένη ἐφάπτεται τοῦ κύκλου.",
    latin:
      "Hinc manifestum est, rectam ad diametrum circuli in termino perpendicularem erectam circulum contingere.",
    latinRole: "HEIBERG’S LATIN",
    english:
      "From this it is clear that the straight line drawn at right angles to a circle’s diameter from its end touches the circle.",
    note: "The source heading is Πόρισμα / Corollarium. This selection gives the common unbracketed claim. The next reading preserves a further Greek addition, printed in square brackets, for which Heiberg supplies an editorial discussion rather than a facing Latin translation.",
    pages: [212, 213],
    words: [
      {
        greek: "φανερόν",
        latin: "manifestum",
        english: "Clear / evident. The implication comes from the preceding geometric argument.",
      },
      {
        greek: "ἐφάπτεται",
        latin: "contingere",
        english:
          "Touches. Greek ἐφάπτεται takes the genitive τοῦ κύκλου; Latin contingere takes the accusative circulum.",
      },
    ],
  },
  {
    title: "A bracket is evidence too",
    greek:
      "[καὶ ὅτι εὐθεῖα κύκλου καθ’ ἓν μόνον ἐφάπτεται σημεῖον, ἐπειδήπερ καὶ ἡ κατὰ δύο αὐτῷ συμβάλλουσα ἐντὸς αὐτοῦ πίπτουσα ἐδείχθη]",
    latin:
      "Pars altera corollarii, per se quoque suspecta, sine dubio a Theone addita est; om. praeter P m. 1 etiam Campanus.",
    latinRole: "HEIBERG’S EDITORIAL NOTE · NOT A TRANSLATION",
    english:
      "[And that a straight line touches a circle at only one point, since a line meeting it at two points was also shown to fall inside it.]",
    note: "The Greek brackets belong to the edition. The Latin is the opening of Heiberg’s footnote, not a parallel translation: he judges the second part of the corollary an addition by Theon and reports its omission in witnesses. His attribution is an editorial judgment, not a date established by our experiment. The complete footnote remains on p.213.",
    pages: [212, 213],
    words: [
      {
        greek: "καθ’ ἓν μόνον",
        latin: "Pars altera corollarii",
        english:
          "At only one [point]. The Latin instead says ‘the second part of the corollary’: it discusses the Greek addition rather than translating it.",
      },
      {
        greek: "ἐδείχθη",
        latin: "a Theone addita est",
        english:
          "Was shown: Greek aorist passive refers back to a proof. The Latin ‘was added by Theon’ is Heiberg’s separate claim about transmission.",
      },
    ],
  },
];
