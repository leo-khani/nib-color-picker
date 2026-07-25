import { create } from "zustand";
import type { HistoryEntry, HistorySource, RgbaColor } from "../types/color";
import type { AppSettings } from "../types/settings";
import { formatColor } from "../lib/color/color";
import { addHistoryEntry, createHistoryEntry } from "../features/color-history/history";
import { createRepository } from "../lib/storage/repository";
import { DEFAULT_DATA, DEFAULT_SETTINGS } from "../lib/storage/defaults";
import {
  applyWindowPreferences,
  registerPickerShortcut,
  setStartupEnabled,
} from "../lib/platform/native";

const repository = createRepository();
let saveTimer: ReturnType<typeof setTimeout> | undefined;

interface AppStore {
  hydrated: boolean;
  currentColor: RgbaColor;
  history: HistoryEntry[];
  settings: AppSettings;
  search: string;
  favoritesOnly: boolean;
  hydrate: () => Promise<void>;
  setColor: (color: RgbaColor, source?: HistorySource, addToHistory?: boolean) => void;
  updateSettings: (settings: AppSettings) => Promise<void>;
  toggleFavorite: (id: string) => void;
  deleteHistory: (id: string) => void;
  clearHistory: (preserveFavorites: boolean) => void;
  importHistory: (entries: HistoryEntry[]) => void;
  setSearch: (search: string) => void;
  setFavoritesOnly: (favoritesOnly: boolean) => void;
}

const scheduleSave = (getState: () => AppStore): void => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const state = getState();
    void repository
      .save({
        ...DEFAULT_DATA,
        settings: state.settings,
        history: state.history,
      })
      .catch((error: unknown) => console.error("Application data could not be saved.", error));
  }, 350);
};

export const useAppStore = create<AppStore>((set, get) => ({
  hydrated: false,
  currentColor: { r: 37, g: 99, b: 235, a: 1 },
  history: [],
  settings: DEFAULT_SETTINGS,
  search: "",
  favoritesOnly: false,
  hydrate: async () => {
    const data = await repository.load();
    const current = data.history[0]?.rgba ?? get().currentColor;
    set({ hydrated: true, history: data.history, settings: data.settings, currentColor: current });
    await Promise.allSettled([
      applyWindowPreferences(data.settings.general.alwaysOnTop),
      registerPickerShortcut(data.settings.picker.shortcut, data.settings.picker.shortcutEnabled),
      setStartupEnabled(data.settings.general.launchAtStartup),
    ]);
  },
  setColor: (color, source = "manual-input", shouldAdd = true) => {
    const settings = get().settings;
    const history = shouldAdd
      ? addHistoryEntry(get().history, createHistoryEntry(color, source), settings.history)
      : get().history;
    set({ currentColor: color, history });
    scheduleSave(get);
  },
  updateSettings: async (settings) => {
    const previous = get().settings;
    try {
      if (
        settings.picker.shortcut !== previous.picker.shortcut ||
        settings.picker.shortcutEnabled !== previous.picker.shortcutEnabled
      ) {
        await registerPickerShortcut(settings.picker.shortcut, settings.picker.shortcutEnabled);
      }
      if (settings.general.alwaysOnTop !== previous.general.alwaysOnTop) {
        await applyWindowPreferences(settings.general.alwaysOnTop);
      }
      if (settings.general.launchAtStartup !== previous.general.launchAtStartup) {
        await setStartupEnabled(settings.general.launchAtStartup);
      }
      set({ settings });
      scheduleSave(get);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "The settings could not be applied.",
        { cause: error },
      );
    }
  },
  toggleFavorite: (id) => {
    set((state) => ({
      history: state.history.map((entry) =>
        entry.id === id ? { ...entry, favorite: !entry.favorite } : entry,
      ),
    }));
    scheduleSave(get);
  },
  deleteHistory: (id) => {
    set((state) => ({ history: state.history.filter((entry) => entry.id !== id) }));
    scheduleSave(get);
  },
  clearHistory: (preserveFavorites) => {
    set((state) => ({
      history: preserveFavorites ? state.history.filter((entry) => entry.favorite) : [],
    }));
    scheduleSave(get);
  },
  importHistory: (entries) => {
    let history = get().history;
    for (const entry of entries.slice().reverse()) {
      history = addHistoryEntry(history, entry, get().settings.history);
    }
    set({ history });
    scheduleSave(get);
  },
  setSearch: (search) => set({ search }),
  setFavoritesOnly: (favoritesOnly) => set({ favoritesOnly }),
}));

export const selectPreferredValue = (state: AppStore): string =>
  formatColor(state.currentColor, state.settings.formatting)[
    state.settings.formatting.preferredFormat
  ];
