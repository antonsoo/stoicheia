# Make I.2 yourself

The new `desk.html` is a local source edition. It has not been pushed or
deployed. The existing public course has its own earlier publication record.
This review concerns the local build, actual browser operations, native files
and offline upgrades.

## The learning gap

The I.2 course plate presents a prepared construction. It cannot tell a learner
what happens when they choose a different circle, keep the wrong crossing or
try to carry the reference length straight to A. The desk makes these choices
available while preserving the restrictive operation explained by the course.

At A, construct a segment equal to detached BC. There is no radius field,
free-point placement or automatic length-transfer tool. A new point must be
kept from the intersections of two curves already drawn. The learner can
rewind, branch, keep both intersections, and choose operations in another order.
Hints prepare a command; they do not execute it. They follow the most developed
recognized route through either reference anchor and either equilateral vertex,
including a circle-first start before the joining line has been drawn.

Three layouts are supplied. Each retains its own history in the current tab.
The share URL and saved JSON preserve the current prefix, rather than the
undone future branch. Reloading or reopening reconstructs all coordinates
from the givens and operation dependencies. Reading links scroll without
discarding the construction from the URL.

## Try an actual construction

From this checkout, with Node 24 or later:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4327/stoicheia/desk.html`. The course also links to it.
The initial layout is **Detached, oblique**. Select the instruments and operands:

| Operation | Instrument | Operands                | New object |
| --------- | ---------- | ----------------------- | ---------- |
| 1         | Line       | A, B                    | l1         |
| 2         | Circle     | Centre A, through B     | c2         |
| 3         | Circle     | Centre B, through A     | c3         |
| 4         | Crossing   | c2, c3; keep crossing 1 | P1         |
| 5         | Line       | P1, B                   | l4         |
| 6         | Circle     | Centre B, through C     | c5         |
| 7         | Crossing   | l4, c5; keep crossing 2 | P2         |
| 8         | Line       | P1, A                   | l6         |
| 9         | Circle     | Centre P1, through P2   | c7         |
| 10        | Crossing   | l6, c7; keep crossing 2 | P3         |
| 11        | Line       | A, P3                   | l8         |

At operation 7, first keep crossing 1 instead. The point is a legitimate
intersection, but it is on the wrong side for this argument. Ask for a hint,
then undo and keep crossing 2. The final two intersections deserve the same
inspection. “Crossing 2” describes this ordered pair of curves: reversing a
line's endpoints reverses its two branch numbers. The beyond-endpoint relation,
rather than a branch number, is what matters to the explanation.

The [retained JSON](../examples/stoicheia-construction.json),
[SVG](../examples/stoicheia-construction.svg),
[complete HTML reading](../examples/stoicheia-construction-reading.html) and
[PDF](../examples/stoicheia-construction-reading.pdf) contain this completed
eleven-operation example. The HTML includes the editable JSON as a downloadable
data link and a continuation link to the intended public application route.
That route is outside this local publication evidence; reopen the JSON in the
locally served desk to resume before publication.

## How the equality is established

The incidence graph, in the printed argument's point names, is:

```text
A,B -> two centre-and-point circles -> D
D,B + circle B through C            -> G beyond B
D,A + circle D through G            -> L beyond A
A,L -> final join                   -> inspect equal remainders
```

Here G is the desk's explanatory English label for the point called Η in the
Greek/Latin source; the live desk uses creation-order P-numbers and supplies
a correspondence table. In the retained example D=P1, G=P2 and L=P3.

The two circles on AB supply `DA = DB = s`. The circle centred at B supplies
`BG = BC = r`. The chosen order D-B-G gives `DG = s + r`. The circle centred
at D gives `DL = DG`; the order D-A-L then gives
`AL = DL - DA = (s + r) - s = r`. The aligned bars show those same equal
wholes and the parts removed, rather than inventing a separate numerical proof.

`deskProof` follows the recorded parent curves and their defining points.
It checks the two beyond-endpoint choices and the final join. It recognizes
either equilateral vertex and either endpoint of BC as the anchor. A point
with identical coordinates but without the required construction origin does
not receive that explanation. Rounded agreement is never a completion rule.

This is a recognizer for this particular incidence chain, not a general
theorem prover. Other valid constructions may have no recognized explanation.

## Geometry and file boundaries

`src/core/desk.ts` is independent of the DOM. It replays circle, line and
intersection operations. Lines use a determinant intersection; line-circle
intersections use a perpendicular foot and the remaining squared radius;
circle-circle intersections use the common-chord foot and perpendicular offsets.
Branches depend on ordered operands in mathematical coordinates, independently
of the diagram's orientation.

All coordinates use floating-point arithmetic. Near-parallel lines and tangent
or nearly tangent circles are not promoted to an isolated crossing. The engine
uses relative tolerances of `1e-10` for unresolved intersections and `1e-8`
for duplicate points and beyond-endpoint separation. At most 48 operations
are accepted; new crossing coordinates are bounded to 2,000 drawing units.
Dense or very disparate constructions can be hard to read. The native selectors
remain available when tapping nearby points would be ambiguous.

The straight-line tool combines postulates 1 and 2: join the points and continue
the support in both directions. The darker finite join and dashed continuation
distinguish these operations. The circle tool restricts a centre-and-distance
instruction to a centre and another available point. These are modern teaching
choices. “Collapsing compass” does not establish what a physical ancient compass
could do. Euclid's presentation also leaves circle-intersection continuity
without a complete explicit axiom; the desk assumes the real plane.

Drawing JSON accepts only the three known layouts, the versioned format and
the operation fields. It carries no supplied coordinates. The complete graph
is rebuilt before an imported drawing replaces the current one. Missing or
future references, extra fields, free points, unsupported branches, zero-radius
circles and duplicate points are rejected. A malformed file leaves the current
drawing in place.

The illustrated reading captures state at the Save click, even if the reader
then changes the live drawing. It embeds all intermediate SVG diagrams, the
complete I.2 reading, its language notes, the four source images, the Greek
font, licenses and editable JSON. It executes no scripts. Source images and
font bytes must match the build's identities before a reading is downloaded.

Straight-line continuations are clipped geometrically to the viewport before
being serialized. An earlier export relied only on an SVG clip path around
extremely long dashed lines. Chromium's PDF writer still emitted the off-page
dashes, producing a 55,687,662-byte file. The retained equivalent is
1,695,658 bytes, with all 22 pages and 12 mm print margins. Its text extraction includes the final
operation, complete closing reading and four source-page captions. No physical
printing or paper construction was performed.

## Source inspection

The existing Greek and Latin transcription was checked directly against
the four bundled page images: J. L. Heiberg, _Euclidis opera omnia_, volume I
(Leipzig: Teubner, 1883), printed pp.12-15. The [Toronto scan](https://archive.org/details/euclidisoperaomn01eucluoft)
is the facsimile source; [the manifest](../public/sources/manifest.json)
identifies the rendered files. The Greek is on even pages and Latin on odd pages.

The desk reuses the course's complete statement and eleven reading divisions,
including English and language notes. It adds no purported ancient passage.
Printed wrapping and inline Latin references are omitted, ϑ becomes θ, and
geometric labels remain Greek in both source languages. Full scans retain the
apparatus and adjacent I.1/I.3 material; the apparatus is not fully transcribed.

## Direct verification

The final desk browser and upgrade receipts identify the same production
service worker by SHA-256. [Build identities](desk-build-identity.json) record
109 identical files, including the worker, from the working Node 26.7.0 build
and an isolated Node 24.22.0 `npm ci` build. There are 108 cached production
files plus the worker itself.

| Evidence                                                                           | Result and scope                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`                                                                    | Lint, strict typecheck, all 63 tests and build pass under Node 24.22.0 and 26.7.0.                                                                                                                                                                                                                            |
| Ten new model tests                                                                | Twelve complete paths across three layouts, both reflections and both reference anchors agree with an independently calculated closed form. Wrong branches, missing dependencies, invalid imports, degeneracies and adaptive hints through either anchor or kept vertex are checked.                          |
| [Desk browser receipt](desk-browser.json)                                          | Chromium 153 and Firefox 155, each at 1440px and 375px. Real operations, two wrong crossings, Undo/Redo, transcript jumps, native keyboard/SVG controls, preserved focus, sharing, layouts and JSON import/export. Zero axe violations in these checked states.                                               |
| Native HTML/SVG/JSON                                                               | Real downloads reopened with networking disabled. Four embedded image hashes match the source manifest; the HTML's embedded JSON matches the standalone JSON; SVG colors resolve independently of application CSS. No remote subresource requests.                                                            |
| Offline workflow                                                                   | Server destroys sockets and browser networking is disabled. Restore the completed drawing, export a reading, make a reflected construction anchored at C in the long-reference layout, and navigate all six rooms.                                                                                            |
| [Edition upgrade receipt](desk-upgrade.json)                                       | Pre-desk five-room build `51ed510` to current six-room build, in both browsers, with a source page held and with a failed install followed by recovery. New desk remains unready until complete; an old open tab detects the controller change and reloads; construction then works with the origin disabled. |
| [Clean development receipt](desk-development.json)                                 | Fresh Node 24 install; documented development server; course-to-desk journey and a real operation in both browsers. Development correctly reports that offline saving belongs to production.                                                                                                                  |
| [Course Chromium](desk-course-chromium.json) / [Firefox](desk-course-firefox.json) | Broader existing-reader regression, desktop and phone: 174 reading steps, original page navigation, changed hypotheses, vocabulary, foundation statements, native files and disabled-origin use. These are the individual runs' recorded inventories, separate from the final desk build identity receipt.    |

