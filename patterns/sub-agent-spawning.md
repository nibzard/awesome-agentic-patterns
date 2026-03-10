---
title: Sub-Agent Spawning
status: validated-in-production
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Quinn Slack", "Thorsten Ball", "Will Larson (lethain.com)"]
category: Orchestration & Control
source: "https://www.nibzard.com/ampcode"
tags: [orchestration, context, scalability, subagents, yaml-configuration, virtual-files, subject-hygiene, parallel-delegation]
---

## Problem

Large multi-file tasks blow out the main agent's context window and reasoning budget. You need a way to delegate work to specialized agents with isolated contexts and tools.

## Solution

Let the main agent **spawn focused sub-agents**, each with its own fresh context, to work in parallel on shardable subtasks. Aggregate their results when done.

**Critical requirement**: Each subagent invocation must have a clear, specific task subject for traceability. Empty or generic subjects make parallel work untraceable and synthesis difficult. See [Subject Hygiene](subject-hygiene.md) for details.

**Implementation approaches:**

### 1. Declarative YAML Configuration

Define subagent types in configuration files with their own system prompts, allowed tools, and context windows:

```yaml
# subagents/planning.yaml
name: planning
system_prompt: "Break down complex tasks into steps..."
tools:
  - list_files
  - read_file
  # or inherit: all (from parent agent)

# subagents/think.yaml
name: think
system_prompt: "Analyze and refine reasoning..."
tools:
  - read_file
  - search
```

Agents invoke subagents via a dedicated tool:

```pseudo
subagent(agent_name, prompt, files)
```

This allows:

- **Virtual file isolation**: Subagent only sees files explicitly passed to it
- **Tool scoping**: Subagents can inherit all parent tools or use a subset
- **Specialized system prompts**: Each subagent type has predefined behavior

### 2. Dynamic Spawning

Spawn subagents on-demand for parallel task execution:

```pseudo
# Main agent creates todo list
files = glob("**/*.md")
batches = chunk(files, 9)

# Spawn subagents for each batch IN PARALLEL
for batch in batches:
    spawn_subagent(
        task="Update YAML front-matter in markdown files",  # Clear, specific subject
        files=batch,
        context=instructions
    )
# All subagents run concurrently, not sequentially
```

**Parallel delegation best practices:**

- **Launch independent tasks simultaneously**: Don't explore A, then B, then C sequentially
- **Use clear task subjects**: Each subagent needs a traceable identity (see [Subject Hygiene](subject-hygiene.md))
- **Plan synthesis upfront**: Define how main agent will combine subagent findings
- **Limit to 2-4 subagents**: Observed maximum in effective sessions; more adds coordination overhead

Recent developments show that improved agent [state externalization capabilities](proactive-agent-state-externalization.md) may make subagent delegation more practical by helping agents better identify which tasks are suitable for delegation and how to communicate necessary context to subagents.

## Example (YAML front-matter refactor)

**Parallel delegation with clear subjects:**

```mermaid
sequenceDiagram
  MainAgent->>GlobTool: "*.md"
  MainAgent->>TaskTool: spawn 4 sub-agents with 9 files each

  par Parallel subagents (launched together)
      MainAgent->>SubAgent1: "Update front-matter: batch 1"
      MainAgent->>SubAgent2: "Update front-matter: batch 2"
      MainAgent->>SubAgent3: "Update front-matter: batch 3"
      MainAgent->>SubAgent4: "Update front-matter: batch 4"
  end

  par Each works independently
      SubAgent1->>Files: update batch 1
      SubAgent2->>Files: update batch 2
      SubAgent3->>Files: update batch 3
      SubAgent4->>Files: update batch 4
  end

  MainAgent->>Git: merge branches ➜ single PR
```

**Real-world example from nibzard-web:**

Four parallel subagents launched simultaneously:
- `"Newsletter component exploration"` → agent-a7911db
- `"Modal pattern discovery"` → agent-adeac17
- `"Search implementation research"` → agent-a03b9c9
- `"Log page analysis"` → agent-b84c3d1

Main agent synthesized findings and implemented unified approach.

## How to use it

**Use cases for subagents:**

1. **Context window management**: Process large files in subagents without polluting main context
   - Upload files to subagent
   - Extract specific data
   - Return summary to main agent

2. **Concurrent work**: Run multiple subagents in parallel, join on completion
   - Reduces clock-time for I/O-bound workflows
   - Network API calls can happen simultaneously

3. **Code-driven LLM invocation**: Hand off control to LLM for specific determination
   - Code workflow calls subagent
   - Subagent makes LLM-powered decision
   - Control returns to code with result

