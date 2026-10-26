#!/usr/bin/env python3
"""Independent line/circle geometry with Fraction; no application import.

Checks emitted cases or the actual native CSV. Optional rendered detail checks
use 80-digit Decimal circle geometry on the browser's actual SVG coordinates.
"""
import argparse
import csv
from decimal import Decimal, localcontext
from fractions import Fraction as F
import json
from pathlib import Path
import sys


def verify(c):
    p, q = F(c['rise']), F(c['run'])
    h = tuple(map(F, c['foot']))
    k = tuple(map(F, c['second']))
    # Orthogonal projection, full circle equation, and forward-ray parameters.
    assert h[1] * q == h[0] * p
    assert h[0] * q + (h[1] - 1) * p == 0
    distance = h[0] ** 2 + (h[1] - 1) ** 2
    assert distance == F(c['centreDistanceSquared'])
    assert 1 - distance == F(c['deficit'])
    assert k[0] ** 2 + (k[1] - 1) ** 2 == 1
    assert k[1] * q == k[0] * p
    t_h, t_k = F(c['footParameter']), F(c['secondParameter'])
    assert h == (q * t_h, p * t_h)
    assert k == (q * t_k, p * t_k)
    if p > 0:
        assert c['relation'] == 'cuts' and 0 < t_h < t_k and distance < 1
        # A point before the second root lies inside; a later one is outside.
        for t, inside in [(t_k / 3, True), (t_k * 2, False)]:
            assert ((q*t)**2 + (p*t-1)**2 < 1) == inside
    elif p < 0:
        assert c['relation'] == 'away' and t_k < t_h < 0
        for t in [F(1, 10**15), F(1), F(10**15)]:
            assert (q*t)**2 + (p*t-1)**2 > 1
    else:
        assert c['relation'] == 'tangent' and t_h == t_k == 0 and distance == 1


def native(file):
    with open(file, newline='') as f:
        rows = list(csv.reader(f))
    assert rows[0] == ['quantity', 'exact_value', 'meaning']
    data = {r[0]: r[1] for r in rows[1:]}
    assert len(data) == len(rows)-1
    return {
        'rise': int(data['rise_p']), 'run': int(data['run_q']),
        'relation': data['relation'], 'foot': [data['foot_x'], data['foot_y']],
        'second': [data['second_x'], data['second_y']],
        'footParameter': data['foot_parameter'],
        'secondParameter': data['second_parameter'],
        'centreDistanceSquared': data['centre_distance_squared'],
        'deficit': data['radius_squared_minus_distance_squared'],
    }


def rendered(c):
    if not c.get('boundary'):
        return 0
    with localcontext() as ctx:
        ctx.prec = 80
        p, q = Decimal(c['rise']), Decimal(c['run'])
        d = p*p + q*q
        hx, hy = p*q/d, p*p/d
        lower = 1 - (1 - hx*hx).sqrt()
        # The SVG states its crop width as a rounded display label. Its bar
        # and extracted path vertices are actual rendered attributes.
        scale = Decimal(540) / Decimal(c['cropWidth'])
        for sx, sy in c['boundary']:
            wx = hx + (Decimal(str(sx)) - 320) / scale
            wy = hy - (Decimal(str(sy)) - 185) / scale
            expected = 1 - (1 - wx*wx).sqrt()
            # Tolerance is in screen pixels; the label has five significant digits.
            assert abs((wy - expected) * scale) < Decimal('.03'), (c, sx, sy)
        assert hy > lower
    return len(c['boundary'])


parser = argparse.ArgumentParser()
parser.add_argument('--browser', type=Path)
args = parser.parse_args()
if args.browser:
    report = json.loads(args.browser.read_text())
    cases = vertices = 0
    for config in report['configurations']:
        for relative in config['csv']:
            verify(native(args.browser.parent / relative))
            cases += 1
        for drawing in config['drawings']:
            vertices += rendered(drawing)
    print(json.dumps({'native_csvs': cases, 'actual_svg_vertices': vertices,
                      'oracle': 'Fraction and 80-digit Decimal; no application import', 'status': 'passed'}, indent=2))
else:
    cases = [json.loads(line) for line in sys.stdin if line.strip()]
    assert cases
    for c in cases:
        verify(c)
    print(json.dumps({'cases': len(cases), 'oracle': 'independent Fraction vector geometry', 'status': 'passed'}, indent=2))
