import codeLicense from "../LICENSE?raw";
import { lessons } from "./content/lessons";
import { type DeskSession, deskActionText, encodeDesk, replayDesk } from "./core/desk";
import css from "./desk.css?inline";
import { deskDrawing, deskProofHtml } from "./desk-drawing";
import { escapeHtml as esc } from "./html";
import { studyAssetIdentity, studyDataUrl, studyText } from "./study-assets";

export const deskPages = [12, 13, 14, 15];
export function deskSourceReading(expanded = false): string {
  const lesson = lessons[2];
  return `<h2>Read the construction you are making</h2><p>The complete statement and proof of I.2, in the course’s existing transcription. Your A, B, C correspond to Α, Β, Γ; new points receive P-numbers in order of creation. A completed explanation supplies the remaining correspondence. Step divisions and language notes are modern teaching aids.</p><div class="dk-passage"><h3>The task</h3><div class="dk-languages"><p lang="grc">${esc(lesson.statement.grc)}</p><p lang="la">${esc(lesson.statement.lat)}</p><p>${esc(lesson.statement.en)}</p></div></div>${lesson.steps.map((step, i) => `<details class="dk-passage"${expanded || i === 2 || i === 8 ? " open" : ""}><summary>${i + 1}. ${esc(step.title)}</summary><div class="dk-languages"><p lang="grc">${esc(step.grc)}</p><p lang="la">${esc(step.lat)}</p><p>${esc(step.en)}</p></div><p class="dk-note">${esc(step.language)}</p><p class="dk-note">Greek p.${step.greekPages.join(", ")} · Latin p.${step.latinPages.join(", ")} · <a href="./#p=2&s=${i}">Read on the prepared plate</a></p></details>`).join("")}`;
}
export function deskSvg(session: DeskSession): string {
  return deskDrawing(replayDesk(session)).replace(
    "<title>",
    `<metadata>${esc(codeLicense)} Modern learner construction of Euclid I.2, floating-point real-plane model.</metadata><style>:root{--ink:#193d60;--folio:#fbfcfe;--rule:#b7c8d6;--accent:#694780;--muted:#52677b;--dk-green:#17634d}${esc(css)}</style><title>`,
  );
}
export async function deskStudy(session: DeskSession): Promise<string> {
  const scene = replayDesk(session);
  const [font, fontLicense, ...scans] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    ...deskPages.map((p) =>
      studyDataUrl(`sources/heiberg-${String(p).padStart(3, "0")}.jpg`, "image/jpeg"),
    ),
  ]);
  const jsonLink = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(session, null, 2))}`;
  const steps = session.actions
    .map((action, i) => {
      const prefix = { ...session, actions: session.actions.slice(0, i + 1) };
      return `<details class="dk-step" open><summary>${i + 1}. ${esc(deskActionText(action))}</summary>${deskDrawing(replayDesk(prefix), { instance: `step${i}`, compact: true })}</details>`;
    })
    .join("");
  const reading = deskSourceReading(true).replaceAll(
    'href="./#',
    'href="https://antonsoo.github.io/stoicheia/#',
  );
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"/><title>Your I.2 construction · Stoicheia</title><style>@font-face{font-family:"Noto Serif";src:url("${font}")}*{box-sizing:border-box}:root{--ink:#193d60;--paper:#e8eff4;--folio:#fbfcfe;--rule:#b7c8d6;--accent:#694780;--muted:#52677b;--dk-green:#17634d}body{color:var(--ink);background:var(--paper);font:15px/1.7 system-ui,sans-serif}h1,h2,h3{font-family:"Noto Serif",Georgia,serif;font-weight:400}a{color:inherit}${css}</style></head><body class="dk-saved"><header><h1>Your I.2 construction</h1><p>Layout: ${esc(session.given)}. ${session.actions.length} chosen operations. The drawing and transcript below preserve your actual choices, including detours; they do not substitute a prepared solution.</p><p><a href="https://antonsoo.github.io/stoicheia/desk.html${esc(encodeDesk(session))}">Continue this construction in the app</a> · <a href="${esc(jsonLink)}" download="stoicheia-construction.json">Save the editable drawing JSON</a></p></header><section><h2>The drawing you made</h2>${deskDrawing(scene, { instance: "final" })}</section><section class="dk-proof">${deskProofHtml(scene).replaceAll('href="./#', 'href="https://antonsoo.github.io/stoicheia/#')}</section><section><h2>Replay your operations</h2><p>Each diagram contains only the points and curves available at that operation. A kept crossing records its two parent curves and branch. Curves are named c or l plus their creation number; points are numbered in order of keeping.</p>${steps || "<p>No operations yet. The three given points and reference BC are the whole drawing.</p>"}</section><section class="dk-reading">${reading}</section><section><h2>Tools, text and limitations</h2><p>A circle has an existing centre and passes through an existing point. The straight-line tool combines joining two points and continuing the join in both directions (postulates 1 and 2). New points must come from isolated crossings. These restrictions are a modern teaching interface, not a reconstruction of an ancient physical compass.</p><p>The desk recognizes the I.2 equal-remainder dependency chain, with either equilateral vertex or reference anchor. It does not establish every possible valid solution. Screen measurements are approximate and never certify a proof. Intersections use floating-point real-plane coordinates; tangency and numerically unresolved intersections are deliberately not kept. Euclid’s stated postulates do not themselves supply a complete continuity justification for circle intersections.</p><p>Greek and Heiberg’s Latin: <cite>Euclidis opera omnia</cite>, vol. I (Leipzig: Teubner, 1883), pp.12–15. <a href="https://archive.org/details/euclidisoperaomn01eucluoft">University of Toronto scan</a>. Full pages retain the apparatus, which is not transcribed. The course normalizes ϑ to θ, removes line wrapping and inline Latin reference marks, and keeps Greek labels in both languages. English and notes are new.</p><p>This reading embeds four complete page images, the Greek font, all replay diagrams and editable JSON. It runs no scripts and needs no network for reading. Links to the app and source volume require a connection.</p></section>${deskPages
    .map((p, i) => {
      const file = `sources/heiberg-${String(p).padStart(3, "0")}.jpg`;
      return `<figure class="dk-source-page"><figcaption>Heiberg 1883, printed p.${p} · ${p % 2 ? "Latin" : "Greek"} · SHA-256 ${studyAssetIdentity(file).sha256}</figcaption><img data-source-page="${p}" src="${scans[i]}" alt="Complete printed page ${p}, including the critical apparatus"/></figure>`;
    })
    .join(
      "",
    )}<details class="dk-notices"><summary>Redistribution notices</summary><p>Historical text and facsimiles: public domain. New English, notes, code and diagrams: MIT.</p><pre>${esc(codeLicense)}</pre><h2>Noto Serif</h2><pre>${esc(fontLicense)}</pre></details></body></html>`;
}
