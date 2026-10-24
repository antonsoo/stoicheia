export type MesolabeMode = "trial" | "first" | "ideal";
export interface MesolabeState {
  factor: number;
  left: number;
  right: number;
  mode: MesolabeMode;
  step: number;
  passage: number;
  page: number;
}
export type Point = readonly [number, number];
export const mesolabePages = Array.from({ length: 12 }, (_, i) => 102 + i);
export const initialMesolabe: MesolabeState = {
  factor: 2,
  left: 0.12,
  right: 0.47,
  mode: "trial",
  step: 0,
  passage: 0,
  page: 109,
};

/** Each panel is a unit square. The middle one stays at x=1..2.
 * Left moves right by p; right moves left by q. Their exposed contacts
 * with the next diagonal are B=(1+p,1-p), G=(2,1-q).
 * No cube root enters the trial or one-contact geometry. */
export function mesolabeModel(state: MesolabeState) {
  const d = 1 / state.factor;
  let p = state.left,
    q = state.right;
  if (state.mode === "ideal") {
    const t = Math.cbrt(d);
    p = 1 - t;
    q = 1 - t * t;
  } else if (state.mode === "first") {
    // Stable small root of p(3-p-q)=1-d: B lies on AD.
    const u = 3 - q;
    p = (2 * (1 - d)) / (u + Math.sqrt(u * u - 4 * (1 - d)));
  }
  const points = {
    A: [p, 1],
    E: [p, 0],
    Z: [1 + p, 0],
    B: [1 + p, 1 - p],
    H: [2, 0],
    G: [2, 1 - q],
    T: [3 - q, 0],
    D: [3 - q, d],
    K: [p + (3 - q - p) / (1 - d), 0],
  } satisfies Record<string, Point>;
  const lineHeight = (x: number) => 1 - ((1 - d) * (x - p)) / (3 - q - p);
  const residuals = [points.B[1] - lineHeight(points.B[0]), points.G[1] - lineHeight(2)];
  const aligned = residuals.every((e) => Math.abs(e) < 1e-10);
  const lengths = [1, 1 - p, 1 - q, d].map((x) => x * state.factor);
  const [a = 0, b = 0, c = 0, end = 0] = lengths;
  const ratios = [a / b, b / c, c / end];
  const volume = c ** 3;
  return {
    p,
    q,
    d,
    points,
    lengths,
    ratios,
    residuals,
    aligned,
    lineHeight,
    candidate: c,
    volume,
    volumeError: ((volume - state.factor) / state.factor) * 100,
  };
}

export function parseMesolabe(hash: string): { state: MesolabeState; repaired: boolean } {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const state = { ...initialMesolabe };
  let repaired = false;
  const number = (key: string, fallback: number, min: number, max: number, integer = false) => {
    const raw = params.get(key);
    if (raw === null) return fallback;
    const value = raw.trim() === "" ? Number.NaN : Number(raw);
    if (
      !Number.isFinite(value) ||
      value < min ||
      value > max ||
      (integer && !Number.isInteger(value))
    ) {
      repaired = true;
      return fallback;
    }
    return value;
  };
  state.factor = number("r", state.factor, 2, 8);
  state.left = number("l", state.left, 0, 0.9);
  state.right = number("q", state.right, 0, 0.9);
  state.step = number("s", state.step, 0, 4, true);
  state.passage = number("p", state.passage, 0, 7, true);
  state.page = number("page", state.page, 102, 113, true);
  const mode = params.get("m");
  if (mode && ["trial", "first", "ideal"].includes(mode)) state.mode = mode as MesolabeMode;
  else if (mode !== null) repaired = true;
  return { state, repaired };
}

export function encodeMesolabe(s: MesolabeState): string {
  return `#${new URLSearchParams({
    r: String(s.factor),
    l: String(s.left),
    q: String(s.right),
    m: s.mode,
    s: String(s.step),
    p: String(s.passage),
    page: String(s.page),
  })}`;
}

export function measure(value: number, places = 5): string {
  if (Math.abs(value) < 1e-12) return "0";
  if (Math.abs(value) < 10 ** -places) return value.toExponential(2);
  return new Intl.NumberFormat("en", { maximumFractionDigits: places }).format(value);
}
