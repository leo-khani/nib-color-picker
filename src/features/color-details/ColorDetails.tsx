import { Copy, Heart } from "lucide-react";
import { useMemo } from "react";
import { IconButton } from "../../components/ui/IconButton";
import { formatColor, readableTextColor, rgbaToHsla } from "../../lib/color/color";
import type { RgbaColor } from "../../types/color";
import type { FormattingSettings } from "../../types/settings";

interface ColorDetailsProps {
  color: RgbaColor;
  formatting: FormattingSettings;
  favorite: boolean;
  onFavorite: () => void;
  onCopy: (value: string, label?: string) => void;
}

const primaryFormatKeys = ["hex", "rgb", "hsl", "hsv"] as const;

export function ColorDetails({
  color,
  formatting,
  favorite,
  onFavorite,
  onCopy,
}: ColorDetailsProps) {
  const formats = useMemo(() => formatColor(color, formatting), [color, formatting]);

  const visibleFormats = primaryFormatKeys.map((key) => [key, formats[key]] as const);

  const hsl = rgbaToHsla(color);

  return (
    <section aria-labelledby="current-color-title" className="flex w-full flex-col gap-3">
      <h2 id="current-color-title" className="sr-only">
        Current color
      </h2>

      <div
        className="relative flex h-[4.75rem] w-full items-end overflow-hidden rounded-ios-xl p-3 shadow-md shadow-black/10"
        style={{ backgroundColor: formats.hex8 }}
        aria-label={`Current color ${formats.hex}`}
      >
        <div className="flex flex-col gap-0.5" style={{ color: readableTextColor(color) }}>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-75">
            Current color
          </span>

          <span className="font-mono text-sm font-medium">
            HSL {hsl.h}° {hsl.s}% {hsl.l}%
          </span>
        </div>

        <IconButton
          label={favorite ? "Remove current color from favorites" : "Favorite current color"}
          active={favorite}
          onClick={onFavorite}
          className="absolute right-2.5 top-2.5 rounded-ios-xl !text-white hover:!bg-black/40"
        >
          <Heart size={17} fill={favorite ? "currentColor" : "none"} />
        </IconButton>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-ios-lg">
        <div className="flex w-full flex-col gap-2">
          {visibleFormats.map(([key, value]) => (
            <div
              key={key}
              className="group flex w-full items-center gap-3 rounded-ios-xl bg-white p-3 shadow-sm backdrop-blur-xl transition-colors hover:bg-zinc-50 dark:bg-zinc-700/60 dark:hover:bg-zinc-900/80"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-ios-lg bg-zinc-100 text-[11px] font-bold uppercase tracking-wide text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {key}
              </div>

              <code
                className="min-w-0 flex-1 truncate font-mono text-sm font-medium text-zinc-950 dark:text-zinc-100"
                title={value}
              >
                {value}
              </code>

              <IconButton
                label={`Copy ${key}`}
                onClick={() => onCopy(value, `${key.toUpperCase()} copied`)}
                className="size-8 shrink-0 border-transparent !bg-zinc-100 opacity-70 group-hover:opacity-100 dark:!bg-zinc-800"
              >
                <Copy size={14} />
              </IconButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
