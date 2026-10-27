import license from "../LICENSE?raw";
import { ratioBoundary, ratioPassages, ratioSourceUrl } from "./content/ratios";
import {
  encodeRatios,
  type RatioState,
  ratioPages,
  ratioSourceFile,
  ratiosCsv,
  ratiosJson,
  ratioTrial,
  relationSymbol,
  scanRatios,
} from "./core/ratios";
import { escapeHtml as esc } from "./html";
import css from "./ratios.css?inline";
import {
  ratioArithmetic,
  ratioConclusion,
  ratioLabels,
  ratioMap,
  ratioMicroscope,
  ratioPlate,
  ratioProof,
} from "./ratios-drawing";
import { studyAssetIdentity, studyDataUrl, studyText } from "./study-assets";
import baseCss from "./style.css?inline";

export function ratioReading(index: number, interactive = false): string {
  const p = ratioPassages[index];
  if (!p) throw new Error("Unknown ratio reading.");
  const words = interactive
    ? `<div class="rt-word-buttons" role="group" aria-label="Words in this reading">${p.words.map((w, i) => `<button type="button" data-rt-word="${i}" lang="grc" aria-controls="rt-word-note">${esc(w.greek)}</button>`).join("")}</div><p class="rt-word-note" id="rt-word-note" aria-live="polite">Choose a Greek word for its contextual meaning and Latin counterpart.</p>`
    : `<dl class="rt-words">${p.words.map((w) => `<div><dt><span lang="grc">${esc(w.greek)}</span> / <span lang="la">${esc(w.latin)}</span></dt><dd>${esc(w.meaning)}</dd></div>`).join("")}</dl>`;
  return `<p class="rt-kicker">${esc(p.location)}</p><h3>${index + 1}. ${esc(p.title)}</h3><div class="rt-reading-grid"><div><p class="rt-kicker">GREEK · PRINTED P.${p.pages[0]}</p><p lang="grc">${esc(p.greek)}</p></div><div><p class="rt-kicker">HEIBERG’S LATIN · PRINTED P.${p.pages[1]}</p><p lang="la">${esc(p.latin)}</p></div></div><p class="rt-translation">${esc(p.english)}</p><p>${esc(p.note)}</p>${words}`;
}

