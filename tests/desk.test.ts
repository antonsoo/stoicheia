import assert from "node:assert/strict";
import { test } from "node:test";
import {
  type DeskAction,
  type DeskScene,
  type DeskSession,
  decodeDesk,
  deskCrossings,
  deskGivens,
  deskHint,
  deskPoint,
  deskProof,
  encodeDesk,
  freshDesk,
  parseDesk,
  replayDesk,
} from "../src/core/desk";
import { distance } from "../src/core/geometry";

/** Explicit pupil operations, independent of the hint planner. */
function construction(given: string, reflected = false, anchor = "B", other = "C"): DeskSession {
  return {
    ...freshDesk(given),
    actions: [
      { kind: "line", a: "A", b: anchor },
      { kind: "circle", center: "A", through: anchor },
      { kind: "circle", center: anchor, through: "A" },
      { kind: "meet", first: "c2", second: "c3", branch: reflected ? 1 : 0 },
      { kind: "line", a: "P1", b: anchor },
      { kind: "circle", center: anchor, through: other },
      { kind: "meet", first: "l4", second: "c5", branch: 1 },
      { kind: "line", a: "P1", b: "A" },
      { kind: "circle", center: "P1", through: "P2" },
      { kind: "meet", first: "l6", second: "c7", branch: 1 },
      { kind: "line", a: "A", b: "P3" },
    ],
  };
}
test("learners can construct both reflections from either reference endpoint, in all layouts", () => {
  for (const given of deskGivens)
    for (const reflected of [false, true])
      for (const swap of [false, true]) {
        const scene = replayDesk(
          construction(given.id, reflected, swap ? "C" : "B", swap ? "B" : "C"),
        );
        const proof = deskProof(scene);
        assert(proof, `${given.id}, reflected ${reflected}, swapped ${swap}`);
        assert.equal(proof.l, "P3");
        // Independent closed form for I.2, with an equilateral vertex calculated directly.
        const b = swap ? given.c : given.b,
          a = given.a;
        const sign = reflected ? -1 : 1,
          root = Math.sqrt(3) / 2;
        const dx = (a.x + b.x) / 2 - sign * root * (b.y - a.y);
        const dy = (a.y + b.y) / 2 + sign * root * (b.x - a.x);
        const factor = distance(given.b, given.c) / distance(a, b);
        const expected = { x: a.x + factor * (a.x - dx), y: a.y + factor * (a.y - dy) };
        assert(distance(deskPoint(scene, proof.l), expected) < 2e-12);
        assert(
          Math.abs(distance(a, deskPoint(scene, proof.l)) - distance(given.b, given.c)) < 2e-12,
        );
        for (let prefix = 0; prefix < 11; prefix++)
          assert.equal(
            deskProof(
              replayDesk({
                ...construction(given.id, reflected),
                actions: construction(given.id, reflected).actions.slice(0, prefix),
              }),
            ),
            null,
          );
      }
});
test("the wrong reference crossing cannot be mistaken for the equal-remainder construction", () => {
  for (const given of deskGivens) {
    const session = construction(given.id);
    session.actions[6] = { kind: "meet", first: "l4", second: "c5", branch: 0 };
    assert.equal(deskProof(replayDesk(session)), null);
    const hint = deskHint(replayDesk({ ...session, actions: session.actions.slice(0, 7) }));
    assert.match(hint.text, /BEYOND B/);
    assert.deepEqual(hint.action, { kind: "meet", first: "l4", second: "c5", branch: 1 });
  }
});
test("the wrong final crossing is not promoted by the equal whole-circle radius", () => {
  const session = construction("separate");
  session.actions[9] = { kind: "meet", first: "l6", second: "c7", branch: 0 };
  assert.equal(deskProof(replayDesk(session)), null);
});
test("an approximate coordinate coincidence cannot supply missing dependencies", () => {
  const full = replayDesk(construction("separate"));
  assert(deskProof(full));
  const final = full.points.find((p) => p.id === "P3");
  assert(final);
  final.origin = null; // Same exact coordinates, no construction incidence.
  assert.equal(deskProof(full), null);
});
test("strict import rebuilds coordinates and rejects missing, future or forged operations atomically", () => {
  const session = construction("long");
  assert.deepEqual(parseDesk(JSON.stringify(session)), session);
  assert.deepEqual(decodeDesk(encodeDesk(session)), session);
  for (const actions of [
    [{ kind: "circle", center: "A", through: "C", radius: 3 }],
    [{ kind: "point", x: 2, y: 3 }],
    [{ kind: "circle", center: "P1", through: "B" }],
    [{ kind: "meet", first: "c1", second: "c2", branch: 0 }],
    [{ kind: "circle", center: "A", through: "A" }],
    [
      { kind: "line", a: "A", b: "B" },
      { kind: "line", a: "B", b: "A" },
    ],
    ...[null, [], "circle", { kind: "line", a: "A", b: "B", extra: true }].map((v) => [v]),
  ])
    assert.throws(() => parseDesk(JSON.stringify({ ...freshDesk(), actions })));
  assert.throws(() => parseDesk(JSON.stringify({ ...freshDesk(), given: "invented" })));
  assert.throws(() =>
    parseDesk(
      JSON.stringify({ ...freshDesk(), actions: Array(49).fill({ kind: "line", a: "A", b: "B" }) }),
    ),
  );
  assert.throws(() => decodeDesk("#drawing=%"));
  assert.deepEqual(session, construction("long"));
});
test("new points are never added for a crossing that already exists", () => {
  const session = {
    ...freshDesk(),
    actions: [
      { kind: "line", a: "A", b: "B" },
      { kind: "circle", center: "A", through: "B" },
      { kind: "meet", first: "l1", second: "c2", branch: 1 },
    ] as DeskAction[],
  };
  assert.throws(() => replayDesk(session), /already point B/);
});
test("crossing geometry covers secants, misses, concentric circles and unresolved tangency", () => {
  const custom: DeskScene = {
    points: [
      { id: "O", x: 0, y: 0, origin: null },
      { id: "R", x: 2, y: 0, origin: null },
      { id: "U", x: -3, y: 1, origin: null },
      { id: "V", x: 3, y: 1, origin: null },
      { id: "T", x: -3, y: 2, origin: null },
      { id: "W", x: 3, y: 2, origin: null },
    ],
    curves: [
      { id: "c1", kind: "circle", center: "O", through: "R" },
      { id: "l2", kind: "line", a: "U", b: "V" },
      { id: "l3", kind: "line", a: "T", b: "W" },
      { id: "c4", kind: "circle", center: "O", through: "U" },
    ],
  };
  const points = deskCrossings(custom, "l2", "c1").points;
  assert.equal(points.length, 2);
  assert(Math.abs((points[0]?.x ?? 0) + Math.sqrt(3)) < 1e-12);
  assert.match(deskCrossings(custom, "l3", "c1").note, /Tangent/);
  assert.match(deskCrossings(custom, "c1", "c4").note, /Concentric/);
  assert.equal(deskCrossings(custom, "l2", "l3").points.length, 0);
});
test("hints are next-step suggestions and finish every layout without inserting hidden operations", () => {
  for (const given of deskGivens) {
    const session = freshDesk(given.id);
    for (let i = 0; i < 11; i++) {
      const hint = deskHint(replayDesk(session));
      assert(hint.action);
      assert.equal(session.actions.length, i);
      session.actions.push(hint.action);
    }
    assert(deskProof(replayDesk(session)));
    assert.equal(deskHint(replayDesk(session)).action, null);
  }
});

