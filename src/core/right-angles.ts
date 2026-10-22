import { bisectSegment, sideOfLine } from "./bisection";
import { add, distance, equilateral, type Point, scale, subtract, transfer } from "./geometry";

export type LineCircle =
  | { kind: "degenerate"; points: []; gap: number }
  | { kind: "miss"; points: []; gap: number }
  | { kind: "tangent"; points: [Point]; gap: number }
  | { kind: "crossings"; points: [Point, Point]; gap: number };

/** A supporting line, not a bounded segment. The signed squared gap distinguishes
 * a miss, a tangent, and two crossings without inventing a zero-length chord. */
export function intersectLineCircle(a: Point, b: Point, center: Point, radius: number): LineCircle {
  if (![a.x, a.y, b.x, b.y, center.x, center.y, radius].every(Number.isFinite) || radius < 0)
    throw new RangeError("The circle needs finite coordinates and a nonnegative radius.");
  const length = distance(a, b);
  if (length === 0) throw new RangeError("The line needs distinct points.");
  if (radius === 0) return { kind: "degenerate", points: [], gap: 0 };
  const u = scale(subtract(b, a), 1 / length);
  const v = subtract(center, a);
  const projection = u.x * v.x + u.y * v.y;
  const normal = u.x * v.y - u.y * v.x;
  const gap = radius * radius - normal * normal;
  // Subtracting translated coordinates also loses absolute precision. Include
  // that error scale, so rotating/translating a tangent cannot invent a tiny
  // chord (or a miss) solely from cancellation in the supplied coordinates.
  const coordinateScale = Math.max(
    Math.abs(a.x),
    Math.abs(a.y),
    Math.abs(b.x),
    Math.abs(b.y),
    Math.abs(center.x),
    Math.abs(center.y),
  );
  const tolerance =
    64 *
    Number.EPSILON *
    Math.max(
      radius * radius,
      normal * normal,
      coordinateScale * Math.max(radius, Math.abs(normal), length),
    );
  const foot = add(a, scale(u, projection));
  if (gap < -tolerance) return { kind: "miss", points: [], gap };
  if (gap <= tolerance) return { kind: "tangent", points: [foot], gap };
  const offset = scale(u, Math.sqrt(gap));
  return { kind: "crossings", points: [subtract(foot, offset), add(foot, offset)], gap };
}

/** Lay off an I.2 copy on the specified ray by intersecting a circle with its
 * supporting line. Kept separate from assigning an equal-length displacement. */
export function copyOnRay(at: Point, toward: Point, first: Point, last: Point, side: 1 | -1 = 1) {
  const copy =
    distance(at, first) === 0 ? transfer(at, last, first, side) : transfer(at, first, last, side);
  const radius = distance(at, copy.l);
  const cut = intersectLineCircle(at, toward, at, radius);
  if (cut.kind !== "crossings")
    throw new RangeError("The copied circle must cross its diameter twice.");
  return { copy, radius, point: cut.points[1] };
}

/** I.11: choose D left of C, copy CD rightward to E by I.2, then construct
 * equilateral DZE with I.1. CZ is proved perpendicular by I.8 and definition 10. */
export function raisePerpendicular(a: Point, b: Point, c: Point, side: 1 | -1 = 1) {
  const length = distance(a, b);
  if (length === 0 || Math.abs(sideOfLine(a, b, c)) > length * length * 1e-12)
    throw new RangeError("The given point must lie on the line.");
  const u = scale(subtract(b, a), 1 / length);
  const along = (c.x - a.x) * u.x + (c.y - a.y) * u.y;
  if (!(along > 0 && along < length))
    throw new RangeError("Choose the given point within the displayed segment.");
  const d = subtract(c, scale(u, 0.7 * Math.min(along, length - along)));
  const copied = copyOnRay(c, b, d, c, side);
  const e = copied.point;
  const z = equilateral(d, e, side);
  return { a, b, c, d, e, z, copied };
}

/** I.12: source choice of an opposite-side point guarantees a genuine chord.
 * Exploration of another choice can return a miss/tangent, with no midpoint. */
export function dropPerpendicular(a: Point, b: Point, c: Point, d: Point, side: 1 | -1 = 1) {
  const radius = distance(c, d);
  const intersection = intersectLineCircle(a, b, c, radius);
  const opposite = sideOfLine(a, b, c) * sideOfLine(a, b, d) < 0;
  const bisector =
    intersection.kind === "crossings" ? bisectSegment(...intersection.points, side) : undefined;
  return { a, b, c, d, radius, intersection, opposite, bisector, foot: bisector?.d };
}

/** I.16's two constructions, both made through I.10 then an I.2 ray copy.
 * E/Z belong to the source's first drawing; theta/kappa name our expansion of
 * the source's abbreviated second construction. */
export function exteriorConstruction(a: Point, b: Point, c: Point, side: 1 | -1 = 1) {
  if (Math.abs(sideOfLine(b, c, a)) <= distance(b, c) * distance(b, a) * 1e-12)
    throw new RangeError("The triangle must be nondegenerate.");
  const first = bisectSegment(a, c, side);
  const e = first.d;
  const firstCopy = copyOnRay(e, add(e, subtract(e, b)), b, e, side);
  const z = firstCopy.point;
  const second = bisectSegment(b, c, side);
  const theta = second.d;
  const secondCopy = copyOnRay(theta, add(theta, subtract(theta, a)), a, theta, side);
  const kappa = secondCopy.point;
  const d = add(c, scale(subtract(c, b), 0.55));
  const h = add(c, scale(subtract(c, a), 0.55));
  return { a, b, c, d, h, e, z, theta, kappa, first, second, firstCopy, secondCopy };
}
