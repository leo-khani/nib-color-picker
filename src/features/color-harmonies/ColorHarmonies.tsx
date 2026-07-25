import { Copy } from "lucide-react";
import { useMemo } from "react";
import type { RgbaColor } from "../../types/color";
import { toHex } from "../../lib/color/color";
import {
  generateHarmony,
  generateLightnessScale,
  generateTints,
  generateTones,
} from "../../lib/color/harmonies";

interface ColorHarmoniesProps {
  color: RgbaColor;
  onSelect: (color: RgbaColor) => void;
  onCopy: (value: string) => void;
}

export function ColorHarmonies({ color, onSelect, onCopy }: ColorHarmoniesProps) {
  const groups = useMemo(
    () => [
      { name: "Lightness", colors: generateLightnessScale(color, 7) },
      { name: "Tints", colors: generateTints(color, 6) },
      { name: "Tones", colors: generateTones(color, 6) },
      { name: "Complementary", colors: generateHarmony(color, "complementary") },
      { name: "Analogous", colors: generateHarmony(color, "analogous") },
      { name: "Triadic", colors: generateHarmony(color, "triadic") },
      { name: "Split complementary", colors: generateHarmony(color, "splitComplementary") },
      { name: "Tetradic", colors: generateHarmony(color, "tetradic") },
    ],
    [color],
  );

  return (
    <section aria-labelledby="harmonies-title">
      <h2 id="harmonies-title" className="mb-3 text-sm font-semibold">
        Shades & relationships
      </h2>
      <div className="space-y-3">
        {groups.map((group) => (
          <div key={group.name}>
            <h3 className="mb-1 text-xs text-zinc-500">{group.name}</h3>
            <div className="flex overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
              {group.colors.map((swatch, index) => {
                const hex = toHex(swatch);
                return (
                  <button
                    key={`${hex}-${index}`}
                    type="button"
                    className="group relative h-12 min-w-8 flex-1 border-r border-black/10 last:border-r-0 focus:z-10"
                    style={{ backgroundColor: hex }}
                    aria-label={`Select ${hex}`}
                    title={hex}
                    onClick={() => onSelect(swatch)}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      onCopy(hex);
                    }}
                  >
                    <Copy
                      size={13}
                      className="absolute bottom-1 right-1 text-white opacity-0 drop-shadow group-hover:opacity-100"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
