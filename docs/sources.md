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

Bundled JPEGs are full-page renders of PDF pages 24–31 using Poppler's
`pdftoppm`, maximum dimension 1550 px and JPEG quality 88. They include material
outside I.1–3 (common notions, critical notes, and the start of I.4); that material
is not transcribed in the reader. See [the manifest](../public/sources/manifest.json)
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
