import {
  at,
  cross,
  dot,
  fraction,
  type Mesh,
  norm,
  type SolidState,
  solidMesh,
  sub,
  uniformCases,
  uniformInference,
  unit,
  type Vec3,
  vertexDegrees,
  vertexTrial,
} from "./core/solids";
import { escapeHtml as esc } from "./html";

const colors = [
  "#35637d",
  "#ae542f",
  "#758258",
  "#8d6392",
  "#b28734",
  "#4c8780",
  "#77594b",
  "#69799c",
];
const n = (v: number) => Number(v.toFixed(5));
export function solidConclusion(p: number, q: number): string {
  const t = vertexTrial(p, q);
  if (t.kind === "too-few")
    return "Two faces make a hinge. They do not enclose the solid corner defined in XI.11.";
  if (t.kind === "flat")
    return `${q} × ${t.angle}° = 360°. The faces use the full turn: this vertex lies flat.`;
  if (t.kind === "excess")
    return `${q} × ${t.angle}° = ${t.sum}°. The sum exceeds a full turn; it cannot be a convex polyhedral corner.`;
  if (!t.solid) throw new Error("Missing uniform example for an admitted vertex.");
  return `${q} × ${t.angle}° = ${t.sum}°. A ${t.deficit}° deficit passes the local angle test. A complete uniform example is the ${t.solid.name.toLowerCase()}.`;
}
export function solidFan(p: number, q: number): string {
  const angle = (Math.PI * (p - 2)) / p,
    shapes: number[][][] = [];
  for (let j = 0; j < q; j++) {
    const points: number[][] = [[0, 0]];
    let x = 0,
      y = 0;
    for (let k = 0; k < p - 1; k++) {
      x += Math.cos(j * angle + (k * 2 * Math.PI) / p);
      y += Math.sin(j * angle + (k * 2 * Math.PI) / p);
      points.push([x, y]);
    }
    shapes.push(points);
  }
  const all = shapes.flat(),
    xs = all.map((p) => at(p, 0)),
    ys = all.map((p) => at(p, 1)),
    minx = Math.min(...xs),
    maxx = Math.max(...xs),
    miny = Math.min(...ys),
    maxy = Math.max(...ys),
    scale = Math.min(450 / (maxx - minx), 330 / (maxy - miny));
  const pos = (v: readonly number[]) => [
      n(300 + (at(v, 0) - (minx + maxx) / 2) * scale),
      n(220 - (at(v, 1) - (miny + maxy) / 2) * scale),
    ],
    origin = pos([0, 0]);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" role="img" aria-label="${esc(`${q} regular ${p}-sided faces cut open at one vertex. ${solidConclusion(p, q)}`)}"><title>Equal regular faces, laid in one plane</title>${shapes.map((points, i) => `<polygon points="${points.map((v) => pos(v).join(",")).join(" ")}" fill="${colors[i]}" fill-opacity=".15" stroke="${colors[i]}" stroke-width="2"/><text x="${pos(points.reduce((a, v) => [at(a, 0) + at(v, 0) / p, at(a, 1) + at(v, 1) / p], [0, 0]))[0]}" y="${pos(points.reduce((a, v) => [at(a, 0) + at(v, 0) / p, at(a, 1) + at(v, 1) / p], [0, 0]))[1]}" text-anchor="middle" font-size="19" fill="${colors[i]}">${i + 1}</text>`).join("")}<circle cx="${origin[0]}" cy="${origin[1]}" r="5" fill="#222d35"/><text x="${at(origin, 0) + 9}" y="${at(origin, 1) - 9}" font-size="17">O</text><text x="24" y="427" font-size="13">${esc(`${q} faces · ${fraction(180 * (p - 2), p)}° at O on each face`)}</text></svg>`;
}
function rotate(v: Vec3, yaw: number, pitch: number): Vec3 {
  const a = (yaw * Math.PI) / 180,
    b = (pitch * Math.PI) / 180,
    x = v[0] * Math.cos(a) + v[2] * Math.sin(a),
    z = -v[0] * Math.sin(a) + v[2] * Math.cos(a);
  return [x, v[1] * Math.cos(b) - z * Math.sin(b), v[1] * Math.sin(b) + z * Math.cos(b)];
}
export function solidPlate(
  m: Mesh,
  yaw: number,
  pitch: number,
  vertex: number,
  showVertex = true,
): string {
  const front = unit(at(m.vertices, vertex)),
    trialRight = cross([0, 1, 0], front),
    right = unit(norm(trialRight) < 1e-8 ? cross([1, 0, 0], front) : trialRight),
    up = cross(front, right),
    points = m.vertices.map((v) => rotate([dot(v, right), dot(v, up), dot(v, front)], yaw, pitch)),
    pos = (v: Vec3) => `${n(300 + v[0] * 170)},${n(215 - v[1] * 170)}`;
  const faces = m.faces
    .map((f, i) => ({ f, i, depth: f.reduce((s, j) => s + at(points, j)[2] / f.length, 0) }))
    .sort((a, b) => a.depth - b.depth);
  const selected = at(points, vertex),
    q = at(vertexDegrees(m), vertex),
    t = vertexTrial(at(m.faces, 0).length, q);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" role="img" aria-label="${esc(`${m.name}: ${m.faces.length} faces, ${m.edges.length} edges, ${m.vertices.length} vertices. Selected vertex ${vertex + 1}: ${q} faces, sum ${t.sum} degrees, deficit ${t.deficit} degrees.`)}"><title>${esc(m.name)} · orthographic coordinate model</title>${faces.map(({ f, i }) => `<polygon data-face="${i}" points="${f.map((j) => pos(at(points, j))).join(" ")}" fill="${f.includes(vertex) && showVertex ? "#cedde3" : "#f6f1e7"}" stroke="#52616c" stroke-width="1.5"/>`).join("")}${showVertex ? `<circle cx="${n(300 + selected[0] * 170)}" cy="${n(215 - selected[1] * 170)}" r="7" fill="#ac4e2f" stroke="#fff" stroke-width="2"/><text x="${n(314 + selected[0] * 170)}" y="${n(208 - selected[1] * 170)}" fill="#963d22" font-size="17">${vertex + 1}</text>` : ""}<text x="24" y="427" font-size="13">${esc(m.name)} · F ${m.faces.length} / E ${m.edges.length} / V ${m.vertices.length}</text></svg>`;
}
export function solidsMatrix(): string {
  return `<table><caption>Uniform vertex candidates: regular p-sided faces, q at every vertex</caption><thead><tr><th scope="col">Face</th>${[2, 3, 4, 5, 6].map((q) => `<th scope="col">${q} at O</th>`).join("")}</tr></thead><tbody>${[
    3, 4, 5, 6,
  ]
    .map(
      (p) =>
        `<tr><th scope="row">${p} sides · ${vertexTrial(p, 3).angle}°</th>${[2, 3, 4, 5, 6]
          .map((q) => {
            const t = vertexTrial(p, q);
            return `<td><button type="button" data-sl-case="${p},${q}" class="sl-case-${t.kind}" aria-label="${p} sides, ${q} faces: ${t.solid?.name ?? t.kind}">${esc(t.solid?.name ?? { "too-few": "Hinge", flat: "Flat", excess: "Excess", candidate: "Candidate" }[t.kind])}<small>${t.sum}°</small></button></td>`;
          })
          .join("")}</tr>`,
    )
    .join("")}</tbody></table>`;
}
export function solidsVertexTable(m: Mesh): string {
  return `<table><caption>Actual face incidences in the ${esc(m.name.toLowerCase())}</caption><thead><tr><th scope="col">Vertex</th><th scope="col">Faces at it</th><th scope="col">Face-angle sum</th><th scope="col">Deficit</th></tr></thead><tbody>${vertexDegrees(
    m,
  )
    .map((q, i) => {
      const t = vertexTrial(at(m.faces, 0).length, q);
      return `<tr><th scope="row">${i + 1}</th><td>${q}</td><td>${t.sum}°</td><td>${t.deficit}°</td></tr>`;
    })
    .join("")}</tbody></table>`;
}
/** Two four-face tetrahedron nets, one marked shared base each. Tape outside edges; no untested glue tabs. */
export function tetrahedronSheet(license: string): string {
  const h = 20 * Math.sqrt(3);
  const net = (y: number, label: string) =>
    `<g transform="translate(44 ${y})"><path d="M -20 ${n(h)} L 20 ${n(-h)} L 60 ${n(h)} Z" fill="none" stroke="#222" stroke-width=".35"/><path d="M 0 0 L 40 0 L 20 ${n(h)} Z" fill="#dfe9ed" stroke="#222" stroke-dasharray="2 1.3" stroke-width=".25"/><text x="20" y="${n(h / 2)}" text-anchor="middle" font-size="3.5">SHARED BASE</text><text x="20" y="${n(-h - 6)}" text-anchor="middle" font-size="4">${label} · 40 mm edges</text></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297"><title>Two tetrahedra, six outside faces · Stoicheia cutting sheet</title><metadata>${esc(license)}</metadata><rect width="210" height="297" fill="white"/><g font-family="sans-serif" fill="#222"><text x="15" y="16" font-size="5">Two tetrahedra. One hidden face pair.</text><text x="15" y="25" font-size="3.3">Print at 100%. Check the 50 mm bar before cutting.</text>${net(80, "TETRAHEDRON A")}${net(177, "TETRAHEDRON B")}<path d="M 130 48 h 50 m -50 -2 v 4 m 50 -4 v 4" stroke="#222" stroke-width=".4"/><text x="155" y="43" text-anchor="middle" font-size="3.5">50 mm</text><text x="117" y="79" font-size="3.2"><tspan x="117">Solid boundary: cut.</tspan><tspan x="117" dy="6">Dashed lines: crease.</tspan><tspan x="117" dy="6">Fold each outer face up;</tspan><tspan x="117" dy="6">tape the free edges.</tspan><tspan x="117" dy="6">Make two tetrahedra.</tspan></text><text x="117" y="175" font-size="3.2"><tspan x="117">Place the shaded bases</tspan><tspan x="117" dy="6">together, tips on opposite</tspan><tspan x="117" dy="6">sides. Tape the join.</tspan><tspan x="117" dy="6">Count six outside faces.</tspan><tspan x="117" dy="6">Compare tips and belt.</tspan></text><text x="15" y="239" font-size="3.3">Each net has four equilateral triangles. The joined solid has six exterior faces:</text><text x="15" y="246" font-size="3.3">the two shaded base faces are internal. Tips meet three faces; belt vertices meet four.</text><text x="15" y="259" font-size="3.3">Modern coordinate-based teaching sheet; not an ancient folding instruction.</text><text x="15" y="266" font-size="3.3">Geometric dimensions verified in software; physical assembly and printing unverified.</text><text x="15" y="283" font-size="3">MIT · Copyright (c) 2026 Anton Soloviev · antonsoo.github.io/stoicheia/solids.html</text></g></svg>`;
}
export function solidsComparison(s: SolidState): string {
  const c = vertexTrial(s.p, s.q).solid,
    m = c ? solidMesh(c.id) : null,
    b = solidMesh("bipyramid");
  return `<div class="sl-comparison"><figure><h3>${m ? esc(m.name) : "No convex uniform example for this choice"}</h3>${m ? solidPlate(m, s.yaw, s.pitch, s.example === "uniform" ? s.vertex : 0) : solidFan(s.p, s.q)}<figcaption>${m ? `${m.faces.length} congruent regular faces. Every vertex has ${s.q} incident faces.` : esc(solidConclusion(s.p, s.q))}</figcaption></figure><figure><h3>Two joined tetrahedra</h3>${solidPlate(b, s.yaw, s.pitch, s.example === "bipyramid" ? s.vertex : 0)}<figcaption>Six equal equilateral outside faces. Two tips have three incident faces; three belt vertices have four. The joined base pair is inside.</figcaption></figure></div>`;
}
export function meshMetrics(m: Mesh): string {
  const edges = m.edges.map(([a, b]) =>
    Math.sqrt(
      dot(sub(at(m.vertices, a), at(m.vertices, b)), sub(at(m.vertices, a), at(m.vertices, b))),
    ),
  );
  return `Edge lengths: ${Math.min(...edges).toFixed(6)}–${Math.max(...edges).toFixed(6)} coordinate units; F − E + V = ${m.faces.length - m.edges.length + m.vertices.length}. Rounded coordinates illustrate the construction; the angle classification uses exact integer arithmetic.`;
}
export function inferenceReading(m: Mesh, vertex: number): string {
  const t = uniformInference(m, vertex);
  return `<h3>Can this one corner count the whole solid?</h3><p>If every vertex had this same ${t.deficit}° deficit, the modern 720° total-deficit relation would give V = 720 / ${t.deficit} = ${t.conditional.vertices}. Counting each edge at its two endpoints gives E = qV/2; counting each face at its p corners gives F = qV/p.</p><table><caption>Conditional uniform counts and the actual ${esc(m.name.toLowerCase())}</caption><thead><tr><th scope="col">Count</th><th scope="col">If every vertex matched</th><th scope="col">Actual model</th></tr></thead><tbody><tr><th scope="row">Vertices V</th><td>${t.conditional.vertices}</td><td>${t.actual.vertices}</td></tr><tr><th scope="row">Edges E</th><td>${t.conditional.edges}</td><td>${t.actual.edges}</td></tr><tr><th scope="row">Faces F</th><td>${t.conditional.faces}</td><td>${t.actual.faces}</td></tr></tbody></table><p>${t.uniform ? "Every vertex of this model does have that deficit. The counts agree. This calculation still does not construct the solid or establish its uniqueness." : "The uniformity condition fails in the bipyramid. Selecting a tip conditionally predicts four vertices; selecting a belt vertex predicts six. The actual solid has five. A local corner cannot supply the missing global condition."}</p><p class="sl-fine">Modern explanation, not part of the selected ancient passage: a closed convex polyhedron satisfies V − E + F = 2. Summing the face angles gives Σδ = 360V − 180(2E − 2F) = 720°. This model’s actual deficits total ${t.totalDeficit}°. The total does not require all vertices to be alike.</p>`;
}
export function uniformSummary(): string {
  return uniformCases.map((c) => `${c.name}: p=${c.p}, q=${c.q}`).join("; ");
}
