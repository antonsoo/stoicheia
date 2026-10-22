# Perpendiculars and the exterior-angle argument

The course now reaches I.16, with 135 aligned Greek/Latin/English reading steps,
46 vocabulary entries, fourteen foundation statements, thirty-two reading
exercises and forty-four inspectable source pages. The six new lessons make a
connected argument: perpendicular construction, linear-pair total, its converse,
vertical-angle equality and the two exterior-angle inequalities.

The primary edition is Heiberg 1883, proposition pages 32–45 and definition 10
on pp. 2–5. [Source notes](sources.md) document the Greek-only corollary, printed
variants, page breaks and the modern labels used to expand I.16's second drawing.
No replacement Latin is supplied for an omission in the source.

## What can be explored

| Lesson | Interaction                                                             | Boundary retained                                                                             |
| ------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| I.11   | Move Γ along ΑΒ and flip the equilateral vertex                         | Γ is not assumed to be the original segment's midpoint                                        |
| I.12   | Move Δ horizontally and across the line; select miss, touch or crossing | No fictitious chord or midpoint at a miss, tangency or zero radius                            |
| I.13   | Change the given angle up to the right-angle case                       | The equal-angle branch ends at definition 10; no zero angle is treated as a third part        |
| I.14   | Tilt the supposed alternative continuation                              | Measured unequal remainders stay separate from the conditional equality                       |
| I.15   | Change the crossing angle                                               | Opposite angles need not be right; the Greek corollary has no facing Latin                    |
| I.16   | Change the triangle and inspect both midpoint constructions             | Θ and Κ are modern labels; the proof uses strict containment, not the later angle-sum theorem |

## Independent calculation

`npm run verify:right-angles` streams the actual TypeScript constructions to a
separate Python standard-library oracle using 60-digit Decimal arithmetic. The
oracle imports no application code. It solves a general line/circle quadratic
and checks midpoints, perpendicular projections, central reflections, side
correspondences and strict ray containment. The retained
[receipt](right-angle-oracle.json) records 2,130 cases and 21,030 comparisons,
with maximum relative error `3.302790677052444e-14` against tolerance `2e-10`.

A tangent example rotated and translated near (71, -39) exposed cancellation at
unit scale. The earlier classifier ignored the absolute coordinate scale and
called it a miss. The numerical tolerance now accounts for coordinate
subtraction as well as squared radii, so unresolved contact does not fabricate a
chord. This is a numerical-resolution policy, not a formal incidence proof.

## Reader and exported evidence

The production browser check walks all 135 steps, all 32 reading exercises and
the full source-page inventory in Chromium and Firefox at 1440 and 375 pixels.
The added workflow measures the actual SVG vertices, tests native keyboard
controls, reloads shared offsets, exercises all I.12 alternatives and both I.13
branches, and opens the Greek-only edition note. Both I.16 constructions are
checked across 48 rendered parameter cases per browser configuration.

Downloads retain the invalid or conditional status: an I.12 tangent has no
midpoint, and I.14's hypothetical continuation cannot silently turn into a valid
figure when saved. The I.16 standalone study sheet includes the ten steps,
three languages, reasons, foundation text, source attribution and the second
construction's modern-label note. Its PDF is generated from the actual file.
The separate print check extracts every source/English paragraph and step title
from 32 Chromium PDFs, including the Greek-only corollary and omission note.

Build, local browser, print and public-host receipts are separate evidence. Their
scope and checked source commit are recorded when publishing this revision.
