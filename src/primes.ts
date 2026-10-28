import license from "../LICENSE?raw";
import { primeBoundary, primePassages, primeSourceUrl } from "./content/primes";
import {
  decodePrimes,
  encodePrimes,
  initialPrimes,
  type PrimeState,
  parseGiven,
  primePages,
  primeSourceFile,
  primesCsv,
  primesJson,
  primeTrial,
  readPrimesJson,
  validatePrimes,
} from "./core/primes";
import { escapeHtml as esc } from "./html";
import { prepareOffline } from "./offline";
import {
  primeBranches,
  primeConstruction,
  primeDescent,
  primeEquation,
  primeGeneralReason,
  primeLedger,
  primeResult,
  primeSvg,
  primeUnits,
} from "./primes-drawing";
import { primeReading, primesStudy } from "./primes-study";
import { studyBlobUrl } from "./study-assets";

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing prime element ${id}`);
  return node as T;
}
let state = structuredClone(initialPrimes),
  warning = "",
  recordRevision = 0;
try {
  state = decodePrimes(location.search);
} catch (e) {
  warning = `${e instanceof Error ? e.message : "Invalid link."} The opening example is shown.`;
}
el("app").innerHTML =
  `<header class="pr-header"><a class="pr-brand" href="./">Stoicheia<span lang="grc">ΣΤΟΙΧΕΙΑ</span></a><nav aria-label="Prime workshop navigation"><a href="./">Euclid course</a><a href="#pr-reading">Read IX.20</a><a href="#pr-descent">Why a prime divisor?</a><a href="#pr-evidence">Printed evidence</a></nav></header><main><section class="pr-intro"><div><p class="pr-label">Euclid IX.20 · Greek, Latin and exact arithmetic</p><h1>Euclid’s<br>extra prime</h1></div><div><p>Multiply 2, 3, 5, 7, 11 and 13, then add one. None of these primes divides the result. Does that make it prime?</p><p>Inspect the unit left over. Extend a bounded search. Read the two cases Euclid actually uses.</p><p class="pr-fine">For English readers beginning Greek and Latin. The numbers and controls are modern examples; the complete printed pages stay alongside the argument.</p></div></section><p class="pr-status" id="pr-notice" role="status">${esc(warning)}</p>
