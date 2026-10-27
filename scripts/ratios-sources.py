"""Reproduce each complete source image from the pinned 1884 PDF."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import urllib.request


def digest(b):
    return hashlib.sha256(b).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pdf", type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    manifest = json.loads((root / "public/sources/ratios/manifest.json").read_text())
    if args.pdf:
        data = args.pdf.read_bytes()
    else:
        with urllib.request.urlopen(manifest["download"]["url"], timeout=90) as response:
            data = response.read()
    assert len(data) == manifest["download"]["bytes"]
    assert digest(data) == manifest["download"]["sha256"]
    with tempfile.TemporaryDirectory(prefix="stoicheia-ratios-") as directory:
        tmp = Path(directory)
        pdf = tmp / "source.pdf"
        pdf.write_bytes(data)
        for source in manifest["pages"]:
            prefix = tmp / f"page-{source['pdf_page']}"
            subprocess.run(["pdftoppm", "-f", str(source["pdf_page"]), "-l", str(source["pdf_page"]),
                            "-scale-to", str(source["height"]), "-singlefile", "-jpeg", "-jpegopt", "quality=88",
                            str(pdf), str(prefix)], check=True, capture_output=True)
            regenerated = prefix.with_suffix(".jpg").read_bytes()
            retained = (root / "public/sources" / source["file"]).read_bytes()
            assert len(regenerated) == len(retained) == source["bytes"]
            assert digest(regenerated) == digest(retained) == source["sha256"]
    print(json.dumps({"pages_reproduced": len(manifest["pages"]),
                      "pdf_sha256": manifest["download"]["sha256"],
                      "status": "Every retained complete page is byte-identical to regeneration from the pinned PDF."}, indent=2))


if __name__ == "__main__":
    main()
