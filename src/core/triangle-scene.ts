import { distance, type Point } from "./geometry";
import type { Ink, Scene } from "./scene";
import type { ReaderState } from "./state";
import { angleAt, area, congruentPair, isoscelesBridge, unequalSketch } from "./triangles";

export function triangleScene(state: ReaderState): Scene {
  const { proposition, step, size, ratio, angle, side, motion } = state;
  const scene: Scene = {
    segments: [],
    circles: [],
    vertices: [],
    angles: [],
    figures: [],
    bounds: [-size, -size, size, size],
    equalities: [],
    measurements: [],
    description: "",
    warning: "",
  };
  const vertex = (id: string, at: Point, dx = 0, dy = 22, label = id) =>
    scene.vertices.push({ id, at, label, dx, dy });
  const segment = (id: string, a: Point, b: Point, ink: Ink = "working", ticks = 0) =>
    scene.segments.push({ id, a, b, ink, ticks });
  const mark = (id: string, first: Point, at: Point, last: Point, ink: Ink = "result", rings = 1) =>
    scene.angles?.push({ id, first, at, last, ink, rings });
  const figure = (id: string, points: Point[], tone: "first" | "second") =>
    scene.figures?.push({ id, points, tone });
  const fit = (points: Point[], margin = size * 0.25) => {
    scene.bounds = [
      Math.min(...points.map((p) => p.x)) - margin,
      Math.min(...points.map((p) => p.y)) - margin,
      Math.max(...points.map((p) => p.x)) + margin,
      Math.max(...points.map((p) => p.y)) + margin,
    ];
  };

  if (proposition === 4) {
    const pair = congruentPair(size, ratio, angle * 2, side, motion / 100);
    const [a, b, c] = pair.moving;
    const [d, e, z] = pair.target;
    // Fixed scale while moving: comparison must not make the triangle appear to resize.
    const pathPoints = Array.from(
      { length: 25 },
      (_, index) => congruentPair(size, ratio, angle * 2, side, index / 24).moving,
    ).flat();
    fit([...pathPoints, ...pair.target], size * 0.18);
    scene.height = 330;
    figure("ABC", [a, b, c], "first");
    figure("DEZ", [d, e, z], "second");
    segment("AB", a, b, "active", 1);
    segment("AC", a, c, "active", 2);
    segment("BC", b, c, step >= 5 ? "result" : "working", step >= 5 ? 3 : 0);
    segment("DE", d, e, "given", 1);
    segment("DZ", d, z, "given", 2);
    segment("EZ", e, z, step >= 5 ? "result" : "working", step >= 5 ? 3 : 0);
    if (motion === 100) {
      vertex("Α", a, -12, 25, "Α / Δ");
      vertex("Β", b, 14, 25, "Β / Ε");
      vertex("Γ", c, 0, -side * 23, "Γ / Ζ");
    } else {
      vertex("Α", a, -14, 25);
      vertex("Β", b, 14, 25);
      vertex("Γ", c, 0, -side * 24);
      vertex("Δ", d, -14, 25);
      vertex("Ε", e, 14, 25);
      vertex("Ζ", z, 0, -side * 24);
    }
    mark("BAC", b, a, c, "active");
    mark("EDZ", e, d, z);
    if (step >= 6) {
      mark("ABC", a, b, c, "result", 2);
      mark("DEZ", d, e, z, "result", 2);
      mark("ACB", a, c, b, "result", 3);
      mark("DZE", d, z, e, "result", 3);
    }
    scene.equalities = ["ΑΒ = ΔΕ; ΑΓ = ΔΖ", "∠ΒΑΓ = ∠ΕΔΖ (given)"];
    if (step >= 5) scene.equalities.push("ΒΓ = ΕΖ");
    if (step >= 6) scene.equalities.push("∠ΑΒΓ = ∠ΔΕΖ; ∠ΑΓΒ = ∠ΔΖΕ");
    scene.comparison = {
      title: "Match the vertices in order",
      first: "ΑΒΓ",
      second: "ΔΕΖ",
      rows: [
        ["Α", "Δ", "included angle"],
        ["Β", "Ε", "end of first side"],
        ["Γ", "Ζ", "end of second side"],
      ],
    };
    scene.measurements = [
      { label: "ΑΒ / ΔΕ", value: distance(a, b) },
      { label: "ΑΓ / ΔΖ", value: distance(a, c) },
      { label: "∠ΒΑΓ (°)", value: angleAt(b, a, c) },
    ];
    scene.description = `Two triangles with equal pairs of sides and equal included angles. Α corresponds to Δ, Β to Ε, Γ to Ζ. The moving triangle is at ${motion}% of a rigid rotation and translation; its side lengths do not change.`;
    if (step >= 2)
      scene.notice = {
        title: "A movement with an assumption",
        text: "The overlay illustrates superposition using a rigid motion. Euclid’s five postulates do not explicitly justify this operation. Flipping this plate reflects both triangles together; it does not demonstrate a reflected correspondence.",
      };
  } else if (proposition === 5) {
    const { a, b, c, d, e, z, h } = isoscelesBridge(size, angle, ratio, side);
    fit([a, b, c, d, e]);
    segment("AB", a, b, "given", 1);
    segment("AC", a, c, "given", 1);
    segment("BC", b, c, "given");
    segment("BD", b, d, "auxiliary");
    segment("CE", c, e, "auxiliary");
    vertex("Α", a, 0, -side * 23);
    vertex("Β", b, -22, 0);
    vertex("Γ", c, 22, 0);
    vertex("Δ", d, -14, side * 24);
    vertex("Ε", e, 14, side * 24);
    if (step >= 2) {
      vertex("Ζ", z, -20, 5);
      vertex("Η", h, 20, 5);
      segment("ZC", z, c, step === 2 ? "active" : "working", step >= 4 ? 2 : 0);
      segment("HB", h, b, step === 2 ? "active" : "working", step >= 4 ? 2 : 0);
      if (step >= 5) {
        segment("BZ", b, z, "result", 3);
        segment("CH", c, h, "result", 3);
      }
    }
    if (step >= 3 && step <= 5) {
      figure("AZC", [a, z, c], "first");
      figure("AHB", [a, h, b], "second");
      scene.comparison = {
        title: "First comparison · the larger triangles",
        first: "ΑΖΓ",
        second: "ΑΗΒ",
        rows: [
          ["ΑΖ", "ΑΗ", "cut equal by I.3"],
          ["ΑΓ", "ΑΒ", "given equal sides"],
          ["∠ΖΑΓ", "∠ΗΑΒ", "same included angle"],
        ],
      };
      mark("ZAC", z, a, c, "active");
      if (step >= 4) {
        mark("ACZ", a, c, z, "active");
        mark("ABH", a, b, h, "active");
        mark("AZC", a, z, c, "result", 2);
        mark("AHB", a, h, b, "result", 2);
      }
    }
    if (step >= 6 && step <= 7) {
      figure("BZC", [b, z, c], "first");
      figure("CHB", [c, h, b], "second");
      scene.comparison = {
        title: "Second comparison · below the base",
        first: "ΒΖΓ",
        second: "ΓΗΒ",
        rows: [
          ["ΒΖ", "ΓΗ", "equal remainders"],
          ["ΖΓ", "ΗΒ", "first comparison"],
          ["∠ΒΖΓ", "∠ΓΗΒ", "first comparison"],
        ],
      };
      mark("BZC", b, z, c, "active", 2);
      mark("CHB", c, h, b, "active", 2);
      if (step === 7) {
        mark("BCZ", b, c, z, "active");
        mark("CBH", c, b, h, "active");
      }
    }
    if (step === 8) {
      mark("ABH-whole", a, b, h, "working", 3);
      mark("ACZ-whole", a, c, z, "working", 3);
      mark("CBH-part", c, b, h, "active", 2);
      mark("BCZ-part", b, c, z, "active", 2);
      scene.comparison = {
        title: "Subtract equal parts from equal whole angles",
        first: "at Β",
        second: "at Γ",
        rows: [
          ["∠ΑΒΗ", "∠ΑΓΖ", "equal wholes · first comparison"],
          ["− ∠ΓΒΗ", "− ∠ΒΓΖ", "equal parts · second comparison"],
          ["= ∠ΑΒΓ", "= ∠ΑΓΒ", "equal remainders"],
        ],
      };
    }
    if (step >= 8) {
      mark("ABC-base", a, b, c);
      mark("ACB-base", a, c, b);
    }
    if (step >= 9) {
      mark("ZBC-exterior", z, b, c, "result", 2);
      mark("HCB-exterior", h, c, b, "result", 2);
    }
    scene.equalities = ["ΑΒ = ΑΓ (given)"];
    if (step >= 2) scene.equalities.push("ΑΖ = ΑΗ");
    if (step >= 4) scene.equalities.push("ΖΓ = ΗΒ");
    if (step >= 5) scene.equalities.push("ΒΖ = ΓΗ");
    if (step >= 8) scene.equalities.push("∠ΑΒΓ = ∠ΑΓΒ");
    if (step >= 9) scene.equalities.push("∠ΖΒΓ = ∠ΗΓΒ");
    scene.measurements = [
      { label: "ΑΒ / ΑΓ", value: size },
      { label: "∠ΑΒΓ (°)", value: angleAt(a, b, c) },
      { label: "∠ΑΓΒ (°)", value: angleAt(a, c, b) },
    ];
    if (step >= 2) scene.measurements.push({ label: "ΑΖ / ΑΗ", value: distance(a, z) });
    scene.description = `Isosceles triangle ΑΒΓ with its equal sides extended to Δ and Ε. ${step >= 2 ? "Ζ is chosen on ΒΔ; ΑΗ is cut equal to ΑΖ. Cross-lines ΖΓ and ΗΒ form two successive pairs of triangles." : ""} ${step === 8 ? "Equal small angle parts are removed from equal whole angles to leave equal base angles." : ""}`;
  } else {
    const hypothetical = step >= 1 && step <= 4;
    const actual = isoscelesBridge(size, angle, ratio, side);
    const { a, b, c, d } = hypothetical
      ? unequalSketch(size, angle, 0.55 + ratio * 0.25, side)
      : actual;
    fit([a, b, c]);
    segment("AB", a, b, "given", step >= 5 ? 1 : 0);
    segment("AC", a, c, "given", hypothetical && step >= 2 ? 2 : step >= 5 ? 1 : 0);
    segment("BC", b, c, "given");
    vertex("Α", a, 0, -side * 23);
    vertex("Β", b, -20, side * 15);
    vertex("Γ", c, 20, side * 15);
    if (hypothetical) {
      scene.notice = {
        title: "Hypothetical sketch · not all givens can hold",
        text: "This scalene sketch shows the temporary supposition ΑΒ > ΑΓ. Its base angles are unequal. The proof retains equal base angles as a given and derives a contradiction: no Euclidean triangle satisfies both conditions.",
      };
      scene.equalities = ["Given in proof: ∠ΑΒΓ = ∠ΑΓΒ", "Suppose: ΑΒ > ΑΓ"];
      if (step >= 2) {
        vertex("Δ", d, -25, 0);
        segment("DB", d, b, "active", 2);
        segment("DC", d, c, "active");
        figure("ABC-whole", [a, b, c], "second");
        figure("DBC-part", [d, b, c], "first");
        scene.equalities.push("Cut: ΔΒ = ΑΓ");
        scene.measurements.push(
          { label: "Area ΔΒΓ", value: area(d, b, c) },
          { label: "Area ΑΓΒ", value: area(a, c, b) },
        );
      }
      if (step >= 3)
        scene.comparison = {
          title: "Conditional comparison · these hypotheses cannot coexist",
          first: "ΔΒΓ",
          second: "ΑΓΒ",
          rows: [
            ["ΔΒ", "ΑΓ", "cut equal"],
            ["ΒΓ", "ΓΒ", "common side"],
            ["∠ΔΒΓ", "∠ΑΓΒ", "equal in proof’s given, not in sketch"],
          ],
        };
      if (step === 4) scene.equalities.push("I.4 would make part = whole → contradiction");
    } else {
      mark("ABC", a, b, c);
      mark("ACB", a, c, b);
      scene.equalities = ["∠ΑΒΓ = ∠ΑΓΒ (given)"];
      if (step >= 5) scene.equalities.push("ΑΒ = ΑΓ (conclusion)");
    }
    scene.measurements.unshift(
      { label: "∠ΑΒΓ (°)", value: angleAt(a, b, c) },
      { label: "∠ΑΓΒ (°)", value: angleAt(a, c, b) },
    );
    scene.description = hypothetical
      ? "Hypothetical scalene sketch. It deliberately does not satisfy the theorem’s equal-angle given. Δ lies inside ΑΒ and ΔΒΓ is a proper part of ΑΓΒ. The proof derives an impossibility from assuming unequal sides."
      : "Triangle ΑΒΓ with equal base angles. After rejecting the unequal-side supposition, the opposite sides are equal.";
  }
  return scene;
}
