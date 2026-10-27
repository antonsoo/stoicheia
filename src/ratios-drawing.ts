import { approximate, exact, subtract } from "./core/measure";
import {
  type RatioState,
  ratioMagnitudes,
  ratioTrial,
  relationSymbol,
  scanRatios,
} from "./core/ratios";
import { escapeHtml as esc } from "./html";

export function ratioLabels(s: RatioState): string {
  return s.kind === "scaled" ? "√2 : 1 and 3√2 : 3" : `√2 : 1 and ${s.p} : ${s.q}`;
}
export function ratioConclusion(s: RatioState): string {
  const t = ratioTrial(s);
  if (t.agrees)
    return "These two comparisons agree. This pair of multipliers has not separated the ratios. It does not establish agreement for every pair.";
  const witness = t.greater
    ? ` It also fits definition 7: the ${t.greater} ratio is greater, since its multiple exceeds the corresponding multiple while the other does not.`
    : " This is not itself the strict-excess/non-excess pattern of definition 7. It still refutes the equality condition in definition 5.";
  const name = (sign: number) => (sign < 0 ? "less than" : sign > 0 ? "greater than" : "equal");
  return `A counterexample to equal ratios: the first comparison gives “${name(t.first)}”; the second gives “${name(t.second)}”.${witness}`;
}

export function ratioPlate(s: RatioState): string {
  const [a, b, c, d] = ratioMagnitudes(s),
    t = ratioTrial(s);
  const row = (first: boolean, y: number) => {
    const x = first ? t.ma : t.mc,
      z = first ? t.nb : t.nd,
      sign = first ? t.first : t.second,
      xLabel = first ? "mA" : "mC",
      zLabel = first ? "nB" : "nD";
    const factor = 570 / Math.max(approximate(x), approximate(z));
    const bar = (v: number, count: number, yy: number, name: string, colour: string) => {
      const width = v * factor;
      const ticks =
        count <= 32
          ? Array.from(
              { length: count - 1 },
              (_, i) => `<path d="M${80 + (width * (i + 1)) / count} ${yy}v20" class="rt-tick"/>`,
            ).join("")
          : "";
      return `<rect x="80" y="${yy}" width="${width}" height="20" class="${colour}"/>${ticks}<text x="64" y="${yy + 15}" text-anchor="end">${name}</text><path d="M${80 + width} ${yy - 5}v30" class="rt-end"/>`;
    };
    return `<g><text x="32" y="${y}" class="rt-svg-title">${first ? "FIRST PAIR" : "SECOND PAIR"}</text><text x="650" y="${y}" text-anchor="end">${first ? `A = ${exact(a)} · B = ${exact(b)}` : `C = ${exact(c)} · D = ${exact(d)}`}</text>${bar(approximate(x), s.m, y + 20, xLabel, "rt-m-bar")}${bar(approximate(z), s.n, y + 56, zLabel, "rt-n-bar")}<text x="80" y="${y + 112}" class="rt-equation">${esc(exact(x))} ${esc(relationSymbol(sign))} ${esc(exact(z))}</text><text x="650" y="${y + 112}" text-anchor="end">${s.m} copies / ${s.n} copies</text></g>`;
  };
  return `<svg viewBox="0 0 700 365" role="img" aria-labelledby="rt-plate-title rt-plate-desc"><title id="rt-plate-title">${esc(ratioLabels(s))}, m=${s.m}, n=${s.n}</title><desc id="rt-plate-desc">${esc(ratioConclusion(s))} Each pair has its own scale. Exact comparison text decides subpixel differences.</desc>${row(true, 38)}<path d="M32 191H668" class="rt-rule"/>${row(false, 224)}</svg>`;
}

export function ratioMicroscope(s: RatioState): string {
  const t = ratioTrial(s);
  const values = [
    { difference: subtract(t.ma, t.nb), base: t.nb },
    { difference: subtract(t.mc, t.nd), base: t.nd },
  ].map((row) => ({ ...row, relative: approximate(row.difference) / approximate(row.base) }));
  const largest = Math.max(...values.map((row) => Math.abs(row.relative)));
  const zoom = largest ? 2 ** Math.floor(Math.log2(0.2 / largest)) : 1;
  const lines = values
    .map((row, i) => {
      const end = 350 + row.relative * 1000 * zoom;
      return `<text x="24" y="${52 + i * 60}">${i ? "mC − nD" : "mA − nB"}</text><path d="M350 ${46 + i * 60}H${end}" class="rt-offset"/><circle cx="${end}" cy="${46 + i * 60}" r="5" class="rt-point"/><text x="${end}" y="${69 + i * 60}" text-anchor="middle">${esc(exact(row.difference))}</text>`;
    })
    .join("");
  const zoomLabel =
    zoom >= 1 ? `×${zoom.toLocaleString("en-US")}` : `÷${(1 / zoom).toLocaleString("en-US")}`;
  return `<div class="rt-micro-heading"><h3>The endpoint microscope</h3><span>${zoomLabel} · automatic scale</span></div><svg viewBox="0 0 700 150" role="img" aria-label="Enlarged endpoint offsets, each relative to its own comparison length. Exact offsets are labeled in each pair’s original length units."><path d="M350 16V130" class="rt-zero"/><text x="350" y="13" text-anchor="middle">equal endpoints</text>${lines}</svg><p class="rt-fine">Position shows (mA − nB)/nB or (mC − nD)/nD, with the same scale factor. Labels give exact offsets in length units. A dot locates the endpoint; its diameter is not a length measurement.</p>`;
}

