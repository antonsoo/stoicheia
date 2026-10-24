import { distance, type Point } from "./geometry";

export type DeskAction =
  | { kind: "circle"; center: string; through: string }
  | { kind: "line"; a: string; b: string }
  | { kind: "meet"; first: string; second: string; branch: number };
export type DeskCurve =
  | { id: string; kind: "circle"; center: string; through: string }
  | { id: string; kind: "line"; a: string; b: string };
export interface DeskPoint extends Point {
  id: string;
  origin: Extract<DeskAction, { kind: "meet" }> | null;
}
export interface DeskSession {
  format: "stoicheia-desk-v1";
  given: string;
  actions: DeskAction[];
}
export interface DeskScene {
  points: DeskPoint[];
  curves: DeskCurve[];
}
export const deskGivens = [
  {
    id: "separate",
    title: "Detached, oblique",
    a: { x: -2, y: 0 },
    b: { x: 1, y: 0.6 },
    c: { x: 3.8, y: 2.2 },
  },
  {
    id: "long",
    title: "Long reference, short join",
    a: { x: -1.5, y: 0.5 },
    b: { x: 0, y: 0 },
    c: { x: 4.8, y: -1.5 },
  },
  {
    id: "turned",
    title: "Turned around",
    a: { x: 2.6, y: 1.2 },
    b: { x: -1, y: -0.5 },
    c: { x: -3.6, y: 1.8 },
  },
] as const;
export const deskLimit = 48;
const epsilon = 1e-10;
const cross = (a: Point, b: Point) => a.x * b.y - a.y * b.x;
const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
const offset = (a: Point, v: Point, t: number): Point => ({ x: a.x + t * v.x, y: a.y + t * v.y });
const dot = (a: Point, b: Point) => a.x * b.x + a.y * b.y;

export function deskPoint(scene: DeskScene, id: string): DeskPoint {
  const p = scene.points.find((p) => p.id === id);
  if (!p) throw new Error(`Point ${id} is not available yet.`);
  return p;
}
export function deskCurve(scene: DeskScene, id: string): DeskCurve {
  const c = scene.curves.find((c) => c.id === id);
  if (!c) throw new Error(`Curve ${id} is not available yet.`);
  return c;
}
export interface Crossings {
  points: Point[];
  note: string;
}

