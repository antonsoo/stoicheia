export type Vec3 = readonly [number, number, number];
export function at<T>(items: readonly T[], index: number): T {
  const value = items[index];
  if (value === undefined) throw new Error(`Missing geometry item ${index}.`);
  return value;
}
export type SolidId =
  | "tetrahedron"
  | "octahedron"
  | "icosahedron"
  | "cube"
  | "dodecahedron"
  | "bipyramid";
export interface Mesh {
  id: SolidId;
  name: string;
  vertices: Vec3[];
  faces: number[][];
  edges: [number, number][];
}
export interface SolidState {
  p: number;
  q: number;
  yaw: number;
  pitch: number;
  vertex: number;
  example: "uniform" | "bipyramid";
  reading: number;
  page: number;
}
export const solidPages = [0, 4, 5, 54, 55, 56, 57, 58, 59, 336, 337, 338, 339, 340, 341] as const;
export const initialSolids: SolidState = {
  p: 3,
  q: 5,
  yaw: 25,
  pitch: 15,
  vertex: 0,
  example: "uniform",
  reading: 0,
  page: 336,
};
export const uniformCases: readonly { p: number; q: number; id: SolidId; name: string }[] = [
  { p: 3, q: 3, id: "tetrahedron", name: "Tetrahedron" },
  { p: 3, q: 4, id: "octahedron", name: "Octahedron" },
  { p: 3, q: 5, id: "icosahedron", name: "Icosahedron" },
  { p: 4, q: 3, id: "cube", name: "Cube" },
  { p: 5, q: 3, id: "dodecahedron", name: "Dodecahedron" },
];
export function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return Math.abs(a);
}
export function fraction(n: number, d = 1): string {
  const g = gcd(n, d);
  return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`;
}
/** All classifications use integer angle numerators; drawing tolerances cannot change the result. */
export function vertexTrial(p: number, q: number) {
  if (!Number.isInteger(p) || p < 3 || p > 12 || !Number.isInteger(q) || q < 2 || q > 8)
    throw new Error("Choose 3–12 sides and 2–8 faces at the vertex.");
  const angle = 180 * (p - 2),
    sum = q * angle,
    deficit = 360 * p - sum;
  const kind: "too-few" | "flat" | "excess" | "candidate" =
    q < 3 ? "too-few" : deficit === 0 ? "flat" : deficit < 0 ? "excess" : "candidate";
  return {
    p,
    q,
    angle: fraction(angle, p),
    sum: fraction(sum, p),
    deficit: fraction(deficit, p),
    rightAngles: fraction(sum, 90 * p),
    kind,
    solid: uniformCases.find((c) => c.p === p && c.q === q) ?? null,
  };
}
export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
export function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
export function mul(a: Vec3, s: number): Vec3 {
  return [a[0] * s, a[1] * s, a[2] * s];
}
export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
export function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
export function norm(a: Vec3): number {
  return Math.sqrt(dot(a, a));
}
export function unit(a: Vec3): Vec3 {
  return mul(a, 1 / norm(a));
}

const meshes = new Map<SolidId, Mesh>();
/** Supporting planes recover whole faces, rather than exposing a rendering triangulation as edges. */
export function solidMesh(id: SolidId): Mesh {
  const saved = meshes.get(id);
  if (saved) return saved;
  const phi = (1 + Math.sqrt(5)) / 2;
  let vertices: Vec3[] = [];
  if (id === "tetrahedron")
    vertices = [
      [1, 1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
    ];
  if (id === "cube" || id === "dodecahedron")
    for (const x of [-1, 1])
      for (const y of [-1, 1]) for (const z of [-1, 1]) vertices.push([x, y, z]);
  if (id === "octahedron")
    for (let k = 0; k < 3; k++)
      for (const sign of [-1, 1])
        vertices.push([k === 0 ? sign : 0, k === 1 ? sign : 0, k === 2 ? sign : 0]);
  if (id === "icosahedron" || id === "dodecahedron") {
    const a = id === "icosahedron" ? 1 : 1 / phi;
    for (const s of [-1, 1])
      for (const t of [-1, 1])
        vertices.push([0, s * a, t * phi], [s * a, t * phi, 0], [t * phi, 0, s * a]);
  }
  if (id === "bipyramid") {
    vertices = [
      [0, 0, Math.sqrt(2 / 3)],
      [0, 0, -Math.sqrt(2 / 3)],
    ];
    for (let k = 0; k < 3; k++)
      vertices.push([
        Math.cos((k * 2 * Math.PI) / 3) / Math.sqrt(3),
        Math.sin((k * 2 * Math.PI) / 3) / Math.sqrt(3),
        0,
      ]);
  } else vertices = vertices.map(unit);
  const planes = new Map<string, number[]>();
  for (let a = 0; a < vertices.length; a++)
    for (let b = a + 1; b < vertices.length; b++)
      for (let c = b + 1; c < vertices.length; c++) {
        const va = at(vertices, a),
          normal = cross(sub(at(vertices, b), va), sub(at(vertices, c), va));
        if (norm(normal) < 1e-8) continue;
        const n = unit(normal),
          distances = vertices.map((v) => dot(n, sub(v, va)));
        if (distances.some((d) => d > 1e-7) && distances.some((d) => d < -1e-7)) continue;
        const face = distances.flatMap((d, i) => (Math.abs(d) < 1e-7 ? [i] : []));
        planes.set(face.join(","), face);
      }
  const faces = [...planes.values()].map((indices) => {
    const centre = mul(
        indices.reduce<Vec3>((v, i) => add(v, at(vertices, i)), [0, 0, 0]),
        1 / indices.length,
      ),
      n = unit(centre),
      u = unit(sub(at(vertices, at(indices, 0)), centre)),
      v = cross(n, u);
    return indices.sort(
      (a, b) =>
        Math.atan2(dot(sub(at(vertices, a), centre), v), dot(sub(at(vertices, a), centre), u)) -
        Math.atan2(dot(sub(at(vertices, b), centre), v), dot(sub(at(vertices, b), centre), u)),
    );
  });
  const edgeMap = new Map<string, [number, number]>();
  for (const face of faces)
    for (let i = 0; i < face.length; i++) {
      const a = at(face, i),
        b = at(face, (i + 1) % face.length),
        pair: [number, number] = a < b ? [a, b] : [b, a];
      edgeMap.set(pair.join(","), pair);
    }
  const mesh: Mesh = {
    id,
    name:
      id === "bipyramid"
        ? "Triangular bipyramid"
        : (uniformCases.find((c) => c.id === id)?.name ?? id),
    vertices,
    faces,
    edges: [...edgeMap.values()],
  };
  meshes.set(id, mesh);
  return mesh;
}
export function selectedMesh(s: SolidState): Mesh | null {
  if (s.example === "bipyramid") return solidMesh("bipyramid");
  const c = vertexTrial(s.p, s.q).solid;
  return c ? solidMesh(c.id) : null;
}
export function vertexDegrees(m: Mesh): number[] {
  return m.vertices.map((_, i) => m.faces.filter((f) => f.includes(i)).length);
}
/** Conditional counts from Euler's relation; uniformity is checked, never inferred from one corner. */
export function uniformInference(m: Mesh, vertex: number) {
  const p = at(m.faces, 0).length,
    degrees = vertexDegrees(m),
    q = at(degrees, vertex);
  const numerator = 360 * p - q * 180 * (p - 2);
  if (numerator <= 0) throw new Error("A convex model must have a positive vertex deficit.");
  return {
    p,
    q,
    uniform: degrees.every((d) => d === q),
    deficit: fraction(numerator, p),
    conditional: {
      vertices: fraction(720 * p, numerator),
      edges: fraction(360 * p * q, numerator),
      faces: fraction(720 * q, numerator),
    },
    actual: { vertices: m.vertices.length, edges: m.edges.length, faces: m.faces.length },
    totalDeficit: fraction(
      degrees.reduce((sum, d) => sum + 360 * p - d * 180 * (p - 2), 0),
      p,
    ),
  };
}
export function validateSolids(value: unknown): SolidState {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a solid experiment object.");
  const v = value as Record<string, unknown>,
    keys = Object.keys(initialSolids);
  if (Object.keys(v).sort().join() !== keys.sort().join())
    throw new Error("The experiment has missing or unknown settings.");
  for (const k of ["p", "q", "yaw", "pitch", "vertex", "reading", "page"] as const)
    if (!Number.isInteger(v[k])) throw new Error(`${k} must be a whole number.`);
  const s = { ...v } as unknown as SolidState;
  vertexTrial(s.p, s.q);
  if (
    s.yaw < -180 ||
    s.yaw > 180 ||
    s.pitch < -70 ||
    s.pitch > 70 ||
    s.reading < 0 ||
    s.reading > 8 ||
    !solidPages.some((p) => p === s.page) ||
    !["uniform", "bipyramid"].includes(s.example)
  )
    throw new Error("The experiment contains an unsupported setting.");
  const count = selectedMesh(s)?.vertices.length ?? 1;
  if (s.vertex < 0 || s.vertex >= count)
    throw new Error("The selected vertex does not belong to this model.");
  return s;
}
export function encodeSolids(s: SolidState): string {
  validateSolids(s);
  return `?${new URLSearchParams(Object.entries(s).map(([k, v]) => [k, String(v)]))}`;
}
export function decodeSolids(search: string): SolidState {
  const p = new URLSearchParams(search),
    s = { ...initialSolids };
  for (const [k, v] of p) {
    if (!Object.hasOwn(s, k) || p.getAll(k).length !== 1)
      throw new Error("This link has unknown or repeated settings.");
    if (k === "example") s.example = v as SolidState["example"];
    else {
      if (!/^-?\d+$/.test(v)) throw new Error("Link settings must be whole numbers.");
      (s as unknown as Record<string, unknown>)[k] = Number(v);
    }
  }
  return validateSolids(s);
}
export function solidsJson(s: SolidState): string {
  return `${JSON.stringify(
    { format: "stoicheia-solids", version: 1, settings: validateSolids(s) },
    null,
    2,
  )}\n`;
}
export function readSolidsJson(text: string): SolidState {
  if (text.length > 12000) throw new Error("This experiment is too large (limit 12 KB).");
  const v = JSON.parse(text) as Record<string, unknown>;
  if (
    !v ||
    Array.isArray(v) ||
    Object.keys(v).sort().join() !== "format,settings,version" ||
    v.format !== "stoicheia-solids" ||
    v.version !== 1
  )
    throw new Error("Expected a version 1 Stoicheia solid experiment.");
  return validateSolids(v.settings);
}
export function solidsCsv(s: SolidState): string {
  const rows: string[][] = [
    [
      "scope",
      "face_sides_p",
      "faces_at_vertex_q",
      "angle_degrees_exact",
      "sum_degrees_exact",
      "deficit_degrees_exact",
      "result",
    ],
  ];
  for (let p = 3; p <= 12; p++)
    for (let q = 2; q <= 8; q++) {
      const t = vertexTrial(p, q);
      rows.push([
        p === s.p && q === s.q ? "selected and enumerated" : "enumerated, not a learner history",
        String(p),
        String(q),
        t.angle,
        t.sum,
        t.deficit,
        t.kind,
      ]);
    }
  const m = selectedMesh(s);
  if (m) {
    rows.push(
      [],
      ["mesh", "vertex", "incident_faces", "angle_sum_degrees_exact", "deficit_degrees_exact"],
    );
    vertexDegrees(m).forEach((q, i) => {
      const t = vertexTrial(at(m.faces, 0).length, q);
      rows.push([m.id, String(i + 1), String(q), t.sum, t.deficit]);
    });
  }
  return `${rows.map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(",")).join("\r\n")}\r\n`;
}
export function solidSourceFile(page: number): string {
  if (!solidPages.some((p) => p === page)) throw new Error("Unknown solid source page.");
  return `sources/solids/heiberg-${page === 0 ? "title" : page}.jpg`;
}
