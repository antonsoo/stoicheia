import {
  add,
  approximate,
  compare,
  divide,
  exact,
  multiply,
  type Rational,
  rational,
  square,
  subtract,
} from "./circle";

/** A modern coordinate family for VI.27–29. Areas and decisions stay rational. */
export interface AreaState {
  mode: "short" | "beyond";
  base: number;
  target: string;
  shape: "half" | "equal" | "double";
  shear: number;
  trial: string;
  reading: number;
  page: number;
}
export const areaPages = [0, ...Array.from({ length: 14 }, (_, i) => 158 + i)];
export const initialAreas: Readonly<AreaState> = {
  mode: "short",
  base: 12,
  target: "27",
  shape: "equal",
  shear: 0,
  trial: "3",
  reading: 0,
  page: 162,
};
export const areaSourceFile = (page: number): string =>
  `sources/areas/heiberg-${page ? String(page).padStart(3, "0") : "title"}.jpg`;
export const shapeFactor = (s: AreaState): Rational =>
  s.shape === "half" ? rational(1, 2) : rational(s.shape === "double" ? 2 : 1);

export function areaFraction(text: unknown, zero = false): Rational {
  if (typeof text !== "string" || text.length > 24 || !/^\d+(?:\/\d+|\.\d{1,6})?$/.test(text))
    throw new Error("Use a whole number, fraction such as 9/2, or decimal with up to six places.");
  let value: Rational;
  if (text.includes("/")) {
    const [n = "", d = ""] = text.split("/");
    value = rational(BigInt(n), BigInt(d));
  } else if (text.includes(".")) {
    const [n = "", d = ""] = text.split(".");
    value = rational(BigInt(n + d), 10n ** BigInt(d.length));
  } else value = rational(BigInt(text));
  if (compare(value, rational(0)) < (zero ? 0 : 1) || value.d > 1000000n)
    throw new Error(
      `Use ${zero ? "zero or a positive" : "a positive"} value with denominator at most 1,000,000.`,
    );
  return value;
}
export function validateAreas(value: unknown): AreaState {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("The area experiment must be a record.");
  const s = value as Record<string, unknown>;
  if (Object.keys(s).sort().join() !== Object.keys(initialAreas).sort().join())
    throw new Error("The experiment has missing or unknown settings.");
  if (s.mode !== "short" && s.mode !== "beyond")
    throw new Error("Choose falling short or exceeding.");
  if (s.shape !== "half" && s.shape !== "equal" && s.shape !== "double")
    throw new Error("Choose a given shape with height/base 1/2, 1 or 2.");
  if (typeof s.base !== "number" || !Number.isInteger(s.base) || s.base < 4 || s.base > 24)
    throw new Error("The given line must be a whole number from 4 to 24.");
  if (typeof s.shear !== "number" || !Number.isInteger(s.shear) || Math.abs(s.shear) > 60)
    throw new Error("The top shift must be from −60 to 60 percent of the height.");
  const c = areaFraction(s.target),
    t = areaFraction(s.trial, true);
  if (compare(c, rational(4096)) > 0) throw new Error("The target area must be at most 4096.");
  if (compare(t, rational(s.mode === "short" ? s.base : 128)) > 0)
    throw new Error(
      s.mode === "short"
        ? "The shortfall cannot extend past the whole given line."
        : "Use an extension at most 128.",
    );
  if (
    typeof s.reading !== "number" ||
    !Number.isInteger(s.reading) ||
    s.reading < 0 ||
    s.reading > 8
  )
    throw new Error("Choose one of the nine readings.");
  if (typeof s.page !== "number" || !areaPages.includes(s.page))
    throw new Error("Choose a retained source page.");
  return {
    mode: s.mode,
    base: s.base,
    target: exact(c),
    shape: s.shape,
    shear: s.shear,
    trial: exact(t),
    reading: s.reading,
    page: s.page,
  };
}

