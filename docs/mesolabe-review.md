# Mesolabe review: local source and real workflows

Reviewed 2026-10-24. This work extends the existing Stoicheia course with
**Twice the stone**, an operating three-plate mesolabe and a reading of the
construction transmitted under Eratosthenes' name by Eutocius.

**Publication boundary:** this is a locally built and reviewed fifth room.
The changes have not been pushed, deployed or released. Existing hosted
four-room reviews describe their own earlier editions. The new planned URL
is `/stoicheia/mesolabe.html`; the complete build command is `npm run build`
and the output directory is `dist/`.

## What a learner can do

Move both plates independently by their grips or native keyboard sliders.
Bring only Β onto the ruler, leaving Γ as an independent failed condition.
Inspect both signed contact offsets on a common enlarged scale, the three
successive length ratios, and the cube implied by the last mean ΓΗ.
The mathematical alignment and the chosen 0.5 mm displacement expose the
difference between a solved ideal model and a perturbed trial.

Five proof stages connect vertical and diagonal parallels to the continuing
proportion. Eight selected Greek/Latin/English readings include grammar
notes, four passage questions and direct routes to the full printed pages.
The mobile machine and proof turn clockwise while their labels stay upright.
The standalone saved reading also has a separate portrait plate for phones.

The controls are modern teaching affordances. The device's square dimensions,
60 mm comparison height, volume-factor range and perturbation are chosen.
The letter's authenticity and the instrument's physical precision are not
settled by the exhibit. [Source and derivation](mesolabe-model.md).

## Independent geometry and source identity

```sh
npm run check
npm run verify:mesolabe
python3 scripts/mesolabe-source-review.py
```

`npm run check` passes lint, strict TypeScript, all **53 tests**, and the
production build. The independent Python oracle intersects actual square
edges and diagonals, then uses nested numerical bisection for both alignment
conditions. It imports no app code and uses no cube-root function or app
slide formula.

[Oracle receipt](mesolabe-oracle.json): **6,771 poses**, **108,519 numeric
comparisons**, **61 independently solved volume factors**. Maximum absolute
difference `1.7053025658242404e-13`, below `2e-10`.

The complete original PDF is identified by SHA-256, not by the filename
alone. Its title page reads **1881**. The twelve complete source JPEGs were
re-rendered with Poppler and matched byte-for-byte. The source reviewer
accepts `--pdf PATH` for an existing copy. It requires `pdftoppm`.
[Source receipt](mesolabe-source-review.json) ·
[Source manifest](../public/sources/mesolabe/manifest.json).

The eight selected excerpts were visually compared with this print; they
are not a complete letter translation. The apparatus and adjacent text remain
in every source image. In particular, the prose asks for close-fitting
parallel motion and Heiberg questions the ease of achieving it on p.111.

## Browser and native files

```sh
npm run build
npm run test:mesolabe -- /tmp/stoicheia-mesolabe
uv run scripts/mesolabe-print-review.py /tmp/stoicheia-mesolabe/chromium-1440
```

[Browser receipt](mesolabe-browser.json) records the complete production
file inventory and SHA-256 identities. The browser runner serves that build
itself, so keep `dist/` unchanged until it exits. It uses installed Playwright
Chromium and Firefox at **1440 and 375 pixels**.

All four configurations exercised both real pointer grips, native keyboard
movement with retained focus, the failed single-contact condition, exact
alignment, displacement, all five proof stages, all eight readings, all
twelve scans, actual source zoom and keyboard panning, the four questions,
share restoration, and malformed shared settings. The accessibility scan
reported zero violations; this is an automated scan, not a claim of a
complete assistive-technology audit.

Each configuration downloaded HTML, machine SVG, paper SVG and CSV through
actual browser download events. It then opened the real native HTML file
with network access disabled, decoded every source image and its font,
and downloaded identical CSV and paper SVG from the embedded links. The
standalone SVG paper was also opened from disk. No app page errors, CSP
violations or external subresource requests were observed.

The runner destroys all origin sockets and closes its connections while
`navigator.onLine` stays true. Reloading, saving the same complete reading,
and navigating all five rooms still work. This is separate from a browser
setting that merely reports itself offline.