4. **Security isolation**: Separate tools/contexts in mutually isolated subagents
   - External resource retrieval isolated from internal access
   - Reduced blast radius for sensitive operations

**Declarative subagent setup:**

```yaml
# agents.yaml
subagents:
  planning:
    file: subagents/planning.yaml
    allowed_in:
      - main_agent
      - research_agent

  think:
    file: subagents/think.yaml
    allowed_in:
      - main_agent
```

**Virtual file passing:**

```pseudo
# Main agent
result = subagent(
    agent_name="planning",
    prompt="Analyze these files and create migration plan",
    files=["file1.ts", "file2.ts", "file3.ts"]
)
# Only these 3 files visible to planning subagent
```

**Recursive architecture insight:**

Some implementations treat every agent as a subagent, enabling flexible composition and consistent behavior across the system.

## Advanced usage: Swarm migrations

For massive parallelization (10+ subagents), see the **Swarm Migration Pattern** which extends this concept for large-scale code migrations.

**Three spawning architecture scales:**

- **Virtual File Isolation** (2-4 subagents): Same-process spawning with explicit file passing for context management
- **Git Worktree Isolation** (10-100 subagents): Filesystem-level isolation using git worktrees for code migrations
- **Cloud Worker Spawning** (100+ agents): Container/VM isolation for enterprise-scale distributed processing

**Production implementations:**

- **Cursor AI**: Hierarchical spawning (Planner → Sub-Planners → Workers) with hundreds of concurrent agents
- **GitHub Agentic Workflows**: Event-driven agent spawning within CI infrastructure
- **Anthropic Claude Code**: Users with high-volume workflows achieve 10x+ speedup on framework migrations

**Quote from Boris Cherny (Anthropic):**

> "There's an increasing number of people internally at Anthropic using a lot of credits every month. Spending over a thousand bucks. The common use case is code migration... The main agent makes a big to-do list for everything and map reduces over a bunch of subagents. You instruct Claude like start 10 agents and then just go 10 at a time and just migrate all the stuff over."

## Trade-offs

**Pros:**

- **Context isolation**: Each subagent has clean context window
- **Parallelization**: Reduce workflow latency through concurrent execution
- **Specialization**: Different subagent types for different tasks (planning, thinking, analysis)
- **Virtual files**: Precise control over what each subagent can see
- **Tool scoping**: Limit subagent capabilities for security/simplicity
- **Declarative config**: Reusable subagent definitions via YAML

**Cons:**

- **Overhead**: Spawning and coordinating subagents adds complexity
- **Cost**: Running multiple agents simultaneously increases token usage
- **Coordination**: Main agent must track and aggregate subagent results
- **Not always necessary**: Author notes "frequently thought we needed subagents, then found more natural alternative"
- **Latency visibility**: User-facing latency is "invisible feature" until it becomes problematic

**When subagents matter most:**

- Context window management (large file processing)
- I/O-bound workflows (network API calls)
- Code-driven workflows needing LLM delegation
- Massive parallelization needs (10+ concurrent agents)

## References

* [SKILLS-AGENTIC-LESSONS.md](https://github.com/nibzard/SKILLS-AGENTIC-LESSONS) - Analysis of 88 sessions emphasizing clear task subjects and parallel delegation patterns
* Vezhnevets, A., et al. (2017). [Feudal Networks for Hierarchical Reinforcement Learning](https://arxiv.org/abs/1706.06121). ICML. - Manager-worker separation with goal-setting in latent space
* Raising An Agent - Episode 6: Claude 4 Sonnet edits 36 blog posts via four sub-agents.
* Boris Cherny (Anthropic) on swarm migrations for framework changes and lint rules
* [AI & I Podcast: How to Use Claude Code Like the People Who Built It](https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it)
* [Cognition AI: Devin & Claude Sonnet 4.5](https://cognition.ai/blog/devin-sonnet-4-5-lessons-and-challenges) - discusses how improved model judgment about state externalization may make subagent delegation more practical
* [Building Companies with Claude Code](https://claude.com/blog/building-companies-with-claude-code) - Ambral's "robust research engine" uses dedicated sub-agents specialized for different data types, enabling parallel research across system areas
* [Building an internal agent: Subagent support](https://lethain.com/agents-subagents/) - Will Larson on YAML-configured subagents with virtual file isolation and code-driven LLM invocation
* [Cursor: Scaling long-running autonomous coding](https://cursor.com/blog/scaling-agents) - Hierarchical spawning with hundreds of concurrent agents validated in production

[Source](https://www.nibzard.com/ampcode)
