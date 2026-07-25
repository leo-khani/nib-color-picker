import { contrastRatio, formatColor, hslaToRgba, parseColor, rgbaToHsla, toHex } from "./color";
import { generateHarmony, generateLightnessScale } from "./harmonies";

describe("color utilities", () => {
  it.each([
    ["#abc", { r: 170, g: 187, b: 204, a: 1 }],
    ["11223380", { r: 17, g: 34, b: 51, a: 0.502 }],
    ["rgb(12, 34, 56)", { r: 12, g: 34, b: 56, a: 1 }],
    ["rgba(12 34 56 / 50%)", { r: 12, g: 34, b: 56, a: 0.5 }],
  ])("parses %s", (input, expected) => {
    expect(parseColor(input)).toEqual(expected);
  });

  it("rejects out-of-range input", () => {
    expect(parseColor("rgb(999, 0, 0)")).toBeNull();
    expect(parseColor("not a color")).toBeNull();
  });

  it("round trips HSL", () => {
    const color = { r: 37, g: 99, b: 235, a: 0.75 };
    expect(toHex(hslaToRgba(rgbaToHsla(color)))).toBe("#2563EB");
  });

  it("formats all supported representations", () => {
    const formats = formatColor(
      { r: 255, g: 0, b: 128, a: 0.5 },
      { uppercaseHex: false, includeHash: false, rgbSpaces: false, alphaPrecision: 2 },
    );
    expect(formats.hex).toBe("ff0080");
    expect(formats.rgba).toBe("rgba(255,0,128,0.5)");
    expect(formats.decimal).toBe("16711808");
  });

  it("uses WCAG contrast math", () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0, a: 1 }, { r: 255, g: 255, b: 255, a: 1 })).toBe(21);
  });

  it("generates predictable relationships", () => {
    const red = { r: 255, g: 0, b: 0, a: 1 };
    expect(generateHarmony(red, "complementary").map((color) => toHex(color))).toEqual([
      "#FF0000",
      "#00FFFF",
    ]);
    expect(generateLightnessScale(red, 3).map((color) => toHex(color))).toEqual([
      "#000000",
      "#FF0000",
      "#FFFFFF",
    ]);
  });
});
