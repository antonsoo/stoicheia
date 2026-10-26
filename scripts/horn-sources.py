#!/usr/bin/env python3
"""Reproduce six complete page reductions from the retained original PDF."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import urllib.request

parser = argparse.ArgumentParser()
parser.add_argument('--pdf', type=Path)
args = parser.parse_args()
manifest = json.loads(Path('public/sources/horn/manifest.json').read_text())
with tempfile.TemporaryDirectory() as tmp:
    root = Path(tmp)
    pdf = args.pdf or root/'euclid-I.pdf'
    if not args.pdf:
        urllib.request.urlretrieve(manifest['download']['url'], pdf)
    data = pdf.read_bytes()
    assert len(data) == manifest['download']['bytes']
    assert hashlib.sha256(data).hexdigest() == manifest['download']['sha256']
    for page in manifest['pages']:
        subprocess.run(['pdftoppm', '-f', str(page['pdfPage']), '-l', str(page['pdfPage']),
                        '-scale-to', '1800', '-jpeg', '-jpegopt', 'quality=88',
                        str(pdf), str(root/'page')], check=True, capture_output=True)
        actual = next(root.glob('page-*.jpg'))
        data = actual.read_bytes()
        assert len(data) == page['bytes'] and hashlib.sha256(data).hexdigest() == page['sha256']
        assert data == (Path('public/sources')/page['file']).read_bytes()
        actual.unlink()
    print(json.dumps({'pages': len(manifest['pages']), 'source_sha256': manifest['download']['sha256'],
                      'renderer': subprocess.check_output(['pdftoppm', '-v'], stderr=subprocess.STDOUT, text=True).splitlines()[0],
                      'status': 'passed'}, indent=2))
