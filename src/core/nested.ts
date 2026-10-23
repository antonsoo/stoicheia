import { add, distance, type Point, scale, subtract } from "./geometry";
import { angleAt, area } from "./triangles";

/** I.21: E is on AC; D lies strictly between B and E. */
export function nestedTriangle(a: Point, b: Point, c: Point, alongAC: number, alongBE: number) {
  if (
    ![a.x, a.y, b.x, b.y, c.x, c.y, alongAC, alongBE].every(Number.isFinite) ||
    alongAC <= 0 ||
    alongAC >= 1 ||
    alongBE <= 0 ||
    alongBE >= 1 ||
    area(a, b, c) === 0
  )
    throw new RangeError(
      "I.21 needs a nondegenerate triangle and a strictly interior meeting point.",
    );
  const e = add(a, scale(subtract(c, a), alongAC));
  const d = add(b, scale(subtract(e, b), alongBE));
  const outer = distance(b, a) + distance(a, c);
  const middle = distance(b, e) + distance(e, c);
  const inner = distance(b, d) + distance(d, c);
  const outerAngle = angleAt(b, a, c);
  const middleAngle = angleAt(c, e, b);
  const innerAngle = angleAt(b, d, c);
  return {
    a,
    b,
    c,
    d,
    e,
    outer,
    middle,
    inner,
    outerAngle,
    middleAngle,
    innerAngle,
    firstExcess: distance(a, b) + distance(a, e) - distance(b, e),
    secondExcess: distance(c, e) + distance(e, d) - distance(c, d),
  };
}
