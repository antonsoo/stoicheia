# I.22–23 course publication

The reviewed runtime is source `5c7e194`. Its independent Node 24.22 build
reproduces all 128 output files / 31,026,680 bytes exactly.
[Build identities](copying-review/build.json) · [Source and model review](copying-review.md).

Both Chromium 153.0.8010.12 and Firefox 155.0 replayed the complete course at
1440 and 375px: 189 reading steps, all 46 exercises, the foundations, source
navigation through p.57, actual downloads and origin-disabled offline reloads.
[Chromium](copying-review/course-chromium.json) · [Firefox](copying-review/course-firefox.json).
Historical example files produced by these programs were confined to the
temporary review clone; the retained examples for this change have new names.

The [new-lesson review](copying-review/browser.json),
[source fault review](copying-review/integrity.json),
[reordered-response review](copying-review/source-race.json) and
[real prior-edition upgrades](copying-review/upgrade.json) verify distinct
reading, source, native-file and worker behavior. The independent numerical
and actual SVG-coordinate checks are linked from the source review.

## Published edition

The source and retained studies were pushed to `main` at
`72efaa49c5d8231b529fbe208f5eccbe2b87edf0`. The reviewed output was overlaid on
`gh-pages`, preserving the older hashed assets, and pushed normally as
`43701ad43e1df203c850c0d9824a476f0ccad15f`. The existing Pages configuration
uses that branch; its build API reports this commit as built.
[Pages API receipt](copying-review/pages-build.json).

All **128 canonical public files** match the reviewed byte counts and SHA-256
hashes, without cache-busting queries. The directory index matched both before
and after the inventory. [Hosted file identities](copying-review/hosted-files.json).
The edition is `f1d017db40f4c6ac6eaf4d6fefd90f45d2534c1b51b66b61a07946a45eb27938`.

The [actual public browser review](copying-review/public-browser.json) passed
Chromium 153.0.8010.12 and Firefox 155.0 at **1440 and 375px**. Each reads all
fifteen new aligned units; changes real controls and reflected copies; checks
source images by their displayed blob bytes; saves and opens native HTML/SVG;
completes the four new exercises; checks the complete cache inventory; and
opens all seven rooms and saves the new source-backed reading with browser
networking disabled. The public host remains running. The separate local
review also stops its origin, which establishes the stronger disconnected
server condition without relying solely on a browser flag.

The independent Python review passes **32 real public SVG views / 96 geometric
checks**. The actual public native studies print to 18 and 12 pages, and all
respective eight and six source JPEGs can again be extracted byte for byte.
No page errors, document overflow or automated WCAG A/AA violations occurred
in the completed public run. Those automated checks are not full accessibility
conformance.

An [initial public run](copying-review/public-first-incomplete.json) completed
three configurations but timed out waiting for offline readiness in Firefox
at 375px. Its [failure output](copying-review/public-first-incomplete.txt)
is retained. A [fresh Firefox phone diagnostic](copying-review/public-firefox-diagnostic.json)
then obtained the matching active controller and complete readiness with no
reported console errors, failed requests or HTTP error responses. Repeating
the entire public workflow completed all four configurations. The first
readiness timeout's cause was not established; the partial run is not counted
as a complete review.

The earlier I.21 review still operates ten readings and 162 drawn cases per
configuration with the new verified viewer. The sliding-plate workshop's
course links, native files and offline navigation also pass in both engines
and both widths. [I.21 regression](copying-review/prior-I21.json) ·
[Mesolabe regression](copying-review/prior-mesolabe.json). One legacy I.21
review assertion treated the letters `NaN` inside valid embedded base64 as a
non-finite drawing. It now checks numeric markup separately from data payloads
and retains an independent script-tag rejection.

## Hosted automation limitation

GitHub's CI and custom Pages workflows for source `72efaa4` did **not start**
their job steps. The check annotations state: "The job was not started because
your account is locked due to a billing issue."
[CI annotation](copying-review/ci-annotations.json) ·
[Custom Pages workflow annotation](copying-review/pages-workflow-annotations.json).
The existing branch-based Pages publication and the actual served-file/browser
checks above succeeded independently. Local checks passed; no hosted CI pass,
package registry release or physical construction is claimed.

```sh
python3 scripts/measure-hosted.py https://antonsoo.github.io/stoicheia/ /tmp/stoicheia-hosted.json
node scripts/copying-browser.mjs /tmp/stoicheia-public https://antonsoo.github.io/stoicheia/
python3 scripts/copying-rendered-oracle.py /tmp/stoicheia-public/review.json
```
