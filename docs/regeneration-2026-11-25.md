# Retained examples regenerated, 2026-11-25

The retained readings, drawings and PDFs that still named the former author
were regenerated on 2026-11-25 for the author-name and license change, from a
local build of commit `9bd8cd3` plus the quadratrix fix below (Chromium 153;
the Chromium 1440 px downloads, except the I.21 study, which was a 375 px
download before and is again; readings that were gzip-compressed before are
stored with `gzip -9 -n`).

Produced by the rooms' own browser reviews: `illustrated-browser.mjs` (I.21
study, I.22 reading and its PDF), `quadrature-browser.mjs` (II.14),
`gnomon-browser.mjs` (I.43, II.5 and the gnomon reading), `mesolabe-browser.mjs`,
`circle-browser.mjs` (the saved altered experiment, as before),
`horn-browser.mjs`, `quadratrix-browser.mjs`, `ratios-browser.mjs` and
`solids-browser.mjs`.

Four review scripts no longer run against the current pages: `desk-browser.mjs`
waits for a "Make I.2 yourself" link that is gone, `copying-browser.mjs` expects
the companion-workshop panel to open by default, and `measure-browser.mjs` and
`closure-browser.mjs` fail similarly. Their retained files were downloaded with
the same buttons from the recorded states instead: the common-measure reading,
SVG and PDF from its saved settings link; the I.2 construction reading, SVG and
PDF from its saved drawing link; the I.22 diagram from its saved givens with the
side flipped, as the review did (its CSV came out byte-identical); and the I.22
and I.23 study sheets and PDFs at their last steps with the review's view
parameters (`r=1.15&a=32&x=.25`; both course SVGs came out byte-identical).
Repairing those four scripts is left as a separate task.

What changed: the credit names Anthony Mercer and the embedded code license is
the PolyForm Noncommercial text with its required notice; the study sheets also
carry the current print styles. Nothing else in the saved HTML or SVG changed.
The longer license adds pages to some PDFs: II.14 18 to 19, gnomon 25 to 27,
mesolabe 27 to 28, circle 24 to 25, horn 15 to 17, quadratrix 19 to 21, ratios
15 to 17, solids 30 to 31, common measure 30 to 31.

One product fix: the saved quadratrix reading linked to `./quadrature.html`,
which only resolves beside the saved file, so its PDF carried a `file://` link
into the folder it was printed from. `quadratrix-study.ts` now rewrites that
link to the public site (as `desk-study.ts` already did), and
`quadratrix-browser.mjs` rejects relative links in a saved reading.
`horn-browser.mjs` records file names relative to its output folder, and
`horn-print.py` names its license check without "MIT".

Checks on the regenerated files: `circle-print.py`, `horn-print.py`,
`measure-print.py`, `quadratrix-print.py`, `gnomon-print.ts`,
`closure-print.ts`, `mesolabe-print-review.py`, `ratios-artifacts.py` and
`solids-artifacts.py` passed.

Receipts replaced by that day's runs: `mesolabe-browser.json`,
`circle-review/browser.json`, `horn-review/browser.json`,
`quadratrix-review/browser.json`, `ratios-verification/browser.json`,
`illustrated-review/browser.json`, the print receipts (`gnomon-print.json`,
`mesolabe-print.json`, `measure-print.json`, `circle-review/print.json`,
`horn-review/print.json`, `quadratrix-review/print.json`,
`illustrated-review/closure-print.json`), `ratios-verification/artifacts.json`
and `solids-artifacts.json`. The retained-file manifests
(`circle-review/retained-files.json`, `horn-review/retained-files.json`,
`quadratrix-review/retained-files.json`, `copying-review/examples.json`,
`desk-artifacts.json`) and the digest quoted in `ratios-review.md` describe the
new files.

Left as October records of the earlier captures: the hosted and publication
receipts (`illustrated-review/hosted.json`, `mesolabe-hosted-browser.json`,
`circle-publication/`, `horn-publication/`, `quadratrix-publication/`,
`ratios-publication/`, `copying-review/public-*.json`, `desk-hosted.json`,
`measure-*hosted-browser.json`), the receipts of the four stale scripts
(`desk-browser.json`, `measure-browser.json`, `measure-feedback-browser.json`,
`closure-browser.json`, `copying-review/browser.json`), and the solids and
offline-response clean-build, PDF-structure, fault and retained receipts.
