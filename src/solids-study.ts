import license from "../LICENSE?raw";
import { solidPassages, solidsBoundary, solidsSourceUrl } from "./content/solids";
import {
  encodeSolids,
  type SolidState,
  selectedMesh,
  solidMesh,
  solidPages,
  solidSourceFile,
  solidsCsv,
  solidsJson,
  vertexTrial,
} from "./core/solids";
import { escapeHtml as esc } from "./html";
import css from "./solids.css?inline";
import {
  inferenceReading,
  meshMetrics,
  solidConclusion,
  solidFan,
  solidsComparison,
  solidsVertexTable,
  tetrahedronSheet,
  uniformSummary,
} from "./solids-drawing";
import { studyAssetIdentity, studyDataUrl, studyText } from "./study-assets";
import baseCss from "./style.css?inline";

export function solidReading(index: number): string {
  const p = solidPassages[index];
  if (!p) throw new Error("Unknown solid reading.");
  return `<p class="sl-kicker">${esc(p.location)}</p><h3>${index + 1}. ${esc(p.title)}</h3><div class="sl-reading-grid"><div><p class="sl-kicker">GREEK · P.${p.pages[0]}</p><p lang="grc">${esc(p.greek)}</p></div><div><p class="sl-kicker">HEIBERG’S LATIN · P.${p.pages[1]}${p.latinContinuation ? ` AND P.${p.latinContinuation}` : ""}</p><p lang="la">${esc(p.latin)}</p></div></div><p class="sl-translation">${esc(p.english)}</p><p class="sl-reading-note">${esc(p.note)}</p><div class="sl-word"><p><span lang="grc">${esc(p.word)}</span> / <span lang="la">${esc(p.counterpart)}</span></p><p>${esc(p.meaning)}</p></div>`;
}
export function solidRecord(s: SolidState): string {
  const t = vertexTrial(s.p, s.q),
    m = selectedMesh(s);
  return `<p class="sl-equation">${s.q} × ${t.angle}° = ${t.sum}° · deficit ${t.deficit}°</p><p>${esc(solidConclusion(s.p, s.q))}</p><p>Selected model: ${esc(m?.name ?? "no convex uniform example")}; vertex ${s.vertex + 1}; yaw ${s.yaw}°, pitch ${s.pitch}°. The angle arithmetic describes face angles at a vertex, not steradians or dihedral angles.</p>`;
}
export async function solidsStudy(s: SolidState): Promise<string> {
  const [font, ofl, ...images] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    ...solidPages.map((p) => studyDataUrl(solidSourceFile(p), "image/jpeg")),
  ]);
  const data = (mime: string, body: string) =>
    `data:${mime};charset=utf-8,${encodeURIComponent(body)}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; object-src 'none'; base-uri 'none'"/><title>Six faces. Still not one of five. · retained experiment</title><style>@font-face{font-family:'Noto Serif';src:url('${font}')}${baseCss.replace(/@font-face\s*\{[^}]*\}/g, "")}${css}</style></head><body class="solids-page sl-retained"><main><section class="sl-intro"><h1>Six faces.<br>Still not one of five.</h1><div class="sl-lead"><p>${esc(solidsBoundary)}</p></div></section><section class="sl-section"><h2>The chosen corner</h2>${solidRecord(s)}<div class="sl-board">${solidFan(s.p, s.q)}</div><p>The drawing lays actual regular polygon faces in one plane. A gap records missing angle; closing it would move faces out of the plane. An overlap depicts excess angle. A positive deficit alone does not construct a complete solid or establish its uniqueness.</p><p>For q ≥ 3 and p ≥ 6, each face contributes at least 120°; the sum is at least 360°. Only p = 3, 4 or 5 can survive. Two faces are excluded by XI definition 11. The five surviving uniform pairs are ${esc(uniformSummary())}.</p></section><section class="sl-section"><h2>Equal faces do not force equal corners</h2>${solidsComparison(s)}<p>Join two regular tetrahedra along one congruent triangular base. Their two base faces are internal; the outside has six congruent equilateral triangles, nine edges and five vertices. Every edge has length 1 in the bipyramid coordinates. Two tip vertices have three faces and 180° deficits; three belt vertices have four faces and 120° deficits. The face condition alone therefore admits another convex solid. This modern comparison does not decide the ancient author's intended meaning or the textual history of the addendum.</p><div class="sl-table-wrap" tabindex="0" role="region" aria-label="Scrollable joined-solid measurements">${solidsVertexTable(solidMesh("bipyramid"))}</div><p>${esc(meshMetrics(solidMesh("bipyramid")))}</p><div class="sl-table-wrap" tabindex="0" role="region" aria-label="Conditional and actual joined-solid counts">${inferenceReading(solidMesh("bipyramid"), s.example === "bipyramid" ? s.vertex : 0)}</div><p>With a common p and q at every vertex, the necessary face-angle condition leaves five candidate pairs. The complete displayed solids supply examples. Their coordinate meshes and the modern incidence checks are not reconstructions of the constructions in XIII.13–17 or a formal proof of global uniqueness.</p></section><section class="sl-section"><h2>Read the argument</h2>${solidPassages.map((_, i) => `<article class="sl-reading-full">${solidReading(i)}</article>`).join("")}</section><section class="sl-section"><h2>Retained files and a paper experiment</h2><p class="sl-native"><a href="${esc(data("application/json", solidsJson(s)))}" download="stoicheia-solids.json">Save editable JSON</a> · <a href="${esc(data("text/csv", solidsCsv(s)))}" download="stoicheia-solids.csv">Save exact angle CSV</a> · <a href="${esc(data("image/svg+xml", tetrahedronSheet(license)))}" download="stoicheia-two-tetrahedra.svg">Save 40 mm tetrahedron cutting sheet</a></p><p>The CSV enumerates the 70 supported p/q choices; it does not assert that the learner tried them. A separate section retains the selected mesh's actual vertex incidences. The A4 cutting sheet has two four-face nets and a 50 mm calibration bar. Tape their free edges, then place the marked bases together. Physical printing and assembly are unverified.</p><pre>${esc(solidsJson(s))}</pre><p><a href="https://antonsoo.github.io/stoicheia/solids.html${esc(encodeSolids(s))}#sl-bench">Reopen these settings in the corresponding workshop</a>. This link requires the app; this reading's diagrams, pages, font and native downloads need no scripts or network subresources.</p></section><section class="sl-section"><h2>The complete printed evidence</h2><p>J. L. Heiberg, <cite>Euclidis Elementa</cite>, volume IV, Leipzig: B. G. Teubner, 1885. Title, XI definition 11 on pp.4–5, XI.21 on pp.54–59, and the addendum and following lemma on pp.336–341. Digitized Internet Archive copy. The title is PDF page 7; numbered pages are PDF page number minus 10. Whole unretouched pages are reduced to a 2200 px long edge. Text, editorial notes and apparatus remain together.</p><p>Selected passages remove line-end hyphenation, normalize printed theta glyphs and join line breaks. Greek/Latin punctuation is lightly regularized; Latin u/v spellings remain. Superscript reference markers are omitted from the selections. The printed Latin clause in reading 4 continues onto p.339. The addendum's opening is after a divider on pp.336–337; it is not the opening proposition of XIII.18. The lemma ends on pp.340–341. New English and language notes have not had independent philological review.</p><p><a href="${solidsSourceUrl}">Original public-domain volume</a>. ${esc(solidsBoundary)}</p>${solidPages.map((p, i) => `<figure class="sl-source-sheet"><img src="${images[i]}" alt="Complete ${p ? `printed page ${p}` : "1885 volume IV title"}, with original markings and apparatus."/><figcaption>${p ? `Printed p.${p} · PDF p.${p + 10}` : "Title · PDF p.7"} · SHA-256 <span>${studyAssetIdentity(solidSourceFile(p)).sha256}</span></figcaption></figure>`).join("")}</section><section class="sl-section"><h2>Licenses</h2><p>Source pages and historical text are public domain. New code, diagrams, English and notes are MIT licensed. Noto Serif is bundled under the SIL Open Font License 1.1.</p><details class="sl-license" open><summary>Complete MIT and font licenses</summary><pre>${esc(license)}\n${esc(ofl)}</pre></details></section></main></body></html>`;
}
