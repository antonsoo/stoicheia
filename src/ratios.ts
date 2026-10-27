import { ratioBoundary, ratioPassages, ratioSourceUrl } from "./content/ratios";
import { exact } from "./core/measure";
import {
  decodeRatios,
  encodeRatios,
  initialRatios,
  type RatioState,
  ratioPages,
  ratioSourceFile,
  ratiosCsv,
  ratiosJson,
  ratioTrial,
  readRatiosJson,
  relationSymbol,
  scanRatios,
  validateRatios,
} from "./core/ratios";
import { escapeHtml as esc } from "./html";
import { prepareOffline } from "./offline";
import {
  ratioArithmetic,
  ratioConclusion,
  ratioLabels,
  ratioMap,
  ratioMicroscope,
  ratioPlate,
  ratioProof,
} from "./ratios-drawing";
import { ratioReading, ratiosStudy } from "./ratios-study";
import { studyBlobUrl } from "./study-assets";

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing ratio element ${id}`);
  return node as T;
}
let state: RatioState = { ...initialRatios },
  warning = "";
try {
  state = decodeRatios(location.search);
} catch (e) {
  warning = `${e instanceof Error ? e.message : "Invalid link."} The starting experiment is shown.`;
}
el("app").innerHTML =
  `<header class="rt-header"><a href="./" class="rt-brand">Stoicheia<span lang="grc">ΣΤΟΙΧΕΙΑ</span></a><nav aria-label="Ratio workshop navigation"><a href="./">Euclid course</a><a href="#rt-reading">Read Book V</a><a href="./measure.html">Common measure</a><a href="#rt-evidence">Printed evidence</a></nav></header><main><section class="rt-intro"><div><p class="rt-kicker">EUCLID V.5 / EVERY MULTIPLIER MATTERS</p><h1>Thousands agree.<br>One can disagree.</h1></div><div class="rt-lead"><p>Compare a square’s diagonal to its side. Compare 99 lengths to 70. Can you tell these ratios apart without trusting a rounded decimal?</p><p>Take repeated copies. Change two whole numbers. Look for one comparison that Euclid’s definition refuses to call the same.</p><p class="rt-fine">Greek, Heiberg’s Latin, and new English beside a modern exact experiment. No prior Greek needed.</p></div></section><p id="rt-notice" class="rt-notice" role="status">${esc(warning)}</p>
