# Contributing

Use Node.js 24 or later. Install with `npm ci`, run the reader with `npm run dev`,
and run `npm run check` before proposing a change. The independent construction
oracles are `npm run verify:oracle` (circle intersections) and
`npm run verify:triangles` (congruence, angle subtraction and contradiction), plus
`npm run verify:bisections` (uniqueness, three lengths and both bisections). They
need Python 3, with no third-party packages. `npm run verify:right-angles` checks the perpendicular constructions and both exterior-angle copies against an independent quadratic/midpoint/containment oracle. `npm run verify:cases` separately
checks the I.7 supplement with area sums and cosine-law angles. Run
`node scripts/casebook-browser.mjs` against the production preview for its
keyboard, sharing, source, download, print and offline workflows.

Keep geometry in `src/core`, editorial material in `src/content`, and rendering in
the interface. A new geometric operation should have a reason in the source or
an explicitly labelled additional assumption. Do not infer correctness from a
plausible diagram or from equality of rounded display values.

For a text correction, cite the printed page and line in the bundled Heiberg scan.
Distinguish corrections from modernized spelling or a different editorial
reading. Preserve the source Greek and Latin alongside any changes to the English.
Do not silently replace the historical Latin with newly generated Latin.
Foundation numbering follows both the conventional list and Heiberg’s edition;
retain that distinction. A reading exercise must quote an exact passage, teach a
concrete grammatical or logical distinction, and explain every offered answer.

For a browser change, build and preview the production site, then run
`npm run test:browser` with matching Playwright Chromium and Firefox installed.
Inspect the desktop and phone screenshots in `docs/assets/`, and check keyboard
navigation, modal focus return and source-page zoom. Add browser coverage only
when it protects an actual interaction or correctness boundary.

Publication is a separate review step. A local build or local browser receipt does
not establish what a remote host serves.
