import type { Point } from "../src/core/geometry";
import {
  dropPerpendicular,
  exteriorConstruction,
  raisePerpendicular,
} from "../src/core/right-angles";
import { radians, rigidMotion } from "../src/core/triangles";

const emit = (data: unknown) => console.log(JSON.stringify(data));
for (const size of [1, 100, 180, 240, 10000])
  for (const side of [-1, 1] as const)
    for (const rotation of [-133, 0, 47]) {
      const transform = (p: Point) => rigidMotion(p, rotation, { x: 71, y: -39 });
      const a = transform({ x: -size, y: 0 }),
        b = transform({ x: size, y: 0 });
      for (const fraction of [0.1, 0.55, 0.9])
        emit({
          kind: "I.11",
          size,
          side,
          rotation,
          fraction,
          ...raisePerpendicular(a, b, transform({ x: size * (2 * fraction - 1), y: 0 }), side),
        });
      for (const height of [0.2, 0.65, 1.4])
        for (const offset of [-2, 0, 1.7])
          for (const depth of [0.3, 1.2, 1.8])
            for (const variant of [0, 1]) {
              const c = transform({ x: 0, y: side * size * height }),
                d = transform({ x: offset * size, y: (variant ? side : -side) * size * depth });
              emit({
                kind: "I.12",
                size,
                side,
                rotation,
                height,
                offset,
                depth,
                variant,
                ...dropPerpendicular(a, b, c, d, side),
              });
            }
      // Exact one-contact and zero-radius cases, after the same rigid transformations.
      for (const depth of [0.65, 1.3])
        emit({
          kind: "I.12",
          size,
          side,
          rotation,
          height: 0.65,
          offset: 0,
          depth,
          variant: 1,
          ...dropPerpendicular(
            a,
            b,
            transform({ x: 0, y: side * size * 0.65 }),
            transform({ x: 0, y: side * size * depth }),
            side,
          ),
        });
      for (const degrees of [20, 50, 90, 150])
        for (const ratio of [0.2, 0.65, 1.4]) {
          const first = transform({
            x: size * ratio * Math.cos(radians(degrees)),
            y: side * size * ratio * Math.sin(radians(degrees)),
          });
          emit({
            kind: "I.16",
            size,
            side,
            rotation,
            degrees,
            ratio,
            ...exteriorConstruction(
              first,
              transform({ x: 0, y: 0 }),
              transform({ x: size, y: 0 }),
              side,
            ),
          });
        }
    }
