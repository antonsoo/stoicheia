# Book X common-measure workshop: local review

Reviewed 2026-10-25. The addition is implemented in this checkout and local
commits. No push, tag, registry release or public deployment was performed.
Existing publication receipts elsewhere in this repository concern earlier
rooms and do not establish publication of `measure.html`.

## What the learner can do

Fit one shorter length into the longer, then turn to the remainder. Find an
exact final measure for a fraction; compare a fraction's eight matching copy
counts with the square diagonal's strictly positive eighth remainder; and
separate that finite observation from the recurrence argument X.2 requires.
The whole-scale ruler prevents local magnification from hiding how small the
measures become. The squares introduce a different, area-based common measure.

Ten Greek/Latin/English readings connect these operations with the printed
definitions and X.2–3. The second definition's note also explains Book X's
different meaning of `rationalis`. Twelve whole pages retain the apparatus
and annotations. The source is [Heiberg's 1886 volume III](https://www.wilbourhall.org/pdfs/HeibergEuclidVolume_3.pdf),
not the 1883 volume I used by the main course.

The [model decisions](measure-model.md) derive the arithmetic and proof,
define the difference between an actual partial turn and the separate
calculated comparison, and state the source/transcription boundaries.

## Concrete results

| Evidence                                                     | Observed result                                                                                                                                                       |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Fresh local clone](measure-clean.json)                      | Node 24.21.0; clean install, formatter, typecheck, 68 unit tests and production build pass; working tree remains clean                                                |
| Production identity                                          | All 125 files from the clean Node 24 build match the SHA-256 values of the browser-reviewed Node 26.7.0 build                                                         |
| [Independent arithmetic](measure-arithmetic.json)            | 5,556 examples; 25,730 division turns; 77,190 exact length readings agree with Python Fraction and 110-digit Decimal                                                  |
| [Actual rendered/downloaded values](measure-rendered.json)   | 48 actual SVG length ratios and 32 actual CSV records independently checked                                                                                           |
| [Source regeneration](measure-sources.json)                  | The identified PDF reproduces all twelve retained full-page JPEGs byte for byte with Poppler 24.02.0                                                                  |
| [Production browser workflows](measure-browser.json)         | Chromium 153 and Firefox 155 at 1440 and 375 px; native files, history, source zoom and disabled-origin operation pass                                                |
| [Edition upgrades](measure-upgrade.json)                     | Both engines upgrade the actual six-room baseline; held and substituted new scans prevent readiness; recovery replaces the old cache with one complete 124-file cache |
| [Development quickstart](measure-development.json)           | Node 24 development server; both engines and widths retain correct styling and standalone export; no service worker installed                                         |
| [Original course regression](measure-course-regression.json) | Both engines and widths replay all 174 reading steps and existing construction/source/file/offline workflows; no page errors, CSP violations or external requests     |
| [Native PDF](measure-print.json)                             | 30 A4 pages; 3,352 text words inside page bounds; all six fonts embedded; twelve extracted JPEGs byte-identical to the retained scans; no JavaScript                  |

The recorded clean source commit is `8914ab8a94cc82246cc3797226aa7ff0f649b30e`.
The final documentation commit adds the receipts, examples, screenshots and
README guidance without changing any production build input.

Implemented source history (`git log --oneline -4` at that checkpoint):

```text
8914ab8 style: align the retained publication table for the formatter
017f493 test: exercise exact measurements source failures and saved readings
f4c80ae feat: add an operable Book X ruler and portable illustrated reading
51765bd feat: model exact common measures and preserve the Book X source
```

The nonzero diagonal remainder at turn eight is `577 - 408*sqrt(2)`. The
fraction 577/408 instead ends at a common measure 1/408, fitting its original
lengths 577 and 408 times. The first four displayed decimals and all eight
copy counts agree; their exact remainders do not. The arithmetic review also
covers equal inputs, unreduced fractions and large final quotients. The
10000/9999 browser case fits 9,999 remaining copies together and verifies
the original lengths without drawing thousands of individual cuts.

## What was operated in browsers

The production review follows the course's real new-room link, operates the
first turns with Enter, and checks focus after fitting, turning and finding
an exact measure. It completes 3/2 and 577/408, switches to the diagonal at
the same turn, and verifies the distinct exact-zero outcomes. It exercises
custom input refusal, the 24-turn limit, malformed links and share URLs.

The reading/source journey selects a clause, opens its Latin page, selects
another page, uses browser Back, enlarges the verified image and pans with
the keyboard. It opens the recurrence explanation and answers the Greek
`never` question. The selected reading and independently selected source
page survive history navigation.

