export interface Point {
  x: number;
  y: number;
}

export const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
export const subtract = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a: Point, k: number): Point => ({ x: a.x * k, y: a.y * k });
export const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);

function checkPoints(...points: Point[]): void {
  if (points.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) {
    throw new RangeError("Points must have finite coordinates.");
  }
}

function unit(from: Point, to: Point): Point {
  checkPoints(from, to);
  const length = distance(from, to);
  if (length === 0) throw new RangeError("The two endpoints must be different.");
  return scale(subtract(to, from), 1 / length);
}

/** Euclid I.1. The orientation chooses either of the two circle intersections. */
export function equilateral(a: Point, b: Point, side: 1 | -1 = 1): Point {
  unit(a, b);
  const delta = subtract(b, a);
  return add(scale(add(a, b), 0.5), scale({ x: -delta.y, y: delta.x }, (side * Math.sqrt(3)) / 2));
}

/**
 * I.2: first construct D on AB. Extend DB through B to G, using the circle
 * centred at B through C; extend DA through A to L, using the circle at D
 * through G. The returned length is obtained as DG - DA, not assigned BC.
 */
export function transfer(a: Point, b: Point, c: Point, side: 1 | -1 = 1) {
  checkPoints(a, b, c);
  const reference = distance(b, c);
  if (reference === 0) throw new RangeError("The reference segment must have positive length.");
  const d = equilateral(a, b, side);
  const g = add(b, scale(unit(d, b), reference));
  const whole = distance(d, g);
  const l = add(d, scale(unit(d, a), whole));
  return { a, b, c, d, g, l, reference, whole };
}

/** I.3 uses the constructed I.2 result as the radius of the final circle. */
export function cutOff(a: Point, b: Point, c: Point, d: Point, side: 1 | -1 = 1) {
  checkPoints(a, b, c, d);
  const greater = distance(a, b);
  const lesser = distance(c, d);
  if (!(lesser > 0 && lesser < greater)) {
    throw new RangeError(
      "I.3 requires two positive unequal lengths; the reference must be shorter.",
    );
  }
  // If the reference starts at the target, use its other endpoint for I.2.
  // This keeps the equilateral subconstruction nondegenerate (as needed in I.5).
  const copy = distance(a, c) === 0 ? transfer(a, d, c, side) : transfer(a, c, d, side);
  const radius = distance(a, copy.l);
  const e = add(a, scale(unit(a, b), radius));
  return { a, b, c, d, copy, e, radius };
}
