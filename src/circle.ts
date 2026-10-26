import {
  boundSummary,
  decimal,
  intervalDrawing,
  ledger,
  polygonDrawing,
  squareExplanation,
} from "./circle-drawing";
import { circleCsv, circleStudy, circleSvg, proofReading, sourceCautions } from "./circle-study";
import { circleBoundary, circlePassages } from "./content/circle";
import {
  approximate,
  audit,
  type CircleState,
  circleJson,
  circlePages,
  decodeCircle,
  encodeCircle,
  exact,
  initialCircle,
  parseFraction,
  printed,
  readCircleJson,
  sides,
  validateCircle,
} from "./core/circle";
import { escapeHtml as esc } from "./html";
import { prepareOffline } from "./offline";
import { studyBlobUrl } from "./study-assets";

function el<T extends HTMLElement = HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing circle workshop element: ${selector}`);
  return node;
}
let state: CircleState = { ...initialCircle },
  initialError = "",
  editRow = 1;
try {
  state = decodeCircle(location.search);
} catch (error) {
  initialError = `${error instanceof Error ? error.message : "Invalid address."} The printed-number experiment is shown.`;
}
el("#app").innerHTML =
  `<header class="ci-header"><a class="ci-brand" href="./">Stoicheia <span lang="grc">ΣΤΟΙΧΕΙΑ</span></a><nav aria-label="Circle workshop"><a href="./">Euclid course</a><a href="#ci-readings">Read Archimedes</a><a href="#ci-sources">Printed evidence</a></nav></header><main>
