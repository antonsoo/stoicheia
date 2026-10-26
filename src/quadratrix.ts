import { quadratrixBoundary, quadratrixPassages } from "./content/quadratrix";
import {
  CLOCK,
  decodeQuadratrix,
  encodeQuadratrix,
  initialQuadratrix,
  parseQuadratrixJson,
  type QuadratrixState,
  quadratrixJson,
  quadratrixPages,
  quadratrixVerdict,
  validateQuadratrix,
} from "./core/quadratrix";
import { escapeHtml as esc } from "./html";
import { prepareOffline } from "./offline";
import {
  quadratrixApproach,
  quadratrixArgument,
  quadratrixNumbers,
  quadratrixPlate,
  quadratrixSquare,
} from "./quadratrix-drawing";
import {
  quadratrixCsv,
  quadratrixReading,
  quadratrixStudy,
  quadratrixSvg,
} from "./quadratrix-study";
import { studyBlobUrl } from "./study-assets";

const el = <T extends HTMLElement = HTMLElement>(selector: string): T => {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing quadratrix element: ${selector}`);
  return node;
};
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
let state = { ...initialQuadratrix },
  addressError = "";
try {
  state = decodeQuadratrix(location.search);
} catch (e) {
  addressError = `${message(e)} Showing the initial experiment; the address was not silently repaired.`;
}

el("#app").innerHTML =
  `<header class="qx-header"><a class="qx-brand" href="./">Stoicheia <span>ΣΤΟΙΧΕΙΑ</span></a><nav aria-label="Quadratrix workshop"><a href="./">Euclid course</a><a href="#qx-readings">Read the objection</a><a href="#qx-sources">Printed evidence</a></nav></header><main><section class="qx-intro"><div><p class="qx-kicker">PAPPUS / COLLECTION IV.30–32 / TWO MOTIONS</p><h1>The point the motion cannot draw.</h1></div><div><p>One line turns. Another slides. Their crossing draws a curve used to square the circle.</p><p>At the very instant the motions finish, the crossing stops being one point. Stop just before it. Then reach it exactly.</p><p class="qx-fine">Greek, Hultsch’s Latin and new English. No prior Greek is needed.</p><p id="qx-address-error" role="status">${esc(addressError)}</p></div></section><section class="qx-bench" id="qx-bench" aria-label="Two moving lines"><div class="qx-bench-heading"><p class="qx-key qx-fine"><span class="qx-key-ray">Rotating line AE</span><span class="qx-key-slider">Sliding line through S</span><span class="qx-key-curve">Crossing Z</span></p></div><div class="qx-workspace"><figure class="qx-plate"><div id="qx-plate"></div><figcaption>E follows the quarter-circle; S moves down BA. Both begin at B. Z belongs to both moving lines. The square has unit sides and equal horizontal and vertical scales.</figcaption></figure><div class="qx-controls"><label for="qx-time">Elapsed time <output class="qx-time" id="qx-time-value" for="qx-time"></output><input id="qx-time" type="range" min="0" max="1000000" step="1"/></label><div class="qx-stops"><button type="button" data-qx-time="0">Start</button><button type="button" data-qx-time="500000">Halfway</button><button type="button" data-qx-time="999999">Just before</button><button type="button" data-qx-time="1000000">Finish exactly</button></div><p><button type="button" id="qx-play" class="qx-primary">Play the motion</button> <button type="button" id="qx-closer">Ten times closer</button></p><label for="qx-timing">When does rotation finish?<select id="qx-timing"><option value="together">Together with the slider</option><option value="rotation-first">At 90% of the slider’s time</option><option value="slider-first">At 110% of the slider’s time</option></select></label><p class="qx-fine">The changed timings are modern comparisons. Each motion stays uniform until it stops.</p><label class="qx-check"><input id="qx-limit" type="checkbox"/> Add H as a separate limiting point</label><div id="qx-numbers"></div></div></div><div class="qx-verdict"><p id="qx-verdict" role="status"></p></div></section><section class="qx-section" id="qx-endpoint"><div class="qx-section-head"><div><p class="qx-kicker">APPROACHING / ARRIVING / EXTENDING</p><h2>Almost there is<br>a different relation.</h2></div><p>The last visible crossing and the mathematical end of a continuously extended curve are different claims. The end-state records the line relation first.</p></div>${quadratrixApproach()}${quadratrixArgument()}<form id="qx-question" class="qx-question"><fieldset><legend>Both lines have finished together. What selects H?</legend><label><input type="radio" name="qx-answer" value="crossing"/> Their final intersection selects exactly one point.</label><label><input type="radio" name="qx-answer" value="limit"/> A separate argument about the preceding crossings supplies a limiting point.</label><label><input type="radio" name="qx-answer" value="none"/> There can be no mathematical limiting point.</label><button type="submit">Check the reasoning</button><p id="qx-feedback" role="status"></p></fieldset></form><p class="qx-program">This program supplies π to prescribe the motion. It models the question; it does not independently construct π or demonstrate an exact physical instrument. Finite decimal samples alone do not prove a limit.</p></section><section class="qx-section"><p class="qx-kicker">CONSUMING THE INTERCEPT / NOT CONSTRUCTING IT</p><h2>Why this missing point matters.</h2>${quadratrixSquare()}</section><section class="qx-section" id="qx-readings"><div class="qx-section-head"><div><p class="qx-kicker">EIGHT SELECTED READINGS / SIXTEEN WORD NOTES</p><h2>Read the condition.<br>Read the objection.</h2></div><p>Pappus reports Sporus’s criticisms, then presents mathematical reasoning about the curve. The objection does not erase the theorem, and a theorem does not supply every construction step.</p></div><label for="qx-passage">Choose a reading<select id="qx-passage">${quadratrixPassages.map((p, i) => `<option value="${i}">${i + 1}. ${esc(p.title)}</option>`).join("")}</select></label><article id="qx-reading" class="qx-reading"></article><div class="qx-actions"><button type="button" id="qx-prev">← Previous reading</button><button type="button" id="qx-next">Next reading →</button><button type="button" id="qx-see-page">See this Greek page ↓</button></div></section><section class="qx-section" id="qx-sources"><div class="qx-section-head"><div><p class="qx-kicker">HULTSCH / 1876 / VOLUME I</p><h2>Keep the objection<br>beside the proof.</h2></div><p>Ten complete pages retain the generation, two objections, geometric proof, rectification and apparatus. This is a nineteenth-century printed witness to Pappus, not an ancient manuscript.</p></div><div class="qx-source-grid"><div><label for="qx-page">Printed page<select id="qx-page">${quadratrixPages.map((p) => `<option value="${p}">p.${p} · ${p % 2 ? "Latin" : "Greek"}</option>`).join("")}</select></label><p class="qx-actions"><button type="button" id="qx-zoom" aria-pressed="false">Enlarge the page</button><a id="qx-full-image" target="_blank" rel="noreferrer" hidden>Open full image</a></p><p id="qx-source-status" role="status"></p><h3>The labels change</h3><p>The motion diagram has centre A and intercept H. The later theorem uses centre Γ and intercept Θ. Hultsch’s p.253 footnote also disputes the weight of the objections. Neither detail is removed from the retained pages.</p><p class="qx-fine">${esc(quadratrixBoundary)}</p><p><a href="https://archive.org/download/pappialexandrin00hultgoog/pappialexandrin00hultgoog.pdf">Complete source PDF</a> · <a href="./sources/quadratrix/manifest.json">Retained source identities</a></p></div><figure><div id="qx-source-scroll" class="qx-source-scroll" tabindex="0" role="region" aria-label="Scrollable complete source page"><img id="qx-source-image" alt="" hidden/></div><figcaption id="qx-source-caption"></figcaption></figure></div></section><section class="qx-section qx-save-grid"><div><p class="qx-kicker">KEEP THE SETTINGS, ARGUMENT AND PRINT</p><h2>A reading that<br>opens on its own.</h2><p>Save the applied experiment with all readings, both arguments, all ten pages, the font and complete licenses in one script-free HTML file. It opens offline and prints to A4.</p><p><a href="./circle.html">Compare Archimedes’s circle bounds ↗</a></p></div><div><div class="qx-actions"><button type="button" class="qx-primary" id="qx-save">Save illustrated reading</button><button type="button" id="qx-json">Save editable JSON</button><button type="button" id="qx-csv">Save motion CSV</button><button type="button" id="qx-svg">Save plate SVG</button><button type="button" id="qx-share">Make a share link</button></div><p id="qx-save-status" role="status"></p><label class="qx-file" for="qx-open">Reopen a saved JSON experiment<input id="qx-open" type="file" accept=".json,application/json"/></label><p id="qx-open-status" role="status"></p><label id="qx-share-label" for="qx-share-url" hidden>Copy this experiment link<input id="qx-share-url" type="url" readonly/></label></div></section></main><footer class="qx-footer"><a href="./">Stoicheia · Read and construct</a><span id="qx-offline" role="status">Preparing offline edition…</span><button type="button" id="qx-reload" hidden>Reload saved edition</button><a href="https://github.com/antonsoo/stoicheia">Source &amp; MIT license</a></footer>`;

let sourceRevision = 0,
  displayedPage = -1,
  sourceUrl = "";
async function showSource(): Promise<void> {
  const revision = ++sourceRevision,
    p = state.page;
  el<HTMLSelectElement>("#qx-page").value = String(p);
  if (displayedPage === p && !el("#qx-source-image").hidden) return;
  el("#qx-source-image").hidden = true;
  el("#qx-full-image").hidden = true;
  el("#qx-source-caption").textContent = "";
  el("#qx-source-status").textContent = `Checking printed p.${p}…`;
  let url = "";
  try {
    url = await studyBlobUrl(`sources/quadratrix/hultsch-${p}.jpg`, "image/jpeg");
    const image = new Image();
    image.id = "qx-source-image";
    image.alt = `Complete ${p % 2 ? "Latin" : "Greek"} printed page ${p}, Hultsch 1876, with all notes.`;
    image.src = url;
    await image.decode();
    if (revision !== sourceRevision) {
      URL.revokeObjectURL(url);
      return;
    }
    el("#qx-source-image").replaceWith(image);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = url;
    displayedPage = p;
    el<HTMLAnchorElement>("#qx-full-image").href = url;
    el("#qx-full-image").hidden = false;
    el("#qx-source-caption").textContent =
      `Printed p.${p} · PDF p.${p + 33} · complete page, reduced without cropping or retouching.`;
    el("#qx-source-status").textContent =
      "The page matches this edition’s retained source identity.";
  } catch (error) {
    if (url) URL.revokeObjectURL(url);
    if (revision !== sourceRevision) return;
    displayedPage = -1;
    el("#qx-source-status").textContent = message(error);
  }
}
function shareField(): void {
  if (el("#qx-share-label").hidden) return;
  el<HTMLInputElement>("#qx-share-url").value = new URL(
    `${location.pathname}${encodeQuadratrix(state)}${location.hash}`,
    location.origin,
  ).href;
}
function renderMotion(): void {
  el<HTMLInputElement>("#qx-time").value = String(state.tick);
  el<HTMLInputElement>("#qx-time").setAttribute(
    "aria-valuetext",
    `${state.tick} of ${CLOCK} ticks; ${((state.tick / CLOCK) * 100).toFixed(4)} percent elapsed`,
  );
  el("#qx-time-value").textContent = `${((state.tick / CLOCK) * 100).toFixed(4)}%`;
  el<HTMLSelectElement>("#qx-timing").value = state.timing;
  el<HTMLInputElement>("#qx-limit").checked = state.limit;
  el("#qx-plate").innerHTML = quadratrixPlate(state);
  el("#qx-numbers").innerHTML = quadratrixNumbers(state);
  el("#qx-verdict").textContent = quadratrixVerdict(state);
  el<HTMLButtonElement>("#qx-closer").disabled = CLOCK - state.tick <= 1;
  shareField();
}
function render(): void {
  renderMotion();
  el<HTMLSelectElement>("#qx-passage").value = String(state.passage);
  el("#qx-reading").innerHTML = quadratrixReading(state.passage);
  el<HTMLButtonElement>("#qx-prev").disabled = state.passage === 0;
  el<HTMLButtonElement>("#qx-next").disabled = state.passage === 7;
  void showSource();
}
let frame = 0;
function stop(): void {
  cancelAnimationFrame(frame);
  frame = 0;
  el("#qx-play").textContent = "Play the motion";
}
function commit(next: QuadratrixState, push = true): void {
  stop();
  state = validateQuadratrix(next);
  if (push)
    history.pushState(null, "", `${location.pathname}${encodeQuadratrix(state)}${location.hash}`);
  render();
}
el("#qx-time").addEventListener("input", () => {
  stop();
  state = validateQuadratrix({ ...state, tick: Number(el<HTMLInputElement>("#qx-time").value) });
  renderMotion();
});
el("#qx-time").addEventListener("change", () => commit(state));
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-qx-time]"))
  button.addEventListener("click", () => commit({ ...state, tick: Number(button.dataset.qxTime) }));
el("#qx-timing").addEventListener("change", () =>
  commit({
    ...state,
    timing: el<HTMLSelectElement>("#qx-timing").value as QuadratrixState["timing"],
  }),
);
el("#qx-limit").addEventListener("change", () =>
  commit({ ...state, limit: el<HTMLInputElement>("#qx-limit").checked }),
);
el("#qx-closer").addEventListener("click", () =>
  commit({ ...state, tick: CLOCK - Math.max(1, Math.floor((CLOCK - state.tick) / 10)) }),
);
el("#qx-play").addEventListener("click", () => {
  if (frame) {
    commit(state);
    return;
  }
  if (state.tick === CLOCK) state = { ...state, tick: 0 };
  const start = performance.now(),
    from = state.tick;
  el("#qx-play").textContent = "Pause the motion";
  const move = (now: number) => {
    // A frame timestamp can precede the click's performance.now(), notably
    // on Firefox's first frame. That frame must not run the clock backwards.
    state = {
      ...state,
      tick: Math.min(CLOCK, from + Math.round((Math.max(0, now - start) / 12000) * CLOCK)),
    };
    renderMotion();
    if (state.tick < CLOCK) frame = requestAnimationFrame(move);
    else commit(state);
  };
  frame = requestAnimationFrame(move);
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && frame) commit(state);
});
function reading(passage: number): void {
  const p = quadratrixPassages[passage];
  if (p) commit({ ...state, passage, page: p.pages[0] });
}
el("#qx-passage").addEventListener("change", () =>
  reading(Number(el<HTMLSelectElement>("#qx-passage").value)),
);
el("#qx-prev").addEventListener("click", () => reading(state.passage - 1));
el("#qx-next").addEventListener("click", () => reading(state.passage + 1));
el("#qx-page").addEventListener("change", () =>
  commit({ ...state, page: Number(el<HTMLSelectElement>("#qx-page").value) }),
);
el("#qx-see-page").addEventListener("click", () => {
  const p = quadratrixPassages[state.passage];
  if (!p) return;
  commit({ ...state, page: p.pages[0] });
  el("#qx-sources").scrollIntoView({ block: "start" });
  el<HTMLSelectElement>("#qx-page").focus({ preventScroll: true });
});
el("#qx-zoom").addEventListener("click", () => {
  const zoom = el("#qx-source-scroll").classList.toggle("qx-enlarged");
  el("#qx-zoom").setAttribute("aria-pressed", String(zoom));
  el("#qx-zoom").textContent = zoom ? "Fit the complete page" : "Enlarge the page";
});
el<HTMLFormElement>("#qx-question").addEventListener("submit", (event) => {
  event.preventDefault();
  const a = new FormData(el<HTMLFormElement>("#qx-question")).get("qx-answer");
  el("#qx-feedback").textContent =
    a === "limit"
      ? "Correct. The final lines coincide. The limiting point comes from the behavior of the preceding crossings, justified by a separate argument."
      : a === "crossing"
        ? "At the finish both lines are the baseline. They share every point on it; that does not single out H."
        : a === "none"
          ? "The motion does not select a final crossing, but the preceding crossings can still have a well-defined limit. Read the bounds above."
          : "Choose an explanation first.";
});
function download(name: string, text: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
for (const [id, fn, ext, mime] of [
  ["json", quadratrixJson, "json", "application/json"],
  ["csv", quadratrixCsv, "csv", "text/csv;charset=utf-8"],
] as const)
  el(`#qx-${id}`).addEventListener("click", () =>
    download(`stoicheia-quadratrix.${ext}`, fn(state), mime),
  );
