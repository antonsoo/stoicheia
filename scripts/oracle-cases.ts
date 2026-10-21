import { cutOff, equilateral, transfer } from "../src/core/geometry";

const cases = Array.from({ length: 720 }, (_, i) => {
  const size = 100 + (i % 141);
  const ratio = 0.2 + (i % 121) / 100;
  const rotation = (((i * 37) % 360) * Math.PI) / 180;
  const referenceAngle = rotation + (((i * 19) % 360) * Math.PI) / 180;
  const side = i % 2 ? -1 : 1;
  const a = { x: Math.cos(i) * 49, y: Math.sin(i) * 31 };
  const b = { x: a.x + size * Math.cos(rotation), y: a.y + size * Math.sin(rotation) };
  const c = {
    x: b.x + size * ratio * Math.cos(referenceAngle),
    y: b.y + size * ratio * Math.sin(referenceAngle),
  };
  const target = { x: a.x + size * 2 * Math.cos(rotation), y: a.y + size * 2 * Math.sin(rotation) };
  const copied = transfer(a, b, c, side);
  const cut = cutOff(a, target, b, c, side);
  return {
    input: { a, b, c, target, side },
    output: {
      triangle: equilateral(a, b, side),
      d: copied.d,
      g: copied.g,
      l: copied.l,
      copyForCut: cut.copy.l,
      e: cut.e,
    },
  };
});
process.stdout.write(JSON.stringify(cases));
