import { initialRatios, ratioTrial, scanRatios } from "../src/core/ratios";

const cases = [
  ...[1, 2, 69, 98, 99, 100, 238, 239, 600, 1000].map((bound) => ({
    ...initialRatios,
    bound,
  })),
  ...[
    [140, 99],
    [577, 408],
    [9999, 9999],
    [9998, 4999],
    [3, 2],
    [198, 140],
  ].flatMap(([p = 1, q = 1]) =>
    [30, 100, 600, 1000].map((bound) => ({ ...initialRatios, p, q, bound })),
  ),
  ...[1, 69, 1000].map((bound) => ({ ...initialRatios, kind: "scaled" as const, bound })),
  ...Array.from({ length: 32 }, (_, i) => {
    const q = 1 + ((i * 173) % 7000),
      p = q + ((i * 137) % (q + 1));
    return { ...initialRatios, p, q, bound: 1 + ((i * 43) % 120) };
  }),
];
for (const [index, s] of cases.entries()) {
  const state = { ...s, m: 1 + ((index * 139) % 1000), n: 1 + ((index * 197) % 1000) };
  const trial = ratioTrial(state);
  console.log(
    JSON.stringify({
      state,
      scan: scanRatios(state),
      trial: {
        first: trial.first,
        second: trial.second,
        agrees: trial.agrees,
        greater: trial.greater,
      },
    }),
  );
}