for (const kind of ["save", "svg"] as const)
  el(`#qx-${kind}`).addEventListener("click", async () => {
    const snapshot = structuredClone(state),
      button = el<HTMLButtonElement>(`#qx-${kind}`);
    button.disabled = true;
    el("#qx-save-status").textContent =
      kind === "save"
        ? "Checking ten source pages, font and license…"
        : "Checking the embedded font and license…";
    try {
      download(
        `stoicheia-quadratrix.${kind === "save" ? "html" : "svg"}`,
        kind === "save" ? await quadratrixStudy(snapshot) : await quadratrixSvg(snapshot),
        kind === "save" ? "text/html;charset=utf-8" : "image/svg+xml",
      );
      el("#qx-save-status").textContent =
        "Saved the experiment as it was at the time of the click.";
    } catch (e) {
      el("#qx-save-status").textContent = `${message(e)} No file was saved.`;
    } finally {
      button.disabled = false;
    }
  });
el<HTMLInputElement>("#qx-open").addEventListener("change", async () => {
  const input = el<HTMLInputElement>("#qx-open"),
    file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 12000) throw new Error("The saved experiment is too large.");
    commit(parseQuadratrixJson(await file.text()));
    el("#qx-open-status").textContent = "Reopened the experiment, reading and source page.";
  } catch (e) {
    el("#qx-open-status").textContent = `${message(e)} The experiment is unchanged.`;
  } finally {
    input.value = "";
  }
});
el("#qx-share").addEventListener("click", () => {
  el("#qx-share-label").hidden = false;
  shareField();
  el<HTMLInputElement>("#qx-share-url").focus();
  el<HTMLInputElement>("#qx-share-url").select();
});
window.addEventListener("popstate", () => {
  try {
    commit(decodeQuadratrix(location.search), false);
  } catch (e) {
    el("#qx-address-error").textContent = `${message(e)} The experiment is unchanged.`;
  }
});
render();
prepareOffline(el("#qx-offline"), el<HTMLButtonElement>("#qx-reload"));
