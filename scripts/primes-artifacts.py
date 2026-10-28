"""Audit actual browser downloads, source/font bytes, exact records and printed paragraphs."""
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
from html.parser import HTMLParser

root=pathlib.Path.cwd()
out=pathlib.Path(sys.argv[1])
review=json.loads((out/"review.json").read_text())
manifest=json.loads((root/"public/sources/primes/manifest.json").read_text())
def decode(u):
    head,body=u.split(",",1)
    return base64.b64decode(body) if ";base64" in head else urllib.parse.unquote_to_bytes(body)
class Reading(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=True)
        self.images=[];self.downloads={};self.forbidden=[];self.text=[];self.fields=[];self.field=None
        self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=="img":self.images.append(a["src"])
        if "download" in a:self.downloads[a["download"]]=decode(a["href"])
        if tag in ["script","iframe","object"] or any(k.startswith("on") for k in a):self.forbidden.append(tag)
        if tag in ["img","link","script","audio","video","iframe"] and any(a.get(k,"").startswith(("http:","https:")) for k in ["src","href"]):self.forbidden.append("remote")
        if tag=="p" and (a.get("lang") in ["grc","la"] or a.get("class") in ["pr-translation","pr-reading-note"]):self.field=[]
    def handle_endtag(self,tag):
        if tag=="p" and self.field is not None:self.fields.append("".join(self.field));self.field=None
    def handle_data(self,data):
        self.text.append(data)
        if self.field is not None:self.field.append(data)

def audit_reading(file):
    html=file.read_text();reading=Reading(html)
    assert not reading.forbidden
    assert len(reading.images)==11 and len(reading.fields)==44
    for url,p in zip(reading.images,manifest["pages"],strict=True):
        b=decode(url);assert b==(root/"public/sources"/p["file"]).read_bytes()
        assert len(b)==p["bytes"] and hashlib.sha256(b).hexdigest()==p["sha256"]
    fonts=re.findall(r"data:font/ttf;base64,[A-Za-z0-9+/=]+",html)
    assert len(fonts)==1 and decode(fonts[0])==(root/"public/fonts/NotoSerif-Regular.ttf").read_bytes()
    for f in ["LICENSE","public/fonts/OFL.txt"]:assert (root/f).read_text().strip() in "".join(reading.text)
    assert json.loads(reading.downloads["stoicheia-primes-sources.json"])==manifest
    return reading