test("hints continue the learner's C-anchor route before the initial join exists", () => {
  for (const given of deskGivens) {
    const session = freshDesk(given.id);
    session.actions.push({ kind: "circle", center: "A", through: "C" });
    const first = deskHint(replayDesk(session));
    assert.deepEqual(first.action, { kind: "line", a: "A", b: "C" });
    for (let step = 0; step < 12; step++) {
      const hint = deskHint(replayDesk(session));
      if (!hint.action) break;
      assert.notDeepEqual(hint.action, { kind: "circle", center: "A", through: "B" });
      session.actions.push(hint.action);
    }
    assert.equal(deskProof(replayDesk(session))?.anchor, "C");
  }
});

test("hints follow progress on the second equilateral vertex when both were kept", () => {
  const session: DeskSession = {
    ...freshDesk(),
    actions: [
      { kind: "circle", center: "A", through: "B" },
      { kind: "circle", center: "B", through: "A" },
      { kind: "meet", first: "c1", second: "c2", branch: 0 },
      { kind: "meet", first: "c1", second: "c2", branch: 1 },
      { kind: "line", a: "P2", b: "B" },
    ],
  };
  for (let step = 0; step < 12; step++) {
    const hint = deskHint(replayDesk(session));
    if (!hint.action) break;
    assert.notDeepEqual(hint.action, { kind: "line", a: "P1", b: "B" });
    session.actions.push(hint.action);
  }
  assert.equal(deskProof(replayDesk(session))?.d, "P2");
});
