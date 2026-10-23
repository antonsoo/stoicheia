import { closureConditions, closureDrawing, closureSummary } from "./closure-drawing";
import { closureCsv, closureStudy, closureSvg } from "./closure-study";
import { closurePassages, closureQuestions, closureSteps } from "./content/closure";
import {
  closureModel,
  closurePresets,
  decodeClosure,
  encodeClosure,
  trialPoint,
  unitText,
} from "./core/triangle-closure";
import { escapeHtml } from "./html";
import { prepareOffline } from "./offline";

function el<T extends Element = HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing workshop element: ${selector}`);
  return node;
}
let state = decodeClosure(location.hash);
let question = 0;
let busy = false;
let invalidLength = false;

el("#app").innerHTML = `
  <header class="cl-header"><a class="cl-brand" href="./">Stoicheia <span lang="grc">ΣΤΟΙΧΕΙΑ</span></a><nav aria-label="Workshop navigation"><a href="./#p=20&s=8">I.20 · Why two sides exceed one</a><a href="#reading">Read I.22</a><a href="#evidence">Printed evidence</a></nav></header>
  <main>
    <section class="cl-intro"><div><p class="cl-kicker">BOOK I / PROPOSITION 22 / A CONSTRUCTION LAB</p><h1>Three lengths.<br/>Can they close?</h1></div><div><p>Two circles can miss by being too far apart.<br/>They can also miss by being <em>too close.</em></p><p>Keep three lengths independent. Try the hinges, find the crossings, then read the condition Euclid puts before his construction.</p></div></section>
    <section id="workshop" class="cl-workshop" aria-label="Triangle construction" tabindex="-1">
      <div class="cl-board" id="plate" tabindex="-1"><a class="cl-phone-link" href="#givens-title">Change the three lengths ↓</a>
        <div class="cl-plate-heading"><p class="cl-kicker">Α, Β, Γ name lengths · Ζ and Η are centres</p><span id="view-label"></span></div>
        <div id="closure-diagram"></div>
        <div class="cl-stage-nav" aria-label="Construction steps">${closureSteps.map((title, i) => `<button type="button" data-stage="${i}"><span>${i + 1}</span>${title}</button>`).join("")}</div>
        <p id="stage-explanation" class="cl-stage-explanation"></p>
        <div class="cl-try-actions"><button type="button" id="trial-toggle" class="cl-action" aria-pressed="false">Try closing it yourself</button><button type="button" id="flip-side">Use the other side</button><a href="#reading" id="read-construction">Read this command ↓</a></div>
        <div id="trial-controls" class="cl-trial" hidden><label for="trial-angle">Turn the first arm <output id="trial-angle-output" for="trial-angle"></output></label><input type="range" id="trial-angle" min="0" max="180" step="1"/><p id="trial-feedback" aria-live="polite"></p><p>ΖP stays equal to Α. The arm ΗQ keeps length Γ and points towards P. Adjust the angle, or drag P on the plate. A small rounded gap is not an exact construction.</p><button type="button" id="reveal">Reveal the compass result</button></div>
      </div>
      <aside class="cl-givens" aria-labelledby="givens-title"><p class="cl-kicker">No length is adjusted to fit</p><h2 id="givens-title">Choose the three givens</h2><p class="cl-small">Arbitrary drawing units · 1.0–12.0</p>
        ${(
          [
            ["a", "Α", "First radius"],
            ["b", "Β", "Base"],
            ["c", "Γ", "Second radius"],
          ] as const
        )
          .map(
            ([key, label, title]) =>
              `<div class="cl-length"><div><label for="length-${key}"><span lang="grc">${label}</span> ${title}</label><input id="length-${key}" data-length="${key}" type="number" min="1" max="12" step="0.1" aria-describedby="length-error"/></div><input type="range" id="range-${key}" data-range="${key}" min="10" max="120" step="1" aria-label="${title} ${label}, in tenths of a unit"/></div>`,
          )
          .join("")}
        <p id="length-error" role="status" hidden>Enter each length from 1.0 to 12.0 in steps of 0.1. The plate retains the last valid givens.</p>
        <a class="cl-phone-link" href="#plate">Inspect these lengths on the plate ↑</a><div id="closure-conditions"></div>
        <details class="cl-presets"><summary>Inspect the five outcomes</summary><div>${closurePresets.map((p, i) => `<button type="button" data-preset="${i}">${p.title}</button>`).join("")}</div></details>
      </aside>
      <div id="closure-result" class="cl-result" aria-live="polite" aria-atomic="true"></div>
    </section>
    <section class="cl-why" aria-labelledby="why-title"><div><p class="cl-kicker">The condition you can test</p><h2 id="why-title">“However the two are taken.”</h2><p class="cl-key-phrase" lang="grc">πάντῃ μεταλαμβανομένας</p><p>The three comparisons express one rule: the longest length must be shorter than the other two together. Equality gives a straight configuration, with no interior. “Greater than” cannot become “greater than or equal to.”</p><a href="./#p=20&s=8">Follow the earlier proof of I.20 →</a></div><div><h3>One base, two possible vertices</h3><p>Each crossing has the same two distances from Ζ and Η. The two resulting triangles are reflections. I.7 rules out a second distinct solution <em>on the same side</em>; it does not exclude one across the base.</p><a href="./#p=7&s=7&case=1&case-mode=reflection">Inspect the same-side condition in I.7 →</a><details class="cl-math"><summary>Why these inequalities give crossings in this model</summary><p>Put Ζ at (0, 0), Η at (Β, 0), and the vertex at (x, y). Subtract x² + y² = Α² and (x − Β)² + y² = Γ²:</p><p class="cl-formula">x = (Α² + Β² − Γ²) / (2Β)<br/>4Β²y² = ((Α + Γ)² − Β²)(Β² − (Α − Γ)²)</p><p>Both factors are positive precisely when |Α − Γ| &lt; Β &lt; Α + Γ. These are the three strict triangle inequalities. A zero factor gives a tangent; a negative product gives no real y. This real-coordinate argument is a modern explanation. Euclid does not supply it, and a numerical picture is not a proof from his five postulates.</p></details></div></section>
    <section id="reading" class="cl-reading" aria-labelledby="reading-title"><div class="cl-reading-head"><div><p class="cl-kicker">The complete source / nine reading units</p><h2 id="reading-title">From “let it be” to “it has been made.”</h2><p>Heiberg's Greek and nineteenth-century Latin. New English reading.</p></div><label for="passage-select">Read a passage<select id="passage-select">${closurePassages.map((p, i) => `<option value="${i}">${i + 1}. ${p.title}</option>`).join("")}</select></label></div>
      <p id="source-premise" class="cl-premise" hidden></p><div id="passage-text"></div><div class="cl-reading-controls"><button type="button" id="read-prev">← Previous passage</button><span id="passage-position" aria-live="polite"></span><button type="button" id="read-next">Next passage →</button><a href="#workshop">Return to the plate ↑</a></div>
      <details class="cl-full-reading"><summary>Read the complete passage together</summary>${closurePassages.map((p, i) => `<article><h3>${i + 1}. ${p.title}</h3><p lang="grc">${escapeHtml(p.grc)}</p><p lang="la">${escapeHtml(p.lat)}</p><p>${escapeHtml(p.en)}</p></article>`).join("")}</details>
    </section>
    <section class="cl-practice" aria-labelledby="practice-title"><div><p class="cl-kicker">Check your reading</p><h2 id="practice-title">Which condition did you use?</h2><p>Three short questions about the construction and its language.</p></div><form id="closure-question"><fieldset id="question-options"></fieldset><button class="cl-action" type="submit">Check the reason</button><p id="question-feedback" role="status"></p><button type="button" id="question-next">Next question</button></form></section>
    <section id="evidence" class="cl-evidence" aria-labelledby="evidence-title"><div><p class="cl-kicker">The edition is part of the lesson</p><h2 id="evidence-title">Read the ink, too.</h2><p>J. L. Heiberg, <cite>Euclidis opera omnia</cite>, volume I (Leipzig, 1883), pp. 52–55. All four pages are bundled for offline use.</p><label for="source-page">Printed page<select id="source-page">${[52, 53, 54, 55].map((p) => `<option value="${p}">${p} · ${p % 2 ? "Latin" : "Greek"}${p >= 54 ? " · construction and proof" : " · condition and givens"}</option>`).join("")}</select></label><p><a id="full-source-image" href="./sources/heiberg-052.jpg" target="_blank" rel="noreferrer">Open the full-size page ↗</a></p><h3>What the transcription preserves</h3><p>Heiberg's square brackets remain. The Greek statement has a bracketed explanation invoking the triangle inequality; the Latin has an inline reference to I.20 instead. The source goes straight from the circles to the joins at Κ. No invented intersection sentence has been inserted.</p><p>Line breaks, critical notes and inline Latin reference marks are omitted. Greek ϑ becomes θ; point labels use Greek letters consistently. T, P and Q, trial angles, numerical units and the five experiment presets are modern teaching aids.</p><p><a href="https://archive.org/details/euclidisoperaomn01eucluoft/page/n66/mode/2up" target="_blank" rel="noreferrer">Complete public-domain volume ↗</a> · <a href="https://mathcs.clarku.edu/~djoyce/elements/bookI/propI22.html" target="_blank" rel="noreferrer">Mathematical commentary ↗</a> · <a href="./sources/manifest.json">Page provenance</a></p></div><figure><img id="source-image" src="./sources/heiberg-052.jpg" width="987" height="1550" alt="Heiberg, printed page 52: the Greek condition and givens for I.22" loading="lazy"/><figcaption id="source-caption">Printed page 52 · Greek</figcaption></figure></section>
    <section class="cl-downloads" aria-labelledby="save-title"><div><p class="cl-kicker">Keep this experiment</p><h2 id="save-title">A reading you can take away.</h2><p>The illustrated HTML contains your givens, the plate, all three languages, teaching notes and four source scans. It opens offline and prints without a server.</p></div><div class="cl-save-actions"><button type="button" class="cl-action" id="save-study">Save illustrated reading</button><button type="button" id="save-svg">Save diagram (SVG)</button><button type="button" id="save-csv">Save measurements (CSV)</button><button type="button" id="share-state">Show link to these givens</button><label id="share-label" for="share-url" hidden>Link to this view<input id="share-url" type="url" readonly/></label><p id="save-status" role="status"></p></div></section>
  </main><footer class="cl-footer"><p>Stoicheia · Geometry, in its own words.</p><p id="offline-status" role="status">Preparing offline reading…</p><button type="button" id="reload-edition" hidden>Reload saved edition</button><a href="https://github.com/antonsoo/stoicheia">Source code · MIT</a></footer>`;

const stageText = [
  "Α, Β and Γ are separate given lengths. Their names do not refer to triangle vertices.",
  "Copy Α to ΔΖ, Β to ΖΗ, and Γ to ΗΘ. The base is the middle copy, ΖΗ. Earlier I.2–3 supply the copies.",
  "Draw at Ζ through Δ. Every point on this circle is at distance Α from Ζ; that alone does not close the triangle.",
  "Draw at Η through Θ. A shared point must belong to both circumferences. At a tangent, T is a modern label for the single contact.",
  "Where there are two crossings, join Κ to both centres. ΚΖ = Α, ΖΗ = Β, ΗΚ = Γ. Λ is the reflected alternative.",
];

function write(push = false): void {
  const hash = encodeClosure(state);
  if (push) history.pushState(null, "", hash);
  else history.replaceState(null, "", hash);
  if (!el("#share-label").hidden) el<HTMLInputElement>("#share-url").value = location.href;
}
function syncLengths(): void {
  invalidLength = false;
  el("#length-error").hidden = true;
  for (const key of ["a", "b", "c"] as const) {
    el<HTMLInputElement>(`#length-${key}`).value = unitText(state[key]);
    el<HTMLInputElement>(`#length-${key}`).removeAttribute("aria-invalid");
    el<HTMLInputElement>(`#range-${key}`).value = String(state[key]);
    el<HTMLInputElement>(`#range-${key}`).setAttribute(
      "aria-valuetext",
      `${unitText(state[key])} drawing units`,
    );
  }
}
function renderPlate(): void {
  const model = closureModel(state);
  el("#closure-diagram").innerHTML = closureDrawing(
    state,
    matchMedia("(max-width: 740px)").matches,
  );
  el("#view-label").textContent = state.trial
    ? "Modern trial"
    : `Construction ${state.step + 1} / 5`;
  el("#stage-explanation").textContent = state.trial
    ? "Keep both arm lengths. Their tips must meet away from the base line to make a triangle."
    : (stageText[state.step] ?? "");
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-stage]"))
    button.setAttribute(
      "aria-current",
      String(!state.trial && Number(button.dataset.stage) === state.step),
    );
  el("#trial-toggle").setAttribute("aria-pressed", String(state.trial));
  el("#trial-toggle").textContent = state.trial
    ? "Return to the construction"
    : "Try closing it yourself";
  el("#trial-controls").hidden = !state.trial;
  el<HTMLInputElement>("#trial-angle").value = String(state.turn);
  el("#trial-angle-output").textContent = `${state.turn}°`;
  const t = trialPoint(state),
    residual = t.residual;
  el("#trial-feedback").textContent =
    `ΗP needs ${t.needed.toFixed(4)} units; ΗQ has ${unitText(state.c)}. ${Math.abs(residual) < 0.00005 ? "The displayed gap rounds to zero. Use the compass result to establish exact closure, and check that the vertex is off the base." : `The second arm ${residual > 0 ? "falls short by" : "reaches past P by"} ${Math.abs(residual).toFixed(4)}.`}`;
  el("#closure-conditions").innerHTML = closureConditions(state);
  el("#closure-result").innerHTML = closureSummary(state);
  el("#source-premise").hidden = model.kind === "crossing";
  el("#source-premise").textContent =
    "Your current lengths do not satisfy I.22's strict condition. The printed passage below describes the permitted construction; this experimental plate cannot complete its triangle.";
  for (const id of ["save-study", "save-svg", "save-csv", "share-state"])
    el<HTMLButtonElement>(`#${id}`).disabled = invalidLength || busy;
}
function source(page: number): void {
  const filename = `./sources/heiberg-${String(page).padStart(3, "0")}.jpg`;
  el<HTMLSelectElement>("#source-page").value = String(page);
  el<HTMLImageElement>("#source-image").src = filename;
  el<HTMLImageElement>("#source-image").alt =
    `Heiberg, printed page ${page}: ${page % 2 ? "Latin" : "Greek"} text of I.22, with editorial notes`;
  el<HTMLAnchorElement>("#full-source-image").href = filename;
  el("#source-caption").textContent = `Printed page ${page} · ${page % 2 ? "Latin" : "Greek"}`;
}
function renderReading(): void {
  const p = closurePassages[state.passage];
  if (!p) return;
  const links = (pages: number[]) =>
    pages.map((n) => `<button type="button" data-source="${n}">p. ${n} ↓</button>`).join(" ");
  el<HTMLSelectElement>("#passage-select").value = String(state.passage);
  el("#passage-text").innerHTML =
    `<h3>${p.title}</h3><div class="cl-languages"><section><h4>Greek <span lang="grc">Ἑλληνικά</span> ${links(p.greekPages)}</h4><p lang="grc">${escapeHtml(p.grc)}</p></section><section><h4>Latin <span lang="la">Latine</span> ${links(p.latinPages)}</h4><p lang="la">${escapeHtml(p.lat)}</p></section><section><h4>English <span>new reading</span></h4><p>${escapeHtml(p.en)}</p></section></div><div class="cl-notes"><div><h4>Read the language</h4><p>${escapeHtml(p.note)}</p></div><div><h4>Follow the reason</h4><p>${escapeHtml(p.reason)}</p></div></div>`;
  el("#passage-position").textContent = `${state.passage + 1} / ${closurePassages.length}`;
  el<HTMLButtonElement>("#read-prev").disabled = state.passage === 0;
  el<HTMLButtonElement>("#read-next").disabled = state.passage === closurePassages.length - 1;
}
function choosePassage(index: number): void {
  state.passage = index;
  state.step = closurePassages[index]?.stage ?? 0;
  state.trial = false;
  renderReading();
  renderPlate();
  write(true);
}
function renderQuestion(): void {
  const q = closureQuestions[question];
  if (!q) return;
  el("#question-options").innerHTML =
    `<legend>${question + 1}. ${q.prompt}</legend>${q.options.map((option, i) => `<label><input type="radio" name="answer" value="${i}" required/>${option}</label>`).join("")}`;
  el("#question-feedback").textContent = "";
}
function download(name: string, text: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

el("#app").addEventListener("input", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  const rangeKey = input.dataset.range;
  if (rangeKey === "a" || rangeKey === "b" || rangeKey === "c") {
    state[rangeKey] = Number(input.value);
    syncLengths();
    renderPlate();
    write();
  } else if (input.dataset.length) {
    const values = (["a", "b", "c"] as const).map((key) => {
      const control = el<HTMLInputElement>(`#length-${key}`);
      const tenths = Number(control.value) * 10;
      const valid =
        control.value !== "" &&
        control.validity.valid &&
        Math.abs(tenths - Math.round(tenths)) < 1e-8;
      control.setAttribute("aria-invalid", String(!valid));
      return { key, value: Math.round(tenths), valid };
    });
    invalidLength = values.some((v) => !v.valid);
    el("#length-error").hidden = !invalidLength;
    if (!invalidLength)
      for (const v of values) {
        state[v.key] = v.value;
        el<HTMLInputElement>(`#range-${v.key}`).value = String(v.value);
        el<HTMLInputElement>(`#range-${v.key}`).setAttribute(
          "aria-valuetext",
          `${unitText(v.value)} drawing units`,
        );
      }
    renderPlate();
    if (!invalidLength) write();
  } else if (input.id === "trial-angle") {
    state.turn = Number(input.value);
    renderPlate();
    write();
  }
});
el<HTMLSelectElement>("#passage-select").addEventListener("change", (event) =>
  choosePassage(Number((event.target as HTMLSelectElement).value)),
);
el<HTMLSelectElement>("#source-page").addEventListener("change", (event) =>
  source(Number((event.target as HTMLSelectElement).value)),
);
document.addEventListener("click", (event) => {
  const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!anchor) return;
  const target = document.getElementById(anchor.getAttribute("href")?.slice(1) ?? "");
  if (!target) return;
  event.preventDefault();
  target.tabIndex = -1;
  target.scrollIntoView();
  target.focus({ preventScroll: true });
});
el("#app").addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>("button");
  if (!button) return;
  if (button.dataset.stage !== undefined) {
    state.step = Number(button.dataset.stage);
    state.trial = false;
    state.passage = [1, 2, 3, 4, 5][state.step] ?? 0;
    renderReading();
    renderPlate();
    write(true);
  } else if (button.dataset.preset !== undefined) {
    const preset = closurePresets[Number(button.dataset.preset)];
    if (preset) {
      state = { ...state, ...preset.lengths, step: 4, trial: false };
      syncLengths();
      renderPlate();
      write(true);
    }
  } else if (button.dataset.source) {
    source(Number(button.dataset.source));
    el("#evidence").scrollIntoView();
    el<HTMLSelectElement>("#source-page").focus({ preventScroll: true });
  }
});
el("#trial-toggle").addEventListener("click", () => {
  state.trial = !state.trial;
  renderPlate();
  write(true);
});
el("#reveal").addEventListener("click", () => {
  state.trial = false;
  state.step = 4;
  renderPlate();
  write(true);
  el<HTMLButtonElement>("#trial-toggle").focus();
});
el("#flip-side").addEventListener("click", () => {
  state.side = state.side === 1 ? -1 : 1;
  renderPlate();
  write();
});
el("#read-prev").addEventListener("click", () => choosePassage(Math.max(0, state.passage - 1)));
el("#read-next").addEventListener("click", () => choosePassage(Math.min(8, state.passage + 1)));
el("#read-construction").addEventListener("click", () => {
  state.passage = [1, 2, 3, 4, 5][state.step] ?? 0;
  renderReading();
  write();
});
el("#question-next").addEventListener("click", () => {
  question = (question + 1) % closureQuestions.length;
  renderQuestion();
});
el("#closure-question").addEventListener("submit", (event) => {
  event.preventDefault();
  const selected = el<HTMLInputElement>('input[name="answer"]:checked');
  const q = closureQuestions[question];
  el("#question-feedback").textContent =
    `${Number(selected.value) === q?.correct ? "Yes." : "Reconsider the reason."} ${q?.explanation}`;
});
el("#share-state").addEventListener("click", () => {
  write();
  el("#share-label").hidden = false;
  const url = el<HTMLInputElement>("#share-url");
  url.value = location.href;
  url.focus();
  url.select();
});
el("#save-svg").addEventListener("click", () => {
  download(
    "stoicheia-I22-diagram.svg",
    closureSvg(state, matchMedia("(max-width: 740px)").matches),
    "image/svg+xml",
  );
  el("#save-status").textContent = "Saved the current plate as SVG.";
});
el("#save-csv").addEventListener("click", () => {
  download("stoicheia-I22-measurements.csv", closureCsv(state), "text/csv;charset=utf-8");
  el("#save-status").textContent =
    "Saved givens, all three margins and the model's intersection result.";
});
el("#save-study").addEventListener("click", async () => {
  const snapshot = { ...state };
  busy = true;
  renderPlate();
  el("#save-status").textContent = "Embedding the font and four printed pages…";
  try {
    download("stoicheia-I22-reading.html", await closureStudy(snapshot), "text/html;charset=utf-8");
    el("#save-status").textContent =
      `Saved the illustrated reading for Α ${unitText(snapshot.a)}, Β ${unitText(snapshot.b)}, Γ ${unitText(snapshot.c)}.`;
  } catch (error) {
    el("#save-status").textContent =
      error instanceof Error ? error.message : "The reading could not be saved. Please try again.";
  } finally {
    busy = false;
    renderPlate();
  }
});

