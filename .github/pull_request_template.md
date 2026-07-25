## Summary

Describe the user-visible result and why the change is needed.

## Validation

- [ ] `npm run validate`
- [ ] `cargo fmt --check`
- [ ] `cargo clippy --all-targets --all-features -- -D warnings`
- [ ] `cargo test`
- [ ] Native behavior was tested on Windows, or the limitation is explained

## Checklist

- [ ] Tests cover new logic or a regression
- [ ] Documentation reflects user-visible behavior
- [ ] No secrets, build output, or unrelated changes are included
- [ ] Tauri permissions remain least-privilege
