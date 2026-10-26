# The quadratrix's missing endpoint

The room reads Pappus, _Collection_ IV.30–32, in Friedrich Hultsch's
1876 volume I, printed pp.250–259. It asks a specific question: what happens
to the intersection that generates the curve at the exact final instant?

## What belongs to the source

Pappus describes a rotating line and a parallel translating line that complete
their journeys together. Their intersection generates a curve called the
_quadratrix_. He reports Sporus's objections to its generation, then gives a
geometric argument for its useful proportion. These are separate parts of the
account; the room retains both.

The eight selected Greek and Latin readings come from the complete pages
bundled in [the source directory](../public/sources/quadratrix/). The
[manifest](../public/sources/quadratrix/manifest.json) records the complete PDF's
identity, each PDF-to-printed-page mapping and every JPEG's identity. The
[original scan](https://archive.org/details/pappialexandrin00hultgoog) is a
Google digitization of Oxford University's copy. The edition is public domain;
the repository's new English renderings and diagrams are MIT.

This is a later printed witness, not an ancient manuscript or a new critical
edition. Greek theta is normalized to Unicode theta, geometric labels to
uppercase Greek letters, and line-end hyphenation removed. Latin reference
marks are omitted from the selections. The complete photographs preserve
the typography, notes, brackets and apparatus.

Two details matter when comparing the drawings:
- Pappus uses B for two initially coincident moving points. Hultsch explains
  the two uses on p.253. Our moving arc endpoint is E; our sliding endpoint
  is S. Z remains their lines' intersection.
- The later theorem changes its labels. Its centre is Gamma and its
  intercept Theta, corresponding to A and H in the motion plate. It is not
  a second, contradictory formula for the same labeled segments.

Hultsch's p.253 footnote disputes the weight of the objections, citing
Bretschneider. The room presents the reported objection and the subsequent
theorem; it does not declare a universally accepted ancient verdict. The
selected text does not establish an inventor's biography, and the room does
not assign the curve's discovery to Hippias on the basis of this passage.

## A modern coordinate realization

Set A = (0,0), B = (0,1), Gamma = (1,1), Delta = (1,0). Time is an integer tick
on a clock of 1,000,000 ticks. For synchronized uniform motions, write the
remaining fraction as `u = (clock - tick)/clock`. The arc endpoint has remaining
angle `theta = pi*u/2`; the translating line has height `u`.

```text
Translating line: y = u
Rotating line:    sin(theta)*x - cos(theta)*y = 0

u > 0: one crossing, x = u*cot(pi*u/2), y = u
u = 0: both equations become y = 0; no unique crossing
```

Degeneracies are decided using the integer clock before evaluating
trigonometric functions. The end state stores `point: null`, `kind:
"coincident"`. Checking the option to add H never changes that line relation.

All drawn lengths use equal horizontal and vertical scales. The dashed curve
is the synchronized reference. The solid curve is sampled from the applied
motion only up to positive remaining time. The final instantaneous crossing
is drawn only when it is unique and inside the square. A full-line crossing
outside the square is reported numerically, without placing a marker on an
unrelated visible point.

The source's proportion of remaining arc to remaining height supplies the
uniform progress used here. This is a programmed coordinate model, with pi
already supplied by the program. Its animation is not a construction of pi,
a demonstrated ancient instrument or a physical implementation of exact
synchronization.

## Why an extension has the intercept 2/pi

For an interior remaining angle, the unit-circle sector comparison gives
`sin(theta) < theta < tan(theta)`. Consequently

```text
cos(theta) < theta*cot(theta) < 1
x = (2/pi)*theta*cot(theta)
```

Both bounding expressions tend to 1 as theta tends to zero. The preceding
crossings therefore tend to `(2/pi,0)`. This justifies a continuous extension;
it does not cause the final coincident lines to single out that point.

The squeeze argument is a modern explanation. Pappus's own geometric argument
by contradiction remains available in full on pp.256–259. Finite samples,
including the smallest supported positive remaining time, do not prove the
limit by enumeration.

At small positive angles, directly subtracting `2/pi - x` loses significant
digits. The display instead evaluates the positive difference by the expansion
of `1 - theta*cot(theta)` through the theta-to-the-tenth term when theta is
below 0.01. The independent 90-digit checker evaluates the difference without
that expansion and checks the switch as well as the near-end case. These are
floating-point approximations, not exact rational trigonometric coordinates.

## Change the timing

The two supplemental experiments leave each motion uniform until it stops.
They are new comparisons, not additional ancient procedures.

| Rotation duration / slider duration | What happens before the slider finishes                                                   | At the slider's exact finish                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1                                   | The crossing approaches the intercept                                                     | Coincident lines; no unique Z                                   |
| 9/10                                | The crossing leaves the square; after rotation stops, the lines are parallel and distinct | Coincident lines; the earlier parallel interval is not repaired |
| 11/10                               | The crossing follows a different path toward A                                            | One crossing at A while the rotating line remains tilted        |

With an early rotation the full-line crossing grows without bound as rotation
approaches its own finish while the slider still has positive height. The
current endpoint markers distinguish E, S, Z and the separately supplied H.
Reaching both final positions eventually is weaker than the prescribed
synchronized progress.

## What squaring would consume

If the extended curve supplies `AH = 2/pi` for a unit side, the third
proportional is `L = 1/AH = pi/2`, a quarter-circle's rectified length. Four
copies give the circumference. Pappus then invokes Archimedes's circle-area
result: radius times circumference is twice the circle's area. A mean
proportional converts the resulting rectangle to a square, as in Euclid II.14.

This explains the role of the intercept. It does not manufacture it using
straightedge and compass. The room makes no claim that a finite-precision
animation, a drawing of the limit or a computed square root supplies such a
construction.

## State, saved files and offline use

The applied time, timing experiment, added-limit choice, reading and source
page all survive shared URLs, history and editable JSON. File imports validate
the whole record before replacing it. A running export captures one state at
the time of the click. Animation uses elapsed time; a first frame timestamp
earlier than its starting click is clamped to zero elapsed time.

CSV keeps exact integer clock fields, approximate coordinates and the explicit
line relation. Non-unique crossings have empty coordinate fields. The continuous
extension has its own row, labeled `limit_not_crossing`; it is not a fake final
crossing. The standalone SVG embeds its font and complete licenses.

The illustrated HTML includes the applied plate, both modern arguments, all
eight readings, sixteen notes, ten complete scans, editable JSON and CSV links,
the font and licenses. It has no scripts or remote subresources. Asset bytes
are verified before source display and export. A late source result cannot
replace a newer selection, and a substituted scan prevents a study from being
saved. The production worker includes the new room and sources in its complete
integrity-checked install; the UI waits for the matching active edition and
its cache inventory.

Physical mechanisms, calibrated physical printing, browser/device performance
on untested hardware, tagged-PDF accessibility and a complete Pappus course
remain outside the verified scope.
