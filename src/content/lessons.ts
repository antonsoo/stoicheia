import type { PropositionId } from "../core/state";
import { exteriorLessons, exteriorReasons } from "./exterior";
import { bisectionLessons, bisectionReasons } from "./halves";
import { inequalityLessons, inequalityReasons } from "./inequalities";
import { linearAngleLessons, linearAngleReasons } from "./linear-angles";
import { perpendicularLessons, perpendicularReasons } from "./perpendiculars";
import { triangleLessons, triangleReasons } from "./triangles";
import { uniquenessLessons, uniquenessReasons } from "./uniqueness";

export interface Reason {
  title: string;
  text: string;
  kind: "given" | "construction" | "deduction" | "definition" | "assumption";
  lesson?: PropositionId;
}

export const reasons: Record<string, Reason> = {
  ...triangleReasons,
  ...uniquenessReasons,
  ...bisectionReasons,
  ...perpendicularReasons,
  ...linearAngleReasons,
  ...exteriorReasons,
  ...inequalityReasons,
  given: {
    title: "The task and its given objects",
    text: "A given object is part of the problem. It has not been constructed by this proof. A finite straight line here means a line segment.",
    kind: "given",
  },
  p1: {
    title: "Postulate 1 · join two points",
    text: "A straight line may be drawn from any point to any point. The straightedge is unmarked: this operation does not measure a length.",
    kind: "construction",
  },
  p2: {
    title: "Postulate 2 · extend a segment",
    text: "A finite straight line may be continued in a straight line. In I.2 the extensions go away from Δ, past Α and Β. No new length is measured here.",
    kind: "construction",
  },
  p3: {
    title: "Postulate 3 · draw a circle",
    text: "A circle may be described with a centre and a distance. Here the distance is from the centre to an already available point; drawing this circle does not silently carry a length to a different centre.",
    kind: "construction",
  },
  intersection: {
    title: "Postulate 1 + an intersection assumption",
    text: "Join Γ to Α and Β. Euclid takes the meeting of the two circles for granted. A modern axiomatic account must justify that intersection too; the picture alone is not a proof that a point exists.",
    kind: "assumption",
  },
  d15: {
    title: "Definition 15 · radii of one circle",
    text: "The straight lines from the centre to the circumference are equal. Identify the centre and the two points on that circle before asserting a length equality.",
    kind: "definition",
  },
  cn1: {
    title: "Common notion 1 · equality through a shared equal",
    text: "Things equal to the same thing are also equal to one another. This connects equalities already established; no measurement of the picture is needed.",
    kind: "deduction",
  },
  cn3: {
    title: "Common notion 3 · subtract equal parts",
    text: "If equals are subtracted from equals, the remainders are equal. Here ΔΛ = ΔΗ and ΔΑ = ΔΒ. Subtract the second pair from the first to obtain ΑΛ = ΒΗ.",
    kind: "deduction",
  },
  d20: {
    title: "Definition 20 · equilateral triangle",
    text: "An equilateral triangle has three equal sides. The two circle equalities and common notion 1 supply all three; how the figure happens to look is irrelevant.",
    kind: "definition",
  },
  i1: {
    title: "I.1 · reuse the equilateral construction",
    text: "The previous proposition constructs an equilateral triangle on ΑΒ. Its equal sides ΔΑ and ΔΒ will later be subtracted. This plate shows the completed subconstruction; I.1 shows its two circles.",
    kind: "construction",
    lesson: 1,
  },
  i2: {
    title: "I.2 · copy the reference length to Α",
    text: "The previous proposition gives a segment at Α equal to the separate reference Γ. Its result is named ΑΔ here. This is a complete earlier construction, not an unexplained compass transfer.",
    kind: "construction",
    lesson: 2,
  },
  equalSides: {
    title: "Definition 15 + I.1",
    text: "The larger circle gives ΔΛ = ΔΗ. The equilateral triangle from I.1 gives ΔΑ = ΔΒ. Equal whole lengths and equal parts are now available for the next step.",
    kind: "deduction",
    lesson: 1,
  },
  finish: {
    title: "The construction is complete",
    text: "The requested object has been constructed and its defining equality has been proved. The closing phrase says that the task was to make something, rather than merely state a theorem.",
    kind: "deduction",
  },
};

