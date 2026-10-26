#!/usr/bin/env python3
"""Check the real browser-printed study, including text order and page margins."""
import argparse
import json
from pathlib import Path
import re
import subprocess
import unicodedata
import xml.etree.ElementTree as ET

parser = argparse.ArgumentParser()
parser.add_argument('pdf', type=Path)
args = parser.parse_args()
info = subprocess.check_output(['pdfinfo', str(args.pdf)], text=True)
text = subprocess.check_output(['pdftotext', str(args.pdf), '-'], text=True)
normalize = lambda s: re.sub(r'\s+', '', unicodedata.normalize('NFC', s))
flat = normalize(text)
passages = json.loads(subprocess.check_output([
    'node', '--import', 'tsx', '--input-type=module', '-e',
    "import {quadratrixPassages} from './src/content/quadratrix.ts';console.log(JSON.stringify(quadratrixPassages))"
], text=True))
positions = []
for p in passages:
    for language in ['greek', 'latin']:
        needle = normalize(p[language])
        assert needle in flat, (p['title'], language, 'Complete passage missing from PDF text')
        positions.append(flat.index(needle))
assert positions == sorted(positions), 'Printed Greek and Latin must remain sequential'
for page in range(250, 260):
    assert normalize(f'Printed p.{page} · PDF p.{page+33}') in flat
assert 'Notunique·coincidentlines' in flat
assert 'H=(2/π,0)' in flat
assert re.search(r'JavaScript:\s+no', info)
bbox = ET.fromstring(subprocess.check_output(['pdftotext', '-bbox-layout', str(args.pdf), '-']))
ns = {'h': 'http://www.w3.org/1999/xhtml'}
words = 0
for page in bbox.findall('.//h:page', ns):
    width, height = float(page.attrib['width']), float(page.attrib['height'])
    for word in page.findall('.//h:word', ns):
        assert 25 <= float(word.attrib['xMin']) <= float(word.attrib['xMax']) <= width-25, word.text
        assert 25 <= float(word.attrib['yMin']) <= float(word.attrib['yMax']) <= height-25, word.text
        words += 1
fonts = subprocess.check_output(['pdffonts', str(args.pdf)], text=True).splitlines()[2:]
for font in fonts:
    flags = re.search(r'\s(yes|no)\s+(yes|no)\s+(yes|no)\s+\d+\s+\d+\s*$', font)
    assert flags and flags.group(1) == 'yes', font
print(json.dumps({'pages': int(re.search(r'Pages:\s+(\d+)', info).group(1)),
                  'completeLanguagePassagesInOrder': len(positions), 'sourceCaptions': 10,
                  'textWordsInside25ptMargins': words, 'embeddedFonts': len(fonts),
                  'pdfJavaScript': False, 'physicalPrinting': 'not tested',
                  'taggedPdfAccessibility': 'not established', 'status': 'passed'}, indent=2))
