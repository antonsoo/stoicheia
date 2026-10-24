import { complementModel, gnomonModel } from "../src/core/gnomon";

for (let u = 15; u <= 85; u++)
  for (let v = 15; v <= 85; v++)
    for (const shear of [-40, -20, 0, 20, 40]) {
      const state = { u, v, shear, diagonal: false };
      console.log(JSON.stringify({ kind: "complement", state, model: complementModel(state) }));
    }
for (let a = 10; a <= 160; a++)
  for (let b = 10; b <= 160; b++)
    console.log(JSON.stringify({ kind: "gnomon", state: { a, b }, model: gnomonModel({ a, b }) }));
