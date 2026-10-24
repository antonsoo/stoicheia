import {
  complementModel,
  type GnomonState,
  gnomonModel,
  type Point,
  type Polygon,
} from "./core/gnomon";
import { formatMeasure as f } from "./core/quadrature";
import { escapeHtml as esc } from "./html";

const n = (v: number) => Number(v.toFixed(4));
function drawing(w: number, h: number, title: string, description: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><desc>${esc(description)}</desc>${body}</svg>`;
}
export function complementDrawing(state: GnomonState, narrow = false): string {
  const m = complementModel(state),
    w = narrow ? 360 : 760;
  const scale = (w - 84) / (10 + Math.abs(m.shear)),
    h = 6 * scale + 100;
  const at = (p: Point): Point => [42 + (p[0] - Math.min(0, m.shear)) * scale, 42 + p[1] * scale];
  const poly = (p: Polygon, cls: string) =>
    `<polygon class="${cls}" points="${p.map((v) => at(v).map(n).join(",")).join(" ")}"/>`;
  const line = (a: Point, b: Point, cls = "gn-line") =>
    `<line class="${cls}" x1="${n(at(a)[0])}" y1="${n(at(a)[1])}" x2="${n(at(b)[0])}" y2="${n(at(b)[1])}"/>`;
  const { A, B, G, D, E, T, Z, H, K } = m.points;
  let body = poly([A, B, G, D], "gn-outline");
  const step = m.onDiagonal ? state.step : 0;
  if (step === 1) body += poly([A, B, G], "gn-half-a") + poly([A, D, G], "gn-half-b");
  if (step !== 1) body += poly(m.left, "gn-complement-a") + poly(m.right, "gn-complement-b");
  if (step === 2 || step === 3)
    body += m.triangles
      .map((p, i) => poly(p, `gn-pair-${i < 2 ? 1 : 2}${step === 3 ? " gn-removed" : ""}`))
      .join("");
  body += line(A, G, "gn-diagonal") + line(E, Z) + line(T, H);
  const labels: readonly [string, Point, number, number][] = [
    ["Α", A, -11, -12],
    ["Β", B, -12, 23],
    ["Γ", G, 9, 23],
    ["Δ", D, 10, -12],
    ["Ε", E, -20, 6],
    ["Θ", T, 0, -12],
    ["Ζ", Z, 20, 6],
    ["Η", H, 0, 24],
    ["Κ", K, 13, m.v < 0.3 ? 23 : -11],
  ];
  body += labels
    .map(
      ([text, p, dx, dy]) =>
        `<text class="gn-label" text-anchor="middle" x="${n(at(p)[0] + dx)}" y="${n(at(p)[1] + dy)}">${text}</text>`,
    )
    .join("");
  body += `<circle class="gn-point" cx="${n(at(K)[0])}" cy="${n(at(K)[1])}" r="4"/>`;
  body += `<text class="gn-caption" text-anchor="middle" x="${w / 2}" y="${n(h - 10)}">${m.onDiagonal ? "Κ lies on the diagonal ΑΓ" : "Κ off ΑΓ · diagonal hypothesis absent"}</text>`;
  return drawing(
    w,
    h,
    "Equal complements in a parallelogram",
    `ΒΚ area ${f(m.leftArea)}; ΚΔ area ${f(m.rightArea)} square drawing units. ${m.onDiagonal ? "The point is on the diagonal." : "The point is off the diagonal; equal complements do not follow."}`,
    body,
  );
}
export function gnomonDrawing(state: GnomonState, narrow = false): string {
  const m = gnomonModel(state),
    w = narrow ? 360 : 760,
    scale = (w - 82) / (m.a + m.b),
    h = m.r * scale + 110;
  const at = (p: Point): Point => [40 + p[0] * scale, 40 + p[1] * scale];
  const poly = (p: Polygon, cls: string) =>
    `<polygon class="${cls}" points="${p.map((v) => at(v).map(n).join(",")).join(" ")}"/>`;
  const line = (a: Point, b: Point, cls = "gn-line") =>
    `<line class="${cls}" x1="${n(at(a)[0])}" y1="${n(at(a)[1])}" x2="${n(at(b)[0])}" y2="${n(at(b)[1])}"/>`;
  const p = m.points,
    r = m.regions;
  let body = poly(r.square, "gn-outline");
  const step = m.equal ? 0 : state.gstep;
  if (step === 0 || step === 1)
    body += poly(r.GT, "gn-complement-a") + poly(r.TZ, "gn-complement-b");
  if (step === 1) body += poly(r.DM, "gn-common");
  if (step === 2) body += poly(r.AL, "gn-complement-a") + poly(r.DZ, "gn-complement-b");
  if (step >= 3) body += poly(r.AT, "gn-rectangle") + poly(r.gnomon, "gn-complement-b");
  if (step >= 4) body += poly(r.LH, "gn-missing");
  if (step === 5) body += poly(r.square, "gn-final");
  for (const [a, b] of [
    ["A", "B"],
    ["A", "K"],
    ["K", "M"],
    ["G", "E"],
    ["D", "H"],
    ["E", "Z"],
    ["B", "Z"],
  ]) {
    const pa = p[a ?? ""],
      pb = p[b ?? ""];
    if (pa && pb) body += line(pa, pb);
  }
  if (p.B && p.E) body += line(p.B, p.E, "gn-diagonal");
  if (step >= 3) body += poly(r.AT, "gn-rectangle-outline");
  const offsets: Record<string, readonly [number, number]> = {
    A: [-5, -13],
    G: [-8, -13],
    D: [8, -13],
    B: [8, -13],
    K: [-15, 7],
    L: [-13, -10],
    T: [12, -10],
    M: [17, 6],
    E: [-10, 26],
    H: [9, 26],
    Z: [12, 26],
  };
  const names: Record<string, string> = {
    A: "Α",
    G: "Γ",
    D: "Δ",
    B: "Β",
    K: "Κ",
    L: "Λ",
    T: "Θ",
    M: "Μ",
    E: "Ε",
    H: "Η",
    Z: "Ζ",
  };
  const crowded = m.d * scale < 28 || m.b * scale < 28;
  for (const [key, point] of Object.entries(p)) {
    if (crowded && ["D", "L", "T", "H", "M"].includes(key)) continue;
    const offset = offsets[key];
    if (!offset) continue;
    body += `<text class="gn-label" text-anchor="middle" x="${n(at(point)[0] + offset[0])}" y="${n(at(point)[1] + offset[1])}">${names[key]}</text>`;
  }
  body += `<text class="gn-caption" text-anchor="middle" x="${w / 2}" y="${n(h - 22)}">ΑΔ = ${f(m.a)} · ΔΒ = ${f(m.b)} · ΓΔ = ${f(m.d)}</text>`;
  if (crowded)
    body += `<text class="gn-caption" text-anchor="middle" x="${w / 2}" y="${n(h - 5)}">Close labels omitted here; all points are listed below.</text>`;
  return drawing(
    w,
    h,
    "Euclid II.5: rectangle and gnomon",
    `The gnomon ΜΝΞ has area ${f(m.area)}. The missing square ΛΗ has area ${f(m.missing)}. Together they fill the square of area ${f(m.square)}.`,
    body,
  );
}
export function complementAccount(state: GnomonState): string {
  const m = complementModel(state),
    a = m.triangleAreas[0] ?? 0,
    b = m.triangleAreas[3] ?? 0;
  return `<table><caption>Areas in square drawing units</caption><thead><tr><th>Region</th><th>Area</th><th>Reason</th></tr></thead><tbody>
  <tr><th>Whole triangle ΑΒΓ</th><td>30</td><td>Half the parallelogram, I.34</td></tr>
  <tr><th>Whole triangle ΑΔΓ</th><td>30</td><td>The other half</td></tr>
  <tr><th>ΑΕΚ + ΚΗΓ</th><td>${f(a + b)}</td><td>${m.onDiagonal ? "One small triangle from each pair" : "Equal small pairs, but no longer aligned with ΑΓ"}</td></tr>
  <tr><th>ΒΚ</th><td>${f(m.leftArea)}</td><td>${m.onDiagonal ? `30 − ${f(a + b)}` : "Measured region; subtraction from that half is invalid"}</td></tr>
  <tr><th>ΚΔ</th><td>${f(m.rightArea)}</td><td>${m.onDiagonal ? `30 − ${f(a + b)}` : "The theorem's diagonal condition is absent"}</td></tr></tbody></table>`;
}
export function gnomonAccount(state: GnomonState): string {
  const m = gnomonModel(state);
  return `<table><caption>Follow the equal additions in II.5</caption><thead><tr><th>Step</th><th>Left account</th><th>Right account</th></tr></thead><tbody>
  <tr><th>Equal complements</th><td>ΓΘ: ${f(m.complementArea)}</td><td>ΘΖ: ${f(m.complementArea)}</td></tr>
  <tr><th>Add ΔΜ</th><td>ΓΜ: ${f(m.r * m.b)}</td><td>ΔΖ: ${f(m.r * m.b)}</td></tr>
  <tr><th>Replace ΓΜ with ΑΛ</th><td>ΑΛ: ${f(m.r * m.b)}</td><td>ΔΖ: ${f(m.r * m.b)}</td></tr>
  <tr><th>Add ΓΘ</th><td>ΑΘ: ${f(m.area)}</td><td>Gnomon ΜΝΞ: ${f(m.area)}</td></tr>
  <tr><th>Add ΛΗ</th><td>${f(m.area)} + ${f(m.missing)}</td><td>Whole square: ${f(m.square)}</td></tr></tbody></table>`;
}
export function gnomonPoints(state: GnomonState): string {
  const m = gnomonModel(state),
    names: Record<string, string> = {
      A: "Α",
      G: "Γ",
      D: "Δ",
      B: "Β",
      K: "Κ",
      L: "Λ",
      T: "Θ",
      M: "Μ",
      E: "Ε",
      H: "Η",
      Z: "Ζ",
    };
  return `<table><caption>Modern coordinates: Α is (0, 0), downward is positive y</caption><thead><tr><th>Point</th><th>x</th><th>y</th></tr></thead><tbody>${Object.entries(
    m.points,
  )
    .map(([k, p]) => `<tr><th>${names[k]}</th><td>${f(p[0])}</td><td>${f(p[1])}</td></tr>`)
    .join("")}</tbody></table>`;
}
