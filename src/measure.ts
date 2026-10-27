import { measureBoundary, measurePassages } from "./content/measure";
import {
  activeDivision,
  approximate,
  changeLength,
  commonMeasure,
  decodeMeasure,
  divisions,
  encodeMeasure,
  exact,
  finished,
  initialMeasure,
  type MeasureState,
  measureLimit,
  measurePages,
  remainderNow,
  sign,
  validateFraction,
  validateMeasure,
} from "./core/measure";
import { escapeHtml as esc } from "./html";
import {
  comparisonNote,
  comparisonTable,
  decimal,
  measureDrawing,
  measureLedger,
  overviewDrawing,
  recurrenceDrawing,
  squareDrawing,
  tilingDrawing,
} from "./measure-drawing";
import { measureCsv, measureStudy, measureSvg } from "./measure-study";
import { prepareOffline } from "./offline";
import { studyBlobUrl } from "./study-assets";

function el<T extends HTMLElement = HTMLElement>(s: string): T {
  const node = document.querySelector<T>(s);
  if (!node) throw new Error(`Missing measurement element ${s}`);
  return node;
}
let state: MeasureState = { ...initialMeasure },
  initialError = "";
try {
  state = decodeMeasure(location.hash);
} catch (error) {
  initialError = `${error instanceof Error ? error.message : "Invalid link."} The starting experiment is shown.`;
}
const narrow = matchMedia("(max-width:700px)");
el("#app").innerHTML =
  `<header class="mr-header"><a class="mr-brand" href="./">Stoicheia <span lang="grc">ΣΤΟΙΧΕΙΑ</span></a><nav aria-label="Measurement navigation"><a href="./">Euclid course</a><a href="#mr-reading">Read Book X</a><a href="./ratios.html">Compare ratios · Book V</a><a href="#mr-evidence">Printed evidence</a></nav></header>
<main><section class="mr-intro"><div><p class="mr-kicker">EUCLID X.2–3 / A LENGTH IS LEFT OVER</p><h1>A measure<br>in common.</h1></div><div class="mr-lead"><p>Lay the shorter length along the longer. Keep what is left. Turn, and use that remainder to measure again.</p><p>Can you find a unit that fits both original lengths exactly? For a square’s side and diagonal, the obstacle survives every change of scale.</p><p class="mr-fine">Read the Greek and Heiberg’s Latin while you work. No previous Greek is needed.</p></div></section><p id="mr-notice" class="mr-notice" role="status"></p>
<section id="mr-bench" class="mr-bench" aria-label="Repeated measurement experiment"><div class="mr-plate"><div class="mr-plate-heading"><h2 id="mr-turn-title">Turn 1</h2><p id="mr-scale-note">Local view · the longer length fills the ruler</p></div><div id="mr-plate-actions"></div><div id="mr-drawing"></div><div class="mr-live-values"><dl><div><dt>Longer A</dt><dd id="mr-a"></dd></div><div><dt>Current measure B</dt><dd id="mr-b"></dd></div><div><dt>Left after your copies</dt><dd id="mr-left"></dd></div></dl></div><p class="mr-status" id="mr-status" role="status"></p></div>
<aside class="mr-tools"><p class="mr-kicker">USE THE REMAINDER</p><h2>Keep subtracting.<br>Then turn.</h2><div id="mr-tool-actions"><div id="mr-operations" class="mr-operations"><button type="button" class="mr-primary" id="mr-fit">Lay off one copy of B</button><button type="button" id="mr-many" hidden>Fit the remaining copies</button><button type="button" class="mr-turn" id="mr-turn" disabled>Turn to the remainder ↓</button><div class="mr-secondary"><button type="button" id="mr-back">Previous turn</button><button type="button" id="mr-reset">Start again</button></div>
</div></div><fieldset class="mr-length-choice"><legend>Choose the original longer length</legend><label><input type="radio" name="mr-kind" value="diagonal"/>A square’s diagonal · √2</label><label><input type="radio" name="mr-kind" value="fraction"/>An exact fraction of its side</label></fieldset><form id="mr-fraction-form"><div class="mr-fraction"><label for="mr-n">Numerator<input id="mr-n" type="number" min="1" max="19998" step="1" required/></label><span aria-hidden="true">/</span><label for="mr-d">Denominator<input id="mr-d" type="number" min="1" max="9999" step="1" required/></label></div><button type="submit" id="mr-use-fraction">Use this exact fraction</button><p class="mr-fine">Between 1 and 2 side lengths. Whole numbers; denominator up to 9999.</p><p id="mr-input-status" role="status"></p></form><div class="mr-presets" aria-label="Fraction examples"><button type="button" data-fraction="3,2">3/2 · short run</button><button type="button" data-fraction="577,408">577/408 · close to the diagonal</button></div><p class="mr-fine">The fractions are modern comparison choices. Switching lengths keeps the turn where that turn exists.</p></aside></section>
<section class="mr-record"><div><p class="mr-kicker">THE SIZE THAT THE MAGNIFIER HIDES</p><h2>Smaller, on the<br>original ruler.</h2><p>Above, the local view enlarges at every turn. Here all visited measures keep the original scale.</p><p class="mr-fine">A cross locates a positive length narrower than one SVG drawing unit. The cross’s width is a locator, not the length.</p></div><div id="mr-overview"></div></section>
<details class="mr-ledger"><summary>Your exact subtraction record</summary><div id="mr-ledger" class="mr-scroll" role="region" aria-label="Exact subtraction record" tabindex="0"></div></details>
<section class="mr-section mr-conclusion" aria-label="What this run establishes"><div id="mr-conclusion"></div><div id="mr-tiling"></div></section>
<section class="mr-section"><div class="mr-section-heading"><div><p class="mr-kicker">FINITE AGREEMENT / DIFFERENT OUTCOMES</p><h2>How long can two<br>lengths look alike?</h2></div><div><p id="mr-comparison-note"></p><p>The table calculates both examples through your current turn. Matching whole-number counts do not make their remainders equal.</p></div></div><div id="mr-comparison" class="mr-scroll" role="region" aria-label="Diagonal and rational comparison" tabindex="0"></div><button type="button" id="mr-compare-length">Switch to the other length at this turn</button></section>
<section class="mr-section" id="mr-reason"><p class="mr-kicker">AN ARGUMENT BEYOND THE FINITE RUN</p><h2>Why can the diagonal<br>never finish?</h2><p class="mr-proof-intro">Twenty-four nonzero remainders are twenty-four observations. The following exact identity supplies a reason that applies to every later turn.</p><details id="mr-proof"><summary>Open the self-similarity argument</summary><div class="mr-proof-grid"><div><p>Write <strong>k = √2 − 1</strong>. Since 1 &lt; √2 &lt; 2, we have 0 &lt; k &lt; 1.</p><ol><li>The first subtraction leaves k. The new pair is <strong>(1, k)</strong>.</li><li>Exactly two k fit into 1, since 1/k = 1 + √2 lies strictly between 2 and 3.</li><li>The remainder is <strong>1 − 2k = 3 − 2√2 = k² &gt; 0</strong>.</li><li>The next pair <strong>(k, k²) = k × (1, k)</strong> is the same pair at a smaller scale.</li></ol><p>Scaling both lengths preserves the copy count and the positive remainder. Repeat the same reasoning after any number of turns: no turn reaches zero. With that infinite condition established, X.2 rules out a common length measure.</p><p class="mr-fine">This specialization to the square diagonal is a modern proof presented here. It is not a claim that Euclid printed this example or symbolic notation in X.2.</p></div><div id="mr-recurrence"></div></div><h3>Why would a common measure become impossible?</h3><p>If a positive length E measured both originals, it would measure every later remainder: subtracting whole multiples preserves that property. In a complete turn A = qB + R with 0 &lt; R &lt; B, the remainder is also less than A/2. Repeating turns therefore eventually leaves a positive remainder smaller than E. That remainder cannot contain even one whole E. This expands the shrinking step in the printed contradiction.</p><button type="button" id="mr-read-never">Read “never” in the hypothesis ↓</button></details></section>
<section class="mr-section mr-square-question"><div><p class="mr-kicker">LENGTH IS ONE QUESTION / AREA IS ANOTHER</p><h2>Yet the squares<br>share a measure.</h2><p>The square on the diagonal has twice the area of the square on the side. Both areas contain an exact whole number of side-squares: two and one.</p><p>Book X calls this <span lang="grc">δυνάμει σύμμετροι</span>, commensurable in square. It does not give the two sides a common length measure.</p><button type="button" id="mr-read-squares">Read the second definition ↓</button></div><div id="mr-squares"></div></section>
<section class="mr-section" id="mr-reading"><div class="mr-section-heading"><div><p class="mr-kicker">TEN READING UNITS / GREEK, LATIN, ENGLISH</p><h2>What does<br>“never” require?</h2></div><p>Read selected clauses from the definitions and X.2, then the task in X.3. The complete printed pages retain the argument and apparatus. The reading units are selections, not a complete transcription.</p></div><label for="mr-passage">Choose a passage<select id="mr-passage">${measurePassages.map((p, i) => `<option value="${i}">${i + 1}. ${esc(p.title)}</option>`).join("")}</select></label><article id="mr-reading-text"></article><div class="mr-reading-actions"><button type="button" id="mr-reading-prev">← Previous passage</button><span id="mr-reading-count"></span><button type="button" id="mr-reading-next">Next passage →</button></div></section>
<section class="mr-section mr-check"><div><p class="mr-kicker">CHECK THE WORD AND THE REASON</p><h2>What has the<br>experiment proved?</h2></div><form id="mr-question"><fieldset><legend>After twenty-four nonzero remainders, does μηδέποτε (‘never’) follow just from the run?</legend><label><input type="radio" name="mr-answer" value="yes" required/>Yes: twenty-four is enough to establish never.</label><label><input type="radio" name="mr-answer" value="no"/>No: the finite run needs an argument that applies to every later turn.</label><label><input type="radio" name="mr-answer" value="zero"/>Only if the decimal display rounds to zero.</label></fieldset><button type="submit">Check the reasoning</button><p id="mr-feedback" role="status"></p></form></section>
<section class="mr-section" id="mr-evidence"><div class="mr-section-heading"><div><p class="mr-kicker">HEIBERG / 1886 / VOLUME III</p><h2>The words and<br>their printed pages.</h2></div><p>Twelve whole pages, pp.2–13: the first definitions, X.1’s shrinking argument, X.2 and X.3. Greek and facing nineteenth-century Latin remain distinct from the new English reading.</p></div><div class="mr-source-grid"><div><label for="mr-page">Printed page<select id="mr-page">${measurePages.map((p) => `<option value="${p}">p.${p} · ${p % 2 ? "Latin" : "Greek"}</option>`).join("")}</select></label><div class="mr-source-actions"><button type="button" id="mr-zoom" aria-pressed="false">Enlarge the page</button><a id="mr-full-image" href="./sources/measure/heiberg-002.jpg" target="_blank" rel="noreferrer">Open full image</a></div><p id="mr-source-status" role="status"></p><p>${esc(measureBoundary)}</p><p>Line wrapping and end-of-line hyphenation are removed. Greek geometric letters use consistent Unicode. Editorial brackets remain; apparatus and reference markers are omitted in the selections and retained in these images. Handwritten marks in this scanned copy are not part of the typeset ancient text.</p><p><a href="https://www.wilbourhall.org/pdfs/HeibergEuclidVolume_3.pdf">Complete source PDF</a> · <a href="./sources/measure/manifest.json">Page and download identities</a></p></div><figure><div class="mr-source-scroll" id="mr-source-scroll" role="region" aria-label="Scrollable complete source page" tabindex="0"><img id="mr-source-image" width="1319" height="1700" alt="" hidden/></div><figcaption id="mr-source-caption"></figcaption></figure></div></section>
<section class="mr-section mr-save"><div><p class="mr-kicker">KEEP THE RUN AND ITS REASONS</p><h2>Take the reading<br>off the screen.</h2><p>Save the current turn, exact record, proof, ten readings, twelve source pages and font in one script-free HTML file. Open it from disk or print to PDF.</p></div><div><div class="mr-file-actions"><button type="button" class="mr-primary" id="mr-save">Save illustrated reading</button><button type="button" id="mr-csv">Save exact record CSV</button><button type="button" id="mr-svg">Save the ruler SVG</button><button type="button" id="mr-share">Make a share link</button></div><p id="mr-save-status" role="status"></p><label id="mr-share-label" for="mr-share-url" hidden>Copy this experiment link<input id="mr-share-url" type="url" readonly/></label></div></section></main>
<footer class="mr-footer"><a href="./">Stoicheia · Read and construct Euclid</a><span id="mr-offline" role="status">Preparing offline edition…</span><button type="button" id="mr-reload" hidden>Reload the saved edition</button><a href="https://github.com/antonsoo/stoicheia">Source &amp; MIT license</a></footer>`;

