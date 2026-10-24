import {
  type DeskAction,
  type DeskSession,
  decodeDesk,
  deskActionText,
  deskCrossings,
  deskGivens,
  deskHint,
  deskLimit,
  deskPoint,
  deskProof,
  encodeDesk,
  freshDesk,
  nearbyPoint,
  parseDesk,
  replayDesk,
} from "./core/desk";
import { distance } from "./core/geometry";
import { deskDrawing, deskProofHtml } from "./desk-drawing";
import { deskPages, deskSourceReading, deskStudy, deskSvg } from "./desk-study";
import { escapeHtml as esc } from "./html";
import { prepareOffline } from "./offline";

function el<T extends Element = HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing desk element: ${selector}`);
  return node;
}
let session = freshDesk(),
  cursor = 0,
  tool: "circle" | "line" | "meet" = "circle";
let first = "A",
  second = "B",
  pointTurn: "first" | "second" = "first";
let hintShown = false,
  busy = false;
let initialError = "";
try {
  session = decodeDesk(location.hash);
  cursor = session.actions.length;
} catch (error) {
  initialError = error instanceof Error ? error.message : "Could not read drawing link.";
}
const layouts = new Map<string, { session: DeskSession; cursor: number }>();
const current = (): DeskSession => ({ ...session, actions: session.actions.slice(0, cursor) });
const scene = () => replayDesk(current());
el("#app").innerHTML = `
<header class="dk-header"><a class="dk-brand" href="./">Stoicheia</a><nav aria-label="Construction navigation"><a href="./#p=2&s=0">I.2 in the course</a><a href="#reading">Read the commands</a><a href="#evidence">Printed evidence</a></nav></header>
<main><section class="dk-intro"><h1>Make the construction.<br>Keep the reasons.</h1><div><p class="dk-lead">At A, place a straight line equal to the detached BC.</p><p>A circle must start at a point you already have and pass through another. You can use BC at B, where it is given. How will you carry its length to A?</p><p class="dk-note">Euclid I.2 · A modern desk for a restricted compass operation. This is not a claim about an ancient physical instrument.</p></div></section>
<section class="dk-layout" aria-label="Your construction desk"><div class="dk-board" id="dk-board" tabindex="-1"><a class="dk-mobile-link" href="#dk-tools">Back to the instruments</a><div class="dk-board-top"><p id="dk-count"></p><label><input type="checkbox" id="dk-circles" checked/> Show full circles</label></div><div id="dk-drawing"></div><p id="dk-status" class="dk-status" role="status"></p></div>
<aside class="dk-tools" id="dk-tools" tabindex="-1"><h2>Choose an operation</h2><div class="dk-tool-buttons" aria-label="Instruments"><button type="button" data-tool="circle" aria-pressed="true">Circle</button><button type="button" data-tool="line" aria-pressed="false">Line</button><button type="button" data-tool="meet" aria-pressed="false">Crossing</button></div><form id="dk-operation"><div id="dk-fields"></div><div id="dk-submit"></div></form><p class="dk-note dk-tool-note" id="dk-tool-note"></p><a class="dk-mobile-link" href="#dk-board">Inspect the drawing</a><div class="dk-hint"><button type="button" id="dk-hint-toggle" aria-expanded="false">Ask for the next command</button><div id="dk-hint" hidden><p id="dk-hint-text"></p><button type="button" id="dk-load-hint">Set up this operation</button></div></div></aside></section>
<section class="dk-history" aria-label="Construction history"><div class="dk-history-bar"><button type="button" id="dk-undo">Undo</button><button type="button" id="dk-redo">Redo</button><button type="button" id="dk-start">Review the givens</button><p id="dk-position"></p></div><details class="dk-transcript"><summary>Your operation transcript <span id="dk-transcript-count"></span></summary><ol id="dk-transcript"></ol></details></section>
<section class="dk-proof" aria-label="Examine the equality"><div id="dk-proof"></div><aside class="dk-measure"><h3>Inspect a length from A</h3><label for="dk-measure-point">Candidate endpoint</label><select id="dk-measure-point"></select><p id="dk-measurements"></p><p class="dk-note">Arbitrary drawing units. Rounded measurements can suggest an equality; they do not supply its proof.</p></aside></section>
<section class="dk-files" aria-label="Keep your work"><h2>Keep your choices</h2><p>The drawing stays in this tab and in its share link. Save a JSON file to resume it later, or an illustrated reading with every intermediate diagram and all four source pages.</p><label for="dk-layout">Given layout (each keeps its own work in this tab)</label><select id="dk-layout">${deskGivens.map((g) => `<option value="${g.id}">${g.title}</option>`).join("")}</select><div class="dk-file-actions"><button type="button" id="dk-share">Make a share link</button><button type="button" id="dk-json">Save drawing JSON</button><button type="button" id="dk-svg">Save drawing SVG</button><button type="button" id="dk-study">Save illustrated reading</button><label class="dk-import" for="dk-import">Open drawing JSON<input id="dk-import" type="file" accept="application/json,.json"/></label></div><label for="dk-share-link" id="dk-share-label" hidden>Link to this operation</label><input id="dk-share-link" type="url" readonly hidden/><p id="dk-file-status" role="status"></p></section>
<section class="dk-reading" id="reading">${deskSourceReading()}</section>
<section class="dk-evidence" id="evidence"><h2>The complete printed pages</h2><p>Heiberg’s 1883 edition, pp.12–15. The apparatus and adjacent I.1/I.3 material remain visible. <a href="./sources/manifest.json">Image identities and transcription conventions</a>.</p><div class="dk-source-controls" aria-label="Source pages">${deskPages.map((p) => `<button type="button" data-page="${p}" aria-pressed="${p === 12}">p.${p} · ${p % 2 ? "Latin" : "Greek"}</button>`).join("")}</div><figure class="dk-scan"><figcaption id="dk-scan-caption">Printed page 12 · Greek</figcaption><img id="dk-scan" src="${import.meta.env.BASE_URL}sources/heiberg-012.jpg" width="987" height="1550" loading="lazy" alt="Complete Greek page 12, including I.2's opening and the critical apparatus"/></figure></section></main>
<footer class="dk-footer"><a href="./#p=2&s=8">Return to the equal-remainder argument</a><span><span id="dk-offline" role="status">Preparing offline edition…</span> <button type="button" id="dk-reload" hidden>Reload saved edition</button></span></footer>`;

// In-page reading/navigation must not replace the drawing encoded in the URL.
for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
  link.addEventListener("click", (event) => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ block: "start" });
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
}

function status(message: string): void {
  el("#dk-status").textContent = message;
}
function updateHash(): void {
  history.replaceState(null, "", `${location.pathname}${location.search}${encodeDesk(current())}`);
}
function operands(): string[] {
  const s = scene();
  return tool === "meet" ? s.curves.map((c) => c.id) : s.points.map((p) => p.id);
}
function describe(id: string): string {
  const c = scene().curves.find((c) => c.id === id);
  if (!c) return id;
  return c.kind === "circle"
    ? `${c.id} · centre ${c.center}, through ${c.through}`
    : `${c.id} · line ${c.a}–${c.b}`;
}
function normalizeOperands(): void {
  const available = operands();
  if (!available.includes(first)) first = available[0] ?? "";
  if (!available.includes(second) || first === second)
    second = available.find((id) => id !== first) ?? "";
}
function renderFields(): void {
  normalizeOperands();
  const ids = operands();
  const field = (which: string, label: string, value: string) =>
    `<div class="dk-field"><label for="dk-${which}">${label}</label><select id="dk-${which}"${ids.length ? "" : " disabled"}>${ids.length ? ids.map((id) => `<option value="${id}"${id === value ? " selected" : ""}>${esc(describe(id))}</option>`).join("") : '<option value="">Draw two curves first</option>'}</select></div>`;
  el("#dk-fields").innerHTML =
    field(
      "first",
      tool === "circle" ? "Centre" : tool === "line" ? "First point" : "First curve",
      first,
    ) +
    field(
      "second",
      tool === "circle" ? "Through point" : tool === "line" ? "Second point" : "Second curve",
      second,
    );
  el("#dk-tool-note").textContent =
    tool === "circle"
      ? "Postulate 3, restricted here: centre and through-point must already exist. Tap two points on the drawing, or choose them above."
      : tool === "line"
        ? "Postulates 1 and 2 together: join the points, then continue both ways. Dashed parts show the continuation; the straightedge does not measure."
        : "Choose two existing curves. The numbered marks are possible crossings; a point becomes available only when you keep it. Native selectors also work with a keyboard.";
  for (const which of ["first", "second"] as const) {
    el<HTMLSelectElement>(`#dk-${which}`).addEventListener("change", (event) => {
      const value = (event.target as HTMLSelectElement).value;
      if (which === "first") first = value;
      else second = value;
      pointTurn = which === "first" ? "second" : "first";
      renderDrawing();
    });
  }
  renderDrawing();
}
function renderDrawing(): void {
  const s = scene();
  let candidates: ReturnType<typeof deskCrossings>["points"] = [],
    note = "";
  if (tool === "meet" && first && second) {
    const result = deskCrossings(s, first, second);
    candidates = result.points;
    note = result.note;
  }
  el("#dk-drawing").innerHTML = deskDrawing(s, {
    interactive: true,
    candidates,
    selected: [first, second],
    circles: el<HTMLInputElement>("#dk-circles").checked,
    compact: innerWidth <= 650,
  });
  const limit = cursor >= deskLimit;
  el("#dk-submit").innerHTML =
    tool === "meet"
      ? `<p class="dk-note">${esc(note || "Draw two curves before choosing their crossing.")}</p>${candidates
          .map((at, branch) => {
            const existing = nearbyPoint(s, at);
            return `<button type="button" class="dk-keep" data-keep="${branch}"${existing || limit ? " disabled" : ""}>${existing ? `Crossing ${branch + 1} is already ${existing.id}` : `Keep crossing ${branch + 1}`}</button>`;
          })
          .join("")}`
      : `<button type="submit" class="dk-primary" id="dk-draw"${first === second || !first || !second || limit ? " disabled" : ""}>${tool === "circle" ? `Draw circle at ${esc(first)} through ${esc(second)}` : `Draw line ${esc(first)}–${esc(second)}`}</button>`;
  el("#dk-count").textContent = `${s.points.length} points · ${s.curves.length} curves`;
}
function measure(): void {
  const s = scene(),
    id = el<HTMLSelectElement>("#dk-measure-point").value;
  if (!id) {
    el("#dk-measurements").textContent = "Keep a new point to inspect its distance from A.";
    return;
  }
  const target = distance(deskPoint(s, "B"), deskPoint(s, "C")),
    candidate = distance(deskPoint(s, "A"), deskPoint(s, id));
  el("#dk-measurements").textContent =
    `A–${id}: ${candidate.toFixed(6)}. Given BC: ${target.toFixed(6)}. Difference: ${(candidate - target).toFixed(6)}. These are measurements, not a proof verdict.`;
}
function render(): void {
  const s = scene();
  el<HTMLSelectElement>("#dk-layout").value = session.given;
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-tool]"))
    button.setAttribute("aria-pressed", String(button.dataset.tool === tool));
  el<HTMLButtonElement>("#dk-undo").disabled = cursor === 0;
  el<HTMLButtonElement>("#dk-redo").disabled = cursor === session.actions.length;
  el<HTMLButtonElement>("#dk-start").disabled = cursor === 0;
  el("#dk-position").textContent =
    `Operation ${cursor} of ${session.actions.length}${cursor < session.actions.length ? " · future operations remain under Redo" : ""}`;
  el("#dk-transcript-count").textContent = `(${session.actions.length})`;
  el("#dk-transcript").innerHTML =
    session.actions
      .map(
        (a, i) =>
          `<li${i >= cursor ? ' class="dk-future"' : ""}><button type="button" data-review="${i + 1}"${cursor === i + 1 ? ' aria-current="step"' : ""}>${esc(deskActionText(a))}</button></li>`,
      )
      .join("") || "<li>No operations yet.</li>";
  el("#dk-proof").innerHTML = deskProofHtml(s);
  const oldEndpoint = deskProof(s)?.l ?? el<HTMLSelectElement>("#dk-measure-point").value;
  const points = s.points.filter((p) => p.id !== "A");
  el("#dk-measure-point").innerHTML = points
    .map((p) => `<option value="${p.id}">${p.id}</option>`)
    .join("");
  el<HTMLSelectElement>("#dk-measure-point").value = points.some((p) => p.id === oldEndpoint)
    ? oldEndpoint
    : (points.at(-1)?.id ?? "");
  measure();
  renderFields();
  const hint = deskHint(s);
  el("#dk-hint").hidden = !hintShown;
  el("#dk-hint-text").textContent = hint.text;
  el<HTMLButtonElement>("#dk-load-hint").hidden = !hint.action;
  el("#dk-hint-toggle").setAttribute("aria-expanded", String(hintShown));
}
function commit(action: DeskAction): void {
  try {
    const next = { ...current(), actions: [...current().actions, action] };
    replayDesk(next);
    session = next;
    cursor = session.actions.length;
    render();
    updateHash();
    status(
      `${deskActionText(action)}. ${action.kind === "meet" ? `Point P${scene().points.length - 3} is now available.` : "Added to your drawing."}`,
    );
    if (action.kind !== "meet") el<HTMLButtonElement>("#dk-draw").focus({ preventScroll: true });
    else el<HTMLButtonElement>('[data-tool="circle"]').focus({ preventScroll: true });
  } catch (error) {
    status(error instanceof Error ? error.message : "The operation could not be added.");
  }
}
el("#dk-operation").addEventListener("submit", (event) => {
  event.preventDefault();
  if (tool === "circle") commit({ kind: "circle", center: first, through: second });
  if (tool === "line") commit({ kind: "line", a: first, b: second });
});
el("#dk-submit").addEventListener("click", (event) => {
  const branch = (event.target as Element).closest<HTMLButtonElement>("[data-keep]")?.dataset.keep;
  if (branch !== undefined) commit({ kind: "meet", first, second, branch: Number(branch) });
});
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-tool]"))
  button.addEventListener("click", () => {
    tool = button.dataset.tool as typeof tool;
    pointTurn = "first";
    render();
    status("");
  });
