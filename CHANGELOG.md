# Changelog

All notable changes are documented here. This project follows Semantic Versioning.

## [Unreleased]

### Added

- Native Windows pixel picker, tray lifecycle, global shortcut, startup integration,
  and single-instance handling.
- Typed color conversion, contrast, palette, history, import/export, and storage logic.
- Accessible React application shell with local settings and history.
- Windows validation and tagged release workflows.

### Changed

- Apply the Dr. White, Kettle Black, Free Speech Blue, and Vivid Cerulean palette
  throughout the light and dark application themes.
- Turn compact mode into a focused color, code, and Pick layout and automatically
  resize the desktop window to the visible content.
- Add a subtle, slowly animated blue ambient background that respects reduced-motion
  preferences in both light and dark themes.
- Keep Settings available from compact mode, make current-color favorites functional,
  remove rotational UI motion, animate history cards with FadeBlur, replace history
  search with a clear-non-favorites action, and simplify Settings around a dark-only
  theme with direct shortcut capture.
- Replace the CSS ambient gradient with an adapted React Bits Grainient WebGL
  background using the Nib palette, reduced motion, and zero rotational movement.
- Generate the Windows executable, installer, window, tray, and web icons from the
  new Nib icon artwork.

### Fixed

- Keep the main window above other applications and show the application icon in the
  Windows notification area instead of an empty tray slot.
- Disable resizing and maximizing while continuing to restore the last window position.
- Connect the application header tabs to the picker and history views, add dark-mode
  header and settings surfaces, and remove the duplicate Settings scrollbar.
- Explicitly apply the generated application icon to the live Windows window so its
  taskbar and title-bar icon do not fall back to a cached or generic executable icon.
- Cap the History view height and scroll its color cards internally so the application
  window does not continue growing as colors are added.
- Center the native picker HEX indicator beneath the cursor and give its compact,
  content-fitted color preview and label a fully rounded pill layout.
