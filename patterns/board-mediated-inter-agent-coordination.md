---
title: Board-Mediated Async Inter-Agent Coordination
status: validated-in-production
authors:
  - James Farley (@AgileSmagile)
category: Orchestration & Control
source: https://github.com/AgileSmagile/smagile-agentic-kanban-blueprint
tags:
  - multi-agent
  - coordination
  - async
  - kanban
  - board
  - message-routing
  - inbox
  - session-continuity
  - audit-trail
summary: >-
  Route messages between agents through board card comment threads.  A
  routing prefix triggers inbox card creation for notification; the actual
  coordination dialogue happens on the work card itself, co-locating
  decision context with the work that generated it.
related:
  - kanban-board-as-agent-memory
  - cross-cycle-consensus-relay
  - memory-synthesis-from-execution-logs
complexity: medium
effort: days
impact: high
---

## Problem

Agents running in separate sessions cannot communicate without a human routing messages between them.  Shared context windows do not survive session boundaries.  The standard workarounds -- a human copy-pasting between terminals, shared files, or a dedicated message queue -- all have failure modes: human bottleneck, no delivery guarantee, or a coordination system that is decoupled from the work being coordinated.

The coordination problem compounds when you want the exchange to be useful later.  A review comment posted in a Slack thread disappears from the work record.  A decision made in a separate file has no connection to the card that required it.  The work and the context that shaped it are separated.

## Solution

Use the **Kanban board's card comment thread as the primary coordination channel** between agents.  Coordination happens on the card where the work lives, not in a separate system.

The mechanism has two layers:

**Routing convention (the signal layer):**  When Agent A needs Agent B's input, it posts a comment on the relevant card with Agent B's prefix in square brackets: `[quality-guardian]`.  This is a lightweight convention, not a protocol.  It requires no infrastructure to write; it requires only a scanner to detect.

**Inbox card (the notification layer):**  A handler detects the `[prefix]` token in new comments and creates a transient inbox card in a dedicated inbox column, addressed to the target agent.  The inbox card contains the source card ID and the first 80 characters of the comment -- enough context to know where to look, not a full message.  The target agent polls the inbox column on a schedule and, when it sees a card addressed to it, navigates to the source card to read the full thread.

