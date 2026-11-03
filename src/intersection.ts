import { approximate, exact } from "./core/circle";
import {
  candidateInteger,
  type IntersectionState,
  intersectionCsv,
  intersectionModel,
  intersectionTrials,
} from "./core/intersection";

/** Identical equal-unit plate for the live experiment and the portable reading. */
export function intersectionDrawing(s: IntersectionState): string {
  const p = intersectionModel(s),
    x = 260 + 140 * approximate(p.x),
    y = 220 - 140 * approximate(p.y);
  const ghost = 220 - (140 * Math.sqrt(3)) / 2;
  return `<figure class="intersection-figure"><svg xmlns="http://www.w3.org/2000/svg" viewBox="100 55 460 320" role="img" aria-labelledby="intersection-plate-title intersection-plate-desc">
    <title id="intersection-plate-title">A rational point on one of I.1’s circles</title>
    <desc id="intersection-plate-desc">Centres A at (0,0) and B at (1,0), each with radius one. Candidate P is exactly on A’s circle and ${p.position} B’s circle. The continuous curves are real-plane guides, not a display of all rational points. ${s.real ? "The real intersections are shown as hollow diamonds; neither has two rational coordinates." : "The real intersections are not marked."}</desc>
    <g fill="none" stroke="#9aaebe" stroke-width="1.5" stroke-dasharray="5 5"><circle cx="260" cy="220" r="140"/><circle cx="400" cy="220" r="140"/></g>
    <path d="M260 220H400" stroke="#193d60" stroke-width="2"/>
    <path d="M260 220L${x} ${y}L400 220" fill="none" stroke="#694780" stroke-width="2.5"/>
    ${s.real ? `${[ghost, 440 - ghost].map((gy) => `<path d="M330 ${gy - 7}l7 7-7 7-7-7Z" fill="#fbfcfe" stroke="#193d60" stroke-width="1.5"/>`).join("")}<text x="347" y="${ghost - 12}" fill="#193d60" font-size="17">Γ in the real plane</text>` : ""}
    <g fill="#193d60"><circle cx="260" cy="220" r="4"/><circle cx="400" cy="220" r="4"/></g>
    <circle cx="${x}" cy="${y}" r="5.5" fill="#694780" stroke="#fbfcfe" stroke-width="2"/>
    <g fill="#193d60" font-family="Georgia,serif" font-size="20"><text x="235" y="245">Α</text><text x="410" y="245">Β</text><text x="${x - 18}" y="${y - 15}" fill="#694780">P</text></g>
    <g fill="#52677b" font-family="system-ui,sans-serif" font-size="13"><text x="245" y="267">(0, 0)</text><text x="385" y="267">(1, 0)</text></g>
  </svg><figcaption>Equal units on both axes · ΑΒ = 1. Dashed curves: real-plane guides. Purple point: exact rational candidate.</figcaption></figure>`;
}

export const intersectionArgument = `<h3>What would a common point require?</h3>
  <p>The two unit circles require <b>x² + y² = 1</b> and <b>(x − 1)² + y² = 1</b>. Subtracting gives <b>x = 1/2</b>; substituting gives <b>y² = 3/4</b>. The real plane supplies <b>y = ±√3/2</b>.</p>
  <p>Neither height is rational. If √3 = a/b in lowest terms, then a² = 3b². Squares leave remainder 0 or 1 when divided by 3, so 3 divides a. Writing a = 3k then gives b² = 3k², so 3 also divides b, contradicting lowest terms.</p>
  <h3>A point restriction, not a history of Euclid</h3>
  <p>Here we deliberately admit only points with two rational coordinates. Both circles have rational points, and rational candidates can approach the real crossing arbitrarily closely. None is a common point. The continuous dashed curves show the real-plane setting around those candidates; they do not turn irrational points into admitted rational points.</p>
  <p>This is a modern coordinate experiment. It isolates the difference between drawing circles and supplying their common point. It does not claim to verify every Euclidean definition or postulate in a rational plane, or to reconstruct Euclid’s own account of continuity. Other geometric constructions also fail under this restriction.</p>`;

