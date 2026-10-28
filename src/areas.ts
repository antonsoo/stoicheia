import license from "../LICENSE?raw";
import {
  areaGraph,
  areaIdentity,
  areaLedger,
  areaPlate,
  areaResult,
  areaShape,
  areaSolutions,
  areaSvg,
  graphExtent,
} from "./areas-drawing";
import { areaReading, areasStudy } from "./areas-study";
import { areaBoundary, areaReadings, areaSourceUrl } from "./content/areas";
import {
  type AreaState,
  areaModel,
  areaPages,
  areaSourceFile,
  areasCsv,
  areasJson,
  decodeAreas,
  encodeAreas,
  initialAreas,
  readAreasJson,
  reflectedTrial,
  validateAreas,
} from "./core/areas";
import { approximate, exact } from "./core/circle";
import { escapeHtml as esc } from "./html";
import { prepareOffline } from "./offline";
import { studyBlobUrl, studyDataUrl, studyText } from "./study-assets";

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing application-of-areas element ${id}`);
  return node as T;
}
let state = { ...initialAreas },
  warning = "",
  revision = 0;
try {
  state = decodeAreas(location.search);
} catch (e) {
  warning = `${e instanceof Error ? e.message : "Invalid link."} The opening example is shown.`;
}

el("app").innerHTML =
  `<header class="ar-header"><a class="ar-brand" href="./">Stoicheia<span lang="grc">ΣΤΟΙΧΕΙΑ</span></a><nav aria-label="Area workshop navigation"><a href="./">Euclid course</a><a href="#ar-reading">Read VI.27–29</a><a href="#ar-evidence">Printed evidence</a><a href="./gnomon.html">Equal complements</a></nav></header><main>
