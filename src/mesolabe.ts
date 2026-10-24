import { mesolabePassages, mesolabeStages } from "./content/mesolabe";
import {
  encodeMesolabe,
  measure as f,
  initialMesolabe,
  type MesolabeState,
  mesolabeModel,
  mesolabePages,
  parseMesolabe,
} from "./core/mesolabe";
import { escapeHtml as esc } from "./html";
import {
  contactDrawing,
  cubeDrawing,
  machineDrawing,
  mesolabeTemplate,
  proofDrawing,
  ratioTable,
} from "./mesolabe-drawing";
import { mesolabeCsv, mesolabeStudy, mesolabeSvg } from "./mesolabe-study";
import { prepareOffline } from "./offline";

function el<T extends HTMLElement = HTMLElement>(s: string): T {
  const e = document.querySelector<T>(s);
  if (!e) throw new Error(`Missing ${s}`);
  return e;
}
const parsed = parseMesolabe(location.hash);
let state = parsed.state;
const narrow = matchMedia("(max-width:700px)");
el("#app").innerHTML =
  `<header class="ml-header"><a class="ml-brand" href="./">Stoicheia <span lang="grc">ΣΤΟΙΧΕΙΑ</span></a><nav aria-label="Workshop navigation"><a href="./">Euclid's course</a><a href="./quadrature.html">Equal-area square</a><a href="#ml-reading">Read the source</a><a href="#ml-evidence">Inspect the print</a></nav></header>
<main><section class="ml-intro"><div><p class="ml-kicker">BEYOND THE COMPASS / ERATOSTHENES' SLIDING PLATES</p><h1>Twice the stone.<br>How much more edge?</h1></div><div class="ml-intro-copy"><p>Double every edge of a cube and you get eight times the stone. To get twice the volume, an ancient device finds two lengths between two given lengths.</p><p>Slide its plates. Bring four points onto one line. Then find why that small movement gives a cube root.</p><p class="ml-attribution">Construction transmitted by Eutocius under Eratosthenes' name. A modern geometric model, with the printed Greek and Latin beside it.</p></div></section>
<p id="ml-notice" role="status"></p>
<section id="ml-workshop" class="ml-workshop" aria-labelledby="ml-machine-title"><div class="ml-plate"><div class="ml-plate-head"><h2 id="ml-machine-title">Find a line through all four.</h2><span>Α → Β → Γ → Δ</span></div><div id="ml-machine"></div><div id="ml-contact-detail"></div><p class="ml-machine-help">Drag either round grip, or use the sliders. The orange straightedge joins Α and Δ. Both filled contacts must meet it.</p></div><div class="ml-controls"><p class="ml-kicker">CHOSEN GIVEN LENGTHS</p><label for="ml-factor">Required volume <output id="ml-factor-value"></output><input id="ml-factor" type="range" min="2" max="8" step="0.1" value="2"/></label><div class="ml-presets" aria-label="Volume presets"><button type="button" data-factor="2">Double</button><button type="button" data-factor="3">Triple</button><button type="button" data-factor="8">Eightfold</button></div><p>ΑΕ : ΔΘ = required volume : original volume. ΔΘ stands for one original edge.</p><label for="ml-left">Left plate toward the middle <output id="ml-left-value"></output><input id="ml-left" type="range" min="0" max="90" step="0.01" value="12"/></label><label for="ml-right">Right plate toward the middle <output id="ml-right-value"></output><input id="ml-right" type="range" min="0" max="90" step="0.01" value="47"/></label><p class="ml-scale-note">Slides are shown as percentages of one plate's width. Equal squares and the dimensions are teaching choices.</p><div class="ml-actions"><button type="button" id="ml-first">Line up Β only</button><button type="button" id="ml-ideal" class="ml-primary">Set the mathematical alignment</button><button type="button" id="ml-nudge">Displace the right plate by 0.5 mm</button><button type="button" id="ml-reset">Reset the trial</button></div><p id="ml-mode-note"></p></div><div class="ml-alignment" id="ml-alignment" role="status" aria-live="polite"></div></section>
<section class="ml-results" aria-label="Measure the four lengths and the cube"><div><p class="ml-kicker">READ THE EXPOSED LENGTHS</p><div id="ml-ratios" class="ml-table-wrap" tabindex="0" role="region" aria-label="Lengths and successive ratios"></div><p>The three ratios need to agree. Only then do ΒΖ and ΓΗ give the two mean proportionals. The last mean ΓΗ supplies the new cube's edge.</p></div><div class="ml-cube-panel"><p class="ml-kicker">ONE SCALE FOR ALL THREE CUBES</p><div id="ml-cubes"></div><p id="ml-volume" role="status"></p><p>Doubling an edge gives face area 4 and volume 8. Our display uses a modern oblique projection; lengths above are exact model values before rounding.</p></div></section>
<section id="ml-proof" class="ml-section"><div class="ml-section-heading"><div><p class="ml-kicker">WHY IT WORKS / TWO FAMILIES OF PARALLELS</p><h2>A straight line<br>earns a proportion.</h2></div><p>The vertical edges alone do not establish a continuing ratio. The parallel diagonals supply a second comparison. Extend the straightedge to Κ and follow both.</p></div><div class="ml-stages" aria-label="Proof stages">${mesolabeStages.map((s, i) => `<button type="button" data-step="${i}">${i + 1}. ${esc(s.title)}</button>`).join("")}</div><div id="ml-proof-plate"></div><p id="ml-proof-note"></p><button type="button" id="ml-proof-read">Read the corresponding source ↓</button><details><summary>How the modern numerical alignment is found</summary><p>Normalize the square height and width to 1. Let p be the left plate's rightward slide and q the right plate's leftward slide. The exposed heights are 1, 1 − p, 1 − q and d = 1/R. Both contacts must lie on the line from Α to Δ.</p><p>The ideal setting uses t = ∛(1/R), p = 1 − t and q = 1 − t². Its heights become 1, t, t², t³. The free trial uses only line intersections; it does not insert cube-root values into your candidate lengths. “Line up Β only” solves that single contact condition while leaving Γ independent. These formulas, coordinates and decimal tolerances are modern explanations.</p><p>In the source, the device supplies the lengths by movement. This is an additional mechanical operation beyond straightedge-and-compass constructions. The workshop does not present the device as a Euclidean construction or as a proof of the impossibility of solving the cube problem using those tools alone.</p></details></section>
<section id="ml-reading" class="ml-section"><div class="ml-section-heading"><div><p class="ml-kicker">EUTOCIUS / COMMENTARY ON SPHERE AND CYLINDER II</p><h2>The words that<br>move the plates.</h2></div><p>Eight selected passages, read against Heiberg's 1881 edition. Greek and nineteenth-century Latin are source texts; the English and word notes are new. These excerpts do not constitute a complete translation of the letter.</p></div><label class="ml-select-label" for="ml-passage">Choose a passage<select id="ml-passage">${mesolabePassages.map((p, i) => `<option value="${i}">${i + 1}. ${esc(p.title)}</option>`).join("")}</select></label><div id="ml-passage-text"></div><div class="ml-reading-nav"><button type="button" id="ml-prev">← Previous passage</button><span id="ml-reading-position"></span><button type="button" id="ml-next">Next passage →</button></div><details><summary>Read all eight excerpts together</summary>${mesolabePassages.map((p, i) => `<article class="ml-full-passage"><h3>${i + 1}. ${esc(p.title)}</h3><p lang="grc">${esc(p.greek)}</p><p lang="la">${esc(p.latin)}</p><p>${esc(p.english)}</p><p>${esc(p.note)}</p><p>Printed pp. ${p.pages.join(", ")}.</p></article>`).join("")}</details></section>
<section id="ml-practice" class="ml-section ml-practice"><div><p class="ml-kicker">READ THE CONDITION</p><h2>What must agree?</h2><p>Use the wording, then return to the machine.</p><button type="button" id="ml-question-read">Open the passage</button></div><form id="ml-question"><fieldset id="ml-answers"></fieldset><button type="submit" class="ml-primary">Check the reading</button><p id="ml-feedback" role="status"></p><button type="button" id="ml-question-next">Next question →</button></form></section>
<section id="ml-evidence" class="ml-section"><div class="ml-section-heading"><div><p class="ml-kicker">READ THE WHOLE PAGE / INCLUDING THE APPARATUS</p><h2>Two figures.<br>A difficult instrument.</h2></div><p>Page 109 shows the plates before movement; p.112 shows the aligned figure. The manufacture passage on pp.110–111 asks for accurate motion, and Heiberg questions its ease. The facsimile retains these qualifications.</p></div><div class="ml-source-tools"><label for="ml-page">Printed page<select id="ml-page">${mesolabePages.map((p) => `<option value="${p}">${p} · ${p % 2 ? "Latin" : "Greek"}</option>`).join("")}</select></label><button type="button" id="ml-zoom" aria-pressed="false">Enlarge the page</button><a id="ml-full-source" href="./sources/mesolabe/eutocius-109.jpg" target="_blank" rel="noopener">Open full image ↗</a></div><div id="ml-source-scroll" class="ml-source-scroll" tabindex="0" role="region" aria-label="Printed source page; scroll to pan when enlarged"><img id="ml-source-image" width="1064" height="1600" alt="Heiberg's printed Latin page 109"/></div><p id="ml-source-caption"></p><p id="ml-source-status" role="status"></p><details><summary>Edition, attribution and model limits</summary><p>J. L. Heiberg, <cite>Archimedis opera omnia cum commentariis Eutocii</cite>, vol. III, Leipzig: Teubner, 1881, pp.102–113. <a href="https://www.wilbourhall.org/pdfs/Archimedes_VOL_III.pdf">Complete scan at Wilbour Hall</a>. This is the first edition; its title page reads MDCCCLXXXI. The letter is preserved by Eutocius under Eratosthenes' name. This workshop does not settle its authenticity or the historicity of its dedication and origin stories.</p><p>The digital model assumes equal square panels, exact parallel rails and zero thickness. Physical friction, play, manufacturing precision and structural behavior are not simulated. A chosen 60 mm height lets you read the contact offsets; it is not an ancient unit or a measured instrument dimension. The 0.5 mm displacement is a chosen perturbation, not an ancient accuracy estimate.</p><p>The excerpt transcription removes line wrapping, normalizes geometric labels to Greek Unicode and ϑ to θ, and omits inline Latin reference markers. Original page images retain the diagrams, critical apparatus, brackets and adjacent material. <a href="./sources/mesolabe/manifest.json">Source identities and rendering recipe</a>.</p></details></section>
<section id="ml-keep" class="ml-section ml-keep"><div><p class="ml-kicker">KEEP THE EXPERIMENT</p><h2>From a screen<br>to a straightedge.</h2><p>Save this pose with the readings, all twelve complete source pages, font, measurements and paper sheet. The saved HTML opens from disk without an internet connection.</p></div><div><div class="ml-actions"><button type="button" id="ml-save" class="ml-primary">Save illustrated reading</button><button type="button" id="ml-template">Download paper sheet · A4 SVG</button><button type="button" id="ml-svg">Save this machine · SVG</button><button type="button" id="ml-csv">Save measurements · CSV</button><button type="button" id="ml-share">Share this pose</button></div><p id="ml-save-status" role="status"></p><label id="ml-share-label" hidden for="ml-share-url">Copy this link<input id="ml-share-url" type="text" readonly/></label><p>The paper sheet uses 60 mm squares and a 25 mm calibration bar. Print at actual size and check the bar. Physical printing, cutting and assembly have not been verified.</p></div></section></main>
<footer class="ml-footer"><p id="ml-offline" role="status">Checking this edition's offline files…</p><button type="button" id="ml-reload" hidden>Reload the saved edition</button><p><a href="./">Euclid's course</a> · <a href="./quadrature.html">One mean: an equal-area square</a> · <a href="./gnomon.html">Equal complements and the gnomon</a> · <a href="https://github.com/antonsoo/stoicheia">Source code</a></p><p>New English, model, diagrams and code: Anton Soloviev, 2026 · MIT. Greek, Latin and scanned edition: public domain. Self-hosted font: SIL OFL.</p></footer>`;

