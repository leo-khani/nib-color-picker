import { fitWindowToContent } from "./content-fit";

describe("fitWindowToContent", () => {
  it("uses the compact width and content height for compact mode", () => {
    expect(
      fitWindowToContent({
        compact: true,
        settingsOpen: false,
        contentHeight: 68,
        windowFrameHeight: 32,
        availableScreenHeight: 1080,
      }),
    ).toEqual({ width: 360, height: 100 });
  });

  it("expands compact mode for settings and constrains tall content to the screen", () => {
    expect(
      fitWindowToContent({
        compact: true,
        settingsOpen: true,
        contentHeight: 1000,
        windowFrameHeight: 32,
        availableScreenHeight: 600,
      }),
    ).toEqual({ width: 420, height: 552 });
  });
});
