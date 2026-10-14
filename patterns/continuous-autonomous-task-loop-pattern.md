---
title: "Continuous Autonomous Task Loop Pattern"
status: established
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Internal Practice"]
category: "Orchestration & Control"
source: "https://gist.github.com/nibzard/a97ef0a1919328bcbc6a224a5d2cfc78"
tags: [autonomous-execution, task-loop, rate-limiting, git-automation, cli-driven, stream-processing]
summary: "Runs a loop where subagents pick the next task from a todo file, execute it in fresh context, commit it, and back off on rate limits"
signals: ["A todo file holds discrete, well-defined tasks", "Manual task selection and Git commits slow down work", "Rate limits interrupt long agent sessions"]
anti_signals: ["Tasks are complex or poorly defined", "Each task decision needs human oversight", "Elevated execution permissions are not allowed"]
updated_at: "2026-10-13"
---

## Problem

Traditional development workflows require constant human intervention for task management:

- **Manual Task Selection**: Developers spend time deciding what to work on next from todo lists
- **Context Switching Overhead**: Moving between different types of tasks interrupts flow state
- **Rate Limit Interruptions**: API rate limits break development momentum and require manual waiting
- **Repetitive Git Operations**: Each task completion requires manual staging, committing, and status checking
- **Error Recovery**: Failed tasks need manual diagnosis and restart

This manual orchestration reduces overall productivity and prevents developers from focusing on higher-level problem solving.

## Solution

Implement a continuous autonomous loop that handles task selection, execution, and completion without human intervention. This pattern operationalizes the **ReAct paradigm** (Thought → Action → Observation) as a continuous execution cycle:

1. **Fresh Context Per Iteration**: Each task starts with a clean context to avoid contamination
2. **Autonomous Task Selection**: Use specialized subagents to pick the next appropriate task
3. **Automated Git Management**: Handle commits and status updates through dedicated subagents
4. **Intelligent Rate Limit Handling**: Detect rate limits and implement exponential backoff
5. **Stream-Based Progress Tracking**: Real-time feedback through JSON streaming
6. **Configurable Execution Limits**: Safety bounds to prevent runaway execution

The pattern operates in a continuous loop until stopped manually or reaching iteration limits.

## Example

```mermaid
sequenceDiagram
    participant Script as Autonomous Script
    participant TaskAgent as Task Master Subagent
    participant MainAgent as Main Agent
    participant GitAgent as Git Master Subagent
    participant System as File System

    loop Continuous Task Processing
        Script->>TaskAgent: Select next task from TODO.md
        TaskAgent-->>Script: "Implement user authentication"

        Script->>MainAgent: Execute task autonomously
        Note over MainAgent: --dangerously-skip-permissions<br/>Fresh context, focused execution
        MainAgent->>System: Implement code changes
        MainAgent-->>Script: Task completed successfully

        Script->>GitAgent: Commit changes
        GitAgent->>System: git add, commit with message
        GitAgent-->>Script: Changes committed

        alt Rate Limit Detected
            Script->>Script: Exponential backoff wait
            Note over Script: Intelligent delay before retry
        end

        Script->>Script: Update progress counters
        Note over Script: Continue to next iteration
    end
```

## How to use it

### Prerequisites

- CLI agent tool (Claude Code, etc.) with autonomous execution capabilities
- Git repository with TODO.md or similar task file
- JSON parsing tools (jq) for stream processing

### Implementation Steps

1. **Task File Setup**: Create structured todo file with discrete, actionable tasks
2. **Configure Loop Script**: Set iteration limits and rate limit handling parameters
3. **Subagent Configuration**: Define specialized agents for task selection and git operations
4. **Safety Configuration**: Set appropriate permission levels and monitoring
5. **Launch Loop**: Start autonomous execution with configured parameters

### Key Configuration Options

```bash
# Example configuration
MAX_ITERATIONS=50           # Safety limit
CLAUDE_CLI="claude"         # CLI tool choice
RATE_LIMIT_BACKOFF=300     # Seconds to wait on rate limit
STREAM_JSON=true           # Real-time progress tracking
```

### Safety Considerations

- Always set maximum iteration limits
- Use version control for rollback capability
- Monitor execution logs for unexpected behavior
- Start with small task batches to validate behavior

### Native alternatives (2026)

Much of the external while-loop is now available inside Claude Code itself, so check these before maintaining a shell script:

- **Background sessions**: `claude --bg` starts a session as a background agent and returns immediately, printing the session ID and management commands.
- **Budget caps**: `claude -p --max-budget-usd 5.00 "query"` stops the run once estimated API spend reaches the amount, including subagent spend.
- **In-process stop-hook loops**: a Stop hook that restarts the agent when completion criteria are not met achieves the same unattended looping without an external script (see [Stop Hook Auto-Continue Pattern](stop-hook-auto-continue-pattern.md)).

The external shell loop is still the right choice when you need cross-tool orchestration (mixing CLIs from different vendors), custom rate-limit policy across processes, or progress accounting over the todo file with plain Unix tooling.

Distinct from [Stop Hook Auto-Continue Pattern](stop-hook-auto-continue-pattern.md): that pattern continues a single Claude Code session in-process via a Stop hook, while this pattern drives fresh CLI invocations from an external script.

## Trade-offs

**Pros:**
- **Complete Autonomy**: Eliminates manual task orchestration overhead
- **Continuous Progress**: Maintains development momentum without human intervention
- **Fresh Context**: Each task gets clean reasoning context
- **Intelligent Error Handling**: Automated recovery from common failure modes
- **Git Automation**: Maintains clean commit history automatically
- **Rate Limit Resilience**: Handles API constraints gracefully

**Cons/Considerations:**
- **Reduced Human Oversight**: Less control over individual task decisions
- **Permission Requirements**: Needs elevated execution permissions for autonomy
- **Runaway Risk**: Potential for unintended extensive execution
- **Task Quality Dependency**: Effectiveness depends on well-structured task definitions
- **Limited Complex Problem Solving**: Best for discrete, well-defined tasks
- **Resource Consumption**: Continuous execution uses computational resources

## References

- [Original Autonomous Task Processing Script](https://gist.github.com/nibzard/a97ef0a1919328bcbc6a224a5d2cfc78) - Complete implementation example
- [Claude Code CLI reference](https://code.claude.com/docs/en/cli-reference) - native `--bg` background sessions and `--max-budget-usd` spend caps that absorb parts of the external loop
- [Anthropic Engineering: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) - harness design for unattended, multi-session agent work
- [The Ralph Loop: How I Run Autonomous AI Agents Overnight](https://blakecrosley.com/blog/ralph-agent-architecture) - Blake Crosley, Feb 2026: stop-hook-based autonomous loops as the in-process variant
- [ReAct: Synergizing Reasoning and Acting](https://arxiv.org/abs/2210.03629) (NeurIPS 2022) - Yao et al. — establishes Thought→Action→Observation paradigm foundational to continuous task loops
- [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366) (NeurIPS 2023) - Shinn et al. — episodic memory and self-reflection for continuous improvement
