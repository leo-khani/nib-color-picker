# Contributing

Thanks for helping improve Nib Color Picker. Small, focused changes are easiest to
review and ship.

Before opening a pull request, create an issue for substantial behavior changes, work
from a short-lived branch, and use Conventional Commits. Install dependencies with
`npm install`, run the app with `npm run tauri:dev`, and include tests for business
logic or regressions.

Run these checks before requesting review:

```powershell
npm run validate
cd src-tauri
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test
```

Keep native code limited to responsibilities that the webview cannot perform reliably.
Avoid adding dependencies when a small, well-tested function is enough. Never add
telemetry or network behavior without prior public discussion.

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