<section class="rt-bench" id="rt-bench" aria-labelledby="rt-title"><div class="rt-bench-title"><h2 id="rt-title" tabindex="-1"></h2><p>m copies of the first and third / n copies of the second and fourth</p></div><div class="rt-workspace"><div class="rt-plate"><div id="rt-plate"></div><div id="rt-signs" class="rt-signs" aria-live="polite"></div><div class="rt-microscope" id="rt-microscope"></div></div><aside class="rt-controls"><h3>Choose the multiples.</h3><div class="rt-multipliers">${["m", "n"].map((k) => `<div class="rt-control"><label for="rt-${k}-range">${k} · copies of ${k === "m" ? "A and C" : "B and D"}</label><input id="rt-${k}-range" type="range" min="1" max="1000" step="1" aria-label="${k} multiplier slider"/><label for="rt-${k}">Exact whole number<input id="rt-${k}" type="number" min="1" max="1000" step="1" required/></label></div>`).join("")}</div><p class="rt-fine">The two multipliers are independent. The same m is used in both pairs; the same n is used in both pairs. m need not equal n.</p><p class="rt-fine">Each pair has its own drawing scale. More than 32 copies are shown as a continuous band. Exact signs remain decisive when a gap is smaller than a pixel.</p><p id="rt-multiple-status" role="status" class="rt-status"></p></aside></div><p id="rt-verdict" class="rt-verdict" role="status"></p><details class="rt-arithmetic"><summary>Check the exact comparison without decimals</summary><div id="rt-arithmetic"></div></details></section>
<section class="rt-section" aria-labelledby="rt-pair-title"><div class="rt-section-heading"><div><p class="rt-kicker">CHANGE THE QUESTION</p><h2 id="rt-pair-title">A close fraction.<br>A scaled copy.</h2></div><p>The first pair stays A = √2, B = 1. Choose the second pair. All lengths are in side-length units; the ratio notation is modern. The threefold pair asks a different question: can a general reason guarantee that every comparison agrees?</p></div><div class="rt-pairs" role="group" aria-label="Second ratio examples"><button type="button" data-rt-pair="99,70">99 : 70<small>A fraction just above √2</small></button><button type="button" data-rt-pair="140,99">140 : 99<small>A fraction just below √2</small></button><button type="button" data-rt-pair="577,408">577 : 408<small>A much closer fraction</small></button><button type="button" data-rt-pair="scaled">3√2 : 3<small>Three times both lengths</small></button></div><form id="rt-fraction" class="rt-fraction-form"><div class="rt-fields"><label for="rt-p">First length p<input id="rt-p" type="number" min="1" max="9999" required/></label><label for="rt-q">Second length q<input id="rt-q" type="number" min="1" max="9999" required/></label></div><button type="submit">Use this exact fraction</button><p class="rt-fine">Whole-number lengths from 1 to 9999; p/q between 1 and 2.</p></form><p id="rt-fraction-status" class="rt-status" role="status"></p></section>
<section class="rt-section" id="rt-search" aria-labelledby="rt-search-title"><div class="rt-section-heading"><div><p class="rt-kicker">A FINITE SQUARE / AN UNBOUNDED CONDITION</p><h2 id="rt-search-title">How far did<br>you actually look?</h2></div><p>Search every pair of positive integer multipliers within a square. Blue means the relation signs agree. Rust means they disagree. A search can find a counterexample; it cannot finish the word “whatever.”</p></div><div class="rt-search"><div><form id="rt-search-form" class="rt-search-controls"><label for="rt-bound">Search m and n from 1 through<input id="rt-bound" type="number" min="1" max="1000" required/></label><button type="submit">Search this square</button></form><div class="rt-actions"><button type="button" data-rt-bound="69">Through 69</button><button type="button" data-rt-bound="100">Through 100</button><button type="button" data-rt-bound="600">Through 600</button></div><p id="rt-search-status" class="rt-status" role="status"></p><p id="rt-scan-result" class="rt-scan-result" role="status"></p><div id="rt-scan-first" class="rt-scan-first"></div><div class="rt-actions"><button type="button" id="rt-find" class="rt-primary">Use the first disagreement</button><button type="button" id="rt-excess">Use a V.7 excess witness</button></div><p id="rt-excess-note" class="rt-fine"></p><p class="rt-fine">“First” means increasing m, then increasing n. Search is bounded at 1000 for each multiplier. A dashed ring locates the first disagreement; a solid ring locates your selected comparison if inside the square. Rings are locators, not additional cells.</p><p class="rt-fine">Click the map to choose m and n, or use the whole-number controls above with a keyboard. The map marks subpixel disagreement cells with a minimum visible stroke.</p></div><div class="rt-map" id="rt-map"></div></div><details class="rt-proof"><summary>A reason beyond the search square</summary><div id="rt-proof"></div></details></section>
<section class="rt-section" id="rt-reading" aria-labelledby="rt-reading-title"><div class="rt-section-heading"><div><p class="rt-kicker">SEVEN READING UNITS / THREE LANGUAGES</p><h2 id="rt-reading-title" tabindex="-1">The force<br>of “whatever.”</h2></div><p>Read definitions 3–7, then return to the clauses that control the experiment. Heiberg’s Latin is a nineteenth-century translation. The English and contextual language notes are new.</p></div><label for="rt-reading-select">Choose a reading <select id="rt-reading-select">${ratioPassages.map((p, i) => `<option value="${i}">${i + 1}. ${esc(p.title)}</option>`).join("")}</select></label><article id="rt-reading-text"></article><div class="rt-reader-actions"><button type="button" id="rt-reading-prev">Previous reading</button><span id="rt-reading-count"></span><button type="button" id="rt-reading-next">Next reading</button></div><div class="rt-actions"><button type="button" id="rt-find-greek">Show this Greek page</button><button type="button" id="rt-find-latin">Show this Latin page</button></div></section>
<section class="rt-section" id="rt-evidence" aria-labelledby="rt-evidence-title"><div class="rt-section-heading"><div><p class="rt-kicker">HEIBERG / 1884 / VOLUME II</p><h2 id="rt-evidence-title" tabindex="-1">Read the whole page.<br>Keep the footnotes.</h2></div><p>Four complete printed pages and the title page, from the University of Toronto copy digitized by Internet Archive. The algebra beneath the Latin is Heiberg’s explanation. It is not notation printed by Euclid.</p></div><div class="rt-source-grid"><div><label for="rt-page">Printed evidence<select id="rt-page">${ratioPages.map((p) => `<option value="${p}">${p ? `p.${p} · ${p % 2 ? "Latin" : "Greek"}` : "1884 title and volume"}</option>`).join("")}</select></label><div class="rt-actions"><button type="button" id="rt-zoom" aria-pressed="false">Enlarge page</button><button type="button" id="rt-retry">Retry source</button></div><p id="rt-source-status" class="rt-status" role="status"></p><p>At enlarged size, focus the page and use arrow keys to pan. Whole images retain all margins, notes and marks.</p><p>Selected text removes line wrapping, end-of-line hyphens and superscript note markers. Greek theta glyphs are normalized; Latin u/v spellings remain. The original apparatus stays in the images.</p><p><a id="rt-original" href="${ratioSourceUrl}">Open this page in the original PDF</a></p><p><a id="rt-full-image" href="./sources/ratios/heiberg-002.jpg">Open full local image</a> · <a href="./sources/ratios/manifest.json">Source and file identities</a></p></div><figure><div id="rt-source-pan" class="rt-source-pan" role="region" aria-label="Complete printed source page; use arrow keys to pan" tabindex="0"><div id="rt-source-sheet" class="rt-source-sheet"><img id="rt-source-image" alt="" hidden/></div></div><figcaption id="rt-source-caption" class="rt-caption"></figcaption></figure></div></section>
<section class="rt-section"><div class="rt-section-heading"><div><p class="rt-kicker">CHECK THE QUANTIFIER</p><h2>Which conclusion<br>have you earned?</h2></div><form id="rt-question" class="rt-question"><fieldset><legend>All 4,761 comparisons with m and n through 69 agree for √2 : 1 and 99 : 70. What follows?</legend><label><input type="radio" name="rt-answer" value="equal" required/>The ratios are equal, since 4,761 checks are enough.</label><label><input type="radio" name="rt-answer" value="bounded"/>No counterexample occurs in that square; other multipliers remain to be considered.</label><label><input type="radio" name="rt-answer" value="rounded"/>They become equal if a drawing shows coincident endpoints.</label></fieldset><button type="submit">Check the reasoning</button><p id="rt-feedback" role="status" class="rt-status"></p></form></div></section>
<section class="rt-section"><div class="rt-section-heading"><div><p class="rt-kicker">KEEP THE EXPERIMENT AND ITS EVIDENCE</p><h2>One reading,<br>away from the app.</h2></div><div><p>Save your comparison, the bounded search, exact reasons, all seven readings, five source images, font and licenses in one script-free HTML file. It opens from disk and prints. Embedded JSON restores these settings in the workshop.</p><div class="rt-actions"><button type="button" id="rt-save" class="rt-primary">Save illustrated reading</button><button type="button" id="rt-json">Save editable JSON</button><button type="button" id="rt-csv">Save comparison CSV</button><button type="button" id="rt-share">Make a share link</button></div><label for="rt-import">Reopen an experiment JSON<input type="file" id="rt-import" accept=".json,application/json"/></label><p id="rt-save-status" class="rt-status" role="status"></p><label class="rt-share" id="rt-share-label" for="rt-share-url" hidden>Copy this experiment link<input type="url" id="rt-share-url" readonly/></label></div></div><p class="rt-fine">${esc(ratioBoundary)}</p><p class="rt-fine">All signs, equality decisions and search intervals are exact BigInt calculations in Q(√2). Decimals and SVG positions are drawing aids. Search computes comparisons; it does not record individual learner actions. New English and language notes have not had independent philological peer review. Source pages are public domain; new work is MIT. Noto Serif is bundled under SIL OFL 1.1. <a href="./horn.html">Investigate the horn-angle boundary</a>.</p></section></main><footer class="rt-footer"><a href="./">Stoicheia · read and construct Euclid</a><span id="rt-offline" role="status">Preparing offline edition…</span><button type="button" id="rt-reload" hidden>Reload saved edition</button><a href="https://github.com/antonsoo/stoicheia">Source &amp; MIT license</a></footer>`;

let sourceRevision = 0,
  sourceUrl = "",
  displayedPage: number | null = null;
function renderBench() {
  const t = ratioTrial(state),
    scan = scanRatios(state);
  el("rt-title").textContent = ratioLabels(state);
  el("rt-plate").innerHTML = ratioPlate(state);
  el("rt-signs").innerHTML =
    `<p>First comparison<strong>${esc(exact(t.ma))} ${esc(relationSymbol(t.first))} ${esc(exact(t.nb))}</strong></p><p>Second comparison<strong>${esc(exact(t.mc))} ${esc(relationSymbol(t.second))} ${esc(exact(t.nd))}</strong></p>`;
  el("rt-microscope").innerHTML = ratioMicroscope(state);
  el("rt-verdict").textContent = ratioConclusion(state);
  el("rt-arithmetic").innerHTML = ratioArithmetic(state);
  for (const k of ["m", "n"] as const) {
    el<HTMLInputElement>(`rt-${k}`).value = String(state[k]);
    el<HTMLInputElement>(`rt-${k}-range`).value = String(state[k]);
  }
  for (const k of ["p", "q", "bound"] as const)
    el<HTMLInputElement>(`rt-${k}`).value = String(state[k]);
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-rt-pair]"))
    button.setAttribute(
      "aria-pressed",
      String(
        state.kind === "scaled"
          ? button.dataset.rtPair === "scaled"
          : button.dataset.rtPair === `${state.p},${state.q}`,
      ),
    );
  el("rt-map").innerHTML = ratioMap(state);
  el("rt-scan-result").textContent = scan.disagreements
    ? `${scan.disagreements.toLocaleString("en-US")} of ${scan.checked.toLocaleString("en-US")} comparisons disagree. The ratios fail the condition for equality.`
    : `${scan.checked.toLocaleString("en-US")} comparisons agree. No counterexample in this finite square. Equality for every pair has not been established by this search.`;
  el("rt-scan-first").textContent = scan.first
    ? `First disagreement in m-then-n order: m = ${scan.first.m}, n = ${scan.first.n}.`
    : "Enlarge the square, change a ratio, or inspect a general argument below.";
  el<HTMLButtonElement>("rt-find").disabled = !scan.first;
  el<HTMLButtonElement>("rt-excess").disabled = !scan.firstExcess;
  el("rt-excess-note").textContent = scan.firstExcess
    ? `First strict-excess/non-excess witness: m = ${scan.firstExcess.m}, n = ${scan.firstExcess.n}. Read definition 7 to see why it establishes an order.`
    : "No strict-excess/non-excess witness in this square. A disagreement with equality can still refute equal ratios without having V.7’s exact form.";
  el("rt-proof").innerHTML = ratioProof(state);
  el("rt-share-label").hidden = true;
}
function renderReading() {
  el<HTMLSelectElement>("rt-reading-select").value = String(state.reading);
  el("rt-reading-text").innerHTML = ratioReading(state.reading, true);
  el("rt-reading-count").textContent = `${state.reading + 1} / ${ratioPassages.length}`;
  el<HTMLButtonElement>("rt-reading-prev").disabled = state.reading === 0;
  el<HTMLButtonElement>("rt-reading-next").disabled = state.reading === ratioPassages.length - 1;
}
async function source(force = false) {
  if (!force && displayedPage === state.page) return;
  const page = state.page,
    revision = ++sourceRevision;
  displayedPage = page;
  el<HTMLSelectElement>("rt-page").value = String(page);
  const img = el<HTMLImageElement>("rt-source-image");
  img.hidden = true;
  el("rt-source-caption").textContent = "";
  el("rt-source-status").textContent = "Checking this page against the edition’s source identity…";
  const file = ratioSourceFile(page);
  el<HTMLAnchorElement>("rt-original").href = `${ratioSourceUrl}#page=${page ? page + 26 : 7}`;
  el<HTMLAnchorElement>("rt-full-image").href = `${import.meta.env.BASE_URL}${file}`;
  let candidateUrl = "";
  try {
    const url = await studyBlobUrl(file, "image/jpeg");
    candidateUrl = url;
    if (revision !== sourceRevision) {
      URL.revokeObjectURL(url);
      return;
    }
    // A shared image's decode promise can attach to a superseded request in
    // Firefox. Decode each candidate independently before touching the viewer.
    const decoded = new Image();
    decoded.src = url;
    await decoded.decode();
    if (revision !== sourceRevision) {
      URL.revokeObjectURL(url);
      return;
    }
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = url;
    img.src = url;
    img.alt = `Complete ${page ? `${page % 2 ? "Latin" : "Greek"} printed page ${page}` : "1884 volume II title"}, including all notes and original markings.`;
    img.hidden = false;
    el("rt-source-pan").scrollTo(0, 0);
    el("rt-source-status").textContent = "Source identity verified for this edition.";
    el("rt-source-caption").textContent =
      `${page ? `Printed p.${page} · PDF p.${page + 26}` : "Title · PDF p.7"} · Heiberg, volume II, 1884 · complete page`;
  } catch (e) {
    if (candidateUrl) URL.revokeObjectURL(candidateUrl);
    if (revision !== sourceRevision) return;
    displayedPage = null;
    el("rt-source-status").textContent =
      e instanceof Error ? e.message : "The source could not be read. Retry when connected.";
  }
}
function commit(next: RatioState) {
  const previous = state;
  state = validateRatios(next);
  history.pushState(null, "", `${location.pathname}${encodeRatios(state)}${location.hash}`);
  el("rt-notice").textContent = "";
  renderBench();
  if (state.reading !== previous.reading) renderReading();
  void source();
}
function apply(next: RatioState, status: string) {
  try {
    commit(next);
    el(status).textContent = "";
  } catch (e) {
    el(status).textContent = e instanceof Error ? e.message : "Choose valid settings.";
  }
}
for (const k of ["m", "n"] as const) {
  el<HTMLInputElement>(`rt-${k}`).addEventListener("change", (e) =>
    apply({ ...state, [k]: Number((e.target as HTMLInputElement).value) }, "rt-multiple-status"),
  );
  el<HTMLInputElement>(`rt-${k}-range`).addEventListener("input", (e) =>
    apply({ ...state, [k]: Number((e.target as HTMLInputElement).value) }, "rt-multiple-status"),
  );
}
el("rt-fraction").addEventListener("submit", (e) => {
  e.preventDefault();
  apply(
    {
      ...state,
      kind: "fraction",
      p: el<HTMLInputElement>("rt-p").valueAsNumber,
      q: el<HTMLInputElement>("rt-q").valueAsNumber,
    },
    "rt-fraction-status",
  );
});
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-rt-pair]"))
  b.addEventListener("click", () => {
    const choice = b.dataset.rtPair ?? "";
    const [p, q] = choice.split(",").map(Number);
    apply(
      choice === "scaled"
        ? { ...state, kind: "scaled" }
        : { ...state, kind: "fraction", p: p ?? 0, q: q ?? 0 },
      "rt-fraction-status",
    );
  });
