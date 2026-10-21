# A geometric reading desk

Audience: an English-speaking reader who knows what a triangle is and wants to
read actual Greek and historical Latin without first learning either language.
The page's job is to connect each sentence to an allowed construction and its
reason. The course is Euclid I.1–6: three constructions followed by three triangle arguments.

Palette: blue paper #e8eff4, ink #193d60, construction blue #386a94, active purple
#694780, white folio #fbfcfe, muted ink #52677b. The manuscript is a printed book,
not an imagined ancient papyrus. Avoid sepia, columns, laurel wreaths and faux wear.

Type: Noto Serif for the Greek and Latin reading text, system sans for instruction
and navigation, system monospace for line equalities. Self-host the font and its
license. Use real polytonic Greek characters and explicit language attributes.

The signature element is a large geometric plate whose current sentence has an
aligned Greek/Latin/English folio. Its numbering is the construction order, not
decorative numbering. The equal lengths are marked on the diagram as well as named.

```
STOICHEIA                              Sources / Read offline
Euclid, Book I                  [I.1] [I.2] [I.3]
----------------------------------------------------------------
Construction plate             | Current sentence
      two intersecting circles | Greek + selectable vocabulary
      with labelled vertices   | Latin + selectable vocabulary
                               | English explanation
-------------------------------+--------------------------------
previous / next / step strip    | Why this step is allowed
change the given lengths       | short linked reason
----------------------------------------------------------------
Reading trail / full passage / vocabulary / question / source pages
```

On a phone, put the plate first, its controls directly below, then the sentence.
No automatic playback: the learner chooses the pace. Parameters have native
range controls, so every manipulation works on a keyboard and without dragging.
Focus survives step and parameter changes. Respect reduced motion. Source scans
are a real reading aid, shipped with the app for offline inspection.

Self-critique before implementation: a cream serif editorial design would blend
into many generated history sites. Blue mathematical paper and a working plate
give this book a specific function. The interface should feel like an instrument
for reading, with explanations taking priority over a decorative landing page.

The second row of proposition navigation introduces proofs rather than new
construction tasks. Purple and teal translucent regions distinguish overlapping
triangle comparisons. The I.4 slider applies a rigid motion; I.6 carries an
explicit hypothetical-sketch notice. Matching is shown in a table, because the
order of vertices and sides is mathematical information. The course map lists
actual prerequisite results, rather than implying that every proposition depends
on the one immediately before it. Phone readers can jump directly between the
plate and its sentence without scrolling past the correspondence tables.
