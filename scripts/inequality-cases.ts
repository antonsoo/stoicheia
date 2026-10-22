import type { Point } from "../src/core/geometry";
import {
  inequalityTriangle,
  sideAngleConstruction,
  triangleInequality,
} from "../src/core/inequalities";
import { rigidMotion } from "../src/core/triangles";

for (const size of [1, 180, 10000])
  for (const side of [-1, 1] as const)
    for (const degrees of [20, 50, 90, 120, 150])
      for (const ratio of [0.2, 0.65, 1, 1.01, 1.25, 1.4])
        for (const rotation of [-133, 0, 47]) {
          const raw = inequalityTriangle(size, ratio, degrees, side);
          const transform = (v: Point) => rigidMotion(v, rotation, { x: 71, y: -39 });
          const [a, b, c] = [raw.a, raw.b, raw.c].map(transform) as [Point, Point, Point];
          if (ratio > 1)
            console.log(
              JSON.stringify({
                kind: "I.18",
                size,
                a,
                b,
                c,
                d: sideAngleConstruction(a, b, c, side).e,
              }),
            );
          for (const [x, y, z] of [
            [a, b, c],
            [b, a, c],
            [c, b, a],
          ] as const)
            console.log(
              JSON.stringify({
                kind: "I.20",
                size,
                a: x,
                b: y,
                c: z,
                d: triangleInequality(x, y, z, side).point,
              }),
            );
        }
