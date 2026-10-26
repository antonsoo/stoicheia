/** A modern coordinate witness for Euclid III.16, using exact rational lengths.
 * A=(0,0), centre Δ=(0,1), tangent y=0. The proposed ray is t(run,rise), t≥0.
 * Drawing and decimal angles are deliberately outside this certificate.
 */
import { exact, type Rational, rational } from "./circle";

export const hornPages = [208, 209, 210, 211, 212, 213] as const;
export interface HornState {
  rise: number;
  run: number;
  focus: "foot" | "crossing";
  passage: number;
  page: number;
}
export const initialHorn: HornState = {
  rise: 1,
  run: 4,
  focus: "foot",
  passage: 2,
  page: 210,
};
export interface HornWitness {
  relation: "cuts" | "tangent" | "away";
  slope: Rational;
  foot: { x: Rational; y: Rational };
  second: { x: Rational; y: Rational };
  footParameter: Rational;
  secondParameter: Rational;
  centreDistanceSquared: Rational;
  radiusSquaredMinusDistanceSquared: Rational;
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("The saved experiment must be an object.");
  return value as Record<string, unknown>;
}
export function validateHorn(value: unknown): HornState {
  const s = object(value);
  if (
    Object.keys(s).sort().join(",") !== "focus,page,passage,rise,run" ||
    typeof s.rise !== "number" ||
    !Number.isInteger(s.rise) ||
    typeof s.run !== "number" ||
    !Number.isInteger(s.run) ||
    s.run < 1 ||
    s.run > 1000000 ||
    Math.abs(s.rise) > s.run ||
    (s.focus !== "foot" && s.focus !== "crossing") ||
    !Number.isInteger(s.passage) ||
    Number(s.passage) < 0 ||
    Number(s.passage) > 7 ||
    typeof s.page !== "number" ||
    !hornPages.includes(s.page as (typeof hornPages)[number])
  )
    throw new Error(
      "Use whole-number rise and run, run 1–1,000,000, and −run ≤ rise ≤ run. The saved reading, focus and source page must belong to this room.",
    );
  return {
    rise: s.rise,
    run: s.run,
    focus: s.focus as HornState["focus"],
    passage: Number(s.passage),
    page: Number(s.page),
  };
}
export function hornWitness(s: Pick<HornState, "rise" | "run">): HornWitness {
  const state = validateHorn({ ...initialHorn, ...s });
  const p = BigInt(state.rise),
    q = BigInt(state.run),
    d = p * p + q * q;
  return {
    relation: p > 0n ? "cuts" : p === 0n ? "tangent" : "away",
    slope: rational(p, q),
    foot: { x: rational(p * q, d), y: rational(p * p, d) },
    second: { x: rational(2n * p * q, d), y: rational(2n * p * p, d) },
    footParameter: rational(p, d),
    secondParameter: rational(2n * p, d),
    centreDistanceSquared: rational(q * q, d),
    radiusSquaredMinusDistanceSquared: rational(p * p, d),
  };
}
export function hornVerdict(s: HornState): string {
  const w = hornWitness(s);
  if (w.relation === "tangent")
    return "The ray coincides with the tangent. Its angle with the tangent is zero, so it does not fit a positive rectilinear angle into the curved gap.";
  if (w.relation === "away")
    return "The forward ray stays outside the circle, on the other side of the tangent. It has left the curved gap. H and the second crossing lie on its backward extension.";
  return `The ray enters the circle. Its perpendicular foot H is strictly inside: ΔH² = ${exact(w.centreDistanceSquared)} < 1. A smaller positive slope moves the crossing closer to A; it does not make the ray fit the gap.`;
}
export function hornJson(s: HornState): string {
  return `${JSON.stringify({ format: "stoicheia-horn-experiment", version: 1, state: validateHorn(s) }, null, 2)}\n`;
}
export function parseHornJson(text: string): HornState {
  if (text.length > 12000) throw new Error("The saved experiment is too large.");
  const data = object(JSON.parse(text));
  if (
    Object.keys(data).sort().join(",") !== "format,state,version" ||
    data.format !== "stoicheia-horn-experiment" ||
    data.version !== 1
  )
    throw new Error("Open a version 1 Stoicheia horn-angle experiment.");
  return validateHorn(data.state);
}
export function encodeHorn(s: HornState): string {
  const v = validateHorn(s);
  return `?${new URLSearchParams({
    rise: String(v.rise),
    run: String(v.run),
    focus: v.focus,
    read: String(v.passage),
    page: String(v.page),
  })}`;
}
export function decodeHorn(search: string): HornState {
  const query = new URLSearchParams(search);
  const seen = new Set<string>();
  for (const [key] of query) {
    if (!["rise", "run", "focus", "read", "page"].includes(key) || seen.has(key))
      throw new Error("The address has an unknown or repeated experiment setting.");
    seen.add(key);
  }
  const integer = (key: string, fallback: number) => {
    const raw = query.get(key);
    if (raw === null) return fallback;
    if (!/^-?\d{1,7}$/.test(raw)) throw new Error("Address settings must use whole numbers.");
    return Number(raw);
  };
  return validateHorn({
    rise: integer("rise", initialHorn.rise),
    run: integer("run", initialHorn.run),
    focus: query.get("focus") ?? initialHorn.focus,
    passage: integer("read", initialHorn.passage),
    page: integer("page", initialHorn.page),
  });
}
