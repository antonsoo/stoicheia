"""Reproduce complete, unretouched Heiberg pages; verify before accepting source bytes."""

import hashlib
import json
import pathlib
import subprocess
import sys
import tempfile

pdf = pathlib.Path(sys.argv[1])
write = "--write" in sys.argv[2:]
root = pathlib.Path("public/sources/solids")
pages = [(0, 7), (4, 14), (5, 15)] + [(p, p + 10) for p in [54, 55, 56, 57, 58, 59, 336, 337, 338, 339, 340, 341]]
identity = {"bytes": pdf.stat().st_size, "sha256": hashlib.sha256(pdf.read_bytes()).hexdigest()}
manifest_path = root / "manifest.json"
previous = json.loads(manifest_path.read_text()) if manifest_path.exists() else None
if previous:
    assert identity == previous["pdfIdentity"], "The original PDF identity changed."
records = []
root.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory() as tmp:
    for printed, number in pages:
        stem = "heiberg-title" if printed == 0 else f"heiberg-{printed}"
        dest = pathlib.Path(tmp) / stem
        subprocess.run(["pdftoppm", "-f", str(number), "-l", str(number), "-singlefile", "-scale-to", "2200", "-jpeg", "-jpegopt", "quality=88", str(pdf), str(dest)], check=True, capture_output=True)
        data = dest.with_suffix(".jpg").read_bytes()
        target = root / (stem + ".jpg")
        if write:
            target.write_bytes(data)
        else:
            assert data == target.read_bytes(), str(target)
        records.append({"printedPage": printed, "pdfPage": number, "file": f"solids/{stem}.jpg", "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
manifest = {"edition": "J. L. Heiberg, Euclidis Elementa, volume IV, Leipzig: B. G. Teubner, 1885", "source": "https://archive.org/download/euclidisoperaomn04eucl/euclidisoperaomn04eucl.pdf", "rights": "Public-domain text and page images; complete pages, no cropping or retouching.", "pdfIdentity": identity, "render": "pdftoppm -singlefile -scale-to 2200 -jpeg -jpegopt quality=88; Poppler 24.02.0", "pages": records}
if write:
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
else:
    assert manifest == previous
print(json.dumps({"verifiedPages": len(records), "pdfIdentity": identity, "wrote": write}, indent=2))
