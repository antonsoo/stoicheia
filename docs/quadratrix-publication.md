# Quadratrix publication

The [public workshop](https://antonsoo.github.io/stoicheia/quadratrix.html) was
checked on 2026-10-26 UTC after the owner explicitly authorized pushing.

| Boundary                   | Observation                                                                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source                     | `af1fa96a0df0025526296a7b75232b8b23266d5c`, including the public-browser replay                                                                                                                               |
| Static branch              | `0aa92ca`, a normal fast-forward deployment retaining older hashed assets                                                                                                                                     |
| Fresh remote source        | HTTPS clone, fresh dependencies, Node 24.21.0; lint, types, 91 tests and production build passed; all 167 output paths and bytes match the reviewed build                                                     |
| Canonical public responses | All 167 current build files match length and SHA-256 at canonical URLs, including entry-page aliases checked before and after the inventory                                                                   |
| Public browser journey     | Chromium 153.0.8010.12 and Firefox 155.0, each at 1440 and 375 pixels: course link, real controls, complete source identities, JSON import and rejection, SVG/CSV/HTML downloads, sharing and browser history |
| Public offline scope       | Browser networking disabled after complete current-edition caching; reload, another source page, new downloads and return through the course work without networking. The public server was not stopped.      |
| Actual saved data          | 196 CSV rows and 28 drawn states agree with independent 90-digit line calculations; four native illustrated HTML downloads are byte-identical to the retained example                                         |
| Actual public print        | 19 pages; all sixteen complete Greek/Latin passages in order, ten source captions, embedded fonts and text within checked margins                                                                             |

[Canonical file identities](quadratrix-publication/hosted-files.json) ·
[Four public journeys](quadratrix-publication/browser.json) ·
[Fresh remote build and saved readings](quadratrix-publication/remote-source.json) ·
[Downloaded geometry](quadratrix-publication/geometry.json) ·
[Public print](quadratrix-publication/print.json).

The [local review](quadratrix-review.md) records a separate check with its origin
actually stopped and a previous-edition upgrade. The public replay uses the
same controls and native-file checks against HTTPS. To reproduce it:

```sh
npm run test:quadratrix -- /tmp/quadratrix-public https://antonsoo.github.io/stoicheia/
python3 scripts/quadratrix-oracle.py --browser /tmp/quadratrix-public/review.json
python3 scripts/quadratrix-print.py /tmp/quadratrix-public/chromium-1440/reading.pdf
```

The retained CSVs also allow the public numerical record to be rechecked:

```sh
python3 scripts/quadratrix-oracle.py --browser docs/quadratrix-publication/browser.json
```

Documentation commits after the reviewed source do not change the production
inputs. Older retained deployment assets are outside the current inventory.
No successful GitHub Actions run, registry release, tagged-PDF accessibility,
physical printing or exact mechanical quadratrix instrument is claimed.
