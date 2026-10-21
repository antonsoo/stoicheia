# Review handoff

Stoicheia is a new, local repository implementing the Euclid learning idea.
The opening course follows a complete chain of three constructions:

```text
I.1: make equal sides -> I.2: transfer a length -> I.3: cut a length
```

The result connects full Greek and Heiberg Latin source passages with an English
reading translation, 26 reading steps, selected grammar, 19 vocabulary entries,
calculated diagrams and the reason for each operation. A reader can change the
givens, inspect the printed pages, follow an earlier construction, and save an
SVG or a standalone study sheet.

The scope is deliberately I.1–3. That permits full source checking and a connected
argument, especially the equal-remainders construction in I.2. Architecture and
musical reconstruction are separate subjects requiring their own source work.

## Open the result

The [sample I.2 study sheet](../examples/stoicheia-I2-study.html) can be saved and
opened directly in a browser without a server. To run the interactive reader
from the parent `showcases` directory:

```sh
cd stoicheia
npm ci
npm run dev
```

The address is `http://127.0.0.1:4327/stoicheia/`. Build with `npm run build`;
the deployable static output is `dist/`. `npm run preview` serves that output
after the development server is stopped.

## Verification retained

The final source was exported from Git into a fresh directory and installed and
checked with Node 24.22.0. The build input digest in the browser receipt also
matches the current source, public assets, configuration and lockfile. This
digest excludes documentation and generated verification receipts.

| Check                   | Result                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `npm ci`                | Fresh installation succeeded                                                                                      |
| `npm run check`         | Lint, strict typecheck, 9 construction/content checks and production build passed                                 |
| `npm run verify:oracle` | 720 independent cases, 4,320 point comparisons; maximum relative error 1.1526305883259686e-15                     |
| `npm run test:dev`      | Styled quickstart and navigation passed in Chromium and Firefox                                                   |
| `npm run test:browser`  | All 26 reading steps in each of four browser/viewport configurations; 32 automated accessibility audits passed    |
| Offline and downloads   | Worker-served reloads with the local origin unavailable; scanned pages and standalone exports opened successfully |
| HTTP/build bytes        | All 16 served production files matched the build                                                                  |

Receipts: [build](build-verification.json), [independent geometry](geometry-oracle.json),
[browser workflows](browser-verification.json), and [quickstart](quickstart-verification.json).
The source image hashes and original PDF download are in the
[source manifest](../public/sources/manifest.json).

Browser verification uses Chromium 153.0.8010.12 and Firefox 155.0 at 1440 × 1000
and 375 × 812. It checks rendered side equalities, keyboard range changes, source
zoom and keyboard panning, vocabulary focus return, shared links, browser back and
forward, failed length hypotheses, actual downloads and offline file reopening.
The reported page errors, external requests and CSP violations are all zero.

The unavailable-origin control matters: request interception interfered with
Firefox's service-worker reload in the first harness. The retained check cuts
the local origin below the browser, verifies that it is unavailable, enables
offline emulation and requires the navigation response to come from the worker.
It does not infer offline success merely from an open page remaining visible.

The quickstart check found and fixed a separate issue: importing CSS through the
JavaScript entry let Vite inject an inline style blocked by the page's content
policy. CSS now loads through an HTML stylesheet link. The policy remains the
same in development and production.

## Visual review

All retained screenshots were generated from the final clean production build
and inspected:
- [Construction and parallel text](assets/hero.png)
- [Complete I.1 view](assets/first-construction.png)
- [Complete I.2 view](assets/length-transfer.png)
- [375px construction](assets/phone-plate.png)
- [375px reading](assets/phone-passage.png)

The blue plate and white text panel make the construction and the source easy to
compare. On the phone the plate, controls and text form a vertical reading flow.
Greek and Latin remain legible, step targets have usable spacing, and the tested
views have no horizontal page overflow. This is browser viewport evidence, not a
physical-device study.

## Boundaries and publication

- The source is Heiberg's 1883 printed Greek and nineteenth-century Latin, not
  a surviving autograph or an ancient Latin translation. Text and language notes
  remain open to philological correction; the scans permit direct review.
- Numerical agreement is not a formal derivation from Euclid's postulates. The
  first proposition's intersection assumption is discussed explicitly.
- The construction macros reuse earlier lessons. Their working is available in
  those lessons rather than repeated in every later plate.
- This is local source and local browser evidence. No GitHub repository, public
  deployment, tag or registry release was created. The house standards reserve
  publication for review. The workflow files prepare CI and branch-based Pages
  deployment but do not establish that either has run remotely.

Suggested GitHub description:

> Euclid I.1-3 in Greek, Latin and English, with interactive constructions and inspectable source pages.

Suggested topics: `euclid`, `geometry`, `ancient-greek`, `latin`, `mathematics`,
`education`, `typescript`, `offline-first`.
