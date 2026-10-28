import { type AreaState, areaModel, reflectedTrial, trialArea } from "./core/areas";
import { exact, approximate as num, type Rational, rational } from "./core/circle";
import { escapeHtml as esc } from "./html";

const ink = "#193d50",
  blue = "#416b7c",
  rust = "#94512e",
  paper = "#f5f7f4";
const text = (x: number, y: number, value: string, size = 15, anchor = "start", color = ink) =>
  `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="${color}">${esc(value)}</text>`;

// Keep long exact fractions in the ledger and SVG description. The plate uses
// explicitly approximate labels when the full fraction would cross a panel.
const plateMeasure = (v: Rational): string =>
  exact(v).length <= 10 ? `= ${exact(v)}` : `≈ ${num(v).toPrecision(7)}`;

export function areaPlate(s: AreaState): string {
  const m = areaModel(s),
    pair = s.mode === "short",
    width = 760;
  const states = pair ? [s, { ...s, trial: reflectedTrial(s) }] : [s];
  const panelWidth = width / states.length;
  const maxHeight = Math.max(...states.map((x) => num(areaModel(x).height)), s.base / 5);
  const maxBase = s.base + (pair ? 0 : num(m.t));
  const maxShift = Math.abs((s.shear / 100) * maxHeight);
  const scale = Math.min((panelWidth - 100) / (maxBase + maxShift), 185 / maxHeight);
  const panels = states
    .map((state, index) => {
      const model = areaModel(state),
        h = num(model.height),
        applied = num(model.appliedBase);
      const shift = (state.shear / 100) * h;
      const left = index * panelWidth + 44 + Math.max(0, -shift * scale),
        bottom = 280;
      const x = (v: number) => left + v * scale,
        y = (v: number) => bottom - v * scale;
      const polygon = (from: number, to: number, fill: string, stroke: string) =>
        `<polygon points="${x(from)},${y(0)} ${x(to)},${y(0)} ${x(to + shift)},${y(h)} ${x(from + shift)},${y(h)}" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>`;
      const first = state.mode === "short" ? applied : state.base;
      const end = state.mode === "short" ? state.base : applied;
      const title = index ? "Reflected trial · a − t" : "Your trial · t";
      const region = state.mode === "short" ? "excluded shortfall" : "included excess";
      return `<g>${text(index * panelWidth + 22, 27, title, 17)}${text(index * panelWidth + 22, 52, `t ${plateMeasure(model.t)}`, 14)}${text(index * panelWidth + 22, 74, `Applied area ${plateMeasure(model.area)}`, 14)}
${polygon(0, first, "#d6e4e9", blue)}${polygon(first, end, "url(#ar-hatch)", rust)}
<line x1="${x(0)}" y1="${bottom}" x2="${x(state.base)}" y2="${bottom}" stroke="${ink}" stroke-width="3"/>
${[0, state.base].map((n) => `<path d="M ${x(n)},${bottom - 5} v 10" stroke="${ink}"/>`).join("")}
${text(x(0), bottom + 24, "0", 14, "middle")}${text(x(state.base), bottom + 24, `a = ${state.base}`, 14, "middle")}
${text(index * panelWidth + 22, 332, `height ${plateMeasure(model.height)}`, 13)}${text(index * panelWidth + 22, 354, `${region} area ${plateMeasure(model.similarArea)}`, 13)}
${model.degenerate ? text(index * panelWidth + 22, 100, "Zero-area limit; no parallelogram", 13, "start", rust) : ""}</g>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 375" role="img" aria-labelledby="ar-plate-title ar-plate-description"><title id="ar-plate-title">${pair ? "Two equal-area trials at one geometric scale" : "A parallelogram extending beyond the given line"}</title><desc id="ar-plate-description">${esc(`Given line ${s.base}. Current shortfall or extension ${s.trial}. Applied base ${exact(m.appliedBase)}, perpendicular height ${exact(m.height)}, area ${exact(m.area)}. Hatched region area ${exact(m.similarArea)} is ${pair ? "excluded from" : "included in"} the applied area. ${pair ? `Reflected trial ${reflectedTrial(s)} has exactly the same area. Both panels use equal horizontal and vertical units and the same scale.` : "Horizontal and vertical units use the same scale."} Long fractions use explicitly approximate plate labels; the exact values remain in the account and description.`)}</desc><defs><pattern id="ar-hatch" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="#f0e2ce"/><path d="M -2,2 L 2,-2 M 0,9 L 9,0 M 7,11 L 11,7" stroke="#b48b69" stroke-width="1"/></pattern></defs><rect width="${width}" height="375" fill="${paper}"/><g font-family="'Noto Serif',Georgia,serif">${panels}</g></svg>`;
}

export function areaShape(s: AreaState): string {
  const k = num(areaModel(s).k),
    scale = Math.min(85, 90 / k),
    h = k * scale,
    shift = (h * s.shear) / 100;
  const x = 50 + Math.max(0, -shift),
    bottom = 122;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 235 155" role="img" aria-label="Given shape: base 1, perpendicular height ${exact(areaModel(s).k)}, top shift ${s.shear} percent of height"><polygon points="${x},${bottom} ${x + scale},${bottom} ${x + scale + shift},${bottom - h} ${x + shift},${bottom - h}" fill="#f0e2ce" stroke="${rust}" stroke-width="1.5"/><path d="M${x + shift},${bottom - h} V${bottom}" stroke="${ink}" stroke-dasharray="3 3"/><g font-family="'Noto Serif',Georgia,serif">${text(x + scale / 2, 145, "base 1", 12, "middle")}${text(12, 22, `Given shape · height ${exact(areaModel(s).k)}`, 12)}</g></svg>`;
}

export function graphExtent(s: AreaState): number {
  const m = areaModel(s);
  return s.mode === "short"
    ? s.base
    : Math.max(s.base, Math.ceil((m.fits[0]?.value ?? 0) * 1.3), Math.ceil(num(m.t)));
}
export function areaGraph(s: AreaState): string {
  const m = areaModel(s),
    end = graphExtent(s),
    c = num(m.c);
  const top =
    1.15 * Math.max(c, s.mode === "short" ? num(m.maximum) : num(trialArea(s, rational(end))));
  const x = (v: number) => 66 + (v / end) * 620,
    y = (v: number) => 224 - (v / top) * 172;
  const points = Array.from({ length: 161 }, (_, i) => {
    const t = (end * i) / 160,
      k = num(m.k);
    return `${i ? "L" : "M"}${x(t)},${y(k * t * (s.mode === "short" ? s.base - t : s.base + t))}`;
  }).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 275" role="img" aria-labelledby="ar-graph-title"><title id="ar-graph-title">Modern area graph: ${m.fits.length} ${m.fits.length === 1 ? "fit" : "fits"} to target ${s.target}. The exact ledger determines equality.</title><rect width="760" height="275" fill="${paper}"/><g font-family="'Noto Serif',Georgia,serif">${text(22, 25, "Area as t changes · modern graph", 16)}<path d="M66,42 V224 H703" fill="none" stroke="${ink}"/>${text(55, 241, "0", 13)}${text(700, 245, "t", 15)}${text(66, 265, "0", 13)}${text(x(end), 265, String(end), 13, "middle")}
<path d="M66,${y(c)} H704" stroke="${rust}" stroke-width="1.5" stroke-dasharray="6 4"/>${text(710, y(c) + 5, `c`, 15, "start", rust)}
<path d="${points}" stroke="${blue}" stroke-width="2.5" fill="none"/>
${m.fits.map((f) => `<circle cx="${x(f.value)}" cy="${y(c)}" r="5" fill="${paper}" stroke="${rust}" stroke-width="2"/>`).join("")}
<path d="M${x(num(m.t))},224 V${y(num(m.area))}" stroke="${ink}" stroke-dasharray="3 3"/><circle cx="${x(num(m.t))}" cy="${y(num(m.area))}" r="5" fill="${ink}"/>
${s.mode === "short" ? text(x(s.base / 2), y(num(m.maximum)) - 12, `maximum ${exact(m.maximum)}`, 13, "middle") : ""}</g></svg>`;
}

export function areaResult(s: AreaState): string {
  const m = areaModel(s);
  return `<p class="ar-result-title">${m.degenerate ? "A zero-area limit" : m.exactFit ? "This trial fits exactly" : "This trial does not fit exactly"}</p><p>Applied area <strong>${exact(m.area)}</strong> ${m.residual.n < 0n ? "&lt;" : m.residual.n > 0n ? "&gt;" : "="} target <strong>${exact(m.c)}</strong>.</p><p>Area minus target = <strong>${exact(m.residual)}</strong>. ${m.degenerate ? "At an endpoint the figure has zero area. Positive target areas require a nondegenerate parallelogram." : m.exactFit ? "The equality is checked with whole-number fractions." : "No tolerance or rounded decimal turns a near miss into equality."}</p>`;
}
export function areaSolutions(s: AreaState, controls = true): string {
  const m = areaModel(s);
  const intro =
    s.mode === "short"
      ? `${m.fits.length === 2 ? "Two fits" : m.fits.length === 1 ? "One limiting fit" : "No fit"}: target ${s.target} ${m.fits.length === 2 ? "is below" : m.fits.length === 1 ? "equals" : "exceeds"} the maximum ${exact(m.maximum)}.`
      : "One positive fit. Every positive target is possible in the exceeding family.";
  return `<h3>${intro}</h3>${m.fits.length ? `<ol class="ar-fit-list">${m.fits.map((f, i) => `<li>${f.exact ? `<strong>t = ${exact(f.exact)}</strong> exactly.` : `<strong>${exact(f.lower)} &lt; t &lt; ${exact(f.upper)}</strong><br/>Irrational fit; approximately ${f.value.toFixed(8)}. The rational endpoints bracket the root on this branch.`}${controls ? `<button type="button" data-ar-fit="${i}">${f.exact ? `Use fit ${i + 1}` : `Try lower bound ${i + 1}`}</button>` : ""}</li>`).join("")}</ol>` : "<p>A target above the maximum cannot be reached by any cut. Keep this target and change to exceeding to solve a different geometric problem.</p>"}<p class="ar-fine">For these coordinates, t = ${s.mode === "short" ? "(a ± √D)/2" : "(√D − a)/2"}, with D = a² ${s.mode === "short" ? "−" : "+"} 4c/k = ${exact(m.discriminant)}. ${s.mode === "short" ? "Only 0 &lt; t &lt; a counts; when D = 0 the two expressions coincide." : "Only t &gt; 0 counts; the other algebraic root is negative."} Square roots are modern notation. Certified fractions determine every displayed interval.</p>`;
}
export function areaIdentity(s: AreaState): string {
  const m = areaModel(s);
  return `<h3>${s.mode === "short" ? "Why there is a ceiling" : "Why the excess has no ceiling"}</h3><p class="ar-equation">${s.mode === "short" ? "k·a²/4 − k·t(a − t) = k·(t − a/2)²" : "k·t(a + t) + k·a²/4 = k·(t + a/2)²"}</p><p class="ar-equation">${s.mode === "short" ? `${exact(m.maximum)} − ${exact(m.area)}` : `${exact(m.area)} + ${exact(m.maximum)}`} = ${exact(m.correction)}</p><p>${s.mode === "short" ? "The right side cannot be negative. It is zero only at t = a/2, so that cut gives the unique maximum. Replacing t by a − t keeps the product t(a − t) unchanged: the two trial panels have equal areas." : "For t ≥ 0 the area k·t(a + t) increases strictly and grows without bound. Completing the square uses a sum of positive areas. This app’s finite input limits are not a bound on the construction."}</p><p class="ar-fine">This algebra is a modern explanation of this family. Euclid uses similar figures, equal complements and gnomons. Read the selected source steps below; earlier constructions such as VI.25 remain prerequisites.</p>`;
}
export function areaLedger(s: AreaState): string {
  const m = areaModel(s);
  return `<table><caption>Exact area account · arbitrary length and area units</caption><thead><tr><th scope="col">Quantity</th><th scope="col">Value</th><th scope="col">Meaning</th></tr></thead><tbody>${[
    ["a", String(s.base), "Given line"],
    ["t", exact(m.t), s.mode === "short" ? "Shortfall base" : "Extension base"],
    [s.mode === "short" ? "a − t" : "a + t", exact(m.appliedBase), "Applied base"],
    ["k·t", exact(m.height), "Perpendicular height, not slant side"],
    ["Applied area", exact(m.area), s.mode === "short" ? "k·t(a − t)" : "k·t(a + t)"],
    [
      "Similar region",
      exact(m.similarArea),
      s.mode === "short" ? "Excluded shortfall; k·t²" : "Included excess; k·t²",
    ],
    ["c", exact(m.c), "Target area"],
    ["Area − c", exact(m.residual), "Zero means exact fit"],
  ]
    .map(
      ([label, value, meaning]) =>
        `<tr><th scope="row">${label}</th><td>${value}</td><td>${meaning}</td></tr>`,
    )
    .join("")}</tbody></table>`;
}
export function areaSvg(s: AreaState, font: string, license: string, fontLicense: string): string {
  return areaPlate(s).replace(
    "<defs>",
    `<metadata>${esc(`Stoicheia · Euclid VI.27–29. Modern coordinate experiment. ${JSON.stringify(s)}\n${license}\n${fontLicense}`)}</metadata><defs><style>@font-face{font-family:'Noto Serif';src:url('${font}')}</style>`,
  );
}
