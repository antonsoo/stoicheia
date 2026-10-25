import license from "../LICENSE?raw";
import { measureBoundary, measurePassages } from "./content/measure";
import {
  approximate,
  commonMeasure,
  divisions,
  encodeMeasure,
  exact,
  type MeasureState,
  measurePages,
  remainderNow,
} from "./core/measure";
import { escapeHtml as esc } from "./html";
import css from "./measure.css?inline";
import {
  comparisonNote,
  comparisonTable,
  measureDrawing,
  measureLedger,
  overviewDrawing,
  recurrenceDrawing,
  squareDrawing,
  tilingDrawing,
} from "./measure-drawing";
import { studyAssetIdentity, studyDataUrl, studyText } from "./study-assets";

export function measureCsv(s: MeasureState): string {
  const header = [
    "original_kind",
    "comparison_numerator",
    "comparison_denominator",
    "turn",
    "fitted_count",
    "turn_complete",
    "A_exact",
    "A_a",
    "A_b",
    "A_denominator",
    "B_exact",
    "B_a",
    "B_b",
    "B_denominator",
    "remaining_exact",
    "remaining_a",
    "remaining_b",
    "remaining_denominator",
    "remaining_decimal_approximation",
    "unit",
    "selected_reading_1_based",
    "selected_printed_page",
  ];
  const rows = divisions(s)
    .slice(0, s.row + 1)
    .map((r) => {
      const current = r.index === s.row,
        copies = current ? s.copies : r.q;
      const left = current ? remainderNow(s) : r.r;
      return [
        s.kind,
        s.n,
        s.d,
        r.index + 1,
        copies,
        copies === r.q,
        exact(r.a),
        r.a.a,
        r.a.b,
        r.a.d,
        exact(r.b),
        r.b.a,
        r.b.b,
        r.b.d,
        exact(left),
        left.a,
        left.b,
        left.d,
        approximate(left),
        "original square side = 1; exact length = (a + b*sqrt(2))/denominator",
        s.passage + 1,
        s.page,
      ];
    });
  return `${[header, ...rows].map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\r\n")}\r\n`;
}
export function measureSvg(s: MeasureState): string {
  return measureDrawing(s).replace(
    "<title>",
    `<metadata>${esc(license)} Modern exact-length illustration of Euclid X.2–3; local magnification, original side = 1. No physical accuracy claim.</metadata><style>${esc(css)}</style><title>`,
  );
}
const both = (draw: (narrow: boolean) => string) =>
  `<div class="mr-wide">${draw(false)}</div><div class="mr-narrow">${draw(true)}</div>`;
