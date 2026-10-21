"""Independent geometric checks of exported coordinates; no app imports.

Cosine-law angles, circle equations, projection onto the normalized ray sum,
triangle inequalities, orientation and an arithmetic midpoint oracle check the
constructed results. These are real-plane numerical checks, not axiomatic proofs.
"""
import json
import math
import sys
from collections import Counter
from pathlib import Path

counts = Counter()
checks = 0
maximum = 0.0
TOLERANCE = 5e-10

def length(a,b):
    return math.dist((a['x'],a['y']),(b['x'],b['y']))

def orient(a,b,c):
    return (b['x']-a['x'])*(c['y']-a['y'])-(b['y']-a['y'])*(c['x']-a['x'])

def near(x,y,scale=1):
    global checks,maximum
    error = abs(x-y)/max(scale,abs(x),abs(y))
    assert error < TOLERANCE, (x,y,error)
    maximum=max(maximum,error)
    checks+=1

def truth(condition):
    global checks
    assert condition, dict(counts)
    checks+=1

def angle(a,b,c):
    ab,bc,ac=length(a,b),length(b,c),length(a,c)
    return math.degrees(math.acos(max(-1,min(1,(ab*ab+bc*bc-ac*ac)/(2*ab*bc)))))

for line in sys.stdin:
    x=json.loads(line)
    kind=x['kind']
    counts[kind]+=1
    if kind.startswith('I.8'):
        ab,ac,bc=x['lengths']
        # Integer percentages establish the exact inequality independently of float rounding.
        p,q,r=x['percentages']
        valid=min(p,q,r)>0 and p+q>r and p+r>q and q+r>p
        if kind=='I.8-rejected':
            truth(not valid)
            continue
        truth(valid)
        a,b,c=[x[k] for k in 'abc']
        near(length(a,b),ab);near(length(a,c),ac);near(length(b,c),bc)
        truth(orient(b,c,a)*x['side']>0)
        continue
    a,b,c,d=[x[k] for k in 'abcd']
    if kind=='I.7':
        near(length(a,c),length(a,d))
        if x['mirror']:
            near(length(b,c),length(b,d));truth(orient(a,b,c)*orient(a,b,d)<0)
            truth(not x['sameSide']);truth(x['distinct'])
        elif x['turn']==0:
            near(length(c,d),0,x['size']);truth(not x['distinct'])
        else:
            truth(x['sameSide'] and x['distinct'])
            truth(abs(length(b,c)-length(b,d))>1e-5)
            near(angle(a,c,d),angle(a,d,c))
            # Every displayed member of the printed whole/part chain must hold.
            truth(angle(a,c,d)>angle(d,c,b))
            truth(angle(c,d,b)>angle(a,d,c))
            truth(angle(c,d,b)>angle(d,c,b))
        continue
    if kind=='I.10':
        z=x['auxiliary']
        near(d['x'],(a['x']+b['x'])/2,x['size']);near(d['y'],(a['y']+b['y'])/2,x['size'])
        near(length(a,d),length(b,d))
        near(orient(c,z,d),0,x['size']**2)
        near(length(a,c),x['size']);near(length(b,c),x['size'])
        near(length(a,z),x['size']);near(length(b,z),x['size'])
        near(angle(a,c,d),30);near(angle(d,c,b),30)
        truth(orient(a,b,c)*orient(a,b,z)<0)
        continue
    e,z,other=[x[k] for k in ['e','z','other']]
    r=x['fraction']*x['size']
    near(length(a,d),r);near(length(a,e),r)
    near(length(a,e)+length(e,c),length(a,c))
    # E was produced by I.3, including its I.2 copy, rather than a reflected endpoint.
    copied=x['cut']['copy']
    near(length(a,copied['l']),r)
    de=length(d,e)
    for vertex in [z,other]:
        near(length(d,vertex),de);near(length(e,vertex),de)
    truth(orient(d,e,a)*orient(d,e,z)<0)
    near(angle(d,a,z),x['included']/2);near(angle(z,a,e),x['included']/2)
    u=[(b[k]-a[k])/length(a,b)+(c[k]-a[k])/length(a,c) for k in ['x','y']]
    w=[z[k]-a[k] for k in ['x','y']]
    near(u[0]*w[1]-u[1]*w[0],0,x['size'])
    truth(sum(p*q for p,q in zip(u,w))>0)
    expected='internal' if x['included']<60 else 'collapsed' if x['included']==60 else 'opposite'
    truth(x['otherKind']==expected)
    if expected=='collapsed':near(length(a,other),0,x['size'])
    else:
        target=x['included']/2 if expected=='internal' else 180-x['included']/2
        near(angle(d,a,other),target);near(angle(other,a,e),target)

truth(counts=={'I.7':576,'I.8':144,'I.8-rejected':112,'I.9':378,'I.10':126})
report={'scope':'Real-plane numerical model, not a formal axiomatic proof',
        'method':'Independent cosine-law angles, circle equations, ray-sum direction, orientation, strict triangle inequalities and midpoint oracle; I.3 copied length also checked',
        'cases':dict(counts),'checks':checks,'maximum_relative_error':maximum,'tolerance':TOLERANCE}
Path('docs/bisection-oracle.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