The actual retained Chromium exports are:
- [Illustrated HTML](../examples/stoicheia-mesolabe-reading.html)
- [27-page reading PDF](../examples/stoicheia-mesolabe-reading.pdf)
- [Machine SVG](../examples/stoicheia-mesolabe-machine.svg)
- [Measurements CSV](../examples/stoicheia-mesolabe-measurements.csv)
- [Landscape A4 paper SVG](../examples/stoicheia-mesolabe-paper.svg)
- [One-page paper PDF](../examples/stoicheia-mesolabe-paper.pdf)

[PDF inspection](mesolabe-print.json) confirms that all twelve original
JPEGs survive unchanged inside the reading PDF, one image per source sheet,
with each caption and hash on the same sheet. There are no empty pages.
The SVG calibration bar is exactly 25 coordinate millimetres; the actual
Chromium paper PDF measures **25.01035970052083 mm**. This digital measurement
does not establish physical printer scaling. Printing, cutting, assembly,
friction, play and achievable accuracy remain unverified.

## Existing tabs and an activation race

```sh
node scripts/mesolabe-upgrade.mjs /path/to/previous-four-room/dist /tmp/mesolabe-upgrade.json
node scripts/offline-claim.mjs /path/to/before-claim-fix/dist /tmp/offline-claim.json
```

[Upgrade receipt](mesolabe-upgrade.json): both browsers kept an actual
four-room tab open while a new source image was withheld from the five-room
install. The new room did not claim readiness from the older worker. After
release, the existing tab offered a reload; both tabs then worked with the
origin disabled. A deliberate HTTP 503 prevented installation; retrying
completed it. Only the complete new cache remained, with all **104** files.

A further cold-navigation review caught a real case where a registration
was activated and cached, but the newly navigated document had no controller.
The activation claim can enumerate clients before that document is available.
The old helper then had no later event from which to recover.

```text
installation starts -> navigation starts -> initial claim misses new document
                                         -> registration active, tab uncontrolled
matching edition claim request           -> controller assigned
                                         -> edition + inventory checked -> ready
```

The repaired helper asks an activated worker of the matching edition to
claim the now-existing tab. The worker ignores mismatched edition requests;
readiness still requires the controller's current edition and complete cache.
The registration's active worker is also observed while it is activating;
normal retirement of an already activated worker is not treated as an
installation failure.
[Deterministic before/after receipt](offline-claim.json) suppresses only the
initial claim, explicitly simulating that missed-client state. The original
helper stays uncontrolled in both browsers; the repaired helper becomes
controlled and then reloads successfully with origin sockets disabled.
A second controlled case starts navigation while installation is held,
releases its HTML during a prolonged activation, and records the actual
`activating` state at arrival. The intermediate claim-only repair misses
that transition; observing the active worker completes the recovery.

| Helper                                | Initial claim missed after activation | Document arrives while activating |
| ------------------------------------- | ------------------------------------- | --------------------------------- |
| Original                              | Uncontrolled                          | Uncontrolled                      |
| Claim request only                    | Controlled                            | Uncontrolled                      |
| Final, with active-worker observation | Controlled                            | Controlled                        |

Both browser engines pass all six comparisons. The simulation suppresses
only the initial claim; all after-repair cases reload with origin sockets
disabled. [Sixteen unmodified cold navigation runs](mesolabe-cold-navigation.json)
also reached verified readiness, eight in each engine.

## Visual review and practical limits

Actual screenshots were inspected in both engines and both widths. The
large working plate, visible layer order, upright mobile labels and source
folio keep the interface specific to this construction. Native range styling
differs between engines. The source reader deliberately permits scrolling
inside an enlarged complete page.

[Aligned desktop](assets/mesolabe-aligned.png) ·
[Single-contact failure](assets/mesolabe-one-contact.png) ·
[Proof](assets/mesolabe-proof.png) ·
[Phone plate](assets/mesolabe-phone.png) ·
[Phone proof](assets/mesolabe-proof-phone.png) ·
[Parallel reading](assets/mesolabe-reading.png).

The new material implements three plates only; the source's extension to
more means is explained without pretending to operate those larger devices.
It does not prove the impossibility of cube duplication with compass and
straightedge, or identify a surviving ancient instrument. No physical
fabrication, museum attribution or public deployment is inferred from the
browser and mathematical checks.

Suggested repository description: Read Euclid and ancient geometric devices in Greek, Latin and English with working proofs.
Topics: `euclid`, `geometry`, `ancient-greek`, `latin`, `history-of-mathematics`, `education`, `interactive-learning`.
