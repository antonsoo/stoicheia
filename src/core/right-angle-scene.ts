import { distance, type Point } from "./geometry";
import { dropPerpendicular, exteriorConstruction, raisePerpendicular } from "./right-angles";
import type { Ink, Scene } from "./scene";
import type { ReaderState } from "./state";
import { angleAt, radians } from "./triangles";

export function rightAngleScene(state: ReaderState): Scene {
  const {
    proposition: p,
    step,
    size: s,
    side,
    angle,
    ratio,
    take,
    third,
    variant,
    probe,
    offset,
  } = state;
  const scene: Scene = {
    segments: [],
    circles: [],
    vertices: [],
    angles: [],
    figures: [],
    bounds: [-s, -s, s, s],
    equalities: [],
    measurements: [],
    description: "",
    warning: "",
  };
  const segment = (id: string, a: Point, b: Point, ink: Ink = "working", ticks = 0) =>
    scene.segments.push({ id, a, b, ink, ticks });
  const vertex = (id: string, at: Point, dx = 0, dy = 22, label = id) =>
    scene.vertices.push({ id, at, dx, dy, label });
  const mark = (id: string, first: Point, at: Point, last: Point, ink: Ink = "result", rings = 1) =>
    scene.angles?.push({ id, first, at, last, ink, rings });
  const measure = (label: string, value: number) => scene.measurements.push({ label, value });
  const polar = (length: number, degrees: number): Point => ({
    x: length * Math.cos(radians(degrees)),
    y: length * Math.sin(radians(degrees)),
  });
  const fit = (points: Point[]) => {
    const margin = s * 0.22;
    scene.bounds = [
      Math.min(...points.map((v) => v.x)) - margin,
      Math.min(...points.map((v) => v.y)) - margin,
      Math.max(...points.map((v) => v.x)) + margin,
      Math.max(...points.map((v) => v.y)) + margin,
    ];
  };
  const b = { x: 0, y: 0 };

  if (p === 11) {
    const a = { x: -s, y: 0 },
      end = { x: s, y: 0 },
      c = { x: s * (2 * take - 1), y: 0 };
    const { d, e, z } = raisePerpendicular(a, end, c, side);
    fit([a, end, z]);
    segment("AB", a, end, "given");
    vertex("Α", a, -14, side * 22);
    vertex("Β", end, 14, side * 22);
    vertex("Γ", c, 0, side * 22);
    if (step >= 1) {
      vertex("Δ", d, 0, side * 22);
      vertex("Ε", e, 0, side * 22);
      segment("DC", d, c, "result", 1);
      segment("CE", c, e, "result", 1);
      scene.equalities.push("ΔΓ = ΓΕ (I.2)");
    }
    if (step >= 2) {
      vertex("Ζ", z, 0, -side * 22);
      segment("DZ", d, z, "working", 2);
      segment("EZ", e, z, "working", 2);
    }
    if (step >= 3) segment("CZ", c, z, step >= 6 ? "result" : "active");
    if (step >= 4) scene.equalities.push("ΔΓ = ΓΕ; ΓΖ is common");
    if (step >= 5) {
      mark("DCZ", d, c, z);
      mark("ZCE", z, c, e);
      scene.equalities.push("ΔΖ = ΕΖ; ∠ΔΓΖ = ∠ΕΓΖ (I.8)");
    }
    if (step >= 6) scene.equalities.push("Both adjacent angles are right (definition 10)");
    measure("ΑΒ", distance(a, end));
    if (step >= 1) {
      measure("ΔΓ", distance(d, c));
      measure("ΓΕ", distance(c, e));
    }
    if (step >= 3) {
      measure("∠ΔΓΖ (°)", angleAt(d, c, z));
      measure("∠ΕΓΖ (°)", angleAt(e, c, z));
    }
    scene.description =
      "Γ lies within ΑΒ. I.2 copies ΓΔ to ΓΕ; I.1 constructs equilateral ΔΖΕ. I.8 makes the adjacent angles at Γ equal, so ΓΖ is perpendicular by definition 10.";
  } else if (p === 12) {
    const a = { x: -s, y: 0 },
      end = { x: s, y: 0 },
      c = { x: 0, y: side * ratio * s },
      d = { x: offset * s, y: (variant ? side : -side) * third * s };
    const construction = dropPerpendicular(a, end, c, d, side),
      { radius, intersection, foot } = construction;
    const extent = Math.max(s, radius) * 1.16;
    fit([
      { x: -extent, y: 0 },
      { x: extent, y: 0 },
      { x: c.x - radius, y: c.y - radius },
      { x: c.x + radius, y: c.y + radius },
      d,
    ]);
    segment("AB-unbounded", { x: -extent, y: 0 }, { x: extent, y: 0 }, "given");
    vertex("Α", a, 0, side * 24);
    vertex("Β", end, 0, side * 24);
    vertex("Γ", c, -20, -side * 10, radius === 0 ? "Γ / Δ" : "Γ");
    if (step >= 1 && radius > 0) vertex("Δ", d, 16, -Math.sign(d.y) * 20);
    if (step >= 2 && radius > 0) {
      scene.circles.push({ id: "circle-c", center: c, radius, ink: "working" });
      vertex("Ζ", { x: 0, y: c.y + side * radius }, 0, -side * 22);
    }
    if (step >= 2 && intersection.kind === "crossings" && foot) {
      const [e, h] = intersection.points;
      vertex("Ε", e, -14, -side * 18);
      vertex("Η", h, 14, -side * 18);
      if (step >= 3) {
        vertex("Θ", foot, 0, side * 24);
        segment("ET", e, foot, "result", 1);
        segment("TH", foot, h, "result", 1);
        scene.equalities.push("ΕΘ = ΘΗ (I.10)");
      }
      if (step >= 4) {
        segment("CE", c, e, "working", 2);
        segment("CH", c, h, "working", 2);
        segment("CT", c, foot, step >= 7 ? "result" : "active");
        measure("ΓΕ", distance(c, e));
        measure("ΓΗ", distance(c, h));
        measure("∠ΕΘΓ (°)", angleAt(e, foot, c));
        measure("∠ΗΘΓ (°)", angleAt(h, foot, c));
      }
      if (step >= 5) scene.equalities.push("ΗΘ = ΘΕ; ΘΓ is common");
      if (step >= 6) {
        mark("ETC", e, foot, c);
        mark("HTC", h, foot, c);
        scene.equalities.push("ΓΕ = ΓΗ (radii); ∠ΕΘΓ = ∠ΗΘΓ (I.8)");
      }
      if (step >= 7) scene.equalities.push("ΓΘ is perpendicular (definition 10)");
    }
    if (step >= 2 && intersection.kind === "tangent")
      vertex("touch", intersection.points[0], 20, side * 24, "one contact");
    if (variant) {
      const explanation =
        intersection.kind === "degenerate"
          ? "Δ coincides with Γ. A zero radius does not describe the circle required here, and there is no chord to bisect."
          : intersection.kind === "miss"
            ? "This same-side choice makes a circle that misses ΑΒ. There are no chord endpoints to bisect."
            : intersection.kind === "tangent"
              ? "This circle touches ΑΒ once. One contact is not a chord with two distinct endpoints; I.10 cannot be applied to a zero-length segment."
              : "This same-side choice happens to give two crossings. The construction still works here, but a same-side choice does not guarantee them. Change Δ's depth or horizontal offset to inspect a miss or tangency.";
      scene.notice = {
        title: `Altered choice · ${intersection.kind === "crossings" ? "two crossings" : intersection.kind === "tangent" ? "one contact" : intersection.kind === "degenerate" ? "zero radius" : "no crossing"}`,
        text: explanation,
      };
      if (intersection.kind !== "crossings") scene.warning = explanation;
    } else
      scene.notice = {
        title: "Why the other side matters",
        text: "The circle passes through Δ beyond the line, while Γ is its centre on this side. Its radius therefore exceeds the centre's distance to ΑΒ, ensuring two distinct crossings. Move Δ: the chord changes, while the perpendicular foot stays fixed.",
      };
    if (step >= 2) measure("Circle radius ΓΔ", radius);
    scene.description = `ΑΒ is unbounded; Γ is off the line. Δ is ${variant ? "on the same side in this altered experiment" : "on the opposite side as in the source"}. The circle has ${intersection.kind === "crossings" ? "two distinct intersections, Ε and Η" : intersection.kind === "tangent" ? "one contact, so no chord to bisect" : "no intersection"}. ${foot ? "I.10 constructs their midpoint Θ. Joining ΓΘ supplies the perpendicular." : "No midpoint or perpendicular conclusion is supplied."}`;
  } else if (p === 13) {
    const c = { x: s, y: 0 },
      d = { x: -s, y: 0 },
      a = polar(s, side * angle),
      e = raisePerpendicular(d, c, b, side).z;
    fit([a, c, d, e]);
    vertex("Β", b, 0, side * 24);
    vertex("Γ", c, 14, side * 24);
    vertex("Δ", d, -14, side * 24);
    vertex("Α", a, angle === 90 ? 0 : 16, -side * 20);
    segment("CD", d, c, "given");
    segment("BA", b, a, "given");
    mark("CBA", c, b, a, "active");
    mark("ABD", a, b, d, "working", 2);
    const first = angleAt(c, b, a),
      second = angleAt(a, b, d);
    measure("∠ΓΒΑ (°)", first);
    measure("∠ΑΒΔ (°)", second);
    measure("Original pair total (°)", first + second);
    if (angle === 90) {
      scene.notice = {
        title: "The equal-angle branch",
        text: "The two adjacent angles are equal, so definition 10 already makes both right. The later three-part argument belongs to the unequal case; ΑΒ and ΒΕ would coincide here.",
      };
      scene.equalities = ["∠ΓΒΑ = ∠ΑΒΔ; both are right (definition 10)"];
      if (step >= 2 && step < 7)
        scene.warning =
          "At 90° the first branch completes the proof. Choose a smaller angle to follow the subsequent unequal-angle branch; no nonzero angle ΑΒΕ exists here.";
    } else {
      if (step === 1)
        scene.notice = {
          title: "The unequal-angle branch is selected",
          text: "This step states what would follow if the adjacent angles were equal. They are unequal in this drawing. Continue to construct ΒΕ and compare the two totals, or select 90° to inspect the first branch.",
        };
      if (step >= 2) {
        vertex("Ε", e, 0, -side * 22);
        segment("BE", b, e, "result");
        scene.equalities.push("∠ΓΒΕ + ∠ΕΒΔ = two right angles");
      }
      if (step >= 3) scene.equalities.push("∠ΓΒΕ + ∠ΕΒΔ = ∠ΓΒΑ + ∠ΑΒΕ + ∠ΕΒΔ");
      if (step >= 3 && step <= 5) {
        scene.angles = [];
        mark("CBA-part", c, b, a, "active");
        mark("ABE-part", a, b, e, "working", 2);
        mark("EBD-part", e, b, d, "result", 3);
      }
      if (step >= 4) scene.equalities.push("∠ΔΒΑ + ∠ΑΒΓ = the same three parts");
      if (step >= 5) scene.equalities.push("∠ΓΒΑ + ∠ΑΒΔ = two right angles");
    }
    scene.description =
      "ΑΒ stands on straight ΓΔ. A perpendicular ΒΕ provides two known right angles. The unequal-angle proof groups the same three parts in two ways; the 90-degree setting instead uses definition 10 directly.";
  } else if (p === 14) {
    const c = { x: -s, y: 0 },
      d = { x: s, y: 0 },
      a = polar(s, side * (90 + angle)),
      e = polar(s, side * Math.max(5, probe));
    const hypothetical = step >= 1 && step <= 5;
    fit([a, c, d, e]);
    segment("CD", c, d, "given");
    segment("BA", b, a, "given");
    vertex("Α", a, -12, -side * 22);
    vertex("Β", b, 0, side * 24);
    vertex("Γ", c, -14, side * 22);
    vertex("Δ", d, 14, side * 22);
    mark("ABC", a, b, c, "given");
    mark("ABD", a, b, d, "working", 2);
    measure("Given ∠ΑΒΓ + ∠ΑΒΔ (°)", angleAt(a, b, c) + angleAt(a, b, d));
    scene.equalities = ["Given: ∠ΑΒΓ + ∠ΑΒΔ = two right angles"];
    if (hypothetical) {
      vertex("Ε", e, 16, -side * 18);
      segment("BE-supposed", b, e, "auxiliary");
      mark("ABE", a, b, e, "active");
      scene.notice = {
        title: "Hypothetical continuation · not all premises can hold",
        text: "Ε is drawn off ΓΒΔ, following the printed arrangement. The proof temporarily calls ΓΒΕ one straight line. That claim cannot hold together with the original angle premise and a different Ε. Measurements describe the drawing; conditional equalities describe the rejected supposition.",
      };
      if (step >= 2) scene.equalities.push("If ΓΒΕ were straight: ∠ΑΒΓ + ∠ΑΒΕ = two right angles");
      if (step >= 4) scene.equalities.push("Under that supposition: ∠ΑΒΕ would equal ∠ΑΒΔ");
      if (step >= 5) scene.equalities.push("But ∠ΑΒΕ is a proper part of ∠ΑΒΔ → contradiction");
      measure("Drawn ∠ΑΒΓ + ∠ΑΒΕ (°)", angleAt(a, b, c) + angleAt(a, b, e));
      measure("Drawn ∠ΑΒΕ (°)", angleAt(a, b, e));
      measure("Drawn ∠ΑΒΔ (°)", angleAt(a, b, d));
    } else if (step >= 6) scene.equalities.push("ΓΒ and ΒΔ form one straight line");
    scene.description = hypothetical
      ? "Hypothetical sketch: the original angle pair totals two right angles; Ε lies off ΓΒΔ. The supposition would force a smaller angle equal to a larger one, so it cannot be realized by this or any plane figure."
      : "The given adjacent angles total two right angles and lie on different sides of ΑΒ. ΓΒ and ΒΔ are consequently one straight line.";
  } else if (p === 15) {
    const a = polar(s, side * (180 - angle * 2)),
      end = { x: -a.x, y: -a.y },
      c = { x: s, y: 0 },
      d = { x: -s, y: 0 };
    fit([a, end, c, d]);
    segment("AB", a, end, "given");
    segment("CD", c, d, "given");
    vertex("Α", a, -12, -Math.sign(a.y) * 22);
    vertex("Β", end, 12, -Math.sign(end.y) * 22);
    vertex("Γ", c, 14, side * 22);
    vertex("Δ", d, -14, -side * 18);
    vertex("Ε", b, 0, side * 24);
    if (step <= 4) {
      mark("CEA", c, b, a, "active");
      if (step >= 1) mark("AED", a, b, d, "working", 2);
      if (step >= 2) mark("DEB", d, b, end, "result");
    } else {
      mark("CEB", c, b, end, "active", 2);
      mark("DEA", d, b, a, "result", 2);
      if (step === 6) {
        mark("CEA", c, b, a);
        mark("DEB", d, b, end);
      }
    }
    if (step >= 1) scene.equalities.push("∠ΓΕΑ + ∠ΑΕΔ = two right angles (I.13)");
    if (step >= 2) scene.equalities.push("∠ΑΕΔ + ∠ΔΕΒ = two right angles (I.13)");
    if (step >= 3) scene.equalities.push("∠ΓΕΑ + ∠ΑΕΔ = ∠ΑΕΔ + ∠ΔΕΒ");
    if (step >= 4) scene.equalities.push("Subtract ∠ΑΕΔ: ∠ΓΕΑ = ∠ΒΕΔ");
    if (step >= 5) scene.equalities.push("Likewise: ∠ΓΕΒ = ∠ΔΕΑ");
    measure("∠ΓΕΑ (°)", angleAt(c, b, a));
    measure("∠ΒΕΔ (°)", angleAt(end, b, d));
    measure("∠ΓΕΒ (°)", angleAt(c, b, end));
    measure("∠ΔΕΑ (°)", angleAt(d, b, a));
    scene.description =
      "ΑΒ and ΓΔ cross at Ε. Two linear pairs share angle ΑΕΔ. Subtracting it leaves equal vertically opposite angles; repeat to obtain the other pair.";
  } else {
    const a = polar(s * ratio, side * angle * 2),
      c = { x: s, y: 0 };
    const { d, h, e, z, theta, kappa } = exteriorConstruction(a, b, c, side);
    const second = step >= 8;
    fit([a, b, c, d, h, ...(second ? [theta, kappa] : [e, z])]);
    segment("AB", a, b, "given");
    segment("BC", b, c, "given");
    segment("CA", c, a, "given");
    segment("CD", c, d, "working");
    vertex("Α", a, -12, -side * 22);
    vertex("Β", b, -16, side * 22);
    vertex("Γ", c, 0, side * 24);
    vertex("Δ", d, 16, side * 22);
    if (!second && step >= 1) vertex("Ε", e, -18, 0);
    if (!second && step >= 2) {
      vertex("Ζ", z, 12, -side * 22);
      segment("BZ", b, z, "working");
      segment("ZC", z, c, "working");
      segment("CH", c, h, "auxiliary");
      vertex("Η", h, 14, side * 22);
    }
    if (!second && step >= 3) {
      segment("AE", a, e, "result", 1);
      segment("EC", e, c, "result", 1);
      segment("BE", b, e, "result", 2);
      segment("EZ", e, z, "result", 2);
      scene.equalities.push("ΑΕ = ΕΓ; ΒΕ = ΕΖ");
    }
    if (!second && step >= 4) {
      mark("AEB", a, e, b, "active");
      mark("ZEC", z, e, c, "result");
      scene.equalities.push("∠ΑΕΒ = ∠ΖΕΓ (I.15)");
    }
    if (!second && step >= 5) {
      scene.figures = [
        { id: "ABE", points: [a, b, e], tone: "first" },
        { id: "CZE", points: [c, z, e], tone: "second" },
      ];
      scene.equalities.push("ΑΒ = ΖΓ (I.4)");
      scene.comparison = {
        title: "Side–angle–side correspondence",
        first: "ΑΒΕ",
        second: "ΓΖΕ",
        rows: [
          ["ΑΕ", "ΓΕ", "equal halves · I.10"],
          ["∠ΑΕΒ", "∠ΓΕΖ", "vertical angles · I.15"],
          ["ΕΒ", "ΕΖ", "equal extension"],
          ["∠ΒΑΕ", "∠ΖΓΕ", "corresponding angles · I.4"],
        ],
      };
    }
    if (!second && step >= 6) {
      mark("BAE", b, a, e, "active", 2);
      mark("ECZ", e, c, z, "result", 2);
      scene.equalities.push("∠ΒΑΕ = ∠ΕΓΖ (I.4)");
    }
    if (step >= 7) {
      mark("ACD", a, c, d, "working", 3);
      scene.equalities.push("∠ΑΓΔ > ∠ΒΑΓ (whole > proper part)");
    }
    if (second) {
      vertex("Θ", theta, 0, side * 24);
      vertex("Κ", kappa, 12, side * 22);
      vertex("Η", h, 14, side * 22);
      segment("CH", c, h, "auxiliary");
      segment("AK", a, kappa, "working");
      segment("CK", c, kappa, "result");
      segment("BT", b, theta, "result", 1);
      segment("TC", theta, c, "result", 1);
      segment("AT", a, theta, "result", 2);
      segment("TK", theta, kappa, "result", 2);
      mark("ABT", a, b, theta, "active", 2);
      mark("TCK", theta, c, kappa, "result", 2);
      mark("BCH", b, c, h, "working", 3);
      scene.figures = [
        { id: "BTA", points: [b, theta, a], tone: "first" },
        { id: "CTK", points: [c, theta, kappa], tone: "second" },
      ];
      scene.equalities.push(
        "ΒΘ = ΘΓ; ΑΘ = ΘΚ; opposite angles at Θ are equal",
        "∠ΑΒΓ = ∠ΘΓΚ < ∠ΒΓΗ = ∠ΑΓΔ",
      );
      scene.notice = {
        title: "The second construction hidden in ‘similarly’",
        text: "Now bisect ΒΓ at Θ, extend ΑΘ to Κ with ΘΚ = ΘΑ, and join ΚΓ. Θ and Κ are modern labels expanding the source's abbreviated instruction. The copied angle lies inside ΒΓΗ, which is vertically opposite and equal to ΑΓΔ.",
      };
      scene.comparison = {
        title: "The repeated side–angle–side argument",
        first: "ΒΘΑ",
        second: "ΓΘΚ",
        rows: [
          ["ΒΘ", "ΓΘ", "equal halves · I.10"],
          ["∠ΒΘΑ", "∠ΓΘΚ", "vertical angles · I.15"],
          ["ΘΑ", "ΘΚ", "equal extension"],
          ["∠ΑΒΘ", "∠ΚΓΘ", "corresponding angles · I.4"],
        ],
      };
    }
    measure("Exterior ∠ΑΓΔ (°)", angleAt(a, c, d));
    measure("Interior ∠ΒΑΓ (°)", angleAt(b, a, c));
    measure("Interior ∠ΑΒΓ (°)", angleAt(a, b, c));
    if (!second && step >= 6) measure("Copied ∠ΕΓΖ (°)", angleAt(e, c, z));
    if (second) {
      measure("Copied ∠ΘΓΚ (°)", angleAt(theta, c, kappa));
      measure("Other exterior ∠ΒΓΗ (°)", angleAt(b, c, h));
    }
    scene.description = second
      ? "Second construction: I.10 bisects ΒΓ at Θ; extending ΑΘ to Κ copies ΘΑ. The triangles ΒΘΑ and ΓΘΚ correspond by I.15 and I.4. Their angle copy sits inside ΒΓΗ, equal to exterior ΑΓΔ. Θ and Κ are modern labels."
      : "First construction: I.10 bisects ΑΓ at Ε. Extend ΒΕ to Ζ with ΕΖ equal to ΒΕ; join ΖΓ. I.15 and I.4 place a copy of interior ΒΑΓ inside exterior ΑΓΔ, establishing a strict inequality.";
  }
  return scene;
}
