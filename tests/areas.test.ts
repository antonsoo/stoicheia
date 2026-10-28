import assert from "node:assert/strict";
import { test } from "node:test";
import {
  areaFraction,
  areaModel,
  areasCsv,
  areasJson,
  decodeAreas,
  encodeAreas,
  initialAreas,
  readAreasJson,
  reflectedTrial,
  trialArea,
  validateAreas,
} from "../src/core/areas";
import { compare, exact, rational } from "../src/core/circle";

test("the two 27-unit fits have distinct shortfalls and equal applied area", () => {
  const s = validateAreas(initialAreas),
    m = areaModel(s);
  assert.deepEqual(
    m.fits.map((x) => x.exact && exact(x.exact)),
    ["3", "9"],
  );
  assert.equal(exact(m.similarArea), "9");
  const other = areaModel({ ...s, trial: reflectedTrial(s) });
  assert.equal(exact(other.area), "27");
  assert.equal(exact(other.similarArea), "81");
  assert.equal(other.exactFit, true);
});
test("the maximum is one nondegenerate fit, and 45 cannot be applied falling short", () => {
  const limit = areaModel({ ...initialAreas, target: "36", trial: "6" });
  assert.equal(limit.fits.length, 1);
  assert.equal(limit.exactFit, true);
  const impossible = areaModel({ ...initialAreas, target: "45", trial: "6" });
  assert.equal(impossible.fits.length, 0);
  assert.equal(exact(impossible.discriminant), "-36");
  assert.equal(exact(impossible.residual), "-9");
});
test("exceeding solves the formerly impossible target and counts the excess", () => {
  const m = areaModel({ ...initialAreas, mode: "beyond", target: "45", trial: "3" });
  assert.equal(m.exactFit, true);
  assert.equal(m.fits.length, 1);
  assert.equal(exact(m.appliedBase), "15");
  assert.equal(exact(m.similarArea), "9");
  assert.equal(exact(m.area), "45");
});
test("irrational fits retain strict exact rational enclosures and nonzero residuals", () => {
  for (const mode of ["short", "beyond"] as const) {
    const s = { ...initialAreas, mode, target: mode === "short" ? "28" : "29" },
      m = areaModel(s);
    for (const [i, f] of m.fits.entries()) {
      assert.equal(f.exact, null);
      assert.equal(compare(f.lower, f.upper), -1);
      const low = compare(trialArea(s, f.lower), m.c),
        high = compare(trialArea(s, f.upper), m.c);
      assert.equal(low, i ? 1 : -1);
      assert.equal(high, i ? -1 : 1);
      assert.equal(areaModel({ ...s, trial: exact(f.lower) }).exactFit, false);
    }
  }
});
test("shape height changes the ceiling; shear changes no area", () => {
  const flat = areaModel({ ...initialAreas, shape: "half" });
  assert.equal(exact(flat.maximum), "18");
  assert.equal(flat.fits.length, 0);
  const tall = areaModel({ ...initialAreas, shape: "double" });
  assert.equal(exact(tall.maximum), "72");
  assert.equal(tall.fits.length, 2);
  for (const shear of [-60, 0, 60])
    assert.equal(exact(areaModel({ ...initialAreas, shear }).area), "27");
});
test("endpoints are explicit zero-area degeneracies", () => {
  for (const trial of ["0", "12"]) {
    const m = areaModel({ ...initialAreas, trial });
    assert.equal(m.degenerate, true);
    assert.equal(exact(m.area), "0");
    assert.equal(m.exactFit, false);
  }
});
test("small targets and large extensions still get certified enclosures", () => {
  for (const mode of ["short", "beyond"] as const)
    for (const target of ["1/1000000", "4096"]) {
      const s = { ...initialAreas, mode, target },
        m = areaModel(s);
      for (const f of m.fits) assert.ok(compare(f.lower, f.upper) <= 0);
    }
  assert.equal(exact(areaModel({ ...initialAreas, mode: "beyond", trial: "128" }).area), "17920");
});
test("JSON, links and CSV retain the failed premise and exact near miss", () => {
  for (const s of [
    { ...initialAreas, target: "45", trial: "6" },
    { ...initialAreas, target: "28", trial: "3171572/1000000" },
  ]) {
    const expected = validateAreas(s);
    assert.deepEqual(readAreasJson(areasJson(s)), expected);
    assert.deepEqual(decodeAreas(encodeAreas(s)), expected);
    assert.ok(areasCsv(s).includes(`"c","${s.target}"`));
    assert.ok(areasCsv(s).includes(`"t","${expected.trial}"`));
  }
});
test("malformed, ambiguous and out-of-domain givens are rejected", () => {
  for (const target of ["0", "NaN", "1/0", "4097", "1e3", "1/1000001", "-2"])
    assert.throws(() => validateAreas({ ...initialAreas, target }));
  for (const trial of ["13", "-1", "1/0"])
    assert.throws(() => validateAreas({ ...initialAreas, trial }));
  assert.throws(() => areaFraction(3));
  assert.throws(() => validateAreas({ ...initialAreas, extra: 1 }));
  assert.throws(() => decodeAreas("?base=12&base=13"));
  assert.throws(() => decodeAreas("?page=999"));
  assert.throws(() => decodeAreas("?shear="));
  assert.throws(
    () =>
      readAreasJson(
        areasJson(initialAreas).replace('"target": "27"', '"target": "28", "target": "27"'),
      ),
    /repeats/,
  );
  assert.throws(
    () =>
      readAreasJson(
        areasJson(initialAreas).replace('"target": "27"', '"target": "28", "\\u0074arget": "27"'),
      ),
    /repeats/,
  );
  assert.throws(() => readAreasJson('{"format":"stoicheia-areas","version":2,"state":{}}'));
  assert.equal(compare(areaFraction("0", true), rational(0)), 0);
});
