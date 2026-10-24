import license from "../LICENSE?raw";
import { complementsPassages, gnomonPages, gnomonPassages } from "./content/gnomon";
import { complementModel, encodeGnomon, type GnomonState, gnomonModel } from "./core/gnomon";
import { formatMeasure as f } from "./core/quadrature";
import css from "./gnomon.css?inline";
import {
  complementAccount,
  complementDrawing,
  gnomonAccount,
  gnomonDrawing,
  gnomonPoints,
} from "./gnomon-drawing";
import { escapeHtml as esc } from "./html";
import { studyAssetIdentity, studyDataUrl, studyText } from "./study-assets";
export function gnomonCsv(state: GnomonState): string {
  const c = complementModel(state),
    g = gnomonModel(state);
  const rows = [
    ["quantity", "value", "meaning"],
    ["u_percent", state.u, "cut across the base"],
    ["v_percent", c.v * 100, "cut down the height"],
    ["shear", c.shear, "horizontal shift of upper side"],
    ["point_on_diagonal", c.onDiagonal, "hypothesis for I.43"],
    ["BK_area", c.leftArea, "square drawing units"],
    ["KD_area", c.rightArea, "square drawing units"],
    ["BK_minus_KD", c.difference, "signed area difference"],
    ["AD", g.a, "longer unequal segment"],
    ["DB", g.b, "shorter unequal segment"],
    ["GD", g.d, "distance between cuts"],
    ["rectangle_and_gnomon_area", g.area, "square drawing units"],
    ["missing_square_area", g.missing, "square drawing units"],
    ["whole_square_area", g.square, "square drawing units"],
    ["unequal_cut_hypothesis", !g.equal, "false for equal-input limit"],
    ...Object.entries(g.points).flatMap(([name, p]) => [
      [`II5_${name}_x`, p[0], "A is origin; x right"],
      [`II5_${name}_y`, p[1], "y down"],
    ]),
  ];
  return `${rows
    .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\r\n")}\r\n`;
}
export function gnomonSvg(state: GnomonState, book: "I43" | "II5"): string {
  const svg = book === "I43" ? complementDrawing(state) : gnomonDrawing(state);
  return svg.replace(
    "<title>",
    `<metadata>${esc(license)} Source: Euclid ${book}, Heiberg 1883. Modern coordinates; original point names.</metadata><style>${esc(css)}</style><title>`,
  );
}
export async function gnomonStudy(state: GnomonState): Promise<string> {
  const c = complementModel(state),
    g = gnomonModel(state);
  const [font, fontLicense, ...images] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    ...gnomonPages.map((p) => studyDataUrl(`sources/heiberg-${p}.jpg`, "image/jpeg")),
  ]);
  const passages = (list: typeof complementsPassages) =>
    list
      .map(
        (p, i) =>
          `<article class="gn-full-passage"><h3>${i + 1}. ${esc(p.title)}</h3><p lang="grc">${esc(p.grc)}</p><p lang="la">${esc(p.lat)}</p><p>${esc(p.en)}</p><p>${esc(p.note)}</p><p>Printed pages ${p.pages.join(", ")}.</p></article>`,
      )
      .join("");
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"/><title>Equal complements and the gnomon · Stoicheia</title><style>@font-face{font-family:"Noto Serif";src:url("${font}")}*{box-sizing:border-box}body{font:15px/1.65 system-ui,sans-serif;color:#193d60;background:#f9fbfd}a{color:inherit}h1,h2,h3{font-family:"Noto Serif",Georgia,serif}img{max-width:100%}${css}</style></head><body class="gn-saved"><main><header><p>STOICHEIA / EUCLID I.43 AND II.5</p><h1>Equal leftovers.<br>Unequal shapes.</h1><p>A saved experiment with both complete proofs and ten printed source pages.</p><p><a href="https://antonsoo.github.io/stoicheia/gnomon.html${esc(encodeGnomon(state))}">Open these settings in the workshop</a> · <a download="stoicheia-gnomon-measurements.csv" href="data:text/csv;charset=utf-8,${encodeURIComponent(gnomonCsv(state))}">Save the measurements CSV</a></p></header>
 <section><h2>I.43: what the diagonal makes possible</h2><p>Cut across: ${state.u}%. Cut down: ${f(c.v * 100)}%. Upper-side shift: ${f(c.shear)} units. ${c.onDiagonal ? "Κ lies on ΑΓ; the complements have equal area." : "Κ is off ΑΓ. The hypothesis is absent, and the complements are not equal."}</p>${complementDrawing(state)}<div class="gn-table">${complementAccount(state)}</div><p>The large diagonal halves have equal area by I.34. When Κ is on that diagonal, subtracting the two pairs of equal small triangles leaves equal complements. When Κ is off it, the small pairs still have equal areas, but they no longer partition the large halves as required. The drawing preserves your selected stage; the full account remains available below.</p></section>
 <section><h2>II.5: the missing square</h2><p>Unequal lengths ΑΔ = ${f(g.a)}, ΔΒ = ${f(g.b)}. Rectangle and gnomon area ${f(g.area)}; missing square area ${f(g.missing)}; whole square area ${f(g.square)}.</p>${g.equal ? "<p>The input cuts coincide. The displayed identity is the equal-cut limit; II.5's unequal-cut hypothesis is not met.</p>" : ""}${gnomonDrawing(state)}<div class="gn-table">${gnomonAccount(state)}</div><p>The diagram follows the source's point names and orientation. The highlighted areas are compared in place; overlapping highlights name a common region, not overlapping physical paper. The gnomon ΜΝΞ is the union ΓΘ + ΔΖ. It is not a polygon with just those three vertices.</p><div class="gn-table">${gnomonPoints(state)}</div></section>
 <section><h2>Complete I.43: Greek, Latin and English</h2>${passages(complementsPassages)}</section><section><h2>Complete II.5: Greek, Latin and English</h2>${passages(gnomonPassages)}</section>
 <section><h2>One letter, two uses</h2><p>Printed page 131 labels the boundary point Μ and also names the gnomon ΜΝΞ. In his footnote Heiberg says that Μ is used twice in the diagram received from the Basel edition; he records Gregory's ΝΞΟ alternative but declines to change the reading against the manuscripts. This workshop retains Μ at the boundary and puts the region name ΜΝΞ in the explanation. It does not invent a single point that resolves both uses.</p><h2>Source and model boundaries</h2><p>J. L. Heiberg, <cite>Euclidis opera omnia</cite>, volume I, Leipzig: Teubner, 1883, pp. 100–103 and 128–133. <a href="https://archive.org/details/euclidisoperaomn01eucluoft">University of Toronto scan</a>, public domain. Greek ϑ is normalized to θ; line breaks, critical apparatus and inline Latin references are omitted in the reading. The source images preserve them. Latin is Heiberg's nineteenth-century translation. New English, divisions, notes, coordinates, colors and off-diagonal experiment are modern teaching work.</p><p>I.34, I.46 and earlier parallel constructions are cited prerequisites, not complete proofs reproduced here. The square is a special parallelogram; the I.43 experiment also permits oblique ones. In II.5 the longer segment is placed first, as in the diagram. Equal input lengths are explicitly a limiting case. The diagrams use equal horizontal and vertical scales; values are rounded for display. The numerical checks illustrate, rather than replace, the source's proof.</p><p>This file embeds every source image and its font and makes no remote subresource requests. Opening the application link needs a connection.</p></section>
 ${gnomonPages.map((p, i) => `<figure class="gn-source-sheet"><figcaption>Heiberg 1883 · printed p. ${p} · ${p % 2 ? "Latin" : "Greek"} · ${p < 110 ? "I.43" : "II.5"}</figcaption><img src="${images[i]}" alt="Full printed page ${p}"/><figcaption>SHA-256 ${studyAssetIdentity(`sources/heiberg-${p}.jpg`).sha256}</figcaption></figure>`).join("")}
 <section><h2>Licenses</h2><p>Greek, Latin and scans: public domain. New English, notes, diagrams and code: MIT.</p><pre class="gn-license">${esc(license)}</pre><h3>Noto Serif font</h3><pre class="gn-license">${esc(fontLicense)}</pre></section></main></body></html>`;
}
