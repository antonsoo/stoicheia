import license from "../LICENSE?raw";
import { solidPassages, solidsBoundary, solidsSourceUrl } from "./content/solids";
import {
  at,
  decodeSolids,
  encodeSolids,
  initialSolids,
  readSolidsJson,
  type SolidState,
  selectedMesh,
  solidPages,
  solidSourceFile,
  solidsCsv,
  solidsJson,
  validateSolids,
  vertexDegrees,
  vertexTrial,
} from "./core/solids";
import { escapeHtml as esc } from "./html";
import { prepareOffline } from "./offline";
import {
  inferenceReading,
  meshMetrics,
  solidConclusion,
  solidFan,
  solidsComparison,
  solidsMatrix,
  solidsVertexTable,
  tetrahedronSheet,
} from "./solids-drawing";
import { solidReading, solidsStudy } from "./solids-study";
import { studyAssetIdentity, studyBlobUrl } from "./study-assets";

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing solid element ${id}`);
  return node as T;
}
let state: SolidState = { ...initialSolids },
  notice = "",
  revision = 0;
try {
  state = decodeSolids(location.search);
} catch (e) {
  notice = `${e instanceof Error ? e.message : "Invalid link."} The starting experiment is shown.`;
}
el("app").innerHTML =
  `<header class="sl-header"><a class="sl-brand" href="./">Stoicheia<span lang="grc">ΣΤΟΙΧΕΙΑ</span></a><nav aria-label="Solid workshop navigation"><a href="./">Euclid course</a><a href="#sl-comparison">Test the face condition</a><a href="#sl-reading">Greek &amp; Latin</a><a href="#sl-evidence">Printed evidence</a></nav></header><main><section class="sl-intro"><div><p class="sl-kicker">EUCLID / THE ADDENDUM AFTER XIII.18</p><h1>Six faces.<br>Still not one of five.</h1></div><div class="sl-lead"><p>Triangles, squares, pentagons. Euclid’s angle argument leaves five uniform kinds of convex corner. But do equal regular faces alone force one of the five solids?</p><p>Test the missing turn. Join two tetrahedra. Count the corners, then inspect exactly what the Greek and Latin say.</p><p class="sl-fine">Exact angle arithmetic and modern coordinate drawings beside complete printed evidence. No prior Greek needed.</p></div></section><p class="sl-notice" id="sl-notice" role="status">${esc(notice)}</p>