export async function measureStudy(s: MeasureState): Promise<string> {
  const [font, fontLicense, ...images] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    ...measurePages.map((p) =>
      studyDataUrl(`sources/measure/heiberg-${String(p).padStart(3, "0")}.jpg`, "image/jpeg"),
    ),
  ]);
  const m = commonMeasure(s),
    link = `https://antonsoo.github.io/stoicheia/measure.html${encodeMeasure(s)}`;
  const csv = `data:text/csv;charset=utf-8,${encodeURIComponent(measureCsv(s))}`;
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"/><title>A measure in common · Saved reading</title><style>@font-face{font-family:"Noto Serif";src:url("${font}")}*{box-sizing:border-box}p{line-height:1.7}${css}</style></head><body class="mr-saved measure-page"><main>
<header><p class="mr-kicker">STOICHEIA / EUCLID X.2–3</p><h1>A measure in common.</h1><p>Saved turn ${s.row + 1}; ${s.copies} copies fitted. Original longer length: ${s.kind === "diagonal" ? "the square diagonal √2" : `exact fraction ${s.n}/${s.d}`}. The original square side is one length unit. Selected reading ${s.passage + 1}; independently selected printed source p.${s.page}.</p><p><a href="${esc(link)}">Continue this experiment in the app</a> · <a download="stoicheia-common-measure.csv" href="${esc(csv)}">Save this exact record as CSV</a></p></header>
<section class="mr-section"><h2>The turn you saved</h2>${both((n) => measureDrawing(s, n))}<p>The current uncut length is <strong>${esc(exact(remainderNow(s)))}</strong>. Local magnification makes the longer A fill the drawing at every turn. It does not keep the original ruler’s scale.</p>${m ? `<p>The exact zero remainder establishes a common measure ${esc(exact(m.unit))}: it fits the original longer length ${m.longCount} times and the side ${m.shortCount} times. Working backward proves it measures both. Every other common measure must measure this final nonzero B, so none is larger.</p>${both((n) => tilingDrawing(s, n))}` : `<p>This is an unfinished run. It has not established that the process never stops. ${s.kind === "diagonal" ? "The separate recurrence argument below establishes that condition for the diagonal." : "A rational input does have a common measure, which this selected run has not yet reached."}</p>`}
<h3>All visited measures, on the original scale</h3>${both((n) => overviewDrawing(s, n))}<p>A cross marks a positive length narrower than one SVG drawing unit. Its width is a locator, not the length. Exact expressions retain what a pixel cannot show.</p><div class="mr-scroll">${measureLedger(s)}</div></section>
<section class="mr-section"><h2>Agreement through finitely many turns</h2><p>${esc(comparisonNote(s))}</p><p>The following separate comparison calculates both examples through your current turn, including its full division. It does not replace the partial copies in your saved record.</p><div class="mr-scroll">${comparisonTable(s)}</div></section>
<section class="mr-section"><h2>A reason for every later diagonal turn</h2><p>This is a modern specialization of the condition in X.2. Write k = √2 − 1, so 0 &lt; k &lt; 1. The first subtraction leaves k and produces the pair (1, k). Exactly two k fit into 1, because 1/k = 1 + √2 is strictly between 2 and 3. The remainder is 1 − 2k = 3 − 2√2 = k² &gt; 0.</p>${both(recurrenceDrawing)}<p>The new pair (k, k²) equals k × (1, k). Multiplying both lengths by the same positive number preserves the copy count and gives a positive scaled remainder. The same argument applies again after any finite number of turns: zero is never reached. The finite experiment is limited to twenty-four turns; this identity supplies the infinite condition.</p><p>If a positive length E measured both originals, it would also measure every remainder, because a whole multiple can be subtracted without losing that property. Every nonzero grouped remainder is less than half the longer input: if B ≤ A/2, then R &lt; B ≤ A/2; otherwise q = 1 and R = A − B &lt; A/2. Repeated turns eventually leave a positive remainder smaller than E, which cannot contain even one E. X.2’s contradiction therefore rules out the supposed common length measure.</p><h3>Yet the squares share an area measure</h3>${both(squareDrawing)}<p>The squares on the side and diagonal have areas one and two in side-square units. They are commensurable in square, in the sense of Book X’s second definition. This does not supply a common measure of the two lengths.</p></section>
<section class="mr-section"><h2>Read the selected passages</h2>${measurePassages.map((p, i) => `<article><p class="mr-kicker">${esc(p.location)}</p><h3>${i + 1}. ${esc(p.title)}</h3><div class="mr-languages"><div><h4>GREEK</h4><p lang="grc">${esc(p.greek)}</p></div><div><h4>HEIBERG’S LATIN · 1886</h4><p lang="la">${esc(p.latin)}</p></div><div><h4>NEW ENGLISH READING</h4><p>${esc(p.english)}</p></div></div><h4>${esc(p.word)}</h4><p>${esc(p.note)}</p><p>Printed pp.${p.pages.join("–")}.</p></article>`).join("")}</section>
<section class="mr-section"><h2>Source and model boundaries</h2><p>${esc(measureBoundary)}</p><p>J. L. Heiberg, <cite>Euclidis opera omnia</cite>, vol.III, Leipzig: B. G. Teubner, 1886, pp.2–13. <a href="https://www.wilbourhall.org/pdfs/HeibergEuclidVolume_3.pdf">Complete source PDF</a>. Definition I.1 and the opening clause of I.2, selected clauses from X.2, and X.3’s statement appear in the reading. Full scans include X.1 and the continuing proof of X.3. Handwriting in the scanned copy is not part of the typeset text.</p><p>Line wrapping and end-of-line hyphenation are removed; geometric labels use Greek Unicode. Heiberg’s Latin u/v spelling and the Greek editorial brackets remain. Apparatus and inline reference markers omitted in selections remain in the whole-page images. English translations and grammar notes have not had independent philological peer review.</p><p>All subtraction counts, signs and zero decisions use exact BigInt arithmetic on (a + b√2)/d. Decimal values and SVG positions are rounded. The export records completed earlier turns and the actual partial current turn, without inventing further performed operations. The comparison table and recurrence proof are separate calculations. No physical instrument tolerance or ancient measurement accuracy is modeled.</p><p>This HTML embeds its twelve pages and local font; it has no scripts or network subresources. External links need a connection. Print formatting and PDF inspection do not establish a physical print’s dimensions or accessibility tagging.</p></section>
${measurePages.map((p, i) => `<figure class="mr-source-sheet"><figcaption>Heiberg 1886 · volume III · printed p.${p} · ${p % 2 ? "Latin" : "Greek"} · PDF page ${p + 13} (one-based)</figcaption><img src="${images[i]}" alt="Complete printed page ${p}, including apparatus and scanned annotations"/><figcaption>Image SHA-256 ${studyAssetIdentity(`sources/measure/heiberg-${String(p).padStart(3, "0")}.jpg`).sha256}</figcaption></figure>`).join("")}
<section class="mr-section"><h2>Licenses</h2><p>Ancient Greek, Heiberg’s 1886 Latin and public-domain printed pages: public domain. Original code, diagrams, English and teaching notes: MIT. Scans of the University of Michigan copy, digitized by Google; markings and watermark retained.</p><pre class="mr-license">${esc(license)}</pre><h3>Noto Serif · SIL Open Font License</h3><pre class="mr-license">${esc(fontLicense)}</pre></section></main></body></html>`;
}