def audit_csv(body,settings):
    rows=list(csv.reader(io.StringIO(body.decode())))
    assert rows[0]==["section","quantity","value","meaning"]
    assert all(len(r)==4 for r in rows)
    by=lambda section,quantity:[r[2] for r in rows[1:] if r[:2]==[section,quantity]]
    given=list(map(int,settings["primes"]));m=math.prod(given);n=m+1
    assert by("construction","M")==[str(m)] and by("construction","N")==[str(n)]
    assert list(map(int,by("given","prime")))==given
    assert list(map(int,by("division","copies_in_M")))==[m//p for p in given]
    assert list(map(int,by("division","remainder_in_N")))==[n%p for p in given]==[1]*len(given)
    factors=by("factor","prime_power")
    cofactor=int(by("search","unresolved_cofactor")[0])
    assert math.prod(int(p)**int(e) for p,e in (s.split("^") for s in factors))*cofactor==n
    assert by("search","trial_bound")==[str(settings["limit"])]
    candidate=settings.get("candidate","")
    if candidate:
        h=int(candidate)
        assert by("proposed_witness","H")==[candidate]
        assert by("proposed_witness","divides_N")==[str(h>0 and n%h==0).lower()]
        assert by("proposed_witness","absent_from_givens")==[str(h not in given).lower()]
        primality="unchecked" if h>10**10 else "prime" if h>=2 and all(h%d for d in range(2,math.isqrt(h)+1)) else "not-prime"
        valid=primality=="prime" and h>0 and n%h==0 and h not in given
        assert by("proposed_witness","primality")==[primality]
        assert by("proposed_witness","valid")==[str(valid).lower()]
        assert by("proposed_witness","branch")==[("prime" if h==n else "composite") if valid else "unestablished"]
    assert [int(r[2]) for r in rows if r[0]=="separate_VII_31"]==settings["descent"]
    return {"givenPrimes":len(given),"exactRemainders":len(given),"factorProductReconstructed":True,"proposedWitnessIndependentlyChecked":bool(candidate)}

def audit_svg(body,settings):
    svg=ET.fromstring(body);ns={"s":"http://www.w3.org/2000/svg"}
    assert (root/"LICENSE").read_text().strip() in "".join(svg.find("s:metadata",ns).itertext())
    assert not svg.findall(".//s:foreignObject",ns) and not svg.findall(".//s:script",ns)
    text="".join(svg.itertext());m=math.prod(map(int,settings["primes"]))
    assert str(m) in text and str(m+1) in text
    if settings.get("candidate"):assert f'Proposed H = {settings["candidate"]}' in text
    units=svg.findall(".//s:rect",ns)
    assert len(units)==2*int(settings["primes"][settings["selected"]])+2
    return {"unitMarks":len(units)-1,"nativeVectorText":True}

receipts=[]
for r in review["records"]:
    folder=out/f'{r["engine"]}-{r["width"]}'
    reading=audit_reading(folder/"reading.html");settings=json.loads((folder/"study.json").read_bytes())["settings"]
    assert settings==r["settings"]
    for extension in ["json","csv","svg"]:
        b=(folder/f"study.{extension}").read_bytes()
        assert b==(folder/f"native.{extension}").read_bytes()==reading.downloads[f"stoicheia-primes.{extension}"]
    offline=audit_reading(folder/"offline-reading.html")
    assert offline.downloads==reading.downloads
    assert (folder/"offline.json").read_bytes()==(folder/"study.json").read_bytes()
    receipts.append({"engine":r["engine"],"width":r["width"],"readingParagraphs":len(reading.fields),"wholeImagesIdentical":11,"fontIdentical":True,"completeLicenses":2,"nativeDownloadsIdentical":4,"offlineEquivalent":True,"csv":audit_csv((folder/"study.csv").read_bytes(),settings),"svg":audit_svg((folder/"study.svg").read_bytes(),settings)})

pdf=out/"reading.pdf"
pdf_text=subprocess.check_output(["pdftotext","-layout",str(pdf),"-"],text=True)
normalize=lambda s:re.sub(r"\s+","",unicodedata.normalize("NFKC",s)).replace("\u00ad","")
retained=audit_reading(out/"chromium-1440/reading.html")
for paragraph in retained.fields:assert normalize(paragraph) in normalize(pdf_text),paragraph[:100]
settings=json.loads(retained.downloads["stoicheia-primes.json"])["settings"]
if settings.get("candidate"):
    for field in [f'Proposed H = {settings["candidate"]}',"H is prime","H divides N","H is absent from the givens","This check verifies your proposed H directly."]:
        assert normalize(field) in normalize(pdf_text),field
info=subprocess.check_output(["pdfinfo",str(pdf)],text=True)
pages=int(re.search(r"Pages:\s+(\d+)",info)[1])
with tempfile.TemporaryDirectory() as tmp:
    stem=pathlib.Path(tmp)/"image"
    subprocess.run(["pdfimages","-j",str(pdf),str(stem)],check=True,capture_output=True)
    hashes={hashlib.sha256(f.read_bytes()).hexdigest() for f in pathlib.Path(tmp).glob("image-*.jpg")}
    assert hashes=={p["sha256"] for p in manifest["pages"]}
    bbox=pathlib.Path(tmp)/"bbox.html"
    subprocess.run(["pdftotext","-bbox",str(pdf),str(bbox)],check=True,capture_output=True)
    tree=ET.fromstring(bbox.read_text());ns={"x":"http://www.w3.org/1999/xhtml"}
    for page in tree.findall(".//x:page",ns):
        w,h=float(page.attrib["width"]),float(page.attrib["height"])
        for word in page.findall(".//x:word",ns):
            a=word.attrib
            assert 20<=float(a["xMin"])<=float(a["xMax"])<=w-20,a
            assert 20<=float(a["yMin"])<=float(a["yMax"])<=h-20,a
result={"browserArtifacts":receipts,"pdf":{"pages":pages,"completeReadingParagraphs":44,"sourceImagesByteIdentical":11,"textWithinCheckedMargins":True,"taggedReportedByPdfinfo":bool(re.search(r"Tagged:\s+yes",info))},"boundary":"Audits actual downloaded files locally. Delivery and browser scope are recorded separately in review.json. No physical printer or comprehensive PDF accessibility claim."}
(out/"artifacts.json").write_text(json.dumps(result,indent=2)+"\n")
print(json.dumps(result,indent=2))