// Pointer input is an optional shortcut for the native keyboard-accessible slider.
// Capture stays on the stable container while its SVG is redrawn.
let pointer: number | null = null;
const board = el("#closure-diagram");
function turnAt(event: PointerEvent): void {
  const svg = el<SVGSVGElement>("#closure-diagram svg"),
    transform = svg.getScreenCTM();
  if (!transform) return;
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(transform.inverse());
  const centre = el<SVGCircleElement>('#closure-diagram [data-point="Ζ"] circle');
  const dx = point.x - Number(centre.getAttribute("cx"));
  const dy = Number(centre.getAttribute("cy")) - point.y;
  state.turn = Math.round((Math.atan2(Math.max(0, state.side * dy), dx) * 180) / Math.PI);
  renderPlate();
  write();
}
board.addEventListener("pointerdown", (event) => {
  if (!state.trial || !(event.target as Element).closest('[data-point="P"]')) return;
  pointer = event.pointerId;
  board.setPointerCapture(pointer);
  event.preventDefault();
  turnAt(event);
});
board.addEventListener("pointermove", (event) => {
  if (event.pointerId === pointer) turnAt(event);
});
const endDrag = () => {
  pointer = null;
};
board.addEventListener("pointerup", endDrag);
board.addEventListener("pointercancel", endDrag);
board.addEventListener("lostpointercapture", endDrag);
window.addEventListener("hashchange", () => {
  state = decodeClosure(location.hash);
  syncLengths();
  renderPlate();
  renderReading();
});
window.addEventListener("popstate", () => {
  state = decodeClosure(location.hash);
  syncLengths();
  renderPlate();
  renderReading();
});
syncLengths();
renderPlate();
renderReading();
renderQuestion();
if (import.meta.env.DEV)
  el("#offline-status").textContent =
    "Development preview · offline saving is available in the production build.";
else if ("serviceWorker" in navigator)
  prepareOffline(el("#offline-status"), el<HTMLButtonElement>("#reload-edition"));
else
  el("#offline-status").textContent =
    "Offline saving is unavailable in this browser. You can save an illustrated reading.";

matchMedia("(max-width: 740px)").addEventListener("change", renderPlate);
let openBeforePrint: boolean | null = null;
window.addEventListener("beforeprint", () => {
  const reading = el<HTMLDetailsElement>(".cl-full-reading");
  openBeforePrint ??= reading.open;
  reading.open = true;
});
window.addEventListener("afterprint", () => {
  if (openBeforePrint !== null) {
    el<HTMLDetailsElement>(".cl-full-reading").open = openBeforePrint;
    openBeforePrint = null;
  }
});
