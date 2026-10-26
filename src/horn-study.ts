import license from "../LICENSE?raw";
import { hornBoundary, hornPassages } from "./content/horn";
import { exact } from "./core/circle";
import {
  encodeHorn,
  type HornState,
  hornJson,
  hornPages,
  hornVerdict,
  hornWitness,
} from "./core/horn";
import css from "./horn.css?inline";
import {
  hornCertificate,
  hornDetail,
  hornOverview,
  hornProof,
  hornScaleCaption,
} from "./horn-drawing";
import { escapeHtml as esc } from "./html";
import { studyAssetIdentity, studyDataUrl, studyText } from "./study-assets";

export function hornReading(index: number): string {
  const p = hornPassages[index];
  if (!p) throw new Error("Unknown horn-angle reading.");
  return `<h3>${index + 1}. ${esc(p.title)}</h3><div class="hn-reading-columns"><div><p class="hn-kicker">GREEK · P.${p.pages[0]}</p><p lang="grc">${esc(p.greek)}</p></div><div><p class="hn-kicker">${esc(p.latinRole)} · P.${p.pages[1]}</p><p lang="la">${esc(p.latin)}</p></div></div><p>${esc(p.english)}</p><p class="hn-fine">${esc(p.note)}</p><dl class="hn-words">${p.words.map((w) => `<div><dt><span lang="grc">${esc(w.greek)}</span> / <span lang="la">${esc(w.latin)}</span></dt><dd>${esc(w.english)}</dd></div>`).join("")}</dl>`;
}
export function hornSourceProof(): string {
  return `<div class="hn-source-proof"><div><h3>The source argues by contradiction</h3><ol class="hn-proof-steps"><li>First establish that the perpendicular at A lies outside the circle: a second meeting would give an isosceles triangle with two right angles.</li><li>Suppose a different line through A could stay between that tangent and the circumference. Drop the perpendicular ΔH from the centre to the proposed line.</li><li>The right triangle gives ΔH &lt; ΔA, so H is closer to the centre than the circle’s radius.</li><li>But the proposed line was supposed to lie outside: the radius ΔΘ on the way from Δ to H would be shorter than ΔH. Since ΔA = ΔΘ, that contradicts step 3.</li></ol></div><div><h3>What the experiment adds</h3><p>Our realizable diagram puts H where it actually belongs: inside the circle for every positive candidate slope. It does not redraw the source’s impossible supposition as though its lengths were consistent.</p><p>The coordinate calculation is modern. It confirms the selected rational slope exactly and displays a formula valid for every positive slope. The source’s universal claim comes with its geometric argument; a finite collection of tiny lines is not its proof.</p><p>The semicircle’s curved angle and the remaining curved gap are not assigned degree values. The displayed angle measures only the candidate ray against the tangent. This room does not define addition of curved angles or a system of infinitesimal numbers.</p></div></div>`;
}
export function hornCsv(s: HornState): string {
  const w = hornWitness(s);
  const rows = [
    ["quantity", "exact_value", "meaning"],
    ["rise_p", String(s.rise), "forward ray (q*t,p*t), t>=0"],
    ["run_q", String(s.run), "positive horizontal direction"],
    ["slope", exact(w.slope), "rise / run"],
    ["relation", w.relation, "cuts, tangent, or away from proposed gap"],
    ["foot_x", exact(w.foot.x), "H on full line"],
    ["foot_y", exact(w.foot.y), "H on full line"],
    ["foot_parameter", exact(w.footParameter), "positive iff H lies forward"],
    ["centre_distance_squared", exact(w.centreDistanceSquared), "Delta-H squared"],
    [
      "radius_squared_minus_distance_squared",
      exact(w.radiusSquaredMinusDistanceSquared),
      "positive iff H strictly inside circle",
    ],
    ["second_x", exact(w.second.x), "K on full line; same as A for tangent"],
    ["second_y", exact(w.second.y), "K on full line; same as A for tangent"],
    ["second_parameter", exact(w.secondParameter), "positive iff second crossing lies forward"],
    [
      "source",
      "Euclid III.16; Heiberg 1883 I pp.208-213",
      "modern coordinate witness, not an ancient coordinate calculation",
    ],
  ];
  return `${rows.map((r) => r.map((v) => `"${v.replaceAll('"', '""')}"`).join(",")).join("\r\n")}\r\n`;
}
export async function hornSvg(s: HornState): Promise<string> {
  const [font, ofl] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
  ]);
  const nested = (svg: string, offset: number) =>
    svg.replace('viewBox="', `x="${offset}" y="0" width="640" height="450" viewBox="`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 490" role="img" aria-label="Euclid III.16: equal-scale overview and local crop"><metadata>${esc(`${hornJson(s)}\n${hornBoundary}\n${license}\n${ofl}`)}</metadata><defs><style>@font-face{font-family:'Noto Serif';src:url('${font}')}svg{background:#fbfcfe}${esc(css)}</style></defs>${nested(hornOverview(s), 0)}${nested(hornDetail(s), 640)}<text x="32" y="475" font-family="Noto Serif,serif" font-size="16" fill="#193d60">Rise ${s.rise}; run ${s.run}. Each plate has equal horizontal and vertical scales; their magnifications differ.</text></svg>`;
}
export async function hornStudy(s: HornState): Promise<string> {
  const [font, ofl, ...images] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    ...hornPages.map((p) => studyDataUrl(`sources/horn/heiberg-${p}.jpg`, "image/jpeg")),
  ]);
  const data = (type: string, body: string) =>
    `data:${type};charset=utf-8,${encodeURIComponent(body)}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:; base-uri 'none'; form-action 'none'"/><title>A line that will not fit · Stoicheia reading</title><style>@font-face{font-family:'Noto Serif';src:url('${font}')} ${css} a{color:inherit;text-underline-offset:3px}</style></head><body class="horn-page hn-retained"><main><header class="hn-intro"><div><p class="hn-kicker">EUCLID III.16 / SAVED EXPERIMENT</p><h1>A line that<br>will not fit.</h1></div><div><p>Rise ${s.rise}, run ${s.run}. Selected witness: ${s.focus === "foot" ? "the perpendicular foot" : "the second crossing"}.</p><p>${esc(hornVerdict(s))}</p><p class="hn-fine">${esc(hornBoundary)}</p></div></header><section class="hn-bench"><div class="hn-plates"><figure class="hn-plate"><h3>The whole circle</h3>${hornOverview(s)}<figcaption>Tan marks part of the curved gap. Purple: the proposed forward ray; a dashed part is its backward extension.</figcaption></figure><figure class="hn-plate"><h3>The perpendicular foot, enlarged</h3>${hornDetail(s)}<figcaption>${hornScaleCaption(s)} The two plates have different magnifications.</figcaption></figure></div><div class="hn-proof-bench"><div>${hornCertificate({ ...s, focus: "crossing" })}</div><div>${hornProof({ ...s, focus: "foot" })}${hornProof({ ...s, focus: "crossing" })}</div></div></section><section class="hn-section"><h2>Why no line fits</h2>${hornSourceProof()}</section><section class="hn-section"><h2>Eight readings, including the bracket</h2>${hornPassages.map((_, i) => `<article class="hn-reading hn-full-passage">${hornReading(i)}</article>`).join("")}</section><section class="hn-section"><h2>The complete printed witness</h2><p>Heiberg, 1883, volume I, printed pp.208–213. PDF pages 222–227. Complete pages reduced without cropping or retouching. The source diagram depicts the hypothetical line; our realizable trial is reflected and adds Κ. The bracketed corollary and its Latin editorial note remain distinct.</p><p><a href="https://archive.org/download/euclidisoperaomn01eucluoft/euclidisoperaomn01eucluoft.pdf">Complete public-domain source PDF</a></p>${hornPages.map((p, i) => `<figure class="hn-source-sheet"><img src="${images[i]}" width="1146" height="1800" alt="Complete ${p % 2 ? "Latin" : "Greek"} printed page ${p}, including editorial notes."/><figcaption>Printed p.${p} · PDF p.${p + 14} · SHA-256 ${studyAssetIdentity(`sources/horn/heiberg-${p}.jpg`).sha256}</figcaption></figure>`).join("")}</section><section class="hn-section"><h2>Keep the editable record</h2><p class="hn-native-links"><a download="stoicheia-horn.json" href="${esc(data("application/json", hornJson(s)))}">Save embedded editable JSON</a> · <a download="stoicheia-horn.csv" href="${esc(data("text/csv", hornCsv(s)))}">Save embedded exact CSV</a></p><pre id="hn-saved-record">${esc(hornJson(s))}</pre><p><a href="https://antonsoo.github.io/stoicheia/horn.html${esc(encodeHorn(s))}">Reopen this experiment in the published workshop</a></p><p class="hn-fine">The reading contains no scripts or remote subresources. Its native data links work without the app. The app link needs the published workshop.</p><div class="hn-print-license"><pre>${esc(license)}</pre><p>Noto Serif, SIL Open Font License 1.1. The complete font license is retained in the illustrated HTML.</p></div><details class="hn-license"><summary>Code, diagrams and font licenses</summary><pre>${esc(license)}\n${esc(ofl)}</pre></details></section></main></body></html>`;
}