The actual exchange happens on the source card.  Agent B reads the full comment thread, posts its response on the same card (using Agent A's prefix as an acknowledgement signal), and the handler closes the loop.  The inbox card is closed after processing.

```mermaid
sequenceDiagram
    participant A as Agent A
    participant Board as Kanban Board
    participant Handler as Event Handler
    participant B as Agent B

    A->>Board: Post [agent-b] comment on card #42
    Board->>Handler: Comment event fires (business rule or poll)
    Handler->>Board: Create inbox card: "[agent-b] #42 — ..."
    B->>Board: Poll inbox column (next scheduled check)
    B->>Board: Read card #42 full comment thread
    B->>Board: Post [agent-a] response on card #42
    Handler->>Board: Create return inbox card for Agent A
    A->>Board: Read response on card #42
    Board->>Board: Inbox cards closed; card #42 retains full thread
```

**Why coordination belongs on the work card:**  The comment thread becomes the audit trail.  A review, a clarifying question, a decision to change approach -- these are work events, not side conversations.  Co-locating them with the card means a future agent reading the card history sees not just what was done but why, and what debate preceded the decision.  The single source of truth gets richer with every exchange.

**Dialogue mode (`/watch-card`):**  For synchronous-style exchanges where Agent A needs a response before continuing, it enters active wait after posting.  It checks its inbox at a set interval (typically 10 minutes) for up to 6 attempts.  If a response arrives, it continues.  If no response arrives within the hour, the card is automatically blocked with a comment for the human.  The agent does not sit idle during the wait; it continues work on other cards.

**Cascade prevention:**  Agent responses use a modified prefix format (`[notification/Agent-X]`) that contains a slash.  The detection regex (`/\[([A-Za-z][A-Za-z0-9-]*)\]/`) does not match tokens containing slashes.  Responses do not trigger new inbox cards; only new requests do.

## How to use it

**Prerequisites:**

- A Kanban board with a REST API and a dedicated inbox column.  The inbox column sits outside the normal work columns and does not count against WIP limits.
- An event handler that scans new comments for `[prefix]` tokens and creates inbox cards.  The handler can be push-based (board business rule triggers on comment creation) or polling-based (a scheduled process scans active cards every 60-90 seconds).  Push is strongly preferred; polling works as a fallback.
- A unique routing prefix for each named agent (e.g., `quality-guardian`, `lead-agent`, `mosaic`).  Each prefix must be owned by exactly one agent.  Two agents sharing a prefix will both act on the same inbox card.

**Prefix ownership:**

```
Named delivery agents:   one per domain (one prefix each)
Coordination hubs:       one per scope (one prefix each)
Sandbox / ephemeral agents: no prefix, no inbox, no named coordination
```

Sandbox agents read and write to the board but do not receive inbox notifications.  They are cheap to spin up and do not need the coordination overhead.

**Posting a coordination request:**

```pseudo
# Agent A needs Agent B's input on card #42
board.comment(card_id=42, text="[agent-b] Can you review the rate-limiting approach here?")

# If Agent A needs the response before continuing (/watch-card mode):
for attempt in range(6):
    wait(10 minutes)
    inbox = board.get_inbox_cards(prefix="agent-a")
    if inbox:
        response = board.get_card(inbox[0].source_card_id)
        process(response.latest_comment)
        board.close(inbox[0])
        break
else:
    board.block(card_id=42, comment="[human] Waiting on agent-b response; auto-blocked after 1h")
```

**Polling intervals by role:**

| Role | Interval | Why |
|------|----------|-----|
| Project agents | 60 minutes | Planned delivery work; async lag is acceptable |
| Coordination hubs | 15 minutes | Cross-cutting concerns; faster response has system-wide value |
| Active wait (`/watch-card`) | 10 minutes | Dialogue mode; agent is waiting on a specific response |
| Distributed synchronous sessions | Under 5 minutes | Real-time-like collaboration around a single card |

**Initiative wakeup:**  When a planning initiative enters the active column, the handler extracts the prefix from the initiative title (e.g., `[mosaic] v2 rearchitecture`) and creates an inbox card automatically.  No comment required.  Name your initiatives with the responsible agent's prefix and strategic wakeup is free.

## Trade-offs

**Pros:**

- **Coordination context is co-located with work context.**  Decisions, reviews, and blockers are recorded on the card they relate to.  Future agents and humans see the full picture without a separate coordination log.
- **No shared context window required.**  Agents coordinate across separate sessions via the board.  No handoff document, no human relay.
- **The pattern survives infrastructure changes.**  The routing convention (`[prefix]`) and inbox column are stable; only the delivery mechanism (push vs poll) varies.  A team that starts with polling can upgrade to push without changing any agent behaviour.
- **Audit trail included.**  Every inter-agent exchange is recorded on the work card.  Post-session review, escalation, and pattern analysis are possible without additional tooling.
- **Scales to asynchronous collaboration.**  Agents with different session schedules coordinate naturally.  The board holds the message until the recipient is active.

**Cons:**

- **Latency.**  Push-based delivery (board business rule to event handler) produces inbox cards within seconds.  Polling-based delivery adds up to 90 seconds at the handler and up to 60 minutes at the agent's inbox poll.  For time-sensitive coordination, this is a real constraint.
- **Multiplicity requirement.**  Each prefix must map to exactly one active agent.  Running two instances of the same agent breaks routing.  This is a process discipline requirement, not a technical one.
- **Bootstrap gap.**  A comment posted at the exact moment a card enters a scanned column may be missed if the handler records the latest comment ID before processing.  Mitigation: process comments newer than a short time window (5 minutes) even on first scan.
- **Board tool dependency.**  Comment-event webhooks are not universally supported.  Businessmap supports them via business rules.  Trello and GitHub Projects do not.  Teams on unsupported tools fall back to polling, which works but adds latency.
- **Shell escaping edge cases.**  Passing comment text through shell arguments into a JSON payload fails on double-quoted strings containing parentheses or special characters.  Single-quoted strings and short comments are more reliable.

## References

- [Agentic Kanban Blueprint](https://github.com/AgileSmagile/smagile-agentic-kanban-blueprint) -- reference implementation including the Cloudflare Worker proxy, n8n handler, routing convention, polling fallback, and `/watch-card` protocol
- [AKB docs: agent-communication.md](https://github.com/AgileSmagile/smagile-agentic-kanban-blueprint/blob/main/docs/agent-communication.md) -- full implementation detail including failure modes, multiplicity rules, and initiative wakeup
