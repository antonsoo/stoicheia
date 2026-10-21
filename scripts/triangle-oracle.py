"""Independently inspect supplied coordinates using cosine law and shoelace area.

No app imports. I.4 motion is checked against its invariant distances, signed
area and final endpoint coincidence. I.5 is checked via both SAS correspondences
and the angle subtraction; I.6 must FAIL the equal-angle hypothesis while its
part remains strictly smaller. This checks a real-plane model, not an axiom proof.
"""
import json
import math
import sys
from collections import Counter
from pathlib import Path

counts = Counter()
checks = 0
maximum_error = 0.0
TOLERANCE = 2e-11


def length(a, b):
    return math.dist((a["x"], a["y"]), (b["x"], b["y"]))


def signed_area(a, b, c):
    return (a["x"] * b["y"] + b["x"] * c["y"] + c["x"] * a["y"]
            - a["y"] * b["x"] - b["y"] * c["x"] - c["y"] * a["x"]) / 2


def angle(a, b, c):
    # Independent of the engine's cross/dot atan2 formula.
    ab, bc, ac = length(a, b), length(b, c), length(a, c)
    return math.degrees(math.acos(max(-1, min(1, (ab * ab + bc * bc - ac * ac) / (2 * ab * bc)))))


def near(first, second):
    global checks, maximum_error
    error = abs(first - second) / max(1, abs(first), abs(second))
    assert error < TOLERANCE, (first, second, error)
    maximum_error = max(maximum_error, error)
    checks += 1


def less(first, second):
    global checks
    assert first < second, (first, second)
    checks += 1


for line in sys.stdin:
    case = json.loads(line)
    counts[case["kind"]] += 1
    if case["kind"] == "I.4":
        original, target, moving = case["source"], case["target"], case["moving"]
        for i, j in [(0, 1), (0, 2), (1, 2)]:
            near(length(original[i], original[j]), length(moving[i], moving[j]))
            near(length(original[i], original[j]), length(target[i], target[j]))
        expected_base = case["length"] * math.sqrt(1 + case["ratio"] ** 2 - 2 * case["ratio"] * math.cos(math.radians(case["angle"])))
        near(length(moving[1], moving[2]), expected_base)
        near(angle(moving[1], moving[0], moving[2]), case["angle"])
        near(signed_area(*original), signed_area(*moving))
        if case["progress"] == 1:
            for p, q in zip(moving, target):
                near(p["x"], q["x"])
                near(p["y"], q["y"])
    elif case["kind"] == "I.5":
        a, b, c, d, e, z, h = [case[k] for k in "abcdezh"]
        near(length(a, b), length(a, c))
        near(length(a, z), length(a, h))
        less(length(a, z), length(a, e))
        near(signed_area(a, b, z), 0)
        near(signed_area(a, c, h), 0)
        # Both independent triangle correspondences, including all opposite angles.
        for left, right in [((a, z, c), (a, h, b)), ((b, z, c), (c, h, b))]:
            for i, j in [(0, 1), (0, 2), (1, 2)]:
                near(length(left[i], left[j]), length(right[i], right[j]))
            for i, j, k in [(0, 1, 2), (1, 2, 0), (2, 0, 1)]:
                near(angle(left[i], left[j], left[k]), angle(right[i], right[j], right[k]))
        near(angle(a, b, h) - angle(c, b, h), angle(a, b, c))
        near(angle(a, c, z) - angle(b, c, z), angle(a, c, b))
        near(angle(a, b, c), angle(a, c, b))
        near(angle(z, b, c), angle(h, c, b))
        for actual, expected in zip(case["angles"], [angle(a,b,h), angle(c,b,h), angle(a,b,c)]):
            near(actual, expected)
    else:
        a, b, c, d = [case[k] for k in "abcd"]
        near(length(d, b), length(a, c))
        near(length(a, d) + length(d, b), length(a, b))
        less(length(a, c), length(a, b))
        part, whole = abs(signed_area(d, b, c)), abs(signed_area(a, b, c))
        near(part / whole, case["ratio"])
        less(0, part)
        less(part, whole)
        # An impossible conjunction must never accidentally look verified.
        less(0.1, abs(angle(a, b, c) - angle(a, c, b)))
        near(case["areas"][0], part)
        near(case["areas"][1], whole)

assert counts == {"I.4": 480, "I.5": 96, "I.6": 96}, counts
report = {
    "scope": "Real-plane numerical model; not formal verification of Euclid's axioms",
    "method": "Independent cosine-law angles, shoelace areas, Euclidean distance, rigid-motion invariants, two triangle correspondences, equal-angle remainders and rejection of the I.6 conjunction",
    "cases": dict(counts), "checks": checks,
    "max_relative_error": maximum_error, "tolerance": TOLERANCE,
}
Path("docs/triangle-oracle.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report, indent=2))
