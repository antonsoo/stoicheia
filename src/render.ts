import { foundationById, reasonFoundations } from "./content/foundations";
import { lookup } from "./content/glossary";
import type { Lesson } from "./content/lessons";
import { reasons } from "./content/lessons";
import type { Point } from "./core/geometry";
import { distance } from "./core/geometry";
import type { Scene } from "./core/scene";

export function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ??
      character,
  );
}

export function annotated(text: string): string {
  return text
    .split(/([\p{L}\p{M}]+)/u)
    .map((part) => {
      const entry = lookup(part);
      return entry
        ? `<button type="button" class="word" data-gloss="${entry.id}" data-form="${escapeHtml(part)}" aria-label="${escapeHtml(part)}: vocabulary">${escapeHtml(part)}</button>`
        : escapeHtml(part);
    })
    .join("");
}

const n = (value: number) => Number(value.toFixed(3));

export function drawScene(
  scene: Scene,
  title: string,
  standalone = false,
  id = "diagram",
  width = 720,
): string {
  const height = scene.height ?? 470;
  const padding = 40;
  const [minX, minY, maxX, maxY] = scene.bounds;
  const factor = Math.min(
    (width - 2 * padding) / (maxX - minX),
    (height - 2 * padding) / (maxY - minY),
  );
  const offsetX = (width - (maxX - minX) * factor) / 2;
  const offsetY = (height - (maxY - minY) * factor) / 2;
  const map = (p: Point): Point => ({
    x: n(offsetX + (p.x - minX) * factor),
    y: n(height - offsetY - (p.y - minY) * factor),
  });
  const figures = (scene.figures ?? [])
    .map(
      (figure) =>
        `<polygon data-figure="${escapeHtml(figure.id)}" class="figure figure-${figure.tone}" points="${figure.points
          .map((p) => {
            const q = map(p);
            return `${q.x},${q.y}`;
          })
          .join(" ")}" />`,
    )
    .join("");
  const angles = (scene.angles ?? [])
    .map((angle) => {
      const center = map(angle.at);
      const first = map(angle.first);
      const last = map(angle.last);
      const start = Math.atan2(first.y - center.y, first.x - center.x);
      let delta = Math.atan2(last.y - center.y, last.x - center.x) - start;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      // Stay within the shorter visible ray even for narrow/short triangles.
      const baseRadius = Math.min(
        28,
        distance(center, first) * 0.28,
        distance(center, last) * 0.28,
      );
      return Array.from({ length: angle.rings }, (_, ring) => {
        const radius = baseRadius + ring * 4;
        const points = Array.from({ length: 21 }, (_, index) => {
          const theta = start + (delta * index) / 20;
          return `${n(center.x + radius * Math.cos(theta))},${n(center.y + radius * Math.sin(theta))}`;
        }).join(" ");
        return `<polyline data-angle="${escapeHtml(angle.id)}" class="angle-mark ${angle.ink}" points="${points}" />`;
      }).join("");
    })
    .join("");
  const circles = scene.circles
    .map((circle) => {
      const center = map(circle.center);
      const radius = n(circle.radius * factor);
      const attributes = `data-entity="${circle.id}" data-radius="${n(circle.radius)}" class="curve ${circle.ink}"`;
      if (circle.start !== undefined && circle.end !== undefined) {
        const at = (degree: number) =>
          map({
            x: circle.center.x + circle.radius * Math.cos((degree * Math.PI) / 180),
            y: circle.center.y + circle.radius * Math.sin((degree * Math.PI) / 180),
          });
        const from = at(circle.start);
        const to = at(circle.end);
        return `<path ${attributes} d="M${from.x} ${from.y} A${radius} ${radius} 0 0 0 ${to.x} ${to.y}" />`;
      }
      return `<circle ${attributes} cx="${center.x}" cy="${center.y}" r="${radius}" />`;
    })
    .join("");
  const segments = scene.segments
    .map((segment) => {
      const a = map(segment.a);
      const b = map(segment.b);
      let ticks = "";
      if (segment.ticks) {
        const length = distance(a, b);
        const vx = (b.x - a.x) / length;
        const vy = (b.y - a.y) / length;
        for (let i = 0; i < segment.ticks; i++) {
          const shift = (i - (segment.ticks - 1) / 2) * 6;
          const mid = { x: (a.x + b.x) / 2 + shift * vx, y: (a.y + b.y) / 2 + shift * vy };
          ticks += `<line class="tick ${segment.ink}" x1="${n(mid.x - 6 * vy)}" y1="${n(mid.y + 6 * vx)}" x2="${n(mid.x + 6 * vy)}" y2="${n(mid.y - 6 * vx)}" />`;
        }
      }
      return `<line data-entity="${segment.id}" data-length="${n(distance(segment.a, segment.b))}" class="edge ${segment.ink}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />${ticks}`;
    })
    .join("");
  const vertices = scene.vertices
    .map((vertex) => {
      const at = map(vertex.at);
      return `<g class="vertex" data-point="${escapeHtml(vertex.id)}">${vertex.id === "reference-label" ? "" : `<circle cx="${at.x}" cy="${at.y}" r="3.2" />`}<text x="${at.x + vertex.dx}" y="${at.y + vertex.dy}" text-anchor="middle" lang="grc">${escapeHtml(vertex.label)}</text></g>`;
    })
    .join("");
  const styles = standalone ? `<style>${diagramStyles}</style>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" class="plate-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${escapeHtml(id)}-title ${escapeHtml(id)}-description">${styles}<title id="${escapeHtml(id)}-title">${escapeHtml(title)}</title><desc id="${escapeHtml(id)}-description">${escapeHtml(scene.description)} ${escapeHtml(scene.warning)} ${escapeHtml(scene.notice?.text ?? "")}</desc><rect class="plate-background" width="${width}" height="${height}"/><g>${figures}${circles}${segments}${angles}${vertices}</g>${scene.notice ? `<text class="plate-notice" x="${width / 2}" y="20" text-anchor="middle">${escapeHtml(scene.notice.title)}</text>` : ""}</svg>`;
}

