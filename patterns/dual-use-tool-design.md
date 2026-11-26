---
title: Dual-Use Tool Design
status: foundational
authors:
  - Nikola Balic (@nibzard)
  - Lucas Carlson
based_on:
  - Boris Cherny (Anthropic)
  - Claude Code Team
  - Agent Skills format (Anthropic)
  - Unix Philosophy
category: Tool Use & Environment
source: >-
  https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it
tags:
  - tools
  - ux
  - slash-commands
  - hooks
  - human-ai-collaboration
  - consistency
  - cli
  - skills
  - composability
  - unix-philosophy
slug: dual-use-tool-design
id: dual-use-tool-design
summary: "Builds each tool or skill as one CLI interface that both humans and agents call, with JSON output, exit codes, and the same permissions and logs"
signals: ["You maintain separate tools for humans and agents", "Human and agent capabilities drift apart over time", "Tools have interactive prompts or output that agents cannot parse", "Skills must compose with Unix tools and scripts"]
anti_signals: ["A tool is only ever used by one audience", "A separate specialized tool gives clearly better results for agents or humans", "Calls exceed about 100 per second or need complex object graphs and streaming"]
related: ["agent-first-tooling-and-logging", "code-over-api-pattern", "cli-native-agent-orchestration", "llm-friendly-api-design", "skill-library-evolution"]
updated_at: "2026-11-23"
---

## Problem

Building separate tools for humans and AI agents creates:

- **Maintenance overhead**: Two implementations of similar functionality
- **Inconsistent behavior**: Human tools work differently than agent tools
- **Learning curve**: Users must learn one interface, agents another
- **Feature drift**: Human and agent capabilities diverge over time
- **Testing burden**: Must validate both interfaces separately

Teams building agent skills face the same tension. An API-first design is easy to call programmatically but hard to debug by hand. A GUI-first design is easy for humans but invisible to agents. Most teams end up maintaining both or choosing one audience.

## Solution

Design all tools to be **dual-use**: equally accessible and useful to both humans and AI agents. When a human can invoke a tool manually, the agent should be able to call it programmatically, and vice versa.

**Core principle**: "Everything you can do, Claude can do. There's nothing in between."

**Academic support**: Validated by LLM-HAS research (arXiv:2505.00753, 2025) showing shared interfaces reduce coordination overhead and improve human-agent collaboration.

**Key characteristics of dual-use tools:**

1. **Same interface**: Humans and agents use identical APIs/commands
2. **Shared logic**: One implementation serves both use cases
3. **Composable**: Tools can be chained by either humans or agents
4. **Observable**: Both see the same outputs (transparency)
5. **Documented once**: Single source of truth for behavior

**The CLI as the default container.** A well-designed command-line interface is naturally dual-use: humans run it from a terminal, agents run it through a shell tool, scripts and cron run it unchanged. For skills, the standardized **Agent Skills format** (a folder with a `SKILL.md` plus optional `scripts/`, references, and assets) defines where the skill lives and how the agent discovers and loads it. The CLI rule governs what goes in that container: a bundled capability that behaves like a well-behaved Unix command. No MCP server boilerplate is required when a CLI suffices.

```pseudo
# Dual-use slash command example
define_slash_command("/commit") {
    steps: [
        "run linters",
        "generate commit message from git diff",
        "create commit with standard format"
    ],
    callable_by: ["human", "agent"],
    pre_allowed_tools: ["git add", "git commit"],
    model: "haiku"  # same for both
}

# Human invocation
$ /commit

# Agent invocation
agent.call_slash_command("/commit")
```

**CLI contract that serves both callers:**

1. **One script, one skill**: Each capability is a standalone executable with subcommands (`skill.sh list`, `skill.sh get <id>`)
2. **Structured output**: `--json` for programmatic use; human-readable output when stdout is a TTY (detect via `isatty()`)
3. **Stream separation**: Data on stdout, errors and diagnostics on stderr
4. **Semantic exit codes**: 0 success, 1 error, 2 incorrect usage, 127 not found
5. **Non-interactive by default**: No prompts; offer `--yes` or `--force` flags instead
6. **Self-describing**: `--help` documents every flag so an agent can learn the interface the same way a human does
7. **Environment config**: Credentials from environment variables, never hardcoded

```bash
# Illustrative example: a Trello skill as a CLI (written for this pattern, not taken from a cited source)
trello.sh boards                    # List all boards
trello.sh cards <BOARD_ID>          # List cards on board

# Human usage
$ trello.sh boards
{"id": "abc123", "name": "Personal", "url": "..."}

# Agent usage (via a shell tool)
trello.sh cards abc123 | jq '.[0].name'
```

**Relationship to Agent-First Tooling and Logging:** [Agent-First Tooling and Logging](agent-first-tooling-and-logging.md) covers the diagnostic side of the same environment: unified log streams and structured output designed so an agent can debug itself. This pattern covers the invocation contract: one interface humans and agents share.

## How to use it

**Design principles:**

