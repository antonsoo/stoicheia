"""Inspect the actual Chromium PDF, including text bounds and exact scan images."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import xml.etree.ElementTree as ET


def command(*args):
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    manifest = json.loads((root / "public/sources/measure/manifest.json").read_text())
    with tempfile.TemporaryDirectory(prefix="stoicheia-print-") as directory:
        folder = Path(directory)
        bbox = folder / "words.html"
        command("pdftotext", "-bbox", str(args.pdf), str(bbox))
        document = ET.fromstring(bbox.read_text())
        pages = document.findall(".//{*}page")
        words = 0
        for page in pages:
            width, height = float(page.attrib["width"]), float(page.attrib["height"])
            for word in page.findall(".//{*}word"):
                x0, x1 = float(word.attrib["xMin"]), float(word.attrib["xMax"])
                y0, y1 = float(word.attrib["yMin"]), float(word.attrib["yMax"])
                assert 0 <= x0 <= x1 <= width and 0 <= y0 <= y1 <= height, word.text
                words += 1
        command("pdfimages", "-j", str(args.pdf), str(folder / "scan"))
        scans = sorted(folder.glob("scan-*.jpg"))
        assert len(scans) == 12
        for actual, expected in zip(scans, manifest["pages"], strict=True):
            assert hashlib.sha256(actual.read_bytes()).hexdigest() == expected["sha256"]
        fonts = command("pdffonts", str(args.pdf))
        assert "NotoSerif-Regular" in fonts
        lines = fonts.splitlines()[2:]
        assert all("yes yes yes" in line for line in lines)
        text = command("pdftotext", str(args.pdf), "-")
        for phrase in ["577", "408", "Never means never", "Heiberg", "Licenses"]:
            assert phrase in text
        info = command("pdfinfo", str(args.pdf))
        assert "JavaScript:      no" in info
    report = {"scope": "Actual generated PDF; text coordinates, embedded fonts and scan bytes. Physical printing and tagged-PDF accessibility unverified.", "pages": len(pages), "words_inside_page_bounds": words, "byte_identical_source_images": len(scans), "embedded_fonts": len(lines), "pdf_bytes": args.pdf.stat().st_size, "sha256": hashlib.sha256(args.pdf.read_bytes()).hexdigest()}
    rendered = json.dumps(report, indent=2) + "\n"
    if args.output:
        args.output.write_text(rendered)
    print(rendered, end="")


if __name__ == "__main__":
    main()
