/** The programmed motion is a modern coordinate realization of Pappus IV.30. */
export const CLOCK = 1_000_000;
export const quadratrixPages = [250, 251, 252, 253, 254, 255, 256, 257, 258, 259] as const;
export type Timing = "together" | "rotation-first" | "slider-first";
export interface QuadratrixState {
  tick: number;
  timing: Timing;
  limit: boolean;
  passage: number;
  page: number;
}
export const initialQuadratrix: QuadratrixState = {
  tick: 500_000,
  timing: "together",
  limit: false,
  passage: 0,
  page: 252,
};
export const rotationDuration = (timing: Timing): number =>
  timing === "rotation-first" ? 900_000 : timing === "slider-first" ? 1_100_000 : CLOCK;

export function validateQuadratrix(value: unknown): QuadratrixState {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("The experiment must be a record.");
  const s = value as Record<string, unknown>;
  if (Object.keys(s).sort().join(",") !== "limit,page,passage,tick,timing")
    throw new Error("The experiment has missing or unknown fields.");
  if (!Number.isInteger(s.tick) || Number(s.tick) < 0 || Number(s.tick) > CLOCK)
    throw new Error("Time must be a whole-number tick from 0 to 1000000.");
  if (!["together", "rotation-first", "slider-first"].includes(String(s.timing)))
    throw new Error("Choose one of the three timing experiments.");
  if (typeof s.limit !== "boolean")
    throw new Error("The limiting-point choice must be true or false.");
  if (!Number.isInteger(s.passage) || Number(s.passage) < 0 || Number(s.passage) > 7)
    throw new Error("Choose a reading from 1 to 8.");
  if (!quadratrixPages.includes(s.page as (typeof quadratrixPages)[number]))
    throw new Error("Choose a retained source page from 250 to 259.");
  return {
    tick: Number(s.tick),
    timing: s.timing as Timing,
    limit: s.limit,
    passage: Number(s.passage),
    page: Number(s.page),
  };
}

export interface Motion {
  time: number;
  height: number;
  angle: number;
  rotationRemaining: number;
  kind: "point" | "parallel" | "coincident";
  point: { x: number; y: number } | null;
  inSquare: boolean;
}

export function quadratrixMotion(s: QuadratrixState): Motion {
  validateQuadratrix(s);
  const duration = rotationDuration(s.timing);
  // Decide degeneracies with integer clocks, before any trigonometry.
  const remaining = Math.max(0, duration - s.tick);
  const rotationRemaining = remaining / duration;
  const height = (CLOCK - s.tick) / CLOCK;
  const angle = (Math.PI / 2) * rotationRemaining;
  const common = { time: s.tick / CLOCK, height, angle, rotationRemaining };
  if (remaining === 0)
    return {
      ...common,
      kind: height === 0 ? "coincident" : "parallel",
      point: null,
      inSquare: false,
    };
  const x = s.tick === 0 ? 0 : height * (Math.cos(angle) / Math.sin(angle));
  return { ...common, kind: "point", point: { x, y: height }, inSquare: x >= 0 && x <= 1 };
}

/** Positive-height quadratrix samples only. The endpoint is a separate limit. */
export function idealPoint(remaining: number): { x: number; y: number } {
  if (!(remaining > 0 && remaining <= 1))
    throw new Error("A traced point needs positive remaining time.");
  const a = (Math.PI / 2) * remaining;
  return { x: remaining === 1 ? 0 : remaining * (Math.cos(a) / Math.sin(a)), y: remaining };
}

/** Stable distance to 2/pi, even when subtracting two x coordinates loses it. */
export function interceptDeficit(remaining: number): number {
  if (!(remaining > 0 && remaining <= 1)) throw new Error("Use positive remaining time.");
  const a = (Math.PI / 2) * remaining;
  if (a < 0.01) {
    const a2 = a * a;
    return (
      (2 / Math.PI) *
      a2 *
      (1 / 3 + a2 * (1 / 45 + a2 * (2 / 945 + a2 * (1 / 4725 + (a2 * 2) / 93555))))
    );
  }
  return 2 / Math.PI - idealPoint(remaining).x;
}

export function quadratrixVerdict(s: QuadratrixState): string {
  const m = quadratrixMotion(s);
  if (m.kind === "coincident")
    return "The lines coincide. Every point of the baseline belongs to both lines; their intersection does not select H. No traced point Z exists at this instant.";
  if (m.kind === "parallel")
    return "Rotation has finished while the slider is still above the baseline. The lines are parallel and distinct: there is no intersection Z.";
  if (!m.inSquare)
    return "The lines intersect beyond the square. A full-line intersection still exists, but the moving segments inside the square no longer meet.";
  if (s.tick === CLOCK)
    return "The slider has reached the baseline while the rotating line is still tilted. Their unique intersection is A, not the synchronized curve’s limiting intercept.";
  if (s.timing !== "together")
    return "The lines have one crossing inside the square, but the changed timing draws a different path. The dashed curve retains the synchronized reference.";
  return "The two lines have one intersection Z inside the square. As the synchronized motion approaches its finish, Z approaches H; reaching the finish is a different event.";
}

export function encodeQuadratrix(s: QuadratrixState): string {
  validateQuadratrix(s);
  return `?${new URLSearchParams({ tick: String(s.tick), timing: s.timing, limit: s.limit ? "1" : "0", reading: String(s.passage), page: String(s.page) })}`;
}
export function decodeQuadratrix(query: string): QuadratrixState {
  const p = new URLSearchParams(query);
  const allowed = ["tick", "timing", "limit", "reading", "page"];
  for (const k of p.keys()) {
    if (!allowed.includes(k) || p.getAll(k).length !== 1)
      throw new Error("The address has unknown or repeated experiment fields.");
  }
  const integer = (key: string, fallback: number): number => {
    const v = p.get(key);
    if (v === null) return fallback;
    if (!/^\d{1,7}$/.test(v)) throw new Error(`The address field ${key} must be a whole number.`);
    return Number(v);
  };
  if (p.has("limit") && !["0", "1"].includes(p.get("limit") ?? ""))
    throw new Error("The address limiting-point choice must be 0 or 1.");
  return validateQuadratrix({
    tick: integer("tick", initialQuadratrix.tick),
    timing: p.get("timing") ?? initialQuadratrix.timing,
    limit: p.get("limit") === "1",
    passage: integer("reading", 0),
    page: integer("page", 252),
  });
}
export function quadratrixJson(s: QuadratrixState): string {
  return `${JSON.stringify({ format: "stoicheia-quadratrix", version: 1, state: validateQuadratrix(s) }, null, 2)}\n`;
}
export function parseQuadratrixJson(text: string): QuadratrixState {
  const r: unknown = JSON.parse(text);
  if (!r || typeof r !== "object" || Array.isArray(r))
    throw new Error("Expected a saved quadratrix record.");
  const v = r as Record<string, unknown>;
  if (
    Object.keys(v).sort().join(",") !== "format,state,version" ||
    v.format !== "stoicheia-quadratrix" ||
    v.version !== 1
  )
    throw new Error("Unsupported saved quadratrix format or version.");
  return validateQuadratrix(v.state);
}
