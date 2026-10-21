import "./style.css";
import { glossary } from "./content/glossary";
import type { Passage } from "./content/lessons";
import { lessons, reasons } from "./content/lessons";
import { makeScene } from "./core/scene";
import type { PropositionId } from "./core/state";
import { decodeState, defaults, encodeState, stepCounts } from "./core/state";
import { annotated, drawScene, escapeHtml, studySheet } from "./render";

function element<T extends Element = HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing interface element: ${selector}`);
  return node;
}

let state = decodeState(location.hash);
let sourcePage = 10;
const app = element("#app");

app.innerHTML = `
  <header class="masthead">
    <a class="brand" href="${import.meta.env.BASE_URL}" aria-label="Stoicheia: start the reader">
      <svg viewBox="0 0 72 56" aria-hidden="true"><circle cx="26" cy="30" r="22"/><circle cx="48" cy="30" r="22"/><path d="M26 30 37 10.947 48 30Z"/></svg>
      <span>Stoicheia<span class="brand-greek" lang="grc">ΣΤΟΙΧΕΙΑ</span></span>
    </a>
    <div class="masthead-note">Geometry, in its own words.<span>Euclid’s first constructions · Greek / Latin / English</span></div>
    <button type="button" class="quiet" id="about-sources">About the texts <span aria-hidden="true">↗</span></button>
  </header>
  <main>
    <nav class="lesson-nav" aria-label="Propositions">
      ${([1, 2, 3] as const).map((id) => `<button type="button" data-lesson="${id}" class="lesson-tab"><span class="tab-numeral">${lessons[id].numeral}</span><span>${lessons[id].shortTitle}</span><span class="tab-greek" lang="grc">${lessons[id].greekNumeral}</span></button>`).join("")}
    </nav>
    <div class="lesson-heading"><div><p class="eyebrow" id="book-label"></p><h1 id="lesson-title"></h1></div><p id="lesson-introduction"></p></div>
    <section id="workbench" class="workbench" aria-label="Construction and parallel reader" tabindex="-1">
      <div class="construction">
        <div class="plate-top"><span id="plate-number"></span><span id="phase-label"></span></div>
        <div id="diagram"></div>
        <div id="equations" class="equations" aria-label="Established equalities"></div>
        <p id="hypothesis-warning" class="warning" role="status" hidden></p>
        <div class="plate-legend"><span><i class="legend-given"></i>given / established</span><span><i class="legend-active"></i>current operation</span></div>
        <div class="step-controls">
          <button type="button" id="previous" class="arrow" aria-label="Previous step">←</button>
          <div class="step-progress"><p id="step-position" aria-live="polite" aria-atomic="true"></p><div id="step-list" class="step-list" aria-label="Construction steps"></div></div>
          <button type="button" id="next" class="next-button">Next step <span aria-hidden="true">→</span></button>
        </div>
        <details class="parameters" id="parameters"><summary>Change the givens <span>the argument should survive</span></summary><div id="parameter-controls"></div></details>
        <div class="plate-actions"><button type="button" id="save-diagram">Save diagram</button><button type="button" id="save-sheet">Save study sheet</button><button type="button" id="share">Share this step</button></div>
      </div>
      <article class="reader" aria-labelledby="step-title">
        <div class="reader-top"><span class="eyebrow" id="reading-label">Read the command</span><span class="vocabulary-hint">Underlined words open vocabulary</span></div>
        <h2 id="step-title" tabindex="-1"></h2>
        <div id="current-passage"></div>
        <details class="language-note" open><summary>Read the language</summary><p id="language-note"></p></details>
        <div class="reason" id="reason"></div>
      </article>
    </section>
    <section class="understanding" aria-label="Understand the argument">
      <article class="insight"><p class="eyebrow">Beyond the drawing</p><h2 id="insight-title"></h2><p id="insight-text"></p><a id="commentary-link" target="_blank" rel="noreferrer">Read the mathematical commentary <span aria-hidden="true">↗</span></a></article>
      <form class="question" id="question"><p class="eyebrow">Check the reason</p><fieldset id="question-options"></fieldset><p id="question-feedback" role="status" aria-live="polite"></p></form>
    </section>
    <section class="reading-trail" aria-label="How the constructions depend on one another"><div><p class="eyebrow">An earned set of tools</p><p>Each result becomes a new permission.</p></div><div class="trail-links">${([1, 2, 3] as const).map((id, index) => `${index ? '<span aria-hidden="true">→</span>' : ""}<button type="button" data-lesson="${id}"><b>${lessons[id].numeral}</b><span>${lessons[id].shortTitle}</span></button>`).join("")}</div></section>
    <details class="full-reading" id="full-reading"><summary><span>Read the complete passage</span><span>Greek · Latin · English</span></summary><div id="full-passage"></div></details>
    <details class="wordbook"><summary><span>A small working vocabulary</span><span>Words you meet in these proofs</span></summary><div class="glossary-list">${glossary.map((entry) => `<button type="button" data-gloss="${entry.id}"><span lang="grc">${escapeHtml(entry.greek)}</span><span lang="la">${escapeHtml(entry.latin)}</span><small>${escapeHtml(entry.meaning)}</small></button>`).join("")}</div></details>
    <section class="source-note" id="source-note"><div><p class="eyebrow">A printed source you can inspect</p><h2>One edition. Two languages.</h2><p>Greek text and Latin translation from J. L. Heiberg’s <cite>Euclidis opera omnia</cite>, volume I (1883), printed pages 10–17. The English and reading notes are new. Point labels stay Greek in all three languages.</p><button type="button" id="open-edition">Open the printed pages</button></div><div class="editorial-note"><h3>What changed in transcription</h3><p>Line breaks and inline reference marks are omitted. Greek ϑ is written θ; point labels use consistent Greek letters. Latin u/v spelling is retained. Square brackets in I.1 reproduce Heiberg’s editorial brackets. The step divisions, geometry orientation, reasons and annotations are teaching aids.</p><p>The English sometimes names intersections implied by the Greek. It is a reading translation, not a critical edition. The language notes cover selected forms, not every word.</p><a href="${import.meta.env.BASE_URL}sources/manifest.json">Source and image provenance</a></div></section>
  </main>
  <footer class="footer"><p>Stoicheia <span lang="grc">/ στοιχεῖα</span> · elements</p><p>Made for slow reading. No account. No tracking.</p><span id="offline-state" role="status">Preparing offline edition…</span></footer>
  <dialog id="vocabulary-dialog" class="vocabulary-dialog" aria-labelledby="gloss-title"><button type="button" class="dialog-close" data-close="vocabulary-dialog" aria-label="Close vocabulary">×</button><p class="eyebrow">Working vocabulary</p><div id="gloss-content"></div><button type="button" class="primary" data-close="vocabulary-dialog">Return to the proof</button></dialog>
  <dialog id="source-dialog" class="source-dialog" aria-labelledby="source-title"><header><div><p class="eyebrow">Heiberg · Leipzig, 1883</p><h2 id="source-title"></h2></div><button type="button" id="source-zoom" aria-pressed="false">Zoom page</button><button type="button" class="dialog-close" data-close="source-dialog" aria-label="Close source page">×</button></header><div class="source-navigation"><button type="button" id="source-previous">← Previous page</button><span id="source-language"></span><button type="button" id="source-next">Next page →</button></div><div class="scan-scroll" tabindex="0" role="region" aria-label="Scrollable printed page"><img id="source-image" width="987" height="1550" alt="" /></div><p class="scan-credit">University of Toronto scan · public domain. <a href="https://archive.org/details/euclidisoperaomn01eucluoft" target="_blank" rel="noreferrer">Open the complete volume ↗</a></p></dialog>
  <dialog id="share-dialog" class="share-dialog" aria-labelledby="share-title"><button type="button" class="dialog-close" data-close="share-dialog" aria-label="Close share link">×</button><p class="eyebrow">Continue at the same place</p><h2 id="share-title">Share this step</h2><p>The link keeps the proposition, step and given lengths.</p><label for="share-url">Reader link</label><input id="share-url" type="url" readonly /><button type="button" class="primary" id="copy-link">Copy link</button><p id="copy-status" role="status"></p></dialog>
  <div class="toast" id="toast" role="status" hidden></div>
