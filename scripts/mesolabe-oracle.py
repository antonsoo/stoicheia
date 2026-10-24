"""Independent straight-line intersection and nested-bisection oracle.

No application imports, cube-root function, or closed-form slide formula.
The oracle intersects the actual square diagonals/edges, then adjusts both
plates numerically until their contacts meet AD.
"""
import json
import math
import sys


def intersection(a, b, c, d):
    ux, uy = b[0] - a[0], b[1] - a[1]
    vx, vy = d[0] - c[0], d[1] - c[1]
    cross = ux * vy - uy * vx
    t = ((c[0] - a[0]) * vy - (c[1] - a[1]) * vx) / cross
    return a[0] + t * ux, a[1] + t * uy


def geometry(p, q, r):
    a, d = (p, 1), (3 - q, 1 / r)
    b = intersection((1 + p, 0), (1 + p, 1), (1, 1), (2, 0))
    g = intersection((2, 0), (2, 1), (2 - q, 1), (3 - q, 0))
    br = intersection((1 + p, 0), (1 + p, 1), a, d)
    gr = intersection((2, 0), (2, 1), a, d)
    return b, g, (b[1] - br[1], g[1] - gr[1])


def first_contact(q, r):
    lo, hi = 0, 0.9
    for _ in range(60):
        p = (lo + hi) / 2
        if geometry(p, q, r)[2][0] > 0:
            lo = p
        else:
            hi = p
    return (lo + hi) / 2


def solve(r):
    lo, hi = 0, 0.9
    for _ in range(60):
        q = (lo + hi) / 2
        p = first_contact(q, r)
        if geometry(p, q, r)[2][1] > 0:
            lo = q
        else:
            hi = q
    q = (lo + hi) / 2
    return first_contact(q, r), q


cases = json.load(sys.stdin)
solutions = {}
max_error = 0
checks = 0


def close(actual, expected):
    global max_error, checks
    error = abs(actual - expected)
    assert math.isfinite(actual) and error < 2e-10, (actual, expected, error)
    max_error = max(max_error, error)
    checks += 1


for case in cases:
    s, m = case["state"], case["model"]
    r = s["factor"]
    if s["mode"] == "ideal":
        if r not in solutions:
            solutions[r] = solve(r)
        p, q = solutions[r]
    elif s["mode"] == "first":
        q = s["right"]
        p = first_contact(q, r)
    else:
        p, q = s["left"], s["right"]
    close(m["p"], p)
    close(m["q"], q)
    b, g, residuals = geometry(p, q, r)
    for name, point in [("B", b), ("G", g)]:
        for actual, expected in zip(m["points"][name], point):
            close(actual, expected)
    lengths = [r, b[1] * r, g[1] * r, 1]
    for actual, expected in zip(m["lengths"], lengths):
        close(actual, expected)
    for actual, expected in zip(m["residuals"], residuals):
        close(actual, expected)
    close(m["volume"], lengths[2] ** 3)
    for i in range(3):
        close(m["ratios"][i], lengths[i] / lengths[i + 1])
    assert m["aligned"] == all(abs(e) < 1e-10 for e in residuals)
    if s["mode"] == "ideal":
        close(m["volume"], r)
        close(m["ratios"][0], m["ratios"][1])
        close(m["ratios"][1], m["ratios"][2])

report = {
    "method": "Independent square-edge/diagonal intersections; nested bisection for two-contact alignment",
    "cases": len(cases),
    "numeric_comparisons": checks,
    "independently_solved_volume_factors": len(solutions),
    "max_absolute_difference": max_error,
    "tolerance": 2e-10,
    "historical_or_physical_accuracy_established": False,
}
print(json.dumps(report, indent=2))