<section class="pr-bench" id="pr-bench" aria-labelledby="pr-title"><h2 id="pr-title" tabindex="-1">Add a unit to a common multiple</h2><div class="pr-controls"><form id="pr-givens"><label for="pr-list">Given distinct primes<textarea id="pr-list" rows="2" spellcheck="false" inputmode="numeric"></textarea></label><button type="submit" class="pr-primary">Use these primes</button><p class="pr-fine">One to twelve primes, separated by commas or spaces. Each at most 10,000,000,000. Primality of each given is checked exactly. The unit 1 is excluded.</p><p class="pr-status" id="pr-input-status" role="status"></p></form><div><p>Change the givens to examine a different job for the new prime.</p><div class="pr-presets" role="group" aria-label="Prime argument examples"><button type="button" data-pr-case="six">Six givens<small>2, 3, 5, 7, 11, 13</small></button><button type="button" data-pr-case="three">Three givens<small>2, 3, 5</small></button><button type="button" data-pr-case="smaller">An omitted smaller prime<small>3, 5, 7</small></button></div><p class="pr-fine">The source names three primes A, B, Γ, without assigning values or requiring consecutive primes. Our opening six-prime list is a separate counterexample to “the sum must be prime.”</p></div></div><div id="pr-construction"></div><div class="pr-division"><div class="pr-table" id="pr-ledger" tabindex="0" role="region" aria-label="Exact division ledger; choose a prime to inspect"></div><div class="pr-unit-plate"><h3>Inspect the last group</h3><div id="pr-units"></div><div id="pr-equation"></div></div></div></section>
<section class="pr-section" id="pr-search" aria-labelledby="pr-search-title"><h2 id="pr-search-title">Which branch does this example take?</h2><div class="pr-search"><div><label for="pr-limit">Try prime divisors no larger than<select id="pr-limit"><option value="13">13 · the opening bound</option><option value="100">100</option><option value="10000">10,000</option><option value="100000">100,000</option></select></label><div class="pr-actions"><button type="button" id="pr-extend">Try through 100</button></div><p class="pr-fine">Trial division uses exact whole numbers. An unresolved cofactor stays unresolved. A prime is certified only after every possible prime divisor up to its square root has been excluded.</p></div><div><div id="pr-result" aria-live="polite"></div><div class="pr-witnesses" id="pr-witnesses" role="group" aria-label="Add a proven new prime to the givens"></div><p id="pr-witness-status" class="pr-status" role="status"></p></div></div><div id="pr-branches"></div></section>
<section class="pr-section" aria-labelledby="pr-reason-title"><h2 id="pr-reason-title">A reason for any finite list</h2>${primeGeneralReason()}</section>
<section class="pr-section" id="pr-descent" aria-labelledby="pr-descent-title"><h2 id="pr-descent-title">Why must a prime divisor exist?</h2><p>VII.31 takes a divisor of a composite divisor, then continues if needed. Try to keep descending without reaching a prime. This separate small example starts at 2310; it is not the current N.</p><div id="pr-chain" aria-live="polite"></div><div class="pr-actions"><button type="button" id="pr-undo">Undo a divisor</button><button type="button" id="pr-reset-descent">Restart at 2310</button><button type="button" id="pr-read-descent">Read VII.31</button></div><p>The chain is strictly decreasing through whole numbers at least two. Only finitely many lie below 2310. In general, below any fixed starting number there are only finitely many choices: a descent cannot continue forever. Each chosen divisor still divides the original.</p></section>
<section class="pr-section" id="pr-reading" aria-labelledby="pr-reading-title"><h2 id="pr-reading-title" tabindex="-1">Read both cases</h2><p>Seven units cover the complete IX.20 proof. Four supporting readings introduce the unit, number and prime-divisor argument. Heiberg’s Latin is a nineteenth-century translation; the English and contextual language notes are new.</p><label class="pr-reading-picker" for="pr-reading-select">Choose a reading<select id="pr-reading-select">${primePassages.map((p, i) => `<option value="${i}">${i + 1}. ${esc(p.title)}</option>`).join("")}</select></label><article id="pr-reading-text"></article><div class="pr-reader-actions"><button type="button" id="pr-prev">Previous reading</button><span id="pr-reading-count"></span><button type="button" id="pr-next">Next reading</button></div><div class="pr-actions"><button type="button" id="pr-greek">Show the Greek page</button><button type="button" id="pr-latin">Show the Latin page</button></div></section>
<section class="pr-section" id="pr-evidence" aria-labelledby="pr-evidence-title"><h2 id="pr-evidence-title" tabindex="-1">Inspect the complete printed page</h2><div class="pr-source-grid"><div><label for="pr-page">Heiberg, volume II, 1884<select id="pr-page">${primePages.map((p) => `<option value="${p}">${p ? `p.${p} · ${p % 2 ? "Latin" : "Greek"}` : "1884 title and volume"}</option>`).join("")}</select></label><div class="pr-actions"><button type="button" id="pr-zoom" aria-pressed="false">Enlarge page</button><button type="button" id="pr-retry">Retry source</button></div><p class="pr-status" id="pr-source-status" role="status"></p><p class="pr-fine">Enlarge, focus the page and use arrow keys to pan. Whole images retain footnotes, neighbouring propositions and original marks.</p><p class="pr-fine">Selections join line breaks and line-end hyphens, omit superscript markers and normalize theta glyphs. Greek and Latin letter labels use Greek Unicode; Latin u/v spellings remain. The p.389 line orders Δ–E–Z; the text names ΔZ as the unit and EZ as the sum. Read the note in unit 2 before treating that diagram as a scale drawing.</p><p><a id="pr-original" href="${primeSourceUrl}">Open this page in the original PDF</a></p><p><a id="pr-image-link" href="./sources/primes/heiberg-388.jpg">Open full local image</a> · <a href="./sources/primes/manifest.json">Source and file identities</a></p></div><figure><div id="pr-source-pan" class="pr-source-pan" tabindex="0" role="region" aria-label="Whole printed source page; arrow keys pan enlarged image"><div id="pr-source-sheet" class="pr-source-sheet"><img id="pr-source-image" alt="" hidden/></div></div><figcaption id="pr-source-caption" class="pr-caption"></figcaption></figure></div></section>
<section class="pr-section"><h2>Check the inference</h2><form id="pr-question" class="pr-question"><fieldset><legend>Given 3, 5 and 7, the sum is 106 = 2 × 53. Which conclusion fits IX.20?</legend><label><input type="radio" name="pr-answer" value="fails" required/>The argument fails, because 106 is composite.</label><label><input type="radio" name="pr-answer" value="next"/>The construction must supply the next prime after 7.</label><label><input type="radio" name="pr-answer" value="divisor"/>The prime divisor 2 is outside the list and completes the argument, although it is smaller than every given.</label></fieldset><div class="pr-actions"><button type="submit">Check the reasoning</button></div><p id="pr-feedback" class="pr-status" role="status"></p></form></section>
<section class="pr-section"><h2>Keep the argument and its evidence</h2><p>The illustrated reading carries your exact givens, ledger, bounded result, divisor chain, all eleven readings, eleven source images, font and licenses. It opens from disk without scripts and prints. Its native JSON restores the settings here.</p><div class="pr-actions"><button type="button" id="pr-save" class="pr-primary">Save illustrated reading</button><button type="button" id="pr-json">Save editable JSON</button><button type="button" id="pr-csv">Save division CSV</button><button type="button" id="pr-svg">Save construction SVG</button><button type="button" id="pr-share">Make a share link</button></div><label for="pr-import">Reopen an experiment JSON<input type="file" id="pr-import" accept=".json,application/json"/></label><p id="pr-save-status" class="pr-status" role="status"></p><label class="pr-share" id="pr-share-label" for="pr-share-url" hidden>Copy this experiment link<input type="url" id="pr-share-url" readonly/></label><p class="pr-fine">${esc(primeBoundary)}</p><p class="pr-fine">New work is MIT licensed. Historical text and scans are public domain; bundled Noto Serif uses SIL OFL 1.1. New English and language notes have not had independent philological review. No numerical bound on this page is a bound on Euclid’s theorem.</p></section></main><footer class="pr-footer"><a href="./">Stoicheia · read and construct Euclid</a><span id="pr-offline" role="status">Preparing offline edition…</span><button type="button" id="pr-reload" hidden>Reload saved edition</button><a href="https://github.com/antonsoo/stoicheia">Source &amp; MIT license</a></footer>`;

function bench() {
  const focused =
    document.activeElement instanceof HTMLElement
      ? document.activeElement.dataset.prSelect
      : undefined;
  el<HTMLTextAreaElement>("pr-list").value = state.primes.join(", ");
  el("pr-construction").innerHTML = primeConstruction(state);
  el("pr-ledger").innerHTML = primeLedger(state);
  el("pr-units").innerHTML = primeUnits(state);
  el("pr-equation").innerHTML = primeEquation(state);
  el<HTMLSelectElement>("pr-limit").value = String(state.limit);
  el("pr-result").innerHTML = primeResult(state);
  el("pr-branches").innerHTML = primeBranches(state);
  const t = primeTrial(state);
  el("pr-witnesses").innerHTML = t.witnesses
    .map(
      (p) =>
        `<button type="button" data-pr-add="${p}"${state.primes.length >= 12 || p > 10000000000n ? " disabled" : ""}>Add ${p} to the givens</button>`,
    )
    .join("");
  el("pr-witness-status").textContent = t.witnesses.some((p) => p > 10000000000n)
    ? "A proven witness exceeds this bench’s input limit. It still completes the mathematical argument."
    : state.primes.length >= 12
      ? "Twelve givens reach this bench’s input limit. The mathematical argument has no such list limit."
      : "";
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-pr-case]")) {
    const values =
      button.dataset.prCase === "six"
        ? "2,3,5,7,11,13"
        : button.dataset.prCase === "three"
          ? "2,3,5"
          : "3,5,7";
    button.setAttribute("aria-pressed", String(state.primes.join(",") === values));
  }
  if (focused !== undefined)
    document.querySelector<HTMLButtonElement>(`[data-pr-select="${focused}"]`)?.focus();
}
function reading() {
  el<HTMLSelectElement>("pr-reading-select").value = String(state.reading);
  el("pr-reading-text").innerHTML = primeReading(state.reading);
  el("pr-reading-count").textContent = `${state.reading + 1} / ${primePassages.length}`;
  el<HTMLButtonElement>("pr-prev").disabled = state.reading === 0;
  el<HTMLButtonElement>("pr-next").disabled = state.reading === primePassages.length - 1;
}
function descent() {
  el("pr-chain").innerHTML = primeDescent(state);
  el<HTMLButtonElement>("pr-undo").disabled = state.descent.length === 1;
  el<HTMLButtonElement>("pr-reset-descent").disabled = state.descent.length === 1;
}
let sourceRevision = 0,
  sourceUrl = "",
  displayedPage: number | null = null;
async function source(force = false) {
  if (!force && displayedPage === state.page) return;
  const page = state.page,
    revision = ++sourceRevision,
    file = primeSourceFile(page);
  displayedPage = page;
  el<HTMLSelectElement>("pr-page").value = String(page);
  const img = el<HTMLImageElement>("pr-source-image");
  img.hidden = true;
  el("pr-source-caption").textContent = "";
  el("pr-source-status").textContent = "Checking this page against the current source identity…";
  el<HTMLAnchorElement>("pr-original").href = `${primeSourceUrl}#page=${page ? page + 26 : 7}`;
  el<HTMLAnchorElement>("pr-image-link").href = `${import.meta.env.BASE_URL}${file}`;
  let candidate = "";
  try {
    candidate = await studyBlobUrl(file, "image/jpeg");
    if (revision !== sourceRevision) {
      URL.revokeObjectURL(candidate);
      return;
    }
    const decoded = new Image();
    decoded.src = candidate;
    await decoded.decode();
    if (revision !== sourceRevision) {
      URL.revokeObjectURL(candidate);
      return;
    }
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = candidate;
    img.src = candidate;
    img.alt = `Complete ${page ? `${page % 2 ? "Latin" : "Greek"} printed page ${page}` : "1884 volume II title"}, including original markings and apparatus.`;
    img.hidden = false;
    el("pr-source-pan").scrollTo(0, 0);
    el("pr-source-status").textContent = "Source identity verified for this edition.";
    el("pr-source-caption").textContent =
      `${page ? `Printed p.${page} · PDF p.${page + 26}` : "Title · PDF p.7"} · Heiberg, volume II, 1884 · whole page`;
  } catch (e) {
    if (candidate) URL.revokeObjectURL(candidate);
    if (revision !== sourceRevision) return;
    displayedPage = null;
    el("pr-source-status").textContent =
      e instanceof Error ? e.message : "Could not read this source. Reconnect and retry.";
  }
}
function commit(next: PrimeState) {
  const previous = state;
  state = validatePrimes(next);
  recordRevision++;
  el("pr-notice").textContent = "";
  el("pr-share-label").hidden = true;
  if (
    previous.primes.join() !== state.primes.join() ||
    previous.limit !== state.limit ||
    previous.selected !== state.selected
  )
    bench();
  if (previous.reading !== state.reading) reading();
  if (previous.descent.join() !== state.descent.join()) descent();
  void source();
}
function apply(next: PrimeState, status = "pr-input-status") {
  try {
    commit(next);
    el(status).textContent = "";
  } catch (e) {
    el(status).textContent = e instanceof Error ? e.message : "Check the settings.";
  }
}
el("pr-givens").addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    apply({ ...state, primes: parseGiven(el<HTMLTextAreaElement>("pr-list").value), selected: 0 });
  } catch (error) {
    el("pr-input-status").textContent =
      error instanceof Error ? error.message : "Choose valid given primes.";
  }
});
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-pr-case]"))
  button.addEventListener("click", () =>
    apply({
      ...state,
      primes:
        button.dataset.prCase === "six"
          ? ["2", "3", "5", "7", "11", "13"]
          : button.dataset.prCase === "three"
            ? ["2", "3", "5"]
            : ["3", "5", "7"],
      selected: 0,
      limit: 13,
    }),
  );
