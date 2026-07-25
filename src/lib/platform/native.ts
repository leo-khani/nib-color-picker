import { invoke } from "@tauri-apps/api/core";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import type { PickerResult } from "../../types/color";

export const isTauri = (): boolean => "__TAURI_INTERNALS__" in window;

export async function copyText(value: string): Promise<void> {
  if (isTauri()) {
    await writeText(value);
  } else {
    await navigator.clipboard.writeText(value);
  }
}

export async function pickScreenColor(): Promise<PickerResult> {
  if (!isTauri()) {
    throw new Error("Screen picking is available in the Windows desktop app.");
  }
  return invoke<PickerResult>("pick_screen_color");
}

export async function applyWindowPreferences(alwaysOnTop: boolean): Promise<void> {
  if (isTauri()) await invoke("set_always_on_top", { alwaysOnTop });
}

export async function registerPickerShortcut(shortcut: string, enabled: boolean): Promise<void> {
  if (isTauri()) await invoke("set_picker_shortcut", { shortcut, enabled });
}

export async function setStartupEnabled(enabled: boolean): Promise<void> {
  if (!isTauri()) return;
  const current = await isEnabled();
  if (enabled && !current) await enable();
  if (!enabled && current) await disable();
}
