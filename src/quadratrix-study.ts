import license from "../LICENSE?raw";
import { quadratrixBoundary, quadratrixPassages } from "./content/quadratrix";
import {
  CLOCK,
  encodeQuadratrix,
  type QuadratrixState,
  quadratrixJson,
  quadratrixMotion,
  quadratrixPages,
  quadratrixVerdict,
  rotationDuration,
} from "./core/quadratrix";
import { escapeHtml as esc } from "./html";
import css from "./quadratrix.css?inline";
import {
  quadratrixApproach,
  quadratrixArgument,
  quadratrixNumbers,
  quadratrixPlate,
  quadratrixSquare,
} from "./quadratrix-drawing";
import { studyAssetIdentity, studyDataUrl, studyText } from "./study-assets";

export function quadratrixReading(index: number): string {
  const p = quadratrixPassages[index];
  if (!p) throw new Error("Unknown quadratrix reading.");
  return `<h3>${index + 1}. ${esc(p.title)}</h3><div class="qx-languages"><div><p class="qx-kicker">GREEK · P.${p.pages[0]}</p><p lang="grc">${esc(p.greek)}</p></div><div><p class="qx-kicker">HULTSCH’S LATIN · P.${p.pages[1]}</p><p lang="la">${esc(p.latin)}</p></div></div><p>${esc(p.english)}</p><p class="qx-fine">${esc(p.note)}</p><dl class="qx-words">${p.words.map((w) => `<div><dt><span lang="grc">${esc(w.greek)}</span> / <span lang="la">${esc(w.latin)}</span></dt><dd>${esc(w.english)}</dd></div>`).join("")}</dl>`;
}

export function quadratrixCsv(s: QuadratrixState): string {
  const rows: (string | number)[][] = [
    [
      "record",
      "timing",
      "tick",
      "clock",
      "rotation_duration_ticks",
      "height",
      "angle_radians",
      "relation",
      "crossing_x",
      "crossing_y",
      "within_square",
      "limit_x",
      "meaning",
    ],
  ];
  const add = (type: string, state: QuadratrixState) => {
    const m = quadratrixMotion(state);
    rows.push([
      type,
      state.timing,
      state.tick,
      CLOCK,
      rotationDuration(state.timing),
      m.height,
      m.angle,
      m.kind,
      m.point?.x ?? "",
      m.point?.y ?? "",
      m.point ? String(m.inSquare) : "",
      "",
      "Integer clocks are exact; trigonometric coordinates are floating-point approximations",
    ]);
  };
  add("selected", s);
  for (const tick of [0, 500000, 900000, 990000, 999999, CLOCK])
    add("synchronized_reference", { ...s, tick, timing: "together" });
  rows.push([
    "continuous_extension",
    "together",
    "",
    CLOCK,
    CLOCK,
    0,
    "",
    "limit_not_crossing",
    "",
    "",
    "",
    2 / Math.PI,
    "H=(2/pi,0) is justified separately; the final lines do not select it",
  ]);
  return `${rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\r\n")}\r\n`;
}

export async function quadratrixSvg(s: QuadratrixState): Promise<string> {
  const [font, ofl] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
  ]);
  return quadratrixPlate(s).replace(
    "<defs>",
    `<metadata>${esc(`${quadratrixJson(s)}\n${quadratrixBoundary}\n${license}\n${ofl}`)}</metadata><defs><style>@font-face{font-family:'Noto Serif';src:url('${font}')}svg{background:#fbfcfe}${esc(css)}</style>`,
  );
}