function choose(target: Element): void {
  const branch = target.closest<SVGElement>("[data-branch]")?.dataset.branch;
  if (branch !== undefined) {
    commit({ kind: "meet", first, second, branch: Number(branch) });
    return;
  }
  const id = target.closest<SVGElement>("[data-choose]")?.dataset.choose;
  if (!id) return;
  if (!operands().includes(id)) {
    status(
      tool === "meet"
        ? "Choose a curve, or use the two curve selectors."
        : "Choose a point, or use the two point selectors.",
    );
    return;
  }
  if (pointTurn === "first") first = id;
  else second = id;
  pointTurn = pointTurn === "first" ? "second" : "first";
  el<HTMLSelectElement>("#dk-first").value = first;
  el<HTMLSelectElement>("#dk-second").value = second;
  renderDrawing();
  status(
    `${id} selected. ${pointTurn === "second" ? "Choose the second operand." : "Both choices set; use Draw or Keep."}`,
  );
}
el("#dk-drawing").addEventListener("click", (event) => choose(event.target as Element));
el("#dk-drawing").addEventListener("keydown", (event) => {
  if (event instanceof KeyboardEvent && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    choose(event.target as Element);
  }
});
function review(index: number): void {
  cursor = index;
  render();
  updateHash();
  status(
    `Reviewing operation ${cursor}. A new operation here replaces the future branch; Redo keeps it available until then.`,
  );
}
el("#dk-undo").addEventListener("click", () => review(Math.max(0, cursor - 1)));
el("#dk-redo").addEventListener("click", () =>
  review(Math.min(session.actions.length, cursor + 1)),
);
el("#dk-start").addEventListener("click", () => review(0));
el("#dk-transcript").addEventListener("click", (event) => {
  const value = (event.target as Element).closest<HTMLButtonElement>("[data-review]")?.dataset
    .review;
  if (value) review(Number(value));
});
el("#dk-hint-toggle").addEventListener("click", () => {
  hintShown = !hintShown;
  render();
});
el("#dk-load-hint").addEventListener("click", () => {
  const action = deskHint(scene()).action;
  if (!action) return;
  tool = action.kind;
  if (action.kind === "circle") {
    first = action.center;
    second = action.through;
  } else if (action.kind === "line") {
    first = action.a;
    second = action.b;
  } else {
    first = action.first;
    second = action.second;
  }
  render();
  status("Operation set up. Inspect the operands and crossings, then draw or keep it yourself.");
  el<HTMLSelectElement>("#dk-first").focus({ preventScroll: true });
});
el("#dk-circles").addEventListener("change", renderDrawing);
el("#dk-measure-point").addEventListener("change", measure);
el<HTMLSelectElement>("#dk-layout").addEventListener("change", (event) => {
  layouts.set(session.given, { session, cursor });
  const given = (event.target as HTMLSelectElement).value,
    saved = layouts.get(given);
  session = saved?.session ?? freshDesk(given);
  cursor = saved?.cursor ?? 0;
  render();
  updateHash();
  status("Layout changed. Your other layouts remain available in this tab.");
});
function download(name: string, type: string, data: string): void {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
el("#dk-json").addEventListener("click", () =>
  download("stoicheia-construction.json", "application/json", JSON.stringify(current(), null, 2)),
);
el("#dk-svg").addEventListener("click", () =>
  download("stoicheia-construction.svg", "image/svg+xml", deskSvg(current())),
);
el("#dk-study").addEventListener("click", async () => {
  if (busy) return;
  busy = true;
  el<HTMLButtonElement>("#dk-study").disabled = true;
  el("#dk-file-status").textContent =
    "Checking and embedding the source pages, font and your complete transcript…";
  const snapshot = structuredClone(current());
  try {
    download("stoicheia-construction-reading.html", "text/html", await deskStudy(snapshot));
    el("#dk-file-status").textContent =
      "Saved the construction selected when you pressed Save, with all intermediate diagrams and four complete source pages.";
  } catch (error) {
    el("#dk-file-status").textContent =
      error instanceof Error
        ? error.message
        : "Could not save the reading. Reconnect and try again.";
  } finally {
    busy = false;
    el<HTMLButtonElement>("#dk-study").disabled = false;
  }
});
el<HTMLInputElement>("#dk-import").addEventListener("change", async (event) => {
  const input = event.target as HTMLInputElement,
    file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 16000) throw new Error("Drawing JSON must be at most 16,000 bytes.");
    const imported = parseDesk(await file.text());
    layouts.set(session.given, { session, cursor });
    session = imported;
    cursor = session.actions.length;
    render();
    updateHash();
    el("#dk-file-status").textContent =
      `Opened ${cursor} validated operations. All coordinates were rebuilt from their dependencies.`;
  } catch (error) {
    el("#dk-file-status").textContent =
      `${error instanceof Error ? error.message : "Could not open drawing."} Your current construction is unchanged.`;
  } finally {
    input.value = "";
  }
});
el("#dk-share").addEventListener("click", async () => {
  const url = new URL(location.href);
  url.hash = encodeDesk(current());
  el<HTMLInputElement>("#dk-share-link").value = url.href;
  el<HTMLInputElement>("#dk-share-link").hidden = false;
  el("#dk-share-label").hidden = false;
  try {
    await navigator.clipboard.writeText(url.href);
    el("#dk-file-status").textContent = "Drawing link copied.";
  } catch {
    el("#dk-file-status").textContent = "Drawing link ready. Select and copy it below.";
  }
});
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-page]"))
  button.addEventListener("click", () => {
    const page = Number(button.dataset.page);
    for (const b of document.querySelectorAll("[data-page]"))
      b.setAttribute("aria-pressed", String(b === button));
    el<HTMLImageElement>("#dk-scan").src =
      `${import.meta.env.BASE_URL}sources/heiberg-${String(page).padStart(3, "0")}.jpg`;
    el<HTMLImageElement>("#dk-scan").alt =
      `Complete printed ${page % 2 ? "Latin" : "Greek"} page ${page}, including the critical apparatus`;
    el("#dk-scan-caption").textContent = `Printed page ${page} · ${page % 2 ? "Latin" : "Greek"}`;
  });
addEventListener("hashchange", () => {
  if (!location.hash.startsWith("#drawing=")) return;
  try {
    const decoded = decodeDesk(location.hash);
    session = decoded;
    cursor = decoded.actions.length;
    render();
    status("Drawing restored from the link.");
  } catch (error) {
    status(error instanceof Error ? error.message : "Could not restore drawing.");
  }
});
let narrow = innerWidth <= 650;
addEventListener("resize", () => {
  if (innerWidth <= 650 !== narrow) {
    narrow = !narrow;
    renderDrawing();
  }
});
render();
if (initialError) status(`${initialError} The original givens are shown.`);
prepareOffline(el("#dk-offline"), el<HTMLButtonElement>("#dk-reload"));
