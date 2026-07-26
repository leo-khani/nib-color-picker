import { Download, Upload, X } from "lucide-react";
import { useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from "react";
import type { AppSettings } from "../../types/settings";
import { validateShortcut } from "../../lib/shortcuts/validate";
import { parseHistoryFile, serializeHistory } from "../import-export/history-file";
import type { HistoryEntry } from "../../types/color";

function captureShortcut(event: KeyboardEvent<HTMLInputElement>): string | null {
  if (["Control", "Shift", "Alt", "Meta"].includes(event.key)) return null;

  const modifiers = [
    event.ctrlKey ? "Ctrl" : "",
    event.altKey ? "Alt" : "",
    event.shiftKey ? "Shift" : "",
    event.metaKey ? "Super" : "",
  ].filter(Boolean);

  if (modifiers.length === 0) return null;

  const key =
    event.key === " "
      ? "Space"
      : event.key === "Esc"
        ? "Escape"
        : event.key.length === 1
          ? event.key.toUpperCase()
          : event.key;

  return [...modifiers, key].join("+");
}

interface SettingsPanelProps {
  settings: AppSettings;
  history: HistoryEntry[];
  onClose: () => void;
  onSave: (settings: AppSettings) => Promise<void>;
  onImport: (entries: HistoryEntry[]) => void;
}

export default function SettingsPanel({
  settings,
  history,
  onClose,
  onSave,
  onImport,
}: SettingsPanelProps) {
  const [draft, setDraft] = useState(settings);
  const [error, setError] = useState<string | null>(null);
  const shortcutError = validateShortcut(draft.picker.shortcut);

  const save = async () => {
    if (shortcutError) return;
    try {
      await onSave(draft);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Settings could not be saved.");
    }
  };

  const exportHistory = () => {
    const blob = new Blob([serializeHistory(history)], { type: "application/json" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `nib-color-picker-history-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const importHistory = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      onImport(parseHistoryFile(await file.text()));
      setError(null);
    } catch (importError) {
      setError(
        importError instanceof Error ? importError.message : "History could not be imported.",
      );
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex overflow-hidden bg-zinc-950/65 text-zinc-50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="flex min-h-0 w-full flex-col">
        <header className="z-10 flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 id="settings-title" className="text-lg font-semibold">
            Settings
          </h1>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-ios-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={19} />
          </button>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto max-w-xl space-y-6 p-5">
            <SettingsSection title="App">
              <Toggle
                label="Launch when Windows starts"
                checked={draft.general.launchAtStartup}
                onChange={(value) =>
                  setDraft({ ...draft, general: { ...draft.general, launchAtStartup: value } })
                }
              />
              <Toggle
                label="Close to system tray"
                checked={draft.general.closeToTray}
                onChange={(value) =>
                  setDraft({ ...draft, general: { ...draft.general, closeToTray: value } })
                }
              />
              <Toggle
                label="Compact mode"
                checked={draft.appearance.compact}
                onChange={(value) =>
                  setDraft({ ...draft, appearance: { ...draft.appearance, compact: value } })
                }
              />
            </SettingsSection>
            <SettingsSection title="Picker">
              <label className="block">
                <span className="mb-1 block text-sm">Global shortcut</span>
                <input
                  value={draft.picker.shortcut}
                  readOnly
                  onKeyDown={(event) => {
                    event.preventDefault();
                    const shortcut = captureShortcut(event);
                    if (shortcut) {
                      setDraft({
                        ...draft,
                        picker: { ...draft.picker, shortcut },
                      });
                    }
                  }}
                  onFocus={(event) => event.currentTarget.select()}
                  aria-invalid={Boolean(shortcutError)}
                  aria-describedby="shortcut-help"
                  className="w-full cursor-pointer rounded-ios-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-50"
                />
                <span id="shortcut-help" className="mt-1 block text-xs text-zinc-400">
                  Click the field, then press a modifier and key.
                </span>
                {shortcutError && (
                  <span className="mt-1 block text-xs text-red-600">{shortcutError}</span>
                )}
              </label>
              <Toggle
                label="Global shortcut enabled"
                checked={draft.picker.shortcutEnabled}
                onChange={(value) =>
                  setDraft({ ...draft, picker: { ...draft.picker, shortcutEnabled: value } })
                }
              />
              <Toggle
                label="Copy automatically after picking"
                checked={draft.picker.autoCopy}
                onChange={(value) =>
                  setDraft({ ...draft, picker: { ...draft.picker, autoCopy: value } })
                }
              />
            </SettingsSection>
            <SettingsSection title="Formatting">
              <label className="flex items-center justify-between gap-4 text-sm">
                Preferred format
                <select
                  value={draft.formatting.preferredFormat}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      formatting: {
                        ...draft.formatting,
                        preferredFormat: event.target
                          .value as AppSettings["formatting"]["preferredFormat"],
                      },
                    })
                  }
                  className="rounded-ios-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                >
                  {["hex", "hex8", "rgb", "rgba", "hsl", "hsla", "hsv", "hwb", "cmyk", "css"].map(
                    (format) => (
                      <option key={format} value={format}>
                        {format.toUpperCase()}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </SettingsSection>
            <SettingsSection title="History">
              <label className="block text-sm">
                Maximum entries
                <input
                  type="number"
                  min={10}
                  max={1000}
                  value={draft.history.maxEntries}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      history: { ...draft.history, maxEntries: Number(event.target.value) },
                    })
                  }
                  className="mt-1 w-full rounded-ios-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={exportHistory}
                  className="inline-flex items-center gap-2 rounded-ios-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                >
                  <Download size={16} /> Export
                </button>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-ios-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700">
                  <Upload size={16} /> Import
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="sr-only"
                    onChange={(event) => void importHistory(event)}
                  />
                </label>
              </div>
            </SettingsSection>
            {error && (
              <p
                role="alert"
                className="rounded-ios-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
              >
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pb-6">
              <button type="button" onClick={onClose} className="rounded-ios-lg px-4 py-2 text-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={Boolean(shortcutError)}
                className="rounded-ios-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50"
              >
                Save settings
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-ios-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
      />
    </label>
  );
}
