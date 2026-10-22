import type { ReaderState } from "./core/state";

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

export function explorationControls(state: ReaderState): string {
  if (state.proposition === 17 || state.proposition === 20) {
    const choices =
      state.proposition === 17
        ? ["Angles at Β and Γ · source", "Angles at Α and Γ", "Angles at Α and Β"]
        : ["ΒΑ + ΑΓ > ΒΓ · source", "ΑΒ + ΒΓ > ΑΓ", "ΒΓ + ΓΑ > ΑΒ"];
    return `<label for="pair">Expand “similarly”<select id="pair">${choices.map((label, i) => `<option value="${i}" ${state.pair === i ? "selected" : ""}>${label}</option>`).join("")}</select></label><p>Available at step ${state.proposition === 17 ? 6 : 8}. The extra drawings repeat the proof with different point roles; the printed passage stays unchanged.</p>`;
  }
  if (state.proposition === 12)
    return `<label for="variant">Choose the side of Δ<select id="variant"><option value="0" ${!state.variant ? "selected" : ""}>Opposite side · Euclid’s choice</option><option value="1" ${state.variant ? "selected" : ""}>Same side · inspect the crossings</option></select></label><p>The source choice guarantees a chord. Try the altered choice to see why.</p><div class="parameter-buttons"><button type="button" data-circle-example="source">Source choice</button><button type="button" data-circle-example="miss">Miss the line</button><button type="button" data-circle-example="touch">Touch once</button><button type="button" data-circle-example="cross">Same-side crossing</button></div>`;
  if (state.proposition === 4 || state.proposition === 8)
    return `${range("motion", "Superpose the triangles", 0, 100, state.motion, "%")}<p>Slide and rotate ΑΒΓ onto ΔΕΖ. Every intermediate position preserves its shape.${state.proposition === 8 ? " The three sides determine the angle." : ""}</p>`;
  if (state.proposition === 7)
    return `<label for="variant">Inspect the second meeting point<select id="variant"><option value="0" ${!state.variant ? "selected" : ""}>Move Δ on the same side</option><option value="1" ${state.variant ? "selected" : ""}>Reflect Δ across the base</option></select></label><div id="probe-control" ${state.variant ? "hidden" : ""}>${range("probe", "Turn Δ toward the base", 0, Math.min(70, Math.floor(state.angle * 1.3)), state.probe, "°")}</div><p>Keep ΑΓ = ΑΔ, then inspect ΒΓ and ΒΔ. Zero turn makes Γ and Δ coincide.</p>`;
  if (state.proposition === 9)
    return `<label for="variant">Choose the equilateral vertex Ζ<select id="variant"><option value="0" ${!state.variant ? "selected" : ""}>Across ΔΕ from Α · works throughout</option><option value="1" ${state.variant ? "selected" : ""}>Inspect the other crossing</option></select></label><p>Compare the crossings at angles below, at, and above 60°.</p>${range("angle", "Given angle ΒΑΓ", 20, 150, state.angle * 2, "°", 2)}`;
  return "";
}

