import { measure as f, type MesolabeState, mesolabeModel, type Point } from "./core/mesolabe";
import { escapeHtml as esc } from "./html";

export function machineDrawing(state: MesolabeState, narrow = false): string {
  const m = mesolabeModel(state);
  const map = ([x, y]: Point): Point =>
    narrow ? [238 - 165 * y, 65 + 165 * x] : [48 + 210 * x, 64 + 210 * (1 - y)];
  const xy = (p: Point) => map(p).join(",");
  const line = (a: Point, b: Point, cls = "") =>
    `<line x1="${map(a)[0]}" y1="${map(a)[1]}" x2="${map(b)[0]}" y2="${map(b)[1]}" class="${cls}"/>`;
  const panel = (left: number, cls: string, plate?: "left" | "right") => {
    const corners: Point[] = [
      [left, 1],
      [left + 1, 1],
      [left + 1, 0],
      [left, 0],
    ];
    return `<g class="ml-panel ${cls}" ${plate ? `data-plate="${plate}"` : ""}><polygon points="${corners.map(xy).join(" ")}"/>${line([left, 1], [left + 1, 0], "ml-diagonal")}</g>`;
  };
  const grip = (plate: "left" | "right", x: number) => {
    const [cx, cy] = map([x, 0.48]);
    return `<g class="ml-ui-grip" data-plate="${plate}"><circle class="ml-grip" cx="${cx}" cy="${cy}" r="17"/><text class="ml-grip-label" x="${cx}" y="${cy + 5}" text-anchor="middle">${narrow ? "↕" : "↔"}</text></g>`;
  };
  const label = (name: string, p: Point, dx = 0, dy = 0, cls = "") => {
    const [x, y] = map(p);
    return `<text class="ml-point-label ${cls}" x="${x + dx}" y="${y + dy}">${name}</text>`;
  };
  const contact = (name: string, point: Point, index: number) => {
    const [x, y] = map(point);
    const onLine: Point = [point[0], m.lineHeight(point[0])];
    return `${line(point, onLine, "ml-mismatch")}<circle class="ml-contact" cx="${x}" cy="${y}" r="5"/>${label(name, point, narrow ? -25 : 8, narrow ? 5 : -12)}<circle class="ml-line-contact" cx="${map(onLine)[0]}" cy="${map(onLine)[1]}" r="3"/><title>${name}: signed vertical offset ${f((m.residuals[index] ?? 0) * 60)} mm in a chosen 60 mm frame</title>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${narrow ? "330 630" : "760 368"}" role="img" aria-label="Three sliding square plates, a fixed middle plate and a straightedge from Α to Δ" data-narrow="${narrow}"><title>The mesolabe: ${m.aligned ? "all four points aligned" : "trial alignment"}</title><desc>ΑΕ=${f(m.lengths[0] ?? 0)}, ΒΖ=${f(m.lengths[1] ?? 0)}, ΓΗ=${f(m.lengths[2] ?? 0)}, ΔΘ=1. ${narrow ? "The machine is turned ninety degrees clockwise for a phone." : "The two horizontal rails keep the plates parallel."} The orange line joins Α and Δ. Filled circles Β and Γ must both lie on it. Native sliders below operate the same plates.</desc>
  <g class="ml-rails">${line([0, 1], [3, 1])}${line([0, 0], [3, 0])}</g>
  ${panel(2 - m.q, "ml-right", "right")}${panel(1, "ml-middle")}${panel(m.p, "ml-left", "left")}
  ${grip("left", m.p + 0.5)}${grip("right", 2 + (1 - m.q) / 2)}
  <g class="ml-lengths">${line(m.points.A, m.points.E)}${line(m.points.B, m.points.Z)}${line(m.points.G, m.points.H)}${line(m.points.D, m.points.T)}</g>
  <g class="ml-straightedge">${line(m.points.A, m.points.D)}</g>
  ${contact("Β", m.points.B, 0)}${contact("Γ", m.points.G, 1)}
  ${label("Α", m.points.A, narrow ? -25 : -15, narrow ? 5 : -12)}${label("Ε", m.points.E, narrow ? 12 : -5, narrow ? 5 : 25)}
  ${label("Ζ", m.points.Z, narrow ? 12 : -5, narrow ? 5 : 25)}${label("Η", m.points.H, narrow ? 12 : -5, narrow ? 5 : 25)}
  ${label("Θ", m.points.T, narrow ? 12 : -5, narrow ? 5 : 25)}${label("Δ", m.points.D, narrow ? -25 : 10, narrow ? 5 : -5)}
  <text class="ml-diagram-note" x="${narrow ? 35 : 48}" y="${narrow ? 600 : 343}">${narrow ? "Same machine, turned 90° clockwise." : "Left plate above middle · right plate below middle · equal square panels"}</text></svg>`;
}

export function ratioTable(state: MesolabeState): string {
  const m = mesolabeModel(state);
  return `<table><caption>Four lengths in units of the original cube edge; read the last mean ΓΗ for the new edge.</caption><thead><tr><th>Length</th><th>Given / contact</th><th>Value</th><th>Ratio to next</th></tr></thead><tbody>${["a · ΑΕ", "b · ΒΖ", "c · ΓΗ", "d · ΔΘ"].map((s, i) => `<tr><th scope="row">${s}</th><td>${i === 0 || i === 3 ? "Given" : "Exposed contact"}</td><td>${f(m.lengths[i] ?? 0)}</td><td>${i < 3 ? f(m.ratios[i] ?? 0, 7) : "—"}</td></tr>`).join("")}</tbody></table>`;
}

export function contactDrawing(state: MesolabeState, narrow = false): string {
  const m = mesolabeModel(state);
  const offsets = m.residuals.map((e) => e * 60);
  const extent =
    [0.5, 1, 2, 5, 10, 20, 50, 100].find((n) => n >= Math.max(...offsets.map(Math.abs)) * 1.1) ??
    100;
  const width = narrow ? 330 : 760,
    left = narrow ? 85 : 170,
    center = narrow ? 192 : 430,
    half = narrow ? 107 : 260,
    label = narrow ? 15 : 48;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 190" role="img" aria-label="Enlarged signed contact offsets with a common millimetre scale"><title>Enlarged contact detail; the orange ticks locate the straightedge</title><text class="ml-diagram-note" x="${label}" y="25">CONTACT DETAIL / CHOSEN 60 mm FRAME</text>${offsets.map((e, i) => `<text class="ml-point-label" x="${label}" y="${75 + i * 52}">${i === 0 ? "Β" : "Γ"}</text><line class="ml-detail-axis" x1="${left}" y1="${70 + i * 52}" x2="${center + half}" y2="${70 + i * 52}"/><line class="ml-detail-zero" x1="${center}" y1="${58 + i * 52}" x2="${center}" y2="${82 + i * 52}"/><line class="ml-detail-error" x1="${center}" y1="${70 + i * 52}" x2="${center + (e / extent) * half}" y2="${70 + i * 52}"/><circle class="ml-contact" cx="${center + (e / extent) * half}" cy="${70 + i * 52}" r="6"/>`).join("")}<text class="ml-diagram-note" x="${left}" y="164" text-anchor="middle">−${extent} mm</text><text class="ml-diagram-note" x="${center}" y="164" text-anchor="middle">0 / ruler</text><text class="ml-diagram-note" x="${center + half}" y="164" text-anchor="middle">+${extent} mm</text></svg>`;
}

export function proofDrawing(state: MesolabeState, narrow = false): string {
  const m = mesolabeModel(state),
    pts = m.points;
  if (!m.aligned)
    return `<p class="ml-proof-wait">The ratio proof needs both contacts on ΑΔ. Your present offsets are Β ${f((m.residuals[0] ?? 0) * 60)} mm and Γ ${f((m.residuals[1] ?? 0) * 60)} mm in the chosen 60 mm frame. The numerical candidates above remain measurements of this trial. Align both contacts to enable the proof.</p>`;
  const span = pts.K[0] - pts.A[0];
  const scale = narrow ? Math.min(150, 470 / span) : Math.min(180, 635 / span);
  const map = ([x, y]: Point): Point => [45 + (x - pts.A[0]) * scale, 225 - y * scale];
  const mapped = (p: Point): Point =>
    narrow ? [220 - p[1] * scale, 35 + (p[0] - pts.A[0]) * scale] : map(p);
  const poly = (names: (keyof typeof pts)[], cls: string) =>
    `<polygon class="${cls}" points="${names.map((n) => mapped(pts[n]).join(",")).join(" ")}"/>`;
  const line = (a: Point, b: Point, cls = "") =>
    `<line class="${cls}" x1="${mapped(a)[0]}" y1="${mapped(a)[1]}" x2="${mapped(b)[0]}" y2="${mapped(b)[1]}"/>`;
  const pairs: [keyof typeof pts, keyof typeof pts][] = [
    ["A", "E"],
    ["B", "Z"],
    ["G", "H"],
    ["D", "T"],
    ["A", "Z"],
    ["B", "H"],
    ["G", "T"],
    ["E", "K"],
    ["A", "K"],
  ];
  const labels = { A: "Α", E: "Ε", B: "Β", Z: "Ζ", G: "Γ", H: "Η", D: "Δ", T: "Θ", K: "Κ" };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${narrow ? `330 ${75 + span * scale}` : "730 270"}" role="img" aria-label="The complete aligned construction extended to Κ, with paired similar triangles"><title>Why the means share a ratio</title>${state.step === 1 ? poly(["A", "E", "K"], "ml-proof-one") + poly(["B", "Z", "K"], "ml-proof-two") : ""}${state.step === 2 ? poly(["A", "Z", "K"], "ml-proof-one") + poly(["B", "H", "K"], "ml-proof-two") : ""}${state.step === 3 ? poly(["B", "H", "K"], "ml-proof-one") + poly(["G", "T", "K"], "ml-proof-two") : ""}<g class="ml-proof-lines">${pairs.map(([a, b]) => line(pts[a], pts[b])).join("")}</g>${Object.entries(
    labels,
  )
    .map(([key, name]) => {
      const p = mapped(pts[key as keyof typeof pts]);
      return `<text class="ml-point-label" x="${p[0] + (narrow ? (["E", "Z", "H", "T", "K"].includes(key) ? 12 : -25) : key === "K" ? 8 : -6)}" y="${p[1] + (narrow ? 5 : ["E", "Z", "H", "T"].includes(key) ? 25 : -9)}">${name}</text>`;
    })
    .join("")}</svg>`;
}

export function cubeDrawing(state: MesolabeState): string {
  const m = mesolabeModel(state),
    scale = 75 / Math.max(2, m.candidate);
  const cube = (x: number, edge: number, cls: string, title: string) => {
    const u = edge * scale,
      y = 135,
      k = 0.45 * u;
    return `<g class="${cls}"><path d="M${x},${y}v${-u}l${k},${-k}l${u},0v${u}l${-k},${k}Z"/><path d="M${x},${y - u}h${u}v${u}M${x + u},${y - u}l${k},${-k}"/><text x="${x}" y="173">${title}</text><text x="${x}" y="197">edge ${f(edge)}</text></g>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 220" role="img" aria-label="Three cubes drawn at a common edge scale: original, current candidate and double edge"><title>Changing an edge changes three dimensions</title>${cube(25, 1, "ml-cube-original", "Original")}${cube(210, m.candidate, "ml-cube-new", "Your ΓΗ")}${cube(395, 2, "ml-cube-double", "Double edge")}</svg>`;
}

