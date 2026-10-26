"""Inspect the real saved-reading PDF: text bounds, source images and fonts."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import xml.etree.ElementTree as ET


def command(*args):
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("pdf", type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "public/sources/circle/manifest.json").read_text())
with tempfile.TemporaryDirectory(prefix="circle-print-") as directory:
    folder = Path(directory)
    command("pdftotext", "-bbox", str(args.pdf), str(folder / "text.html"))
    pages = ET.parse(folder / "text.html").findall(".//{*}page")
    words = 0
    for page in pages:
        width, height = float(page.get("width")), float(page.get("height"))
        for word in page.findall(".//{*}word"):
            x0, x1, y0, y1 = [float(word.get(key)) for key in ("xMin", "xMax", "yMin", "yMax")]
            assert 0 <= x0 <= x1 <= width and 0 <= y0 <= y1 <= height, word.text
            words += 1
    command("pdfimages", "-j", str(args.pdf), str(folder / "scan"))
    scans = sorted(folder.glob("scan-*.jpg"))
    assert len(scans) == 10
    for scan, expected in zip(scans, manifest["pages"], strict=True):
        assert hashlib.sha256(scan.read_bytes()).hexdigest() == expected["sha256"]
    fonts = command("pdffonts", str(args.pdf))
    assert "NotoSerif-Regular" in fonts
    assert all("yes yes yes" in line for line in fonts.splitlines()[2:])
    text = command("pdftotext", str(args.pdf), "-")
    for phrase in ("25344/8069", "29376/9347", "sphaerae", "265²", "Licenses", "περίμετρος"):
        assert phrase in text, phrase
    assert "JavaScript:      no" in command("pdfinfo", str(args.pdf))
    print(json.dumps({"scope": "Actual Chromium PDF; physical printing and tagged-PDF accessibility unverified", "pages": len(pages), "words_within_page_bounds": words, "byte_identical_source_images": len(scans), "embedded_fonts": len(fonts.splitlines()[2:]), "bytes": args.pdf.stat().st_size, "sha256": hashlib.sha256(args.pdf.read_bytes()).hexdigest()}, indent=2))
