import { closureModel } from "../src/core/triangle-closure.ts";

const seen = new Set<string>();
const emit = (a: number, b: number, c: number) => {
  if ([a, b, c].some((n) => n < 10 || n > 120)) return;
  const key = [a, b, c].join(",");
  if (seen.has(key)) return;
  seen.add(key);
  process.stdout.write(`${JSON.stringify({ a, b, c, model: closureModel({ a, b, c }) })}\n`);
};
for (let a = 10; a <= 120; a += 5)
  for (let b = 10; b <= 120; b += 5) {
    for (let c = 10; c <= 120; c += 5) emit(a, b, c);
    for (const boundary of [a + b, Math.abs(a - b)])
      for (const delta of [-1, 0, 1]) emit(a, b, boundary + delta);
  }
