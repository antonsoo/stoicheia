import { mountCasebook } from "./casebook";
import { foundationById, foundations, reasonFoundations } from "./content/foundations";
import { glossary } from "./content/glossary";
import type { Passage } from "./content/lessons";
import { lessons, reasons } from "./content/lessons";
import { exercisePassage, readingExercises } from "./content/practice";
import { explorationControls, parameterControls } from "./controls";
import { makeScene } from "./core/scene";
import type { PropositionId } from "./core/state";
import { decodeState, defaults, encodeState, propositionIds, stepCounts } from "./core/state";
import { illustratedCourseStudy } from "./course-study";
import { prepareOffline } from "./offline";
import { annotated, comparisonTable, drawScene, escapeHtml } from "./render";
import { studyAssetIdentity, studyBlobUrl } from "./study-assets";

function element<T extends Element = HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing interface element: ${selector}`);
  return node;
}

let state = decodeState(location.hash);
let sourcePage = 4;
let sourceRevision = 0;
let sourceBlob = "";
let practiceIndex = 0;
let readingMode = "parallel";
let translationsRevealed = false;
const app = element("#app");

app.innerHTML = `
  <header class="masthead">
    <a class="brand" href="${import.meta.env.BASE_URL}" aria-label="Stoicheia: start the reader">
      <svg viewBox="0 0 72 56" aria-hidden="true"><circle cx="26" cy="30" r="22"/><circle cx="48" cy="30" r="22"/><path d="M26 30 37 10.947 48 30Z"/></svg>
      <span>Stoicheia<span class="brand-greek" lang="grc">ΣΤΟΙΧΕΙΑ</span></span>
    </a>
    <div class="masthead-note">Geometry, in its own words.<span>Euclid I.1–23 · Greek / Latin / English</span></div>
    <button type="button" class="quiet" id="about-sources">About the texts <span aria-hidden="true">↗</span></button>
  </header>
  <main>
    <nav class="lesson-nav" aria-label="Propositions">
      ${propositionIds.map((id) => `<button type="button" data-lesson="${id}" class="lesson-tab"><span class="tab-numeral">${lessons[id].numeral}</span><span>${lessons[id].shortTitle}</span><span class="tab-greek" lang="grc">${lessons[id].greekNumeral}</span></button>`).join("")}
    </nav>
    <label class="lesson-picker" for="lesson-select">Choose a proposition<select id="lesson-select">${propositionIds.map((id) => `<option value="${id}">${lessons[id].numeral} · ${lessons[id].shortTitle}</option>`).join("")}</select></label>
    <details class="companion-workshops" id="companion-workshops" ${matchMedia("(min-width: 701px)").matches ? "open" : ""}><summary>Explore companion workshops</summary><div class="reader-tools"><a href="./quadratrix.html">The point the motion cannot draw · Pappus’s quadratrix ↗</a><a href="./horn.html">A line that will not fit · Euclid III.16 ↗</a><a href="./circle.html">Keep the safe side · Archimedes' circle bounds ↗</a><a href="./measure.html">A measure in common · X.2–3 ↗</a><a href="./desk.html">Make I.2 yourself · Construction desk ↗</a><a href="./mesolabe.html">Twice the stone · Eratosthenes' sliding plates ↗</a><a href="./gnomon.html">Equal leftovers, unequal shapes · I.43 and II.5 ↗</a><a href="./quadrature.html">A square, with nothing added · II.14 workshop ↗</a><a href="./triangle.html">Can three lengths close? · I.22 workshop ↗</a></div></details><div class="reader-tools course-tools"><button type="button" data-foundation="p1">Open definitions, postulates &amp; common notions <span aria-hidden="true">↗</span></button><button type="button" id="open-practice">Practice reading the argument <span aria-hidden="true">↗</span></button></div>
    <div class="lesson-heading"><div><p class="eyebrow" id="book-label"></p><h1 id="lesson-title"></h1></div><p id="lesson-introduction"></p></div>
    <section id="workbench" class="workbench" aria-label="Geometric plate and parallel reader" tabindex="-1">
      <div class="construction">
        <div class="plate-top"><span id="plate-number"></span><span id="phase-label"></span></div>
        <div id="diagram"></div><div id="motion-control" class="motion-control" hidden></div>
        <div class="step-controls">
          <button type="button" id="previous" class="arrow" aria-label="Previous step">←</button>
          <div class="step-progress"><p id="step-position" aria-live="polite" aria-atomic="true"></p><div id="step-list" class="step-list" aria-label="Reading steps"></div></div>
          <button type="button" id="next" class="next-button">Next step <span aria-hidden="true">→</span></button>
        </div>
        <button type="button" class="phone-reader-jump" id="read-sentence">Read this sentence ↓</button>
        <aside id="diagram-notice" class="diagram-notice" hidden></aside><div id="comparison" class="comparison" hidden></div>
        <div id="equations" class="equations" aria-label="Established relations"></div>
        <p id="hypothesis-warning" class="warning" role="status" hidden></p>
        <div class="plate-legend"><span><i class="legend-given"></i>given / established</span><span><i class="legend-active"></i>current operation</span></div>
        <details class="parameters" id="parameters"><summary>Change the givens <span>the argument should survive</span></summary><div id="parameter-controls"></div></details>
        <div class="plate-actions"><button type="button" id="save-diagram">Save diagram</button><button type="button" id="save-sheet">Save illustrated study</button><button type="button" id="share">Share this step</button></div><p id="save-feedback" class="export-note" role="status">The saved study includes the full reading, its printed source pages and a font for Greek.</p>
      </div>
      <article class="reader" aria-labelledby="step-title">
        <div class="reader-top"><span class="eyebrow" id="reading-label">Read the command</span><span class="vocabulary-hint">Underlined words open vocabulary</span></div>
        <h2 id="step-title" tabindex="-1"></h2><button type="button" class="phone-reader-jump" id="back-to-plate">Back to the plate ↑</button>
        <label class="reading-mode" for="reading-mode">Reading mode<select id="reading-mode"><option value="parallel">Three languages together</option><option value="greek">Greek first</option><option value="latin">Latin first</option></select></label><div id="current-passage"></div><button type="button" id="reveal-translations" class="reveal-translations" hidden>Reveal the other languages</button>
        <details class="language-note" open><summary>Read the language</summary><p id="language-note"></p></details>
        <div class="reason" id="reason"></div>
      </article>
    </section>
    <section class="understanding" aria-label="Understand the argument">
      <article class="insight"><p class="eyebrow">Beyond the drawing</p><h2 id="insight-title"></h2><p id="insight-text"></p><a id="commentary-link" target="_blank" rel="noreferrer">Read the mathematical commentary <span aria-hidden="true">↗</span></a><div id="edition-extra"></div></article>
      <form class="question" id="question"><p class="eyebrow">Check the reason</p><fieldset id="question-options"></fieldset><p id="question-feedback" role="status" aria-live="polite"></p></form>
    </section>
    <section id="casebook-root" aria-label="The missing case in I.7" hidden></section>
    <details class="course-map"><summary><span>How the arguments depend on one another</span><span>Twenty propositions · construction and proof</span></summary><table><thead><tr><th scope="col">Proposition</th><th scope="col">Earlier results it uses</th><th scope="col">What it earns</th></tr></thead><tbody>${propositionIds
      .map((id) => {
        const dependencies = [
          ...new Set(
            lessons[id].steps
              .map((step) => reasons[step.reason]?.lesson)
              .filter((value): value is PropositionId => value !== undefined),
          ),
        ];
        return `<tr><th scope="row"><button type="button" data-lesson="${id}">${lessons[id].numeral}</button></th><td>${dependencies.length ? dependencies.map((d) => `<button type="button" data-lesson="${d}">${lessons[d].numeral}</button>`).join(" ") : "Definitions, postulates and assumptions"}</td><td>${lessons[id].shortTitle}</td></tr>`;
      })
      .join("")}</tbody></table></details>
    <details class="full-reading" id="full-reading"><summary><span>Read the complete passage</span><span>Greek · Latin · English</span></summary><div id="full-passage"></div><p class="print-credit">Stoicheia · Euclid, Elements I.1–23. Greek and Latin: J. L. Heiberg, Euclidis opera omnia, vol. I (Leipzig, 1883), pp. 2–57; public domain. Latin is Heiberg’s nineteenth-century translation. English reading and notes: Stoicheia, 2026, MIT. Source and edition notes: antonsoo.github.io/stoicheia/</p></details>
    <details class="wordbook"><summary><span>A small working vocabulary</span><span>Words you meet in these proofs</span></summary><div class="glossary-list">${glossary.map((entry) => `<button type="button" data-gloss="${entry.id}"><span lang="grc">${escapeHtml(entry.greek)}</span><span lang="la">${escapeHtml(entry.latin)}</span><small>${escapeHtml(entry.meaning)}</small></button>`).join("")}</div></details>
    <section class="source-note" id="source-note"><div><p class="eyebrow">A printed source you can inspect</p><h2>One edition. Two languages.</h2><p>Greek text and Latin translation from J. L. Heiberg’s <cite>Euclidis opera omnia</cite>, volume I (1883), printed pages 2–57. The English and reading notes are new. Point labels stay Greek in all three languages.</p><button type="button" id="open-edition">Open the printed pages</button></div><div class="editorial-note"><h3>What changed in transcription</h3><p>Line breaks and inline reference marks are omitted. Greek ϑ is written θ; point labels use consistent Greek letters. Latin u/v spelling is retained. Square brackets in the definitions, common notions, I.1, I.4, I.8, I.13 and I.15 reproduce Heiberg’s editorial brackets. Angle and triangle symbols are written ∠ and △. The step divisions, geometry orientation, reasons and annotations are teaching aids. The usual five-common-notion numbering is used in the notes; Heiberg’s expanded list is identified where it differs.</p><p>The English sometimes names intersections implied by the Greek. It is a reading translation, not a critical edition. The language notes cover selected forms, not every word.</p><a href="${import.meta.env.BASE_URL}sources/manifest.json">Source and image provenance</a></div></section>
  </main>
  <footer class="footer"><p>Stoicheia <span lang="grc">/ στοιχεῖα</span> · elements</p><p>Made for slow reading. No account. No tracking.</p><span class="offline-status"><span id="offline-state" role="status">Preparing offline edition…</span><button type="button" id="reload-edition" hidden>Reload saved edition</button></span></footer>
  <dialog id="practice-dialog" class="practice-dialog" aria-labelledby="practice-title"><header><div><p class="eyebrow" id="practice-position"></p><h2 id="practice-title" tabindex="-1">Read the argument</h2></div><button type="button" class="dialog-close" data-close="practice-dialog" aria-label="Close reading practice">×</button></header><div class="practice-body"><p class="practice-intro">Read the highlighted wording in its original sentence. Try an interpretation, then compare the explanation.</p><div id="practice-source"></div><form id="practice-form"><fieldset id="practice-options"></fieldset><p id="practice-feedback" role="status" aria-live="polite"></p></form><div id="practice-translation" hidden></div><button type="button" id="practice-plate">Open this passage on the plate</button></div><footer class="practice-controls"><button type="button" id="practice-previous">← Previous reading</button><button type="button" id="practice-next">Next reading →</button></footer></dialog>
  <dialog id="foundation-dialog" class="foundation-dialog" aria-labelledby="foundation-title"><header><div><p class="eyebrow">The starting permissions</p><h2 id="foundation-title" tabindex="-1">Definitions, postulates &amp; common notions</h2></div><button type="button" class="dialog-close" data-close="foundation-dialog" aria-label="Close foundations">×</button></header><div class="foundation-layout"><nav class="foundation-nav" aria-label="Foundation statements">${(
    ["Definition", "Postulate", "Common notion"] as const
  )
    .map(
      (category) =>
        `<h3>${category}s</h3>${foundations
          .filter((f) => f.category === category)
          .map(
            (f) =>
              `<button type="button" data-foundation="${f.id}">${escapeHtml(f.title)}</button>`,
          )
          .join("")}`,
    )
    .join(
      "",
    )}</nav><div class="foundation-reading"><label class="foundation-picker" for="foundation-select">Choose a statement<select id="foundation-select">${foundations.map((f) => `<option value="${f.id}">${escapeHtml(f.category)} · ${escapeHtml(f.title)}</option>`).join("")}</select></label><div id="foundation-content"></div><button type="button" class="primary" data-close="foundation-dialog">Return to the proof</button></div></div></dialog>
  <dialog id="vocabulary-dialog" class="vocabulary-dialog" aria-labelledby="gloss-title"><button type="button" class="dialog-close" data-close="vocabulary-dialog" aria-label="Close vocabulary">×</button><p class="eyebrow">Working vocabulary</p><div id="gloss-content"></div><button type="button" class="primary" data-close="vocabulary-dialog">Return to the proof</button></dialog>
  <dialog id="source-dialog" class="source-dialog" aria-labelledby="source-title"><header><div><p class="eyebrow">Heiberg · Leipzig, 1883</p><h2 id="source-title"></h2></div><button type="button" id="source-zoom" aria-pressed="false">Zoom page</button><button type="button" class="dialog-close" data-close="source-dialog" aria-label="Close source page">×</button></header><div class="source-navigation"><button type="button" id="source-previous">← Previous page</button><span id="source-language"></span><button type="button" id="source-next">Next page →</button></div><p id="course-source-status" class="scan-status" role="status"></p><div class="scan-scroll" tabindex="0" role="region" aria-label="Scrollable printed page"><img id="source-image" width="987" height="1550" alt="" /></div><p class="scan-credit">University of Toronto scan · public domain. <a href="https://archive.org/details/euclidisoperaomn01eucluoft" target="_blank" rel="noreferrer">Open the complete volume ↗</a></p></dialog>
  <dialog id="share-dialog" class="share-dialog" aria-labelledby="share-title"><button type="button" class="dialog-close" data-close="share-dialog" aria-label="Close share link">×</button><p class="eyebrow">Continue at the same place</p><h2 id="share-title">Share this step</h2><p>The link keeps the proposition, step and given lengths.</p><label for="share-url">Reader link</label><input id="share-url" type="url" readonly /><button type="button" class="primary" id="copy-link">Copy link</button><p id="copy-status" role="status"></p></dialog>
  <div class="toast" id="toast" role="status" hidden></div>
