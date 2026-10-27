# Public Book V workshop

On 2026-10-27 UTC, the owner authorized pushing and deployment. Source commit
`7082a2edabff8e6f9c24db82cc484bc9c5d4a7f8` and static commit `4f79b19`
were pushed. The live workshop is
[Euclid V: equimultiples](https://antonsoo.github.io/stoicheia/ratios.html).

| Boundary | Observed result |
| --- | --- |
| Remote source | Fresh HTTPS clone, Node 24.21.0, `npm ci`, lint, strict types, 95 tests and production build. All 177 build files match the independently reviewed checkout. |
| Canonical HTTPS bytes | All 177 paths, lengths and SHA-256 values match before and after the public browser matrix. Both inventories check the root again at the end. |
| Public operation | Chromium 153.0.8010.12 and Firefox 155.0, at 1440 and 375 pixels: actual exact-ratio operations, readings, five verified source images, keyboard, imports, sharing, history and native downloads. |
| Public offline use | Current controller and all 176 cache entries; browser networking disabled, reload, new comparison, another source and illustrated export. The remote origin was not stopped. |
| Native files | Independently parsed actual public downloads reproduce the exact comparison and bounded disagreement intervals. All four illustrated HTML downloads match the previously inspected local artifact, including image, font and license bytes. The PDF retains all 21 language passages and the source captions. |
| Authentic upgrade | Local replay of the actual previous ten-room public worker to this eleven-room edition, both engines, with valid and substituted source responses. Held source cannot produce readiness. Substitution refuses source display, export and readiness; a subsequent valid response recovers. The existing old tab reloads into the new edition. Final reload and a new trial work with the local origin disabled. |
| Visual review | All twelve public screenshots are byte-identical to inspected screenshots from the clean local review. |
| CI | Workflows are committed. A successful remote CI run is not established by this review. |

[Remote clean build](ratios-publication/remote-source.json) ·
[HTTPS before](ratios-publication/hosted-before.json) ·
[Public browser matrix](ratios-publication/browser.json) ·
[Native-file audit](ratios-publication/artifacts.json) ·
[HTTPS after](ratios-publication/hosted-after.json) ·
[Upgrade replay](ratios-publication/upgrade.json).

The Pages API reported the existing legacy `gh-pages` root configuration. The
static branch was advanced with an ordinary fast-forward commit retaining older
hashed assets; no force push or Pages configuration change was used. Retained
old hashed assets are outside this edition's 177-file canonical inventory.

To replay public behavior after building:

```sh
node scripts/ratios-browser.mjs /tmp/ratios-public https://antonsoo.github.io/stoicheia/
python3 scripts/ratios-artifacts.py /tmp/ratios-public
```

For upgrade checks, first archive the real previous static branch into a local
directory, then pass that directory to `scripts/ratios-upgrade.mjs`. The script
serves and faults both editions locally; it never modifies the public server.

The [model limits and local review](ratios-review.md) still apply. Public delivery
does not establish independent philological review or physical printer output.
