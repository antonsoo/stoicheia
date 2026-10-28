"""Reproduce every retained whole page from the identified original PDF."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile

pdf = Path(sys.argv[1])
root = Path('public/sources')
manifest = json.loads((root/'areas/manifest.json').read_text())
assert pdf.stat().st_size == manifest['pdfBytes']
assert hashlib.sha256(pdf.read_bytes()).hexdigest() == manifest['pdfSha256']
with tempfile.TemporaryDirectory() as tmp:
    for page in manifest['pages']:
        target = Path(tmp)/'page'
        subprocess.run(['pdftoppm', '-f', str(page['pdfPage']), '-l', str(page['pdfPage']), '-singlefile', '-scale-to', '2000', '-jpeg', '-jpegopt', 'quality=88', str(pdf), str(target)], check=True, capture_output=True)
        b = target.with_suffix('.jpg').read_bytes()
        assert b == (root/page['file']).read_bytes()
        assert len(b) == page['bytes'] and hashlib.sha256(b).hexdigest() == page['sha256']
print(json.dumps({'wholePages': len(manifest['pages']), 'pdfSha256': manifest['pdfSha256'], 'status': 'reproduced byte for byte'}, indent=2))
