import { foundationById, reasonFoundations } from "./content/foundations";
import type { Lesson } from "./content/lessons";

export function courseSourcePages(lesson: Lesson): number[] {
  const foundations = [...new Set(lesson.steps.flatMap((p) => reasonFoundations[p.reason] ?? []))]
    .map((id) => foundationById.get(id))
    .filter((e) => e !== undefined);
  const passages = [lesson.statement, ...lesson.steps, ...foundations];
  return [
    ...new Set([
      ...passages.flatMap((p) => [...p.greekPages, ...p.latinPages]),
      ...(lesson.editionNote?.greekPages ?? []),
    ]),
  ].sort((a, b) => a - b);
}