function focusSection(id: string): void {
  const target = el(id);
  target.tabIndex = -1;
  target.scrollIntoView({ block: "start" });
  target.focus({ preventScroll: true });
}
function commit(next: MeasureState): void {
  validateMeasure(next);
  state = next;
  history.pushState(null, "", `${location.pathname}${location.search}${encodeMeasure(state)}`);
  render();
  reading();
  void source();
}
function render(): void {
  const actions = el("#mr-operations");
  const target = el(narrow.matches ? "#mr-plate-actions" : "#mr-tool-actions");
  if (actions.parentElement !== target) target.append(actions);
  const row = activeDivision(state),
    complete = state.copies === row.q;
  el("#mr-turn-title").textContent =
    `Turn ${state.row + 1} · ${state.kind === "diagonal" ? "square diagonal" : `${state.n}/${state.d}`}`;
  el("#mr-scale-note").textContent = state.row
    ? "Local view enlarged · longer A fills the ruler again"
    : "One local scale for both lengths";
  el("#mr-drawing").innerHTML = measureDrawing(state, narrow.matches);
  el("#mr-a").textContent = exact(row.a);
  el("#mr-b").textContent = exact(row.b);
  el("#mr-left").textContent =
    `${exact(remainderNow(state))} ≈ ${decimal(approximate(remainderNow(state)))}`;
  el<HTMLButtonElement>("#mr-fit").disabled = complete;
  el<HTMLButtonElement>("#mr-turn").disabled =
    !complete || sign(row.r) === 0 || state.row === measureLimit - 1;
  el<HTMLButtonElement>("#mr-back").disabled = state.row === 0;
  el("#mr-many").hidden = row.q - state.copies <= 8;
  el("#mr-many").textContent = `Fit all ${row.q - state.copies} remaining copies`;
  el("#mr-status").textContent = finished(state)
    ? "No length is left. This is an exact zero: B measures A. Return this last B to the original pair below."
    : complete
      ? state.row === measureLimit - 1
        ? "The remainder is positive. This bench stops at 24 turns; the argument below explains why the diagonal continues."
        : "Another B will not fit. Turn: old B becomes longer A, and this positive remainder becomes the new B."
      : `You have fitted ${state.copies} ${state.copies === 1 ? "copy" : "copies"}. Another whole B still fits into what remains.`;
  for (const input of document.querySelectorAll<HTMLInputElement>('input[name="mr-kind"]'))
    input.checked = input.value === state.kind;
  el<HTMLInputElement>("#mr-n").value = String(state.n);
  el<HTMLInputElement>("#mr-d").value = String(state.d);
  el("#mr-overview").innerHTML = overviewDrawing(state, narrow.matches);
  el("#mr-ledger").innerHTML = measureLedger(state);
  const m = commonMeasure(state);
  el("#mr-conclusion").innerHTML = m
    ? `<p class="mr-kicker">A COMMON LENGTH FOUND</p><h2>One unit.<br>Both lengths.</h2><p>The last B is <strong>${esc(exact(m.unit))}</strong> original side units. It fits the longer original <strong>${m.longCount}</strong> times and the side <strong>${m.shortCount}</strong> times, with no remainder.</p><p>Working backward through A = qB + R shows that the last B measures every earlier length. Any common measure must also measure every remainder, including this last B; it cannot be larger. That is the greatest common measure sought in X.3.</p>`
    : `<p class="mr-kicker">WHAT THIS RUN HAS ESTABLISHED</p><h2>${state.row === 0 && !complete ? "The first subtraction<br>is still ahead." : "Still a remainder.<br>Still a question."}</h2><p>${state.kind === "diagonal" ? "A finite unfinished run has not established ‘never’. The exact self-similarity argument below supplies the condition X.2 needs." : "This exact fraction has a common measure, but the current run has not reached it. Continue until the last nonzero measure fits exactly."}</p>`;
  el("#mr-tiling").innerHTML = tilingDrawing(state, narrow.matches);
  el("#mr-comparison-note").textContent = comparisonNote(state);
  el("#mr-comparison").innerHTML = comparisonTable(state);
  el("#mr-recurrence").innerHTML = recurrenceDrawing(narrow.matches);
  el("#mr-squares").innerHTML = squareDrawing(narrow.matches);
}
function reading(): void {
  const p = measurePassages[state.passage];
  if (!p) return;
  el<HTMLSelectElement>("#mr-passage").value = String(state.passage);
  el("#mr-reading-text").innerHTML =
    `<p class="mr-kicker">${esc(p.location)}</p><h3>${esc(p.title)}</h3><div class="mr-languages"><div><h4>GREEK</h4><p lang="grc">${esc(p.greek)}</p></div><div><h4>HEIBERG’S LATIN · 1886</h4><p lang="la">${esc(p.latin)}</p></div><div><h4>NEW ENGLISH READING</h4><p>${esc(p.english)}</p></div></div><aside class="mr-word"><h4>${esc(p.word)}</h4><p>${esc(p.note)}</p><div class="mr-source-actions">${p.pages.map((page) => `<button type="button" data-page="${page}">Inspect p.${page} · ${page % 2 ? "Latin" : "Greek"}</button>`).join("")}</div></aside>`;
  el("#mr-reading-count").textContent = `${state.passage + 1} / ${measurePassages.length}`;
  el<HTMLButtonElement>("#mr-reading-prev").disabled = state.passage === 0;
  el<HTMLButtonElement>("#mr-reading-next").disabled = state.passage === measurePassages.length - 1;
}
let sourceRevision = 0,
  sourceUrl = "",
  sourcePage = 0;
