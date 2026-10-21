# The case left to the reader

The printed I.7 proof compares an angle with a part visible in its diagram. The
first version of the reader disclosed that placement limit, but its controls
kept Δ outside ΑΒΓ. It could name the missing case without letting a learner
inspect it. The separate case study now moves Δ through the boundary while
retaining ΑΓ = ΑΔ, then connects the interior-case repair to I.5's Greek and
Latin statement.

[Open the interior argument](https://antonsoo.github.io/stoicheia/#p=7&case=1&turn=55&case-step=2).
The eight printed I.7 steps are unchanged. The supplement is explicitly modern;
Ε and Ζ extend ΑΓ and ΑΔ for its explanation, and are not presented as printed
I.7 labels. [Source notes](sources.md#the-supplementary-i7-case-study) distinguish
the Heiberg passage from Heath's account of the additional argument.

| Placement of Δ | What changes | Appropriate reason |
| --- | --- | --- |
| Outside ΑΒΓ | ∠ΔΓΒ is part of ∠ΑΓΔ | I.5's equal interior base angles connect two strict part comparisons |
| Inside ΑΒΓ | ΓΒ leaves the interior of ∠ΑΓΔ | Extend the equal sides and use I.5's equal exterior angles |
| On ΒΓ, between its ends | Triangle ΒΓΔ is degenerate | ΒΓ = ΒΔ + ΔΓ > ΒΔ, by whole and part of a segment |
| Reflected across ΑΒ | Both distance pairs agree | The same-side hypothesis fails |
| Coincident with Γ | Both distance pairs agree | The distinct-point hypothesis fails |

A subtle distinction matters: the interior placement does **not** necessarily
reverse the printed numerical inequality. It invalidates the particular
whole-and-part justification for that inequality. The two equal exterior angles
supply a different valid chain. The display continues to measure unequal ΒΓ and
ΒΔ; the contrary equality in the reductio remains a supposition.

## Mathematical review

The apparatus fixes ΑΒ = 200, ΑΓ = 140 and ∠ΒΑΓ = 70°. A native keyboard slider
turns Δ from 0° through 65° toward the base. All of its noncoincident moving
positions stay in the same half-plane. The boundary button computes the second
intersection of the Α-centered circle with line ΒΓ; it does not snap to an
approximate angle or choose a point by eye.

The [independent oracle](case-study-oracle.json) reads only point coordinates and
reported measurements emitted by TypeScript. Python calculates distances,
cosine-law angles and Heron area sums. Its classification uses area sums, while
the application uses oriented half-planes. It checks all 66 slider positions,
the exact boundary and the reflection, at four scales, three rotations and both
orientations: 1,632 cases and 38,328 comparisons. Maximum observed angle error
was about 8.93e-12 degrees, below the 2e-7 degree tolerance; maximum relative
length error was about 3.78e-15, below 2e-12.

Those are real-plane numerical checks of this family, not a formal proof from
Euclid's postulates or an exhaustive classification of all I.7 placements.
Equality substitution, transitivity and positional assumptions remain explicit
in the explanation. No extra language is invented to fill a gap in the source.

## Learner review

The exploration has separate controls and a separate saved study, so the printed
parallel passage never silently changes to match the supplementary argument.
The Greek/Latin panel reuses I.5's actual statement and opens its bundled pp. 20
and 21. Each saved HTML study contains the selected placement, complete relevant
argument, actual length checks, language clause and attribution; it needs no
JavaScript or network requests. Interior studies retain the auxiliary rays even
when saved from the first diagnostic step. Use the study's own browser print
command to print the supplement; the main reader's print command remains the
full parallel lesson.

Review of the first implementation found that a shared exploration restored its
state about 3,960 pixels below the top of a 375px page without moving focus or
scrolling there. This was an unpublished implementation defect, not an observed
public incident. Shared links now land at the visible exploration heading;
returning from I.5 also restores the selected case. The geometry plate was made
larger on phones, with explicit jumps between figure and argument.

## Reproduce

```sh
npm ci
npm run check
npm run verify:cases
npm run preview
```

With that production preview running in another terminal:

```sh
node scripts/casebook-browser.mjs
npm run test:browser
```

The case-study workflow drives the native keyboard slider through every value,
opens every placement, saves twenty HTML studies across two engines and two
viewports, and prints five actual Chromium PDFs. It checks the Greek and Latin
source paragraphs in extracted PDF text, restores shared state in a new tab,
opens both source scans, and disconnects a server-side origin gate before
reloading the case. Firefox printing is not represented as native PDF evidence.
