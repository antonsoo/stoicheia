"""Independent exact-rational area and line-intersection checks, from exported coordinates."""
import json
import sys
from fractions import Fraction as F

counts = {'complement': 0, 'gnomon': 0}
max_error = 0.0

def near(actual, expected):
    global max_error
    error = abs(float(actual) - float(expected))
    max_error = max(max_error, error)
    assert error < 2e-12, (actual, expected, error)

def area(poly):
    points = [(F(str(x)), F(str(y))) for x, y in poly]
    return abs(sum(x * points[(i+1) % len(points)][1] - y * points[(i+1) % len(points)][0]
                   for i, (x, y) in enumerate(points))) / 2

for line in sys.stdin:
    case = json.loads(line)
    s, m = case['state'], case['model']
    counts[case['kind']] += 1
    if case['kind'] == 'complement':
        u, v = F(s['u'], 100), F(s['v'], 100)
        left, right = 60*u*(1-v), 60*(1-u)*v
        near(m['leftArea'], left)
        near(m['rightArea'], right)
        near(area(m['left']), left)
        near(area(m['right']), right)
        near(m['difference'], left-right)
        assert m['onDiagonal'] == (s['u'] == s['v'])
        # Each small parallelogram still has equal diagonal halves off the big diagonal.
        for i, expected in enumerate([30*u*v, 30*u*v, 30*(1-u)*(1-v), 30*(1-u)*(1-v)]):
            near(area(m['triangles'][i]), expected)
        if u == v:
            near(30-area(m['triangles'][0])-area(m['triangles'][3]), left)
        else:
            assert left != right
    else:
        a, b = F(max(s['a'], s['b']), 10), F(min(s['a'], s['b']), 10)
        half, gap = (a+b)/2, (a-b)/2
        expected = {'GT': gap*b, 'TZ': gap*b, 'DM': b*b,
                    'GM': half*b, 'DZ': half*b, 'AL': half*b,
                    'AT': a*b, 'LH': gap*gap, 'square': half*half, 'gnomon': a*b}
        for name, value in expected.items():
            near(area(m['regions'][name]), value)
        # Intersect the line from B to E with x = a, using its endpoint equation.
        B, E = m['points']['B'], m['points']['E']
        t = (a-F(str(B[0]))) / (F(str(E[0]))-F(str(B[0])))
        y = F(str(B[1])) + t*(F(str(E[1]))-F(str(B[1])))
        near(y, b)
        near(m['points']['T'][1], y)
        assert a*b+gap*gap == half*half
        assert m['equal'] == (s['a'] == s['b'])

assert counts == {'complement': 25205, 'gnomon': 22801}, counts
print(json.dumps({'counts': counts, 'maximumAbsoluteError': max_error,
                  'method': 'Exact rational parameter areas, coordinate shoelace areas and an independent diagonal-line intersection. Includes every cut pair, five shears and every input-length pair.'}, indent=2))
