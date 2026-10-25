import {
  activeDivision,
  approximate,
  commonMeasure,
  diagonal,
  divide,
  divisions,
  exact,
  length,
  type MeasureState,
  remainderNow,
  sign,
  startLength,
} from "./core/measure";
import { escapeHtml as esc } from "./html";

export function decimal(n: number): string {
  if (n === 0) return "0";
  return Math.abs(n) < 0.00001 ? n.toExponential(6) : n.toFixed(8).replace(/\.?0+$/, "");
}
const text = (x: number, y: number, value: string, cls = "", anchor = "start") =>
  `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(value)}</text>`;
export function measureDrawing(s: MeasureState, narrow = false): string {
  const row = activeDivision(s),
    w = narrow ? 420 : 800,
    x = 26,
    width = w - 52;
  const b = approximate(divide(row.b, row.a)) * width;
  const used = b * s.copies;
  const remaining = approximate(divide(remainderNow(s), row.a)) * width;
  const tick = (at: number, y: number) => `<path d="M${at},${y - 7}v14" class="mr-tick"/>`;
  let fitted = "";
  if (s.copies <= 16) {
    for (let i = 0; i < s.copies; i++)
      fitted += `<rect x="${x + i * b}" y="70" width="${b}" height="42" class="mr-fitted"/>${tick(x + i * b, 119)}`;
  } else fitted = `<rect x="${x}" y="70" width="${used}" height="42" class="mr-fitted"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 300" class="mr-drawing" role="img" aria-label="Stage ${s.row + 1}: ${s.copies} copies fitted; remaining length ${esc(exact(remainderNow(s)))}. Both bars use the same local scale." data-a="${approximate(row.a)}" data-b="${approximate(row.b)}" data-remaining="${approximate(remainderNow(s))}">
<title>Lay the smaller along the greater · stage ${s.row + 1}</title>
${text(x, 39, "A · THE LONGER LENGTH", "mr-svg-label")}
<rect x="${x}" y="70" width="${width}" height="42" class="mr-whole"/>
${fitted}<rect x="${x + used}" y="70" width="${remaining}" height="42" class="mr-remainder" data-length="remaining"/>
${tick(x, 119)}${tick(x + width, 119)}
${text(x, 146, s.copies ? `${s.copies} ${s.copies === 1 ? "copy" : "copies"} of B fitted` : "No copies fitted yet", "mr-svg-note")}
${text(x, 185, "B · THE CURRENT MEASURE", "mr-svg-label")}
<rect x="${x}" y="204" width="${b}" height="28" class="mr-small" data-length="b"/>
${tick(x, 237)}${tick(x + b, 237)}
${text(x, 277, sign(remainderNow(s)) === 0 ? "ZERO REMAINDER · exactly, not rounded" : s.copies === row.q ? "The positive remainder becomes the next measure ↓" : "Lay off B again while it fits.", "mr-svg-note")}</svg>`;
}

