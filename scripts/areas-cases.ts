import { type AreaState, areaModel, initialAreas, validateAreas } from "../src/core/areas";
import { exact } from "../src/core/circle";

for (const mode of ["short", "beyond"] as const)
  for (const base of [4, 5, 7, 12, 17, 23, 24])
    for (const shape of ["half", "equal", "double"] as const)
      for (const shear of [-60, 0, 60]) {
        const k = shape === "half" ? 0.5 : shape === "double" ? 2 : 1;
        for (const target of [
          "1/1000000",
          "27",
          "28",
          String((k * base * base) / 4),
          String((k * base * base) / 4 + 1),
          "4096",
        ])
          for (const trial of ["0", `${base}/4`, mode === "short" ? String(base) : "128"]) {
            const state: AreaState = validateAreas({
              ...initialAreas,
              mode,
              base,
              shape,
              shear,
              target,
              trial,
            });
            const m = areaModel(state);
            console.log(
              JSON.stringify({
                state,
                area: exact(m.area),
                residual: exact(m.residual),
                maximum: exact(m.maximum),
                discriminant: exact(m.discriminant),
                exactFit: m.exactFit,
                degenerate: m.degenerate,
                fits: m.fits.map((f) => ({
                  exact: f.exact ? exact(f.exact) : null,
                  lower: exact(f.lower),
                  upper: exact(f.upper),
                })),
              }),
            );
          }
      }
