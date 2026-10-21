"""Independent distances, Heron areas and cosine-law angles from exported points.

No application modules or precomputed expected measurements are imported.
The area-sum classifier differs from the application's oriented half-planes.
"""
import json
import math
import sys
from collections import Counter

counts = Counter()
checks = 0
maximum_angle_error = 0.0
maximum_length_error = 0.0


def dist(a, b):
    return math.hypot(a['x'] - b['x'], a['y'] - b['y'])


def area(a, b, c):
    x, y, z = sorted([dist(a, b), dist(b, c), dist(c, a)], reverse=True)
    return math.sqrt(max(0, (x + (y + z)) * (z - (x - y)) * (z + (x - y)) * (x + (y - z)))) / 4


def angle(a, v, b):
    x, y, z = dist(a, v), dist(b, v), dist(a, b)
    return math.degrees(math.acos(max(-1, min(1, (x*x + y*y - z*z) / (2*x*y)))))


def near(actual, expected, tolerance):
    global checks
    checks += 1
    assert abs(actual - expected) <= tolerance, (actual, expected, tolerance)


for line in sys.stdin:
    item = json.loads(line)
    a, b, c, d, e, z = [item[k] for k in ('a', 'b', 'c', 'd', 'e', 'z')]
    size = item['size']
    lengths = {k: dist(*pair) for k, pair in {
        'ac': (a,c), 'ad': (a,d), 'bc': (b,c), 'bd': (b,d), 'cd': (c,d)}.items()}
    for key, value in lengths.items():
        error = abs(value - item['lengths'][key]) / size
        maximum_length_error = max(maximum_length_error, error)
        near(error, 0, 2e-12)
    near(lengths['ac'], 0.7 * size, size * 2e-12)
    near(lengths['ad'], lengths['ac'], size * 2e-12)

    # For reflection, distances alone do not tell us which half-plane contains D.
    # Compare projections onto the independent unit normal to AB.
    nx, ny = -(b['y']-a['y'])/size, (b['x']-a['x'])/size
    hc = (c['x']-a['x'])*nx + (c['y']-a['y'])*ny
    hd = (d['x']-a['x'])*nx + (d['y']-a['y'])*ny
    total = area(a,b,c)
    pieces = [area(a,b,d), area(b,c,d), area(c,a,d)]
    if lengths['cd'] < size * 1e-10:
        expected = 'coincident'
    elif hc * hd < 0:
        expected = 'reflection'
    elif min(pieces) < size*size*1e-7 and abs(sum(pieces)-total) < size*size*1e-7:
        expected = 'boundary'
    elif abs(sum(pieces)-total) < size*size*1e-9:
        expected = 'inside'
    else:
        expected = 'outside'
    assert expected == item['placement'], (expected, item)
    checks += 1
    counts[expected] += 1

    if expected == 'coincident':
        assert item['angles'] is None
        near(lengths['bd'], lengths['bc'], size * 2e-12)
        continue
    if expected == 'boundary':
        near(lengths['bc'], lengths['bd']+lengths['cd'], size * 2e-12)
        assert lengths['bd'] < lengths['bc']
        continue

    measured = {key: angle(*points) for key, points in {
        'acd': (a,c,d), 'adc': (a,d,c), 'dcb': (d,c,b), 'cdb': (c,d,b),
        'ecd': (e,c,d), 'zdc': (z,d,c), 'acb': (a,c,b)}.items()}
    for key, value in measured.items():
        error = abs(value - item['angles'][key])
        maximum_angle_error = max(maximum_angle_error, error)
        near(error, 0, 2e-7)
    near(measured['acd'], measured['adc'], 2e-7)
    near(measured['ecd'], measured['zdc'], 2e-7)
    if expected == 'reflection':
        near(lengths['bd'], lengths['bc'], size * 2e-12)
        near(measured['dcb'], measured['cdb'], 2e-7)
    else:
        assert lengths['bd'] < lengths['bc']
        assert measured['dcb'] < measured['cdb']
        part = expected == 'outside'
        assert item['printedPart'] == part
        middle = measured['acd'] if part else measured['ecd']
        assert measured['dcb'] < middle < measured['cdb']
        near(measured['acd'], measured['acb'] + (1 if part else -1)*measured['dcb'], 2e-7)
        # Equal exterior angles are obtained by extending each equal side.
        near(measured['acd'] + measured['ecd'], 180, 2e-7)
        checks += 5

assert sum(counts.values()) == 1632
print(json.dumps({'scope': 'Independent real-plane numerical check; not a formal proof or exhaustive placement classification',
                  'cases': sum(counts.values()), 'placements': dict(counts), 'checks': checks,
                  'lengthRelativeTolerance': 2e-12, 'maximumRelativeLengthError': maximum_length_error,
                  'angleToleranceDegrees': 2e-7, 'maximumAngleErrorDegrees': maximum_angle_error,
                  'method': 'Python distances, cosine law, Heron area sums and normal projections; TypeScript point outputs only'}, indent=2))
