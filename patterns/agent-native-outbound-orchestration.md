---
title: Agent-Native Outbound Orchestration
status: proposed
authors: ["Nicolas Finet"]
based_on: ["Overloop CLI"]
category: Tool Use & Environment
source: "https://github.com/sortlist/overloop-cli"
tags: [cli, outbound, sales-automation, json-output, agent-native, composability]
slug: agent-native-outbound-orchestration
id: agent-native-outbound-orchestration
summary: >-
  Wrap outbound sales workflows (prospect sourcing, campaign creation, reply
  handling) behind a CLI that emits structured JSON, so autonomous agents can
  orchestrate multi-step outreach without custom API glue.
---

## Problem

Outbound sales involves a chain of steps: source contacts, enrich data, build prospect lists, launch email and LinkedIn sequences, then monitor replies. Traditional SaaS platforms expose GUIs or REST APIs that require manual orchestration code, OAuth flows, and custom parsers. Agents that need to run outbound campaigns end up with brittle, one-off integrations.

## Solution

Expose the entire outbound pipeline as a **CLI with JSON output** that agents invoke via shell commands.

```bash
# Source prospects matching criteria
overloop contacts search --title "CTO" --industry "SaaS" --limit 50 --json

# Create and launch a campaign
overloop campaigns create --name "Q2 SaaS CTOs" --steps email,linkedin --json

# Check replies
overloop conversations list --status replied --json
```

**Key mechanisms:**

- **Structured JSON output**: Every command returns parseable JSON, so agents can pipe results into the next step without scraping HTML or parsing text.
- **Composability**: Each command handles one concern. Agents chain them: search contacts, pipe IDs into campaign enrollment, then poll conversations.
- **Stateless invocation**: No session management. The CLI authenticates via environment variables, making it safe for parallel agent workers.

## Example

```bash
# Agent pipeline: find prospects, enroll in campaign, monitor replies
PROSPECTS=$(overloop contacts search --title "VP Engineering" --location "US" --json)
CAMPAIGN_ID=$(overloop campaigns create --name "auto-q2" --json | jq -r '.id')
echo "$PROSPECTS" | jq -r '.[].id' | xargs -I{} overloop campaigns enroll --campaign "$CAMPAIGN_ID" --contact {}
overloop conversations list --campaign "$CAMPAIGN_ID" --status replied --json
```

## Trade-offs

- **Pros:** Fully scriptable, no API glue code, works in any agent framework that can shell out, structured output eliminates parsing errors.
- **Cons:** Requires CLI installation and API key setup; rate limits apply; not suited for real-time chat-based workflows.

**When NOT to use:** One-off manual outreach; campaigns requiring complex visual template builders; scenarios where a GUI approval workflow is mandatory.

## How to use it

- Install the CLI: `npm i -g overloop-cli`
- Set API credentials via environment variables
- Start with a single command (contact search) before chaining full campaign workflows
- Use JSON output with `jq` or agent-native JSON parsing for downstream steps

## References

- Primary source: https://github.com/sortlist/overloop-cli
- Landing: https://agent.overloop.ai
- Related pattern: [CLI-Native Agent Orchestration](cli-native-agent-orchestration.md)
