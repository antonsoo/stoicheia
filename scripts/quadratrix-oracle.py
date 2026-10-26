#!/usr/bin/env python3
"""Independent 80-digit line intersections and endpoint distances; standard library only."""
from decimal import Decimal as D, localcontext
import argparse
import csv
import json
from pathlib import Path
import sys


def arctan(x):
    term = x
    total = x
    n = 1
    while abs(term) > D('1e-85'):
        term *= -x*x
        total += term / (2*n+1)
        n += 1
    return total


def trig(x):
    st, ct = x, D(1)
    sine, cosine = st, ct
    for n in range(1, 110):
        st *= -x*x / ((2*n)*(2*n+1))
        ct *= -x*x / ((2*n-1)*(2*n))
        sine += st
        cosine += ct
        if abs(st)+abs(ct) < D('1e-85'):
            return sine, cosine
    raise AssertionError('Series did not converge')


with localcontext() as ctx:
    ctx.prec = 90
    pi = 16*arctan(D(1)/5)-4*arctan(D(1)/239)
    clock = 1000000

    def oracle(tick, timing):
        duration = {'together': clock, 'rotation-first': 900000, 'slider-first': 1100000}[timing]
        height = D(clock-tick)/clock
        if tick >= duration:
            return ('coincident' if tick == clock else 'parallel'), None
        angle = pi*D(duration-tick)/(2*duration)
        sine, cosine = trig(angle)
        # Solve y=h, sin(theta)*x-cos(theta)*y=0 by determinants.
        a, b, c = D(0), D(1), height
        d, e, f = sine, -cosine, D(0)
        det = a*e-b*d
        x = (c*e-b*f)/det
        y = (a*f-c*d)/det
        if tick == 0:
            x = D(0)
        return 'point', (x, y)

    def close(actual, expected, relative='4e-13', absolute='2e-15'):
        assert actual is not None
        assert abs(D(str(actual))-expected) <= max(abs(expected)*D(relative), D(absolute)), (actual, str(expected))

    parser = argparse.ArgumentParser()
    parser.add_argument('--browser', type=Path)
    args = parser.parse_args()
    cases = 0
    diagrams = 0
    relations = {'point': 0, 'parallel': 0, 'coincident': 0}
    if args.browser:
        report = json.loads(args.browser.read_text())
        for config in report['configurations']:
            for drawing in config['geometry']:
                frame = drawing['square']
                assert frame['width'] == frame['height'] > 0
                size = D(str(frame['width']))
                origin = (D(str(frame['x'])), D(str(frame['y']))+size)

                def world(x, y):
                    return (D(str(x))-origin[0])/size, (origin[1]-D(str(y)))/size

                kind, point = oracle(drawing['tick'], drawing['timing'])
                slider = drawing['slider']
                ray = drawing['ray']
                sx, sy = world(slider['x1'], slider['y1'])
                _, sy2 = world(slider['x2'], slider['y2'])
                close(sx, D(0)); close(sy, D(clock-drawing['tick'])/clock, absolute='2e-7')
                close(sy2, sy)
                rx, ry = world(ray['x2'], ray['y2'])
                duration = {'together': clock, 'rotation-first': 900000, 'slider-first': 1100000}[drawing['timing']]
                angle = pi*max(0, duration-drawing['tick'])/(2*duration)
                sine, cosine = trig(angle)
                close(rx, 2*cosine, absolute='2e-7')
                close(ry, 2*sine, absolute='2e-7')
                if point and D(0) <= point[0] <= D(1):
                    marker = drawing['marker']; assert marker is not None
                    mx, my = world(marker['x'], marker['y'])
                    close(mx, point[0]); close(my, point[1])
                else:
                    assert drawing['marker'] is None
                diagrams += 1
            for relative in config['csv']:
                with (args.browser.parent/relative).open(newline='') as source:
                    for row in csv.DictReader(source):
                        if row['record'] == 'continuous_extension':
                            assert row['relation'] == 'limit_not_crossing'
                            assert row['crossing_x'] == row['crossing_y'] == ''
                            close(row['limit_x'], 2/pi)
                            continue
                        kind, point = oracle(int(row['tick']), row['timing'])
                        assert row['relation'] == kind
                        if point:
                            close(row['crossing_x'], point[0])
                            close(row['crossing_y'], point[1])
                        else:
                            assert row['crossing_x'] == row['crossing_y'] == ''
                        relations[kind] += 1
                        cases += 1
    else:
        for line in sys.stdin:
            r = json.loads(line)
            state, actual = r['state'], r['motion']
            kind, point = oracle(state['tick'], state['timing'])
            assert actual['kind'] == kind
            if point:
                close(actual['point']['x'], point[0])
                close(actual['point']['y'], point[1])
            else:
                assert actual['point'] is None
            if r['deficit'] is not None:
                close(r['deficit'], 2/pi-point[0], relative='8e-12', absolute='1e-27')
            relations[kind] += 1
            cases += 1
    print(json.dumps({'cases': cases, 'actual_svg_diagrams': diagrams, 'relations': relations, 'precision': ctx.prec,
                      'method': 'Machin pi; sine/cosine Taylor series; independent determinant intersection',
                      'status': 'passed'}, indent=2))