function focusSection(selector: string) {
  const target = el(selector);
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: "start" });
}
function render() {
  const m = mesolabeModel(state);
  el("#ml-machine").innerHTML = machineDrawing(state, narrow.matches);
  el("#ml-contact-detail").innerHTML = contactDrawing(state, narrow.matches);
  el("#ml-ratios").innerHTML = ratioTable(state);
  el("#ml-cubes").innerHTML = cubeDrawing(state);
  el("#ml-volume").innerHTML =
    `<strong>Volume ${f(m.volume)} × the original.</strong> Required ${f(state.factor)} ×; signed error ${f(m.volumeError)}%. ${m.aligned ? "Both contact conditions hold in this ideal model." : "This is the cube implied by your present ΓΗ, before the alignment is established."}`;
  el<HTMLInputElement>("#ml-factor").value = String(state.factor);
  el("#ml-factor-value").textContent = `${f(state.factor)} ×`;
  for (const key of ["left", "right"] as const) {
    const value = (key === "left" ? m.p : m.q) * 100;
    el<HTMLInputElement>(`#ml-${key}`).value = String(value);
    el<HTMLInputElement>(`#ml-${key}`).disabled =
      state.mode === "ideal" || (state.mode === "first" && key === "left");
    el(`#ml-${key}-value`).textContent = `${f(value, 4)}%`;
  }
  el("#ml-mode-note").textContent =
    state.mode === "ideal"
      ? "Mathematical alignment: both slides are calculated at full precision. Reset or drag a grip to try another pose."
      : state.mode === "first"
        ? "Only Β is constrained to the ruler. Move the right plate: Γ can still miss it. The left slide is calculated from that single condition."
        : "Free trial: the two contacts are measured from your chosen plate positions.";
  el("#ml-alignment").dataset.aligned = String(m.aligned);
  el("#ml-alignment").innerHTML =
    `<strong>${m.aligned ? "Four points on one line." : state.mode === "first" ? "Β agrees. Check Γ." : "Two contacts to bring onto the ruler."}</strong><span>Chosen 60 mm frame: Β offset ${f((m.residuals[0] ?? 0) * 60)} mm; Γ offset ${f((m.residuals[1] ?? 0) * 60)} mm.</span><small>Signed offsets run along the plate edges, above (+) or below (−) ΑΔ in the horizontal orientation. Phone view turns the whole machine clockwise.</small>`;
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-step]")) {
    button.disabled = !m.aligned && Number(button.dataset.step) > 0;
    button.setAttribute(
      "aria-pressed",
      String(Number(button.dataset.step) === (m.aligned ? state.step : 0)),
    );
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-factor]"))
    button.setAttribute("aria-pressed", String(Number(button.dataset.factor) === state.factor));
  el("#ml-proof-plate").innerHTML = proofDrawing(state, narrow.matches);
  el("#ml-proof-note").textContent = mesolabeStages[m.aligned ? state.step : 0]?.text ?? "";
  el<HTMLButtonElement>("#ml-first").setAttribute("aria-pressed", String(state.mode === "first"));
  el<HTMLButtonElement>("#ml-ideal").setAttribute("aria-pressed", String(state.mode === "ideal"));
}
function reading(focus = false) {
  const p = mesolabePassages[state.passage];
  if (!p) return;
  el<HTMLSelectElement>("#ml-passage").value = String(state.passage);
  el("#ml-passage-text").innerHTML =
    `<h3 id="ml-reading-title" tabindex="-1">${state.passage + 1}. ${esc(p.title)}</h3><div class="ml-languages"><div><p class="ml-kicker">GREEK / EUTOCIUS' TRANSMITTED TEXT</p><p lang="grc">${esc(p.greek)}</p></div><div><p class="ml-kicker">LATIN / HEIBERG, 1881</p><p lang="la">${esc(p.latin)}</p></div><div><p class="ml-kicker">ENGLISH / A NEW READING</p><p>${esc(p.english)}</p></div></div><div class="ml-word-note"><h4>${esc(p.word)}</h4><p>${esc(p.note)}</p><div class="ml-actions">${p.pages.map((page) => `<button type="button" data-page="${page}">Inspect p.${page} · ${page % 2 ? "Latin" : "Greek"} ↓</button>`).join("")}</div></div>`;
  el("#ml-reading-position").textContent = `${state.passage + 1} / ${mesolabePassages.length}`;
  el<HTMLButtonElement>("#ml-prev").disabled = state.passage === 0;
  el<HTMLButtonElement>("#ml-next").disabled = state.passage === mesolabePassages.length - 1;
  if (focus) el("#ml-reading-title").focus();
}
function source() {
  const img = el<HTMLImageElement>("#ml-source-image");
  img.src = `${import.meta.env.BASE_URL}sources/mesolabe/eutocius-${state.page}.jpg`;
  img.alt = `Complete printed page ${state.page}, ${state.page % 2 ? "Heiberg's Latin" : "Greek"}, 1881`;
  el<HTMLSelectElement>("#ml-page").value = String(state.page);
  el<HTMLAnchorElement>("#ml-full-source").href = img.src;
  el("#ml-source-caption").textContent =
    `Heiberg 1881 · printed p.${state.page} · PDF page ${state.page + 100} (one-based) · complete page, including neighboring material and apparatus.`;
  el("#ml-source-status").textContent = "";
}
function commit(change: Partial<MesolabeState>, updateReading = false) {
  state = { ...state, ...change };
  history.replaceState(null, "", encodeMesolabe(state));
  render();
  if (updateReading) reading(true);
  if (change.page !== undefined) source();
}
el("#ml-factor").addEventListener("input", () =>
  commit({ factor: Number(el<HTMLInputElement>("#ml-factor").value) }),
);
for (const key of ["left", "right"] as const)
  el(`#ml-${key}`).addEventListener("input", () => {
    const m = mesolabeModel(state);
    commit({
      left: m.p,
      right: m.q,
      [key]: Number(el<HTMLInputElement>(`#ml-${key}`).value) / 100,
      mode: state.mode === "first" && key === "right" ? "first" : "trial",
      step: 0,
    });
  });
