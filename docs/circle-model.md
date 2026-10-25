# Keep the safe side

The problem is not to display many digits of pi. It is to understand why an
inexact length can still support a strict conclusion, and how a harmless-looking
change can remove that support.

This local companion workshop reads Archimedes' _Measurement of a Circle_ 3.
It adds an experiment to the existing Euclid course rather than extending the
sequential Book I curriculum. No ancient apparatus or historical accuracy of
physical calculation is inferred.

## The two arguments

Let theta be half a regular polygon's central angle. In a right triangle formed
by the radius and an outer half-side, normalize the half-side to one:

```
adjacent / half-side = A
slant / half-side    = H
H^2                 = A^2 + 1
```

The angle-bisector theorem gives the new half-side as A/(A+H), in the old
normalization. Renormalizing gives:

```
A_next = A + H
H_next = sqrt(A_next^2 + 1)
```

The exact geometric quantities are cot(theta) and csc(theta). Those names are
unnecessary to use the workshop. The outer perimeter / diameter is n/A; a
similar inscribed right triangle makes the inner perimeter / diameter n/H.

All lengths are positive. Addition and square root preserve order; reciprocals
reverse it. The outer path therefore retains lower estimates of A and H, and
the inner path upper estimates. Both start at the exact H=2 for a hexagon, with
different estimates of sqrt(3).

The model accepts the geometric perimeter inequalities between the inner
polygon, circle and outer polygon. It does not establish a general theory of
arc length. It supplies the algebraic argument behind the rounding audit.

## Numbers retained from the edition

The table gives Y before division by the listed scale. For the first row of
each path, Y estimates sqrt(3) times that scale. Later rows use Y as the new
hypotenuse estimate. These are transcriptions of numerical values, not a claim
that every printed comparison sign is mathematically exact.

| Path  | Sides | Y           | Scale | Greek page |
| ----- | ----: | ----------- | ----: | ---------: |
| Outer |     6 | 265         |   153 |        264 |
| Outer |    12 | 591 + 1/8   |   153 |        264 |
| Outer |    24 | 1172 + 1/8  |   153 |        264 |
| Outer |    48 | 2339 + 1/4  |   153 |        266 |
| Inner |     6 | 1351        |   780 |        266 |
| Inner |    12 | 3013 + 3/4  |   780 |        268 |
| Inner |    24 | 1838 + 9/11 |   240 |        268 |
| Inner |    48 | 1009 + 1/6  |    66 |        270 |
| Inner |    96 | 2017 + 1/4  |    66 |        270 |

The inner path rescales equivalent ratios. In particular
`(5924 + 3/4)/780 = 1823/240` and
`(1823 + 1838 + 9/11)/240 = 1007/66`. The implementation uses reduced
integer fractions; it does not need to introduce a rounding at those changes
of scale. No outer H at 96 sides is invented: n/A is already available.

The two original final bounds are:

```
223/71 < 25344/8069 < C/d < 29376/9347 < 22/7
```

The two weaker-endpoint cross-product margins are 29 and 2. These are strict
bounds, not exact values of pi or exact polygon perimeters.

## A check can fail later than its input

In an outer row, the endpoint n/A is available before the new H is used. If
Y=591.15 replaces 591+1/8 at twelve sides, that row's H fails its square check,
but its current n/A still has the old valid A. The twenty-four-sided A is the
first perimeter divisor to depend on the unsafe H.

```
12 sides: A justified ---> n/A justified
              |
              +--> new H unsafe
                         |
24 sides:          A + H unproved ---> n/A unproved
```

Similarly the exact inscribed hexagon's lower bound 3 survives an unsafe inner
A seed: it uses the independently known H=2. The ledger distinguishes local
square safety, the accumulated length chain, and current endpoint safety.

A locally safe replacement can also invalidate a later unchanged value. All
rows are recomputed, and an invalid chain cannot be repaired by a later local
success. An unproved endpoint might still happen to be a true bound. The page
does not report it as false merely because this proof failed.

## Source reading

The witness is J. L. Heiberg, _Archimedis opera omnia cum commentariis Eutocii_,
vol. I (Leipzig: Teubner, **1880**), pp.262–271. It is the first edition,
not the 1910 edition with a different pagination. The original PDF's title
reads MDCCCLXXX. [Complete digitized volume](https://www.wilbourhall.org/pdfs/Archimedes_VOL_I.pdf).
Its original byte identity, page mapping and reduction command are retained in
[the manifest](../public/sources/circle/manifest.json).

Ten complete reductions preserve the statements, both calculations, diagrams,
apparatus and Heiberg's notes. The original PDF page is printed page + 19.
Nothing is cropped, painted over or re-typeset inside those images.

Eight selected reading units have Greek, Heiberg's Latin and new English,
with sixteen contextual word notes. The Latin is nineteenth-century translation.
Readings normalize line breaks, line-ending hyphens and geometric letter shapes;
reference markers are omitted, and two Latin numerical fractions are written
on one line. One selected Greek numeral pair retains letters, with its values
explained. The final unit deliberately stops before the continuing excess.

Two discrepancies remain explicit:
- The Latin statement on p.263 prints **sphaerae**, while the Greek on p.262
  has **κύκλου**. The English follows the Greek circle; the Latin is retained.
- Some initial approximation steps on pp.264–265 print equalities. The square
  differences prove those are not exact: `3*153^2 - 265^2 = 2`. The workshop
  separately supplies sufficient directed inequalities and checks every one.

Adjacent proposition 2's 11:14 area statement is visible on the complete pages;
it must not be substituted for an exact identity in proposition 3. The app
does not claim an autograph, recover a new manuscript reading, or explain how
Archimedes discovered his starting square-root estimates.

## Interaction, retained files and limits

One altered approximation is retained at a time. Form drafts are separate from
the applied record. A rejected edit or file leaves the record unchanged. Shared
addresses and versioned JSON preserve stage, branch, alteration, reading and page;
history returns to them. Input values are exact positive fractions or finite
decimals, with bounded size and denominator.

CSV retains all exact values, signed square differences, the three distinct
safety states and each endpoint's actual role. The SVG is an equal-scale
drawing with font and notices. It preserves settings in metadata, and makes
no physical calibration claim. The illustrated HTML contains both trial paths,
the unchanged source-number comparison, proof, readings, all ten pages, font,
full licenses and native settings/CSV links. It runs no scripts and requests
no remote subresources. PDF is a print output of that real saved HTML; physical
printing and tagged-PDF accessibility are unverified.

Source display and export use the same verified byte identities. A loaded image
replaces the prior image only after its request is still current. A stale request
cannot acquire the latest page's caption. The production worker requires the
complete matching edition; the new page and sources are part of that inventory.

Only polygon coordinates and decimal labels use floating point. Exact bound
decisions use `BigInt` fractions, without `Math.PI`, trigonometry or square roots.
The number line is an explicitly magnified interval; it has a separate changing
scale from the equal-scale polygons. At ninety-six sides, visual coincidence is
not offered as evidence of exact equality.
