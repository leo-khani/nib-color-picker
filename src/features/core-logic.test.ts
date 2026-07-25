import { addHistoryEntry, createHistoryEntry } from "./color-history/history";
import { parseHistoryFile, serializeHistory } from "./import-export/history-file";
import { correctWindowState } from "./window-state/geometry";
import { DEFAULT_SETTINGS } from "../lib/storage/defaults";
import { migrateStoredData } from "../lib/storage/repository";
import { validateShortcut } from "../lib/shortcuts/validate";

describe("history", () => {
  it("deduplicates immediate entries and preserves favorites over the limit", () => {
    const settings = { ...DEFAULT_SETTINGS.history, maxEntries: 10 };
    const favorite = createHistoryEntry({ r: 1, g: 2, b: 3, a: 1 }, "manual-input", {
      favorite: true,
      timestamp: "2024-01-01T00:00:00.000Z",
    });
    let history = [favorite];
    for (let index = 0; index < 15; index += 1) {
      history = addHistoryEntry(
        history,
        createHistoryEntry({ r: index + 10, g: 20, b: 30, a: 1 }, "screen-picker"),
        settings,
      );
    }
    expect(history).toHaveLength(10);
    expect(history).toContainEqual(favorite);
    expect(addHistoryEntry(history, history[0]!, settings)).toBe(history);
  });
});

describe("stored data", () => {
  it("recovers from corruption and migrates version zero", () => {
    expect(migrateStoredData("broken").schemaVersion).toBe(1);
    expect(migrateStoredData({ schemaVersion: 0, history: [] }).schemaVersion).toBe(1);
  });

  it("validates imported files", () => {
    const entry = createHistoryEntry({ r: 10, g: 20, b: 30, a: 1 }, "manual-input");
    expect(parseHistoryFile(serializeHistory([entry]))[0]?.source).toBe("imported");
    expect(() => parseHistoryFile("{}")).toThrow("valid Nib Color Picker");
  });
});

describe("platform helpers", () => {
  it("centers a disconnected window on the fallback display", () => {
    const monitor = { name: "primary", x: 0, y: 0, width: 1920, height: 1080, scaleFactor: 1 };
    const corrected = correctWindowState(
      { x: -5000, y: 0, width: 500, height: 600, maximized: false },
      [monitor],
      monitor,
    );
    expect(corrected.x).toBe(710);
  });

  it("validates global shortcuts", () => {
    expect(validateShortcut("Ctrl+Shift+C")).toBeNull();
    expect(validateShortcut("C")).toMatch(/modifier/);
    expect(validateShortcut("Ctrl+Ctrl+C")).toMatch(/repeated/);
  });
});
