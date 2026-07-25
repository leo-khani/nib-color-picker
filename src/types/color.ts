export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HslaColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

export interface HsvaColor {
  h: number;
  s: number;
  v: number;
  a: number;
}

export interface ColorFormats {
  hex: string;
  hex8: string;
  rgb: string;
  rgba: string;
  hsl: string;
  hsla: string;
  hsv: string;
  hwb: string;
  cmyk: string;
  css: string;
  decimal: string;
  normalizedRgb: string;
  windowsBgr: string;
}

export type ColorFormatKey = keyof ColorFormats;

export interface ColorValue {
  rgba: RgbaColor;
  formats: ColorFormats;
}

export type HistorySource = "screen-picker" | "manual-input" | "shade" | "imported";

export interface HistoryEntry {
  id: string;
  hex: string;
  rgba: RgbaColor;
  timestamp: string;
  favorite: boolean;
  source: HistorySource;
  label?: string | undefined;
}

export interface PickerResult {
  color: RgbaColor;
  x: number;
  y: number;
  monitorName?: string | undefined;
}
