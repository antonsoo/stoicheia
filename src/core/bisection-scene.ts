import { bisectAngle, bisectSegment, radialCandidate, triangleFromSides } from "./bisection";
import { distance, type Point, scale } from "./geometry";
import type { Ink, Scene } from "./scene";
import type { ReaderState } from "./state";
import { angleAt, radians, rigidMotion } from "./triangles";

export function bisectionScene(state: ReaderState): Scene {
  const { proposition, step, size, ratio, angle, side, motion, probe, variant, take, third } =
    state;
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
  const circle = (id: string, center: Point, radius: number, ink: Ink = "auxiliary") =>
    scene.circles.push({ id, center, radius, ink });
  const fit = (points: Point[], margin = size * 0.22) => {
    scene.bounds = [
      Math.min(...points.map((p) => p.x)) - margin,
      Math.min(...points.map((p) => p.y)) - margin,
      Math.max(...points.map((p) => p.x)) + margin,
      Math.max(...points.map((p) => p.y)) + margin,
    ];
  };
  const polar = (length: number, degrees: number): Point => ({
    x: length * Math.cos(radians(degrees)),
    y: length * Math.sin(radians(degrees)),
  });

  if (proposition === 7) {
    const a = { x: 0, y: 0 };
    const b = { x: size, y: 0 };
    const c = polar(size * (1 + ratio * 0.25), side * angle * 2);
    const candidate = radialCandidate(
      a,
      b,
      c,
      -side * Math.min(probe, Math.floor(angle * 1.3)),
      variant === 1,
    );
    const { d, distinct, sameSide } = candidate;
    fit([a, b, c, d]);
    vertex("Α", a, -15, 22);
    vertex("Β", b, 20, 20);
    vertex("Γ", c, -12, -side * 22, distinct ? "Γ" : "Γ / Δ");
    if (distinct) vertex("Δ", d, 16, sameSide ? side * 22 : -side * 22);
    segment("AB", a, b, "given");
    segment("AC", a, c, "given", 1);
    segment("BC", b, c, "given");
    segment("AD", a, d, "active", 1);
    segment("BD", b, d, "active");
    if (step >= 1 && distinct) segment("CD", c, d, "working");
    if (step >= 2 && distinct && sameSide) {
      mark("ACD", a, c, d, "result", 2);
      mark("ADC", a, d, c, "result", 2);
      if (step >= 3) mark("DCB", d, c, b, "active");
      if (step >= 4) mark("CDB", c, d, b, "active", 3);
    }
    scene.equalities = ["ΑΓ = ΑΔ (preserved by this control)"];
    if (!distinct) {
      scene.warning =
        "I.7 concerns distinct meeting points. Increase the turn to examine its contradiction argument.";
      scene.notice = {
        title: "The two meeting points coincide",
        text: "Both distance pairs now agree, but Γ and Δ are the same point. I.7 excludes a different second meeting point. There is no ΓΔ segment or triangle ΑΓΔ to use in its contradiction argument.",
      };
      scene.equalities.push("Γ = Δ · not a second meeting point");
    } else if (!sameSide) {
      scene.warning =
        "This reflection fails I.7’s same-side hypothesis. Return Δ to the same side to follow the printed argument.";
      scene.notice = {
        title: "Equal distances · opposite sides of the base",
        text: "Reflection preserves both distance pairs. This does not satisfy I.7’s same-side hypothesis. The theorem permits these two intersections, one in each half-plane; it rules out two distinct intersections on the same side.",
      };
      scene.equalities.push("ΒΓ = ΒΔ; Γ and Δ lie on opposite sides");
    } else {
      scene.notice = {
        title: "A candidate that cannot keep both pairs equal",
        text: "The sketch preserves ΑΓ = ΑΔ and puts distinct Γ and Δ on the same side of ΑΒ. It cannot also make ΒΓ = ΒΔ. In the printed proof that second equality is a temporary supposition; the contradictory angle equality is conditional, not a measured feature of this sketch. This plate follows the printed case with Δ outside triangle ΑΒΓ.",
      };
      if (step >= 2) scene.equalities.push("∠ΑΓΔ = ∠ΑΔΓ (I.5)");
      if (step >= 4) scene.equalities.push("∠ΓΔΒ > ∠ΔΓΒ");
      if (step >= 5) scene.equalities.push("If ΒΓ = ΒΔ, I.5 would give ∠ΓΔΒ = ∠ΔΓΒ");
      if (step >= 6) scene.equalities.push("Equal and greater → contradiction");
    }
    scene.measurements = [
      { label: "ΑΓ", value: distance(a, c) },
      { label: "ΑΔ", value: distance(a, d) },
      { label: "ΒΓ", value: distance(b, c) },
      { label: "ΒΔ", value: distance(b, d) },
    ];
    if (distinct && sameSide && step >= 4)
      scene.measurements.push(
        { label: "∠ΓΔΒ (°)", value: angleAt(c, d, b) },
        { label: "∠ΔΓΒ (°)", value: angleAt(d, c, b) },
      );
    scene.description = `Base ΑΒ and two candidate meeting points Γ and Δ. ${scene.notice.text}`;
  } else if (proposition === 8) {
    let triangle: ReturnType<typeof triangleFromSides>;
    try {
      triangle = triangleFromSides(size, size * ratio, size * third, side);
    } catch {
      scene.warning =
        "These lengths do not form a nondegenerate triangle: each side must be shorter than the other two together. Change ΑΓ or ΒΓ before applying I.8.";
      scene.description =
        "Three proposed side lengths shown separately. There is no triangle with these lengths, so no apex or congruence conclusion is drawn.";
      const lengths = [size, size * ratio, size * third];
      lengths.forEach((length, i) => {
        const y = size * (0.8 - i * 0.8);
        segment(`length-${i}`, { x: 0, y }, { x: length, y }, "given", i + 1);
        vertex(`label-${i}`, { x: length / 2, y }, 0, -18, ["ΑΒ = ΔΕ", "ΑΓ = ΔΖ", "ΒΓ = ΕΖ"][i]);
      });
      fit([
        { x: 0, y: -size },
        { x: Math.max(...lengths), y: size },
      ]);
      scene.measurements = lengths.map((value, i) => ({
        label: ["ΑΒ", "ΑΓ", "ΒΓ"][i] ?? "",
        value,
      }));
      return scene;
    }
    const source = [triangle.a, triangle.b, triangle.c] as [Point, Point, Point];
    const translation = { x: size * 2.25, y: side * size * 0.2 };
    const rotated = (progress: number) =>
      source.map((p) => rigidMotion(p, -side * 20 * progress, scale(translation, progress))) as [
        Point,
        Point,
        Point,
      ];
    const [a, b, c] = rotated(motion / 100);
    const [d, e, z] = rotated(1);
    fit(Array.from({ length: 25 }, (_, i) => rotated(i / 24)).flat(), size * 0.18);
    scene.height = 330;
    figure("ABC", [a, b, c], "first");
    figure("DEZ", [d, e, z], "second");
    segment("AB", a, b, "active", 1);
    segment("AC", a, c, "active", 2);
    segment("BC", b, c, "active", 3);
    segment("DE", d, e, "given", 1);
    segment("DZ", d, z, "given", 2);
    segment("EZ", e, z, "given", 3);
    if (motion === 100) {
      vertex("Α", a, 0, -side * 23, "Α / Δ");
      vertex("Β", b, -18, 22, "Β / Ε");
      vertex("Γ", c, 18, 22, "Γ / Ζ");
    } else {
      vertex("Α", a, 0, -side * 23);
      vertex("Β", b, -18, 22);
      vertex("Γ", c, 18, 22);
      vertex("Δ", d, 0, -side * 23);
      vertex("Ε", e, -18, 22);
      vertex("Ζ", z, 18, 22);
    }
    if (step >= 6) {
      mark("BAC", b, a, c);
      mark("EDZ", e, d, z);
    }
    scene.equalities = ["ΑΒ = ΔΕ; ΑΓ = ΔΖ; ΒΓ = ΕΖ (given)"];
    if (step >= 6) scene.equalities.push("∠ΒΑΓ = ∠ΕΔΖ (conclusion)");
    scene.comparison = {
      title: "Three side pairs · the angle is earned",
      first: "ΑΒΓ",
      second: "ΔΕΖ",
      rows: [
        ["ΑΒ", "ΔΕ", "first equal pair"],
        ["ΑΓ", "ΔΖ", "second equal pair"],
        ["ΒΓ", "ΕΖ", "equal bases"],
        ["Α", "Δ", "meeting point fixed by I.7 after bases align"],
      ],
    };
    scene.notice = {
      title:
        step >= 3 && step <= 4 ? "The displaced apex is a supposition" : "Align the equal bases",
      text:
        step >= 3 && step <= 4
          ? "The source temporarily names a different apex Η. I.7 rules it out: on this side of ΕΖ, no distinct point can keep both distances to Ε and Ζ. The plate shows the realizable triangles and their rigid motion; it does not invent an Η satisfying impossible distance conditions."
          : "ΒΓ aligns with ΕΖ. Their equal endpoint distances then force Α onto Δ on the chosen side of the base. The included angle is calculated from the three lengths; it is not an extra given. As in I.4, the motion illustrates superposition, an operation not explicitly licensed by the five postulates.",
    };
    scene.measurements = [
      { label: "ΑΒ", value: distance(a, b) },
      { label: "ΑΓ", value: distance(a, c) },
      { label: "ΒΓ", value: distance(b, c) },
      { label: "∠ΒΑΓ (°)", value: angleAt(b, a, c) },
    ];
    scene.description = `Three equal side pairs in triangles ΑΒΓ and ΔΕΖ. Β corresponds to Ε and Γ to Ζ, so the equal bases align. At ${motion}% of a rigid motion. ${scene.notice.text}`;
  } else if (proposition === 9) {
    const a = { x: 0, y: side * size * 0.8 };
    const b = {
      x: -size * Math.sin(radians(angle)),
      y: a.y - side * size * Math.cos(radians(angle)),
    };
    const c = {
      x: 1.25 * size * Math.sin(radians(angle)),
      y: a.y - side * 1.25 * size * Math.cos(radians(angle)),
    };
    const model = bisectAngle(a, b, c, take * size);
    const { d, e, other, otherKind } = model;
    const z = variant ? other : model.z;
    const invalidChoice = variant === 1 && otherKind !== "internal";
    const collapsed = variant === 1 && otherKind === "collapsed";
    const radius = distance(d, e);
    // Keep the framing fixed between crossing choices and throughout the steps.
    fit(
      [
        a,
        b,
        c,
        model.z,
        other,
        { x: d.x - radius, y: d.y - radius },
        { x: e.x + radius, y: e.y + radius },
      ],
      size * 0.14,
    );
    segment("AB", a, b, "given");
    segment("AC", a, c, "given");
    vertex("Α", a, 0, -side * 24, collapsed && step >= 3 ? "Α / Ζ" : "Α");
    vertex("Β", b, -14, side * 22);
    vertex("Γ", c, 15, side * 22);
    if (step >= 1) {
      vertex("Δ", d, -23, 2);
      vertex("Ε", e, 23, 2);
      segment("AD", a, d, "result", 1);
      segment("AE", a, e, "result", 1);
    }
    if (step >= 2) segment("DE", d, e, step === 2 ? "active" : "working");
    if (step >= 3) {
      circle("circle-d", d, radius);
      circle("circle-e", e, radius);
      if (!collapsed) vertex("Ζ", z, 0, side * 23);
      segment("DZ", d, z, "active", 2);
      segment("EZ", e, z, "active", 2);
    }
    if (step >= 4 && !collapsed) segment("AZ", a, z, "active");
    if (step >= 5 && !collapsed) {
      figure("ADZ", [a, d, z], "first");
      figure("AEZ", [a, e, z], "second");
    }
    if (step >= 7 && !invalidChoice) {
      mark("DAZ", d, a, z);
      mark("EAZ", e, a, z);
    }
    scene.equalities = step >= 1 ? ["ΑΔ = ΑΕ (I.3)"] : [];
    if (step >= 3) scene.equalities.push("ΔΖ = ΕΖ (I.1)");
    if (step >= 5 && !collapsed) scene.equalities.push("ΑΖ = ΑΖ (common side)");
    if (step >= 7 && !invalidChoice) scene.equalities.push("∠ΔΑΖ = ∠ΕΑΖ = ½ ∠ΒΑΓ");
    if (step >= 3)
      scene.notice = variant
        ? {
            title:
              otherKind === "internal"
                ? "Other crossing · still inside this acute angle"
                : collapsed
                  ? "Other crossing · Ζ coincides with Α"
                  : "Other crossing · equal angles outside the given angle",
            text:
              otherKind === "internal"
                ? "Below 60°, this crossing also lies inside the angle and the proof still works. The position is less stable as the angle approaches 60°. The crossing across ΔΕ from Α works throughout the full range."
                : collapsed
                  ? "At 60°, Α is already the near equilateral vertex on ΔΕ. Choosing that crossing makes Ζ = Α: ΑΖ has zero length and supplies no ray. The triangles required for I.8 collapse, so this choice cannot execute the proof."
                  : "Above 60°, this crossing lies on the opposite bisector ray. Its two angles with ΑΔ and ΑΕ are equal, but their ray lies outside ∠ΒΑΓ and does not divide it. Choose the crossing across ΔΕ from Α to construct the internal bisector.",
          }
        : {
            title: "Choose the crossing across ΔΕ from Α",
            text: "This equilateral vertex puts ΑΖ inside the given angle. The other circle intersection is worth inspecting: it works below 60°, coincides with Α at 60°, and gives the opposite ray above 60°. Equal angles alone do not establish that a ray divides the intended angle.",
          };
    if (step >= 4 && invalidChoice)
      scene.warning = collapsed
        ? "Choose the other circle crossing: ΑΖ has zero length and cannot bisect the angle."
        : "Choose the crossing across ΔΕ from Α: the selected ray is outside the given angle.";
    if (step >= 5 && !collapsed)
      scene.comparison = {
        title: invalidChoice
          ? "Equal sides · the ray is outside the angle"
          : "I.8 · three sides of each triangle",
        first: "ΑΔΖ",
        second: "ΑΕΖ",
        rows: [
          ["ΑΔ", "ΑΕ", "cut equal using I.3"],
          ["ΔΖ", "ΕΖ", "equilateral construction"],
          ["ΑΖ", "ΑΖ", "common side"],
        ],
      };
    scene.measurements = [{ label: "∠ΒΑΓ (°)", value: angleAt(b, a, c) }];
    if (step >= 1) scene.measurements.push({ label: "ΑΔ / ΑΕ", value: distance(a, d) });
    if (step >= 4 && !collapsed)
      scene.measurements.push(
        { label: "∠ΔΑΖ (°)", value: angleAt(d, a, z) },
        { label: "∠ΖΑΕ (°)", value: angleAt(z, a, e) },
      );
    scene.description = `Angle ΒΑΓ. ${step >= 1 ? "Δ is chosen on ΑΒ and ΑΕ is cut equal to ΑΔ by I.3. " : ""}${step >= 3 ? `An equilateral triangle is constructed on ΔΕ. ${scene.notice?.text ?? ""}` : ""}`;
  } else {
    const { a, b, c, d, auxiliary } = bisectSegment({ x: 0, y: 0 }, { x: size, y: 0 }, side);
    fit(
      [
        { x: -size, y: -size },
        { x: 2 * size, y: size },
      ],
      size * 0.12,
    );
    segment("AB", a, b, "given");
    vertex("Α", a, -16, side * 23);
    vertex("Β", b, 16, side * 23);
    if (step >= 1) {
      circle("circle-a", a, size);
      circle("circle-b", b, size);
      vertex("Γ", c, 0, -side * 23);
      segment("CA", c, a, "active", 1);
      segment("CB", c, b, "active", 1);
    }
    if (step >= 2) {
      vertex("Ζ₉", auxiliary, 0, side * 24);
      vertex("Δ", d, 17, side * 23);
      segment("C-auxiliary", c, auxiliary, "auxiliary");
      segment("CD", c, d, "active");
      mark("ACD", a, c, d);
      mark("BCD", b, c, d);
      scene.notice = {
        title: "Reuse I.9 with the two circles already drawn",
        text: "ΓΑ = ΓΒ is already known from I.1. Use Α and Β as I.9’s equal-distance points. The second circle crossing, labelled Ζ₉ only for this explanation, gives its equilateral vertex. The line through Γ and Ζ₉ meets ΑΒ at Δ. Euclid’s I.10 labels only Α, Β, Γ, Δ.",
      };
    }
    if (step >= 4) {
      figure("ACD", [a, c, d], "first");
      figure("BCD", [b, c, d], "second");
      scene.comparison = {
        title: "I.4 · two sides and their included angle",
        first: "ΑΓΔ",
        second: "ΒΓΔ",
        rows: [
          ["ΑΓ", "ΒΓ", "I.1 equilateral sides"],
          ["ΓΔ", "ΓΔ", "common side"],
          ["∠ΑΓΔ", "∠ΒΓΔ", "I.9 internal bisection"],
        ],
      };
    }
    if (step >= 6) {
      segment("AD", a, d, "result", 2);
      segment("BD", b, d, "result", 2);
    }
    scene.equalities = step >= 1 ? ["ΓΑ = ΓΒ (I.1)"] : [];
    if (step >= 2) scene.equalities.push("∠ΑΓΔ = ∠ΒΓΔ (I.9)");
    if (step >= 4) scene.equalities.push("ΓΔ = ΓΔ (common side)");
    if (step >= 6) scene.equalities.push("ΑΔ = ΒΔ (I.4)");
    scene.measurements = [{ label: "ΑΒ", value: distance(a, b) }];
    if (step >= 2)
      scene.measurements.push(
        { label: "ΑΔ", value: distance(a, d) },
        { label: "ΒΔ", value: distance(b, d) },
        { label: "∠ΑΓΔ (°)", value: angleAt(a, c, d) },
      );
    scene.description = `Segment ΑΒ. ${step >= 1 ? "I.1 constructs equilateral ΑΒΓ. " : ""}${step >= 2 ? "I.9 bisects ∠ΑΓΒ with ΓΔ. Δ is computed as the intersection of that line with ΑΒ, not assigned the midpoint coordinate. The auxiliary second crossing is labelled Ζ₉. " : ""}${step >= 6 ? "I.4 proves that ΑΔ = ΒΔ." : ""}`;
  }
  return scene;
}
