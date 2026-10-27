# /// script
# requires-python = ">=3.12"
# dependencies = ["pypdf==6.18.0"]
# ///
"""Deliberately corrupt copies of a real retained PDF; require specific refusals.

Usage: uv run scripts/reading-pdf-faults.py reading.pdf reading.html receipt.json
No input document is changed. This checks the companion reading-pdf.py auditor.
"""

import hashlib
import json
import pathlib
import subprocess
import sys
import tempfile

from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, NameObject, TextStringObject


def nodes(value):
    value = value.get_object() if hasattr(value, "get_object") else value
    if isinstance(value, list):
        return [node for child in value for node in nodes(child)]
    if isinstance(value, dict):
        return ([value] if "/S" in value else []) + nodes(value.get("/K", []))
    return []


def wrong_languages(writer):
    structure = nodes(writer.root_object["/StructTreeRoot"])
    greek = next(
        n for n in structure if n.get("/S") == "/P" and n.get("/Lang") == "grc"
    )
    latin = next(n for n in structure if n.get("/S") == "/P" and n.get("/Lang") == "la")
    greek[NameObject("/Lang")], latin[NameObject("/Lang")] = (
        TextStringObject("la"),
        TextStringObject("grc"),
    )


def wrong_images(writer):
    images = []
    for page in writer.pages:
        resources = page["/Resources"].get("/XObject", {})
        resources = (
            resources.get_object() if hasattr(resources, "get_object") else resources
        )
        for key, value in resources.items():
            if value.get_object().get("/Subtype") == "/Image":
                images.append((resources, key, value))
    assert len(images) >= 2
    first, second = images[:2]
    first[0][first[1]], second[0][second[1]] = second[2], first[2]


def missing_scope(writer):
    header = next(
        n for n in nodes(writer.root_object["/StructTreeRoot"]) if n.get("/S") == "/TH"
    )
    attrs = header["/A"]
    attrs = [attrs] if isinstance(attrs, dict) else attrs
    removed = False
    for entry in attrs:
        entry = entry.get_object()
        if entry.get("/O") == "/Table" and "/Scope" in entry:
            del entry["/Scope"]
            removed = True
    assert removed


def missing_description(writer):
    figure = next(
        n
        for n in nodes(writer.root_object["/StructTreeRoot"])
        if n.get("/S") == "/Figure" and "/Alt" in n
    )
    del figure["/Alt"]


def wrong_bookmark(writer):
    first = writer.root_object["/Outlines"]["/First"]
    action = first.get("/A", first)
    action = action.get_object() if hasattr(action, "get_object") else action
    key = "/D" if "/A" in first else "/Dest"
    dest = action[key]
    assert dest[1] == "/XYZ"
    action[NameObject(key)] = ArrayObject(
        [writer.pages[-1].indirect_reference, *dest[1:]]
    )


def missing_structure(writer):
    del writer.root_object["/StructTreeRoot"]


if len(sys.argv) != 4:
    raise SystemExit(
        "Usage: uv run scripts/reading-pdf-faults.py reading.pdf reading.html receipt.json"
    )
pdf, html, output = map(pathlib.Path, sys.argv[1:])
audit = pathlib.Path(__file__).with_name("reading-pdf.py")
results = []
with tempfile.TemporaryDirectory() as folder:
    folder = pathlib.Path(folder)
    # Positive control: a parser exception alone must not count as a fault refusal.
    control = subprocess.run(
        [sys.executable, str(audit), str(pdf), str(html), str(folder / "control.json")],
        text=True,
        capture_output=True,
        check=False,
    )
    assert control.returncode == 0, control.stderr
    for name, mutate, reason in [
        (
            "swapped-language-tags",
            wrong_languages,
            "No correctly ordered grc paragraph",
        ),
        ("swapped-source-image-bytes", wrong_images, "different source-image bytes"),
        ("missing-table-header-scope", missing_scope, "Wrong PDF table header scope"),
        (
            "missing-figure-description",
            missing_description,
            "lost or changed its description",
        ),
        ("wrong-bookmark-page", wrong_bookmark, "page without its heading"),
        (
            "marked-flag-without-structure",
            missing_structure,
            "no logical structure tree",
        ),
    ]:
        writer = PdfWriter()
        writer.clone_document_from_reader(PdfReader(pdf, strict=True))
        mutate(writer)
        changed = folder / f"{name}.pdf"
        with changed.open("wb") as target:
            writer.write(target)
        check = subprocess.run(
            [
                sys.executable,
                str(audit),
                str(changed),
                str(html),
                str(folder / f"{name}.json"),
            ],
            text=True,
            capture_output=True,
            check=False,
        )
        assert check.returncode != 0 and reason in check.stderr, (
            f"{name}: {check.stdout}\n{check.stderr[-1800:]}"
        )
        results.append(
            {
                "fault": name,
                "rejected": True,
                "reason": check.stderr.splitlines()[-1],
                "changedPdfSha256": hashlib.sha256(changed.read_bytes()).hexdigest(),
            }
        )
result = {
    "originalPdfSha256": hashlib.sha256(pdf.read_bytes()).hexdigest(),
    "positiveControl": True,
    "faults": results,
}
output.write_text(json.dumps(result, indent=2) + "\n")
print(
    json.dumps(
        {"positiveControl": True, "specificFaultRefusals": len(results)}, indent=2
    )
)