<section class="ci-intro"><div><p class="ci-kicker">ARCHIMEDES / CIRCLE MEASUREMENT 3</p><h1>Keep the<br>safe side.</h1></div><div><p>A circle’s circumference is less than 3 and 1/7 times its diameter, and more than 3 and 10/71 times. An exact answer is not needed to prove both.</p><p>Double the polygon’s sides. Then alter one square-root approximation: does a plausible final number still have a proof?</p><p class="ci-fine">Read the Greek, Heiberg’s Latin and new English. No prior Greek is needed.</p></div></section><p class="ci-notice" id="ci-notice" role="status"></p>
<section class="ci-bench" id="ci-bench" aria-label="Polygon experiment"><div class="ci-bench-head"><h2 id="ci-stage-heading">Four bisections, ninety-six sides</h2><div class="ci-side-steps" aria-label="Choose the polygon side count">${sides.map((n, i) => `<button type="button" data-stage="${i}" aria-pressed="false">${n}</button>`).join("")}</div></div><div class="ci-bench-body"><div class="ci-plate"><div id="ci-polygon"></div><div class="ci-legend"><span class="ci-inner">Inner polygon</span><span>Circle</span><span class="ci-outer">Outer polygon</span></div></div><aside class="ci-control-panel"><p class="ci-kicker">ONE CIRCLE / TWO DIRECTIONS</p><h3>Shorter inside.<br>Longer outside.</h3><p>Both polygon drawings keep the same radius. By 96 sides, the gaps are hard to see. The fractions keep what the drawing loses. C is the circle’s circumference; d is its diameter.</p><div class="ci-actions"><button type="button" id="ci-back">Undo a bisection</button><button type="button" class="ci-primary" id="ci-next">Halve the angle again</button></div><fieldset><legend>Follow one proof path</legend><label><input type="radio" name="ci-branch" value="outer"/>Outer polygon · bound C/d from above</label><label><input type="radio" name="ci-branch" value="inner"/>Inner polygon · bound C/d from below</label></fieldset><div class="ci-interval" id="ci-interval"></div></aside></div><div id="ci-bounds"></div><p class="ci-status" id="ci-bound-status" role="status"></p></section>
<section class="ci-section" id="ci-audit"><div class="ci-section-heading"><div><p class="ci-kicker">THE EXACT LEDGER</p><h2>A small rounding.<br>A missing implication.</h2></div><p>The drawing stays unchanged when you alter arithmetic. Each proof step depends on every earlier step. A locally safe comparison cannot repair a broken chain. Changing an early value can also make a later, unchanged printed approximation unsafe.</p></div><p>A means radius / outer half-side; H means slant / outer half-side. The same H is diameter / inner chord. The columns keep rational estimates of these lengths; the square checks justify their direction.</p><div class="ci-scroll" id="ci-ledger" role="region" aria-label="Exact polygon arithmetic; scroll for all columns" tabindex="0"></div><div class="ci-audit-tools"><form class="ci-edit-form" id="ci-edit-form"><h3>Change one approximation</h3><label for="ci-edit-row">Printed step<select id="ci-edit-row"></select></label><p class="ci-fine" id="ci-printed-choice"></p><label for="ci-value">Your replacement Y<input type="text" id="ci-value" required autocomplete="off" inputmode="text" aria-describedby="ci-value-hint"/></label><p class="ci-fine" id="ci-value-hint">Use a positive fraction such as 4729/8, or a decimal such as 591.125. Changes affect the ledger only after you apply them.</p><div class="ci-actions"><button type="submit" class="ci-primary">Apply this approximation</button><button type="button" id="ci-restore">Restore printed numbers</button></div><p id="ci-edit-status" role="status"></p></form><div><p class="ci-kicker" id="ci-test-heading">COMPARE THE SQUARES</p><div id="ci-square-test" class="ci-verdict"></div><div class="ci-presets"><button type="button" id="ci-near-miss">Try 591.15 on the outer path</button><button type="button" id="ci-low-inner">Try 2017.24 on the inner path</button></div><p class="ci-fine">These two replacements are modern counterexamples. Both are close to the printed choice; neither is on the required side. A failed proof does not itself show that the final candidate is false.</p><button type="button" id="ci-read-step">Read this printed step ↓</button></div></div></section>
<section class="ci-section" id="ci-reason"><p class="ci-kicker">A GEOMETRIC REASON / EXACT FRACTIONS</p>${proofReading()}<details><summary>What do the original ninety-six-sided bounds establish?</summary><p>All printed-number checks pass. The inner bound is <strong>25344/8069</strong>; the outer is <strong>29376/9347</strong>. Integer cross-products show <strong>223/71 &lt; 25344/8069</strong> and <strong>29376/9347 &lt; 22/7</strong>.</p><p>For the first comparison, 25344 × 71 − 223 × 8069 = <strong>29</strong>. For the second, 22 × 9347 − 7 × 29376 = <strong>2</strong>. Both margins are strictly positive. The claimed endpoints are convenient weaker bounds; neither equals a polygon perimeter or the circle’s ratio.</p></details></section>
<section class="ci-section" id="ci-readings"><div class="ci-section-heading"><div><p class="ci-kicker">EIGHT SELECTIONS / GREEK, LATIN, ENGLISH</p><h2>Less on one side.<br>Greater on the other.</h2></div><p>The source’s comparative words carry the proof. Follow what is compared, and notice when inversion changes the direction. These selected clauses do not transcribe the whole proposition.</p></div><label class="ci-control-title" for="ci-passage">Choose a reading<select id="ci-passage">${circlePassages.map((p, i) => `<option value="${i}">${i + 1}. ${esc(p.title)}</option>`).join("")}</select></label><article id="ci-reading" class="ci-reading"></article><div class="ci-actions"><button type="button" id="ci-reading-prev">← Previous reading</button><button type="button" id="ci-reading-next">Next reading →</button><button type="button" id="ci-see-page">See the selected Greek page ↓</button></div></section>
<section class="ci-section"><div class="ci-section-heading"><div><p class="ci-kicker">CHECK THE IMPLICATION</p><h2>What failed?</h2></div><form id="ci-question"><fieldset><legend>A replacement gives a plausible decimal, but its square-root inequality points the wrong way. What follows?</legend><label><input type="radio" name="ci-answer" value="false" required/>The final numerical bound must be false.</label><label><input type="radio" name="ci-answer" value="gap"/>This calculation has lost its proof of the bound.</label><label><input type="radio" name="ci-answer" value="fine"/>Nothing changes if the decimal looks close enough.</label></fieldset><button type="submit">Check the reasoning</button><p role="status" id="ci-feedback"></p></form></div></section>
<section class="ci-section" id="ci-sources"><div class="ci-section-heading"><div><p class="ci-kicker">HEIBERG / 1880 / VOLUME I</p><h2>What the edition<br>actually prints.</h2></div><p>Ten complete pages, pp.262–271, retain the statement, both calculations, two diagrams and the editorial notes. The inequalities in our audit are checked mathematically; they are not a silent transcription of every printed sign.</p></div><div class="ci-source-grid"><div><label class="ci-control-title" for="ci-page">Printed page<select id="ci-page">${circlePages.map((p) => `<option value="${p}">p.${p} · ${p % 2 ? "Latin" : "Greek"}</option>`).join("")}</select></label><div class="ci-source-actions"><button type="button" id="ci-zoom" aria-pressed="false">Enlarge the page</button><a id="ci-full-image" href="./sources/circle/heiberg-264.jpg" target="_blank" rel="noreferrer">Open full image</a></div><p id="ci-source-status" role="status"></p>${sourceCautions()}<p class="ci-fine">${esc(circleBoundary)}</p><p><a href="https://www.wilbourhall.org/pdfs/Archimedes_VOL_I.pdf">Complete source PDF</a> · <a href="./sources/circle/manifest.json">Source page identities</a></p></div><figure><div class="ci-source-scroll" id="ci-source-scroll" role="region" aria-label="Scrollable complete source page" tabindex="0"><img id="ci-source-image" width="1311" height="1800" alt="" hidden/></div><figcaption id="ci-source-caption"></figcaption></figure></div></section>
<section class="ci-section ci-files"><div><p class="ci-kicker">KEEP THE TRIAL AND ITS LIMITS</p><h2>Save the argument,<br>including the gap.</h2><p>One illustrated HTML reading keeps the current trial, both exact ledgers, the unchanged printed-number comparison, proof, eight readings, sixteen word notes, ten source pages and font. It works without scripts or a network and prints to A4.</p><p class="ci-fine">The model accepts the geometric inequalities between a circle’s circumference and the inner and outer polygon perimeters. It does not reconstruct ancient calculation tools, explain how the first root bounds were discovered, or prove every prerequisite about arc length. Decimals and diagram coordinates are display approximations; all bound decisions use integer fractions.</p><p><a href="./horn.html">Try to fit a rectilinear angle into a curved gap · Euclid III.16 ↗</a></p><p><a href="./measure.html">Explore why a finite measurement need not establish “never” · Euclid X.2–3 ↗</a></p></div><div><div class="ci-actions"><button type="button" class="ci-primary" id="ci-save">Save illustrated reading</button><button type="button" id="ci-csv">Save exact ledger CSV</button><button type="button" id="ci-json">Save editable JSON</button><button type="button" id="ci-svg">Save polygon SVG</button><button type="button" id="ci-share">Make a share link</button></div><p id="ci-save-status" role="status"></p><label for="ci-open" class="ci-file-label">Reopen a saved JSON experiment<input type="file" id="ci-open" accept=".json,application/json"/></label><p id="ci-open-status" role="status"></p><label class="ci-share-label" id="ci-share-label" for="ci-share-url" hidden>Copy this experiment link<input id="ci-share-url" type="url" readonly/></label></div></section></main><footer class="ci-footer"><a href="./">Stoicheia · Read and construct Euclid</a><span id="ci-offline" role="status">Preparing offline edition…</span><button type="button" id="ci-reload" hidden>Reload saved edition</button><a href="https://github.com/antonsoo/stoicheia">Source &amp; MIT license</a></footer>`;

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "The operation could not be completed.";
}
function commit(next: CircleState): void {
  state = validateCircle(next);
  history.pushState(null, "", `${location.pathname}${encodeCircle(state)}${location.hash}`);
  render();
}
function editControls(): void {
  const choices = printed[state.branch];
  editRow = Math.min(editRow, choices.length - 1);
  el<HTMLSelectElement>("#ci-edit-row").innerHTML = choices
    .map(
      (p, i) =>
        `<option value="${i}">${sides[i]} sides · ${i === 0 ? "seed for √3" : "new hypotenuse"} · p.${p.page}</option>`,
    )
    .join("");
  el<HTMLSelectElement>("#ci-edit-row").value = String(editRow);
  const source = choices[editRow];
  if (!source) throw new Error("Missing printed approximation.");
  const current =
    state.alteration?.branch === state.branch && state.alteration.row === editRow
      ? state.alteration.value
      : exact(source.value);
  el<HTMLInputElement>("#ci-value").value = current;
  el("#ci-printed-choice").textContent =
    `Printed Y = ${source.label}, with scale ${source.base}. Your replacement uses the same scale.`;
  const row = audit(state.branch, state.alteration)[editRow];
  if (!row) throw new Error("Missing selected audit row.");
  el("#ci-test-heading").textContent =
    `${state.branch.toUpperCase()} PATH / ${row.sides} SIDES / COMPARE THE SQUARES`;
  el("#ci-square-test").innerHTML = squareExplanation(state.branch, row);
  el("#ci-edit-status").textContent = state.alteration
    ? `Applied record: ${state.alteration.branch} path, ${sides[state.alteration.row]} sides, Y = ${state.alteration.value}. Saving uses this record.`
    : "Applied record: all printed numbers. Saving uses this record.";
}
function render(): void {
  el("#ci-stage-heading").textContent =
    `${state.stage} ${state.stage === 1 ? "bisection" : "bisections"} · ${sides[state.stage]} sides`;
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-stage]"))
    button.setAttribute("aria-pressed", String(Number(button.dataset.stage) === state.stage));
  for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="ci-branch"]'))
    radio.checked = radio.value === state.branch;
  el<HTMLButtonElement>("#ci-back").disabled = state.stage === 0;
  el<HTMLButtonElement>("#ci-next").disabled = state.stage === 4;
  el("#ci-polygon").innerHTML = polygonDrawing(state.stage);
  el("#ci-interval").innerHTML = intervalDrawing(state);
  el("#ci-bounds").innerHTML = boundSummary(state);
  el("#ci-ledger").innerHTML = ledger(state.branch, state.alteration, state.stage);
  const lower = audit("inner", state.alteration)[state.stage],
    upper = audit("outer", state.alteration)[state.stage];
  if (!lower || !upper) throw new Error("Missing selected bounds.");
  el("#ci-bound-status").textContent =
    lower.boundSafe && upper.boundSafe
      ? `Both perimeter bounds at this stage are justified. The endpoint decimals are rounded for display.${!lower.chainSafe || !upper.chainSafe ? " This row’s approximation is unsafe for a later bisection, although it is not needed for this current endpoint." : ""}${state.alteration && state.alteration.row > state.stage ? " Your alteration is in a later row and does not affect this stage." : ""}`
      : `The ${!lower.boundSafe ? "inner" : "outer"} chain has a gap. Its endpoint ${decimal(approximate(!lower.boundSafe ? lower.bound : upper.bound))} is only a candidate from this calculation. The printed-number proof remains available below.`;
  editControls();
  reading();
  void source();
}
function reading(): void {
  const p = circlePassages[state.passage];
  if (!p) throw new Error("Missing selected reading.");
  el<HTMLSelectElement>("#ci-passage").value = String(state.passage);
  el("#ci-reading").innerHTML =
    `<h3>${state.passage + 1}. ${esc(p.title)}</h3><div class="ci-reading-columns"><div><p class="ci-kicker">GREEK / P.${p.pages[0]}</p><p lang="grc">${esc(p.greek)}</p></div><div><p class="ci-kicker">HEIBERG’S LATIN / P.${p.pages[1]}</p><p lang="la">${esc(p.latin)}</p></div></div><p>${esc(p.english)}</p><p class="ci-fine">${esc(p.note)}</p><dl class="ci-words">${p.words.map((w) => `<div><dt><span lang="grc">${esc(w.greek)}</span> / <span lang="la">${esc(w.latin)}</span></dt><dd>${esc(w.english)}</dd></div>`).join("")}</dl>`;
  el<HTMLButtonElement>("#ci-reading-prev").disabled = state.passage === 0;
  el<HTMLButtonElement>("#ci-reading-next").disabled = state.passage === circlePassages.length - 1;
}
let sourceRevision = 0,
  sourceUrl = "",
  displayedPage = -1;
async function source(): Promise<void> {
  if (!el("#ci-share-label").hidden)
    el<HTMLInputElement>("#ci-share-url").value =
      `${location.origin}${location.pathname}${encodeCircle(state)}`;
  el<HTMLSelectElement>("#ci-page").value = String(state.page);
  const revision = ++sourceRevision,
    p = state.page;
  const img = el<HTMLImageElement>("#ci-source-image"),
    link = el<HTMLAnchorElement>("#ci-full-image");
  // A return to the displayed page must cancel an older pending choice too.
  if (displayedPage === p && !img.hidden) return;
  img.hidden = true;
  link.hidden = true;
  el("#ci-source-caption").textContent = "";
  el("#ci-source-status").textContent = `Checking the identity of printed p.${p}…`;
  try {
    const nextUrl = await studyBlobUrl(`sources/circle/heiberg-${p}.jpg`, "image/jpeg");
    if (revision !== sourceRevision) {
      URL.revokeObjectURL(nextUrl);
      return;
    }
    const replacement = new Image(1312, 1800);
    replacement.id = "ci-source-image";
    replacement.alt = `Complete ${p % 2 ? "Latin" : "Greek"} page ${p}, Heiberg's 1880 Archimedes volume I, including editorial notes.`;
    try {
      await new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          clearTimeout(timeout);
          replacement.onload = null;
          replacement.onerror = null;
        };
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error("The source image did not finish loading. Choose the page again."));
        }, 15000);
        replacement.onload = () => {
          cleanup();
          resolve();
        };
        replacement.onerror = () => {
          cleanup();
          reject(
            new Error("The retained source image could not be displayed. Choose the page again."),
          );
        };
        replacement.src = nextUrl;
      });
    } catch (error) {
      URL.revokeObjectURL(nextUrl);
      throw error;
    }
    if (revision !== sourceRevision) {
      URL.revokeObjectURL(nextUrl);
      return;
    }
    // A loaded replacement avoids a reused image's superseded decode request.
    el("#ci-source-image").replaceWith(replacement);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = nextUrl;
    link.href = sourceUrl;
    displayedPage = p;
    link.hidden = false;
    el("#ci-source-caption").textContent =
      `Printed p.${p} · PDF page ${p + 19} · complete page, reduced without cropping or retouching.`;
    el("#ci-source-status").textContent =
      "The page matches this edition’s retained source identity.";
  } catch (error) {
    if (revision !== sourceRevision) return;
    displayedPage = -1;
    el("#ci-source-status").textContent = errorText(error);
  }
}
function changePassage(passage: number): void {
  const p = circlePassages[passage];
  if (!p) return;
  state = validateCircle({ ...state, passage, page: p.pages[0] });
  history.pushState(null, "", `${location.pathname}${encodeCircle(state)}${location.hash}`);
  reading();
  void source();
}
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-stage]"))
  button.addEventListener("click", () => commit({ ...state, stage: Number(button.dataset.stage) }));
