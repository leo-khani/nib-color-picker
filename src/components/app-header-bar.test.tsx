import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppHeaderBar from "./app-header-bar";

describe("AppHeaderBar", () => {
  it("routes section and settings actions to the application", async () => {
    const user = userEvent.setup();
    const onSectionChange = vi.fn();
    const onOpenSettings = vi.fn();

    render(
      <AppHeaderBar
        activeSection="picker"
        onSectionChange={onSectionChange}
        onOpenSettings={onOpenSettings}
      />,
    );

    expect(screen.getByRole("button", { name: "Color Picker" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(screen.getByRole("button", { name: "History" }));
    await user.click(screen.getByRole("button", { name: "Open settings" }));

    expect(onSectionChange).toHaveBeenCalledWith("history");
    expect(onOpenSettings).toHaveBeenCalledOnce();
  });
});
