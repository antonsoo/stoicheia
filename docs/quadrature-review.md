# A square, with nothing added

The II.14 workshop asks why averaging a rectangle's two sides does not preserve
its area. The learner constructs the equal-area square with a semicircle, moves
two rigid pieces to expose the excess square, and reads the complete argument
in Greek, Heiberg's Latin and new English.

## What can be learned

Start with 9 by 4. The rectangle has area 36 and perimeter 26. A square on the
half-sum, 6.5, keeps that perimeter but has area 42.25. Euclid's construction
instead gives a side of 6 and area 36. The 6.25 difference is a visible square,
not a numerical correction hidden in the implementation.

Lock the perimeter and choose 11 by 2, then 6.5 by 6.5. The same perimeter
encloses different areas. In the last case the given figure is already square:
the source ends that branch without constructing a semicircle.

| Rectangle  |  Area | Perimeter | Equal-area square side | Half-sum square area |
| ---------- | ----: | --------: | ---------------------: | -------------------: |
| 9 by 4     |    36 |        26 |                      6 |                42.25 |
| 11 by 2    |    22 |        26 |               sqrt(22) |                42.25 |
| 6.5 by 6.5 | 42.25 |        26 |                    6.5 |                42.25 |

The six construction stages retain Euclid's point names. The green square is
drawn on the constructed height. The rearrangement and the area ledger connect
II.5 to I.47, showing the same smaller square on both sides before subtraction.
The two area accounts use the same drawing scale.

Eleven reading units contain the whole statement and proof, language notes and
four passage questions. The reader can inspect eight full source pages and zoom
and pan them with the keyboard. Heiberg's nineteenth-century Latin sometimes
uses equations where the Greek uses prose; both remain visible.

## Sources and limits

The text is transcribed from Heiberg's 1883 volume I, printed pages 160-163.
Pages 128-129 and 110-111 supply the statements of II.5 and I.47. The
[source and model account](quadrature-model.md) records the complete PDF hash,
page mappings, transcription decisions and modern derivation. The source
manifest gives each bundled image's identity.

This is the **rectangle case**. II.14 first invokes I.45 to turn a general
rectilinear figure into a rectangle; that earlier conversion is stated as a
prerequisite and is not implemented here. The complete II.5 and I.47 proofs are
not transcribed. This is not a construction equal to a circle.

The moving pieces are a modern illustration of the II.5 relation. During motion
the smaller piece is lifted: projected overlap is not material loss. The model
uses arbitrary drawing units and a calculated real-plane circle intersection.
Four-place area displays preserve the smallest extra square in the permitted
input range (0.0025); irrational lengths are explicitly approximations.

## Portable work

The [saved HTML](../examples/stoicheia-II14-reading.html) is an actual browser
download. It includes the selected construction, all eleven readings, eight
verified source images, its Greek font, licenses and a downloadable CSV. The
completed rearrangement and pre-subtraction account are deliberately retained
for comparison, as disclosed in the file. It makes no remote subresource requests.

The [PDF](../examples/stoicheia-II14-reading.pdf) was printed from that file by
Chromium. Its typography and source-page margins were inspected; physical
printing was not tested. The [SVG](../examples/stoicheia-II14-construction.svg)
and [CSV](../examples/stoicheia-II14-measurements.csv) are separate native
downloads, with the same 9 by 4 experiment.

## What was checked

- `npm run check` under Node 24: formatting, strict TypeScript, 43 checks and
  production build. The numerical check below is independent of those checks.
- `npm run verify:quadrature`: every one of the 22,801 allowed input pairs,
  using exact integer differences of squares and a separate 45-digit Decimal
  circle intersection. A further 505 positions check rigid-piece area and all
  side lengths. [Result](quadrature-oracle.json).
- `node scripts/quadrature-browser.mjs OUTPUT`: Chromium and Firefox, each at
  1440 and 375 pixels. The actual workflow changes lengths, uses the perimeter
  lock by keyboard, rejects an impossible locked complement, takes the square
  branch, reverses sides, moves pieces, subtracts the common square, restores
  history, reads sources and answers passage questions. It opens downloaded SVG
  as XML and HTML as a local file, verifies all eight embedded image hashes and
  compares the embedded CSV with the separate download. Reviewed views have no
  axe violations. [Production result](quadrature-browser.json),
  [development result](quadrature-development.json).
- `node scripts/quadrature-layout.mjs URL OUTPUT`: 210 combinations across
  both engines, three widths, seven rectangles and five stages. Text bounding
  boxes and horizontal overflow are checked, including thin, reversed,
  nearly-square and already-square figures. [Result](quadrature-layout.json).
- `node scripts/quadrature-exports.mjs URL OUTPUT`: hold a source request while
  changing the live rectangle and verify the download preserves the original
  snapshot. Substitute a different scan with HTTP 200, require a visible failure
  and no download, then retry successfully. Both engines. [Result](quadrature-exports.json).
- `node scripts/quadrature-upgrade.mjs OLD_DIST dist OUTPUT`: upgrade the
  previous two-page edition while a new scan is held or replaced. The previous
  edition remains available; the incomplete replacement is not declared ready.
  After recovery all three rooms and the new source work with the local HTTP
  origin physically unavailable. Both engines. [Result](quadrature-upgrade.json).

The local production workflow also disables its HTTP origin before visiting
all three pages and saving another illustrated reading. This is stronger than
only setting Playwright's browser offline flag: Firefox service workers can
continue fetching under that flag. Hosted browser checks, when recorded, use
browser offline mode and do not claim control of GitHub's origin.

[Desktop construction](assets/quadrature-desktop.png),
[phone construction](assets/quadrature-mobile.png),
[moving pieces](assets/quadrature-pieces.png) and
[three-language reading](assets/quadrature-reading.png) were opened and inspected.

## Publication

Local source and build are reviewed. Public byte and workflow verification will
be recorded after the reviewed edition is pushed.