<section class="ar-intro"><div><p class="ar-label">EUCLID VI.27–29 / APPLICATION OF AREAS</p><h1>Two fits.<br/>One limit.</h1></div><div><p>A line twelve units long. An area of twenty-seven. A square left over at the end.</p><p>There are two ways to fit it. Increase the target and the two fits meet. Increase it again, and no amount of precision will help.</p><p class="ar-fine">A geometric investigation for English readers beginning Greek and Latin. Change the cut, compare equal areas, then read the condition Euclid puts on the problem.</p></div></section>
<p id="ar-notice" class="ar-status" role="status">${esc(warning)}</p>
<section class="ar-bench" id="ar-bench" aria-labelledby="ar-title"><h2 id="ar-title" tabindex="-1">Fit an area; keep the given shape</h2>
<div class="ar-examples" role="group" aria-label="Application-of-areas investigations"><button type="button" data-ar-case="two">Two fits<small>Area 27 · falling short</small></button><button type="button" data-ar-case="limit">Meet at the limit<small>Area 36 · falling short</small></button><button type="button" data-ar-case="impossible">An impossible target<small>Area 45 · falling short</small></button><button type="button" data-ar-case="excess">Change one condition<small>Area 45 · exceeding</small></button><button type="button" data-ar-case="irrational">A fit between fractions<small>Area 28 · falling short</small></button></div>
<div class="ar-work"><div><div class="ar-plate"><div id="ar-drawing" tabindex="0" role="region" aria-label="Equal-scale trial plates; use arrow keys to pan on narrow screens"></div><p class="ar-legend" id="ar-legend"></p><div class="ar-trial"><label for="ar-slide">Move t, the <span id="ar-trial-name"></span><input id="ar-slide" type="range" min="0" max="1200" step="1" value="300"/></label><p class="ar-fine">The slider uses hundredths of a length unit. Use a fraction below for an exact trial.</p><form class="ar-trial-form" id="ar-trial-form"><label for="ar-trial">Try a length t<input id="ar-trial" type="text" inputmode="decimal" maxlength="24" autocomplete="off"/></label><button type="submit">Check this trial</button></form><p id="ar-trial-status" class="ar-status" role="status"></p><div class="ar-actions"><button type="button" id="ar-reflect">Use reflected trial a − t</button><button type="button" id="ar-half">Try the half-line</button></div></div></div><div class="ar-result" id="ar-result" aria-live="polite"></div></div>
<aside class="ar-controls" aria-label="Given line, area and similarity shape"><div><h3>Three givens</h3><label for="ar-mode">Apply the parallelogram<select id="ar-mode"><option value="short">Falling short · VI.28</option><option value="beyond">Exceeding · VI.29</option></select></label><form id="ar-givens"><div class="ar-input-grid"><label for="ar-base">Line a<input id="ar-base" type="number" min="4" max="24" step="1" required/></label><label for="ar-target">Target area c<input id="ar-target" type="text" inputmode="decimal" maxlength="24" required/></label></div><label for="ar-shape">Given shape’s height/base k<select id="ar-shape"><option value="half">1/2 · low</option><option value="equal">1 · equal height and base</option><option value="double">2 · tall</option></select></label><label for="ar-shear">Top shift per height (%)<input id="ar-shear" type="number" min="-60" max="60" step="1" required/></label><button type="submit" class="ar-primary">Apply these givens</button><p id="ar-givens-status" class="ar-status" role="status"></p></form></div><div><div id="ar-given-shape" class="ar-shape"></div><p class="ar-fine">The hatched region is always a scaled copy of this given shape. A square occurs only when k = 1 and shift = 0. Height is perpendicular to the base.</p><p class="ar-fine">Changing the shift changes the given shape. At a fixed shift every hatched region has the same angles and side proportions.</p></div></aside></div></section>
<section class="ar-section"><div class="ar-analysis"><div><div class="ar-graph" id="ar-graph" tabindex="0" role="region" aria-label="Modern area graph; horizontally scrollable on narrow screens"></div><p class="ar-fine">Hollow marks: possible fits. Solid mark: your trial. A plotted crossing suggests a fit; the exact account checks it.</p><div id="ar-solutions"></div></div><div id="ar-identity"></div></div><details><summary>Inspect the exact area account</summary><div class="ar-table" id="ar-ledger" tabindex="0" role="region" aria-label="Exact area account"></div></details><div class="ar-actions"><button type="button" id="ar-read-condition">Read the current construction condition</button><button type="button" id="ar-read-reason">Read its geometric reason</button></div></section>
<section class="ar-section" id="ar-reading" aria-labelledby="ar-reading-title"><h2 id="ar-reading-title" tabindex="-1">A word changes the possible construction</h2><p>Compare <span lang="grc">ἐλλεῖπον</span> / <span lang="la">deficiens</span>, “falling short”, with <span lang="grc">ὑπερβάλλον</span> / <span lang="la">excedens</span>, “exceeding”. Nine selections pair the conditions with the source’s area operations. They are selected readings, not the complete proofs.</p><label class="ar-reading-picker" for="ar-reading-select">Choose a reading<select id="ar-reading-select">${areaReadings.map((p, i) => `<option value="${i}">${i + 1}. ${esc(p.title)}</option>`).join("")}</select></label><article id="ar-reading-text"></article><div class="ar-actions"><button type="button" id="ar-prev">Previous reading</button><span id="ar-reading-count"></span><button type="button" id="ar-next">Next reading</button><button type="button" id="ar-greek">Show the Greek page</button><button type="button" id="ar-latin">Show the Latin page</button></div></section>
<section class="ar-section" id="ar-evidence" aria-labelledby="ar-evidence-title"><h2 id="ar-evidence-title" tabindex="-1">Read the restriction on the actual page</h2><div class="ar-source-grid"><div><label for="ar-page">Heiberg, volume II, 1884<select id="ar-page">${areaPages.map((p) => `<option value="${p}">${p ? `p.${p} · ${p % 2 ? "Latin" : "Greek"}` : "1884 title and volume"}</option>`).join("")}</select></label><div class="ar-actions"><button type="button" id="ar-zoom" aria-pressed="false">Enlarge page</button><button type="button" id="ar-retry">Retry source</button></div><p id="ar-source-status" class="ar-status" role="status"></p><p class="ar-fine">Enlarge, focus the page and use arrow keys to pan. All fifteen images are complete pages, with original markings, adjacent text and apparatus.</p><p class="ar-fine">Editorial brackets in the VI.28 restriction remain visible in the reading. Heiberg’s p.163 notes discuss them and explicitly refer the restriction to VI.27. His p.161 note discusses an additional manuscript case. The complete images keep those editorial decisions inspectable.</p><p class="ar-fine">Selections join line breaks and end-of-line hyphens, normalize theta glyphs, omit apparatus and superscript markers, and render Latin point labels in Greek Unicode. Latin u/v spelling remains. English, language notes, colors, coordinates, graph and numerical examples are modern.</p><p><a id="ar-original" href="${areaSourceUrl}">Open this page in the original PDF</a></p><p><a id="ar-local-image" href="./sources/areas/heiberg-162.jpg">Open full local image</a> · <a href="./sources/areas/manifest.json">Source and file identities</a></p></div><figure><div class="ar-source-pan" id="ar-source-pan" tabindex="0" role="region" aria-label="Whole source page; arrow keys pan enlarged image"><div class="ar-source-sheet" id="ar-source-sheet"><img id="ar-source-image" alt="" hidden/></div></div><figcaption class="ar-caption" id="ar-source-caption"></figcaption></figure></div></section>
<section class="ar-section ar-save"><h2>Keep the fits, the failed premise and the readings</h2><p>Save your current trial with exact numbers, diagrams, all nine readings, fifteen complete source images, editable files, the font and full licenses. The illustrated HTML opens from disk without scripts or remote assets.</p><div class="ar-actions"><button type="button" class="ar-primary" id="ar-save">Save illustrated reading</button><button type="button" id="ar-json">Save editable JSON</button><button type="button" id="ar-csv">Save exact CSV</button><button type="button" id="ar-svg">Save plate SVG</button><button type="button" id="ar-share">Make a share link</button></div><label for="ar-import">Reopen an experiment JSON<input type="file" id="ar-import" accept=".json,application/json"/></label><p id="ar-save-status" class="ar-status" role="status"></p><label class="ar-share" id="ar-share-label" for="ar-share-url" hidden>Copy this experiment link<input id="ar-share-url" type="url" readonly/></label><p class="ar-fine">${esc(areaBoundary)}</p><p class="ar-fine">The app models one coordinate family and explains its identities. It does not execute every straightedge-and-compass construction of VI.27–29. Fractions determine equality; drawing pixels and decimal root labels do not. Zero-area endpoints are limiting cases. The given line, area and t have finite interface limits; Euclid’s results do not.</p><p class="ar-fine">New work: MIT. Historical text and scans: public domain. Noto Serif: SIL OFL 1.1. Physical printing and comprehensive assistive-technology review are not claimed.</p></section></main><footer class="ar-footer"><a href="./">Stoicheia · read and construct Euclid</a><span id="ar-offline" role="status">Preparing offline edition…</span><button id="ar-reload" type="button" hidden>Reload saved edition</button><a href="https://github.com/antonsoo/stoicheia">Source &amp; MIT license</a></footer>`;

function bench() {
  const m = areaModel(state);
  el("ar-drawing").innerHTML = areaPlate(state);
  el("ar-given-shape").innerHTML = areaShape(state);
  el("ar-graph").innerHTML = areaGraph(state);
  el("ar-solutions").innerHTML = areaSolutions(state);
  el("ar-identity").innerHTML = areaIdentity(state);
  el("ar-result").innerHTML = areaResult(state);
  el("ar-ledger").innerHTML = areaLedger(state);
  el("ar-legend").textContent =
    state.mode === "short"
      ? "Blue: applied area. Hatching: excluded shortfall. Both panels share one equal-unit scale."
      : "Blue + hatching: applied area. Hatching: included excess beyond a. Equal units on both axes.";
  el("ar-trial-name").textContent =
    state.mode === "short" ? "shortfall’s base" : "extension’s base";
  el<HTMLSelectElement>("ar-mode").value = state.mode;
  el<HTMLInputElement>("ar-base").value = String(state.base);
  el<HTMLInputElement>("ar-target").value = state.target;
  el<HTMLSelectElement>("ar-shape").value = state.shape;
  el<HTMLInputElement>("ar-shear").value = String(state.shear);
  el<HTMLInputElement>("ar-trial").value = state.trial;
  el<HTMLInputElement>("ar-slide").max = String(Math.min(128, graphExtent(state)) * 100);
  el<HTMLInputElement>("ar-slide").value = String(approximate(m.t) * 100);
  el<HTMLButtonElement>("ar-reflect").disabled = state.mode !== "short";
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-ar-case]")) {
    const c = b.dataset.arCase;
    b.setAttribute(
      "aria-pressed",
      String(
        state.base === 12 &&
          state.shape === "equal" &&
          state.shear === 0 &&
          state.mode === (c === "excess" ? "beyond" : "short") &&
          state.target ===
            (c === "two" ? "27" : c === "limit" ? "36" : c === "irrational" ? "28" : "45"),
      ),
    );
  }
}
function reading() {
  el<HTMLSelectElement>("ar-reading-select").value = String(state.reading);
  el("ar-reading-text").innerHTML = areaReading(state.reading);
  el("ar-reading-count").textContent = `${state.reading + 1} / ${areaReadings.length}`;
  el<HTMLButtonElement>("ar-prev").disabled = state.reading === 0;
  el<HTMLButtonElement>("ar-next").disabled = state.reading === areaReadings.length - 1;
}
let sourceRevision = 0,
  sourceUrl = "",
  displayedPage: number | null = null;
async function source(force = false) {
  if (!force && state.page === displayedPage) return;
  const page = state.page,
    version = ++sourceRevision,
    file = areaSourceFile(page);
  displayedPage = page;
  el<HTMLSelectElement>("ar-page").value = String(page);
  const img = el<HTMLImageElement>("ar-source-image");
  img.hidden = true;
  el("ar-source-caption").textContent = "";
  el("ar-source-status").textContent = "Checking this page against the edition’s source identity…";
  el<HTMLAnchorElement>("ar-original").href = `${areaSourceUrl}#page=${page ? page + 26 : 7}`;
  el<HTMLAnchorElement>("ar-local-image").href = `${import.meta.env.BASE_URL}${file}`;
  let candidate = "";
  try {
    candidate = await studyBlobUrl(file, "image/jpeg");
    if (version !== sourceRevision) {
      URL.revokeObjectURL(candidate);
      return;
    }
    const decoded = new Image();
    decoded.src = candidate;
    await decoded.decode();
    if (version !== sourceRevision) {
      URL.revokeObjectURL(candidate);
      return;
    }
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = candidate;
    img.src = candidate;
    img.alt = `Complete ${page ? `${page % 2 ? "Latin" : "Greek"} printed page ${page}` : "1884 volume II title"}, including original marks and apparatus.`;
    img.hidden = false;
    el("ar-source-pan").scrollTo(0, 0);
    el("ar-source-status").textContent = "Source identity verified for this edition.";
    el("ar-source-caption").textContent =
      `${page ? `Printed p.${page} · PDF p.${page + 26}` : "Title · PDF p.7"} · Heiberg, volume II, 1884 · whole page`;
  } catch (e) {
    if (candidate) URL.revokeObjectURL(candidate);
    if (version !== sourceRevision) return;
    displayedPage = null;
    el("ar-source-status").textContent =
      e instanceof Error ? e.message : "Could not load this page. Reconnect and retry.";
  }
}
function commit(next: AreaState, refreshBench = true) {
  state = validateAreas(next);
  revision++;
  el("ar-share-label").hidden = true;
  if (refreshBench) bench();
  reading();
  void source();
}
function apply(next: AreaState, status: string) {
  try {
    commit(next);
    el(status).textContent = "";
  } catch (e) {
    el(status).textContent = e instanceof Error ? e.message : "Check these values.";
  }
}
el("ar-givens").addEventListener("submit", (e) => {
  e.preventDefault();
  apply(
    {
      ...state,
      base: Number(el<HTMLInputElement>("ar-base").value),
      target: el<HTMLInputElement>("ar-target").value.trim(),
      shape: el<HTMLSelectElement>("ar-shape").value as AreaState["shape"],
      shear: Number(el<HTMLInputElement>("ar-shear").value),
    },
    "ar-givens-status",
  );
});
el("ar-trial-form").addEventListener("submit", (e) => {
  e.preventDefault();
  apply({ ...state, trial: el<HTMLInputElement>("ar-trial").value.trim() }, "ar-trial-status");
});
el<HTMLInputElement>("ar-slide").addEventListener("input", (e) =>
  apply({ ...state, trial: `${(e.target as HTMLInputElement).value}/100` }, "ar-trial-status"),
);
el<HTMLSelectElement>("ar-mode").addEventListener("change", (e) => {
  const mode = (e.target as HTMLSelectElement).value as AreaState["mode"];
  const reset = mode === "short" && approximate(areaModel(state).t) > state.base;
  commit({ ...state, mode, trial: reset ? `${state.base}/2` : state.trial });
  el("ar-trial-status").textContent = reset
    ? "The previous extension was longer than the given line. The new falling-short trial is explicitly set to the half-line."
    : "";
});
el("ar-reflect").addEventListener("click", () =>
  apply({ ...state, trial: reflectedTrial(state) }, "ar-trial-status"),
);
el("ar-half").addEventListener("click", () =>
  apply({ ...state, trial: `${state.base}/2` }, "ar-trial-status"),
);
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-ar-case]"))
  b.addEventListener("click", () => {
    const c = b.dataset.arCase;
    commit({
      ...initialAreas,
      mode: c === "excess" ? "beyond" : "short",
      target: c === "two" ? "27" : c === "limit" ? "36" : c === "irrational" ? "28" : "45",
      trial: c === "limit" || c === "impossible" ? "6" : "3",
      reading: c === "excess" ? 6 : c === "two" ? 0 : 1,
      page: c === "excess" ? 166 : 162,
    });
    el("ar-trial-status").textContent = "";
    el("ar-givens-status").textContent = "";
  });