export async function ratiosStudy(s: RatioState): Promise<string> {
  const [font, ofl, ...images] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    ...ratioPages.map((p) => studyDataUrl(ratioSourceFile(p), "image/jpeg")),
  ]);
  const scan = scanRatios(s),
    t = ratioTrial(s);
  const native = (mime: string, body: string) =>
    `data:${mime};charset=utf-8,${encodeURIComponent(body)}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; object-src 'none'; base-uri 'none'"/><title>Thousands agree. One can disagree. · Stoicheia</title><style>@font-face{font-family:'Noto Serif';src:url('${font}')}${baseCss.replace(/@font-face\s*\{[^}]*\}/g, "")}${css}</style></head><body class="ratios-page rt-retained"><main><section class="rt-intro"><div><p class="rt-kicker">EUCLID V.5 / RETAINED EXPERIMENT</p><h1>Thousands agree.<br>One can disagree.</h1></div><div class="rt-lead"><p>${esc(ratioLabels(s))}. Multipliers m = ${s.m}, n = ${s.n}.</p><p>${esc(ratioBoundary)}</p></div></section><section class="rt-bench"><h2>The selected equimultiples</h2><div class="rt-plate">${ratioPlate(s)}<div class="rt-signs"><p>First comparison<strong>mA ${esc(relationSymbol(t.first))} nB</strong></p><p>Second comparison<strong>mC ${esc(relationSymbol(t.second))} nD</strong></p></div><div class="rt-microscope">${ratioMicroscope(s)}</div></div><p class="rt-verdict">${esc(ratioConclusion(s))}</p><p>Each pair uses its own drawing scale. Comparisons are within a pair, not between the two panels. Narrow gaps may be smaller than a pixel. More than 32 copies are shown as a continuous band rather than individual ticks.</p>${ratioArithmetic(s)}</section><section class="rt-section"><h2>The finite search square</h2><p>All positive integers m and n from 1 through ${s.bound}: ${scan.checked.toLocaleString("en-US")} exact comparisons, ${scan.disagreements.toLocaleString("en-US")} ${scan.disagreements === 1 ? "disagreement" : "disagreements"}. ${scan.first ? `First in m-then-n order: m=${scan.first.m}, n=${scan.first.n}.` : "No counterexample occurs in this finite square. This does not establish equality for every pair."}</p><div class="rt-map">${ratioMap(s)}</div><p>Blue denotes agreeing comparisons; rust denotes disagreements. The dashed ring locates the first disagreement; the solid ring locates the selected comparison if inside the square. Rings are locators, not extra cells. The search is a calculated set, not a record of comparisons individually performed by a learner.</p>${ratioProof(s)}</section><section class="rt-section"><h2>Read the condition</h2>${ratioPassages.map((_, i) => `<article class="rt-full-reading">${ratioReading(i)}</article>`).join("")}</section><section class="rt-section"><h2>The complete printed evidence</h2><p>J. L. Heiberg, <cite>Euclidis opera omnia, Elementa</cite>, volume II, Leipzig: B. G. Teubner, 1884. Title and printed pp.2–5, corresponding to PDF pp.7 and 28–31. University of Toronto, Gerstein Science Information Centre copy, digitized by Internet Archive. Public domain.</p><p>Whole pages are reduced without cropping or retouch. Line wrapping and end-of-line hyphenation are removed in the reading; Greek theta glyphs are normalized. Latin u/v spellings remain. Superscript note markers and apparatus omitted from selections remain in these pages. Definitions 3–7 are transcribed in full across reading units; two units revisit selected clauses of V.5. The Latin excerpt in “Whatever multiplication” is explicitly a surrounding clause rather than an invented phrase. Footnotes containing algebra on pp.3 and 5 belong to the modern editor. New English and language notes have not had independent philological peer review.</p><p><a href="${ratioSourceUrl}">Complete original source PDF</a></p>${ratioPages.map((p, i) => `<figure class="rt-source-sheet"><img src="${images[i]}" width="${p ? 1136 : 897}" height="${p ? 1800 : 1400}" alt="Complete ${p ? `${p % 2 ? "Latin" : "Greek"} printed page ${p}` : "1884 volume II title page"}, including original markings and notes."/><figcaption>${p ? `Printed p.${p} · PDF p.${p + 26}` : "Title · PDF p.7"} · SHA-256 ${studyAssetIdentity(ratioSourceFile(p)).sha256}</figcaption></figure>`).join("")}</section><section class="rt-section"><h2>Reopen the experiment</h2><p class="rt-native"><a href="${esc(native("application/json", ratiosJson(s)))}" download="stoicheia-ratios.json">Save embedded editable JSON</a> · <a href="${esc(native("text/csv", ratiosCsv(s)))}" download="stoicheia-ratios.csv">Save embedded comparison and search CSV</a></p><pre id="rt-saved-record">${esc(ratiosJson(s))}</pre><p>The CSV separates the selected comparison from inclusive n-intervals containing every disagreement for each m in the bounded search. It does not assert a learner action history. The JSON stores settings; the arithmetic is recomputed on import.</p><p><a href="https://antonsoo.github.io/stoicheia/ratios.html${esc(encodeRatios(s))}">Reopen these settings in the workshop</a>. This app link requires the corresponding workshop build. This retained reading itself needs no scripts or network subresources.</p><div class="rt-print-license"><pre>${esc(license)}</pre><p>Bundled Noto Serif: SIL Open Font License 1.1, complete text embedded below.</p></div><details class="rt-license"><summary>Complete code and font licenses</summary><pre>${esc(license)}\n${esc(ofl)}</pre></details></section></main></body></html>`;
}