el("#ci-next").addEventListener("click", () =>
  commit({ ...state, stage: Math.min(4, state.stage + 1) }),
);
el("#ci-back").addEventListener("click", () =>
  commit({ ...state, stage: Math.max(0, state.stage - 1) }),
);
for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="ci-branch"]'))
  radio.addEventListener("change", () =>
    commit({ ...state, branch: radio.value === "inner" ? "inner" : "outer" }),
  );
el("#ci-edit-row").addEventListener("change", () => {
  editRow = Number(el<HTMLSelectElement>("#ci-edit-row").value);
  editControls();
});
el("#ci-value").addEventListener("input", () => {
  el("#ci-edit-status").textContent =
    "This edit is not yet applied. Apply it to change the ledger; sharing and saving keep the applied record.";
});
el("#ci-edit-form").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const value = exact(parseFraction(el<HTMLInputElement>("#ci-value").value));
    commit({
      ...state,
      alteration: { branch: state.branch, row: editRow, value },
      stage: Math.max(state.stage, editRow),
    });
  } catch (error) {
    el("#ci-edit-status").textContent = `${errorText(error)} The applied record is unchanged.`;
  }
});
el("#ci-restore").addEventListener("click", () => commit({ ...state, alteration: null }));
el("#ci-near-miss").addEventListener("click", () => {
  editRow = 1;
  commit({
    ...state,
    branch: "outer",
    stage: 4,
    alteration: { branch: "outer", row: 1, value: "11823/20" },
  });
});
el("#ci-low-inner").addEventListener("click", () => {
  editRow = 4;
  commit({
    ...state,
    branch: "inner",
    stage: 4,
    alteration: { branch: "inner", row: 4, value: "50431/25" },
  });
});
el("#ci-passage").addEventListener("change", () =>
  changePassage(Number(el<HTMLSelectElement>("#ci-passage").value)),
);
el("#ci-reading-prev").addEventListener("click", () => changePassage(state.passage - 1));
el("#ci-reading-next").addEventListener("click", () => changePassage(state.passage + 1));
function focusSection(id: string): void {
  const node = el(id);
  node.tabIndex = -1;
  node.scrollIntoView({ block: "start" });
  node.focus({ preventScroll: true });
}
el("#ci-read-step").addEventListener("click", () => {
  const p = printed[state.branch][editRow];
  if (!p) return;
  state = { ...state, page: p.page };
  history.pushState(null, "", `${location.pathname}${encodeCircle(state)}#ci-sources`);
  void source();
  focusSection("#ci-sources");
});
el("#ci-see-page").addEventListener("click", () => {
  const p = circlePassages[state.passage];
  if (!p) return;
  state = { ...state, page: p.pages[0] };
  history.pushState(null, "", `${location.pathname}${encodeCircle(state)}#ci-sources`);
  void source();
  focusSection("#ci-sources");
});
el("#ci-page").addEventListener("change", () => {
  state = { ...state, page: Number(el<HTMLSelectElement>("#ci-page").value) };
  history.pushState(null, "", `${location.pathname}${encodeCircle(state)}${location.hash}`);
  void source();
});
el("#ci-zoom").addEventListener("click", () => {
  const enlarged = el("#ci-source-scroll").classList.toggle("ci-enlarged");
  el("#ci-zoom").setAttribute("aria-pressed", String(enlarged));
  el("#ci-zoom").textContent = enlarged ? "Fit the page" : "Enlarge the page";
});
el("#ci-question").addEventListener("submit", (event) => {
  event.preventDefault();
  const answer = document.querySelector<HTMLInputElement>('input[name="ci-answer"]:checked');
  el("#ci-feedback").textContent =
    `${answer?.value === "gap" ? "Correct." : "Revisit the implication."} A comparison on the wrong side breaks this chain of justification. The final number may or may not be a true bound; this calculation no longer establishes it.`;
});
function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
el("#ci-csv").addEventListener("click", () =>
  download("stoicheia-circle.csv", circleCsv(state), "text/csv;charset=utf-8"),
);
el("#ci-json").addEventListener("click", () =>
  download("stoicheia-circle.json", circleJson(state), "application/json"),
);
for (const kind of ["save", "svg"] as const)
  el(`#ci-${kind}`).addEventListener("click", async () => {
    const snapshot = structuredClone(state),
      button = el<HTMLButtonElement>(`#ci-${kind}`);
    button.disabled = true;
    el("#ci-save-status").textContent =
      kind === "save"
        ? "Checking ten source pages, font and license before saving…"
        : "Checking the embedded font and license…";
    try {
      const content = kind === "save" ? await circleStudy(snapshot) : await circleSvg(snapshot);
      download(
        `stoicheia-circle.${kind === "save" ? "html" : "svg"}`,
        content,
        kind === "save" ? "text/html;charset=utf-8" : "image/svg+xml",
      );
      el("#ci-save-status").textContent =
        `Saved the ${kind === "save" ? "complete reading" : "polygon drawing"} from the applied record at the time of the click.`;
    } catch (error) {
      el("#ci-save-status").textContent = `${errorText(error)} No file was saved.`;
    } finally {
      button.disabled = false;
    }
  });