<section class="sl-section" id="sl-bench" aria-labelledby="sl-title"><div class="sl-section-title"><div><p class="sl-kicker">01 / WHAT CAN MEET AT ONE POINT?</p><h2 id="sl-title" tabindex="-1">The sixth triangle<br>goes flat.</h2></div><p>Lay q equal regular faces around one vertex O. Each p-sided face contributes its interior angle. A convex corner needs at least three faces and a total strictly below one full turn.</p></div><div class="sl-bench"><div class="sl-board"><div id="sl-fan"></div><p class="sl-fine">The faces are laid in one plane, as if a corner were cut open. A gap is missing angle; overlapping faces show excess. This is an angle test, not a folding animation.</p></div><aside class="sl-controls"><div class="sl-control"><label for="sl-p">Sides on each regular face <output id="sl-p-value" for="sl-p"></output></label><input id="sl-p" type="range" min="3" max="12" step="1"/></div><div class="sl-control"><label for="sl-q">Faces meeting at O <output id="sl-q-value" for="sl-q"></output></label><input id="sl-q" type="range" min="2" max="8" step="1"/></div><p class="sl-equation" id="sl-equation"></p><p id="sl-result" class="sl-result" role="status"></p><div class="sl-actions"><button type="button" data-sl-case="3,5">Five triangles</button><button type="button" data-sl-case="3,6">Add the sixth</button><button type="button" data-sl-case="5,4">Four pentagons</button></div><p class="sl-fine">The deficit is 360° minus the sum of plane face angles. It is neither a dihedral angle nor a measurement in steradians.</p></aside></div>
<details><summary>Account for every surviving uniform pair</summary><div class="sl-table-wrap" tabindex="0" role="region" aria-label="Scrollable uniform vertex cases">${solidsMatrix()}</div><p>For p ≥ 6 every regular face angle is at least 120°. With q ≥ 3 the sum is at least 360°, so no larger p can survive. Increasing q only increases the sum. The five highlighted pairs exhaust the local possibilities under these conditions.</p><p>Passing this necessary condition does not construct a complete solid. The coordinate examples below demonstrate existence for those five pairs; they do not reproduce XIII.13–17 or prove global uniqueness.</p></details></section>
<section class="sl-section" id="sl-comparison" aria-labelledby="sl-compare-title"><div class="sl-section-title"><div><p class="sl-kicker">02 / KEEP THE FACES. CHANGE THE CORNERS.</p><h2 id="sl-compare-title">Two tetrahedra.<br>One hidden face pair.</h2></div><p>Join two regular tetrahedra along a triangular base, with their tips on opposite sides. The bases become internal. The outside has six equal equilateral triangles. Select a tip and a belt vertex: do they have the same kind of corner?</p></div><div id="sl-models"></div><div class="sl-view-controls"><div class="sl-control"><label for="sl-yaw">Turn both drawings <output id="sl-yaw-value"></output></label><input id="sl-yaw" type="range" min="-180" max="180" step="1"/></div><div class="sl-control"><label for="sl-pitch">Tilt both drawings <output id="sl-pitch-value"></output></label><input id="sl-pitch" type="range" min="-70" max="70" step="1"/></div><div><label for="sl-example">Inspect vertices in</label><select id="sl-example"><option value="uniform">The uniform example</option><option value="bipyramid">The joined tetrahedra</option></select><label for="sl-vertex">Selected vertex</label><select id="sl-vertex"></select></div></div><div class="sl-actions sl-select-vertex"><button type="button" id="sl-tip">Inspect a tip</button><button type="button" id="sl-belt">Inspect a belt vertex</button><button type="button" id="sl-view-reset">Restore the view</button></div><p id="sl-vertex-result" class="sl-result" role="status"></p><div class="sl-contrast"><div><h3>Same faces does not mean same vertices.</h3><p>The bipyramid’s two tips each meet three triangles: 180° in total. Its three belt vertices each meet four: 240°. Every corner is convex, but the corner type changes across the object.</p><p>Our five-case classification therefore names its extra condition: <strong>the same number of faces at every vertex</strong>, as well as congruent regular faces and a closed convex solid. The printed opening sentence names the faces; it does not state this vertex condition separately.</p><p class="sl-fine">The joined-tetrahedra comparison is modern. It examines which conditions suffice mathematically; it does not settle the ancient author’s intent, attribution or the textual history of the addendum.</p></div><div class="sl-checks"><p><strong>Both examples:</strong> congruent regular faces, closed boundary, convex corners.</p><p><strong>The five regular examples:</strong> one common p and one common q.</p><p><strong>The bipyramid:</strong> p = 3 everywhere; q changes between 3 and 4. Six outside faces, nine edges, five vertices.</p><p>Blue marks the selected vertex’s incident faces. Each drawing first faces its highlighted vertex, then applies your turn and tilt. The rust marker remains visible through the solid.</p></div></div><details><summary>Count the actual faces and vertices</summary><div id="sl-incidences" class="sl-table-wrap" tabindex="0" role="region" aria-label="Selected model vertex measurements"></div><p id="sl-metrics" class="sl-fine"></p><div id="sl-inference" class="sl-table-wrap" tabindex="0" role="region" aria-label="Conditional and actual solid counts"></div></details></section>
<section class="sl-section" id="sl-reading" aria-labelledby="sl-read-title"><div class="sl-section-title"><div><p class="sl-kicker">03 / WHAT THE SENTENCE REQUIRES</p><h2 id="sl-read-title">Read the conditions.</h2></div><p>Selected Greek, Heiberg’s Latin and new English. “Five figures” and “three triangles” count different things. Each selection keeps its source location and a contextual word note.</p></div><div class="sl-reading-nav"><label for="sl-reading-select">Passage<select id="sl-reading-select">${solidPassages.map((p, i) => `<option value="${i}">${i + 1}. ${esc(p.title)}</option>`).join("")}</select></label></div><div id="sl-reading-text"></div><div class="sl-actions"><button type="button" id="sl-greek-page">Inspect this Greek page</button><button type="button" id="sl-latin-page">Inspect this Latin page</button><button type="button" id="sl-continuation" hidden>Inspect the Latin continuation</button></div></section>
<section class="sl-section" id="sl-evidence" aria-labelledby="sl-evidence-title"><div class="sl-section-title"><div><p class="sl-kicker">04 / LEAVE THE APPARATUS IN VIEW</p><h2 id="sl-evidence-title">A whole page.<br>A visible boundary.</h2></div><p>Heiberg, <cite>Euclidis Elementa</cite>, volume IV, 1885. The final addendum begins after a divider on pp.336–337. XI.21’s proof and the Latin editor’s extension note on p.59 are retained too. Source bytes are verified before display or export.</p></div><div class="sl-source-layout"><div class="sl-source-controls"><label for="sl-page">Complete page</label><select id="sl-page">${solidPages.map((p) => `<option value="${p}">${p === 0 ? "1885 volume IV title" : `${p % 2 ? "Latin" : "Greek"} · printed p.${p}`}</option>`).join("")}</select><p id="sl-source-status" class="sl-status" role="status"></p><div class="sl-actions"><button type="button" id="sl-source-retry">Retry page</button><button type="button" id="sl-zoom">Enlarge page</button></div><p class="sl-fine">Whole unretouched pages, reduced to a 2200 px long edge. Selected readings join lines and normalize theta glyphs; punctuation is lightly regularized. Source images retain the original markings, notes and apparatus. New English and language notes have not had independent philological review.</p><p class="sl-fine">${esc(solidsBoundary)}</p><a href="${solidsSourceUrl}">Complete original volume</a></div><div class="sl-source-box"><div id="sl-source-placeholder" class="sl-source-placeholder">Loading complete page…</div><img id="sl-source-image" class="sl-source-image" alt="" hidden/></div></div></section>
<section class="sl-section" id="sl-keep" aria-labelledby="sl-keep-title"><div class="sl-section-title"><div><p class="sl-kicker">05 / TAKE THE QUESTION WITH YOU</p><h2 id="sl-keep-title">Keep the evidence.<br>Build the counterexample.</h2></div><p>Keep your settings, exact angle enumeration or an illustrated reading with both models, all nine passages, all fifteen pages, fonts and licenses. The script-free reading opens and prints offline. A separate A4 sheet supplies two 40 mm tetrahedron nets: tape their edges, then put the marked bases together.</p></div><div class="sl-downloads"><button type="button" data-sl-save="json">Save editable JSON</button><button type="button" data-sl-save="csv">Save exact angle CSV</button><button type="button" data-sl-save="svg">Save tetrahedron cutting sheet</button><button type="button" data-sl-save="html">Save illustrated reading</button></div><p class="sl-fine">The CSV enumerates all 70 supported p/q choices; it is not a learner action history. The cutting sheet has a 50 mm calibration bar. Use 100% print scale. Dimensions are software-verified; physical printing and assembly are unverified.</p><label class="sl-import-label" for="sl-open">Reopen editable JSON<input id="sl-open" type="file" accept=".json,application/json"/></label><div class="sl-actions"><button type="button" id="sl-copy">Copy experiment link</button></div><label class="sl-share" id="sl-share-label" hidden>Experiment link<input id="sl-share" readonly/></label><p id="sl-save-status" class="sl-status" role="status"></p></section></main><footer class="sl-footer"><a href="./">Stoicheia · read and construct Euclid</a><span id="sl-offline" role="status">Preparing offline edition…</span><button type="button" id="sl-reload" hidden>Reload saved edition</button><a href="https://github.com/antonsoo/stoicheia">Source &amp; MIT license</a></footer><dialog id="sl-dialog" class="sl-dialog" aria-label="Enlarged source page"><header><p>Whole source page · Tab into the image region and use arrow keys to pan.</p><button type="button" id="sl-close">Close</button></header><div class="sl-source-viewport" id="sl-source-viewport" tabindex="0" role="region" aria-label="Scrollable enlarged source"><img id="sl-enlarged" alt=""/></div></dialog>`;

let sourceRevision = 0,
  sourceUrl = "",
  requestedPage: number | null = null;
async function showSource(force = false) {
  if (!force && requestedPage === state.page) return;
  requestedPage = state.page;
  const page = state.page,
    version = ++sourceRevision;
  el<HTMLDialogElement>("sl-dialog").close();
  el("sl-source-image").hidden = true;
  el("sl-source-placeholder").hidden = false;
  el("sl-source-placeholder").textContent = "Loading complete page…";
  el("sl-source-status").textContent = "Checking this edition’s complete page…";
  el<HTMLButtonElement>("sl-zoom").disabled = true;
  try {
    const file = solidSourceFile(page),
      url = await studyBlobUrl(file, "image/jpeg");
    if (version !== sourceRevision) {
      URL.revokeObjectURL(url);
      return;
    }
    // Keep the displayed element out of a candidate's decode lifecycle. Firefox
    // can reject decode() when a reused image changes sources in quick succession.
    const image = new Image();
    image.id = "sl-source-image";
    image.className = "sl-source-image";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("The verified source image could not be displayed. Retry the page."));
      image.src = url;
    }).catch((error) => {
      URL.revokeObjectURL(url);
      throw error;
    });
    if (version !== sourceRevision) {
      URL.revokeObjectURL(url);
      return;
    }
    URL.revokeObjectURL(sourceUrl);
    sourceUrl = url;
    image.alt = `Complete ${page ? `printed ${page % 2 ? "Latin" : "Greek"} page ${page}` : "1885 title page"}, including original markings and apparatus.`;
    image.hidden = false;
    image.addEventListener("click", zoom);
    el("sl-source-image").replaceWith(image);
    el("sl-source-placeholder").hidden = true;
    el("sl-source-status").textContent =
      `Verified complete page · ${page ? `printed p.${page}, PDF p.${page + 10}` : "title, PDF p.7"} · SHA-256 ${studyAssetIdentity(file).sha256}`;
    el<HTMLButtonElement>("sl-zoom").disabled = false;
  } catch (e) {
    if (version !== sourceRevision) return;
    el("sl-source-status").textContent =
      e instanceof Error ? e.message : "Could not read this page.";
    el("sl-source-placeholder").textContent =
      "Page unavailable. Retry after reconnecting or reloading the matching edition.";
  }
}
function render() {
  const t = vertexTrial(state.p, state.q),
    m = selectedMesh(state);
  for (const k of ["p", "q", "yaw", "pitch"] as const) {
    el<HTMLInputElement>(`sl-${k}`).value = String(state[k]);
    el(`sl-${k}-value`).textContent = String(state[k]) + (k === "yaw" || k === "pitch" ? "°" : "");
  }
  el("sl-fan").innerHTML = solidFan(state.p, state.q);
  el("sl-equation").textContent = `${state.q} × ${t.angle}° = ${t.sum}°`;
  el("sl-result").textContent = solidConclusion(state.p, state.q);
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-sl-case]"))
    b.setAttribute("aria-pressed", String(b.dataset.slCase === `${state.p},${state.q}`));
  el("sl-models").innerHTML = solidsComparison(state);
  el<HTMLSelectElement>("sl-example").value = state.example;
  el<HTMLSelectElement>("sl-vertex").innerHTML = m
    ? m.vertices
        .map(
          (_, i) =>
            `<option value="${i}" ${i === state.vertex ? "selected" : ""}>Vertex ${i + 1} · ${vertexDegrees(m)[i]} faces</option>`,
        )
        .join("")
    : "<option>No convex uniform model</option>";
  el<HTMLSelectElement>("sl-vertex").disabled = !m;
  if (m) {
    const q = at(vertexDegrees(m), state.vertex),
      v = vertexTrial(at(m.faces, 0).length, q);
    el("sl-vertex-result").textContent =
      `${m.name} · vertex ${state.vertex + 1}: ${q} faces × ${v.angle}° = ${v.sum}°. Deficit ${v.deficit}°.`;
    el("sl-incidences").innerHTML = solidsVertexTable(m);
    el("sl-metrics").textContent = meshMetrics(m);
    el("sl-inference").innerHTML = inferenceReading(m, state.vertex);
  } else {
    el("sl-vertex-result").textContent =
      "This uniform p/q choice cannot form the required convex corner. Inspect the joined tetrahedra or change p and q.";
    el("sl-incidences").textContent = "No complete uniform model for this choice.";
    el("sl-metrics").textContent = "";
    el("sl-inference").textContent = "";
  }
  el<HTMLSelectElement>("sl-reading-select").value = String(state.reading);
  el("sl-reading-text").innerHTML = solidReading(state.reading);
  el("sl-continuation").hidden = !at(solidPassages, state.reading).latinContinuation;
  el<HTMLSelectElement>("sl-page").value = String(state.page);
  el("sl-share-label").hidden = true;
  void showSource();
}
function change(patch: Partial<SolidState>) {
  state = validateSolids({ ...state, ...patch });
  revision++;
  render();
  history.pushState(null, "", `${location.pathname}${encodeSolids(state)}${location.hash}`);
}
document.addEventListener("click", (event) => {
  const target = (event.target as Element).closest<HTMLButtonElement>("[data-sl-case]");
  if (target) {
    const raw = target.dataset.slCase;
    if (!raw) return;
    const pair = raw.split(",").map(Number);
    change({ p: at(pair, 0), q: at(pair, 1), vertex: 0, example: "uniform" });
  }
});
for (const k of ["p", "q", "yaw", "pitch"] as const)
  el<HTMLInputElement>(`sl-${k}`).addEventListener("input", () =>
    change({
      [k]: Number(el<HTMLInputElement>(`sl-${k}`).value),
      ...(k === "p" || k === "q" ? { vertex: 0, example: "uniform" as const } : {}),
    }),
  );
el("sl-example").addEventListener("change", () =>
  change({
    example: el<HTMLSelectElement>("sl-example").value as SolidState["example"],
    vertex: 0,
  }),
);
el("sl-vertex").addEventListener("change", () =>
  change({ vertex: Number(el<HTMLSelectElement>("sl-vertex").value) }),
);
el("sl-tip").addEventListener("click", () => change({ example: "bipyramid", vertex: 0 }));
el("sl-belt").addEventListener("click", () => change({ example: "bipyramid", vertex: 2 }));
el("sl-view-reset").addEventListener("click", () => change({ yaw: 25, pitch: 15 }));
el("sl-reading-select").addEventListener("change", () => {
  const reading = Number(el<HTMLSelectElement>("sl-reading-select").value);
  change({ reading, page: at(solidPassages, reading).pages[0] });
});
for (const [id, index] of [
  ["sl-greek-page", 0],
  ["sl-latin-page", 1],
] as const)
  el(id).addEventListener("click", () => {
    change({ page: at(solidPassages, state.reading).pages[index] });
    el("sl-evidence").scrollIntoView({ block: "start" });
    el("sl-page").focus({ preventScroll: true });
  });
el("sl-continuation").addEventListener("click", () => {
  const page = at(solidPassages, state.reading).latinContinuation;
  if (page === undefined) return;
  change({ page });
  el("sl-evidence").scrollIntoView({ block: "start" });
  el("sl-page").focus({ preventScroll: true });
});
el("sl-page").addEventListener("change", () =>
  change({ page: Number(el<HTMLSelectElement>("sl-page").value) }),
);
el("sl-source-retry").addEventListener("click", () => void showSource(true));
function zoom() {
  if (!sourceUrl || el("sl-source-image").hidden) return;
  const im = el<HTMLImageElement>("sl-enlarged");
  im.src = sourceUrl;
  im.alt = el<HTMLImageElement>("sl-source-image").alt;
  el<HTMLDialogElement>("sl-dialog").showModal();
  el("sl-source-viewport").scrollTo(0, 0);
  el("sl-source-viewport").focus();
}
el("sl-zoom").addEventListener("click", zoom);
el("sl-source-image").addEventListener("click", zoom);
el("sl-close").addEventListener("click", () => el<HTMLDialogElement>("sl-dialog").close());
let downloadUrl = "",
  saveBusy = false;
function download(body: string, type: string, name: string) {
  URL.revokeObjectURL(downloadUrl);
  downloadUrl = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
}
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-sl-save]"))
  b.addEventListener("click", async () => {
    if (saveBusy) return;
    saveBusy = true;
    const s = { ...state },
      kind = b.dataset.slSave ?? "";
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-sl-save]"))
      button.disabled = true;
    el("sl-save-status").textContent =
      kind === "html"
        ? "Verifying fifteen pages and the font for this captured experiment…"
        : "Preparing download…";
    try {
      const body =
        kind === "html"
          ? await solidsStudy(s)
          : kind === "json"
            ? solidsJson(s)
            : kind === "csv"
              ? solidsCsv(s)
              : tetrahedronSheet(license);
      download(
        body,
        { html: "text/html", json: "application/json", csv: "text/csv", svg: "image/svg+xml" }[
          kind
        ] ?? "text/plain",
        `stoicheia-${kind === "svg" ? "two-tetrahedra" : "solids"}.${kind}`,
      );
      el("sl-save-status").textContent =
        "Download prepared from the settings at the time you pressed Save.";
    } catch (e) {
      el("sl-save-status").textContent =
        e instanceof Error ? e.message : "Could not prepare the reading. Retry after reconnecting.";
    } finally {
      saveBusy = false;
      for (const button of document.querySelectorAll<HTMLButtonElement>("[data-sl-save]"))
        button.disabled = false;
    }
  });
el<HTMLInputElement>("sl-open").addEventListener("change", async () => {
  const input = el<HTMLInputElement>("sl-open"),
    file = input.files?.[0];
  if (!file) return;
  const version = ++revision;
  try {
    if (file.size > 12000) throw new Error("This experiment is too large (limit 12 KB).");
    const text = await file.text();
    if (version !== revision) {
      el("sl-save-status").textContent =
        "Newer settings were kept; the earlier file read was ignored.";
      return;
    }
    const opened = readSolidsJson(text);
    change(opened);
    el("sl-save-status").textContent = "Saved experiment reopened.";
  } catch (e) {
    if (version === revision)
      el("sl-save-status").textContent =
        e instanceof Error
          ? e.message
          : "Could not reopen this experiment. Your settings are retained.";
  } finally {
    input.value = "";
  }
});
el("sl-copy").addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}${encodeSolids(state)}#sl-bench`;
  el("sl-share-label").hidden = false;
  el<HTMLInputElement>("sl-share").value = url;
  try {
    await navigator.clipboard.writeText(url);
    el("sl-save-status").textContent = "Experiment link copied.";
  } catch {
    el<HTMLInputElement>("sl-share").select();
    el("sl-save-status").textContent = "Select and copy the experiment link.";
  }
});
addEventListener("popstate", () => {
  try {
    state = decodeSolids(location.search);
    revision++;
    render();
    el("sl-notice").textContent = "";
  } catch (e) {
    el("sl-notice").textContent = e instanceof Error ? e.message : "Could not restore this link.";
  }
});
addEventListener("pagehide", (event) => {
  if (event.persisted) return;
  sourceRevision++;
  URL.revokeObjectURL(sourceUrl);
  URL.revokeObjectURL(downloadUrl);
});
render();
prepareOffline(el("sl-offline"), el<HTMLButtonElement>("sl-reload"));
