import { z } from "zod";

export const CURRENT_SCHEMA_VERSION = 1;

export const rgbaSchema = z.object({
  r: z.number().min(0).max(255),
  g: z.number().min(0).max(255),
  b: z.number().min(0).max(255),
  a: z.number().min(0).max(1),
});

export const historyEntrySchema = z.object({
  id: z.string().min(1),
  hex: z.string().regex(/^#[0-9A-F]{6}$/i),
  rgba: rgbaSchema,
  timestamp: z.iso.datetime(),
  favorite: z.boolean(),
  source: z.enum(["screen-picker", "manual-input", "shade", "imported"]),
  label: z.string().max(100).optional(),
});

export const settingsSchema = z.object({
  general: z.object({
    launchAtStartup: z.boolean(),
    startMinimized: z.boolean(),
    minimizeToTray: z.boolean(),
    closeToTray: z.boolean(),
    alwaysOnTop: z.boolean(),
    restoreAfterPicking: z.boolean(),
    showNotifications: z.boolean(),
    confirmDestructiveActions: z.boolean(),
  }),
  picker: z.object({
    shortcut: z.string().min(1),
    shortcutEnabled: z.boolean(),
    autoCopy: z.boolean(),
    showMagnifier: z.boolean(),
    magnifierZoom: z.number().int().min(2).max(16),
    magnifierGridSize: z.number().int().min(3).max(15),
    showPixelGrid: z.boolean(),
    showLiveValues: z.boolean(),
    cancelWithRightClick: z.boolean(),
  }),
  formatting: z.object({
    uppercaseHex: z.boolean(),
    includeHash: z.boolean(),
    rgbSpaces: z.boolean(),
    alphaPrecision: z.number().int().min(0).max(4),
    preferredFormat: z.enum([
      "hex",
      "hex8",
      "rgb",
      "rgba",
      "hsl",
      "hsla",
      "hsv",
      "hwb",
      "cmyk",
      "css",
      "decimal",
      "normalizedRgb",
      "windowsBgr",
    ]),
  }),
  history: z.object({
    maxEntries: z.number().int().min(10).max(1000),
    preventImmediateDuplicates: z.boolean(),
    mergeDuplicates: z.boolean(),
    preserveFavorites: z.boolean(),
    addGeneratedColors: z.boolean(),
  }),
  appearance: z.object({
    theme: z.enum(["system", "light", "dark"]),
    compact: z.boolean(),
    reducedMotion: z.enum(["system", "reduce", "full"]),
    animationIntensity: z.number().min(0).max(1),
    swatchSize: z.enum(["small", "medium", "large"]),
  }),
});

export const windowStateSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().min(360).max(7680),
  height: z.number().min(480).max(4320),
  maximized: z.boolean(),
  monitorName: z.string().optional(),
  scaleFactor: z.number().positive().optional(),
});

export const storedDataSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  settings: settingsSchema,
  history: z.array(historyEntrySchema),
  windowState: windowStateSchema.optional(),
});

export const exportedHistorySchema = z.object({
  application: z.literal("Nib Color Picker"),
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  exportedAt: z.iso.datetime(),
  entries: z.array(historyEntrySchema).max(10000),
});

export type StoredApplicationData = z.infer<typeof storedDataSchema>;
export type ExportedHistory = z.infer<typeof exportedHistorySchema>;
