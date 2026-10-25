import {
  type AuditRow,
  approximate,
  audit,
  type Branch,
  type CircleState,
  exact,
  sides,
} from "./core/circle";
import { escapeHtml as esc } from "./html";

const f = (n: number): string => n.toFixed(3);
export const decimal = (n: number): string => n.toFixed(9);
export function polygonDrawing(stage: number): string {
  const n = sides[stage] ?? 96,
    r = 137,
    cx = 260,
    cy = 197,
    angle = Math.PI / n;
  const at = (radius: number, a: number) =>
    `${f(cx + radius * Math.cos(a))},${f(cy - radius * Math.sin(a))}`;
  const vertices = (radius: number) =>
    Array.from({ length: n }, (_, i) => at(radius, (2 * i + 1) * angle)).join(" ");
  const upper = at(r / Math.cos(angle), angle),
    lower = at(r / Math.cos(angle), -angle);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 390" role="img" aria-labelledby="circle-polygon-title circle-polygon-desc"><title id="circle-polygon-title">${n}-sided polygons around and inside one circle</title><desc id="circle-polygon-desc">Both axes have the same scale. The outer polygon touches the circle at side midpoints; the inner polygon's vertices lie on the circle. Only the side count changes. Arithmetic alterations never change this geometry.</desc><g fill="none" stroke-linejoin="round"><polygon points="${vertices(r / Math.cos(angle))}" fill="#694780" fill-opacity=".06" stroke="#694780" stroke-width="2.5"/><circle cx="${cx}" cy="${cy}" r="${r}" stroke="#193d60" stroke-width="1.6"/><polygon points="${vertices(r)}" fill="#146d72" fill-opacity=".05" stroke="#146d72" stroke-width="2.5"/><path d="M${cx},${cy} L${upper} L${lower} Z" fill="#694780" fill-opacity=".09" stroke="#694780" stroke-width="1"/><path d="M${cx},${cy} H${cx + r}" stroke="#193d60" stroke-width="1.5"/><path d="M${cx + r - 9},${cy} v-9 h9" stroke="#193d60"/><path d="M${cx - r},${cy} H${cx}" stroke="#193d60" stroke-dasharray="4 5" stroke-opacity=".5"/></g><g font-family="system-ui,sans-serif" fill="#193d60" font-size="14"><text x="${cx - 16}" y="${cy + 21}">O</text><text x="${cx + r + 10}" y="${cy + 20}">T</text><text x="${cx + r / 2}" y="${cy + 22}" text-anchor="middle">radius = 1</text><text x="260" y="25" text-anchor="middle">${n} sides · equal horizontal and vertical scales</text><text x="260" y="378" text-anchor="middle">${stage === 4 ? "The gaps are now too small to judge by eye." : "The inner perimeter is shorter; the outer is longer."}</text></g></svg>`;
}
export function boundSummary(s: CircleState): string {
  const inner = audit("inner", s.alteration)[s.stage],
    outer = audit("outer", s.alteration)[s.stage];
  if (!inner || !outer) throw new Error("Missing perimeter bounds.");
  return `<div class="ci-bounds"><div class="ci-inner"><span>Inner ${inner.sides}-gon · ${inner.boundSafe ? "certified lower bound" : "unproved candidate"}</span><strong>${esc(exact(inner.bound))}</strong><small>≈ ${decimal(approximate(inner.bound))}</small></div><div class="ci-relation"><span>${inner.boundSafe ? "&lt;" : "?"}</span><b>C / d</b><span>${outer.boundSafe ? "&lt;" : "?"}</span></div><div class="ci-outer"><span>Outer ${outer.sides}-gon · ${outer.boundSafe ? "certified upper bound" : "unproved candidate"}</span><strong>${esc(exact(outer.bound))}</strong><small>≈ ${decimal(approximate(outer.bound))}</small></div></div>`;
}
export function intervalDrawing(s: CircleState): string {
  const lower = audit("inner", s.alteration)[s.stage],
    upper = audit("outer", s.alteration)[s.stage];
  if (!lower || !upper) throw new Error("Missing interval.");
  const l = approximate(lower.bound),
    u = approximate(upper.bound);
  const low = Math.min(l, u),
    high = Math.max(l, u),
    span = Math.max(high - low, 0.00001);
  const x = (n: number) => 80 + (360 * (n - (low - span / 3))) / ((span * 5) / 3);
  const safe = lower.boundSafe && upper.boundSafe;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 145" role="img" aria-labelledby="circle-interval-title"><title id="circle-interval-title">${safe ? "Certified" : "Candidate"} interval enlarged; separate scale from the circle drawing</title><path d="M40 70 H480" stroke="#b7c8d6" stroke-width="2"/><path d="M${f(x(l))} 70 H${f(x(u))}" stroke="${safe ? "#193d60" : "#52677b"}" stroke-width="7" ${safe ? "" : 'stroke-dasharray="5 5"'}/><path d="M${f(x(l))} 55 V85" stroke="#146d72" stroke-width="3"/><path d="M${f(x(u))} 55 V85" stroke="#694780" stroke-width="3"/><g fill="#193d60" font-size="13" font-family="system-ui,sans-serif"><text x="260" y="24" text-anchor="middle">${safe ? "The allowed interval, enlarged" : "Proposed endpoints · proof chain broken"}</text><text x="${f(x(l))}" y="110" text-anchor="middle">inner</text><text x="${f(x(u))}" y="110" text-anchor="middle">outer</text><text x="260" y="137" text-anchor="middle">The scale expands as the interval narrows.</text></g></svg>`;
}
export function ledger(
  branch: Branch,
  alteration: CircleState["alteration"],
  stage: number,
): string {
  const rows = audit(branch, alteration);
  return `<table class="ci-table"><caption>${branch === "outer" ? "Outer path: keep A below the true ratio, so n/A bounds C/d from above." : "Inner path: keep H above the true ratio, so n/H bounds C/d from below."}</caption><thead><tr><th scope="col">Sides</th><th scope="col">A after adding</th><th scope="col">H after rounding</th><th scope="col">Local square test</th><th scope="col">Length estimates</th><th scope="col">${branch === "outer" ? "n / A" : "n / H"}</th></tr></thead><tbody>${rows.map((r) => `<tr ${r.index === stage ? 'aria-current="step"' : ""} class="${r.altered ? "ci-altered" : ""}"><th scope="row">${r.sides}${r.altered ? " *" : ""}</th><td>${esc(exact(r.a))}</td><td>${r.h ? esc(exact(r.h)) : "not needed"}</td><td>${r.radicand ? (r.localSafe ? "safe" : "wrong side") : "addition only"}</td><td>${r.chainSafe ? "valid" : "broken"}</td><td>${esc(exact(r.bound))}<small>${r.boundSafe ? (branch === "outer" ? "upper bound" : "lower bound") : "candidate only"}</small></td></tr>`).join("")}</tbody></table>`;
}
export function squareExplanation(branch: Branch, row: AuditRow): string {
  if (!row.choice || !row.radicand || !row.squareGap)
    return "The outer 96-gon needs only the addition A + H from the 48-gon. Choose an earlier row to audit a square-root approximation.";
  const relation =
    row.index === 0 ? (branch === "outer" ? "&lt;" : "&gt;") : branch === "outer" ? "≤" : "≥";
  return `<p>In the printed scale, the chosen ${row.index ? "hypotenuse" : "√3 estimate"} is <strong>Y = ${esc(exact(row.choice))}</strong>; the other scale is <strong>${row.base}</strong>.</p><p class="ci-equation">Y² ${relation} ${esc(exact(row.radicand))}</p><p>This is the required local test. Its exact signed remainder is</p><p class="ci-equation">${esc(exact(row.radicand))} − Y² = <strong>${esc(exact(row.squareGap))}</strong>.</p><p>${row.localSafe ? "The local comparison is on the safe side." : "The chosen approximation is on the wrong side: this step does not justify its new length estimate."} ${row.chainSafe ? "Every preceding step is also justified." : row.localSafe ? "An earlier step has already broken the chain; a locally safe comparison cannot repair it." : "Later arithmetic cannot restore the missing implication."}</p>`;
}
export function proofDrawing(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 270" role="img" aria-labelledby="circle-proof-title"><title id="circle-proof-title">A right triangle with legs A and one, and hypotenuse H. The angle bisector splits the vertical side into two parts.</title><path d="M50 230 H460 V50 Z" fill="#694780" fill-opacity=".06" stroke="#694780" stroke-width="2"/><path d="M50 230 L460 144" stroke="#193d60" stroke-width="2"/><path d="M444 230 V214 H460" fill="none" stroke="#193d60"/><g font-family="system-ui,sans-serif" fill="#193d60" font-size="17"><text x="35" y="253">O</text><text x="465" y="253">T</text><text x="467" y="49">P</text><text x="468" y="149">Q</text><text x="245" y="254">A</text><text x="478" y="208">1</text><text x="248" y="122">H</text><text x="155" y="212">θ / 2</text></g></svg>`;
}
