# Stoicheia

Read Euclid’s opening arguments in Greek, Latin and English, with a working diagram beside every step.

[![License: MIT](https://img.shields.io/badge/license-MIT-193d60)](LICENSE)

![Euclid I.2: the equal remainders construction beside its Greek, Latin and English text](docs/assets/hero.png)

A diagram can make Euclid look obvious while hiding the reason a step is allowed.
A translation can make the argument readable while hiding the Greek that carries
it. Stoicheia connects both: change the givens, follow the command on the plate,
read the two source languages, and ask what established the equality.

The opening course is **Book I, propositions 1–6**. It includes the complete
statements and proofs, divided into 52 aligned reading steps, with 31 selected
vocabulary entries, thirteen foundation statements and twelve passage-based
reading exercises. It is intended for an English-speaking reader who knows basic
geometry and is beginning Greek or Latin.

This is a local, unpublished source checkout. The intended repository is
`github.com/antonsoo/stoicheia`; the intended Pages address after publication is
`https://antonsoo.github.io/stoicheia/`. There is no package registry release.

## Run it

Node.js 24 or later. From the parent `showcases` directory:

```sh
cd stoicheia
npm ci
npm run dev
```

Open `http://127.0.0.1:4327/stoicheia/`. The production build is `npm run build`,
which writes a complete static site to `dist/`. `npm run preview` serves that build
on the same port; stop the development server before starting the preview.

## Read, construct, inspect

| Proposition | What you make                                             | What the lesson exposes                                                                            |
| ----------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| I.1         | Equilateral triangle on a given segment                   | The two radius equalities, common notion 1, and the unstated intersection assumption               |
| I.2         | An equal length at a separate point                       | The equilateral triangle supplies equal parts to subtract from equal radii                         |
| I.3         | A part of the longer segment equal to the shorter         | I.2 becomes an available construction, and the greater–lesser hypothesis matters                   |
| I.4         | Triangle congruence from two sides and the included angle | Rigid superposition, corresponding vertices, and an unstated motion assumption                     |
| I.5         | Equal interior and exterior base angles                   | Two overlapping triangle comparisons, then subtraction of equal angles                             |
| I.6         | Equal sides from equal angles                             | A contradiction, with the impossible conjunction explicitly distinguished from the measured sketch |
- Move through the commands and deductions at your own pace. Every step names its
  permission: postulate, definition, common notion, earlier proposition, or
  assumption. Earlier constructions can be opened from the reason that uses them.
- Select underlined Greek or Latin words for a lemma, equivalent, transliteration
  and explanation of the forms. The reading notes explain selected syntax in
  context, including the difference between commands and completed results.
- Read Greek-first or Latin-first and reveal the other languages when ready.
  Twelve exercises ask about the wording of actual passages, explain each
  interpretation, and return you to the corresponding step.
- Open a reason’s source to compare the definition, postulate or common notion
  in all three languages. The reader distinguishes Heiberg’s numbering from the
  usual five-item common-notion list.
- Change the given lengths with keyboard-accessible sliders. Flip the triangle,
  or change the reference angle in I.2. In I.3, a reference of 100% or more fails
  the stated hypothesis and withholds the constructed cut.
- In I.4, move one triangle onto the other with a shape-preserving rotation and
  translation. In I.5, trace each of the compared triangles and follow the
  whole-angle / removed-part / remainder table. I.6 keeps its temporary
  supposition visibly separate from the original given, including in downloads.
- Open the printed page for either language, zoom it and pan with the keyboard.
  All twenty-two source pages are bundled. The full aligned passage is available below
  the plate, with links back to individual steps.
- Share the current proposition, step and parameters in a URL fragment. Save the
  current diagram as SVG or the entire lesson as a standalone HTML study sheet.
  The downloaded sheet contains the diagram, all three languages, reasons, relevant foundation statements, notes and
  attribution, and opens without scripts or network access.
- The production edition precaches its text, diagrams, font and source pages.
  Wait for “Edition ready offline” before disconnecting. Offline reloads require
  HTTPS or localhost and a browser that permits service workers. Development mode
  deliberately does not install an offline worker.

![The Greek and Latin passage on a 375px screen](docs/assets/phone-passage.png)

A [downloaded I.2 study sheet](examples/stoicheia-I2-study.html) is included as a
working example, alongside [I.6’s contradiction sheet](examples/stoicheia-I6-study.html). Save either and open it directly in a browser to read without the app.

## The source is part of the lesson

The Greek and Latin are transcribed from J. L. Heiberg’s _Euclidis opera omnia_,
volume I (Leipzig: Teubner, 1883), printed pp. 4–25. Heiberg’s Latin is a
**nineteenth-century translation**, not an ancient Latin text. The English is a
new reading translation; explanations sometimes make an implied intersection
explicit. Point names remain Greek throughout.

The [University of Toronto scan](https://archive.org/details/euclidisoperaomn01eucluoft)
is public domain. The page images and download hashes are recorded in
[`public/sources/manifest.json`](public/sources/manifest.json). The
[editorial note](docs/sources.md) records normalized glyphs, omitted reference
marks, the retained editorial brackets, the clipped margin on p. 6 and how the source diagrams differ from the
working plates. Critical apparatus is visible on the scans but is not transcribed
into the reader.

Mathematical notes were cross-checked against David E. Joyce’s commentary at
Clark University: [I.1](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI1.html),
[I.2](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI2.html),
[I.3](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI3.html),
[I.4](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI4.html),
[I.5](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI5.html),
[I.6](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI6.html).

## How the construction works

The core is separate from the reading content and interface. I.1 computes either
circle intersection on the base segment. I.2 actually constructs its return
point; it does not simply assign the reference length to a new segment.

Using the common English label convention for the following diagram only:

```text
          D
         / \
        A---B       DA = DB       (I.1)
       /     \
      L       G     DL = DG       (circle at D)

     DL - DA = DG - DB
        AL  =  BG = BC           (equal remainders, then equal radii)
```

`transfer(a, b, c)` first constructs D, intersects the extended DB with the circle
at B through C to obtain G, then uses the circle at D through G to obtain L on
extended DA. In a calculated teaching example with AB = 180 and BC = 117, the calculation
gives DL = DG = 297, DA = DB = 180, and AL = BC = 117. I.3 calls that construction
and uses its output as the radius of the circle locating the cut.

SVG coordinates are computed from the geometry; equality marks follow established
arguments. The numerical table is explicitly a check in relative units. It is
not used as the reason an equality holds.

The app uses TypeScript and Vite, with no runtime framework or network service.
The production build generates a content-versioned service worker. Text is escaped
before markup is created; URL state accepts bounded numeric parameters only. The
font and its license are self-hosted. There is no analytics, remote font request
or stored reading history.

## Verification

```sh
npm run check
npm run verify:oracle
npm run verify:triangles
```

The TypeScript checks cover constructions, invalid hypotheses, complete lesson
scenes, shared-state parsing, inflected vocabulary and exports. More importantly,
an independent Python standard-library oracle uses 60-digit `Decimal` arithmetic
and general circle-circle and quadratic line-circle intersections to reproduce
the points without importing the app code.

The retained [oracle result](docs/geometry-oracle.json) has 720 input cases,
4,320 point comparisons and 5,760 equality checks. Maximum relative coordinate
error is `1.1526305883259686e-15`, below the `2e-12` tolerance. These inputs rotate,
translate and resize the constructions and exercise both triangle orientations.

A second [independent check](docs/triangle-oracle.json) uses cosine-law angles,
shoelace areas and Euclidean distances to inspect 480 I.4 motion cases, 96 I.5
constructions and 96 I.6 hypothetical sketches. All 8,064 checks passed. It verifies
both I.5 triangle correspondences and the final angle subtraction, and requires
I.6’s scalene sketch to have unequal base angles and a strictly smaller inner
triangle. These are numerical checks, not a formal proof checker.

For browser verification, serve the production build with `npm run preview`, then
run `npm run test:browser` in another terminal. Playwright needs matching Chromium
and Firefox browsers already available. On a new development machine they can be
installed with `npx playwright install --with-deps chromium firefox`.

The [browser receipt](docs/browser-verification.json) records the tested browser
versions, desktop and 375px viewports, rendered side equalities, source-page
navigation, vocabulary focus return, invalid-length handling, shared links,
standalone downloads, offline reloads with the local origin unavailable, accessibility
audits and exact HTTP/build
byte comparisons. These are local-build results; they establish no public
deployment or remote CI result.

The development quickstart is checked separately with `npm run test:dev` while
`npm run dev` is running. Its [receipt](docs/quickstart-verification.json) checks
the actual styled layout and navigation in Chromium and Firefox. CSS is loaded
through an HTML stylesheet link so Vite development works with the same
`style-src 'self'` policy as the production site.

## Accuracy and limitations

- This is I.1–6, not the whole _Elements_. The construction tools, translations
  and selected vocabulary are complete for that scope. There is no general Greek
  parser, pronunciation model or claim that every word is annotated.
- The Greek follows a modern printed critical edition, not a surviving autograph
  of Euclid. Transcription and language notes merit philological review. Source
  scans are supplied so errors can be identified and corrected.
- Numerical constructions use floating-point coordinates in the real plane.
  Independent numerical agreement and sampled browser checks are not formal
  verification of Euclid’s postulates. The I.1 intersection gap and I.4 superposition assumption are explicitly
  discussed; the app does not claim to derive those assumptions from the postulates.
- I.2 reuses the completed I.1 subconstruction, and I.3 reuses I.2. Their internal
  working is shown in the corresponding earlier lesson rather than repeated in
  the later plate. Some unused source-circle labels are omitted from the plates.
- “Collapsing compass” is a modern model of the restricted operation. The app
  makes no historical claim about a physical ancient instrument.
- Storage may be unavailable or cleared by the browser. Offline readiness applies
  to the cached build, not to linked external commentary or the complete volume.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Corrections tied to a printed page and
line, or a reproducible geometric counterexample, are especially useful.

## License

[MIT](LICENSE) for code, English and teaching notes. Source Greek, Latin and page
images are public domain. Noto Serif uses the SIL Open Font License; see
[third-party notices](THIRD_PARTY_NOTICES.md).
