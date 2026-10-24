# /// script
# requires-python = ">=3.11"
# dependencies = ["pymupdf==1.28.2"]
# ///
"""Inspect actual Chromium exports; no physical printer/assembly claim."""
import hashlib
import json
from pathlib import Path
import sys
import pymupdf

folder = Path(sys.argv[1])
root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / "public/sources/mesolabe/manifest.json").read_text())
paper = pymupdf.open(folder / "paper.pdf")
assert len(paper) == 1
bars = []
for drawing in paper[0].get_drawings():
    for item in drawing["items"]:
        if item[0] == "l":
            a, b = item[1:]
            length = abs(b.x - a.x) * 25.4 / 72
            if abs(b.y - a.y) < 0.01 and abs(length - 25) < 0.1:
                bars.append(length)
assert len(bars) == 1
book = pymupdf.open(folder / "reading.pdf")
source_pages = [p for p in book if p.get_images()]
assert len(source_pages) == 12
images = []
for page, identity in zip(source_pages, manifest["pages"]):
    assert len(page.get_images()) == 1
    jpeg = book.extract_image(page.get_images()[0][0])["image"]
    assert hashlib.sha256(jpeg).hexdigest() == identity["sha256"]
    text = page.get_text()
    assert f"printed p.{identity['printed_page']}" in text
    assert identity["sha256"] in text, "Caption must remain on the same sheet"
    images.append({"pdf_page": page.number + 1, "source_printed_page": identity["printed_page"], "original_jpeg_preserved": True, "caption_on_same_sheet": True})
assert not any(not p.get_text().strip() and not p.get_images() for p in book)
report = {
    "pdf_engine": f"PyMuPDF {pymupdf.__version__}",
    "reading_pages": len(book),
    "source_images": images,
    "paper_pages": len(paper),
    "paper_page_points": list(paper[0].rect),
    "calibration_bar_mm_in_chromium_pdf": bars[0],
    "calibration_bar_mm_in_svg": 25,
    "physical_printing_and_assembly": "Unverified. Browser PDF rounding is separate from exact SVG units.",
    "sha256": {name: hashlib.sha256((folder / name).read_bytes()).hexdigest() for name in ["reading.html", "reading.pdf", "paper.svg", "paper.pdf"]},
}
print(json.dumps(report, indent=2))
