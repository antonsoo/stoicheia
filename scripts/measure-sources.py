"""Reproduce the twelve full-page images from the identified source PDF."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import urllib.request


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf", type=Path, help="Use an existing original PDF rather than downloading it")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    manifest = json.loads((root / "public/sources/measure/manifest.json").read_text())
    with tempfile.TemporaryDirectory(prefix="stoicheia-measure-") as directory:
        tmp = Path(directory)
        if args.pdf:
            data = args.pdf.read_bytes()
        else:
            with urllib.request.urlopen(manifest["download"]["url"], timeout=60) as response:
                data = response.read()
        assert len(data) == manifest["download"]["bytes"]
        assert digest(data) == manifest["download"]["sha256"]
        pdf = tmp / "source.pdf"
        pdf.write_bytes(data)
        subprocess.run(["pdftoppm", "-f", "15", "-l", "26", "-scale-to", "1700", "-jpeg", "-jpegopt", "quality=88", str(pdf), str(tmp / "full")], check=True, capture_output=True)
        for page in manifest["pages"]:
            regenerated = (tmp / f"full-{page['pdf_page']:03}.jpg").read_bytes()
            retained = (root / "public/sources" / page["file"]).read_bytes()
            assert digest(regenerated) == digest(retained) == page["sha256"]
            assert len(regenerated) == page["bytes"]
        version = subprocess.run(["pdftoppm", "-v"], capture_output=True, text=True, check=True).stderr.splitlines()[0]
    print(json.dumps({"pdf_sha256": manifest["download"]["sha256"], "full_pages_reproduced": len(manifest["pages"]), "renderer": version, "status": "all retained pages byte-identical to independent regeneration"}, indent=2))


if __name__ == "__main__":
    main()
