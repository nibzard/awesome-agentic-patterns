---
title: Intent Signal Pipeline
status: proposed
authors: ["Nicolas Finet"]
based_on: ["Signals CLI"]
category: Tool Use & Environment
source: "https://github.com/sortlist/signals-cli"
tags: [cli, signals, intent-detection, json-output, agent-pipeline, event-driven]
slug: intent-signal-pipeline
id: intent-signal-pipeline
summary: >-
  Monitor external intent signals (LinkedIn engagements, job changes, funding
  events, keyword posts) via a CLI that emits structured JSON events, enabling
  agents to trigger downstream actions based on real-time buying signals.
---

## Problem

Autonomous sales and marketing agents need to act on real-world signals: a prospect liked a competitor's post, changed jobs, or their company raised funding. These signals are scattered across platforms (LinkedIn, news feeds, job boards) and require custom scrapers, API integrations, and event normalization. Without a unified signal layer, agents either miss triggers or drown in unstructured data.

## Solution

Expose signal monitoring as a **CLI that outputs structured JSON events**, which agents consume to trigger downstream workflows.

```bash
# Monitor LinkedIn engagers on a competitor's post
signals linkedin-engagers --post-url "https://linkedin.com/..." --json

# Track keyword posters in a topic
signals keyword-posters --keywords "AI automation" --json

# Detect job changers in target accounts
signals job-changers --companies "Acme,Globex" --json

# Monitor funding events
signals funding --industry "SaaS" --min-amount 5000000 --json
```

**Key mechanisms:**

- **Structured event output**: Each signal is a JSON object with contact info, signal type, timestamp, and confidence score. Agents parse these without custom extraction logic.
- **Composability with outbound tools**: Pipe signal output into campaign enrollment commands. When a prospect triggers a signal, the agent can auto-enroll them in a relevant sequence.
- **Polling or streaming**: CLI supports both one-shot queries and watch mode for continuous monitoring.

## Example

```bash
# Agent loop: watch for funding signals, auto-enrich and enroll
signals funding --industry "SaaS" --min-amount 1000000 --json | while read -r event; do
  CONTACT_ID=$(echo "$event" | jq -r '.contact_id')
  SIGNAL_TYPE=$(echo "$event" | jq -r '.signal_type')
  # Enroll in campaign matching the signal type
  overloop campaigns enroll --campaign "funded-${SIGNAL_TYPE}" --contact "$CONTACT_ID"
done
```

## Trade-offs

- **Pros:** Decouples signal detection from action logic, structured output feeds any downstream tool, agents can combine multiple signal types for scoring.
- **Cons:** Signal freshness depends on polling frequency; some platforms rate-limit scraping; false positives require confidence thresholds.

**When NOT to use:** Scenarios requiring sub-second real-time signals; platforms with strict anti-scraping enforcement; cases where manual signal review is preferred over automation.

## How to use it

- Install: `npm i -g signals-sortlist-cli`
- Configure target accounts, keywords, or post URLs
- Start with one signal type (e.g., job changers) and validate accuracy before expanding
- Pipe JSON output into scoring logic or outbound enrollment

## References

- Primary source: https://github.com/sortlist/signals-cli
- Related pattern: [Agent-Native Outbound Orchestration](agent-native-outbound-orchestration.md)
- Related pattern: [CLI-First Skill Design](cli-first-skill-design.md)
