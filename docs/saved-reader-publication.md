# I.1 reader and saved-edition audit: public delivery

[Open the experiment](https://antonsoo.github.io/stoicheia/#p=1&s=3&intersection=1) ·
[Find it by the Greek command](https://antonsoo.github.io/officina/?q=%CF%84%CE%AD%CE%BC%CE%BD%CE%BF%CF%85%CF%83%CE%B9%CE%BD#tools)

The runtime source is `5dd342bd43f4fed7d311bdfe8bd691cfbe331ce9`. The reviewed
source, documentation and local receipts were pushed at
`9d28d614d686f6d760be2478d23235b9de7fa001`. The Pages branch was published at
`1269c79`; previously published hashed assets remain available. Unpublished
intermediate bundles were removed. The canonical runtime files are identical to
the frozen build recorded in the [local inventory](evidence/saved-reader/build.json).

## Delivery and operation

The [hosted file receipt](evidence/saved-reader/public/files.json) reads all
**233 canonical URLs**, without cache-busting queries, and verifies their lengths
and SHA-256 against the clean build: **60,357,467 bytes** in total. This includes
the worker, all fourteen entry pages, application bundles, source images,
manifests, font and notices.

The [public journey](evidence/saved-reader/public/journey.json) starts at the
published Officina catalogue and runs in Chromium and Firefox, each at 1440 and
375 px. It searches accented/unaccented Greek, `temnousin`, Latin and fractions,
shares the search, opens the immutable recorded review with the keyboard, and
opens the live lesson with the keyboard. The review's raw bytes also match the
local pinned git object.

In the lesson, the browser changes precision, selects 56/97, inspects its exact
nonzero residual, opens Greek page 12, and checks the displayed image's actual
Blob bytes against the source manifest. It downloads the ten-scan illustrated
reading, opens it from disk, reloads it while offline, then reloads the actual
hosted lesson offline under its current worker and saves another reading. The
portable file makes no network requests. All four configurations report no page
errors.

The [public application-of-areas review](evidence/saved-reader/public/areas.json)
also operates its geometry, actual exports and fourteen-room offline navigation
in both browsers at both widths. This separately exercises a companion room's
use of the shared transfer and offline implementation.

[Actual public desktop experiment](assets/intersection-public-desktop.png) ·
[Actual public phone experiment](assets/intersection-public-phone.png).
The images were opened and inspected. The equal-unit plate and exact ledger stay
adjacent on desktop and stack on the phone; the residual and modern-model limit
remain readable.

## Evidence boundaries

The exhaustive damage, recovery, metadata, delayed-repair and lifetime cases use
controlled local production origins. The public review verifies actual delivery,
source inspection, controls, downloads and offline operation. Neither substitutes
for the other. Browser storage can be evicted; repair needs the current worker
and, for genuinely missing bytes, a working connection.

The source CI run for `9d28d61` reported failure with an empty step list; no CI
checks executed in that run. The fresh Node 24 local checks passed all 124 unit
checks, lint, both TypeScript configurations and the production build. CI and
public delivery are separate claims.

Build with `npm run build`; the static output is `dist/`. The source hash excludes
review-only documentation and scripts, so these publication receipts do not
change the audited runtime bytes.
