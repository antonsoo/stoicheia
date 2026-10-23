# Three lengths: can they close?

The new `triangle.html` workshop turns I.20's necessary inequality into I.22's
construction problem. It keeps the three lengths independent, including inputs
that cannot form a triangle. A second mode lets the learner turn one fixed arm
and inspect the gap left by the other before revealing the compass result.

The sequential course remains I.1–20. I.22 is a separate, linked investigation;
this change does not claim a complete course through I.22 or add I.21.

## Try the actual experiment

From this checkout, `npm ci` and `npm run dev` serve the app. Open
`http://127.0.0.1:4327/stoicheia/triangle.html`.

Keep Β = 6.0 and Γ = 4.0, then change Α:

| Α    | Circle outcome                     | Why no triangle, or why one exists              |
| ---- | ---------------------------------- | ----------------------------------------------- |
| 1.9  | Separate                           | The radii fall short of the base by 0.1         |
| 2.0  | External tangency                  | The only meeting point lies between the centres |
| 5.0  | Two crossings                      | Every pair exceeds the remaining length         |
| 10.0 | Internal tangency                  | The only meeting point lies beyond the base     |
| 10.1 | One circumference inside the other | Β + Γ falls short of Α by 0.1                   |

The last case still satisfies Α + Γ > Β. That is why checking just the two
radii against the base is insufficient. Both tangencies have zero height and
area. A tangent is never rendered as a completed triangle; disjoint circles
never acquire an invented vertex.

Choose **Try closing it yourself**, focus the angle slider, and use the arrow
keys. Dragging P is an alternative. The first arm remains Α; the second remains
Γ and points towards P. Its tip Q can fall short or extend past P. The displayed
distance is rounded, and a displayed zero is explicitly not treated as an exact
construction. **Reveal the compass result** returns to the computed crossings.

The source's five stages copy ΔΖ = Α, ΖΗ = Β and ΗΘ = Γ before drawing the
circles. Earlier I.2–3 justify those copies; the workshop does not silently
introduce an unrestricted compass operation. The alternative vertex connects
to I.7's same-side condition in the existing course.

## Sources and reading

