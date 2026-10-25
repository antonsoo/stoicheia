#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile
p=argparse.ArgumentParser();p.add_argument('pdf',type=Path);p.add_argument('--lesson',type=int,choices=[22,23],required=True);a=p.parse_args()
pages=[4,5,8,9,52,53,54,55] if a.lesson==22 else [8,9,54,55,56,57]
expected=18 if a.lesson==22 else 12
info=subprocess.check_output(['pdfinfo',str(a.pdf)],text=True);count=int(re.search(r'^Pages:\s+(\d+)',info,re.M)[1]);assert count==expected,(count,expected)
text=subprocess.check_output(['pdftotext','-layout',str(a.pdf),'-'],text=True)
for phrase in (['I.22','all three','triangle'] if a.lesson==22 else ['I.23','arbitrary','quaelibet','I.22','I.8','angle']):assert phrase in text,phrase
m=json.loads(Path('public/sources/manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='copying-pdf-')as tmp:
 subprocess.run(['pdfimages','-j',str(a.pdf),str(Path(tmp)/'image')],check=True)
 hashes={hashlib.sha256(f.read_bytes()).hexdigest()for f in Path(tmp).iterdir()}
 for n in pages:assert next(p['sha256']for p in m['pages']if p['printed_page']==n)in hashes,n
print(f'I.{a.lesson}: {count} actual PDF pages; {len(pages)} original JPEGs recovered byte for byte; proof and language text retained.')