el("pr-ledger").addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-pr-select]");
  if (b) apply({ ...state, selected: Number(b.dataset.prSelect) });
});
el<HTMLSelectElement>("pr-limit").addEventListener("change", (e) =>
  apply({ ...state, limit: Number((e.target as HTMLSelectElement).value) }),
);
el("pr-extend").addEventListener("click", () => apply({ ...state, limit: 100 }));
el("pr-witnesses").addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-pr-add]");
  if (b?.dataset.prAdd) {
    const newPrime = b.dataset.prAdd;
    apply(
      { ...state, primes: [...state.primes, newPrime], selected: state.primes.length },
      "pr-witness-status",
    );
    el("pr-title").focus();
  }
});
el("pr-chain").addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-pr-divisor]");
  if (b) {
    apply({ ...state, descent: [...state.descent, Number(b.dataset.prDivisor)] });
    el("pr-undo").focus();
  }
});
el("pr-undo").addEventListener("click", () =>
  apply({ ...state, descent: state.descent.slice(0, -1) }),
);
el("pr-reset-descent").addEventListener("click", () => apply({ ...state, descent: [2310] }));
el("pr-read-descent").addEventListener("click", () => {
  apply({ ...state, reading: 9 });
  el("pr-reading-title").focus();
});
el<HTMLSelectElement>("pr-reading-select").addEventListener("change", (e) =>
  apply({ ...state, reading: Number((e.target as HTMLSelectElement).value) }),
);
el("pr-prev").addEventListener("click", () => apply({ ...state, reading: state.reading - 1 }));
el("pr-next").addEventListener("click", () => apply({ ...state, reading: state.reading + 1 }));
for (const [id, index] of [
  ["pr-greek", 0],
  ["pr-latin", 1],
] as const)
  el(id).addEventListener("click", () => {
    const p = primePassages[state.reading];
    if (p) apply({ ...state, page: p.pages[index] });
    el("pr-evidence-title").focus();
  });
