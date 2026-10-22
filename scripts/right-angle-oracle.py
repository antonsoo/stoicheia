"""Independent 60-digit coordinate oracle. Does not import the application.

I.11 checks analytic perpendicular/isosceles relations against an I.2/I.1 chain.
I.12 solves the general line/circle quadratic, then checks I.10's constructed foot
against the analytic projection. I.16 checks analytic midpoints and central
reflections, both SAS correspondences, and strict ray containment via determinants.
"""
import json, sys, math
from decimal import Decimal as D, getcontext
getcontext().prec=60
counts={}; checks=0; worst=D(0); classifications={}
def point(p): return (D(str(p['x'])),D(str(p['y'])))
def add(a,b): return (a[0]+b[0],a[1]+b[1])
def sub(a,b): return (a[0]-b[0],a[1]-b[1])
def mul(a,k): return (a[0]*k,a[1]*k)
def dot(a,b): return a[0]*b[0]+a[1]*b[1]
def cross(a,b): return a[0]*b[1]-a[1]*b[0]
def length(a,b): v=sub(a,b); return dot(v,v).sqrt()
def near(a,b,scale):
 global checks,worst
 error=abs(a-b)/max(D('1e-30'),scale);worst=max(worst,error);checks+=1
 assert error < D('2e-10'),(a,b,error)
def eqpoint(a,b,scale): near(a[0],b[0],scale);near(a[1],b[1],scale)
def inside(start,middle,end):
 # A ray is strictly between the oriented boundary rays of an angle < pi.
 global checks
 sign=cross(start,end);checks+=2
 assert cross(start,middle)*sign>0 and cross(middle,end)*sign>0,(start,middle,end)
for line in sys.stdin:
 r=json.loads(line);kind=r['kind'];counts[kind]=counts.get(kind,0)+1;s=D(str(r['size']));a,b,c=[point(r[k]) for k in ['a','b','c']]
 if kind=='I.11':
  d,e,z=[point(r[k]) for k in ['d','e','z']];u=sub(b,a)
  eqpoint(mul(add(d,e),D('.5')),c,s);near(dot(u,sub(z,c)),D(0),s*s)
  for x,y in [(length(c,d),length(c,e)),(length(d,e),length(d,z)),(length(d,e),length(e,z))]:near(x,y,s)
  near(cross(u,sub(e,a)),D(0),s*s)
 elif kind=='I.12':
  d=point(r['d']);u=sub(b,a);v=sub(a,c);radius=length(c,d)
  alpha=dot(u,u);beta=2*dot(u,v);gamma=dot(v,v)-radius*radius
  discriminant=beta*beta-4*alpha*gamma
  tolerance=D('2e-12')*alpha*s*s
  expected='degenerate' if radius==0 else 'miss' if discriminant < -tolerance else 'tangent' if discriminant <= tolerance else 'crossings'
  actual=r['intersection'];assert actual['kind']==expected,(r,expected,discriminant)
  classifications[expected]=classifications.get(expected,0)+1;checks+=1
  if expected=='crossings':
   roots=[(-beta-discriminant.sqrt())/(2*alpha),(-beta+discriminant.sqrt())/(2*alpha)]
   for got,t in zip(actual['points'],roots):eqpoint(point(got),add(a,mul(u,t)),s)
   foot=add(a,mul(u,-dot(u,v)/alpha));eqpoint(point(r['foot']),foot,s)
   near(dot(sub(c,point(r['foot'])),u),D(0),s*s)
   near(length(point(actual['points'][0]),point(r['foot'])),length(point(actual['points'][1]),point(r['foot'])),s)
  elif expected=='tangent':
   assert len(actual['points'])==1 and 'foot' not in r
  else:assert not actual['points'] and 'foot' not in r
  if r['variant']==0:assert expected=='crossings'
 else:
  e,z,t,k,d,h=[point(r[key]) for key in ['e','z','theta','kappa','d','h']]
  eqpoint(e,mul(add(a,c),D('.5')),s);eqpoint(z,sub(add(a,c),b),s)
  eqpoint(t,mul(add(b,c),D('.5')),s);eqpoint(k,sub(add(b,c),a),s)
  for x,y in [(length(a,e),length(c,e)),(length(b,e),length(z,e)),(length(a,b),length(c,z)),(length(b,t),length(c,t)),(length(a,t),length(k,t)),(length(a,b),length(c,k))]:near(x,y,s)
  inside(sub(a,c),sub(z,c),sub(d,c));inside(sub(b,c),sub(k,c),sub(h,c))
  def angle(u,v):return math.degrees(math.atan2(abs(float(cross(u,v))),float(dot(u,v))))
  exterior=angle(sub(a,c),sub(d,c));interior_a=angle(sub(b,a),sub(c,a));interior_b=angle(sub(a,b),sub(c,b))
  assert exterior>interior_a and exterior>interior_b;checks+=2
print(json.dumps({'scope':'Independent Decimal(60) quadratic/projection, analytic midpoint/reflection and determinant containment checks; numerical evidence, not a formal axiomatic proof','cases':counts,'circle_classifications':classifications,'comparisons':checks,'maximum_relative_error':float(worst),'tolerance':2e-10},indent=2))
