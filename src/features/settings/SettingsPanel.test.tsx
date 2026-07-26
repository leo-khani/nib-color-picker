import { render, screen } from "@testing-library/react";
import { DEFAULT_SETTINGS } from "../../lib/storage/defaults";
import SettingsPanel from "./SettingsPanel";

describe("SettingsPanel", () => {
  it("uses one dedicated scroll container with dark mode surfaces", () => {
    render(
      <SettingsPanel
        settings={DEFAULT_SETTINGS}
        history={[]}
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
        onImport={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog");
    const scrollRegion = dialog.querySelector("main");

    expect(dialog).toHaveClass("overflow-hidden", "bg-zinc-950/65", "text-zinc-50");
    expect(scrollRegion).toHaveClass("overflow-y-auto");
  });
});
