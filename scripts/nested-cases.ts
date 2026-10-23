import { inequalityTriangle } from "../src/core/inequalities";
import { nestedTriangle } from "../src/core/nested";

for (const size of [100, 180, 240])
  for (const ratio of [0.2, 0.65, 1.4])
    for (const angle of [20, 50, 90, 150])
      for (const side of [-1, 1] as const)
        for (const e of [0.1, 0.55, 0.9])
          for (const d of [0.1, 0.55, 0.9]) {
            const { a, b, c } = inequalityTriangle(size, ratio, angle, side);
            console.log(
              JSON.stringify({
                size,
                ratio,
                angle,
                side,
                e,
                d,
                result: nestedTriangle(a, b, c, e, d),
              }),
            );
          }
