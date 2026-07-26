import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";

/*
 * Adapted from Grainient by React Bits / David Haz.
 * https://www.reactbits.dev/backgrounds/grainient
 * Distributed by React Bits under its MIT + Commons Clause license.
 */

interface GrainientProps {
  animate?: boolean;
  className?: string;
  timeSpeed?: number;
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  blendSoftness?: number;
  noiseScale?: number;
  grainAmount?: number;
  grainScale?: number;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  zoom?: number;
  color1?: string;
  color2?: string;
  color3?: string;
}

type UniformName =
  | "iTime"
  | "iResolution"
  | "uTimeSpeed"
  | "uWarpStrength"
  | "uWarpFrequency"
  | "uWarpSpeed"
  | "uWarpAmplitude"
  | "uBlendSoftness"
  | "uNoiseScale"
  | "uGrainAmount"
  | "uGrainScale"
  | "uContrast"
  | "uGamma"
  | "uSaturation"
  | "uZoom"
  | "uColor1"
  | "uColor2"
  | "uColor3";

type GrainientUniforms = Record<UniformName, { value: number | Float32Array }>;

const vertexShader = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendSoftness;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

#define S(a,b,t) smoothstep(a,b,t)

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)));
  return fract(sin(p) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float n = mix(
    mix(
      dot(-1.0 + 2.0 * hash(i), f),
      dot(-1.0 + 2.0 * hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)),
      u.x
    ),
    mix(
      dot(-1.0 + 2.0 * hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
      dot(-1.0 + 2.0 * hash(i + vec2(1.0)), f - vec2(1.0)),
      u.x
    ),
    u.y
  );
  return 0.5 + 0.5 * n;
}

void main() {
  float t = iTime * uTimeSpeed;
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float ratio = iResolution.x / iResolution.y;
  vec2 warped = (uv - 0.5) / max(uZoom, 0.001);

  float degree = noise(vec2(t * 0.1, warped.x * warped.y) * uNoiseScale);
  float frequency = uWarpFrequency + degree * 0.35;
  float strength = max(uWarpStrength, 0.001);
  float amplitude = uWarpAmplitude / strength;
  float warpTime = t * uWarpSpeed;

  warped.y *= 1.0 / ratio;
  warped.x += sin(warped.y * frequency + warpTime) / amplitude;
  warped.y += sin(warped.x * (frequency * 1.5) + warpTime) / (amplitude * 0.5);
  warped.y *= ratio;

  float softness = max(uBlendSoftness, 0.0);
  float horizontalBlend = S(-0.35 - softness, 0.25 + softness, warped.x);
  float verticalBlend = S(0.55 + softness, -0.35 - softness, warped.y);
  vec3 lowerLayer = mix(uColor3, uColor2, horizontalBlend);
  vec3 upperLayer = mix(uColor2, uColor1, horizontalBlend);
  vec3 color = mix(lowerLayer, upperLayer, verticalBlend);

  vec2 grainUv = uv * max(uGrainScale, 0.001);
  float grain = fract(sin(dot(grainUv, vec2(12.9898, 78.233))) * 43758.5453);
  color += (grain - 0.5) * uGrainAmount;

  color = (color - 0.5) * uContrast + 0.5;
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(vec3(luma), color, uSaturation);
  color = pow(max(color, 0.0), vec3(1.0 / max(uGamma, 0.001)));
  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

function hexToRgb(hex: string): Float32Array {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!match?.[1] || !match[2] || !match[3]) return new Float32Array([1, 1, 1]);
  return new Float32Array([
    Number.parseInt(match[1], 16) / 255,
    Number.parseInt(match[2], 16) / 255,
    Number.parseInt(match[3], 16) / 255,
  ]);
}

export function Grainient({
  animate = true,
  className = "",
  timeSpeed = 0.12,
  warpStrength = 0.65,
  warpFrequency = 4,
  warpSpeed = 0.7,
  warpAmplitude = 70,
  blendSoftness = 0.18,
  noiseScale = 1.6,
  grainAmount = 0.045,
  grainScale = 2.4,
  contrast = 1.15,
  gamma = 1,
  saturation = 0.72,
  zoom = 0.82,
  color1 = "#2B2745",
  color2 = "#1B192A",
  color3 = "#0D0D12",
}: GrainientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      webgl: 2,
      alpha: false,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    });
    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const uniforms: GrainientUniforms = {
      iTime: { value: 0 },
      iResolution: { value: new Float32Array([1, 1]) },
      uTimeSpeed: { value: timeSpeed },
      uWarpStrength: { value: warpStrength },
      uWarpFrequency: { value: warpFrequency },
      uWarpSpeed: { value: warpSpeed },
      uWarpAmplitude: { value: warpAmplitude },
      uBlendSoftness: { value: blendSoftness },
      uNoiseScale: { value: noiseScale },
      uGrainAmount: { value: grainAmount },
      uGrainScale: { value: grainScale },
      uContrast: { value: contrast },
      uGamma: { value: gamma },
      uSaturation: { value: saturation },
      uZoom: { value: zoom },
      uColor1: { value: hexToRgb(color1) },
      uColor2: { value: hexToRgb(color2) },
      uColor3: { value: hexToRgb(color3) },
    };
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms,
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const render = () => renderer.render({ scene: mesh });
    const setSize = () => {
      const bounds = container.getBoundingClientRect();
      renderer.setSize(Math.max(1, bounds.width), Math.max(1, bounds.height));
      const resolution = uniforms.iResolution.value as Float32Array;
      resolution[0] = gl.drawingBufferWidth;
      resolution[1] = gl.drawingBufferHeight;
      render();
    };

    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);
    setSize();

    let frame = 0;
    let visible = true;
    let pageVisible = !document.hidden;
    const startedAt = performance.now();

    const loop = (time: number) => {
      uniforms.iTime.value = (time - startedAt) * 0.001;
      render();
      frame = window.requestAnimationFrame(loop);
    };
    const syncAnimation = () => {
      const shouldAnimate = animate && visible && pageVisible;
      if (shouldAnimate && frame === 0) frame = window.requestAnimationFrame(loop);
      if (!shouldAnimate && frame !== 0) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        render();
      }
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        syncAnimation();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(container);

    const handleVisibility = () => {
      pageVisible = !document.hidden;
      syncAnimation();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    syncAnimation();

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      canvas.remove();
    };
  }, [
    animate,
    blendSoftness,
    color1,
    color2,
    color3,
    contrast,
    gamma,
    grainAmount,
    grainScale,
    noiseScale,
    saturation,
    timeSpeed,
    warpAmplitude,
    warpFrequency,
    warpSpeed,
    warpStrength,
    zoom,
  ]);

  return (
    <div
      ref={containerRef}
      className={`grainient-container opacity-60 ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
