import codeLicense from "../LICENSE?raw";
import type { Lesson } from "./content/lessons";
import type { Scene } from "./core/scene";
import { escapeHtml, studySheet } from "./render";
import { studyAssetIdentity, studyDataUrl, studyText } from "./study-assets";
import { courseSourcePages } from "./study-pages";

/** Snapshot scene and passage belong to the click, even if the reader changes lesson while loading. */
export async function illustratedCourseStudy(
  lesson: Lesson,
  scene: Scene,
  step: number,
): Promise<string> {
  const pages = courseSourcePages(lesson);
  const [font, license, ...scans] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    ...pages.map((p) =>
      studyDataUrl(`sources/heiberg-${String(p).padStart(3, "0")}.jpg`, "image/jpeg"),
    ),
  ]);
  const style = `<style>@font-face{font-family:"Noto Serif";src:url(${font})}body{font-family:"Noto Serif",Georgia,serif}.note,small,footer{font-family:system-ui,"Noto Serif",serif}.source-appendix{margin-top:3rem}.source-page{margin:2rem 0;break-inside:avoid}.source-page img{display:block;width:100%;height:auto;max-height:1100px;object-fit:contain}.source-page figcaption{font:14px/1.5 system-ui,sans-serif;margin-bottom:1rem}.source-identity{overflow-wrap:anywhere;font-size:11px}.study-notices pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.6 monospace}@page{margin:12mm}@media print{body{padding:0}.study-statement{break-inside:avoid}.source-page{break-before:page;margin:0}.source-page img{max-height:230mm}.study-notices{display:none}h2{break-after:avoid}}</style>`;
  const sources = `<section class="source-appendix"><h2>The printed evidence</h2><p>Source pages from Heiberg’s 1883 edition, including the passages and foundations used in this saved reading. Every image and the bundled font were checked against this edition before saving. The apparatus is available for inspection; it is not fully transcribed. Where the original scan is cropped, the page caption identifies that limit.</p>${pages
    .map((p, i) => {
      const file = `sources/heiberg-${String(p).padStart(3, "0")}.jpg`,
        identity = studyAssetIdentity(file);
      return `<figure class="source-page"><figcaption>Printed page ${p} · ${p % 2 ? "Latin translation" : "Greek text"} · Heiberg, <cite>Euclidis opera omnia</cite>, I (1883)${p === 6 ? " · The Toronto scan’s right edge is cropped. Definition 20 was cross-checked against Heath’s Greek quotation; the missing margin is not visible here." : ""}</figcaption><img data-source-page="${p}" data-source-sha256="${identity.sha256}" src="${scans[i]}" alt="Printed ${p % 2 ? "Latin" : "Greek"} page ${p}, including editorial notes${p === 6 ? "; the original scan’s right edge is cropped" : ""}"><p class="source-identity">SHA-256 ${identity.sha256}</p></figure>`;
    })
    .join("")}</section>`;
  const notices = `<details class="study-notices"><summary>Copyright and redistribution notices</summary><h2>Code, English and teaching notes</h2><pre>${escapeHtml(codeLicense)}</pre><h2>Noto Serif font</h2><pre>${escapeHtml(license)}</pre><p>The historical Greek, Latin and scanned pages are public domain. This file contains the font and all ${pages.length} source images. It opens without external requests.</p></details>`;
  return studySheet(lesson, scene, step)
    .replace(
      "style-src 'unsafe-inline';",
      "style-src 'unsafe-inline'; img-src data:; font-src data:;",
    )
    .replace("</head>", `${style}</head>`)
    .replace("<section><h2>The proposition", '<section class="study-statement"><h2>The proposition')
    .replace("</footer>", `${notices}</footer>${sources}`);
}