export interface Passage {
  grc: string;
  lat: string;
  en: string;
  greekPages: number[];
  latinPages: number[];
}
export interface Step extends Passage {
  title: string;
  phase: "Given" | "Construct" | "Prove" | "Conclude";
  reason: keyof typeof reasons;
  language: string;
}
export interface Question {
  prompt: string;
  options: string[];
  correct: number;
  explanations: string[];
}
export interface Lesson {
  id: PropositionId;
  numeral: string;
  greekNumeral: string;
  title: string;
  shortTitle: string;
  introduction: string;
  statement: Passage;
  steps: Step[];
  insight: { title: string; text: string; link: string };
  question: Question;
  editionNote?: { title: string; grc: string; en: string; greekPages: number[]; note: string };
}

export const lessons: Record<PropositionId, Lesson> = {
  ...triangleLessons,
  ...uniquenessLessons,
  ...bisectionLessons,
  ...perpendicularLessons,
  ...linearAngleLessons,
  ...exteriorLessons,
  ...inequalityLessons,
  1: {
    id: 1,
    numeral: "I.1",
    greekNumeral: "αʹ",
    title: "Construct an equilateral triangle",
    shortTitle: "Make equal sides",
    introduction:
      "Two circles turn a given line into three equal sides. Read how the commands become a construction, and how the construction becomes a proof.",
    statement: {
      grc: "Ἐπὶ τῆς δοθείσης εὐθείας πεπερασμένης τρίγωνον ἰσόπλευρον συστήσασθαι.",
      lat: "In data recta terminata triangulum aequilaterum construere.",
      en: "To construct an equilateral triangle on a given finite straight line.",
      greekPages: [10],
      latinPages: [11],
    },
    steps: [
      {
        title: "Begin with the given line",
        phase: "Given",
        reason: "given",
        grc: "Ἔστω ἡ δοθεῖσα εὐθεῖα πεπερασμένη ἡ ΑΒ. Δεῖ δὴ ἐπὶ τῆς ΑΒ εὐθείας τρίγωνον ἰσόπλευρον συστήσασθαι.",
        lat: "Sit data recta terminata ΑΒ. oportet igitur in recta ΑΒ terminata triangulum aequilaterum construere.",
        en: "Let ΑΒ be the given finite straight line. We must construct an equilateral triangle on ΑΒ.",
        greekPages: [10],
        latinPages: [11],
        language:
          "Ἔστω means ‘let … be’: a third-person imperative. Latin uses sit, a subjunctive with the same instructional role. Neither word is a claim that the reader has proved something.",
      },
      {
        title: "Draw a circle centred at Α",
        phase: "Construct",
        reason: "p3",
        grc: "Κέντρῳ μὲν τῷ Α διαστήματι δὲ τῷ ΑΒ κύκλος γεγράφθω ὁ ΒΓΔ,",
        lat: "centro Α et radio ΑΒ circulus describatur ΒΓΔ,",
        en: "With centre Α and radius ΑΒ, let the circle ΒΓΔ be drawn.",
        greekPages: [10, 12],
        latinPages: [11],
        language:
          "Κέντρῳ and διαστήματι are datives: ‘with centre’ and ‘with distance’. γεγράφθω asks for a completed drawing: ‘let it have been drawn’. Latin describatur gives the corresponding command.",
      },
      {
        title: "Draw the second circle",
        phase: "Construct",
        reason: "p3",
        grc: "καὶ πάλιν κέντρῳ μὲν τῷ Β διαστήματι δὲ τῷ ΒΑ κύκλος γεγράφθω ὁ ΑΓΕ,",
        lat: "et rursus centro Β radio autem ΒΑ circulus describatur ΑΓΕ,",
        en: "Again, with centre Β and radius ΒΑ, let the circle ΑΓΕ be drawn.",
        greekPages: [12],
        latinPages: [13],
        language:
          "πάλιν and Latin rursus both mean ‘again’. ΑΒ and ΒΑ name the same length, but the order helps you see which endpoint is now the centre.",
      },
      {
        title: "Join the intersection to the endpoints",
        phase: "Construct",
        reason: "intersection",
        grc: "καὶ ἀπὸ τοῦ Γ σημείου, καθ᾽ ὃ τέμνουσιν ἀλλήλους οἱ κύκλοι, ἐπὶ τὰ Α, Β σημεῖα ἐπεζεύχθωσαν εὐθεῖαι αἱ ΓΑ, ΓΒ.",
        lat: "et a puncto Γ, in quo circuli inter se secant, ad puncta Α, Β ducantur rectae ΓΑ, ΓΒ.",
        en: "From Γ, where the circles meet, draw the straight lines ΓΑ and ΓΒ to Α and Β.",
        greekPages: [12],
        latinPages: [13],
        language:
          "ἀπό … ἐπί marks ‘from … to’; Latin uses a … ad. The plural command ἐπεζεύχθωσαν agrees with the two lines to be joined. Γ is gamma, the third letter, corresponding to C in many English editions.",
      },
      {
        title: "Read the first pair of radii",
        phase: "Prove",
        reason: "d15",
        grc: "Καὶ ἐπεὶ τὸ Α σημεῖον κέντρον ἐστὶ τοῦ ΓΔΒ κύκλου, ἴση ἐστὶν ἡ ΑΓ τῇ ΑΒ·",
        lat: "iam quoniam punctum Α centrum est circuli ΓΔΒ, erit ΑΓ = ΑΒ.",
        en: "Since Α is the centre of circle ΓΔΒ, ΑΓ is equal to ΑΒ.",
        greekPages: [12],
        latinPages: [13],
        language:
          "ἐπεὶ and quoniam introduce ‘since’. ἴση is feminine because the understood noun εὐθεῖα (‘straight line’) is feminine. τῇ ΑΒ means ‘to ΑΒ’ after ‘equal’.",
      },
      {
        title: "Read the second pair of radii",
        phase: "Prove",
        reason: "d15",
        grc: "πάλιν, ἐπεὶ τὸ Β σημεῖον κέντρον ἐστὶ τοῦ ΓΑΕ κύκλου, ἴση ἐστὶν ἡ ΒΓ τῇ ΒΑ.",
        lat: "rursus quoniam Β punctum centrum est circuli ΓΑΕ, est ΒΓ = ΒΑ.",
        en: "Again, since Β is the centre of circle ΓΑΕ, ΒΓ is equal to ΒΑ.",
        greekPages: [12],
        latinPages: [13],
        language:
          "The wording repeats the first radius argument with Β as centre. Repetition in a proof is useful reading practice: only the point names change.",
      },
      {
        title: "Find the shared equal length",
        phase: "Prove",
        reason: "cn1",
        grc: "ἐδείχθη δὲ καὶ ἡ ΓΑ τῇ ΑΒ ἴση· ἑκατέρα ἄρα τῶν ΓΑ, ΓΒ τῇ ΑΒ ἐστιν ἴση.",
        lat: "sed demonstratum est etiam ΓΑ = ΑΒ. quare utraque ΓΑ, ΓΒ rectae ΑΒ aequalis est.",
        en: "But ΓΑ was also shown equal to ΑΒ. Thus each of ΓΑ and ΓΒ is equal to ΑΒ.",
        greekPages: [12],
        latinPages: [13],
        language:
          "ἐδείχθη means ‘was shown’. demonstratum est is likewise passive. ἄρα and quare signal that a conclusion follows; they are signposts in the argument.",
      },
      {
        title: "Connect the equalities",
        phase: "Prove",
        reason: "cn1",
        grc: "τὰ δὲ τῷ αὐτῷ ἴσα καὶ ἀλλήλοις ἐστὶν ἴσα· καὶ ἡ ΓΑ ἄρα τῇ ΓΒ ἐστιν ἴση· αἱ τρεῖς ἄρα αἱ ΓΑ, ΑΒ, ΒΓ ἴσαι ἀλλήλαις εἰσίν.",
        lat: "quae autem eidem aequalia sunt, etiam inter se aequalia sunt. itaque etiam ΓΑ = ΓΒ. itaque ΓΑ, ΑΒ, ΒΓ aequales sunt.",
        en: "Things equal to the same thing are also equal to one another. Hence ΓΑ equals ΓΒ, and the three lines ΓΑ, ΑΒ and ΒΓ are equal to one another.",
        greekPages: [12],
        latinPages: [13],
        language:
          "τὰ … ἴσα (‘the equal things’) is neuter plural: the statement applies generally to things, not just lines. Latin quae … aequalia uses the same general form.",
      },
      {
        title: "Name what has been made",
        phase: "Conclude",
        reason: "d20",
        grc: "ἰσόπλευρον ἄρα ἐστὶ τὸ ΑΒΓ τρίγωνον. καὶ συνέσταται ἐπὶ τῆς δοθείσης εὐθείας πεπερασμένης τῆς ΑΒ.",
        lat: "quare triangulus ΑΒΓ aequilaterus est; et in data recta terminata ΑΒ constructus est.",
        en: "Therefore ΑΒΓ is an equilateral triangle, constructed on the given finite straight line ΑΒ.",
        greekPages: [12],
        latinPages: [13],
        language:
          "ἰσόπλευρον combines ἴσος (‘equal’) and πλευρά (‘side’). aequilaterus combines aequus and latus. The Greek and Latin describe the same geometric property.",
      },
      {
        title: "Which was to be done",
        phase: "Conclude",
        reason: "finish",
        grc: "[Ἐπὶ τῆς δοθείσης ἄρα εὐθείας πεπερασμένης τρίγωνον ἰσόπλευρον συνέσταται] ὅπερ ἔδει ποιῆσαι.",
        lat: "quod oportebat fieri.",
        en: "[Thus an equilateral triangle has been constructed on the given finite straight line:] which was to be done.",
        greekPages: [12],
        latinPages: [13],
        language:
          "ὅπερ ἔδει ποιῆσαι closes a construction. Latin quod oportebat fieri means ‘which had to be done’. Heiberg brackets the repeated Greek conclusion; the Latin omits that repetition. The brackets are retained here.",
      },
    ],
    insight: {
      title: "An intersection the picture takes for granted",
      text: "You can see where the two circles cross, but a drawing does not establish that an intersection exists. Euclid uses it without an explicit circle-intersection axiom. Our coordinates use the real plane; this supplies a modern setting, rather than filling that gap in Euclid’s stated postulates. Flip Γ to see the other valid intersection.",
      link: "https://mathcs.clarku.edu/~djoyce/elements/bookI/propI1.html",
    },
    question: {
      prompt: "Why does ΑΓ equal ΑΒ?",
      options: [
        "They are radii of the circle centred at Α.",
        "The two circles have the same centre.",
        "The drawing makes the sides look equal.",
      ],
      correct: 0,
      explanations: [
        "Yes. Γ and Β lie on the circle centred at Α, so definition 15 gives ΑΓ = ΑΒ. This does not depend on measuring the screen.",
        "The centres are different: Α and Β. Look at the single circle centred at Α and identify its two radii.",
        "A picture can suggest an equality. The reason is that Γ and Β are on one circle with centre Α.",
      ],
    },
  },
  2: {
    id: 2,
    numeral: "I.2",
    greekNumeral: "βʹ",
    title: "Carry a length without carrying the compass",
    shortTitle: "Move a length",
    introduction:
      "A reference line lies away from Α. Construct an equal length at Α, using an equilateral triangle and subtraction. The surprising part is what the two equal sides let you remove.",
    statement: {
      grc: "Πρὸς τῷ δοθέντι σημείῳ τῇ δοθείσῃ εὐθείᾳ ἴσην εὐθεῖαν θέσθαι.",
      lat: "Ad datum punctum datae rectae aequalem rectam constituere.",
      en: "To place, at a given point, a straight line equal to a given straight line.",
      greekPages: [12],
      latinPages: [13],
    },
    steps: [
      {
        title: "A point and a separate length",
        phase: "Given",
        reason: "given",
        grc: "Ἔστω τὸ μὲν δοθὲν σημεῖον τὸ Α, ἡ δὲ δοθεῖσα εὐθεῖα ἡ ΒΓ· δεῖ δὴ πρὸς τῷ Α σημείῳ τῇ δοθείσῃ εὐθείᾳ τῇ ΒΓ ἴσην εὐθεῖαν θέσθαι.",
        lat: "Sit datum punctum Α, data autem recta ΒΓ. oportet igitur ad punctum Α datae rectae ΒΓ aequalem rectam constituere.",
        en: "Let Α be the given point and ΒΓ the given straight line. We must place at Α a straight line equal to ΒΓ.",
        greekPages: [12],
        latinPages: [13],
        language:
          "μέν … δέ pairs two items: the given point on the one hand, the given line on the other. δοθέν and δοθεῖσα both mean ‘given’; their forms agree with the different nouns.",
      },
      {
        title: "Join Α to Β",
        phase: "Construct",
        reason: "p1",
        grc: "Ἐπεζεύχθω γὰρ ἀπὸ τοῦ Α σημείου ἐπὶ τὸ Β σημεῖον εὐθεῖα ἡ ΑΒ,",
        lat: "ducatur enim a puncto Α ad Β punctum recta ΑΒ,",
        en: "Draw the straight line ΑΒ from point Α to point Β.",
        greekPages: [12],
        latinPages: [13],
        language:
          "ἐπεζεύχθω is singular: one line is to be joined. Compare the plural ἐπεζεύχθωσαν in I.1, where two lines were joined.",
      },
      {
        title: "Use I.1 on the new line",
        phase: "Construct",
        reason: "i1",
        grc: "καὶ συνεστάτω ἐπ᾽ αὐτῆς τρίγωνον ἰσόπλευρον τὸ ΔΑΒ.",
        lat: "et in ea construatur triangulus aequilaterus ΔΑΒ,",
        en: "On it construct the equilateral triangle ΔΑΒ.",
        greekPages: [12],
        latinPages: [13],
        language:
          "ἐπ᾽ αὐτῆς and in ea both mean ‘on it’, referring back to ΑΒ. The point name Δ is delta; this triangle supplies the equality ΔΑ = ΔΒ.",
      },
      {
        title: "Extend past Α and Β",
        phase: "Construct",
        reason: "p2",
        grc: "καὶ ἐκβεβλήσθωσαν ἐπ᾽ εὐθείας ταῖς ΔΑ, ΔΒ εὐθεῖαι αἱ ΑΕ, ΒΖ,",
        lat: "et producantur in directum rectae ΔΑ, ΔΒ, ut fiant ΑΕ, ΒΖ,",
        en: "Continue ΔΑ and ΔΒ in straight lines beyond Α and Β, forming ΑΕ and ΒΖ.",
        greekPages: [12, 14],
        latinPages: [13, 15],
        language:
          "ἐκβεβλήσθωσαν commands that the lines be extended. Latin producantur in directum says ‘let them be extended straight on’. The directions matter: go away from Δ.",
      },
      {
        title: "Mark the reference length from Β",
        phase: "Construct",
        reason: "p3",
        grc: "καὶ κέντρῳ μὲν τῷ Β διαστήματι δὲ τῷ ΒΓ κύκλος γεγράφθω ὁ ΓΗΘ.",
        lat: "et centro Β radio autem ΒΓ circulus describatur ΓΗΘ,",
        en: "With centre Β and radius ΒΓ, draw circle ΓΗΘ. Η lies on the extension beyond Β.",
        greekPages: [14],
        latinPages: [15],
        language:
          "Η is eta, not the Latin letter H. The circle is named by points on its circumference; Θ is another such point in the source figure. This plate labels the points needed for the argument.",
      },
      {
        title: "Reach both extended sides from Δ",
        phase: "Construct",
        reason: "p3",
        grc: "καὶ πάλιν κέντρῳ τῷ Δ καὶ διαστήματι τῷ ΔΗ κύκλος γεγράφθω ὁ ΗΚΛ.",
        lat: "et rursus centro Δ radio autem ΔΗ circulus describatur ΗΚΛ.",
        en: "Again, with centre Δ and radius ΔΗ, draw circle ΗΚΛ. Λ lies on the extension beyond Α.",
        greekPages: [14],
        latinPages: [15],
        language:
          "Λ is lambda. The names ΗΚΛ identify the second circle. Κ is not needed in the subtraction argument, so the plate shows the working arc through Η and Λ.",
      },
      {
        title: "Identify the first equal radii",
        phase: "Prove",
        reason: "d15",
        grc: "Ἐπεὶ οὖν τὸ Β σημεῖον κέντρον ἐστὶ τοῦ ΓΗΘ, ἴση ἐστὶν ἡ ΒΓ τῇ ΒΗ.",
        lat: "iam quoniam Β punctum centrum est circuli ΓΗΘ, erit ΒΓ = ΒΗ.",
        en: "Since Β is the centre of circle ΓΗΘ, ΒΓ equals ΒΗ.",
        greekPages: [14],
        latinPages: [15],
        language:
          "The radius argument from I.1 appears again. ΒΓ is the given length, and ΒΗ is now an equal length on the extended side.",
      },
      {
        title: "Identify equal wholes and equal parts",
        phase: "Prove",
        reason: "equalSides",
        grc: "πάλιν, ἐπεὶ τὸ Δ σημεῖον κέντρον ἐστὶ τοῦ ΗΚΛ κύκλου, ἴση ἐστὶν ἡ ΔΛ τῇ ΔΗ, ὧν ἡ ΔΑ τῇ ΔΒ ἴση ἐστίν.",
        lat: "rursus quoniam Δ punctum centrum est circuli ΗΚΛ, erit ΔΛ = ΔΗ, quarum partes ΔΑ, ΔΒ aequales.",
        en: "Since Δ is the centre of circle ΗΚΛ, ΔΛ equals ΔΗ; within them, the parts ΔΑ and ΔΒ are equal.",
        greekPages: [14],
        latinPages: [15],
        language:
          "ὧν means ‘of which’. Heiberg’s Latin makes the implied relationship explicit with quarum partes: ‘whose parts’. The equal parts come from the equilateral triangle.",
      },
      {
        title: "Subtract the equal parts",
        phase: "Prove",
        reason: "cn3",
        grc: "λοιπὴ ἄρα ἡ ΑΛ λοιπῇ τῇ ΒΗ ἐστιν ἴση.",
        lat: "itaque ΑΛ = ΒΗ.",
        en: "Therefore the remainder ΑΛ is equal to the remainder ΒΗ.",
        greekPages: [14],
        latinPages: [15],
        language:
          "λοιπή means ‘remaining’. Greek names the remainders, while the Latin prints an equation. The language encodes an operation: remove ΔΑ and ΔΒ, leaving ΑΛ and ΒΗ.",
      },
      {
        title: "Connect the remainder to the reference",
        phase: "Prove",
        reason: "cn1",
        grc: "ἐδείχθη δὲ καὶ ἡ ΒΓ τῇ ΒΗ ἴση· ἑκατέρα ἄρα τῶν ΑΛ, ΒΓ τῇ ΒΗ ἐστιν ἴση. τὰ δὲ τῷ αὐτῷ ἴσα καὶ ἀλλήλοις ἐστὶν ἴσα· καὶ ἡ ΑΛ ἄρα τῇ ΒΓ ἐστιν ἴση.",
        lat: "sed demonstratum est ΒΓ = ΒΗ. itaque utraque ΑΛ, ΒΓ rectae ΒΗ aequalis est. uerum quae eidem aequalia sunt, etiam inter se aequalia sunt. ergo etiam ΑΛ = ΒΓ.",
        en: "ΒΓ was also shown equal to ΒΗ. Since ΑΛ and ΒΓ are each equal to ΒΗ, they are equal to one another: ΑΛ = ΒΓ.",
        greekPages: [14],
        latinPages: [15],
        language:
          "ἑκατέρα means ‘each of the two’; Latin utraque has the same role. The proof repeats common notion 1 rather than relying on the appearance of the diagram.",
      },
      {
        title: "The new length starts at Α",
        phase: "Conclude",
        reason: "finish",
        grc: "Πρὸς ἄρα τῷ δοθέντι σημείῳ τῷ Α τῇ δοθείσῃ εὐθείᾳ τῇ ΒΓ ἴση εὐθεῖα κεῖται ἡ ΑΛ· ὅπερ ἔδει ποιῆσαι.",
        lat: "Ergo ad datum punctum Α datae rectae ΒΓ aequalis constituta est recta ΑΛ; quod oportebat fieri.",
        en: "At the given point Α, the straight line ΑΛ has been placed equal to the given straight line ΒΓ: which was to be done.",
        greekPages: [14],
        latinPages: [15],
        language:
          "κεῖται (‘lies’ or ‘has been placed’) answers the opening task θέσθαι (‘to place’). Latin constituere is answered by constituta est. The end echoes the beginning.",
      },
    ],
    insight: {
      title: "The length survives because equal parts disappear",
      text: "The equilateral triangle looks like a detour. Its purpose is to create equal removable parts. ΔΛ and ΔΗ are radii of one circle; removing equal ΔΑ and ΔΒ leaves equal ΑΛ and ΒΗ. ‘Collapsing compass’ is a modern description of the restricted operation, not evidence about an actual ancient instrument. Change ΒΓ or flip the triangle: the subtraction still works.",
      link: "https://mathcs.clarku.edu/~djoyce/elements/bookI/propI2.html",
    },
    question: {
      prompt: "What allows ΑΛ = ΒΗ after the two circles have been drawn?",
      options: [
        "Any two circles give equal remainders.",
        "Subtract equal ΔΑ and ΔΒ from equal ΔΛ and ΔΗ.",
        "Α and Β are the same point.",
      ],
      correct: 1,
      explanations: [
        "Circle radii alone give equal wholes, ΔΛ and ΔΗ. You also need the equal parts ΔΑ and ΔΒ from I.1.",
        "Yes. Common notion 3 applies because I.1 supplies the equal parts. Then ΒΗ = ΒΓ gives the required copied length.",
        "Α and Β are different. Their separation is why I.1 can construct the equilateral triangle used in the argument.",
      ],
    },
  },
  3: {
    id: 3,
    numeral: "I.3",
    greekNumeral: "γʹ",
    title: "Cut a smaller length from a larger one",
    shortTitle: "Cut a length",
    introduction:
      "The first two propositions now become tools. Copy the separate reference to Α, then let a circle locate exactly where to cut the longer line.",
    statement: {
      grc: "Δύο δοθεισῶν εὐθειῶν ἀνίσων ἀπὸ τῆς μείζονος τῇ ἐλάσσονι ἴσην εὐθεῖαν ἀφελεῖν.",
      lat: "Datis duabus rectis inaequalibus rectam minori aequalem a maiore abscindere.",
      en: "Given two unequal straight lines, to cut from the greater a straight line equal to the lesser.",
      greekPages: [14],
      latinPages: [15],
    },
    steps: [
      {
        title: "Name the greater and the lesser",
        phase: "Given",
        reason: "given",
        grc: "Ἔστωσαν αἱ δοθεῖσαι δύο εὐθεῖαι ἄνισοι αἱ ΑΒ, Γ, ὧν μείζων ἔστω ἡ ΑΒ· δεῖ δὴ ἀπὸ τῆς μείζονος τῆς ΑΒ τῇ ἐλάσσονι τῇ Γ ἴσην εὐθεῖαν ἀφελεῖν.",
        lat: "Sint duae datae rectae inaequales ΑΒ, Γ, quarum maior sit ΑΒ. oportet igitur a maiore ΑΒ minori Γ aequalem rectam abscindere.",
        en: "Let ΑΒ and Γ be the two given unequal straight lines, with ΑΒ the greater. We must cut from ΑΒ a straight line equal to Γ, the lesser.",
        greekPages: [14],
        latinPages: [15],
        language:
          "Γ names an entire segment here, not a point. μείζων / maior mean ‘greater’; ἐλάσσων / minor mean ‘lesser’. The hypothesis matters: try a reference length of 100% or more.",
      },
      {
        title: "Place the reference length at Α",
        phase: "Construct",
        reason: "i2",
        grc: "Κείσθω πρὸς τῷ Α σημείῳ τῇ Γ εὐθείᾳ ἴση ἡ ΑΔ·",
        lat: "constituatur ad Α punctum rectae Γ aequalis ΑΔ,",
        en: "At point Α, place ΑΔ equal to the straight line Γ.",
        greekPages: [14],
        latinPages: [15],
        language:
          "Κείσθω (‘let it be placed’) is a command using the same verb as κεῖται in I.2’s conclusion. A completed result has become an available instruction.",
      },
      {
        title: "Draw the circle that locates the cut",
        phase: "Construct",
        reason: "p3",
        grc: "καὶ κέντρῳ μὲν τῷ Α διαστήματι δὲ τῷ ΑΔ κύκλος γεγράφθω ὁ ΔΕΖ.",
        lat: "et centro Α radio autem ΑΔ describatur circulus ΔΕΖ.",
        en: "With centre Α and radius ΑΔ, draw circle ΔΕΖ. Ε is its intersection with ΑΒ.",
        greekPages: [14],
        latinPages: [15],
        language:
          "The centre–radius sentence from I.1 is now familiar. The same Greek command γεγράφθω recurs. Ζ is another point naming the circle in the source figure; the plate labels the working points.",
      },
      {
        title: "Connect the cut to the reference",
        phase: "Prove",
        reason: "cn1",
        grc: "Καὶ ἐπεὶ τὸ Α σημεῖον κέντρον ἐστὶ τοῦ ΔΕΖ κύκλου, ἴση ἐστὶν ἡ ΑΕ τῇ ΑΔ· ἀλλὰ καὶ ἡ Γ τῇ ΑΔ ἐστιν ἴση. ἑκατέρα ἄρα τῶν ΑΕ, Γ τῇ ΑΔ ἐστιν ἴση· ὥστε καὶ ἡ ΑΕ τῇ Γ ἐστιν ἴση.",
        lat: "Et quoniam punctum Α centrum est circuli ΔΕΖ, est ΑΕ = ΑΔ; uerum etiam Γ = ΑΔ. itaque utraque ΑΕ, Γ rectae ΑΔ aequalis est; ergo etiam ΑΕ = Γ.",
        en: "Because Α is the centre of circle ΔΕΖ, ΑΕ = ΑΔ. But Γ = ΑΔ as well. Both are equal to ΑΔ, so ΑΕ = Γ.",
        greekPages: [16],
        latinPages: [17],
        language:
          "ὥστε and ergo introduce the consequence. The equality ΑΕ = ΑΔ comes from the circle, while Γ = ΑΔ comes from I.2. Common notion 1 links those two different reasons.",
      },
      {
        title: "The required part has been cut off",
        phase: "Conclude",
        reason: "finish",
        grc: "Δύο ἄρα δοθεισῶν εὐθειῶν ἀνίσων τῶν ΑΒ, Γ ἀπὸ τῆς μείζονος τῆς ΑΒ τῇ ἐλάσσονι τῇ Γ ἴση ἀφῄρηται ἡ ΑΕ· ὅπερ ἔδει ποιῆσαι.",
        lat: "Ergo datis duabus rectis inaequalibus ΑΒ, Γ a maiore ΑΒ minori Γ aequalis abscisa est ΑΕ; quod oportebat fieri.",
        en: "From ΑΒ, the greater of the two given unequal straight lines, ΑΕ has been cut off equal to Γ, the lesser: which was to be done.",
        greekPages: [16],
        latinPages: [17],
        language:
          "ἀφελεῖν at the start was ‘to take away’; ἀφῄρηται now says ‘has been taken away’. Latin abscindere becomes abscisa est. This change from task to completed result is a recurring pattern.",
      },
    ],
    insight: {
      title: "A result becomes an instruction",
      text: "I.3 can say ‘place an equal line at Α’ because I.2 has already earned that operation. I.2 in turn used I.1. The chain turns a few primitive permissions into more capable tools. Move the reference to 100% or beyond: the stated greater–lesser hypothesis fails, so this workbench withholds the cut rather than putting it beyond Β.",
      link: "https://mathcs.clarku.edu/~djoyce/elements/bookI/propI3.html",
    },
    question: {
      prompt: "Why is I.2 invoked before drawing the final circle?",
      options: [
        "To establish an equal radius starting at Α.",
        "To make the reference line longer.",
        "To measure the line with a marked ruler.",
      ],
      correct: 0,
      explanations: [
        "Yes. The reference is separate from Α. I.2 constructs ΑΔ equal to it, so the circle at Α can be drawn through Δ.",
        "The reference length stays the same. I.2 relocates an equal segment to the needed starting point.",
        "The construction uses an unmarked straightedge and circles. No marked ruler measurement is part of the proof.",
      ],
    },
  },
};