function integerRoot(n: bigint): bigint {
  if (n < 0n) throw new Error("No real square root of a negative number.");
  if (n < 2n) return n;
  let x = n,
    y = (x + 1n) / 2n;
  while (y < x) {
    x = y;
    y = (x + n / x) / 2n;
  }
  return x;
}
export function rationalRoot(n: Rational): Rational | null {
  if (n.n < 0n) return null;
  const a = integerRoot(n.n),
    b = integerRoot(n.d);
  return a * a === n.n && b * b === n.d ? rational(a, b) : null;
}
export function trialArea(s: AreaState, t = areaFraction(s.trial, true)): Rational {
  const a = rational(s.base);
  return multiply(shapeFactor(s), multiply(t, s.mode === "short" ? subtract(a, t) : add(a, t)));
}
export interface AreaFit {
  exact: Rational | null;
  value: number;
  lower: Rational;
  upper: Rational;
}
/** Decimal endpoints are checked with the exact monotone polynomial branch. */
function enclosedFit(
  s: AreaState,
  value: number,
  root: Rational | null,
  increasing: boolean,
): AreaFit {
  if (root) return { exact: root, value: approximate(root), lower: root, upper: root };
  const denominator = 1000000n,
    c = areaFraction(s.target);
  let n = BigInt(Math.floor(value * 1000000));
  const isBelow = (m: bigint) => {
    const sign = compare(trialArea(s, rational(m, denominator)), c);
    return increasing ? sign < 0 : sign > 0;
  };
  while (!isBelow(n)) n--;
  while (isBelow(n + 1n)) n++;
  return {
    exact: null,
    value,
    lower: rational(n, denominator),
    upper: rational(n + 1n, denominator),
  };
}
export function areaModel(s: AreaState) {
  const a = rational(s.base),
    c = areaFraction(s.target),
    t = areaFraction(s.trial, true),
    k = shapeFactor(s);
  const half = divide(a, rational(2)),
    maximum = multiply(k, square(half));
  const discriminant =
    s.mode === "short"
      ? subtract(square(a), multiply(rational(4), divide(c, k)))
      : add(square(a), multiply(rational(4), divide(c, k)));
  const root = rationalRoot(discriminant);
  const fits: AreaFit[] = [];
  if (discriminant.n >= 0n) {
    const d = Math.sqrt(approximate(discriminant));
    // Rationalized forms avoid cancellation for small target areas.
    const small = (2 * approximate(divide(c, k))) / (s.base + d);
    const low = root
      ? divide(s.mode === "short" ? subtract(a, root) : subtract(root, a), rational(2))
      : null;
    fits.push(enclosedFit(s, small, low, true));
    if (s.mode === "short" && discriminant.n > 0n) {
      const high = root ? divide(add(a, root), rational(2)) : null;
      fits.push(enclosedFit(s, s.base - small, high, false));
    }
  }
  const area = trialArea(s),
    residual = subtract(area, c);
  return {
    a,
    c,
    t,
    k,
    half,
    maximum,
    discriminant,
    fits,
    area,
    residual,
    height: multiply(k, t),
    appliedBase: s.mode === "short" ? subtract(a, t) : add(a, t),
    similarArea: multiply(k, square(t)),
    correction: multiply(k, square(s.mode === "short" ? subtract(t, half) : add(t, half))),
    exactFit: residual.n === 0n,
    degenerate: t.n === 0n || (s.mode === "short" && compare(t, a) === 0),
  };
}
export function reflectedTrial(s: AreaState): string {
  if (s.mode !== "short") throw new Error("The reflection belongs to the falling-short family.");
  return exact(subtract(rational(s.base), areaFraction(s.trial, true)));
}
export function encodeAreas(s: AreaState): string {
  return `?${new URLSearchParams(Object.entries(validateAreas(s)).map(([k, v]) => [k, String(v)]))}`;
}
export function decodeAreas(search: string): AreaState {
  if (search.length > 512) throw new Error("The experiment link is too long.");
  const params = new URLSearchParams(search),
    s = { ...initialAreas } as Record<string, unknown>;
  for (const [key, value] of params) {
    if (!Object.hasOwn(initialAreas, key) || params.getAll(key).length !== 1)
      throw new Error("The link has unknown or repeated settings.");
    s[key] = ["base", "shear", "reading", "page"].includes(key) ? Number(value) : value;
    if (["base", "shear", "reading", "page"].includes(key) && !/^-?\d{1,3}$/.test(value))
      throw new Error("Line, shift, reading and page settings must be whole numbers.");
  }
  return validateAreas(s);
}
export function areasJson(s: AreaState): string {
  return `${JSON.stringify({ format: "stoicheia-areas", version: 1, state: validateAreas(s) }, null, 2)}\n`;
}
export function readAreasJson(text: string): AreaState {
  if (text.length > 8192) throw new Error("The experiment file is too large.");
  // This schema uses unique field names across its envelope and single state
  // record. Reject repeated keys, including escaped spellings, before JSON.parse
  // can silently discard an earlier value.
  const fields = new Set<string>();
  for (const token of text.matchAll(/"(?:\\.|[^"\\])*"/g)) {
    if (!/^\s*:/.test(text.slice(token.index + token[0].length))) continue;
    const key = JSON.parse(token[0]) as string;
    if (fields.has(key)) throw new Error("The experiment JSON repeats a field.");
    fields.add(key);
  }
  const r: unknown = JSON.parse(text);
  if (
    !r ||
    typeof r !== "object" ||
    Array.isArray(r) ||
    Object.keys(r).sort().join() !== "format,state,version" ||
    !("format" in r) ||
    r.format !== "stoicheia-areas" ||
    !("version" in r) ||
    r.version !== 1 ||
    !("state" in r)
  )
    throw new Error("Choose a version 1 Stoicheia application-of-areas record.");
  return validateAreas(r.state);
}
export function areasCsv(s: AreaState): string {
  const m = areaModel(s);
  const rows = [
    ["quantity", "exact_value", "meaning"],
    ["mode", s.mode, "modern coordinate family"],
    ["a", String(s.base), "given line"],
    ["c", exact(m.c), "target area"],
    ["k", exact(m.k), "given shape vertical height per base"],
    ["shear", `${s.shear}/100`, "top shift per vertical height"],
    ["t", exact(m.t), "trial shortfall or extension"],
    ["applied_base", exact(m.appliedBase), "applied parallelogram base"],
    ["height", exact(m.height), "perpendicular height"],
    ["trial_area", exact(m.area), "base times perpendicular height"],
    ["similar_area", exact(m.similarArea), "shortfall or excess shape area"],
    ["residual", exact(m.residual), "trial area minus target; zero means exact fit"],
    ["half_line_area", exact(m.maximum), "maximum only for the falling-short family"],
    ["discriminant", exact(m.discriminant), "a squared minus or plus four c over k"],
    ["fits", String(m.fits.length), "number of positive nondegenerate geometric fits"],
    ...m.fits.flatMap((f, i) => [
      [
        `fit_${i + 1}_exact`,
        f.exact ? exact(f.exact) : "irrational",
        "no rounded decimal is certified exact",
      ],
      [`fit_${i + 1}_lower`, exact(f.lower), "certified rational lower endpoint"],
      [`fit_${i + 1}_upper`, exact(f.upper), "certified rational upper endpoint"],
    ]),
  ];
  return `${rows.map((r) => r.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")).join("\r\n")}\r\n`;
}
