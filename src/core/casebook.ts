import { reflectInLine, sideOfLine } from "./bisection";
import { add, distance, type Point, scale, subtract } from "./geometry";
import type { Scene } from "./scene";
import { angleAt, radians, rigidMotion } from "./triangles";

export interface CasebookState {
  open: boolean;
  turn: number;
  mode: "turn" | "boundary" | "reflection";
  stage: number;
}
export const casebookDefaults: CasebookState = {
  open: false,
  turn: 20,
  mode: "turn",
  stage: 0,
};

export function decodeCasebook(params: URLSearchParams): CasebookState {
  const bounded = (key: string, fallback: number, max: number) => {
    const raw = params.get(key);
    const value = raw?.trim() ? Number(raw) : fallback;
    return Number.isFinite(value) ? Math.max(0, Math.min(max, Math.round(value))) : fallback;
  };
  return {
    open: params.get("case") === "1",
    turn: bounded("turn", 20, 65),
    mode:
      params.get("case-mode") === "boundary"
        ? "boundary"
        : params.get("case-mode") === "reflection"
          ? "reflection"
          : "turn",
    stage: bounded("case-step", 0, 3),
  };
}

export type Placement = "outside" | "inside" | "boundary" | "reflection" | "coincident";

/** Classify with oriented areas, independently of the chosen turn preset. */
export function inspectPlacement(a: Point, b: Point, c: Point, d: Point): Placement {
  const unit = Math.max(distance(a, b), distance(a, c));
  const epsilon = unit * unit * 1e-11;
  if (distance(c, d) < unit * 1e-11) return "coincident";
  const orientation = Math.sign(sideOfLine(a, b, c));
  if (orientation * sideOfLine(a, b, d) < -epsilon) return "reflection";
  const areas = [sideOfLine(a, b, d), sideOfLine(b, c, d), sideOfLine(c, a, d)].map(
    (x) => orientation * x,
  );
  if (areas.every((x) => x >= -epsilon))
    return areas.some((x) => Math.abs(x) <= epsilon) ? "boundary" : "inside";
  return "outside";
}

/** The second intersection with the supporting line BC; no hand-placed edge point. */
export function secondIntersection(a: Point, b: Point, c: Point): Point {
  const v = subtract(b, c);
  const u = subtract(c, a);
  const t = (-2 * (u.x * v.x + u.y * v.y)) / (v.x * v.x + v.y * v.y);
  return add(c, scale(v, t));
}

export function casebookModel(state: CasebookState, size = 200, rotation = 0, side: 1 | -1 = 1) {
  const a = { x: 0, y: 0 };
  const b = { x: size, y: 0 };
  const c = { x: size * 0.7 * Math.cos(radians(70)), y: side * size * 0.7 * Math.sin(radians(70)) };
  const d =
    state.mode === "boundary"
      ? secondIntersection(a, b, c)
      : state.mode === "reflection"
        ? reflectInLine(a, b, c)
        : rigidMotion(c, -side * state.turn, a);
  // Rotate the whole apparatus, rather than changing just the labels. Its
  // relation to the base must survive the same transformations as the proof.
  const transform = (p: Point) => rigidMotion(p, rotation, { x: 17, y: -23 });
  const points = {
    a: transform(a),
    b: transform(b),
    c: transform(c),
    d: transform(d),
    e: transform(scale(c, 1.5)),
    z: transform(scale(d, 1.5)),
  };
  const placement = inspectPlacement(points.a, points.b, points.c, points.d);
  const distinct = placement !== "coincident";
  const angles = distinct
    ? {
        acd: angleAt(a, c, d),
        adc: angleAt(a, d, c),
        dcb: angleAt(d, c, b),
        cdb: angleAt(c, d, b),
        ecd: angleAt(scale(c, 1.5), c, d),
        zdc: angleAt(scale(d, 1.5), d, c),
        acb: angleAt(a, c, b),
      }
    : null;
  return {
    ...points,
    placement,
    angles,
    printedPart:
      !!angles && angles.dcb > 1e-8 && Math.abs(angles.acd - angles.acb - angles.dcb) < 1e-8,
    lengths: {
      ac: distance(a, c),
      ad: distance(a, d),
      bc: distance(b, c),
      bd: distance(b, d),
      cd: distance(c, d),
    },
  };
}

export function casebookScene(state: CasebookState): Scene {
  const model = casebookModel(state);
  const { a, b, c, d, e, z, placement } = model;
  const distinct = placement !== "coincident";
  const argument = placement === "inside" || placement === "outside";
  const extended = placement === "inside" && state.stage >= 1;
  const scene: Scene = {
    height: 430,
    bounds: [
      Math.min(a.x, b.x, c.x, d.x, e.x, z.x) - 20,
      Math.min(a.y, b.y, c.y, d.y, e.y, z.y) - 20,
      Math.max(a.x, b.x, c.x, d.x, e.x, z.x) + 20,
      Math.max(a.y, b.y, c.y, d.y, e.y, z.y) + 20,
    ],
    segments: [],
    circles: [],
    vertices: [],
    angles: [],
    figures: [],
    equalities: [],
    measurements: [],
    warning: "",
    description: "",
  };
  const segment = (
    id: string,
    first: Point,
    last: Point,
    ink: "given" | "active" | "auxiliary" = "given",
    ticks = 0,
  ) => scene.segments.push({ id, a: first, b: last, ink, ticks });
  const mark = (
    id: string,
    first: Point,
    at: Point,
    last: Point,
    ink: "active" | "result",
    rings = 1,
  ) => scene.angles?.push({ id, first, at, last, ink, rings });
  segment("case-AB", a, b);
  segment("case-AC", a, c, "given", 1);
  segment("case-BC", b, c);
  segment("case-AD", a, d, "active", 1);
  segment("case-BD", b, d, "active");
  if (distinct) segment("case-CD", c, d, "auxiliary");
  scene.figures?.push({ id: "case-ABC", points: [a, b, c], tone: "first" });
  const vertex = (id: string, at: Point, dx: number, dy: number, label = id) =>
    scene.vertices.push({ id, at, dx, dy, label });
  vertex("Α", a, -17, 22);
  vertex("Β", b, 18, 22);
  vertex("Γ", c, -16, -18, distinct ? "Γ" : "Γ / Δ");
  if (distinct)
    vertex("Δ", d, placement === "inside" ? -10 : 16, placement === "outside" ? -15 : 25);
  if (extended) {
    segment("case-CE", c, e, "auxiliary");
    segment("case-DZ", d, z, "auxiliary");
    vertex("Ε", e, -15, -15);
    vertex("Ζ", z, 15, -15);
  }
  if (argument) {
    if (state.stage === 0) {
      mark("case-ACD", a, c, d, "result", 2);
      mark("case-DCB", d, c, b, "active");
    } else {
      mark("case-first-equal", extended ? e : a, c, d, "result", 2);
      mark("case-second-equal", extended ? z : a, d, c, "result", 2);
      if (state.stage >= 2) {
        mark("case-DCB", d, c, b, "active");
        mark("case-CDB", c, d, b, "active", 3);
      }
    }
  }
  scene.description = `Modern supplement to Euclid I.7. Δ is ${placement === "reflection" ? "across the base from Γ" : placement === "coincident" ? "at Γ" : `${placement} triangle ΑΒΓ`}. ΑΓ = ΑΔ is preserved; the second pair of lengths is measured separately. ${extended ? "Extend ΑΓ beyond Γ to Ε, and ΑΔ beyond Δ to Ζ. These are supplemental labels." : ""}`;
  return scene;
}
