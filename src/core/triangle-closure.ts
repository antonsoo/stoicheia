import type { Point } from "./geometry";

/** Lengths are integer tenths. Strict inequalities never depend on rounded roots. */
export interface ThreeLengths {
  a: number;
  b: number;
  c: number;
}
export type ClosureKind =
  | "crossing"
  | "external-tangent"
  | "internal-tangent"
  | "separate"
  | "contained";
export interface ClosureState extends ThreeLengths {
  step: number;
  side: 1 | -1;
  trial: boolean;
  turn: number;
  passage: number;
}
export const closureDefaults: ClosureState = {
  a: 50,
  b: 60,
  c: 40,
  step: 4,
  side: 1,
  trial: false,
  turn: 45,
  passage: 0,
};
export const unitText = (tenths: number): string => (tenths / 10).toFixed(1);

export function closureModel(lengths: ThreeLengths) {
  const { a, b, c } = lengths;
  if (![a, b, c].every((n) => Number.isInteger(n) && n >= 10 && n <= 120))
    throw new RangeError("Each length must be 1.0–12.0, in steps of 0.1.");
  const margins = [a + b - c, a + c - b, b + c - a];
  const kind: ClosureKind =
    b > a + c
      ? "separate"
      : b === a + c
        ? "external-tangent"
        : b < Math.abs(a - c)
          ? "contained"
          : b === Math.abs(a - c)
            ? "internal-tangent"
            : "crossing";
  // Difference-of-squares factors retain the correct height near either tangency.
  // They are exact integers throughout the input domain. No epsilon changes kind.
  const heightProduct = ((a + c) ** 2 - b ** 2) * (b ** 2 - (a - c) ** 2);
  const x = (a * a + b * b - c * c) / (20 * b);
  const y = kind === "crossing" ? Math.sqrt(heightProduct) / (20 * b) : 0;
  const intersection = kind === "crossing" || kind.endsWith("tangent") ? { x, y } : null;
  return {
    kind,
    margins,
    z: { x: 0, y: 0 } as Point,
    h: { x: b / 10, y: 0 } as Point,
    delta: { x: -a / 10, y: 0 } as Point,
    theta: { x: (b + c) / 10, y: 0 } as Point,
    intersection,
    height: y,
    area: (b * y) / 20,
    gap:
      kind === "separate"
        ? (b - a - c) / 10
        : kind === "contained"
          ? (Math.abs(a - c) - b) / 10
          : 0,
    // With A and B fixed, these are the strict bounds on the third side C.
    lower: Math.abs(a - b),
    upper: a + b,
  };
}

export function trialPoint(state: ClosureState) {
  const angle = (state.turn * Math.PI) / 180;
  const point = {
    x: (state.a / 10) * Math.cos(angle),
    y: ((state.side * state.a) / 10) * Math.sin(angle),
  };
  const needed = Math.hypot(point.x - state.b / 10, point.y);
  return { point, needed, residual: needed - state.c / 10 };
}

export function decodeClosure(hash: string): ClosureState {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const integer = (key: string, fallback: number, min: number, max: number) => {
    const raw = p.get(key);
    const value = raw !== null && /^\d+$/.test(raw) ? Number(raw) : NaN;
    return Number.isInteger(value) && value >= min && value <= max ? value : fallback;
  };
  return {
    a: integer("a", 50, 10, 120),
    b: integer("b", 60, 10, 120),
    c: integer("c", 40, 10, 120),
    step: integer("step", 4, 0, 4),
    side: p.get("side") === "-1" ? -1 : 1,
    trial: p.get("trial") === "1",
    turn: integer("turn", 45, 0, 180),
    passage: integer("read", 0, 0, 8),
  };
}
export function encodeClosure(state: ClosureState): string {
  return `#${new URLSearchParams({ a: String(state.a), b: String(state.b), c: String(state.c), step: String(state.step), side: String(state.side), trial: state.trial ? "1" : "0", turn: String(state.turn), read: String(state.passage) })}`;
}

export const closurePresets: { title: string; lengths: ThreeLengths }[] = [
  { title: "Two crossings", lengths: { a: 50, b: 60, c: 40 } },
  { title: "Touch outside", lengths: { a: 20, b: 60, c: 40 } },
  { title: "Too far apart", lengths: { a: 19, b: 60, c: 40 } },
  { title: "Touch inside", lengths: { a: 100, b: 60, c: 40 } },
  { title: "One circle inside", lengths: { a: 101, b: 60, c: 40 } },
];
