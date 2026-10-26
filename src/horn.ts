import { hornBoundary, hornPassages } from "./content/horn";
import {
  decodeHorn,
  encodeHorn,
  type HornState,
  hornJson,
  hornPages,
  hornVerdict,
  initialHorn,
  parseHornJson,
  validateHorn,
} from "./core/horn";
import {
  hornCertificate,
  hornDetail,
  hornOverview,
  hornProof,
  hornScaleCaption,
} from "./horn-drawing";
import { hornCsv, hornReading, hornSourceProof, hornStudy, hornSvg } from "./horn-study";
import { escapeHtml as esc } from "./html";
import { prepareOffline } from "./offline";
import { studyBlobUrl } from "./study-assets";

const el = <T extends HTMLElement = HTMLElement>(selector: string): T => {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing horn workshop element: ${selector}`);
  return node;
};
const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));
let state = { ...initialHorn },
  addressError = "";
try {
  state = decodeHorn(location.search);
} catch (error) {
  addressError = `${errorText(error)} Showing the initial trial; the address was not silently repaired.`;
}
el("#app").innerHTML =
  `<header class="hn-header"><a class="hn-brand" href="./">Stoicheia <span>ΣΤΟΙΧΕΙΑ</span></a><nav aria-label="Horn-angle workshop"><a href="./">Euclid course</a><a href="#hn-readings">Read the argument</a><a href="#hn-sources">Printed evidence</a></nav></header><main><section class="hn-intro"><div><p class="hn-kicker">EUCLID / III.16 / A CURVED REMAINDER</p><h1>A line that<br>will not fit.</h1></div><div><p>Between a circle and its tangent lies a curved gap. Euclid calls its angle smaller than <em>every</em> acute angle bounded by straight lines.</p><p>Try to put a straight ray into that gap. Make it shallower. Then inspect the perpendicular foot that defeats the attempt.</p><p class="hn-fine">Greek, Heiberg’s Latin and new English. No prior Greek is needed.</p><p id="hn-address-error" role="status">${esc(addressError)}</p></div></section><section id="hn-bench" class="hn-bench" aria-label="Ray and tangent experiment"><div class="hn-bench-top"><div><p class="hn-kicker">START AT A / KEEP THE CIRCLE ABOVE THE TANGENT</p><form id="hn-form" class="hn-form" novalidate><label for="hn-rise">Rise p<input id="hn-rise" type="text" inputmode="numeric" maxlength="9" autocomplete="off"/></label><label for="hn-run">Run q<input id="hn-run" type="text" inputmode="numeric" maxlength="9" autocomplete="off"/></label><button type="submit" class="hn-primary">Try this ray</button></form><p id="hn-edit-status" role="status" class="hn-fine"></p><p class="hn-fine">Whole-number run 1–1,000,000; −run ≤ rise ≤ run. These controls explore angles from −45° to 45°.</p></div><div><div class="hn-presets"><button type="button" data-hn-preset="normal">Rise 1, run 4</button><button type="button" data-hn-preset="tiny">Hide the crossing</button><button type="button" data-hn-preset="tangent">Try zero rise</button><button type="button" data-hn-preset="away">Point away</button></div><p><button type="button" id="hn-shallower">Ten times shallower</button> <span id="hn-angle" class="hn-fine"></span></p></div></div><div class="hn-plates"><figure class="hn-plate"><h3>The whole circle</h3><div id="hn-overview"></div><figcaption>Tan marks part of the curved gap, above tangent AE and outside the circle. Purple: the forward ray. A dashed purple part is its backward extension.</figcaption></figure><figure class="hn-plate"><h3>A point on the ray, enlarged</h3><div id="hn-detail"></div><figcaption id="hn-detail-note">The local crop has its own magnification. Both axes use the same units. A and the added second crossing Κ can lie outside this crop.</figcaption></figure></div><div class="hn-verdict"><p id="hn-verdict" role="status"></p></div><div class="hn-proof-bench"><div><div class="hn-focus" role="group" aria-label="Choose an exact witness"><button type="button" data-hn-focus="foot">Perpendicular foot</button><button type="button" data-hn-focus="crossing">Second crossing</button></div><div id="hn-certificate"></div><p class="hn-fine">Exact fractions decide the inequality. Decimal angles, magnification and SVG coordinates are display approximations.</p></div><div id="hn-coordinate-proof"></div></div></section><section class="hn-section"><div class="hn-section-head"><div><p class="hn-kicker">AN IMPOSSIBLE SUPPOSITION / A REALIZABLE DIAGRAM</p><h2>Why no line fits.</h2></div><p>Smaller examples are persuasive. The argument must explain why the next, still smaller, positive angle cannot succeed either.</p></div>${hornSourceProof()}<form id="hn-question" class="hn-question"><fieldset><legend>Your ray has rise 1 and run 1,000,000. H is less than one radius from Δ. What follows?</legend><label><input type="radio" name="hn-answer" value="inside"/> A point on the forward ray is inside the circle, even if the overview cannot resolve it.</label><label><input type="radio" name="hn-answer" value="zero"/> The ray’s angle has become exactly zero.</label><label><input type="radio" name="hn-answer" value="limit"/> Testing this smallest supported slope proves the claim for all slopes.</label><button type="submit">Check the reasoning</button><p id="hn-feedback" role="status"></p></fieldset></form></section><section class="hn-section" id="hn-readings"><div class="hn-section-head"><div><p class="hn-kicker">EIGHT SELECTIONS / SIXTEEN WORD NOTES</p><h2>Every. Smaller.<br>Impossible.</h2></div><p>Read the words that carry the universal comparison and the contradiction. The final Greek bracket and its Latin editorial discussion preserve a different kind of evidence.</p></div><label for="hn-passage">Choose a reading<select id="hn-passage">${hornPassages.map((p, i) => `<option value="${i}">${i + 1}. ${esc(p.title)}</option>`).join("")}</select></label><article class="hn-reading" id="hn-reading"></article><div class="hn-actions"><button type="button" id="hn-prev">← Previous reading</button><button type="button" id="hn-next">Next reading →</button><button type="button" id="hn-see-page">See this Greek page ↓</button></div></section><section class="hn-section" id="hn-sources"><div class="hn-section-head"><div><p class="hn-kicker">HEIBERG / 1883 / VOLUME I</p><h2>The diagram is<br>a supposition.</h2></div><p>Six complete printed pages keep the statement, proof, diagram, bracketed addition and editorial apparatus. Our diagram is reflected and adds Κ; it gives a realizable tilted line instead of the source’s assumed outside arrangement.</p></div><div class="hn-source-grid"><div><label for="hn-page">Printed page<select id="hn-page">${hornPages.map((p) => `<option value="${p}">p.${p} · ${p % 2 ? "Latin" : "Greek"}</option>`).join("")}</select></label><p class="hn-actions"><button type="button" id="hn-zoom" aria-pressed="false">Enlarge the page</button><a id="hn-full-image" href="./sources/horn/heiberg-210.jpg" target="_blank" rel="noreferrer">Open full image</a></p><p id="hn-source-status" role="status"></p><h3>A bracket without a parallel translation</h3><p>Page 212 prints a further corollary claim in Greek square brackets. The Latin page omits that clause from the translation and instead discusses its attribution to Theon in a footnote. Reading 8 keeps the two roles explicit.</p><p class="hn-fine">${esc(hornBoundary)}</p><p><a href="https://archive.org/download/euclidisoperaomn01eucluoft/euclidisoperaomn01eucluoft.pdf">Complete source PDF</a> · <a href="./sources/horn/manifest.json">Retained page identities</a></p></div><figure><div class="hn-source-scroll" id="hn-source-scroll" tabindex="0" role="region" aria-label="Scrollable complete source page"><img id="hn-source-image" width="1146" height="1800" alt="" hidden/></div><figcaption id="hn-source-caption"></figcaption></figure></div></section><section class="hn-section hn-save-grid"><div><p class="hn-kicker">KEEP THE RAY AND THE ARGUMENT</p><h2>A study you<br>can take away.</h2><p>The illustrated reading embeds both diagrams, exact fractions, both modern witnesses, the source proof, all eight readings, all six scans and the font. It works without scripts and prints to A4.</p><p><a href="./circle.html">Compare a different universal bound: Archimedes’ inner and outer polygons ↗</a></p></div><div><div class="hn-actions"><button type="button" class="hn-primary" id="hn-save">Save illustrated reading</button><button type="button" id="hn-csv">Save exact CSV</button><button type="button" id="hn-json">Save editable JSON</button><button type="button" id="hn-svg">Save both plates SVG</button><button type="button" id="hn-share">Make a share link</button></div><p id="hn-save-status" role="status"></p><label class="hn-file-label" for="hn-open">Reopen a saved JSON experiment<input id="hn-open" type="file" accept=".json,application/json"/></label><p id="hn-open-status" role="status"></p><label id="hn-share-label" class="hn-share" for="hn-share-url" hidden>Copy this experiment link<input id="hn-share-url" type="url" readonly/></label></div></section></main><footer class="hn-footer"><a href="./">Stoicheia · Read and construct Euclid</a><span id="hn-offline" role="status">Preparing offline edition…</span><button type="button" id="hn-reload" hidden>Reload saved edition</button><a href="https://github.com/antonsoo/stoicheia">Source &amp; MIT license</a></footer>`;

let revision = 0,
  displayedPage = -1,
  sourceUrl = "";
async function source(): Promise<void> {
  if (!el("#hn-share-label").hidden) {
    const url = new URL(location.href);
    url.search = encodeHorn(state);
    el<HTMLInputElement>("#hn-share-url").value = url.href;
  }
  const currentRevision = ++revision,
    p = state.page;
  el<HTMLSelectElement>("#hn-page").value = String(p);
  const image = el<HTMLImageElement>("#hn-source-image"),
    link = el<HTMLAnchorElement>("#hn-full-image");
  if (displayedPage === p && !image.hidden) return;
  image.hidden = true;
  link.hidden = true;
  el("#hn-source-caption").textContent = "";
  el("#hn-source-status").textContent = `Checking the identity of printed p.${p}…`;
  try {
    const url = await studyBlobUrl(`sources/horn/heiberg-${p}.jpg`, "image/jpeg");
    if (currentRevision !== revision) {
      URL.revokeObjectURL(url);
      return;
    }
    const replacement = new Image(1146, 1800);
    replacement.id = "hn-source-image";
    replacement.alt = `Complete ${p % 2 ? "Latin" : "Greek"} page ${p}, Heiberg 1883 volume I, including the editorial notes.`;
    try {
      await new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          clearTimeout(timer);
          replacement.onload = null;
          replacement.onerror = null;
        };
        const timer = setTimeout(() => {
          cleanup();
          reject(new Error("The source image did not finish loading. Choose the page again."));
        }, 15000);
        replacement.onload = () => {
          cleanup();
          resolve();
        };
        replacement.onerror = () => {
          cleanup();
          reject(new Error("The source image could not be displayed. Choose the page again."));
        };
        replacement.src = url;
      });
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
    if (currentRevision !== revision) {
      URL.revokeObjectURL(url);
      return;
    }
    el("#hn-source-image").replaceWith(replacement);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = url;
    displayedPage = p;
    link.href = url;
    link.hidden = false;
    el("#hn-source-caption").textContent =
      `Printed p.${p} · PDF page ${p + 14} · complete page, reduced without cropping or retouching.`;
    el("#hn-source-status").textContent =
      "The page matches this edition’s retained source identity.";
  } catch (error) {
    if (currentRevision !== revision) return;
    displayedPage = -1;
    el("#hn-source-status").textContent = errorText(error);
  }
}
function render(): void {
  el<HTMLInputElement>("#hn-rise").value = String(state.rise);
  el<HTMLInputElement>("#hn-run").value = String(state.run);
  el("#hn-edit-status").textContent =
    `Applied record: rise ${state.rise}, run ${state.run}. Downloads use this applied record.`;
  el("#hn-overview").innerHTML = hornOverview(state);
  el("#hn-detail").innerHTML = hornDetail(state);
  el("#hn-verdict").textContent = hornVerdict(state);
  el("#hn-certificate").innerHTML = hornCertificate(state);
  el("#hn-coordinate-proof").innerHTML = hornProof(state);
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-hn-focus]"))
    button.setAttribute("aria-pressed", String(button.dataset.hnFocus === state.focus));
  const angle = (Math.atan2(state.rise, state.run) * 180) / Math.PI;
  el("#hn-angle").textContent =
    `Ray / tangent: ${Math.abs(angle) < 0.001 && angle !== 0 ? angle.toExponential(3) : angle.toFixed(3)}° (display only)`;
  el<HTMLButtonElement>("#hn-shallower").disabled = state.rise <= 0 || state.run > 100000;
  el("#hn-detail-note").textContent =
    hornScaleCaption(state) +
    " " +
    (state.rise > 0
      ? "The local crop has its own magnification. Both axes use the same units. A and the added second crossing Κ can lie outside this crop. H is on the ray; Θ is on the circle along the extended perpendicular."
      : "The crop is at A. For a negative rise, the dashed backward extension enters the circle; the forward ray points below the tangent. A zero rise coincides with the tangent.");
  el<HTMLSelectElement>("#hn-passage").value = String(state.passage);
  el("#hn-reading").innerHTML = hornReading(state.passage);
  el<HTMLButtonElement>("#hn-prev").disabled = state.passage === 0;
  el<HTMLButtonElement>("#hn-next").disabled = state.passage === 7;
  void source();
}
function commit(next: HornState, push = true): void {
  state = validateHorn(next);
  if (push) history.pushState(null, "", `${location.pathname}${encodeHorn(state)}${location.hash}`);
  render();
}
el<HTMLFormElement>("#hn-form").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const integer = (id: string) => {
      const raw = el<HTMLInputElement>(id).value.trim();
      if (!/^-?\d{1,7}$/.test(raw)) throw new Error("Use whole-number rise and run.");
      return Number(raw);
    };
    commit({ ...state, rise: integer("#hn-rise"), run: integer("#hn-run") });
  } catch (error) {
    el("#hn-edit-status").textContent = `${errorText(error)} The applied experiment is unchanged.`;
  }
});
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-hn-preset]"))
  button.addEventListener("click", () => {
    const key = button.dataset.hnPreset;
    commit({
      ...state,
      rise: key === "tangent" ? 0 : key === "away" ? -1 : 1,
      run: key === "tiny" ? 1000000 : 4,
    });
  });
el("#hn-shallower").addEventListener("click", () => {
  if (state.rise > 0 && state.run <= 100000) commit({ ...state, run: state.run * 10 });
});
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-hn-focus]"))
  button.addEventListener("click", () =>
    commit({ ...state, focus: button.dataset.hnFocus === "foot" ? "foot" : "crossing" }),
  );
function chooseReading(passage: number): void {
  const p = hornPassages[passage];
  if (p) commit({ ...state, passage, page: p.pages[0] });
}
el("#hn-passage").addEventListener("change", () =>
  chooseReading(Number(el<HTMLSelectElement>("#hn-passage").value)),
);
el("#hn-prev").addEventListener("click", () => chooseReading(state.passage - 1));
el("#hn-next").addEventListener("click", () => chooseReading(state.passage + 1));
el("#hn-page").addEventListener("change", () =>
  commit({ ...state, page: Number(el<HTMLSelectElement>("#hn-page").value) }),
);
el("#hn-see-page").addEventListener("click", () => {
  const p = hornPassages[state.passage];
  if (!p) return;
  commit({ ...state, page: p.pages[0] });
  el("#hn-sources").scrollIntoView({ block: "start" });
  el<HTMLSelectElement>("#hn-page").focus({ preventScroll: true });
});
el("#hn-zoom").addEventListener("click", () => {
  const enlarged = el("#hn-source-scroll").classList.toggle("hn-enlarged");
  el("#hn-zoom").setAttribute("aria-pressed", String(enlarged));
  el("#hn-zoom").textContent = enlarged ? "Fit the complete page" : "Enlarge the page";
});
el<HTMLFormElement>("#hn-question").addEventListener("submit", (event) => {
  event.preventDefault();
  const answer = new FormData(el<HTMLFormElement>("#hn-question")).get("hn-answer");
  el("#hn-feedback").textContent =
    answer === "inside"
      ? "Correct. H is forward on the ray and strictly inside. The exact deficit is 1/1000000000001. The universal argument explains why every smaller positive slope also fails."
      : answer === "zero"
        ? "A positive rational slope remains positive even when its angle is invisible in the overview. The fraction certificate retains that distinction."
        : answer === "limit"
          ? "The smallest input supported by this interface is not the smallest positive slope. Use the general perpendicular argument, rather than a finite run of examples."
          : "Choose an explanation first.";
});
function download(name: string, text: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type })),
    link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
el("#hn-csv").addEventListener("click", () =>
  download("stoicheia-horn.csv", hornCsv(state), "text/csv;charset=utf-8"),
);
el("#hn-json").addEventListener("click", () =>
  download("stoicheia-horn.json", hornJson(state), "application/json"),
);
for (const kind of ["save", "svg"] as const)
  el(`#hn-${kind}`).addEventListener("click", async () => {
    const snapshot = structuredClone(state),
      button = el<HTMLButtonElement>(`#hn-${kind}`);
    button.disabled = true;
    el("#hn-save-status").textContent =
      kind === "save"
        ? "Checking six source pages, font and license…"
        : "Checking the embedded font and license…";
    try {
      download(
        `stoicheia-horn.${kind === "save" ? "html" : "svg"}`,
        kind === "save" ? await hornStudy(snapshot) : await hornSvg(snapshot),
        kind === "save" ? "text/html;charset=utf-8" : "image/svg+xml",
      );
      el("#hn-save-status").textContent =
        "Saved the applied experiment from the time of the click.";
    } catch (error) {
      el("#hn-save-status").textContent = `${errorText(error)} No file was saved.`;
    } finally {
      button.disabled = false;
    }
  });
el<HTMLInputElement>("#hn-open").addEventListener("change", async () => {
  const input = el<HTMLInputElement>("#hn-open"),
    file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 12000) throw new Error("The saved experiment is too large.");
    const next = parseHornJson(await file.text());
    commit(next);
    el("#hn-open-status").textContent = "Reopened the saved experiment, reading and source page.";
  } catch (error) {
    el("#hn-open-status").textContent = `${errorText(error)} The experiment is unchanged.`;
  } finally {
    input.value = "";
  }
});
el("#hn-share").addEventListener("click", () => {
  const url = new URL(location.href);
  url.search = encodeHorn(state);
  el("#hn-share-label").hidden = false;
  const field = el<HTMLInputElement>("#hn-share-url");
  field.value = url.href;
  field.focus();
  field.select();
});
window.addEventListener("popstate", () => {
  try {
    commit(decodeHorn(location.search), false);
  } catch (error) {
    el("#hn-address-error").textContent = `${errorText(error)} The experiment is unchanged.`;
  }
});
render();
prepareOffline(el("#hn-offline"), el<HTMLButtonElement>("#hn-reload"));
