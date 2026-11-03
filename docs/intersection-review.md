# I.1: inspect the point the drawing assumes

This change extends the first lesson, rather than adding a fifteenth workshop.
The learner keeps a point exactly on one circle, makes the other side's rounded
reading agree, then checks the exact nonzero residual. The command, vocabulary,
Greek and Latin pages remain within reach.

The follow-up [saved-reader audit](saved-reader-audit.md) records draft preservation,
source-image limits, cancellable downloads, complete-cache repair and recovery.
The original experiment measurements below retain their own build boundary.

## Try the actual work

Use Node 24 or later. From the checkout:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4326/stoicheia/#p=1&s=3`. Beside the intersection command,
choose **Can a near crossing be exact? Test the point rule**. The invitation
below the proof opens the same experiment.
1. At t = 11/19, both side readings are 1.00; the exact squared-length residual
   is 1/241. Choose four decimal places: the second side reads 1.0021.
2. Choose t = 56/97. At four places both read 1.0000, but the residual is
   -1/12545. Six places distinguish them again.
3. Open **Choose your own fraction**. Use m = 564719 and n = 978122. Even the
   six-place readings agree; the residual is -1/1275630195845. Enter zero as
   denominator: the form explains the bound and keeps the prior candidate.
4. Reveal the real intersections. The hollow diamonds show (1/2, ±sqrt(3)/2),
   while the rational candidate stays where it was. Read the general argument
   below; the input ceiling does not establish the impossibility.
5. Open **Read the permission and the command**. Select τέμνουσιν or secant for
   the contextual vocabulary note; inspect Greek p.12 and Latin p.13. Compare
   Postulate 3 on pp.8–9. The full printed pages, not thumbnails, open in the
   existing verified viewer.
6. Share the experiment, reload, visit I.2 and use browser Back. The fraction,
   precision and reveal setting return. Save the exact CSV or complete I.1
   illustrated reading; the latter includes the current experiment and ten
   printed course pages. Open it from disk with the network unavailable.

The [mathematical and source note](intersection-model.md) distinguishes the
modern point restriction from the source text and records the input limits.
The [actual saved reading](../examples/intersection/reading.html.gz) and
[native CSV](../examples/intersection/candidate.csv) retain the starting 11/19
example. Decompress the reading before opening it:

```sh
gzip -dc examples/intersection/reading.html.gz > /tmp/stoicheia-I1-intersection.html
```

## Bring the lesson into the opening view

The former desktop opening expanded 23 proposition tabs and the companion
workshop catalogue before showing any geometry. The reader now starts with a
native proposition picker and expandable **Contents**. The complete book index
remains available. Companion workshops start closed on both screen sizes;
selecting a proposition from Contents returns keyboard focus to the passage.

At 1440 px, the diagram’s top moves from 1,037 to 496 CSS pixels; at 375 px it
stays near its former position (598 to 593). The
[opening layout measurements](evidence/intersection/opening-layout.json) compare
an actual build of baseline `9f68b05` with this change. They are local browser
coordinates, not a general performance benchmark.

[Desktop opening](assets/course-opening-desktop.png) ·
[Phone opening](assets/course-opening-phone.png) ·
[Desktop experiment](assets/intersection-desktop.png) ·
[Phone experiment](assets/intersection-phone.png).

The design keeps the existing pale paper, blue ink, purple candidate and serif
source text. The enlarged phone diagram uses the same scale on both axes;
its caption is normal HTML so it stays readable rather than shrinking with the
SVG. The exact table follows the diagram on a phone. Desktop keeps both adjacent.

## What was verified

The reproducible browser driver operates the production UI in Chromium and
Firefox, each at 1440 and 375 CSS pixels. It exercises keyboard opening, Contents,
the workshop menu, precision changes, custom and invalid input, vocabulary in
both languages, both source viewers, sharing and browser Back, native downloads,
and saved readings reopened from disk. Each configuration also reloads under a
real service worker with its upstream origin shut off and offline emulation on.

Both save buttons share progress and the busy state. Ordinary course downloads
with the experiment hidden still save their own proposition without appending it.

The source-substitution case changes a retained image byte: no reading is offered,
the failure is explained, the save button recovers, and retry succeeds after the
source is restored. A separately delayed source request allows the live fraction
to change while saving; the independent reading keeps the original fraction.

The browser audit reports no page errors, external requests or CSP violations.
Axe checks the live and independent readings for its selected WCAG A/AA rules;
this is not a claim of complete accessibility certification. The new CSV and
HTML were actually downloaded. Source images load in the independent reading
without HTTP requests. The source/model argument remains visible without scripts.

```sh
npm run check
npm run verify:intersection
npm run preview
# In a second terminal:
npm run test:intersection -- http://127.0.0.1:4327/stoicheia/
```

The independent oracle recomputes squared point distances using Python Fraction
and checks the displayed lengths against a 60-digit Decimal square root over
4,188 cases. It is separate from the BigInt implementation. The five new unit
checks cover misleading rounding, the alternating approach, cardinal/extreme
points, hostile input and state restoration, and the exact CSV fields.

The initial experiment’s whole-course browser run also traverses all 189 reading steps in each
of the four browser/width configurations, reopens ordinary course exports and
checks source pages and offline reloads. Every one of the 233 files served by
the local production server matches that build byte for byte. A fresh
Node 24.22.1 installation passes lint, typecheck, all 119 unit checks, the build
and the independent oracle; its 233 output files are identical to the working
Node 26.7.0 build.

[Whole-course Chromium receipt](evidence/intersection/course-chromium.json) ·
[Whole-course Firefox receipt](evidence/intersection/course-firefox.json) ·
[Clean-install and build receipt](evidence/intersection/clean-build.json) ·
[Browser receipts](evidence/intersection/browser.json) ·
[Independent saved-file byte inspection](evidence/intersection/artifacts.json) ·
[Development quickstart receipts](evidence/intersection/development.json).

## Evidence boundary

The local implementation, source-page inspection, saved artifacts, production
browser checks and clean-install checks are distinct from public delivery.
These initial receipts stop at local builds. The follow-up
[saved-reader audit](saved-reader-audit.md) records the subsequent fixes and
delivery checks. Other publication reviews describe their own earlier versions.

The historical Greek, Latin and scans remain public domain. The new teaching
material follows the repository's PolyForm Noncommercial license, and the saved
file retains that license and the font's OFL notice. No new third-party data or
runtime dependency was added. The only pre-existing check issue repaired was
formatting in an earlier area-browser JSON receipt; its data were unchanged.
