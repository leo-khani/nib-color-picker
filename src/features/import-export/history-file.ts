import type { HistoryEntry } from "../../types/color";
import {
  CURRENT_SCHEMA_VERSION,
  exportedHistorySchema,
  type ExportedHistory,
} from "../../lib/storage/schema";

export function serializeHistory(entries: HistoryEntry[]): string {
  const exported: ExportedHistory = {
    application: "Nib Color Picker",
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    entries,
  };
  return JSON.stringify(exported, null, 2);
}

export function parseHistoryFile(value: string): HistoryEntry[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value) as unknown;
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  const result = exportedHistorySchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("This file is not a valid Nib Color Picker history export.");
  }
  return result.data.entries.map((entry) => ({ ...entry, source: "imported" }));
}
