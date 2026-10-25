#!/usr/bin/env python3
import json
import math
from pathlib import Path
import sys
r=json.loads(Path(sys.argv[1]).read_text())
checks=views=0
def dist(a,b):return math.hypot(a['x']-b['x'],a['y']-b['y'])
def angle(a,b,c):
    u=(a['x']-b['x'],a['y']-b['y']);v=(c['x']-b['x'],c['y']-b['y'])
    return math.degrees(math.atan2(abs(u[0]*v[1]-u[1]*v[0]),u[0]*v[0]+u[1]*v[1]))
def cross(a,b,c):return (a['x']-b['x'])*(c['y']-b['y'])-(a['y']-b['y'])*(c['x']-b['x'])
for config in r['configurations']:
    for view in config['views']:
        d,p=view['description'],view['points'];views+=1
        if d['proposition']==23:
            for a,b,c,e in [('Γ','Δ','Α','Ζ'),('Γ','Ε','Α','Η'),('Δ','Ε','Ζ','Η')]:
                assert abs(dist(p[a],p[b])-dist(p[c],p[e]))<.015
                checks+=1
            assert abs(angle(p['Δ'],p['Γ'],p['Ε'])-d['opening'])<.02
            assert abs(angle(p['Ζ'],p['Α'],p['Η'])-d['opening'])<.02
            assert (cross(p['Δ'],p['Γ'],p['Ε'])*cross(p['Ζ'],p['Α'],p['Η'])>0)==(d['variant']==0)
            checks+=3
        elif d['case']=='crossing':
            base=dist(p['Ζ'],p['Η'])
            assert abs(dist(p['Κ'],p['Ζ'])-base*d['a']/100)<.015
            assert abs(dist(p['Κ'],p['Η'])-base*d['c']/100)<.015
            checks+=2
        elif 'tangent' in d['case']:
            assert abs(cross(p['Ζ'],p['Η'],p['Κ']))<.5
            checks+=1
        else:
            assert 'Κ' not in p
            checks+=1
assert views==32,views
print(f'{views} real browser SVG views / {checks} independent distance, angle, tangency and branch checks passed.')
