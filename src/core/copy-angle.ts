import { distance, type Point } from "./geometry";
import type { ClosureKind } from "./triangle-closure";

/** All side comparisons use integer percentages, before any square roots. */
export function courseTriangle(
  size: number,
  firstPercent: number,
  thirdPercent: number,
  side: 1 | -1 = 1,
) {
  if (
    !Number.isFinite(size) ||
    size <= 0 ||
    ![firstPercent, thirdPercent].every((n) => Number.isInteger(n) && n > 0)
  )
    throw new RangeError("Positive scale and integer side percentages are required.");
  const a = firstPercent,
    b = 100,
    c = thirdPercent,
    margins = [a + b - c, a + c - b, b + c - a];
  const kind: ClosureKind =
    b > a + c
      ? "separate"
      : b === a + c
        ? "external-tangent"
        : b < Math.abs(a - c)
          ? "contained"
          : b === Math.abs(a - c)
            ? "internal-tangent"
            : "crossing";
  const product = ((a + c) ** 2 - b * b) * (b * b - (a - c) ** 2),
    x = (size * (a * a + b * b - c * c)) / (2 * b * b),
    height = kind === "crossing" ? (size * Math.sqrt(product)) / (2 * b * b) : 0;
  const z = { x: 0, y: 0 },
    h = { x: size, y: 0 },
    k = kind === "crossing" || kind.endsWith("tangent") ? { x, y: side * height } : null;
  return {
    a: (size * a) / 100,
    b: size,
    c: (size * c) / 100,
    margins: margins.map((x) => (size * x) / 100),
    kind,
    z,
    h,
    k,
    other: k ? { x, y: -side * height } : null,
    delta: { x: (-size * a) / 100, y: 0 },
    theta: { x: size + (size * c) / 100, y: 0 },
    height,
    area: (size * height) / 2,
  };
}
const rad = (degrees: number) => (degrees * Math.PI) / 180;
function ray(at: Point, length: number, degrees: number): Point {
  return { x: at.x + length * Math.cos(rad(degrees)), y: at.y + length * Math.sin(rad(degrees)) };
}
export function copiedAngle(
  size: number,
  ratio: number,
  degrees: number,
  tilt: number,
  side: 1 | -1 = 1,
  reflected = false,
) {
  if (
    ![size, ratio, degrees, tilt].every(Number.isFinite) ||
    size <= 0 ||
    ratio <= 0 ||
    degrees <= 0 ||
    degrees >= 180
  )
    throw new RangeError("A genuine rectilinear angle and positive side choices are required.");
  const gamma = { x: 0, y: side * 2 * size },
    delta = ray(gamma, size, side * degrees),
    epsilon = ray(gamma, size * ratio, 0),
    a = { x: 0, y: 0 },
    b = ray(a, 1.7 * size, tilt * side),
    h = ray(a, size * ratio, tilt * side);
  // Compute the destination from three copied sides, not by reusing its given
  // angle. This is the I.22 subconstruction invoked by the source's proof.
  const first = distance(gamma, delta),
    second = distance(gamma, epsilon),
    base = distance(delta, epsilon);
  const x = (first * first + second * second - base * base) / (2 * second),
    heightSquared = first * first - x * x;
  const localY = side * (reflected ? -1 : 1) * Math.sqrt(Math.max(0, heightSquared)),
    theta = rad(tilt * side);
  const z = {
    x: x * Math.cos(theta) - localY * Math.sin(theta),
    y: x * Math.sin(theta) + localY * Math.cos(theta),
  };
  const copied =
    (Math.atan2(
      Math.abs((z.x - a.x) * (h.y - a.y) - (z.y - a.y) * (h.x - a.x)),
      (z.x - a.x) * (h.x - a.x) + (z.y - a.y) * (h.y - a.y),
    ) *
      180) /
    Math.PI;
  return {
    gamma,
    delta,
    epsilon,
    a,
    b,
    h,
    z,
    first,
    second,
    base,
    copied,
    sourceDegrees: degrees,
    margin: Math.min(first + second - base, first + base - second, second + base - first),
  };
}
