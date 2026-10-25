/** Rational audit of the numbers printed in Archimedes, Circle measurement 3.
 * No decision about a bound uses floating point, trigonometry, or Math.PI.
 */
export interface Rational {
  n: bigint;
  d: bigint;
}
const gcd = (a: bigint, b: bigint): bigint => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
};
export function rational(n: bigint | number, d: bigint | number = 1): Rational {
  let a = BigInt(n),
    b = BigInt(d);
  if (!b) throw new Error("A denominator cannot be zero.");
  if (b < 0n) [a, b] = [-a, -b];
  const g = gcd(a, b);
  return { n: a / g, d: b / g };
}
export const add = (a: Rational, b: Rational): Rational =>
  rational(a.n * b.d + b.n * a.d, a.d * b.d);
export const subtract = (a: Rational, b: Rational): Rational =>
  rational(a.n * b.d - b.n * a.d, a.d * b.d);
export const multiply = (a: Rational, b: Rational): Rational => rational(a.n * b.n, a.d * b.d);
export const divide = (a: Rational, b: Rational): Rational => rational(a.n * b.d, a.d * b.n);
export const square = (a: Rational): Rational => multiply(a, a);
export const compare = (a: Rational, b: Rational): -1 | 0 | 1 => {
  const delta = a.n * b.d - b.n * a.d;
  return delta < 0n ? -1 : delta > 0n ? 1 : 0;
};
export const exact = (a: Rational): string => (a.d === 1n ? String(a.n) : `${a.n}/${a.d}`);
/** Display only. */
export const approximate = (a: Rational): number => Number(a.n) / Number(a.d);
export function parseFraction(text: string): Rational {
  const input = text.trim();
  if (input.length > 24 || !/^\d+(?:\/\d+|\.\d{1,6})?$/.test(input))
    throw new Error(
      "Use a positive whole number, fraction such as 4729/8, or decimal with up to six places.",
    );
  let value: Rational;
  if (input.includes("/")) {
    const [a = "", b = ""] = input.split("/");
    value = rational(BigInt(a), BigInt(b));
  } else if (input.includes(".")) {
    const [a = "", b = ""] = input.split(".");
    value = rational(BigInt(a + b), 10n ** BigInt(b.length));
  } else value = rational(BigInt(input));
  if (
    compare(value, rational(0)) <= 0 ||
    compare(value, rational(1000000)) > 0 ||
    value.d > 1000000n
  )
    throw new Error(
      "Use a value above zero and at most 1,000,000, with denominator at most 1,000,000.",
    );
  return value;
}
export type Branch = "outer" | "inner";
export interface Alteration {
  branch: Branch;
  row: number;
  value: string;
}
export interface CircleState {
  stage: number;
  branch: Branch;
  alteration: Alteration | null;
  passage: number;
  page: number;
}
export const circlePages = [262, 263, 264, 265, 266, 267, 268, 269, 270, 271] as const;
export const sides = [6, 12, 24, 48, 96] as const;
export const initialCircle: CircleState = {
  stage: 0,
  branch: "outer",
  alteration: null,
  passage: 0,
  page: 264,
};
interface PrintedChoice {
  value: Rational;
  base: number;
  label: string;
  page: number;
}
export const printed: Record<Branch, readonly PrintedChoice[]> = {
  outer: [
    { value: rational(265), base: 153, label: "265", page: 264 },
    { value: rational(4729, 8), base: 153, label: "591 + 1/8", page: 264 },
    { value: rational(9377, 8), base: 153, label: "1172 + 1/8", page: 264 },
    { value: rational(9357, 4), base: 153, label: "2339 + 1/4", page: 266 },
  ],
  inner: [
    { value: rational(1351), base: 780, label: "1351", page: 266 },
    { value: rational(12055, 4), base: 780, label: "3013 + 3/4", page: 268 },
    { value: rational(20227, 11), base: 240, label: "1838 + 9/11", page: 268 },
    { value: rational(6055, 6), base: 66, label: "1009 + 1/6", page: 270 },
    { value: rational(8069, 4), base: 66, label: "2017 + 1/4", page: 270 },
  ],
};
export interface AuditRow {
  index: number;
  sides: number;
  a: Rational;
  h: Rational | null;
  choice: Rational | null;
  base: number;
  /** In source-sized units: 3*base^2 for the seed, X^2+base^2 later. */
  radicand: Rational | null;
  squareGap: Rational | null;
  localSafe: boolean;
  chainSafe: boolean;
  /** Current perimeter can precede this row's H rounding on the outer path. */
  boundSafe: boolean;
  altered: boolean;
  bound: Rational;
}
export function audit(branch: Branch, alteration: Alteration | null = null): AuditRow[] {
  const rows: AuditRow[] = [];
  let a = rational(0),
    h: Rational | null = rational(2),
    chainSafe = true;
  for (let index = 0; index < 5; index++) {
    const n = sides[index];
    if (!n) throw new Error("Missing polygon size.");
    const previousSafe = chainSafe;
    const source = printed[branch][index];
    const altered = alteration?.branch === branch && alteration.row === index;
    const choice = source ? (altered ? parseFraction(alteration.value) : source.value) : null;
    const base = source?.base ?? 153;
    let radicand: Rational | null = null,
      squareGap: Rational | null = null;
    if (index === 0) {
      if (!choice) throw new Error("Missing first bound.");
      a = divide(choice, rational(base));
      radicand = rational(3 * base * base);
      squareGap = subtract(radicand, square(choice));
    } else {
      if (!h) throw new Error("A bisection needs both previous legs.");
      a = add(a, h);
      if (choice) {
        radicand = add(square(multiply(a, rational(base))), rational(base * base));
        squareGap = subtract(radicand, square(choice));
        h = divide(choice, rational(base));
      } else h = null; // The outer 96-gon needs its adjacent leg only.
    }
    // Non-strict local rounding is sufficient: the propagated geometric bound
    // stays strict. The two seed inequalities themselves must be strict.
    const localSafe =
      squareGap === null ||
      (branch === "outer"
        ? index === 0
          ? squareGap.n > 0n
          : squareGap.n >= 0n
        : index === 0
          ? squareGap.n < 0n
          : squareGap.n <= 0n);
    chainSafe &&= localSafe;
    const boundSafe =
      index === 0 ? branch === "inner" || localSafe : branch === "outer" ? previousSafe : chainSafe;
    const divisor = branch === "outer" ? a : h;
    if (!divisor) throw new Error("Missing perimeter divisor.");
    rows.push({
      index,
      sides: n,
      a,
      h,
      choice,
      base,
      radicand,
      squareGap,
      localSafe,
      chainSafe,
      boundSafe,
      altered,
      bound: divide(rational(n), divisor),
    });
  }
  return rows;
}
export function validateCircle(input: unknown): CircleState {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Expected workshop settings.");
  const s = input as Record<string, unknown>;
  if (
    Object.keys(s).sort().join(",") !== "alteration,branch,page,passage,stage" ||
    !Number.isInteger(s.stage) ||
    Number(s.stage) < 0 ||
    Number(s.stage) > 4 ||
    (s.branch !== "outer" && s.branch !== "inner") ||
    !Number.isInteger(s.passage) ||
    Number(s.passage) < 0 ||
    Number(s.passage) > 7 ||
    !circlePages.includes(s.page as (typeof circlePages)[number])
  )
    throw new Error("These settings do not describe a supported circle workshop.");
  let alteration: Alteration | null = null;
  if (s.alteration !== null) {
    if (!s.alteration || typeof s.alteration !== "object" || Array.isArray(s.alteration))
      throw new Error("Expected one altered approximation.");
    const a = s.alteration as Record<string, unknown>;
    if (
      Object.keys(a).sort().join(",") !== "branch,row,value" ||
      (a.branch !== "outer" && a.branch !== "inner") ||
      !Number.isInteger(a.row) ||
      Number(a.row) < 0 ||
      Number(a.row) >= printed[a.branch].length ||
      typeof a.value !== "string"
    )
      throw new Error("The altered step is not supported.");
    alteration = { branch: a.branch, row: Number(a.row), value: exact(parseFraction(a.value)) };
  }
  return {
    stage: Number(s.stage),
    branch: s.branch,
    passage: Number(s.passage),
    page: Number(s.page),
    alteration,
  };
}
export function encodeCircle(s: CircleState): string {
  validateCircle(s);
  const p = new URLSearchParams({
    stage: String(s.stage),
    branch: s.branch,
    read: String(s.passage),
    page: String(s.page),
  });
  if (s.alteration) {
    p.set("change", s.alteration.branch);
    p.set("row", String(s.alteration.row));
    p.set("value", s.alteration.value);
  }
  return `?${p}`;
}
export function decodeCircle(search: string): CircleState {
  const p = new URLSearchParams(search);
  if (!p.size) return { ...initialCircle };
  for (const key of p.keys())
    if (
      !["stage", "branch", "read", "page", "change", "row", "value"].includes(key) ||
      p.getAll(key).length !== 1
    )
      throw new Error("The address contains an unknown or repeated setting.");
  const integer = (key: string, fallback: number) => {
    const raw = p.get(key);
    if (raw !== null && !/^\d+$/.test(raw)) throw new Error(`Invalid ${key} in address.`);
    return raw === null ? fallback : Number(raw);
  };
  const hasChange = ["change", "row", "value"].some((k) => p.has(k));
  return validateCircle({
    stage: integer("stage", 0),
    branch: p.get("branch") ?? "outer",
    passage: integer("read", 0),
    page: integer("page", 264),
    alteration: hasChange
      ? { branch: p.get("change"), row: integer("row", -1), value: p.get("value") }
      : null,
  });
}
export const circleJson = (s: CircleState): string =>
  JSON.stringify({ format: "stoicheia-circle", version: 1, state: validateCircle(s) }, null, 2) +
  "\n";
export function readCircleJson(text: string): CircleState {
  if (text.length > 8192) throw new Error("Settings files must be at most 8 KiB.");
  const record: unknown = JSON.parse(text);
  if (!record || typeof record !== "object" || Array.isArray(record))
    throw new Error("Expected circle settings.");
  const r = record as Record<string, unknown>;
  if (
    Object.keys(r).sort().join(",") !== "format,state,version" ||
    r.format !== "stoicheia-circle" ||
    r.version !== 1
  )
    throw new Error("This is not a supported Stoicheia circle file.");
  return validateCircle(r.state);
}
