"""Reproduce all complete retained pages against the original PDF identity."""
import hashlib
import json
import pathlib
import subprocess
import sys
import tempfile

pdf=pathlib.Path(sys.argv[1])
root=pathlib.Path("public/sources")
manifest=json.loads((root/"primes/manifest.json").read_text())
assert pdf.stat().st_size==manifest["pdfBytes"]
assert hashlib.sha256(pdf.read_bytes()).hexdigest()==manifest["pdfSha256"]
with tempfile.TemporaryDirectory() as tmp:
    for page in manifest["pages"]:
        target=pathlib.Path(tmp)/"page"
        subprocess.run(["pdftoppm","-f",str(page["pdfPage"]),"-l",str(page["pdfPage"]),"-singlefile","-scale-to","2200","-jpeg","-jpegopt","quality=88",str(pdf),str(target)],check=True,capture_output=True)
        b=target.with_suffix(".jpg").read_bytes()
        assert len(b)==page["bytes"] and hashlib.sha256(b).hexdigest()==page["sha256"]
        assert b==(root/page["file"]).read_bytes()
print(json.dumps({"wholePagesVerified":len(manifest["pages"]),"pdfSha256":manifest["pdfSha256"],"originalBytes":manifest["pdfBytes"]},indent=2))