async function source(): Promise<void> {
  el<HTMLSelectElement>("#mr-page").value = String(state.page);
  if (sourcePage === state.page && sourceUrl) return;
  sourcePage = state.page;
  const revision = ++sourceRevision,
    page = state.page;
  const image = el<HTMLImageElement>("#mr-source-image");
  image.hidden = true;
  image.removeAttribute("src");
  el("#mr-source-status").textContent = `Verifying printed p.${page} against this edition…`;
  el("#mr-source-caption").textContent = "";
  const file = `sources/measure/heiberg-${String(page).padStart(3, "0")}.jpg`;
  el<HTMLAnchorElement>("#mr-full-image").href = `${import.meta.env.BASE_URL}${file}`;
  try {
    const url = await studyBlobUrl(file, "image/jpeg");
    if (revision !== sourceRevision) {
      URL.revokeObjectURL(url);
      return;
    }
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = url;
    image.src = url;
    image.alt = `Complete printed p.${page}, ${page % 2 ? "Heiberg’s Latin" : "Greek"}, volume III, 1886, including apparatus and scanned annotations`;
    await image.decode();
    if (revision !== sourceRevision) return;
    image.hidden = false;
    el("#mr-source-status").textContent =
      `Verified p.${page} · complete image saved with this edition.`;
    el("#mr-source-caption").textContent =
      `Heiberg 1886 · volume III · printed p.${page} · PDF page ${page + 13} (one-based)`;
  } catch (error) {
    if (revision !== sourceRevision) return;
    sourcePage = 0;
    el("#mr-source-status").textContent =
      error instanceof Error ? error.message : "The source page could not be read.";
  }
}
function focusAfterFit(): void {
  if (finished(state)) {
    el("#mr-conclusion").tabIndex = -1;
    el("#mr-conclusion").focus();
  } else if (state.row === measureLimit - 1) {
    el<HTMLDetailsElement>("#mr-proof").querySelector("summary")?.focus();
  } else el("#mr-turn").focus();
}
el("#mr-fit").addEventListener("click", () => {
  if (state.copies < activeDivision(state).q) {
    commit({ ...state, copies: state.copies + 1 });
    if (el<HTMLButtonElement>("#mr-fit").disabled) focusAfterFit();
  }
});
el("#mr-many").addEventListener("click", () => {
  commit({ ...state, copies: activeDivision(state).q });
  focusAfterFit();
});
el("#mr-turn").addEventListener("click", () => {
  if (
    state.copies === activeDivision(state).q &&
    !finished(state) &&
    state.row < measureLimit - 1
  ) {
    commit({ ...state, row: state.row + 1, copies: 0 });
    el("#mr-fit").focus();
  }
});
el("#mr-back").addEventListener("click", () => {
  if (state.row > 0) {
    const previous = divisions(state)[state.row - 1];
    if (previous) commit({ ...state, row: previous.index, copies: previous.q });
  }
});
el("#mr-reset").addEventListener("click", () => commit({ ...state, row: 0, copies: 0 }));
for (const input of document.querySelectorAll<HTMLInputElement>('input[name="mr-kind"]'))
  input.addEventListener("change", () =>
    commit(changeLength(state, input.value === "diagonal" ? "diagonal" : "fraction")),
  );
