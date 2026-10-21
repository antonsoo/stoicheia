import { casebookSources, caseExplanation, caseStages, caseTitles } from "./content/casebook";
import { lessons } from "./content/lessons";
import { type CasebookState, casebookModel, casebookScene } from "./core/casebook";
import { diagramStyles, drawScene, escapeHtml } from "./render";

const number = (value: number) => value.toFixed(2);
const supplementCredit = `Modern exploration, not an additional Greek or Latin passage from I.7. Heath’s commentary (1925), pp. 259–261, discusses the omitted interior case and attributes it to Proclus. This apparatus uses fixed ΑΒ = 200, ΑΓ = 140, and ∠ΒΑΓ = 70° to cross the relevant placements continuously. It does not enumerate all placements or supply a formal axiomatization of order. Measurements check the real-plane drawing; they are not its proof.`;

function sourceReading(controls: boolean): string {
  const source = lessons[5].statement;
  return `<h3>Read the clause that makes the repair possible</h3><p>The base of the isosceles triangle ΑΓΔ is ΓΔ. “Below the base” means the angles made by extending the equal sides past Γ and Δ; it does not mean lower on the screen.</p><div class="case-source"><p lang="grc">${escapeHtml(source.grc).replace("ὑπὸ τὴν βάσιν", "<mark>ὑπὸ τὴν βάσιν</mark>")}</p><p lang="la">${escapeHtml(source.lat).replace("sub basi", "<mark>sub basi</mark>")}</p><p>${escapeHtml(source.en)}</p></div><p><span lang="grc">ὑπὸ τὴν βάσιν</span> / <span lang="la">sub basi</span>: “below the base.” In the angle name <span lang="grc">ἡ ὑπὸ ΑΓΔ</span>, the letters instead identify the two bounding rays, with Γ as vertex.</p>${controls ? '<div class="case-actions"><button type="button" data-source="20">Greek source · p. 20</button><button type="button" data-source="21">Latin source · p. 21</button><button type="button" data-lesson="5" data-open-result="true">Open I.5’s result</button></div>' : "<p>I.5 statement: Heiberg (1883), Greek p. 20; Latin p. 21. The Latin is Heiberg’s nineteenth-century translation. English: Stoicheia.</p>"}`;
}

function measurements(state: CasebookState): string {
  const { lengths, angles, placement, printedPart } = casebookModel(state);
  const sameSide = placement !== "reflection";
  const distinct = placement !== "coincident";
  return `<table class="case-measures"><caption>What this sketch actually satisfies</caption><thead><tr><th scope="col">Condition</th><th scope="col">Measured sketch</th></tr></thead><tbody><tr><th scope="row">ΑΓ = ΑΔ</th><td>${number(lengths.ac)} = ${number(lengths.ad)}</td></tr><tr><th scope="row">ΒΓ = ΒΔ</th><td>${number(lengths.bc)} ${Math.abs(lengths.bc - lengths.bd) < 1e-8 ? "=" : "≠"} ${number(lengths.bd)}</td></tr><tr><th scope="row">Same side of ΑΒ</th><td>${sameSide ? "Yes" : "No"}</td></tr><tr><th scope="row">Distinct Γ and Δ</th><td>${distinct ? "Yes" : "No"}</td></tr>${angles && (placement === "inside" || placement === "outside") ? `<tr><th scope="row">∠ΔΓΒ part of ∠ΑΓΔ?</th><td>${printedPart ? "Yes · printed placement" : "No · use exterior angles"}</td></tr><tr><th scope="row">∠ΔΓΒ / ∠ΓΔΒ</th><td>${number(angles.dcb)}° / ${number(angles.cdb)}°</td></tr>` : ""}</tbody></table>`;
}