el("#ml-first").addEventListener("click", () =>
  commit({ right: mesolabeModel(state).q, mode: "first", step: 0 }),
);
el("#ml-ideal").addEventListener("click", () => commit({ mode: "ideal" }));
el("#ml-nudge").addEventListener("click", () => {
  const m = mesolabeModel(state);
  commit({ mode: "trial", left: m.p, right: Math.min(0.9, m.q + 0.5 / 60), step: 0 });
});
el("#ml-reset").addEventListener("click", () =>
  commit({ left: initialMesolabe.left, right: initialMesolabe.right, mode: "trial", step: 0 }),
);
document.addEventListener("click", (event) => {
  const target = (event.target as Element).closest<HTMLElement>(
    "[data-factor],[data-step],[data-page]",
  );
  if (target?.dataset.factor) commit({ factor: Number(target.dataset.factor) });
  if (target?.dataset.step) commit({ step: Number(target.dataset.step) });
  if (target?.dataset.page) {
    commit({ page: Number(target.dataset.page) });
    focusSection("#ml-evidence");
  }
});
el("#ml-proof-read").addEventListener("click", () => {
  commit(
    { passage: mesolabeStages[mesolabeModel(state).aligned ? state.step : 0]?.passage ?? 0 },
    true,
  );
  focusSection("#ml-reading");
});
el("#ml-passage").addEventListener("change", () =>
  commit({ passage: Number(el<HTMLSelectElement>("#ml-passage").value) }, true),
);
for (const [id, delta] of [
  ["prev", -1],
  ["next", 1],
] as const)
  el(`#ml-${id}`).addEventListener("click", () => commit({ passage: state.passage + delta }, true));
