# Claude Research Loop

Run from repo root:

```bash
make research_loop
scripts/claude-research-loop.sh --bootstrap-only
scripts/claude-research-loop.sh --once
scripts/claude-research-loop.sh
scripts/claude-research-loop.sh --pattern plan-then-execute-pattern
make research_loop PROJECT_PINNED_CLAUDE_BIN="$HOME/.local/share/claude/versions/2.1.34"
PROJECT_PINNED_CLAUDE_BIN="$HOME/.local/share/claude/versions/2.1.34" scripts/claude-research-loop.sh --once
```

Requirements:

```bash
jq
claude (in PATH) -- latest global is preferred
```

Optional pinned fallback for this project (used when `claude` is unavailable):

```bash
PROJECT_PINNED_CLAUDE_BIN="$HOME/.local/share/claude/versions/2.1.34" scripts/claude-research-loop.sh --once
```

## Pinning Note

This loop now prefers the global `claude` binary by default.

`PROJECT_PINNED_CLAUDE_BIN` can be used as a fallback path if needed.

Project-only pin:
- `make research_loop` uses global `claude` when available.
- You can still force a specific binary with `CLAUDE_BIN=...`.
- You can force the project pin fallback with `PROJECT_PINNED_CLAUDE_BIN=...`.

Revert your global `claude` to the latest published build:

```bash
latest="$(npm dist-tag ls @anthropic-ai/claude-code | awk '/^latest:/ {print $2}')"
~/.local/bin/claude install "$latest" --force
ln -sf "$HOME/.local/share/claude/versions/$latest" "$HOME/.local/bin/claude"
```

Verify:

```bash
readlink -f ~/.local/bin/claude
~/.local/bin/claude --version
```