`;

const casebook = mountCasebook(element("#casebook-root"), {
  read: () => state.casebook,
  change: (next) => {
    state = { ...state, casebook: next };
    writeState();
  },
  download,
});

function sourceButtons(pages: number[], language: string): string {
  return pages
    .map(
      (page) =>
        `<button type="button" class="source-button" data-source="${page}" aria-label="Open ${language} source, printed page ${page}">p. ${page} <span aria-hidden="true">↗</span></button>`,
    )
    .join(" ");
}

function parallel(passage: Passage, controls = true): string {
  return `<section class="translation greek"><div class="translation-label"><h3>Greek <span lang="grc">Ἑλληνικά</span></h3>${controls ? sourceButtons(passage.greekPages, "Greek") : ""}</div><p lang="grc">${annotated(passage.grc)}</p></section>
    <section class="translation latin"><div class="translation-label"><h3>Latin <span lang="la">Latine</span></h3>${controls ? sourceButtons(passage.latinPages, "Latin") : ""}</div><p lang="la">${annotated(passage.lat)}</p></section>
    <section class="translation english"><div class="translation-label"><h3>English <span>reading translation</span></h3></div><p>${escapeHtml(passage.en)}</p></section>`;
}

function writeState(push = false): void {
  const url = encodeState(state);
  if (push) history.pushState(null, "", url);
  else history.replaceState(null, "", url);
}

function renderDiagram(): void {
  const lesson = lessons[state.proposition];
  const scene = makeScene(state);
  const step = lesson.steps[state.step];
  if (!step) return;
  const reason = reasons[step.reason];
  element("#phase-label").textContent = scene.warning ? "Check givens" : step.phase;
  element("#reason").innerHTML = scene.warning
    ? `<p class="eyebrow">Check the hypothesis <span>unmet</span></p><h3>${state.proposition === 3 ? "This construction needs a shorter reference" : "These givens do not support this step"}</h3><p>${escapeHtml(scene.warning)}</p>`
    : `<p class="eyebrow">Why this is allowed <span>${escapeHtml(reason?.kind ?? "deduction")}</span></p><h3>${escapeHtml(reason?.title ?? "")}</h3><p>${escapeHtml(reason?.text ?? "")}</p>${reason?.lesson ? `<button type="button" class="reason-link" data-lesson="${reason.lesson}" data-open-result="true">Open ${lessons[reason.lesson].numeral}’s result <span aria-hidden="true">→</span></button>` : ""}`;
  if (!scene.warning) {
    const sourceLinks = reasonFoundations[step.reason] ?? [];
    element("#reason").insertAdjacentHTML(
      "beforeend",
      sourceLinks
        .map(
          (id) =>
            `<button type="button" class="foundation-link" data-foundation="${id}">Read the source: ${escapeHtml(foundationById.get(id)?.title ?? "")} <span aria-hidden="true">↗</span></button>`,
        )
        .join(""),
    );
  }
  element("#diagram").innerHTML = drawScene(
    scene,
    `${lesson.numeral} · ${lesson.steps[state.step]?.title ?? ""}`,
  );
  const notice = element("#diagram-notice");
  notice.hidden = !scene.notice;
  notice.innerHTML = scene.notice
    ? `<h3>${escapeHtml(scene.notice.title)}</h3><p>${escapeHtml(scene.notice.text)}</p>`
    : "";
  if (state.proposition === 7)
    notice.insertAdjacentHTML(
      "beforeend",
      '<button type="button" id="open-casebook">Explore the missing interior case →</button>',
    );
  const comparison = element("#comparison");
  comparison.hidden = !scene.comparison;
  comparison.innerHTML =
    comparisonTable(scene) +
    (scene.figures?.length === 2
      ? `<div class="compare-actions" aria-label="Trace the compared regions"><button type="button" data-trace="both" aria-pressed="true">Both regions</button><button type="button" data-trace="first" aria-pressed="false">Trace ${escapeHtml(scene.comparison?.first ?? "first")}</button><button type="button" data-trace="second" aria-pressed="false">Trace ${escapeHtml(scene.comparison?.second ?? "second")}</button></div>`
      : "");
  element("#diagram").removeAttribute("data-trace");
  element("#equations").setAttribute(
    "aria-label",
    (state.proposition === 6 && state.step >= 1 && state.step <= 4) ||
      state.proposition === 7 ||
      state.proposition === 14 ||
      (state.proposition === 19 && (state.step === 2 || state.step === 3))
      ? "Given and temporary assumptions in the proof"
      : "Established relations",
  );
  element("#equations").innerHTML = scene.equalities.length
    ? scene.equalities.map((line) => `<span>${escapeHtml(line)}</span>`).join("")
    : `<span class="equation-placeholder">${scene.warning ? "Check the required conditions below." : state.step === 0 ? "Start with what is given." : "Construct first. Then prove the relations."}</span>`;
  element("#next").innerHTML =
    state.step === lesson.steps.length - 1
      ? scene.warning
        ? "End of text"
        : 'Complete <span aria-hidden="true">✓</span>'
      : 'Next step <span aria-hidden="true">→</span>';
  const warning = element("#hypothesis-warning");
  warning.hidden = !scene.warning;
  warning.textContent = scene.warning;
  element("#measurements").innerHTML =
    state.proposition >= 11
      ? `<table class="measurements-rows"><caption>Numerical check <span>measured sketch · relative units / degrees</span></caption><tbody>${scene.measurements.map((m) => `<tr><th scope="row">${escapeHtml(m.label)}</th><td>${m.value.toFixed(2)}</td></tr>`).join("")}</tbody></table>`
      : `<table><caption>Numerical check <span>measured sketch · relative units / degrees</span></caption><tbody><tr>${scene.measurements.map((measurement) => `<th scope="col">${escapeHtml(measurement.label)}</th>`).join("")}</tr><tr>${scene.measurements.map((measurement) => `<td>${measurement.value.toFixed(2)}</td>`).join("")}</tr></tbody></table>`;
}

function updateReadingMode(): void {
  for (const language of ["greek", "latin", "english"])
    element<HTMLElement>(`#current-passage .${language}`).hidden =
      readingMode !== "parallel" && !translationsRevealed && readingMode !== language;
  element("#reveal-translations").hidden = readingMode === "parallel" || translationsRevealed;
  element<HTMLSelectElement>("#reading-mode").value = readingMode;
}

