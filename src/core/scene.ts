import { bisectionScene } from "./bisection-scene";
import type { Point } from "./geometry";
import { add, cutOff, distance, equilateral, scale, subtract, transfer } from "./geometry";
import type { ReaderState } from "./state";
import { triangleScene } from "./triangle-scene";

export type Ink = "given" | "working" | "active" | "result" | "auxiliary";
export interface Segment {
  id: string;
  a: Point;
  b: Point;
  ink: Ink;
  ticks: number;
}
export interface Circle {
  id: string;
  center: Point;
  radius: number;
  ink: Ink;
  start?: number;
  end?: number;
}
export interface Vertex {
  id: string;
  at: Point;
  label: string;
  dx: number;
  dy: number;
}
export interface AngleMark {
  id: string;
  first: Point;
  at: Point;
  last: Point;
  ink: Ink;
  rings: number;
}
export interface Comparison {
  title: string;
  first: string;
  second: string;
  rows: [string, string, string][];
}
export interface Scene {
  height?: number;
  angles?: AngleMark[];
  figures?: { id: string; points: Point[]; tone: "first" | "second" }[];
  comparison?: Comparison;
  notice?: { title: string; text: string };
  segments: Segment[];
  circles: Circle[];
  vertices: Vertex[];
  bounds: [number, number, number, number];
  equalities: string[];
  measurements: { label: string; value: number }[];
  description: string;
  warning: string;
}

const origin: Point = { x: 0, y: 0 };
const polar = (r: number, degrees: number): Point => ({
  x: r * Math.cos((degrees * Math.PI) / 180),
  y: r * Math.sin((degrees * Math.PI) / 180),
});

