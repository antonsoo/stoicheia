"""Reproduce the twelve full source images from the identified original PDF.

Use --pdf to avoid downloading the 15 MB source again. Requires pdftoppm.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import urllib.request

parser = argparse.ArgumentParser()
parser.add_argument("--pdf", type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / "public/sources/mesolabe/manifest.json").read_text())
with tempfile.TemporaryDirectory(prefix="mesolabe-source-") as scratch:
    folder = Path(scratch)
    pdf = args.pdf or folder / "source.pdf"
    if args.pdf is None:
        with urllib.request.urlopen(manifest["download"]["url"], timeout=45) as response:
            pdf.write_bytes(response.read())
    data = pdf.read_bytes()
    assert len(data) == manifest["download"]["bytes"]
    assert hashlib.sha256(data).hexdigest() == manifest["download"]["sha256"]
    subprocess.run([
        "pdftoppm", "-f", "202", "-l", "213", "-scale-to", "1600",
        "-jpeg", "-jpegopt", "quality=88", str(pdf), str(folder / "page"),
    ], check=True)
    checks = []
    for page in manifest["pages"]:
        rendered = (folder / f"page-{page['pdf_page']}.jpg").read_bytes()
        bundled = (root / "public/sources" / page["file"]).read_bytes()
        assert rendered == bundled
        assert len(bundled) == page["bytes"]
        assert hashlib.sha256(bundled).hexdigest() == page["sha256"]
        checks.append({"printed_page": page["printed_page"], "pdf_page": page["pdf_page"], "sha256": page["sha256"], "exact_render_match": True})
    print(json.dumps({"source_pdf_sha256": manifest["download"]["sha256"], "source_pdf_bytes": len(data), "edition": "Heiberg 1881 III; title inspected visually at source PDF page 5", "pages": checks, "scope": "Source file and rendering identity; transcription and historical interpretation require visual review."}, indent=2))
