# Verify the files before saving an edition

A complete list of cached file names does not establish that those files contain
the expected edition. A controlled local server reproduced two HTTP 200
substitutions during installation of the published ten-proposition build:

| Response returned during installation       | Before: visible promise | Before: actual offline result                                                                |
| ------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------- |
| The earlier six-proposition `index.html`    | Edition ready offline   | The cached entry references older script files absent from this cache; the reader is missing |
| Printed page 30 in the response for page 31 | Edition ready offline   | The reader opens page 30's Greek scan under the page 31 Latin source control                 |

The original page navigation received the correct ten-proposition entry. The
worker's separate requests received the substitutions. All responses succeeded;
no missing filename or HTTP error exposed the mismatch. The server was then
disabled, an HTTP probe failed, and the browser reloaded through its worker.
The [before record](mixed-edition-before.json) preserves the expected and actual
SHA-256 values and the outcomes in Chromium 153.0.8010.12 and Firefox 155.0.
This is a reproduced local failure condition, not an observed incident on the
public host.

The earlier build is from `ea1dc1d0170826d221d61ca6b486654b43771494` and the
vulnerable ten-proposition build is from
`ab098e7e389e4ff0af8bfb4494d08764c87fea0e`. The substituted scan is the unchanged
bundled page 30. Neither experiment invents a source-page image.

## Corrected installation and recovery

The build now hashes every precached resource and gives each request its expected
SHA-256 integrity value. The browser checks the response bytes during retrieval.
Only a successful complete `Cache.addAll()` permits the worker to activate.
The request's `cache: "reload"` also bypasses the browser's ordinary HTTP cache;
a successful response still has to match the expected bytes. These are the
standard [Request integrity](https://developer.mozilla.org/en-US/docs/Web/API/Request/integrity)
and [Cache.addAll](https://developer.mozilla.org/en-US/docs/Web/API/Cache/addAll)
interfaces. The 35 precached resources include the entry page, source scans,
compiled code, CSS, font and attribution files. The worker itself is updated
through the browser's registration mechanism.

A failed first installation can discard its registration. Recovery therefore
registers again when there is no active worker; calling `update()` on the old
registration alone cannot recover that case. When an older active worker exists,
the established update path remains available.

The [corrected record](mixed-edition-verification.json) rejects both substitutions
in both browsers, keeps the current online reading visible, and recovers after
the server supplies the expected files. After readiness, a real origin-disabled
reload retains I.10, step 7, and opens the exact page 31 image. The reconnect event
is dispatched explicitly after browser connectivity is toggled; this does not
claim a physical network-outage test.

The [clean-build record](mixed-edition-build.json) identifies the repaired source
and its build. The [full browser pass](mixed-edition-browser.json) replays all
85 reading steps, downloads, source views and offline reloads. The
[older-edition upgrade pass](mixed-edition-upgrade.json) retains the held/failed
download controls from the original offline review. The
[two-tab pass](mixed-edition-tabs.json) starts with the actually published
unrepaired ten-proposition build and moves to this repair, preserving the
reader's position and alternate-ray choice through an explicit reload.

## Reproduce

Build the named source revisions in separate directories, then run:

```sh
node scripts/mixed-edition-check.mjs /path/to/six-proposition/dist /path/to/unrepaired-ten/dist --before
node scripts/mixed-edition-check.mjs /path/to/six-proposition/dist dist
node scripts/offline-upgrade-check.mjs /path/to/six-proposition/dist dist
node scripts/offline-tabs-check.mjs /path/to/unrepaired-ten/dist dist docs/mixed-edition-tabs.json
```

The first command requires the unrepaired artifact and intentionally asserts the
observed failure. The others require the repaired build. Their hashes distinguish
the artifacts. Integrity is checked at installation; browser storage can still
be cleared later. These checks do not change the course's mathematical or
philological validation boundaries.

## Published result

The [live course](https://antonsoo.github.io/stoicheia/) serves this repair. Its
[direct HTTPS record](mixed-edition-publication.json) matches all 36 production
files to the reviewed build and exercises all ten final steps, source browsing,
shared state, the bisection controls and worker-served offline-emulation reloads
in Chromium and Firefox at desktop and phone widths. The public origin remains
online in that hosted check; the local mixed-response and upgrade checks supply
the origin-disabled controls. The source and `gh-pages` commits are recorded
separately. This is not a remote CI or package-release claim.
