import { areaPassages, areaQuestions, areaStages, quadraturePages } from "./content/quadrature";
import {
  changedLength,
  decodeQuadrature,
  encodeQuadrature,
  formatMeasure as f,
  type QuadratureState,
  quadratureModel,
} from "./core/quadrature";
import { escapeHtml as esc } from "./html";
import { prepareOffline } from "./offline";
import { areaConstruction, areaLedger, areaRearrangement, areaTable } from "./quadrature-drawing";
import { areaCsv, areaStudy, areaSvg } from "./quadrature-study";

const el = <T extends Element = HTMLElement>(s: string): T => {
  const node = document.querySelector<T>(s);
  if (!node) throw new Error(`Missing element: ${s}`);
  return node;
};
let state = decodeQuadrature(location.hash);
let question = 0,
  busy = false,
  rangeGesture = false;
const small = matchMedia("(max-width: 650px)");
el("#app").innerHTML = `
<header class="qa-header"><a class="qa-brand" href="./">Stoicheia <span lang="grc">ΣΤΟΙΧΕΙΑ</span></a><nav aria-label="Workshop navigation"><a href="./">I.1–21 · Read the course</a><a href="./triangle.html">I.22 · Three lengths</a><a href="#qa-reading">Read II.14</a><a href="#qa-sources">Printed evidence</a></nav></header>
<main>
<section class="qa-intro"><div><p class="qa-kicker">BOOK II / PROPOSITION 14 / EQUAL AREA</p><h1>A square,<br>with nothing added.</h1></div><div><p>A 9 by 4 rectangle holds 36 square units.<br>Averaging its sides gives a square that holds too much.</p><p>Find the side that keeps the area. Let a semicircle do the construction, then follow the two comparisons that explain it.</p></div></section>
<section id="qa-workshop" class="qa-workshop" aria-label="Equal-area construction" tabindex="-1">
<div class="qa-board"><div class="qa-board-heading"><p class="qa-kicker">A RECTANGLE CASE OF EUCLID'S CONSTRUCTION</p><a class="qa-phone" href="#qa-givens">Change the lengths ↓</a></div><div id="qa-construction"></div><div class="qa-stages" aria-label="Construction stages">${areaStages.map((t, i) => `<button type="button" data-qa-stage="${i}"><span>${i + 1}</span>${t}</button>`).join("")}</div><p id="qa-stage-note" aria-live="polite"></p><a id="qa-read-stage" href="#qa-reading">Read this construction command ↓</a></div>
<aside id="qa-givens" class="qa-givens"><p class="qa-kicker">CHOSEN DRAWING LENGTHS</p><h2>Give the rectangle <br>two sides.</h2>${(["a", "b"] as const).map((key, i) => `<div class="qa-length"><label for="qa-${key}">Side ${i + 1} <span>drawing units</span></label><input id="qa-${key}" data-qa-length="${key}" type="number" min="1" max="16" step="0.1" aria-describedby="qa-input-error"/><input id="qa-range-${key}" data-qa-range="${key}" type="range" min="10" max="160" step="1" aria-label="Side ${i + 1}, in tenths of a drawing unit"/></div>`).join("")}
<p id="qa-input-error" role="status" hidden>Use lengths from 1.0 to 16.0 in tenths. With perimeter locked, the other side must remain in that range. The drawing keeps the last valid lengths.</p>
<label class="qa-check"><input id="qa-lock" type="checkbox"/> Keep the perimeter fixed</label><p id="qa-lock-note" class="qa-small"></p><div class="qa-presets"><button type="button" data-qa-preset="90,40">9 × 4</button><button type="button" data-qa-preset="110,20">11 × 2</button><button type="button" data-qa-preset="65,65">6.5 × 6.5</button></div><p class="qa-small">These three examples all have perimeter 26. Presets replace both lengths.</p><p id="qa-orientation" class="qa-small"></p><a class="qa-phone" href="#qa-workshop">Inspect the changed rectangle ↑</a></aside>
<div id="qa-result" class="qa-result" role="status"></div></section>
<p id="qa-adjusted" class="qa-notice" role="status" hidden>Some shared settings were invalid. The workshop replaced them with defaults; repeated settings reset the whole experiment.</p>
<section id="qa-rearrange" class="qa-section"><div class="qa-section-intro"><div><p class="qa-kicker">WHY THE AVERAGE ADDS TOO MUCH</p><h2>There is an extra square<br>hiding in the average.</h2></div><p>The half-sum is the semicircle's radius. Cut the rectangle there and turn the smaller piece. The pieces fill that larger square except for one corner.</p></div><div class="qa-two"><div id="qa-pieces"></div><div><label for="qa-move">Lift and turn the smaller piece <output id="qa-move-output" for="qa-move"></output></label><input id="qa-move" type="range" min="0" max="100" step="1" value="0"/><div class="qa-actions"><button type="button" id="qa-unfold">Original rectangle</button><button type="button" id="qa-fold">Complete the move</button></div><p id="qa-piece-note" class="qa-finding"></p><p class="qa-small">A modern two-piece illustration of the relation used in II.5. Each piece keeps its shape and area. During the move, it is shown lifted above the board; projected overlap does not mean material disappears. This is not a transcription of II.5's diagram or full proof.</p></div></div></section>
<section id="qa-proof" class="qa-section"><div class="qa-section-intro"><div><p class="qa-kicker">TWO ACCOUNTS OF THE SAME AREA</p><h2>Remove what both<br>accounts contain.</h2></div><p>II.5 compares the rectangle and the small square with the square on a radius. I.47 compares the two leg-squares with that same radius-square. Subtract the common square.</p></div><div id="qa-ledger"></div><div class="qa-actions"><button type="button" id="qa-cancel" aria-pressed="false">Subtract the common square</button><a href="#qa-reading" id="qa-read-subtract">Read “let it be subtracted” ↓</a></div><p id="qa-proof-note" aria-live="polite"></p><div class="qa-table-wrap" role="region" aria-label="Area and perimeter comparison" tabindex="0" id="qa-table"></div><details class="qa-math"><summary>Connect the drawing to modern numbers</summary><p>Let the rectangle's long side be a and its short side b. The radius is r = (a + b)/2 and the distance between the two cuts is d = (a − b)/2. II.5 supplies ab + d² = r². I.47 supplies h² + d² = r². Subtract d²: h² = ab.</p><p>The constructed side is the geometric mean √(ab). The arithmetic mean r gives the same perimeter as the rectangle, but adds d² to its area. These algebraic names, coordinates and chosen units are modern explanations of the geometric argument. Numerical agreement supports inspecting a drawing; it does not replace the proof.</p><p>For a square input, the source finishes before the semicircle. The equal-length limit of the formulas is still valid, but the unequal-cut argument is unnecessary.</p></details></section>
<section id="qa-reading" class="qa-section"><div class="qa-section-intro"><div><p class="qa-kicker">THE COMPLETE II.14 / ELEVEN READING UNITS</p><h2>Greek argument.<br>Latin equations.</h2></div><div><p>Heiberg's 1883 Greek edition and nineteenth-century Latin translation, with new English guidance.</p><label for="qa-passage">Read a passage<select id="qa-passage">${areaPassages.map((p, i) => `<option value="${i}">${i + 1}. ${p.title}</option>`).join("")}</select></label></div></div><article id="qa-passage-text"></article><div class="qa-actions"><button type="button" id="qa-prev">← Previous passage</button><span id="qa-position" aria-live="polite"></span><button type="button" id="qa-next">Next passage →</button><button type="button" id="qa-show-stage">Show this on the plate ↑</button></div><details><summary>Read the complete argument together</summary>${areaPassages.map((p, i) => `<article class="qa-full-passage"><h3>${i + 1}. ${p.title}</h3><p lang="grc">${esc(p.grc)}</p><p lang="la">${esc(p.lat)}</p><p>${esc(p.en)}</p></article>`).join("")}</details></section>
<section class="qa-section qa-two" aria-labelledby="qa-practice-title"><div><p class="qa-kicker">CHECK THE WORDS AND THE REASON</p><h2 id="qa-practice-title">What did the proof preserve?</h2><p>Four questions about actual passages. Each explanation returns to its source.</p></div><form id="qa-question-form"><fieldset id="qa-question-options"></fieldset><button class="qa-primary" type="submit">Check the reading</button><p id="qa-feedback" role="status"></p><div class="qa-actions"><button type="button" id="qa-question-source">Read that passage</button><button type="button" id="qa-question-next">Next question →</button></div></form></section>
<section id="qa-sources" class="qa-section"><div class="qa-section-intro"><div><p class="qa-kicker">EIGHT COMPLETE PRINTED PAGES</p><h2>Compare the words<br>with the ink.</h2></div><p>J. L. Heiberg, <cite>Euclidis opera omnia</cite>, volume I, Leipzig, 1883. Pages 160–163 contain II.14; 128–129 and 110–111 provide the statements of II.5 and I.47. Their complete proofs are not included here.</p></div><div class="qa-two"><div><label for="qa-source-page">Printed page<select id="qa-source-page">${quadraturePages.map((p) => `<option value="${p}">${p} · ${p % 2 ? "Latin" : "Greek"} · ${p >= 160 ? "II.14" : p >= 128 ? "II.5 statement" : "I.47 statement"}</option>`).join("")}</select></label><div class="qa-actions"><button type="button" id="qa-zoom" aria-pressed="false">Enlarge the page</button><a id="qa-full-source" href="./sources/heiberg-160.jpg" target="_blank" rel="noreferrer">Full-size image ↗</a></div><p id="qa-scan-status" role="status"></p><h3>What the edition does</h3><p>The source's Greek labels stay Greek in both languages. Η is the centre, Θ the point on the semicircle. The Latin uses formulas where the Greek describes figures in words. Its printed <i lang="la">aequale</i> after <i lang="la">figura</i> on page 163 is retained.</p><p>Line breaks, critical apparatus and inline Latin references are omitted from the transcription. Greek ϑ is normalized to θ. The full page images retain the notes. Reading divisions, English, grammar guidance and the moving diagrams are new teaching work.</p><p>The general proposition begins with any rectilinear figure, using I.45 to obtain a rectangle. This workshop implements the rectangle case; it does not implement that earlier conversion or claim to square a circle.</p><p><a href="https://archive.org/details/euclidisoperaomn01eucluoft/page/n174/mode/2up" target="_blank" rel="noreferrer">Complete public-domain volume ↗</a> · <a href="./sources/manifest.json">Page provenance</a></p></div><figure><div id="qa-scan-scroll" class="qa-scan-scroll" tabindex="0" role="region" aria-label="Scrollable source page"><img id="qa-source-image" src="./sources/heiberg-160.jpg" width="1146" height="1800" alt="Heiberg page 160, Greek text of II.14" loading="lazy"/></div><figcaption id="qa-scan-caption"></figcaption></figure></div></section>
<section class="qa-section qa-save"><div><p class="qa-kicker">KEEP THE CONSTRUCTION AND ITS REASON</p><h2>An illustrated reading,<br>with the sources inside.</h2><p>The saved HTML contains your rectangle, diagrams, measurements, complete three-language proof, eight scans and font. Open it from disk or print it to PDF.</p></div><div><div class="qa-actions"><button type="button" id="qa-save-study" class="qa-primary">Save illustrated reading</button><button type="button" id="qa-save-svg">Save diagram SVG</button><button type="button" id="qa-save-csv">Save measurements CSV</button><button type="button" id="qa-share">Share these settings</button></div><p id="qa-save-status" role="status"></p><label for="qa-share-url" id="qa-share-label" hidden>Copy this link<input type="text" readonly id="qa-share-url"/></label></div></section>
</main><footer class="qa-footer"><span>Stoicheia · Euclid, language and construction</span><span id="qa-offline" role="status">Checking offline edition…</span><button type="button" id="qa-reload-edition" hidden>Reload the current edition</button><a href="https://github.com/antonsoo/stoicheia">Source &amp; MIT license</a></footer>`;
function showReading(focus = false) {
  const p = areaPassages[state.passage];
  if (!p) return;
  el<HTMLSelectElement>("#qa-passage").value = String(state.passage);
  el("#qa-passage-text").innerHTML =
    `<h3 id="qa-reading-title" tabindex="-1">${p.title}</h3><div class="qa-languages"><div><p class="qa-language-label">GREEK</p><p lang="grc">${esc(p.grc)}</p></div><div><p class="qa-language-label">HEIBERG'S LATIN</p><p lang="la">${esc(p.lat)}</p></div><div><p class="qa-language-label">ENGLISH READING</p><p>${esc(p.en)}</p></div></div><div class="qa-word-note"><p><strong lang="grc">${esc(p.word)}</strong> — ${esc(p.gloss)}</p><p>${esc(p.note)}</p><div class="qa-actions">${p.pages.map((page) => `<button type="button" data-qa-page="${page}">Inspect p. ${page} · ${page % 2 ? "Latin" : "Greek"}</button>`).join("")}</div></div>`;
  el("#qa-position").textContent = `${state.passage + 1} / ${areaPassages.length}`;
  el<HTMLButtonElement>("#qa-prev").disabled = state.passage === 0;
  el<HTMLButtonElement>("#qa-next").disabled = state.passage === areaPassages.length - 1;
  if (focus) el("#qa-reading-title").focus();
}
function render() {
  const m = quadratureModel(state);
  el("#qa-construction").innerHTML = areaConstruction(state, small.matches);
  el("#qa-pieces").innerHTML = areaRearrangement(state, small.matches);
  el("#qa-ledger").innerHTML = areaLedger(state, small.matches);
  el("#qa-table").innerHTML = areaTable(state);
  for (const key of ["a", "b"] as const) {
    el<HTMLInputElement>(`#qa-${key}`).value = String(state[key] / 10);
    el(`#qa-${key}`).setAttribute("aria-invalid", "false");
    const range = el<HTMLInputElement>(`#qa-range-${key}`);
    range.value = String(state[key]);
    range.min = String(state.lock ? Math.max(10, state.a + state.b - 160) : 10);
    range.max = String(state.lock ? Math.min(160, state.a + state.b - 10) : 160);
    range.setAttribute("aria-valuetext", `${f(state[key] / 10)} drawing units`);
  }
  el<HTMLInputElement>("#qa-lock").checked = state.lock;
  el("#qa-lock-note").textContent = state.lock
    ? `Perimeter held at ${f(m.perimeter)} units. Moving either side changes the other.`
    : `Current perimeter: ${f(m.perimeter)} units.`;
  el("#qa-orientation").textContent = m.equal
    ? "The two sides are equal. The given rectangle is already the required square."
    : m.swapped
      ? "Side 2 is longer. The drawing turns the rectangle so ΒΕ is the longer side, as in the source."
      : "ΒΕ is the longer side; ΕΔ is the shorter side. Greek letters name the points.";
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-qa-stage]")) {
    const i = Number(button.dataset.qaStage);
    button.disabled = m.equal && i !== 0;
    button.setAttribute("aria-pressed", String(i === (m.equal ? 0 : state.stage)));
  }
  const stageNotes = [
    `Begin with the ${f(m.long)} by ${f(m.short)} rectangle ΒΔ. Its right angle at Ε will matter.`,
    `Continue ΒΕ. Copy ΕΔ onto ΕΖ, so the entire ΒΖ is ${f(m.long + m.short)} units.`,
    `Bisect ΒΖ at Η. Both halves are ${f(m.radius)} units. Ε is ${f(m.offset)} units from the midpoint.`,
    `Draw the semicircle centred at Η, with radius ${f(m.radius)} units.`,
    `Continue ΔΕ to meet the semicircle at Θ. Join the radius ΗΘ. ΕΘ measures approximately ${f(m.height, 6)} units.`,
    `Draw the green square on ΕΘ using I.46. II.5 and I.47 give two accounts of the radius-square; subtract the common square to show that both colored figures have area ${f(m.area)} u².`,
  ];
  el("#qa-stage-note").textContent = m.equal
    ? "The sides are equal. Euclid says the task is already accomplished; the later construction is unnecessary."
    : (stageNotes[state.stage] ?? "");
  el("#qa-result").innerHTML = m.equal
    ? `<strong>Already a square.</strong> Side ${f(m.long)} u · area ${f(m.area)} u².`
    : `<strong>Same area: ${f(m.area)} u².</strong> The constructed square has side <span>${f(m.height, 6)} u</span>. The half-sum ${f(m.radius)} u makes its area ${f(m.offsetArea)} u² too large.`;
  el<HTMLInputElement>("#qa-move").value = String(state.move);
  el<HTMLInputElement>("#qa-move").disabled = m.equal;
  el("#qa-move-output").textContent = `${state.move}%`;
  el("#qa-piece-note").textContent = m.equal
    ? "The half-difference is zero. There is no extra square."
    : `The missing corner has side ${f(m.offset)} u. Its ${f(m.offsetArea)} u² is exactly the area added by using the average as the square's side.`;
  el("#qa-cancel").setAttribute("aria-pressed", String(state.cancel));
  el("#qa-cancel").textContent = state.cancel
    ? "Restore the common square"
    : "Subtract the common square";
  el<HTMLButtonElement>("#qa-cancel").disabled = m.equal;
  el("#qa-proof-note").textContent = m.equal
    ? "The unequal-cut proof is skipped for a square input. Both figures here are the given square."
    : state.cancel
      ? `Remove ${f(m.offsetArea)} u² from each total. The remaining ${f(m.area)} u² rectangle equals the square on ΕΘ.`
      : `Both totals are ${f(m.radiusArea)} u². Each contains the same ${f(m.offsetArea)} u² square on ΗΕ. The diagrams use the same scale.`;
  el("#qa-adjusted").hidden = !state.adjusted;
}
function update(next: QuadratureState, push = true) {
  state = { ...next, adjusted: false };
  if (state.a === state.b) state.stage = 0;
  if (encodeQuadrature(state) !== location.hash)
    history[push ? "pushState" : "replaceState"](null, "", encodeQuadrature(state));
  render();
}
function read(index: number, focus = true) {
  update({ ...state, passage: index });
  showReading(focus);
  el("#qa-reading").scrollIntoView({ block: "start" });
}
function source(page: number) {
  const image = el<HTMLImageElement>("#qa-source-image");
  el<HTMLSelectElement>("#qa-source-page").value = String(page);
  image.src = `${import.meta.env.BASE_URL}sources/heiberg-${String(page).padStart(3, "0")}.jpg`;
  image.alt = `Heiberg, printed page ${page}: ${page % 2 ? "Latin" : "Greek"}, ${page >= 160 ? "II.14" : page >= 128 ? "II.5 statement" : "I.47 statement"}`;
  el<HTMLAnchorElement>("#qa-full-source").href = image.src;
  el("#qa-scan-caption").textContent = image.alt;
  el("#qa-scan-status").textContent = "Loading printed page…";
}
el("#qa-source-image").addEventListener("load", () => {
  el("#qa-scan-status").textContent =
    "Printed page ready. Enlarge it to inspect the type and apparatus.";
});
el("#qa-source-image").addEventListener("error", () => {
  el("#qa-scan-status").textContent =
    "This page could not load. Reconnect or reload the current edition.";
});
for (const key of ["a", "b"] as const) {
  el<HTMLInputElement>(`#qa-${key}`).addEventListener("change", (event) => {
    const input = event.currentTarget as HTMLInputElement,
      value = Number(input.value),
      tenths = Math.round(value * 10);
    const next =
      input.value.trim() && Math.abs(value * 10 - tenths) < 1e-8
        ? changedLength(state, key, tenths)
        : null;
    el("#qa-input-error").hidden = !!next;
    input.setAttribute("aria-invalid", String(!next));
    if (next) update(next);
  });
  const range = el<HTMLInputElement>(`#qa-range-${key}`);
  range.addEventListener("input", () => {
    const next = changedLength(state, key, Number(range.value));
    if (next) {
      update(next, !rangeGesture);
      rangeGesture = true;
      el("#qa-input-error").hidden = true;
      el(`#qa-${key}`).setAttribute("aria-invalid", "false");
    }
  });
  range.addEventListener("change", () => {
    rangeGesture = false;
  });
}
el("#qa-lock").addEventListener("change", () =>
  update({ ...state, lock: el<HTMLInputElement>("#qa-lock").checked }),
);
el("#qa-move").addEventListener("input", () => {
  update({ ...state, move: Number(el<HTMLInputElement>("#qa-move").value) }, !rangeGesture);
  rangeGesture = true;
});
el("#qa-move").addEventListener("change", () => {
  rangeGesture = false;
});
el("#qa-fold").addEventListener("click", () => update({ ...state, move: 100 }));
el("#qa-unfold").addEventListener("click", () => update({ ...state, move: 0 }));
el("#qa-cancel").addEventListener("click", () => update({ ...state, cancel: !state.cancel }));
el("#qa-passage").addEventListener("change", () =>
  read(Number(el<HTMLSelectElement>("#qa-passage").value), false),
);
el("#qa-prev").addEventListener("click", () => read(state.passage - 1));
el("#qa-next").addEventListener("click", () => read(state.passage + 1));
el("#qa-read-stage").addEventListener("click", (e) => {
  e.preventDefault();
  read(state.a === state.b ? 2 : ([1, 3, 3, 4, 4, 5][state.stage] ?? 0));
});
el("#qa-read-subtract").addEventListener("click", (e) => {
  e.preventDefault();
  read(8);
});
el("#qa-show-stage").addEventListener("click", () => {
  update({ ...state, stage: areaPassages[state.passage]?.stage ?? 0 });
  el("#qa-workshop").scrollIntoView();
  el("#qa-workshop").focus({ preventScroll: true });
});
el("#qa-source-page").addEventListener("change", () =>
  source(Number(el<HTMLSelectElement>("#qa-source-page").value)),
);
el("#qa-zoom").addEventListener("click", () => {
  const on = el("#qa-zoom").getAttribute("aria-pressed") !== "true";
  el("#qa-zoom").setAttribute("aria-pressed", String(on));
  el("#qa-zoom").textContent = on ? "Fit the page" : "Enlarge the page";
  el("#qa-scan-scroll").classList.toggle("qa-zoomed", on);
});
document.addEventListener("click", (e) => {
  const button = (e.target as Element).closest<HTMLButtonElement>("button");
  if (!button) return;
  if (button.dataset.qaStage) update({ ...state, stage: Number(button.dataset.qaStage) });
  if (button.dataset.qaPreset) {
    const [a = 90, b = 40] = button.dataset.qaPreset.split(",").map(Number);
    update({ ...state, a, b, stage: a === b ? 0 : 4, move: 0, cancel: false });
  }
  if (button.dataset.qaPage) {
    source(Number(button.dataset.qaPage));
    el("#qa-sources").scrollIntoView();
    el<HTMLSelectElement>("#qa-source-page").focus({ preventScroll: true });
  }
});
function showQuestion() {
  const q = areaQuestions[question];
  if (!q) return;
  el("#qa-question-options").innerHTML =
    `<legend>${question + 1}. ${esc(q.prompt)}</legend>${q.answers.map((a, i) => `<label><input type="radio" name="qa-answer" value="${i}" required/>${esc(a)}</label>`).join("")}`;
  el("#qa-feedback").textContent = "";
}
el("#qa-question-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = areaQuestions[question];
  if (!q) return;
  const answer = new FormData(el<HTMLFormElement>("#qa-question-form")).get("qa-answer");
  el("#qa-feedback").textContent =
    `${Number(answer) === q.correct ? "Yes." : "Read the comparison again."} ${q.feedback}`;
});
el("#qa-question-next").addEventListener("click", () => {
  question = (question + 1) % areaQuestions.length;
  showQuestion();
  el<HTMLLegendElement>("#qa-question-options legend").tabIndex = -1;
  el("#qa-question-options legend").focus();
});
el("#qa-question-source").addEventListener("click", () =>
  read(areaQuestions[question]?.passage ?? 0),
);
function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
el("#qa-save-csv").addEventListener("click", () =>
  download("stoicheia-II14-measurements.csv", areaCsv(state), "text/csv;charset=utf-8"),
);
el("#qa-save-svg").addEventListener("click", () =>
  download("stoicheia-II14-construction.svg", areaSvg(state), "image/svg+xml"),
);
el("#qa-save-study").addEventListener("click", async () => {
  if (busy) return;
  busy = true;
  const snapshot = { ...state };
  el<HTMLButtonElement>("#qa-save-study").disabled = true;
  el("#qa-save-status").textContent = "Preparing the reading and verifying all eight source pages…";
  try {
    download("stoicheia-II14-reading.html", await areaStudy(snapshot), "text/html;charset=utf-8");
    el("#qa-save-status").textContent =
      "Reading saved with its diagrams, eight verified scans, font and measurements.";
  } catch (error) {
    el("#qa-save-status").textContent =
      error instanceof Error
        ? error.message
        : "The reading could not be saved. Reconnect and try again.";
  } finally {
    busy = false;
    el<HTMLButtonElement>("#qa-save-study").disabled = false;
  }
});
el("#qa-share").addEventListener("click", () => {
  el("#qa-share-label").hidden = false;
  const input = el<HTMLInputElement>("#qa-share-url");
  input.value = new URL(`quadrature.html${encodeQuadrature(state)}`, location.href).href;
  input.focus();
  input.select();
});
window.addEventListener("popstate", () => {
  state = decodeQuadrature(location.hash);
  rangeGesture = false;
  render();
  showReading();
});
small.addEventListener("change", render);
render();
showReading();
showQuestion();
source(160);
prepareOffline(el("#qa-offline"), el<HTMLButtonElement>("#qa-reload-edition"));

// Page-section links must not replace the serialized experiment in the hash.
document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
    return;
  const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#qa-"]');
  if (!anchor) return;
  const target = document.querySelector<HTMLElement>(anchor.getAttribute("href") ?? "");
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ block: "start" });
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
});
