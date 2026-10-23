import { type CasebookState, casebookDefaults, decodeCasebook } from "./casebook";

export type PropositionId =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21;

export interface ReaderState {
  proposition: PropositionId;
  step: number;
  size: number;
  ratio: number;
  angle: number;
  side: 1 | -1;
  motion: number;
  third: number;
  probe: number;
  variant: 0 | 1;
  take: number;
  offset: number;
  pair: 0 | 1 | 2;
  casebook: CasebookState;
}

export const stepCounts: Record<PropositionId, number> = {
  1: 10,
  2: 11,
  3: 5,
  4: 8,
  5: 11,
  6: 7,
  7: 8,
  8: 8,
  9: 9,
  10: 8,
  11: 8,
  12: 9,
  13: 8,
  14: 8,
  15: 7,
  16: 10,
  17: 7,
  18: 7,
  19: 6,
  20: 9,
  21: 10,
};
export const propositionIds = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
] as const;
export const defaults: ReaderState = {
  proposition: 1,
  step: 0,
  size: 180,
  ratio: 0.65,
  angle: 25,
  side: 1,
  motion: 0,
  third: 1.2,
  probe: 12,
  variant: 0,
  take: 0.55,
  offset: 0,
  pair: 0,
  casebook: casebookDefaults,
};

function bounded(value: string | null, fallback: number, min: number, max: number): number {
  if (value === null || value.trim() === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

/** Only bounded numerical state is accepted. Unknown keys never enter the DOM. */
export function decodeState(hash: string): ReaderState {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const p = params.get("p");
  const proposition: PropositionId =
    p && /^(?:[1-9]|1[0-9]|2[01])$/.test(p) ? (Number(p) as PropositionId) : 1;
  const angle = Math.round(
    bounded(params.get("a"), defaults.angle, 10, proposition === 13 ? 90 : 75),
  );
  return {
    proposition,
    step: Math.round(bounded(params.get("s"), defaults.step, 0, stepCounts[proposition] - 1)),
    size: Math.round(bounded(params.get("size"), defaults.size, 100, 240)),
    ratio:
      Math.round(
        bounded(
          params.get("r"),
          proposition === 18 || proposition === 19 ? 1.25 : defaults.ratio,
          proposition === 19 ? 1.01 : 0.2,
          1.4,
        ) * 100,
      ) / 100,
    angle,
    side: params.get("side") === "-1" ? -1 : 1,
    motion: Math.round(
      bounded(
        params.get("m"),
        proposition === 21 ? 55 : defaults.motion,
        proposition === 21 ? 10 : 0,
        proposition === 21 ? 90 : 100,
      ),
    ),
    third: Math.round(bounded(params.get("t"), defaults.third, 0.3, 1.8) * 100) / 100,
    probe: Math.round(
      bounded(
        params.get("q"),
        defaults.probe,
        proposition === 14 ? 5 : 0,
        Math.min(70, Math.floor(angle * 1.3)),
      ),
    ),
    variant: params.get("v") === "1" ? 1 : 0,
    take: Math.round(bounded(params.get("k"), defaults.take, 0.1, 0.9) * 100) / 100,
    offset: Math.round(bounded(params.get("x"), defaults.offset, -2, 2) * 100) / 100,
    pair: Math.round(bounded(params.get("pair"), 0, 0, 2)) as 0 | 1 | 2,
    casebook: decodeCasebook(params),
  };
}

export function encodeState(state: ReaderState): string {
  return `#${new URLSearchParams({
    p: String(state.proposition),
    s: String(state.step),
    size: String(state.size),
    r: String(Number(state.ratio.toFixed(3))),
    a: String(state.angle),
    side: String(state.side),
    m: String(state.motion),
    t: String(state.third),
    q: String(state.probe),
    v: String(state.variant),
    k: String(state.take),
    ...([17, 20].includes(state.proposition) ? { pair: String(state.pair) } : {}),
    ...(state.proposition === 12 ? { x: String(state.offset) } : {}),
    ...(state.proposition === 7 && state.casebook.open
      ? {
          case: "1",
          turn: String(state.casebook.turn),
          "case-mode": state.casebook.mode,
          "case-step": String(state.casebook.stage),
        }
      : {}),
  })}`;
}
