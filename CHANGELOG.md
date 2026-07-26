# Changelog

All notable changes are documented here. This project follows Semantic Versioning.

## [Unreleased]

## [0.1.0] - 2026-07-26

### Added

- Native Windows pixel picker, tray lifecycle, global shortcut, startup integration,
  and single-instance handling.
- Typed color conversion, contrast, palette, history, import/export, and storage logic.
- Accessible React application shell with local settings and history.
- Windows validation and tagged release workflows.
- Compact always-on-top mode, a pointer-adjacent HEX indicator, and custom Windows,
  tray, installer, and web icons.

### Changed

- Apply the accessible Obsidian Iris palette and locally bundled Sen typeface
  throughout the dark-only interface.
- Turn compact mode into a focused color, code, and Pick layout and automatically
  resize the desktop window to the visible content.
- Add a subtle animated Grainient background that respects reduced-motion preferences.
- Keep Settings available from compact mode, make current-color favorites functional,
  remove rotational UI motion, animate history cards with FadeBlur, replace history
  search with a clear-non-favorites action, and simplify Settings around a dark-only
  theme with direct shortcut capture.
- Add a reusable frosted glass surface with blur, restrained distortion, and subtle
  noise.

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
- Keep format rows aligned inside glass surfaces and select black or white overlay
  icons according to the underlying color contrast.

[Unreleased]: https://github.com/leo-khani/nib-color-picker/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/leo-khani/nib-color-picker/releases/tag/v0.1.0
