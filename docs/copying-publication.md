# I.22–23 course publication

The reviewed runtime is source `5c7e194`. Its independent Node 24.22 build
reproduces all 128 output files / 31,026,680 bytes exactly.
[Build identities](copying-review/build.json) · [Source and model review](copying-review.md).

Both Chromium 153.0.8010.12 and Firefox 155.0 replayed the complete course at
1440 and 375px: 189 reading steps, all 46 exercises, the foundations, source
navigation through p.57, actual downloads and origin-disabled offline reloads.
[Chromium](copying-review/course-chromium.json) · [Firefox](copying-review/course-firefox.json).
Historical example files produced by these programs were confined to the
temporary review clone; the retained examples for this change have new names.

The [new-lesson review](copying-review/browser.json),
[source fault review](copying-review/integrity.json),
[reordered-response review](copying-review/source-race.json) and
[real prior-edition upgrades](copying-review/upgrade.json) verify distinct
reading, source, native-file and worker behavior. The independent numerical
and actual SVG-coordinate checks are linked from the source review.

The Pages branch is prepared by overlaying the reviewed output on the existing
branch, retaining older hashed assets. Source push, Pages push, hosted-file
identity and public browser verification are separate boundaries. Publication
receipts will be added here after each public boundary is verified; no CI or
registry release result is implied by these local checks.
