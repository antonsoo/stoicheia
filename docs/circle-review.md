# Circle workshop review

Local implementation and direct review, 2026-10-25. This addition has not been
pushed or deployed. Existing publication receipts describe the earlier seven-room edition.
This review makes local claims.

## What the learner can do

Open `circle.html` from the course's companion-workshop disclosure. Begin with
the two hexagons, then halve the angle four times. The polygons keep one radius
and equal horizontal and vertical scales; the separate number line explicitly
magnifies the interval between the rational bounds.

Try **591.15 on the outer path**. Its twelve-sided H fails the exact square
test. The endpoint from that row's already-established A remains justified;
the next A is the first perimeter divisor to depend on the unsafe H. Later
locally safe comparisons cannot repair the chain. **2017.24 on the inner path**
provides a different dependency: its current n/H already uses that approximation.

The point is the distinction between a plausible number and the argument that
establishes it. The app does not declare a final candidate false merely because
the selected calculation no longer proves it. Restoring the printed numbers
recovers the two complete arguments.

Eight selected Greek/Latin/English readings, sixteen word notes and ten full
pages remain connected to the experiment. The source keeps Heiberg's printed
Latin **sphaerae** against Greek **κύκλου**, as well as approximation steps whose
printed equality cannot be an exact numerical identity. The modern audit
supplies explicit directed inequalities instead of silently altering the edition.

## Evidence boundaries

| Layer               | Direct evidence                                                                                                          | Limit                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Implementation      | `2ebf016`, `6296e3e`, `cdaac13`, `13d35d2`; exact arithmetic, reader, exports, print correction and complete SVG notices | Local commits                                                                       |
| Build               | [142-file identity receipt](circle-review/build.json), Node 24.22.1                                                      | Static `dist/`, not hosted bytes                                                    |
| Browser use         | [Four configurations](circle-review/browser.json)                                                                        | Chromium 153.0.8010.12 / Firefox 155.0, 1440 and 375 px                             |
| Offline edition     | All 141 precached paths matched the generated worker's inventory                                                         | The worker itself is the additional build file; no old-to-new edition upgrade claim |
| Mathematical audit  | [Downloaded-ledger receipt](circle-review/downloaded-ledgers.json)                                                       | Exact fractions and ideal Euclidean geometry, not physical measurements             |
| Source reproduction | [Original PDF and ten reproduced pages](circle-review/source.json)                                                       | A later critical printed witness, not an autograph                                  |
| Saved reading       | [Retained native files](circle-review/retained-files.json)                                                               | HTML compressed losslessly; no scripts or remote subresources                       |
| Printed reading     | [Actual PDF inspection](circle-review/print.json)                                                                        | Physical printing and tagged-PDF accessibility unverified                           |

## What was exercised

All four browser configurations followed the rendered course disclosure into
the room, used keyboard controls, switched proof directions, applied and
rejected approximations, restored the original record, reopened JSON, rejected
an unsupported file, restored a shared address and used browser history.
Unapplied form text never replaced the record used by a download.

Each read all eight selections, checked every displayed source image against
its retained SHA-256, enlarged a page and scrolled it with the keyboard.
Actual CSV, JSON, font-embedded SVG and illustrated HTML downloads were saved.
The browser's native files, rather than independently generated stand-ins,
were used for the subsequent artifact checks.

After matching all 141 cached paths to the current generated inventory, the
server destroyed origin connections. A direct HTTP request failed. Reload,
source display, a new arithmetic trial, illustrated export, course navigation
and return to the new room still worked. The matching edition ID and full
cache inventory were checked before calling that offline-ready.

Separate fresh contexts held a source response, returned to the previous page,
and released the late response. It did not acquire the latest selection's
caption. Substituting another valid JPEG under p.264's URL left the source
hidden and prevented an illustrated file from being downloaded, in both engines.

The complete review reported no page errors, horizontal document overflow or
axe WCAG 2 A/AA and 2.1 AA violations in its four configurations. This is the
scope of the automated accessibility check, not a manual screen-reader audit.

## Mathematical and file checks

`npm ci` followed by `npm run check` passed on **Node 24.22.1**: formatting,
lint, strict typecheck, **80 tests**, and the complete production build. The
print-only layout correction was rebuilt and rechecked in the final four-browser
review. No dependencies were added or registry version changed.