The complete Greek and Latin are transcribed from J. L. Heiberg's
_Euclidis opera omnia_, volume I (1883), printed pp. 52–55, in the
[University of Toronto scan](https://archive.org/details/euclidisoperaomn01eucluoft/page/n66/mode/2up).
All four pages were inspected visually. They are bundled, with the PDF and image
hashes in [the source manifest](../public/sources/manifest.json).

Nine reading units provide the whole statement and proof, new English, language
notes and reasons. Three questions ask about the internal tangent, the copied
lengths, and `πάντῃ μεταλαμβανομένας`. The Latin is Heiberg's nineteenth-century
translation, not an ancient Latin witness.

[Transcription decisions](sources.md#separate-i22-construction-workshop) record
the Greek brackets, missing Latin counterpart, reference marks, circle-name
order and modern labels. The absent intersection justification is explained
without inserting a sentence into the source. The coordinate proof is a modern
argument in the real plane, not a derivation from Euclid's five postulates.

## What was verified

- `npm run check`: lint, TypeScript, 37 tests, production build. The exhaustive
  classification check covers all 1,367,631 allowed triples. Existing lesson
  and state checks still cover the twenty-proposition reader.
- `npm run verify:closure`: 13,490 cases independently checked with 70-digit
  Decimal arithmetic, Heron's area formula, sorted side comparisons and circle
  distances. Maximum absolute discrepancy is approximately 1.21e-14, below the
  1e-12 tolerance. [Machine-readable result](closure-oracle.json).
- `npm run test:closure -- URL OUTPUT_DIRECTORY`: Chromium and Firefox at
  1440 and 375 pixels, actual numeric/range inputs, pointer dragging, keyboard
  operation, all five stages, all nine passages, all three reading questions,
  failed-input handling, reflection and shared state. Geometry is measured
  from the rendered SVG as well as its world coordinates.
- Each browser checks all four displayed scan hashes, actual SVG/CSV/HTML
  downloads, saved SVG opened as XML, standalone HTML without external requests, and navigation between
  both pages with the HTTP origin disconnected. The checks include an
  illustrated reading generated while offline. Reviewed views report no axe
  WCAG A/AA violations. [Browser receipt](closure-browser.json).
- `npm run test:closure-upgrade -- OLD_DIST dist OUTPUT_JSON`: start with the
  previous twenty-proposition edition, hold or fail the new page-55 download,
  then recover. Both engines keep the new edition pending until its inventory
  is complete. Both entry pages and the exact new scan work with the origin
  unavailable afterwards. [Upgrade receipt](closure-upgrade.json).
- `npm run verify:closure-print -- READING.pdf`: Poppler text extraction finds
  all 45 complete Greek, Latin, English, language-note and reason paragraphs.
  [Print receipt](closure-print.json). The PDF was generated by Chromium;
  physical printing was not tested.

The source-image browser check waits for the displayed replacement image to be
complete before calling `decode()`: Firefox can transiently reject the latter
while replacing a lazy image, even while its worker correctly serves the bytes.
This was reproduced with and without the automation offline flag; the final
checks require a displayed image and matching data, not merely an HTTP success.

## Files to inspect

- [Illustrated reading](../examples/stoicheia-I22-reading.html),
  [PDF](../examples/stoicheia-I22-reading.pdf),
  [SVG](../examples/stoicheia-I22-diagram.svg), and
  [CSV](../examples/stoicheia-I22-measurements.csv) are actual browser exports.
  The HTML embeds its font, both responsive diagram layouts, all four scans and
  the complete font and code notices. The SVG retains the code notice in metadata.
- [Desktop trial](assets/closure-trial-1440.png) shows the fixed arms and their
  remaining gap. [Phone construction](assets/closure-contained-375.png) uses
  a portrait plate with readable labels instead of shrinking the desktop SVG.

The [full-course replay](closure-course.json) completed all 164 steps in each
of four browser/viewport combinations, including source inspection, keyboard
controls, downloads and offline use. It records runtime `87c7094`; the later
`251df2e` change adds notices to standalone I.22 downloads and includes the
license in edition hashing; `cae12ed` escapes stylesheet text in SVG downloads. The course geometry, content, controls, rendering
and styles are unchanged between those revisions. The final workshop, download,
clean-build and upgrade receipts describe `cae12ed` separately.

The full-course replay caught the new reader link's insufficient phone target
height. It now has the same 44-pixel minimum height as its neighboring controls.
[Development checks](closure-development.json) also follow the course into the
workshop, verify its local font and exercise the native-print disclosure lifecycle.

Opening the final SVG as XML caught a production-only export defect: the CSS
minifier writes comparison operators containing `<`, which are illegal unescaped
in XML character data. The exporter now escapes the stylesheet, and both browsers
open the downloaded SVG and check its actual geometry. The embedded HTML diagram
is unchanged.

The visual review also corrected slider focus spacing, added mobile jumps
between givens and plate, and kept printed comparison rows together. The
portrait layout is longer than the desktop workbench; those jumps preserve
the selected state while moving between its parts.

## Model and implementation limits

Lengths are integer tenths in the range 1.0–12.0. The strict classification is
exact in that domain. Heights and intersections use floating-point square
roots; displayed values are rounded. The hinge samples integer degrees and
does not certify closure. Units, orientations and numerical measurements are
modern choices; none reconstructs an ancient instrument or measurement.

The new page shares an HTML escaping helper and the existing edition-aware
offline installer. It does not import the course's whole content merely to
escape text. The service worker now resolves an offline navigation to its
actual cached entry page, so `triangle.html` cannot receive `index.html` by
mistake. The original twenty-proposition reader remains available in the same
complete offline edition. External commentary and the full source volume
remain external links; only the bundled scans are included offline.

The transcription is inspectable and merits independent philological review.
Numerical and browser checks establish the implemented model and reviewed
workflows; they are not formal verification of Euclid's axioms.

## Build and publication boundary

`npm run build` writes the complete static app to `dist/`, with base path
`/stoicheia/`. [Clean-install and build evidence](closure-build.json) records
the reproducible output separately from the browser results.

Source `6c09528` was pushed to `main`, and the reviewed `cae12ed` runtime was
published in `gh-pages` commit `b409917`. All 66 hosted files match the reviewed
build by SHA-256. Direct HTTPS workflows in Chromium and Firefox at 1440 and
375 pixels cover the five outcomes, keyboard hinge, actual HTML/SVG downloads,
source page 55 and offline travel between both entry pages.
[Publication receipt](closure-hosted.json). The direct browser command is
`node scripts/closure-hosted.mjs OUTPUT_DIRECTORY`. Earlier receipts describe
earlier editions and are retained separately.

Suggested repository description: “Read Euclid in Greek, Latin and English;
construct the arguments and investigate their hidden conditions.”
Suggested topics: `euclid`, `geometry`, `ancient-greek`, `latin`, `education`,
`interactive-learning`, `offline-first`.
