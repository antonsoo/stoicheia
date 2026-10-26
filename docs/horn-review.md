# Horn-angle workshop review

Local implementation and direct review, 2026-10-26 UTC. The implementation is
`cfdfd92`, `64c8214` and `9d9430e`; this record keeps source, build, browser use and portable
files separate. The [publication review](horn-publication.md) separately records the current public
edition. Public hosting is not established by the local checks below.

## What the learner can do

Enter a signed whole-number rise and a positive run. A normal upward ray cuts
the circle. Try **Hide the crossing**: rise 1, run 1,000,000. H and Κ merge with
A in the overview, but the exact squared deficit stays **1/1000000000001**.
The local crop reveals H inside, with equal horizontal and vertical scales.
Its scale also appears as ordinary readable text outside the SVG on phones.

Try zero rise, then point away. Neither supplies a positive angle in the gap:
the tangent coincides, while the negative ray goes to the other side. Toggle
between the perpendicular-foot and second-root witnesses. Read the geometric
contradiction separately; finite supported inputs do not establish the
universal theorem by enumeration.

Eight selected Greek/Latin/English readings and sixteen contextual word notes
remain tied to six whole printed pages. Reading 8 retains the Greek editorial
bracket and labels its Latin companion **an editorial note, not a translation**.
The source diagram's impossible supposition remains distinct from the realizable
coordinate trial. The modern diagram is reflected and adds Κ.

Save the selected experiment as JSON, exact CSV, a font-embedded SVG or one
script-free illustrated reading. The reading retains both modern witnesses,
the geometric argument, every reading and source page, editable data, font and
licenses. Its embedded JSON/CSV links work from disk with scripts and automatic
remote requests disabled. The PDF keeps whole copied language passages in order.

## Evidence boundaries

| Layer             | Direct evidence                                                                                                                        | Limit                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Implementation    | `cfdfd92`, `64c8214`                                                                                                                   | Local source commits at this review                             |
| Build             | [153-file identity receipt](horn-review/build.json), Node 24.22.1, 86 tests                                                            | Static output, not hosted files                                 |
| Browser operation | [Four configurations](horn-review/browser.json)                                                                                        | Chromium 153.0.8010.12 / Firefox 155.0, each at 1440 and 375 px |
| Exact geometry    | [298 generated trials](horn-review/oracle.json) and [24 native CSVs / 1,448 actual SVG vertices](horn-review/downloaded-geometry.json) | Ideal Euclidean circle and coordinate model                     |
| Source            | [Reproduced pages](horn-review/source.json)                                                                                            | 1883 printed witness, not an autograph                          |
| Cached edition    | All 152 precached paths matched the worker's current inventory                                                                         | The worker is the additional build file                         |
| Upgrade           | [Eight-room to nine-room runs](horn-review/upgrade.json)                                                                               | Actual previous Pages files on a local origin                   |
| Portable files    | [Retained identities](horn-review/retained-files.json)                                                                                 | Lossless gzip for the large HTML                                |
| Print             | [Actual 15-page PDF](horn-review/print.json)                                                                                           | Physical printing and tagged-PDF accessibility unverified       |

## Native workflow

All four contexts started in the rendered course, opened its native companion
disclosure and followed the actual link. They used keyboard presets and witness
controls, tested invalid input without replacing the experiment, and verified
that an unapplied draft did not become a native JSON download.

The runs exercised the smallest supported positive slope, 45 degrees at the
largest supported integer inputs, zero and outward rays, plus a second fine
crop at run 10,000. Every selected Greek and Latin passage matched the retained
content. All six displayed source-image Blob identities matched the manifest.
Enlargement, keyboard scrolling, reading-to-source navigation and browser
history worked. JSON reopened the reading and source page; unsupported versions
left the record unchanged. Visible share links followed subsequent applied
witness changes.

Both native SVGs and saved readings opened with scripts disabled. The SVG was
parsed as XML in each engine, its actual embedded Noto face loaded, and its
metadata retained complete MIT and OFL notices. Both native links inside the
HTML were clicked; their data matched its record and the actual workshop CSV.
No automatic remote request was needed. The reading's six embedded JPEGs and
font matched the retained file identities, and all eight language pairs remained.

