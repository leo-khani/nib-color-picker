import type { AppSettings } from "../../types/settings";
import type { StoredApplicationData } from "./schema";
import { CURRENT_SCHEMA_VERSION } from "./schema";

export const DEFAULT_SETTINGS: AppSettings = {
  general: {
    launchAtStartup: false,
    startMinimized: false,
    minimizeToTray: true,
    closeToTray: true,
    alwaysOnTop: true,
    restoreAfterPicking: true,
    showNotifications: true,
    confirmDestructiveActions: true,
  },
  picker: {
    shortcut: "Ctrl+Shift+C",
    shortcutEnabled: true,
    autoCopy: true,
    showMagnifier: true,
    magnifierZoom: 8,
    magnifierGridSize: 9,
    showPixelGrid: true,
    showLiveValues: true,
    cancelWithRightClick: true,
  },
  formatting: {
    uppercaseHex: true,
    includeHash: true,
    rgbSpaces: true,
    alphaPrecision: 2,
    preferredFormat: "hex",
  },
  history: {
    maxEntries: 100,
    preventImmediateDuplicates: true,
    mergeDuplicates: false,
    preserveFavorites: true,
    addGeneratedColors: true,
  },
  appearance: {
    theme: "system",
    compact: false,
    reducedMotion: "system",
    animationIntensity: 0.5,
    swatchSize: "medium",
  },
};

export const DEFAULT_DATA: StoredApplicationData = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  settings: DEFAULT_SETTINGS,
  history: [],
};
