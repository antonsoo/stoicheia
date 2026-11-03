# Audit: a saved reader must be readable

This review follows the I.1 intersection experiment. It examines the learner's
working copy, source viewer, illustrated downloads and fourteen-room saved edition.
Receipts in `docs/evidence/saved-reader/` distinguish local builds from public
delivery. Earlier review files describe their own dated builds.

## Findings and corrections

| Trigger                                                   | Problem                                                                     | Corrected behavior                                                                                              |
| --------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Type an unapplied fraction, then change display precision | The draft silently reverted to the applied fraction                         | Draft and validation stay visible; Apply and Discard are explicit; sharing/saving identify the applied fraction |
| Replace cached scan bytes or remove another room's HTML   | A tab could continue claiming the edition was ready                         | A complete byte and response-type audit withdraws the claim across open rooms and offers repair                 |
| Reopen an incomplete saved copy                           | There was no repair control                                                 | Check or repair reuses verified files and requests only missing or damaged bytes                                |
| Remove a startup module or the whole cache                | Offline navigation could leave an empty reader                              | A worker-contained recovery page offers repair and preserves the lesson address                                 |
| Remove files while an origin navigation stalls            | An earlier in-memory response could outlive the saved copy                  | Fallback rechecks the current cache and startup files at the moment it is needed                                |
| Inspect printed Greek page 6                              | The viewer described a complete page despite its cropped right edge         | Visible warning, image alternative and status identify the crop                                                 |
| Export while the browser queues competing requests        | The body inactivity timer could expire before a connection supplied headers | Header/queue wait has its own total bound; body inactivity starts after headers and resets on every chunk       |
| Close a source viewer during a shared export              | The source request had no consumer-aware cancellation                       | Closing one consumer preserves another's transfer; cancelling the last stops it                                 |
| Update while an earlier repair is still transferring      | Cache writes need ordering against activation and namespace retirement      | Activation and short cache writes share a Web Lock, with worker identity checked inside it                      |

The [before receipt](evidence/saved-reader/before.json) records draft loss, stale
readiness, absent repair controls and the cropped-page label in both browsers.
The transfer and lifecycle rows also include corrections discovered during this
audit; the browser receipts below define what was actually exercised.

The page-6 limitation is about the retained Toronto image, not a new gap introduced
by the app. No missing margin has been reconstructed. Checksums establish image
identity; they do not establish completeness or correctness of a transcription.

The browser replay also caught an audit regression: `cache: "reload"` on reader
requests failed in Firefox offline mode despite a correct saved copy. Reader
requests now use the default cache mode; worker network repair explicitly uses
reload. The all-room review downloads a ten-scan I.1 reading offline in both
engines to guard this distinction.

## Transfer and recovery contracts

`src/core/verified-transfer.ts` is the same implementation used by illustrated
readings and the generated classic worker. It checks the expected byte length
and SHA-256 before returning a file, rejects HTTP errors, stops oversized bodies
immediately, and cancels failed reads. The default per-transfer total deadline is
180 seconds. After response headers, 15 seconds without body data is an error;
an active transfer is allowed to exceed 15 seconds. Application queue time before
starting a transfer is separate. Navigation has its own shorter saved-page
fallback deadline.

Each reader allows three source/export transfers at once; a source explicitly
opened by the learner is promoted ahead of queued export-only pages. The worker
uses two background streams. Independent consumers share verified bytes. A
viewer's abort cannot cancel an export that still needs the same file. Export
cancellation does not reset the applied geometry or discard the learner's draft.
The direct-transfer cancellation review blocks service workers to observe those
reader-owned bodies. The worker's independent edition installation has its own
transfers and can continue after a reading is cancelled.

Every ready claim requires the current worker, matching edition, every canonical
file, exact length and SHA-256, and a usable response Content-Type. Focus, return
to a tab, reconnection, controller changes and worker notifications trigger checks.
The footer also exposes an explicit check. Readiness is a checked snapshot;
browsers can evict storage later, including while a tab remains idle.

Repair can reuse bytes from a previous edition only after checking them against
the new file identity. Metadata is rebuilt with the correct media type. A retired
worker cannot recreate its old namespace after activation deletes it. The lock
covers writes and retirement, never network transfers.

The independent recovery document is embedded in the worker. It does not need
the saved JavaScript, CSS or font. Its inline script and style have exact CSP
hashes, and it makes no third-party requests. Merely showing recovery must not
recreate a missing cache. Once repair succeeds, Return to lesson opens the same
address and applied settings.

