# /// script
# requires-python = ">=3.12"
# dependencies = ["pypdf==6.18.0"]
# ///
"""Inspect actual PDF content bindings, language, header scopes, figures and bookmarks.

Usage: uv run scripts/reading-pdf.py reading.pdf reading.html receipt.json
This is a bounded structural/content review, not a PDF/UA certification.
"""

import base64
import hashlib
import json
import pathlib
import sys
import unicodedata
from collections import Counter, defaultdict
from html.parser import HTMLParser

import pypdf
from pypdf import PageObject, PdfReader
from pypdf.generic import (
    ArrayObject,
    ByteStringObject,
    ContentStream,
    IndirectObject,
    NameObject,
    TextStringObject,
)


def compact(text):
    return "".join(unicodedata.normalize("NFKC", text).split()).replace("\u00ad", "")


class Expected(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.headings, self.fields, self.headers, self.figures = [], [], [], []
        self.capture = None
        self.language = None
        self.label_capture, self.labels = None, {}
        self.feed(text)
        for figure in self.figures:
            if "labelledby" in figure:
                figure["alt"] = " ".join(
                    self.labels[k].strip() for k in figure.pop("labelledby").split()
                )
            assert figure["alt"].strip(), "Empty figure description."
        assert self.fields and len(self.fields) % 3 == 0
        assert [f["lang"] for f in self.fields] == ["grc", "la", "en"] * (
            len(self.fields) // 3
        )
        assert self.headers and self.figures and self.language == "en"

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ["title", "desc"] and "id" in a:
            self.label_capture = [tag, a["id"], []]
        if tag == "html":
            self.language = a["lang"]
        if tag in ["h1", "h2", "h3", "h4", "h5", "h6"]:
            self.capture = [tag, "heading", a, []]
        elif tag == "th":
            self.capture = [tag, "header", a, []]
        elif tag == "p" and (
            a.get("lang") in ["grc", "la"]
            or a.get("class") in ["english", "sl-translation"]
        ):
            self.capture = [tag, "field", a, []]
        if tag == "br" and self.capture:
            self.capture[3].append(" ")
        if tag == "svg" and a.get("role") == "img":
            self.figures.append(
                {
                    "kind": "diagram",
                    **(
                        {"alt": a["aria-label"]}
                        if "aria-label" in a
                        else {"labelledby": a["aria-labelledby"]}
                    ),
                }
            )
        elif tag == "img":
            assert a["src"].startswith("data:image/jpeg;base64,"), (
                "Source image must be retained in the reading."
            )
            data = base64.b64decode(a["src"].split(",", 1)[1])
            self.figures.append(
                {
                    "kind": "image",
                    "alt": a["alt"],
                    "sha256": hashlib.sha256(data).hexdigest(),
                }
            )

    def handle_data(self, data):
        if self.label_capture:
            self.label_capture[2].append(data)
        if self.capture:
            self.capture[3].append(data)

    def handle_endtag(self, tag):
        if self.label_capture and self.label_capture[0] == tag:
            _, key, parts = self.label_capture
            assert key not in self.labels, "Duplicate figure label ID."
            self.labels[key] = "".join(parts)
            self.label_capture = None
        if self.capture and self.capture[0] == tag:
            _, kind, attrs, parts = self.capture
            text = "".join(parts)
            if kind == "heading":
                self.headings.append({"level": int(tag[1]), "text": text})
            elif kind == "header":
                assert attrs.get("scope") in ["col", "row"], (
                    f"Explicit HTML header scope required: {text}"
                )
                self.headers.append(
                    {
                        "text": text,
                        "scope": {"col": "/Column", "row": "/Row"}[attrs["scope"]],
                    }
                )
            else:
                self.fields.append(
                    {"text": text, "lang": attrs.get("lang", self.language)}
                )
            self.capture = None


if len(sys.argv) != 4:
    raise SystemExit(
        "Usage: uv run scripts/reading-pdf.py reading.pdf reading.html receipt.json"
    )
pdf, html, output = map(pathlib.Path, sys.argv[1:4])
expected = Expected(html.read_text())
reader = PdfReader(pdf, strict=True)
root = reader.root_object
assert root.get("/MarkInfo", {}).get("/Marked"), "PDF does not declare marked content."
assert "/StructTreeRoot" in root, "PDF has no logical structure tree."
assert root.get("/Lang") == expected.language, (
    "Document language differs from the HTML."
)
page_numbers = {p.indirect_reference.idnum: i for i, p in enumerate(reader.pages)}


def obj(value):
    return value.get_object() if hasattr(value, "get_object") else value


def ref(value):
    value = (
        value
        if isinstance(value, IndirectObject)
        else getattr(value, "indirect_reference", None)
    )
    return (value.idnum, value.generation) if value else None


nodes, languages, parents = [], {}, {}


def walk(value, language=expected.language, parent=None):
    value = obj(value)
    if isinstance(value, list):
        for child in value:
            walk(child, language, parent)
    elif isinstance(value, dict):
        if "/S" in value:
            language = value.get("/Lang", language)
            nodes.append(value)
            languages[id(value)] = language
            parents[id(value)] = parent
            parent = value
        if "/K" in value:
            walk(value["/K"], language, parent)


walk(root["/StructTreeRoot"])
counts = Counter(str(n["/S"]) for n in nodes)
assert counts["/Document"] == 1 and counts["/H1"] == 1


def descendants(value):
    value = obj(value)
    if isinstance(value, list):
        return [node for child in value for node in descendants(child)]
    if isinstance(value, dict):
        return ([value] if "/S" in value else []) + descendants(value.get("/K", []))
    return []


def marks(value, page=None):
    value = obj(value)
    if isinstance(value, int):
        assert page is not None, "A marked-content reference has no page."
        return [(page_numbers[page.idnum], int(value))]
    if isinstance(value, list):
        return [mark for child in value for mark in marks(child, page)]
    if isinstance(value, dict):
        page = value.get("/Pg", page)
        if "/MCID" in value:
            assert page is not None
            return [(page_numbers[page.idnum], int(value["/MCID"]))]
        return marks(value.get("/K", []), page)
    return []


number_tree = {}


def read_numbers(value):
    value = obj(value)
    pairs = value.get("/Nums", [])
    assert len(pairs) % 2 == 0
    for i in range(0, len(pairs), 2):
        assert int(pairs[i]) not in number_tree
        number_tree[int(pairs[i])] = obj(pairs[i + 1])
    for child in value.get("/Kids", []):
        read_numbers(child)


read_numbers(root["/StructTreeRoot"]["/ParentTree"])
operations = {}
page_mcids = {}
for i, page in enumerate(reader.pages):
    ops = page.get_contents().operations
    stack, indexed, seen = [], [], set()
    for args, op in ops:
        if op == b"BDC":
            properties = obj(args[1])
            if not isinstance(properties, dict):
                properties = obj(page["/Resources"]["/Properties"][properties])
            mid = properties.get("/MCID")
            stack.append(mid)
            if mid is not None:
                seen.add(int(mid))
        elif op == b"BMC":
            stack.append(None)
        active = set(stack) - {None}
        indexed.append((args, op, active))
        if op == b"EMC":
            assert stack, "Unbalanced marked-content sequence."
            stack.pop()
    assert not stack
    operations[i], page_mcids[i] = indexed, seen


def checked_marks(node):
    bindings = marks(node)
    assert bindings, f"Structure element has no actual page content: {node.get('/S')}"
    ids = {ref(n) for n in descendants(node)} - {None}
    for page, mid in bindings:
        assert mid in page_mcids[page], "A tag points to nonexistent marked content."
        reverse = number_tree[int(reader.pages[page]["/StructParents"])]
        assert 0 <= mid < len(reverse) and ref(reverse[mid]) in ids, (
            "ParentTree does not point back to this structure subtree."
        )
    return bindings


def raw_text(value):
    # ContentStream reserialization must preserve original glyph-code bytes.
    # Re-encoding a TextStringObject as ordinary PDF text corrupts subset CIDs.
    if isinstance(value, TextStringObject):
        return ByteStringObject(value.original_bytes)
    if isinstance(value, list):
        return ArrayObject([raw_text(child) for child in value])
    return value


text_cache = {}


def text_for(node):
    key = id(node)
    if key in text_cache:
        return text_cache[key]
    groups = defaultdict(set)
    for page, mid in checked_marks(node):
        groups[page].add(mid)
    result = []
    for index, mids in sorted(groups.items()):
        page = reader.pages[index]
        stream = ContentStream(page["/Contents"], reader)
        kept = []
        for args, op, active in operations[index]:
            if op in [b"Tj", b"TJ", b"'", b'"']:
                if not active.intersection(mids):
                    continue
                args = [raw_text(a) for a in args]
            kept.append((args, op))
        stream.operations = kept
        copy = PageObject(pdf=reader)
        copy.update(page)
        copy[NameObject("/Contents")] = stream
        result.append(copy.extract_text())
    text_cache[key] = "\n".join(result)
    return text_cache[key]


bindings, previous = [], -1
for field in expected.fields:
    candidates = [
        (i, n)
        for i, n in enumerate(nodes)
        if i > previous and n["/S"] == "/P" and languages[id(n)] == field["lang"]
    ]
    found = next(
        (
            (i, n)
            for i, n in candidates
            if compact(text_for(n)) == compact(field["text"])
        ),
        None,
    )
    assert found, (
        f"No correctly ordered {field['lang']} paragraph bound to the full text: {field['text'][:80]}"
    )
    previous, node = found
    bindings.append(
        {
            "language": field["lang"],
            "text": field["text"],
            "pageContent": [{"page": p + 1, "mcid": m} for p, m in marks(node)],
        }
    )

headers = [n for n in nodes if n["/S"] == "/TH"]
assert len(headers) == len(expected.headers), "Header count differs from the HTML."
header_receipts = []
for node, header in zip(headers, expected.headers):
    attrs = obj(node.get("/A", []))
    if isinstance(attrs, dict):
        attrs = [attrs]
    scopes = {
        obj(a).get("/Scope")
        for a in attrs
        if obj(a).get("/O") == "/Table" and "/Scope" in obj(a)
    }
    assert scopes == {header["scope"]}, (
        f"Wrong PDF table header scope for {header['text']}."
    )
    text = compact(text_for(node))
    assert text == compact(header["text"]), (
        f"Header content differs or repeats: {header['text']} / {text}"
    )
    header_receipts.append(header)

figures = [
    n
    for n in nodes
    if n["/S"] == "/Figure"
    and not any(c["/S"] == "/Figure" for c in descendants(n.get("/K", [])))
]
assert len(figures) == len(expected.figures), (
    "Leaf figure count differs from actual HTML images and diagrams."
)
figure_receipts = []
for node, figure in zip(figures, expected.figures):
    assert node.get("/Alt") == figure["alt"], (
        "A leaf figure has lost or changed its description."
    )
    actual = checked_marks(node)
    image_hashes = []
    if figure["kind"] == "image":
        for page, mid in actual:
            for args, op, active in operations[page]:
                if op == b"Do" and mid in active:
                    resource = reader.pages[page]["/Resources"]["/XObject"][args[0]]
                    if resource.get("/Subtype") == "/Image":
                        image_hashes.append(
                            hashlib.sha256(resource.get_data()).hexdigest()
                        )
        assert image_hashes == [figure["sha256"]], (
            "The figure description is bound to different source-image bytes."
        )
    figure_receipts.append(
        {
            **figure,
            "pageContent": [{"page": p + 1, "mcid": m} for p, m in actual],
            "boundImageHashes": image_hashes,
        }
    )

headings = [n for n in nodes if str(n["/S"]) in {f"/H{i}" for i in range(1, 7)}]
assert len(headings) == len(expected.headings)
for node, heading in zip(headings, expected.headings):
    assert node["/S"] == f"/H{heading['level']}" and compact(text_for(node)) == compact(
        heading["text"]
    )


def outline(items, depth=1):
    result = []
    for item in items:
        if isinstance(item, list):
            result.extend(outline(item, depth + 1))
        else:
            result.append((depth, item))
    return result


bookmarks = outline(reader.outline)
assert len(bookmarks) == len(headings), "Not every heading has a bookmark."
bookmark_receipts = []
for (depth, bookmark), node, heading in zip(bookmarks, headings, expected.headings):
    assert depth == heading["level"]
    assert " ".join(str(bookmark["/Title"]).split()) == " ".join(
        heading["text"].split()
    ), f"Bookmark word boundaries differ: {bookmark['/Title']!r} / {heading['text']!r}"
    page = reader.get_destination_page_number(bookmark)
    assert page in {p for p, _ in marks(node)}, (
        "A bookmark points to a page without its heading's content."
    )
    assert bookmark.dest_array[1] == "/XYZ"
    top = float(bookmark.dest_array[3])
    assert 0 <= top <= float(reader.pages[page].mediabox.height)
    bookmark_receipts.append(
        {
            "level": depth,
            "title": str(bookmark["/Title"]),
            "page": page + 1,
            "topPoints": top,
        }
    )

result = {
    "pdf": pdf.name,
    "pdfSha256": hashlib.sha256(pdf.read_bytes()).hexdigest(),
    "htmlSha256": hashlib.sha256(html.read_bytes()).hexdigest(),
    "parser": f"pypdf {pypdf.__version__}",
    "pages": len(reader.pages),
    "documentLanguage": root["/Lang"],
    "structureCounts": dict(counts),
    "boundReadingFields": bindings,
    "scopedTableHeaders": header_receipts,
    "leafFigures": figure_receipts,
    "bookmarks": bookmark_receipts,
    "limits": [
        "Structure and content audit only; no screen-reader playback or PDF/UA certification",
        "Whole historical page images remain facsimiles; selected passages are transcribed in the reading",
        "Inline word-note language changes can depend on the PDF producer and reader",
    ],
}
output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
print(
    json.dumps(
        {
            "pages": result["pages"],
            "languageBoundFields": len(bindings),
            "scopedHeaders": len(headers),
            "describedLeafFigures": len(figures),
            "originalImagesBoundToDescriptions": sum(
                f["kind"] == "image" for f in expected.figures
            ),
            "headingBookmarks": len(bookmarks),
        },
        indent=2,
    )
)
