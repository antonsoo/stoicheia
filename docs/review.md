# Course review

Stoicheia connects the complete Greek and Heiberg Latin texts of Euclid I.1–6
with a new English reading, calculated diagrams and the justification for each
step. The course has 52 aligned steps, 31 vocabulary entries, 13 foundation
statements and 12 passage exercises. Twenty-two printed pages can be inspected
inside the reader, including when the production edition is offline.

| Proposition | Work performed                                             | Earlier propositions used |
| ----------- | ---------------------------------------------------------- | ------------------------- |
| I.1         | Construct an equilateral triangle                          | None                      |
| I.2         | Transfer a separate length to a point                      | I.1                       |
| I.3         | Cut a length from a greater segment                        | I.2                       |
| I.4         | Compare triangles by superposition                         | None                      |
| I.5         | Compare two pairs of triangles and subtract equal angles   | I.3, I.4                  |
| I.6         | Derive a contradiction from unequal sides and equal angles | I.3, I.4                  |

The substantive additions go beyond more text. I.4’s intermediate motion
preserves its shape. I.5 shows the overlapping triangle correspondences and the
angle subtraction separately. I.6 distinguishes the hypothetical scalene sketch
from the equal-angle given that it cannot satisfy; that distinction remains in
SVG and HTML downloads. Implementing I.5 also exposed and corrected an I.3
construction failure when the reference shares the starting endpoint.

Readers can consult the starting permissions in Greek, Latin and English directly
from a step’s reason. Heiberg’s expanded common-notion numbering is shown beside
the usual five-item list. Greek-first and Latin-first modes hide the other
readings until requested; the exercises focus on actual syntax and referents,
with explanations of each offered interpretation and links back to the passage.
The statement route moves keyboard focus with the visible reading position.

## Run and export

Use Node.js 24 or later. In the checkout, `npm ci` followed by `npm run dev`
serves `http://127.0.0.1:4327/stoicheia/`. `npm run build` writes the complete
static site to `dist/`. After stopping development, `npm run preview` serves it.

The [I.2 study sheet](../examples/stoicheia-I2-study.html) and
[I.6 contradiction sheet](../examples/stoicheia-I6-study.html) are actual
browser downloads. Each opens directly as a file without scripts or network
access. They contain all three languages, the selected diagram, notes, reasons
and the foundation statements invoked by that lesson.

## Verification

The continued course was exported from Git and installed with Node 24.22.0 in a
fresh directory. Its exact source commit, build-input digest and commands are
recorded in [the build receipt](build-verification.json). The digest includes
source, public assets, configuration and lockfile; it excludes generated reports
and documentation. Documentation-only commits therefore need not change it.

| Check                      | Result                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `npm ci`                   | Fresh installation succeeded                                                                      |
| `npm run check`            | Lint, strict typecheck, 17 checks and production build passed                                     |
| `npm run verify:oracle`    | 720 independent circle-construction cases; 4,320 point comparisons and 5,760 equality checks      |
| `npm run verify:triangles` | 480 motion cases, 96 isosceles constructions, 96 contradiction sketches; 8,064 independent checks |
| `npm run test:dev`         | Styled development quickstart and navigation in Chromium and Firefox                              |
| `npm run test:browser`     | All 52 steps in each of four browser/viewport configurations; 72 accessibility audits             |
| Source and reading tools   | All 22 scans, 13 foundations, 12 exercise feedback paths and translation reveal/reset             |
| Offline and exports        | Worker-served reload with local origin unavailable; source images, lessons and saved files opened |
| HTTP bytes                 | All 30 production files matched the clean build                                                   |

The [circle oracle](geometry-oracle.json) uses 60-digit Python `Decimal`
arithmetic and general circle intersections, without importing app code. Its
maximum relative coordinate error is `1.1526305883259686e-15` against `2e-12`.
The [triangle oracle](triangle-oracle.json) independently uses cosine-law angles,
shoelace areas and distances. Its maximum relative error is
`3.637978807091713e-12` against `2e-11`. It checks both I.5 correspondences and
requires I.6’s sketch to have unequal base angles and a strictly smaller inner
triangle. Neither oracle is a formal derivation from Euclid’s axioms.

