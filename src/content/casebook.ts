import type { Placement } from "../core/casebook";

export const caseTitles: Record<Placement, string> = {
  outside: "Δ outside the triangle",
  inside: "Δ inside the triangle",
  boundary: "Δ on side ΒΓ",
  reflection: "Δ across the base",
  coincident: "Δ coincides with Γ",
};
export const caseStages = [
  "Inspect the placement",
  "Choose the I.5 result",
  "Compare whole and part",
  "Test the second equality",
];

export function caseExplanation(
  placement: Placement,
  stage: number,
): { title: string; text: string; chain: string } {
  if (placement === "reflection")
    return {
      title: "Two solutions, on opposite sides",
      text: "Reflection keeps both distances equal. It fails the same-side condition, so it is allowed by I.7. Returning Δ to the upper half-plane removes this second solution. The theorem does not assert uniqueness in the whole plane.",
      chain: "ΑΓ = ΑΔ; ΒΓ = ΒΔ; same side: no",
    };
  if (placement === "coincident")
    return {
      title: "One point is not two distinct points",
      text: "Both distance pairs agree, but Δ is Γ. There is no segment ΓΔ and no triangle ΑΓΔ. Neither the interior nor the exterior angle argument applies to a collapsed triangle.",
      chain: "Γ = Δ; distinct meeting points: no",
    };
  if (placement === "boundary")
    return {
      title: "Use the segment, not a flattened triangle",
      text: "Δ lies between Β and Γ. Thus ΒΓ consists of ΒΔ together with the nonzero ΔΓ, and is greater than ΒΔ. The second equality is impossible directly by whole and part. Applying I.5 to ΒΓΔ here would use a degenerate triangle.",
      chain: "ΒΓ = ΒΔ + ΔΓ > ΒΔ",
    };
  const inside = placement === "inside";
  const stages = [
    {
      title: inside ? "The printed part relation no longer fits" : "The printed part relation fits",
      text: inside
        ? "At Γ, ray ΓΒ lies outside ∠ΑΓΔ. So ∠ΔΓΒ is not a part of ∠ΑΓΔ. Their numerical sizes can still have the desired order; that does not repair this reason for the order. We need a different containing angle."
        : "At Γ, ray ΓΒ lies inside ∠ΑΓΔ. The purple ∠ΔΓΒ is therefore a proper part of the double-marked ∠ΑΓΔ. This is the placement used by the printed proof. Move Δ into the shaded triangle and inspect the same rays.",
      chain: inside ? "∠ΑΓΔ = ∠ΑΓΒ − ∠ΔΓΒ" : "∠ΑΓΔ = ∠ΑΓΒ + ∠ΔΓΒ",
    },
    {
      title: inside ? "Use the angles below the base" : "Use the angles at the base",
      text: inside
        ? "Extend ΑΓ beyond Γ to Ε, and ΑΔ beyond Δ to Ζ (postulate 2). In isosceles ΑΓΔ, I.5 makes the two exterior angles ΕΓΔ and ΖΔΓ equal. Ε and Ζ are labels for this supplement; they do not occur in the printed I.7 passage."
        : "ΑΓ = ΑΔ, so I.5 gives equal interior base angles in triangle ΑΓΔ. The double marks identify this pair. The equalities come from the preserved first distance pair; nothing has yet made ΒΓ equal to ΒΔ.",
      chain: inside ? "∠ΕΓΔ = ∠ΖΔΓ (I.5, exterior angles)" : "∠ΑΓΔ = ∠ΑΔΓ (I.5, interior angles)",
    },
    {
      title: "Carry the order through equal angles",
      text: inside
        ? "At Γ, ∠ΔΓΒ is now a proper part of ∠ΕΓΔ. At Δ, ∠ΖΔΓ is a proper part of ∠ΓΔΒ. The equal exterior angles sit between the smaller and larger angles. This uses whole and part, substitution of equal magnitudes, and transitivity of order."
        : "∠ΔΓΒ is smaller than ∠ΑΓΔ. That equals ∠ΑΔΓ, which is itself a proper part of ∠ΓΔΒ. The equal interior angles sit between the smaller and larger angles. Substitution and transitivity carry the strict order across the equality.",
      chain: inside ? "∠ΔΓΒ < ∠ΕΓΔ = ∠ΖΔΓ < ∠ΓΔΒ" : "∠ΔΓΒ < ∠ΑΓΔ = ∠ΑΔΓ < ∠ΓΔΒ",
    },
    {
      title: "The second equality would contradict this order",
      text: "If ΒΓ also equalled ΒΔ, I.5 in triangle ΒΓΔ would make ∠ΔΓΒ equal to ∠ΓΔΒ. The previous comparison made them unequal. That is the contradiction. The sketch retains the first equality and displays the actual unequal second pair; it cannot draw both incompatible assumptions as facts.",
      chain: "If ΒΓ = ΒΔ: ∠ΔΓΒ = ∠ΓΔΒ. But ∠ΔΓΒ < ∠ΓΔΒ.",
    },
  ] as const;
  return stages[stage] ?? stages[0];
}

export const casebookSources = {
  heath:
    "https://www.maths.tcd.ie/~dwilkins/Euclid/Euclid_HeathCommentaries/EuclidElements_HeathCommentary_ElementsBk1Prop07_DraftTranscription.pdf",
  joyce: "https://mathcs.clarku.edu/~djoyce/elements/bookI/propI7.html",
};
