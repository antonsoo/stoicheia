import { closureExplanations } from "../content/closure";
import { copiedAngle, courseTriangle } from "./copy-angle";
import type { Point } from "./geometry";
import { distance } from "./geometry";
import type { Ink, Scene } from "./scene";
import type { ReaderState } from "./state";

function plate(): Scene {
  return {
    height: 620,
    segments: [],
    circles: [],
    vertices: [],
    angles: [],
    figures: [],
    equalities: [],
    measurements: [],
    bounds: [-1, -1, 1, 1],
    description: "",
    warning: "",
  };
}
function helpers(scene: Scene) {
  return {
    line(id: string, a: Point, b: Point, ink: Ink = "working", ticks = 0) {
      scene.segments.push({ id, a, b, ink, ticks });
    },
    point(id: string, at: Point, dx = 0, dy = 23) {
      scene.vertices.push({ id, at, label: id, dx, dy });
    },
  };
}
export function triangleCourseScene(state: ReaderState): Scene {
  const scene = plate(),
    { line, point } = helpers(scene),
    s = state.size,
    m = courseTriangle(s, Math.round(state.ratio * 100), Math.round(state.third * 100), state.side),
    step = state.step;
  const r = Math.max(m.a, m.c),
    barY = r + s * 0.58;
  scene.bounds = [
    Math.min(-m.a, m.b - m.c) - s * 0.32,
    -r - s * 0.3,
    Math.max(m.a, m.b + m.c) + s * 0.38,
    barY + s * 0.7,
  ];
  for (const [i, length, label] of [
    [0, m.a, "Α"],
    [1, m.b, "Β"],
    [2, m.c, "Γ"],
  ] as const) {
    const y = barY + i * s * 0.22;
    line(`given-${label}`, { x: 0, y }, { x: length, y }, "given", i + 1);
    scene.vertices.push({ id: `given-${label}`, at: { x: -s * 0.17, y }, label, dx: 0, dy: 7 });
  }
  scene.description =
    "Three given lengths are placed consecutively as ΔΖ, ΖΗ and ΗΘ. Circles at Ζ and Η supply a common vertex Κ only when all three strict inequalities hold. The middle copy ΖΗ remains the base.";
  if (step >= 1) {
    line("ray", m.delta, { x: m.b + m.c + s * 0.22, y: 0 }, "auxiliary");
    line("DZ", m.delta, m.z, "given", 1);
    line("ZH", m.z, m.h, "given", 2);
    line("HT", m.h, m.theta, "given", 3);
    point("Δ", m.delta, -15, 23);
    point("Ζ", m.z, 0, 26);
    point("Η", m.h, 0, 26);
    point("Θ", m.theta, 12, 23);
    point("Ε", { x: m.b + m.c + s * 0.22, y: 0 }, 12, 23);
  }
  if (step >= 2)
    scene.circles.push({
      id: "circle-Z",
      center: m.z,
      radius: m.a,
      ink: step === 2 ? "active" : "auxiliary",
    });
  if (step >= 3) {
    scene.circles.push({
      id: "circle-H",
      center: m.h,
      radius: m.c,
      ink: step === 3 ? "active" : "auxiliary",
    });
    if (m.k) {
      point("Κ", m.k, -9, -state.side * 20);
      if (m.kind === "crossing" && m.other) point("Λ", m.other, -9, state.side * 24);
      if (m.kind === "crossing") {
        line("KZ", m.k, m.z, step >= 4 ? "result" : "working", 1);
        line("KH", m.k, m.h, step >= 5 ? "result" : "working", 3);
        scene.figures?.push({ id: "constructed", points: [m.z, m.h, m.k], tone: "first" });
      }
    }
  }
  if (m.kind !== "crossing")
    scene.warning = `The source requires every pair to exceed the remaining length. ${closureExplanations[m.kind]} The source proof remains readable; no genuine triangle is supplied by these givens.`;
  if (step >= 4 && m.kind === "crossing") scene.equalities.push("ΖΚ = ΖΔ = Α");
  if (step >= 5 && m.kind === "crossing") scene.equalities.push("ΗΚ = ΗΘ = Γ");
  if (step >= 6 && m.kind === "crossing") scene.equalities.push("ΖΗ = Β");
  scene.comparison = {
    title: "Check every pairing before joining the circles",
    first: "Two lengths",
    second: "Remaining",
    rows: [
      [
        "Α + Β > Γ",
        `${(m.a + m.b).toFixed(2)} > ${m.c.toFixed(2)}`,
        m.margins[0] !== undefined && m.margins[0] > 0 ? "Strict" : "Fails",
      ],
      [
        "Α + Γ > Β",
        `${(m.a + m.c).toFixed(2)} > ${m.b.toFixed(2)}`,
        m.margins[1] !== undefined && m.margins[1] > 0 ? "Strict" : "Fails",
      ],
      [
        "Β + Γ > Α",
        `${(m.b + m.c).toFixed(2)} > ${m.a.toFixed(2)}`,
        m.margins[2] !== undefined && m.margins[2] > 0 ? "Strict" : "Fails",
      ],
    ],
  };
  scene.measurements = [
    { label: "Given Α", value: m.a },
    { label: "Given Β / base ΖΗ", value: m.b },
    { label: "Given Γ", value: m.c },
    { label: "Constructed height", value: m.height },
  ];
  scene.notice = {
    title:
      m.kind === "crossing"
        ? "Two crossings; either side supplies a triangle"
        : "The strict condition matters",
    text: "Α, Β and Γ name given lengths here; Ζ, Η and Κ name the triangle's vertices. Copy lengths with I.2–3, then draw circles through available points. Flip the plate to choose the reflected vertex. For an unconstrained trial hinge and finer length controls, open the separate I.22 workshop.",
  };
  return scene;
}
export function angleCopyScene(state: ReaderState): Scene {
  const s = state.size,
    m = copiedAngle(
      s,
      state.ratio,
      state.angle * 2,
      state.offset * 100,
      state.side,
      state.variant === 1,
    ),
    step = state.step,
    scene = plate(),
    { line, point } = helpers(scene);
  // One fixed frame for all reading stages prevents a new construction from
  // making the existing triangle appear to change size.
  const all = [m.gamma, m.delta, m.epsilon, m.a, m.b, m.h, m.z];
  scene.bounds = [
    Math.min(...all.map((p) => p.x)) - s * 0.3,
    Math.min(...all.map((p) => p.y)) - s * 0.3,
    Math.max(...all.map((p) => p.x)) + s * 0.35,
    Math.max(...all.map((p) => p.y)) + s * 0.35,
  ];
  scene.height = 620;
  line(
    "given-ray-D",
    m.gamma,
    {
      x: m.gamma.x + (m.delta.x - m.gamma.x) * 1.25,
      y: m.gamma.y + (m.delta.y - m.gamma.y) * 1.25,
    },
    "given",
  );
  line(
    "given-ray-E",
    m.gamma,
    {
      x: m.gamma.x + (m.epsilon.x - m.gamma.x) * 1.12,
      y: m.gamma.y + (m.epsilon.y - m.gamma.y) * 1.12,
    },
    "given",
  );
  line("AB", m.a, m.b, "given");
  point("Γ", m.gamma, -20, 6);
  point("Α", m.a, -20, 18);
  point("Β", m.b, 15, 10);
  scene.angles?.push({
    id: "given-angle",
    first: m.delta,
    at: m.gamma,
    last: m.epsilon,
    ink: "given",
    rings: 1,
  });
  if (step >= 1) {
    point("Δ", m.delta, 6, -20);
    point("Ε", m.epsilon, 10, state.side === 1 ? -20 : 25);
    line("DE", m.delta, m.epsilon, "active", 3);
  }
  if (step >= 2) {
    point("Η", m.h, 7, 25);
    line("AH", m.a, m.h, "working", 2);
  }
  if (step >= 2) {
    point("Ζ", m.z, 10, m.z.y >= 0 ? -22 : 26);
    line("AZ", m.a, m.z, "result", 1);
    line("ZH", m.z, m.h, "working", 3);
    scene.figures?.push(
      { id: "reference", points: [m.gamma, m.delta, m.epsilon], tone: "first" },
      { id: "copy", points: [m.a, m.z, m.h], tone: "second" },
    );
    if (step >= 3) scene.equalities.push("ΓΔ = ΑΖ", "ΓΕ = ΑΗ", "ΔΕ = ΖΗ");
  }
  if (step >= 5) {
    scene.angles?.push({
      id: "copied-angle",
      first: m.z,
      at: m.a,
      last: m.h,
      ink: "result",
      rings: 1,
    });
    scene.equalities.push("∠ΔΓΕ = ∠ΖΑΗ (I.8)");
  }
  scene.description =
    "Choose arbitrary points Δ and Ε on the two sides of the given angle at Γ. Join them. I.22 constructs a triangle at Α on the given line, with ΓΔ = ΑΖ, ΓΕ = ΑΗ and ΔΕ = ΖΗ. I.8 then proves the two included angles equal. A degree measurement is not the construction.";
  if (step >= 3)
    scene.comparison = {
      title: "Three side copies, then one angle equality",
      first: "Given ΔΓΕ",
      second: "Constructed ΖΑΗ",
      rows: [
        ["First side · ΓΔ / ΑΖ", m.first.toFixed(3), distance(m.a, m.z).toFixed(3)],
        ["Second side · ΓΕ / ΑΗ", m.second.toFixed(3), distance(m.a, m.h).toFixed(3)],
        ["Closing side · ΔΕ / ΖΗ", m.base.toFixed(3), distance(m.z, m.h).toFixed(3)],
        [
          "Included angle",
          `${m.sourceDegrees.toFixed(3)}°`,
          step >= 5 ? `${m.copied.toFixed(3)}°` : "Apply I.8",
        ],
      ],
    };
  scene.measurements = [
    { label: "Given ∠ΔΓΕ (°)", value: m.sourceDegrees },
    ...(step >= 5 ? [{ label: "Copied ∠ΖΑΗ (°)", value: m.copied }] : []),
    { label: "ΓΔ / ΑΖ", value: m.first },
    { label: "ΓΕ / ΑΗ", value: m.second },
    { label: "ΔΕ / ΖΗ", value: m.base },
  ];
  scene.notice = {
    title: "An angle copied through three lengths",
    text: "Change the two point distances without changing the given angle. The auxiliary triangles change; the copied angle does not. Tilting ΑΒ changes the new ray's direction while retaining the relative opening. Both reflected copies have the same angular magnitude. Degrees and coordinates are modern illustrations; I.22 and I.8 supply the source's construction and proof.",
  };
  return scene;
}
