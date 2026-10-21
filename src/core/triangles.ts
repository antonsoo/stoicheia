import { add, cutOff, distance, type Point, scale, subtract } from "./geometry";

export const radians = (degrees: number): number => (degrees * Math.PI) / 180;
export const degrees = (radians: number): number => (radians * 180) / Math.PI;

/** Interior angle at vertex, measured by cross/dot rather than a rounded cosine. */
export function angleAt(first: Point, vertex: Point, last: Point): number {
  const u = subtract(first, vertex);
  const v = subtract(last, vertex);
  if (distance(first, vertex) === 0 || distance(last, vertex) === 0)
    throw new RangeError("An angle needs two nonzero rays.");
  return degrees(Math.atan2(Math.abs(u.x * v.y - u.y * v.x), u.x * v.x + u.y * v.y));
}

export function area(a: Point, b: Point, c: Point): number {
  const u = subtract(b, a);
  const v = subtract(c, a);
  return Math.abs(u.x * v.y - u.y * v.x) / 2;
}

/** Rotation about the origin followed by translation; never interpolates vertices. */
export function rigidMotion(p: Point, rotation: number, translation: Point): Point {
  const theta = radians(rotation);
  return add(
    {
      x: p.x * Math.cos(theta) - p.y * Math.sin(theta),
      y: p.x * Math.sin(theta) + p.y * Math.cos(theta),
    },
    translation,
  );
}

export function congruentPair(
  length: number,
  ratio: number,
  included: number,
  side: 1 | -1,
  progress: number,
) {
  const a = { x: 0, y: 0 };
  const b = { x: length, y: 0 };
  const c = {
    x: length * ratio * Math.cos(radians(included)),
    y: side * length * ratio * Math.sin(radians(included)),
  };
  const rotation = side * -24;
  const translation = { x: length * 2.05, y: side * length * 0.3 };
  const target = [a, b, c].map((p) => rigidMotion(p, rotation, translation)) as [
    Point,
    Point,
    Point,
  ];
  const moving = [a, b, c].map((p) =>
    rigidMotion(p, rotation * progress, scale(translation, progress)),
  ) as [Point, Point, Point];
  return { source: [a, b, c] as [Point, Point, Point], target, moving };
}

/** I.5: H is obtained from I.3, not from reflecting Z across the picture. */
export function isoscelesBridge(
  length: number,
  halfAngle: number,
  extension: number,
  side: 1 | -1,
) {
  const dx = length * Math.sin(radians(halfAngle));
  const height = length * Math.cos(radians(halfAngle)) * side;
  const a = { x: 0, y: height };
  const b = { x: -dx, y: 0 };
  const c = { x: dx, y: 0 };
  const onRay = (point: Point, factor: number) => add(a, scale(subtract(point, a), factor));
  const z = onRay(b, 1 + extension);
  const d = onRay(b, 1 + extension + 0.25);
  const e = onRay(c, 1 + extension + 0.25);
  const h = cutOff(a, e, a, z, side).e;
  return { a, b, c, d, e, z, h };
}

/** A scalene counter-supposition sketch, explicitly NOT satisfying equal base angles. */
export function unequalSketch(length: number, halfAngle: number, ratio: number, side: 1 | -1) {
  const half = radians(halfAngle);
  const a = { x: 0, y: side * length * Math.cos(half) };
  const b = { x: -length * Math.sin(half), y: 0 };
  const c = add(a, {
    x: length * ratio * Math.sin(half),
    y: -side * length * ratio * Math.cos(half),
  });
  const d = cutOff(b, a, a, c, side).e;
  return { a, b, c, d };
}
