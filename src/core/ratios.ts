import {
  compare,
  diagonal,
  exact,
  type Length,
  length,
  multiply,
  quotient,
  times,
  unit,
} from "./measure";

/** Modern examples for the quantifiers in Euclid V definitions 5 and 7. */
export const RATIO_LIMIT = 1000;
export const ratioPages = [0, 2, 3, 4, 5] as const;
export interface RatioState {
  kind: "fraction" | "scaled";
  p: number;
  q: number;
  m: number;
  n: number;
  bound: number;
  reading: number;
  page: number;
}
export const initialRatios: Readonly<RatioState> = {
  kind: "fraction",
  p: 99,
  q: 70,
  m: 7,
  n: 10,
  bound: 69,
  reading: 2,
  page: 2,
};
export const ratioSourceFile = (page: number): string =>
  `sources/ratios/heiberg-${page ? String(page).padStart(3, "0") : "title"}.jpg`;

export function validateRatios(value: unknown): RatioState {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("The experiment must be a record.");
  const s = value as Record<string, unknown>;
  if (Object.keys(s).sort().join(",") !== "bound,kind,m,n,p,page,q,reading")
    throw new Error("The experiment has missing or unknown fields.");
  if (s.kind !== "fraction" && s.kind !== "scaled")
    throw new Error("Choose the fraction or the threefold pair.");
  for (const k of ["p", "q"] as const)
    if (typeof s[k] !== "number" || !Number.isInteger(s[k]) || s[k] < 1 || s[k] > 9999)
      throw new Error("Fraction terms must be whole numbers from 1 to 9999.");
  if (Number(s.p) < Number(s.q) || Number(s.p) > 2 * Number(s.q))
    throw new Error("Keep the comparison fraction between 1 and 2, inclusive.");
  for (const k of ["m", "n", "bound"] as const)
    if (typeof s[k] !== "number" || !Number.isInteger(s[k]) || s[k] < 1 || s[k] > RATIO_LIMIT)
      throw new Error("Multipliers and the search bound must be whole numbers from 1 to 1000.");
  if (
    typeof s.reading !== "number" ||
    !Number.isInteger(s.reading) ||
    s.reading < 0 ||
    s.reading > 6
  )
    throw new Error("Choose one of the seven reading units.");
  if (!ratioPages.includes(s.page as (typeof ratioPages)[number]))
    throw new Error("Choose the title or a source page from 2 to 5.");
  return {
    kind: s.kind,
    p: Number(s.p),
    q: Number(s.q),
    m: Number(s.m),
    n: Number(s.n),
    bound: Number(s.bound),
    reading: s.reading,
    page: Number(s.page),
  };
}

export function ratioMagnitudes(s: RatioState): readonly [Length, Length, Length, Length] {
  return [
    diagonal,
    unit,
    s.kind === "scaled" ? times(diagonal, 3n) : length(BigInt(s.p)),
    s.kind === "scaled" ? length(3n) : length(BigInt(s.q)),
  ];
}

export function ratioTrial(s: RatioState) {
  const [a, b, c, d] = ratioMagnitudes(s);
  const ma = times(a, BigInt(s.m)),
    nb = times(b, BigInt(s.n)),
    mc = times(c, BigInt(s.m)),
    nd = times(d, BigInt(s.n));
  const first = compare(ma, nb),
    second = compare(mc, nd);
  // Definition 7 requires a strict excess on one side, and a non-excess on the other.
  const greater = first > 0 && second <= 0 ? "first" : second > 0 && first <= 0 ? "second" : null;
  return { ma, nb, mc, nd, first, second, agrees: first === second, greater };
}
export const relationSymbol = (sign: number): string => (sign < 0 ? "<" : sign > 0 ? ">" : "=");
export const relationWord = (sign: number): string =>
  sign < 0 ? "falls short of" : sign > 0 ? "exceeds" : "equals";

export interface RatioWitness {
  m: number;
  n: number;
}
export interface RatioScan {
  bound: number;
  checked: number;
  disagreements: number;
  first: RatioWitness | null;
  firstExcess: RatioWitness | null;
  /** Each inclusive integer interval contains exactly the disagreements in that row. */
  rows: { m: number; lo: number; hi: number }[];
}
const scans = new Map<string, RatioScan>();

