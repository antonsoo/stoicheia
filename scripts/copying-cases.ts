import { copiedAngle, courseTriangle } from "../src/core/copy-angle";
import { makeScene } from "../src/core/scene";
import { defaults } from "../src/core/state";

let count = 0;
for (const a of [20, 40, 65, 90, 100, 120, 140])
  for (const c of [30, 40, 60, 80, 100, 120, 140, 180])
    for (const side of [-1, 1] as const) {
      const m = courseTriangle(137, a, c, side);
      console.log(
        JSON.stringify({
          kind: "triangle",
          a,
          c,
          side,
          size: 137,
          model: m,
          scene: makeScene({
            ...defaults,
            proposition: 22,
            step: 7,
            ratio: a / 100,
            third: c / 100,
            side,
            size: 137,
          }),
        }),
      );
      count++;
    }
for (const ratio of [0.2, 0.65, 1, 1.15, 1.4])
  for (const opening of [20, 32, 64, 90, 120, 150])
    for (const tilt of [-45, -25, 0, 25, 45])
      for (const side of [-1, 1] as const)
        for (const reflected of [false, true]) {
          const m = copiedAngle(173, ratio, opening, tilt, side, reflected);
          console.log(
            JSON.stringify({
              kind: "angle",
              ratio,
              opening,
              tilt,
              side,
              reflected,
              size: 173,
              model: m,
              scene: makeScene({
                ...defaults,
                proposition: 23,
                step: 5,
                size: 173,
                ratio,
                angle: opening / 2,
                offset: tilt / 100,
                side,
                variant: reflected ? 1 : 0,
              }),
            }),
          );
          count++;
        }
if (count !== 712) throw new Error("Incomplete geometry generation");
