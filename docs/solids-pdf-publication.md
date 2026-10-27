# Public structured reading verification

Checked 2026-10-27. This records the structured-reading edition after the initial
workshop publication. It is separate from the original receipts and from any
later worker or content edition.

| Boundary                         | Observed result                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Clean source build               | Node 24.21.0 / npm 11.19.0; [all 198 files reproduced](solids-pdf-clean-build.json)                                       |
| Canonical hosted build           | 198 of 198 files match; directory index before and after; no query cache-busting                                          |
| Complete hosted browser journeys | Chromium / Firefox, 1440 / 375 px; controls, sources, downloads, script-free native files, complete-cache offline reloads |
| Public discovery                 | Four catalogue search -> actual workshop -> pinned review journeys                                                        |
| Pinned retained files            | PDF, compressed HTML and both PDF-render PNGs match their source bytes                                                    |
| Actual hosted-export PDF         | 30 pages, 27 correctly bound main language paragraphs, 19 heading bookmarks                                               |
| Whole historical JPEGs           | 15 originals remain bound to their own descriptions                                                                       |
| Pages service                    | Branch build reports `built` for `8f7b8fe9836dc20b409bfba6f00b24b7232733be`                                               |
| Source workflows                 | CI and source Pages jobs report failure with empty step lists; these are not passing checks                               |

[Canonical file receipts](solids-pdf-hosted-files.json) ·
[Browser work](solids-pdf-hosted-browser.json) ·
[Native artifacts](solids-pdf-hosted-artifacts.json) ·
[Actual export structure](solids-pdf-hosted-structure.json) ·
[Pinned source artifact bytes](solids-pdf-hosted-retained.json) ·
[Catalogue journeys](solids-pdf-hosted-discovery.json) ·
[Separate deployment/workflow status](solids-pdf-hosted-delivery.json).

The runtime was deployed from source `e7126028947aeed6f8063ac5fb62c70a896524a2`. Source
synchronization and a Pages build are not substituted for browser operation or
hosted-file identity. The four public native readings are independently audited
against the source manifests, fonts, licenses and actual model outputs.

The committed PDF and decompressed HTML were downloaded from immutable raw
source URLs and inspected again. Their paragraph texts/languages, table scopes,
figure descriptions/original image identities, bookmark hierarchy and page
assignments match the new PDF generated from the public app. The bounded content
profile SHA-256 is `4c05db1b65ee6f9dab11f8c35bf23456645e599d62ba2221c2290566c8c5a7b1`. The PDFs have separate file hashes because a new
browser print has its own metadata; no byte-equivalence claim is made between
two separate print operations.

Two earlier hosted attempts stopped, first on a Firefox navigation timeout
and then while the first offline save was still pending after a minute. The
final receipt is a fresh complete four-configuration run. A separate request
trace observed two requests pending at ten seconds and a complete save at
twenty seconds; it does not establish the cause of the earlier timeouts. Local
fault-injection and public delivery claims remain separate.

The original page images remain facsimiles, with selected passages available
as structured text. PDF/UA certification, screen-reader playback, physical
printing and independent philological review remain unverified. See the
[structure review and repeatable commands](solids-pdf-review.md).
