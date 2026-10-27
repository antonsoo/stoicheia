"""Audit actual downloaded records and the text/geometry of the printed reading."""
import argparse
import csv
import hashlib
import io
import json
from pathlib import Path
import re
import subprocess
import unicodedata
import xml.etree.ElementTree as ET


def norm(s):
    return re.sub(r"\s+", "", unicodedata.normalize("NFC", s))


def sign(n):
    return (n > 0) - (n < 0)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("review", type=Path)
    args = parser.parse_args()
    review = json.loads((args.review / "review.json").read_text())
    result = {"scope": "Actual native browser downloads; independent integer comparison and PDF extraction", "files": []}
    for config in review["configurations"]:
        folder = args.review / f"{config['engine']}-{config['width']}"
        record = json.loads((folder / "experiment.json").read_text())
        s = record["state"]
        rows = list(csv.DictReader(io.StringIO((folder / "comparison.csv").read_text())))
        selected = rows[0]
        first = sign(2 * s["m"] ** 2 - s["n"] ** 2)
        second = first if s["kind"] == "scaled" else sign(s["m"] * s["p"] - s["n"] * s["q"])
        symbols = {-1: "<", 0: "=", 1: ">"}
        assert selected["record"] == "selected"
        assert int(selected["m"]) == s["m"] and int(selected["n"]) == s["n"]
        assert selected["first_relation"] == symbols[first]
        assert selected["second_relation"] == symbols[second]
        expected = set()
        for m in range(1, s["bound"] + 1):
            for n in range(1, s["bound"] + 1):
                a = sign(2 * m * m - n * n)
                b = a if s["kind"] == "scaled" else sign(m * s["p"] - n * s["q"])
                if a != b:
                    expected.add((m, n))
        actual = set()
        for row in rows[1:]:
            assert row["record"] == "bounded_disagreement_interval"
            m, lo, hi = int(row["m"]), int(row["n"]), int(row["n_last"])
            assert int(row["count"]) == hi - lo + 1
            for n in range(lo, hi + 1):
                assert (m, n) not in actual
                actual.add((m, n))
        assert actual == expected
        assert (folder / "embedded.json").read_bytes() == (folder / "experiment.json").read_bytes()
        assert (folder / "embedded.csv").read_bytes() == (folder / "comparison.csv").read_bytes()
        result["files"].append({"engine": config["engine"], "width": config["width"],
                                "comparison_rows": len(rows), "disagreeing_pairs": len(actual),
                                "html_sha256": hashlib.sha256((folder / "reading.html").read_bytes()).hexdigest()})
    pdf = args.review / "chromium-1440/reading.pdf"
    if pdf.exists():
        root = Path(__file__).resolve().parents[1]
        passages = json.loads(subprocess.check_output(["node", "--import", "tsx", "--input-type=module", "-e",
                            "import {ratioPassages} from './src/content/ratios.ts';console.log(JSON.stringify(ratioPassages))"], cwd=root, text=True))
        text = subprocess.check_output(["pdftotext", "-layout", str(pdf), "-"], text=True)
        compact = norm(text)
        cursor = 0
        for p in passages:
            for key in ["greek", "latin", "english"]:
                at = compact.find(norm(p[key]), cursor)
                assert at >= 0, (p["title"], key, "Complete passage missing or copied out of sequence")
                cursor = at + len(norm(p[key]))
            for w in p["words"]:
                assert norm(w["meaning"]) in compact, (p["title"], w["meaning"], "Word note absent or copied out of sequence")
        for caption in ["Title · PDF p.7"] + [f"Printed p.{p} · PDF p.{p+26}" for p in range(2, 6)]:
            assert norm(caption) in compact
        bbox = subprocess.check_output(["pdftotext", "-bbox", str(pdf), "-"], text=True)
        tree = ET.fromstring(bbox[bbox.index("<html"):])
        ns = {"x": "http://www.w3.org/1999/xhtml"}
        pages = tree.findall(".//x:page", ns)
        words = 0
        for page in pages:
            width, height = float(page.attrib["width"]), float(page.attrib["height"])
            for w in page.findall(".//x:word", ns):
                assert float(w.attrib["xMin"]) >= 10
                assert float(w.attrib["xMax"]) <= width - 10
                assert float(w.attrib["yMin"]) >= 10
                assert float(w.attrib["yMax"]) <= height - 10
                words += 1
        result["print"] = {"pages": len(pages), "complete_passages_in_order": len(passages) * 3,
                           "source_captions": 5, "words_within_page_margins": words,
                           "limits": "Untagged browser PDF; no physical print dimensions, print-device behavior or accessibility tagging asserted."}
    assert len(result["files"]) == 4, "The full browser matrix is required"
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
