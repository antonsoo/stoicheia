import { approximate, divisions, initialMeasure, type Length } from "../src/core/measure";

const serialize = (v: Length) => ({
  a: String(v.a),
  b: String(v.b),
  d: String(v.d),
  decimal: approximate(v),
});
function emit(kind: "fraction" | "diagonal", n: number, d: number) {
  console.log(
    JSON.stringify({
      kind,
      n,
      d,
      rows: divisions({ ...initialMeasure, kind, n, d }).map((r) => ({
        q: r.q,
        a: serialize(r.a),
        b: serialize(r.b),
        r: serialize(r.r),
      })),
    }),
  );
}
emit("diagonal", 577, 408);
for (let d = 1; d <= 100; d++) for (let n = d; n <= 2 * d; n++) emit("fraction", n, d);
for (const [n, d] of [
  [577, 408],
  [1393, 985],
  [10000, 9999],
  [19997, 9999],
  [19998, 9999],
] as const)
  emit("fraction", n, d);
let seed = 3917;
for (let i = 0; i < 400; i++) {
  seed = (seed * 48271) % 2147483647;
  const d = 1 + (seed % 9999);
  seed = (seed * 48271) % 2147483647;
  emit("fraction", d + (seed % (d + 1)), d);
}
