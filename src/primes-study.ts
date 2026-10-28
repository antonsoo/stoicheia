import license from "../LICENSE?raw";
import { primeBoundary, primePassages, primeSourceUrl } from "./content/primes";
import {
  encodePrimes,
  type PrimeState,
  primePages,
  primeSourceFile,
  primesCsv,
  primesJson,
} from "./core/primes";
import { escapeHtml as esc } from "./html";
import css from "./primes.css?inline";
import {
  primeBranches,
  primeConstruction,
  primeDescent,
  primeEquation,
  primeGeneralReason,
  primeLedger,
  primeProposal,
  primeResult,
  primeSvg,
  primeUnits,
} from "./primes-drawing";
import { studyAssetIdentity, studyDataUrl, studyText } from "./study-assets";
import baseCss from "./style.css?inline";

export function primeReading(index: number): string {
  const p = primePassages[index];
  if (!p) throw new Error("Unknown prime reading.");
  return `<p class="pr-label">${esc(p.location)}</p><h3>${index + 1}. ${esc(p.title)}</h3><div class="pr-reading-grid"><div><p class="pr-label">Greek · p.${p.pages[0]}${index === 2 ? " and p.390" : ""}</p><p lang="grc">${esc(p.greek)}</p></div><div><p class="pr-label">Heiberg’s Latin · p.${p.pages[1]}${p.latinEnd ? ` and p.${p.latinEnd}` : ""}</p><p lang="la">${esc(p.latin)}</p></div></div><p class="pr-translation">${esc(p.english)}</p><p class="pr-reading-note">${esc(p.note)}</p><div class="pr-word"><p><span lang="grc">${esc(p.word)}</span> / <span lang="la">${esc(p.counterpart)}</span></p><p>${esc(p.meaning)}</p></div>`;
}
export async function primesStudy(s: PrimeState): Promise<string> {
  const [font, ofl, manifest, ...images] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    studyText("sources/primes/manifest.json"),
    ...primePages.map((p) => studyDataUrl(primeSourceFile(p), "image/jpeg")),
  ]);
  const data = (mime: string, body: string) =>
    `data:${mime};charset=utf-8,${encodeURIComponent(body)}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; object-src 'none'; base-uri 'none'"/><title>Euclid’s extra prime · retained experiment</title><style>@font-face{font-family:'Noto Serif';src:url('${font}')}${baseCss.replace(/@font-face\s*\{[^}]*\}/g, "")}${css}</style></head><body class="primes-page pr-retained"><main><section class="pr-intro"><h1>Euclid’s extra prime</h1><p>${esc(primeBoundary)}</p></section><section class="pr-section"><h2>The chosen list and its added unit</h2><p>Given distinct primes: ${s.primes.join(", ")}.</p>${primeConstruction(s)}<div class="pr-division"><div class="pr-table">${primeLedger(s, false)}</div><div class="pr-unit-plate">${primeUnits(s)}${primeEquation(s)}</div></div></section><section class="pr-section"><h2>What the bounded search established</h2><p>Prime trial divisors permitted through ${s.limit}. Whole-number calculations use exact integers; no probable-prime test is used.</p>${primeResult(s)}${primeBranches(s)}</section><section class="pr-section"><h2>The proposed prime witness</h2>${primeProposal(s)}<p>Primality is checked exactly for H through 10,000,000,000. Larger proposals retain exact divisibility and membership checks but remain unchecked for primality. The proposed witness and bounded factor search are separate calculations.</p></section><section class="pr-section"><h2>A reason for any finite list</h2>${primeGeneralReason()}</section><section class="pr-section"><h2>A separate VII.31 descent</h2><p>This small example starts at 2310, independently of the chosen prime list. Every step chooses a smaller divisor greater than one; each still divides the original.</p>${primeDescent(s, false)}<p>Only finitely many whole numbers at least two lie below a fixed starting number. An endlessly smaller chain cannot occur. If a chosen divisor is composite there is another proper divisor; eventually a prime must occur. This argument supplies a prime divisor without relying on the app’s trial bound.</p></section><section class="pr-section"><h2>Read the argument in three languages</h2>${primePassages.map((_, i) => `<article class="pr-reading-full">${primeReading(i)}</article>`).join("")}</section><section class="pr-section"><h2>Retained settings and native files</h2><p class="pr-native"><a href="${esc(data("application/json", primesJson(s)))}" download="stoicheia-primes.json">Save editable JSON</a><a href="${esc(data("text/csv", primesCsv(s)))}" download="stoicheia-primes.csv">Save division CSV</a><a href="${esc(data("image/svg+xml", primeSvg(s, license)))}" download="stoicheia-primes.svg">Save exact construction SVG</a><a href="${esc(data("application/json", manifest))}" download="stoicheia-primes-sources.json">Save source identities</a></p><pre>${esc(primesJson(s))}</pre><p>The CSV retains this calculation and the separate descent chain, not a log of learner actions. <a href="https://antonsoo.github.io/stoicheia/primes.html${esc(encodePrimes(s))}#pr-bench">Reopen these settings in the workshop</a>. The link needs the app; this reading’s text, diagram, pages, font and native downloads work from disk without scripts or network assets.</p></section><section class="pr-section"><h2>The complete printed evidence</h2><p>J. L. Heiberg, <cite>Euclidis Elementa</cite>, volume II, Leipzig: B. G. Teubner, 1884. The title prints MDCCCLXXXIV. IX.20 is on pp.388–391; VII definitions 1–2 on pp.184–185; VII.31 on pp.250–253. Whole pages retain margins, editorial apparatus, neighbouring propositions and original markings. Numbered print pages plus 26 give the one-based PDF page; title is PDF p.7.</p><p>Selections join line breaks and line-end hyphens, omit superscript reference markers, normalize printed theta glyphs and lightly regularize punctuation. Greek and Latin letter labels are rendered in Greek Unicode; Latin u/v spellings remain. IX.20 is transcribed in full across seven reading units. VII definitions 1–2 are complete; VII.31 is represented by its statement and a selected impossibility clause, with the complete printed proof retained in the images. The p.389 diagram’s endpoint order differs from the text’s names for the added unit and sum, as explained in reading 2. New English and contextual language notes have not had independent philological review.</p><p><a href="${primeSourceUrl}">Original public-domain volume</a>. PDF SHA-256: cd24f03c6e4e6d5f30a908d144c8f0f7003e99813334edb3a4107d748cb41043. Derivatives: whole pages, 2200 px long edge, JPEG quality 88.</p>${primePages.map((p, i) => `<figure class="pr-source-full"><img src="${images[i]}" alt="Complete ${p ? `printed ${p % 2 ? "Latin" : "Greek"} page ${p}` : "1884 volume II title"}, with original marks and apparatus."/><figcaption>${p ? `Printed p.${p} · PDF p.${p + 26}` : "Title · PDF p.7"} · SHA-256 ${studyAssetIdentity(primeSourceFile(p)).sha256}</figcaption></figure>`).join("")}</section><section class="pr-section"><h2>Licenses and limits</h2><p>${esc(primeBoundary)}</p><p>New work is MIT licensed. Historical text and source scans are public domain. Bundled Noto Serif is under SIL OFL 1.1. Input is restricted to twelve distinct proven primes at most 10,000,000,000; trial search stops at the chosen bound, at most 100,000. The separate descent starts at 2310. Those computational limits do not bound the theorem. No formal proof assistant, physical print or comprehensive assistive-technology review is claimed.</p><details open><summary>Complete MIT and font licenses</summary><pre>${esc(license)}\n${esc(ofl)}</pre></details></section></main></body></html>`;
}
