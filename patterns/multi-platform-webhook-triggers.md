---
title: Multi-Platform Webhook Triggers
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Will Larson (lethain.com)"]
category: Tool Use & Environment
source: "https://lethain.com/agents-triggers/"
tags: [webhooks, triggers, integrations, slack, notion, jira, scheduled-events, event-driven]
---

## Problem

An internal agent only provides value when its workflows are initiated. Building out a library of workflow initialization mechanisms (triggers) is core to agent adoption. Without easy triggers, employees can't effectively automate their day-to-day workflows.

## Solution

Implement **multi-platform webhook triggers** that allow external SaaS tools to initiate agent workflows automatically.

**Trigger types implemented:**

1. **Notion webhooks**: Fire on page/database modifications
   - Document status changes (draft → "ready for review")
   - Request for Comment (RFC) workflows
   - Auto-assign reviewers based on topic
   - In-line commenting with suggestions

2. **Slack messages**: Bot responds in channels
   - Public channel responses
   - Private channel support (with careful logging)
   - Channel creation triggers for auto-joining
   - Default prompts for new channels (respond only when mentioned)

3. **Jira webhooks**: Issue lifecycle events
   - Issue creation, updates, comments
   - Custom routing logic for ticket assignment

4. **Slack reacji (emoji reactions)**: Quick workflow initiation
   - Listen for specific emojis in any channel
   - Example: `:jira:` reaction turns thread into ticket
   - Centralized routing instructions

5. **Scheduled events**: Periodic triggers
   - Slack workflows publishing to channels
   - GitHub Actions cron jobs

```pseudo
# Trigger flow
Platform Event → Webhook → Agent Trigger → Workflow Execution
```

## How to use it

**Implementation considerations:**

**Authentication and authorization:**
- OAuth2 tokens + SSL where possible
- Platform-specific security (Slack request verification)
- No authorization tokens for platforms that don't support it

**Private channel security:**
```yaml
slack_private_channels:
  auto_join: false  # Don't auto-join private channels
  logging:
    # Critical: Don't log evidence of private channel activity
    exclude_private_channels: true
    # Exfiltrating private messages loses trust instantly
```

**Trigger configuration:**

```yaml
# Notion triggers
notion_triggers:
  - database: "RFC Database"
    event: "page_updated"
    filter: "status.draft → status.ready_for_review"
    workflow: "assign_reviewers"

  - database: "Documentation"
    event: "page_created"
    workflow: "suggest_improvements"

# Slack reacji triggers
slack_reacji:
  - emoji: ":jira:"
    scope: "any_channel"
    workflow: "thread_to_ticket"
    routing: "centralized"

# Scheduled triggers
scheduled_triggers:
  - cron: "0 9 * * MON"
    workflow: "weekly_standup_prep"
    via: "github_actions"
```

**Why not Zapier/n8n?**

The author chose custom implementation over existing automation platforms:

- **Full control**: Quality details facilitate adoption better than generic integration constraints
- **Nuanced behavior**: Custom handling of entity resolution, error cases
- **Learning**: Building internal intuition about agents
- **Compatibility**: Can still use Zapier via generic webhook catch-all

**Generic webhook catch-all:**

```yaml
# Fallback for esoteric platforms
generic_webhook:
  endpoint: "/webhooks/generic"
  behavior: "include_full_message_in_context"
  integration: "can_pair_with_zapier"
```

## Trade-offs

**Pros:**

- **Low friction**: Easy workflow initiation enables iterative learning
- **Platform-native**: Users work in existing tools (Slack, Notion, Jira)
- **Reactive**: Agent responds to events, not just explicit requests
- **Flexible**: Support for custom routing and nuanced workflows
- **Scalable**: Easy to add new trigger types by pasting docs to LLM

**Cons:**

- **Maintenance overhead**: Each platform integration requires ongoing work
- **Security complexity**: Private channels, auth tokens, request verification
- **Platform lock-in**: Deep integration with specific tools
- **Observability challenges**: Must avoid logging sensitive data
- **Custom vs off-the-shelf**: Building vs buying (Zapier, n8n)

**Quality details matter:**

> "The quality details facilitate adoption in a way that Zapier integration's constraints simply do not."

Custom implementation allows nuances like:

- Slack entity resolution for seamless experience
- Careful logging behavior in private channels
- Centralized ticket routing logic

**When to use:**

- Internal agent platforms with multiple integration points
- Teams already using Slack, Notion, Jira extensively
- Document-heavy workflows (RFCs, reviews, approvals)
- Need for automated routing and triage

**When to use Zapier/n8n instead:**

- Esoteric one-off integrations
- Rapid prototyping before custom implementation
- Non-technical users who need self-service

## References

* [Building an internal agent: Triggers](https://lethain.com/agents-triggers/) - Will Larson (2025)
* Related: [Proactive Trigger Vocabulary](proactive-trigger-vocabulary.md) - Natural language trigger phrases for skill routing
