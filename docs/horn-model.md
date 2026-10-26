# Euclid III.16: the line that will not fit

The experiment asks whether a ray from a circle's point of contact can remain
between its tangent and circumference. A positive slope enters the circle;
zero slope coincides with the tangent; a negative slope points to the other
side of the proposed gap. Remaining outside the circle alone is insufficient.

## Source and transcription

The source is **J. L. Heiberg's 1883 volume I**, _Euclidis opera omnia_,
_Elementa, libros I–IV continens_, printed pp.208–213. The Gerstein/Toronto
scan is distributed by the Internet Archive:

[Complete PDF](https://archive.org/download/euclidisoperaomn01eucluoft/euclidisoperaomn01eucluoft.pdf).

The retained original is 20,890,632 bytes, SHA-256
`da285c581c2dda86e2b25e20db3ce604bf6fb8765228fcd71cfc89d47a9d1c17`.
PDF page = printed page + 14. The title on PDF p.7 was inspected: **MDCCCLXXXIII**,
volume I, books I–IV. Six complete reductions retain the diagram, surrounding
text, brackets and apparatus, without cropping or retouching. The
[manifest](../public/sources/horn/manifest.json) records each file's identity.

Eight readings are selected clauses, not a complete proposition transcription.
They pair the Greek with Heiberg's Latin and new English, except reading 8:
there the Latin is explicitly **Heiberg's editorial note**, not a translation
of the bracketed Greek addition. His attribution of that addition to Theon
is reported as an editorial judgment. We do not silently supply missing Latin.
The complete note remains visible on p.213.

Printed theta is normalized to θ, geometric letters to Unicode Greek, and
Latin angle signs to ∠. Line wraps, line-end word hyphens and inline Latin
reference marks are omitted. The notes identify I.5, I.17 and I.19 where they
matter. The source calls the curved remainder the remaining angle; _horn angle_
is a descriptive name, not a quoted name from this statement.

The source's angle of the semicircle has a curved side. It is different from
the inscribed angle in a semicircle. The displayed degree value belongs solely
to the proposed ray against the tangent; no positive degree value is assigned
to the curved remainder.

## Exact coordinate witness

Normalize the radius to 1. A = (0,0), centre Δ = (0,1), tangent AE is y = 0.
Write the forward ray as (qt, pt), t ≥ 0, with q positive. The two user inputs
are whole numbers. The interface permits 1 ≤ q ≤ 1,000,000 and −q ≤ p ≤ q:
angles from −45 to 45 degrees. These are interface limits, not a smallest
positive angle or a restriction on the source theorem.

Let d = p² + q². The orthogonal foot and its squared distance are:

| Quantity                | Exact value    |
| ----------------------- | -------------- |
| H                       | (pq/d, p²/d)   |
| Ray parameter at H      | p/d            |
| ΔH²                     | q²/d           |
| 1 − ΔH²                 | p²/d           |
| Added second crossing Κ | (2pq/d, 2p²/d) |
| Ray parameter at Κ      | 2p/d           |

For p > 0, H lies forward on the ray and ΔH² < 1. Thus a point on the ray
lies inside the circle. For p = 1, q = 1,000,000, the squared deficit remains
exactly **1/1000000000001**. It is not rounded to zero.

Substitution into the circle equation gives

```text
(qt)^2 + (pt - 1)^2 - 1 = t((p^2 + q^2)t - 2p).
```

Besides t = 0 at A, the second root is 2p/d. For p > 0 every point between
those roots is inside. For p < 0 the other root and H lie on the backward
extension; the forward ray points below the tangent. For p = 0 the roots
coincide at A. The experiment does not rename either boundary case a successful
positive angle in the gap.

BigInt fractions, reduced by gcd, retain the certificate. Numeric square roots,
trigonometry, degree values and diagram coordinates do not decide it. The
independent Python checker uses Fraction vector equations, forward parameters,
circle membership and points before/after the second root; it imports no app
code. Its browser mode checks the actual downloaded CSVs too.

## The source's contradiction

The source first establishes that the perpendicular at A stays outside. If it
met the circumference again, equal radii would give a triangle with two right
angles, contrary to I.17.

Next suppose a line could stay between that tangent and the circumference.
Drop ΔH perpendicular to it. The right triangle gives ΔH < ΔA. But under
the assumed outside arrangement the radius ΔΘ on the way from Δ to H would
end before H, giving ΔΘ < ΔH. Equal radii ΔA = ΔΘ contradict these inequalities.

The source diagram depicts the hypothetical arrangement. Our reflected,
realizable diagram places H inside, where the actual lengths require it to be,
and adds Κ for the modern second-root calculation. It does not pretend to
realize the impossible outside configuration.

Finite trials do not prove the universal theorem. The coordinate formulas
explain why any positive slope fails; the source supplies its geometric
argument. The room does not develop arithmetic of curved angles, prove their
addition properties, or construct a system of infinitesimal numbers.

## Magnification without unequal axes

The overview keeps the whole circle. Its tiniest H and Κ merge with A at
screen resolution; the caption says so. A second plate crops around H with
the **same horizontal and vertical scale**. It can show the interior distance
without making a tiny angle look large. A and Κ can lie outside that crop.

At x = Hx the lower circle boundary is evaluated stably as

```text
y = x^2 / (1 + sqrt(1 - x^2)).
```

This avoids subtracting nearly equal numbers in 1 − sqrt(1 − x²). The local
crop width is eight times the vertical gap at H; a bar states its size in
radii. Θ is the actual point on the circle along the extended perpendicular.
For very small slopes, the boundary is sampled in local coordinates instead
of asking the renderer to draw a circle with an enormous screen radius.

The browser review checks the actual SVG's screen transformation for equal
axis scales. Its emitted fine-crop vertices are independently compared with
80-digit Decimal circle geometry. Neither that drawing check nor a raster
screenshot replaces the exact certificate.

## Portable state and evidence

The URL and version 1 JSON retain rise, run, selected witness, reading and
source page. Unknown/repeated URL settings and malformed or unsupported files
are rejected without replacing the applied experiment. Draft form text does
not become a downloaded trial. A visible share field follows subsequent
applied changes; it cannot silently keep an earlier ray or reading.

CSV retains exact quantities and signed forward parameters. SVG includes the
font and full MIT/OFL notices. Its embedded CSS is XML-escaped, including
compiled media-query comparison signs. The script-free HTML embeds all source
pages, font, both witnesses, the source argument, readings and native JSON/CSV
links. Its print layout places Greek and Latin sequentially so copied PDF
text does not interleave their lines. Source hashes wrap on phones.

Source viewing, export and offline installation each check retained identities.
The source viewer rejects a valid JPEG from another page and ignores a late
response after the selection changes. An edition is ready only after its
worker and complete generated cache agree. Physical printing, screen-reader
operation and historical manuscript attribution are outside these checks.
