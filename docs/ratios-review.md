# Direct review of the Book V ratio workshop

The learner can separate two nearly equal ratios with a specific pair of
equimultiples, inspect the exact comparison, and find the condition in the Greek
and Latin. Finite agreement, a counterexample to equality, and V.7’s stricter
greater-ratio witness remain separate conclusions.

This is a local edition, reviewed on 2026-10-27 UTC. No push, deployment,
hosted-byte verification or CI run is claimed. `HOUSE_STANDARDS.md` requires
publication to remain with the coordinator.

## Evidence boundaries

| Boundary           | Observation                                                                                                                                                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source             | Heiberg volume II, 1884 title and printed pp.2–5; five whole images reproduce byte-for-byte from the pinned PDF using Poppler 24.02.0. The catalogue’s 1883 metadata date is distinguished from this volume’s printed 1884 date.                                                                   |
| Exact model        | 69 cases; 10,879,090 cells independently enumerated with integer products and squares. Compressed intervals, first disagreements, first V.7 witnesses and selected signs agree.                                                                                                                    |
| Clean source       | Fresh local clone, `npm ci`, Node 24.21.0, lint, strict types, 95 tests and production build passed. No dependencies added.                                                                                                                                                                        |
| Built bytes        | All 177 output paths, lengths and SHA-256 values match the working checkout’s independently built `dist/`. This includes `sw.js`.                                                                                                                                                                  |
| Development        | Chromium 153.0.8010.12 and Firefox 155.0, each at 1440 and 375 pixels: documented quickstart, source loading, exact witness, real illustrated download and no page/console errors or horizontal overflow. Book X navigation and its existing download also work.                                   |
| Production journey | Both browsers and widths: course link, keyboard multipliers, independent choices, equality counterexample, V.7 witnesses in both directions, scaled-pair explanation, malformed fraction rejection, seven readings, all word notes, five image identities and keyboard page panning.               |
| Native records     | JSON import and rejection, share-link restoration, history, real CSV/JSON/HTML downloads, embedded native downloads from a script-disabled local file. CSV carries its four original magnitudes and search bound on every row.                                                                     |
| Source failures    | In each engine, a delayed Greek page cannot replace a subsequently selected Latin page. A substituted HTTP 200 source is neither displayed nor included in a saved reading.                                                                                                                        |
| Offline            | All four configurations have the matching controller and all 176 cache inventory entries. With the local origin refusing connections and browser networking disabled, reload, another source page, a new 577:408 witness and a new illustrated download work. `sw.js` itself is not a cache entry. |
| Accessibility      | Zero violations in the requested axe WCAG 2 A/AA and 2.1 AA rules in all four configurations; keyboard actions and focus are exercised separately. This is not a claim of a complete accessibility audit.                                                                                          |
| Retained reading   | Four actual HTML downloads have the same SHA-256. Each embeds the five verified original images, actual local font and complete licenses, seven full readings and all word notes, with no script or remote subrequest.                                                                             |
| Printed reading    | The actual 15-page Chromium PDF retains all 21 complete Greek/Latin/English passages in order, every contextual word meaning, five source captions and 2,281 extracted words within checked page margins.                                                                                          |

[Integer enumeration](ratios-verification/integer-oracle.json) ·
[Source reproduction](ratios-verification/source-reproduction.json) ·
[Build identities](ratios-verification/build-identity.json) ·
[Development replay](ratios-verification/development.json) ·
[Production replay and fault cases](ratios-verification/browser.json) ·
[Independent native-file and print audit](ratios-verification/artifacts.json).

## Actual files and appearance

| File                                                               | Purpose                                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| [Desktop comparison](assets/ratios-desktop.png)                    | Actual 70/99 counterexample, exact signs and endpoint microscope.               |
| [Phone comparison](assets/ratios-mobile.png)                       | Controls precede the plate; exact relation text remains readable at 375 pixels. |
| [Greek and Latin reading](assets/ratios-reading.png)               | Complete V.5, new English, contextual words and direct page navigation.         |
| [Illustrated reading, gzip](../examples/ratios-reading.html.gz)    | Actual 2,766,641-byte HTML download, compressed without changing its contents.  |
| [Printed reading](../examples/ratios-reading.pdf)                  | Actual 15-page browser PDF.                                                     |
| [Editable experiment](../examples/ratios-experiment.json)          | Native settings, suitable for reopening in the workshop.                        |
| [Comparison and bounded search](../examples/ratios-comparison.csv) | Exact selected comparison and compressed disagreement intervals, with scope.    |

The visual review keeps the geometric plate large and the controls adjacent on
desktop. At phone width, the two exact comparison sentences remain separate from
the smaller diagram labels; Greek and Latin stack at readable widths. Print uses
sequential language and word-note blocks so copied text does not interleave
columns, with each complete source image on its own page. All source images,
retained screenshots and representative print pages were inspected directly.

Two practical defects found during review are resolved: Firefox decoding uses
an independent image for each candidate before updating the shared viewer, and
standalone CSVs retain the bounded search’s scope even when two different bounds
produce exactly the same disagreement set.

The original HTML digest is
`c9d48eaf1e58dc2d94dd7c11a5ebde79c0e45980a068e172d239f016e5cdf81e`.
To open the retained compressed example:

```sh
gzip -dc examples/ratios-reading.html.gz > /tmp/stoicheia-ratios-reading.html
```

## Repeat the review

Node 24 or later, the project’s installed Playwright browsers, Python 3 and
Poppler are required. No Python packages are needed by the ratio oracles.

```sh
npm ci
npm run check
npm run verify:ratios
npm run verify:ratios-sources
npm run test:ratios -- /tmp/stoicheia-ratios
python3 scripts/ratios-artifacts.py /tmp/stoicheia-ratios
```

For development, run `npm run dev` in a separate terminal, then:

```sh
npm run test:dev -- http://127.0.0.1:4327/stoicheia/ /tmp/stoicheia-development.json
```

`npm run build` writes `dist/`, with base `/stoicheia/`. The production replay
serves that build itself and shuts off its origin for offline checks. CI includes
the integer, browser and native-file checks; an actual CI run remains unverified.

## Limits and handoff

The lesson models selected positive lengths in Q(sqrt(2)), not every kind of
Euclidean magnitude. Multipliers are bounded at 1000 and fraction terms at 9999,
with the selected fraction between 1 and 2. Drawing positions are approximate;
relation signs and search decisions are exact. A found witness may establish a
conclusion; finite agreement does not replace a proof for all multipliers.

New English and language notes have not received independent philological peer
review. The browser PDF is untagged; neither physical print dimensions nor
printer behavior are asserted. External source links require a connection.
The retained HTML and complete installed edition do not.

Runtime source and review scripts are committed through `0214742`:

```text
0214742 fix: retain magnitudes and search scope in standalone ratio CSVs
0369b1d docs: explain the ratio condition and its Greek and Latin evidence
fbfd36c feat: teach Book V with source-linked ratio experiments and portable readings
5f5e766 feat: compare Euclidean ratios with exact equimultiple witnesses
```

Suggested repository description:
“Read ancient geometry in Greek, Latin and English through exact experiments and complete source pages.”

Suggested topics: `geometry`, `euclid`, `ancient-greek`, `latin`, `mathematics`,
`education`, `offline-first`, `interactive-learning`.
