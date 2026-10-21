import type { ReaderState } from "./core/state";

export function parameterControls(state: ReaderState): string {
  const p = state.proposition;
  const range = (
    id: string,
    title: string,
    min: number,
    max: number,
    value: number,
    suffix = "",
    step = 1,
  ) =>
    `<label class="range-label" for="${id}">${title}<output id="${id}-output" for="${id}">${value}${suffix}</output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" />`;
  const sizeTitle = p === 2 ? "Separation ΑΒ" : p >= 5 ? "Side length ΑΒ" : "Given length ΑΒ";
  const ratioTitle =
    p === 2
      ? "Reference ΒΓ (% of ΑΒ)"
      : p === 3
        ? "Reference Γ (% of ΑΒ)"
        : p === 4
          ? "Second side ΑΓ (% of ΑΒ)"
          : p === 5
            ? "Extension ΒΖ (% of ΑΒ)"
            : "Strength of temporary inequality";
  return `${range("size", sizeTitle, 100, 240, state.size)}
    ${p === 6 ? range("counter-ratio", "Hypothetical ΑΓ (% of ΑΒ)", 60, 90, Math.round((0.55 + state.ratio * 0.25) * 100), "%") : p > 1 ? range("ratio", ratioTitle, 20, 140, Math.round(state.ratio * 100), "%") : ""}
    ${p === 2 || p >= 4 ? range("angle", p === 2 ? "Reference angle" : p === 4 ? "Included angle" : "Apex angle", p >= 4 ? 20 : 10, p >= 4 ? 150 : 75, p >= 4 ? state.angle * 2 : state.angle, "°", p >= 4 ? 2 : 1) : ""}
    ${p >= 4 ? `<p class="parameter-note">Adjust the plate’s lengths and angle.${p === 6 ? " The inequality control affects only the hypothetical middle steps; their base angles cannot also be equal." : ""}</p>` : ""}
    <div class="parameter-buttons"><button type="button" id="flip">Flip the ${p === 3 ? "copied line" : "plate"}</button><button type="button" id="reset">Reset givens</button></div><div id="measurements"></div>`;
}