function renderStep(): void {
  const lesson = lessons[state.proposition];
  const step = lesson.steps[state.step];
  if (!step) return;
  element("#step-title").textContent = step.title;
  element("#reading-label").textContent =
    step.phase === "Prove" || step.phase === "Conclude" ? "Read the argument" : "Read the command";
  element("#current-passage").innerHTML = parallel(step);
  translationsRevealed = false;
  updateReadingMode();
  element("#language-note").textContent = step.language;
  element("#step-position").textContent = `Step ${state.step + 1} of ${lesson.steps.length}`;
  element<HTMLButtonElement>("#previous").disabled = state.step === 0;
  element<HTMLButtonElement>("#next").disabled = state.step === lesson.steps.length - 1;
  for (const button of document.querySelectorAll<HTMLButtonElement>("#step-list button")) {
    const current = Number(button.dataset.step) === state.step;
    button.setAttribute("aria-current", current ? "step" : "false");
    button.classList.toggle("visited", Number(button.dataset.step) < state.step);
  }
  const pairSelect = document.querySelector<HTMLSelectElement>("#pair");
  if (pairSelect) pairSelect.disabled = state.step < (state.proposition === 17 ? 5 : 7);
  renderDiagram();
  writeState();
}

function renderLesson(): void {
  const lesson = lessons[state.proposition];
  document.title = `${lesson.numeral} · ${lesson.shortTitle} · Stoicheia`;
  element("#book-label").textContent = `Euclid · Book I · Proposition ${state.proposition}`;
  element("#lesson-title").textContent = lesson.title;
  element("#lesson-introduction").textContent = lesson.introduction;
  element("#plate-number").textContent = `Geometric plate ${lesson.numeral}`;
  for (const button of document.querySelectorAll<HTMLButtonElement>(".lesson-tab"))
    button.setAttribute(
      "aria-current",
      Number(button.dataset.lesson) === state.proposition ? "page" : "false",
    );
  element("#step-list").innerHTML = lesson.steps
    .map(
      (step, index) =>
        `<button type="button" data-step="${index}" aria-label="Step ${index + 1}: ${escapeHtml(step.title)}" title="${escapeHtml(step.title)}">${index + 1}</button>`,
    )
    .join("");
  element("#parameter-controls").innerHTML = parameterControls(state);
  element<HTMLSelectElement>("#lesson-select").value = String(state.proposition);
  const motionControl = element("#motion-control");
  motionControl.innerHTML = explorationControls(state);
  motionControl.hidden = !motionControl.innerHTML;
  element("#casebook-root").hidden = state.proposition !== 7;
  casebook.render();
  element("#insight-title").textContent = lesson.insight.title;
  element("#insight-text").textContent = lesson.insight.text;
  element<HTMLAnchorElement>("#commentary-link").href = lesson.insight.link;
  element("#edition-extra").innerHTML = lesson.editionNote
    ? `<section class="edition-extra"><h3>${escapeHtml(lesson.editionNote.title)}</h3><p lang="grc">${annotated(lesson.editionNote.grc)}</p><p>${escapeHtml(lesson.editionNote.en)}</p><p>${escapeHtml(lesson.editionNote.note)}</p>${sourceButtons(lesson.editionNote.greekPages, "Greek")}</section>`
    : "";
  element("#question-options").innerHTML =
    `<legend>${escapeHtml(lesson.question.prompt)}</legend>${lesson.question.options.map((option, index) => `<label><input type="radio" name="reason" value="${index}" /><span>${escapeHtml(option)}</span></label>`).join("")}`;
  element("#question-feedback").textContent = "";
  element("#question-feedback").className = "";
  element("#full-passage").innerHTML =
    `<article class="statement" tabindex="-1" aria-label="The proposition"><p class="eyebrow">The proposition</p>${parallel(lesson.statement)}</article>${lesson.steps.map((step, index) => `<article class="full-step"><button type="button" class="full-step-heading" data-step="${index}"><span>${index + 1}</span><span class="full-step-title">${escapeHtml(step.title)}</span><span class="full-open">Open on the plate ↑</span></button>${parallel(step)}</article>`).join("")}`;
  if (lesson.editionNote)
    element("#full-passage").insertAdjacentHTML(
      "beforeend",
      `<article class="full-step edition-reading"><h2>${escapeHtml(lesson.editionNote.title)}</h2><section class="translation greek"><h3>Greek ${sourceButtons(lesson.editionNote.greekPages, "Greek")}</h3><p lang="grc">${annotated(lesson.editionNote.grc)}</p></section><section class="translation english"><h3>English reading translation</h3><p>${escapeHtml(lesson.editionNote.en)}</p><p>${escapeHtml(lesson.editionNote.note)}</p></section></article>`,
    );
  renderStep();
}

