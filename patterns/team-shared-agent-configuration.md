---
title: Team-Shared Agent Configuration as Code
status: best-practice
authors:
  - Nikola Balic (@nibzard)
based_on:
  - Boris Cherny (Anthropic)
  - Enterprise Claude Code Users
category: UX & Collaboration
source: >-
  https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it
tags:
  - configuration
  - version-control
  - team-collaboration
  - permissions
  - consistency
  - onboarding
slug: team-shared-agent-configuration
id: team-shared-agent-configuration-as-code
summary: >-
  Check agent configuration into version control as code, enabling consistent
  behavior across teams, faster onboarding, and collaborative improvement through
  PRs and code review.
signals: ["Several engineers use the same agent on one repository", "Team members get the same permission prompts again and again", "Team needs standard rules for files the agent must not touch"]
anti_signals: ["Solo developer with no shared repository", "Config would need secrets that cannot be committed"]
updated_at: '2026-10-13'
---

## Problem

When each engineer configures their AI agent independently:

- **Inconsistent behavior**: Agents work differently for different team members
- **Permission friction**: Everyone gets prompted for the same safe commands
- **Duplicated effort**: Each person solves the same configuration problems
- **Knowledge silos**: Good configurations don't spread across the team
- **Onboarding overhead**: New team members start from scratch
- **Security gaps**: No standardized rules about what agents can/can't touch

## Solution

**Check agent configuration into version control** as part of the repository. Treat `settings.json` (or equivalent) as code—reviewable, shareable, and versioned alongside your project.

**Key configuration elements:**

1. **Permission rules**: `permissions.allow`, `permissions.ask`, and `permissions.deny`, evaluated deny first, then ask, then allow
2. **Hooks**: Event-triggered automation such as `PreToolUse` checks
3. **Subagents**: Team-standard specialized agents, stored as `.claude/agents/*.md` files
4. **Slash commands**: Shared workflows everyone can use
5. **Settings layering**: Repo-level settings plus gitignored local overrides for personal additions

```json
// .claude/settings.json (checked into repo)
{
  "permissions": {
    "allow": [
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(npm run lint:*)"
    ],
    "ask": [
      "Bash(git push:*)"
    ],
    "deny": [
      "Read(.env)",
      "Read(secrets/**)",
      "Read(**/*.key)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "./scripts/check-bash.sh" }
        ]
      }
    ]
  }
}
```

Subagents are not entries in this file: each is a Markdown definition under `.claude/agents/` (for example `.claude/agents/security-review.md`), which the harness picks up automatically. Alongside the JSON config, keep an [`AGENTS.md`](https://agents.md) file for the prose rules — setup commands, test commands, code style. AGENTS.md is the cross-tool standard now read by Codex, Cursor, Gemini CLI, Claude Code, and other agents.

## How to use it

**Implementation steps:**

### 1. Create shared config file

Start with common settings all team members need:

- Commands everyone runs (git, test runners, linters)
- Sensitive paths no one should modify
- Standard workflows as slash commands

### 2. Version control it

```bash
git add .claude/settings.json
git commit -m "Add shared agent configuration"
git push
```

### 3. Team adoption

New team members automatically get the configuration when they clone:

```bash
git clone repo
cd repo
# Agent reads .claude/settings.json automatically
```

### 4. Support local overrides

Use gitignored local files for individual customization:

```bash
# .claude/settings.local.json (gitignored)
{
  "permissions": {
    "allow": ["Bash(docker build:*)"]  // personal additions
  }
}
```

Most platforms merge layered configs with local overrides taking precedence.

### 5. Iterate as a team

- PRs can update agent configuration
- Code review applies to agent settings too
- Changes propagate via normal git pull

**Benefits observed in enterprise deployments (from transcript):**

> "Companies that have really big deployments of Claude Code... have settings.json that you check into the code base... you can use this to pre-allow certain commands so you don't get permission prompted every time. And also to block certain commands... and share it with the whole team so everyone gets to use it." —Boris Cherny

## Trade-offs

**Pros:**

- **Consistent team experience**: Everyone's agent behaves the same way
- **Faster onboarding**: New members inherit team knowledge immediately
- **Reduced friction**: Pre-allowed commands eliminate repetitive prompts
- **Security standardization**: Uniform rules about sensitive files
- **Collaborative improvement**: Team can improve config together via PRs
- **Auditable**: Version history shows why configurations changed

**Cons:**

- **Less individual flexibility**: Can't customize as freely
- **Potential conflicts**: Personal preferences vs. team standards
- **Config sprawl**: Settings file can become complex
- **Override complexity**: Need escape hatch for individual customization
- **Secrets exposure risk**: Must ensure no credentials in committed config

**Best practices:**

- **Separate local overrides**: Support `.claude/settings.local.json` (gitignored) for personal customization
- **Schema validation**: Use JSON Schema validation to catch configuration errors before runtime
- **Document configuration**: Explain why commands are allowed, gated with `ask`, or denied
- **Regular review**: Audit config quarterly as tools/threats evolve
- **Gradual adoption**: Start minimal, expand based on team pain points
- **Secrets management**: Never commit credentials; use environment variables or local-only config files

## References

* Boris Cherny: "Companies that have really big deployments of Claude Code... having settings.json that you check into the code base is really important because you can use this to pre-allow certain commands so you don't get permission prompted every time. And also to block certain commands... and this way as an engineer I don't get prompted and I can check this in and share it with the whole team so everyone gets to use it."
* [AI & I Podcast: How to Use Claude Code Like the People Who Built It](https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it)
* [Claude Code permissions](https://code.claude.com/docs/en/permissions) — the documented allow/ask/deny rule schema and evaluation order
* [Claude Code settings reference](https://code.claude.com/docs/en/settings-reference) — the documented settings file schema, including hooks events such as `PreToolUse`
* [AGENTS.md](https://agents.md) — the cross-agent instruction standard (Codex, Cursor, Gemini CLI, Claude Code, and more)
* Alazawi et al. (2021). "Infrastructure as Code: A Systematic Mapping Study". IEEE Access. — Academic foundation for treating configuration as version-controlled code with emphasis on repeatability and collaborative review.
