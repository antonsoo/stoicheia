# A square, with nothing added

The workshop implements the rectangle case of Euclid II.14. Its lesson is the
difference between preserving area and preserving perimeter, followed through a
construction, a rearrangement and the complete Greek/Latin argument.

## Source, scope and transcription

J. L. Heiberg, *Euclidis opera omnia*, vol. I, Leipzig: Teubner, 1883. The full
PDF is the [University of Toronto scan](https://archive.org/details/euclidisoperaomn01eucluoft),
SHA-256 `da285c581c2dda86e2b25e20db3ce604bf6fb8765228fcd71cfc89d47a9d1c17`.

| Passage | Printed pages | PDF pages, one-based | Archive leaves |
| --- | --- | --- | --- |
| II.14, complete | 160–163 | 174–177 | 174–177 |
| II.5, statement | 128–129 | 142–143 | 142–143 |
| I.47, statement | 110–111 | 124–125 | 124–125 |

The Archive's `scandata.zip` / `scandata.xml` confirms the leaf mappings. All
eight images were inspected at their original rendered size. They are full-page
JPEGs from `pdftoppm -scale-to 1800 -jpeg -jpegopt quality=88`, with page-specific
identities in `public/sources/manifest.json`. The build checks those identities;
the saved reading verifies every downloaded source and the font before embedding.
The source PDF and the images are public domain. New English, notes, diagrams and
code are MIT, with the font's OFL included in saved readings.

The eleven reading units contain the entire II.14 statement and proof. Greek
point labels remain Greek in both languages: Η is the midpoint/centre; Θ is the
point where the continued side meets the semicircle. ΒΔ names the rectangle by
opposite corners. Α names a complete rectilinear figure, not a point.

The Latin is Heiberg's nineteenth-century translation. Its compact squared
formulas are retained and explicitly distinguished from the Greek prose. The
printed `aequale` after `figura` on page 163 is retained. Greek ϑ becomes θ;
line breaks, apparatus and inline Latin references are omitted in the reading,
while the scans retain them. English and grammatical commentary are new.

The general proposition first invokes I.45 to replace a rectilinear figure by a
rectangle of equal area. This workshop starts with that rectangle; it does not
implement I.45, transcribe the full II.5 or I.47 proofs, or construct a square
equal to a circle. Those boundaries appear in the app and its portable reading.

## Exact givens and a calculated intersection

The two input lengths are integers from 10 to 160 in tenths of a drawing unit.
Set `a = max(input)/10` and `b = min(input)/10`, matching the source's choice of
the longer side as ΒΕ. Reversing the supplied sides turns the rectangle; no
length is silently changed. An invalid typed value leaves the valid model intact.
A perimeter lock holds the sum of the input integers fixed, rejecting a change
that would push the other side outside the permitted range.

Use coordinates Β = (0, 0), Ε = (a, 0), Ζ = (a+b, 0), Η = (r, 0), with
`r = (a+b)/2`. The rectangle extends downward by b. Its side ΔΕ extends upward
to Θ = (a, h), where the semicircle supplies

```
d = a-r = (a-b)/2
h = sqrt(r*r - d*d)
```

The implementation obtains h from that circle intersection, separately from
the product ab used to compare the areas. The drawing uses equal scales on both
axes. Near-equal sides can make Η and Ε almost coincide; their labels lie on
opposite sides of the baseline. Exact equality is detected from the integer
inputs: the source finishes at the given square and skips the semicircle.

II.5 gives `ab + d*d = r*r`. The equal radii ΗΖ and ΗΘ identify the latter square
with the hypotenuse-square of ΗΕΘ. I.47 gives `h*h + d*d = r*r`. Subtraction leaves
`ab = h*h`. The arithmetic mean r preserves perimeter but adds `d*d` of area.
The geometric mean h preserves area but generally changes perimeter.

| Chosen rectangle | Area | Perimeter | Constructed side | Half-sum square area |
| --- | ---: | ---: | ---: | ---: |
| 9 by 4 | 36 | 26 | 6 | 42.25 |
| 11 by 2 | 22 | 26 | sqrt(22) | 42.25 |
| 6.5 by 6.5 | 42.25 | 26 | 6.5 | 42.25 |

Lengths and areas use arbitrary drawing units. Six-place readouts are
approximations where the square root is irrational. The CSV distinguishes the
exact input product from the floating-point square of the calculated height.
No rounded numeric coincidence is used to choose a geometric branch.

## A modern two-piece illustration

The long rectangle is cut at r into `r by b` and `d by b`. The smaller piece
rotates 90 degrees and moves above the first, filling `b by d`. Since `b+d=r`,
the union is an r-square missing a d-square in its upper-right corner.
The moving piece is a rigid polygon; only its centre and rotation change.
Intermediate projected overlap is labelled as a lifted piece, not material
loss. The original II.5 diagram and full proof are not being reconstructed.
The area-comparison diagrams use the same pixel scale for both accounts.

## State and portable readings

The shared hash stores both lengths, construction stage, piece movement,
subtraction state, perimeter lock and reading unit. Repeated recognized keys
reset the whole experiment; malformed or out-of-range individual settings
fall back explicitly. Section navigation preserves that hash. Browser history
restores the numerical experiment and passage.

Saving captures a state snapshot before fetching the verified sources. The
HTML contains all eleven three-language readings, notes, eight scans, font,
licenses, measurements, selected construction, completed rearrangement and
pre-subtraction account. The latter two are intentionally retained for comparison
regardless of the captured view. The embedded CSV is an actual download link.
There are no runtime scripts or remote subresources. The application link needs
a connection. SVG and CSV can also be saved separately.

## Independent checks

`npm run verify:quadrature` streams all 22,801 allowed input pairs into Python.
The checker uses exact integer differences of squares and a 45-digit Decimal
circle intersection, checks the right-angle coordinates and area/perimeter
relations, and verifies 505 rigid-piece positions with shoelace area and side
lengths. It does not import or transcribe the TypeScript solver.

The first run's maximum height discrepancy was `3.552713678800501e-15` drawing
units; maximum moving-piece area discrepancy was `6.583622536027178e-14` square
units. These describe numerical agreement, not ancient measurement precision.