The independent Python checker imports no app code. Fraction vector equations
check line incidence, perpendicularity, circle membership, signed forward
parameters and points before/after the second crossing. Browser mode reads the
actual native CSVs, rather than regenerated stand-ins. The fine-crop paths were
recovered from the real DOM and checked against 80-digit Decimal circle geometry;
their screen transformations had equal horizontal and vertical scale.

The complete local origin then destroyed its connections. A direct request
failed. Reload, source display, a new shallower trial, illustrated export,
course navigation and return still succeeded. Cache readiness required the
matching edition identity and every generated path.

Separate contexts held a later source response, returned to the currently
displayed page, then released it. The late response did not acquire the current
caption. Substituting another valid JPEG under p.210's URL hid the source and
prevented an illustrated download in both engines.

The four configurations reported no page errors, horizontal document overflow
or axe WCAG 2 A/AA and 2.1 AA violations in this scope. This does not establish
manual screen-reader operation.

## Export corrections found during review

- Full SHA-256 strings initially widened the saved reading on phones. Source
  captions now wrap while retaining the complete identities.
- Compiled CSS introduced `<` in media comparisons inside the SVG. The CSS
  now uses XML text escaping; both engines explicitly check parser errors,
  rather than accepting a partially parsed document.
- Parallel printed columns initially interleaved Greek and Latin during PDF
  text extraction. The print layout now places the languages and word notes
  sequentially. All **96 selected reading fields plus the full MIT notice**
  survived extraction after Unicode/whitespace normalization.

The retained PDF has 15 A4 pages. Every extracted word lies within its page;
all six JPEGs were recovered byte for byte; all seven font subsets are embedded
with Unicode maps. The cover, proof and source pages were visually inspected.
The original title on PDF p.7 was also inspected: **MDCCCLXXXIII**, volume I.

Review also reproduced a public circle-workshop bug: generate a share link at
six sides, select ninety-six, and the copy field still encoded stage 0 while
the address encoded stage 4. Visible fields now track later applied changes
in both rooms. The existing circle journey was repeated in both engines and
widths, including source identities, native files and offline operation; its
160 native CSV rows still passed the independent polygon checker.

## Reproduce

With Node 24, Python 3, Poppler and the existing Playwright browsers:

```sh
npm ci
npm run check
npm run verify:horn
npm run verify:horn-sources
npm run test:horn -- /tmp/stoicheia-horn
python3 scripts/horn-oracle.py --browser /tmp/stoicheia-horn/review.json
python3 scripts/horn-print.py /tmp/stoicheia-horn/chromium-1440/reading.pdf
```

The source command also accepts `--pdf /path/to/euclidisoperaomn01eucluoft.pdf`.
Both the supplied-copy and fresh-download paths reproduced all six reductions
with Poppler 24.02.0. Build before the browser review and keep `dist/` unchanged.
The actual retained CSVs support review without another browser run:

```sh
python3 scripts/horn-oracle.py --browser docs/horn-review/browser.json
python3 scripts/horn-print.py examples/horn-reading.pdf
gzip -dc examples/horn-reading.html.gz > /tmp/horn-reading.html
```

For the upgrade, supply the actual earlier static tree
`2d37b8ee0c970c94c4f4ec87757937dd68d72833`:

```sh
node scripts/horn-upgrade.mjs /path/to/eight-room-static-tree /tmp/horn-upgrade.json
```

Held and substituted requests prevented premature readiness. Restoring the
correct image recovered installation and export. The previous course tab
announced the different edition, reloaded to expose the new link, and the
complete current cache remained after the origin was disabled in all four runs.

The [development receipt](horn-review/development.json) separately checks the
actual Vite entry at 375 px, a tiny trial, the bracket reading, source display
and native JSON. It correctly reports development mode instead of production
offline readiness. The large duplicate HTML/PDF paths in the browser receipt
describe that execution's output directory; representative native files have
their own retained identities.

## Visual review

[Desktop](assets/horn-desktop.png), [phone](assets/horn-mobile.png) and
[the tiny-ray bench](assets/horn-tiny-bench.png) are real browser captures.
The two plates preserve the reader's pale-blue paper and dark ink. The local
crop makes the interior distance visible without turning a tiny angle into
a large one through unequal axes. On phones the plates stack, exact fractions
wrap, and their explanatory scale is ordinary readable text outside the image.
