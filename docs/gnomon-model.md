# Equal leftovers, unequal shapes

The fourth room connects two complete proofs: I.43, equal complements in a
parallelogram, and II.5, a rectangle plus the square between two cuts. It supplies
the source argument behind the relation used by the existing II.14 room.

## Source and transcription

J. L. Heiberg, _Euclidis opera omnia_, volume I, Leipzig: Teubner, 1883, from
the [University of Toronto scan](https://archive.org/details/euclidisoperaomn01eucluoft).
The PDF SHA-256 is
`da285c581c2dda86e2b25e20db3ce604bf6fb8765228fcd71cfc89d47a9d1c17`.

| Reading        | Printed pages | PDF pages, one-based | Archive leaves |
| -------------- | ------------- | -------------------- | -------------- |
| I.43, complete | 100-103       | 114-117              | 114-117        |
| II.5, complete | 128-133       | 142-147              | 142-147        |

Archive `scandata.zip/scandata.xml` confirms every mapping. The eight new images
use `pdftoppm -scale-to 1550 -jpeg -jpegopt quality=82`; the existing pages 128-129
retain their 1800-pixel renderings. The source images were inspected, and
`public/sources/manifest.json` records their hashes, sizes, languages and leaves.

Seven units contain the full I.43; eleven contain the full II.5, including both
repeated conclusions. Greek point names remain Greek in the Latin. Printed ϑ
becomes θ. Line breaks, critical apparatus and inline Latin references are
omitted in the reading, while all full-page images preserve them. Latin is
Heiberg's nineteenth-century translation. English, reading divisions, grammar,
colors and coordinates are new. The earlier I.34, I.46 and parallel constructions
are prerequisites; their complete proofs are not reproduced in this room.

Page 131 uses Μ as a boundary point and in the gnomon's name ΜΝΞ. Heiberg's
footnote acknowledges the duplication in the diagram received from the Basel
edition. It records Gregory's alternative ΝΞΟ but declines to alter the reading
against the manuscripts. The app keeps the boundary point Μ and names the
L-shaped region ΜΝΞ in prose. It does not merge the two uses into a fictitious
unique point or silently substitute Gregory's alternative.

## I.43 and a deliberate counterexample

An affine unit-square parameterization uses
`P(x,y) = (10*x + s*(1-y), 6*y)`, with shift s between -4 and 4. The outer
vertices follow the printed diagram:

| Source point | Parameter coordinates |
| ------------ | --------------------- |
| Α            | (0,0)                 |
| Β            | (0,1)                 |
| Γ            | (1,1)                 |
| Δ            | (1,0)                 |
| Κ            | (u,v)                 |
| Ε            | (0,v)                 |
| Θ            | (u,0)                 |
| Ζ            | (1,v)                 |
| Η            | (u,1)                 |

The point is on ΑΓ exactly when the integer percentage inputs u and v agree.
The diagonal lock sets v to u; an unlocked point can still lie on the diagonal.
Both inputs range from 15% to 85%, so all four small regions remain positive.
The map's determinant is 60 independently of s. Consequently the complements
have areas `60*u*(1-v)` and `60*(1-u)*v`, with difference `60*(u-v)`.
The implementation instead obtains the reported region areas from their polygon
coordinates by the shoelace formula.

The proof divides the whole parallelogram into equal halves, then does the same
for its two diagonal parallelograms. On the diagonal, removing ΑΕΚ + ΚΗΓ from
one large half and ΑΘΚ + ΚΖΓ from the other leaves equal complements. With
u = v = 0.35, each complement is 13.65 square units.

The off-diagonal preset uses u = 0.35 and v = 0.65. The complements then have
areas 7.35 and 25.35. Crucially, each small parallelogram **still has equal
diagonal halves**. What fails is their alignment with the diagonal of the whole:
the same subtraction no longer partitions those two large triangles. The app
keeps this distinction explicit and disables the valid-proof animation until
the point is restored. The full source text remains readable.

## II.5 and the original region names

The input lengths are exact integer tenths from 1.0 to 16.0. Their longer value
is a, their shorter value b; r = (a+b)/2 and d = (a-b)/2. In coordinates with
positive y down, Α = (0,0), Γ = (r,0), Δ = (a,0), Β = (a+b,0), Ε = (r,r),
Ζ = (a+b,r). The diagonal ΒΕ meets x = a at Θ = (a,b). Parallels then locate
Κ = (0,b), Λ = (r,b), Μ = (a+b,b), Η = (a,r).

| Source region | Area | Role                             |
| ------------- | ---: | -------------------------------- |
| ΓΘ            |   db | First complement                 |
| ΘΖ            |   db | Equal complement                 |
| ΔΜ            |   b² | First common addition            |
| ΓΜ            |   rb | First larger total               |
| ΔΖ            |   rb | Second larger total              |
| ΑΛ            |   rb | Replacement using ΑΓ = ΓΒ        |
| ΑΘ            |   ab | Rectangle on the unequal lengths |
| ΜΝΞ           |   ab | Gnomon ΓΘ + ΔΖ                   |
| ΛΗ            |   d² | Missing square                   |
| ΓΕΖΒ          |   r² | Completed whole                  |

The source's chain is ΓΘ = ΘΖ; add ΔΜ, replace ΓΜ with ΑΛ, add ΓΘ, identify
ΑΘ as the rectangle on ΑΔ and ΔΒ, then add ΛΗ. No rigid-piece dissection is
claimed in this diagram: the colored accounts are compared in place and share
the region ΓΘ. The dashed outline identifies the whole rectangle ΑΘ.

The source assumes unequal cuts. Equal input lengths make Γ and Δ coincide;
the app labels the resulting identity as a **limit**, not the construction in
II.5. This differs from II.14, which explicitly finishes its square-input branch
before drawing a semicircle. Nearly equal inputs remain unequal; the smallest
missing area, 0.0025 square units, remains visible in the numerical account.
When labels become too close, the plate omits those names and points to the
complete coordinate table. Both axes always have the same scale.

## Independent calculation and portable files

`npm run verify:gnomon` exports 25,205 complement configurations (every pair of
percentage cuts at five shears) and all 22,801 rectangle inputs. Python uses
exact rational formulas, a separate polygon-area calculation and a diagonal-line
intersection. It verifies the equal small pairs even off the large diagonal,
and every named II.5 region. Maximum absolute discrepancy was
`8.526512829121202e-14` square drawing units. This numerical agreement illustrates
the construction; the source's subtraction and additions provide its proof.

The saved HTML captures both experiments before asynchronous fetching. Every
source and font is checked against the built edition before embedding. A failure
produces no download and can be retried. The file contains all eighteen reading
units, ten full scans, font, licenses, both diagrams, area accounts, point table
and an embedded CSV download. It has no scripts or remote subresources. SVGs
for I.43 and II.5 and the measurement CSV can also be downloaded separately.

Shared settings include the free point, shear, both proof stages, lengths and
reading unit. Duplicate recognized keys reset the experiment; invalid individual
settings use disclosed defaults. Section navigation preserves the experiment.
