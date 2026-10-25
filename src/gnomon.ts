import {
  complementStages,
  complementsPassages,
  gnomonPages,
  gnomonPassages,
  gnomonStages,
} from "./content/gnomon";
import {
  complementModel,
  encodeGnomon,
  type GnomonState,
  gnomonModel,
  parseGnomon,
} from "./core/gnomon";
import { encodeQuadrature, formatMeasure as f } from "./core/quadrature";
import {
  complementAccount,
  complementDrawing,
  gnomonAccount,
  gnomonDrawing,
  gnomonPoints,
} from "./gnomon-drawing";
import { gnomonCsv, gnomonStudy, gnomonSvg } from "./gnomon-study";
import { escapeHtml as esc } from "./html";
import { prepareOffline } from "./offline";

function el<T extends HTMLElement = HTMLElement>(s: string): T {
  const e = document.querySelector<T>(s);
  if (!e) throw new Error(`Missing ${s}`);
  return e;
}
let parsed = parseGnomon(location.hash),
  state = parsed.state;
const narrow = matchMedia("(max-width:800px)");
const stepButtons = (list: readonly string[], name: string) =>
  list.map((s, i) => `<button type="button" data-${name}="${i}">${i + 1}. ${s}</button>`).join("");
el("#app").innerHTML =
  `<header class="qa-header"><a class="qa-brand" href="./">Stoicheia <span lang="grc">ΣΤΟΙΧΕΙΑ</span></a><nav aria-label="Workshop navigation"><a href="./">I.1–23 · Course</a><a href="./quadrature.html">II.14 · Equal-area square</a><a href="#gn-reading">Read both proofs</a><a href="#gn-sources">Printed evidence</a></nav></header><main>
<section class="qa-intro"><div><p class="qa-kicker">EUCLID I.43 → II.5 / THE REASON BEHIND THE EXTRA SQUARE</p><h1>Equal leftovers.<br>Unequal shapes.</h1></div><div><p>Two regions can have equal area without looking alike. A diagonal makes that equality possible. Move the point off it, and find exactly where the proof breaks.</p><p>Then follow the same relation into Euclid's gnomon: the L-shaped figure that explains the extra square in the average.</p><p id="gn-state-notice" role="status"></p></div></section>
<section id="gn-complements" class="gn-workbench" aria-label="Equal complements experiment"><div class="gn-plate"><p class="qa-kicker">I.43 / KEEP YOUR EYE ON Κ</p><div id="gn-complement-drawing"></div><div class="gn-legend"><span>Blue: complement ΒΚ</span><span>Green: complement ΚΔ</span></div><div class="gn-stages">${stepButtons(complementStages, "gn-step")}</div><p class="gn-step-note" id="gn-complement-note"></p><button type="button" id="gn-read-complements">Read this step ↓</button></div><div class="gn-controls"><h2>A point on<br>a diagonal.</h2><label for="gn-u">Cut across the base <output id="gn-u-value"></output><input id="gn-u" type="range" min="15" max="85" value="35"/></label><label for="gn-diagonal"><input type="checkbox" id="gn-diagonal" checked/>Keep Κ on the diagonal</label><label for="gn-v">Cut down the height <output id="gn-v-value"></output><input id="gn-v" type="range" min="15" max="85" value="35" disabled/></label><label for="gn-shear">Shift the upper side <output id="gn-shear-value"></output><input id="gn-shear" type="range" min="-40" max="40" value="20"/></label><p>Base 10 units, height 6 units. The shift changes the shape while keeping that area.</p><div class="qa-actions"><button type="button" id="gn-break">Try an off-diagonal point</button><button type="button" id="gn-restore">Put Κ back on ΑΓ</button></div></div><p id="gn-complement-status" class="gn-status" role="status"></p></section>
<div class="gn-table" role="region" aria-label="Complement area account" tabindex="0" id="gn-complement-account"></div>
<section class="qa-section"><div class="qa-section-intro"><div><p class="qa-kicker">II.5 / USE THE EQUALITY INSIDE A SQUARE</p><h2>Three additions.<br>One missing corner.</h2></div><p>A rectangle becomes equal to an L-shaped gnomon. Add the missing corner to both accounts and the whole square appears. These are Euclid's original region names; the colors are new.</p></div>
<div id="gn-gnomon" class="gn-workbench"><div class="gn-plate"><div id="gn-gnomon-drawing"></div><div class="gn-stages">${stepButtons(gnomonStages, "gn-gstep")}</div><p class="gn-step-note" id="gn-gnomon-note"></p><button type="button" id="gn-read-gnomon">Read this step ↓</button></div><div class="gn-controls"><h2>The two<br>unequal lengths.</h2><label for="gn-a">Length 1<input id="gn-a" type="number" min="1" max="16" step="0.1" value="9"/></label><label for="gn-b">Length 2<input id="gn-b" type="number" min="1" max="16" step="0.1" value="4"/></label><p id="gn-input-note" role="status"></p><p>The longer length is ΑΔ, the shorter is ΔΒ. Γ bisects the whole ΑΒ. All lengths use arbitrary drawing units.</p><div class="qa-actions"><button type="button" data-gn-preset="90,40">9 × 4</button><button type="button" data-gn-preset="110,20">11 × 2</button><button type="button" data-gn-preset="65,65">Equal-cut limit</button></div><p><a id="gn-to-quadrature" href="./quadrature.html">Use these lengths in II.14 →</a></p></div><p id="gn-gnomon-status" class="gn-status" role="status"></p></div>
<div class="gn-table" role="region" aria-label="Gnomon area account" tabindex="0" id="gn-gnomon-account"></div><details><summary>Locate every point, including close labels</summary><div id="gn-points" class="gn-table" role="region" aria-label="Coordinates of the source's points" tabindex="0"></div></details>
<aside class="gn-evidence"><h3>Why does the printed diagram use Μ twice?</h3><p>Page 131 labels the right boundary Μ and also names the gnomon ΜΝΞ. Heiberg's footnote acknowledges the duplicated letter, records Gregory's alternative ΝΞΟ, and declines to change the reading against the manuscripts. Here Μ remains the boundary point; ΜΝΞ names the whole L-shaped region in the explanation.</p><button type="button" data-gn-page="131">Inspect the diagram and footnote</button></aside></section>
<section id="gn-reading" class="qa-section"><div class="qa-section-intro"><div><p class="qa-kicker">TWO COMPLETE PROOFS / EIGHTEEN READING UNITS</p><h2>Read the reason<br>in its own words.</h2></div><p>Heiberg's Greek and nineteenth-century Latin, with new English and language guidance. I.43 supplies equal complements; II.5 uses them. Earlier results such as I.34 remain cited prerequisites.</p></div><div class="gn-reading-book"><button type="button" data-gn-book="I43">I.43 · Equal complements</button><button type="button" data-gn-book="II5">II.5 · The gnomon</button></div><label for="gn-passage">Reading unit<select id="gn-passage"></select></label><article id="gn-passage-text"></article><div class="qa-actions"><button type="button" id="gn-prev">← Previous passage</button><span id="gn-position" aria-live="polite"></span><button type="button" id="gn-next">Next passage →</button><button type="button" id="gn-show">Show this on the plate ↑</button></div></section>
<section class="qa-section qa-two"><div><p class="qa-kicker">CHECK THE HYPOTHESIS AND THE WORDS</p><h2>Which equality<br>survives the move?</h2><p>Four questions connect a Greek phrase to the actual geometry.</p></div><form id="gn-question"><fieldset id="gn-answers"></fieldset><button type="submit" class="qa-primary">Check the reasoning</button><p id="gn-feedback" role="status"></p><div class="qa-actions"><button type="button" id="gn-question-read">Read that passage</button><button type="button" id="gn-question-next">Next question →</button></div></form></section>
<section id="gn-sources" class="qa-section"><div class="qa-section-intro"><div><p class="qa-kicker">TEN COMPLETE PRINTED PAGES</p><h2>The diagram has<br>an editorial history.</h2></div><p>J. L. Heiberg, <cite>Euclidis opera omnia</cite>, volume I, Leipzig, 1883. Printed pages 100–103 contain I.43; 128–133 contain II.5, including the repeated conclusion. All pages retain their apparatus and neighboring text.</p></div><div class="qa-two"><div><label for="gn-source">Printed page<select id="gn-source">${gnomonPages.map((p) => `<option value="${p}">${p} · ${p % 2 ? "Latin" : "Greek"} · ${p < 110 ? "I.43" : "II.5"}</option>`).join("")}</select></label><div class="qa-actions"><button type="button" id="gn-zoom" aria-pressed="false">Enlarge the page</button><a id="gn-source-full" href="./sources/heiberg-100.jpg" target="_blank" rel="noreferrer">Full-size image ↗</a></div><p id="gn-source-status" role="status"></p><h3>Transcription and interpretation</h3><p>Greek ϑ becomes θ. Line breaks, apparatus and inline Latin references are omitted in the reading. The full scans retain them. Greek point labels remain Greek; the Latin's equations remain equations. English, reading divisions, grammar, colors and coordinates are modern.</p><p>The first model uses an affine parallelogram in the real plane. Moving Κ off ΑΓ deliberately leaves I.43's hypothesis. The second model follows II.5's square and gnomon; equal inputs are labelled as a limiting identity. The earlier square and parallel constructions are cited, not reproduced in full.</p><p><a href="https://archive.org/details/euclidisoperaomn01eucluoft" target="_blank" rel="noreferrer">Complete public-domain volume ↗</a> · <a href="./sources/manifest.json">Source identities</a></p></div><figure><div id="gn-source-scroll" class="qa-scan-scroll" role="region" aria-label="Scrollable source page" tabindex="0"><img id="gn-source-image" width="987" height="1550" src="./sources/heiberg-100.jpg" alt="Heiberg printed page 100, Greek I.43" loading="lazy"/></div><figcaption id="gn-source-caption"></figcaption></figure></div></section>
<section class="qa-section qa-save"><div><p class="qa-kicker">KEEP THE PROOFS AND THE PRINTED EVIDENCE</p><h2>One reading,<br>both arguments.</h2><p>Save your experiment with eighteen readings, ten source pages, the font and measurements. Open the HTML from disk or print it to PDF.</p></div><div><div class="qa-actions"><button type="button" class="qa-primary" id="gn-save">Save illustrated reading</button><button type="button" id="gn-csv">Save measurements CSV</button><button type="button" id="gn-svg-complements">Save I.43 SVG</button><button type="button" id="gn-svg-gnomon">Save II.5 SVG</button><button type="button" id="gn-share">Share these settings</button></div><p id="gn-save-status" role="status"></p><label id="gn-share-label" for="gn-share-url" hidden>Copy this link<input id="gn-share-url" type="text" readonly/></label></div></section>
</main><footer class="qa-footer"><span>Stoicheia · Euclid, language and construction</span><span id="gn-offline" role="status">Checking offline edition…</span><button type="button" id="gn-reload" hidden>Reload the current edition</button><a href="https://github.com/antonsoo/stoicheia">Source &amp; MIT license</a></footer>`;

