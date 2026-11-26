# Upgrade checks rerun, 2026-11-26

After the offline fix in `src/offline.ts` (a new edition that cannot be saved
under an earlier saved edition now says so, instead of "A different edition is
now saved offline"), each per-room upgrade check was rerun from its documented
baseline to the production build of `7c8a3f7`, the page code deployed that day.
Every check below passed in Chromium 153 and Firefox 155, with a held and with a
failed or substituted source download. The October receipts beside each room's
review are unchanged.

| Check                     | Baseline                                       | Result                                   |
| ------------------------- | ---------------------------------------------- | ---------------------------------------- |
| `desk-upgrade.mjs`        | source `51ed510`                               | [desk.json](desk.json)                   |
| `measure-upgrade.mjs`     | source `1855a95`                               | [measure.json](measure.json)             |
| `quadratrix-upgrade.mjs`  | source `115c3f3`                               | [quadratrix.json](quadratrix.json)       |
| `circle-upgrade.mjs`      | published seven-room tree, gh-pages `43701ad`  | [circle.json](circle.json)               |
| `horn-upgrade.mjs`        | published eight-room tree, gh-pages `2d37b8e`  | [horn.json](horn.json)                   |
| `ratios-upgrade.mjs`      | published ten-room tree, gh-pages `0aa92ca`    | [ratios.json](ratios.json)               |
| `mesolabe-upgrade.mjs`    | published four-room tree, gh-pages `c7ffcbe`   | [mesolabe.json](mesolabe.json)           |
| `gnomon-upgrade.mjs`      | published three-page tree, gh-pages `24967cc`  | [gnomon.json](gnomon.json)               |
| `quadrature-upgrade.mjs`  | published two-page tree, gh-pages `eef56bf`    | [quadrature.json](quadrature.json)       |
| `closure-upgrade.mjs`     | published reader-only tree, gh-pages `72d2341` | [closure.json](closure.json)             |
| `mixed-edition-check.mjs` | source `ea1dc1d` (six propositions)            | [mixed-edition.json](mixed-edition.json) |

Each published tree is the gh-pages commit just before the one that first added
the room's page; the source baselines are the commits the room reviews name.
`solids-upgrade.mjs` runs in CI from `c4ceb91` and passed there.

What the scripts needed, all for changes made in November:
- The companion-workshop panel starts collapsed (93aa602): gnomon, quadrature and
  closure open it before following a workshop link; mesolabe checks that the
  reloaded reader contains the link rather than that it is visible.
- The course has 23 propositions: the current-edition counts in gnomon,
  quadrature and closure were 21 or 20. Their baseline counts are unchanged.
- The installing worker reuses cached files whose bytes still match (408ce61):
  desk held `heiberg-015.jpg`, which the pre-desk edition already saved and the
  new worker therefore never requests. It now holds the first source page the
  baseline lacks.
- Saving nearly the whole edition from a one- to four-page baseline takes longer
  than 30 s: gnomon, quadrature, closure and mesolabe allow 120 s.
- With no earlier edition, a refused install says "Offline saving paused" and
  the reader shows verified scans through revoked blob URLs (0f76dda):
  mixed-edition-check accepts the wording and hashes the displayed blob.

`offline-upgrade-check.mjs` was not rerun: it replays three specific historical
upgrades (6→10, 10→16 and 16→20 propositions) between their own builds, whose
code says "could not be saved"; today's build is not one of its inputs.
