export type Point = readonly [number, number];
export type Polygon = readonly Point[];
export interface GnomonState {
  u: number;
  v: number;
  shear: number;
  diagonal: boolean;
  step: number;
  a: number;
  b: number;
  gstep: number;
  book: "I43" | "II5";
  passage: number;
}
export const initialGnomon: GnomonState = {
  u: 35,
  v: 35,
  shear: 20,
  diagonal: true,
  step: 0,
  a: 90,
  b: 40,
  gstep: 0,
  book: "I43",
  passage: 0,
};
export function polygonArea(points: Polygon): number {
  return (
    Math.abs(
      points.reduce((sum, p, i) => {
        const q = points[(i + 1) % points.length];
        if (!q) throw new Error("Missing polygon vertex");
        return sum + p[0] * q[1] - p[1] * q[0];
      }, 0),
    ) / 2
  );
}
export function complementModel(state: Pick<GnomonState, "u" | "v" | "shear" | "diagonal">) {
  const u = state.u / 100,
    v = (state.diagonal ? state.u : state.v) / 100;
  const shear = state.shear / 10;
  const at = (x: number, y: number): Point => [10 * x + shear * (1 - y), 6 * y];
  const A = at(0, 0),
    B = at(0, 1),
    G = at(1, 1),
    D = at(1, 0);
  const E = at(0, v),
    T = at(u, 0),
    Z = at(1, v),
    H = at(u, 1),
    K = at(u, v);
  const left: Polygon = [B, H, K, E],
    right: Polygon = [K, Z, D, T];
  const triangles: readonly Polygon[] = [
    [A, E, K],
    [A, T, K],
    [K, Z, G],
    [K, H, G],
  ];
  return {
    points: { A, B, G, D, E, T, Z, H, K },
    left,
    right,
    triangles,
    leftArea: polygonArea(left),
    rightArea: polygonArea(right),
    triangleAreas: triangles.map(polygonArea),
    whole: 60,
    half: 30,
    onDiagonal: state.diagonal || state.u === state.v,
    difference: 60 * (u - v),
    u,
    v,
    shear,
  };
}
export function gnomonModel(state: Pick<GnomonState, "a" | "b">) {
  const a = Math.max(state.a, state.b) / 10,
    b = Math.min(state.a, state.b) / 10;
  const r = (a + b) / 2,
    d = (a - b) / 2;
  const rect = (x: number, y: number, w: number, h: number): Polygon => [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
  const regions = {
    GT: rect(r, 0, d, b),
    TZ: rect(a, b, b, d),
    DM: rect(a, 0, b, b),
    GM: rect(r, 0, r, b),
    DZ: rect(a, 0, b, r),
    AL: rect(0, 0, r, b),
    AT: rect(0, 0, a, b),
    LH: rect(r, b, d, d),
    square: rect(r, 0, r, r),
    gnomon: [
      [r, 0],
      [a + b, 0],
      [a + b, r],
      [a, r],
      [a, b],
      [r, b],
    ] as Polygon,
  };
  const points: Record<string, Point> = {
    A: [0, 0],
    G: [r, 0],
    D: [a, 0],
    B: [a + b, 0],
    K: [0, b],
    L: [r, b],
    T: [a, b],
    M: [a + b, b],
    E: [r, r],
    H: [a, r],
    Z: [a + b, r],
  };
  return {
    a,
    b,
    r,
    d,
    points,
    regions,
    area: (state.a * state.b) / 100,
    complementArea: d * b,
    missing: d * d,
    square: r * r,
    equal: state.a === state.b,
  };
}
export function encodeGnomon(s: GnomonState): string {
  return `#u=${s.u}&v=${s.diagonal ? s.u : s.v}&h=${s.shear}&d=${Number(s.diagonal)}&s=${s.step}&a=${s.a}&b=${s.b}&g=${s.gstep}&book=${s.book}&r=${s.passage}`;
}
export function parseGnomon(hash: string): { state: GnomonState; notice: string } {
  const params = new URLSearchParams(hash.replace(/^#/, "")),
    state = { ...initialGnomon };
  const keys = ["u", "v", "h", "d", "s", "a", "b", "g", "book", "r"];
  if (keys.some((k) => params.getAll(k).length > 1))
    return { state, notice: "Repeated settings: the example has been reset." };
  let bad = false;
  const integer = (key: string, fallback: number, min: number, max: number) => {
    const raw = params.get(key);
    if (raw === null) return fallback;
    if (!/^-?\d+$/.test(raw) || Number(raw) < min || Number(raw) > max) {
      bad = true;
      return fallback;
    }
    return Number(raw);
  };
  state.u = integer("u", 35, 15, 85);
  state.v = integer("v", 35, 15, 85);
  state.shear = integer("h", 20, -40, 40);
  state.diagonal = integer("d", 1, 0, 1) === 1;
  state.step = integer("s", 0, 0, 3);
  state.a = integer("a", 90, 10, 160);
  state.b = integer("b", 40, 10, 160);
  state.gstep = integer("g", 0, 0, 5);
  const book = params.get("book");
  if (book === "I43" || book === "II5") state.book = book;
  else if (book !== null) bad = true;
  state.passage = integer("r", 0, 0, state.book === "I43" ? 6 : 10);
  if (state.diagonal) state.v = state.u;
  return {
    state,
    notice: bad ? "Some settings were invalid; those values use the opening example." : "",
  };
}