export function parameterControls(state: ReaderState): string {
  const p = state.proposition;
  if (p >= 17)
    return `${range("size", "Given length ΑΒ", 100, 240, state.size)}${range("ratio", p === 19 ? "Original ΑΓ (% of ΑΒ)" : "Side ΑΓ (% of ΑΒ)", p === 19 ? 101 : 20, 140, Math.round(state.ratio * 100), "%")}${range("angle", "Included angle ΒΑΓ", 20, 150, state.angle * 2, "°", 2)}${p === 19 ? "<p>The original drawing realizes the given angle inequality. The two rejected alternatives have their own fixed side ratios, shown beside the original measurements.</p>" : p === 18 ? "<p>I.18 requires ΑΓ > ΑΒ. Move through 100% to inspect the limit of its construction.</p>" : ""}<div class="parameter-buttons"><button type="button" id="flip">Flip the plate</button><button type="button" id="reset">Reset givens</button></div><div id="measurements"></div>`;
  if (p >= 11)
    return `${range("size", p === 11 ? "Half the displayed base length" : p === 12 ? "Drawing scale" : p === 16 ? "Base length ΒΓ" : "Ray length", 100, 240, state.size)}
    ${p === 11 ? range("take", "Γ along ΑΒ", 10, 90, Math.round(state.take * 100), "%") : ""}
    ${p === 12 ? range("ratio", "Γ distance from line (% of scale)", 20, 140, Math.round(state.ratio * 100), "%") + range("third", "Δ distance from line (% of scale)", 30, 180, Math.round(state.third * 100), "%") + range("offset", "Δ horizontal offset (% of scale)", -200, 200, Math.round(state.offset * 100), "%") : ""}
    ${p === 13 ? range("angle", "Given angle ΓΒΑ", 10, 90, state.angle, "°") : ""}
    ${p === 14 ? range("angle", "ΑΒ tilt from perpendicular", 10, 75, state.angle, "°") + range("probe", "Hypothetical ΒΕ tilt from ΒΔ", 5, Math.min(70, Math.floor(state.angle * 1.3)), state.probe, "°") : ""}
    ${p === 15 || p === 16 ? range("angle", p === 15 ? "Crossing angle ΒΕΓ" : "Interior angle ΑΒΓ", 20, 150, state.angle * 2, "°", 2) : ""}
    ${p === 16 ? range("ratio", "Side ΒΑ (% of ΒΓ)", 20, 140, Math.round(state.ratio * 100), "%") : ""}
    <div class="parameter-buttons"><button type="button" id="flip">Flip the plate</button><button type="button" id="reset">Reset givens</button></div><div id="measurements"></div>`;
  const sizeTitle =
    p === 2
      ? "Separation ΑΒ"
      : p === 7
        ? "Base length ΑΒ"
        : p === 8
          ? "First side ΑΒ"
          : "Given length ΑΒ";
  const ratioTitle =
    p === 2
      ? "Reference ΒΓ (% of ΑΒ)"
      : p === 3
        ? "Reference Γ (% of ΑΒ)"
        : p === 5
          ? "Extension ΒΖ (% of ΑΒ)"
          : "Second side ΑΓ (% of ΑΒ)";
  const angleControl = p === 2 || (p >= 4 && p <= 7);
  return `${range("size", sizeTitle, 100, 240, state.size)}
    ${p === 6 ? range("counter-ratio", "Hypothetical ΑΓ (% of ΑΒ)", 60, 90, Math.round((0.55 + state.ratio * 0.25) * 100), "%") : [2, 3, 4, 5, 8].includes(p) ? range("ratio", ratioTitle, 20, 140, Math.round(state.ratio * 100), "%") : ""}
    ${p === 8 ? range("third", "Base ΒΓ (% of ΑΒ)", 30, 180, Math.round(state.third * 100), "%") : ""}
    ${angleControl ? range("angle", p === 2 ? "Reference angle" : p === 7 ? "∠ΒΑΓ above the base" : p === 4 ? "Included angle" : "Apex angle", p >= 4 ? 20 : 10, p >= 4 ? 150 : 75, p >= 4 ? state.angle * 2 : state.angle, "°", p >= 4 ? 2 : 1) : ""}
    ${p === 9 ? range("take", "Choose ΑΔ (% of ΑΒ)", 10, 90, Math.round(state.take * 100), "%") : ""}
    ${p === 6 ? '<p class="parameter-note">The inequality affects only the hypothetical middle steps; their base angles cannot also be equal.</p>' : p === 8 ? '<p class="parameter-note">Three lengths determine the angle. Each side must be shorter than the other two together.</p>' : p === 9 ? '<p class="parameter-note">The given endpoints need not be equally far from Α. Here ΑΓ is 125% of ΑΒ; I.3 supplies the equal interior lengths.</p>' : ""}
    <div class="parameter-buttons"><button type="button" id="flip">Flip the ${p === 3 ? "copied line" : "plate"}</button><button type="button" id="reset">Reset givens</button></div><div id="measurements"></div>`;
}
