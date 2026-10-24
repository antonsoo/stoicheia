import license from "../LICENSE?raw";
import { mesolabePassages, mesolabeStages } from "./content/mesolabe";
import {
  encodeMesolabe,
  measure as f,
  type MesolabeState,
  mesolabeModel,
  mesolabePages,
} from "./core/mesolabe";
import { escapeHtml as esc } from "./html";
import css from "./mesolabe.css?inline";
import {
  cubeDrawing,
  machineDrawing,
  mesolabeTemplate,
  proofDrawing,
  ratioTable,
} from "./mesolabe-drawing";
import { studyAssetIdentity, studyDataUrl, studyText } from "./study-assets";

export function mesolabeCsv(s: MesolabeState): string {
  const m = mesolabeModel(s);
  const rows = [
    ["quantity", "value", "meaning"],
    ["mode", s.mode, "trial; first=only B constrained; ideal=both calculated"],
    ["required_volume_factor", s.factor, "original cube volume = 1"],
    ["left_slide_fraction", m.p, "fraction of square panel width toward middle"],
    ["right_slide_fraction", m.q, "fraction of square panel width toward middle"],
    ["a_AE", m.lengths[0], "units of original cube edge"],
    ["b_BZ", m.lengths[1], "first candidate mean; units of original edge"],
    ["c_GH", m.lengths[2], "new cube edge candidate; units of original edge"],
    ["d_DT", 1, "original cube edge"],
    ...m.ratios.map((r, i) => [`ratio_${i + 1}`, r, ["a/b", "b/c", "c/d"][i]]),
    [
      "B_signed_offset_mm",
      (m.residuals[0] ?? 0) * 60,
      "along panel edge from AD; chosen 60 mm square",
    ],
    [
      "G_signed_offset_mm",
      (m.residuals[1] ?? 0) * 60,
      "along panel edge from AD; chosen 60 mm square",
    ],
    ["collinear_in_model", m.aligned, "both normalized vertical residuals below 1e-10"],
    ["candidate_volume", m.volume, "c cubed; original cube volume = 1"],
    ["volume_error_percent", m.volumeError, "signed difference relative to requested volume"],
    ...Object.entries(m.points).flatMap(([name, p]) => [
      [`${name}_x`, p[0], "square width = 1; horizontal source orientation"],
      [`${name}_y`, p[1], "square height = 1; up from lower rail"],
    ]),
    [
      "source",
      "Heiberg 1881 vol III pp 102-113",
      "Eutocius transmitting a letter under Eratosthenes name",
    ],
    [
      "physical_accuracy",
      "unverified",
      "exact parallel rails and zero-thickness plates are assumptions",
    ],
  ];
  return `${rows.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\r\n")}\r\n`;
}

export function mesolabeSvg(s: MesolabeState): string {
  return machineDrawing(s).replace(
    "<title>",
    `<metadata>${esc(license)} Source: Eutocius, Heiberg 1881 III pp.106-113. This pose is a modern ideal geometry model; physical accuracy unverified.</metadata><style>${esc(css)}</style><title>`,
  );
}

