import { type PrimeState, primeTrial, properDivisors } from "./core/primes";
import { escapeHtml as esc } from "./html";

export function primeConstruction(s: PrimeState): string {
  const t = primeTrial(s);
  return `<dl class="pr-construction"><div><dt>M · common multiple</dt><dd><span class="pr-exact">${t.multiple}</span><p>${s.primes.join(" × ")}</p></dd></div><div><dt>N · one unit added</dt><dd><span class="pr-exact">${t.number}</span><p>${t.multiple} + 1</p></dd></div></dl>`;
}
export function primeLedger(s: PrimeState, interactive = true): string {
  const t = primeTrial(s);
  return `<table><caption>Each given prime divides M exactly. Each leaves one unit in N.</caption><thead><tr><th scope="col">Given p${interactive ? " · inspect" : ""}</th><th scope="col">Whole copies in M</th><th scope="col">N ÷ p remainder</th></tr></thead><tbody>${t.rows.map((r, i) => `<tr${i === s.selected ? ' class="pr-selected"' : ""}><th scope="row">${interactive ? `<button type="button" data-pr-select="${i}" aria-pressed="${i === s.selected}">p = ${r.prime}</button>` : `p = ${r.prime}`}</th><td>${r.copies}</td><td><strong>${r.remainder}</strong></td></tr>`).join("")}</tbody></table>`;
}
export function primeUnits(s: PrimeState): string {
  const t = primeTrial(s),
    row = t.rows[s.selected];
  if (!row) throw new Error("Missing selected prime.");
  const p = Number(row.prime);
  if (p > 29)
    return `<div class="pr-symbolic"><p>p = ${row.prime}</p><p>The final complete group has ${row.prime} units. It is too large for individual unit marks here.</p><p>Exactly ${row.copies} groups fill M; one added unit remains in N.</p></div>`;
  const size = Math.min(30, 430 / p),
    start = 90,
    last = start + size * p;
  const boxes = (y: number) =>
    Array.from(
      { length: p },
      (_, i) =>
        `<rect x="${start + i * size}" y="${y}" width="${size - 2}" height="28" fill="#386577"/>`,
    ).join("");
  return `<figure class="pr-unit-figure"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 220" role="img" aria-label="Last complete group of ${p} units in M, followed by one additional unit in N. Earlier groups omitted."><g font-family="sans-serif" fill="#183746"><text x="24" y="27" font-size="22">Last group of p = ${p} units</text><text x="24" y="88" font-size="22">M</text>${boxes(67)}<text x="24" y="151" font-size="22">N</text>${boxes(130)}<rect x="${last}" y="130" width="${size - 2}" height="28" fill="#99502d" stroke="#183746" stroke-width="2"/><path d="M${last + size / 2} 163v18h-30" fill="none" stroke="#99502d" stroke-width="2"/><text x="${Math.max(90, last - 100)}" y="204" fill="#99502d" font-size="22">1 added unit</text></g></svg><figcaption>Last complete group: ${p} equal units. ${row.copies - 1n} earlier complete groups omitted. The outlined unit is added to N.</figcaption></figure>`;
}
export function primeEquation(s: PrimeState): string {
  const t = primeTrial(s),
    r = t.rows[s.selected];
  if (!r) throw new Error("Missing division row.");
  return `<p class="pr-equation">${t.multiple} = ${r.prime} × ${r.copies}<br>${t.number} = ${r.prime} × ${r.copies} + <strong>1</strong></p><p>The same quotient leaves one unit. Since p ≥ 2, that remainder is smaller than p and is not zero.</p>`;
}
export function primeResult(s: PrimeState): string {
  const t = primeTrial(s),
    f = t.search;
  const product = f.factors
    .map((x) => `${x.prime}${x.exponent > 1 ? `^${x.exponent}` : ""}`)
    .concat(f.cofactor > 1n ? [`[${f.cofactor} unresolved]`] : []);
  return `<p class="pr-result-kind">${f.classification === "unresolved" ? "Unresolved at this bound" : f.classification === "prime" ? "The sum itself is prime" : "The sum is composite"}</p>${f.classification !== "unresolved" ? `<p class="pr-factorization">${t.number} = ${product.join(" × ")}</p>` : `<p>No prime trial divisor through ${s.limit} was found. That does not establish that ${t.number} is prime.</p>`}<p>${esc(f.stopping)}</p><p>${f.tested.length} prime trial divisors actually tried${f.tested.length <= 25 ? `: ${f.tested.join(", ") || "none needed"}` : ` (through ${f.tested.at(-1)})`}. ${f.complete ? "The factorization is complete." : `Unclassified cofactor: ${f.cofactor}.`}</p>`;
}
export function primeBranches(s: PrimeState): string {
  const t = primeTrial(s),
    k = t.search.classification;
  return `<div class="pr-branches"><div${k === "prime" ? ' class="pr-branch-active"' : ""}><h3>If N is prime</h3><p>N itself is a prime outside the given list. None of the given primes divides it.</p><p>${k === "prime" ? `This example takes that branch: ${t.number} is the additional prime.` : "This branch is part of the proof even when this example does not take it."}</p></div><div${k === "composite" ? ' class="pr-branch-active"' : ""}><h3>If N is composite</h3><p>VII.31 guarantees a prime H dividing N. If H were given, it would divide M too, and then N − M = 1. A prime at least two cannot divide one.</p><p>${t.witnesses.length && k === "composite" ? `This example supplies H = ${t.witnesses[0]}. It divides ${t.number}, and is absent from the list.` : "The existence of H does not depend on this app finding it within the selected search bound."}</p></div></div>`;
}
export function primeGeneralReason(): string {
  return `<ol class="pr-reason"><li>Take any nonempty finite list of distinct primes. Their product M is a positive whole number divisible by every listed prime.</li><li>N = M + 1 is greater than one. For each given prime p, N leaves remainder 1 when divided by p. Hence no given prime divides N.</li><li>If N is prime, take H = N. Otherwise VII.31 supplies a prime divisor H of N.</li><li>In either case H is a prime outside the given list. The given finite list therefore cannot contain every prime.</li></ol><p>The product need not be prime; H need not be the next prime or greater than every given prime. The argument works for an arbitrary finite list, independent of the twelve-prime input limit or the 100,000 trial bound.</p><p>For distinct primes the least common multiple equals the product: in any common multiple, divisibility by one prime and Euclid’s lemma (VII.30) retain the other distinct prime factors after division. Repeating this shows their product divides every common multiple. The product is itself a common multiple, so is least. The bench uses that equality; the contradiction needs only a common multiple.</p>`;
}
export function primeDescent(s: PrimeState, interactive = true): string {
  const last = s.descent.at(-1) as number,
    choices = properDivisors(last);
  return `<ol class="pr-chain">${s.descent.map((n, i) => `<li><strong>${n}</strong><span>${i ? `${s.descent[i - 1]} = ${n} × ${(s.descent[i - 1] as number) / n}; ` : ""}2310 = ${n} × ${2310 / n}</span></li>`).join("")}</ol>${choices.length ? `<p>${last} is composite. Choose a proper divisor greater than one${interactive ? ":" : "."}</p>${interactive ? `<div class="pr-divisors" role="group" aria-label="Proper divisors of ${last}">${choices.map((n) => `<button type="button" data-pr-divisor="${n}">${n}</button>`).join("")}</div>` : ""}` : `<p class="pr-descent-end">${last} has no proper divisor greater than one: the descent has reached a prime. It still divides 2310.</p>`}`;
}
export function primeSvg(s: PrimeState, license: string): string {
  const t = primeTrial(s),
    r = t.rows[s.selected];
  const paragraphs = [
    `Given: ${s.primes.join(", ")}`,
    `M = ${t.multiple}`,
    `N = ${t.number}`,
    `${r?.prime} × ${r?.copies} + 1 = ${t.number}`,
    `Search through ${s.limit}: ${t.search.classification}.`,
    t.search.stopping,
    `Known prime factors: ${t.witnesses.join(", ") || "none established"}.`,
    `Unclassified cofactor: ${t.search.cofactor}.`,
    "Neither branch requires M + 1 itself to be prime.",
    "If composite, a prime divisor outside the given list suffices.",
  ];
  const lines = paragraphs.flatMap((p) => [...(p.match(/.{1,70}/gu) ?? []), ""]);
  const units = primeUnits(s).match(/<svg[\s\S]*?<\/svg>/)?.[0] ?? "",
    illustrated = units.startsWith("<svg");
  const offset = illustrated ? 420 : 100;
  const height = offset + 30 + lines.length * 26;
  const drawing = illustrated
    ? units.replace(
        'viewBox="0 0 600 220"',
        'x="30" y="75" width="800" height="294" viewBox="0 0 600 220"',
      )
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 ${height}" role="img" aria-label="Euclid IX.20 exact construction and selected division"><title>Euclid’s extra prime</title><desc>Modern exact arithmetic illustration; source proof uses a least common multiple. Long decimal strings continue on following lines. Calculation and selected settings, not a learner action log.</desc><metadata>${esc(license)}</metadata><rect width="900" height="${height}" fill="#e8eff4"/>${drawing}<g font-family="sans-serif" fill="#183746"><text x="35" y="55" font-size="30">Euclid’s extra prime</text>${lines.map((line, i) => `<text x="35" y="${offset + i * 26}" font-size="18">${esc(line)}</text>`).join("")}</g></svg>`;
}
