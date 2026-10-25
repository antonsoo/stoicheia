"""Independent exact Fraction audit plus 100-digit Euclidean half-angle geometry.

Reads emitted application results or actual browser-downloaded CSVs. Imports no
application code. No float/trigonometry is used in the geometry cross-check.
"""
import csv
import json
import sys
from decimal import Decimal, localcontext
from fractions import Fraction as F
from pathlib import Path

CHOICES = {
    "outer": [(F(265), 153), (F(4729, 8), 153), (F(9377, 8), 153), (F(9357, 4), 153)],
    "inner": [(F(1351), 780), (F(12055, 4), 780), (F(20227, 11), 240), (F(6055, 6), 66), (F(8069, 4), 66)],
}


def decimal(x):
    return Decimal(x.numerator) / Decimal(x.denominator)


def check(case):
    checked = 0
    alteration = case["alteration"]
    for branch in ("outer", "inner"):
        true_a, true_h = Decimal(3).sqrt(), Decimal(2)
        a, h, chain = F(0), F(2), True
        for i, row in enumerate(case["paths"][branch]):
            n = 6 * 2**i
            previous = chain
            value, scale = CHOICES[branch][i] if i < len(CHOICES[branch]) else (None, 153)
            if alteration and alteration["branch"] == branch and alteration["row"] == i:
                value = F(alteration["value"])
            if i == 0:
                a = value / scale
                radicand = F(3 * scale**2)
            else:
                a += h
                true_a += true_h
                true_h = (true_a**2 + 1).sqrt()
                radicand = (a * scale)**2 + scale**2 if value is not None else None
                h = value / scale if value is not None else None
            gap = radicand - value**2 if value is not None else None
            safe = gap is None or ((gap > 0 if i == 0 else gap >= 0) if branch == "outer" else (gap < 0 if i == 0 else gap <= 0))
            chain = previous and safe
            bound_safe = (branch == "inner" or safe) if i == 0 else (previous if branch == "outer" else chain)
            bound = n / (a if branch == "outer" else h)
            assert row["n"] == n
            for field, expected in (("a", a), ("h", h), ("radicand", radicand), ("gap", gap), ("bound", bound)):
                assert (F(row[field]) if row[field] is not None else None) == expected, (branch, i, field)
            assert (row["localSafe"], row["chainSafe"], row["boundSafe"]) == (safe, chain, bound_safe)
            if bound_safe:
                geometric = Decimal(n) / (true_a if branch == "outer" else true_h)
                assert decimal(bound) >= geometric if branch == "outer" else decimal(bound) <= geometric
            checked += 1
    if alteration is None:
        assert F(case["paths"]["outer"][4]["bound"]) == F(29376, 9347) < F(22, 7)
        assert F(case["paths"]["inner"][4]["bound"]) == F(25344, 8069) > F(223, 71)
    return checked


def downloaded(report_file):
    report = json.loads(report_file.read_text())
    rows_checked = 0
    for config in report["configurations"]:
        for artifact in config["csv"]:
            with (report_file.parent / artifact["file"]).open(newline="") as handle:
                records = list(csv.DictReader(handle))[:10]
            paths = {branch: [] for branch in ("outer", "inner")}
            for r in records:
                paths[r["path"]].append({"n": int(r["sides"]), "a": r["A_exact"], "h": r["H_exact"] or None, "radicand": r["radicand_exact"] or None, "gap": r["radicand_minus_Y_squared_exact"] or None, "localSafe": r["local_safe"] == "true", "chainSafe": r["chain_safe"] == "true", "boundSafe": r["bound_safe"] == "true", "bound": r["perimeter_candidate_exact"]})
            rows_checked += check({"alteration": artifact["alteration"], "paths": paths})
    return {"actual_downloaded_rows": rows_checked, "configurations": len(report["configurations"])}


with localcontext() as context:
    context.prec = 100
    if len(sys.argv) == 3 and sys.argv[1] == "--browser":
        result = downloaded(Path(sys.argv[2]))
    else:
        cases = [json.loads(line) for line in sys.stdin if line.strip()]
        assert len(cases) == 100, "Expected the complete 100-case emission"
        result = {"cases": len(cases), "exact_rows": sum(check(c) for c in cases)}
    print(json.dumps({**result, "oracle": "independent Fraction arithmetic and 100-digit half-angle geometry", "status": "passed"}, indent=2))