function goTo(proposition: PropositionId, result = false): void {
  const changedLesson = proposition !== state.proposition;
  state = {
    ...state,
    proposition,
    angle: Math.min(75, state.angle),
    probe:
      proposition === 14
        ? Math.max(5, Math.min(state.probe, Math.floor(Math.min(75, state.angle) * 1.3)))
        : state.probe,
    step: result ? stepCounts[proposition] - 1 : 0,
    // An I.7 reflection is not a request for I.9's alternate circle crossing.
    variant: changedLesson ? 0 : state.variant,
    offset: proposition === 23 ? Math.max(-0.45, Math.min(0.45, state.offset)) : state.offset,
    motion: changedLesson ? (proposition === 21 ? 55 : 0) : state.motion,
    pair: changedLesson ? 0 : state.pair,
    ratio: changedLesson && (proposition === 18 || proposition === 19) ? 1.25 : state.ratio,
    casebook: changedLesson ? { ...state.casebook, open: false } : state.casebook,
  };
  writeState(true);
  renderLesson();
}

async function showSource(page: number): Promise<void> {
  const requested = Math.min(57, Math.max(2, page)),
    revision = ++sourceRevision;
  sourcePage = requested;
  const greek = requested % 2 === 0;
  element("#source-title").textContent = `Printed page ${requested}`;
  element("#source-language").textContent = greek ? "Greek text" : "Latin translation";
  element("#course-source-status").textContent = "Verifying the complete printed page…";
  element<HTMLImageElement>("#source-image").hidden = true;
  element<HTMLButtonElement>("#source-previous").disabled = requested === 2;
  element<HTMLButtonElement>("#source-next").disabled = requested === 57;
  element(".scan-scroll").scrollTop = 0;
  const dialog = element<HTMLDialogElement>("#source-dialog");
  if (!dialog.open) dialog.showModal();
  let pending = "";
  try {
    pending = await studyBlobUrl(
      `sources/heiberg-${String(requested).padStart(3, "0")}.jpg`,
      "image/jpeg",
    );
    if (revision !== sourceRevision) {
      URL.revokeObjectURL(pending);
      return;
    }
    // Each request decodes its own image; a later page must not abort an older
    // live-image decode and accidentally publish the wrong page under its caption.
    const next = new Image();
    next.id = "source-image";
    next.dataset.sourcePage = String(requested);
    next.dataset.sourceSha256 = studyAssetIdentity(
      `sources/heiberg-${String(requested).padStart(3, "0")}.jpg`,
    ).sha256;
    next.width = 987;
    next.height = 1550;
    next.alt = `${greek ? "Greek" : "Latin"} page ${requested} of Euclidis opera omnia, volume I, 1883. Complete printed text and critical notes.`;
    next.src = pending;
    await next.decode();
    if (revision !== sourceRevision) {
      URL.revokeObjectURL(pending);
      return;
    }
    const previous = sourceBlob;
    sourceBlob = pending;
    next.className = element("#source-image").className;
    element("#source-image").replaceWith(next);
    if (previous) URL.revokeObjectURL(previous);
    element("#course-source-status").textContent =
      "Complete printed page verified against this edition’s SHA-256.";
  } catch (error) {
    if (pending) URL.revokeObjectURL(pending);
    if (revision !== sourceRevision) return;
    element<HTMLImageElement>("#source-image").hidden = true;
    element("#course-source-status").textContent =
      `Source unavailable: ${error instanceof Error ? error.message : "verification failed"}`;
  }
}