el("#ci-share").addEventListener("click", () => {
  const input = el<HTMLInputElement>("#ci-share-url");
  input.value = `${location.origin}${location.pathname}${encodeCircle(state)}`;
  el("#ci-share-label").hidden = false;
  input.focus();
  input.select();
  el("#ci-save-status").textContent =
    "This link keeps the applied approximation, side count, proof path, reading and source page.";
});
el("#ci-open").addEventListener("change", async () => {
  const input = el<HTMLInputElement>("#ci-open"),
    file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 8192) throw new Error("Settings files must be at most 8 KiB.");
    const next = readCircleJson(await file.text());
    editRow = next.alteration?.row ?? 1;
    commit(next);
    el("#ci-open-status").textContent =
      "Reopened the applied experiment. Its exact ledger and proof status have been recalculated.";
  } catch (error) {
    el("#ci-open-status").textContent = `${errorText(error)} The applied experiment is unchanged.`;
  } finally {
    input.value = "";
  }
});
window.addEventListener("popstate", () => {
  try {
    state = decodeCircle(location.search);
    render();
  } catch (error) {
    el("#ci-notice").textContent = `${errorText(error)} The applied experiment is unchanged.`;
  }
});
el("#ci-notice").textContent = initialError;
render();
prepareOffline(el("#ci-offline"), el<HTMLButtonElement>("#ci-reload"));
