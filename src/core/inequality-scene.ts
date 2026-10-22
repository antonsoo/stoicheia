import { add, distance, type Point, scale, subtract } from "./geometry";
import { inequalityTriangle, sideAngleConstruction, triangleInequality } from "./inequalities";
import type { Ink, Scene } from "./scene";
import type { ReaderState } from "./state";
import { angleAt } from "./triangles";

export function inequalityScene(state: ReaderState): Scene {
  const { proposition: p, step, size: s, side } = state;
  const source = inequalityTriangle(s, state.ratio, state.angle * 2, side);
  const hypothetical = p === 19 && (step === 2 || step === 3);
  const { a, b, c } = hypothetical
    ? inequalityTriangle(s, step === 2 ? 1 : 0.7, state.angle * 2, side)
    : source;
  const scene: Scene = {
    segments: [],
    circles: [],
    vertices: [],
    angles: [],
    figures: [],
    bounds: [0, 0, 1, 1],
    equalities: [],
    measurements: [],
    description: "",
    warning: "",
  };
  const segment = (id: string, from: Point, to: Point, ink: Ink = "working", ticks = 0) =>
    scene.segments.push({ id, a: from, b: to, ink, ticks });
  const vertex = (id: string, at: Point, dx = 0, dy = 22) =>
    scene.vertices.push({ id, at, label: id, dx, dy });
  const mark = (id: string, first: Point, at: Point, last: Point, ink: Ink = "result", rings = 1) =>
    scene.angles?.push({ id, first, at, last, ink, rings });
  const measure = (label: string, value: number) => scene.measurements.push({ label, value });
  const fit = (points: Point[]) => {
    const margin = s * 0.22;
    scene.bounds = [
      Math.min(...points.map((v) => v.x)) - margin,
      Math.min(...points.map((v) => v.y)) - margin,
      Math.max(...points.map((v) => v.x)) + margin,
      Math.max(...points.map((v) => v.y)) + margin,
    ];
  };
  vertex("Α", a, -14, side * 22);
  vertex("Β", b, 14, side * 22);
  vertex("Γ", c, 0, -side * 22);
  segment("AB", a, b, "given");
  segment("AC", a, c, "given");
  segment("BC", b, c, "given");
  fit([a, b, c, source.c]);

  if (p === 17) {
    const pair = step >= 5 ? state.pair : 0;
    const roles = [
      [a, b, c, "Α", "Β", "Γ"],
      [b, a, c, "Β", "Α", "Γ"],
      [c, a, b, "Γ", "Α", "Β"],
    ] as const;
    const [x, y, z, X, Y, Z] = roles[pair];
    const d = add(z, scale(subtract(z, y), (s * 0.65) / distance(y, z)));
    fit([a, b, c, d]);
    if (step >= 1) {
      segment("extension", z, d, "auxiliary");
      vertex("Δ", d, 14, -side * 18);
    }
    if (step >= 2) {
      mark("exterior", x, z, d, "active");
      mark("opposite", x, y, z);
      scene.equalities.push(`∠${X}${Z}Δ > ∠${X}${Y}${Z} (I.16)`);
    }
    if (step >= 3) {
      mark("common", x, z, y, "working", 2);
      scene.equalities.push(`∠${X}${Z}Δ + ∠${X}${Z}${Y} > ∠${X}${Y}${Z} + ∠${X}${Z}${Y}`);
    }
    if (step >= 4) scene.equalities.push(`∠${X}${Y}${Z} + ∠${X}${Z}${Y} < two right angles (I.13)`);
    measure(`∠${X}${Y}${Z} (°)`, angleAt(x, y, z));
    measure(`∠${X}${Z}${Y} (°)`, angleAt(x, z, y));
    measure("Selected pair total (°)", angleAt(x, y, z) + angleAt(x, z, y));
    if (step >= 1) measure(`Exterior ∠${X}${Z}Δ (°)`, angleAt(x, z, d));
    if (step >= 5)
      scene.notice = {
        title: pair
          ? "A modern expansion of “similarly”"
          : "The source comparison · angles at Β and Γ",
        text: `Continue ${Y}${Z} through ${Z} to Δ. I.16 compares the exterior at ${Z} with the angle at ${Y}; adding the interior at ${Z} gives this pair’s bound. The original passage remains unchanged. Select another pair to repeat the construction.`,
      };
    scene.description = `I.17 compares the angles at ${Y} and ${Z}. An extension past ${Z} creates an exterior angle greater than the angle at ${Y}. Add the common angle at ${Z}, then use the straight pair from I.13. No triangle-angle-sum theorem is assumed.`;
  }
  if (p === 18) {
    measure("ΑΓ", distance(a, c));
    measure("ΑΒ", distance(a, b));
    measure("∠ΑΒΓ (°)", angleAt(a, b, c));
    measure("∠ΑΓΒ (°)", angleAt(a, c, b));
    if (state.ratio <= 1) {
      scene.warning =
        state.ratio === 1
          ? "ΑΓ equals ΑΒ. The proposed cut point would coincide with Γ, so ΒΓΔ would not be a triangle. I.18 requires ΑΓ > ΑΒ."
          : "ΑΓ is shorter than ΑΒ. No point Δ strictly inside ΑΓ can make ΑΔ = ΑΒ. Restore ΑΓ > ΑΒ to use I.18’s construction.";
      scene.description = scene.warning;
      return scene;
    }
    const d = sideAngleConstruction(a, b, c, side).e;
    if (step >= 1) {
      vertex("Δ", d, -18, -side * 12);
      segment("AD", a, d, "result", 1);
      segment("AB-equal", a, b, "result", 1);
      segment("BD", b, d, "active");
      scene.equalities.push("ΑΔ = ΑΒ (I.3)");
      measure("ΑΔ", distance(a, d));
    }
    if (step >= 2) {
      mark("exterior", a, d, b, "active");
      mark("opposite", d, c, b);
      scene.equalities.push("∠ΑΔΒ > ∠ΔΓΒ (I.16)");
    }
    if (step >= 3) {
      mark("isosceles", a, b, d, "active");
      scene.equalities.push("∠ΑΔΒ = ∠ΑΒΔ (I.5)");
    }
    if (step >= 4) scene.equalities.push("∠ΑΒΔ > ∠ΑΓΒ");
    if (step >= 5) {
      mark("whole", a, b, c, "result", 2);
      scene.equalities.push("∠ΑΒΓ > ∠ΑΒΔ > ∠ΑΓΒ");
    }
    scene.description =
      "ΑΓ is greater than ΑΒ. I.3 places Δ inside ΑΓ with ΑΔ = ΑΒ. The exterior angle ΑΔΒ of ΒΓΔ exceeds ΔΓΒ; isosceles ΑΒΔ transfers that inequality to ΑΒΔ. The whole angle ΑΒΓ is greater still.";
  }
  if (p === 19) {
    const sourceB = angleAt(source.a, source.b, source.c),
      sourceC = angleAt(source.a, source.c, source.b);
    const actualB = angleAt(a, b, c),
      actualC = angleAt(a, c, b);
    mark("at-B", a, b, c, "active");
    mark("at-C", a, c, b, "result", hypothetical && step === 2 ? 1 : 2);
    measure("Shown ΑΓ", distance(a, c));
    measure("Shown ΑΒ", distance(a, b));
    measure("Shown ∠ΑΒΓ (°)", actualB);
    measure("Shown ∠ΑΓΒ (°)", actualC);
    if (state.ratio <= 1) {
      scene.warning =
        "The original triangle must have ∠ΑΒΓ > ∠ΑΓΒ. Restore ΑΓ above 100% of ΑΒ to realize that given angle order.";
      scene.description = scene.warning;
      return scene;
    }
    const order = step === 2 ? "=" : "<";
    scene.notice = hypothetical
      ? {
          title: "Temporary supposition · the given angle inequality no longer holds",
          text: `This altered triangle has ΑΓ ${order} ΑΒ, and consequently ∠ΑΒΓ ${order} ∠ΑΓΒ. It cannot also satisfy the original ∠ΑΒΓ > ∠ΑΓΒ. The table keeps the original measurements visible. The next steps reject the alternative and return to the original triangle.`,
        }
      : {
          title: "The original given triangle",
          text: "The premise is ∠ΑΒΓ > ∠ΑΓΒ. Steps 3 and 4 temporarily draw the equal-side and shorter-side alternatives; each loses that premise. The numeric shape illustrates the premise, while the argument proves its consequence.",
        };
    scene.comparison = {
      title: "Given triangle and the displayed case",
      headers: [
        "Quantity / premise",
        "Original given",
        hypothetical ? "Temporary case" : "Displayed original",
      ],
      first: "Original given",
      second: hypothetical ? "Temporary case" : "Displayed original",
      rows: [
        ["ΑΓ / ΑΒ", state.ratio.toFixed(2), (distance(a, c) / distance(a, b)).toFixed(2)],
        ["∠ΑΒΓ", `${sourceB.toFixed(2)}°`, `${actualB.toFixed(2)}°`],
        ["∠ΑΓΒ", `${sourceC.toFixed(2)}°`, `${actualC.toFixed(2)}°`],
        ["Given ∠ΑΒΓ > ∠ΑΓΒ", "Satisfied", hypothetical ? "Not satisfied" : "Satisfied"],
      ],
    };
    if (hypothetical)
      scene.equalities.push(
        `IF ΑΓ ${order} ΑΒ, THEN ∠ΑΒΓ ${order} ∠ΑΓΒ (${step === 2 ? "I.5" : "I.18"})`,
        "This contradicts the original greater-angle premise",
      );
    else {
      scene.equalities.push("Given: ∠ΑΒΓ > ∠ΑΓΒ");
      if (step === 1) scene.equalities.push("If not ΑΓ > ΑΒ: either ΑΓ = ΑΒ or ΑΓ < ΑΒ");
      if (step >= 4) scene.equalities.push("Neither equal nor less; therefore ΑΓ > ΑΒ");
    }
    scene.description = scene.notice.text;
  }
  if (p === 20) {
    const pair = step >= 7 ? state.pair : 0;
    const roles = [
      [a, b, c, "Α", "Β", "Γ"],
      [b, a, c, "Β", "Α", "Γ"],
      [c, b, a, "Γ", "Β", "Α"],
    ] as const;
    const [x, y, z, X, Y, Z] = roles[pair];
    const d = triangleInequality(x, y, z, side).point;
    fit([a, b, c, d]);
    if (step >= 1) segment("continuation", x, d, "auxiliary");
    if (step >= 2) {
      vertex("Δ", d, -14, -side * 18);
      segment("copy", x, d, "result", 1);
      segment("reference", x, z, "result", 1);
      segment("join", d, z, "active");
      scene.equalities.push(`${X}Δ = ${X}${Z} (copied length)`);
    }
    if (step >= 3) {
      mark("isosceles-D", x, d, z, "active");
      mark("isosceles-Z", x, z, d, "active");
      scene.equalities.push(`∠${X}Δ${Z} = ∠${X}${Z}Δ (I.5)`);
    }
    if (step >= 4) {
      mark("whole", y, z, d, "result", 2);
      scene.equalities.push(`∠${Y}${Z}Δ > ∠${Y}Δ${Z} (whole > part)`);
    }
    if (step >= 5) scene.equalities.push(`Δ${Y} > ${Y}${Z} (I.19)`);
    if (step >= 6) scene.equalities.push(`Δ${Y} = ${Y}${X} + ${X}${Z} > ${Y}${Z}`);
    if (step >= 7)
      scene.notice = {
        title: pair
          ? "A modern expansion of “similarly”"
          : "The source construction · ΒΑ + ΑΓ > ΒΓ",
        text: `Continue ${Y}${X} through ${X} to Δ; copy ${X}${Z} to ${X}Δ and join Δ${Z}. The angle at ${Z} in Δ${Z}${Y} contains the isosceles angle as a proper part. I.19 makes Δ${Y} longer than ${Y}${Z}. The original passage remains unchanged.`,
      };
    measure(`${Y}${X} + ${X}${Z}`, distance(y, x) + distance(x, z));
    measure(`Remaining ${Y}${Z}`, distance(y, z));
    if (step >= 2) {
      measure(`Δ${Y}`, distance(d, y));
      measure(`${X}Δ`, distance(x, d));
      measure(`${X}${Z}`, distance(x, z));
    }
    if (step >= 4) {
      measure(`∠${Y}${Z}Δ (°)`, angleAt(y, z, d));
      measure(`∠${Y}Δ${Z} (°)`, angleAt(y, d, z));
    }
    scene.description = `I.20: continue ${Y}${X} beyond ${X}, copy ${X}${Z} to ${X}Δ, and join Δ${Z}. I.5 and the proper-part relation give a greater angle in Δ${Z}${Y}; I.19 gives Δ${Y} > ${Y}${Z}. The copied length replaces Δ${X}, yielding ${Y}${X} + ${X}${Z} > ${Y}${Z}.`;
  }
  return scene;
}
