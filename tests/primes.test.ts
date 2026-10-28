import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  boundedFactors,
  decodePrimes,
  encodePrimes,
  initialPrimes,
  isGivenPrime,
  parseGiven,
  primesJson,
  primeTrial,
  properDivisors,
  proposedPrime,
  readPrimesJson,
  validatePrimes,
} from "../src/core/primes";

test("the six-prime sum remains unresolved through 13 and factors through 100", () => {
  const a = primeTrial(initialPrimes);
  assert.equal(a.multiple, 30030n);
  assert.equal(a.number, 30031n);
  assert.equal(a.search.classification, "unresolved");
  assert.equal(a.search.complete, false);
  assert.deepEqual(a.search.tested, [2, 3, 5, 7, 11, 13]);
  const b = primeTrial({ ...initialPrimes, limit: 100 });
  assert.equal(b.search.classification, "composite");
  assert.equal(b.search.complete, true);
  assert.deepEqual(b.witnesses, [59n, 509n]);
  for (const r of b.rows) {
    assert.equal(r.prime * r.copies, b.multiple);
    assert.equal(r.remainder, 1n);
  }
});
test("the source's prime branch and a smaller new divisor are distinct", () => {
  const a = primeTrial({ ...initialPrimes, primes: ["2", "3", "5"] });
  assert.equal(a.number, 31n);
  assert.equal(a.search.classification, "prime");
  const b = primeTrial({ ...initialPrimes, primes: ["3", "5", "7"] });
  assert.equal(b.number, 106n);
  assert.deepEqual(b.witnesses, [2n, 53n]);
  assert.ok(b.witnesses[0] !== undefined && b.given.every((p) => p > (b.witnesses[0] as bigint)));
});
test("partial factorization establishes composite without claiming the cofactor prime", () => {
  const n = 2n * 100003n ** 2n,
    a = boundedFactors(n, 13);
  assert.equal(a.classification, "composite");
  assert.equal(a.complete, false);
  assert.deepEqual(a.factors, [{ prime: 2n, exponent: 1 }]);
  assert.equal(a.cofactor, 100003n ** 2n);
});
test("exact square boundary never calls a prime square prime", () => {
  for (const p of [2, 3, 7, 13, 59, 97, 997, 99991]) {
    const a = boundedFactors(BigInt(p) ** 2n, p);
    assert.equal(a.classification, "composite");
    assert.equal(a.complete, true);
    assert.deepEqual(a.factors, [{ prime: BigInt(p), exponent: 2 }]);
  }
});
test("given primality is exact through the declared ceiling; unit and pseudoprimes rejected", () => {
  for (const p of [2n, 3n, 59n, 509n, 9999999967n]) assert.equal(isGivenPrime(p), true);
  for (const n of [0n, 1n, 4n, 561n, 3215031751n, 99991n ** 2n, 10000000000n, 10000000001n])
    assert.equal(isGivenPrime(n), false);
  for (const text of ["", "1,2", "2,2", "2,4", "2e3", "02", "-3", "9999999999999999999"])
    assert.throws(() => parseGiven(text));
});
test("strict records and links retain exact strings and reject malformed or ambiguous settings", () => {
  const s = validatePrimes({
    ...initialPrimes,
    primes: ["9999999967", "59"],
    selected: 1,
    limit: 100000,
    descent: [2310, 1155, 385, 77, 11],
    reading: 10,
    page: 253,
  });
  assert.deepEqual(readPrimesJson(primesJson(s)), s);
  assert.deepEqual(decodePrimes(encodePrimes(s)), s);
  for (const primes of [["2,3"], ["2 ", "3"], ["2", "3", "2"]])
    assert.throws(() => validatePrimes({ ...initialPrimes, primes }));
  for (const descent of [
    [2310, 1],
    [2310, 2310],
    [2310, 12],
    [2310, 1155, 385, 11, 7],
  ])
    assert.throws(() => validatePrimes({ ...initialPrimes, descent }));
  assert.throws(() => decodePrimes(`${encodePrimes(s)}&limit=13`));
  assert.throws(() => decodePrimes("?primes=2"));
  assert.throws(() => readPrimesJson(primesJson(s).replace('"version": 2', '"version": 3')));
});
test("a proposed witness needs primality, divisibility and absence for the same H", () => {
  const proposal = (candidate: string) => proposedPrime({ ...initialPrimes, candidate });
  assert.equal(proposal("1")?.primality, "not-prime");
  assert.equal(proposal("1")?.divides, true);
  assert.equal(proposal("1")?.valid, false);
  assert.equal(proposal("13")?.primality, "prime");
  assert.equal(proposal("13")?.divides, false);
  assert.equal(proposal("13")?.absent, false);
  assert.equal(proposal("30031")?.divides, true);
  assert.equal(proposal("30031")?.absent, true);
  assert.equal(proposal("30031")?.primality, "not-prime");
  const h = proposal("59");
  assert.equal(h?.valid, true);
  assert.equal(h?.branch, "composite");
  assert.equal(h?.quotient, 509n);
  const unfinished = proposedPrime({
    ...initialPrimes,
    primes: ["2", "3", "5", "7", "11", "13", "17"],
    candidate: "19",
  });
  assert.equal(unfinished?.valid, true);
  assert.equal(unfinished?.quotient, 97n * 277n);
  assert.equal(unfinished?.branch, "composite");
  assert.equal(primeTrial(initialPrimes).search.classification, "unresolved"); // proposing 59 does not extend the selected search
  const p = proposedPrime({ ...initialPrimes, primes: ["2", "3", "5"], candidate: "31" });
  assert.equal(p?.valid, true);
  assert.equal(p?.branch, "prime");
  assert.equal(proposal("0")?.remainder, null);
  assert.equal(proposal("0")?.valid, false);
});
test("a large untested H cannot be accepted merely because it divides N and is absent", () => {
  const s = { ...initialPrimes, primes: ["9999999967", "9999999943"], candidate: "" };
  s.candidate = String(primeTrial(s).number);
  const h = proposedPrime(s);
  assert.equal(h?.divides, true);
  assert.equal(h?.absent, true);
  assert.equal(h?.primality, "unchecked");
  assert.equal(h?.valid, false);
  for (const candidate of ["01", "-3", "2e2", "1.5", "2".repeat(121)])
    assert.throws(() => validatePrimes({ ...initialPrimes, candidate }));
});
test("the actual published version 1 file and links reopen with an empty proposal", () => {
  const file = readFileSync(
    new URL("../examples/primes/experiment-v1.json", import.meta.url),
    "utf8",
  );
  const original = JSON.parse(file) as { settings: Omit<typeof initialPrimes, "candidate"> };
  const restored = readPrimesJson(file);
  assert.deepEqual(restored, { ...original.settings, candidate: "" });
  assert.deepEqual(decodePrimes(encodePrimes(restored).replace(/&candidate=$/, "")), restored);
  const revised = { ...restored, candidate: "59" };
  assert.deepEqual(readPrimesJson(primesJson(revised)), revised);
  assert.deepEqual(decodePrimes(encodePrimes(revised)), revised);
  assert.throws(() => readPrimesJson(primesJson(revised).replace('"version": 2', '"version": 1')));
});
test("every proper-divisor branch of the 2310 example terminates at a prime dividing the original", () => {
  const visit = (n: number) => {
    const next = properDivisors(n);
    if (!next.length) {
      assert.equal(isGivenPrime(BigInt(n)), true);
      assert.equal(2310 % n, 0);
    }
    for (const d of next) {
      assert.ok(d >= 2 && d < n && n % d === 0);
      visit(d);
    }
  };
  visit(2310);
});