function showPractice(index: number): void {
  practiceIndex = Math.min(readingExercises.length - 1, Math.max(0, index));
  const exercise = readingExercises[practiceIndex];
  if (!exercise) return;
  const passage = exercisePassage(exercise);
  const text = passage[exercise.language];
  const position = text.indexOf(exercise.focus);
  const quote =
    position < 0
      ? escapeHtml(text)
      : `${annotated(text.slice(0, position))}<mark>${annotated(exercise.focus)}</mark>${annotated(text.slice(position + exercise.focus.length))}`;
  const language = exercise.language === "grc" ? "Greek" : "Latin";
  element("#practice-position").textContent =
    `Reading ${practiceIndex + 1} of ${readingExercises.length} · I.${exercise.proposition} · ${language}`;
  element("#practice-title").textContent = exercise.prompt;
  element("#practice-source").innerHTML =
    `<div class="translation-label"><h3>${language}</h3>${sourceButtons(exercise.language === "grc" ? passage.greekPages : passage.latinPages, language)}</div><p lang="${exercise.language === "grc" ? "grc" : "la"}">${quote}</p>`;
  element("#practice-options").innerHTML =
    `<legend class="sr-only">Choose an interpretation</legend>${exercise.options.map((option, index) => `<label><input type="radio" name="reading-answer" value="${index}" /><span>${escapeHtml(option)}</span></label>`).join("")}`;
  element("#practice-feedback").textContent = "";
  element("#practice-feedback").className = "";
  element("#practice-translation").hidden = true;
  element("#practice-translation").innerHTML =
    `<h3>Compare the English reading</h3><p>${escapeHtml(passage.en)}</p>`;
  element<HTMLButtonElement>("#practice-previous").disabled = practiceIndex === 0;
  element<HTMLButtonElement>("#practice-next").disabled =
    practiceIndex === readingExercises.length - 1;
  const dialog = element<HTMLDialogElement>("#practice-dialog");
  if (!dialog.open) dialog.showModal();
  element(".practice-body").scrollTop = 0;
}

