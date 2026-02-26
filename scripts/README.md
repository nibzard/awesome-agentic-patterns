# Claude Research Loop

Run from repo root:

```bash
make research_loop
make research_loop PROJECT_PINNED_CLAUDE_BIN="$HOME/.local/share/claude/versions/2.1.34"
scripts/claude-research-loop.sh --bootstrap-only
scripts/claude-research-loop.sh --once
scripts/claude-research-loop.sh
scripts/claude-research-loop.sh --pattern plan-then-execute-pattern
```

Requirements:

```bash
jq
~/.local/share/claude/versions/2.1.34 (project default pin)
```

Override pin for one run:

```bash
CLAUDE_BIN=claude scripts/claude-research-loop.sh --once
```

## Pinning Note

This loop is pinned to `~/.local/share/claude/versions/2.1.34` by default because newer bundled builds were unstable on this host during testing.

Project-only pin:
- `make research_loop` uses the pinned binary.
- You can still override per run with `CLAUDE_BIN=...`.

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
