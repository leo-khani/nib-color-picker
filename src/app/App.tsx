import { listen } from "@tauri-apps/api/event";
import { Check, Copy, Crosshair } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppHeaderBar, { type AppSection } from "../components/app-header-bar";
import { Toast } from "../components/feedback/Toast";
import { Grainient } from "../components/grainient";
import { WindowTitleBar } from "../components/window-title-bar";
import { ColorDetails } from "../features/color-details/ColorDetails";
import { ColorHarmonies } from "../features/color-harmonies/ColorHarmonies";
import { HistoryList } from "../features/color-history/HistoryList";
import { useCopy } from "../hooks/use-copy";
import { useFitWindow } from "../hooks/use-fit-window";
import { formatColor, parseColor, toHex } from "../lib/color/color";
import { isTauri, pickScreenColor } from "../lib/platform/native";
import { useAppStore } from "../stores/app-store";

const SettingsPanel = lazy(() => import("../features/settings/SettingsPanel"));

export function App() {
  const {
    hydrated,
    currentColor,
    history,
    settings,
    favoritesOnly,
    hydrate,
    setColor,
    updateSettings,
    toggleFavorite,
    deleteHistory,
    clearHistory,
    importHistory,
    setFavoritesOnly,
  } = useAppStore();
  const toggleCurrentColorFavorite = useAppStore(
    (state): (() => void) => state.toggleCurrentColorFavorite,
  );
  const { copy, message } = useCopy();
  const formats = useMemo(
    () => formatColor(currentColor, settings.formatting),
    [currentColor, settings.formatting],
  );
  const [activeSection, setActiveSection] = useState<AppSection>("picker");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [inputDraft, setInputDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const compact = settings.appearance.compact;
  const currentHistoryEntry = history.find((entry) => entry.hex === toHex(currentColor));

  useFitWindow(contentRef, { compact, settingsOpen, enabled: hydrated });

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(
    () => () => {
      if (copiedTimer.current !== null) {
        window.clearTimeout(copiedTimer.current);
      }
    },
    [],
  );

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [settingsOpen]);

  const pick = useCallback(async () => {
    setPicking(true);
    setPickerError(null);
    try {
      const result = await pickScreenColor();
      setColor(result.color, "screen-picker");
      setInputDraft(null);
      setError(null);
      if (settings.picker.autoCopy) {
        const formats = formatColor(result.color, settings.formatting);
        await copy(formats[settings.formatting.preferredFormat], "Picked color copied");
      }
    } catch (error: unknown) {
      const value = error instanceof Error ? error.message : String(error);
      if (!value.toLowerCase().includes("cancel")) setPickerError(value ?? null);
    } finally {
      setPicking(false);
    }
  }, [copy, setColor, settings.formatting, settings.picker.autoCopy]);

  useEffect(() => {
    if (!isTauri()) return;
    const unlistenPicker = listen("picker-requested", () => void pick());
    const unlistenSettings = listen("settings-requested", () => setSettingsOpen(true));
    return () => {
      void unlistenPicker.then((unlisten) => unlisten());
      void unlistenSettings.then((unlisten) => unlisten());
    };
  }, [pick]);

  function handleCopy() {
    void copy(formats[settings.formatting.preferredFormat], "Color copied");

    setCopied(true);
    if (copiedTimer.current !== null) {
      window.clearTimeout(copiedTimer.current);
    }
    copiedTimer.current = window.setTimeout(() => {
      setCopied(false);
      copiedTimer.current = null;
    }, 1500);
  }

  const submit = () => {
    const parsed = parseColor(inputDraft ?? formats.hex);
    if (!parsed) {
      setError("Enter a valid HEX, RGB, RGBA, HSL, or HSLA color.");
      return;
    }
    setError(null);
    setColor(parsed, "manual-input");
    setInputDraft(null);
  };

  if (!hydrated) {
    return (
      <div
        className="relative isolate flex min-h-screen flex-col overflow-hidden rounded-ios-xl bg-nib-black"
        role="status"
        aria-label="Loading Nib Color Picker"
      >
        <Grainient
          animate={!prefersReducedMotion}
          className="pointer-events-none absolute inset-0 z-0"
        />
        <WindowTitleBar />
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <div className="spinner" aria-hidden="true">
            <div className="spinnerin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={contentRef}
      className="relative isolate flex flex-col overflow-hidden rounded-ios-xl bg-nib-black text-zinc-50"
    >
      <Grainient
        animate={!prefersReducedMotion}
        className="pointer-events-none absolute inset-0 z-0"
      />
      <WindowTitleBar />
      {compact && !settingsOpen ? (
        <>
          <div className="relative z-20">
            <AppHeaderBar
              compact
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          </div>
          <main className="relative z-10 flex w-full items-center gap-2 p-2">
            <div
              className="size-11 shrink-0 rounded-ios-xl border border-white/15 shadow-sm"
              style={{ backgroundColor: formats.css }}
              role="img"
              aria-label={`Current color ${formats[settings.formatting.preferredFormat]}`}
              title="Current color"
            />
            <motion.button
              type="button"
              onClick={handleCopy}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              className="h-11 min-w-0 flex-1 cursor-pointer truncate rounded-ios-xl bg-zinc-900/80 px-3 text-left font-mono text-sm uppercase"
              aria-label="Copy current color"
              title="Copy current color"
            >
              {formats[settings.formatting.preferredFormat]}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => void pick()}
              disabled={picking}
              whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
              className="flex h-11 cursor-pointer shrink-0 items-center gap-1.5 rounded-ios-xl bg-blue-500 px-3 text-sm font-semibold text-zinc-950 shadow-sm shadow-blue-950/20 hover:bg-blue-400 disabled:opacity-60"
            >
              <Crosshair size={16} />
              {picking ? "Picking…" : "Pick"}
            </motion.button>
          </main>
        </>
      ) : (
        <>
          <div className="sticky top-0 z-20">
            <AppHeaderBar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          </div>

          <main className="relative z-10 mx-auto w-full max-w-sm flex-1 space-y-3 p-3">
            {activeSection === "picker" ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <motion.button
                    type="button"
                    onClick={() => void pick()}
                    disabled={picking}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="flex h-9 shrink-0 items-center gap-2 rounded-ios-lg bg-blue-600 px-3 text-sm font-semibold text-zinc-950 shadow-sm shadow-blue-950/20 hover:bg-blue-500 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
                  >
                    <Crosshair size={16} />
                    {picking ? "Picking…" : "Pick"}
                    <kbd className="rounded-ios-sm cursor-pointer bg-white/15 px-1.5 py-0.5 font-mono text-[9px] font-normal tracking-tight">
                      {settings.picker.shortcut}
                    </kbd>
                  </motion.button>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="flex gap-2">
                        <input
                          id="color-input"
                          value={inputDraft ?? formats.hex}
                          onChange={(event) => setInputDraft(event.target.value)}
                          onBlur={submit}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") submit();
                            if (event.key === "Escape") {
                              setInputDraft(null);
                              setError(null);
                              event.currentTarget.blur();
                            }
                          }}
                          aria-invalid={Boolean(error)}
                          aria-describedby={error ? "color-input-error" : undefined}
                          className="h-10 min-w-0 flex-1 rounded-ios-lg bg-zinc-200/70 px-3 font-mono text-sm uppercase text-zinc-950 outline-none placeholder:text-zinc-600 focus:bg-zinc-200 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-300 dark:focus:bg-zinc-800"
                        />
                        <motion.button
                          type="button"
                          onClick={handleCopy}
                          whileHover={prefersReducedMotion ? {} : { scale: 1.04, y: -1 }}
                          whileTap={prefersReducedMotion ? {} : { scale: 0.94, y: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 24,
                          }}
                          className="inline-flex cursor-pointer size-10 items-center justify-center rounded-ios-lg bg-blue-600 text-zinc-950 shadow-sm shadow-blue-950/20 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
                          aria-label={copied ? "Color copied" : "Copy current color"}
                          title={copied ? "Copied" : "Copy"}
                        >
                          <motion.span
                            animate={prefersReducedMotion ? {} : { scale: copied ? 1.12 : 1 }}
                            className="inline-flex"
                          >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                          </motion.span>
                        </motion.button>
                      </div>
                      {error && (
                        <p
                          id="color-input-error"
                          role="alert"
                          className="mt-1 text-xs text-red-600 dark:text-red-400"
                        >
                          {error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <ColorHarmonies
                    color={currentColor}
                    onSelect={(color) => {
                      setColor(color, "shade", settings.history.addGeneratedColors);
                      setInputDraft(null);
                      setError(null);
                    }}
                    onCopy={(value) => void copy(value)}
                  />
                </div>
                {pickerError && (
                  <p
                    role="alert"
                    className="rounded-ios-2xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                  >
                    {pickerError}
                  </p>
                )}

                <ColorDetails
                  color={currentColor}
                  formatting={settings.formatting}
                  favorite={currentHistoryEntry?.favorite ?? false}
                  onFavorite={toggleCurrentColorFavorite}
                  onCopy={(value, label) => void copy(value, label)}
                />
              </>
            ) : (
              <HistoryList
                entries={history}
                formatting={settings.formatting}
                favoritesOnly={favoritesOnly}
                onFavoritesOnly={setFavoritesOnly}
                onClearNonFavorites={() => clearHistory(true)}
                onSelect={(entry) => {
                  setColor(entry.rgba, entry.source, false);
                  setInputDraft(null);
                  setError(null);
                  setActiveSection("picker");
                }}
                onCopy={(value) => void copy(value)}
                onFavorite={toggleFavorite}
                onDelete={deleteHistory}
              />
            )}
          </main>
        </>
      )}
      <Toast message={message} />

      {settingsOpen && (
        <Suspense fallback={null}>
          <SettingsPanel
            settings={settings}
            history={history}
            onClose={() => setSettingsOpen(false)}
            onSave={updateSettings}
            onImport={importHistory}
          />
        </Suspense>
      )}
    </div>
  );
}