1. **Start with human ergonomics**: If it makes sense to humans, it usually makes sense to agents
2. **Make everything scriptable**: What humans can click, agents should be able to call
3. **Shared state visibility**: Both see the same terminal output, file changes, etc.
4. **Consistent permissions**: Same security rules apply to both
5. **Unified logging**: Single structured log stream (JSONL) that both can parse

**Industry examples beyond Claude Code:**

- **GitHub CLI**: `--json` flag enables programmatic consumption; same command works for humans and agents
- **kubectl/AWS CLI**: `-o json` provides machine-readable output while preserving human-friendly defaults
- **`--for-agent` convention**: proposed in the [Agent-First Tooling and Logging](agent-first-tooling-and-logging.md) pattern; treat it as a design convention rather than a shipped flag, since no vendor CLI documents one

**Claude Code implementation examples:**

- **Slash commands**: `/commit`, `/pr`, `/feature-dev` work manually and in agent flows
- **Hooks**: Humans can trigger hooks manually; agents trigger them automatically
- **Bash mode**: `!command` visible to both human and agent in same terminal
- **Permissions**: Pre-allowed tools work the same whether human or agent invokes them

**Skill layout:**

```text
~/.claude/skills/
├── trello/scripts/trello.sh             # One CLI entry point per skill
├── asana/scripts/asana.sh
└── priority-report/scripts/priority-report.sh  # Composes the other skill CLIs
```

**Anti-patterns to avoid:**

- **Interactive prompts** without `--yes`/`--force` flags block autonomous agent usage
- **Non-standard output** without `--json` option requires custom parsing
- **Inconsistent error handling** by caller type breaks predictability
- **Building an MCP server** when a plain CLI with JSON output would serve both callers

## Trade-offs

**Pros:**

- **Reduced maintenance**: One tool implementation serves both audiences
- **Consistency**: Identical behavior whether human or agent invokes
- **Debuggable and testable**: Run the command by hand to inspect output; integration tests are plain shell assertions
- **Composable**: Pipe and chain with Unix tools from either a human shell or an agent
- **Transparency**: Agent tool calls are visible shell commands humans understand

**Cons:**

- **Design constraints**: Must satisfy both human ergonomics AND API cleanliness
- **Shell limitations**: Complex data structures are awkward in bash; error handling is less structured than exceptions
- **Performance**: Process spawn overhead per call, and no persistent state between invocations
- **Portability**: Shell-based skills need WSL or Git Bash on Windows
- **Not for every workload**: Use in-process functions above roughly 100 calls per second, a structured API for complex object graphs, and WebSocket/SSE for real-time streaming

## References

* [A Survey on Large Language Model based Human-Agent Systems](https://arxiv.org/abs/2505.00753) (arXiv:2505.00753, May 2025) — validates shared interfaces for effective human-agent collaboration
* [Why Human-Agent Systems Should Precede AI Autonomy](https://arxiv.org/html/2506.09420v1) (arXiv:2506.09420, June 2025) — argues for designing tools for both humans and agents from the start
* Boris Cherny: "Tools were built for engineers, but now it's equal parts engineers and models... everything is dual use."
* Boris Cherny: "I have a slash command for slash commit... I run it manually, but also Claude can run this for me. And this is pretty useful because we get to share this logic."
* Cat Wu: "Claude Code has access to everything that an engineer does at the terminal. Making them dual use actually makes the tools a lot easier to understand. Everything you can do, Claude can do. There's nothing in between."
* [AI & I Podcast: How to Use Claude Code Like the People Who Built It](https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it)
* [Arcjet: Designing a CLI for AI agents](https://arcjet.com/blog/designing-a-cli-for-ai-agents) (June 2, 2026) - treats CLIs as interfaces that must serve human and agent callers at once
* [Claude Code skills documentation](https://code.claude.com/docs/en/skills) — documents the skill layout: a `SKILL.md` folder per skill under `~/.claude/skills/`, with optional `scripts/` that the agent executes rather than loads into context
* [Agent Skills open format](https://agentskills.io) and [anthropics/skills](https://github.com/anthropics/skills) — the open standard and Anthropic's repository; both define the skill format, not a CLI-first design rule
* [Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents) (Anthropic, 2025) — guidance on consolidated high-signal tools, namespacing, response formats, and actionable error messages
* Unix Philosophy (Doug McIlroy): "Write programs that do one thing and do it well"; POSIX exit code conventions: IEEE Std 1003.1
* Distinct from [Agent-First Tooling and Logging](agent-first-tooling-and-logging.md): that pattern optimizes tool output and logs for agent consumption, while this pattern keeps one interface serving both audiences
* Distinct from [LLM-Friendly API Design](llm-friendly-api-design.md): that pattern shapes API structure and versioning for model consumption, while this pattern covers tools invokable by both humans and agents unchanged
* [CLI-Native Agent Orchestration](cli-native-agent-orchestration.md) scripts the agent itself through its CLI rather than building skills as CLIs
