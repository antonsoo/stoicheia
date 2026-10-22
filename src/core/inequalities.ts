import { add, cutOff, type Point, subtract } from "./geometry";
import { copyOnRay } from "./right-angles";
import { radians } from "./triangles";

export function inequalityTriangle(length: number, ratio: number, included: number, side: 1 | -1) {
  const a = { x: 0, y: 0 };
  const b = { x: length, y: 0 };
  const c = {
    x: length * ratio * Math.cos(radians(included)),
    y: side * length * ratio * Math.sin(radians(included)),
  };
  return { a, b, c };
}

/** I.18 needs the cut point strictly inside the longer side. */
export function sideAngleConstruction(a: Point, b: Point, c: Point, side: 1 | -1) {
  return cutOff(a, c, a, b, side);
}

/** I.20 copies AC onto the ray continuing BA beyond A, using I.2. */
export function triangleInequality(a: Point, b: Point, c: Point, side: 1 | -1) {
  return copyOnRay(a, add(a, subtract(a, b)), a, c, side);
}
