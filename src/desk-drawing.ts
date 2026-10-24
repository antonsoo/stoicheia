import { type DeskScene, deskPoint, deskProof, nearbyPoint } from "./core/desk";
import { distance, type Point } from "./core/geometry";
import { escapeHtml as esc } from "./html";

export interface DeskDrawingOptions {
  interactive?: boolean;
  candidates?: Point[];
  selected?: string[];
  circles?: boolean;
  compact?: boolean;
  instance?: string;
}
export function deskDrawing(scene: DeskScene, options: DeskDrawingOptions = {}): string {
  const width = options.compact ? 560 : 900,
    height = options.compact ? 580 : 570;
  const p = (id: string) => deskPoint(scene, id),
    proof = deskProof(scene);
  const extents: Point[] = [...scene.points, ...(options.candidates ?? [])];
  if (options.circles !== false)
    for (const c of scene.curves)
      if (c.kind === "circle") {
        const center = p(c.center),
          radius = distance(center, p(c.through));
        extents.push(
          { x: center.x - radius, y: center.y - radius },
          { x: center.x + radius, y: center.y + radius },
        );
      }
  const xs = extents.map((p) => p.x),
    ys = extents.map((p) => p.y);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const scale = Math.min(
    (width - 100) / Math.max(1, maxX - minX),
    (height - 100) / Math.max(1, maxY - minY),
  );
  const x = (p: Point) => width / 2 + (p.x - (minX + maxX) / 2) * scale;
  const y = (p: Point) => height / 2 - (p.y - (minY + maxY) / 2) * scale;
  const segment = (a: Point, b: Point, cls: string) =>
    `<path class="${cls}" d="M${x(a)} ${y(a)}L${x(b)} ${y(b)}"/>`;
  // Clip the infinite mathematical support before emitting it. A huge dashed
  // SVG path makes PDF writers emit every off-page dash even under clipPath.
  const linePath = (a: Point, b: Point): string => {
    const start = [x(a), y(a)],
      delta = [x(b) - x(a), y(b) - y(a)];
    let low = Number.NEGATIVE_INFINITY,
      high = Number.POSITIVE_INFINITY;
    for (const [i, limit] of [
      [0, width],
      [1, height],
    ] as const) {
      const origin = start[i] ?? 0,
        direction = delta[i] ?? 0;
      if (Math.abs(direction) < 1e-12) {
        if (origin < 2 || origin > limit - 2) return "";
        continue;
      }
      const first = (2 - origin) / direction,
        last = (limit - 2 - origin) / direction;
      low = Math.max(low, Math.min(first, last));
      high = Math.min(high, Math.max(first, last));
    }
    if (low > high) return "";
    return `M${(start[0] ?? 0) + low * (delta[0] ?? 0)} ${(start[1] ?? 0) + low * (delta[1] ?? 0)}L${(start[0] ?? 0) + high * (delta[0] ?? 0)} ${(start[1] ?? 0) + high * (delta[1] ?? 0)}`;
  };
  const clip = `desk-clip-${esc(options.instance ?? "main")}`;
  const choice = (id: string, text: string) =>
    options.interactive
      ? ` role="button" tabindex="0" aria-label="${esc(text)}" data-choose="${esc(id)}"`
      : "";
  return `<svg class="dk-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="${options.interactive ? "group" : "img"}" aria-label="Construction desk: ${scene.points.length} points and ${scene.curves.length} drawn curves. Given point A and detached reference BC.${proof ? ` Equal-remainder construction completed at ${proof.l}.` : ""}"><title>Your compass-and-straightedge construction</title><defs><clipPath id="${clip}"><rect x="2" y="2" width="${width - 4}" height="${height - 4}"/></clipPath></defs><rect class="dk-surface" x="1" y="1" width="${width - 2}" height="${height - 2}" rx="4"/>
<g clip-path="url(#${clip})">${scene.curves
    .map((c) => {
      const selected = options.selected?.includes(c.id) ? " dk-selected" : "";
      if (c.kind === "circle") {
        if (options.circles === false) return "";
        return `<g class="dk-curve${selected}"${choice(c.id, `${c.id}: circle centred at ${c.center} through ${c.through}`)}><circle class="dk-curve-target" cx="${x(p(c.center))}" cy="${y(p(c.center))}" r="${distance(p(c.center), p(c.through)) * scale}"/><circle class="dk-compass" cx="${x(p(c.center))}" cy="${y(p(c.center))}" r="${distance(p(c.center), p(c.through)) * scale}"/></g>`;
      }
      const a = p(c.a),
        b = p(c.b),
        support = linePath(a, b);
      return `<g class="dk-curve${selected}"${choice(c.id, `${c.id}: straight line through ${c.a} and ${c.b}`)}><path class="dk-curve-target" d="${support}"/><path class="dk-extension" d="${support}"/>${segment(a, b, "dk-join")}</g>`;
    })
    .join("")}${segment(p("B"), p("C"), "dk-reference")}
${proof ? segment(p("A"), p(proof.l), "dk-result") : ""}
</g>
${scene.points.map((point) => `<g class="dk-point${options.selected?.includes(point.id) ? " dk-selected" : ""}${point.id === "A" || point.id === "B" || point.id === "C" ? " dk-given" : ""}"${choice(point.id, `Choose point ${point.id}${point.id === "A" ? ", the target start" : ""}`)}><circle class="dk-point-target" cx="${x(point)}" cy="${y(point)}" r="20"/><circle class="dk-dot" cx="${x(point)}" cy="${y(point)}" r="5"/><text x="${x(point) + 10}" y="${y(point) - 12}">${esc(point.id)}</text></g>`).join("")}
${(options.candidates ?? [])
  .map((at, i) => {
    const existing = nearbyPoint(scene, at);
    return `<g class="dk-candidate"${options.interactive && !existing ? ` role="button" tabindex="0" data-branch="${i}" aria-label="Keep crossing ${i + 1}"` : ""}><circle class="dk-point-target" cx="${x(at)}" cy="${y(at)}" r="21"/><circle class="dk-crossing" cx="${x(at)}" cy="${y(at)}" r="11"/><text x="${x(at) - 14}" y="${y(at) + 31}" class="dk-crossing-label">${i + 1}${existing ? ` = ${esc(existing.id)}` : ""}</text></g>`;
  })
  .join(
    "",
  )}<text class="dk-plate-note" x="20" y="${height - 18}">BC is given${proof ? ` · A–${esc(proof.l)} is constructed` : " · new points must be kept from crossings"}</text></svg>`;
}

