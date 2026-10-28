"""Independent exact verification using Python integers and a sieve, not production trial division."""
import json
import math
import sys

cases=json.load(sys.stdin)
bound=100000
sieve=bytearray(b"\x01")*(bound+1)
sieve[0:2]=b"\x00\x00"
for n in range(2,math.isqrt(bound)+1):
    if sieve[n]:
        start=n*n
        sieve[start::n]=b"\x00"*(((bound-start)//n)+1)
primes=[n for n in range(2,bound+1) if sieve[n]]

def is_prime(n):
    assert n<=10**10
    return n>=2 and all(n%p for p in primes if p*p<=n)

def audit(n,limit,result):
    factors=[(int(f["prime"]),f["exponent"]) for f in result["factors"]]
    cofactor=int(result["cofactor"])
    assert n==cofactor*math.prod(p**e for p,e in factors)
    assert all(e>=1 and is_prime(p) for p,e in factors)
    assert len(set(p for p,e in factors))==len(factors)
    # Independently strip each sieved prime. The stopping criterion comes from
    # the remaining integer's exact square root, rather than an app status.
    remaining=n
    for p in primes:
        if p>limit:break
        while remaining%p==0:remaining//=p
    if result["complete"]:
        assert cofactor==1
        assert result["classification"]==("prime" if len(factors)==1 and factors[0]==(n,1) else "composite")
    else:
        assert cofactor==remaining and cofactor>1
        assert all(cofactor%p for p in primes if p<=limit)
        assert result["classification"]==("composite" if factors else "unresolved")
    # Every actually recorded trial is a sieved prime inside the requested bound.
    tried=result["tested"]
    assert tried==primes[:len(tried)] and all(p<=limit for p in tried)

classifications={"prime":0,"composite":0,"unresolved":0}
proposals={"verifiedPrimeBranch":0,"verifiedCompositeBranch":0,"rejected":0,"primalityUnchecked":0}
largest=0
for row in cases:
    if row["kind"]=="proposal":
        s=row["settings"];w=row["witness"];given=list(map(int,s["primes"]));h=int(s["candidate"]);m=math.prod(given);n=m+1
        primality="unchecked" if h>10**10 else "prime" if is_prime(h) else "not-prime"
        remainder=n%h if h else None;quotient=n//h if h else None
        valid=primality=="prime" and remainder==0 and h not in given
        assert int(w["h"])==h and int(w["number"])==n and int(w["multiple"])==m
        assert w["primality"]==primality and w["divides"]==(remainder==0) and w["absent"]==(h not in given) and w["valid"]==valid
        assert (int(w["remainder"]) if w["remainder"] is not None else None)==remainder
        assert (int(w["quotient"]) if w["quotient"] is not None else None)==quotient
        branch=("prime" if h==n else "composite") if valid else None
        assert w["branch"]==branch
        proposals["verifiedPrimeBranch" if branch=="prime" else "verifiedCompositeBranch" if branch=="composite" else "primalityUnchecked" if primality=="unchecked" else "rejected"]+=1
        continue
    if row["kind"]=="list":
        s=row["settings"];t=row["trial"];given=list(map(int,s["primes"]))
        assert len(set(given))==len(given) and all(is_prime(p) for p in given)
        m=math.prod(given);n=m+1;limit=s["limit"];result=t["search"]
        assert int(t["multiple"])==m and int(t["number"])==n
        assert [int(v) for v in t["given"]]==given
        for p,r in zip(given,t["rows"],strict=True):
            assert int(r["prime"])==p and int(r["copies"])==m//p and int(r["remainder"])==n%p==1
        assert [int(p) for p in t["witnesses"]]==[int(f["prime"]) for f in result["factors"]]
        assert all(int(p) not in given and n%int(p)==0 for p in t["witnesses"])
    else:n=int(row["number"]);limit=row["limit"];result=row["search"]
    audit(n,limit,result)
    classifications[result["classification"]]+=1
    largest=max(largest,len(str(n)))
print(json.dumps({"cases":len(cases),"listCases":sum(r["kind"]=="list" for r in cases),"directNumbers":sum(r["kind"]=="number" for r in cases),"proposedWitnesses":sum(r["kind"]=="proposal" for r in cases),"proposalResults":proposals,"classifications":classifications,"largestDecimalDigits":largest,"independence":"Python arbitrary integers, Eratosthenes sieve, full factor-product reconstruction and independent prime-divisor checks; no production imports"},indent=2))
