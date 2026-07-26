import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { useLayoutEffect, type RefObject } from "react";
import { fitWindowToContent } from "../features/window-state/content-fit";
import { isTauri } from "../lib/platform/native";

interface FitWindowOptions {
  compact: boolean;
  settingsOpen: boolean;
  enabled: boolean;
}

export function useFitWindow(
  contentRef: RefObject<HTMLElement | null>,
  { compact, settingsOpen, enabled }: FitWindowOptions,
): void {
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!enabled || !content || !isTauri()) return;

    let animationFrame: number | null = null;
    let disposed = false;

    const resize = async () => {
      animationFrame = null;
      const size = fitWindowToContent({
        compact,
        settingsOpen,
        contentHeight: content.scrollHeight,
        windowFrameHeight: window.outerHeight - window.innerHeight,
        availableScreenHeight: window.screen.availHeight,
      });

      if (
        Math.abs(window.outerWidth - size.width) <= 1 &&
        Math.abs(window.outerHeight - size.height) <= 1
      ) {
        return;
      }

      try {
        await getCurrentWindow().setSize(new LogicalSize(size.width, size.height));
      } catch (error) {
        if (!disposed) console.error("The window could not be fitted to its content.", error);
      }
    };

    const scheduleResize = () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => void resize());
    };

    const observer = new ResizeObserver(scheduleResize);
    observer.observe(content);
    window.addEventListener("resize", scheduleResize);
    scheduleResize();

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("resize", scheduleResize);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
  }, [compact, contentRef, enabled, settingsOpen]);
}
