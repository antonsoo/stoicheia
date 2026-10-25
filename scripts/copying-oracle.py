#!/usr/bin/env python3
"""Independent side, determinant, Heron-area and orientation checks."""
import json
import math
import sys
from decimal import Decimal, localcontext

cases=checks=0
kinds=set()
def close(a,b,tol=2e-8):
    assert abs(a-float(b))<tol,(a,b)
def length(a,b):return math.hypot(a['x']-b['x'],a['y']-b['y'])
def angle(a,b,c):
    ux,uy=a['x']-b['x'],a['y']-b['y']
    vx,vy=c['x']-b['x'],c['y']-b['y']
    return math.degrees(math.atan2(abs(ux*vy-uy*vx),ux*vx+uy*vy))
for line in sys.stdin:
    c=json.loads(line);m=c['model'];scene=c['scene'];cases+=1
    if c['kind']=='triangle':
        a,b,d=c['a'],100,c['c']
        expected='separate' if a+d<b else 'external-tangent' if a+d==b else 'contained' if abs(a-d)>b else 'internal-tangent' if abs(a-d)==b else 'crossing'
        assert m['kind']==expected;kinds.add(expected)
        margins=[a+b-d,a+d-b,b+d-a]
        assert (expected=='crossing')==all(n>0 for n in margins)
        with localcontext()as ctx:
            ctx.prec=60
            lengths=[Decimal(n)*Decimal(c['size'])/100 for n in [a,b,d]]
            p=sum(lengths)/2
            area=(p*math.prod(p-v for v in lengths)).sqrt() if expected=='crossing' else Decimal(0)
            close(m['area'],area)
        if expected=='crossing':
            close(length(m['z'],m['k']),m['a']);close(length(m['h'],m['k']),m['c'])
            close(abs(m['z']['x']*(m['h']['y']-m['k']['y'])+m['h']['x']*(m['k']['y']-m['z']['y'])+m['k']['x']*(m['z']['y']-m['h']['y']))/2,area)
        else:assert scene['warning']
        for segment in scene['segments']:
            if segment['id']=='ZH':close(length(segment['a'],segment['b']),c['size'])
        checks+=8
    else:
        close(length(m['gamma'],m['delta']),length(m['a'],m['z']))
        close(length(m['gamma'],m['epsilon']),length(m['a'],m['h']))
        close(length(m['delta'],m['epsilon']),length(m['z'],m['h']))
        close(angle(m['delta'],m['gamma'],m['epsilon']),c['opening'])
        close(angle(m['z'],m['a'],m['h']),c['opening'])
        close(m['copied'],c['opening'])
        vx,vy=m['h']['x']-m['a']['x'],m['h']['y']-m['a']['y']
        wx,wy=m['z']['x']-m['a']['x'],m['z']['y']-m['a']['y']
        assert math.copysign(1,vx*wy-vy*wx)==c['side']*(-1 if c['reflected'] else 1)
        close(angle({'x':m['a']['x']+1,'y':m['a']['y']},m['a'],m['h']),abs(c['tilt']))
        assert all(t>0 for t in [m['first']+m['second']-m['base'],m['first']+m['base']-m['second'],m['second']+m['base']-m['first']])
        assert not scene['warning']
        checks+=10
    for circle in scene['circles']:
        x,y,r=circle['center']['x'],circle['center']['y'],circle['radius']
        assert scene['bounds'][0] <= x-r and scene['bounds'][2] >= x+r
        assert scene['bounds'][1] <= y-r and scene['bounds'][3] >= y+r
        checks+=4
    for p in scene['vertices']:
        assert scene['bounds'][0]<=p['at']['x']<=scene['bounds'][2]
        assert scene['bounds'][1]<=p['at']['y']<=scene['bounds'][3]
        checks+=2
assert cases==712,cases
assert len(kinds)==5,kinds
print(f'{cases} complete independent constructions / {checks} side, area, angle, branch and bounds checks passed.')