el("#ml-page").addEventListener("change", () =>
  commit({ page: Number(el<HTMLSelectElement>("#ml-page").value) }),
);
el("#ml-source-image").addEventListener("error", () => {
  el("#ml-source-status").textContent =
    "The image could not be read. Reconnect or open the full source image.";
});
el("#ml-zoom").addEventListener("click", () => {
  const on = el("#ml-zoom").getAttribute("aria-pressed") !== "true";
  el("#ml-zoom").setAttribute("aria-pressed", String(on));
  el("#ml-zoom").textContent = on ? "Fit the page" : "Enlarge the page";
  el("#ml-source-scroll").classList.toggle("ml-zoomed", on);
});

let drag:
  | { pointer: number; plate: "left" | "right"; start: number; left: number; right: number }
  | undefined;
function pointerCoordinate(event: PointerEvent): number {
  const svg = el("#ml-machine").querySelector("svg");
  const matrix = svg?.getScreenCTM();
  if (!matrix) return 0;
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
  return narrow.matches ? point.y / 165 : point.x / 210;
}
el("#ml-machine").addEventListener("pointerdown", (event) => {
  const plate = (event.target as Element).closest<SVGElement>("[data-plate]")?.dataset.plate;
  if ((plate !== "left" && plate !== "right") || event.button !== 0) return;
  event.preventDefault();
  const m = mesolabeModel(state);
  drag = {
    pointer: event.pointerId,
    plate,
    start: pointerCoordinate(event),
    left: m.p,
    right: m.q,
  };
  el("#ml-machine").setPointerCapture(event.pointerId);
});
el("#ml-machine").addEventListener("pointermove", (event) => {
  if (!drag || drag.pointer !== event.pointerId) return;
  const delta = pointerCoordinate(event) - drag.start;
  commit({
    mode: "trial",
    left: drag.left,
    right: drag.right,
    [drag.plate]: Math.max(
      0,
      Math.min(0.9, drag[drag.plate] + (drag.plate === "left" ? delta : -delta)),
    ),
    step: 0,
  });
});
for (const name of ["pointerup", "pointercancel", "lostpointercapture"] as const)
  el("#ml-machine").addEventListener(name, () => {
    drag = undefined;
  });

