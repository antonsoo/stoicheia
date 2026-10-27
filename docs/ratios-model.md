# Euclid V: agreement and a counterexample

The ratio workshop connects a picture that looks proportional with Euclid’s
condition for proportional magnitudes. The experiment, examples, English and
proof explanations are modern teaching work. The Greek and Latin are retained
edition readings, accompanied by their complete printed pages.

## Source and transcription

J. L. Heiberg, editor and Latin translator, _Euclidis opera omnia, Elementa_,
volume II, _Libros V–IX continens_, Leipzig: B. G. Teubner, 1884. The University
of Toronto, Gerstein Science Information Centre copy is digitized by Internet
Archive. The title identifies the volume, translator and year. The catalogue
metadata says 1883; this volume’s title prints MDCCCLXXXIV (1884), which is
the date used here.
- [Original volume](https://archive.org/details/euclidisoperaomn02eucluoft).
- [Original PDF](https://archive.org/download/euclidisoperaomn02eucluoft/euclidisoperaomn02eucluoft.pdf).
- [Pinned download, page mapping and image hashes](../public/sources/ratios/manifest.json).

Printed pp.2–3 contain definitions 1–6; pp.4–5 continue with definition 7 and
later definitions. The lesson transcribes definitions 3–7 in full and revisits
two clauses of definition 5. Whole pages retain the other definitions, apparatus,
editorial notes, margins and marks. The title is PDF p.7; printed pp.2–5 are
PDF pp.28–31. Images are complete reductions without cropping or retouching.

Line wrapping and end-of-line hyphenation are removed; theta glyphs are
normalized. Latin u/v spelling is retained. Superscript note markers and apparatus
are omitted from selections and remain in the images. New English and language
notes have not had independent philological peer review.

The Greek phrase _kath’ hopoionoun pollaplasiasmon_ gives the indefinite scope
of the multiplication. Heiberg’s Latin sentence has no separate corresponding
phrase. Reading 4 labels its Latin as the surrounding multiplier clause; it does
not invent a matching quotation. His p.3 footnote gives a symbolic explanation.

His p.5 footnote explains that the multiples need not all use the same number:
the first and third share one multiplier, and the second and fourth share another.
The printed algebra belongs to the nineteenth-century editor, not Euclid.

## Two independent choices

```text
first ratio        second ratio
 A : B              C : D
 |   |              |   |
 m   n              m   n
 |   |              |   |
mA ? nB            mC ? nD

Equality requires the SAME sign for EVERY positive integer pair m,n.
```

A is a square diagonal and B its side: A = sqrt(2), B = 1 in side-length units.
The rational second pair has C = p, D = q, with 1 <= p/q <= 2. The threefold
pair has C = 3sqrt(2), D = 3. These are teaching examples, not examples printed
in these definitions. Ratios are between lengths; a shared length measure for
all four magnitudes is not required.

The three relation signs stay distinct. `<` versus `=` already contradicts
definition 5. Definition 7 asks for the more specific pattern `>` versus `<=`.
A found disagreement need not itself have that form. The interface therefore
offers both the first disagreement and, when available, the first V.7 excess
witness. “First” means increasing m, then increasing n.

## Exact decisions and finite search

The pure core reuses the Book X representation `(a + b sqrt(2))/d`, with three
`BigInt` integers. No tolerance, floating-point quotient or drawing coordinate
decides a sign, equality or search interval. For the first pair, the relation is
the sign of `2m^2 - n^2`, because squaring positive lengths preserves order.
For a rational second pair, it is the sign of `mp - nq`.

Search is bounded to `1 <= m,n <= N <= 1000`. At fixed m, disagreement occurs
at exactly the integers n between `mA/B` and `mC/D`, including an endpoint
when only one threshold is an integer. Exact floor/ceiling calculations retain
one inclusive interval per nonempty row. Equal ratios produce no disagreement,
including at integer thresholds. The implementation takes O(N log N) comparisons
and avoids a million DOM nodes or a million-row CSV.

The independent Python oracle uses direct integer products and squares to
enumerate every cell. It does not import the quadratic-field implementation.
Cases include equality endpoints, unreduced fractions, endpoint ratios 1 and 2,
close approximants and the threefold pair.

The starting example has 69^2 = 4,761 agreements. Through 100, the first
disagreement is `(m,n)=(70,99)`:

```text
70sqrt(2) < 99       since 2*70^2 = 9800 < 9801 = 99^2
70*99    = 99*70     both products are 6930
```

That counterexample refutes equality but does not have V.7’s strict-excess form.
For 99:70, the first excess witness within the 600-square is `(239,338)` and
makes the second ratio greater. For 140:99, the first disagreement `(99,140)`
directly makes the first ratio greater under V.7.

## What the drawings establish

Each pair has its own drawing scale; comparisons are within each pair. At more
than 32 copies, a continuous band replaces individual copy ticks. Exact text
remains decisive when an endpoint gap is smaller than a pixel.

The microscope plots `(mA-nB)/nB` and `(mC-nD)/nD` with one automatic scale
factor. Labels give exact offsets in each pair’s original length units. A power
of two enlarges or reduces offsets to fit the plate without changing signs. A
dot locates an endpoint; its diameter is not a length measurement.

The map summarizes the bounded set. Rust denotes disagreement, blue agreement.
Subpixel cells have a minimum visible stroke; rings locate the first and selected
comparisons. Stroke and ring area do not encode extra cells. The exact count is
authoritative. The map is a calculation, not a history of learner actions.

## Reasons beyond the finite square

For the threefold pair, `mC-nD = 3(mA-nB)` for every positive integer m,n.
Multiplication by positive 3 preserves all three signs. This general argument
establishes the condition beyond the finite search.

For rational p/q, the supplied parity proof rules out equality with sqrt(2): in
lowest terms, `p^2=2q^2` would force both p and q even. Comparing `p^2` and
`2q^2` identifies which modern ratio is larger; it remains separate from a found
equimultiple witness. These explanations are not attributed to the definitions.

## Records, source integrity and offline use

JSON stores validated settings with format/version fields. URL and file import
reject unknown or repeated keys, string/boolean numbers, invalid fractions and
out-of-range values. Invalid import preserves the active experiment; valid
import recomputes the arithmetic.

CSV retains the four exact original magnitudes, experiment kind and search bound
on every row. It separates the selected comparison from inclusive disagreement
intervals in the search. The illustrated HTML embeds the native JSON and CSV, current plate,
search summary, applicable general explanation, seven readings, every word note,
five source images, font and licenses. It has no scripts or remote subresources.
It can be reopened from disk and printed.

Viewing and export share the edition-identified asset loader. A substituted
HTTP 200 response fails the byte count or SHA-256 check. Separate image objects
decode each candidate before changing the shared viewer; a revision guard keeps
late replies from replacing a newer selection. Saving captures the settings at
the start of the operation.

Offline readiness requires the current matching controller and complete build
inventory, including this room and its sources. Build, local browser review,
publication and CI remain separate claims. See [the review](ratios-review.md).
