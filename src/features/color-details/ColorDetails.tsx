import { Check, Copy, Heart } from "lucide-react";
import { useMemo, useState } from "react";
import type { RgbaColor } from "../../types/color";
import type { FormattingSettings } from "../../types/settings";
import {
  contrastRatio,
  formatColor,
  parseColor,
  readableTextColor,
  rgbaToHsla,
} from "../../lib/color/color";
import { IconButton } from "../../components/ui/IconButton";

interface ColorDetailsProps {
  color: RgbaColor;
  formatting: FormattingSettings;
  onChange: (color: RgbaColor) => void;
  onCopy: (value: string, label?: string) => void;
}

export function ColorDetails({ color, formatting, onChange, onCopy }: ColorDetailsProps) {
  const formats = useMemo(() => formatColor(color, formatting), [color, formatting]);
  const [input, setInput] = useState(formats.hex);
  const [error, setError] = useState<string | null>(null);
  const hsl = rgbaToHsla(color);
  const blackRatio = contrastRatio(color, { r: 0, g: 0, b: 0, a: 1 });
  const whiteRatio = contrastRatio(color, { r: 255, g: 255, b: 255, a: 1 });

  const submit = () => {
    const parsed = parseColor(input);
    if (!parsed) {
      setError("Enter a valid HEX, RGB, RGBA, HSL, or HSLA color.");
      return;
    }
    setError(null);
    onChange(parsed);
    setInput(formatColor(parsed, formatting).hex);
  };

  return (
    <section aria-labelledby="current-color-title" className="space-y-4">
      <h2 id="current-color-title" className="sr-only">
        Current color
      </h2>
      <div
        className="relative flex h-32 items-end rounded-xl border border-black/10 p-4 shadow-inner"
        style={{ backgroundColor: formats.hex8 }}
        aria-label={`Current color ${formats.hex}`}
      >
        <span className="text-sm font-medium" style={{ color: readableTextColor(color) }}>
          HSL {hsl.h}° {hsl.s}% {hsl.l}%
        </span>
        <IconButton
          label="Favorite current color"
          className="absolute right-3 top-3 border-white/40 bg-black/20 text-white hover:bg-black/30"
        >
          <Heart size={17} />
        </IconButton>
      </div>

      <div>
        <label htmlFor="color-input" className="mb-1 block text-xs font-medium text-zinc-500">
          Color value
        </label>
        <div className="flex gap-2">
          <input
            id="color-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onBlur={submit}
            onKeyDown={(event) => event.key === "Enter" && submit()}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "color-input-error" : undefined}
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm uppercase dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="button"
            onClick={() => onCopy(formats[formatting.preferredFormat])}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Copy size={16} /> Copy
          </button>
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

      <details className="group rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold">
          All color formats
        </summary>
        <div className="divide-y divide-zinc-100 border-t border-zinc-100 dark:divide-zinc-800 dark:border-zinc-800">
          {(Object.entries(formats) as [keyof typeof formats, string][]).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3 px-4 py-2">
              <span className="w-24 text-xs font-medium uppercase text-zinc-500">{key}</span>
              <code className="min-w-0 flex-1 truncate text-xs">{value}</code>
              <IconButton
                label={`Copy ${key}`}
                onClick={() => onCopy(value, `${key.toUpperCase()} copied`)}
              >
                <Copy size={15} />
              </IconButton>
            </div>
          ))}
        </div>
      </details>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          ["Black", blackRatio],
          ["White", whiteRatio],
        ].map(([label, ratio]) => (
          <div
            key={String(label)}
            className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">{label} contrast</span>
              {Number(ratio) >= 4.5 && (
                <Check size={14} className="text-green-600" aria-label="WCAG AA" />
              )}
            </div>
            <strong className="mt-1 block text-base">{ratio}:1</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
