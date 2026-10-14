---
title: Signal-Driven Agent Activation
status: emerging
authors:
  - Nicolas Finet (@nifinet)
based_on:
  - Will Larson (lethain.com)
category: Orchestration & Control
source: https://lethain.com/agents-triggers/
tags:
  - signals
  - event-driven
  - automation
  - orchestration
  - reactive
summary: "Watches external sources for structured signals and starts predefined agent workflows when declarative rules with thresholds and cooldowns match"
signals: ["The right time to act depends on external events such as failed deploys or new CVEs", "Signal volume is too high for human triage", "Structured signal sources and clear activation thresholds exist"]
anti_signals: ["Signals are noisy with many false positives", "No cooldowns, rate limits, or kill switch to stop runaway activation"]
updated_at: "2026-10-13"
---

# Signal-Driven Agent Activation

## Problem

Most agent workflows are **command-driven**: a user types a prompt, the agent acts. This creates a bottleneck — the agent only works when someone tells it to.

In domains like sales, security, DevOps, and finance, the right moment to act is determined by **external signals** (a prospect visits a pricing page, a CVE drops, a deployment fails, a stock hits a threshold). By the time a human notices and prompts the agent, the window has often closed.

Polling dashboards or relying on human triage doesn't scale. The agent needs a mechanism to **watch for signals and self-activate** when conditions are met.

## Solution

Decouple agent activation from user commands by introducing a **signal layer** between external data sources and agent workflows.

The pattern has three components:

### 1. Signal Collector

A background process that monitors external sources and emits structured events:

```bash
# Generic signal collector outputting JSON events
$ signal-watch --source webhook --filter "event=page_visit AND page=/pricing" \
  | jq '{type: "intent", source: "web", entity: .visitor_id, score: .engagement}'

{"type":"intent","source":"web","entity":"acme-corp","score":82}
```

Signal sources can be webhooks, RSS feeds, API polling, log tails, or message queues. The collector normalizes them into a common event schema.

### 2. Activation Rules

A declarative rule set that maps signals to workflows:

```yaml
rules:
  - signal: intent
    condition: "score >= 70"
    action: enrich-and-engage
    cooldown: 24h

  - signal: anomaly
    condition: "severity == 'critical'"
    action: investigate-and-alert
    cooldown: 0

  - signal: drift
    condition: "delta > 0.05"
    action: retrain-pipeline
    cooldown: 7d
```

Rules include **cooldown periods** to prevent repeated activation on the same entity, and **condition filters** to set activation thresholds.

### 3. Workflow Dispatch

When a rule fires, the agent receives the signal payload as context and executes a predefined workflow:

```bash
# Agent receives signal context and acts autonomously
$ agent run enrich-and-engage \
    --context '{"entity":"acme-corp","score":82,"source":"web"}' \
    --output json

{"status":"completed","actions_taken":["enriched_profile","sent_email"],"entity":"acme-corp"}
```

The agent has full autonomy within the workflow scope but cannot exceed it — activation rules act as guardrails.

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   External   │────▶│   Signal     │────▶│  Activation   │
│   Sources    │     │  Collector   │     │    Rules      │
└─────────────┘     └──────────────┘     └───────┬───────┘
                                                  │
                                                  ▼
                                         ┌───────────────┐
                                         │    Agent       │
                                         │   Workflow     │
                                         └───────────────┘
```

## Evidence

- **Event-initiated agent workflows in production**: Will Larson's writeup of an internal agent (December 2025) documents triggers — Notion webhooks, Slack messages and reacji, Jira webhooks, and scheduled events — as the mechanism that starts agent workflows, and argues teams should maintain a library of easy-to-create triggers.
- **Event-driven architectures** are well-established in distributed systems (AWS EventBridge, Kafka). This pattern applies the same principle to agent activation.
- **Security orchestration (SOAR)** platforms like Splunk SOAR and Palo Alto XSOAR use signal-driven playbook activation as their core mechanism.
- **Sales engagement platforms** increasingly use intent signals (6sense, Bombora) to trigger automated sequences, validating the signal-to-action pipeline in production.

## How to use it

**Start with one signal source and one workflow.** Example use cases:

- **DevOps**: Monitor deployment logs → detect anomalies → trigger rollback investigation
- **Security**: Watch CVE feeds → match against dependency list → open remediation PRs
- **Sales**: Track intent signals → enrich matching accounts → initiate outreach
- **Finance**: Monitor price feeds → detect threshold crossings → execute hedging strategy

**Prerequisites:**
- A CLI-first skill set (see: CLI-First Skill Design)
- At least one structured signal source
- Defined activation thresholds per signal type

**Key considerations:**
- Start with high-confidence signals (low false-positive rate) to build trust
- Log every activation with signal context for auditability
- Set conservative cooldowns initially — tighten as you validate
- Implement a kill switch to pause all signal-driven activation

**Related patterns:**

- [Multi-Platform Webhook Triggers](multi-platform-webhook-triggers.md) covers building the trigger integrations themselves — Slack, Notion, and Jira webhooks, plus idempotency and signature checks. This pattern sits one level above: the declarative rule layer (thresholds, cooldowns, kill switch) that decides when a signal starts a workflow.
- [Proactive Trigger Vocabulary](proactive-trigger-vocabulary.md) routes user input to skills by matching documented trigger phrases. This pattern instead activates workflows from external events, with no user input involved.

## Trade-offs

**Advantages:**
- Agents act at the right moment without human triage
- Scales to signal volumes no human team can monitor
- Composable — new signal sources and workflows plug in independently
- Auditable — every action traces back to a specific signal event

**Drawbacks:**
- False positives trigger unnecessary workflows (noisy signals waste resources)
- Requires upfront investment in signal normalization
- Debugging chains (signal → rule → workflow) is harder than debugging direct commands
- Risk of runaway activation if cooldowns and rate limits aren't enforced
- Cold-start problem: rules need tuning before they're useful

## References

- [Triggers for Agents — Will Larson, Irrational Exuberance (December 2025)](https://lethain.com/agents-triggers/) — primary source. Documents event-initiated triggers (webhooks, Slack messages and reacji, scheduled events) for starting agent workflows in a production internal agent. It covers trigger mechanics and adoption, not the declarative threshold/cooldown rule layer described here.
- [Event-Driven Architecture (Martin Fowler)](https://martinfowler.com/articles/201701-event-driven.html)
- [SOAR Playbook Activation (Gartner)](https://www.gartner.com/en/information-technology/glossary/security-orchestration-automation-response-soar)
- [CLI-First Skill Design (this catalogue)](cli-first-skill-design.md)
- [CLI-Native Agent Orchestration (this catalogue)](cli-native-agent-orchestration.md)
