# Texts and editorial choices

The primary source is _Euclidis opera omnia_, volume I, _Elementa, libros I–IV
continens_, edited and translated into Latin by J. L. Heiberg (Leipzig: B. G.
Teubner, 1883). Its title page identifies Heiberg as the editor and Latin
translator. This Latin is nineteenth-century scholarly Latin; it is not an
ancient Latin translation or an otherwise unlabelled reconstruction.

The [University of Toronto scan](https://archive.org/details/euclidisoperaomn01eucluoft)
is public domain. The catalogue reports `NOT_IN_COPYRIGHT`. The Greek and Latin
transcriptions were checked visually against the bundled pages. No new modern
editorial text or translation from another website is vendored. The English is
a new reading translation for this workbench.

| Proposition | Greek printed pages        | Latin printed pages         |
| ----------- | -------------------------- | --------------------------- |
| I.1         | 10, 12                     | 11, 13                      |
| I.2         | 12, 14                     | 13, 15                      |
| I.3         | 14, 16                     | 15, 17                      |
| I.4         | 16, 18                     | 17, 19                      |
| I.5         | 20, 22                     | 21, 23                      |
| I.6         | 22, 24                     | 23, 25                      |
| I.7         | 24, 26                     | 25, 27                      |
| I.8         | 26, 28                     | 27, 29                      |
| I.9         | 28, 30                     | 29, 31                      |
| I.10        | 30                         | 31                          |
| I.11        | 32                         | 33                          |
| I.12        | 34                         | 35                          |
| I.13        | 36, 38                     | 37, 39                      |
| I.14        | 38, 40                     | 39, 41                      |
| I.15        | 40; bracketed corollary 42 | 41; no translated corollary |
| I.16        | 42, 44                     | 43, 45                      |
| I.17        | 44                         | 45                          |
| I.18        | 46                         | 47                          |
| I.19        | 46, 48                     | 47, 49                      |
| I.20        | 48, 50                     | 49, 51                      |

Bundled JPEGs are full-page renders of PDF pages 16–65 using Poppler's
`pdftoppm`, maximum dimension 1550 px and JPEG quality 88. They include material
outside I.1–20 and the selected foundations (other definitions and critical notes). The reader transcribes only its named selections. See [the manifest](../public/sources/manifest.json)
for the download URL, source PDF hash, page mapping and JPEG hashes.

Changes from print:
- End-of-line hyphenation, line breaks, page headers and critical apparatus are
  omitted. Main-text punctuation is encoded with modern Unicode punctuation.
- The printed Greek theta variant ϑ is normalized to θ. Point labels consistently
  use Greek Unicode characters, including letters that look identical to Latin
  letters. The source's Greek point labels also remain in the Latin translation.
- Latin u/v spelling and lowercase openings are retained. The inline reference
  marks in the Latin are omitted. The reasons panel gives separately authored
  explanations, not a transcription of Euclid's own marginal notes.
- On p. 15 the Latin prints `αἴτ. 2` beside circle instructions. The guide refers
  circle drawing to postulate 3, rather than repeating that printed reference.
- Heiberg brackets the repeated Greek conclusion in I.1. Those square brackets
  remain, and the reading note explains that the Latin does not repeat it.
- The step divisions and sentence alignment are editorial teaching aids. Latin
  often uses equations where Greek spells out an equality. A step is not claimed
  to align word-for-word.
- The English explicitly identifies intersections Η, Λ and Ε where the Greek
  leaves their location to the construction and figure. Such explanation is
  part of the reading translation, not an addition to the Greek.

The app retains only the diagram labels needed to follow the construction.
I.2's Θ and Κ, and I.3's Ζ, name otherwise unused points on source circles and
are explained in the notes. Γ in I.3 names the whole reference segment, not a
point. The diagram orientation and lengths are modern choices; the diagrams are
redrawn from calculations rather than copied from the printed figures.

Mathematical commentary was cross-checked against David E. Joyce's
[I.1](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI1.html),
[I.2](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI2.html), and
[I.3](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI3.html) at Clark
University. The app links these pages for further reading. In particular:
- I.1 takes circle intersection for granted. A numerical drawing in the real
  plane is not a proof from the five stated postulates.
- “Collapsing compass” describes a restricted construction operation. The app
  makes no claim about the construction of a physical ancient compass.
- I.2 uses I.1, and I.3 uses I.2. Reusing a result is distinguished from a primitive
  postulate. The earlier construction's working is available in its own lesson.

Noto Serif is bundled under the SIL Open Font License. Its license is at
[`public/fonts/OFL.txt`](../public/fonts/OFL.txt). There are no Google Fonts or
other third-party requests during reading.

## Triangle arguments, I.4–6

The continued course uses these facing pages from the same volume:

| Proposition | Greek printed pages | Latin printed pages |
| ----------- | ------------------- | ------------------- |
| I.4         | 16, 18              | 17, 19              |
| I.5         | 20, 22              | 21, 23              |
| I.6         | 22, 24              | 23, 25              |

The propositions use printed pages 10–25 (PDF pages 24–39). The additional
pages were visually inspected, including their point labels and the different
Greek/Latin page breaks. The I.4 `[ταῖς]` brackets are retained both in the statement
and the repeated conclusion. I.6 retains the printed `ἐλάττονι`; the earlier
`ἐλάσσονι` has not been silently substituted. Latin angle and triangle symbols
are encoded as ∠ and △, with the printed equality sign encoded as `=`.

Heiberg’s expanded common-notion numbering differs from the usual modern list:

| Statement                                  | Usual five-item list | Heiberg (1883) |
| ------------------------------------------ | -------------------- | -------------- |
| Things that coincide are equal             | 4                    | 7              |
| The whole is greater than the part         | 5                    | 8              |
| Two straight lines cannot enclose a region | Not included         | 9              |

The reader uses the usual numbering and names Heiberg’s numbering explicitly in
the affected reasons. I.4’s argument that two distinct straight segments could
not enclose a region is fully transcribed; it is not silently dropped to match a
shorter modern presentation. Superposition is identified as an assumption that
the five postulates do not explicitly authorize. The movable model preserves
lengths by rotation and translation. Flipping both triangles does not claim to
show an orientation-reversing correspondence.

I.5 preserves both triangle comparisons, the subtraction of equal lengths and
the subtraction of equal angles. Ζ corresponds to the F used in many English
editions; Η corresponds to G. The plate keeps Heiberg’s Greek point labels.
The first comparison is ΑΖΓ ↔ ΑΗΒ, the second ΒΖΓ ↔ ΓΗΒ.

I.6’s middle diagram is explicitly a **hypothetical scalene sketch**, including
in its exported SVG and HTML. It cannot satisfy both the original equal-angle
given and the temporary unequal-side supposition. Its numerical measurements
show actual unequal angles and a smaller inner triangle, rather than presenting
those conditional equalities as measured facts. The original equal-angle figure
returns when the supposition is discharged.

Further mathematical commentary:
[I.4](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI4.html),
[I.5](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI5.html),
[I.6](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI6.html).

## Inspectable starting permissions

The foundations reader includes definitions 10, 15, 16 and 20, all five postulates,
and the five usual common notions (Heiberg’s 1, 2, 3, 7 and 8), each with Greek,
Heiberg Latin, a new English reading, and a contextual note. Printed pp. 2–51 are bundled, giving fifty full pages in total (PDF pages 16–65). Definition 10 crosses Greek pp. 2/4 and Latin pp. 3/5.
Definition 15’s bracketed Greek clauses and common notion 8’s `[ἐστιν]` are kept;
the corresponding Latin omissions are preserved.

The right edge of the Toronto scan’s p. 6 is cropped. Definition 20’s Greek was
cross-checked against the quotation of the definition in T. L. Heath’s 1925
commentary, pp. 187–188, as transcribed by David R. Wilkins at
[Trinity College Dublin](https://www.maths.tcd.ie/~dwilkins/Euclid/Euclid_HeathCommentaries/EuclidElements_HeathCommentary_ElementsBk01Def19_DraftTranscription.pdf).
The missing margin is not presented as visible evidence. That cross-check and
the scan defect are disclosed in the foundation entry and source manifest.

The Greek on p. 10 includes bracketed common notions 4–6 and 9 which the facing
Latin does not translate. The foundations list does not invent Latin for those
entries. I.4 retains its own main-text two-line enclosure argument, in which the
printed Latin does give the corresponding argument.

## Uniqueness and bisection, I.7–10

Six further full-page renders, printed pp. 26–31, complete these four propositions.
Their Greek and Latin were checked directly against the scans, including the
page breaks inside I.7’s first angle equality and I.8’s superposition argument.
The editorial `[ταῖς]` is retained in I.8’s statement and repeated conclusion.
I.9 prints `δυσὶ ταῖς`; I.10 prints `δύο ταῖς`. Both readings are retained.
Latin short equations are not expanded into invented Latin sentences.

I.7’s statement restricts the second meeting point to the same side of the base.
Its printed proof follows one configuration with the candidate outside the first
triangle; the reading note identifies that coverage limit. The plate preserves
the first distance pair and displays the actual unequal second pair. The second
isosceles comparison remains conditional. Reflection satisfies both distance
pairs but fails the same-side hypothesis; coincidence fails the distinct-point
hypothesis. Neither is presented as a counterexample to the stated theorem.

I.8 starts from three lengths. Its numerical apex is obtained from two distance
constraints and has no independently adjustable angle. Impossible or degenerate
triples withhold the triangle and conclusion. The printed hypothetical apex Η
is explained in text; the diagram does not fabricate an Η that satisfies the
inconsistent constraints. Motion is the same explicitly qualified superposition
used in I.4.

I.9 actually obtains Ε through I.3. Its default equilateral vertex is on the side
of ΔΕ opposite Α, consistent with the source figure. The other circle crossing
has three behaviours in this real-plane model: an internal bisector below 60°,
coincidence with Α at 60°, and an outward ray above 60°. The model-derived cases
are teaching explorations, not additional claims transcribed from Euclid. The
invalid choices retain warnings in the interface, shared state and saved files.

I.10 reuses the two I.1 circles when applying I.9: the original base endpoints
already have equal distances from the equilateral vertex. The auxiliary label
`Ζ₉` distinguishes that reused I.9 point from the four labels in I.10’s text.
The midpoint is computed by intersecting the constructed line with the original
segment, then checked independently against the arithmetic midpoint.

Further commentary at Clark University:
[I.7](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI7.html),
[I.8](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI8.html),
[I.9](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI9.html),
[I.10](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI10.html).


## The supplementary I.7 case study

The printed I.7 passage remains unchanged. A separate exploration extends ΑΓ
beyond Γ to Ε and ΑΔ beyond Δ to Ζ, then uses the exterior-angle conclusion of
I.5 to handle a candidate inside ΑΒΓ. The extra labels are modern and explicitly
identified; neither additional Greek nor additional Latin is attributed to I.7.
The language panel reuses I.5's actual statement, Greek p. 20 and Latin p. 21,
highlighting `ὑπὸ τὴν βάσιν` and `sub basi`.

The account was checked against T. L. Heath, _The Thirteen Books of Euclid's
Elements_, second edition (1925), pp. 259–261, in
[D. R. Wilkins's transcription](https://www.maths.tcd.ie/~dwilkins/Euclid/Euclid_HeathCommentaries/EuclidElements_HeathCommentary_ElementsBk1Prop07_DraftTranscription.pdf),
including its interior-case diagram (PDF p. 3). Heath attributes the second case
to Proclus. The workbench does not claim to have checked Proclus's original text.
David E. Joyce's [I.7 guide](https://mathcs.clarku.edu/~djoyce/elements/bookI/propI7.html)
also identifies the missing interior placement and the relevance of I.5's second
conclusion.

The distinction being taught is a failed **containment reason**, not necessarily
a reversed numerical inequality. In the interior placement, ∠ΔΓΒ is not part of
∠ΑΓΔ; the exterior angle ∠ΕΓΔ supplies the appropriate containing angle. The
boundary point is computed by a line-circle intersection and uses whole/part of
a segment, without invoking I.5 on a degenerate triangle. Reflection and
coincidence each remove a different hypothesis. The fixed numerical family and
its limited scope are stated in the interface and saved studies.


## Possibility vocabulary correction

The positive forms `δυνατόν` and `potest` were incorrectly assigned to the
“impossible” vocabulary entry. The popup now distinguishes positive `δυνατός`
from negative `ἀδύνατος`. Latin `potest` is a form of `possum`, “can”; the separate
`non` in `fieri non potest` supplies negation. The source text and its translation
were already correct and are unchanged. This is a lexical correction, not a
claim to parse the full sentence automatically.

The distinction was checked against the LSJ entries for
[δυνατός](https://atlas.perseus.tufts.edu/dictionaries/entry/urn%3Acite2%3Ascaife-viewer%3Adictionaries.v1%3Alsj-n28588/)
and [ἀδύνατος](https://atlas.perseus.tufts.edu/dictionaries/entry/urn%3Acite2%3Ascaife-viewer%3Adictionaries.v1%3Alsj-n1522/),
and Lewis and Short's
[possum](https://atlas.perseus.tufts.edu/dictionaries/entry/urn%3Acite2%3Ascaife-viewer%3Adictionary-entries.atlas_v1%3Alat.ls.perseus-eng2-n37193/),
as provided by the Perseus Digital Library. The definitions and notes in the
reader are newly written, not copied dictionary entries.


## Perpendiculars, linear pairs and exterior angles, I.11–16

The fourteen new proposition pages (32–45) were transcribed against the full
page scans, along with definition 10's opening on pp. 2/3. English, language
notes and reading exercises are new. The source PDF's SHA-256 remains
`da285c581c2dda86e2b25e20db3ce604bf6fb8765228fcd71cfc89d47a9d1c17`.
- I.11's Latin margin cites I.2 for the equal placement, while some modern presentations cite I.3. The plate uses an actual I.2 copy, then a circle/ray intersection to lay the equal length off on the other side of Γ. Its equilateral vertex comes from I.1.
- I.12 preserves Greek `δύο ταῖς` in the side comparison. The opposite-side choice is the source's condition. Same-side misses, tangencies, crossings and zero radius are explicitly modern experiments. The circle is intersected with the unbounded supporting line, not the displayed ΑΒ segment. A nonzero chord is bisected through I.10.
- I.13 retains `[εὐθείᾳ]`. Its conclusion crosses both language page breaks. The 90-degree control setting follows the first, equal-adjacent-angle branch; no third nonzero angle is invented between coincident rays.
- I.14's body uses `δύο ὀρθαῖς` where the statement uses `δυσίν`; the printed forms remain. The hypothetical sketch follows the printed relative placement: ΑΒΓ + ΑΒΔ retains its given total, but Ε lies off ΓΒΔ. The temporary claim that ΓΒΕ is straight is conditional. Its remainders are not rendered as numerically equal.
- I.15's main proof is complete on pp. 40/41. The following Greek `[Πόρισμα …]` on p. 42 is bracketed in full. The facing Latin begins I.16 without translating it. The reader includes a separate edition note and English reading, without manufacturing Latin. The scan's apparatus remains available.
- I.16 retains the printed triangle names ΑΒΕ and ΖΕΓ even though that order does not list corresponding vertices. The side pairs establish Α ↔ Γ, Β ↔ Ζ, Ε ↔ Ε; the comparison table makes that correspondence explicit. The second construction, introduced by `ὁμοίως` / `similiter`, bisects ΒΓ. Θ and Κ are modern labels for the expanded drawing and are identified as such in the app and downloads. This proof establishes two strict inequalities; it does not invoke I.32's later exterior-angle sum theorem.

Both midpoint constructions call the existing I.10 construction. Equal extension
uses I.2 and a ray/circle intersection. The prior lessons can be opened from the
reason panel. The numerical model checks the displayed figure; it does not prove
incidence, continuity or motion assumptions from an axiomatic foundation.


## Inequalities, I.17–20

The complete Greek and facing Latin were checked visually against printed
pages 44–51. The six additional images, pages 46–51, use the same rendering
command and source PDF as the previous edition. I.17 shares existing pages
44/45; the end of I.20 occupies only the top of 50/51. The rest of those
complete pages includes I.21, which is not transcribed in this course.
- I.17 adds a common angle to a strict inequality. The reason explicitly names
  this order rule rather than mislabeling it as one of the usual five common
  notions. Heiberg’s printed Latin cites his expanded common notion 4; the
  existing foundations reader uses the usual five-item selection.
- I.18 and I.19 reverse the direction of given and goal. Their statements
  preserve that change in word order; the English and notes state the logical
  direction explicitly. No sine rule or angle-sum theorem is used as a reason.
- I.19’s Greek shorter-side sentence crosses 46/48, and the facing Latin
  crosses 47/49. The source buttons include both pages. Its conditional
  `ἂν ἦν` / `esset` is kept conditional in the reading and diagram notices.
- I.20’s Latin footnote `Nam ΔΒ = ΔΑ + ΑΒ.` is not inserted into the source
  passage. Segment addition is explained in the reason, with the footnote
  identified as Heiberg’s explanation.
- I.17 and I.20 say `ὁμοίως` / `similiter` for the remaining comparisons.
  Additional constructions, with the same original point names in reassigned
  roles, are identified as modern teaching expansions. Their selection never
  replaces the printed text with an invented ancient passage.

The English, syntax notes, exercises and coordinate diagrams are new. The
Latin remains Heiberg’s nineteenth-century translation. No modern English
translation is reproduced. The linked Joyce commentary supplies further
reading; the bundled Heiberg pages are the transcription source.