/** Exact O(N log N) row search; no million-cell DOM or rounded quotient decisions. */
export function scanRatios(s: RatioState): RatioScan {
  const key = `${s.kind}:${s.p}:${s.q}:${s.bound}`;
  const cached = scans.get(key);
  if (cached) return cached;
  const [a, b, c, d] = ratioMagnitudes(s);
  const order = compare(multiply(a, d), multiply(c, b));
  const rows: RatioScan["rows"] = [];
  let disagreements = 0;
  for (let m = 1; m <= s.bound && order !== 0; m++) {
    const x = times(order < 0 ? a : c, BigInt(m)),
      xb = order < 0 ? b : d,
      y = times(order < 0 ? c : a, BigInt(m)),
      yb = order < 0 ? d : b;
    const lowFloor = quotient(x, xb),
      highFloor = quotient(y, yb);
    const lo = Math.max(1, lowFloor + (compare(x, times(xb, BigInt(lowFloor))) === 0 ? 0 : 1)),
      hi = Math.min(s.bound, highFloor);
    if (lo <= hi) {
      rows.push({ m, lo, hi });
      disagreements += hi - lo + 1;
    }
  }
  const firstRow = rows[0];
  const excessRow = rows.find((row) => ratioTrial({ ...s, m: row.m, n: row.lo }).greater);
  const result = {
    bound: s.bound,
    checked: s.bound ** 2,
    disagreements,
    first: firstRow ? { m: firstRow.m, n: firstRow.lo } : null,
    firstExcess: excessRow ? { m: excessRow.m, n: excessRow.lo } : null,
    rows,
  };
  // Bounded cache: changing a slider must not retain an unbounded history of scans.
  if (scans.size >= 16) scans.delete(scans.keys().next().value as string);
  scans.set(key, result);
  return result;
}

export function encodeRatios(s: RatioState): string {
  validateRatios(s);
  return `?${new URLSearchParams(Object.entries(s).map(([k, v]) => [k, String(v)]))}`;
}
export function decodeRatios(search: string): RatioState {
  if (search.length > 512) throw new Error("This experiment link is too long.");
  const params = new URLSearchParams(search),
    s = { ...initialRatios } as Record<string, unknown>;
  for (const [key, value] of params) {
    if (!Object.hasOwn(initialRatios, key) || params.getAll(key).length !== 1)
      throw new Error("The experiment link has unknown or repeated settings.");
    if (key === "kind") s.kind = value;
    else {
      if (!/^\d{1,4}$/.test(value)) throw new Error("Experiment settings must be whole numbers.");
      s[key] = Number(value);
    }
  }
  return validateRatios(s);
}
export function ratiosJson(s: RatioState): string {
  return `${JSON.stringify({ format: "stoicheia-ratios", version: 1, state: validateRatios(s) }, null, 2)}\n`;
}
export function readRatiosJson(text: string): RatioState {
  if (text.length > 8192) throw new Error("This experiment record is too large.");
  const record: unknown = JSON.parse(text);
  if (
    !record ||
    typeof record !== "object" ||
    Array.isArray(record) ||
    Object.keys(record).sort().join(",") !== "format,state,version" ||
    !("format" in record) ||
    record.format !== "stoicheia-ratios" ||
    !("version" in record) ||
    record.version !== 1 ||
    !("state" in record)
  )
    throw new Error("Choose a version 1 Stoicheia ratios record.");
  return validateRatios(record.state);
}

/** Export the selected comparison and compact inclusive intervals for the bounded search. */
export function ratiosCsv(s: RatioState): string {
  const rows: (string | number)[][] = [
    [
      "record",
      "m",
      "n",
      "n_last",
      "count",
      "mA",
      "nB",
      "first_relation",
      "mC",
      "nD",
      "second_relation",
      "agrees",
      "definition_7_greater",
    ],
  ];
  const add = (record: string, m: number, n: number) => {
    const t = ratioTrial({ ...s, m, n });
    rows.push([
      record,
      m,
      n,
      n,
      1,
      exact(t.ma),
      exact(t.nb),
      relationSymbol(t.first),
      exact(t.mc),
      exact(t.nd),
      relationSymbol(t.second),
      String(t.agrees),
      t.greater ?? "",
    ]);
  };
  add("selected", s.m, s.n);
  for (const row of scanRatios(s).rows)
    rows.push([
      "bounded_disagreement_interval",
      row.m,
      row.lo,
      row.hi,
      row.hi - row.lo + 1,
      "",
      "",
      "",
      "",
      "",
      "",
      "false",
      "",
    ]);
  return `${rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\r\n")}\r\n`;
}
