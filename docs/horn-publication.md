# Horn-angle workshop: public edition

[A line that will not fit](https://antonsoo.github.io/stoicheia/horn.html)
is public in the nine-room edition. Publication was reviewed on 2026-10-26 UTC.
The [local review](horn-review.md) preserves the implementation and portable
artifact record separately.

| Boundary         | Observed evidence                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Source           | Main `712136f156a23d973e2e328ef5a7d0eac523d3cd`, including runtime implementation `9d9430e`                                        |
| Static branch    | `52b5eb75dc42d6990fa9c0961ab47624502005f8`, a normal descendant of the earlier eight-room deployment; older hashed assets retained |
| Canonical files  | All 153 current build files plus both root/index aliases matched their byte identities                                             |
| Remote source    | A fresh clone, clean Node 24.22.1 installation, complete checks and build reproduced all 153 externally reviewed files             |
| Public operation | Chromium 153.0.8010.12 and Firefox 155.0 at 1440 and 375 px; both horn and circle workshop workflows                               |
| Cached edition   | All 152 generated precache paths matched the current worker and edition before offline use                                         |

The [canonical receipt](horn-publication/hosted-files.json) uses the reusable
Officina verifier at [its recorded source](https://github.com/antonsoo/officina/blob/ae0a11d/scripts/verify-pages.mjs).
It fetches canonical URLs without query cache busting and compares both entry
aliases before and after the complete file pass. The
[remote-source receipt](horn-publication/remote-source.json) identifies the
separate source/build reproduction; an HTTP success alone was not accepted.

The [four public horn workflows](horn-publication/horn-browser.json) follow the
actual course disclosure, keyboard controls, exact witnesses, readings, all
six source identities, history, JSON reopening and native downloads. The
[four public circle workflows](horn-publication/circle-browser.json) separately
exercise the root-error presets, both proof paths, ten source pages, exact
ledgers and the corrected visible share field. Neither set reported page errors,
document overflow or axe WCAG 2 A/AA and 2.1 AA violations in this scope.

Every public horn HTML download matches the retained reading **byte for byte**.
Each was opened from disk with scripts disabled and automatic remote requests
blocked. The embedded Noto face loaded, all language pairs and source images
remained, and the native JSON/CSV links produced matching records. Standalone
SVGs were checked for well-formed XML, loaded embedded font and complete MIT/OFL
metadata in both engines. Script-disabled file pages were brought to the
foreground and their actual loaded font state observed; verification does not
rely on an indefinitely pending FontFaceSet.ready promise in Firefox.

The [independent geometry check](horn-publication/downloaded-geometry.json)
validates 24 actual public CSVs and 1,448 real SVG path vertices. The
[polygon check](horn-publication/circle-ledgers.json) validates 160 rows from
the sixteen public circle CSVs. The actual public reading's
[15-page PDF check](horn-publication/print.json) recovered all six source JPEGs
unchanged, all 96 reading fields plus the complete MIT notice, and seven embedded
Unicode font subsets. Its creation metadata differs from the separately
retained local PDF; the input HTML is identical.

Public offline checks disabled **browser networking**. Reload, source display,
new calculations, illustrated downloads, course navigation and return succeeded
in every configuration. The public origin was not stopped. The separate
[eight-room to nine-room upgrade](horn-review/upgrade.json) uses the actual
earlier Pages tree on a local origin, holds/substitutes a new source during
installation, recovers it, reloads an existing course tab and destroys origin
connections before the final recovery checks.

To repeat the public journeys with the matching local build:

```sh
npm run test:horn -- /tmp/horn-public https://antonsoo.github.io/stoicheia/
npm run test:circle -- /tmp/circle-public https://antonsoo.github.io/stoicheia/
python3 scripts/horn-oracle.py --browser /tmp/horn-public/review.json
python3 scripts/circle-bounds-oracle.py --browser /tmp/circle-public/review.json
```

GitHub Actions execution, physical printing and manual screen-reader operation
are not established by these publication checks. The source, static branch,
canonical files, browser use and portable artifacts are separate observations.