The independent Python checker imports no application code. It uses `Fraction`
for the transmitted rational choices and **100-digit half-angle geometry** for
the exact polygons. It checked **100 cases / 1,000 rows**, including altered
seeds, every supported approximation step, near choices and input extremes.
It also checked **160 rows from sixteen actual browser-downloaded CSVs**.

The representative [saved reading](../examples/circle-reading.html.gz),
[editable record](../examples/circle-settings.json) and
[CSV](../examples/circle.csv) all preserve the same rejected outer-path trial.
They were exported after the origin became unavailable. The reading still
includes the unchanged printed-number proof alongside that trial.

Both the original and rejected-trial HTMLs opened from disk in each engine and
viewport with JavaScript disabled. All ten embedded JPEGs matched the retained
source files and the embedded font matched the local TTF. No automatic remote
request was needed. [Native JSON and CSV links inside the saved HTML](circle-review/portable-downloads.json)
were also exercised with scripts and network disabled; their records matched
the workshop's actual native exports. The separate [SVG inspection](circle-review/svg.json)
confirmed its embedded font loaded, metadata retained the complete MIT and font licenses, and no script
was present.

The retained **24-page PDF** was printed from the actual saved trial reading.
Poppler found every text word inside its page, recovered all ten source JPEGs
byte for byte, and reported all nine font subsets embedded with Unicode maps.
All [88 selected reading fields](circle-review/printed-readings.json), including
Greek, Latin, English, notes and vocabulary, survived text extraction in full
after Unicode and whitespace normalization.
The rendered cover, proof tables and source pages were reviewed. Short ledgers
stay with their headings instead of leaving a table header at the page foot.
The whole-page source images remain readable at their own print scale.

The source check reproduced all ten reductions from the original identified
18,682,803-byte PDF with Poppler 24.02.0. The original title page, PDF p.6,
was visually checked: **MDCCCLXXX**, volume I. It is not the later 1910 edition.

## Reproduce the review

With Node 24, Python 3, Poppler and the existing Playwright Chromium/Firefox
installations:

```sh
npm ci
npm run check
npm run verify:circle-bounds
npm run verify:circle-sources -- --pdf /path/to/Archimedes_VOL_I.pdf
npm run test:circle -- /tmp/stoicheia-circle
python3 scripts/circle-bounds-oracle.py --browser /tmp/stoicheia-circle/review.json
python3 scripts/circle-print.py /tmp/stoicheia-circle/chromium-1440/offline-reading.pdf
```

The source command downloads the manifest-identified original when `--pdf` is
omitted. Build before the browser run and leave `dist/` unchanged during it.
`npm run build` writes the complete static site to **`dist/`**.

All sixteen CSVs are retained at the receipt's relative paths, so this works
without a new browser run:

```sh
python3 scripts/circle-bounds-oracle.py --browser docs/circle-review/browser.json
python3 scripts/circle-print.py examples/circle-reading.pdf
gzip -dc examples/circle-reading.html.gz > /tmp/circle-reading.html
```

Per-browser HTML/PDF paths in the browser receipt identify that
execution's output directory; those large duplicate files are not all committed.
The representative retained reading and PDF have their own byte identities.
The canonical app link inside the saved file will require this room's publication;
the reading itself is independent of that link.

The [development receipt](circle-review/development.json) separately exercised
the actual Vite entry, source viewer, altered bound and JSON download at 375 px,
without page or console errors. Development mode correctly makes no claim to
have saved a production offline edition.

## Visual assessment and limits

[Desktop](assets/circle-desktop.png), [phone](assets/circle-mobile.png) and
[the failed outer-path ledger](assets/circle-broken-audit.png) are actual browser
screenshots. The pale-blue course identity, restrained serif and large geometric
plate remain coherent with the existing reader. On a phone the side-count
controls and polygon arrive before the longer proof controls. The ledger uses
an explicitly scrollable region instead of squeezing six columns into the page.

The model accepts the inner/circle/outer perimeter inequalities. It does not
prove a general theory of arc length, reconstruct ancient computing instruments,
or establish how the starting root bounds were discovered. Only one alteration
is retained at a time. The chosen fraction changes the arithmetic, not the
source text or the underlying polygon drawing. Decimal labels and the separately
magnified interval are not exact physical measurements.

Suggested repository description: **Read Euclid and Archimedes in Greek and Latin with working geometry and original printed pages.**

Suggested topics: `euclid`, `archimedes`, `geometry`, `ancient-greek`, `latin`,
`education`, `offline`.
