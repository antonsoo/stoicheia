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
manifest = json.loads((root / "public/sources/horn/manifest.json").read_text())
with tempfile.TemporaryDirectory(prefix="horn-print-") as directory:
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
    assert len(scans) == 6
    for scan, expected in zip(scans, manifest["pages"], strict=True):
        assert hashlib.sha256(scan.read_bytes()).hexdigest() == expected["sha256"]
    fonts = command("pdffonts", str(args.pdf))
    assert "NotoSerif-Regular" in fonts
    assert all("yes yes yes" in line for line in fonts.splitlines()[2:])
    text = command("pdftotext", str(args.pdf), "-")
    import unicodedata
    normalize = lambda value: "".join(unicodedata.normalize("NFKC", value).split())
    readings = json.loads(command("node", "--import", "tsx", "--input-type=module", "-e", "import {hornPassages} from './src/content/horn.ts';console.log(JSON.stringify(hornPassages))"))
    fields = []
    for passage in readings:
        fields += [passage[key] for key in ('title','greek','latin','latinRole','english','note')]
        fields += [word[key] for word in passage['words'] for key in ('greek','latin','english')]
    fields.append((root/'LICENSE').read_text())
    for field in fields:
        assert normalize(field) in normalize(text), field
    assert normalize('1/1000000000001') in normalize(text)

    assert "JavaScript:      no" in command("pdfinfo", str(args.pdf))
    print(json.dumps({"scope": "Actual Chromium PDF; physical printing and tagged-PDF accessibility unverified", "pages": len(pages), "words_within_page_bounds": words, "byte_identical_source_images": len(scans), "embedded_fonts": len(fonts.splitlines()[2:]), "complete_reading_fields_and_mit_notice": len(fields), "bytes": args.pdf.stat().st_size, "sha256": hashlib.sha256(args.pdf.read_bytes()).hexdigest()}, indent=2))