export function casebookSheet(state: CasebookState): string {
  const model = casebookModel(state);
  const meaningfulStages = ["inside", "outside"].includes(model.placement) ? [0, 1, 2, 3] : [0];
  // A saved interior study includes the auxiliary rays needed by its argument,
  // even when downloaded while the initial diagnostic view is selected.
  const saved = { ...state, stage: 3 };
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>Stoicheia · I.7 case study</title><style>body{max-width:900px;margin:2rem auto;padding:0 1.25rem;color:#193d60;font:17px/1.6 Georgia,serif}h1,h2,h3,caption,th{font-family:system-ui,sans-serif}h2{font-size:1.2rem}svg{width:100%;max-height:430px}section{border-top:1px solid #b1c1d0;padding:1rem 0;break-inside:avoid}table{border-collapse:collapse;width:100%;font:14px/1.6 system-ui,sans-serif}caption{text-align:left;font-weight:600}th,td{border-bottom:1px solid #b1c1d0;padding:8px;text-align:left}.chain{font-family:monospace;overflow-wrap:anywhere}mark{background:#e6def0;color:#193d60}footer{font:14px/1.6 system-ui,sans-serif}@media print{body{margin:0;font-size:11pt}svg{max-height:260px}}${diagramStyles}</style></head><body><p>STOICHEIA · A SUPPLEMENT TO EUCLID I.7</p><h1>The case left to the reader</h1><h2>${caseTitles[model.placement]}</h2>${drawScene(casebookScene(saved), caseTitles[model.placement], false, "case-plate", 480)}<p>Control: ${state.mode === "turn" ? `${state.turn}° turn from Γ toward the base` : state.mode === "boundary" ? "Exact second intersection with ΒΓ" : "Reflection across ΑΒ"}. ΑΓ = ΑΔ is retained. The second distance equality is a supposition in the contradiction argument, not a fact of a distinct same-side sketch.</p>${measurements(state)}${meaningfulStages
    .map((stage) => {
      const explanation = caseExplanation(model.placement, stage);
      return `<section><h2>${escapeHtml(explanation.title)}</h2><p>${escapeHtml(explanation.text)}</p><p class="chain">${escapeHtml(explanation.chain)}</p></section>`;
    })
    .join(
      "",
    )}<section>${sourceReading(false)}</section><footer><p>${supplementCredit}</p><p><a href="${casebookSources.heath}">Heath commentary, transcribed by D. R. Wilkins</a> · <a href="${casebookSources.joyce}">David E. Joyce, I.7 commentary</a> · <a href="https://archive.org/details/euclidisoperaomn01eucluoft">Heiberg source volume</a></p><p>Greek and Latin source: public domain. English explanations and calculated diagrams: Stoicheia (2026), MIT.</p></footer></body></html>`;
}

interface CasebookHost {
  read: () => CasebookState;
  change: (state: CasebookState) => void;
  download: (data: string, type: string, filename: string) => void;
}

export function mountCasebook(root: HTMLElement, host: CasebookHost) {
  root.innerHTML = `<details id="casebook"><summary><span>The case left to the reader</span><span>I.7 · explore the missing placement</span></summary><div class="case-intro"><p class="eyebrow">A modern supplement to the printed argument</p><h2 id="case-heading" tabindex="-1">Why I.5 proves two kinds of angle equality</h2><p>The printed I.7 proof places Δ outside ΑΒΓ. Move it inside: the theorem still holds, but a containing angle changes. Find the missing argument with the exterior angles already proved in I.5.</p></div><div class="case-layout"><div class="case-apparatus"><div class="case-presets" role="group" aria-label="Choose a placement"><button type="button" data-case="outside">Outside</button><button type="button" data-case="inside">Inside</button><button type="button" data-case="boundary">On ΒΓ</button><button type="button" data-case="reflection">Reflection</button><button type="button" data-case="coincident">Coincidence</button></div><p id="case-placement" class="case-placement" role="status" tabindex="-1"></p><div id="case-diagram"></div><div class="case-turn"><label for="case-turn">Turn Δ from Γ toward the base <output for="case-turn" id="case-turn-output"></output></label><input id="case-turn" type="range" min="0" max="65" step="1" value="20"><p id="case-turn-note">ΑΓ = ΑΔ stays fixed. The second pair is free to disagree.</p></div><button type="button" class="case-phone-jump" id="case-read">Read this argument ↓</button><div id="case-measures"></div></div><div class="case-reasoning"><button type="button" class="case-phone-jump" id="case-back">Back to the figure ↑</button><nav class="case-stages" aria-label="Explore the argument">${caseStages.map((title, i) => `<button type="button" data-case-stage="${i}"><span>${i + 1}</span>${title}</button>`).join("")}</nav><article id="case-explanation" tabindex="-1" aria-live="polite" aria-atomic="true"></article><div class="case-actions"><button type="button" id="case-save">Save this case study</button><button type="button" id="case-share">Share this exploration</button></div><div id="case-share-field" hidden><label for="case-url">Link preserves the placement and argument step</label><input type="url" id="case-url" readonly></div></div></div><details class="case-reading"><summary>The language of the repair · Greek / Latin / English</summary>${sourceReading(true)}</details><p class="case-credit">${supplementCredit} <a href="${casebookSources.heath}" target="_blank" rel="noreferrer">Read Heath’s account ↗</a> · <a href="${casebookSources.joyce}" target="_blank" rel="noreferrer">Joyce’s commentary ↗</a></p></details>`;
  const get = <T extends HTMLElement = HTMLElement>(selector: string): T => {
    const node = root.querySelector<T>(selector);
    if (!node) throw new Error(`Missing case-study element: ${selector}`);
    return node;
  };
  const details = get<HTMLDetailsElement>("#casebook");

  function render() {
    const state = host.read();
    details.open = state.open;
    const model = casebookModel(state);
    get("#case-placement").textContent = caseTitles[model.placement];
    get("#case-diagram").innerHTML = drawScene(
      casebookScene(state),
      caseTitles[model.placement],
      false,
      "case-plate",
      480,
    );
    const slider = get<HTMLInputElement>("#case-turn");
    slider.value = String(state.turn);
    slider.disabled = state.mode !== "turn";
    get("#case-turn-output").textContent =
      state.mode === "turn"
        ? `${state.turn}°`
        : state.mode === "boundary"
          ? "Exact intersection"
          : "Reflected";
    get("#case-turn-note").textContent =
      state.mode === "turn"
        ? "ΑΓ = ΑΔ stays fixed. The second pair is free to disagree."
        : "Choose Outside or Inside to resume moving Δ along the circle.";
    for (const button of root.querySelectorAll<HTMLButtonElement>("[data-case]"))
      button.setAttribute("aria-pressed", String(button.dataset.case === model.placement));
    const argument = model.placement === "inside" || model.placement === "outside";
    for (const button of root.querySelectorAll<HTMLButtonElement>("[data-case-stage]")) {
      button.disabled = !argument && button.dataset.caseStage !== "0";
      button.setAttribute(
        "aria-current",
        Number(button.dataset.caseStage) === (argument ? state.stage : 0) ? "step" : "false",
      );
    }
    const explanation = caseExplanation(model.placement, state.stage);
    get("#case-explanation").innerHTML =
      `<p class="eyebrow">${argument ? `Argument ${state.stage + 1} / 4` : "Check the hypotheses"}</p><h3>${escapeHtml(explanation.title)}</h3><p>${escapeHtml(explanation.text)}</p><p class="case-chain">${escapeHtml(explanation.chain)}</p>`;
    get("#case-measures").innerHTML = measurements(state);
    get<HTMLInputElement>("#case-url").value = location.href;
  }
  function update(next: CasebookState) {
    host.change(next);
    render();
  }
  details.addEventListener("toggle", () => {
    if (details.open !== host.read().open) update({ ...host.read(), open: details.open });
  });
  root.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.id !== "case-turn") return;
    update({ ...host.read(), mode: "turn", turn: Number(event.target.value) });
  });
  root.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("button");
    if (!button) return;
    const state = host.read();
    if (button.dataset.case) {
      const choice = button.dataset.case;
      update({
        ...state,
        mode: choice === "boundary" || choice === "reflection" ? choice : "turn",
        turn: choice === "inside" ? 55 : choice === "coincident" ? 0 : 20,
      });
    } else if (button.dataset.caseStage) {
      update({ ...state, stage: Number(button.dataset.caseStage) });
    } else if (button.id === "case-read" || button.id === "case-back") {
      const target = get(button.id === "case-read" ? "#case-explanation" : "#case-placement");
      target.scrollIntoView({ block: "start", behavior: "instant" });
      target.focus({ preventScroll: true });
    } else if (button.id === "case-save") {
      host.download(
        casebookSheet(state),
        "text/html;charset=utf-8",
        `stoicheia-I7-${casebookModel(state).placement}.html`,
      );
    } else if (button.id === "case-share") {
      get("#case-share-field").hidden = false;
      get<HTMLInputElement>("#case-url").value = location.href;
      get<HTMLInputElement>("#case-url").select();
    }
  });
  return {
    render,
    open() {
      update({ ...host.read(), open: true });
      root.scrollIntoView({ block: "start", behavior: "instant" });
      get("#case-heading").focus({ preventScroll: true });
    },
  };
}
