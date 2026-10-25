/** Exact lengths in Q(sqrt(2)). Decimal approximations are used only for drawing. */
export interface Length {
  a: bigint;
  b: bigint;
  d: bigint;
}
const abs = (n: bigint) => (n < 0n ? -n : n);
export function gcd(a: bigint, b: bigint): bigint {
  a = abs(a);
  b = abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}
export function length(a: bigint, b = 0n, d = 1n): Length {
  if (!d) throw new Error("A length cannot have a zero denominator.");
  if (d < 0n) [a, b, d] = [-a, -b, -d];
  const g = gcd(gcd(a, b), d);
  return { a: a / g, b: b / g, d: d / g };
}
export const unit = length(1n);
export const diagonal = length(0n, 1n);
export const scaleFactor = length(-1n, 1n);
export function add(x: Length, y: Length): Length {
  return length(x.a * y.d + y.a * x.d, x.b * y.d + y.b * x.d, x.d * y.d);
}
export function times(x: Length, n: bigint): Length {
  return length(x.a * n, x.b * n, x.d);
}
export function subtract(x: Length, y: Length): Length {
  return add(x, times(y, -1n));
}
export function multiply(x: Length, y: Length): Length {
  return length(x.a * y.a + 2n * x.b * y.b, x.a * y.b + x.b * y.a, x.d * y.d);
}
export function divide(x: Length, y: Length): Length {
  return length(
    y.d * (x.a * y.a - 2n * x.b * y.b),
    y.d * (x.b * y.a - x.a * y.b),
    x.d * (y.a * y.a - 2n * y.b * y.b),
  );
}
export function sign(x: Length): -1 | 0 | 1 {
  const { a, b } = x;
  if (!a && !b) return 0;
  if (a >= 0n && b >= 0n) return 1;
  if (a <= 0n && b <= 0n) return -1;
  // Opposing signs: compare squares using integers, without rounding sqrt(2).
  const norm = a * a - 2n * b * b;
  return a > 0n ? (norm > 0n ? 1 : -1) : norm > 0n ? -1 : 1;
}
export const compare = (x: Length, y: Length): -1 | 0 | 1 => sign(subtract(x, y));
export const equal = (x: Length, y: Length): boolean => compare(x, y) === 0;
export function approximate(x: Length): number {
  const a = Number(x.a),
    b = Number(x.b),
    d = Number(x.d);
  // Rationalize the numerator when its terms cancel. At late stages a direct
  // a+b*Math.sqrt(2) rounds a strictly positive remainder to zero.
  if (x.a * x.b < 0n) return Number(x.a * x.a - 2n * x.b * x.b) / (d * (a - b * Math.SQRT2));
  return (a + b * Math.SQRT2) / d;
}
export function exact(x: Length): string {
  if (!x.b) return x.d === 1n ? String(x.a) : `${x.a}/${x.d}`;
  const root = `${abs(x.b) === 1n ? "" : abs(x.b)}√2`;
  if (x.a < 0n && x.b > 0n) {
    const numerator = `${root} − ${abs(x.a)}`;
    return x.d === 1n ? numerator : `(${numerator})/${x.d}`;
  }
  const numerator = x.a
    ? `${x.a} ${x.b < 0n ? "−" : "+"} ${root}`
    : `${x.b < 0n ? "−" : ""}${root}`;
  return x.d === 1n ? numerator : `(${numerator})/${x.d}`;
}
export function quotient(a: Length, b: Length): number {
  if (sign(b) <= 0 || compare(a, b) < 0) throw new Error("Expected A ≥ B > 0.");
  let lo = 1n,
    hi = 2n;
  while (compare(times(b, hi), a) <= 0) hi *= 2n;
  while (hi - lo > 1n) {
    const middle = (lo + hi) / 2n;
    if (compare(times(b, middle), a) <= 0) lo = middle;
    else hi = middle;
  }
  if (lo > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("Too many copies for this bench.");
  return Number(lo);
}
export interface Division {
  index: number;
  a: Length;
  b: Length;
  q: number;
  r: Length;
}
export const measureLimit = 24;
export type MeasureKind = "diagonal" | "fraction";
export interface MeasureState {
  kind: MeasureKind;
  n: number;
  d: number;
  row: number;
  copies: number;
  passage: number;
  page: number;
}
export const initialMeasure: Readonly<MeasureState> = {
  kind: "diagonal",
  n: 577,
  d: 408,
  row: 0,
  copies: 0,
  passage: 0,
  page: 2,
};
export const measurePages = Array.from({ length: 12 }, (_, i) => i + 2);
export function startLength(s: Pick<MeasureState, "kind" | "n" | "d">): Length {
  return s.kind === "diagonal" ? diagonal : length(BigInt(s.n), 0n, BigInt(s.d));
}
export function divisions(s: Pick<MeasureState, "kind" | "n" | "d">): Division[] {
  let a = startLength(s),
    b = unit;
  const rows: Division[] = [];
  for (let index = 0; index < measureLimit; index++) {
    const q = quotient(a, b),
      r = subtract(a, times(b, BigInt(q)));
    rows.push({ index, a, b, q, r });
    if (sign(r) === 0) break;
    [a, b] = [b, r];
  }
  return rows;
}
export function activeDivision(s: MeasureState): Division {
  const row = divisions(s)[s.row];
  if (!row) throw new Error("This division is outside the experiment.");
  return row;
}
export function remainderNow(s: MeasureState): Length {
  const row = activeDivision(s);
  return subtract(row.a, times(row.b, BigInt(s.copies)));
}
export function finished(s: MeasureState): boolean {
  const row = activeDivision(s);
  return s.copies === row.q && sign(row.r) === 0;
}
export function commonMeasure(s: MeasureState) {
  if (!finished(s)) return null;
  const row = activeDivision(s);
  const a = divide(startLength(s), row.b),
    b = divide(unit, row.b);
  if (a.b || b.b || a.d !== 1n || b.d !== 1n)
    throw new Error("The alleged common measure did not tile both original lengths.");
  return { unit: row.b, longCount: a.a, shortCount: b.a };
}
export function validateFraction(n: number, d: number): string | null {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || n < 1 || d < 1)
    return "Use positive whole numbers for the numerator and denominator.";
  if (n > 19998 || d > 9999) return "Use a denominator up to 9999 and a numerator up to 19998.";
  if (n < d || n > 2 * d) return "Choose a length between 1 and 2 times the unit.";
  return null;
}
export function validateMeasure(s: MeasureState): void {
  if (!["diagonal", "fraction"].includes(s.kind)) throw new Error("Unknown length choice.");
  const error = validateFraction(s.n, s.d);
  if (error) throw new Error(error);
  const rows = divisions(s),
    row = rows[s.row];
  if (!Number.isInteger(s.row) || !row) throw new Error("The selected stage does not exist.");
  if (!Number.isInteger(s.copies) || s.copies < 0 || s.copies > row.q)
    throw new Error("The copy count does not fit this stage.");
  if (!Number.isInteger(s.passage) || s.passage < 0 || s.passage > 9)
    throw new Error("The selected reading does not exist.");
  if (!measurePages.includes(s.page)) throw new Error("The selected source page does not exist.");
}
export function encodeMeasure(s: MeasureState): string {
  validateMeasure(s);
  return `#${new URLSearchParams(Object.entries(s).map(([k, v]) => [k, String(v)]))}`;
}
export function decodeMeasure(hash: string): MeasureState {
  if (!hash || hash === "#") return { ...initialMeasure };
  if (hash.length > 300) throw new Error("This experiment link is too long.");
  const params = new URLSearchParams(hash.replace(/^#/, "")),
    allowed = Object.keys(initialMeasure);
  for (const key of params.keys()) {
    if (!allowed.includes(key) || params.getAll(key).length !== 1)
      throw new Error("This experiment link has unknown or repeated settings.");
  }
  const s = { ...initialMeasure };
  const kind = params.get("kind");
  if (kind !== null) {
    if (kind !== "diagonal" && kind !== "fraction") throw new Error("Unknown length choice.");
    s.kind = kind;
  }
  for (const k of ["n", "d", "row", "copies", "passage", "page"] as const) {
    const raw = params.get(k);
    if (raw !== null) {
      if (!/^\d{1,5}$/.test(raw)) throw new Error("Use bounded whole numbers in experiment links.");
      s[k] = Number(raw);
    }
  }
  validateMeasure(s);
  return s;
}
/** Preserve completed progress only where the other example has that stage. */
export function changeLength(s: MeasureState, kind: MeasureKind, n = s.n, d = s.d): MeasureState {
  const next = { ...s, kind, n, d };
  const rows = divisions(next);
  next.row = Math.min(s.row, rows.length - 1);
  const q = rows[next.row]?.q ?? 1;
  next.copies = Math.min(s.copies, q);
  validateMeasure(next);
  return next;
}