The reviewer downloads the real HTML, SVG and CSV. Every embedded source
image is hashed against the manifest. The HTML opens under `file:` in each
engine and viewport with networking disabled, all twelve images present and
no HTTP requests. Its embedded CSV download matches the original CSV bytes.
The production origin is then stopped and browser networking disabled:
reload, source selection, another illustrated export, and the journey back
through the main course into a fresh measurement all work.

Automated accessibility checks report zero findings in the selected deep
24-turn state in each engine/width. These checks do not establish complete
accessibility for every state, device or assistive technology. Keyboard
workflows and page-wide overflow are separately checked.

## A held page is not a saved edition

The upgrade review first installs the pre-change source `1855a95` on a local
origin. It then serves the seven-room build on the same origin and holds the
new p.13 request from both the viewer and worker. The page remains pending
and hidden; the new edition does not claim offline readiness.

In the substitution case, a different valid JPEG is returned with HTTP 200.
The viewer rejects its identity, the complete worker install fails, and
illustrated export refuses without emitting a download. Restoring the right
page and signalling reconnection permits recovery. The old already-open
course tab then offers a reload and gains the new-room link. After the
origin closes, the current room reloads, verifies p.13, and operates offline.

The old build used the same installed toolchain rather than claiming a second
clean install. The separate Node 24 clone receipt supplies clean-install
evidence for the implemented source. Worker identities and cache counts are
retained in the upgrade record.

## Artifacts and visual review

- [Working ruler, desktop](assets/measure-desktop.png): a partial fourth turn,
  with exact lengths beside the local ruler and controls.
- [Phone](assets/measure-phone.png): the same operation controls move above the
  drawing, avoiding a long scroll between a button and its result.
- [Parallel reading](assets/measure-reading.png): the condition containing
  `never`, in Greek, Latin and new English with a contextual note.
- [Saved HTML, gzip-compressed](../examples/common-measure.html.gz): extract
  before opening; decompression gives the original 6,189,784 downloaded bytes.
- [30-page PDF](../examples/common-measure.pdf), [exact CSV](../examples/common-measure.csv),
  and [ruler SVG](../examples/common-measure.svg): actual browser downloads.

All three retained screenshots were opened and inspected. The local drawing,
long expressions, controls and reading remain legible at their intended
desktop/phone widths. The proof page of the actual PDF was also rendered and
inspected. The original course review regenerates earlier screenshots and
examples as a side effect; those unrelated tracked artifacts were restored,
and its new replay receipt was retained separately.

## Reproduce

From the repository with Node 24 or newer and installed Playwright Chromium
and Firefox:

```sh
npm ci
npm run check
npm run verify:measure
npm run verify:measure-sources -- --pdf /path/to/HeibergEuclidVolume_3.pdf
npm run test:measure -- /tmp/stoicheia-measure
python3 scripts/measure-oracle.py --browser /tmp/stoicheia-measure/review.json
python3 scripts/measure-print.py /tmp/stoicheia-measure/chromium-1440/reading.pdf
```

The source reviewer can download the identified PDF when `--pdf` is omitted.
The source and print commands use Poppler. Reproduction with another Poppler
version can produce different JPEG bytes. The browser script starts its own
servers; keep `dist/` unchanged while it runs.

For the actual earlier-to-current upgrade, build `1855a95` in a separate local
checkout, then run:

```sh
npm run test:measure-upgrade -- /path/to/previous/dist /tmp/measure-upgrade.json
```

`npm run dev` serves the current checkout at
`http://127.0.0.1:4327/stoicheia/`; open `measure.html`. Development does not
install a worker. Stop development before using `npm run preview` on the same
port. `npm run build` writes the complete static production site to **`dist/`**,
with base **`/stoicheia/`**. Publication remains a separate action.

## Limits and repository description

This is a selected Book X reading and a modern mathematical specialization,
not a complete critical edition or a reconstruction of an ancient ruler.
The recurrence argument is explained and exact identities are checked; the
software is not a formal proof verifier. Decimal/coordinate rounding remains
visible and never decides exact zero. Twenty-four turns bound the interactive
exploration. Translations and grammar merit independent philological review.

The generated PDF is untagged. Physical printing, paper tolerances, screen
readers and devices outside the reviewed configurations were not tested.
External edition/application links require a connection; the saved source
images and font do not. No hosted-byte, public-browser or CI-run claim is made
for this addition.

Suggested description: **Read Euclid's Greek and Latin with working constructions,
exact length experiments and inspectable printed sources.**

Suggested topics: `euclid`, `ancient-greek`, `latin`, `geometry`,
`incommensurability`, `education`, `offline-first`.
