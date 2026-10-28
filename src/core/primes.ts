/** Exact, bounded arithmetic for the IX.20 reading. No probable-prime decisions. */
export const primePages = [388, 389, 390, 391, 184, 185, 250, 251, 252, 253, 0] as const;
export const primeLimits = [13, 100, 10000, 100000] as const;
export const maxGivenPrime = 10000000000n;
export const maxGivenCount = 12;
export interface PrimeState {
  primes: string[];
  limit: number;
  selected: number;
  reading: number;
  page: number;
  descent: number[];
}
export const initialPrimes: PrimeState = {
  primes: ["2", "3", "5", "7", "11", "13"],
  limit: 13,
  selected: 5,
  reading: 0,
  page: 388,
  descent: [2310],
};
const sieve = new Uint8Array(100001);
export const trialPrimes: readonly number[] = (() => {
  const result: number[] = [];
  for (let n = 2; n <= 100000; n++) {
    if (sieve[n]) continue;
    result.push(n);
    for (let k = n * n; k <= 100000; k += n) sieve[k] = 1;
  }
  return result;
})();
export function isGivenPrime(n: bigint): boolean {
  if (n < 2n || n > maxGivenPrime) return false;
  for (const p of trialPrimes) {
    const d = BigInt(p);
    if (d * d > n) return true;
    if (n % d === 0n) return n === d;
  }
  return true; // every possible prime divisor through sqrt(10^10) was checked
}
export function parseGiven(text: string): string[] {
  const values = text
    .trim()
    .split(/[\s,;]+/)
    .filter(Boolean);
  if (!values.length || values.length > maxGivenCount)
    throw new Error("Choose between one and twelve distinct primes.");
  const seen = new Set<string>();
  for (const value of values) {
    if (!/^[1-9]\d{0,10}$/.test(value) || BigInt(value) > maxGivenPrime)
      throw new Error("Each given prime must be a whole number from 2 through 10,000,000,000.");
    if (!isGivenPrime(BigInt(value)))
      throw new Error(`${value} is not a prime. The given list must contain primes; 1 is a unit.`);
    if (seen.has(value)) throw new Error(`${value} occurs twice. Use distinct given primes.`);
    seen.add(value);
  }
  return values;
}
export function properDivisors(n: number): number[] {
  if (!Number.isSafeInteger(n) || n < 2 || n > 2310)
    throw new Error("Descent number is outside this example.");
  const result = new Set<number>();
  for (let d = 2; d * d <= n; d++)
    if (n % d === 0) {
      result.add(d);
      result.add(n / d);
    }
  return [...result].sort((a, b) => b - a);
}
export function validatePrimes(value: PrimeState): PrimeState {
  const keys = ["descent", "limit", "page", "primes", "reading", "selected"];
  if (!value || typeof value !== "object" || Object.keys(value).sort().join() !== keys.join())
    throw new Error("This experiment needs exactly the six documented settings.");
  if (
    !Array.isArray(value.primes) ||
    value.primes.some((p) => typeof p !== "string" || !/^[1-9]\d{0,10}$/.test(p))
  )
    throw new Error("Given primes must be decimal strings, preserving every digit.");
  const primes = parseGiven(value.primes.join(","));
  if (!primeLimits.includes(value.limit as (typeof primeLimits)[number]))
    throw new Error("Choose a supported trial-divisor bound.");
  if (!Number.isInteger(value.selected) || value.selected < 0 || value.selected >= primes.length)
    throw new Error("Choose a given prime to inspect.");
  if (!Number.isInteger(value.reading) || value.reading < 0 || value.reading > 10)
    throw new Error("Unknown reading.");
  if (!primePages.includes(value.page as (typeof primePages)[number]))
    throw new Error("Unknown source page.");
  if (
    !Array.isArray(value.descent) ||
    value.descent.length < 1 ||
    value.descent.length > 12 ||
    value.descent[0] !== 2310
  )
    throw new Error("The separate descent must start at 2310.");
  value.descent.forEach((n, i) => {
    if (
      !Number.isSafeInteger(n) ||
      n < 2 ||
      (i > 0 && !properDivisors(value.descent[i - 1] as number).includes(n))
    )
      throw new Error(
        "Every descent step must be a proper divisor greater than one of its predecessor.",
      );
  });
  return { ...value, primes, descent: [...value.descent] };
}
export interface PrimeFactor {
  prime: bigint;
  exponent: number;
}
export interface FactorSearch {
  factors: PrimeFactor[];
  cofactor: bigint;
  complete: boolean;
  classification: "prime" | "composite" | "unresolved";
  tested: number[];
  stopping: string;
}
export function boundedFactors(n: bigint, limit: number): FactorSearch {
  if (n < 2n || !Number.isInteger(limit) || limit < 2 || limit > 100000)
    throw new Error("Factor search is outside its exact bounds.");
  let remaining = n;
  const factors: PrimeFactor[] = [],
    tested: number[] = [];
  let complete = false,
    stopping = "";
  for (const p of trialPrimes) {
    if (p > limit || remaining === 1n) break;
    const d = BigInt(p);
    if (d * d > remaining) {
      stopping = `${p}² > ${remaining}; every smaller prime trial divisor has been excluded or removed.`;
      factors.push({ prime: remaining, exponent: 1 });
      remaining = 1n;
      complete = true;
      break;
    }
    tested.push(p);
    let exponent = 0;
    while (remaining % d === 0n) {
      exponent++;
      remaining /= d;
    }
    if (exponent) factors.push({ prime: d, exponent });
  }
  if (remaining === 1n) {
    complete = true;
    stopping ||= "All of the number has been divided into proven prime factors.";
  }
  // The next prime may exceed the requested bound but still certify that no
  // possible divisor remains. No extra trial division is performed here.
  if (!complete) {
    const next = trialPrimes.find((p) => p > limit);
    if (next !== undefined && BigInt(next) ** 2n > remaining) {
      stopping = `${next}² > ${remaining}; no unchecked prime could be a divisor at or below its square root.`;
      factors.push({ prime: remaining, exponent: 1 });
      remaining = 1n;
      complete = true;
    } else
      stopping = `Trial divisors stop at ${limit}. The remaining cofactor has not been classified.`;
  }
  const classification =
    complete && factors.length === 1 && factors[0]?.prime === n && factors[0].exponent === 1
      ? "prime"
      : factors.length
        ? "composite"
        : "unresolved";
  return { factors, cofactor: remaining, complete, classification, tested, stopping };
}
export function primeTrial(s: PrimeState) {
  const given = s.primes.map(BigInt),
    multiple = given.reduce((a, p) => a * p, 1n),
    number = multiple + 1n;
  const search = boundedFactors(number, s.limit);
  const witnesses = search.factors.map((f) => f.prime);
  return {
    given,
    multiple,
    number,
    search,
    witnesses,
    rows: given.map((p) => ({ prime: p, copies: multiple / p, remainder: number % p })),
  };
}
export function primeSourceFile(page: number): string {
  if (!primePages.includes(page as (typeof primePages)[number]))
    throw new Error("Unknown source page.");
  return `sources/primes/heiberg-${page ? String(page).padStart(3, "0") : "title"}.jpg`;
}
export function encodePrimes(s: PrimeState): string {
  validatePrimes(s);
  return `?${new URLSearchParams({ primes: s.primes.join(","), limit: String(s.limit), selected: String(s.selected), reading: String(s.reading), page: String(s.page), descent: s.descent.join(",") })}`;
}
export function decodePrimes(query: string): PrimeState {
  const p = new URLSearchParams(query);
  if (![...p].length) return validatePrimes(structuredClone(initialPrimes));
  const keys = ["primes", "limit", "selected", "reading", "page", "descent"];
  for (const k of p.keys())
    if (!keys.includes(k) || p.getAll(k).length !== 1)
      throw new Error("The link has an unknown or repeated setting.");
  if (keys.some((k) => !p.has(k))) throw new Error("The experiment link is incomplete.");
  const integer = (k: string) => {
    const v = p.get(k) ?? "";
    if (!/^(0|[1-9]\d*)$/.test(v)) throw new Error(`Invalid ${k}.`);
    return Number(v);
  };
  const chain = (p.get("descent") ?? "").split(",");
  if (chain.some((v) => !/^[1-9]\d*$/.test(v))) throw new Error("Invalid descent chain.");
  return validatePrimes({
    primes: (p.get("primes") ?? "").split(","),
    limit: integer("limit"),
    selected: integer("selected"),
    reading: integer("reading"),
    page: integer("page"),
    descent: chain.map(Number),
  });
}
export function primesJson(s: PrimeState): string {
  validatePrimes(s);
  return `${JSON.stringify({ format: "stoicheia-primes", version: 1, settings: s }, null, 2)}\n`;
}
export function readPrimesJson(text: string): PrimeState {
  if (text.length > 12000) throw new Error("This experiment file is too large.");
  const value = JSON.parse(text) as { format?: string; version?: number; settings?: PrimeState };
  if (
    !value ||
    typeof value !== "object" ||
    Object.keys(value).sort().join() !== "format,settings,version" ||
    value.format !== "stoicheia-primes" ||
    value.version !== 1 ||
    !value.settings
  )
    throw new Error("This is not a version 1 Stoicheia prime experiment.");
  return validatePrimes(value.settings);
}
export function primesCsv(s: PrimeState): string {
  const t = primeTrial(s);
  return [
    "section,quantity,value,meaning",
    `construction,M,${t.multiple},product of distinct given primes; also their least common multiple`,
    `construction,N,${t.number},M plus one`,
    ...t.rows.flatMap((r) => [
      `given,prime,${r.prime},given prime`,
      `division,copies_in_M,${r.copies},M divided by ${r.prime}`,
      `division,remainder_in_N,${r.remainder},N modulo ${r.prime}`,
    ]),
    `search,trial_bound,${s.limit},largest permitted trial divisor`,
    `search,trial_count,${t.search.tested.length},prime divisors actually tried`,
    `search,classification,${t.search.classification},bounded exact result`,
    `search,complete,${t.search.complete},complete factorization established`,
    ...t.search.factors.map(
      (f) => `factor,prime_power,${f.prime}^${f.exponent},proven prime factor`,
    ),
    `search,unresolved_cofactor,${t.search.cofactor},one means nothing remains`,
    ...s.descent.map(
      (n, i) => `separate_VII_31,step_${i},${n},proper-divisor chain starting at 2310`,
    ),
    "",
  ].join("\r\n");
}