const complementNotes = [
  "ΒΚ and ΚΔ are the two complements. The other two parallelograms lie about the diagonal ΑΓ. Equal area does not require equal shape.",
  "The diagonal ΑΓ divides the whole parallelogram into two equal triangles, by I.34. Each has area 30 square units.",
  "I.34 also halves each smaller parallelogram. Remove ΑΕΚ and ΚΗΓ from one large half, and their equals ΑΘΚ and ΚΖΓ from the other.",
  "Equal wholes minus equal totals leave equal complements. The faint triangles show what was removed; the blue and green regions remain.",
];
const gnomonNotes = [
  "Γ bisects ΑΒ. Draw a square on ΓΒ and its diagonal ΒΕ. The perpendicular through Δ meets that diagonal at Θ; the remaining parallels locate the regions.",
  "I.43 gives ΓΘ = ΘΖ. Add the common region ΔΜ to both: the larger regions ΓΜ and ΔΖ are equal.",
  "ΓΜ = ΑΛ because ΑΓ = ΓΒ and the rectangles share a height. Replace ΓΜ: now ΑΛ = ΔΖ. Blue and green mark those equal totals.",
  "Add ΓΘ to both. On the left it completes rectangle ΑΘ; on the right it makes the gnomon ΜΝΞ. Their highlights share ΓΘ: these are area accounts, not pieces moved on top of one another.",
  "Add the missing square ΛΗ to both accounts. Its side equals ΓΔ, the distance between the cuts. The gnomon plus this corner fills the half-length square.",
  "The completed square ΓΕΖΒ equals rectangle ΑΘ (the dashed outline) plus the ochre square ΛΗ. The green gnomon shares ΓΘ with that rectangle. II.14 uses this relation to explain the extra area in the half-sum square.",
];
function reading() {
  const list = state.book === "I43" ? complementsPassages : gnomonPassages,
    p = list[state.passage];
  if (!p) return;
  el<HTMLSelectElement>("#gn-passage").innerHTML = list
    .map((p, i) => `<option value="${i}">${i + 1}. ${esc(p.title)}</option>`)
    .join("");
  el<HTMLSelectElement>("#gn-passage").value = String(state.passage);
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-gn-book]"))
    b.setAttribute("aria-pressed", String(b.dataset.gnBook === state.book));
  el("#gn-passage-text").innerHTML =
    `<h3 id="gn-reading-title" tabindex="-1">${esc(p.title)}</h3><div class="qa-languages"><div><p class="qa-language-label">GREEK</p><p lang="grc">${esc(p.grc)}</p></div><div><p class="qa-language-label">HEIBERG'S LATIN</p><p lang="la">${esc(p.lat)}</p></div><div><p class="qa-language-label">ENGLISH READING</p><p>${esc(p.en)}</p></div></div><div class="qa-word-note"><p>${esc(p.note)}</p><div class="qa-actions">${p.pages.map((page) => `<button type="button" data-gn-page="${page}">Inspect p. ${page} · ${page % 2 ? "Latin" : "Greek"}</button>`).join("")}</div></div>`;
  el("#gn-position").textContent = `${state.passage + 1} / ${list.length}`;
  el<HTMLButtonElement>("#gn-prev").disabled = state.passage === 0;
  el<HTMLButtonElement>("#gn-next").disabled = state.passage === list.length - 1;
}
function render() {
  const c = complementModel(state),
    g = gnomonModel(state);
  el("#gn-input-note").textContent =
    state.a < state.b
      ? "Length 2 is longer. The drawing places it first as ΑΔ, following the source's orientation."
      : "";
  el("#gn-complement-drawing").innerHTML = complementDrawing(state, narrow.matches);
  el("#gn-gnomon-drawing").innerHTML = gnomonDrawing(state, narrow.matches);
  el("#gn-complement-account").innerHTML = complementAccount(state);
  el("#gn-gnomon-account").innerHTML = gnomonAccount(state);
  el("#gn-points").innerHTML = gnomonPoints(state);
  for (const key of ["u", "v", "shear"] as const) {
    el<HTMLInputElement>(`#gn-${key}`).value = String(
      key === "v" && state.diagonal ? state.u : state[key],
    );
    el(`#gn-${key}-value`).textContent =
      key === "shear" ? `${f(c.shear)} u` : `${key === "v" ? f(c.v * 100) : state.u}%`;
  }
  el<HTMLInputElement>("#gn-v").disabled = state.diagonal;
  el<HTMLInputElement>("#gn-diagonal").checked = state.diagonal;
  for (const key of ["a", "b"] as const) {
    el<HTMLInputElement>(`#gn-${key}`).value = String(state[key] / 10);
    el(`#gn-${key}`).setAttribute("aria-invalid", "false");
  }
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-gn-step]")) {
    b.setAttribute(
      "aria-pressed",
      String(Number(b.dataset.gnStep) === (c.onDiagonal ? state.step : 0)),
    );
    b.disabled = !c.onDiagonal && Number(b.dataset.gnStep) > 0;
  }
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-gn-gstep]")) {
    b.setAttribute(
      "aria-pressed",
      String(Number(b.dataset.gnGstep) === (g.equal ? 0 : state.gstep)),
    );
    b.disabled = g.equal && Number(b.dataset.gnGstep) > 0;
  }
  el("#gn-complement-note").textContent = c.onDiagonal
    ? (complementNotes[state.step] ?? "")
    : "The small triangle pairs remain equal, but their diagonals no longer follow ΑΓ. They cannot be subtracted from those large halves as the proof requires. Restore Κ to the diagonal to follow the proof.";
  el("#gn-complement-status").dataset.valid = String(c.onDiagonal);
  el("#gn-complement-status").innerHTML =
    `<strong>${c.onDiagonal ? "Equal areas, different possible shapes." : "The diagonal condition is absent."}</strong>ΒΚ = ${f(c.leftArea)} u². ΚΔ = ${f(c.rightArea)} u². ${c.onDiagonal ? "Both follow from the same subtraction." : `Signed difference ΒΚ − ΚΔ = ${f(c.difference)} u².`}`;
  el("#gn-gnomon-note").textContent = g.equal
    ? "The equal cuts coincide. II.5 assumes unequal cuts; only the limiting identity remains here. Choose unequal lengths to follow its gnomon argument."
    : (gnomonNotes[state.gstep] ?? "");
  el("#gn-gnomon-status").dataset.valid = String(!g.equal);
  el("#gn-gnomon-status").innerHTML =
    `<strong>${g.equal ? "Equal-cut limit; the source hypothesis is absent." : `${f(g.area)} + ${f(g.missing)} = ${f(g.square)} square units.`}</strong>${g.equal ? "The missing square has zero area. This is a limit of the formula, not the unequal-cut construction." : `The rectangle and gnomon have area ${f(g.area)}. The missing corner adds ${f(g.missing)}.`}`;
  el<HTMLAnchorElement>("#gn-to-quadrature").href =
    `./quadrature.html${encodeQuadrature({ a: state.a, b: state.b, stage: 5, move: 100, cancel: false, lock: false, passage: 5 })}`;
  el("#gn-state-notice").textContent = parsed.notice;
}
function commit(update: Partial<GnomonState>, read = false) {
  state = { ...state, ...update };
  if (state.diagonal) state.v = state.u;
  history.pushState(null, "", encodeGnomon(state));
  parsed.notice = "";
  render();
  if (read) reading();
}
function focusSection(id: string) {
  const e = el(id);
  e.scrollIntoView({ block: "start" });
  e.tabIndex = -1;
  e.focus({ preventScroll: true });
}
function chooseReading(book: GnomonState["book"], passage: number) {
  commit({ book, passage }, true);
  focusSection("#gn-reading");
}
for (const key of ["u", "v", "shear"] as const)
  el(`#gn-${key}`).addEventListener("input", () =>
    commit({ [key]: Number(el<HTMLInputElement>(`#gn-${key}`).value) }),
  );
