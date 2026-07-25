# ADR 0001: Sample confirmed pixels in Rust with Windows GDI

Status: accepted for 0.1

The picker must operate outside the webview, across the Windows virtual desktop, without
putting cursor updates into React state. The initial implementation polls Windows input
state from a blocking Rust worker and reads the confirmed pixel with `GetPixel`.

This keeps the hot path local, has predictable cleanup, supports negative virtual-screen
coordinates, and avoids continuous IPC. Polling at 8 ms is responsive while active and
stops completely after confirmation or cancellation. The next picker iteration will
add a separate native overlay for the magnifier; it will reuse the same sampling owner
rather than stream through the main React tree.