el("#mr-fraction-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const n = el<HTMLInputElement>("#mr-n").valueAsNumber,
    d = el<HTMLInputElement>("#mr-d").valueAsNumber;
  const error = validateFraction(n, d);
  el("#mr-input-status").textContent =
    error ?? "Using the exact fraction; no diagonal approximation is substituted.";
  if (!error) commit(changeLength(state, "fraction", n, d));
});
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-fraction]"))
  button.addEventListener("click", () => {
    const [n, d] = button.dataset.fraction?.split(",").map(Number) ?? [];
    if (n && d) commit(changeLength({ ...state, row: 0, copies: 0 }, "fraction", n, d));
  });
el("#mr-compare-length").addEventListener("click", () =>
  commit(changeLength(state, state.kind === "diagonal" ? "fraction" : "diagonal")),
);
el("#mr-passage").addEventListener("change", () =>
  commit({ ...state, passage: Number(el<HTMLSelectElement>("#mr-passage").value) }),
);
for (const [id, delta] of [
  ["#mr-reading-prev", -1],
  ["#mr-reading-next", 1],
] as const)
  el(id).addEventListener("click", () => commit({ ...state, passage: state.passage + delta }));
for (const [id, passage] of [
  ["#mr-read-never", 3],
  ["#mr-read-squares", 1],
] as const)
  el(id).addEventListener("click", () => {
    commit({ ...state, passage });
    focusSection("#mr-reading");
  });