el("rt-search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  apply({ ...state, bound: el<HTMLInputElement>("rt-bound").valueAsNumber }, "rt-search-status");
});
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-rt-bound]"))
  b.addEventListener("click", () =>
    apply({ ...state, bound: Number(b.dataset.rtBound) }, "rt-search-status"),
  );
el("rt-find").addEventListener("click", () => {
  const first = scanRatios(state).first;
  if (first) {
    commit({ ...state, ...first });
    el("rt-title").scrollIntoView({ block: "start" });
    el("rt-title").focus({ preventScroll: true });
  }
});
el("rt-excess").addEventListener("click", () => {
  const witness = scanRatios(state).firstExcess;
  if (witness) {
    commit({ ...state, ...witness });
    el("rt-title").scrollIntoView({ block: "start" });
    el("rt-title").focus({ preventScroll: true });
  }
});
el("rt-map").addEventListener("click", (e) => {
  const svg = el("rt-map").querySelector("svg");
  if (!svg) return;
  const rect = svg.getBoundingClientRect(),
    x = ((e.clientX - rect.left) / rect.width) * 460,
    y = ((e.clientY - rect.top) / rect.height) * 450;
  if (x < 64 || x > 420 || y < 40 || y > 396) return;
  const clamp = (v: number) => Math.min(state.bound, Math.max(1, Math.floor(v) + 1));
  commit({
    ...state,
    m: clamp(((x - 64) / 356) * state.bound),
    n: clamp(((396 - y) / 356) * state.bound),
  });
});
el<HTMLSelectElement>("rt-reading-select").addEventListener("change", (e) =>
  commit({ ...state, reading: Number((e.target as HTMLSelectElement).value) }),
);
el("rt-reading-prev").addEventListener("click", () =>
  commit({ ...state, reading: state.reading - 1 }),
);
el("rt-reading-next").addEventListener("click", () =>
  commit({ ...state, reading: state.reading + 1 }),
);
el("rt-reading-text").addEventListener("click", (e) => {
  const button = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-rt-word]");
  const word = button && ratioPassages[state.reading]?.words[Number(button.dataset.rtWord)];
  if (!word) return;
  el("rt-word-note").innerHTML =
    `<span lang="grc">${esc(word.greek)}</span> / <span lang="la">${esc(word.latin)}</span> — ${esc(word.meaning)}`;
  for (const b of el("rt-reading-text").querySelectorAll("[data-rt-word]"))
    b.setAttribute("aria-pressed", String(b === button));
});
for (const [id, offset] of [
  ["rt-find-greek", 0],
  ["rt-find-latin", 1],
] as const)
  el(id).addEventListener("click", () => {
    const page = ratioPassages[state.reading]?.pages[offset];
    if (page === undefined) return;
    commit({ ...state, page });
    el("rt-evidence-title").scrollIntoView({ block: "start" });
    el("rt-evidence-title").focus({ preventScroll: true });
  });
