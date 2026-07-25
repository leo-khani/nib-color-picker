import type { HslaColor, RgbaColor } from "../../types/color";
import { hslaToRgba, rgbaToHsla } from "./color";

export type HarmonyName =
  "complementary" | "analogous" | "triadic" | "splitComplementary" | "tetradic";

const rotate = (color: HslaColor, angle: number): RgbaColor =>
  hslaToRgba({ ...color, h: (color.h + angle + 360) % 360 });

export function generateHarmony(color: RgbaColor, name: HarmonyName): RgbaColor[] {
  const hsl = rgbaToHsla(color);
  const angles: Record<HarmonyName, number[]> = {
    complementary: [0, 180],
    analogous: [-30, 0, 30],
    triadic: [0, 120, 240],
    splitComplementary: [0, 150, 210],
    tetradic: [0, 90, 180, 270],
  };
  return angles[name].map((angle) => rotate(hsl, angle));
}

export function generateLightnessScale(color: RgbaColor, count = 5): RgbaColor[] {
  const hsl = rgbaToHsla(color);
  if (count < 2) return [color];
  return Array.from({ length: count }, (_, index) =>
    hslaToRgba({ ...hsl, l: (index / (count - 1)) * 100 }),
  );
}

export function generateTints(color: RgbaColor, count = 5): RgbaColor[] {
  const hsl = rgbaToHsla(color);
  return Array.from({ length: count }, (_, index) =>
    hslaToRgba({ ...hsl, l: hsl.l + ((100 - hsl.l) * (index + 1)) / (count + 1) }),
  );
}

export function generateTones(color: RgbaColor, count = 5): RgbaColor[] {
  const hsl = rgbaToHsla(color);
  return Array.from({ length: count }, (_, index) =>
    hslaToRgba({ ...hsl, s: hsl.s * (1 - (index + 1) / (count + 1)) }),
  );
}
