---
title: "Context Window Auto-Compaction"
status: "validated-in-production"
authors: ["Clawdbot Contributors"]
based_on: ["Clawdbot Implementation (https://github.com/clawdbot/clawdbot)", "Pi Coding Agent (@mariozechner/pi-coding-agent)", "Michael Bolin (OpenAI Codex)"]
category: "Context & Memory"
source: "https://github.com/clawdbot/clawdbot/blob/main/src/agents/pi-embedded-runner/compact.ts"
tags: [context-management, compaction, overflow-recovery, token-estimation, transcript-validation, api-compaction]
---

## Problem

Context overflow is a silent killer of agent reliability. When accumulated conversation history exceeds the model's context window:

- **API errors**: Requests fail with `context_length_exceeded` or similar errors
- **Manual intervention**: Operators must truncate transcripts, losing valuable context
- **Retry complexity**: Detecting overflow and retrying with compaction is error-prone

Agents need automatic compaction that preserves essential information while staying within token limits, with model-specific validation and reserve token floors to prevent immediate re-overflow.

## Solution

Automatic session compaction triggered by context overflow errors, with smart reserve tokens and lane-aware retry. The system detects overflow, compacts the session transcript, validates the result, and retries the request—all transparently to the user.

**Core concepts:**

- **Overflow detection**: Catches API errors indicating context length exceeded (`context_length_exceeded`, `prompt is too long`, etc.).
- **Auto-retry with compaction**: On overflow, the session is compacted and the request is retried automatically.
- **Reserve token floor**: Post-compaction, ensures a minimum number of tokens (default 20k) remain available to prevent immediate re-overflow.
- **Lane-aware compaction**: Uses hierarchical lane queuing (session → global) to prevent deadlocks during compaction.
- **Post-compaction verification**: Estimates token count after compaction and verifies it's less than the pre-compaction count.
- **Model-specific validation**: Anthropic models require strict turn ordering; Gemini models have different transcript requirements.

**Implementation sketch:**

```typescript
async function compactEmbeddedPiSession(params: {
  sessionFile: string;
  config?: Config;
}): Promise<CompactResult> {
  // 1. Load session and configure reserve tokens
  const sessionManager = SessionManager.open(params.sessionFile);
  const settingsManager = SettingsManager.create(workspaceDir, agentDir);

  // Ensure minimum reserve tokens (default 20k)
  ensurePiCompactionReserveTokens({
    settingsManager,
    minReserveTokens: resolveCompactionReserveTokensFloor(params.config),
  });

  // 2. Sanitize session history for model API
  const prior = sanitizeSessionHistory({
    messages: session.messages,
    modelApi: model.api,
    modelId,
    provider,
    sessionManager,
  });

  // 3. Model-specific validation
  const validated = provider === "anthropic"
    ? validateAnthropicTurns(prior)
    : validateGeminiTurns(prior);

  // 4. Compact the session
  const result = await session.compact(customInstructions);

  // 5. Estimate tokens after compaction
  let tokensAfter: number | undefined;
  try {
    tokensAfter = 0;
    for (const message of session.messages) {
      tokensAfter += estimateTokens(message);
    }
    // Sanity check: tokensAfter should be less than tokensBefore
    if (tokensAfter > result.tokensBefore) {
      tokensAfter = undefined;  // Don't trust the estimate
    }
  } catch {
    tokensAfter = undefined;
  }

  return {
    ok: true,
    compacted: true,
    result: {
      summary: result.summary,
      tokensBefore: result.tokensBefore,
      tokensAfter,
    },
  };
}
```

**Reserve token enforcement:**

```typescript
const DEFAULT_PI_COMPACTION_RESERVE_TOKENS_FLOOR = 20_000;

function ensurePiCompactionReserveTokens(params: {
  settingsManager: SettingsManager;
  minReserveTokens?: number;
}): { didOverride: boolean; reserveTokens: number } {
  const minReserveTokens = params.minReserveTokens ?? DEFAULT_PI_COMPACTION_RESERVE_TOKENS_FLOOR;
  const current = params.settingsManager.getCompactionReserveTokens();

  if (current >= minReserveTokens) {
    return { didOverride: false, reserveTokens: current };
  }

  // Override to ensure minimum floor
  params.settingsManager.applyOverrides({
    compaction: { reserveTokens: minReserveTokens },
  });

  return { didOverride: true, reserveTokens: minReserveTokens };
}
```

