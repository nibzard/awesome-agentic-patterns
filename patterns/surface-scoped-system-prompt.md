---
title: "Surface-Scoped System Prompt"
status: established
authors: ["Continuum AI (@xizhuomengcontin)"]
based_on: ["MiniMax Code (MiniMax-AI)", "Claude Code (Anthropic)"]
category: "Context & Memory"
source: "https://github.com/MiniMax-AI/minimax-code"
tags: [system-prompt, entrypoint, headless, prompt-assembly, tool-surface, harness-design]
summary: "Ships one system prompt per invocation surface and selects it at launch, so an interactive session, a headless run and a task mode each get instructions written for that surface"
signals: ["The harness runs both interactively and headless or in CI", "Some tools only make sense when a human can answer", "Instructions about formatting, pacing or asking questions differ by surface"]
anti_signals: ["One entrypoint and one way of running the agent", "Nobody can maintain more than one prompt document", "Differences are small enough for a single conditional line"]
related: ["agent-modes-by-model-personality"]
updated_at: "2026-09-30"
---

## Problem

A coding agent is usually reachable through more than one door: an interactive terminal session, a
headless `-p`/`exec` invocation in CI, an SDK embedding, a "work" or "research" mode chosen by flag.
One system prompt has to serve all of them, and the instructions pull in opposite directions.

Interactive prompts tell the model to keep answers short because a human is watching, to ask before
doing anything irreversible, and to use terminal formatting. None of that survives contact with a
headless run: there is nobody to ask, the output is consumed by a script, and a tool that waits for
confirmation is a hang, not a safeguard. Teams usually notice this as an agent that is chatty in CI,
or one that stalls waiting for an answer that will never come.

The tempting fix is conditionals inside one prompt — "if running non-interactively, then…" — which
grows a second prompt inside the first and asks the model to route around instructions that do not
apply to it.

## Solution

Assemble the system prompt from the **invocation surface**, decided by the harness at launch, before
the model sees anything. Each surface gets its own prompt document, and optionally its own tool set.
The model is not asked to work out which situation it is in; the harness already knows.

Two shipped implementations, reached independently:

**Claude Code** switches on the entrypoint. The request carries it explicitly
(`cc_entrypoint=cli` versus `cc_entrypoint=sdk-cli`), and both the prompt and the tool schema change
with it. The identity line itself is rewritten — `You are Claude Code, Anthropic's official CLI for
Claude` becomes `You are a Claude agent, built on Anthropic's Claude Agent SDK` — and the tool list
is trimmed, because tools that assume a terminal have no meaning in an SDK embedding.

**MiniMax Code** switches on a declared task mode. `mcode` ships three Handlebars templates under
`assets/agents/_v2/*/SYSTEM.md.hbs` and picks one per `--prompt-mode`: `tui`, `coding`, `work`.
They are three documents, not one with a flag: `coding` swaps the `Deliverable Files` section for
`Media Output`, and `work` adds an `Artifact Completion Contract` on top. The tool set stays
identical across all three — here the surface changes what the agent is told to produce, not what it
can reach.

```pseudo
launch(surface, model):
    prompt = PROMPTS[surface]          // a document, not a branch
    tools  = TOOLS[surface] or TOOLS.default
    return session(prompt, tools, model)
```

## Evidence

- **Evidence Grade:** `medium`
- **Most Valuable Findings:**
  - Both variables were measured on the wire, not inferred. Claude Code `claude-fable-5-1` on
    2026-09-02: interactive 26,131 characters and 35 tool definitions, print/SDK 20,806 characters
    and 29 tools, same model, same day.
  - MiniMax Code `mcode` 0.4.12 on 2026-09-20: 14,675 / 16,055 / 17,619 characters for
    `tui` / `coding` / `work`, with a byte-identical 18-tool schema across all three.
  - **The model is not the variable.** Seven models across six labs driven through the same MiniMax
    Code surface produced prompts identical line for line except `- Model: <id>`. This is what
    separates this pattern from picking modes by model personality: here the model can change freely
    and the prompt does not move.
- **Unverified / Unclear:** whether the trimmed headless tool set is a deliberate safety decision or
  a consequence of which tools the embedding can host; only the two harnesses above were measured,
  so the frequency across the wider ecosystem is unknown.

## How to use it

- Enumerate your real entrypoints first. If there is genuinely one, this pattern is overhead.
- Give each surface a prompt file of its own and diff them in review. The diff is the design: if two
  files differ by one sentence, merge them; if they differ by a section, the split is earning its
  keep.
- Decide per surface whether the **tool set** also changes. Anything that asks a human something
  should not exist in a headless surface — removing it is safer than instructing the model not to
  call it.
- Put the surface in the request metadata or a header so a later trace says which prompt was used.
  Debugging a bad run starts with knowing which document the model was given.
- Keep the shared material in one place — a partial, an include, a template layer — so a policy
  change lands in every surface at once.

## Trade-offs

- **Pros:** Each surface gets instructions that are true for it; no conditional logic for the model
  to interpret; the headless tool surface can be genuinely smaller rather than nominally forbidden;
  behaviour differences between CI and local become a readable diff instead of a mystery.
- **Cons:** N prompts to keep in sync, and drift between them is silent — a safety rule can be
  tightened in the interactive prompt and forgotten in the headless one. Prompt-prefix caching is
  fragmented across surfaces. It multiplies the evaluation matrix: every surface is its own thing to
  test. And a surface added later inherits nothing unless the shared layer was built up front.

## References

- [MiniMax Code (`mcode`)](https://github.com/MiniMax-AI/minimax-code) — the three
  `assets/agents/_v2/*/SYSTEM.md.hbs` templates and the `--prompt-mode` flag that selects them.
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk-python) — the SDK surface whose
  prompt and tool set differ from the interactive CLI.
- [OrcaPromptVault](https://github.com/Continuum-AI-Corp/OrcaPromptVault) — the wire captures the
  measurements above come from; `Claude-Code/` and `MiniMax-Code/` hold both sides of each pair, and
  `docs/CAPTURES.md` gives the command that reproduces each one. Disclosure: this archive is
  maintained by the author of this pattern, and is cited here as the measurement source rather than
  as an implementation of the pattern.
