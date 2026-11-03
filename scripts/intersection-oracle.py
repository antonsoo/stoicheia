"""Recheck exported coordinates as points using Python's independent Fraction/Decimal."""
import json
import sys
from decimal import Decimal, localcontext
from fractions import Fraction as F

count = 0
for line in sys.stdin:
    case = json.loads(line)
    x, y = F(case['x']), F(case['y'])
    first, second = x*x + y*y, (x-1)*(x-1) + y*y
    assert first == F(case['first']) == 1, case
    assert second == F(case['second']), case
    assert second - 1 == F(case['residual']) != 0, case
    # The line from (-1,0) with slope m/n supplies the candidate.
    assert y == F(case['m'], case['n']) * (x + 1), case
    assert int(case['witness']) == (second - 1) * (case['m']**2 + case['n']**2), case
    with localcontext() as ctx:
        ctx.prec = 60
        length = (Decimal(second.numerator) / Decimal(second.denominator)).sqrt()
        assert abs(Decimal(case['shown']) - length) <= Decimal('0.00000050001'), case
    count += 1
assert count == 4188, count
print(json.dumps({'oracle': 'Python Fraction point distances and 60-digit Decimal square root', 'cases': count, 'passed': True}))
