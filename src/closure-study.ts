import codeLicense from "../LICENSE?raw";
import css from "./closure.css?inline";
import { closureConditions, closureDrawing, closureSummary } from "./closure-drawing";
import { closurePassages } from "./content/closure";
import {
  type ClosureState,
  closureModel,
  encodeClosure,
  trialPoint,
  unitText,
} from "./core/triangle-closure";
import { escapeHtml } from "./html";
import { studyAssetIdentity, studyDataUrl, studyText } from "./study-assets";

export function closureCsv(state: ClosureState): string {
  const m = closureModel(state),
    t = trialPoint(state);
  const crossing = m.kind === "crossing";
  const rows = [
    ["scope", "quantity", "value", "unit", "meaning"],
    ["given", "A", unitText(state.a), "drawing_unit", "first radius"],
    ["given", "B", unitText(state.b), "drawing_unit", "base"],
    ["given", "C", unitText(state.c), "drawing_unit", "second radius"],
    ["condition", "A+B-C", unitText(m.margins[0] ?? 0), "drawing_unit", "must be positive"],
    ["condition", "A+C-B", unitText(m.margins[1] ?? 0), "drawing_unit", "must be positive"],
    ["condition", "B+C-A", unitText(m.margins[2] ?? 0), "drawing_unit", "must be positive"],
    ["model", "intersection_kind", m.kind, "", "strict integer-tenths classification"],
    ["model", "triangle_exists", String(crossing), "", "noncollinear triangle"],
    [
      "model",
      "height",
      m.intersection ? String(m.height) : "",
      "drawing_unit",
      m.intersection ? "zero at tangency" : "no intersection",
    ],
    [
      "model",
      "area",
      m.intersection ? String(m.area) : "",
      "square_drawing_unit",
      m.intersection ? "zero at tangency" : "no triangle",
    ],
    ["model", "circumference_gap", String(m.gap), "drawing_unit", "minimum separation"],
    [
      "model",
      "selected_K_x",
      crossing ? String(m.intersection?.x) : "",
      "drawing_unit",
      "origin Z; H on positive x axis",
    ],
    [
      "model",
      "selected_K_y",
      crossing ? String(state.side * m.height) : "",
      "drawing_unit",
      "chosen side of the base",
    ],
    ["view", "construction_step", String(state.step), "zero_based", "0 through 4"],
    ["view", "trial_enabled", String(state.trial), "", "trial points are modern teaching aids"],
    ...(state.trial
      ? [
          [
            "trial",
            "angle",
            String(state.turn),
            "degree",
            "chosen drawing angle; not ancient input",
          ],
          [
            "trial",
            "HP",
            String(t.needed),
            "drawing_unit",
            "distance required to reach the trial point",
          ],
          [
            "trial",
            "HP-C",
            String(t.residual),
            "drawing_unit",
            "positive means the second arm falls short",
          ],
        ]
      : []),
  ];
  return `${rows.map((row) => row.map((s) => `"${s.replaceAll('"', '""')}"`).join(",")).join("\r\n")}\r\n`;
}

export function closureSvg(state: ClosureState, narrow = false): string {
  return closureDrawing(state, narrow).replace(
    /<title /,
    `<metadata>${escapeHtml(codeLicense)}</metadata><style>${escapeHtml(css)}</style><title `,
  );
}

