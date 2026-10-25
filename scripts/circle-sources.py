"""Verify retained page identities and reproduce them from the identified volume."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import urllib.request


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--pdf", type=Path, help="Use this original PDF instead of downloading it")
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "public/sources/circle/manifest.json").read_text())
with tempfile.TemporaryDirectory(prefix="circle-source-") as directory:
    folder = Path(directory)
    pdf = args.pdf or folder / "volume.pdf"
    if not args.pdf:
        with urllib.request.urlopen(manifest["url"], timeout=90) as response:
            pdf.write_bytes(response.read(40000000))
    assert pdf.stat().st_size == manifest["pdfBytes"]
    assert hashlib.sha256(pdf.read_bytes()).hexdigest() == manifest["pdfSha256"]
    for page in manifest["pages"]:
        original = root / "public/sources" / page["file"]
        assert original.stat().st_size == page["bytes"]
        assert hashlib.sha256(original.read_bytes()).hexdigest() == page["sha256"]
        target = folder / f"page-{page['page']}"
        subprocess.run(["pdftoppm", "-f", str(page["pdfPage"]), "-l", str(page["pdfPage"]), "-scale-to", "1800", "-jpeg", "-jpegopt", "quality=85", "-singlefile", str(pdf), str(target)], check=True, capture_output=True)
        assert hashlib.sha256(target.with_suffix(".jpg").read_bytes()).hexdigest() == page["sha256"]
    print(json.dumps({"original_pdf_bytes": pdf.stat().st_size, "original_pdf_sha256": manifest["pdfSha256"], "complete_source_pages_reproduced": len(manifest["pages"]), "renderer": subprocess.run(["pdftoppm", "-v"], capture_output=True, text=True).stderr.splitlines()[0], "status": "passed"}, indent=2))
