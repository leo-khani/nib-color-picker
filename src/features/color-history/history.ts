import type { HistoryEntry, HistorySource, RgbaColor } from "../../types/color";
import type { HistorySettings } from "../../types/settings";
import { normalizeRgba, toHex } from "../../lib/color/color";

export function createHistoryEntry(
  color: RgbaColor,
  source: HistorySource,
  overrides: Partial<Pick<HistoryEntry, "favorite" | "label" | "timestamp">> = {},
): HistoryEntry {
  const normalized = normalizeRgba(color);
  return {
    id: crypto.randomUUID(),
    hex: toHex(normalized),
    rgba: normalized,
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    favorite: overrides.favorite ?? false,
    source,
    ...(overrides.label ? { label: overrides.label } : {}),
  };
}

export function addHistoryEntry(
  history: HistoryEntry[],
  entry: HistoryEntry,
  settings: HistorySettings,
): HistoryEntry[] {
  if (settings.preventImmediateDuplicates && history[0]?.hex === entry.hex) return history;

  let next = history;
  if (settings.mergeDuplicates) {
    const existing = history.find((item) => item.hex === entry.hex);
    next = history.filter((item) => item.hex !== entry.hex);
    if (existing?.favorite) entry = { ...entry, favorite: true, label: existing.label };
  }
  next = [entry, ...next];

  const favorites = settings.preserveFavorites ? next.filter((item) => item.favorite) : [];
  const regular = settings.preserveFavorites ? next.filter((item) => !item.favorite) : next;
  const remainingSlots = Math.max(0, settings.maxEntries - favorites.length);
  return [...favorites, ...regular.slice(0, remainingSlots)].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
}

export const clearNonFavorites = (history: HistoryEntry[]): HistoryEntry[] =>
  history.filter((entry) => entry.favorite);
