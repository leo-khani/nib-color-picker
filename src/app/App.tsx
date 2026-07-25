import { lazy, Suspense, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { Crosshair, Settings, Zap } from "lucide-react";
import { ColorDetails } from "../features/color-details/ColorDetails";
import { ColorHarmonies } from "../features/color-harmonies/ColorHarmonies";
import { HistoryList } from "../features/color-history/HistoryList";
import { Toast } from "../components/feedback/Toast";
import { IconButton } from "../components/ui/IconButton";
import { useCopy } from "../hooks/use-copy";
import { isTauri, pickScreenColor } from "../lib/platform/native";
import { formatColor } from "../lib/color/color";
import { useAppStore } from "../stores/app-store";

const SettingsPanel = lazy(() => import("../features/settings/SettingsPanel"));

export function App() {
  const {
    hydrated,
    currentColor,
    history,
    settings,
    search,
    favoritesOnly,
    hydrate,
    setColor,
    updateSettings,
    toggleFavorite,
    deleteHistory,
    clearHistory,
    importHistory,
    setSearch,
    setFavoritesOnly,
  } = useAppStore();
  const { copy, message } = useCopy();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const dark =
      settings.appearance.theme === "dark" ||
      (settings.appearance.theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, [settings.appearance.theme]);

  const pick = async () => {
    setPicking(true);
    setPickerError(null);
    try {
      const result = await pickScreenColor();
      setColor(result.color, "screen-picker");
      if (settings.picker.autoCopy) {
        const formats = formatColor(result.color, settings.formatting);
        await copy(formats[settings.formatting.preferredFormat], "Picked color copied");
      }
    } catch (error) {
      const value = error instanceof Error ? error.message : String(error);
      if (!value.toLowerCase().includes("cancel")) setPickerError(value);
    } finally {
      setPicking(false);
    }
  };

  useEffect(() => {
    if (!isTauri()) return;
    const unlistenPicker = listen("picker-requested", () => void pick());
    const unlistenSettings = listen("settings-requested", () => setSettingsOpen(true));
    return () => {
      void unlistenPicker.then((unlisten) => unlisten());
      void unlistenSettings.then((unlisten) => unlisten());
    };
  });

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
        Loading Nib Color Picker…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Zap size={17} fill="currentColor" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold">Nib Color Picker</h1>
            <p className="truncate text-xs text-zinc-500">Fast, private, and always ready</p>
          </div>
          <IconButton label="Open settings" onClick={() => setSettingsOpen(true)}>
            <Settings size={17} />
          </IconButton>
        </div>
      </header>

      <main
        className={`mx-auto max-w-xl ${settings.appearance.compact ? "space-y-4 p-3" : "space-y-6 p-4"}`}
      >
        <button
          type="button"
          onClick={() => void pick()}
          disabled={picking}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          <Crosshair size={19} />
          {picking ? "Picking…" : "Pick color from screen"}
          <kbd className="ml-auto rounded bg-white/15 px-2 py-0.5 text-xs font-normal">
            {settings.picker.shortcut}
          </kbd>
        </button>
        {pickerError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            {pickerError}
          </p>
        )}

        <ColorDetails
          color={currentColor}
          formatting={settings.formatting}
          onChange={(color) => setColor(color, "manual-input")}
          onCopy={(value, label) => void copy(value, label)}
        />
        <ColorHarmonies
          color={currentColor}
          onSelect={(color) => setColor(color, "shade", settings.history.addGeneratedColors)}
          onCopy={(value) => void copy(value)}
        />
        <HistoryList
          entries={history}
          formatting={settings.formatting}
          search={search}
          favoritesOnly={favoritesOnly}
          onSearch={setSearch}
          onFavoritesOnly={setFavoritesOnly}
          onSelect={(entry) => setColor(entry.rgba, entry.source, false)}
          onCopy={(value) => void copy(value)}
          onFavorite={toggleFavorite}
          onDelete={deleteHistory}
        />
      </main>

      <footer className="sticky bottom-0 border-t border-zinc-200 bg-white/95 px-4 py-2 text-center text-xs text-zinc-500 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        {settings.picker.shortcutEnabled
          ? `${settings.picker.shortcut} · Global shortcut active`
          : "Global shortcut paused"}
      </footer>
      <Toast message={message} />

      {settingsOpen && (
        <Suspense fallback={null}>
          <SettingsPanel
            settings={settings}
            history={history}
            onClose={() => setSettingsOpen(false)}
            onSave={updateSettings}
            onImport={importHistory}
            onClear={clearHistory}
          />
        </Suspense>
      )}
    </div>
  );
}