function showFoundation(id: string): void {
  const entry = foundationById.get(id);
  if (!entry) return;
  element("#foundation-title").textContent = entry.title;
  element("#foundation-content").innerHTML =
    `<p class="eyebrow">${escapeHtml(entry.editionLabel)}</p>${parallel(entry)}<section class="foundation-explanation"><h3>Read the wording</h3><p>${escapeHtml(entry.note)}</p><h3>Use it in the argument</h3><p>${escapeHtml(entry.use)}</p></section>`;
  element<HTMLSelectElement>("#foundation-select").value = id;
  for (const button of document.querySelectorAll<HTMLButtonElement>(".foundation-nav button"))
    button.setAttribute("aria-current", String(button.dataset.foundation === id));
  const dialog = element<HTMLDialogElement>("#foundation-dialog");
  if (!dialog.open) dialog.showModal();
  element(".foundation-reading").scrollTop = 0;
  element(".foundation-layout").scrollTop = 0;
}

function showGloss(id: string, form: string | undefined): void {
  const entry = glossary.find((item) => item.id === id);
  if (!entry) return;
  element("#gloss-content").innerHTML =
    `<h2 id="gloss-title" lang="grc">${escapeHtml(entry.greek)}</h2><p class="transliteration">${escapeHtml(entry.transliteration)} <span lang="la">/ ${escapeHtml(entry.latin)}</span></p><p class="gloss-meaning">${escapeHtml(entry.meaning)}</p>${form ? `<p class="selected-form">In this passage: <b>${escapeHtml(form)}</b></p>` : ""}<p>${escapeHtml(entry.note)}</p>`;
  element<HTMLDialogElement>("#vocabulary-dialog").showModal();
}

function download(contents: string, type: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  element("#toast").textContent = `Saved ${filename}`;
  element("#toast").hidden = false;
  setTimeout(() => {
    element("#toast").hidden = true;
  }, 4000);
}

async function saveIllustratedStudy(): Promise<void> {
  const button = element<HTMLButtonElement>("#save-sheet");
  if (button.disabled) return;
  const lesson = lessons[state.proposition],
    scene = makeScene(state),
    step = state.step;
  button.disabled = true;
  element("#save-feedback").textContent =
    `Preparing ${lesson.numeral}: checking the font and printed pages…`;
  try {
    const contents = await illustratedCourseStudy(lesson, scene, step);
    download(contents, "text/html;charset=utf-8", `stoicheia-I${lesson.id}-study.html`);
    element("#save-feedback").textContent =
      `Saved ${lesson.numeral} with its full reading, verified source images, font and notices.`;
  } catch (error) {
    element("#save-feedback").textContent =
      error instanceof Error ? error.message : "The study could not be saved. Please try again.";
  } finally {
    button.disabled = false;
  }
}

