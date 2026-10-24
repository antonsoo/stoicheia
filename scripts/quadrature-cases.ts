import { movedPiece, quadratureDefault, quadratureModel } from "../src/core/quadrature";

for (let a = 10; a <= 160; a++)
  for (let b = 10; b <= 160; b++) {
    const model = quadratureModel({ a, b });
    console.log(JSON.stringify({ kind: "construction", a, b, ...model }));
  }
for (const [a, b] of [
  [90, 40],
  [160, 10],
  [10, 160],
  [160, 159],
  [65, 65],
]) {
  for (let move = 0; move <= 100; move++) {
    const state = { ...quadratureDefault, a: a ?? 90, b: b ?? 40, move };
    console.log(JSON.stringify({ kind: "piece", a, b, move, points: movedPiece(state) }));
  }
}