function remainderDrawing(scene: DeskScene): string {
  const proof = deskProof(scene);
  if (!proof) return "";
  const { d, g, l, anchor: b, other: c } = proof;
  const part = distance(deskPoint(scene, d), deskPoint(scene, "A"));
  const whole = distance(deskPoint(scene, d), deskPoint(scene, l));
  const cut = 30 + (660 * part) / whole;
  return `<svg class="dk-remainder-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 195" role="img" aria-label="Align the equal wholes, remove the equal starting parts, and compare the remaining lengths with BC."><title>Equal wholes minus equal parts</title><path class="dk-cut" d="M${cut} 18V190"/>${[
    [l, "A", 48],
    [g, b, 112],
  ]
    .map(([end, middle, ordinate]) => {
      const y = Number(ordinate);
      return `<path class="dk-part" d="M30 ${y}H${cut}"/><path class="dk-leftover" d="M${cut} ${y}H690"/><text x="30" y="${y - 15}">${d}</text><text x="${cut}" y="${y - 15}">${middle}</text><text x="690" y="${y - 15}">${end}</text>`;
    })
    .join(
      "",
    )}<path class="dk-reference-bar" d="M${cut} 176H690"/><text x="${cut}" y="161">${b}</text><text x="690" y="161">${c}</text></svg>`;
}

export function deskProofHtml(scene: DeskScene): string {
  const proof = deskProof(scene);
  if (!proof)
    return `<h2>An equality needs its reasons</h2><p id="dk-proof-state">The I.2 equal-remainder chain is not complete in this drawing.</p><p>A matching measurement alone does not establish it. The desk recognizes either equilateral vertex and either endpoint of BC as the anchor. Other valid constructions may not receive this particular explanation.</p><a href="./#p=2&s=8">Inspect Euclid’s prepared argument</a>`;
  const { anchor: b, other: c, d, g, l } = proof;
  return `<h2>The equal parts can now disappear</h2><p id="dk-proof-state">I.2’s equal-remainder chain is present: A–${l} = ${b}–${c}.</p>${remainderDrawing(scene)}<p class="dk-note">Grey: equal parts removed. Green: equal remainders. Blue: the given reference.</p><ol class="dk-reasons"><li><strong>${d}–A = ${d}–${b}</strong><span>The two circles on A–${b} supply the equilateral triangle (I.1).</span></li><li><strong>${b}–${g} = ${b}–${c}</strong><span>Both are radii of ${proof.circles[2]}, centred at ${b}.</span></li><li><strong>${d}–${l} = ${d}–${g}</strong><span>Both are radii of ${proof.circles[3]}, centred at ${d}.</span></li><li><strong>A–${l} = ${b}–${g} = ${b}–${c}</strong><span>${l} is beyond A and ${g} beyond ${b}. Remove equal parts ${d}–A and ${d}–${b} from the equal wholes: common notion 3, then common notion 1.</span></li></ol><table class="dk-correspondence"><caption>Match your labels to the printed I.2 argument${b === "C" ? " (BC’s endpoints exchanged)" : ""}</caption><thead><tr><th scope="col">This drawing</th><th scope="col">Source</th><th scope="col">Role</th></tr></thead><tbody>${[
    ["A", "Α", "Given point"],
    [b, "Β", "Reference anchor"],
    [c, "Γ", "Reference endpoint"],
    [d, "Δ", "Equilateral vertex"],
    [g, "Η", "Beyond the anchor"],
    [l, "Λ", "Copied endpoint"],
  ]
    .map(([a, b, c]) => `<tr><td>${a}</td><td lang="grc">${b}</td><td>${c}</td></tr>`)
    .join(
      "",
    )}</tbody></table><p class="dk-note">This recognizes construction dependencies and the required point order in a floating-point model of the real plane. It is not a formal proof checker; existence of intersections is an additional assumption in Euclid’s presentation.</p>`;
}
