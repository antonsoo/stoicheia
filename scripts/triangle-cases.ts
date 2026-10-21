import {
  angleAt,
  area,
  congruentPair,
  isoscelesBridge,
  unequalSketch,
} from "../src/core/triangles";

for (const length of [100, 180, 240]) {
  for (const angle of [10, 25, 45, 75]) {
    for (const ratio of [0.2, 0.65, 1, 1.4]) {
      for (const side of [-1, 1] as const) {
        for (const progress of [0, 0.17, 0.5, 0.83, 1]) {
          console.log(
            JSON.stringify({
              kind: "I.4",
              length,
              angle: 2 * angle,
              ratio,
              side,
              progress,
              ...congruentPair(length, ratio, 2 * angle, side, progress),
            }),
          );
        }
        const bridge = isoscelesBridge(length, angle, ratio, side);
        console.log(
          JSON.stringify({
            kind: "I.5",
            length,
            angle,
            ratio,
            side,
            ...bridge,
            angles: [
              angleAt(bridge.a, bridge.b, bridge.h),
              angleAt(bridge.c, bridge.b, bridge.h),
              angleAt(bridge.a, bridge.b, bridge.c),
            ],
          }),
        );
        const sketch = unequalSketch(length, angle, 0.55 + ratio * 0.25, side);
        console.log(
          JSON.stringify({
            kind: "I.6",
            length,
            angle,
            ratio: 0.55 + ratio * 0.25,
            side,
            ...sketch,
            areas: [area(sketch.d, sketch.b, sketch.c), area(sketch.a, sketch.b, sketch.c)],
          }),
        );
      }
    }
  }
}
