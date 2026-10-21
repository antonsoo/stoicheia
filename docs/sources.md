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

| Proposition | Greek printed pages | Latin printed pages |
| ----------- | ------------------- | ------------------- |
| I.1         | 10, 12              | 11, 13              |
| I.2         | 12, 14              | 13, 15              |
| I.3         | 14, 16              | 15, 17              |
| I.4         | 16, 18              | 17, 19              |
| I.5         | 20, 22              | 21, 23              |
| I.6         | 22, 24              | 23, 25              |

Bundled JPEGs are full-page renders of PDF pages 18–39 using Poppler's
`pdftoppm`, maximum dimension 1550 px and JPEG quality 88. They include material
outside I.1–6 and the selected foundations (other definitions, critical notes,
and the start of I.7). The reader transcribes only its named selections. See [the manifest](../public/sources/manifest.json)
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
Greek/Latin page breaks. The start of I.7 remains visible on pp. 24–25 but is not
part of the reader. The I.4 `[ταῖς]` brackets are retained both in the statement
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

The foundations reader includes definitions 15, 16 and 20, all five postulates,
and the five usual common notions (Heiberg’s 1, 2, 3, 7 and 8), each with Greek,
Heiberg Latin, a new English reading, and a contextual note. Printed pp. 4–9 are
now bundled as well, giving twenty-two full pages in total (PDF pages 18–39).
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