`;

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
    ? '<p class="eyebrow">Check the hypothesis <span>unmet</span></p><h3>This construction needs a shorter reference</h3><p>I.3 assumes Γ &lt; ΑΒ. Restore that inequality before applying these instructions. An equal or longer Γ does not meet the task as stated.</p>'
    : `<p class="eyebrow">Why this is allowed <span>${escapeHtml(reason?.kind ?? "deduction")}</span></p><h3>${escapeHtml(reason?.title ?? "")}</h3><p>${escapeHtml(reason?.text ?? "")}</p>${reason?.lesson ? `<button type="button" class="reason-link" data-lesson="${reason.lesson}" data-open-result="true">Open ${lessons[reason.lesson].numeral}’s construction <span aria-hidden="true">→</span></button>` : ""}`;
  element("#diagram").innerHTML = drawScene(
    scene,
    `${lesson.numeral} · ${lesson.steps[state.step]?.title ?? ""}`,
  );
  element("#equations").innerHTML = scene.equalities.length
    ? scene.equalities.map((line) => `<span>${escapeHtml(line)}</span>`).join("")
    : `<span class="equation-placeholder">${scene.warning ? "Required: Γ < ΑΒ" : state.step === 0 ? "Start with what is given." : "Construct first. Then prove the equalities."}</span>`;
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
    `<table><caption>Numerical check <span>relative units</span></caption><tbody><tr>${scene.measurements.map((measurement) => `<th scope="col">${escapeHtml(measurement.label)}</th>`).join("")}</tr><tr>${scene.measurements.map((measurement) => `<td>${measurement.value.toFixed(2)}</td>`).join("")}</tr></tbody></table>`;
}

function renderStep(): void {
  const lesson = lessons[state.proposition];
  const step = lesson.steps[state.step];
  if (!step) return;
  element("#step-title").textContent = step.title;
  element("#reading-label").textContent =
    step.phase === "Prove" || step.phase === "Conclude" ? "Read the argument" : "Read the command";
  element("#current-passage").innerHTML = parallel(step);
  element("#language-note").textContent = step.language;
  element("#step-position").textContent = `Step ${state.step + 1} of ${lesson.steps.length}`;
  element<HTMLButtonElement>("#previous").disabled = state.step === 0;
  element<HTMLButtonElement>("#next").disabled = state.step === lesson.steps.length - 1;
  for (const button of document.querySelectorAll<HTMLButtonElement>("#step-list button")) {
    const current = Number(button.dataset.step) === state.step;
    button.setAttribute("aria-current", current ? "step" : "false");
    button.classList.toggle("visited", Number(button.dataset.step) < state.step);
  }
  renderDiagram();
  writeState();
}

function renderLesson(): void {
  const lesson = lessons[state.proposition];
  document.title = `${lesson.numeral} · ${lesson.shortTitle} · Stoicheia`;
  element("#book-label").textContent = `Euclid · Book I · Proposition ${state.proposition}`;
  element("#lesson-title").textContent = lesson.title;
  element("#lesson-introduction").textContent = lesson.introduction;
  element("#plate-number").textContent = `Construction plate ${lesson.numeral}`;
  for (const button of document.querySelectorAll<HTMLButtonElement>(".lesson-tab"))
    button.setAttribute(
      "aria-current",
      Number(button.dataset.lesson) === state.proposition ? "page" : "false",
    );
  for (const button of document.querySelectorAll<HTMLButtonElement>(".trail-links button"))
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
  element("#parameter-controls").innerHTML = `
    <label class="range-label" for="size">${state.proposition === 2 ? "Separation ΑΒ" : "Given length ΑΒ"}<output id="size-output" for="size">${state.size.toFixed(0)}</output></label><input id="size" type="range" min="100" max="240" step="1" value="${state.size}" />
    ${state.proposition > 1 ? `<label class="range-label" for="ratio">Reference ${state.proposition === 2 ? "ΒΓ" : "Γ"} <span>(% of ΑΒ)</span><output id="ratio-output" for="ratio">${Math.round(state.ratio * 100)}%</output></label><input id="ratio" type="range" min="20" max="140" step="1" value="${Math.round(state.ratio * 100)}" />` : ""}
    ${state.proposition === 2 ? `<label class="range-label" for="angle">Reference angle <span>(a teaching choice)</span><output id="angle-output" for="angle">${state.angle.toFixed(0)}°</output></label><input id="angle" type="range" min="10" max="75" step="1" value="${state.angle}" />` : ""}
    <div class="parameter-buttons"><button type="button" id="flip">Flip the ${state.proposition === 3 ? "copied line" : "triangle"}</button><button type="button" id="reset">Reset givens</button></div><div id="measurements"></div>`;
  element("#insight-title").textContent = lesson.insight.title;
  element("#insight-text").textContent = lesson.insight.text;
  element<HTMLAnchorElement>("#commentary-link").href = lesson.insight.link;
  element("#question-options").innerHTML =
    `<legend>${escapeHtml(lesson.question.prompt)}</legend>${lesson.question.options.map((option, index) => `<label><input type="radio" name="reason" value="${index}" /><span>${escapeHtml(option)}</span></label>`).join("")}`;
  element("#question-feedback").textContent = "";
  element("#question-feedback").className = "";
  element("#full-passage").innerHTML =
    `<article class="statement"><p class="eyebrow">The proposition</p>${parallel(lesson.statement)}</article>${lesson.steps.map((step, index) => `<article class="full-step"><button type="button" class="full-step-heading" data-step="${index}"><span>${index + 1}</span><span class="full-step-title">${escapeHtml(step.title)}</span><span class="full-open">Open on the plate ↑</span></button>${parallel(step)}</article>`).join("")}`;
  renderStep();
}

function goTo(proposition: PropositionId, result = false): void {
  state = { ...state, proposition, step: result ? stepCounts[proposition] - 1 : 0 };
  writeState(true);
  renderLesson();
}

function showSource(page: number): void {
  sourcePage = Math.min(17, Math.max(10, page));
  const greek = sourcePage % 2 === 0;
  element("#source-title").textContent = `Printed page ${sourcePage}`;
  element("#source-language").textContent = greek ? "Greek text" : "Latin translation";
  const img = element<HTMLImageElement>("#source-image");
  img.src = `${import.meta.env.BASE_URL}sources/heiberg-${String(sourcePage).padStart(3, "0")}.jpg`;
  img.alt = `${greek ? "Greek" : "Latin"} page ${sourcePage} of Euclidis opera omnia, volume I, 1883. The page includes printed text and critical notes.`;
  element<HTMLButtonElement>("#source-previous").disabled = sourcePage === 10;
  element<HTMLButtonElement>("#source-next").disabled = sourcePage === 17;
  element(".scan-scroll").scrollTop = 0;
  const dialog = element<HTMLDialogElement>("#source-dialog");
  if (!dialog.open) dialog.showModal();
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

document.addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>("button");
  if (!button) return;
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
      state = { ...defaults, proposition: state.proposition, step: state.step };
      renderLesson();
      element<HTMLDetailsElement>("#parameters").open = open;
      element<HTMLButtonElement>("#reset").focus({ preventScroll: true });
      break;
    }
    case "about-sources":
    case "open-edition":
      showSource(10);
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
      download(
        studySheet(lessons[state.proposition], makeScene(state), state.step),
        "text/html;charset=utf-8",
        `stoicheia-I${state.proposition}-study.html`,
      );
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
  if (input.id === "size") {
    state.size = Number(input.value);
    element("#size-output").textContent = input.value;
  }
  if (input.id === "ratio") {
    state.ratio = Number(input.value) / 100;
    element("#ratio-output").textContent = `${input.value}%`;
  }
  if (input.id === "angle") {
    state.angle = Number(input.value);
    element("#angle-output").textContent = `${input.value}°`;
  }
  renderDiagram();
  writeState();
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
});

renderLesson();

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
    .then(async () => {
      await navigator.serviceWorker.ready;
      element("#offline-state").textContent = "Edition ready offline, including source pages";
    })
    .catch(() => {
      element("#offline-state").textContent = "Offline copy unavailable in this browser";
    });
} else {
  element("#offline-state").textContent = import.meta.env.DEV
    ? "Development preview"
    : "Keep this tab open to read offline";
}