/** Branch order depends on the ordered operands, never on screen orientation. */
export function deskCrossings(scene: DeskScene, first: string, second: string): Crossings {
  if (first === second) return { points: [], note: "Choose two different curves." };
  const f = deskCurve(scene, first),
    s = deskCurve(scene, second);
  const p = (id: string) => deskPoint(scene, id);
  if (f.kind === "line" && s.kind === "line") {
    const a = p(f.a),
      b = p(s.a),
      v = sub(p(f.b), a),
      w = sub(p(s.b), b);
    const den = cross(v, w),
      tolerance = epsilon * Math.hypot(v.x, v.y) * Math.hypot(w.x, w.y);
    if (Math.abs(den) <= tolerance)
      return { points: [], note: "Parallel or coincident lines: no isolated crossing resolved." };
    const at = offset(a, v, cross(sub(b, a), w) / den);
    return bounded([at]);
  }
  if (f.kind === "line" || s.kind === "line") {
    const line = f.kind === "line" ? f : s;
    const circle = f.kind === "circle" ? f : s;
    if (line.kind !== "line" || circle.kind !== "circle") throw new Error("Invalid curve pair.");
    const a = p(line.a),
      v = sub(p(line.b), a),
      center = p(circle.center);
    const length2 = dot(v, v),
      t = dot(sub(center, a), v) / length2;
    const foot = offset(a, v, t),
      r = distance(center, p(circle.through));
    const h2 = r * r - distance(center, foot) ** 2,
      tol = epsilon * r * r;
    if (h2 < -tol) return { points: [], note: "This line misses the circle." };
    // A near-tangent is unresolved, not promoted to an exact geometric incidence.
    if (Math.abs(h2) <= tol)
      return {
        points: [],
        note: "Tangent or too close to tangency to resolve safely. No point kept.",
      };
    const dt = Math.sqrt(h2 / length2);
    return bounded([offset(a, v, t - dt), offset(a, v, t + dt)]);
  }
  const a = p(f.center),
    b = p(s.center),
    r = distance(a, p(f.through)),
    q = distance(b, p(s.through));
  const d = distance(a, b),
    tol = epsilon * Math.max(r, q, d);
  if (d <= tol) return { points: [], note: "Concentric circles: no isolated crossing resolved." };
  if (d > r + q + tol || d < Math.abs(r - q) - tol)
    return { points: [], note: "These circumferences do not meet." };
  const along = (r * r - q * q + d * d) / (2 * d),
    h2 = r * r - along * along;
  if (h2 <= epsilon * Math.max(r * r, q * q))
    return {
      points: [],
      note: "Tangent or too close to tangency to resolve safely. No point kept.",
    };
  const v = { x: (b.x - a.x) / d, y: (b.y - a.y) / d },
    foot = offset(a, v, along),
    h = Math.sqrt(h2);
  return bounded([offset(foot, { x: -v.y, y: v.x }, h), offset(foot, { x: -v.y, y: v.x }, -h)]);
}
function bounded(points: Point[]): Crossings {
  if (
    points.some(
      (p) =>
        !Number.isFinite(p.x) ||
        !Number.isFinite(p.y) ||
        Math.max(Math.abs(p.x), Math.abs(p.y)) > 2000,
    )
  )
    return {
      points: [],
      note: "The crossing is beyond this desk's numerical range (2,000 drawing units).",
    };
  return {
    points,
    note:
      points.length === 2 ? "Two crossings. Choose which point to keep." : "One isolated crossing.",
  };
}
export function nearbyPoint(scene: DeskScene, p: Point): DeskPoint | undefined {
  return scene.points.find((q) => distance(p, q) < 1e-8 * Math.max(1, Math.hypot(p.x, p.y)));
}
export function circleWith(
  scene: DeskScene,
  center: string,
  through: string,
): DeskCurve | undefined {
  return scene.curves.find(
    (c) => c.kind === "circle" && c.center === center && c.through === through,
  );
}
export function lineWith(scene: DeskScene, a: string, b: string): DeskCurve | undefined {
  return scene.curves.find(
    (c) => c.kind === "line" && ((c.a === a && c.b === b) || (c.a === b && c.b === a)),
  );
}
export function freshDesk(given = "separate"): DeskSession {
  return { format: "stoicheia-desk-v1", given, actions: [] };
}
export function replayDesk(session: DeskSession): DeskScene {
  const given = deskGivens.find((g) => g.id === session.given);
  if (!given) throw new Error("Choose one of the three supplied layouts.");
  if (session.actions.length > deskLimit)
    throw new Error(`Keep at most ${deskLimit} operations in a drawing.`);
  const scene: DeskScene = {
    points: [
      ["A", given.a],
      ["B", given.b],
      ["C", given.c],
    ].map(([id, point]) => ({ ...(point as Point), id: id as string, origin: null })),
    curves: [],
  };
  for (const action of session.actions) {
    if (action.kind === "circle") {
      const a = deskPoint(scene, action.center),
        b = deskPoint(scene, action.through);
      if (distance(a, b) <= 1e-8) throw new Error("A circle needs two different points.");
      if (circleWith(scene, a.id, b.id))
        throw new Error("That centre-and-point circle is already on the desk.");
      scene.curves.push({ ...action, id: `c${scene.curves.length + 1}` });
    } else if (action.kind === "line") {
      const a = deskPoint(scene, action.a),
        b = deskPoint(scene, action.b);
      if (distance(a, b) <= 1e-8) throw new Error("A straight line needs two different points.");
      if (lineWith(scene, a.id, b.id))
        throw new Error("That pair of points already has a straight line.");
      scene.curves.push({ ...action, id: `l${scene.curves.length + 1}` });
    } else if (action.kind === "meet") {
      const result = deskCrossings(scene, action.first, action.second);
      if (!Number.isInteger(action.branch) || action.branch < 0 || !result.points[action.branch])
        throw new Error(result.points.length ? "Choose an available crossing." : result.note);
      const at = result.points[action.branch];
      if (!at) throw new Error("No crossing at that index.");
      const existing = nearbyPoint(scene, at);
      if (existing)
        throw new Error(`That crossing is already point ${existing.id}; use it directly.`);
      scene.points.push({ ...at, id: `P${scene.points.length - 2}`, origin: { ...action } });
    } else throw new Error("Unknown construction operation.");
  }
  return scene;
}
function onCurve(p: DeskPoint, id: string): boolean {
  return p.origin !== null && (p.origin.first === id || p.origin.second === id);
}
function beyond(scene: DeskScene, center: string, end: string, at: Point): boolean {
  const a = deskPoint(scene, center),
    b = deskPoint(scene, end),
    v = sub(b, a);
  return dot(sub(at, a), v) / dot(v, v) > 1 + 1e-8;
}
export interface DeskProof {
  anchor: string;
  other: string;
  d: string;
  g: string;
  l: string;
  circles: string[];
  lines: string[];
}
/** Recognize I.2's incidence graph. Numerical agreement alone is never a proof. */
export function deskProof(scene: DeskScene): DeskProof | null {
  for (const [anchor, other] of [
    ["B", "C"],
    ["C", "B"],
  ]) {
    if (!anchor || !other) continue;
    const ca = circleWith(scene, "A", anchor),
      cb = circleWith(scene, anchor, "A");
    if (!ca || !cb) continue;
    for (const d of scene.points.filter((p) => onCurve(p, ca.id) && onCurve(p, cb.id))) {
      const db = lineWith(scene, d.id, anchor),
        da = lineWith(scene, d.id, "A");
      const reference = circleWith(scene, anchor, other);
      if (!db || !da || !reference) continue;
      for (const g of scene.points.filter(
        (p) => onCurve(p, db.id) && onCurve(p, reference.id) && beyond(scene, d.id, anchor, p),
      )) {
        const whole = circleWith(scene, d.id, g.id);
        if (!whole) continue;
        const l = scene.points.find(
          (p) => onCurve(p, da.id) && onCurve(p, whole.id) && beyond(scene, d.id, "A", p),
        );
        const result = l && lineWith(scene, "A", l.id);
        if (l && result && lineWith(scene, "A", anchor))
          return {
            anchor,
            other,
            d: d.id,
            g: g.id,
            l: l.id,
            circles: [ca.id, cb.id, reference.id, whole.id],
            lines: [db.id, da.id, result.id],
          };
      }
    }
  }
  return null;
}
export interface DeskHint {
  text: string;
  action: DeskAction | null;
}
interface TransferRoute {
  anchor: string;
  other: string;
  ca: DeskCurve | undefined;
  cb: DeskCurve | undefined;
  base: DeskCurve | undefined;
  d: DeskPoint | undefined;
  db: DeskCurve | undefined;
  reference: DeskCurve | undefined;
  g: DeskPoint | undefined;
  da: DeskCurve | undefined;
  whole: DeskCurve | undefined;
  l: DeskPoint | undefined;
  result: DeskCurve | undefined;
  score: number;
}