The delayed-repair browser scenario installs a second edition while the first
repair is held. Both browsers defer activation until the earlier event completes,
as specified by [Try Activate](https://w3c.github.io/ServiceWorker/#try-activate-algorithm).
The receipt verifies completion followed by retirement and no old cache returning;
it does not claim to force a native write after retirement. The identity check
inside the shared lock is the additional implementation guard.

## Slow connections and browser lifetime

The cold-network review uses one shared 128,000-byte/second origin for the app,
foreground illustrated reading and background edition installation. This is a
total origin budget, rather than a separate allowance for each request. It records
each body, foreground time, installation progress and repair clicks.

A complete source edition is roughly 60 MB. On this connection it exceeds a single
worker event's lifetime. Chromium documents termination when an event takes more
than five minutes to settle ([Chromium security FAQ](https://chromium.googlesource.com/chromium/src/+/main/docs/security/service-worker-security-faq.md)).
The reader retains verified partial files. A visible, connected tab automatically
continues a long interrupted installation only if its verified file count grew.
If the next attempt makes no further progress, retries stop and Check or repair
remains available. Hidden tabs do not initiate this continuation. The slow review
records any explicit repair clicks separately from installation attempts. It does
not claim uninterrupted installation,
unlimited transfer time, or guaranteed storage retention.

The source viewer and portable reading remain separate from the all-room offline
claim. An individual reading can download while the larger edition is still being
saved. Development now uses port 4326; production preview uses 4327, avoiding a
saved production worker controlling the development origin.

## Reproduce

From a clean Node 24 checkout:

```sh
npm ci
npm run check
node scripts/saved-edition-browser.mjs dist /tmp/stoicheia-saved-review
node scripts/reading-cancellation-browser.mjs dist /tmp/stoicheia-cancellation
node scripts/cold-reading-browser.mjs dist /tmp/stoicheia-cold-review
```

The cold review takes substantially longer than ordinary browser checks. For a
genuine two-edition race, retain two different production builds and run:

```sh
node scripts/retired-repair-browser.mjs BEFORE_DIST AFTER_DIST /tmp/stoicheia-retirement.json
node scripts/offline-tabs-check.mjs BEFORE_DIST AFTER_DIST /tmp/stoicheia-upgrade.json
```

The retirement review checks offline correction of wrong response metadata,
a delayed old repair followed by activation and retirement, source reuse and explicit reload preserving the
address. The saved-edition review opens all fourteen rooms in Chromium and Firefox
at desktop and 375 px, damages bytes, removes pages, tests failed repair, restores
the copy, exercises maintenance responses and stalled navigation, removes startup
modules and the whole cache, and checks recovery without CSP or page errors.

These are browser observations on the recorded engines, not promises about every
browser. Repair requires service workers, CacheStorage, Web Crypto and Web Locks
on a secure origin. A portable illustrated reading remains a useful independent
artifact. The recovery page requires the worker registration to remain; clearing
that registration as well requires reconnecting to load the reader. The I.1 rational restriction remains a modern teaching experiment, not
a historical interpretation or a model satisfying all of Euclid's postulates.

## Retained local evidence

The clean Node 24.22.1 install passed lint, both TypeScript configurations, all
124 unit checks and the production build. Its 233 canonical files (60,357,467
bytes) match the working Node 26.7.0 build and the frozen production build used
for the final recovery and cold-network reviews. The runtime source revision is
recorded in the [build inventory](evidence/saved-reader/build.json).

| Receipt                                                                 | Observation                                                                                                                                                  |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Before](evidence/saved-reader/before.json)                             | Both engines reproduce draft loss, stale ready status, absent repair and the inaccurate cropped-page label                                                   |
| [Recovery](evidence/saved-reader/recovery.json)                         | Four browser/width configurations, fourteen rooms each, 232 verified saved files; damaged-copy repair, independent startup recovery and offline I.1 download |
| [Cancellation](evidence/saved-reader/cancellation.json)                 | Shared direct reads, last-consumer cancellation, retry and interactive priority in both engines                                                              |
| [Retirement](evidence/saved-reader/retirement.json)                     | Offline response-type repair, delayed old event then activation, verified source reuse and preserved address                                                 |
| [Upgrade](evidence/saved-reader/upgrade.json)                           | Original worker to a new edition; explicit reload preserves lesson, step, angle and construction choice                                                      |
| [I.1 journey](evidence/saved-reader/intersection.json)                  | Candidate controls, source readings, keyboard, sharing and independent illustrated files                                                                     |
| [Illustrated readings](evidence/saved-reader/illustrated-readings.json) | All 23 main-course readings plus the separate I.22 workshop in desktop Chromium; representative phone/Firefox packets and disconnected exports               |
| [Independent oracles](evidence/saved-reader/oracles.json)               | All 21 oracle commands pass, including 4,188 I.1 point cases                                                                                                 |

The [Chromium](evidence/saved-reader/course-chromium.json) and
[Firefox](evidence/saved-reader/course-firefox.json) whole-course replays traverse
the 189 aligned reading steps at both widths. Those operation receipts and the
illustrated-reading review precede the final installation-continuation change;
the final recovery review and build inventory identify their own exact build.

[Preserved invalid draft](assets/intersection-draft.png) ·
[Honest cropped-page viewer](assets/source-page-6-limit.png) ·
[Independent phone recovery](assets/saved-reader-recovery.png).

## Cold-network result

The [complete cold-network receipt](evidence/saved-reader/cold-network.json) records
the shared 128,000-byte/second origin, ten embedded scans, progress over each
interrupted installation and **zero explicit repair clicks** in both engines.

| Engine   | Illustrated reading | Complete edition | Explicit repair clicks |
| -------- | ------------------: | ---------------: | ---------------------: |
| Chromium |              49.2 s |          512.2 s |                      0 |
| Firefox  |              52.6 s |          547.4 s |                      0 |

The Chromium context exposed two worker events. Playwright exposed none of those
events in Firefox, so its installation-attempt count is unknown rather than zero;
the progress restarts, downloaded reading and final complete audit are retained.
These are local browser measurements on a deliberately limited origin, not
benchmarks of GitHub Pages or guarantees about another connection.
