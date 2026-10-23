# Keep the proof and its evidence together

Every course proposition can now save an illustrated study with its selected
diagram, complete Greek/Latin/English proof, reasons, relevant foundations,
source-page images and Greek font. The source pages are deduplicated: I.21, for
example, includes 8–9 for postulate 2 and 50–53 for the proposition itself.
The file opens directly from disk, without scripts or external requests.

[I.21 HTML](../examples/stoicheia-I21-study.html) ·
[I.21 PDF](../examples/stoicheia-I21-study.pdf) ·
[I.22 HTML](../examples/stoicheia-I22-reading.html) ·
[I.22 PDF](../examples/stoicheia-I22-reading.pdf).

## A reproduced source mismatch

The previous I.22 export checked successful responses, but did not compare the
downloaded bytes with the edition. In a browser with its service worker blocked,
returning page 50's JPEG for the page-52 request produced a successful download
with the wrong image under the page-52 caption. The actual embedded hash equals
the substituted page's hash: [before receipt](illustrated-review/substituted-before.json).

The build now verifies every page against the checked-in source manifest and
embeds the expected byte sizes and SHA-256 hashes for images, font and font notice.
Both the course and I.22 verify those identities before offering a file. A wrong
HTTP-200 response produces a readable error and no download. A failed asset is
not retained as a successful cached promise; retrying after recovery succeeds.
These hashes establish agreement with the reviewed edition, not the independent
historical authenticity of its source material.

The export snapshots the lesson, step and diagram at the click. A deliberately
held source request followed by navigation to I.1 still saves the requested
I.21 study. The reader stays on I.1. The shared export button cannot start a second
save while the first is pending.

## Actual file and browser review

`npm run test:illustrated -- /tmp/stoicheia-illustrated` uses Chromium
153.0.8010.12 and Firefox 155.0 at 1440 and 375 pixels. Chromium desktop saved
every course proposition and I.22 through the actual buttons. The other three
configurations saved I.1, I.15, I.21 and I.22, covering early foundations, the
Greek-only corollary and the two new lessons.

All 34 files were opened from disk. Each expected scan and embedded font was
checked by SHA-256; images decoded; full source-language and English paragraphs
were found in the course studies; copyright notices remained present. No external
requests or horizontal overflow occurred. The I.21 and I.22 saved views reported
no automated WCAG A/AA violations. The serving origin was then disconnected
below the browser, and both I.21 and I.22 were exported again offline in all four
configurations. [Browser receipt](illustrated-review/browser.json).

Both engines separately rejected substituted images, fonts and font notices in
both export paths, then successfully retried each case. Both also passed the held
request/navigation snapshot case. The source-manifest build guard was exercised
in a disposable checkout by substituting page 50 for page 52; the build refused
it and the original file was restored. [Build rejection](illustrated-review/build-rejection.json).

The final print-layout adjustment was followed by fresh I.21 downloads in all
four browser/size configurations, with six decoded source images, the embedded
font and no overflow: [layout receipt](illustrated-review/final-layout.json).
Its 13-page PDF keeps the proposition's three columns together and gives the
facsimiles physical print margins. Representative proof and source pages were
rasterized and read visually. Poppler verifies all 50 complete I.21 language and
reason fields and all 45 I.22 fields: [I.21 print](illustrated-review/print.json),
[I.22 print](illustrated-review/closure-print.json).

## Reproducibility and limits

The [final build inventory](illustrated-review/build.json) records runtime commit,
clean Node 24.21.0 build and all public file hashes. Lint, strict typechecking,
39 meaningful tests and production compilation passed from a fresh archive.
The geometric and full-course evidence is recorded in the [I.21 review](nested-review.md).
Public-byte and direct HTTPS browser evidence is recorded separately after deployment.

The font and relevant facsimiles make each study several megabytes. They are
source packets, not minimal text-only exports. Their PDF versions are browser
prints, not tagged PDFs or newly typeset critical editions. Source page 6's
original cropped edge is identified in its saved caption; the missing margin is
not presented as visible evidence. The PDF keeps attribution but omits the full
license texts, which remain embedded in the HTML under redistribution notices.
