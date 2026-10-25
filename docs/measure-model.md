# A measure in common: source and mathematical decisions

This seventh room asks the learner to distinguish three things: finding a
common measure, failing to find one yet, and proving that none can exist.
The chosen source is Euclid X.2–3, with the first two definitions of Book X.
It extends the existing course without adding a separate catalogue or service.

## The operation

The starting shorter length is the side of a unit square. The longer length
is either its diagonal, sqrt(2), or a chosen exact fraction n/d between 1 and
2. Fractions use positive integers with d <= 9999 and n <= 19998. These are
modern examples; X.2 does not print these numerical inputs.

For a pair A >= B > 0, the learner fits one B at a time. Once another will
not fit, a completed turn has A = qB + R with 0 <= R < B. The turn exchanges
the roles: old B becomes A and the positive R becomes the new B. If R = 0,
the current B measures A exactly. Working backward shows it measures both
originals. Every other common measure must measure all the remainders,
including this last B, so none can be greater. This is the task in X.3.

Large q can be fitted together. At most sixteen fitted copies receive
individual boundaries in the active ruler; above that, one region records
their exact count. The final original-length comparison draws individual
cuts only through twenty-four units. It never draws thousands of fake cuts
or enlarges a small unit to make its width visible.

The record contains completed earlier turns and the actual partial current
turn. The separate comparison calculates the full division of both examples
through that turn; it is labelled as a calculation, not additional learner
operations. Shared URLs retain the input, current turn, fitted copies, reading
and independently selected printed page. Browser history restores those values.

## Exact signs, zero and drawing

Core lengths are normalized triples of BigInts representing
`(a + b*sqrt(2))/d`, with d positive. Arithmetic keeps those coefficients
exact. Opposing-sign comparisons use `a*a - 2*b*b`; quotient search uses
integer doubling followed by bisection. No epsilon decides whether a
remainder is zero or whether another copy fits.

Decimal conversion rationalizes an opposing-sign numerator:

```text
(a + b*sqrt(2))/d = (a*a - 2*b*b) / (d*(a - b*sqrt(2)))
```

This avoids catastrophic cancellation in late positive remainders. The
twenty-fourth diagonal remainder stays positive in the actual SVG data,
where naive addition would lose its useful digits. Coordinates and decimal
readings remain ordinary floating-point approximations, separate from exact
arithmetic decisions. The CSV includes both the coefficients and approximation.

The active ruler rescales the larger A to fill its available width. B and
the remaining piece use the same local scale. The separate original ruler
keeps every visited measure at its original size. A cross locates a positive
bar narrower than one SVG drawing unit, with an explicit warning that the
cross's width is not the length. Phone layouts move the same action controls
above the drawing; they do not duplicate controls or hide an operation.

## Eight matching counts, different outcomes

The default fraction comparison is 577/408. Its quotient sequence is
`1,2,2,2,2,2,2,2`, identical to the first eight counts for the diagonal.
At the eighth turn the fraction's remainder is exactly zero, while the
diagonal's is `577 - 408*sqrt(2) > 0`.

Both original longer lengths round to 1.4142 at four decimal places. Their
difference, fraction minus diagonal, is approximately 0.000002123901 in
side units. Agreement of rounded starting measurements or many copy counts
does not make their exact lengths equal.

## What establishes the infinite condition

The experiment stops after twenty-four turns. An unfinished finite run is
never reported as a proof that the process cannot end.

For the diagonal, put k = sqrt(2) - 1. Then 0 < k < 1. After the first
turn the pair is (1,k), whose quotient is exactly two because
`1/k = 1 + sqrt(2)` lies between two and three. Its remainder is
`1 - 2k = k*k > 0`. Thus the next pair is `(k,k*k) = k*(1,k)`.
Positive scaling preserves the quotient and positive remainder, so the same
argument applies after every finite number of turns. This recurrence is a
modern specialization; it is not a transcription of X.2's proof or a claim
about who first discovered the diagonal's incommensurability.

X.2's general contradiction assumes a common measure E. It must measure
every subsequent remainder. The shrinking step eventually produces a
positive remainder smaller than E, an impossibility. Our explanation expands
that step: each completed positive remainder is less than half the larger
input, since either B <= A/2 and R < B, or B > A/2 and R = A - B < A/2.
Consequently the sequence passes below any proposed positive E.

The squares of the diagonal and side have areas 2 and 1. They therefore
share an area measure despite the lengths' incommensurability. Definition 2
calls this commensurability _in square_. Definition 3's `rationalis` / Greek
`ῥητή` includes lines commensurable only in square with the chosen reference;
it is not identical to modern rational-number terminology. The reading note
keeps that difference visible.

## Edition and language

The source is Heiberg's 1886 volume III, not the 1883 volume I already used
by the course. The title page identifies both editor and Latin translator.
The supplied twelve whole pages cover printed pp.2–13, corresponding to PDF
pages 15–26 (one-based). They include the definitions, X.1, X.2 and X.3's
continuation, apparatus and annotations. Printed pp.12–13 also begin X.4.

Ten reading units select definition 1, the opening clause of definition 2,
clauses from X.2 and the statement of X.3. They do not claim to transcribe
the complete supplied pages. Greek labels use consistent Greek Unicode;
line wrapping and end-of-line hyphenation are removed. The bracketed
`[ἐκκειμένων]` remains bracketed. Heiberg's Latin u/v spelling is retained.
Apparatus and inline reference markers are left in the scans. English,
reading divisions, grammar notes and model notation are new. Translations
have not received independent philological peer review.

The original PDF's identity and each derived image are in
`public/sources/measure/manifest.json`. `verify:measure-sources` regenerates
the full pages and compares their bytes. The reviewed renderer is Poppler
24.02.0; another renderer version can produce different JPEG bytes.

## Keeping and reviewing a reading

The HTML export embeds the current exact record, both drawing layouts,
the finite comparison, complete recurrence explanation, ten readings,
twelve scans, local font and licenses. It has no scripts or remote
subresources; its CSV is an embedded download. External application and PDF
links still need a connection. The SVG is a separate local-scale ruler.

The viewer and export use the same byte-verified sources. Pending, failed or
substituted images are not presented as verified pages. An export captures
its starting state while the learner continues working. The full production
edition includes the new room and sources in its existing integrity-checked
offline installation. Local source, saved-file behavior and public deployment
remain separate claims; this addition has not been published.