The [browser receipt](browser-verification.json) covers Chromium 153.0.8010.12
and Firefox 155.0 at 1440 × 1000 and 375 × 812. It also checks keyboard ranges,
actual SVG coordinates, nested dialog focus return, source zoom and panning,
shared-state reload and history, invalid hypotheses, and real downloaded files.
Page errors, external requests and content-policy violations were zero.
Automated accessibility audits do not substitute for a screen-reader study.

The offline control disconnects the local origin below the browser, verifies
that it is unreachable, enables browser offline emulation, and requires a
worker-served navigation. Keeping an already loaded page visible would not pass.
The [quickstart receipt](quickstart-verification.json) is separate: development
loads CSS through an HTML stylesheet link and does not install a service worker.

Native printing exposed a separate reproduced defect: printing I.5 with its
full passage collapsed produced a blank page at source commit `18ddf2b`.
The print lifecycle now expands the passage and restores the original open/closed
state afterward. Twelve actual Chromium PDFs (all six lessons, both initial
states) were independently extracted with Poppler; every language paragraph and
step title was present. The [print receipt](print-verification.json) records the
PDF hashes. Firefox’s print layout and restoration were tested through emulated
print media and dispatched events; a native Firefox PDF was not produced.

## Visual review

Retained production screenshots cover the construction reader, all three new
triangle workflows, and the foundations and passage exercises on desktop and
phone:
- [Construction and parallel text](assets/hero.png)
- [Full I.1 view](assets/first-construction.png) and [I.2 view](assets/length-transfer.png)
- [Phone plate](assets/phone-plate.png) and [phone passage](assets/phone-passage.png)
- [Superposition](assets/superposition-1440.png) and [phone view](assets/superposition-375.png)
- [Angle subtraction](assets/isosceles-1440.png) and [phone view](assets/isosceles-375.png)
- [Contradiction](assets/contradiction-1440.png) and [phone view](assets/contradiction-375.png)
- [Foundations](assets/foundations-1440.png) and [phone view](assets/foundations-375.png)
- [Reading practice](assets/reading-practice-1440.png) and [phone view](assets/reading-practice-375.png)

The blue geometric plate and white text panel separate the diagram from the
argument. On the phone they become a vertical flow with explicit links between
plate and sentence. Foundations use a statement picker on narrow screens. The
source languages remain readable, controls have usable spacing, and tested views
have no horizontal page overflow. These are browser viewport observations, not
evidence from physical phones.

## Editorial and mathematical boundaries

- Heiberg’s Latin is a nineteenth-century translation. The Greek is a modern
  printed critical edition, not an autograph of Euclid. Language notes and
  transcriptions remain open to philological correction.
- The p. 6 scan has a cropped margin. Definition 20’s Greek was cross-checked
  against the text quoted in Heath’s commentary; the entry and manifest disclose
  that supplementary source. The reader retains editorial brackets and does not
  invent Latin for bracketed common notions omitted by the facing translation.
- I.1’s intersection gap and I.4’s superposition assumption are named. The
  interactive models illustrate them in the real plane; they do not repair the
  axiomatic gaps. I.4’s motion uses rotation and translation; reflecting both
  displayed triangles does not demonstrate a reflected correspondence.
- I.2 and I.3 reuse the earlier constructions. Their internal working is available
  in those earlier lessons. The app is not an arbitrary straightedge-and-compass
  editor or a general Greek parser.
- Offline readiness applies to a successfully cached production build, not the
  external commentary or full original volume. Browser storage can be cleared.

## Publication evidence

The [public course](https://antonsoo.github.io/stoicheia/) and
[source repository](https://github.com/antonsoo/stoicheia) are published.
[Direct HTTPS verification](publication-verification.json) matched all 30 hosted
files to the reviewed clean build and exercised Chromium and Firefox at desktop
and phone widths. It covers the six final steps, superposition, angle subtraction,
foundations and nested source scans, the contradiction notice, Greek-first
reading, passage practice, shared URLs and worker-served offline-emulation reloads.
The public origin was not disabled in this hosted check; the local suite supplies
that stronger offline control.

The public repository was also cloned over HTTPS, installed with Node 24.22.0,
and run through the documented development quickstart in both browsers. GitHub
Pages serves the reviewed `gh-pages` branch. These records make no remote CI or
package registry release claim.