export async function mesolabeStudy(s: MesolabeState): Promise<string> {
  const m = mesolabeModel(s),
    ideal = { ...s, mode: "ideal" as const, step: 3 };
  const [font, fontLicense, ...images] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    ...mesolabePages.map((p) => studyDataUrl(`sources/mesolabe/eutocius-${p}.jpg`, "image/jpeg")),
  ]);
  const dataLink = (type: string, content: string) =>
    `data:${type};charset=utf-8,${encodeURIComponent(content)}`;
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"/><title>Twice the stone · A saved mesolabe reading</title><style>@font-face{font-family:"Noto Serif";src:url("${font}")}*{box-sizing:border-box}body{color:#193d60;background:#e8eff4;font:15px/1.7 system-ui,sans-serif}h1,h2,h3{font-family:"Noto Serif",Georgia,serif;font-weight:400}a{color:inherit}p{line-height:1.7}${css}</style></head><body class="ml-saved"><main><header><p class="ml-kicker">STOICHEIA / THE CONSTRUCTION TRANSMITTED UNDER ERATOSTHENES' NAME</p><h1>Twice the stone.<br>How much more edge?</h1><p>Saved ${esc(s.mode)} pose. Required volume ${f(s.factor)} × the original; edge ΔΘ = 1 unit. Equal square plates and the numerical dimensions are modern teaching choices.</p><p><a href="https://antonsoo.github.io/stoicheia/mesolabe.html${esc(encodeMesolabe(s))}">Open this pose in the workshop</a> · <a download="stoicheia-mesolabe-measurements.csv" href="${esc(dataLink("text/csv", mesolabeCsv(s)))}">Save these measurements</a> · <a download="stoicheia-mesolabe-paper.svg" href="${esc(dataLink("image/svg+xml", mesolabeTemplate(s.factor)))}">Save the A4 paper sheet</a></p></header>
<section class="ml-section"><h2>Your selected machine</h2><p>Left slide ${f(m.p * 100, 7)}%; right slide ${f(m.q * 100, 7)}%. ${m.aligned ? "The four points are collinear in this ideal mathematical model." : "This is a trial; the two mean proportionals have not been established."}</p><div class="ml-saved-desktop">${machineDrawing(s)}</div><div class="ml-saved-phone">${machineDrawing(s, true)}</div><p>In a chosen 60 mm frame, the signed vertical offsets from the line ΑΔ are Β ${f((m.residuals[0] ?? 0) * 60)} mm and Γ ${f((m.residuals[1] ?? 0) * 60)} mm. They run along the panel edges in the horizontal orientation.</p><div class="ml-table-wrap">${ratioTable(s)}</div><div class="ml-cube-panel">${cubeDrawing(s)}</div><p>The candidate edge ΓΗ is ${f(m.candidate)}. Its cube has volume ${f(m.volume)} × the original, with signed error ${f(m.volumeError)}% relative to the requested ${f(s.factor)} ×. Doubling every edge would give eightfold volume.</p></section>
<section class="ml-section"><h2>Compare the ideal alignment and its proof</h2><p>This separate comparison calculates both contacts from the cube root. It does not replace your selected pose above. Write t = ∛(1/R). The panel heights become 1, t, t², t³; multiplying them by R makes ΔΘ equal to one original cube edge.</p><div class="ml-saved-desktop">${machineDrawing(ideal)}${proofDrawing(ideal)}</div><div class="ml-saved-phone">${machineDrawing(ideal, true)}${proofDrawing(ideal, true)}</div>${mesolabeStages.map((stage, i) => `<article><h3>${i + 1}. ${esc(stage.title)}</h3><p>${esc(stage.text)}</p></article>`).join("")}<p>Thus for R=${f(s.factor)}, the required edge is ${f(mesolabeModel(ideal).candidate)}. All measurements use ordinary floating-point arithmetic; the diagram and agreement do not replace the geometric proof.</p></section>
<section class="ml-section"><h2>Read eight selected source passages</h2>${mesolabePassages.map((p, i) => `<article class="ml-full-passage"><h3>${i + 1}. ${esc(p.title)}</h3><p lang="grc">${esc(p.greek)}</p><p lang="la">${esc(p.latin)}</p><p>${esc(p.english)}</p><h4>${esc(p.word)}</h4><p>${esc(p.note)}</p><p>Printed pp.${p.pages.join(", ")}.</p></article>`).join("")}</section>
<section class="ml-section"><h2>Paper, source and model boundaries</h2><p>The downloadable landscape A4 SVG uses 60 mm square plates and a 25 mm calibration bar. The left loose panel goes above the fixed middle panel; the right goes below it. Print at 100% and verify the bar. The sheet is a modern paper exploration. Physical printing, cutting, assembly and achievable precision have not been checked; it is not a detailed groove fabrication plan.</p><p>The model assumes equal panels, exact parallel rails and zero thickness. It has no friction, play, material or structural model. The 0.5 mm displacement in the app is a chosen perturbation, not an ancient accuracy estimate. A mechanical alignment is an operation beyond the straightedge-and-compass tools used in the Euclid course.</p><p>J. L. Heiberg, <cite>Archimedis opera omnia cum commentariis Eutocii</cite>, vol. III, Leipzig: Teubner, 1881, pp.102–113. <a href="https://www.wilbourhall.org/pdfs/Archimedes_VOL_III.pdf">Complete source PDF</a>. This first-edition title page reads MDCCCLXXXI, not 1915. Eutocius transmits the construction within a letter attributed to Eratosthenes. The letter's authorship, dedication and origin stories are not independently established here. The two printed figures appear on pp.109 and 112; pp.110–111 discuss manufacturing and its difficulty.</p><p>Selected Greek and Latin excerpts were transcribed against these images. Line wrapping is removed, geometric labels use Greek Unicode and ϑ becomes θ. Inline Latin reference markers are omitted; full scans retain the apparatus and adjacent material. This is not the complete letter. English, word notes, colors, coordinate formulas and the model are modern teaching work. Four plates would give three means and a fourth-root ratio; this model operates the three-plate case.</p><p>This HTML embeds all twelve images and its Greek font. It needs no remote subresources and runs no scripts. The links to the application and complete source PDF require a connection.</p></section>
${mesolabePages.map((p, i) => `<figure class="ml-source-sheet"><figcaption>Eutocius / Heiberg 1881 · printed p.${p} · ${p % 2 ? "Latin" : "Greek"} · source PDF page ${p + 100} (one-based)</figcaption><img src="${images[i]}" alt="Complete printed page ${p}"/><figcaption>SHA-256 ${studyAssetIdentity(`sources/mesolabe/eutocius-${p}.jpg`).sha256}</figcaption></figure>`).join("")}
<section class="ml-section"><h2>Licenses</h2><p>Ancient Greek, Heiberg's Latin and the 1881 facsimile: public domain. New English, annotations, code and drawings: MIT.</p><pre class="ml-license">${esc(license)}</pre><h3>Noto Serif font</h3><pre class="ml-license">${esc(fontLicense)}</pre></section></main></body></html>`;
}
