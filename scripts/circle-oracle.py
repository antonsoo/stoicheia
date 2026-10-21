"""Independent 60-digit circle/line-intersection oracle; no app code is imported.

Read the TypeScript engine's inputs and outputs from stdin. Obtain every new
point by general circle-circle or quadratic line-circle intersection, instead
of the engine's equilateral rotation and vector-extension formulas.
"""

import json
import sys
from decimal import Decimal, getcontext

getcontext().prec = 60
D = Decimal


def point(value):
    return value["x"], value["y"]


def add(a, b):
    return a[0] + b[0], a[1] + b[1]


def sub(a, b):
    return a[0] - b[0], a[1] - b[1]


def mul(a, k):
    return a[0] * k, a[1] * k


def dot(a, b):
    return a[0] * b[0] + a[1] * b[1]


def length(a, b):
    v = sub(a, b)
    return dot(v, v).sqrt()


def circle_circle(a, ra, b, rb, side):
    delta = sub(b, a)
    separation = length(a, b)
    u = mul(delta, 1 / separation)
    along = (ra * ra - rb * rb + separation * separation) / (2 * separation)
    height = (ra * ra - along * along).sqrt()
    foot = add(a, mul(u, along))
    return add(foot, mul((-u[1], u[0]), side * height))


def line_circle(origin, through, center, radius):
    v, w = sub(through, origin), sub(origin, center)
    aa, bb, cc = dot(v, v), 2 * dot(w, v), dot(w, w) - radius * radius
    discriminant = bb * bb - 4 * aa * cc
    if discriminant < 0:
        raise AssertionError("No circle-line intersection")
    root = discriminant.sqrt()
    t = max((-bb + root) / (2 * aa), (-bb - root) / (2 * aa))
    return add(origin, mul(v, t)), t


cases = json.load(sys.stdin, parse_float=D, parse_int=D)
max_error = D(0)
point_checks = 0
identity_checks = 0


def same(actual, expected, characteristic):
    global max_error, point_checks
    error = length(point(actual), expected) / characteristic
    max_error = max(max_error, error)
    if error > D("2e-12"):
        raise AssertionError(f"Coordinate mismatch: {error}")
    point_checks += 1


def equal(a, b, characteristic):
    global identity_checks
    if abs(a - b) / characteristic > D("1e-50"):
        raise AssertionError(f"Oracle identity mismatch: {a} != {b}")
    identity_checks += 1


for case in cases:
    data, out = case["input"], case["output"]
    a, b, c, target = (point(data[k]) for k in ("a", "b", "c", "target"))
    side = data["side"]
    ab, bc = length(a, b), length(b, c)
    d = circle_circle(a, ab, b, ab, side)
    g, t_g = line_circle(d, b, b, bc)
    dl = length(d, g)
    l, t_l = line_circle(d, a, d, dl)
    if not (t_g > 1 and t_l > 1):
        raise AssertionError("The I.2 intersections must be beyond A and B")
    e, t_e = line_circle(a, target, a, length(a, l))
    if not 0 < t_e < 1:
        raise AssertionError("The I.3 cut must be inside the given segment")
    for key, expected in (("triangle", d), ("d", d), ("g", g), ("l", l), ("copyForCut", l), ("e", e)):
        same(out[key], expected, ab)
    equal(length(a, d), ab, ab)
    equal(length(b, d), ab, ab)
    equal(length(b, g), bc, ab)
    equal(length(d, l), length(d, g), ab)
    equal(length(d, l) - length(d, a), length(a, l), ab)
    equal(length(d, g) - length(d, b), length(b, g), ab)
    equal(length(a, l), bc, ab)
    equal(length(a, e), bc, ab)

print(json.dumps({
    "method": "Independent general circle-circle and quadratic line-circle intersections",
    "arithmetic": "Python standard-library Decimal, precision 60",
    "cases": len(cases),
    "point_comparisons": point_checks,
    "oracle_equality_checks": identity_checks,
    "maximum_relative_coordinate_error": float(max_error),
    "relative_tolerance": 2e-12,
    "coverage": "Translated and rotated inputs; both triangle orientations; varying base/reference ratios; I.3 uses the I.2 construction",
    "boundary": "Numerical agreement with an independent real-plane calculation, not formal verification of Euclid's axioms",
}, indent=2))
