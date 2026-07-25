import type { ColorFormatKey } from "./color";

export type Theme = "system" | "light" | "dark";
export type ReducedMotion = "system" | "reduce" | "full";

export interface GeneralSettings {
  launchAtStartup: boolean;
  startMinimized: boolean;
  minimizeToTray: boolean;
  closeToTray: boolean;
  alwaysOnTop: boolean;
  restoreAfterPicking: boolean;
  showNotifications: boolean;
  confirmDestructiveActions: boolean;
}

export interface PickerSettings {
  shortcut: string;
  shortcutEnabled: boolean;
  autoCopy: boolean;
  showMagnifier: boolean;
  magnifierZoom: number;
  magnifierGridSize: number;
  showPixelGrid: boolean;
  showLiveValues: boolean;
  cancelWithRightClick: boolean;
}

export interface FormattingSettings {
  uppercaseHex: boolean;
  includeHash: boolean;
  rgbSpaces: boolean;
  alphaPrecision: number;
  preferredFormat: ColorFormatKey;
}

export interface HistorySettings {
  maxEntries: number;
  preventImmediateDuplicates: boolean;
  mergeDuplicates: boolean;
  preserveFavorites: boolean;
  addGeneratedColors: boolean;
}

export interface AppearanceSettings {
  theme: Theme;
  compact: boolean;
  reducedMotion: ReducedMotion;
  animationIntensity: number;
  swatchSize: "small" | "medium" | "large";
}

export interface AppSettings {
  general: GeneralSettings;
  picker: PickerSettings;
  formatting: FormattingSettings;
  history: HistorySettings;
  appearance: AppearanceSettings;
}

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  maximized: boolean;
  monitorName?: string | undefined;
  scaleFactor?: number | undefined;
}

export interface MonitorInfo {
  name?: string | undefined;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleFactor: number;
}
