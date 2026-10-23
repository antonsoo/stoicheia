"""Independent Heron-area and distance checks at 70 decimal digits; no app imports."""
import json
import sys
from collections import Counter
from decimal import Decimal, getcontext

getcontext().prec = 70
counts = Counter()
max_error = Decimal(0)
for line in sys.stdin:
    case = json.loads(line)
    a, b, c = [Decimal(case[key]) / 10 for key in ('a', 'b', 'c')]
    m = case['model']
    ordered = sorted([a, b, c])
    margin = ordered[0] + ordered[1] - ordered[2]
    possible = margin > 0
    assert possible == (m['kind'] == 'crossing'), case
    if margin == 0:
        assert m['kind'].endswith('tangent'), case
    if margin < 0:
        assert m['intersection'] is None, case
    if possible:
        semiperimeter = (a + b + c) / 2
        area = (semiperimeter * (semiperimeter-a) * (semiperimeter-b) * (semiperimeter-c)).sqrt()
        height = 2 * area / b
        area_error = abs(Decimal(str(m['area'])) - area)
        height_error = abs(Decimal(str(m['height'])) - height)
        max_error = max(max_error, area_error, height_error)
        assert area_error < Decimal('1e-12'), case
        assert height_error < Decimal('1e-12'), case
    if m['intersection']:
        x, y = Decimal(str(m['intersection']['x'])), Decimal(str(m['intersection']['y']))
        errors = [abs((x*x+y*y).sqrt()-a), abs(((x-b)**2+y*y).sqrt()-c)]
        max_error = max(max_error, *errors)
        assert max(errors) < Decimal('1e-12'), case
    counts[m['kind']] += 1
assert sum(counts.values()) > 12000
print(json.dumps({'method':'70-digit Heron area, sorted side criterion and circle distance residuals', 'cases':sum(counts.values()), 'outcomes':dict(counts), 'maximum_absolute_error':str(max_error), 'tolerance':'1e-12', 'limitation':'Numerical model verification, not formal axiomatic proof'}, indent=2))
