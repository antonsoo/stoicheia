# Direct review: Euclid’s application of areas

## Try the actual work

Run the README quickstart and open `/stoicheia/areas.html#ar-bench`, or use
**Two fits. One limit.** in the course’s companion workshops.
1. At target 27, reflect trial 3 to 9. The blue applied regions have equal area;
   the square shortfalls have areas 9 and 81. Both panels use the same scale.
2. Choose **Meet at the limit**: the two fits coincide at 6, area 36. Then choose
   **An impossible target**: 45 stays above the maximum; no trial is presented
   as a solution. Read the current condition and inspect the original p.162.
3. Choose **Change one condition**: exceeding fits 45 at 3. Read VI.29’s
   `ὑπερβάλλον / excedens` beside VI.28’s `ἐλλεῖπον / deficiens`.
4. Choose **A fit between fractions**, then try either lower bound. The target
   remains 28; the exact nonzero residual prevents a near miss being called equal.
5. Alter the height factor and shear. Keep the given similarity shape visible
   and inspect the perpendicular-height account. All hatched regions remain
   scaled copies at the fixed shape setting.
6. Keep JSON, CSV, SVG and the illustrated HTML. Reopen the JSON after changing
   the bench. Open the HTML as a local file with networking and scripts disabled;
   the readings and original scans remain. Save an impossible target too.

The restriction is substantive. For the square case it is the maximum product
for two positive lengths with a fixed sum. The exceeding construction has a
different base and no corresponding ceiling. The [model account](areas-model.md)
separates these coordinate identities from Euclid’s geometric proof and the
printed edition’s editorial decisions.

## Reproduce

```
npm ci
npm run check
npm run verify:areas
npm run verify:areas-sources -- /path/to/euclidisoperaomn02eucluoft.pdf
npm run preview -- --port 4368
```

With the preview running, in another terminal:

```
node scripts/areas-browser.mjs http://127.0.0.1:4368/stoicheia/ /tmp/areas-review
node scripts/areas-guards.mjs http://127.0.0.1:4368/stoicheia/ /tmp/areas-guards
node scripts/areas-print.mjs /tmp/areas-review
python3 scripts/areas-artifacts.py /tmp/areas-review
```

`npm run build` produces `dist/`, including the complete offline worker and
source assets. Browser replay uses the built edition’s identity and inventory.
The scripts operate the real UI and save real browser downloads.

## Evidence boundary

This addition is local and prepared for coordinator review under
`HOUSE_STANDARDS.md`. No push, tag, hosted update or CI execution is claimed.
Source: fifteen whole pages reproduced byte-for-byte from the identified original
PDF. Mathematical oracle: 2,268 cases passed independent exact polygon shoelace,
Python Fraction and 70-digit Decimal root checks. See
[source receipt](evidence/areas/sources.json) and [oracle output](evidence/areas/oracle.log).

The [actual browser matrix](evidence/areas/browser.json) covers Chromium and Firefox
at 1440 and 375 pixels. Each journey starts in the course, opens the new workshop,
operates exact and irrational fits, uses keyboard controls, opens Greek and Latin
pages, pans enlarged images, saves and reimports work, and reads the standalone
HTML as a local file with networking and scripts disabled. It checks no page-wide
overflow and no axe violations in the reviewed state. All fourteen rooms reopen
with browser networking disabled after matching-controller takeover and a complete
231-file cache inventory. These observations are narrower than a comprehensive
accessibility certification.

[Fault-injection receipts](evidence/areas/guards.json) cover both engines with
service workers blocked: a valid but substituted scan stays hidden and prevents
export; retry recovers; an older source response and delayed import cannot replace
newer choices; an export retains the click-time settings; and a substituted font
prevents the font-embedded SVG. Exported SVGs carry the complete font license.

[Native artifact review](evidence/areas/artifacts.json) independently parses the
actual downloads from all four browser cases. It verifies every embedded image
against the retained source bytes, the font and full licenses, the native
JSON/CSV/SVG against separate downloads, and the exact area account. The offline
reading keeps target 45 as an impossible falling-short premise.

The retained [30-page PDF](../examples/areas/reading.pdf) includes all 27 complete
Greek/Latin/English paragraphs. All fifteen original JPEGs extract byte-for-byte
from the PDF; checked text stays inside its page margins. Greek and Latin print
in sequence for coherent reading and extraction. Chromium reports a tagged PDF;
PDF/UA conformance, physical print precision and comprehensive assistive-technology
review are not claimed.

The [illustrated HTML, gzip](../examples/areas/reading.html.gz),
[editable record](../examples/areas/experiment.json),
[exact CSV](../examples/areas/area-account.csv) and
[font-embedded SVG](../examples/areas/comparison.svg) are actual browser exports.
Decompress the HTML before opening it. The sample preserves an irrational-root
lower bound and its exact nonzero residual, rather than presenting a decimal
approximation as equality.

Direct visual review corrected the primary button’s hovered contrast, a grid
minimum-width overflow on phones, and overlapping long fraction labels in the
plate. Plate labels now mark shortened values as approximate while the exact
ledger and SVG description retain the fractions. Print review changed paired
languages to sequential blocks so neither reading is interleaved in extraction.

[Desktop screenshot](assets/areas-desktop.png) · [Phone screenshot](assets/areas-phone.png).