/** Follow the most developed valid route, including the learner's choice of vertex. */
function hintRoute(scene: DeskScene): TransferRoute {
  const routes: TransferRoute[] = [];
  for (const [anchor, other] of [
    ["B", "C"],
    ["C", "B"],
  ] as const) {
    const ca = circleWith(scene, "A", anchor),
      cb = circleWith(scene, anchor, "A");
    const base = lineWith(scene, "A", anchor),
      reference = circleWith(scene, anchor, other);
    const vertices: (DeskPoint | undefined)[] =
      ca && cb ? scene.points.filter((p) => onCurve(p, ca.id) && onCurve(p, cb.id)) : [];
    if (!vertices.length) vertices.push(undefined);
    for (const d of vertices) {
      const db = d && lineWith(scene, d.id, anchor),
        da = d && lineWith(scene, d.id, "A");
      const g =
        d &&
        db &&
        reference &&
        scene.points.find(
          (p) => onCurve(p, db.id) && onCurve(p, reference.id) && beyond(scene, d.id, anchor, p),
        );
      const whole = d && g && circleWith(scene, d.id, g.id);
      const l =
        d &&
        da &&
        whole &&
        scene.points.find(
          (p) => onCurve(p, da.id) && onCurve(p, whole.id) && beyond(scene, d.id, "A", p),
        );
      const result = l && lineWith(scene, "A", l.id);
      const score = [base, ca, cb, d, db, reference, g, da, whole, l, result].filter(
        Boolean,
      ).length;
      routes.push({
        anchor,
        other,
        ca,
        cb,
        base,
        reference,
        d,
        db,
        da,
        g,
        whole,
        l,
        result,
        score,
      });
    }
  }
  // Stable ties retain B, then the earliest kept vertex. No hidden operations
  // are inserted merely because another route is shorter or resembles a figure.
  routes.sort((a, b) => b.score - a.score);
  const best = routes[0];
  if (!best) throw new Error("No transfer route is available.");
  return best;
}
export function deskHint(scene: DeskScene): DeskHint {
  if (deskProof(scene))
    return {
      text: "Your equal-remainder chain is complete. Inspect the proof below, then try the reflected triangle or a different layout.",
      action: null,
    };
  const { anchor, other, ca, cb, base, d, db, reference, g, da, whole, l } = hintRoute(scene);
  if (!base)
    return {
      text: `Join A to ${anchor} and continue the straight line. The given BC alone does not reach A.`,
      action: { kind: "line", a: "A", b: anchor },
    };
  if (!ca)
    return {
      text: `Start I.1 on A–${anchor}: draw a circle centred at A through ${anchor}.`,
      action: { kind: "circle", center: "A", through: anchor },
    };
  if (!cb)
    return {
      text: `Draw the companion circle centred at ${anchor} through A. Their radii are the same A–${anchor}.`,
      action: { kind: "circle", center: anchor, through: "A" },
    };
  if (!d)
    return {
      text: `Keep either crossing of ${ca.id} and ${cb.id}. It supplies the third vertex of the equilateral triangle.`,
      action: { kind: "meet", first: ca.id, second: cb.id, branch: 0 },
    };
  if (!db)
    return {
      text: `Draw the straight line through ${d.id} and ${anchor}. You will need the part beyond ${anchor}, away from ${d.id}.`,
      action: { kind: "line", a: d.id, b: anchor },
    };
  if (!reference)
    return {
      text: `Draw a circle centred at ${anchor} through ${other}. This uses the given length at its own endpoint, where it is already available.`,
      action: { kind: "circle", center: anchor, through: other },
    };
  if (!g) {
    const branch = deskCrossings(scene, db.id, reference.id).points.findIndex((p) =>
      beyond(scene, d.id, anchor, p),
    );
    return {
      text: `Keep the crossing of ${db.id} and ${reference.id} BEYOND ${anchor}, away from ${d.id}. The other crossing will not supply this equal-remainder proof.`,
      action: { kind: "meet", first: db.id, second: reference.id, branch },
    };
  }
  if (!da)
    return {
      text: `Draw the straight line through ${d.id} and A; continue beyond A.`,
      action: { kind: "line", a: d.id, b: "A" },
    };
  if (!whole)
    return {
      text: `Draw a circle centred at ${d.id} through ${g.id}. Its radius contains one equal side plus the reference length.`,
      action: { kind: "circle", center: d.id, through: g.id },
    };
  if (l)
    return {
      text: `Join A to ${l.id}. You have found the endpoint; now draw the requested straight line.`,
      action: { kind: "line", a: "A", b: l.id },
    };
  const branch = deskCrossings(scene, da.id, whole.id).points.findIndex((p) =>
    beyond(scene, d.id, "A", p),
  );
  return {
    text: `Keep the crossing of ${da.id} and ${whole.id} beyond A, away from ${d.id}. Removing the equal triangle sides will leave the copied length.`,
    action: { kind: "meet", first: da.id, second: whole.id, branch },
  };
}
export function deskActionText(action: DeskAction): string {
  if (action.kind === "circle")
    return `Circle centred at ${action.center}, through ${action.through}`;
  if (action.kind === "line") return `Join and continue ${action.a}–${action.b}`;
  return `Keep crossing ${action.branch + 1} of ${action.first} and ${action.second}`;
}
export function parseDesk(text: string): DeskSession {
  if (text.length > 16000)
    throw new Error("This drawing is too large (maximum 16,000 characters).");
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This is not a valid drawing JSON file.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error("A drawing must be a JSON object.");
  const record = data as Record<string, unknown>;
  if (
    Object.keys(record).sort().join(",") !== "actions,format,given" ||
    record.format !== "stoicheia-desk-v1" ||
    typeof record.given !== "string" ||
    !Array.isArray(record.actions)
  )
    throw new Error("Expected a stoicheia-desk-v1 drawing with a layout and operations.");
  if (record.actions.length > deskLimit)
    throw new Error(`A drawing may contain at most ${deskLimit} operations.`);
  const identifier = (v: unknown): v is string =>
    typeof v === "string" && /^(A|B|C|P[1-9]\d?|[cl][1-9]\d?)$/.test(v);
  for (const action of record.actions) {
    if (!action || typeof action !== "object" || Array.isArray(action))
      throw new Error("Each operation must be an object.");
    const keys = Object.keys(action).sort().join(",");
    const ok =
      action.kind === "circle"
        ? keys === "center,kind,through" && identifier(action.center) && identifier(action.through)
        : action.kind === "line"
          ? keys === "a,b,kind" && identifier(action.a) && identifier(action.b)
          : action.kind === "meet" &&
            keys === "branch,first,kind,second" &&
            identifier(action.first) &&
            identifier(action.second) &&
            Number.isInteger(action.branch) &&
            action.branch >= 0 &&
            action.branch <= 1;
    if (!ok)
      throw new Error("An operation has unsupported fields or invalid point/curve identifiers.");
  }
  const session = record as unknown as DeskSession;
  replayDesk(session); // Validate the entire dependency graph before replacing the current drawing.
  return session;
}
export function encodeDesk(session: DeskSession): string {
  return `#drawing=${encodeURIComponent(JSON.stringify(session))}`;
}
export function decodeDesk(hash: string): DeskSession {
  if (!hash || hash === "#desk" || hash === "#reading" || hash === "#evidence") return freshDesk();
  if (!hash.startsWith("#drawing="))
    throw new Error("This link does not contain a construction-desk drawing.");
  try {
    return parseDesk(decodeURIComponent(hash.slice(9)));
  } catch (error) {
    throw new Error(`Drawing link: ${error instanceof Error ? error.message : "invalid encoding"}`);
  }
}