function exactLedger(s: IntersectionState): string {
  const p = intersectionModel(s);
  return `<table class="intersection-exact"><caption>Exact audit · squared lengths avoid square-root rounding</caption><tbody>
    <tr><th scope="row">P’s coordinates</th><td data-exact="coordinates">(${exact(p.x)}, ${exact(p.y)})</td></tr>
    <tr><th scope="row">ΑP²</th><td data-exact="first">${exact(p.firstSquared)} · on the first circle</td></tr>
    <tr><th scope="row">ΒP²</th><td data-exact="second">${exact(p.secondSquared)}</td></tr>
    <tr><th scope="row">ΒP² − 1</th><td data-exact="residual">${exact(p.residual)} · ${p.position} the second</td></tr>
  </tbody></table>`;
}

export function intersectionStudy(s: IntersectionState): string {
  const p = intersectionModel(s);
  return `<section class="intersection-saved"><h2>Both read one. Only one is exact.</h2><p>Modern rational-coordinate experiment accompanying I.1. Normalized base ΑΒ = 1; independent of the course plate’s size and orientation. Candidate parameter t = m/n = ${s.m}/${s.n}; coordinates x = (n² − m²)/(n² + m²), y = 2mn/(n² + m²).</p>
    ${intersectionDrawing(s)}<p>At ${s.places} decimal places: ΑP = ${(1).toFixed(s.places)}; ΒP ≈ ${p.shownLength}. ${p.roundedEqual ? "The displayed lengths agree." : "The displayed lengths differ."} The exact squared-length residual is ${exact(p.residual)}. A nonzero residual cannot supply Γ.</p>
    ${exactLedger(s)}${intersectionArgument}<p>The Greek intersection command and Postulate 3 are retained in this reading with their full printed source pages. The m/n experiment, algebra and English explanation are new teaching material.</p></section>`;
}

