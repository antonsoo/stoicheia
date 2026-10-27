"""Independently enumerate multiplier squares using only integer products and squares."""
import json
import sys


def sign(n):
    return (n > 0) - (n < 0)


def trial(s, m, n):
    first = sign(2 * m * m - n * n)
    second = first if s["kind"] == "scaled" else sign(m * s["p"] - n * s["q"])
    greater = "first" if first > 0 and second <= 0 else "second" if second > 0 and first <= 0 else None
    return {"first": first, "second": second, "agrees": first == second, "greater": greater}


def main():
    count = 0
    cells = 0
    for line in sys.stdin:
        case = json.loads(line)
        s, actual = case["state"], case["scan"]
        bound = s["bound"]
        rows = []
        first = excess = None
        disagreements = 0
        for m in range(1, bound + 1):
            bad = []
            for n in range(1, bound + 1):
                t = trial(s, m, n)
                if not t["agrees"]:
                    bad.append(n)
                    if first is None:
                        first = {"m": m, "n": n}
                    if excess is None and t["greater"]:
                        excess = {"m": m, "n": n}
            if bad:
                assert bad == list(range(bad[0], bad[-1] + 1))
                rows.append({"m": m, "lo": bad[0], "hi": bad[-1]})
                disagreements += len(bad)
        expected = {"bound": bound, "checked": bound * bound, "disagreements": disagreements,
                    "first": first, "firstExcess": excess, "rows": rows}
        assert actual == expected, (s, actual, expected)
        assert case["trial"] == trial(s, s["m"], s["n"])
        count += 1
        cells += bound * bound
    assert count >= 60, "No complete case stream supplied"
    print(json.dumps({"cases": count, "independently_enumerated_comparisons": cells,
                      "status": "All compressed scans, first witnesses, V.7 witnesses and selected signs agree with exhaustive integer enumeration."}, indent=2))


if __name__ == "__main__":
    main()