**API-based compaction (OpenAI Responses API):**

Some providers offer dedicated compaction endpoints that are more efficient than manual summarization:

```typescript
// OpenAI's /responses/compact endpoint
const compacted = await responsesAPI.compact({
  messages: currentMessages,
});

// Returns a list of items that includes:
// - A special type=compaction item with encrypted_content
//   that preserves the model's latent understanding
// - Condensed conversation items

currentMessages = compacted.items;
```

This approach has advantages:
- **Preserves latent understanding**: The `encrypted_content` maintains the model's compressed representation of the original conversation
- **More efficient**: Server-side compaction is faster than client-side summarization
- **Auto-compaction**: Can trigger automatically when `auto_compact_limit` is exceeded

**Lane-aware retry to prevent deadlocks:**

```typescript
// Compaction runs through session lane, then global lane
async function compactEmbeddedPiSession(params: CompactParams): Promise<CompactResult> {
  const sessionLane = resolveSessionLane(params.sessionKey);
  const globalLane = resolveGlobalLane(params.lane);

  return enqueueCommandInLane(sessionLane, () =>
    enqueueCommandInLane(globalLane, () =>
      compactEmbeddedPiSessionDirect(params)  // Core compaction logic
    )
  );
}
```

## How to use it

1. **Configure reserve floor**: Set `compaction.reserveTokensFloor` to ensure headroom after compaction (default 20k).
2. **Handle overflow errors**: Catch API errors, detect overflow via error message matching, then trigger compaction.
3. **Validate transcripts**: Apply model-specific validation (Anthropic turns, Gemini ordering) before retry.
4. **Estimate post-compaction tokens**: Verify that compaction actually reduced token count before retrying.
5. **Use lane queuing**: Run compaction through hierarchical lanes to avoid deadlocks with concurrent operations.

**Pitfalls to avoid:**

- **Aggressive floor setting**: Reserve tokens too high may leave insufficient room for actual conversation content.
- **Missing model validation**: Skipping model-specific transcript validation can cause API errors on retry.
- **Token estimation drift**: Estimation heuristics may diverge from actual token counts; treat estimates as sanity checks only.
- **Infinite compaction loops**: If compaction fails to reduce tokens, avoid infinite retry loops. Max out at 1-2 attempts.

## Trade-offs

**Pros:**

- **Transparent recovery**: Overflow errors are handled automatically without user intervention.
- **Preserve essential context**: Compaction generates summaries rather than arbitrary truncation.
- **Prevents re-overflow**: Reserve token floor ensures immediate re-overflow is unlikely.
- **Model-aware**: Different validation rules per provider ensure API compatibility.

**Cons/Considerations:**

- **Summary quality**: Auto-generated summaries may lose nuanced details that manual curation would preserve.
- **Latency penalty**: Compaction and retry adds overhead (seconds to minutes depending on context size).
- **Token estimation errors**: Heuristics may misestimate actual token counts, leading to failed retries.
- **Complexity**: Lane-aware queuing and model-specific validation increase implementation complexity.

## References

- [Clawdbot compact.ts](https://github.com/clawdbot/clawdbot/blob/main/src/agents/pi-embedded-runner/compact.ts) - Compaction orchestration
- [Clawdbot pi-settings.ts](https://github.com/clawdbot/clawdbot/blob/main/src/agents/pi-settings.ts) - Reserve token configuration
- [Clawdbot context-window-guard.ts](https://github.com/clawdbot/clawdbot/blob/main/src/agents/context-window-guard.ts) - Context evaluation
- [Pi Coding Agent SessionManager](https://github.com/mariozechner/pi-coding-agent) - Core compaction logic
- [Unrolling the Codex agent loop | OpenAI Blog](https://openai.com/index/unrolling-the-codex-agent-loop/) - API-based `/responses/compact` endpoint approach
- Related: [Context Window Anxiety Management](/patterns/context-window-anxiety-management) for proactive management
- Related: [Prompt Caching via Exact Prefix Preservation](/patterns/prompt-caching-via-exact-prefix-preservation)
