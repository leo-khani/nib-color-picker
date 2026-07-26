import { Copy } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import type { RgbaColor } from "../../types/color";
import { toHex } from "../../lib/color/color";
import { generateLightnessScale } from "../../lib/color/harmonies";
import { FadeBlur } from "../../components/fade-blur";

interface ColorHarmoniesProps {
  color: RgbaColor;
  onSelect: (color: RgbaColor) => void;
  onCopy: (value: string) => void;
}

export function ColorHarmonies({ color, onSelect, onCopy }: ColorHarmoniesProps) {
  const prefersReducedMotion = useReducedMotion();
  const groups = useMemo(
    () => [{ name: "Lightness", colors: generateLightnessScale(color, 7) }],
    [color],
  );

  return (
    <section aria-labelledby="harmonies-title">
      <div className="mb-1.5 flex items-baseline justify-between"></div>
      <div className="grid grid-cols-1 gap-0.5 rounded-ios-lg">
        {groups.map((group) => (
          <div key={group.name}>
            <div className="flex items-center justify-between gap-2 max-w-full">
              {group.colors.map((swatch, index) => {
                const hex = toHex(swatch);

                return (
                  <FadeBlur key={`${hex}-${index}`} delay={index * 0.05} className="w-full">
                    <motion.button
                      type="button"
                      whileHover={prefersReducedMotion ? {} : { scale: 1.06, y: -2 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.92, y: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 25,
                      }}
                      className="group relative block h-12 w-full overflow-hidden rounded-ios-2xl focus:z-10"
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
                        size={16}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100"
                      />
                    </motion.button>
                  </FadeBlur>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
