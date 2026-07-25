# Nib Color Picker

Nib Color Picker is a compact, open-source color utility for Windows 10 and 11. It
samples a pixel anywhere on the desktop, copies the value you need, and keeps a
searchable local history. It is designed to stay out of the way: close the window
and it remains available from the system tray or `Ctrl + Shift + C`.

> Nib Color Picker is under active development. Version 0.1 establishes the native
> picker, tray lifecycle, color engine, persistent history, and accessible application
> shell. See [Current limitations](#current-limitations) before relying on it in a
> production workflow.

## Features

- Native Windows pixel sampling with left-click confirmation and Escape/right-click cancellation
- Configurable system-wide shortcut
- System tray lifecycle, close-to-tray, and single-instance protection
- HEX, HEX8, RGB(A), HSL(A), HSV, HWB, approximate CMYK, decimal, normalized RGB,
  and Windows BGR output
- WCAG contrast ratios against black and white
- Lightness scales, tints, tones, complementary, analogous, triadic,
  split-complementary, and tetradic palettes
- Searchable history with deterministic limits, favorites, JSON import, and JSON export
- Versioned, validated local storage with corruption recovery
- Light, dark, and system themes; compact layout; keyboard navigation; reduced-motion support
- Optional Windows startup and always-on-top behavior
- Restored window size and position with monitor-layout safety
- No account, network service, analytics, or telemetry

## Screenshots

Screenshots will be added with the first signed preview release. The visual design is
intentionally neutral so the interaction model can stabilize before visual branding.

## Why Tauri?

Tauri uses the Windows WebView2 runtime already present on supported Windows systems
and keeps native responsibilities in Rust. Compared with bundling a full browser
runtime, this gives Nib a smaller installer, lower idle memory use, and a direct route
to Windows APIs. React remains a productive fit for the settings, history, and color
editing UI; high-frequency screen sampling stays outside React.

## Requirements

For development:

- Windows 10 (1803 or later) or Windows 11
- WebView2 Runtime
- Node.js 22 or newer
- Rust stable with the `x86_64-pc-windows-msvc` target
- Visual Studio Build Tools with the Desktop development with C++ workload

End users receive WebView2 bootstrapper handling through the installer.

## Development

```powershell
git clone https://github.com/mrnibo99/nib-color-picker.git
cd nib-color-picker
npm install
npm run tauri:dev
```

The browser-only UI can be run with `npm run dev`; screen picking, tray behavior,
global shortcuts, notifications, and startup integration require the Tauri application.

## Commands

| Command                 | Purpose                                 |
| ----------------------- | --------------------------------------- |
| `npm run dev`           | Run the Vite UI                         |
| `npm run tauri:dev`     | Run the Windows desktop application     |
| `npm run typecheck`     | Check strict TypeScript                 |
| `npm run lint`          | Run ESLint                              |
| `npm run format`        | Apply Prettier and supported formatters |
| `npm run format:check`  | Verify formatting                       |
| `npm run test`          | Run frontend unit tests                 |
| `npm run test:coverage` | Run tests with an HTML coverage report  |
| `npm run build`         | Build the frontend                      |
| `npm run tauri:build`   | Build Windows MSI and NSIS installers   |
| `npm run validate`      | Run the frontend validation suite       |

Rust checks run from `src-tauri`:

```powershell
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test
```

## Architecture

The frontend is organized by feature. Pure color algorithms live in `src/lib/color`;
history and import/export rules stay independent of React; Zustand holds durable app
state but never receives cursor movement. Zod validates storage and imports at the
boundary. The settings screen is lazy-loaded.

The Rust layer is deliberately narrow:

- `picker` samples the desktop through GDI and owns input cancellation.
- `commands` exposes typed operations and shortcut registration.
- `tray` owns the tray menu and explicit application exit.
- Tauri plugins provide focused, audited implementations for storage, startup,
  clipboard access, notifications, single-instance handling, and window state.

See [ADR 0001](docs/adr/0001-native-picker.md) for the picker decision and
[ADR 0002](docs/adr/0002-local-storage.md) for persistence.

## Picker behavior

`Ctrl + Shift + C` starts the picker by default. The Rust command checks cursor and
button state on an 8 ms interval and reads the confirmed desktop pixel with `GetPixel`.
This supports virtual-screen coordinates, including monitors placed left or above the
primary display. Left click confirms; Escape or right click cancels. Each GDI device
context is released before returning, including error paths.

Global shortcut changes are transactional: Nib unregisters its old shortcut, tries the
new value, and reports an actionable error if Windows or another program owns it.

## Color calculations

Harmonies rotate hue in HSL: complementary 180°, analogous ±30°, triadic 120°,
split-complementary 150°/210°, and tetradic 90° steps. Tints interpolate HSL
lightness toward 100%; tones interpolate saturation toward 0%. Five or six evenly
spaced steps are used in the interface. Achromatic colors retain predictable angles,
although hue changes are visually indistinguishable at zero saturation.

CMYK is a device-independent mathematical approximation from sRGB. It is useful for
communication, not color-managed print production; use an ICC-aware design tool for
press values.

## Storage and privacy

Settings and history are stored by Tauri in the current user's application-data
directory. Records include a schema version and are validated on every load. Invalid
or unsupported data falls back safely to defaults instead of crashing the application.
Writes are debounced to avoid continuous disk activity.

All pixel sampling happens locally. Nib does not capture or upload screenshots,
selected colors, history, or diagnostics. It makes no remote requests at runtime and
contains no telemetry.

## Packaging

```powershell
npm ci
npm run tauri:build
```

Installers are written beneath `src-tauri/target/release/bundle`. Tagged versions
matching `v*` trigger the release workflow, which validates the project, builds the
Windows artifacts, produces SHA-256 checksums, and drafts a GitHub release.

## Troubleshooting

- **The shortcut does nothing:** another application may own it. Open Settings and
  choose a different combination.
- **The browser preview cannot pick a color:** use `npm run tauri:dev`; native features
  do not exist in the browser preview.
- **The window disappeared after changing monitors:** launch Nib again. The window-state
  plugin clamps restored geometry to connected displays.
- **The installer requests WebView2:** allow it to install Microsoft's runtime, then
  reopen Nib.

## Current limitations

- The 0.1 picker confirms the exact cursor pixel but does not yet draw the planned
  magnifier overlay or live neighboring-pixel grid.
- Tray pause and startup state are not yet mirrored live across multiple open settings
  surfaces.
- Automated tests cover platform-independent logic and native serialization. Interactive
  multi-monitor, mixed-DPI, fullscreen, sleep/wake, and installer behavior is validated
  by Windows CI and still needs broader hardware testing.
- Color names and direct RGB/HSL channel editors are planned; free-form color input is
  available now.

## Roadmap

The next milestones are the low-latency native magnifier overlay, richer channel
editing, signed releases with updater endpoints, and hardware-backed multi-monitor
test coverage.

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a change. Participation is
governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Please report vulnerabilities
privately as described in [SECURITY.md](SECURITY.md).

Nib Color Picker is available under the [MIT License](LICENSE).
