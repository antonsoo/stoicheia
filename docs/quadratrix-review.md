# Quadratrix workshop: direct review

Local implementation and review, 2026-10-26 UTC. The source changes are
`ad7d41c`, `66d062b` and `8a01748`. This addition has not been pushed or deployed.
The [model notes](quadratrix-model.md) explain the source and mathematical
boundaries; the files below record what was actually operated and saved.

## What changed for the learner

From the course's native companion-workshop disclosure, open **The point the
motion cannot draw**. At the synchronized midpoint, Z is (1/2,1/2). Use **Just
before**, then **Finish exactly**. The first has one crossing; the second has
coincident lines and no unique Z. Adding H draws an open limiting-point marker
without changing that relation.

Play or pause the motion, use the time ruler with a keyboard, or approach the
finish in tenfold steps. Move the rotation's completion to 90% or 110% of the
slider's time. The first comparison exposes an outside-square crossing and
then parallel lines; the second ends at A while the rotating line remains
tilted. The modern limit argument and the source's later theorem are retained
separately from the motion.

Eight selected Greek/Latin/English readings and sixteen word notes connect
the conditions and objections to ten whole source pages. The room preserves
Hultsch's disagreement with the objections' force and identifies the changed
labels in the later theorem. It does not turn a reported objection into an
unqualified verdict about the mathematical curve.

## Evidence and its limits

| Layer                    | Retained evidence                                                 | What it establishes                                                                                                                                       |
| ------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clean source             | [Build identities](quadratrix-review/build.json)                  | An archive of `8a01748`, fresh `npm ci`, full `npm run check` on Node 24.21.0; 91 tests; all 167 output files identical to the reviewed Node 26.7.0 build |
| Development              | [Two quickstart journeys](quadratrix-review/development.json)     | The rendered course link, verified source page and exact-finish control work in Chromium and Firefox                                                      |
| Production               | [Four browser configurations](quadratrix-review/browser.json)     | Chromium 153.0.8010.12 and Firefox 155.0, each at 1440 and 375 pixels; actual controls, downloads, history, imports and saved readings                    |
| Arithmetic               | [Independent model comparison](quadratrix-review/oracle.json)     | 3,039 motion states checked with 90-digit standard-library Python arithmetic                                                                              |
| Actual drawings and data | [Downloaded geometry](quadratrix-review/downloaded-geometry.json) | 196 actual CSV rows and 28 actual SVG diagrams agree with independent line equations; axis scales agree                                                   |
| Sources                  | [Page reproduction](quadratrix-review/sources.json)               | All ten JPEGs reproduce byte-for-byte from the identified original PDF with Poppler 24.02.0                                                               |
| Edition upgrade          | [Four upgrade configurations](quadratrix-review/upgrade.json)     | A build of prior source `115c3f3` upgrades to the ten-room edition, including delayed/substituted new scans and existing tabs                             |
| Portable reading         | [Actual retained files](quadratrix-review/retained-files.json)    | Four browser configurations generated the same HTML; embedded source/font bytes, native data and licenses were checked                                    |
| Print                    | [Printed-file review](quadratrix-review/print.json)               | The actual 19-page PDF retains all sixteen complete language passages in order, ten source captions, embedded fonts and text inside page margins          |

These are local source, build, browser and artifact claims. They establish
neither current hosted bytes nor a successful CI run. CI is configured to run
the new model and browser comparisons; it was not run remotely in this review.

## The browser journey

Each configuration began in the rendered course and followed the real link.
It operated preset buttons, the native range with Home, ArrowRight and End,
the limiting-point checkbox by keyboard, changed timing and the source-page
selectors. It played the animation, paused it and verified the paused time
stayed fixed. A deliberately earlier first frame exercises the Firefox
negative-elapsed-time boundary that was found and fixed during review.

All eight displayed Greek and Latin selections matched the retained content.
All ten displayed source-image Blob identities matched the manifest. The
viewer enlarged and scrolled by keyboard; changing pages and browser history
restored the right source. A held older request could not replace a newer
selection, including a return to the page displayed before the held request.
A valid JPEG from another retained page was rejected under the wrong identity;
the source stayed hidden and saving the illustrated reading was refused.

