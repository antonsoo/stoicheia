import { distance, type Point } from "./geometry";
import { inequalityTriangle } from "./inequalities";
import { nestedTriangle } from "./nested";
import type { Ink, Scene } from "./scene";
import type { ReaderState } from "./state";

export function nestedScene(state: ReaderState): Scene {
  const { size: s, side, step } = state;
  const { a, b, c } = inequalityTriangle(s, state.ratio, state.angle * 2, side);
  const m = nestedTriangle(a, b, c, state.take, Math.max(10, Math.min(90, state.motion)) / 100);
  const { d, e } = m;
  const margin = s * 0.2;
  const scene: Scene = {
    segments: [],
    circles: [],
    vertices: [],
    angles: [],
    figures: [],
    equalities: [],
    measurements: [],
    bounds: [
      Math.min(a.x, b.x, c.x) - margin,
      Math.min(a.y, b.y, c.y) - margin,
      Math.max(a.x, b.x, c.x) + margin,
      Math.max(a.y, b.y, c.y) + margin,
    ],
    warning: "",
    description:
      "Δ is strictly inside triangle ΑΒΓ. Continue ΒΔ to Ε on ΑΓ. Two applications of I.20 give ΒΑ + ΑΓ > ΒΕ + ΕΓ > ΒΔ + ΔΓ. Two applications of I.16 give angle ΒΔΓ > ΓΕΒ > ΒΑΓ. The shorter broken path encloses the larger angle.",
  };
  const segment = (id: string, from: Point, to: Point, ink: Ink) =>
    scene.segments.push({ id, a: from, b: to, ink, ticks: 0 });
  const vertex = (id: string, at: Point, dx: number, dy: number) =>
    scene.vertices.push({ id, at, label: id, dx, dy });
  segment("AB", a, b, step === 2 || step === 3 ? "active" : "given");
  segment("AC", a, c, "given");
  segment("BC", b, c, "given");
  segment("BD", b, d, step >= 5 ? "result" : "working");
  segment("DC", d, c, step >= 5 ? "result" : "working");
  vertex("Α", a, -16, side * 20);
  vertex("Β", b, 16, side * 20);
  vertex("Γ", c, 8, -side * 24);
  // Opposite sides of BE keep the two interior labels distinct as D approaches E.
  vertex("Δ", d, 15, side * 19);
  if (step >= 1) {
    segment("DE", d, e, "auxiliary");
    vertex("Ε", e, -16, -side * 17);
  }
  if (step === 2 || step === 3 || step === 7)
    scene.figures?.push({ id: "ABE", points: [a, b, e], tone: "first" });
  if (step === 4 || step === 6)
    scene.figures?.push({ id: "CED", points: [c, e, d], tone: "second" });
  const mark = (id: string, first: Point, at: Point, last: Point, ink: Ink, rings = 1) =>
    scene.angles?.push({ id, first, at, last, ink, rings });
  if (step >= 6) {
    mark("inner", b, d, c, "active", 2);
    mark("middle", c, e, b, "working");
  }
  if (step >= 7) mark("outer", b, a, c, "result");
  if (step === 2) scene.equalities.push("ΑΒ + ΑΕ > ΒΕ (I.20 in ΑΒΕ)");
  if (step === 3) scene.equalities.push("ΑΒ + ΑΕ + ΕΓ > ΒΕ + ΕΓ", "ΒΑ + ΑΓ > ΒΕ + ΕΓ");
  if (step === 4) scene.equalities.push("ΓΕ + ΕΔ > ΓΔ (I.20 in ΓΕΔ)", "ΓΕ + ΕΒ > ΓΔ + ΔΒ");
  if (step >= 5) scene.equalities.push("ΒΑ + ΑΓ > ΒΕ + ΕΓ > ΒΔ + ΔΓ");
  if (step === 6) scene.equalities.push("∠ΒΔΓ > ∠ΓΕΔ = ∠ΓΕΒ (I.16 in ΓΔΕ)");
  if (step === 7) scene.equalities.push("∠ΓΕΒ > ∠ΒΑΓ (I.16 in ΑΒΕ)");
  if (step >= 8) scene.equalities.push("∠ΒΔΓ > ∠ΓΕΒ > ∠ΒΑΓ");
  scene.comparison = {
    title: "Shorter route, larger angle",
    first: "Outer · through Α",
    second: "Inner · through Δ",
    headers: ["Compare", "Outer · through Α", "Inner · through Δ"],
    rows: [
      ["First leg · ΒΑ / ΒΔ", distance(b, a).toFixed(2), distance(b, d).toFixed(2)],
      ["Second leg · ΑΓ / ΔΓ", distance(a, c).toFixed(2), distance(d, c).toFixed(2)],
      ["Two-segment length", m.outer.toFixed(2), m.inner.toFixed(2)],
      ["Included angle", `${m.outerAngle.toFixed(2)}°`, `${m.innerAngle.toFixed(2)}°`],
    ],
  };
  scene.measurements = [
    { label: "ΒΑ + ΑΓ", value: m.outer },
    { label: "ΒΔ + ΔΓ", value: m.inner },
    { label: "∠ΒΑΓ (°)", value: m.outerAngle },
    { label: "∠ΒΔΓ (°)", value: m.innerAngle },
  ];
  if (step >= 1)
    scene.measurements.push(
      { label: "Intermediate ΒΕ + ΕΓ", value: m.middle },
      { label: "Intermediate ∠ΓΕΒ (°)", value: m.middleAngle },
    );
  if (step >= 5)
    scene.measurements.push(
      { label: "First triangle's excess ΑΒ + ΑΕ − ΒΕ", value: m.firstExcess },
      { label: "Second triangle's excess ΓΕ + ΕΔ − ΓΔ", value: m.secondExcess },
      { label: "Total shortening", value: m.outer - m.inner },
    );
  scene.notice = {
    title: "Δ stays strictly inside ΑΒΓ",
    text: `Ε is ${Math.round(state.take * 100)}% along ΑΓ and Δ is ${Math.max(10, Math.min(90, state.motion))}% along ΒΕ. These two position controls sample interior points while retaining the proof's hypotheses. The intermediate route Β–Ε–Γ explains both inequalities. Drawing units and degree readings are modern illustrations, not premises of the proof.`,
  };
  return scene;
}
