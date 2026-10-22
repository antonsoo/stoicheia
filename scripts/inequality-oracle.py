"""Independent Decimal(60) ray, circle-radius and strict-containment checks.

Application coordinates are inputs; no application construction is imported.
Expected cut/copy points use normalized vectors, not I.2 or circle intersections.
"""
import json, sys, math
from decimal import Decimal as D, getcontext
getcontext().prec = 60
counts = {}; checks = 0; worst = D(0)
def point(p): return D(str(p['x'])), D(str(p['y']))
def sub(a,b): return a[0]-b[0], a[1]-b[1]
def add(a,b): return a[0]+b[0], a[1]+b[1]
def scale(a,k): return a[0]*k,a[1]*k
def dot(a,b): return a[0]*b[0]+a[1]*b[1]
def cross(a,b): return a[0]*b[1]-a[1]*b[0]
def length(a,b): return dot(sub(a,b),sub(a,b)).sqrt()
def angle(a,b,c):
 u,v=sub(a,b),sub(c,b)
 return math.atan2(abs(float(cross(u,v))),float(dot(u,v)))
def near(a,b,s):
 global checks,worst
 checks+=1; error=abs(a-b)/s;worst=max(worst,error)
 assert error<D('2e-10'),(a,b,error)
def inside(first,middle,last):
 global checks
 orientation=cross(first,last)
 checks+=2
 assert cross(first,middle)*orientation>0
 assert cross(middle,last)*orientation>0
for line in sys.stdin:
 r=json.loads(line);kind=r['kind'];counts[kind]=counts.get(kind,0)+1
 a,b,c,d=[point(r[k]) for k in ('a','b','c','d')];s=D(str(r['size']))
 ab,ac,bc=length(a,b),length(a,c),length(b,c)
 if kind=='I.18':
  expected=add(a,scale(sub(c,a),ab/ac))
  near(length(a,d),ab,s);near(length(a,d)+length(d,c),ac,s)
  assert D(0)<length(a,d)<ac;checks+=1
  near(D(str(angle(a,d,b))),D(str(angle(a,b,d))),D(1))
  assert angle(a,d,b)>angle(d,c,b);checks+=1
  inside(sub(a,b),sub(d,b),sub(c,b))
  assert angle(a,b,c)>angle(a,c,b);checks+=1
 else:
  expected=add(a,scale(sub(a,b),ac/ab))
  near(length(a,d),ac,s);near(length(b,d),ab+ac,s)
  inside(sub(b,c),sub(a,c),sub(d,c))
  near(D(str(angle(a,d,c))),D(str(angle(a,c,d))),D(1))
  assert angle(b,c,d)>angle(b,d,c);checks+=1
  assert length(b,d)>bc;checks+=1
 for i in [0,1]:near(d[i],expected[i],s)
print(json.dumps({'scope':'Independent Decimal(60) normalized-vector cut/copy, segment addition, isosceles angles and strict determinant containment. Numerical evidence, not a formal axiomatic proof.', 'cases':counts,'comparisons':checks,'maximum_relative_error':float(worst),'tolerance':2e-10},indent=2))
