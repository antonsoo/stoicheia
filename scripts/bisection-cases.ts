import {
  bisectAngle,
  bisectSegment,
  radialCandidate,
  triangleFromSides,
} from "../src/core/bisection";
import type { Point } from "../src/core/geometry";
import { radians, rigidMotion } from "../src/core/triangles";

const emit = (case_: unknown) => console.log(JSON.stringify(case_));
for (const size of [100, 180, 240])
  for (const side of [-1, 1] as const) {
    for (const included of [20, 50, 58, 60, 62, 90, 150])
      for (const rotation of [-133, 0, 47]) {
        const transform = (p: Point) => rigidMotion(p, rotation, { x: 71, y: -39 });
        const a = transform({ x: 0, y: 0 });
        const b = transform({ x: size, y: 0 });
        const c = transform({
          x: 1.25 * size * Math.cos(radians(included)),
          y: side * 1.25 * size * Math.sin(radians(included)),
        });
        for (const fraction of [0.1, 0.55, 0.9])
          emit({
            kind: "I.9",
            size,
            side,
            included,
            rotation,
            fraction,
            ...bisectAngle(a, b, c, size * fraction),
          });
        emit({ kind: "I.10", size, side, rotation, ...bisectSegment(a, b, side) });
      }
    for (const ab of [1])
      for (const ac of [0.2, 0.65, 1, 1.4])
        for (const bc of [0.3, 0.8, 1.2, 1.8]) {
          const lengths = [size * ab, size * ac, size * bc];
          try {
            emit({
              kind: "I.8",
              percentages: [100, Math.round(ac * 100), Math.round(bc * 100)],
              lengths,
              side,
              ...triangleFromSides(
                lengths[0] as number,
                lengths[1] as number,
                lengths[2] as number,
                side,
              ),
            });
          } catch {
            emit({
              kind: "I.8-rejected",
              percentages: [100, Math.round(ac * 100), Math.round(bc * 100)],
              lengths,
              side,
            });
          }
        }
    for (const included of [20, 50, 90, 150])
      for (const ratio of [0.2, 0.65, 1.4])
        for (const turn of [0, 1, 12, Math.min(70, Math.floor(included * 0.65))])
          for (const mirror of [false, true]) {
            const c = {
              x: size * (1 + ratio * 0.25) * Math.cos(radians(included)),
              y: side * size * (1 + ratio * 0.25) * Math.sin(radians(included)),
            };
            emit({
              kind: "I.7",
              size,
              side,
              included,
              ratio,
              turn,
              mirror,
              ...radialCandidate({ x: 0, y: 0 }, { x: size, y: 0 }, c, -side * turn, mirror),
            });
          }
  }

// Exact decimal percentage boundaries at sizes that expose binary roundoff.
for (const size of [101, 109, 119, 143, 239])
  for (const side of [-1, 1] as const)
    for (const ac of [20, 65, 100, 140])
      for (const bc of [30, 80, 120, 180]) {
        const lengths = [size, size * (ac / 100), size * (bc / 100)];
        const percentages = [100, ac, bc];
        try {
          emit({
            kind: "I.8",
            lengths,
            percentages,
            side,
            ...triangleFromSides(
              lengths[0] as number,
              lengths[1] as number,
              lengths[2] as number,
              side,
            ),
          });
        } catch {
          emit({ kind: "I.8-rejected", lengths, percentages, side });
        }
      }
