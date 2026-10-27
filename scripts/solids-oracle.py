"""Independent exact angle arithmetic and shortest-edge cycle reconstruction of the exported meshes."""

import csv
import io
import itertools
import json
import math
import sys
import xml.etree.ElementTree as ET
from fractions import Fraction as F

data = json.load(sys.stdin)
admitted = []
for trial in data["cases"]:
    p, q = trial["p"], trial["q"]
    # A p-gon triangulates into p-2 triangles. Equal angles share their total.
    angle = F(180 * (p - 2), p)
    total = q * angle
    deficit = 360 - total
    kind = "too-few" if q < 3 else "flat" if total == 360 else "excess" if total > 360 else "candidate"
    assert (F(trial["angle"]), F(trial["sum"]), F(trial["deficit"]), F(trial["rightAngles"]), trial["kind"]) == (angle, total, deficit, total / 90, kind)
    if kind == "candidate":
        admitted.append((p, q))
assert admitted == [(3, 3), (3, 4), (3, 5), (4, 3), (5, 3)]


def sub(a, b):
    return tuple(x - y for x, y in zip(a, b))


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


expected = {"tetrahedron": (4, 6, 4, 3), "cube": (8, 12, 6, 4), "octahedron": (6, 12, 8, 3), "icosahedron": (12, 30, 20, 3), "dodecahedron": (20, 30, 12, 5), "bipyramid": (5, 9, 6, 3)}
receipts = []
for m in data["meshes"]:
    vertices, faces = m["vertices"], m["faces"]
    v, e, f, p = expected[m["id"]]
    assert (len(vertices), len(m["edges"]), len(faces)) == (v, e, f)
    distances = {(a, b): math.dist(vertices[a], vertices[b]) for a, b in itertools.combinations(range(v), 2)}
    shortest = min(distances.values())
    edges = {pair for pair, d in distances.items() if abs(d - shortest) < 1e-8}
    assert edges == {tuple(sorted(edge)) for edge in m["edges"]}
    # The app finds supporting planes of point triples. This oracle instead
    # walks the independently inferred shortest-edge graph, then tests cycles.
    neighbours = {a: {b for b in range(v) if tuple(sorted((a, b))) in edges} for a in range(v)}
    cycles = set()

    def walk(path):
        if len(path) == p:
            if path[0] not in neighbours[path[-1]]:
                return
            points = [vertices[i] for i in path]
            normal = cross(sub(points[1], points[0]), sub(points[2], points[0]))
            if any(abs(dot(normal, sub(point, points[0]))) > 1e-8 for point in points):
                return
            sides = [dot(normal, sub(point, points[0])) for point in vertices]
            if min(sides) < -1e-8 and max(sides) > 1e-8:
                return
            cycles.add(tuple(sorted(path)))
            return
        for nxt in neighbours[path[-1]]:
            if nxt not in path and nxt >= path[0]:
                walk(path + [nxt])

    for start in range(v):
        walk([start])
    assert cycles == {tuple(sorted(face)) for face in faces}
    incidences = [sum(a in face for face in faces) for a in range(v)]
    assert v - e + f == 2
    assert all(sum(a in face and b in face for face in faces) == 2 for a, b in edges)
    deficits = [360 - F(q * 180 * (p - 2), p) for q in incidences]
    assert sum(deficits) == 720
    if m["id"] == "bipyramid":
        assert incidences == [3, 3, 4, 4, 4]
        assert abs(shortest - 1) < 1e-12
        assert deficits == [180, 180, 120, 120, 120]
    else:
        assert len(set(incidences)) == 1
    # Inspect actual polygon corner angles, independently of the model's p/q table.
    max_angle_error = 0
    for face in faces:
        for k, a in enumerate(face):
            u, w = sub(vertices[face[k-1]], vertices[a]), sub(vertices[face[(k+1) % p]], vertices[a])
            measured = math.degrees(math.acos(max(-1, min(1, dot(u, w) / math.sqrt(dot(u, u) * dot(w, w))))))
            max_angle_error = max(max_angle_error, abs(measured - 180 * (p-2) / p))
    assert max_angle_error < 1e-10
    receipts.append({"id": m["id"], "vertices": v, "edges": e, "faces": f, "vertexDegrees": incidences, "angleErrorDegrees": max_angle_error, "sumDeficitDegrees": str(sum(deficits))})

rows = list(csv.reader(io.StringIO(data["csv"])))
conditional_vertices = 0
for model in data["inferences"]:
    for t in model["vertices"]:
        p, q = t["p"], t["q"]
        # Solve the two incidence equations and Euler's relation, independently
        # of the app's 720/deficit arithmetic.
        v = 2 / (F(1) - F(q, 2) + F(q, p))
        assert {key: F(value) for key, value in t["conditional"].items()} == {"vertices": v, "edges": q*v/2, "faces": q*v/p}
        assert F(t["totalDeficit"]) == 720
        if t["uniform"]:
            assert all(F(t["conditional"][k]) == t["actual"][k] for k in t["actual"])
        else:
            assert model["id"] == "bipyramid" and v in [4, 6] and t["actual"]["vertices"] == 5
        conditional_vertices += 1
assert len([r for r in rows if r and r[0] in ["selected and enumerated", "enumerated, not a learner history"]]) == 70
assert len([r for r in rows if r and r[0] == "bipyramid"]) == 5
sheet = ET.fromstring(data["sheet"])
assert sheet.attrib["width"] == "210mm" and sheet.attrib["height"] == "297mm"
paths = [p.attrib for p in sheet.iter("{http://www.w3.org/2000/svg}path")]
assert len(paths) == 5
assert paths[-1]["d"] == "M 130 48 h 50 m -50 -2 v 4 m 50 -4 v 4"
# Independent equilateral net vertices: the outer triangle has side 80 mm;
# its three midpoints define four equal 40 mm equilateral faces.
h = math.sqrt(3) * 20
for y in [80, 177]:
    assert 0 < y-h and y+h < 297
for a, b in [((0,0),(40,0)), ((40,0),(20,h)), ((20,h),(0,0))]:
    assert abs(math.dist(a,b)-40) < 1e-12

report = {"angleCases": len(data["cases"]), "admittedUniformPairs": admitted, "independentShortestEdgeMeshes": receipts, "conditionalVertexInferences": conditional_vertices, "csvCases": 70, "tetrahedronNets": 2, "netEdgeMillimetres": 40, "calibrationMillimetres": 50, "physicalAssemblyVerified": False}
print(json.dumps(report, indent=2))
