import { add, cutOff, distance, equilateral, type Point, scale, subtract } from "./geometry";
import { rigidMotion } from "./triangles";

const cross = (u: Point, v: Point): number => u.x * v.y - u.y * v.x;
export const sideOfLine = (a: Point, b: Point, p: Point): number =>
  cross(subtract(b, a), subtract(p, a));

function finite(...values: number[]): void {
  if (values.some((value) => !Number.isFinite(value)))
    throw new RangeError("The construction needs finite coordinates and lengths.");
}

/** Intersection of two nonparallel supporting lines, not an assigned midpoint. */
export function lineIntersection(a: Point, b: Point, c: Point, d: Point): Point {
  finite(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
  const u = subtract(b, a);
  const v = subtract(d, c);
  const divisor = cross(u, v);
  if (Math.abs(divisor) <= Number.EPSILON * 32 * distance(a, b) * distance(c, d))
    throw new RangeError("The lines must have a distinct, numerically resolvable intersection.");
  return add(a, scale(u, cross(subtract(c, a), v) / divisor));
}

/** Reflect a point across the actual base line, including rotated bases. */
export function reflectInLine(a: Point, b: Point, p: Point): Point {
  finite(a.x, a.y, b.x, b.y, p.x, p.y);
  const u = subtract(b, a);
  const squared = u.x * u.x + u.y * u.y;
  if (squared === 0) throw new RangeError("The reflection base needs two distinct endpoints.");
  const v = subtract(p, a);
  const foot = add(a, scale(u, (u.x * v.x + u.y * v.y) / squared));
  return subtract(scale(foot, 2), p);
}

/** I.7 exploration: preserve the first radius, then inspect the second one. */
export function radialCandidate(a: Point, b: Point, c: Point, turn: number, mirror = false) {
  finite(a.x, a.y, b.x, b.y, c.x, c.y, turn);
  if (sideOfLine(a, b, c) === 0)
    throw new RangeError("The first meeting point must be off the base line.");
  const d = mirror ? reflectInLine(a, b, c) : rigidMotion(subtract(c, a), turn, a);
  const scaleLength = Math.max(distance(a, b), distance(a, c));
  return {
    a,
    b,
    c,
    d,
    sameSide: sideOfLine(a, b, c) * sideOfLine(a, b, d) > 0,
    distinct: distance(c, d) > scaleLength * 1e-12,
    firstDifference: distance(a, d) - distance(a, c),
    secondDifference: distance(b, d) - distance(b, c),
  };
}

/** Two-circle reconstruction of the apex from three given lengths (I.8 model). */
export function triangleFromSides(ab: number, ac: number, bc: number, side: 1 | -1 = 1) {
  finite(ab, ac, bc);
  if (!(ab > 0 && ac > 0 && bc > 0 && ab + ac > bc && ab + bc > ac && ac + bc > ab))
    throw new RangeError(
      "Three positive lengths form a triangle only when each is less than the other two together.",
    );
  // Percentage controls can round an exact equality (101 + 20.2 = 121.2)
  // into a tiny positive triangle-inequality gap. Do not display a spurious
  // apex when the separation from degeneracy is at floating-point noise scale.
  const gap = Math.min(ab + ac - bc, ab + bc - ac, ac + bc - ab);
  if (gap <= 32 * Number.EPSILON * Math.max(ab, ac, bc))
    throw new RangeError("The triangle is too close to degeneracy at this numerical scale.");
  const b = { x: 0, y: 0 };
  const c = { x: bc, y: 0 };
  const x = (ab * ab - ac * ac + bc * bc) / (2 * bc);
  // The product is 16 times the squared area. This avoids subtracting nearly
  // equal squared quantities when the apex is close to the supporting base line.
  const height =
    Math.sqrt((ab + ac + bc) * (-ab + ac + bc) * (ab - ac + bc) * (ab + ac - bc)) / (2 * bc);
  if (!(height > 0 && Number.isFinite(height)))
    throw new RangeError("The triangle is too close to degeneracy at this numerical scale.");
  const a = { x, y: side * height };
  return { a, b, c };
}

/** I.9 after equal points on the two rays have been obtained. */
function completeBisector(a: Point, d: Point, e: Point) {
  const position = sideOfLine(d, e, a);
  if (position === 0) throw new RangeError("Bisect a nonzero angle smaller than a straight angle.");
  // Choose the circle intersection across DE from A. The other choice can
  // coincide with A (60 degrees) or put AZ on the opposite ray (above 60).
  const orientation = position > 0 ? -1 : 1;
  const z = equilateral(d, e, orientation);
  const other = equilateral(d, e, orientation === 1 ? -1 : 1);
  const u = subtract(d, a);
  const v = subtract(e, a);
  const w = subtract(other, a);
  const sign = Math.sign(cross(u, v));
  const otherKind =
    distance(a, other) <= distance(a, d) * 1e-12
      ? "collapsed"
      : sign * cross(u, w) > 0 && sign * cross(w, v) > 0
        ? "internal"
        : "opposite";
  return { a, d, e, z, other, otherKind };
}

/** I.9: choose D, obtain E through I.3, and construct the equilateral DEZ. */
export function bisectAngle(a: Point, b: Point, c: Point, take: number) {
  finite(a.x, a.y, b.x, b.y, c.x, c.y, take);
  const ab = distance(a, b);
  const ac = distance(a, c);
  if (!(take > 0 && take < Math.min(ab, ac)))
    throw new RangeError("Choose an interior point closer than either given ray endpoint.");
  const d = add(a, scale(subtract(b, a), take / ab));
  const cut = cutOff(a, c, a, d);
  return { ...completeBisector(a, d, cut.e), b, c, cut };
}

/** I.10 reuses the two I.1 intersections, then intersects I.9's bisector with AB. */
export function bisectSegment(a: Point, b: Point, side: 1 | -1 = 1) {
  const c = equilateral(a, b, side);
  // I.1 already proves CA = CB: A and B are available equal-radius points.
  // There is no need to invoke I.3 on two equal lengths (which I.3 excludes).
  const angleConstruction = completeBisector(c, a, b);
  const d = lineIntersection(c, angleConstruction.z, a, b);
  return { a, b, c, d, auxiliary: angleConstruction.z, angleConstruction };
}
