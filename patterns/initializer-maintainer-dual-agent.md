---
title: Initializer-Maintainer Dual Agent Architecture
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Anthropic Engineering Team", "Cursor Engineering (Planner-Worker Architecture)"]
category: Orchestration & Control
source: "https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents"
tags: [long-running-agents, session-handoff, lifecycle-specialization, project-bootstrap, incremental-development]
summary: "Uses a one-time initializer agent to create the feature list, progress files, and bootstrap script, then a coding agent that resumes from them one feature per session"
signals: ["Projects need many agent sessions over days or weeks", "Applications have many discrete features to track", "Context loss between sessions is costly"]
anti_signals: ["Small, single-session tasks", "Exploratory or research projects with no clear feature list up front"]
updated_at: "2026-10-13"
---

## Problem

Long-running agent projects face distinct failure modes at different lifecycle stages:

- **Project initialization** requires comprehensive setup: environment configuration, feature specification, test infrastructure, and progress tracking systems
- **Incremental development** requires reading prior context, selecting the next task, implementing, and verifying—repeatedly across many sessions
- Single-agent approaches either over-engineer each session (wasting setup time) or under-invest in foundations (leading to drift and confusion)
- Session boundaries create context loss, causing agents to restart from scratch or lose track of project state

## Solution

Implement a two-agent architecture with lifecycle-specialized responsibilities. In the reference implementation both roles are the same harness with only a different initial user prompt (the system prompt, tools, and harness are identical); "two agents" is a prompt-level distinction, not two deployed systems.

**1. Initializer Agent** (runs once at project start):

- Creates the immutable feature list with all requirements (the artifact and its enforcement rules are covered in [Feature List as Immutable Contract](feature-list-as-immutable-contract.md))
- Establishes progress tracking artifacts (e.g., `progress.txt`)
- Sets up environment bootstrap scripts (e.g., `init.sh`)
- Configures testing infrastructure
- Makes first git commit with foundational structure

**2. Maintainer/Coding Agent** (runs in subsequent sessions):

- Executes session bootstrapping ritual:
  1. Verify working directory (`pwd`)
  2. Read git logs and progress files
  3. Read feature list and select next incomplete feature
  4. Run bootstrap script to start services
  5. Run existing tests before implementing new features
- Works on one feature at a time
- Commits after each verified feature
- Updates progress artifacts

```mermaid
sequenceDiagram
    participant Init as Initializer Agent
    participant FS as Filesystem
    participant Coding as Coding Agent
    participant Git as Git Repository

    Note over Init: Runs ONCE at project start
    Init->>FS: Create feature list (see Feature List as Immutable Contract)
    Init->>FS: Create init.sh (environment bootstrap)
    Init->>FS: Create progress.txt (empty log)
    Init->>Git: Initial commit with foundation

    Note over Coding: Runs in EACH subsequent session
    loop Session N
        Coding->>Git: Read git log for context
        Coding->>FS: Read progress.txt
        Coding->>FS: Read feature-list.json
        Coding->>Coding: Select highest-priority incomplete feature
        Coding->>FS: Run init.sh (start servers)
        Coding->>Coding: Run E2E tests (verify baseline)
        Coding->>Coding: Implement single feature
        Coding->>Coding: Verify feature passes
        Coding->>FS: Update progress.txt
        Coding->>Git: Commit changes
    end
```

## How to use it

**Best for:**

- Projects requiring many sessions to complete (days/weeks of agent work)
- Complex applications with 50+ discrete features
- Scenarios where context loss between sessions is costly
- Teams using agents for sustained development, not one-shot tasks

**Implementation steps:**

1. **Design the Initializer prompt**: Focus on comprehensive upfront planning
   - Feature list with detailed acceptance criteria
   - Environment setup automation
   - Progress tracking file structure

2. **Design the Coding Agent prompt**: Focus on incremental progress
   - Session bootstrapping ritual (read context first)
   - Single-feature focus
   - Mandatory testing before marking complete
   - Commit discipline

3. **Define the handoff artifacts**: the feature list is specified in [Feature List as Immutable Contract](feature-list-as-immutable-contract.md); this pattern adds the progress log and the one-command bootstrap script on top of it.

## Trade-offs

**Pros:**

- Clear separation of concerns between setup and execution
- Session bootstrapping ritual prevents context loss
- Mirrors effective human team practices (shift handoffs)
- Initializer creates consistent foundation for all future sessions
- Git history + progress files provide rich context for new sessions

**Cons:**

- Requires upfront investment in comprehensive feature specification
- Two different prompts/configurations to maintain
- Initializer must anticipate needs of Coding Agent
- Not suitable for exploratory or research-oriented projects
- Overhead is wasteful for small, single-session tasks

## References

* [Anthropic Engineering: Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
* [Cursor: Scaling long-running autonomous coding](https://cursor.com/blog/scaling-agents) (January 14, 2026)
* Related: [Feature List as Immutable Contract](feature-list-as-immutable-contract.md) — owns the feature-list artifact and its enforcement rules. Distinct from that pattern: this one owns the session lifecycle (who runs once, who runs repeatedly) around that artifact.
* Related: [Planner-Worker Separation for Long-Running Agents](planner-worker-separation-for-long-running-agents.md) — splits planning from execution at runtime. Distinct from that pattern: this one separates project bootstrap from incremental delivery over the project's lifetime, and both roles share one harness.
* Related: [Filesystem-Based Agent State](filesystem-based-agent-state.md)
* Related: [Proactive Agent State Externalization](proactive-agent-state-externalization.md)
