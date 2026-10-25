"""Independent Fraction/110-digit Decimal review; imports no application code."""
import json
import math
import sys
import csv
from decimal import Decimal, localcontext
from fractions import Fraction
from pathlib import Path


def check_browser(report_path):
    report_file = Path(report_path)
    report = json.loads(report_file.read_text())
    drawings = rows_checked = 0
    for configuration in report["configurations"]:
        for drawing in configuration["drawings"]:
            assert math.isclose(drawing["bWidth"], drawing["b"] / drawing["a"], rel_tol=3e-15)
            assert math.isclose(drawing["remainingWidth"], drawing["remaining"] / drawing["a"], rel_tol=3e-15, abs_tol=1e-30)
            assert drawing["remaining"] >= 0
            drawings += 1
        folder = report_file.parent / f"{configuration['engine']}-{configuration['width']}"
        with (folder / "stoicheia-common-measure.csv").open(newline="") as stream:
            records = list(csv.DictReader(stream))
        with localcontext() as context:
            context.prec = 110
            root = Decimal(2).sqrt()
            first = records[0]
            a = root if first["original_kind"] == "diagonal" else Decimal(first["comparison_numerator"]) / Decimal(first["comparison_denominator"])
            b = Decimal(1)
            for index, record in enumerate(records):
                assert int(record["turn"]) == index + 1
                fitted = int(record["fitted_count"])
                q = int(a // b)
                left = a - fitted * b
                assert 0 <= fitted <= q
                assert (record["turn_complete"] == "true") == (fitted == q)
                for prefix, wanted in [("A", a), ("B", b), ("remaining", left)]:
                    observed = (Decimal(record[f"{prefix}_a"]) + Decimal(record[f"{prefix}_b"]) * root) / Decimal(record[f"{prefix}_denominator"])
                    assert abs(observed - wanted) < Decimal("1e-88")
                assert math.isclose(float(left), float(record["remaining_decimal_approximation"]), rel_tol=2e-15)
                a, b = b, a - q * b
                rows_checked += 1
    print(json.dumps({"browser_drawings": drawings, "actual_downloaded_csv_rows": rows_checked,
                      "status": "actual SVG length ratios and downloaded exact coefficients agree independently"}, indent=2))


def run():
    cases = turns = readings = 0
    with localcontext() as context:
        context.prec = 110
        root = Decimal(2).sqrt()
        for line in sys.stdin:
            case = json.loads(line)
            irrational = case["kind"] == "diagonal"
            if irrational:
                a, b = root, Decimal(1)
            else:
                a, b = Fraction(case["n"], case["d"]), Fraction(1)
            for row in case["rows"]:
                q = int(a // b)
                remainder = a - q * b
                assert q == row["q"], (case["n"], case["d"], q, row["q"])
                for name, wanted in [("a", a), ("b", b), ("r", remainder)]:
                    value = row[name]
                    ia, ib, den = (int(value[k]) for k in ("a", "b", "d"))
                    assert den > 0 and math.gcd(math.gcd(ia, ib), den) == 1
                    if irrational:
                        observed = (Decimal(ia) + Decimal(ib) * root) / den
                        assert abs(observed - wanted) < Decimal("1e-88")
                    else:
                        assert ib == 0
                        observed = Fraction(ia, den)
                        assert observed == wanted
                    assert math.isclose(float(observed), value["decimal"], rel_tol=2e-15, abs_tol=1e-30)
                    readings += 1
                assert 0 <= remainder < b
                if remainder:
                    assert 2 * remainder < a
                a, b = b, remainder
                turns += 1
            if irrational:
                assert len(case["rows"]) == 24 and b > 0
                # An independent closed form for every remainder and recurring pair.
                for index, row in enumerate(case["rows"]):
                    expected = (root - 1) ** (index + 1)
                    value = row["r"]
                    observed = (Decimal(value["a"]) + Decimal(value["b"]) * root) / Decimal(value["d"])
                    assert abs(observed - expected) < Decimal("1e-88")
            else:
                assert b == 0, "Every bounded rational must reach an exact measure"
                assert a == Fraction(math.gcd(case["n"], case["d"]), case["d"])
                assert (Fraction(case["n"], case["d"]) / a).denominator == 1
                assert (Fraction(1) / a).denominator == 1
            cases += 1
    print(json.dumps({"cases": cases, "division_turns": turns, "length_readings": readings,
                      "oracle": "Python Fraction and 110-digit Decimal; no application imports",
                      "status": "all exact signs, quotients, remainders, terminal units and decimal conversions agree"}, indent=2))


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "--browser":
        check_browser(sys.argv[2])
    else:
        run()