export function mountIntersection(
  root: HTMLElement,
  options: {
    read: () => IntersectionState;
    change: (s: IntersectionState) => void;
    download: (text: string, type: string, name: string) => void;
    save: () => Promise<string>;
    sources: string;
  },
): { render: () => void } {
  root.innerHTML = `<div class="intersection-invitation" id="intersection-invitation"><p class="eyebrow">Investigate the missing permission · I.1</p><h2>Both read one.<br>Only one is exact.</h2><p>Keep P exactly on Α’s circle. Bring it so close to Β’s circle that both lengths round to one. Have you obtained Γ?</p><button type="button" id="intersection-open">Test the intersection →</button></div>
    <div id="intersection-bench" hidden>
      <div class="intersection-heading"><div><p class="eyebrow">A modern point restriction</p><h2 id="intersection-title" tabindex="-1">What if only rational points are admitted?</h2></div><button type="button" id="intersection-close">Close experiment</button></div>
      <p class="intersection-intro">A rational coordinate is a fraction of integers. We normalize ΑΒ to 1 and require <em>both</em> coordinates of P to be rational. This experiment has its own scale; changing the course plate above does not change these givens.</p>
      <div class="intersection-layout"><div class="intersection-plate"><div id="intersection-drawing"></div><div class="intersection-rounded" aria-label="Rounded length readings"><span>ΑP <b id="intersection-first"></b></span><span>ΒP <b id="intersection-second"></b></span><span id="intersection-precision-note"></span></div><p id="intersection-verdict" role="status" aria-live="polite"></p>
        <label class="intersection-real"><input type="checkbox" id="intersection-real"/> Show the real plane’s exact intersections</label><p id="intersection-real-note"></p></div>
      <div class="intersection-audit"><h3>Approach the crossing</h3><label for="intersection-trial">Choose a rational candidate<select id="intersection-trial">${intersectionTrials.map(([m, n], i) => `<option value="${i}">t = ${m}/${n}</option>`).join("")}<option value="custom">Custom candidate</option></select></label>
        <div class="intersection-actions"><button type="button" id="intersection-previous">← Previous candidate</button><button type="button" id="intersection-next">Closer candidate →</button></div>
        <label for="intersection-places">Length display<select id="intersection-places"><option value="2">2 decimal places</option><option value="4">4 decimal places</option><option value="6">6 decimal places</option></select></label>
        <div id="intersection-ledger"></div><details class="intersection-custom" id="intersection-custom"><summary>Choose your own fraction</summary><p>Every valid t = m/n below supplies a point exactly on the first circle.</p><form id="intersection-form"><label for="intersection-m">m<input id="intersection-m" type="text" inputmode="numeric" maxlength="7" aria-describedby="intersection-draft-note intersection-error" required/></label><label for="intersection-n">n<input id="intersection-n" type="text" inputmode="numeric" maxlength="7" aria-describedby="intersection-draft-note intersection-error" required/></label><button type="submit">Apply candidate</button><button type="button" id="intersection-revert" disabled>Discard edits</button></form><p id="intersection-draft-note"></p><p id="intersection-error" role="status"></p><p>Whole numbers: m from 0 to 1,000,000; n from 1 to 1,000,000. The bounds keep input manageable; the impossibility argument below has no such bound.</p></details>
        <div class="intersection-actions"><button type="button" id="intersection-csv">Save exact CSV</button><button type="button" id="intersection-save">Save illustrated reading</button><button type="button" id="intersection-cancel" hidden>Cancel reading download</button><button type="button" id="intersection-share">Share this experiment</button></div><p id="intersection-save-status" role="status"></p></div></div>
      <div class="intersection-explanation"><details><summary>Why can no rational candidate finish?</summary><p>Set t = m/n. The formulas <b>x = (n² − m²)/(n² + m²)</b> and <b>y = 2mn/(n² + m²)</b> give x² + y² = 1 exactly, by expanding the squares. The second squared length differs from 1 by <b>(3m² − n²)/(m² + n²)</b>.</p>${intersectionArgument}</details><details><summary>Read the permission and the command</summary>${options.sources}<p><b>τέμνουσιν ἀλλήλους / inter se secant</b> says that the circles cut one another. The relative clause identifies Γ by that meeting. Postulate 3 commands a circle’s drawing; it does not explicitly supply this common point. The experiment above asks a modern question about that distinction.</p></details></div>
    </div>`;
  const el = <T extends HTMLElement = HTMLElement>(id: string): T => {
    const node = root.querySelector<T>(`#intersection-${id}`);
    if (!node) throw new Error(`Missing intersection control: ${id}`);
    return node;
  };
  let renderedPair = "";
  let dirty = false;
  function draftNote(): void {
    const s = options.read();
    el("draft-note").textContent = dirty
      ? `Unapplied edits. The diagram, share link and saved files still use ${s.m}/${s.n}. Choose Apply candidate to use your fraction.`
      : `Applied candidate: ${s.m}/${s.n}. Sharing and saving use this fraction.`;
    el<HTMLButtonElement>("revert").disabled = !dirty;
  }
  function resetDraft(): void {
    const s = options.read();
    el<HTMLInputElement>("m").value = String(s.m);
    el<HTMLInputElement>("n").value = String(s.n);
    for (const id of ["m", "n"]) el(id).removeAttribute("aria-invalid");
    el("error").textContent = "";
    dirty = false;
    renderedPair = `${s.m}/${s.n}`;
    draftNote();
  }
  function render(): void {
    const s = options.read(),
      p = intersectionModel(s);
    el("invitation").hidden = s.open;
    el("bench").hidden = !s.open;
    if (!s.open) return;
    el("drawing").innerHTML = intersectionDrawing(s);
    el("first").textContent = (1).toFixed(s.places);
    el("second").textContent = `≈ ${p.shownLength}`;
    el("precision-note").textContent = `Length display · ${s.places} decimal places`;
    el("verdict").textContent =
      `${p.roundedEqual ? "The displayed numbers agree." : "The displayed numbers differ."} P is ${p.position} Β’s circle. Its exact error is nonzero.`;
    el("ledger").innerHTML = exactLedger(s);
    el<HTMLSelectElement>("places").value = String(s.places);
    el<HTMLInputElement>("real").checked = s.real;
    el("real-note").textContent = s.real
      ? "The hollow diamonds have coordinates (1/2, ±√3/2). They exist in the real plane but are excluded by our rational-coordinate rule. At this scale a near candidate may share pixels with Γ; use the exact ledger to distinguish them."
      : "The two continuous curves are real-plane guides. A visible crossing is not an admitted point under every point rule.";
    const index = intersectionTrials.findIndex(([m, n]) => m * s.n === s.m * n);
    el<HTMLSelectElement>("trial").value = index < 0 ? "custom" : String(index);
    el<HTMLButtonElement>("previous").disabled = index <= 0;
    el("next").textContent = index < 0 ? "Start candidate sequence →" : "Closer candidate →";
    el<HTMLButtonElement>("next").disabled = index === intersectionTrials.length - 1;
    if (renderedPair !== `${s.m}/${s.n}`) resetDraft();
    else draftNote();
  }
  function update(next: IntersectionState, replaceDraft = false): void {
    if (replaceDraft) renderedPair = "";
    options.change(next);
    render();
  }
  function choose(index: number): void {
    const pair = intersectionTrials[index];
    if (pair) update({ ...options.read(), m: pair[0], n: pair[1] }, true);
  }
  root.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
    if (target.id === "intersection-trial") {
      if (target.value === "custom") {
        el<HTMLDetailsElement>("custom").open = true;
        el("m").focus();
      } else choose(Number(target.value));
    }
    if (target.id === "intersection-places")
      update({ ...options.read(), places: Number(target.value) as 2 | 4 | 6 });
    if (target.id === "intersection-real")
      update({ ...options.read(), real: (target as HTMLInputElement).checked });
  });
  root.addEventListener("input", (event) => {
    const target = event.target;
    if (
      !(target instanceof HTMLInputElement) ||
      !["intersection-m", "intersection-n"].includes(target.id)
    )
      return;
    dirty = true;
    target.removeAttribute("aria-invalid");
    el("error").textContent = "";
    draftNote();
  });
  el("form").addEventListener("submit", (event) => {
    event.preventDefault();
    let field = "m";
    try {
      const m = candidateInteger(el<HTMLInputElement>("m").value);
      field = "n";
      const n = candidateInteger(el<HTMLInputElement>("n").value, true);
      update({ ...options.read(), m, n }, true);
    } catch (error) {
      el(field).setAttribute("aria-invalid", "true");
      el("error").textContent =
        `${field === "m" ? "Numerator m" : "Denominator n"}: ${error instanceof Error ? error.message : "Check the fraction."}`;
    }
  });
  root.addEventListener("click", (event) => {
    const button = (event.target as Element).closest("button");
    if (!button) return;
    const s = options.read(),
      index = intersectionTrials.findIndex(([m, n]) => m * s.n === s.m * n);
    switch (button.id) {
      case "intersection-open":
        update({ ...s, open: true });
        el("title").focus();
        el("bench").scrollIntoView({ block: "start", behavior: "instant" });
        break;
      case "intersection-close":
        update({ ...s, open: false });
        el("open").focus();
        break;
      case "intersection-next":
        choose(index < 0 ? 0 : index + 1);
        break;
      case "intersection-previous":
        choose(index - 1);
        break;
      case "intersection-revert":
        resetDraft();
        el("m").focus();
        break;
      case "intersection-csv":
        options.download(
          intersectionCsv(s),
          "text/csv;charset=utf-8",
          "stoicheia-I1-intersection.csv",
        );
        break;
      case "intersection-save":
        button.disabled = true;
        el("save-status").textContent =
          "Preparing the complete I.1 reading, experiment and printed pages…";
        void options
          .save()
          .then((message) => {
            el("save-status").textContent = message;
          })
          .catch(() => {
            el("save-status").textContent = "The reading could not be saved. Please try again.";
          })
          .finally(() => {
            button.disabled = false;
          });
        break;
      case "intersection-share":
        document.querySelector<HTMLButtonElement>("#share")?.click();
        break;
    }
  });
  return { render };
}
