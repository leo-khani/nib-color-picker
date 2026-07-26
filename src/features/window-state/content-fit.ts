export interface ContentFitInput {
  compact: boolean;
  settingsOpen: boolean;
  contentHeight: number;
  windowFrameHeight: number;
  availableScreenHeight: number;
}

export interface WindowContentSize {
  width: number;
  height: number;
}

const NORMAL_WIDTH = 420;
const COMPACT_WIDTH = 360;
const SETTINGS_HEIGHT = 610;
const COMPACT_MIN_HEIGHT = 92;
const NORMAL_MIN_HEIGHT = 240;
const SCREEN_MARGIN = 48;

export function fitWindowToContent({
  compact,
  settingsOpen,
  contentHeight,
  windowFrameHeight,
  availableScreenHeight,
}: ContentFitInput): WindowContentSize {
  const isCompactView = compact && !settingsOpen;
  const minimumHeight = isCompactView ? COMPACT_MIN_HEIGHT : NORMAL_MIN_HEIGHT;
  const maximumHeight = Math.max(minimumHeight, Math.floor(availableScreenHeight - SCREEN_MARGIN));
  const desiredHeight = settingsOpen
    ? SETTINGS_HEIGHT
    : Math.ceil(contentHeight + Math.max(0, windowFrameHeight));

  return {
    width: isCompactView ? COMPACT_WIDTH : NORMAL_WIDTH,
    height: Math.min(maximumHeight, Math.max(minimumHeight, desiredHeight)),
  };
}
