# Offline readiness across editions

The original reader used `navigator.serviceWorker.ready` to announce that the
edition was available offline. That promise only establishes an active worker;
it can resolve for an older edition while the newly opened course is still
being installed. This is the behaviour described by [MDN’s API reference](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/ready).

## Reproduced failure

The [before record](offline-upgrade-before.json) starts with the published
six-proposition build, then serves the ten-proposition build at source commit
`a41afd56ca5bb485df3e668bf002d78d2f3463ae`. The server holds printed page 31 so
the new install cannot finish.

| Observation                             | Chromium 153.0.8010.12            | Firefox 155.0                     |
| --------------------------------------- | --------------------------------- | --------------------------------- |
| Current page                            | I.10                              | I.10                              |
| Visible status during the held download | Edition ready offline             | Edition ready offline             |
| Old worker                              | Activated                         | Activated                         |
| New worker                              | Installing                        | Installing                        |
| Origin disabled, then reload            | Older six-proposition course, I.1 | Older six-proposition course, I.1 |

The reload was served by the worker in both browsers. Leaving an already-loaded
I.10 page visible would not have demonstrated that the current edition was saved.

## Corrected behaviour

The build injects the same source-and-asset fingerprint into the reader and its
worker. The reader checks the controlling worker’s fingerprint and whether all
of that worker’s bundled files are present. It waits through installation and
activation; an older worker’s silence is not treated as confirmation.

The [upgrade record](offline-upgrade-verification.json) exercises held downloads
and persistent HTTP 503 failures in both browsers. The page withholds readiness,
recovers after a reconnect event, and retains I.10 at step 7. Once it reports
readiness, the test disables its local origin, verifies that HTTP cannot reach
it, and reloads under browser offline emulation. I.10 remains available, and the
source image’s SHA-256 matches the bundled page. The reconnect event is dispatched
explicitly after toggling browser connectivity; this is a controlled browser
workflow, not an observation from a physical network outage.

Run the check with two production builds:

```sh
node scripts/offline-upgrade-check.mjs /path/to/six-proposition/dist dist
```

The older build comes from `ea1dc1d0170826d221d61ca6b486654b43771494` and its
worker hash is retained in the record. The current build comes from the source
commit identified in [the clean-build receipt](build-verification.json).

## An already-open tab

A separate [two-tab check](offline-tabs-verification.json) opens a reader at
I.9’s outward-ray exploration. A second tab installs a different edition. The
original tab offers a reload and preserves its proposition, step, angle and
crossing choice when the reader takes that action. It does not automatically
navigate away from the current sentence. The retained warning also survives a
subsequent offline reload with the origin disabled.

This check used source `5c91a8a26604b94635c7dd36d70a46bb871c9657`, before the
subsequent navigation-only CSS correction. The second build is a controlled
fixture: the same source with one additional
trailing newline in `public/sources/manifest.json`, built normally with Vite.
That produces different edition and asset bytes without inventing a second
published release or changing the mathematical lesson. Both worker hashes are
recorded. Reproduce with:

```sh
node scripts/offline-tabs-check.mjs /path/to/current/dist /path/to/fixture/dist
```

These checks cover the stated browser versions and controlled upgrade sequence.
Browser storage can still be disabled or cleared. Source publication, hosted
bytes and this offline behaviour are separate records.