el<HTMLSelectElement>("rt-page").addEventListener("change", (e) =>
  commit({ ...state, page: Number((e.target as HTMLSelectElement).value) }),
);
el("rt-retry").addEventListener("click", () => void source(true));
el("rt-zoom").addEventListener("click", () => {
  const zoomed = el("rt-zoom").getAttribute("aria-pressed") !== "true";
  el("rt-source-sheet").style.width = zoomed ? "220%" : "100%";
  el("rt-zoom").setAttribute("aria-pressed", String(zoomed));
  el("rt-zoom").textContent = zoomed ? "Fit page to width" : "Enlarge page";
});
el("rt-question").addEventListener("submit", (e) => {
  e.preventDefault();
  const answer = new FormData(el<HTMLFormElement>("rt-question")).get("rt-answer");
  el("rt-feedback").textContent =
    answer === "bounded"
      ? "Yes. V.5 asks for every pair. At m = 70, n = 99 the first comparison falls short while the second is equal. That single counterexample refutes equality."
      : "The finite square leaves multipliers untested. A rounded endpoint does not settle an exact relation. Try extending the square through 100.";
});
function save(body: string, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([body], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
el("rt-json").addEventListener("click", () =>
  save(ratiosJson(state), "application/json", "stoicheia-ratios.json"),
);
el("rt-csv").addEventListener("click", () =>
  save(ratiosCsv(state), "text/csv;charset=utf-8", "stoicheia-ratios.csv"),
);
el("rt-save").addEventListener("click", async () => {
  const button = el<HTMLButtonElement>("rt-save"),
    snapshot = { ...state };
  button.disabled = true;
  el("rt-save-status").textContent = "Verifying the source pages and font for this reading…";
  try {
    save(await ratiosStudy(snapshot), "text/html;charset=utf-8", "stoicheia-ratios-reading.html");
    el("rt-save-status").textContent =
      "Saved the comparison present when you chose Save, with all readings and source pages.";
  } catch (e) {
    el("rt-save-status").textContent =
      e instanceof Error
        ? e.message
        : "The complete reading could not be saved. Retry when connected.";
  } finally {
    button.disabled = false;
  }
});
el<HTMLInputElement>("rt-import").addEventListener("change", async (e) => {
  const input = e.target as HTMLInputElement,
    file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 8192) throw new Error("Choose a ratios record smaller than 8192 bytes.");
    const next = readRatiosJson(await file.text());
    commit(next);
    renderReading();
    el("rt-save-status").textContent =
      "Experiment restored. Exact comparisons have been recalculated.";
  } catch (error) {
    el("rt-save-status").textContent =
      `${error instanceof Error ? error.message : "Invalid record."} Your current experiment is preserved.`;
  } finally {
    input.value = "";
  }
});
el("rt-share").addEventListener("click", () => {
  el("rt-share-label").hidden = false;
  const input = el<HTMLInputElement>("rt-share-url");
  input.value = `${location.origin}${location.pathname}${encodeRatios(state)}#rt-bench`;
  input.focus();
  input.select();
});
addEventListener("popstate", () => {
  try {
    state = decodeRatios(location.search);
    el("rt-notice").textContent = "";
  } catch (e) {
    state = { ...initialRatios };
    el("rt-notice").textContent =
      `${e instanceof Error ? e.message : "Invalid link."} Starting experiment restored.`;
  }
  renderBench();
  renderReading();
  void source();
});
renderBench();
renderReading();
void source();
prepareOffline(el("rt-offline"), el<HTMLButtonElement>("rt-reload"));
