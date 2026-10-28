import license from "../LICENSE?raw";
import css from "./areas.css?inline";
import {
  areaGraph,
  areaIdentity,
  areaLedger,
  areaPlate,
  areaResult,
  areaShape,
  areaSolutions,
  areaSvg,
} from "./areas-drawing";
import { areaBoundary, areaReadings, areaSourceUrl } from "./content/areas";
import {
  type AreaState,
  areaPages,
  areaSourceFile,
  areasCsv,
  areasJson,
  encodeAreas,
} from "./core/areas";
import { escapeHtml as esc } from "./html";
import { studyAssetIdentity, studyDataUrl, studyText } from "./study-assets";
import baseCss from "./style.css?inline";

// The standalone reading must not retain the app's root-relative font request.
const readingCss = baseCss.replace(/@font-face\s*\{[^}]*\}/g, "");

export function areaReading(index: number): string {
  const p = areaReadings[index];
  if (!p) throw new Error("Unknown application-of-areas reading.");
  return `<p class="ar-label">${esc(p.location)}</p><h3>${index + 1}. ${esc(p.title)}</h3><div class="ar-languages"><div><p class="ar-fine">Greek · p.${p.pages[0]}</p><p lang="grc">${esc(p.greek)}</p></div><div><p class="ar-fine">Heiberg’s Latin · p.${p.pages[1]}</p><p lang="la">${esc(p.latin)}</p></div></div><p class="ar-english">${esc(p.english)}</p><p>${esc(p.note)}</p><dl class="ar-words">${p.words.map(([g, l, e]) => `<dt><span lang="grc">${esc(g)}</span> / <span lang="la">${esc(l)}</span></dt><dd>${esc(e)}</dd>`).join("")}</dl>`;
}
const data = (type: string, value: string) =>
  `data:${type};charset=utf-8,${encodeURIComponent(value)}`;
export async function areasStudy(s: AreaState): Promise<string> {
  const snapshot = { ...s };
  const [font, ofl, manifest, ...images] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    studyText("sources/areas/manifest.json"),
    ...areaPages.map((p) => studyDataUrl(areaSourceFile(p), "image/jpeg")),
  ]);
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'; object-src 'none'; base-uri 'none'; form-action 'none'"/><title>Two fits. One limit. · Euclid VI.27–29</title><style>@font-face{font-family:'Noto Serif';src:url('${font}')} ${readingCss}\n${css}</style></head><body class="areas-page ar-saved"><main><header class="ar-intro"><div><p class="ar-label">Stoicheia / Euclid VI.27–29</p><h1>Two fits.<br/>One limit.</h1></div><div><p>Saved application-of-areas experiment: ${s.mode === "short" ? "falling short" : "exceeding"}, given line ${s.base}, target area ${esc(s.target)}, trial ${esc(s.trial)}.</p><p>${esc(areaBoundary)}</p></div></header><section class="ar-section"><h2>Your trial and the prescribed shape</h2>${areaPlate(snapshot)}<div class="ar-saved-shape">${areaShape(snapshot)}</div><p>Blue is the part within the line; hatching is ${s.mode === "short" ? "the excluded shortfall" : "the excess included in the applied area"}. The plates use equal horizontal and vertical units. The shape’s k is vertical height divided by base. Shear changes the given shape; at each fixed shear, all hatched regions are scaled copies of that shape.</p>${areaResult(snapshot)}<div class="ar-table">${areaLedger(snapshot)}</div></section><section class="ar-section"><h2>Possible fits</h2>${areaGraph(snapshot)}${areaSolutions(snapshot, false)}${areaIdentity(snapshot)}</section><section class="ar-section"><h2>Read the construction conditions</h2><p>Nine selected readings with eighteen contextual word notes. These do not replace the complete source pages below.</p>${areaReadings.map((_, i) => `<article class="ar-reading-full">${areaReading(i)}</article>`).join("")}</section><section class="ar-section"><h2>Keep and reopen the work</h2><p><a download="stoicheia-areas.json" href="${esc(data("application/json", areasJson(snapshot)))}">Save editable JSON</a> · <a download="stoicheia-areas.csv" href="${esc(data("text/csv", areasCsv(snapshot)))}">Save exact CSV</a> · <a download="stoicheia-areas.svg" href="${esc(data("image/svg+xml", areaSvg(snapshot, font, license, ofl)))}">Save font-embedded SVG</a> · <a download="stoicheia-areas-sources.json" href="${esc(data("application/json", manifest))}">Save source identities</a></p><pre>${esc(areasJson(snapshot))}</pre><p><a href="https://antonsoo.github.io/stoicheia/areas.html${esc(encodeAreas(snapshot))}#ar-bench">Reopen these settings in the app</a>. This external link needs a connection. This reading’s text, diagrams, images, font, native downloads and licenses need none.</p></section><section class="ar-section"><h2>Fifteen whole source pages</h2><p>Euclid, <cite>Euclidis opera omnia</cite>, vol. II, edited and translated into Latin by J. L. Heiberg. Leipzig: B. G. Teubner, 1884. Printed pp.158–171 include VI.27–29 and adjacent text. Title: PDF p.7. Numbered print pages plus 26 give the one-based PDF page. <a href="${areaSourceUrl}">Complete original volume</a>.</p><p>Line wrapping and line-end hyphens are joined, theta glyphs normalized, apparatus and superscript references omitted in selections. Editorial square brackets remain. Latin geometric letters use Greek Unicode; u/v spelling remains. The original images retain all marks and apparatus. Source PDF SHA-256: cd24f03c6e4e6d5f30a908d144c8f0f7003e99813334edb3a4107d748cb41043.</p>${areaPages.map((p, i) => `<figure class="ar-whole-page"><img src="${images[i]}" alt="Complete ${p ? `printed ${p % 2 ? "Latin" : "Greek"} page ${p}` : "1884 volume II title"}, including original marks and apparatus"/><figcaption>${p ? `Printed p.${p} · PDF p.${p + 26}` : "Title · PDF p.7"} · SHA-256 ${studyAssetIdentity(areaSourceFile(p)).sha256}</figcaption></figure>`).join("")}</section><section class="ar-section"><h2>Licenses and limits</h2><p>The experiment operates a coordinate family of parallelograms; it does not perform every compass-and-straightedge step or reconstruct ancient instruments. Numerical graph pixels and approximate root labels are display aids. Fractions determine exact areas, root type and certified bounds. Input limits: integer line 4–24, positive target at most 4096, denominator at most 1,000,000, shortfall 0–a or extension 0–128. Zero-area endpoints are labeled degeneracies.</p><p>New work is MIT licensed; historical text and scans are public domain. Noto Serif uses SIL OFL 1.1. Physical print precision, independent philological review and comprehensive assistive-technology review are not claimed.</p><details open><summary>Complete project and font licenses</summary><pre>${esc(license)}\n${esc(ofl)}</pre></details></section></main></body></html>`;
}
