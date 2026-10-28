import {
  boundedFactors,
  initialPrimes,
  type PrimeState,
  parseGiven,
  primeTrial,
} from "../src/core/primes.ts";

const rows: unknown[] = [];
const pool = [
  "2",
  "3",
  "5",
  "7",
  "11",
  "13",
  "17",
  "19",
  "23",
  "29",
  "31",
  "37",
  "41",
  "43",
  "47",
  "53",
  "59",
  "61",
  "67",
  "71",
  "73",
  "79",
  "83",
  "89",
  "97",
];
let seed = 20261027;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const lists = [
  initialPrimes.primes,
  ["2", "3", "5"],
  ["3", "5", "7"],
  ["2"],
  ["9999999967"],
  parseGiven(
    "9999999967 9999999943 9999999929 9999999881 9999999851 9999999833 9999999817 9999999787 9999999781 9999999769 9999999727 9999999707",
  ),
];
for (let k = 0; k < 100; k++) {
  const available = [...pool],
    list: string[] = [];
  const length = 1 + Math.floor(random() * 12);
  for (let j = 0; j < length; j++)
    list.push(available.splice(Math.floor(random() * available.length), 1)[0] as string);
  lists.push(list);
}
for (const primes of lists)
  for (const limit of [13, 100, 10000, 100000]) {
    const s: PrimeState = { ...initialPrimes, primes, limit };
    rows.push({ kind: "list", settings: s, trial: primeTrial(s) });
  }
for (const n of [
  4n,
  169n,
  30031n,
  2n * 100003n ** 2n,
  99991n ** 2n,
  100003n ** 2n,
  9999999967n,
  9999999967n ** 2n,
])
  for (const limit of [13, 100, 10000, 100000])
    rows.push({ kind: "number", number: n, limit, search: boundedFactors(n, limit) });
console.log(
  JSON.stringify(rows, (_key, value) => (typeof value === "bigint" ? String(value) : value)),
);