export function ratioArithmetic(s: RatioState): string {
  const t = ratioTrial(s);
  const m = BigInt(s.m),
    n = BigInt(s.n);
  const first = `2 × ${s.m}² = ${2n * m * m}; ${s.n}² = ${n * n}.`;
  const second =
    s.kind === "fraction"
      ? `${s.m} × ${s.p} = ${m * BigInt(s.p)}; ${s.n} × ${s.q} = ${n * BigInt(s.q)}.`
      : "mC − nD = 3(m√2 − n). Multiplying by positive 3 preserves its sign.";
  return `<p><strong>First pair.</strong> Both lengths are positive, so squaring preserves their order. ${esc(first)}</p><p><strong>Second pair.</strong> ${esc(second)}</p><p>${t.agrees ? "The relation signs match at these multipliers." : "The relation signs differ at these multipliers."} Every sign uses integer arithmetic. The bars, microscope positions and decimal aids are approximate.</p>`;
}

export function ratioMap(s: RatioState): string {
  const scan = scanRatios(s),
    size = 356,
    cell = size / s.bound;
  const dots = scan.rows
    .map((r) => {
      const x = 64 + (r.m - 0.5) * cell,
        y = 396 - (r.hi - 0.5) * cell,
        height = (r.hi - r.lo + 1) * cell;
      return `<rect x="${x - cell / 2}" y="${y - cell / 2}" width="${Math.max(cell, 0.6)}" height="${Math.max(height, 0.6)}" class="rt-disagreement"/>`;
    })
    .join("");
  const selected =
    s.m <= s.bound && s.n <= s.bound
      ? `<circle cx="${64 + (s.m - 0.5) * cell}" cy="${396 - (s.n - 0.5) * cell}" r="7" class="rt-selected"/>`
      : "";
  const first = scan.first
    ? `<circle cx="${64 + (scan.first.m - 0.5) * cell}" cy="${396 - (scan.first.n - 0.5) * cell}" r="10" class="rt-first"/>`
    : "";
  return `<svg viewBox="0 0 460 450" role="img" aria-labelledby="rt-map-title rt-map-desc"><title id="rt-map-title">All ${scan.checked} comparisons with multipliers from 1 to ${s.bound}</title><desc id="rt-map-desc">${scan.disagreements} disagreements. ${scan.first ? `First in m-then-n order: m=${scan.first.m}, n=${scan.first.n}.` : "No disagreement in this finite square."} Blue is agreement; rust marks disagreement. Rings are locators, not extra cells.</desc><rect x="64" y="40" width="356" height="356" class="rt-map-field"/><path d="M64 40V396H420" class="rt-map-axis"/><path d="M64 218H420M242 40V396" class="rt-map-grid"/>${dots}${first}${selected}<text x="64" y="420">1</text><text x="420" y="420" text-anchor="end">${s.bound}</text><text x="51" y="396" text-anchor="end">1</text><text x="51" y="50" text-anchor="end">${s.bound}</text><text x="240" y="442" text-anchor="middle">m · copies of A and C →</text><text x="20" y="218" transform="rotate(-90 20 218)" text-anchor="middle">n · copies of B and D →</text></svg>`;
}

export function ratioProof(s: RatioState): string {
  if (s.kind === "scaled")
    return `<h3>A reason for every pair.</h3><p>Here C = 3A and D = 3B. For any positive integers m and n, mC = 3(mA) and nD = 3(nB). Multiplying both lengths by the same positive factor preserves less than, equality and greater than.</p><p>Thus every comparison agrees, including comparisons beyond the search bound. This general argument supplies what a finite search cannot: the condition of V.5 for all m and n. A and B still need no common length measure.</p>`;
  const p = BigInt(s.p),
    q = BigInt(s.q);
  return `<h3>Why no fraction can finish the job.</h3><p>For this fraction, compare p² = ${p * p} with 2q² = ${2n * q * q}. Their difference is ${p * p - 2n * q * q}. This integer calculation says which modern numerical ratio is larger; it is separate from a found equimultiple witness.</p><p>More generally, suppose √2 = p/q in lowest positive whole-number terms. Then p² = 2q², so p is even. Write p = 2k; then q² = 2k², so q is also even. Both terms would share a factor 2, contradicting lowest terms. No rational fraction equals √2.</p><p>This is a modern parity proof supplied for the example. It is not part of the definitions on these printed pages. A bounded search that finds no witness does not weaken the argument, and does not prove equality.</p>`;
}
