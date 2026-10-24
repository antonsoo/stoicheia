# Twice the stone: source and geometry

An English-speaking learner can already construct an equal-area square in
Stoicheia's II.14 room. This room asks what changes when the problem is a
cube: one intermediate mean is insufficient. The learner operates the extra
mechanical alignment, reads its stopping condition in Greek and Latin, and
follows the proof that two intermediate lengths have been established.

The visual direction retains the existing blue geometric reading desk,
self-hosted Noto Serif and large construction plate. The source is a printed
edition, without invented ancient textures. Square panels overlap visibly;
an orange straightedge always joins the given endpoints, while both contact
points remain independent. The enlarged contact chart uses the same scale
for both offsets. On phones, the entire machine and extended proof rotate
clockwise with upright labels and equal coordinate scales.

## Source identity and reading scope

Eutocius, commentary on Archimedes' *On the Sphere and Cylinder* II, section
headed **Ὡς Ἐρατοσθένης**, in J. L. Heiberg, *Archimedis opera omnia cum
commentariis Eutocii*, III (Leipzig: Teubner, **1881**), pp.102–113.

[Original complete PDF](https://www.wilbourhall.org/pdfs/Archimedes_VOL_III.pdf).
Its title page, source PDF page 5, reads **MDCCCLXXXI**. It is not the 1915
second edition, whose pagination is different. The
[source manifest](../public/sources/mesolabe/manifest.json) records the
original PDF identity, each page identity, and exact Poppler rendering recipe.

| Printed pages | Contents used |
| --- | --- |
| 102–103 | The heading and opening of the transmitted letter; context in scans |
| 104–105 | The mistake of doubling edges and the distinction between plane and solid |
| 106–107 | Context, applications and the two unequal given lines |
| 108–109 | Moving the plates, the full proportionality proof and first figure |
| 110–111 | Manufacture, fit and precision; Heiberg's critical footnotes |
| 112–113 | Second figure, shorter proof and extension to more means |

The eight excerpts are selected parts, not a complete letter translation.
The intermediate comparisons on p.108 are explained in the proof rather
than all transcribed. Page images preserve the complete text, surrounding
material and apparatus. Greek labels use consistent Greek Unicode;
ϑ becomes θ; wrapping and end-of-line hyphenation are removed. Inline
Latin reference markers are omitted. Heiberg's Latin is a nineteenth-century
translation and sometimes replaces Greek ratio prose with equations. New
English, reading divisions and contextual notes are modern teaching work.

The letter is **transmitted under Eratosthenes' name**. This exhibit does not
resolve its authorship or independently establish the dedication, Minos story,
or Delian origin story. It makes no identification with a surviving ancient
instrument. The model concerns the geometry of the described construction.
The thin panels, grooves, and concern about fit come from pp.110–111; the
square choice, 60 mm comparison height, and 0.5 mm perturbation are ours.

## Coordinate construction

Each panel is a unit square; y increases upward from the lower rail. The
middle square is fixed at x=1..2. Leftward and rightward overlap must be
kept distinct: p is the left panel's rightward slide; q is the right panel's
leftward slide. Both range from 0 to 0.9. R, the requested volume factor,
ranges from 2 to 8. The end height is d=1/R.

| Point | x | y | Geometric role |
| --- | ---: | ---: | --- |
| Α | p | 1 | Left panel's upper-left corner |
| Ε | p | 0 | Foot of given ΑΕ |
| Ζ | 1+p | 0 | Left panel's lower-right corner |
| Β | 1+p | 1−p | Left panel's right edge meets middle diagonal |
| Η | 2 | 0 | Middle panel's lower-right corner |
| Γ | 2 | 1−q | Middle panel's right edge meets right diagonal |
| Θ | 3−q | 0 | Right panel's lower-right corner |
| Δ | 3−q | 1/R | Marked given endpoint on right edge |

The exposed vertical heights are 1, 1−p, 1−q, 1/R. Multiplying by R gives
lengths a=R, b=R(1−p), c=R(1−q), d=1, in units of the original cube edge.
The proposed new cube edge is **c**, the last mean; b would give a different
volume. The free trial reads actual diagonal/edge intersections. It never
substitutes ideal cube-root values for those contacts.

The straightedge is the line through Α and Δ. Its height at x is
`1 − (1 − 1/R)(x − p)/(3 − p − q)`. Subtracting that from each actual
contact gives the signed offset along its vertical panel edge. Multiplying
by 60 expresses the offset in a chosen 60 mm square. This is not the
perpendicular distance to the straightedge. The phone turns this same
geometry clockwise and says so.

## Why one contact is insufficient

For any right slide q, putting Β on the straightedge solves
`p(3−p−q) = 1−1/R`. The implementation uses the numerically stable smaller
quadratic root. Γ remains an independent condition. The right slider stays
available; the calculated left slider is disabled.

In mathematical alignment, put `t = cbrt(1/R)`. Then `p=1−t`, `q=1−t²`,
and the normalized heights are `1,t,t²,t³`. The calculated mode explicitly
disables the manual controls. Dragging returns to the trial using the
current full-precision positions. The 0.5 mm displacement increases q by
`0.5/60`, retaining p and recalculating the actual contacts and straightedge.

A trial can also be exactly aligned in rational coordinates: R=8, p=0.5,
q=0.75 gives lengths 8,4,2,1. Collinearity in floating-point arithmetic means
both normalized residuals have magnitude below `1e-10`. Display rounding
does not determine readiness or enable the proof.

## The proof's two families of parallels

Extend ΑΔ to the lower rail at Κ. Vertical parallels give
`ΑΚ/ΒΚ = ΕΚ/ΖΚ = ΑΕ/ΒΖ`. Diagonal parallels ΑΖ and ΒΗ also give
`ΑΚ/ΒΚ = ΖΚ/ΗΚ`. Therefore `ΕΚ/ΖΚ = ΖΚ/ΗΚ`.

Repeat with Β and Γ: the verticals give `ΒΚ/ΓΚ = ΖΚ/ΗΚ`, while diagonals
ΒΗ and ΓΘ give `ΒΚ/ΓΚ = ΗΚ/ΘΚ`. Thus
`ΕΚ/ΖΚ = ΖΚ/ΗΚ = ΗΚ/ΘΚ`. Corresponding vertical ratios therefore give
`a/b = b/c = c/d`.

If their common ratio is r, then `a/d = (a/b)(b/c)(c/d) = r³`. Since the
new edge is c/d times the original, its volume is a/d times the original.
The app's algebra is a modern explanation of the source's proportions.
A numerical agreement does not replace the geometric proof.

The instrument adds a mechanical alignment operation. It is not a
straightedge-and-compass construction, and this exhibit is not a proof of
that tool set's impossibility result. The source extends the scheme to
one more plate than means. The operating model implements only three
plates; the fourth-root extension is explained in the eighth reading.

## Files, offline use and physical boundaries

Build-time SHA-256 checks identify all twelve source JPEGs before accepting
them into the portable-study asset set. Runtime saving verifies those same
bytes and the font. The exported HTML contains all excerpts, a preserved
trial, a separately labelled ideal comparison, complete pages, notices,
measurements, and the paper SVG. It runs no scripts and makes no external
subresource requests. Native CSV and SVG downloads use embedded data URLs.

The service worker saves the complete five-room edition. Its existing
edition and inventory protocol requires every saved file's build-time
integrity before activation. Adding this room does not weaken that protocol.

The paper sheet has millimetre dimensions and a 25 mm calibration bar.
It is an exploration sheet: two loose squares and a fixed middle panel
between guides. It does not supply a detailed three-groove manufacturing
plan. Printing, physical cutting, assembly, friction, play and achievable
precision remain unverified. No structural or ancient metrology claim is made.
