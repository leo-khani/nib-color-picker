import type { ColorFormats, HslaColor, HsvaColor, RgbaColor } from "../../types/color";
import type { FormattingSettings } from "../../types/settings";

const clamp = (value: number, min = 0, max = 255): number => Math.min(max, Math.max(min, value));
const round = (value: number, precision = 0): number => {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export function normalizeRgba(color: RgbaColor): RgbaColor {
  return {
    r: Math.round(clamp(color.r)),
    g: Math.round(clamp(color.g)),
    b: Math.round(clamp(color.b)),
    a: clamp(color.a, 0, 1),
  };
}

export function parseColor(input: string): RgbaColor | null {
  const value = input.trim();
  const hex = value.match(/^#?([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i);
  if (hex?.[1]) {
    let body = hex[1];
    if (body.length <= 4) body = [...body].map((part) => `${part}${part}`).join("");
    const hasAlpha = body.length === 8;
    return {
      r: Number.parseInt(body.slice(0, 2), 16),
      g: Number.parseInt(body.slice(2, 4), 16),
      b: Number.parseInt(body.slice(4, 6), 16),
      a: hasAlpha ? round(Number.parseInt(body.slice(6, 8), 16) / 255, 4) : 1,
    };
  }

  const rgb = value.match(
    /^rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)(?:\s*[,/]\s*(\d*\.?\d+%?))?\s*\)$/i,
  );
  if (rgb?.[1] && rgb[2] && rgb[3]) {
    const channels = rgb.slice(1, 4).map(Number);
    if (channels.some((channel) => channel > 255)) return null;
    const alphaText = rgb[4];
    const alpha = alphaText
      ? alphaText.endsWith("%")
        ? Number.parseFloat(alphaText) / 100
        : Number.parseFloat(alphaText)
      : 1;
    if (alpha < 0 || alpha > 1) return null;
    return normalizeRgba({
      r: channels[0] ?? 0,
      g: channels[1] ?? 0,
      b: channels[2] ?? 0,
      a: alpha,
    });
  }

  const hsl = value.match(
    /^hsla?\(\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)%\s*[, ]\s*(\d+(?:\.\d+)?)%(?:\s*[,/]\s*(\d*\.?\d+%?))?\s*\)$/i,
  );
  if (hsl?.[1] && hsl[2] && hsl[3]) {
    const saturation = Number(hsl[2]);
    const lightness = Number(hsl[3]);
    if (saturation > 100 || lightness > 100) return null;
    const alphaText = hsl[4];
    const alpha = alphaText
      ? alphaText.endsWith("%")
        ? Number.parseFloat(alphaText) / 100
        : Number.parseFloat(alphaText)
      : 1;
    if (alpha < 0 || alpha > 1) return null;
    return hslaToRgba({ h: Number(hsl[1]), s: saturation, l: lightness, a: alpha });
  }
  return null;
}

export function rgbaToHsla(input: RgbaColor): HslaColor {
  const { r, g, b, a } = normalizeRgba(input);
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
    else h = 60 * ((rn - gn) / delta + 4);
  }
  if (h < 0) h += 360;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h: round(h, 1), s: round(s * 100, 1), l: round(l * 100, 1), a };
}

export function hslaToRgba(input: HslaColor): RgbaColor {
  const h = ((input.h % 360) + 360) % 360;
  const s = clamp(input.s, 0, 100) / 100;
  const l = clamp(input.l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const candidates: [number, number, number][] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const [r, g, b] = candidates[Math.floor(h / 60)] ?? candidates[0]!;
  return normalizeRgba({
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
    a: input.a,
  });
}

export function rgbaToHsva(input: RgbaColor): HsvaColor {
  const hsl = rgbaToHsla(input);
  const l = hsl.l / 100;
  const s = hsl.s / 100;
  const v = l + s * Math.min(l, 1 - l);
  return {
    h: hsl.h,
    s: v === 0 ? 0 : round(100 * (2 * (1 - l / v)), 1),
    v: round(v * 100, 1),
    a: input.a,
  };
}

const channelHex = (channel: number): string =>
  Math.round(clamp(channel)).toString(16).padStart(2, "0");

export function toHex(color: RgbaColor, alpha = false): string {
  const normalized = normalizeRgba(color);
  const value = `${channelHex(normalized.r)}${channelHex(normalized.g)}${channelHex(normalized.b)}`;
  return `#${value}${alpha ? channelHex(normalized.a * 255) : ""}`.toUpperCase();
}

export function formatColor(input: RgbaColor, options?: Partial<FormattingSettings>): ColorFormats {
  const color = normalizeRgba(input);
  const hsl = rgbaToHsla(color);
  const hsv = rgbaToHsva(color);
  const separator = options?.rgbSpaces === false ? "," : ", ";
  const alphaPrecision = options?.alphaPrecision ?? 2;
  const alpha = round(color.a, alphaPrecision);
  const hexBase = toHex(color);
  const hex8Base = toHex(color, true);
  const transformHex = (value: string): string => {
    const formatted = options?.uppercaseHex === false ? value.toLowerCase() : value;
    return options?.includeHash === false ? formatted.slice(1) : formatted;
  };
  const whiteness = (Math.min(color.r, color.g, color.b) / 255) * 100;
  const blackness = (1 - Math.max(color.r, color.g, color.b) / 255) * 100;
  const k = 1 - Math.max(color.r, color.g, color.b) / 255;
  const cmykChannel = (channel: number): number =>
    k === 1 ? 0 : ((1 - channel / 255 - k) / (1 - k)) * 100;
  const decimal = (color.r << 16) + (color.g << 8) + color.b;
  const bgr = (color.b << 16) + (color.g << 8) + color.r;
  const rgb = `rgb(${color.r}${separator}${color.g}${separator}${color.b})`;
  return {
    hex: transformHex(hexBase),
    hex8: transformHex(hex8Base),
    rgb,
    rgba: `rgba(${color.r}${separator}${color.g}${separator}${color.b}${separator}${alpha})`,
    hsl: `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`,
    hsla: `hsl(${hsl.h} ${hsl.s}% ${hsl.l}% / ${alpha})`,
    hsv: `hsv(${hsv.h} ${hsv.s}% ${hsv.v}%)`,
    hwb: `hwb(${hsl.h} ${round(whiteness, 1)}% ${round(blackness, 1)}%)`,
    cmyk: `cmyk(${round(cmykChannel(color.r))}% ${round(cmykChannel(color.g))}% ${round(cmykChannel(color.b))}% ${round(k * 100)}%)`,
    css:
      color.a === 1
        ? rgb
        : `rgba(${color.r}${separator}${color.g}${separator}${color.b}${separator}${alpha})`,
    decimal: decimal.toString(),
    normalizedRgb: `${round(color.r / 255, 4)} ${round(color.g / 255, 4)} ${round(color.b / 255, 4)}`,
    windowsBgr: bgr.toString(),
  };
}

function linearChannel(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color: RgbaColor): number {
  return (
    0.2126 * linearChannel(color.r) +
    0.7152 * linearChannel(color.g) +
    0.0722 * linearChannel(color.b)
  );
}

export function contrastRatio(first: RgbaColor, second: RgbaColor): number {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort(
    (a, b) => b - a,
  );
  return round(((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05), 2);
}

export function readableTextColor(color: RgbaColor): "#000000" | "#FFFFFF" {
  return contrastRatio(color, { r: 0, g: 0, b: 0, a: 1 }) >=
    contrastRatio(color, { r: 255, g: 255, b: 255, a: 1 })
    ? "#000000"
    : "#FFFFFF";
}