export function overviewDrawing(s: MeasureState, narrow = false): string {
  const w = narrow ? 420 : 800,
    x = 105,
    width = w - 136;
  const rows = divisions(s).slice(0, s.row + 1);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${50 + rows.length * 35}" class="mr-drawing mr-overview" role="img" aria-label="All visited measures drawn on the original scale. A cross marks positive lengths below one drawing unit; its width is not the length."><title>One original scale for every visited measure</title>
${text(x, 22, "ORIGINAL SIDE = 1", "mr-svg-label")}${rows
  .map((row) => {
    const y = 48 + row.index * 35,
      bar = (approximate(row.b) / approximate(startLength(s))) * width;
    return `${text(18, y + 6, `Turn ${row.index + 1}`, "mr-svg-note")}<rect x="${x}" y="${y - 9}" width="${bar}" height="17" class="mr-small" data-original-width="${bar}"/>${bar < 1 ? `<path d="M${x - 4},${y - 4}l8,8m-8,0l8,-8" class="mr-subpixel"/>` : ""}`;
  })
  .join("")}</svg>`;
}

export function measureLedger(s: MeasureState): string {
  const rows = divisions(s).slice(0, s.row + 1);
  return `<table><caption>Your subtraction record · exact lengths in original side units</caption><thead><tr><th scope="col">Turn</th><th scope="col">Longer A</th><th scope="col">Measure B</th><th scope="col">Copies fitted</th><th scope="col">Left after those copies</th></tr></thead><tbody>${rows
    .map((r) => {
      const current = r.index === s.row;
      return `<tr${current ? ' aria-current="step"' : ""}><th scope="row">${r.index + 1}</th><td>${esc(exact(r.a))}</td><td>${esc(exact(r.b))}</td><td>${current ? s.copies : r.q}</td><td>${esc(exact(current ? remainderNow(s) : r.r))}${current && s.copies < r.q ? " (unfinished)" : sign(r.r) === 0 ? " (exactly zero)" : " (positive)"}</td></tr>`;
    })
    .join("")}</tbody></table>`;
}

export function comparisonTable(s: MeasureState): string {
  const a = divisions({ ...s, kind: "diagonal" }),
    b = divisions({ ...s, kind: "fraction" });
  const count = Math.max(s.row + 1, 1);
  return `<table><caption>Two different exact lengths · computed comparison through turn ${count}</caption><thead><tr><th scope="col" rowspan="2">Turn</th><th scope="colgroup" colspan="2">Square diagonal</th><th scope="colgroup" colspan="2">Exact fraction ${s.n}/${s.d}</th></tr><tr><th scope="col">Copies</th><th scope="col">Remainder</th><th scope="col">Copies</th><th scope="col">Remainder</th></tr></thead><tbody>${a
    .slice(0, count)
    .map((r, i) => {
      const other = b[i];
      return `<tr><th scope="row">${i + 1}</th><td>${r.q}</td><td>${esc(exact(r.r))} &gt; 0</td><td>${other ? other.q : "—"}</td><td>${other ? `${esc(exact(other.r))}${sign(other.r) === 0 ? " = 0 · stops" : " > 0"}` : "Already stopped"}</td></tr>`;
    })
    .join("")}</tbody></table>`;
}

export function tilingDrawing(s: MeasureState, narrow = false): string {
  const m = commonMeasure(s);
  if (!m) return "";
  const w = narrow ? 420 : 800,
    x = 26,
    width = w - 52;
  const unitWidth = width / Number(m.longCount);
  const bar = (count: bigint, y: number) => {
    let cuts = "";
    if (count <= 24n) {
      for (let i = 1; i < Number(count); i++)
        cuts += `<path d="M${x + i * unitWidth},${y}v30" class="mr-tick"/>`;
    }
    return `<rect x="${x}" y="${y}" width="${Number(count) * unitWidth}" height="30" class="mr-small"/>${cuts}`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 215" class="mr-drawing" role="img" aria-label="A common length ${esc(exact(m.unit))} tiles the originals ${m.longCount} and ${m.shortCount} times. More than 24 divisions are counted without drawing individual cuts."><title>Return the last measure to both original lengths</title>${text(x, 28, `${m.longCount} × the common measure`, "mr-svg-note")}${bar(m.longCount, 46)}${text(x, 111, `${m.shortCount} × the same measure`, "mr-svg-note")}${bar(m.shortCount, 128)}${text(x, 198, m.longCount > 24n ? "Individual cuts omitted; counts are exact." : "Every cut uses the same length.", "mr-svg-label")}</svg>`;
}

export function squareDrawing(narrow = false): string {
  const w = narrow ? 420 : 800,
    side = narrow ? 90 : 130,
    x = 30,
    y = 53;
  const dx = narrow ? 190 : 390,
    big = side * Math.SQRT2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${y + big + 65}" class="mr-drawing" role="img" aria-label="A unit square of area one and a square on its diagonal of area two, drawn at the same scale. The areas share a measure even though the side lengths do not."><title>Commensurable in square, incommensurable in length</title>
<rect x="${x}" y="${y}" width="${side}" height="${side}" class="mr-square"/><path d="M${x},${y + side}l${side},-${side}" class="mr-diagonal"/>
${text(x, y - 17, "AREA = 1", "mr-svg-label")}${text(x, y + side + 27, "side = 1", "mr-svg-note")}
<rect x="${dx}" y="${y}" width="${big}" height="${big}" class="mr-square"/><path d="M${dx},${y + big}l${big},-${big}" class="mr-tick"/>
${text(dx, y - 17, "AREA = 2", "mr-svg-label")}${text(dx, y + big + 27, "side = √2", "mr-svg-note")}</svg>`;
}

export function comparisonNote(s: MeasureState): string {
  const r = length(BigInt(s.n), 0n, BigInt(s.d));
  const difference = approximate(subtractForComparison(r));
  return `At four decimals: diagonal ${approximate(diagonal).toFixed(4)}; fraction ${approximate(r).toFixed(4)}. Their signed length difference (fraction − diagonal) is ${decimal(difference)} original side units. These are distinct exact inputs, even if a ruler cannot resolve the difference.`;
}
function subtractForComparison(r: ReturnType<typeof length>) {
  // Keep cancellation in exact arithmetic before the stable display conversion.
  return length(r.a, -r.d, r.d);
}
export function recurrenceDrawing(narrow = false): string {
  const w = narrow ? 420 : 800,
    x = 30,
    width = w - 60;
  const k = Math.SQRT2 - 1;
  const rows = [
    [1, "1"],
    [k, "k = √2 − 1"],
    [k * k, "k² = 3 − 2√2"],
  ] as const;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 235" class="mr-drawing" role="img" aria-label="Lengths one, k, and k squared on a shared scale. Multiplication by k takes the first pair to the next pair."><title>The same pair, scaled by a positive factor smaller than one</title>${rows.map(([value, label], i) => `${text(x, 25 + 73 * i, label, "mr-svg-note")}<rect x="${x}" y="${36 + 73 * i}" width="${width * value}" height="20" class="mr-small"/>`).join("")}</svg>`;
}
