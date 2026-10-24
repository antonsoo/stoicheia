import { initialMesolabe, type MesolabeState, mesolabeModel } from "../src/core/mesolabe";

const cases: unknown[] = [];
function add(s: MesolabeState) {
  const { lineHeight: _, ...m } = mesolabeModel(s);
  cases.push({ state: s, model: m });
}
for (let i = 20; i <= 80; i++) {
  const s = { ...initialMesolabe, factor: i / 10 };
  for (let l = 0; l <= 9; l++)
    for (let q = 0; q <= 9; q++) add({ ...s, left: l / 10, right: q / 10 });
  for (let q = 0; q <= 9; q++) add({ ...s, right: q / 10, mode: "first" });
  add({ ...s, mode: "ideal" });
}
process.stdout.write(JSON.stringify(cases));
