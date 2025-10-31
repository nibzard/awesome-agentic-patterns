---
title: Team-Shared Agent Configuration as Code
status: best-practice
authors: ["Boris Cherny (Anthropic)", "Enterprise Claude Code Users"]
category: "UX & Collaboration"
source: "https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it"
tags: [configuration, version-control, team-collaboration, permissions, consistency, onboarding]
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

1. **Pre-allowed commands**: Tools that don't need permission prompts
2. **Blocked files/directories**: What the agent must never touch
3. **Default subagents**: Team-standard specialized agents
4. **Slash commands**: Shared workflows everyone can use
5. **Hooks**: Standardized automation triggers

```json
// .claude/settings.json (checked into repo)
{
  "permissions": {
    "pre_allowed": [
      "git add",
      "git commit",
      "git push",
      "npm test",
      "npm run lint"
    ],
    "blocked_paths": [
      ".env",
      "secrets/",
      "*.key",
      "credentials.json"
    ]
  },
  "subagents": {
    "security-review": "./agents/security.md",
    "migration-helper": "./agents/migration.md"
  },
  "hooks": {
    "pre_commit": "./hooks/run_tests.sh"
  }
}
```

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

### 4. Iterate as a team

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

- **Separate local overrides**: Support `.claude/settings.local.json` (gitignored)
- **Document configuration**: Explain why things are pre-allowed/blocked
- **Regular review**: Audit config quarterly as tools/threats evolve
- **Gradual adoption**: Start minimal, expand based on team pain points
- **Template repositories**: Create starter configs for common project types

## References

* Boris Cherny: "Companies that have really big deployments of Claude Code... having settings.json that you check into the code base is really important because you can use this to pre-allow certain commands so you don't get permission prompted every time. And also to block certain commands... and this way as an engineer I don't get prompted and I can check this in and share it with the whole team so everyone gets to use it."
* [AI & I Podcast: How to Use Claude Code Like the People Who Built It](https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it)
