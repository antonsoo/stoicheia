"""Independent barycentric construction and cosine-law angles for Euclid I.21."""
import json
import math
import sys

maximum = 0.0
cases = 0
checks = 0


def near(actual, expected):
    global maximum, checks
    error = abs(actual - expected)
    maximum = max(maximum, error)
    checks += 1
    assert error < 1e-8, (actual, expected, error)


def length(a, b):
    return math.dist(a, b)


def angle(a, b, c):
    u, v, w = length(a, b), length(b, c), length(a, c)
    return math.degrees(math.acos(max(-1, min(1, (u*u + v*v - w*w)/(2*u*v)))))


for line in sys.stdin:
    row = json.loads(line)
    s, r, theta, side, u, v = [row[k] for k in ("size", "ratio", "angle", "side", "e", "d")]
    a, b = (0, 0), (s, 0)
    c = (s*r*math.cos(math.radians(theta)), side*s*r*math.sin(math.radians(theta)))
    e = tuple((1-u)*a[i]+u*c[i] for i in range(2))
    # D's positive barycentric weights prove it is in the open triangle.
    weights = (v*(1-u), 1-v, v*u)
    assert all(w > 0 for w in weights)
    near(sum(weights), 1)
    d = tuple(sum(w*p[i] for w,p in zip(weights,(a,b,c))) for i in range(2))
    model = row["result"]
    for key, point in zip(("a","b","c","d","e"),(a,b,c,d,e)):
        near(model[key]["x"],point[0]); near(model[key]["y"],point[1])
    outer, middle, inner = length(b,a)+length(a,c),length(b,e)+length(e,c),length(b,d)+length(d,c)
    outer_angle, middle_angle, inner_angle = angle(b,a,c),angle(c,e,b),angle(b,d,c)
    assert outer > middle > inner
    assert inner_angle > middle_angle > outer_angle
    expected = dict(outer=outer,middle=middle,inner=inner,outerAngle=outer_angle,middleAngle=middle_angle,innerAngle=inner_angle,
        firstExcess=length(a,b)+length(a,e)-length(b,e),secondExcess=length(c,e)+length(e,d)-length(c,d))
    for key,value in expected.items(): near(model[key],value)
    near(model["firstExcess"]+model["secondExcess"],outer-inner)
    cases += 1

assert cases > 0
print(json.dumps(dict(method="Positive barycentric coordinates, independent distances and cosine-law angles",cases=cases,comparisons=checks,maximumAbsoluteDiscrepancy=maximum,tolerance=1e-8,allPassed=True),indent=2))