export async function closureStudy(state: ClosureState): Promise<string> {
  const sourcePages = [52, 53, 54, 55];
  const [font, fontLicense, ...scans] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    ...sourcePages.map((page) =>
      studyDataUrl(`sources/heiberg-${String(page).padStart(3, "0")}.jpg`, "image/jpeg"),
    ),
  ]);
  const trial = trialPoint(state);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; base-uri 'none'; form-action 'none'"><title>Euclid I.22 · Saved construction</title><style>@font-face{font-family:"Noto Serif";src:url(${font})}body{font-family:"Noto Serif",Georgia,serif;color:#193d60;background:#fbfcfe;margin:0;line-height:1.65}*{box-sizing:border-box}a{color:inherit}h1,h2,h3{font-weight:500}button,input{font:inherit}${css}.cl-licenses pre{white-space:pre-wrap;overflow-wrap:anywhere;font:0.8rem/1.6 ui-sans-serif,sans-serif}@media print{.cl-licenses{display:none}}</style></head><body class="closure-page cl-saved"><main>
  <header><p class="cl-kicker">STOICHEIA / SAVED EXPERIMENT / EUCLID I.22</p><h1>Three lengths. Can they close?</h1><p>Α = ${unitText(state.a)}, Β = ${unitText(state.b)}, Γ = ${unitText(state.c)}. Arbitrary drawing units. ${state.trial ? `Trial angle ${state.turn}°; ΗP = ${trial.needed.toFixed(4)}, signed mismatch ΗP − Γ = ${trial.residual.toFixed(4)}. Trial points P and Q are modern additions.` : `Construction step ${state.step + 1} of 5. Vertex chosen ${state.side > 0 ? "above" : "below"} the base.`}</p></header>
  <figure><div class="cl-wide-version">${closureDrawing(state)}</div><div class="cl-narrow-version">${closureDrawing(state, true)}</div><figcaption>The diagram retains the saved view. Its numbers describe a modern coordinate model, not measurements of an ancient instrument.</figcaption></figure>
  ${closureSummary(state)}${closureConditions(state)}
  <h2>The whole passage</h2><p>Greek and Latin: J. L. Heiberg, <cite>Euclidis opera omnia</cite>, vol. I (1883), pp. 52–55, public domain. Latin is Heiberg's nineteenth-century translation. English and teaching notes: Stoicheia, 2026, MIT. The original proof assumes all three strict inequalities; failed experimental givens do not alter the printed text.</p>
  ${closurePassages.map((p, i) => `<article class="cl-saved-passage"><h3>${i + 1}. ${p.title}</h3><p lang="grc">${escapeHtml(p.grc)}</p><p lang="la">${escapeHtml(p.lat)}</p><p>${escapeHtml(p.en)}</p><p><strong>Language.</strong> ${escapeHtml(p.note)}</p><p><strong>Reason.</strong> ${escapeHtml(p.reason)}</p></article>`).join("")}
  <h2>Reading this edition</h2><p>Line breaks, critical apparatus and inline Latin references are omitted. Greek ϑ is normalized to θ; Greek point labels and Heiberg's square brackets are retained. The English translates the Greek, including its bracketed explanation. ΔΕ is a ray; the drawing shows a finite part. T, P and Q are modern labels. The coordinate method establishes intersection in the real plane; it is not a derivation from Euclid's five postulates.</p>
  <h2>The printed evidence</h2>${sourcePages.map((page, i) => `<figure class="cl-saved-scan"><figcaption>Heiberg 1883, printed page ${page} · ${page % 2 ? "Latin" : "Greek"}</figcaption><img data-source-page="${page}" data-source-sha256="${studyAssetIdentity(`sources/heiberg-${String(page).padStart(3, "0")}.jpg`).sha256}" src="${scans[i]}" alt="Complete printed page ${page}, including the I.22 passage and editorial notes"></figure>`).join("")}
  <footer><p><a href="https://antonsoo.github.io/stoicheia/triangle.html${encodeClosure(state)}">Reopen these givens in the workshop</a> · <a href="https://archive.org/details/euclidisoperaomn01eucluoft/page/n66/mode/2up">Full source volume</a> · <a href="https://github.com/antonsoo/stoicheia">Code and limitations</a></p><p>This file contains its font, diagram, complete reading and four scans. Opening it makes no external requests. Print with your browser's print command.</p><details class="cl-licenses"><summary>Copyright and redistribution notices</summary><h3>Code, English and teaching notes</h3><pre>${escapeHtml(codeLicense)}</pre><h3>Bundled Noto Serif font</h3><pre>${escapeHtml(fontLicense)}</pre><p>The Greek, Latin and source page images are public domain. The MIT license imposes no new restrictions on them.</p></details></footer></main></body></html>`;
}
