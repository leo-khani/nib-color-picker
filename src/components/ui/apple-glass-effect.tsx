import { memo, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

type GlassVariant = "default" | "prominent" | "regular" | "thin" | "dark";
type GlassDistortion = "none" | "subtle" | "medium" | "strong";
type GlassTint = "neutral" | "warm" | "cool" | "vibrant";

interface GlassContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: ReactNode;
  variant?: GlassVariant;
  blur?: number;
  opacity?: number;
  distortion?: GlassDistortion;
  tint?: GlassTint;
  border?: boolean;
  hover?: boolean;
  glassOverlay?: boolean;
}

interface GlassVariantConfig {
  blur: number;
  opacity: number;
  surface: string;
  saturation: number;
  brightness: number;
  shadow: string;
}

const variantConfig: Record<GlassVariant, GlassVariantConfig> = {
  default: {
    blur: 26,
    opacity: 0.1,
    surface: "rgb(255 255 255 / 9%)",
    saturation: 135,
    brightness: 102,
    shadow: "0 12px 36px rgb(0 0 0 / 18%)",
  },
  prominent: {
    blur: 34,
    opacity: 0.14,
    surface: "rgb(255 255 255 / 12%)",
    saturation: 140,
    brightness: 104,
    shadow: "0 18px 50px rgb(0 0 0 / 24%)",
  },
  regular: {
    blur: 24,
    opacity: 0.08,
    surface: "rgb(255 255 255 / 8%)",
    saturation: 130,
    brightness: 101,
    shadow: "0 10px 30px rgb(0 0 0 / 16%)",
  },
  thin: {
    blur: 10,
    opacity: 0.1,
    surface: "rgb(255 255 255 / 6%)",
    saturation: 125,
    brightness: 102,
    shadow: "0 8px 24px rgb(0 0 0 / 14%)",
  },
  dark: {
    blur: 28,
    opacity: 0.04,
    surface: "rgb(13 13 18 / 62%)",
    saturation: 125,
    brightness: 88,
    shadow: "0 16px 46px rgb(0 0 0 / 38%)",
  },
};

const distortionConfig: Record<GlassDistortion, { opacity: number; spread: number }> = {
  none: { opacity: 0, spread: 58 },
  subtle: { opacity: 0.035, spread: 58 },
  medium: { opacity: 0.065, spread: 52 },
  strong: { opacity: 0.1, spread: 46 },
};

const tintColors: Record<GlassTint, string> = {
  neutral: "rgb(255 255 255)",
  warm: "rgb(255 248 240)",
  cool: "rgb(181 174 255)",
  vibrant: "rgb(155 146 255)",
};

const noiseTexture =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")";

function joinClasses(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export const GlassContainer = memo(function GlassContainer({
  children,
  className,
  variant = "regular",
  blur,
  opacity,
  distortion = "subtle",
  tint = "neutral",
  border = false,
  hover = false,
  glassOverlay = true,
  style,
  ...htmlProps
}: GlassContainerProps) {
  const selectedVariant = variantConfig[variant];
  const selectedDistortion = distortionConfig[distortion];
  const finalBlur = blur ?? selectedVariant.blur;
  const finalOpacity = opacity ?? selectedVariant.opacity;

  const glassStyle: CSSProperties = {
    ...style,
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    backfaceVisibility: "hidden",
    boxShadow: selectedVariant.shadow,
  };

  return (
    <div
      {...htmlProps}
      className={joinClasses(
        "relative isolate overflow-hidden rounded-ios-sm bg-transparent p-4 text-white antialiased transition-[box-shadow,background-color] duration-300",
        hover && "hover:shadow-2xl",
        border && "border border-white/20",
        className,
      )}
      style={glassStyle}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
        style={{
          backgroundColor: selectedVariant.surface,
          backdropFilter: `blur(${finalBlur}px) saturate(${selectedVariant.saturation}%) brightness(${selectedVariant.brightness}%)`,
          WebkitBackdropFilter: `blur(${finalBlur}px) saturate(${selectedVariant.saturation}%) brightness(${selectedVariant.brightness}%)`,
        }}
      />

      {glassOverlay && (
        <div
          className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit]"
          style={{
            backgroundColor: tintColors[tint],
            opacity: finalOpacity,
          }}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit]"
        style={{
          opacity: selectedDistortion.opacity,
          background: `radial-gradient(ellipse at 18% 5%, rgb(255 255 255 / 24%) 0%, transparent ${selectedDistortion.spread}%), radial-gradient(ellipse at 82% 95%, rgb(0 0 0 / 32%) 0%, transparent ${selectedDistortion.spread + 6}%)`,
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[3] rounded-[inherit] opacity-[0.025] mix-blend-soft-light"
        style={{ backgroundImage: noiseTexture, backgroundSize: "180px 180px" }}
      />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
});

GlassContainer.displayName = "GlassContainer";
