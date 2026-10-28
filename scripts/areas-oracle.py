"""Independent polygon shoelace/Fraction audit and Decimal root comparison."""
from decimal import Decimal, localcontext
from fractions import Fraction as F
from math import isqrt
import json
import sys

count = 0
for line in sys.stdin:
    r = json.loads(line)
    s = r['state']
    a, t, c = F(s['base']), F(s['trial']), F(s['target'])
    k = {'half': F(1, 2), 'equal': F(1), 'double': F(2)}[s['shape']]
    h = k * t
    shift = F(s['shear'], 100) * h
    b = a - t if s['mode'] == 'short' else a + t
    # Independent area from the actual four world-coordinate vertices.
    vertices = [(F(0), F(0)), (b, F(0)), (b + shift, h), (shift, h)]
    shoelace = abs(sum(vertices[i][0] * vertices[(i + 1) % 4][1] - vertices[(i + 1) % 4][0] * vertices[i][1] for i in range(4))) / 2
    assert shoelace == F(r['area'])
    assert shoelace - c == F(r['residual'])
    maximum = k * a * a / 4
    assert maximum == F(r['maximum'])
    expected_count = (0 if c > maximum else 1 if c == maximum else 2) if s['mode'] == 'short' else 1
    assert len(r['fits']) == expected_count
    assert r['exactFit'] == (shoelace == c)
    assert r['degenerate'] == (t == 0 or b == 0)
    disc = a*a + (-4 if s['mode'] == 'short' else 4) * c/k
    assert disc == F(r['discriminant'])
    for i, fit in enumerate(r['fits']):
        with localcontext() as ctx:
            ctx.prec = 70
            dec = lambda f: Decimal(f.numerator)/Decimal(f.denominator)
            root = dec(disc).sqrt()
            expected = (dec(a) - root)/2 if s['mode'] == 'short' and i == 0 else (dec(a) + root)/2 if s['mode'] == 'short' else (root - dec(a))/2
            lo, hi = F(fit['lower']), F(fit['upper'])
            if fit['exact']:
                v = F(fit['exact'])
                assert lo == hi == v
                assert k*v*(a-v if s['mode']=='short' else a+v) == c
                assert abs(dec(v)-expected) < Decimal('1e-60')
            else:
                assert dec(lo) < expected < dec(hi)
                assert hi-lo == F(1, 1000000)
                assert isqrt(disc.numerator)**2 != disc.numerator or isqrt(disc.denominator)**2 != disc.denominator
    count += 1
assert count == 2268, count
print(json.dumps({'cases': count, 'oracles': ['exact polygon shoelace', 'Python Fraction', '70-digit Decimal roots'], 'status': 'passed'}, indent=2))
