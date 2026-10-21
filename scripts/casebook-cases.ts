import { casebookDefaults, casebookModel } from "../src/core/casebook";

for (const size of [1, 100, 200, 1000])
  for (const rotation of [-137, 0, 47])
    for (const side of [-1, 1] as const)
      for (const input of [
        ...Array.from({ length: 66 }, (_, turn) => ({ ...casebookDefaults, turn })),
        { ...casebookDefaults, mode: "boundary" as const },
        { ...casebookDefaults, mode: "reflection" as const },
      ])
        console.log(
          JSON.stringify({
            size,
            rotation,
            side,
            input,
            ...casebookModel(input, size, rotation, side),
          }),
        );
