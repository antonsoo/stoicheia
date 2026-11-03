import { add, approximate, exact, rational, square, subtract } from "./circle";

/** Modern rational-coordinate experiment accompanying I.1, not ancient arithmetic. */
export interface IntersectionState {
  open: boolean;
  m: number;
  n: number;
  places: 2 | 4 | 6;
  real: boolean;
}
export const initialIntersection: Readonly<IntersectionState> = {
  open: false,
  m: 11,
  n: 19,
  places: 2,
  real: false,
};
export const intersectionTrials = [
  [1, 2],
  [3, 5],
  [4, 7],
  [11, 19],
  [15, 26],
  [41, 71],
  [56, 97],
  [153, 265],
] as const;

export function candidateInteger(text: string, denominator = false): number {
  if (!/^\d{1,7}$/.test(text) || Number(text) > 1000000 || (denominator && Number(text) === 0))
    throw new Error(`Use a whole number from ${denominator ? "1" : "0"} to 1,000,000.`);
  return Number(text);
}

export function decodeIntersection(params: URLSearchParams): IntersectionState {
  let m = initialIntersection.m,
    n = initialIntersection.n;
  try {
    m = candidateInteger(params.get("im") ?? String(m));
    n = candidateInteger(params.get("in") ?? String(n), true);
  } catch {
    /* Malformed shared candidates use the stated starting pair together. */
    m = initialIntersection.m;
    n = initialIntersection.n;
  }
  return {
    open: params.get("intersection") === "1",
    m,
    n,
    places: params.get("ip") === "6" ? 6 : params.get("ip") === "4" ? 4 : 2,
    real: params.get("ir") === "1",
  };
}

export function intersectionModel(s: Pick<IntersectionState, "m" | "n" | "places">) {
  candidateInteger(String(s.m));
  candidateInteger(String(s.n), true);
  const m = BigInt(s.m),
    n = BigInt(s.n),
    d = m * m + n * n;
  const x = rational(n * n - m * m, d),
    y = rational(2n * m * n, d);
  const firstSquared = add(square(x), square(y));
  const secondSquared = add(square(subtract(x, rational(1))), square(y));
  const residual = subtract(secondSquared, rational(1));
  const shownLength = Math.sqrt(approximate(secondSquared)).toFixed(s.places);
  return {
    x,
    y,
    firstSquared,
    secondSquared,
    residual,
    shownLength,
    roundedEqual: shownLength === (1).toFixed(s.places),
    position: residual.n < 0n ? "inside" : residual.n > 0n ? "outside" : "on",
    // This identity supplies an integer witness independently of rendering precision.
    witness: 3n * m * m - n * n,
  };
}

export function intersectionCsv(s: IntersectionState): string {
  const p = intersectionModel(s);
  return `${[
    "quantity,exact_value,meaning",
    `m,${s.m},modern rational parameter numerator`,
    `n,${s.n},modern rational parameter denominator`,
    `x,${exact(p.x)},candidate P coordinate`,
    `y,${exact(p.y)},candidate P coordinate`,
    `AP_squared,${exact(p.firstSquared)},exact squared distance to A`,
    `BP_squared,${exact(p.secondSquared)},exact squared distance to B`,
    `BP_squared_minus_1,${exact(p.residual)},signed exact residual`,
    `BP_rounded,${p.shownLength},approximate length to ${s.places} decimal places`,
    `3m_squared_minus_n_squared,${p.witness},integer witness of nonzero residual`,
    "model,rational-coordinate restriction,modern experiment accompanying Euclid I.1",
    "source,Heiberg 1883 I pp.8-13,Greek and Latin are public domain",
    "license,PolyForm Noncommercial 1.0.0,Copyright 2026 Anthony Mercer",
  ].join("\n")}\n`;
}
