# Pattern Index

Quick reference for all 105+ patterns in the repository for semantic matching.

## Category Summary

| Category | Count | Key Themes |
|----------|-------|------------|
| Orchestration & Control | 32 | Task decomposition, sub-agents, tool routing |
| Tool Use & Environment | 20 | Shell, browser, DB, sandbox tools |
| UX & Collaboration | 16 | Prompts, hand-offs, staged commits |
| Context & Memory | 14 | Window curation, vector cache, episodic memory |
| Feedback Loops | 12 | CI, review, self-healing |
| Reliability & Eval | 10 | Guardrails, evals, logging |
| Security & Safety | 3 | Isolation, PII, scanning |
| Learning & Adaptation | 3 | Agent RFT, skill libraries |

## Common Tags (appear 4+ times)

- tool-use, security, search, reinforcement-learning, reasoning
- feedback, prompt-injection, planning, mcp, learning, evaluation
- coding-agent, code-review, cli, automation

## Pattern Clusters (for Matching)

### Context Management Patterns
- `context-minimization-pattern.md`
- `context-window-anxiety-management.md`
- `curated-code-context-window.md`
- `layered-configuration-context.md`
- `agentic-search-over-vector-embeddings.md`

### Planning Patterns
- `plan-then-execute-pattern.md`
- `explicit-posterior-sampling-planner.md`
- `tree-of-thought-reasoning.md`

### Multi-Agent Patterns
- `oracle-and-worker-multi-model.md`
- `initializer-maintainer-dual-agent.md`
- `sub-agent-spawning.md`
- `continuous-autonomous-task-loop-pattern.md`

### Memory/State Patterns
- `episodic-memory-retrieval-injection.md`
- `filesystem-based-agent-state.md`
- `proactive-agent-state-externalization.md`

### Security Patterns
- `action-selector-pattern.md`
- `egress-lockdown-no-exfiltration-channel.md`
- `pii-tokenization.md`

### Code Review Patterns
- `criticgpt-style-evaluation.md`
- `ai-assisted-code-review-verification.md`
- `abstracted-code-representation-for-review.md`

### Progressive Autonomy Chain
- `progressive-autonomy-with-model-evolution.md`
- `progressive-complexity-escalation.md`
- `skill-library-evolution.md`

### Tool Design Patterns
- `dual-use-tool-design.md`
- `tool-use-steering-via-prompting.md`
- `tool-use-incentivization-via-reward-shaping.md`

## Top Pattern Sources

| Source | Patterns |
|--------|----------|
| Will Brown (Prime Intellect) | 8 patterns |
| Boris Cherny (Anthropic) | 7 patterns |
| Anthropic Engineering | 7 patterns |
| Luca Beurer-Kellner et al. (2025) | 6 patterns |
| Aman Sanger (Cursor) | 6 patterns |
| Thorsten Ball | 5 patterns |
| Quinn Slack | 5 patterns |
| Lukas Möller (Cursor) | 5 patterns |

## Matching Heuristics

When analyzing a new source:

1. **Check by author** - If source is from Will Brown, Boris Cherny, etc., likely matches existing pattern
2. **Check by category** - Context management has 14 patterns with high overlap
3. **Check by tags** - "tool-use", "security", "reasoning" indicate clusters
4. **Problem similarity** - Same core challenge → likely existing pattern
5. **Solution similarity** - Same mechanism → likely existing pattern

## Decision Thresholds

- **>80% confidence** - Update existing (same problem + solution + category)
- **50-80% confidence** - Ask user (partial overlap)
- **<50% confidence** - Create new (different problem/solution)
