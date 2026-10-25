#!/usr/bin/env python3
"""Reproduce the two added pages from the identified original PDF."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile

pdf=Path(sys.argv[1])
m=json.loads(Path('public/sources/manifest.json').read_text())
b=pdf.read_bytes();assert len(b)==m['download']['bytes'];assert hashlib.sha256(b).hexdigest()==m['download']['sha256']
with tempfile.TemporaryDirectory(prefix='euclid-copying-') as tmp:
    for p in m['pages']:
        if p['printed_page'] not in [56,57]:continue
        out=Path(tmp)/str(p['printed_page'])
        subprocess.run(['pdftoppm','-f',str(p['pdf_page']),'-l',str(p['pdf_page']),'-singlefile','-scale-to','1550','-jpeg','-jpegopt','quality=88',str(pdf),str(out)],check=True)
        data=out.with_suffix('.jpg').read_bytes()
        assert data==(Path('public/sources')/p['file']).read_bytes()
        assert len(data)==p['bytes'] and hashlib.sha256(data).hexdigest()==p['sha256']
        print(f"Printed p.{p['printed_page']}: exact original PDF and reproduced JPEG match")
