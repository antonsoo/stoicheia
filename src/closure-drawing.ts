import { closureExplanations, closureSteps, closureTitles } from "./content/closure";
import type { Point } from "./core/geometry";
import { type ClosureState, closureModel, trialPoint, unitText } from "./core/triangle-closure";
import { escapeHtml } from "./html";

export function closureDrawing(state: ClosureState, narrow = false): string {
  const model = closureModel(state);
  const a = state.a / 10,
    b = state.b / 10,
    c = state.c / 10;
  const minX = Math.min(-a, b - c),
    maxX = Math.max(a, b + c) + 1.5;
  const radius = Math.max(a, c);
  // One world-to-plate scale for both axes. Trial and construction share this view.
  const width = narrow ? 360 : 760;
  const height = narrow ? 460 : 510;
  const baseline = narrow ? 290 : 300;
  const scale = Math.min((narrow ? 294 : 630) / (maxX - minX), (narrow ? 250 : 330) / (2 * radius));
  const x = (n: number) => width / 2 + (n - (maxX + minX) / 2) * scale;
  const y = (n: number) => baseline - n * scale;
  const line = (id: string, p: Point, q: Point, cls = "cl-line") =>
    `<line data-segment="${id}" x1="${x(p.x)}" y1="${y(p.y)}" x2="${x(q.x)}" y2="${y(q.y)}" class="${cls}"/>`;
  const vertex = (name: string, p: Point, dx = 0, dy = 24, cls = "") =>
    `<g data-point="${name}" data-x="${p.x}" data-y="${p.y}" class="${cls}"><circle cx="${x(p.x)}" cy="${y(p.y)}" r="4"/><text x="${x(p.x) + dx}" y="${y(p.y) + dy}" text-anchor="middle">${name}</text></g>`;
  const circle = (name: string, center: Point, r: number, cls: string) =>
    `<circle data-circle="${name}" data-radius="${r}" cx="${x(center.x)}" cy="${y(center.y)}" r="${r * scale}" class="${cls}"/>`;
  const title = state.trial ? "Try to close the two arms" : closureSteps[state.step];
  const descriptions = [
    `Three separate given lengths: Α ${a}, Β ${b}, Γ ${c}.`,
    "ΔΖ equals Α, ΖΗ equals Β, ΗΘ equals Γ. They lie consecutively on a ray starting at Δ.",
    "A circle at Ζ through Δ gives every point at distance Α from Ζ.",
    "A second circle at Η through Θ gives every point at distance Γ from Η.",
    closureExplanations[model.kind],
  ];
  let drawing = "";
  // The three separate given segments remain visible at the same scale as the construction.
  for (const [i, name, length] of [
    [0, "Α", a],
    [1, "Β", b],
    [2, "Γ", c],
  ] as const) {
    const left = narrow ? 96 : 46 + i * 246,
      top = narrow ? 42 + i * 34 : 57;
    drawing += `<g class="cl-given cl-given-${i}"><text x="${narrow ? 22 : left}" y="${narrow ? top + 5 : 28}">${name} = ${length.toFixed(1)}</text><path d="M${left} ${top - 5}v10m0 -5h${length * scale}m0 -5v10"/></g>`;
  }
  if (state.step === 0 && !state.trial) {
    drawing += `<text x="${width / 2}" y="240" text-anchor="middle" class="cl-prompt">Three lengths. No triangle yet.</text><text x="${width / 2}" y="280" text-anchor="middle" class="cl-subtext">${narrow ? "Check every pair of lengths." : "Which pairs must exceed the remaining length?"}</text>`;
  } else {
    const e = { x: maxX - 0.3, y: 0 };
    drawing += line("ray", model.delta, e, "cl-ray");
    drawing += `<text x="${x(e.x)}" y="${y(0) - 14}" text-anchor="middle">Ε</text>`;
    drawing += `<path d="M${x(e.x) - 8} ${y(0) - 4}l8 4 -8 4" class="cl-ray"/>`;
    if (!state.trial) {
      drawing +=
        line("DZ", model.delta, model.z, "cl-first") +
        line("HT", model.h, model.theta, "cl-second");
      drawing += vertex("Δ", model.delta, -8, 25) + vertex("Θ", model.theta, 8, 25);
    }
    drawing +=
      line("ZH", model.z, model.h, "cl-base") +
      vertex("Ζ", model.z, 0, 26) +
      vertex("Η", model.h, 0, -14);
    if (state.step >= 2 || state.trial) drawing += circle("Z", model.z, a, "cl-circle-first");
    if (state.step >= 3 && !state.trial) drawing += circle("H", model.h, c, "cl-circle-second");
    if (state.trial) {
      const trial = trialPoint(state);
      const v = { x: trial.point.x - model.h.x, y: trial.point.y };
      // At the hinge centre, direction is undefined. Keep the second arm horizontal
      // and report its nonzero length; never divide by zero or call that closure.
      const tip =
        trial.needed > 1e-12
          ? { x: model.h.x + (c * v.x) / trial.needed, y: (c * v.y) / trial.needed }
          : { x: model.h.x + c, y: 0 };
      drawing +=
        line("trial-first", model.z, trial.point, "cl-first") +
        line("trial-second", model.h, tip, "cl-second");
      drawing +=
        line("gap", trial.point, tip, "cl-gap") +
        vertex("P", trial.point, -12, -14, "cl-trial-point") +
        vertex("Q", tip, 12, 25, "cl-trial-tip");
    } else if (state.step >= 3 && model.intersection) {
      const k = { x: model.intersection.x, y: state.side * model.height };
      if (model.kind === "crossing") {
        const other = { x: k.x, y: -k.y };
        if (state.step === 4)
          drawing +=
            `<path data-triangle="true" d="M${x(0)} ${y(0)}L${x(b)} ${y(0)}L${x(k.x)} ${y(k.y)}Z" class="cl-fill"/>` +
            line("ZK", model.z, k, "cl-first") +
            line("HK", model.h, k, "cl-second");
        drawing +=
          vertex("Κ", k, 0, state.side > 0 ? -16 : 25) +
          vertex("Λ", other, 0, state.side > 0 ? 25 : -16);
      } else drawing += vertex("T", k, 0, -20, "cl-touch");
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="${narrow ? "cl-narrow-plate" : "cl-wide-plate"}" role="img" aria-labelledby="closure-plate-title${narrow ? "-narrow" : ""} closure-plate-desc${narrow ? "-narrow" : ""}" data-kind="${model.kind}" data-scale="${scale}"><title id="closure-plate-title${narrow ? "-narrow" : ""}">${escapeHtml(title ?? "Construction")}</title><desc id="closure-plate-desc${narrow ? "-narrow" : ""}">${escapeHtml(state.trial ? "Modern hinge experiment. P is constrained to the circle at Ζ, so ΖP equals Α. The arm ΗQ has length Γ and points towards P. The dashed segment shows their remaining separation. P and Q are modern labels." : (descriptions[state.step] ?? ""))}</desc>${drawing}<text x="${narrow ? 22 : 46}" y="${height - 10}" class="cl-subtext">${state.trial ? "P, Q: trial tips · dashed line: gap" : narrow ? "Equal scales · arbitrary units" : "Equal scale on both axes · arbitrary drawing units"}</text></svg>`;
}

export function closureConditions(state: ClosureState): string {
  const model = closureModel(state);
  const pairs = [
    ["Α + Β", state.a + state.b, "Γ", state.c],
    ["Α + Γ", state.a + state.c, "Β", state.b],
    ["Β + Γ", state.b + state.c, "Α", state.a],
  ] as const;
  return `<table class="cl-conditions"><caption>Every pair must be greater</caption><thead><tr><th scope="col">Pair</th><th scope="col">Your lengths</th><th scope="col">Strict test</th></tr></thead><tbody>${pairs.map(([pair, sum, other, value]) => `<tr data-valid="${sum > value}"><th scope="row">${pair} &gt; ${other}</th><td>${unitText(sum)} ${sum > value ? "&gt;" : sum < value ? "&lt;" : "="} ${unitText(value)}</td><td>${sum > value ? "Holds" : sum === value ? "Equality" : "Fails"}</td></tr>`).join("")}</tbody></table><p class="cl-bound">With Α and Β fixed:<br/><strong>${unitText(model.lower)} &lt; Γ &lt; ${unitText(model.upper)}</strong><br/>The endpoints are excluded.</p>`;
}

export function closureSummary(state: ClosureState): string {
  const model = closureModel(state);
  return `<h3>${closureTitles[model.kind]}</h3><p>${closureExplanations[model.kind]}</p>${model.gap > 0 ? `<p>Nearest circumferences: <strong>${model.gap.toFixed(1)} units apart.</strong></p>` : `<p>Height: <strong>${model.height.toFixed(3)}</strong> units. Area: <strong>${model.area.toFixed(3)}</strong> square units.</p>`}`;
}
