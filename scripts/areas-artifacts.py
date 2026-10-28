"""Audit actual native downloads, exact area records, source bytes and PDF text."""
import base64
import csv
from fractions import Fraction as F
import hashlib
from html.parser import HTMLParser
import io
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unicodedata
import urllib.parse
import xml.etree.ElementTree as ET

root = Path.cwd()
out = Path(sys.argv[1])
manifest = json.loads((root/'public/sources/areas/manifest.json').read_text())

def decode(url):
    header, body = url.split(',', 1)
    return base64.b64decode(body) if ';base64' in header else urllib.parse.unquote_to_bytes(body)

class Reading(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.images = []; self.downloads = {}; self.text = []; self.fields = []; self.field = None
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        assert tag not in ['script', 'iframe', 'object']
        assert not any(k.startswith('on') for k in a)
        if tag == 'img': self.images.append(decode(a['src']))
        if 'download' in a: self.downloads[a['download']] = decode(a['href'])
        if tag == 'p' and (a.get('lang') in ['grc', 'la'] or a.get('class') == 'ar-english'):
            self.field = []
    def handle_endtag(self, tag):
        if tag == 'p' and self.field is not None:
            self.fields.append(''.join(self.field)); self.field = None
    def handle_data(self, data):
        self.text.append(data)
        if self.field is not None: self.field.append(data)

def audit(file):
    html = file.read_text(); r = Reading(html)
    assert len(r.images) == 15 and len(r.fields) == 27
    for image, p in zip(r.images, manifest['pages'], strict=True):
        assert image == (root/'public/sources'/p['file']).read_bytes()
    fonts = re.findall(r'data:font/ttf;base64,[A-Za-z0-9+/=]+', html)
    assert len(fonts) == 1 and decode(fonts[0]) == (root/'public/fonts/NotoSerif-Regular.ttf').read_bytes()
    for name in ['LICENSE', 'public/fonts/OFL.txt']:
        assert (root/name).read_text().strip() in ''.join(r.text)
    assert json.loads(r.downloads['stoicheia-areas-sources.json']) == manifest
    state = json.loads(r.downloads['stoicheia-areas.json'])['state']
    rows = list(csv.reader(io.StringIO(r.downloads['stoicheia-areas.csv'].decode())))
    assert rows[0] == ['quantity', 'exact_value', 'meaning']
    values = {r[0]: r[1] for r in rows[1:]}
    a, t, c = F(state['base']), F(state['trial']), F(state['target'])
    k = {'half': F(1, 2), 'equal': F(1), 'double': F(2)}[state['shape']]
    area = k*t*(a-t if state['mode']=='short' else a+t)
    assert F(values['trial_area']) == area and F(values['residual']) == area-c
    assert F(values['similar_area']) == k*t*t and F(values['half_line_area']) == k*a*a/4
    svg = ET.fromstring(r.downloads['stoicheia-areas.svg'])
    ns = {'s': 'http://www.w3.org/2000/svg'}
    assert not svg.findall('.//s:script', ns) and not svg.findall('.//s:foreignObject', ns)
    metadata = ''.join(svg.find('s:metadata', ns).itertext())
    for name in ['LICENSE', 'public/fonts/OFL.txt']:
        assert (root/name).read_text().strip() in metadata
    assert str(area) in ''.join(svg.find('s:desc', ns).itertext())
    return r

records = []
for engine in ['chromium', 'firefox']:
    for width in [1440, 375]:
        folder = out/f'{engine}-{width}'
        r = audit(folder/'reading.html')
        for ext, file in [('json', 'experiment.json'), ('csv', 'areas.csv'), ('svg', 'plate.svg')]:
            assert r.downloads[f'stoicheia-areas.{ext}'] == (folder/file).read_bytes()
        offline = audit(folder/'offline-reading.html')
        assert json.loads(offline.downloads['stoicheia-areas.json'])['state']['target'] == '45'
        records.append({'engine': engine, 'width': width, 'wholePagesIdentical': 15, 'readingsInThreeLanguages': 9, 'nativeFilesIdentical': 3, 'fontIdentical': True, 'fullLicensesInHtmlAndSvg': True, 'offlineImpossiblePremiseRetained': True})

pdf = out/'reading.pdf'
pdftext = subprocess.check_output(['pdftotext', '-layout', str(pdf), '-'], text=True)
normalize = lambda t: re.sub(r'\s+', '', unicodedata.normalize('NFKC', t)).replace('\u00ad', '')
reading = audit(out/'chromium-1440/reading.html')
for field in reading.fields:
    assert normalize(field) in normalize(pdftext), field[:90]
info = subprocess.check_output(['pdfinfo', str(pdf)], text=True)
pages = int(re.search(r'Pages:\s+(\d+)', info)[1])
with tempfile.TemporaryDirectory() as tmp:
    subprocess.run(['pdfimages', '-j', str(pdf), str(Path(tmp)/'scan')], check=True, capture_output=True)
    hashes = {hashlib.sha256(f.read_bytes()).hexdigest() for f in Path(tmp).glob('scan-*.jpg')}
    assert hashes == {p['sha256'] for p in manifest['pages']}
    bbox = Path(tmp)/'bbox.html'
    subprocess.run(['pdftotext', '-bbox', str(pdf), str(bbox)], check=True, capture_output=True)
    tree = ET.fromstring(bbox.read_text()); ns = {'x': 'http://www.w3.org/1999/xhtml'}
    for page in tree.findall('.//x:page', ns):
        w, h = float(page.attrib['width']), float(page.attrib['height'])
        for word in page.findall('.//x:word', ns):
            a = word.attrib
            assert 20 <= float(a['xMin']) <= float(a['xMax']) <= w-20, a
            assert 20 <= float(a['yMin']) <= float(a['yMax']) <= h-20, a
result = {'browserArtifacts': records, 'pdf': {'pages': pages, 'completeLanguageParagraphs': 27, 'wholeSourceJpegsByteIdentical': 15, 'textWithinCheckedMargins': True, 'taggedReportedByPdfinfo': bool(re.search(r'Tagged:\s+yes', info))}, 'boundary': 'Actual local downloads and PDF bytes. Physical print precision and PDF/UA certification are not claimed.'}
(out/'artifacts.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps(result, indent=2))
