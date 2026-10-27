import { readFileSync } from "node:fs";
import {
  decodeSolids,
  encodeSolids,
  initialSolids,
  readSolidsJson,
  solidMesh,
  solidsCsv,
  solidsJson,
  uniformCases,
  uniformInference,
  validateSolids,
  vertexTrial,
} from "../src/core/solids";
import { tetrahedronSheet } from "../src/solids-drawing";

const cases = [];
for (let p = 3; p <= 12; p++) for (let q = 2; q <= 8; q++) cases.push(vertexTrial(p, q));
const rejected = [];
for (const change of [
  { p: 2 },
  { q: 1 },
  { q: 9 },
  { p: 3.1 },
  { yaw: 181 },
  { pitch: 71 },
  { vertex: 999 },
  { reading: 9 },
  { page: 335 },
  { example: "other" },
  { extra: 1 },
]) {
  let failed = false;
  try {
    validateSolids({ ...initialSolids, ...change });
  } catch {
    failed = true;
  }
  if (!failed) throw new Error(`Accepted unsupported settings ${JSON.stringify(change)}`);
  rejected.push(change);
}
for (const text of [
  '{"format":"other","version":1,"settings":{}}',
  "null",
  "[]",
  '{"format":"stoicheia-solids","version":2,"settings":{}}',
]) {
  let failed = false;
  try {
    readSolidsJson(text);
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Accepted an invalid record.");
}
for (const query of [
  "?q=3&q=4",
  "?p=3.1",
  "?p=100000000000000000000",
  "?unknown=1",
  "?__proto__=1",
]) {
  let failed = false;
  try {
    decodeSolids(query);
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Accepted an invalid link.");
}
for (const example of ["uniform", "bipyramid"] as const)
  for (const c of uniformCases) {
    const state = { ...initialSolids, p: c.p, q: c.q, example };
    if (
      JSON.stringify(decodeSolids(encodeSolids(state))) !== JSON.stringify(state) ||
      JSON.stringify(readSolidsJson(solidsJson(state))) !== JSON.stringify(state)
    )
      throw new Error("A valid experiment did not round trip.");
  }
process.stdout.write(
  JSON.stringify({
    cases,
    inferences: [...uniformCases.map((c) => c.id), "bipyramid" as const].map((id) => {
      const m = solidMesh(id);
      return { id, vertices: m.vertices.map((_, i) => uniformInference(m, i)) };
    }),
    meshes: [...uniformCases.map((c) => c.id), "bipyramid" as const].map(solidMesh),
    csv: solidsCsv({ ...initialSolids, example: "bipyramid", vertex: 2 }),
    sheet: tetrahedronSheet(readFileSync("LICENSE", "utf8")),
    rejected,
    source: JSON.parse(readFileSync("public/sources/solids/manifest.json", "utf8")),
  }),
);