export function makeScene(state: ReaderState): Scene {
  if (state.proposition >= 7) return bisectionScene(state);
  if (state.proposition >= 4) return triangleScene(state);
  const { proposition, step, size: s, ratio, side } = state;
  const r = s * ratio;
  const scene: Scene = {
    segments: [],
    circles: [],
    vertices: [],
    bounds: [0, 0, 1, 1],
    equalities: [],
    measurements: [],
    description: "",
    warning: "",
  };
  const vertex = (id: string, at: Point, label = id, dx = 0, dy = 22) => {
    scene.vertices.push({ id, at, label, dx, dy });
  };
  const segment = (id: string, a: Point, b: Point, ink: Ink = "working", ticks = 0) => {
    scene.segments.push({ id, a, b, ink, ticks });
  };
  const circle = (id: string, center: Point, radius: number, ink: Ink = "working") => {
    scene.circles.push({ id, center, radius, ink });
  };
  const a = origin;
  const b = { x: s, y: 0 };

  if (proposition === 1) {
    const c = equilateral(a, b, side);
    scene.bounds = [-s * 1.16, -s * 1.16, s * 2.16, s * 1.16];
    segment("AB", a, b, step >= 4 ? "result" : "given", step >= 4 ? 1 : 0);
    vertex("Α", a, "Α", -12, side * 24);
    vertex("Β", b, "Β", 12, side * 24);
    if (step >= 1) {
      circle("circle-a", a, s, step === 1 || step === 4 ? "active" : "working");
      vertex("Δ", { x: -s, y: 0 }, "Δ", -14, 5);
    }
    if (step >= 2) {
      circle("circle-b", b, s, step === 2 || step === 5 ? "active" : "working");
      vertex("Ε", { x: s * 2, y: 0 }, "Ε", 14, 5);
      vertex("Γ", c, "Γ", 0, -side * 23);
    }
    if (step >= 3) {
      segment("AC", a, c, step >= 4 ? "result" : "active", step >= 4 ? 1 : 0);
      segment("BC", b, c, step >= 5 ? "result" : "active", step >= 5 ? 1 : 0);
    }
    if (step >= 4) scene.equalities.push("ΑΓ = ΑΒ");
    if (step >= 5) scene.equalities.push("ΒΓ = ΒΑ");
    if (step >= 7) scene.equalities = ["ΓΑ = ΑΒ = ΒΓ"];
    scene.measurements = [
      { label: "ΑΒ", value: s },
      { label: "ΑΓ", value: distance(a, c) },
      { label: "ΒΓ", value: distance(b, c) },
    ].slice(0, step >= 3 ? 3 : 1);
    scene.description = `ΑΒ is given. ${step >= 1 ? "A circle at Α passes through Β. " : ""}${step >= 2 ? "A circle at Β passes through Α. Γ is one intersection. " : ""}${step >= 3 ? "Joining ΑΓ and ΒΓ completes the triangle." : ""}`;
  } else if (proposition === 2) {
    const c = add(b, polar(r, side * state.angle));
    const t = transfer(a, b, c, side);
    const e = add(a, scale(subtract(a, t.d), (r + s * 0.3) / s));
    const z = add(b, scale(subtract(b, t.d), (r + s * 0.3) / s));
    scene.bounds = [
      Math.min(e.x, b.x - r) - s * 0.18,
      side === 1 ? Math.min(e.y, -r) - s * 0.18 : Math.min(-s * 1.1, -r) - s * 0.18,
      Math.max(z.x, b.x + r) + s * 0.18,
      side === 1 ? Math.max(t.d.y, r) + s * 0.18 : Math.max(e.y, r) + s * 0.18,
    ];
    segment("BC", b, c, step >= 6 ? "result" : "given", step >= 6 ? 1 : 0);
    vertex("Α", a, "Α", -16, -side * 10);
    vertex("Β", b, "Β", 16, -side * 10);
    vertex("Γ", c, "Γ", 16, -side * 6);
    if (step >= 1) segment("AB", a, b, step === 1 ? "active" : "auxiliary");
    if (step >= 2) {
      segment("DA", t.d, a, "working", step >= 7 ? 2 : 0);
      segment("DB", t.d, b, "working", step >= 7 ? 2 : 0);
      vertex("Δ", t.d, "Δ", 0, -side * 24);
    }
    if (step >= 3) {
      segment("AE", a, e, "auxiliary");
      segment("BZ", b, z, "auxiliary");
      vertex("Ε", e, "Ε", -14, side * 14);
      vertex("Ζ", z, "Ζ", 14, side * 14);
    }
    if (step >= 4) {
      circle("circle-b", b, r, step === 4 || step === 6 ? "active" : "working");
      vertex("Η", t.g, "Η", 18, side * 7);
      segment("BG", b, t.g, step >= 6 ? "result" : "active", step >= 6 ? 1 : 0);
    }
    if (step >= 5) {
      // The textual circle is displayed as an arc, as in many printed Euclid diagrams.
      scene.circles.push({
        id: "circle-d",
        center: t.d,
        radius: t.whole,
        ink: step === 5 || step === 7 ? "active" : "working",
        start: side === 1 ? -145 : 35,
        end: side === 1 ? -35 : 145,
      });
      vertex("Λ", t.l, "Λ", -20, side * 2);
      segment("AL", a, t.l, step >= 8 ? "result" : "active", step >= 8 ? 1 : 0);
    }
    if (step >= 6) scene.equalities.push("ΒΓ = ΒΗ");
    if (step >= 7) scene.equalities.push("ΔΛ = ΔΗ; ΔΑ = ΔΒ");
    if (step >= 8) scene.equalities.push("ΔΛ − ΔΑ = ΔΗ − ΔΒ", "ΑΛ = ΒΗ = ΒΓ");
    scene.measurements = [{ label: "ΒΓ", value: r }];
    if (step >= 5) scene.measurements.push({ label: "ΑΛ", value: distance(a, t.l) });
    if (step >= 7)
      scene.measurements.push(
        { label: "ΔΗ", value: t.whole },
        { label: "ΔΑ", value: distance(t.d, a) },
      );
    scene.description = `Α is the target point and ΒΓ the given length. ${step >= 2 ? "ΔΑΒ is equilateral. " : ""}${step >= 4 ? "The circle at Β meets the extended ΔΒ at Η. " : ""}${step >= 5 ? "The circle at Δ through Η meets extended ΔΑ at Λ. ΑΛ is the copied length." : ""}`;
  } else {
    const c = { x: s * 0.12, y: -s * 0.62 };
    const d = add(c, { x: r, y: 0 });
    scene.bounds = [-s * 1.58, -s * 1.58, Math.max(s, s * 0.12 + r) + s * 0.18, s * 1.58];
    segment("AB", a, b, "given");
    segment("reference", c, d, "given", step >= 1 ? 1 : 0);
    vertex("Α", a, "Α", -15, 23);
    vertex("Β", b, "Β", 14, 23);
    vertex("reference-label", scale(add(c, d), 0.5), "Γ", 0, 28);
    scene.measurements = [
      { label: "ΑΒ", value: s },
      { label: "Γ (length)", value: r },
    ];
    if (r >= s) {
      scene.warning =
        "I.3 requires Γ to be shorter than ΑΒ. Reduce the reference length below 100% to construct the cut.";
      scene.description =
        "Two segments are shown, but Γ is not shorter than ΑΒ. The stated hypothesis of I.3 is not satisfied.";
      return scene;
    }
    const cut = cutOff(a, b, c, d, side);
    if (step >= 1) {
      segment("AD", a, cut.copy.l, step === 1 ? "active" : "working", 1);
      vertex("Δ", cut.copy.l, "Δ", -18, -12);
    }
    if (step >= 2) {
      circle("circle-a", a, cut.radius, step === 2 ? "active" : "working");
      vertex("Ε", cut.e, "Ε", 0, -24);
      segment("AE", a, cut.e, "result", step >= 3 ? 1 : 0);
    }
    if (step >= 3) scene.equalities.push("ΑΕ = ΑΔ = Γ");
    if (step >= 2) scene.measurements.push({ label: "ΑΕ", value: distance(a, cut.e) });
    scene.description = `ΑΒ is the longer segment and Γ names the entire shorter segment. ${step >= 1 ? "I.2 places ΑΔ equal to Γ at Α. " : ""}${step >= 2 ? "A circle at Α through Δ meets ΑΒ at Ε. ΑΕ is the required cut." : ""}`;
  }
  return scene;
}
