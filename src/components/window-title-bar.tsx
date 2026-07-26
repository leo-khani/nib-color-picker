import { Minus, Pipette, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { isTauri } from "../lib/platform/native";

async function runWindowAction(action: () => Promise<void>, errorMessage: string): Promise<void> {
  if (!isTauri()) return;

  try {
    await action();
  } catch (error: unknown) {
    console.error(errorMessage, error);
  }
}

export function WindowTitleBar() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <header
      data-tauri-drag-region
      className="relative z-30 flex h-9 shrink-0 select-none items-center bg-black/25 pl-3"
    >
      <div
        data-tauri-drag-region
        className="flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold text-zinc-200"
      >
        <span className="grid size-5 shrink-0 place-items-center rounded-ios-xs bg-blue-500 text-zinc-950">
          <Pipette size={12} strokeWidth={2.4} aria-hidden="true" />
        </span>
        <span data-tauri-drag-region className="truncate">
          Nib Color Picker
        </span>
      </div>

      <div className="flex h-full items-center">
        <motion.button
          type="button"
          aria-label="Minimize window"
          title="Minimize"
          whileHover={prefersReducedMotion ? {} : { scale: 1.04 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.92 }}
          onClick={() =>
            void runWindowAction(
              () => getCurrentWindow().minimize(),
              "The window could not be minimized.",
            )
          }
          className="grid h-full w-11 place-items-center text-zinc-300 hover:bg-white/10 hover:text-white"
        >
          <Minus size={16} aria-hidden="true" />
        </motion.button>
        <motion.button
          type="button"
          aria-label="Close window"
          title="Close to tray"
          whileHover={prefersReducedMotion ? {} : { scale: 1.04 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.92 }}
          onClick={() =>
            void runWindowAction(
              () => getCurrentWindow().close(),
              "The window could not be closed.",
            )
          }
          className="grid h-full w-11 place-items-center text-zinc-300 hover:bg-red-500 hover:text-white"
        >
          <X size={16} aria-hidden="true" />
        </motion.button>
      </div>
    </header>
  );
}