el("#gn-diagonal").addEventListener("change", () =>
  commit({ diagonal: el<HTMLInputElement>("#gn-diagonal").checked }),
);
el("#gn-break").addEventListener("click", () => commit({ u: 35, v: 65, diagonal: false }));
el("#gn-restore").addEventListener("click", () => commit({ diagonal: true }));
for (const key of ["a", "b"] as const)
  el(`#gn-${key}`).addEventListener("change", () => {
    const input = el<HTMLInputElement>(`#gn-${key}`),
      value = Number(input.value) * 10;
    if (
      !input.value ||
      !Number.isFinite(value) ||
      value < 10 ||
      value > 160 ||
      Math.abs(value - Math.round(value)) > 1e-8
    ) {
      input.setAttribute("aria-invalid", "true");
      el("#gn-input-note").textContent =
        "Choose a length from 1.0 to 16.0 in tenths. The previous valid figure is still shown.";
      return;
    }
    el("#gn-input-note").textContent = "";
    commit({ [key]: Math.round(value) });
  });
document.addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>("button");
  if (!button) return;
  if (button.dataset.gnStep !== undefined) commit({ step: Number(button.dataset.gnStep) });
  if (button.dataset.gnGstep !== undefined) commit({ gstep: Number(button.dataset.gnGstep) });
  if (button.dataset.gnBook === "I43" || button.dataset.gnBook === "II5")
    chooseReading(button.dataset.gnBook, 0);
  if (button.dataset.gnPreset) {
    const [a, b] = button.dataset.gnPreset.split(",").map(Number);
    if (a !== undefined && b !== undefined) commit({ a, b });
  }
  if (button.dataset.gnPage) {
    source(Number(button.dataset.gnPage));
    focusSection("#gn-sources");
  }
});
el("#gn-read-complements").addEventListener("click", () =>
  chooseReading("I43", [1, 2, 3, 5][state.step] ?? 0),
);
el("#gn-read-gnomon").addEventListener("click", () =>
  chooseReading("II5", [3, 4, 5, 6, 8, 9][state.gstep] ?? 0),
);
el("#gn-passage").addEventListener("change", () =>
  commit({ passage: Number(el<HTMLSelectElement>("#gn-passage").value) }, true),
);
for (const [id, delta] of [
  ["prev", -1],
  ["next", 1],
] as const)
  el(`#gn-${id}`).addEventListener("click", () => {
    commit({ passage: state.passage + delta }, true);
    el("#gn-reading-title").focus();
  });
