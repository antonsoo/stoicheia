import { exact } from "../src/core/circle";
import { intersectionModel, intersectionTrials } from "../src/core/intersection";

const cases: [number, number][] = [...intersectionTrials.map(([m, n]): [number, number] => [m, n])];
for (let m = 0; m <= 64; m++) for (let n = 1; n <= 64; n++) cases.push([m, n]);
for (const m of [0, 1, 564719, 999999, 1000000])
  for (const n of [1, 978122, 999999, 1000000]) cases.push([m, n]);
for (const [m, n] of cases) {
  const p = intersectionModel({ m, n, places: 6 });
  process.stdout.write(
    `${JSON.stringify({ m, n, x: exact(p.x), y: exact(p.y), first: exact(p.firstSquared), second: exact(p.secondSquared), residual: exact(p.residual), shown: p.shownLength, witness: String(p.witness) })}\n`,
  );
}