/** A landscape A4 exploration sheet. The two loose squares are cut out;
 * the middle square remains printed in its frame. Physical accuracy is unverified. */
export function mesolabeTemplate(factor: number): string {
  const y = 180 - 60 / factor;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="297mm" height="210mm" viewBox="0 0 297 210" role="img"><title>Mesolabe paper exploration: ${esc(String(factor))} times the volume</title><desc>Print landscape at actual size, verify the 25 millimetre bar, cut the two lower squares, and place them in the upper frame. Keep the middle square fixed. Left plate goes above it, right below. Physical fabrication and printer scaling are unverified.</desc><style>text{font:3.3px sans-serif;fill:#193d60}path,line,rect{fill:none;stroke:#193d60;stroke-width:.3} .cut{stroke-dasharray:2 1}.diag{stroke-width:.5}.rule{stroke:#a84b29;stroke-width:.6}</style><text x="15" y="12" style="font-size:5px">STOICHEIA / SLIDING PLATES / VOLUME FACTOR ${esc(String(factor))}</text><text x="15" y="19">A modern paper exploration of the construction transmitted by Eutocius, Heiberg 1881, pp.106-113.</text><path d="M15 30H230M15 90H230"/><rect x="90" y="30" width="60" height="60"/><path class="diag" d="M90 30L150 90"/><text x="120" y="42">FIXED</text><text x="120" y="48">MIDDLE</text><text x="118" y="55">60 x 60 mm</text><text x="15" y="100">Hold both moving panels between the guides. All diagonals slope the same way.</text><text x="15" y="106">Align a straightedge from A through both exposed contacts B, G to D. Read G's height above the lower guide.</text><text x="15" y="112">For an original edge of 1 unit, divide that height by ${f(60 / factor, 6)} mm. Cube this ratio to check the volume.</text><rect class="cut" x="30" y="120" width="60" height="60"/><path class="diag" d="M30 120L90 180"/><text x="33" y="128">A</text><text x="33" y="157">LEFT / above middle</text><text x="33" y="174">E</text><text x="84" y="176">Z</text><rect class="cut" x="150" y="120" width="60" height="60"/><path class="diag" d="M150 120L210 180"/><text x="154" y="151">RIGHT</text><text x="154" y="157">below middle</text><path class="rule" d="M206 ${y}h8"/><text x="202" y="${y - 2}">D</text><text x="203" y="177">T</text><path d="M242 155v3m0-1.5h25m0-1.5v3"/><text x="242" y="164">25 mm calibration</text><text x="15" y="193">Cut dashed outlines only. Make a slit at the middle panel's upper and lower edges if needed to pass the right panel below it.</text><text x="15" y="199">Print at 100%, without fit-to-page. This is not a groove fabrication plan; physical assembly and accuracy are unverified.</text><metadata>MIT, Anton Soloviev, 2026. Source: https://www.wilbourhall.org/pdfs/Archimedes_VOL_III.pdf. Equal squares and 60 mm dimensions are modern choices.</metadata></svg>`;
}