el<HTMLSelectElement>("pr-page").addEventListener("change", (e) =>
  apply({ ...state, page: Number((e.target as HTMLSelectElement).value) }),
);
el("pr-retry").addEventListener("click", () => void source(true));
el("pr-zoom").addEventListener("click", () => {
  const active = el("pr-source-sheet").classList.toggle("pr-enlarged");
  el("pr-zoom").setAttribute("aria-pressed", String(active));
  el("pr-zoom").textContent = active ? "Fit whole page" : "Enlarge page";
  el("pr-source-pan").focus();
});
el("pr-source-pan").addEventListener("keydown", (e) => {
  const steps: Record<string, [number, number]> = {
    ArrowLeft: [-80, 0],
    ArrowRight: [80, 0],
    ArrowUp: [0, -80],
    ArrowDown: [0, 80],
  };
  const d = steps[e.key];
  if (d) {
    e.preventDefault();
    el("pr-source-pan").scrollBy(d[0], d[1]);
  }
});
el("pr-question").addEventListener("submit", (e) => {
  e.preventDefault();
  const a = new FormData(el<HTMLFormElement>("pr-question")).get("pr-answer");
  el("pr-feedback").textContent =
    a === "divisor"
      ? "Yes. 2 divides 106 and is absent from 3, 5, 7. The proof needs an additional prime, not a prime sum or the next larger prime."
      : a === "fails"
        ? "The composite branch is explicitly part of IX.20. Its prime divisor supplies the additional prime."
        : "The statement promises more primes in number, not the next prime in numerical order. 2 already supplies a prime outside this list.";
});
function download(name: string, type: string, body: string) {
  const url = URL.createObjectURL(new Blob([body], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
el("pr-json").addEventListener("click", () =>
  download("stoicheia-primes.json", "application/json", primesJson(state)),
);
el("pr-csv").addEventListener("click", () =>
  download("stoicheia-primes.csv", "text/csv", primesCsv(state)),
);
el("pr-svg").addEventListener("click", () =>
  download("stoicheia-primes.svg", "image/svg+xml", primeSvg(state, license)),
);
el("pr-share").addEventListener("click", () => {
  el<HTMLInputElement>("pr-share-url").value =
    `${location.origin}${location.pathname}${encodePrimes(state)}#pr-bench`;
  el("pr-share-label").hidden = false;
  el<HTMLInputElement>("pr-share-url").select();
});
el("pr-save").addEventListener("click", async () => {
  const snapshot = structuredClone(state),
    button = el<HTMLButtonElement>("pr-save");
  button.disabled = true;
  el("pr-save-status").textContent =
    "Preparing the reading, whole source pages, font and licenses…";
  try {
    download("stoicheia-primes-reading.html", "text/html", await primesStudy(snapshot));
    el("pr-save-status").textContent =
      "Saved the illustrated reading with the settings at your click, eleven complete source images, and native files.";
  } catch (e) {
    el("pr-save-status").textContent =
      e instanceof Error ? e.message : "Could not save. Reconnect and retry.";
  } finally {
    button.disabled = false;
  }
});
el<HTMLInputElement>("pr-import").addEventListener("change", async (e) => {
  const input = e.target as HTMLInputElement,
    file = input.files?.[0],
    revision = ++recordRevision;
  if (!file) return;
  try {
    if (file.size > 12000) throw new Error("Choose an experiment JSON smaller than 12 KB.");
    const text = await file.text();
    if (revision !== recordRevision) return;
    commit(readPrimesJson(text));
    el("pr-save-status").textContent =
      "Reopened the exact givens, search bound, reading, source page and separate descent.";
  } catch (error) {
    if (revision === recordRevision)
      el("pr-save-status").textContent =
        error instanceof Error ? error.message : "Could not read this experiment.";
  } finally {
    input.value = "";
  }
});
window.addEventListener("popstate", () => {
  try {
    commit(decodePrimes(location.search));
  } catch (e) {
    el("pr-notice").textContent = e instanceof Error ? e.message : "Could not reopen this link.";
  }
});
bench();
reading();
descent();
void source();
prepareOffline(el("pr-offline"), el<HTMLButtonElement>("pr-reload"));