document.addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>("button");
  if (!button) return;
  if (button.dataset.circleExample) {
    const choice = button.dataset.circleExample;
    state = {
      ...state,
      ratio: 0.65,
      offset: 0,
      third: choice === "touch" ? 1.3 : choice === "cross" ? 1.8 : 1.2,
      variant: choice === "source" ? 0 : 1,
      step: Math.max(2, state.step),
    };
    renderLesson();
    element<HTMLButtonElement>(`[data-circle-example="${choice}"]`).focus({ preventScroll: true });
    return;
  }
  if (button.dataset.foundation) {
    showFoundation(button.dataset.foundation);
    return;
  }
  if (button.dataset.trace) {
    element("#diagram").setAttribute("data-trace", button.dataset.trace);
    for (const control of document.querySelectorAll<HTMLButtonElement>("[data-trace]")) {
      if (control.tagName === "BUTTON")
        control.setAttribute("aria-pressed", String(control === button));
    }
    return;
  }
  if (button.dataset.close) {
    element<HTMLDialogElement>(`#${button.dataset.close}`).close();
    return;
  }
  if (button.dataset.lesson) {
    goTo(Number(button.dataset.lesson) as PropositionId, button.dataset.openResult === "true");
    if (!button.classList.contains("lesson-tab")) {
      element("#workbench").scrollIntoView({ behavior: "instant", block: "start" });
      element<HTMLElement>("#step-title").focus({ preventScroll: true });
    }
    return;
  }
  if (button.dataset.step !== undefined) {
    state.step = Number(button.dataset.step);
    renderStep();
    if (button.classList.contains("full-step-heading")) {
      element("#workbench").scrollIntoView({ behavior: "instant", block: "start" });
      element<HTMLElement>("#step-title").focus({ preventScroll: true });
    }
    return;
  }
  if (button.dataset.gloss) {
    showGloss(button.dataset.gloss, button.dataset.form);
    return;
  }
  if (button.dataset.source) {
    showSource(Number(button.dataset.source));
    return;
  }
  switch (button.id) {
    case "open-casebook":
      casebook.open();
      break;
    case "open-practice":
      showPractice(
        readingExercises.findIndex((exercise) => exercise.proposition === state.proposition),
      );
      break;
    case "practice-previous":
    case "practice-next":
      showPractice(practiceIndex + (button.id === "practice-next" ? 1 : -1));
      element<HTMLElement>("#practice-title").focus({ preventScroll: true });
      break;
    case "practice-plate": {
      const exercise = readingExercises[practiceIndex];
      if (!exercise) return;
      element<HTMLDialogElement>("#practice-dialog").close();
      goTo(exercise.proposition);
      if (exercise.step === "statement") {
        element<HTMLDetailsElement>("#full-reading").open = true;
        element(".statement").scrollIntoView({ behavior: "instant", block: "start" });
        element(".statement").focus({ preventScroll: true });
      } else {
        state.step = exercise.step;
        renderStep();
        element("#workbench").scrollIntoView({ behavior: "instant", block: "start" });
        element<HTMLElement>("#step-title").focus({ preventScroll: true });
      }
      break;
    }
    case "reveal-translations":
      translationsRevealed = true;
      updateReadingMode();
      element<HTMLElement>("#step-title").focus({ preventScroll: true });
      break;
    case "read-sentence":
      element("#step-title").scrollIntoView({ behavior: "instant", block: "start" });
      element<HTMLElement>("#step-title").focus({ preventScroll: true });
      break;
    case "back-to-plate":
      element("#workbench").scrollIntoView({ behavior: "instant", block: "start" });
      element<HTMLElement>("#workbench").focus({ preventScroll: true });
      break;
    case "previous":
      state.step = Math.max(0, state.step - 1);
      renderStep();
      break;
    case "next":
      state.step = Math.min(stepCounts[state.proposition] - 1, state.step + 1);
      renderStep();
      break;
    case "flip":
      state.side = state.side === 1 ? -1 : 1;
      renderDiagram();
      writeState();
      break;
    case "reset": {
      const open = element<HTMLDetailsElement>("#parameters").open;
      state = {
        ...defaults,
        proposition: state.proposition,
        step: state.step,
        motion: state.proposition === 21 ? 55 : defaults.motion,
        ratio: state.proposition === 18 || state.proposition === 19 ? 1.25 : defaults.ratio,
      };
      renderLesson();
      element<HTMLDetailsElement>("#parameters").open = open;
      element<HTMLButtonElement>("#reset").focus({ preventScroll: true });
      break;
    }
    case "about-sources":
    case "open-edition":
      showSource(4);
      break;
    case "source-previous":
      showSource(sourcePage - 1);
      break;
    case "source-next":
      showSource(sourcePage + 1);
      break;
    case "source-zoom": {
      const zoomed = element("#source-image").classList.toggle("zoomed");
      button.setAttribute("aria-pressed", String(zoomed));
      button.textContent = zoomed ? "Fit page" : "Zoom page";
      break;
    }
    case "save-diagram":
      download(
        drawScene(
          makeScene(state),
          `${lessons[state.proposition].numeral} · Step ${state.step + 1}: ${lessons[state.proposition].steps[state.step]?.title}`,
          true,
        ),
        "image/svg+xml;charset=utf-8",
        `stoicheia-I${state.proposition}-step${state.step + 1}.svg`,
      );
      break;
    case "save-sheet":
      void saveIllustratedStudy();
      break;
    case "share": {
      writeState();
      element<HTMLInputElement>("#share-url").value = location.href;
      element("#copy-status").textContent = "";
      element<HTMLDialogElement>("#share-dialog").showModal();
      element<HTMLInputElement>("#share-url").select();
      break;
    }
    case "copy-link": {
      navigator.clipboard
        ?.writeText(element<HTMLInputElement>("#share-url").value)
        .then(() => {
          element("#copy-status").textContent = "Link copied.";
        })
        .catch(() => {
          element("#copy-status").textContent =
            "Select the link above and copy it with your keyboard.";
        });
      if (!navigator.clipboard)
        element("#copy-status").textContent =
          "Select the link above and copy it with your keyboard.";
      break;
    }
  }
});

