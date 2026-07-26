import { Copy, Heart } from "lucide-react";
import { useMemo } from "react";
import { IconButton } from "../../components/ui/IconButton";
import { formatColor, readableTextColor, rgbaToHsla } from "../../lib/color/color";
import type { RgbaColor } from "../../types/color";
import type { FormattingSettings } from "../../types/settings";
import { GlassContainer } from "../../components/ui/apple-glass-effect";

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
        <div
          className="flex flex-col gap-0.5 h-full justify-between items-start"
          style={{ color: readableTextColor(color) }}
        >
          <span className="text-xs font-black font-mono uppercase">Current color</span>

          <span className="font-mono text-sm font-medium">
            HSL {hsl.h}° {hsl.s}% {hsl.l}%
          </span>
        </div>

        <IconButton
          label={favorite ? "Remove current color from favorites" : "Favorite current color"}
          active={favorite}
          onClick={onFavorite}
          className="absolute right-2.5 top-2.5 !rounded-ios-xl !text-white hover:!bg-rose-500"
        >
          <Heart size={17} fill={favorite ? "currentColor" : "none"} />
        </IconButton>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-ios-lg">
        <div className="flex w-full flex-col gap-2">
          {visibleFormats.map(([key, value]) => (
            <GlassContainer
              key={key}
              variant="dark"
              distortion="subtle"
              className="h-11 w-full !p-0"
            >
              <div className="group flex h-11 w-full items-center gap-3 px-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-ios-lg bg-zinc-100 text-[11px] font-bold uppercase tracking-wide text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
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
                  className="size-8 shrink-0 border-transparent !rounded-ios-xl !bg-zinc-100 !p-0 group-hover:opacity-100 hover:!bg-zinc-800 dark:!bg-zinc-800"
                >
                  <Copy size={14} />
                </IconButton>
              </div>
            </GlassContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
