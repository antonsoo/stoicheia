import { exact } from "../src/core/circle";
import { hornWitness } from "../src/core/horn";

const trials: { rise: number; run: number }[] = [];
for (const run of [1, 2, 4, 10, 101, 1000, 999983, 1000000])
  for (const rise of [-run, -1, 0, 1, Math.floor(run / 2), run]) trials.push({ rise, run });
let seed = 17391;
for (let i = 0; i < 250; i++) {
  seed = (seed * 48271) % 2147483647;
  const run = 1 + (seed % 1000000);
  seed = (seed * 48271) % 2147483647;
  const rise = (seed % (2 * run + 1)) - run;
  trials.push({ rise, run });
}
for (const s of trials) {
  const w = hornWitness(s);
  console.log(
    JSON.stringify({
      ...s,
      relation: w.relation,
      foot: [exact(w.foot.x), exact(w.foot.y)],
      second: [exact(w.second.x), exact(w.second.y)],
      footParameter: exact(w.footParameter),
      secondParameter: exact(w.secondParameter),
      centreDistanceSquared: exact(w.centreDistanceSquared),
      deficit: exact(w.radiusSquaredMinusDistanceSquared),
    }),
  );
}
