# Reload a saved lesson through a stalled connection

A completed offline edition can reload a lesson when a connection accepts the
request but leaves it unanswered. The navigation worker gives the network a
two-second window, then reads that page from its own retained edition. URL
settings survive the native reload. Temporary server errors use the same saved
page without waiting for the deadline.

This needs an already saved page. The readiness gate still requires the matching
controller and complete source, font and application inventory. A first save
cannot become complete while required files are unavailable.

| Response or storage state               | Actual navigation behavior                            |
| --------------------------------------- | ----------------------------------------------------- |
| Fast successful online HTML             | Use the complete fresh response                       |
| No response headers                     | Abort after the network window; use the retained page |
| Successful headers, unfinished body     | Abort after the same window; use the retained page    |
| HTTP 503 with a retained page           | Use the retained page                                 |
| HTTP 503 without a retained page        | Keep the 503 response                                 |
| Explicit HTTP 404                       | Keep the 404 response                                 |
| Network unavailable, page retained      | Use the retained page                                 |
| Edition removed while the request waits | Supply no saved HTML; keep the removed cache absent   |

## Why the worker reads the cache again

The old navigation path only used its saved copy after `fetch()` rejected.
A connection that stayed open could leave the browser waiting indefinitely.
An HTTP 503 is a fulfilled fetch, so it replaced a usable saved lesson with the
server's error document.

The worker now races a complete successful HTML response against the deadline.
It reads a clone's body before returning the original response, so a server
cannot bypass the deadline merely by sending headers. Keeping the original
response preserves its URL and redirect metadata. An abort cancels the overdue
network request and the timer is cleared when it is no longer needed.

The fallback reads the exact edition cache again at the moment of use. It does
not keep returning an HTML snapshot if that edition was evicted or retired
while the network request was pending. Missing-cache lookups use `caches.match`
with a cache name; they do not recreate an empty retired cache or choose another
edition by its name. Explicit client-error responses retain their normal meaning.

The complete-edition install still verifies every file's SHA-256 through browser
subresource integrity. An altered source image cannot activate a complete new
edition. Fast online navigations do not write into the verified edition cache.

## Actual evidence

[Published-worker baseline](navigation-before.json) uses the clean source build
from [`acc572c1edda`](https://github.com/antonsoo/stoicheia/tree/acc572c1edda8e5eb5b8d94d9bf94b45f097eb88).
Both Chromium and Firefox failed to complete a native reload within the
3.5-second diagnostic window when headers or the body were held, despite having
the complete saved edition. A 503 displayed the error document. The diagnostic
window is where the observer stopped waiting, not a timeout implemented by the
old worker.

[The revised worker](navigation-after.json) completes both held-response cases
in both browsers, preserving the actual HTML bytes and URL settings. Its
SHA-256 is `b20715ffee553e45d8a359701ea9ed9962eae30545e0e92d6340def247ce8b19`. The receipt includes the complete 197-file
cache inventory for each context and the deliberately removed-cache result.

The companion browser driver uses a real local HTTP server and the actual
production worker. It holds a socket without headers, then a successful HTML
body after its first 32 bytes. It checks native navigation responses and original
HTML bytes, server-observed aborts, preserved settings, 503/404 behavior, a marked
fresh response and the unchanged saved HTML. It also removes the edition during
a held request and observes storage from a second origin-local tab.

These are local fault injections. Public delivery and ordinary hosted browser
work are recorded separately. The earlier
[structured PDF publication](solids-pdf-publication.md) retains its own edition
and source hashes; this worker change leaves the workshop's reading content and
native formats unchanged.

[Actual eleven-room to twelve-room upgrades](navigation-upgrade.json) also ran against this
same worker: both browsers, held source and substituted HTTP 200 source, existing
tab/controller transition and a genuinely unavailable local origin. All four
[saved upgrade readings](navigation-upgrade-artifacts.json) retain the original
source images, fonts, licenses and native outputs. The held-source and image
substitution checks remain separate from document-response fallback.

## Repeat the controlled check

```sh
npm ci
npm run check
node scripts/navigation-browser.mjs stoicheia dist /tmp/stoicheia-navigation.json
```

Playwright's Chromium and Firefox must already be available. The driver starts
and closes its own local HTTP origin. To reproduce the prior behavior, provide
the previous build directory and append `before` as the final argument. No
application source or remote service is modified by the fault scenarios.

The [Service Worker cache lookup specification](https://w3c.github.io/ServiceWorker/#cache-storage-match)
defines the named-cache lookup. The [Fetch standard](https://fetch.spec.whatwg.org/#fetch-method)
distinguishes the response promise and body processing; the actual browsers
above are the behavioral evidence for this implementation.
