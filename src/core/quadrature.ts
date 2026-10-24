/** The rectangle case of Elements II.14; lengths are exact integer tenths. */
export interface QuadratureState {
  a: number;
  b: number;
  stage: number;
  move: number;
  cancel: boolean;
  lock: boolean;
  passage: number;
}
export const quadratureDefault: QuadratureState = {
  a: 90,
  b: 40,
  stage: 4,
  move: 0,
  cancel: false,
  lock: false,
  passage: 0,
};
export function quadratureModel(state: Pick<QuadratureState, "a" | "b">) {
  const long = Math.max(state.a, state.b) / 10;
  const short = Math.min(state.a, state.b) / 10;
  const radius = (long + short) / 2;
  const offset = (long - short) / 2;
  // Derive the height from the circle, not from the area we want to establish.
  const height = Math.sqrt(radius * radius - offset * offset);
  const area = (state.a * state.b) / 100;
  return {
    long,
    short,
    radius,
    offset,
    height,
    area,
    radiusArea: radius * radius,
    offsetArea: offset * offset,
    squareArea: height * height,
    perimeter: 2 * (long + short),
    squarePerimeter: 4 * height,
    equal: state.a === state.b,
    swapped: state.a < state.b,
    points: {
      B: [0, 0],
      E: [long, 0],
      Z: [long + short, 0],
      H: [radius, 0],
      Theta: [long, height],
      Gamma: [0, -short],
      Delta: [long, -short],
    } as const,
  };
}
export function formatMeasure(value: number, places = 4): string {
  return Number(value.toFixed(places)).toLocaleString("en-US", { maximumFractionDigits: places });
}
export function decodeQuadrature(hash: string): QuadratureState & { adjusted: boolean } {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const keys = ["a", "b", "s", "m", "c", "k", "r"];
  if (keys.some((key) => p.getAll(key).length > 1)) return { ...quadratureDefault, adjusted: true };
  let adjusted = false;
  function integer(key: string, fallback: number, min: number, max: number) {
    const raw = p.get(key);
    if (raw === null) return fallback;
    if (!/^\d+$/.test(raw)) {
      adjusted = true;
      return fallback;
    }
    const n = Number(raw);
    if (!Number.isSafeInteger(n) || n < min || n > max) {
      adjusted = true;
      return fallback;
    }
    return n;
  }
  return {
    a: integer("a", 90, 10, 160),
    b: integer("b", 40, 10, 160),
    stage: integer("s", 4, 0, 5),
    move: integer("m", 0, 0, 100),
    cancel: integer("c", 0, 0, 1) === 1,
    lock: integer("k", 0, 0, 1) === 1,
    passage: integer("r", 0, 0, 10),
    adjusted,
  };
}
export function encodeQuadrature(s: QuadratureState): string {
  return `#a=${s.a}&b=${s.b}&s=${s.stage}&m=${s.move}&c=${Number(s.cancel)}&k=${Number(s.lock)}&r=${s.passage}`;
}
export function changedLength(
  state: QuadratureState,
  key: "a" | "b",
  value: number,
): QuadratureState | null {
  if (!Number.isInteger(value) || value < 10 || value > 160) return null;
  const other = key === "a" ? "b" : "a";
  const complement = state.a + state.b - value;
  if (state.lock && (complement < 10 || complement > 160)) return null;
  return { ...state, [key]: value, ...(state.lock ? { [other]: complement } : {}) };
}
/** Rigid motion for the second piece, from d by b to b by d above the first. */
export function movedPiece(state: QuadratureState) {
  const m = quadratureModel(state),
    t = state.move / 100;
  const angle = (Math.PI * t) / 2;
  const cx = (1 - t) * (m.radius + m.offset / 2) + (t * m.short) / 2;
  const cy = ((1 - t) * m.short) / 2 + t * (m.short + m.offset / 2);
  return [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([sx = 0, sy = 0]) => {
    const x = (sx * m.offset) / 2,
      y = (sy * m.short) / 2;
    return [
      cx + x * Math.cos(angle) - y * Math.sin(angle),
      cy + x * Math.sin(angle) + y * Math.cos(angle),
    ] as const;
  });
}
