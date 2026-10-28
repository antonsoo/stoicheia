# Application of areas: source and model

Euclid VI.28 asks for an area applied to a line, falling short by a
parallelogram of a prescribed shape. The target area has a ceiling. VI.29
changes falling short to exceeding; that ceiling disappears.

The workshop makes those conditions operable. It uses modern coordinates and
exact rational arithmetic, while retaining selections and whole pages from the
printed Greek and Latin. It is a companion investigation, rather than the full
sequence of compass-and-straightedge constructions used by the propositions.

## Source

Euclid, _Euclidis opera omnia_, vol. II, _Elementa V–IX_, edited and translated
into Latin by J. L. Heiberg. Leipzig: B. G. Teubner, 1884. The title prints
MDCCCLXXXIV. The Internet Archive catalogue’s 1883 date is not followed for this
volume.

[Original University of Toronto / Gerstein volume](https://archive.org/download/euclidisoperaomn02eucluoft/euclidisoperaomn02eucluoft.pdf).
The 25,785,657-byte PDF has SHA-256
`cd24f03c6e4e6d5f30a908d144c8f0f7003e99813334edb3a4107d748cb41043`.

| Retained material                       | Printed pages | One-based PDF pages |
| --------------------------------------- | ------------- | ------------------- |
| Volume II title                         | unnumbered    | 7                   |
| VI.27, with adjacent VI.26 text         | 158–161       | 184–187             |
| VI.28, then opening VI.29               | 162–167       | 188–193             |
| Remainder of VI.29, then adjacent VI.30 | 168–171       | 194–197             |

The fifteen whole-page images are rendered at 2000 pixels on the long edge
with Poppler, JPEG quality 88. They are uncropped and unretouched. The
[manifest](../public/sources/areas/manifest.json) records each image’s size,
dimensions, digest and original page. `scripts/areas-sources.py` reproduces
all of them against the identified PDF.

Nine selected passages have new English translations and eighteen contextual
language notes. They include the VI.28 problem and restriction, VI.27 conclusion,
VI.28 equality/difference/remainder steps, and VI.29 problem/sum/remainder steps.
They are not the three complete transcribed proofs. The scans supply those
proofs and their apparatus.

Reading selections join line wrapping and end-of-line hyphens, normalize printed
theta glyphs and omit apparatus and superscript references. Editorial square
brackets remain. Latin point letters use Greek Unicode; u/v spellings remain.
Heiberg’s equations sometimes compress Greek prose: readings identify that
difference instead of inventing corresponding Latin words. English and language
guidance have not had independent philological review.

The p.163 editorial notes explicitly link VI.28’s restriction to VI.27. The
bracketed expansions in the Greek are retained as editorial matter. The p.161
note discusses an additional manuscript case removed to the appendix; reflecting
the trial in this app is a modern operation, not an attribution of a second
printed construction to this passage.

## Coordinate family

The three givens are line length `a`, target area `c`, and a similarity shape.
The chosen shape has base 1, perpendicular height `k`, and horizontal top shift
`q*k`. Its sides are the vectors `(1,0)` and `(q*k,k)`.

For a trial shortfall or extension `t`, the hatched parallelogram has vectors
`(t,0)` and `(q*k*t,k*t)`. It is a homothetic copy of the given shape. Changing
the shear changes the given shape; at any fixed shear all trial hatched figures
are similar and similarly placed. Shear is not described as preserving
Euclidean similarity between different shear settings.

| Mode          | Applied base | Height | Applied area | Hatched region              |
| ------------- | ------------ | ------ | ------------ | --------------------------- |
| Falling short | `a-t`        | `k*t`  | `k*t*(a-t)`  | excluded shortfall, `k*t*t` |
| Exceeding     | `a+t`        | `k*t`  | `k*t*(a+t)`  | included excess, `k*t*t`    |

Area is base times **perpendicular** height, not slant-side length. The four
world-coordinate vertices are `(0,0)`, `(b,0)`, `(b+q*h,h)`, `(q*h,h)`.
The graph is a modern area-versus-trial graph. Geometric plates use the same
horizontal and vertical units; the two falling-short panels use one scale.

## Possibility, multiplicity and exactness

For falling short:

```
area(t) = k*t*(a-t)
maximum = k*a*a/4
maximum - area(t) = k*(t-a/2)^2 >= 0
area(a-t) = area(t)
```

A positive target below the maximum has two fits; at the maximum these coincide;
above it there is no fit. For `a=12`, `k=1`, target 27 fits at `t=3` and `t=9`.
The shortfalls have different areas, 9 and 81, but remain squares. Target 36
fits at 6. Target 45 is impossible in that family.

For exceeding:

```
area(t) = k*t*(a+t)
area(t) + k*a*a/4 = k*(t+a/2)^2
```

For `t>=0` this area increases strictly and without bound. Every positive target
has one positive fit. Target 45 fits at 3 for the same line and shape. Switching
mode changes the condition on the construction; it does not rescue VI.28 while
keeping its premises.

The implementation reduces fractions with `BigInt` and uses exact products and
cross multiplication. Feasibility, residual, degeneracy, maximum and rational
root classification never use rounded pixels or a tolerance. A rational root
exists exactly when the reduced discriminant’s numerator and denominator are
both perfect squares. An integer square-root algorithm decides that condition.

For an irrational root, a floating estimate initializes two fractions on the
millionth-unit grid. Exact polynomial comparisons then move those endpoints
until they certify the branch’s strict enclosure. The decreasing larger-root
branch uses the reversed area comparison. Cancellation-resistant formulas find
the initial estimate for small roots. Choosing a bound makes that rational
endpoint the trial and retains its nonzero residual; it does not assert exactness.

Zero-area endpoints are visible degeneracies and do not count as fits for a
positive target. Interface limits are integer line 4–24, target `(0,4096]`,
denominator at most 1,000,000, shortfall `[0,a]`, extension `[0,128]`, three
height factors, and integer shear percentages from -60 to 60.

## Retained work

Version 1 JSON retains all givens, exact trial, reading and source choice.
The CSV records the exact area account, feasibility and each fit’s rational
value or certified bounds. SVG embeds the bundled font and project license.
The independent HTML contains settings, native downloads, diagrams, all readings,
fifteen actual scans, font, source manifest and full MIT/OFL licenses. Its CSS
removes the app’s root-relative font request. It opens with JavaScript disabled
and needs no remote assets. It is also printable; physical printing is untested.

The build verifies source identities and generates an integrity-checked complete
fourteen-room offline edition. The footer’s existing readiness protocol requires
the matching current controller and complete cached inventory. Source display
uses verified bytes with revision protection; late responses cannot replace a
newer page. Failed verification remains retryable. Exports capture settings at
the click. A delayed import cannot overwrite later learner work.

The independent oracle computes polygon areas by shoelace with Python fractions
and compares roots with 70-digit Decimal arithmetic. Its 2,268 cases cover both
modes, seven line lengths, three height factors, three shears, small/large/limiting
targets and endpoints or large extensions. See the direct review for browser,
artifact, clean-build and publication boundaries.