The real JSON download reopened the time, timing choice, reading and source.
An invalid negative-time record left the experiment unchanged. Visible share
links followed later changes and restored the complete record after navigation.
The exact-finish CSV kept empty crossing coordinates and the explicit
`coincident` relation. The limit was in its own `limit_not_crossing` row.

All four production configurations had no page errors, recorded CSP violations
or axe WCAG A/AA violations in the checked final state. This automated check
does not establish complete accessibility or a screen-reader audit.

## Disconnected use and saved files

Each worker inventory contained all 166 expected precached paths; `sw.js` is
the additional, 167th build file. After current-edition readiness, the server's
connections were destroyed and requests refused. The page reloaded, changed
source, saved new SVG/CSV/HTML files, followed the course link and returned to
the new room without that origin.

The native SVG opened as XML with scripts disabled; its actual embedded font
loaded and metadata retained the full MIT and OFL notices. The saved reading
also opened with scripts disabled and automatic HTTP(S) requests blocked.
Its ten JPEGs and font matched the source identities, all language pairs
remained, and its own JSON/CSV download links reproduced the native record.

The retained [editable JSON](../examples/quadratrix-settings.json),
[CSV](../examples/quadratrix.csv) and
[SVG](../examples/quadratrix-plate.svg) represent the same final experiment as
the [illustrated HTML, gzip](../examples/quadratrix-reading.html.gz).
Decompress the HTML before opening it. Its SVG metadata and editable JSON
agree; the CSV preserves the non-unique final crossing. The
[PDF](../examples/quadratrix-reading.pdf) is a real Chromium print of that
reading. It is untagged; physical printing was not tested.

The original serif's cmap contains all 72 non-ASCII characters used in the
new source-content file, with [no missing glyphs](quadratrix-review/font-coverage.json).
The [desktop](assets/quadratrix-desktop.png) and
[phone](assets/quadratrix-mobile.png) screenshots show the actual controls and
final-state distinction. The diagram remains proportional on phones, while
its critical relation and numerical explanation remain ordinary readable text.

## Reproduce

From the repository root, with Node 24 or newer and Python 3:

```sh
npm ci
npm run check
npm run verify:quadratrix
npm run test:quadratrix -- /tmp/stoicheia-quadratrix
python3 scripts/quadratrix-oracle.py --browser /tmp/stoicheia-quadratrix/review.json
python3 scripts/quadratrix-print.py /tmp/stoicheia-quadratrix/chromium-1440/reading.pdf
```

The browser command starts its own production servers and uses the existing
Playwright Chromium/Firefox installations. The Python oracle uses Machin's
formula for pi, independent sine/cosine series and determinant line
intersections; it imports no app code. Browser mode reads the actual CSVs and
SVG attributes recorded from the DOM. The retained evidence can be rechecked
without rerunning the browsers:

```sh
python3 scripts/quadratrix-oracle.py --browser docs/quadratrix-review/browser.json
python3 scripts/quadratrix-print.py examples/quadratrix-reading.pdf
```

With Poppler installed, reproduce the source reductions, supplying the
identified PDF or allowing the script to download it:

```sh
npm run verify:quadratrix-sources -- --pdf /path/to/pappialexandrin00hultgoog.pdf
```

To repeat the upgrade, build a separate checkout of `115c3f3`, then pass its
`dist/` directory while the current `dist/` is present:

```sh
npm run test:quadratrix-upgrade -- /path/to/previous/dist /tmp/quadratrix-upgrade.json
```

For a manual production preview, `npm run build` writes `dist/` with base
`/stoicheia/`; `npm run preview` serves it on port 4327. Open
`http://127.0.0.1:4327/stoicheia/quadratrix.html`.

Suggested repository description: **Read Euclid, Archimedes and Pappus through
working geometry, Greek, Latin and the printed evidence.** Suggested topics:
`euclid`, `pappus`, `geometry`, `ancient-greek`, `latin`, `education`,
`quadratrix`, `offline-first`.

## Known limits

The one-million-tick interface is finite, and its trigonometric coordinates
are floating-point approximations. Neither the samples nor the animation prove
the limit. The displayed squeeze argument supplies the general modern
reasoning; the original pages retain a different historical argument.

No exact physical synchronization device, ancient mechanical reconstruction,
straightedge-and-compass quadrature, physical print calibration, tagged-PDF
accessibility, new critical edition or complete Pappus course is claimed.
The new room remains local pending publication review.
