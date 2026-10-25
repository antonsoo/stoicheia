# Book X common-measure publication

The owner authorized pushing and continuing development on 2026-10-25. The
[common-measure room](https://antonsoo.github.io/stoicheia/measure.html) is now
public. This receipt is separate from its [initial local review](measure-review.md).

| Boundary               | Verified result                                                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Implemented source     | `187017e14c49cf55252e14efcf3fafd67815c3e3`; five reviewed commits pushed by fast-forward from `1855a95`                                        |
| Pages commit           | `50364ef74dc114a544a05375e96aa34765d1ca25`                                                                                                     |
| Pages status           | API reported `built`, updated 2026-10-25 10:45:11 UTC                                                                                          |
| Canonical hosted files | All 125 current files match the reviewed local build; directory index matches before and after; no query cache busting                         |
| Public workflows       | Chromium 153 and Firefox 155, 1440 and 375 px; controls, exact-zero comparison, source/history, native downloads and standalone files pass     |
| Offline scope          | Public browser networking disabled after complete installation. The public origin remains running. The separate local review stops its origin. |

[Every canonical file and SHA-256](measure-hosted-files.json) ·
[Public browser operations and downloaded-file identities](measure-hosted-browser.json).

The Pages update was a normal fast-forward commit on the existing branch.
Older hashed assets remain available to readers with an earlier entry page;
the current worker inventories only this edition's 124 cached files. The
worker itself is the 125th current build file. Legacy assets outside that
current inventory were not described as part of the new edition.

The public browser reviewer reopens the actual HTML downloads under `file:`
with networking disabled, checks all twelve embedded scan identities, and
downloads the embedded CSV. Its hosted offline claim is deliberately narrower
than the origin-disabled local review. No physical printing, philological peer
review or successful remote CI run is inferred from these operations.

To repeat the current-file and browser checks against an already built edition:

```sh
python3 scripts/measure-hosted.py https://antonsoo.github.io/stoicheia/ /tmp/measure-hosted-files.json
node scripts/measure-browser.mjs /tmp/measure-public https://antonsoo.github.io/stoicheia/
```

The browser script's optional second argument selects the public base. Its
local default still stops the local server for its stronger offline check.