// Shared with standalone downloads, which cannot depend on the app's CSS or fonts.
export const diagramStyles = `
.figure{stroke:none;fill-opacity:.16}.figure-first{fill:#694780}.figure-second{fill:#207080}.angle-mark{fill:none;stroke:#386a94;stroke-width:1.6}.plate-notice{font:12px system-ui,sans-serif;fill:#193d60}.plate-background{fill:#e8eff4}.curve,.edge,.tick{fill:none;stroke:#386a94;stroke-width:1.6}
.edge{stroke-width:2.2}.tick{stroke-width:2}.given{stroke:#193d60;stroke-width:2.4}
.active{stroke:#694780;stroke-width:2.8}.result{stroke:#193d60;stroke-width:2.6}
.auxiliary{stroke:#788b9d;stroke-dasharray:5 6;stroke-width:1.2}.vertex circle{fill:#193d60}
.vertex text{font:25px 'Noto Serif',Georgia,serif;fill:#193d60;paint-order:stroke;stroke:#e8eff4;stroke-width:5px;stroke-linejoin:round}
`;

export function studySheet(lesson: Lesson, scene: Scene, step: number): string {
  const rows = lesson.steps
    .map(
      (passage, index) =>
        `<section class="passage lesson-passage"><h2>${index + 1}. ${escapeHtml(passage.title)} <small>${passage.phase}</small></h2><div class="parallel"><p lang="grc">${escapeHtml(passage.grc)}</p><p lang="la">${escapeHtml(passage.lat)}</p><p>${escapeHtml(passage.en)}</p></div><p class="note">${escapeHtml(passage.language)}</p><p class="note"><b>Reason: ${escapeHtml(reasons[passage.reason]?.title ?? "")}</b> ${escapeHtml(reasons[passage.reason]?.text ?? "")}</p><p class="note">Printed source: Greek pp. ${passage.greekPages.join(", ")}; Latin pp. ${passage.latinPages.join(", ")}.</p></section>`,
    )
    .join("");
  const usedFoundations = [
    ...new Set(lesson.steps.flatMap((passage) => reasonFoundations[passage.reason] ?? [])),
  ]
    .map((id) => foundationById.get(id))
    .filter((entry) => entry !== undefined);
  const appendix = usedFoundations.length
    ? `<section><h2>Definitions and starting permissions used in this proof</h2>${usedFoundations.map((entry) => `<section class="passage"><h3>${escapeHtml(entry.editionLabel)} · ${escapeHtml(entry.title)}</h3><div class="parallel"><p lang="grc">${escapeHtml(entry.grc)}</p><p lang="la">${escapeHtml(entry.lat)}</p><p>${escapeHtml(entry.en)}</p></div><p class="note">${escapeHtml(entry.note)}</p><p class="note">Printed source: Greek pp. ${entry.greekPages.join(", ")}; Latin pp. ${entry.latinPages.join(", ")}.</p></section>`).join("")}</section>`
    : "";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>Stoicheia ${lesson.numeral} · Study sheet</title><style>
body{font:17px/1.65 Georgia,serif;color:#193d60;background:#fff;max-width:1100px;margin:3rem auto;padding:0 1.5rem}h1{font-size:2rem;line-height:1.2}h2{font:600 1.1rem/1.4 system-ui,sans-serif}.parallel{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2rem}.parallel p{margin:0}.passage{padding:1.5rem 0;border-top:1px solid #b1c1d0;break-inside:avoid}.note,small,footer{font:14px/1.6 system-ui,sans-serif}small{font-weight:normal}svg{display:block;width:100%;max-height:440px;margin:2rem auto}.note{color:#52677b}.equations{font-family:monospace}.comparison-table{border-collapse:collapse;width:100%;font:14px/1.5 system-ui,sans-serif;margin:1.5rem 0}.comparison-table caption{text-align:left;font-weight:600}.comparison-table th,.comparison-table td{padding:8px;text-align:left;border-bottom:1px solid #b1c1d0}@media(max-width:650px){.parallel{grid-template-columns:1fr;gap:.7rem}}@media print{body{margin:0;font-size:11pt}svg{max-height:250px}.parallel{gap:1rem}.passage{padding:.7rem 0}}${diagramStyles}
</style></head><body><header><p>STOICHEIA · EUCLID, BOOK I</p><h1>${lesson.numeral} · ${escapeHtml(lesson.title)}</h1><p>${escapeHtml(lesson.statement.en)}</p></header><figure>${drawScene(scene, `${lesson.numeral}, step ${step + 1}`)}<figcaption>Plate at step ${step + 1}: ${escapeHtml(lesson.steps[step]?.title ?? "")}.</figcaption></figure>${scene.warning ? `<p>${escapeHtml(scene.warning)}</p>` : ""}${scene.notice ? `<aside><h2>${escapeHtml(scene.notice.title)}</h2><p>${escapeHtml(scene.notice.text)}</p></aside>` : ""}${scene.comparison ? comparisonTable(scene) : ""}<p class="equations">${scene.equalities.map(escapeHtml).join(" · ")}</p><section><h2>The proposition</h2><div class="parallel"><p lang="grc">${escapeHtml(lesson.statement.grc)}</p><p lang="la">${escapeHtml(lesson.statement.lat)}</p><p>${escapeHtml(lesson.statement.en)}</p></div></section>${rows}<section><h2>${escapeHtml(lesson.insight.title)}</h2><p>${escapeHtml(lesson.insight.text)}</p></section>${lesson.editionNote ? `<section class="passage"><h2>${escapeHtml(lesson.editionNote.title)}</h2><p lang="grc">${escapeHtml(lesson.editionNote.grc)}</p><p>${escapeHtml(lesson.editionNote.en)}</p><p class="note">${escapeHtml(lesson.editionNote.note)} Greek source pp. ${lesson.editionNote.greekPages.join(", ")}.</p></section>` : ""}${appendix}<footer><p>Greek and Latin: Euclidis opera omnia, vol. I, ed. and Latin translation J. L. Heiberg, Leipzig: Teubner, 1883, printed pp. 2–45. Public domain. <a href="https://archive.org/details/euclidisoperaomn01eucluoft">University of Toronto scan</a>. English, reading notes and redrawn coordinate diagrams: Stoicheia (2026), MIT. Greek ϑ is normalized to θ; line breaks and inline references are omitted. Latin u/v spelling is retained. Heiberg’s square brackets in I.1, I.4, I.8, I.13 and I.15 are retained. Printed angle and triangle symbols are represented as ∠ and △. The English is a reading translation, including explicit explanations of implied intersections.</p><p>The diagram is numerical evidence, not a formal proof. Length units and orientation are modern teaching choices. ${scene.warning ? "The required conditions are not satisfied in this saved plate." : ""}</p></footer></body></html>`;
}

export function comparisonTable(scene: Scene): string {
  const comparison = scene.comparison;
  if (!comparison) return "";
  return `<table class="comparison-table"><caption>${escapeHtml(comparison.title)}</caption><thead><tr><th scope="col">${escapeHtml(comparison.first)}</th><th scope="col">${escapeHtml(comparison.second)}</th><th scope="col">Correspondence</th></tr></thead><tbody>${comparison.rows.map(([first, second, why]) => `<tr><td>${escapeHtml(first)}</td><td>${escapeHtml(second)}</td><td>${escapeHtml(why)}</td></tr>`).join("")}</tbody></table>`;
}