el("ar-solutions").addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-ar-fit]");
  if (!b) return;
  const fit = areaModel(state).fits[Number(b.dataset.arFit)];
  if (fit) {
    commit({ ...state, trial: exact(fit.exact ?? fit.lower) });
    el("ar-trial-status").textContent = fit.exact
      ? "The exact fit is now the trial."
      : "The certified lower endpoint is now the trial. Its nonzero area residual remains visible.";
  }
});
function focusReading(index: number) {
  commit({ ...state, reading: index }, false);
  el("ar-reading-title").focus();
  el("ar-reading").scrollIntoView({ block: "start" });
}
el("ar-read-condition").addEventListener("click", () =>
  focusReading(state.mode === "short" ? 1 : 6),
);
el("ar-read-reason").addEventListener("click", () => focusReading(state.mode === "short" ? 2 : 7));
el<HTMLSelectElement>("ar-reading-select").addEventListener("change", (e) =>
  commit({ ...state, reading: Number((e.target as HTMLSelectElement).value) }, false),
);
el("ar-prev").addEventListener("click", () =>
  commit({ ...state, reading: state.reading - 1 }, false),
);
el("ar-next").addEventListener("click", () =>
  commit({ ...state, reading: state.reading + 1 }, false),
);
for (const [id, offset] of [
  ["ar-greek", 0],
  ["ar-latin", 1],
] as const)
  el(id).addEventListener("click", () => {
    const page = areaReadings[state.reading]?.pages[offset];
    if (page !== undefined) {
      commit({ ...state, page }, false);
      el("ar-evidence-title").focus();
      el("ar-evidence").scrollIntoView({ block: "start" });
    }
  });
