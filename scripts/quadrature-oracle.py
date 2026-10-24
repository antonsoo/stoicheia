"""Independent integer identity, Decimal intersection and polygon-area checks."""
import json
import math
import sys
from decimal import Decimal, getcontext
getcontext().prec = 45
counts = {"construction": 0, "piece": 0}
max_height_error = 0.0
max_piece_area_error = 0.0
for line in sys.stdin:
    c = json.loads(line)
    a, b = sorted((c["a"], c["b"]), reverse=True)
    # Exact identity before division into physical drawing units.
    assert (a + b) ** 2 - (a - b) ** 2 == 4 * a * b
    if c["kind"] == "construction":
        # Intersect (x-r)^2 + y^2 = r^2 with x=a/10 using Decimal arithmetic.
        radius = Decimal(a + b) / 20
        x = Decimal(a) / 10
        height = (radius**2 - (x - radius)**2).sqrt()
        error = abs(c["height"] - float(height))
        max_height_error = max(max_height_error, error)
        assert error < 2e-13, c
        assert c["equal"] == (a == b)
        assert abs(c["area"] - a*b/100) < 1e-12
        assert abs(c["offsetArea"] - (a-b)**2/400) < 1e-12
        assert abs(c["perimeter"] - 2*(a+b)/10) < 2e-13
        assert abs(c["squarePerimeter"] - 4*float(height)) < 1e-12
        p = c["points"]
        assert abs((p["Theta"][0]-p["H"][0])**2+p["Theta"][1]**2-float(radius**2)) < 2e-12
        assert p["E"][0] == p["Theta"][0] == p["Delta"][0]
        assert c["area"] <= c["radiusArea"] + 1e-12
        if a != b:
            assert c["squarePerimeter"] < c["perimeter"]
    else:
        p = c["points"]
        area = abs(sum(p[i][0]*p[(i+1)%4][1] - p[(i+1)%4][0]*p[i][1] for i in range(4)))/2
        expected = (a-b)*b/200
        max_piece_area_error = max(max_piece_area_error, abs(area-expected))
        assert abs(area-expected) < 1e-12
        sides = [math.dist(p[i],p[(i+1)%4]) for i in range(4)]
        assert abs(sides[0]-(a-b)/20) < 1e-12
        assert abs(sides[1]-b/10) < 1e-12
        if c["move"] == 100:
            assert abs(min(x for x,y in p)) < 1e-12
            assert abs(max(x for x,y in p)-b/10) < 1e-12
            assert abs(min(y for x,y in p)-b/10) < 1e-12
            assert abs(max(y for x,y in p)-(a+b)/20) < 1e-12
    counts[c["kind"]] += 1
print(json.dumps({"counts":counts,"maxHeightError":max_height_error,"maxRigidPieceAreaError":max_piece_area_error,"method":"Exact integer difference of squares; independent Decimal circle intersection; shoelace area and all rigid side lengths."},indent=2))