const questions = [
  {
    passage: 0,
    prompt: "In τὸ δὲ στερεὸν ὀκταπλάσιον, what becomes eightfold?",
    answers: ["The edge length", "The solid's volume", "The face area"],
    correct: 1,
    reason:
      "στερεόν names the solid. With each edge doubled, three factors of 2 give volume 8. The plane figure is fourfold.",
  },
  {
    passage: 3,
    prompt: "What does ἕως οὗ γένηται require before the motion stops?",
    answers: [
      "Α and Δ alone lie on a line",
      "Β alone meets the straightedge",
      "Α, Β, Γ and Δ all lie on the same line",
    ],
    correct: 2,
    reason:
      "The phrase means until they come to lie on a straight line. All four named points are required; a single aligned contact leaves the other independent.",
  },
  {
    passage: 4,
    prompt: "For a = 2 and d = 1, which mean supplies the new cube edge?",
    answers: ["c = ΓΗ, about 1.259921", "b = ΒΖ, about 1.587401", "The arithmetic average 1.5"],
    correct: 0,
    reason:
      "a:b = b:c = c:d = r, so a/d = r³. Since d = 1, c is the new edge. b³ would give four times the original volume.",
  },
  {
    passage: 7,
    prompt: "What does ἑνὶ πλείους πινακίσκους say about plates and means?",
    answers: [
      "Use one plate for each mean",
      "Use one fewer plate than means",
      "Use one more plate than means",
    ],
    correct: 2,
    reason:
      "ἑνί gives the measure of the difference: more by one. Three plates produce two intermediate means.",
  },
];
let question = 0;
function showQuestion() {
  const q = questions[question];
  if (!q) return;
  el("#ml-answers").innerHTML =
    `<legend>${esc(q.prompt)}</legend>${q.answers.map((a, i) => `<label><input type="radio" name="ml-answer" value="${i}" required/>${esc(a)}</label>`).join("")}`;
  el("#ml-feedback").textContent = "";
}
el("#ml-question").addEventListener("submit", (event) => {
  event.preventDefault();
  const q = questions[question],
    a = document.querySelector<HTMLInputElement>("input[name=ml-answer]:checked");
  if (q && a)
    el("#ml-feedback").textContent =
      `${Number(a.value) === q.correct ? "Yes." : "Return to the wording."} ${q.reason}`;
});
el("#ml-question-next").addEventListener("click", () => {
  question = (question + 1) % questions.length;
  showQuestion();
});
el("#ml-question-read").addEventListener("click", () => {
  commit({ passage: questions[question]?.passage ?? 0 }, true);
  focusSection("#ml-reading");
});
function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
el("#ml-csv").addEventListener("click", () =>
  download("stoicheia-mesolabe-measurements.csv", mesolabeCsv(state), "text/csv;charset=utf-8"),
);
el("#ml-svg").addEventListener("click", () =>
  download("stoicheia-mesolabe-machine.svg", mesolabeSvg(state), "image/svg+xml"),
);
el("#ml-template").addEventListener("click", () =>
  download("stoicheia-mesolabe-paper.svg", mesolabeTemplate(state.factor), "image/svg+xml"),
);
el("#ml-save").addEventListener("click", async () => {
  const button = el<HTMLButtonElement>("#ml-save"),
    snapshot = { ...state };
  button.disabled = true;
  el("#ml-save-status").textContent = "Verifying twelve source pages and the embedded font…";
  try {
    download(
      "stoicheia-mesolabe-reading.html",
      await mesolabeStudy(snapshot),
      "text/html;charset=utf-8",
    );
    el("#ml-save-status").textContent =
      "Saved this pose, eight readings, all twelve source pages, paper sheet and measurements.";
  } catch (error) {
    el("#ml-save-status").textContent =
      error instanceof Error ? error.message : "The reading could not be saved. Try again.";
  } finally {
    button.disabled = false;
  }
});
el("#ml-share").addEventListener("click", () => {
  el("#ml-share-label").hidden = false;
  const input = el<HTMLInputElement>("#ml-share-url");
  input.value = `${location.origin}${location.pathname}${encodeMesolabe(state)}`;
  input.focus();
  input.select();
});
document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
    return;
  const a = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#ml-"]');
  if (a) {
    event.preventDefault();
    focusSection(a.getAttribute("href") ?? "#ml-workshop");
  }
});
addEventListener("hashchange", () => {
  const updated = parseMesolabe(location.hash);
  state = updated.state;
  el("#ml-notice").textContent = updated.repaired
    ? "Some shared settings were outside this workshop's range; those values were reset."
    : "";
  render();
  reading();
  source();
});
narrow.addEventListener("change", render);
el("#ml-notice").textContent = parsed.repaired
  ? "Some shared settings were outside this workshop's range; those values were reset."
  : "";
render();
reading();
source();
showQuestion();
prepareOffline(el("#ml-offline"), el<HTMLButtonElement>("#ml-reload"));
