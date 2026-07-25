import { useCallback, useRef, useState } from "react";
import { copyText } from "../lib/platform/native";

export function useCopy() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = useCallback(async (value: string, label = "Color copied") => {
    try {
      await copyText(value);
      setMessage(label);
    } catch {
      setMessage("Could not copy to the clipboard");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 1800);
  }, []);

  return { copy, message };
}
