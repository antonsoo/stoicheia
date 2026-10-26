import {
  CLOCK,
  initialQuadratrix,
  interceptDeficit,
  quadratrixMotion,
} from "../src/core/quadratrix.ts";

for (const timing of ["together", "rotation-first", "slider-first"] as const) {
  const ticks = new Set([0, 1, 499999, 500000, 899999, 900000, 900001, 999990, 999999, CLOCK]);
  for (let t = 0; t <= CLOCK; t += 997) ticks.add(t);
  for (const tick of ticks) {
    const state = { ...initialQuadratrix, timing, tick },
      motion = quadratrixMotion(state);
    console.log(
      JSON.stringify({
        state,
        motion,
        deficit:
          timing === "together" && tick < CLOCK ? interceptDeficit((CLOCK - tick) / CLOCK) : null,
      }),
    );
  }
}
