import { type Alteration, audit, exact, printed } from "../src/core/circle";

function emit(alteration: Alteration | null): void {
  console.log(
    JSON.stringify({
      alteration,
      paths: Object.fromEntries(
        (["outer", "inner"] as const).map((branch) => [
          branch,
          audit(branch, alteration).map((r) => ({
            n: r.sides,
            a: exact(r.a),
            h: r.h ? exact(r.h) : null,
            radicand: r.radicand ? exact(r.radicand) : null,
            gap: r.squareGap ? exact(r.squareGap) : null,
            localSafe: r.localSafe,
            chainSafe: r.chainSafe,
            boundSafe: r.boundSafe,
            bound: exact(r.bound),
          })),
        ]),
      ),
    }),
  );
}
emit(null);
for (const branch of ["outer", "inner"] as const)
  for (const [row, p] of printed[branch].entries()) {
    for (const delta of [-1000000n, -250000n, -10000n, -1n, 0n, 1n, 10000n, 250000n, 1000000n]) {
      const n = p.value.n * 1000000n + delta * p.value.d,
        d = p.value.d * 1000000n;
      // Decimal steps are converted to at most six places before the core accepts them.
      const scaled = n / d;
      const remainder = n % d;
      const decimal = `${scaled}.${String((remainder * 1000000n) / d).padStart(6, "0")}`;
      emit({ branch, row, value: decimal });
    }
    for (const value of ["0.000001", "1000000"]) emit({ branch, row, value });
  }
