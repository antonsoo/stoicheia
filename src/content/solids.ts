export const solidsSourceUrl =
  "https://archive.org/download/euclidisoperaomn04eucl/euclidisoperaomn04eucl.pdf";
export const solidsBoundary =
  "The addendum after Euclid XIII.18, Heiberg’s 1885 Greek edition and Latin translation, printed pp.336–341; XI definition 11 and XI.21, pp.4–5 and 54–59. Selected excerpts, new English and contextual notes. Exact angle arithmetic, coordinate models and the two-tetrahedra comparison are modern teaching work. The five-case classification assumes a closed convex polyhedron, congruent regular faces, and the same number of faces at every vertex. Equal regular faces alone do not impose that last condition.";
export interface SolidPassage {
  latinContinuation?: number;
  title: string;
  location: string;
  greek: string;
  latin: string;
  english: string;
  note: string;
  pages: readonly [number, number];
  word: string;
  counterpart: string;
  meaning: string;
}
export const solidPassages: readonly SolidPassage[] = [
  {
    title: "Which figures does the sentence describe?",
    location: "Addendum after XIII.18 · opening sentence",
    pages: [336, 337],
    greek:
      "Λέγω δή, ὅτι παρὰ τὰ εἰρημένα πέντε σχήματα οὐ συσταθήσεται ἕτερον σχῆμα περιεχόμενον ὑπὸ ἰσοπλεύρων τε καὶ ἰσογωνίων ἴσων ἀλλήλοις.",
    latin:
      "Iam dico, praeter quinque figuras, quas nominauimus, nullam aliam construi posse polygonis et aequilateris et aequiangulis inter se aequalibus comprehensam.",
    english:
      "I now say that, besides the five figures already mentioned, no other figure will be constructed that is enclosed by equilateral and equiangular figures equal to one another.",
    note: "ἰσοπλεύρων and ἰσογωνίων describe the enclosing faces; ἴσων ἀλλήλοις says those faces are equal to each other. This sentence does not separately state that the same number of faces must meet at every vertex. Our joined tetrahedra test the face condition alone. This is an examination of the stated conditions, not a claim about the original author's intended definition or the date of the addendum.",
    word: "ἴσων ἀλλήλοις",
    counterpart: "inter se aequalibus",
    meaning:
      "equal to one another; genitive plural in the Greek, describing the enclosing figures.",
  },
  {
    title: "Two planes are not a closed corner",
    location: "Addendum · first reason",
    pages: [336, 337],
    greek: "Ὑπὸ μὲν γὰρ δύο τριγώνων ἢ ὅλως ἐπιπέδων στερεὰ γωνία οὐ συνίσταται.",
    latin: "Nam ex duobus triangulis aut omnino figuris planis angulus solidus construi nequit.",
    english:
      "For a solid angle is not formed by two triangles, or by two plane figures in general.",
    note: "A hinge made from two sheets is not yet the enclosed polyhedral corner meant here. XI definition 11 explicitly requires more than two plane angles, meeting at one point and not lying in one plane. Its complete Greek and Latin pages are retained. The app therefore refuses q = 2 even when the angle sum is less than a full turn.",
    word: "στερεὰ γωνία",
    counterpart: "angulus solidus",
    meaning:
      "a solid corner, made by plane face angles. Its angle sum here is not a solid-angle measurement in steradians.",
  },
  {
    title: "Three, four, five",
    location: "Addendum · the triangular cases",
    pages: [336, 337],
    greek:
      "ὑπὸ δὲ τριῶν τριγώνων ἡ τῆς πυραμίδος, ὑπὸ δὲ τεσσάρων ἡ τοῦ ὀκταέδρου, ὑπὸ δὲ πέντε ἡ τοῦ εἰκοσαέδρου·",
    latin:
      "ex tribus uero triangulis angulus pyramidis construitur, ex quattuor octaedri, ex quinque icosaedri.",
    english:
      "From three triangles comes the corner of the pyramid; from four, that of the octahedron; from five, that of the icosahedron.",
    note: "The repeated γωνία is understood after the first sentence: these are corners, not counts of all faces in a solid. The regular tetrahedron has four faces in total, with three at each corner. The six-faced bipyramid has both three-face and four-face corners.",
    word: "τριῶν / τεσσάρων / πέντε",
    counterpart: "tribus / quattuor / quinque",
    meaning:
      "three / four / five, counted at a single vertex. Do not confuse these with a polyhedron's total face count.",
  },
  {
    title: "The sixth triangle uses the entire turn",
    latinContinuation: 339,
    location: "Addendum · selected clause",
    pages: [336, 337],
    greek:
      "οὔσης γὰρ τῆς τοῦ ἰσοπλεύρου τριγώνου γωνίας διμοίρου ὀρθῆς ἔσονται αἱ ἓξ τέσσαρσιν ὀρθαῖς ἴσαι· ὅπερ ἀδύνατον·",
    latin:
      "nam cum angulus trianguli aequilateri duae partes sint recti, sex anguli quattuor rectis aequales erunt; quod fieri non potest;",
    english:
      "For, since the angle of an equilateral triangle is two thirds of a right angle, the six angles will equal four right angles—which is impossible here.",
    note: "διμοίρου ὀρθῆς means two thirds of a right angle, not two right angles. Six times 60° is 360°. The six triangles can lie together in a plane, but they do not make the strictly convex corner under discussion. The final Latin words continue at the top of p.339; the page selector can show that continuation.",
    word: "διμοίρου ὀρθῆς",
    counterpart: "duae partes … recti",
    meaning:
      "two thirds of a right angle: 2/3 × 90° = 60°. Degrees and multiplication signs are our notation.",
  },
  {
    title: "Less than four right angles",
    location: "Addendum · appeal to XI.21",
    pages: [338, 339],
    greek: "ἅπασα γὰρ στερεὰ γωνία ὑπὸ ἐλασσόνων ἢ τεσσάρων ὀρθῶν περιέχεται.",
    latin: "nam omnis angulus solidus minus quattuor rectis comprehenditur.",
    english:
      "For every solid angle is enclosed by face angles whose sum is less than four right angles.",
    note: "This is a strict inequality for the convex corners studied here. A positive angular deficit is a necessary local condition, not a construction of a complete polyhedron. XI.21's printed proof treats a three-face corner; Heiberg's p.59 footnote says to reason similarly for more faces. We retain both the proof and that editorial note, rather than present the on-screen arithmetic as its ancient proof.",
    word: "ἐλασσόνων ἢ",
    counterpart: "minus",
    meaning:
      "less than; equality is excluded. The ἢ here introduces the comparison, not an alternative.",
  },
  {
    title: "A fourth square has no turn left",
    location: "Addendum · square faces",
    pages: [338, 339],
    greek:
      "ὑπὸ δὲ τετραγώνων τριῶν ἡ τοῦ κύβου γωνία περιέχεται· ὑπὸ δὲ τεσσάρων ἀδύνατον· ἔσονται γὰρ πάλιν τέσσαρες ὀρθαί.",
    latin:
      "tribus autem quadratis angulus cubi comprehenditur. quattuor autem nullus; nam rursus quattuor recti erunt.",
    english:
      "The corner of the cube is enclosed by three squares. Four cannot enclose such a corner: once again there would be four right angles.",
    note: "Each square contributes one right angle. Three give 270° and leave a 90° deficit; four give 360°. The deficit is the missing planar angle when the corner is cut open and laid flat, not the dihedral angle between two faces.",
    word: "τετραγώνων",
    counterpart: "quadratis",
    meaning:
      "squares, in the genitive plural after ὑπό. ‘Four-angled’ alone would not distinguish an arbitrary quadrilateral; the context supplies regularity.",
  },
  {
    title: "The pentagon makes the excess visible",
    location: "Addendum · selected pentagon clause",
    pages: [338, 339],
    greek:
      "οὔσης γὰρ τῆς τοῦ πενταγώνου ἰσοπλεύρου γωνίας ὀρθῆς καὶ πέμπτου, ἔσονται αἱ τέσσαρες γωνίαι τεσσάρων ὀρθῶν μείζους· ὅπερ ἀδύνατον.",
    latin:
      "nam cum angulus pentagoni aequilateri aequalis sit recto angulo cum quinta parte recti, quattuor anguli quattuor rectis maiores erunt; quod fieri non potest.",
    english:
      "For, since the angle of the equilateral pentagon is a right angle and a fifth of a right angle, four such angles will exceed four right angles—which is impossible here.",
    note: "The regular pentagon contributes 108°. Three leave 36°; four exceed a full turn by 72°. The selected clause abbreviates ‘equilateral and equiangular’ from the surrounding argument: this is not a claim about every equilateral pentagon. The following lemma proves the 108° result using five central triangles; its complete pages are retained.",
    word: "ὀρθῆς καὶ πέμπτου",
    counterpart: "recto angulo cum quinta parte recti",
    meaning: "a right angle plus one fifth of a right angle: 90° + 18° = 108°.",
  },
  {
    title: "A corner needs more than two face angles",
    location: "XI · definition 11, second formulation",
    pages: [4, 5],
    greek:
      "Ἄλλως· στερεὰ γωνία ἐστὶν ἡ ὑπὸ πλειόνων ἢ δύο γωνιῶν ἐπιπέδων περιεχομένη μὴ οὐσῶν ἐν τῷ αὐτῷ ἐπιπέδῳ πρὸς ἑνὶ σημείῳ συνισταμένων.",
    latin:
      "Aliter. Solidus angulus est, qui amplius quam duobus angulis planis continetur non in eodem plano positis et ad unum punctum coniunctis.",
    english:
      "Alternatively: a solid angle is enclosed by more than two plane angles, not lying in the same plane, coming together at one point.",
    note: "This is the definition's second formulation, introduced by Ἄλλως / Aliter. The complete page also retains the first formulation and editorial apparatus. Read ‘plane angles’ as the corners of the faces; ‘not in the same plane’ excludes the flat six-triangle arrangement.",
    word: "πρὸς ἑνὶ σημείῳ",
    counterpart: "ad unum punctum",
    meaning:
      "at one point; the faces are counted at the shared vertex, not scattered over the whole object.",
  },
  {
    title: "Equilateral and equiangular both matter",
    location: "Lemma following the addendum · selected statement",
    pages: [338, 339],
    greek:
      "Ὅτι δὲ ἡ τοῦ ἰσοπλεύρου καὶ ἰσογωνίου πενταγώνου γωνία ὀρθή ἐστι καὶ πέμπτου, οὕτω δεικτέον.",
    latin:
      "Angulum autem pentagoni aequilateri et aequianguli aequalem esse angulo recto et quintae parti recti, sic demonstrandum.",
    english:
      "That the angle of an equilateral and equiangular pentagon is a right angle and a fifth must be shown as follows.",
    note: "A pentagon with equal sides alone can have unequal angles. The two adjectives supply both conditions. Joining the centre to five vertices gives central angles of 72°, with two equal base angles of 54° in each triangle; two neighbouring base angles give the face angle of 108°. This calculation explains the retained lemma; the modern 72°, 54° and 108° labels are not printed in its Greek text.",
    word: "ἰσοπλεύρου καὶ ἰσογωνίου",
    counterpart: "aequilateri et aequianguli",
    meaning: "equal-sided and equal-angled; both are required for a regular face.",
  },
];
