import {
  formatMeasure as f,
  movedPiece,
  type QuadratureState,
  quadratureModel,
} from "./core/quadrature";
import { escapeHtml } from "./html";

const n = (v: number) => Number(v.toFixed(4));
export function areaConstruction(state: QuadratureState, narrow = false): string {
  const m = quadratureModel(state),
    w = narrow ? 360 : 760,
    maxHeight = narrow ? 330 : 480;
  const full = !m.equal && state.stage >= 1;
  const finalSquare = !m.equal && state.stage === 5;
  const extent = finalSquare ? m.long + m.height : full ? m.long + m.short : m.long;
  const top = full && state.stage >= 3 ? m.radius : m.short * 0.25;
  const scale = Math.min((w - 90) / extent, (maxHeight - 110) / (top + m.short));
  const h = Math.max(180, Math.ceil((top + m.short) * scale + 110));
  const x0 = (w - extent * scale) / 2,
    y0 = 42 + top * scale;
  const x = (v: number) => n(x0 + v * scale),
    y = (v: number) => n(y0 - v * scale);
  const line = (a: readonly number[], b: readonly number[], cls: string) =>
    `<line x1="${x(a[0] ?? 0)}" y1="${y(a[1] ?? 0)}" x2="${x(b[0] ?? 0)}" y2="${y(b[1] ?? 0)}" class="${cls}"/>`;
  const label = (a: readonly number[], text: string, dx: number, dy: number) =>
    `<text x="${n(x(a[0] ?? 0) + dx)}" y="${n(y(a[1] ?? 0) + dy)}" class="qa-point-label">${text}</text>`;
  const p = m.points;
  const circle =
    state.stage >= 3 && !m.equal
      ? `<path d="M${x(0)} ${y(0)} A${n(m.radius * scale)} ${n(m.radius * scale)} 0 0 1 ${x(m.long + m.short)} ${y(0)}" class="qa-circle"/>`
      : "";
  const join =
    state.stage >= 4 && !m.equal
      ? `${line(p.E, p.Theta, "qa-result-line")}${line(p.H, p.Theta, "qa-radius-line")}<path d="M${x(m.long) - 10} ${y(0)} v-10 h10" class="qa-angle"/>${label(p.Theta, "Θ", 4, -12)}<circle cx="${x(m.long)}" cy="${y(m.height)}" r="4" class="qa-result-dot"/>`
      : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="qa-construction-title qa-construction-desc"><title id="qa-construction-title">Euclid II.14: ${f(m.long)} by ${f(m.short)} rectangle</title><desc id="qa-construction-desc">${m.equal ? "The given rectangle is already a square. No semicircle is needed." : `Extend the long side by ${f(m.short)}. The midpoint gives radius ${f(m.radius)}. The perpendicular meets the semicircle at height ${f(m.height)}. Horizontal and vertical distances use the same scale.`}</desc>
  <rect x="${x(0)}" y="${y(0)}" width="${n(m.long * scale)}" height="${n(m.short * scale)}" class="qa-given"/>
  ${finalSquare ? `<rect x="${x(m.long)}" y="${y(m.height)}" width="${n(m.height * scale)}" height="${n(m.height * scale)}" class="qa-result-square qa-constructed-square"/><text x="${x(m.long + m.height / 2)}" y="${y(m.height / 2) + 5}" class="qa-area-label" text-anchor="middle">${f(m.area)} u²</text>` : ""}
  ${circle}${full ? line(p.E, p.Z, "qa-copy-line") : ""}
  ${state.stage >= 2 && !m.equal ? `${line(p.B, p.Z, "qa-baseline")}<circle cx="${x(m.radius)}" cy="${y(0)}" r="4" class="qa-centre"/>${label(p.H, "Η", -6, 28)}` : ""}
  ${join}<text x="${x(m.long) + 16}" y="${y(-m.short / 2) + 5}" class="qa-dimension">${f(m.short)} u</text>${label(p.B, "Β", -17, -10)}${label(p.E, "Ε", 8, -10)}${label(p.Gamma, "Γ", -14, 25)}${label(p.Delta, "Δ", 8, 25)}${full ? label(p.Z, "Ζ", 5, 25) : ""}
  <text x="${x(m.long / 2)}" y="${y(-m.short / 2) + 5}" class="qa-area-label" text-anchor="middle">${f(m.area)} u²</text>
  <text x="${x(m.long / 2)}" y="${y(-m.short) + 47}" text-anchor="middle" class="qa-dimension">ΒΕ = ${f(m.long)} u</text>
  <text x="${w / 2}" y="${h - 8}" text-anchor="middle" class="qa-caption">${m.equal ? "Equal sides: the source finishes here." : "u = an arbitrary drawing unit · equal scales"}</text></svg>`;
}
export function areaRearrangement(state: QuadratureState, narrow = false): string {
  const m = quadratureModel(state),
    w = narrow ? 360 : 700,
    h = narrow ? 330 : 360;
  const scale = Math.min((w - 70) / m.long, (h - 80) / (m.radius + m.short / 4));
  const x0 = (w - m.long * scale) / 2,
    y0 = h - 40;
  const x = (v: number) => n(x0 + v * scale),
    y = (v: number) => n(y0 - v * scale);
  const piece = movedPiece(state);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="qa-pieces-title"><title id="qa-pieces-title">Two rigid pieces total ${f(m.area)} square units. The half-sum square has ${f(m.offsetArea)} extra square units.</title><defs><pattern id="qa-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M-2 2L2 -2M0 8L8 0M6 10L10 6" stroke="#875029" stroke-width="1"/></pattern></defs>
  <rect x="${x(0)}" y="${y(m.radius)}" width="${n(m.radius * scale)}" height="${n(m.radius * scale)}" class="qa-square-outline"/>
  <rect x="${x(m.short)}" y="${y(m.radius)}" width="${n(m.offset * scale)}" height="${n(m.offset * scale)}" fill="url(#qa-hatch)" class="qa-extra"/>
  <rect x="${x(0)}" y="${y(m.short)}" width="${n(m.radius * scale)}" height="${n(m.short * scale)}" class="qa-piece-one"/>
  <polygon points="${piece.map(([px, py]) => `${x(px)},${y(py)}`).join(" ")}" class="qa-piece-two"/>
  <text x="${x(m.radius / 2)}" y="${y(m.short / 2) + 5}" class="qa-piece-label" text-anchor="middle">${f(m.radius * m.short)} u²</text>
  ${m.offset * scale > 42 && (state.move === 0 || state.move === 100) ? `<text x="${x(state.move === 0 ? m.radius + m.offset / 2 : m.short / 2)}" y="${y(state.move === 0 ? m.short / 2 : m.short + m.offset / 2) + 5}" class="qa-piece-label" text-anchor="middle">${f(m.offset * m.short)}</text>` : ""}
  <text x="${w / 2}" y="22" class="qa-caption" text-anchor="middle">${m.equal ? "No second piece and no missing square" : `Dashed square: side ${f(m.radius)} u · hatched corner: ${f(m.offsetArea)} u²`}</text>
  <text x="${w / 2}" y="${h - 10}" class="qa-caption" text-anchor="middle">${state.move === 100 ? "Same two pieces, rearranged. The corner remains empty." : state.move === 0 ? "Cut at the half-sum. Move the smaller piece above the larger." : "Piece lifted and turned; temporary overlap is only a projection."}</text></svg>`;
}
export function areaLedger(state: QuadratureState, narrow = false): string {
  const m = quadratureModel(state),
    w = narrow ? 360 : 700,
    h = narrow ? 425 : 290;
  const each = 300,
    scale = Math.min((each - 35) / (m.long + m.offset + 1.3), 140 / m.height);
  const row = (right: boolean, ox: number, oy: number) => {
    const mainWidth = right ? m.height : m.long;
    const mainHeight = right ? m.height : m.short;
    // Both accounts use one scale, so equal areas also occupy equal picture area.
    const s = scale;
    const extraX = ox + mainWidth * s + 28;
    return `<text x="${ox}" y="${oy}" class="qa-ledger-heading">${right ? "I.47 · Right triangle" : "II.5 · Two cuts of the line"}</text>
    <rect x="${ox}" y="${oy + 25}" width="${n(mainWidth * s)}" height="${n(mainHeight * s)}" class="${right ? "qa-result-square" : "qa-given"}"/>
    <text x="${ox}" y="${oy + 25 + mainHeight * s + 23}" class="qa-dimension">${right ? "ΕΘ²" : "ΒΕ × ΕΖ"} = ${f(m.area)} u²</text>
    ${m.equal ? "" : `<g class="${state.cancel ? "qa-cancelled" : ""}"><text x="${extraX - 20}" y="${oy + 44}" class="qa-dimension">+</text><rect x="${extraX}" y="${oy + 25}" width="${n(m.offset * s)}" height="${n(m.offset * s)}" class="qa-shared-square"/><text x="${extraX}" y="${oy + 25 + m.offset * s + 23}" class="qa-caption">${f(m.offsetArea)} u²</text></g>`}`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="qa-ledger-title"><title id="qa-ledger-title">${state.cancel ? "After subtracting the same square: rectangle equals constructed square" : "Two equal totals: the rectangle plus the offset square equals the constructed square plus the same offset square"}</title>${row(false, 20, 27)}${row(true, narrow ? 20 : 380, narrow ? 230 : 27)}<text x="${w / 2}" y="${narrow ? 215 : 265}" text-anchor="middle" class="qa-ledger-heading">${state.cancel ? `${f(m.area)} u² = ${f(m.area)} u²` : `Both totals: ΗΘ² = ${f(m.radiusArea)} u²`}</text></svg>`;
}
export function areaTable(state: QuadratureState): string {
  const m = quadratureModel(state);
  const rows = [
    ["Given rectangle", `${f(m.long)} × ${f(m.short)} u`, `${f(m.area)} u²`, `${f(m.perimeter)} u`],
    ["Square on ΕΘ", `${f(m.height, 6)} u`, `${f(m.area)} u²`, `${f(m.squarePerimeter, 6)} u`],
    ["Square on the half-sum", `${f(m.radius)} u`, `${f(m.radiusArea)} u²`, `${f(m.perimeter)} u`],
  ];
  return `<table><caption>Equal area and equal perimeter are different conditions</caption><thead><tr><th scope="col">Figure</th><th scope="col">Side(s)</th><th scope="col">Area</th><th scope="col">Perimeter</th></tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${escapeHtml(c)}</th>` : `<td>${escapeHtml(c)}</td>`)).join("")}</tr>`).join("")}</tbody></table>`;
}