el("#gn-show").addEventListener("click", () => {
  const p = (state.book === "I43" ? complementsPassages : gnomonPassages)[state.passage];
  if (!p) return;
  commit(state.book === "I43" ? { step: p.stage } : { gstep: p.stage });
  focusSection(state.book === "I43" ? "#gn-complements" : "#gn-gnomon");
});
function source(page: number) {
  if (!gnomonPages.some((p) => p === page)) return;
  el<HTMLSelectElement>("#gn-source").value = String(page);
  const img = el<HTMLImageElement>("#gn-source-image");
  img.src = `${import.meta.env.BASE_URL}sources/heiberg-${page}.jpg`;
  img.alt = `Heiberg printed page ${page}, ${page % 2 ? "Latin" : "Greek"}, ${page < 110 ? "I.43" : "II.5"}`;
  el<HTMLAnchorElement>("#gn-source-full").href = img.src;
  el("#gn-source-caption").textContent =
    `Heiberg 1883 · printed p. ${page} · PDF page ${page + 14}, one-based. Full page, including neighboring text and apparatus.`;
  el("#gn-source-status").textContent = "";
}
el("#gn-source").addEventListener("change", () =>
  source(Number(el<HTMLSelectElement>("#gn-source").value)),
);
el("#gn-source-image").addEventListener("error", () => {
  el("#gn-source-status").textContent =
    "This source image could not load. Reconnect or use the full-size source link.";
});
el("#gn-zoom").addEventListener("click", () => {
  const zoom = el("#gn-zoom").getAttribute("aria-pressed") !== "true";
  el("#gn-zoom").setAttribute("aria-pressed", String(zoom));
  el("#gn-zoom").textContent = zoom ? "Fit the page" : "Enlarge the page";
  el("#gn-source-scroll").classList.toggle("qa-zoomed", zoom);
});
const questions = [
  {
    book: "I43" as const,
    passage: 1,
    prompt: "What does “τὸ ΒΚ παραπλήρωμα” name in this proof?",
    answers: [
      "The area of a remaining parallelogram",
      "Only the segment from Β to Κ",
      "A circle with diameter ΒΚ",
    ],
    correct: 0,
    reason: "ΒΚ names the region by opposite corners. The theorem compares areas.",
  },
  {
    book: "I43" as const,
    passage: 3,
    prompt: "When Κ moves off ΑΓ, what prevents the same subtraction?",
    answers: [
      "All small triangle pairs become unequal",
      "The small diagonals no longer partition the two large halves along ΑΓ",
      "The whole parallelogram stops having equal diagonal halves",
    ],
    correct: 1,
    reason:
      "Each small parallelogram still has equal diagonal halves. Their diagonals now follow a broken line through Κ, so the required subtraction from the large halves is no longer valid.",
  },
  {
    book: "II5" as const,
    passage: 6,
    prompt: "What does “κοινὸν προσκείσθω τὸ ΓΘ” instruct?",
    answers: [
      "Remove the common ΓΘ",
      "Add the common ΓΘ to both accounts",
      "Replace ΓΘ with a point",
    ],
    correct: 1,
    reason:
      "προσκείσθω / adiiciatur commands an addition. The same complement turns ΑΛ into ΑΘ and ΔΖ into the gnomon.",
  },
  {
    book: "II5" as const,
    passage: 8,
    prompt: "Which length is the side of the missing square?",
    answers: ["The whole line ΑΒ", "The long segment ΑΔ", "ΓΔ, the distance between the two cuts"],
    correct: 2,
    reason:
      "μεταξὺ τῶν τομῶν means between the cuts. In the 9 by 4 example ΓΔ = 2.5, giving a missing area of 6.25.",
  },
];
let question = 0;
function showQuestion() {
  const q = questions[question];
  if (!q) return;
  el("#gn-answers").innerHTML =
    `<legend>${esc(q.prompt)}</legend>${q.answers.map((a, i) => `<label><input type="radio" name="gn-answer" value="${i}" required/>${esc(a)}</label>`).join("")}`;
  el("#gn-feedback").textContent = "";
}
el("#gn-question").addEventListener("submit", (event) => {
  event.preventDefault();
  const q = questions[question],
    answer = document.querySelector<HTMLInputElement>("input[name=gn-answer]:checked");
  if (q && answer)
    el("#gn-feedback").textContent =
      `${Number(answer.value) === q.correct ? "Yes." : "Try the source again."} ${q.reason}`;
});
el("#gn-question-next").addEventListener("click", () => {
  question = (question + 1) % questions.length;
  showQuestion();
});
el("#gn-question-read").addEventListener("click", () => {
  const q = questions[question];
  if (q) chooseReading(q.book, q.passage);
});
function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
el("#gn-csv").addEventListener("click", () =>
  download("stoicheia-gnomon-measurements.csv", gnomonCsv(state), "text/csv;charset=utf-8"),
);
for (const [id, book] of [
  ["complements", "I43"],
  ["gnomon", "II5"],
] as const)
  el(`#gn-svg-${id}`).addEventListener("click", () =>
    download(`stoicheia-${book}-diagram.svg`, gnomonSvg(state, book), "image/svg+xml"),
  );
