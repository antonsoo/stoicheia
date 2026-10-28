# Euclid's extra prime: source and arithmetic

The workshop reads **IX.20** as a two-branch argument, supported by **VII
definitions 1–2** and the prime-divisor existence argument of **VII.31**. Its
main operation is a division ledger, not a prime-number generator.

## What the source does

Heiberg's Greek names three given primes Α, Β, Γ, takes their least common
multiple ΔΕ and adds the unit ΔΖ. The resulting ΕΖ is either prime or not.
If it is prime, it supplies an additional prime. If composite, VII.31 supplies
a prime divisor Η. Were Η one of the givens, it would divide both ΔΕ and ΕΖ,
and hence the remaining unit. The source rejects that conclusion.

The bench uses M and N to avoid silently copying the printed diagram's endpoint
order. In the scanned p.389 diagram the long line is ordered Δ–Ε–Ζ; the text
names ΔΖ as the added unit and ΕΖ as the sum. The whole page is retained and the
reading note makes the mismatch visible. This observation does not establish a
manuscript history or attempt a critical emendation of the edition.

| Historical element                        | Modern teaching representation                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| Three named givens without numeric values | One to twelve distinct, exactly checked primes; three purposeful presets        |
| Least number measured by the givens       | Product M; for distinct primes this is their least common multiple              |
| Added unit and sum                        | N = M + 1 in modern decimal notation                                            |
| Measuring a number                        | Exact divisibility, whole quotient and remainder                                |
| Prime / not-prime case distinction        | Proven prime, proven composite, or computationally unresolved at a stated bound |
| VII.31 prime-divisor existence            | General strict-descent explanation plus a separate operable 2310 example        |
| More primes than the given multitude      | Additional prime outside the list, without a next-prime or larger-prime promise |

The unresolved computational state is not a third mathematical branch. The
positive integer N is prime or composite; a bounded search may not determine
which. The proof does not need that search to finish.

For distinct primes their product is the least common multiple. Repeated use
of Euclid's lemma (VII.30) shows that their product divides every common multiple;
the product is itself a common multiple. The contradiction only needs a common
multiple, so computing the least one is not essential to the modern explanation.

## Exact decisions and finite bounds

All products, quotients, remainders and factor reconstructions use `BigInt`.
Given primes are at most 10,000,000,000. The sieve provides every prime through
100,000, sufficient to check every possible prime divisor up to the square root
of any permitted given. The unit 1, composites, duplicate givens, ambiguous
decimal spellings and unsupported record/link settings are refused.

The separate factor search tries sieved primes no larger than the selected
bound: 13, 100, 10,000 or 100,000. It removes complete powers of each found
prime. A remaining cofactor is certified prime only when every possible prime
divisor through its square root has been excluded. Otherwise the cofactor stays
explicitly unclassified. Finding one proper prime factor establishes composite
even if the remaining cofactor is unresolved. A complete factorization is not
needed to supply a prime outside the given list.

| Example            | M     | N                | Consequence                                                      |
| ------------------ | ----- | ---------------- | ---------------------------------------------------------------- |
| 2, 3, 5            | 30    | 31               | The sum itself is prime                                          |
| 2, 3, 5, 7, 11, 13 | 30030 | 30031 = 59 × 509 | The sum is composite; either prime factor completes the argument |
| 3, 5, 7            | 105   | 106 = 2 × 53     | A new prime can be smaller than every given                      |

At the opening bound of 13 the six-prime example is unresolved. Extending the
bound to 100 finds 59, removes it, then certifies the remaining 509 by excluding
possible divisors through its square root. Trial count reports divisions
actually attempted, rather than every integer through the bound. The next
sieved prime can establish that the square-root boundary has been passed
without performing another division.

The last-group diagram draws equal unit marks only for p ≤ 29. It omits earlier
complete groups, with their exact count stated. For larger p the interface
provides exact text rather than compressing a huge group into a false unit-scale
picture. Long integers wrap; the table retains an independent scroll region.

The 2310 descent accepts any proper divisor at least two of its predecessor.
All candidate divisors are enumerated exactly. Every step remains a divisor of
2310. The explanation generalizes: a strictly decreasing chain of whole numbers
at least two below any fixed start cannot be infinite. If the current divisor
were always composite, another smaller divisor would be available; eventually
one must therefore be prime. This is an existence reason, not a promise about
the app's trial bound or factoring speed.

## Source edition and reproduction

J. L. Heiberg, _Euclidis Elementa_, volume II, _Libros V–IX continens_, Leipzig:
B. G. Teubner, **1884**. The title's MDCCCLXXXIV establishes the year; the
archive catalogue date is not used. University of Toronto digitized copy:
[Internet Archive](https://archive.org/details/euclidisoperaomn02eucluoft).

The complete original PDF was downloaded afresh for this work:

```text
Bytes:   25785657
SHA-256: cd24f03c6e4e6d5f30a908d144c8f0f7003e99813334edb3a4107d748cb41043
```

Eleven complete pages are retained: IX.20 pp.388–391; VII definitions 1–2
pp.184–185; VII.31 pp.250–253; title PDF p.7. Numbered print page + 26 gives
the one-based PDF page. IX.20 is selected in full across seven readings; the
two definitions are complete; VII.31 is represented by its statement and a
selected impossibility clause, with the complete printed proof in the images.

Source JPEGs are unretouched whole-page reductions, 2200 px long edge, JPEG
quality 88, generated by Poppler 24.02.0. Their dimensions, length, hash and
page mapping are in [the manifest](../public/sources/primes/manifest.json).
Selections join line breaks/end-of-line hyphens, omit superscript markers,
normalize theta glyphs and lightly regularize punctuation; Greek/Latin point
labels use Greek Unicode. Latin u/v spellings and the printed `nulli numerum`
in the final contradiction are retained. The apparatus stays in the images.

```sh
python3 scripts/primes-sources.py /path/to/euclidisoperaomn02eucluoft.pdf
node --import tsx scripts/primes-cases.ts | python3 scripts/primes-oracle.py
```

The source reproduction checks the original PDF identity before rendering each
page and comparing its actual bytes. The independent arithmetic oracle uses
Python arbitrary integers and an Eratosthenes sieve, without importing
production code. It reconstructs all factor products and checks reported prime
factors, every given-prime remainder, unresolved cofactors, and the actually
recorded prime-trial prefixes. Its 456 cases include 120-digit constructions,
exact prime squares, partial factorizations and unresolved searches. Source
review and arithmetic verification are separate claims.

## Retained work and limits

JSON stores decimal strings and six validated settings, including the separate
descent. CSV stores construction/division/search facts and the chosen chain,
not a history of learner actions. Standalone SVG keeps the selected exact
arithmetic and, when p ≤ 29, the unit diagram. Long decimal strings continue on
following SVG lines; they are never rounded for saving or reopening.

The illustrated reading embeds all eleven source images, Noto Serif, complete
MIT/OFL notices, source identities and native JSON/CSV/SVG downloads. Its CSP
permits no scripts or network assets. Every source/font byte is length- and
SHA-256-checked before display or export. Asynchronous source loads must respect
the latest page selection; saving captures a settings snapshot at its click.

These finite computations do not prove infinitude by enumeration. The general
argument is supplied separately. No proof assistant, independent philological
review, physical print, manuscript reconstruction or complete assistive-
technology audit is claimed.
