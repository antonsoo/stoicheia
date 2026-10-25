import license from "../LICENSE?raw";
import css from "./circle.css?inline";
import {
  boundSummary,
  intervalDrawing,
  ledger,
  polygonDrawing,
  proofDrawing,
  squareExplanation,
} from "./circle-drawing";
import { circleBoundary, circlePassages } from "./content/circle";
import {
  audit,
  type CircleState,
  circleJson,
  circlePages,
  encodeCircle,
  exact,
  printed,
} from "./core/circle";
import { escapeHtml as esc } from "./html";
import { studyAssetIdentity, studyDataUrl, studyText } from "./study-assets";

export function circleCsv(s: CircleState): string {
  const rows: (string | number | boolean)[][] = [
    [
      "path",
      "sides",
      "A_exact",
      "H_exact",
      "chosen_Y_exact",
      "scale",
      "radicand_exact",
      "radicand_minus_Y_squared_exact",
      "local_safe",
      "chain_safe",
      "bound_safe",
      "altered",
      "perimeter_candidate_exact",
      "candidate_role",
    ],
  ];
  for (const branch of ["outer", "inner"] as const)
    for (const r of audit(branch, s.alteration))
      rows.push([
        branch,
        r.sides,
        exact(r.a),
        r.h ? exact(r.h) : "",
        r.choice ? exact(r.choice) : "",
        r.base,
        r.radicand ? exact(r.radicand) : "",
        r.squareGap ? exact(r.squareGap) : "",
        r.localSafe,
        r.chainSafe,
        r.boundSafe,
        r.altered,
        exact(r.bound),
        r.boundSafe
          ? branch === "outer"
            ? "certified upper bound"
            : "certified lower bound"
          : "unproved candidate",
      ]);
  rows.push(
    ["selected_stage", s.stage],
    [
      "alteration",
      s.alteration
        ? `${s.alteration.branch}; row ${s.alteration.row}; Y=${s.alteration.value}`
        : "none",
    ],
    [
      "source",
      "Heiberg 1880 vol. I pp.262-271; modern directed-inequality audit of the printed numbers",
    ],
  );
  return (
    rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\r\n") +
    "\r\n"
  );
}
export function proofReading(): string {
  return `<h2>Why an approximation has a direction</h2><div class="ci-proof-grid"><div>${proofDrawing()}<p>A schematic right triangle, with the angle at O bisected at Q. The drawing illustrates the relation; it is not the selected polygon at its current scale.</p></div><div><p>Normalize the outer half-side TP to 1. The radius OT becomes A; the slant OP becomes H. Thus <strong>H² = A² + 1</strong>.</p><p>The angle-bisector theorem gives PQ / QT = H / A, and PQ + QT = 1. Therefore QT = A / (A + H). Divide the smaller triangle's lengths by QT: its adjacent leg becomes <strong>A′ = A + H</strong>, and its hypotenuse becomes <strong>H′ = √(A′² + 1)</strong>.</p><p>Halving the angle doubles the side count. The outer polygon's perimeter / diameter is <strong>n / A</strong>. A similar right triangle subtended by an inner chord gives diameter / chord = H, so the inner polygon's perimeter / diameter is <strong>n / H</strong>.</p></div></div><ol class="ci-reason-list"><li><strong>Outer path:</strong> start below √3. Adding lower estimates stays below the exact sum; choose each new H no larger than √(A² + 1). Inverting A makes n/A an upper estimate of the outer perimeter ratio, which already exceeds C/d.</li><li><strong>Inner path:</strong> start above √3. Add upper estimates and choose H no smaller than √(A² + 1). Inverting H makes n/H a lower estimate of the inner perimeter ratio, which already falls below C/d.</li><li><strong>Compare squares:</strong> all lengths are positive, so Y ≤ √R exactly when Y² ≤ R. No numerical square root is needed to decide. A safe step after an unsafe step cannot restore the proof chain.</li></ol><p>This is a modern unified notation for the two geometric arguments. The printed inner calculation rescales its ratios from 780 to 240, then to 66; exact fractions preserve those equalities. The six-sided seeds use H = 2 exactly. The outer 96-gon needs only A, so no final H is invented.</p>`;
}
export function sourceCautions(): string {
  return `<h3>Read the edition as well as the numbers</h3><p>Pages 264–265 print equality at some approximation steps: in particular 265:153 in place of √3, and 591⅛:153 in place of a hypotenuse ratio. Those cannot be exact equalities: 265² = 70225 whereas 3 × 153² = 70227. The workshop explicitly supplies and verifies sufficient directed inequalities. It does not claim these are the signs printed at every step.</p><p>Page 263's Latin statement prints <i lang="la">sphaerae</i>, ‘of a sphere’, for Greek <span lang="grc">κύκλου</span>, ‘of a circle’. The reader retains both. Adjacent proposition 2 prints the area ratio 11:14; this workshop does not treat it as an exact circle identity. Heiberg's apparatus and notes make the transmitted calculation's editorial difficulties visible. The numbers are an edition's witness, not an autograph of Archimedes.</p>`;
}
export async function circleSvg(s: CircleState): Promise<string> {
  const font = await studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf");
  const source = polygonDrawing(s.stage);
  return source.replace(
    '<g fill="none"',
    `<metadata>${esc(`Stoicheia; ${circleJson(s)}; geometry uses floating point only for drawing; exact proof status is retained in the HTML/CSV export. Original drawing MIT (c) 2026 Anton Soloviev. Noto Serif font SIL OFL 1.1; full license: ${await studyText("fonts/OFL.txt")}`)}</metadata><defs><style>@font-face{font-family:CircleStudy;src:url('${font}')}text{font-family:CircleStudy,serif}</style></defs><g fill="none"`,
  );
}
function scrollTable(table: string, label: string): string {
  return `<div class="ci-scroll" tabindex="0" role="region" aria-label="${esc(label)}">${table}</div>`;
}
export async function circleStudy(s: CircleState): Promise<string> {
  const [font, fontLicense, ...images] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    ...circlePages.map((p) => studyDataUrl(`sources/circle/heiberg-${p}.jpg`, "image/jpeg")),
  ]);
  const data = (type: string, body: string) =>
    `data:${type};charset=utf-8,${encodeURIComponent(body)}`;
  const altered = s.alteration;
  const alteredRow = altered ? audit(altered.branch, altered)[altered.row] : null;
  if (altered && !alteredRow) throw new Error("Missing altered step.");
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'; object-src 'none'; base-uri 'none'; form-action 'none'"/><title>Keep the safe side · Archimedes circle reading</title><style>@font-face{font-family:"Noto Serif";src:url("${font}")}*{box-sizing:border-box}body{margin:0;color:#193d60;background:#e8eff4;font:15px/1.65 system-ui,sans-serif}a{color:inherit}${css}</style></head><body class="circle-page ci-saved"><main><header class="ci-intro"><div><p class="ci-kicker">STOICHEIA / ARCHIMEDES, CIRCLE MEASUREMENT 3</p><h1>Keep the<br>safe side.</h1></div><div><p>A saved experiment at ${6 * 2 ** s.stage} sides. ${altered ? `One altered approximation: ${esc(altered.branch)} path, row ${altered.row + 1}, Y = ${esc(altered.value)}. This trial is kept separate from the printed numbers.` : "The printed numbers are used throughout; every directed inequality is checked exactly."}</p><p><a href="https://antonsoo.github.io/stoicheia/circle.html${esc(encodeCircle(s))}">Open this experiment</a> · <a download="stoicheia-circle.json" href="${esc(data("application/json", circleJson(s)))}">Save editable JSON</a> · <a download="stoicheia-circle.csv" href="${esc(data("text/csv", circleCsv(s)))}">Save the exact ledger</a></p></div></header><section class="ci-section"><div class="ci-saved-plate">${polygonDrawing(s.stage)}${intervalDrawing(s)}</div>${boundSummary(s)}<p>The diagram is unchanged by arithmetic trials. An unproved candidate is not asserted to bound the circumference. A rejected proof does not establish that its final numerical answer is false.</p></section><section class="ci-section"><h2>Your two proof paths</h2>${scrollTable(ledger("outer", altered, s.stage), "outer exact arithmetic")}${scrollTable(ledger("inner", altered, s.stage), "inner exact arithmetic")}${altered && alteredRow ? `<h3>The altered step</h3>${squareExplanation(altered.branch, alteredRow)}` : ""}</section><section class="ci-section"><h2>The printed choices, without your alteration</h2>${scrollTable(ledger("outer", null, s.stage), "outer exact arithmetic")}${scrollTable(ledger("inner", null, s.stage), "inner exact arithmetic")}<p>The source-number 96-gons establish <strong>25344/8069 &lt; C/d &lt; 29376/9347</strong>. These fit strictly within <strong>223/71 &lt; C/d &lt; 22/7</strong>. They are bounds, not evaluations of the circle ratio.</p><div class="ci-scroll" tabindex="0" role="region" aria-label="Printed square-root choices"><table class="ci-table"><caption>Printed square-root choices, before normalization</caption><thead><tr><th>Path</th><th>Sides</th><th>Y</th><th>Scale</th><th>Printed page</th></tr></thead><tbody>${(["outer", "inner"] as const).flatMap((b) => printed[b].map((p, i) => `<tr><th>${b}</th><td>${6 * 2 ** i}</td><td>${esc(p.label)}</td><td>${p.base}</td><td>${p.page}</td></tr>`)).join("")}</tbody></table></div></section><section class="ci-section">${proofReading()}</section><section class="ci-section"><h2>Eight readings, with sixteen word notes</h2><p>${esc(circleBoundary)}</p>${circlePassages.map((p, i) => `<article class="ci-full-passage"><h3>${i + 1}. ${esc(p.title)}</h3><p lang="grc">${esc(p.greek)}</p><p lang="la">${esc(p.latin)}</p><p>${esc(p.english)}</p><p>${esc(p.note)}</p><dl>${p.words.map((w) => `<dt><span lang="grc">${esc(w.greek)}</span> / <span lang="la">${esc(w.latin)}</span></dt><dd>${esc(w.english)}</dd>`).join("")}</dl><p>Greek p.${p.pages[0]}; Latin p.${p.pages[1]}.</p></article>`).join("")}${sourceCautions()}</section><section class="ci-section"><h2>What the experiment establishes</h2><p>All arithmetic decisions use reduced integer fractions. Decimal labels and polygon drawings use floating point only for display. The polygon perimeter inequalities are geometric premises of this model; this page does not prove every result about arc length, reconstruct ancient computational tools, or identify how Archimedes discovered the square-root bounds. The custom approximation is your modern intervention. One altered choice is retained at a time.</p><p>This file contains the two paths, settings, source readings, ten complete pages, font and licenses. It runs no scripts and requests no remote subresources. External links require a connection. Print to A4 for a reading copy; the circle is an equal-scale illustration, not a physical calibration template.</p><h3>Editable settings</h3><pre>${esc(circleJson(s))}</pre><h3>Source edition</h3><p>Archimedes, <cite>Archimedis opera omnia cum commentariis Eutocii</cite>, vol. I, ed. and Latin translation J. L. Heiberg, Leipzig: Teubner, 1880, pp.262–271. <a href="https://www.wilbourhall.org/pdfs/Archimedes_VOL_I.pdf">Complete digitized volume</a>. PDF page = printed page + 19. All retained pages are complete reductions, without retouching.</p></section>${circlePages.map((p, i) => `<figure class="ci-source-sheet"><figcaption>Heiberg 1880 / printed p.${p} / ${p % 2 ? "Latin" : "Greek"} / PDF page ${p + 19}</figcaption><img src="${images[i]}" alt="Complete printed page ${p}"/><figcaption>SHA-256 ${studyAssetIdentity(`sources/circle/heiberg-${p}.jpg`).sha256}</figcaption></figure>`).join("")}<section class="ci-section"><h2>Licenses</h2><p>The ancient text, Heiberg's Latin and 1880 printed pages are public domain. New English, notes, code and drawings: MIT.</p><pre>${esc(license)}</pre><h3>Noto Serif / SIL Open Font License</h3><pre>${esc(fontLicense)}</pre></section></main></body></html>`;
}
