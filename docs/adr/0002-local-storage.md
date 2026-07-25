# ADR 0002: Store versioned JSON locally

Status: accepted

Nib's settings and color history are small and do not need a database. A Tauri store
contains a versioned JSON document. Zod validates it at the frontend boundary, migrations
are explicit, writes are debounced, and invalid data falls back to safe defaults.

This keeps the application portable and inspectable while avoiding the size and migration
cost of an embedded database. If history grows beyond the current bounded model, this
decision should be revisited with measured evidence.