el<HTMLSelectElement>("ar-page").addEventListener("change", (e) =>
  commit({ ...state, page: Number((e.target as HTMLSelectElement).value) }, false),
);
el("ar-retry").addEventListener("click", () => void source(true));
el("ar-zoom").addEventListener("click", () => {
  const enlarged = el("ar-source-sheet").classList.toggle("enlarged");
  el("ar-zoom").setAttribute("aria-pressed", String(enlarged));
  el("ar-source-pan").focus();
});
function download(file: string, type: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = file;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
el("ar-json").addEventListener("click", () =>
  download("stoicheia-areas.json", "application/json", areasJson(state)),
);
el("ar-csv").addEventListener("click", () =>
  download("stoicheia-areas.csv", "text/csv", areasCsv(state)),
);
async function exportReading(kind: "html" | "svg") {
  const snapshot = { ...state };
  el("ar-save-status").textContent = "Checking source and font identities for this snapshot…";
  try {
    const content =
      kind === "html"
        ? await areasStudy(snapshot)
        : areaSvg(
            snapshot,
            await studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
            license,
            await studyText("fonts/OFL.txt"),
          );
    download(`stoicheia-areas.${kind}`, kind === "html" ? "text/html" : "image/svg+xml", content);
    el("ar-save-status").textContent =
      `Saved the ${snapshot.mode === "short" ? "falling-short" : "exceeding"} snapshot with target ${snapshot.target} and trial ${snapshot.trial}.`;
  } catch (e) {
    el("ar-save-status").textContent =
      e instanceof Error ? e.message : "Could not prepare the reading. Reconnect and retry.";
  }
}
el("ar-save").addEventListener("click", () => void exportReading("html"));
el("ar-svg").addEventListener("click", () => void exportReading("svg"));
el("ar-share").addEventListener("click", () => {
  el("ar-share-label").hidden = false;
  const input = el<HTMLInputElement>("ar-share-url");
  input.value = `${location.origin}${location.pathname}${encodeAreas(state)}#ar-bench`;
  input.focus();
  input.select();
});
el("app").addEventListener("input", () => {
  revision++;
});
el<HTMLInputElement>("ar-import").addEventListener("change", async (e) => {
  const input = e.target as HTMLInputElement,
    file = input.files?.[0];
  if (!file) return;
  const version = ++revision;
  try {
    if (file.size > 8192) throw new Error("Choose an experiment JSON no larger than 8192 bytes.");
    const text = await file.text();
    if (version !== revision) return;
    const next = readAreasJson(text);
    commit(next);
    el("ar-save-status").textContent =
      "Reopened the saved givens, trial, reading and source choice.";
  } catch (e) {
    if (version === revision)
      el("ar-save-status").textContent =
        e instanceof Error ? e.message : "Could not read this experiment.";
  } finally {
    input.value = "";
  }
});
bench();
reading();
void source();
prepareOffline(el("ar-offline"), el<HTMLButtonElement>("ar-reload"));
