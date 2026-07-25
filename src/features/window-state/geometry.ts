import type { MonitorInfo, WindowState } from "../../types/settings";

const MIN_VISIBLE = 64;

const intersects = (state: WindowState, monitor: MonitorInfo): boolean =>
  state.x + state.width >= monitor.x + MIN_VISIBLE &&
  state.x <= monitor.x + monitor.width - MIN_VISIBLE &&
  state.y + state.height >= monitor.y + MIN_VISIBLE &&
  state.y <= monitor.y + monitor.height - MIN_VISIBLE;

export function correctWindowState(
  saved: WindowState,
  monitors: MonitorInfo[],
  fallback: MonitorInfo,
): WindowState {
  const monitor =
    monitors.find((candidate) => intersects(saved, candidate)) ??
    monitors.find((candidate) => candidate.name && candidate.name === saved.monitorName) ??
    fallback;
  const width = Math.min(Math.max(saved.width, 360), monitor.width);
  const height = Math.min(Math.max(saved.height, 480), monitor.height);
  if (intersects({ ...saved, width, height }, monitor)) return { ...saved, width, height };
  return {
    ...saved,
    width,
    height,
    x: monitor.x + Math.round((monitor.width - width) / 2),
    y: monitor.y + Math.round((monitor.height - height) / 2),
    monitorName: monitor.name,
    scaleFactor: monitor.scaleFactor,
  };
}
