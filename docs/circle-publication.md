# Circle workshop: public edition

The eight-room edition is public at
[Keep the safe side](https://antonsoo.github.io/stoicheia/circle.html).
Publication was checked on 2026-10-26 UTC. The earlier
[local review](circle-review.md) remains a separate implementation record.

| Boundary        | Observed evidence                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source          | Main `3ede643289b654c54701097b333bef283d5c9f4a`, containing the four implementation commits and retained readings                                       |
| Static branch   | `2d37b8ee0c970c94c4f4ec87757937dd68d72833`, a normal descendant of the earlier Pages commit; old hashed assets retained                                 |
| Hosted files    | All 142 current build files matched byte length and SHA-256 at their canonical public URLs, without query parameters                                    |
| Public browsers | Chromium 153.0.8010.12 and Firefox 155.0, each at 1440 and 375 pixels; native course disclosure, controls, readings, sources and downloads              |
| Cached edition  | All 141 generated inventory paths matched the current cache and edition identity before offline use                                                     |
| Upgrade         | Actual previous seven-room static edition, an existing course tab, and the new eight-room worker; held and substituted source responses in both engines |

The [hosted-file receipt](circle-publication/hosted-files.json) identifies every
file. The [public browser receipt](circle-publication/browser.json) records
four independent contexts. Each exercised both root-error presets, exact
ledgers, editable JSON reopening, shared addresses, history, all eight readings,
all ten source-page identities, zoom, keyboard scrolling and accessibility checks.
The source viewer and illustrated export refused substituted JPEG bytes; a late
response did not overwrite the current page. No page errors, document overflow
or axe WCAG 2 A/AA and 2.1 AA violations were reported in this scope.

Each public context downloaded CSV, JSON, font-embedded SVG and a complete
script-free HTML reading. Both ordinary and failed-trial readings opened from
disk with scripts disabled and automatic remote requests blocked. Their ten
embedded JPEGs and font matched the retained local identities. The independent
Fraction/100-digit polygon oracle checked the 160 rows in the sixteen retained
public native CSVs:

```sh
python3 scripts/circle-bounds-oracle.py --browser docs/circle-publication/browser.json
```

Public offline checks disabled **browser networking**. Reload, source display,
another rejected root trial, an illustrated download, course navigation and
return all succeeded. The public origin itself was not stopped. The saved
reading also does not require the application's service worker.

The [upgrade receipt](circle-publication/upgrade.json) uses the actual previous
Pages files on a local origin. A new source request was held while the new worker
installed; no readiness was shown prematurely. Replacing it with another valid
JPEG prevented source display, export and complete installation. Restoring the
correct bytes allowed recovery. The old course tab announced the changed
edition, its reload exposed the new companion, and both rooms remained usable
after the local origin destroyed its connections. Only the complete current
cache remained. These four upgrade runs are distinct from the public offline
checks above.

To repeat the public workflow after building the matching edition:

```sh
npm run test:circle -- /tmp/circle-public https://antonsoo.github.io/stoicheia/
```

To repeat the old-edition transition, supply a directory containing the earlier
`gh-pages` tree `43701ad43e1df203c850c0d9824a476f0ccad15f`:

```sh
npm run test:circle-upgrade -- /path/to/previous-static-tree /tmp/circle-upgrade.json
```

The browser receipt's large duplicate HTML/PDF paths describe that execution's
output directory. Representative portable files and print evidence remain in
the local review. GitHub Actions execution, physical printing and screen-reader
operation are not established by these publication checks.
