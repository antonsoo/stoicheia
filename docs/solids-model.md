# Equal faces, different corners

The room at `solids.html` examines the conditions in the addendum after
_Elements_ XIII.18. Its distinctive comparison is a triangular bipyramid made
from two regular tetrahedra. Six congruent equilateral outside faces do not
make it one of the five regular solids: its tips and belt have different
numbers of incident faces. The room tests the face condition separately from
the uniform vertex condition, with a concrete convex example.

This is a modern mathematical comparison. It does not decide what the ancient
author intended by regularity, who wrote the addendum, or when it was added.
The app does not advertise a sixth Platonic solid or a refutation of the
classification with its proper conditions.

## What is being read

The retained source is J. L. Heiberg, _Euclidis Elementa_, volume IV,
Leipzig: B. G. Teubner, 1885. [Original digitized volume](https://archive.org/details/euclidisoperaomn04eucl).
The addendum begins below a divider on printed pp.336–337, after XIII.18's
comparison of side lengths. The following lemma ends on pp.340–341. Nine
selected Greek/Latin/English units connect the face condition, plane-angle
counts, two-thirds of a right angle and the definition of a solid corner.

| Retained printed pages | Purpose                                                                              | PDF pages |
| ---------------------- | ------------------------------------------------------------------------------------ | --------- |
| Title                  | Edition and date                                                                     | 7         |
| 4–5                    | XI definition 11, including its alternative formulation                              | 14–15     |
| 54–59                  | XI.21's statement, three-face proof, conclusion, and Heiberg's note about more faces | 64–69     |
| 336–337                | End of XIII.18 and start of the addendum                                             | 346–347   |
| 338–339                | Addendum's continuation and following lemma                                          | 348–349   |
| 340–341                | Lemma's conclusion and Latin diagram                                                 | 350–351   |

The fifteen whole JPEGs reproduce byte for byte using
`scripts/solids-sources.py`. The identified PDF is 23,500,629 bytes, SHA-256
`11cc842dcf76f37d650f95dcb6a724c2bd0ba90cfbf5b821821d97de1ffdda97`.
The [manifest](../public/sources/solids/manifest.json) identifies each rendered
page. Original markings and apparatus remain; nothing is cropped or retouched.

Selections remove line-end hyphens and reference markers, join lines, normalize
theta glyphs and lightly regularize punctuation. Latin u/v spellings remain.
The fourth Latin selection continues from p.337 onto p.339, explicitly labelled
in the reading and available through a continuation button. New English and
contextual notes have not received independent philological review.

## The exact local test

For a regular p-sided face, a triangulation gives total face angles
`180(p−2)` degrees. Equal angles share that total. At a vertex with q such
faces, the exact deficit is

```text
face angle = 180(p-2)/p
sum        = q * 180(p-2)/p
deficit    = 360 - sum
```

All classification uses integer numerators, never a rounded drawing or a
tolerance. q must be at least 3. For a convex polyhedral corner the deficit is
strictly positive. At zero the illustrated fan lies flat; a negative deficit
excludes a convex corner. This is not an impossibility claim about saddle
surfaces or arbitrary nonconvex polyhedra.

| p   | q   | Face angle | Sum  | Deficit | Complete uniform example |
| --- | --- | ---------- | ---- | ------- | ------------------------ |
| 3   | 3   | 60°        | 180° | 180°    | Tetrahedron              |
| 3   | 4   | 60°        | 240° | 120°    | Octahedron               |
| 3   | 5   | 60°        | 300° | 60°     | Icosahedron              |
| 4   | 3   | 90°        | 270° | 90°     | Cube                     |
| 5   | 3   | 108°       | 324° | 36°     | Dodecahedron             |

For p ≥ 6, a face contributes at least 120°. Three already use a full turn;
increasing p or q cannot restore a positive deficit. The finite controls
support p = 3–12 and q = 2–8. The general monotonic reason, rather than a finite
sweep alone, excludes larger values. The CSV enumerates all 70 supported
settings and labels that computation separately from a learner action history.

A positive deficit is necessary locally. It is not a construction of an entire
solid. The five coordinate models supply examples; the room does not reproduce
the constructions in XIII.13–17 or offer a formal proof of global uniqueness.

## The six-faced comparison

Let the shared base be an equilateral triangle of edge 1, centered in z = 0.
Its three vertices have radius `1/√3`, at azimuths 0°, 120° and 240°. The two
tips are at `(0,0,±√(2/3))`. Each tip is exactly distance 1 from every base
vertex. Each half is therefore a regular tetrahedron. The convex boundary of
their union has six equal equilateral triangles. The paired base faces are
internal, not extra external faces.

| Vertices | Number | Incident faces | Face-angle sum | Deficit |
| -------- | ------ | -------------- | -------------- | ------- |
| Tips 1–2 | 2      | 3              | 180°           | 180°    |
| Belt 3–5 | 3      | 4              | 240°           | 120°    |

Its five vertices, nine edges and six outside faces satisfy `V−E+F=2`.
All corners are convex, and their deficits total 720°.

The optional count inspector makes the conditional inference explicit. For a
closed convex polyhedron, Euler's relation and the sum of its face angles give
`Σδ = 360V − 180(2E−2F) = 720°`. If every vertex has the same deficit δ,
then `V=720/δ`, `E=qV/2`, and `F=qV/p`. Those are modern explanations, labelled
as such. They are not lines transcribed from the addendum.

In the bipyramid a selected tip conditionally predicts four vertices; a
selected belt vertex predicts six. The actual model has five. The conditional
calculation is valid; its uniformity premise fails. The actual 720° total
survives. The reader can change the inspected vertex and compare both sets of
counts with the same unchanged model.

## Coordinate and paper drawings

The five regular models use familiar Cartesian coordinates with the golden
ratio where needed, normalized to a circumradius of 1. The bipyramid uses
edge 1 as above. Their coordinate units are mathematical model units, not
ancient measurements or a shared physical face size.

The app finds supporting planes from vertex triples, groups coplanar vertices
into complete polygonal faces, orders them and derives the actual boundary
edges. A separate Python oracle reconstructs those faces by walking the
shortest-edge graph instead. It verifies face regularity, coplanarity, boundary
incidences, angle sums and convex support. The rendering does not display
artificial triangulation edges on squares or pentagons.

Each orthographic drawing first faces its highlighted vertex, then applies
the learner's common yaw and pitch. A rust marker stays visible even through
the solid. Blue identifies incident faces; a labelled table supplies the same
counts without depending on depth perception or colour.

The separate A4 SVG has two tetrahedron nets. Each is four 40 mm equilateral
triangles, with the central shared base marked. Cut the outer boundary,
crease the dashed inner triangle, tape the free edges and place the two
marked bases together. There are no unverified glue tabs. A 50 mm bar checks
print scale. The actual saved paths and units are measured independently;
physical printing, cutting and assembly have not been tested.

## Keeping the work

Version 1 JSON stores all control values, selected model and vertex, reading,
source page and view. Imports validate the complete settings before replacing
current work. A delayed file read cannot overwrite a newer action. Explicit
share links and browser history restore the same record.

The HTML export captures settings when Save is pressed. Later edits do not
change that export. It retains both actual SVG views, exact measurements, all
nine reading units, fifteen verified source images, Noto Serif, full MIT/OFL
licenses, and native JSON/CSV/cutting-sheet downloads. It needs no scripts or
network subresources. The example PDF is an actual browser print of that file;
it is untagged and physical printing remains unverified.

Source pages and fonts must match their edition's length and SHA-256 before
viewing or export. HTTP 200 alone is insufficient. New source images load into
detached candidates and replace the displayed page only after successful load
and a current-selection check. This corrects a Firefox failure encountered when
reusing an image with repeated `decode()` calls. A late candidate cannot replace
a later selection. The twelve-room service worker retains the entire build;
readiness requires the matching controlling worker and complete inventory.