document.addEventListener("input", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== "range") return;
  if (input.id.startsWith("case-")) return;
  if (input.id === "motion") {
    state.motion = Number(input.value);
    element("#motion-output").textContent = `${input.value}%`;
  }
  if (["third", "take", "offset"].includes(input.id)) {
    if (input.id === "third") state.third = Number(input.value) / 100;
    else if (input.id === "offset") state.offset = Number(input.value) / 100;
    else state.take = Number(input.value) / 100;
    element(`#${input.id}-output`).textContent =
      `${input.value}${input.id === "offset" && state.proposition === 23 ? "°" : "%"}`;
  }
  if (input.id === "probe") {
    state.probe = Number(input.value);
    element("#probe-output").textContent = `${input.value}°`;
  }
  if (input.id === "size") {
    state.size = Number(input.value);
    element("#size-output").textContent = input.value;
  }
  if (input.id === "ratio") {
    state.ratio = Number(input.value) / 100;
    element("#ratio-output").textContent = `${input.value}%`;
  }
  if (input.id === "counter-ratio") {
    state.ratio = Math.round(((Number(input.value) / 100 - 0.55) / 0.25) * 100) / 100;
    element("#counter-ratio-output").textContent = `${input.value}%`;
  }
  if (input.id === "angle") {
    state.angle =
      Number(input.value) /
      ((state.proposition >= 4 && state.proposition <= 10) || state.proposition >= 15 ? 2 : 1);
    element("#angle-output").textContent = `${input.value}°`;
    if (state.proposition === 7 || state.proposition === 14) {
      const maximum = Math.min(70, Math.floor(state.angle * 1.3));
      state.probe = Math.min(maximum, state.probe);
      element<HTMLInputElement>("#probe").max = String(maximum);
      element<HTMLInputElement>("#probe").value = String(state.probe);
      element("#probe-output").textContent = `${state.probe}°`;
    }
  }
  renderDiagram();
  writeState();
});

element("#reading-mode").addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLSelectElement)) return;
  readingMode = event.target.value;
  translationsRevealed = false;
  updateReadingMode();
});
element("#practice-form").addEventListener("submit", (event) => event.preventDefault());
element("#practice-form").addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  const exercise = readingExercises[practiceIndex];
  if (!exercise) return;
  const choice = Number(event.target.value);
  element("#practice-feedback").textContent = exercise.explanations[choice] ?? "";
  element("#practice-feedback").className =
    choice === exercise.correct ? "correct-feedback" : "try-feedback";
  element("#practice-translation").hidden = false;
});

element("#foundation-select").addEventListener("change", (event) => {
  if (event.target instanceof HTMLSelectElement) showFoundation(event.target.value);
});

element("#question").addEventListener("submit", (event) => event.preventDefault());
element("#question").addEventListener("change", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  const choice = Number(input.value);
  const question = lessons[state.proposition].question;
  element("#question-feedback").textContent = question.explanations[choice] ?? "";
  element("#question-feedback").className =
    choice === question.correct ? "correct-feedback" : "try-feedback";
});

for (const dialog of document.querySelectorAll<HTMLDialogElement>("dialog")) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    }
  });
}

window.addEventListener("popstate", () => {
  if (location.hash && !location.hash.startsWith("#p=")) return;
  state = decodeState(location.hash);
  renderLesson();
  if (state.proposition === 7 && state.casebook.open) casebook.open();
});

// Closed details suppress their contents in native print layout. Expand the
// full reading only for printing, then preserve the reader's previous choice.
let readingBeforePrint: boolean | null = null;
window.addEventListener("beforeprint", () => {
  const reading = element<HTMLDetailsElement>("#full-reading");
  readingBeforePrint ??= reading.open;
  reading.open = true;
});
window.addEventListener("afterprint", () => {
  if (readingBeforePrint === null) return;
  element<HTMLDetailsElement>("#full-reading").open = readingBeforePrint;
  readingBeforePrint = null;
});

renderLesson();
if (state.proposition === 7 && state.casebook.open) casebook.open();

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  prepareOffline(element("#offline-state"), element<HTMLButtonElement>("#reload-edition"));
} else {
  element("#offline-state").textContent = import.meta.env.DEV
    ? "Development preview"
    : "Keep this tab open to read offline";
}

// Native select navigation keeps the propositions within reach on narrow screens.
element<HTMLSelectElement>("#lesson-select").addEventListener("change", (event) => {
  const select = event.target as HTMLSelectElement;
  goTo(Number(select.value) as PropositionId);
});
document.addEventListener("change", (event) => {
  const select = event.target;
  if (!(select instanceof HTMLSelectElement)) return;
  if (select.id === "pair") {
    state.pair = Number(select.value) as 0 | 1 | 2;
    renderStep();
    return;
  }
  if (select.id !== "variant") return;
  state.variant = select.value === "1" ? 1 : 0;
  if (state.proposition === 7) element("#probe-control").hidden = state.variant === 1;
  if (state.proposition === 9 && state.step < 3) state.step = 3;
  if (state.proposition === 12 && state.step < 2) state.step = 2;
  renderStep();
});

window.addEventListener("pagehide", () => {
  sourceRevision++;
  if (sourceBlob) URL.revokeObjectURL(sourceBlob);
  sourceBlob = "";
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted && element<HTMLDialogElement>("#source-dialog").open)
    void showSource(sourcePage);
});
