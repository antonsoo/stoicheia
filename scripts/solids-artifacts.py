"""Inspect actual browser downloads: complete source bytes, exact CSV, native nets, and PDF text/margins."""

import base64
import csv
import hashlib
import io
import json
import math
import pathlib
import re
import subprocess
import sys
import tempfile
import unicodedata
import urllib.parse
import xml.etree.ElementTree as ET
from fractions import Fraction as F
from html.parser import HTMLParser

root = pathlib.Path.cwd()
out = pathlib.Path(sys.argv[1])
upgrade = "--upgrade" in sys.argv[2:]
review = json.loads(out.read_text()) if upgrade else json.loads((out / "review.json").read_text())
manifest = json.loads((root / "public/sources/solids/manifest.json").read_text())


def decode(url):
    head, body = url.split(",", 1)
    return base64.b64decode(body) if ";base64" in head else urllib.parse.unquote_to_bytes(body)


class Reading(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.images, self.downloads, self.fields, self.scripts, self.remote, self.handlers, self.text = [], {}, [], [], [], [], []
        self.field = None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "img":
            self.images.append(a["src"])
        if "download" in a:
            self.downloads[a["download"]] = decode(a["href"])
        if tag == "script":
            self.scripts.append(a)
        self.handlers.extend(k for k in a if k.startswith("on"))
        if tag in ["img", "link", "script", "iframe", "audio", "video"]:
            self.remote.extend(v for k, v in a.items() if k in ["src", "href"] and v.startswith(("http:", "https:")))
        if tag == "p" and (a.get("lang") in ["grc", "la"] or a.get("class") == "sl-translation"):
            self.field = []

    def handle_data(self, data):
        self.text.append(data)
        if self.field is not None:
            self.field.append(data)

    def handle_endtag(self, tag):
        if tag == "p" and self.field is not None:
            self.fields.append("".join(self.field))
            self.field = None


def audit_csv(body, settings):
    rows = list(csv.reader(io.StringIO(body.decode())))
    cases = [r for r in rows if r and r[0] in ["selected and enumerated", "enumerated, not a learner history"]]
    assert len(cases) == 70
    for scope, p, q, angle, total, deficit, kind in cases:
        p, q = int(p), int(q)
        a = F(180 * (p - 2), p)
        assert (F(angle), F(total), F(deficit)) == (a, a*q, 360-a*q)
        assert (scope == "selected and enumerated") == (p == settings["p"] and q == settings["q"])
        assert kind == ("too-few" if q < 3 else "flat" if a*q == 360 else "excess" if a*q > 360 else "candidate")
    vertices = [r for r in rows if r and r[0] == "bipyramid"]
    assert [int(r[2]) for r in vertices] == [3, 3, 4, 4, 4]
    assert [F(r[4]) for r in vertices] == [180, 180, 120, 120, 120]
    return {"exactCases": len(cases), "bipyramidVertices": len(vertices)}


def audit_sheet(body):
    svg = ET.fromstring(body)
    ns = {"s": "http://www.w3.org/2000/svg"}
    assert svg.attrib["width"] == "210mm" and svg.attrib["height"] == "297mm" and svg.attrib["viewBox"] == "0 0 210 297"
    license_text = "".join(svg.find("s:metadata", ns).itertext())
    assert (root / "LICENSE").read_text().strip() in license_text
    groups = [g for g in svg.findall(".//s:g", ns) if "transform" in g.attrib]
    assert len(groups) == 2
    measurements = []
    for g in groups:
        translation = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", g.attrib["transform"])]
        outer, inner = g.findall("s:path", ns)
        assert "stroke-dasharray" not in outer.attrib and inner.attrib["stroke-dasharray"] == "2 1.3"
        def points(path):
            values = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", path.attrib["d"])]
            return list(zip(values[::2], values[1::2]))
        a, b = points(outer), points(inner)
        assert len(a) == len(b) == 3
        outside = [math.dist(a[i], a[(i+1)%3]) for i in range(3)]
        inside = [math.dist(b[i], b[(i+1)%3]) for i in range(3)]
        assert max(abs(d-80) for d in outside) < 0.00002
        assert max(abs(d-40) for d in inside) < 0.00002
        midpoints = [((a[i][0]+a[(i+1)%3][0])/2, (a[i][1]+a[(i+1)%3][1])/2) for i in range(3)]
        assert all(min(math.dist(v, m) for m in midpoints) < 0.00002 for v in b)
        assert all(10 < x+translation[0] < 200 and 10 < y+translation[1] < 287 for x, y in a)
        measurements.append(inside)
    all_paths = svg.findall(".//s:path", ns)
    assert all_paths[-1].attrib["d"] == "M 130 48 h 50 m -50 -2 v 4 m 50 -4 v 4"
    return {"nets": 2, "measuredFaceEdgesMillimetres": measurements, "calibrationMillimetres": 50, "physicalAssemblyVerified": False}


def audit_reading(text):
    reading = Reading(text)
    assert not reading.scripts and not reading.remote and not reading.handlers
    assert len(reading.images) == 15
    for image, source in zip(reading.images, manifest["pages"]):
        actual = decode(image)
        assert len(actual) == source["bytes"] and hashlib.sha256(actual).hexdigest() == source["sha256"]
        assert actual == (root / "public/sources" / source["file"]).read_bytes()
    fonts = re.findall(r"data:font/ttf;base64,[A-Za-z0-9+/=]+", text)
    assert len(fonts) == 1 and decode(fonts[0]) == (root / "public/fonts/NotoSerif-Regular.ttf").read_bytes()
    assert (root / "LICENSE").read_text().strip() in "".join(reading.text)
    assert (root / "public/fonts/OFL.txt").read_text().strip() in "".join(reading.text)
    assert len(reading.fields) == 27
    return reading


if upgrade:
    assert len(review["configurations"]) == 4
    receipts = []
    for case in review["configurations"]:
        reading = audit_reading(pathlib.Path(case["savedReading"]).read_text())
        settings = json.loads(reading.downloads["stoicheia-solids.json"])["settings"]
        assert settings["example"] == "bipyramid" and settings["vertex"] == 2
        receipts.append({"engine": case["engine"], "substitutedSource": case["substitutedSource"], "wholeSourceImagesIdentical": 15, "fontIdentical": True, "csv": audit_csv(reading.downloads["stoicheia-solids.csv"], settings), "sheet": audit_sheet(reading.downloads["stoicheia-two-tetrahedra.svg"])})
    result = {"upgrades": receipts}
    out.with_name(out.stem + "-artifacts.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({"verifiedOfflineUpgradeReadings": len(receipts), "wholeSourceImagesPerReading": 15}, indent=2))
    sys.exit(0)
assert {(r["engine"], r["width"]) for r in review["records"]} == {("chromium", 1440), ("chromium", 375), ("firefox", 1440), ("firefox", 375)}

receipts = []
for record in review["records"]:
    folder = out / f'{record["engine"]}-{record["width"]}'
    settings = json.loads((folder / "study.json").read_text())["settings"]
    assert settings == record["settings"]
    assert (folder / "study.json").read_bytes() == (folder / "native.json").read_bytes()
    for kind in ["csv", "svg"]:
        assert (folder / f"study.{kind}").read_bytes() == (folder / f"native.{kind}").read_bytes()
    csv_result = audit_csv((folder / "study.csv").read_bytes(), settings)
    sheet_result = audit_sheet((folder / "study.svg").read_bytes())
    for filename in ["study.html", "offline.html"]:
        if not (folder / filename).exists():
            assert record["offline"].get("rooms") is None
            continue
        text = (folder / filename).read_text()
        reading = audit_reading(text)
        assert json.loads(reading.downloads["stoicheia-solids.json"])["settings"] == settings
        assert reading.downloads["stoicheia-solids.csv"] == (folder / "study.csv").read_bytes()
        assert reading.downloads["stoicheia-two-tetrahedra.svg"] == (folder / "study.svg").read_bytes()
    receipts.append({"engine": record["engine"], "width": record["width"], "wholeSourceImagesIdentical": 15, "fontIdentical": True, "completeLicenses": 2, "scriptFreeNativeDownloads": 3, "csv": csv_result, "sheet": sheet_result})

pdf = out / "chromium-1440/reading.pdf"
pdf_result = None
if pdf.exists():
    pdf_text = subprocess.check_output(["pdftotext", "-raw", str(pdf), "-"], text=True)
    portable = Reading((pdf.parent / "study.html").read_text())
    def compact(text):
        return "".join(unicodedata.normalize("NFC", text).split()).replace("\u00ad", "")
    complete = [field for field in portable.fields if compact(field) in compact(pdf_text)]
    assert len(complete) == 27, [f for f in portable.fields if f not in complete]
    assert compact((root / "LICENSE").read_text()) in compact(pdf_text)
    assert compact((root / "public/fonts/OFL.txt").read_text()) in compact(pdf_text)
    for source in manifest["pages"]:
        p = source["printedPage"]
        caption = f"Printed p.{p} · PDF p.{p+10}" if p else "Title · PDF p.7"
        assert compact(caption) in compact(pdf_text)
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdfimages", "-j", str(pdf), str(pathlib.Path(tmp) / "source")], check=True)
        images = list(pathlib.Path(tmp).glob("*.jpg"))
        assert len(images) == 15
        assert {hashlib.sha256(p.read_bytes()).hexdigest() for p in images} == {p["sha256"] for p in manifest["pages"]}
        bbox = pathlib.Path(tmp) / "bbox.html"
        subprocess.run(["pdftotext", "-bbox", str(pdf), str(bbox)], check=True)
        xml = ET.fromstring(bbox.read_text())
        pages = list(xml.iter("{http://www.w3.org/1999/xhtml}page"))
        words = 0
        for page in pages:
            width, height = float(page.attrib["width"]), float(page.attrib["height"])
            for word in page.iter("{http://www.w3.org/1999/xhtml}word"):
                assert float(word.attrib["xMin"]) >= 28 and float(word.attrib["yMin"]) >= 28
                assert float(word.attrib["xMax"]) <= width-28 and float(word.attrib["yMax"]) <= height-28
                words += 1
        pdf_result = {"pages": len(pages), "completeGreekLatinEnglishFields": 27, "completeLicenses": 2, "sourceCaptions": 15, "originalJpegStreamsIdentical": 15, "wordsWithinCheckedMargins": words, "physicalPrintingVerified": False}
result = {"browserJourneys": len(receipts), "artifacts": receipts, "pdf": pdf_result}
(out / "artifacts.json").write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps({"browserJourneys": len(receipts), "pdf": pdf_result, "originalSourcePagesPerReading": 15}, indent=2))