el("#gn-save").addEventListener("click", async () => {
  const button = el<HTMLButtonElement>("#gn-save"),
    snapshot = { ...state };
  button.disabled = true;
  el("#gn-save-status").textContent = "Verifying the source images and font…";
  try {
    download(
      "stoicheia-gnomon-reading.html",
      await gnomonStudy(snapshot),
      "text/html;charset=utf-8",
    );
    el("#gn-save-status").textContent =
      "Saved both proofs with all ten source pages and measurements.";
  } catch (error) {
    el("#gn-save-status").textContent =
      error instanceof Error ? error.message : "Could not save the reading. Try again.";
  } finally {
    button.disabled = false;
  }
});
el("#gn-share").addEventListener("click", () => {
  el("#gn-share-label").hidden = false;
  const input = el<HTMLInputElement>("#gn-share-url");
  input.value = `${location.origin}${location.pathname}${encodeGnomon(state)}`;
  input.focus();
  input.select();
});
document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
    return;
  const a = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#gn-"]');
  if (!a) return;
  event.preventDefault();
  focusSection(a.getAttribute("href") ?? "#gn-complements");
});
addEventListener("popstate", () => {
  parsed = parseGnomon(location.hash);
  state = parsed.state;
  render();
  reading();
});
narrow.addEventListener("change", render);
render();
reading();
showQuestion();
source(100);
prepareOffline(el("#gn-offline"), el<HTMLButtonElement>("#gn-reload"));