el("#mr-reading-text").addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>("[data-page]");
  if (button) {
    commit({ ...state, page: Number(button.dataset.page) });
    focusSection("#mr-evidence");
  }
});
el("#mr-page").addEventListener("change", () =>
  commit({ ...state, page: Number(el<HTMLSelectElement>("#mr-page").value) }),
);
el("#mr-zoom").addEventListener("click", () => {
  const area = el("#mr-source-scroll"),
    zoom = !area.classList.contains("mr-zoomed");
  area.classList.toggle("mr-zoomed", zoom);
  el("#mr-zoom").setAttribute("aria-pressed", String(zoom));
  el("#mr-zoom").textContent = zoom ? "Fit the page" : "Enlarge the page";
});
el("#mr-question").addEventListener("submit", (event) => {
  event.preventDefault();
  const answer = document.querySelector<HTMLInputElement>('input[name="mr-answer"]:checked');
  el("#mr-feedback").textContent =
    `${answer?.value === "no" ? "Correct." : "Revisit the hypothesis."} μηδέποτε requires every later turn. The identity (k, k²) = k × (1, k), with 0 < k < 1, supplies that reason for the diagonal. The finite run alone does not.`;
});
function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
el("#mr-csv").addEventListener("click", () =>
  download("stoicheia-common-measure.csv", measureCsv(state), "text/csv;charset=utf-8"),
);
el("#mr-svg").addEventListener("click", () =>
  download("stoicheia-common-measure.svg", measureSvg(state), "image/svg+xml"),
);
el("#mr-save").addEventListener("click", async () => {
  const snapshot = { ...state },
    button = el<HTMLButtonElement>("#mr-save");
  button.disabled = true;
  el("#mr-save-status").textContent = "Verifying twelve source pages and the embedded font…";
  try {
    download(
      "stoicheia-common-measure.html",
      await measureStudy(snapshot),
      "text/html;charset=utf-8",
    );
    el("#mr-save-status").textContent =
      "Saved this turn, its exact record, proof, ten readings, twelve pages and font.";
  } catch (error) {
    el("#mr-save-status").textContent =
      error instanceof Error ? error.message : "The reading could not be saved.";
  } finally {
    button.disabled = false;
  }
});
el("#mr-share").addEventListener("click", () => {
  el("#mr-share-label").hidden = false;
  const input = el<HTMLInputElement>("#mr-share-url");
  input.value = `${location.origin}${location.pathname}${location.search}${encodeMeasure(state)}`;
  input.focus();
  input.select();
});
document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
    return;
  const a = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#mr-"]');
  if (a) {
    event.preventDefault();
    focusSection(a.hash);
  }
});
addEventListener("hashchange", () => {
  try {
    state = decodeMeasure(location.hash);
    el("#mr-notice").textContent = "";
  } catch (error) {
    state = { ...initialMeasure };
    el("#mr-notice").textContent =
      `${error instanceof Error ? error.message : "Invalid experiment."} The starting experiment is shown.`;
  }
  render();
  reading();
  void source();
});
narrow.addEventListener("change", render);
el("#mr-notice").textContent = initialError;
render();
reading();
void source();
prepareOffline(el("#mr-offline"), el<HTMLButtonElement>("#mr-reload"));