The broader reader review exposed a pre-existing false positive: its regex
searched base64 image/font payloads for `NaN`. The I.8 reading contains those
three letters in encoded bytes, with no non-finite markup. The two affected
course helpers now exclude data payloads from the non-finite-text check while
retaining the script check on the entire document. The actual reader workflow
then passed in both browsers.

To repeat the final desk review after `npm run build`:

```sh
npm run test:desk -- /tmp/stoicheia-desk
npm run test:desk-upgrade -- /path/to/pre-desk/dist dist /tmp/desk-upgrade.json
```

The first command starts its own temporary production server. The second needs
the real pre-desk build; it does not fabricate an old worker. A separate copy of
revision `51ed510`, built with the same locked dependencies, supplies that baseline.

Retained artifacts have a separate [hash and size inventory](desk-artifacts.json).
The real [desktop drawing](assets/desk-desktop.png), [phone drawing](assets/desk-phone.png),
[equal remainders](assets/desk-remainders.png) and [phone explanation](assets/desk-remainders-phone.png)
were opened and visually reviewed. The drawing is deliberately quiet, with a
single green copied segment. On a phone, the instruments precede the drawing
and explicit links connect them; native selectors remain the most precise way
to distinguish crowded points.

Build with `npm run build`; the complete static site is `dist/`, with base path
`/stoicheia/`. No remote deployment, public hosted-byte match, physical printing
or general theorem-prover capability is claimed here.

Suggested repository description: **Read Euclid in Greek, Latin and English;
make compass constructions and inspect the printed evidence.**

Suggested topics: `euclid`, `ancient-greek`, `latin`, `geometry`, `education`,
`interactive-learning`, `compass-and-straightedge`.

## Source commits

```text
b8eecc0 fix: give portable construction readings proper print margins
ea198e9 fix: preserve keyboard choices and verify construction workflows
f790a31 feat: let readers make and preserve Euclid's I.2 construction
ee3c074 feat: model a replayable restricted-compass construction desk
```
