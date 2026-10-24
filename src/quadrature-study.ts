import license from "../LICENSE?raw";
import { areaPassages, areaStages, quadraturePages } from "./content/quadrature";
import {
  encodeQuadrature,
  formatMeasure as f,
  type QuadratureState,
  quadratureModel,
} from "./core/quadrature";
import { escapeHtml as esc } from "./html";
import css from "./quadrature.css?inline";
import { areaConstruction, areaLedger, areaRearrangement, areaTable } from "./quadrature-drawing";
import { studyAssetIdentity, studyDataUrl, studyText } from "./study-assets";
export function areaCsv(state: QuadratureState): string {
  const m = quadratureModel(state);
  const rows = [
    ["quantity", "value", "unit", "meaning"],
    ["side_1", state.a / 10, "drawing_unit", "chosen input"],
    ["side_2", state.b / 10, "drawing_unit", "chosen input"],
    ["BE", m.long, "drawing_unit", "longer side"],
    ["ED_equals_EZ", m.short, "drawing_unit", "shorter side copied onto extension"],
    ["HZ_equals_HTheta", m.radius, "drawing_unit", "half-sum; circle radius"],
    ["HE", m.offset, "drawing_unit", "half-difference; distance between cuts"],
    ["ETheta", m.height, "drawing_unit", "height from circle intersection; approximate real value"],
    ["rectangle_area", m.area, "square_drawing_unit", "exact product of input tenths"],
    [
      "constructed_square_area_numerical",
      m.squareArea,
      "square_drawing_unit",
      "floating-point square of calculated height",
    ],
    ["half_sum_square_area", m.radiusArea, "square_drawing_unit", "same perimeter as rectangle"],
    ["shared_square_area", m.offsetArea, "square_drawing_unit", "excess of half-sum square"],
    ["rectangle_perimeter", m.perimeter, "drawing_unit", "given rectangle"],
    [
      "constructed_square_perimeter",
      m.squarePerimeter,
      "drawing_unit",
      "generally differs from given rectangle",
    ],
    ["already_square", m.equal, "boolean", "source stops before semicircle if true"],
    ["stage", m.equal ? 0 : state.stage, "zero_based", "0 through 5"],
    ["piece_move", state.move, "percent", "modern rigid rearrangement illustration"],
    ["common_square_removed", state.cancel, "boolean", "same area subtracted from both accounts"],
    ...Object.entries(m.points).flatMap(([name, p]) => [
      [`${name}_x`, p[0], "drawing_unit", "B is origin; positive y upwards"],
      [
        `${name}_y`,
        p[1],
        "drawing_unit",
        "model coordinate; circle points unused for square input",
      ],
    ]),
  ];
  return `${rows
    .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\r\n")}\r\n`;
}
export function areaSvg(state: QuadratureState): string {
  return areaConstruction(state).replace(
    "<title ",
    `<metadata>${esc(license)} Source: Euclid II.14, Heiberg 1883. Modern coordinate drawing in arbitrary units.</metadata><style>${esc(css)}</style><title `,
  );
}
export async function areaStudy(state: QuadratureState): Promise<string> {
  const m = quadratureModel(state);
  const [font, fontLicense, ...pages] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    ...quadraturePages.map((p) => studyDataUrl(`sources/heiberg-${p}.jpg`, "image/jpeg")),
  ]);
  const csv = areaCsv(state);
  const reading = areaPassages
    .map(
      (p, i) =>
        `<article class="qa-full-passage"><h3>${i + 1}. ${esc(p.title)}</h3><p lang="grc">${esc(p.grc)}</p><p lang="la">${esc(p.lat)}</p><p>${esc(p.en)}</p><p><strong>${esc(p.word)}</strong> — ${esc(p.gloss)}. ${esc(p.note)}</p><p>Printed pages ${p.pages.join(", ")}.</p></article>`,
    )
    .join("");
  const sheets = quadraturePages
    .map(
      (p, i) =>
        `<figure class="qa-source-sheet"><figcaption>Heiberg 1883 · printed p. ${p} · ${p % 2 ? "Latin" : "Greek"} · ${p >= 160 ? "II.14" : p >= 128 ? "II.5 statement" : "I.47 statement"}</figcaption><img src="${pages[i]}" alt="Full printed page ${p}, including the critical apparatus"/><figcaption>SHA-256: ${studyAssetIdentity(`sources/heiberg-${p}.jpg`).sha256}</figcaption></figure>`,
    )
    .join("");
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"/><title>Euclid II.14 · ${f(m.long)} by ${f(m.short)} · Stoicheia</title><style>@font-face{font-family:"Noto Serif";src:url("${font}") format("truetype")}*{box-sizing:border-box}body{margin:0;background:#e8eff4;font:15px/1.65 system-ui,sans-serif;color:#193d60}a{color:inherit}h1,h2,h3{font-family:"Noto Serif",Georgia,serif}p[lang]{font-family:"Noto Serif",Georgia,serif}img{max-width:100%}${css}</style></head><body class="quadrature-page qa-saved"><main><header class="qa-saved-intro"><p class="qa-kicker">STOICHEIA / EUCLID II.14 / A SAVED CONSTRUCTION</p><h1>A square, with nothing added.</h1><p>Given rectangle: ${f(m.long)} by ${f(m.short)} drawing units. Area: ${f(m.area)} square units. ${m.equal ? "The given figure is already a square; Euclid finishes here." : `Constructed side: approximately ${f(m.height, 6)} units. The half-sum ${f(m.radius)} makes its square ${f(m.offsetArea)} square units too large.`}</p><p><a href="https://antonsoo.github.io/stoicheia/quadrature.html${esc(encodeQuadrature(state))}">Open these settings in the workshop</a> · <a download="stoicheia-II14-measurements.csv" href="data:text/csv;charset=utf-8,${encodeURIComponent(csv)}">Save the exact measurement table</a></p></header>
<figure class="qa-plate">${areaConstruction(state)}<figcaption>Selected stage: ${areaStages[m.equal ? 0 : state.stage]}. Equal horizontal and vertical scales; arbitrary drawing units. Η is the centre; Θ is the circle intersection. Greek point labels follow Heiberg.</figcaption></figure>
<div class="qa-table-wrap" role="region" aria-label="Area and perimeter comparison" tabindex="0">${areaTable(state)}</div><section><h2>The extra area in the average</h2><figure class="qa-plate">${areaRearrangement({ ...state, move: 100 })}<figcaption>The completed modern two-piece rearrangement. Same area ${f(m.area)} u²; the ${f(m.offsetArea)} u² corner remains empty. This illustrates the II.5 relation, not its original diagram or full proof.</figcaption></figure><p>The two pieces have areas ${f(m.radius * m.short)} and ${f(m.offset * m.short)} square units. A square with the rectangle's half-sum as its side has the same perimeter, but is larger in area unless the sides are equal.</p></section>
<section><h2>Subtract the common square</h2><figure class="qa-plate">${areaLedger({ ...state, cancel: false })}<figcaption>Before subtraction: two accounts of ${f(m.radiusArea)} square units. The figures use the same scale.</figcaption></figure><p>II.5: rectangle + square on ΗΕ = square on ΗΖ. Equal radii make the latter the square on ΗΘ. I.47: square on ΕΘ + square on ΗΕ = square on ΗΘ. Subtract the common ${f(m.offsetArea)} u² square. The remaining rectangle and constructed square are equal in area.</p><p>${m.equal ? "For this square input the source skips these unequal-cut steps. The displayed identities also hold in the equal-side limit." : "The rectangle's right angle makes ΗΕΘ a right triangle. I.46 supplies the final square on the constructed side."}</p></section>
<section><h2>The complete argument</h2><p>Greek: Heiberg's 1883 edition. Latin: his nineteenth-century translation, not an ancient Latin text. English and reading divisions are new. The complete proposition includes a preliminary conversion of a general rectilinear figure by I.45. This workshop implements its rectangle case.</p>${reading}</section>
<section><h2>Source and model boundaries</h2><p>J. L. Heiberg, <cite>Euclidis opera omnia</cite>, volume I, Leipzig: Teubner, 1883, pp. 160–163. Full pages 128–129 and 110–111 supply the statements of II.5 and I.47; their complete proofs are not transcribed. <a href="https://archive.org/details/euclidisoperaomn01eucluoft">University of Toronto scan</a>; public domain.</p><p>Line breaks, apparatus and inline Latin reference marks are omitted in the transcription. Greek ϑ becomes θ. Greek point labels remain Greek. Heiberg's Latin formulas, including his printed ‘aequale’ after ‘figura’ on p. 163, are retained. The full scans preserve the printed evidence.</p><p>For modern calculation, r = (a + b)/2, d = (a − b)/2 and h² = r² − d². Thus h² = ab. Chosen units, numerical approximations, algebraic vocabulary and the piece motion are teaching aids. The moving diagram is not a formal proof, an ancient measurement, a full implementation of I.45, or a construction for squaring a circle.</p><p>This file embeds its source scans and font, has no runtime scripts and makes no remote subresource requests. Its application link requires a connection. The completed rearrangement and the pre-subtraction account are retained for comparison, regardless of the captured view.</p></section>${sheets}<section><h2>Licenses</h2><p>Greek, Latin and source scans: public domain. New translation, notes, diagrams and code: MIT.</p><pre class="qa-license">${esc(license)}</pre><h3>Noto Serif font</h3><pre class="qa-license">${esc(fontLicense)}</pre></section></main></body></html>`;
}