export async function quadratrixStudy(s: QuadratrixState): Promise<string> {
  const [font, ofl, ...images] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    ...quadratrixPages.map((p) =>
      studyDataUrl(`sources/quadratrix/hultsch-${p}.jpg`, "image/jpeg"),
    ),
  ]);
  const data = (mime: string, body: string) =>
    `data:${mime};charset=utf-8,${encodeURIComponent(body)}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; object-src 'none'; base-uri 'none'"/><title>The point the motion cannot draw · Stoicheia</title><style>@font-face{font-family:'Noto Serif';src:url('${font}')}${css}</style></head><body class="quadratrix-page qx-retained"><main><section class="qx-intro"><p class="qx-kicker">PAPPUS / COLLECTION IV.30–32 / RETAINED STUDY</p><h1>The point the motion cannot draw.</h1><p>${esc(quadratrixBoundary)}</p></section><section class="qx-bench"><div class="qx-workspace"><figure class="qx-plate">${quadratrixPlate(s)}<figcaption>Teal: translating line. Rust: rotating line. Blue: traced crossings. An open H, if shown, is a separately added limit. Dashed curve: synchronized reference.</figcaption></figure><div class="qx-controls"><h2>Applied experiment</h2><p>Time ${s.tick}/${CLOCK}. Timing: ${esc(s.timing)}. Limiting point ${s.limit ? "shown separately" : "not added to the plate"}.</p>${quadratrixNumbers(s)}</div></div><div class="qx-verdict"><p>${esc(quadratrixVerdict(s))}</p></div></section><section class="qx-section"><h2>Approach, then reach</h2>${quadratrixApproach()}${quadratrixArgument()}<p class="qx-program">The program supplies π to draw the motion. A numerical animation cannot establish that an exact physical mechanism or a straightedge-and-compass construction has been supplied.</p></section><section class="qx-section"><h2>Why this point matters</h2>${quadratrixSquare()}</section><section class="qx-section"><h2>Read the generation and the objection</h2>${quadratrixPassages.map((_, i) => `<article class="qx-reading qx-full-passage">${quadratrixReading(i)}</article>`).join("")}</section><section class="qx-section"><h2>The complete printed pages</h2><p>Pappus, edited and translated into Latin by Friedrich Hultsch, 1876, volume I, printed pp.250–259. PDF pages 283–292. Google scan of Oxford University’s copy; public domain. Complete pages reduced to 1800 pixels on the long edge without cropping or retouching. Greek theta and geometric labels are normalized in the selected transcription; the scans retain the print and apparatus.</p><p>The later proof changes the diagram’s centre from A to Γ and its intercept from H to Θ. Hultsch’s footnote on p.253 disputes the force of the objections. The p.254–256 apparatus preserves editorial intervention; this study is not a new critical edition.</p><p><a href="https://archive.org/download/pappialexandrin00hultgoog/pappialexandrin00hultgoog.pdf">Complete source PDF</a></p>${quadratrixPages.map((p, i) => `<figure class="qx-source-sheet"><img src="${images[i]}" width="909" height="1800" alt="Complete ${p % 2 ? "Latin" : "Greek"} printed page ${p}, Hultsch 1876, with all notes."/><figcaption>Printed p.${p} · PDF p.${p + 33} · SHA-256 ${studyAssetIdentity(`sources/quadratrix/hultsch-${p}.jpg`).sha256}</figcaption></figure>`).join("")}</section><section class="qx-section"><h2>Keep the native record</h2><p class="qx-native"><a download="stoicheia-quadratrix.json" href="${esc(data("application/json", quadratrixJson(s)))}">Save embedded editable JSON</a> · <a download="stoicheia-quadratrix.csv" href="${esc(data("text/csv", quadratrixCsv(s)))}">Save embedded motion CSV</a></p><pre id="qx-saved-record">${esc(quadratrixJson(s))}</pre><p><a href="https://antonsoo.github.io/stoicheia/quadratrix.html${esc(encodeQuadratrix(s))}">Reopen these settings in the published workshop</a></p><p class="qx-fine">This file opens with scripts disabled and needs no network subresources. The published-workshop link needs the app. Clocks are exact integers; trigonometric values and printed decimals are numerical approximations.</p><div class="qx-print-license"><pre>${esc(license)}</pre><p>Noto Serif, SIL Open Font License 1.1. The complete license is embedded in this HTML.</p></div><details class="qx-license"><summary>Code, diagrams and complete font license</summary><pre>${esc(license)}\n${esc(ofl)}</pre></details></section></main></body></html>`;
}
