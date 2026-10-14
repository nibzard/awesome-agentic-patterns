---
title: "Context Window Auto-Compaction"
status: "validated-in-production"
authors: ["OpenClaw Contributors"]
based_on: ["OpenClaw, formerly Clawdbot (https://github.com/openclaw/openclaw)", "Pi coding agent (https://github.com/earendil-works/pi)", "Michael Bolin (OpenAI Codex)"]
category: "Context & Memory"
source: "https://github.com/openclaw/openclaw/blob/main/src/agents/embedded-agent-runner/compact.ts"
tags: [context-management, compaction, overflow-recovery, token-estimation, transcript-validation, api-compaction]
summary: "Catches context overflow errors, compacts and validates the transcript with capped reserve headroom, and retries the request automatically"
signals: ["Long sessions fail with context_length_exceeded errors", "Operators truncate transcripts by hand", "Agent supports multiple model providers with different transcript rules"]
anti_signals: ["Short sessions that never approach the context limit", "Summary detail loss is not acceptable and manual curation is required"]
updated_at: "2026-10-13"
---

## Problem

Context overflow is a silent killer of agent reliability. When accumulated conversation history exceeds the model's context window:

- **API errors**: Requests fail with `context_length_exceeded` or similar errors
- **Manual intervention**: Operators must truncate transcripts, losing valuable context
- **Retry complexity**: Detecting overflow and retrying with compaction is error-prone

Agents need automatic compaction that preserves essential information while staying within token limits, with model-specific validation and capped reserve headroom to prevent immediate re-overflow.

## Solution

Automatic session compaction triggered by context overflow errors, with smart reserve tokens and lane-aware retry. The system detects overflow, compacts the session transcript, validates the result, and retries the request—all transparently to the user.

**Core concepts:**

- **Overflow detection**: Catches API errors indicating context length exceeded (`context_length_exceeded`, `prompt is too long`, etc.).
- **Auto-retry with compaction**: On overflow, the session is compacted and the request is retried automatically.
- **Reserve headroom cap**: Post-compaction reserve tokens are capped at 25% of the context budget, so prompts retain at least three quarters of the model window.
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

  // Cap reserve tokens at 25% of the context budget
  const reserveTokens = resolveEffectiveCompactionReserveTokens({
    contextTokenBudget: resolveContextTokenBudget(params.config),
    reserveTokens: settingsManager.getCompactionReserveTokens(),
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

**Reserve headroom and attempt budget:**

```typescript
// Reserve summary/housekeeping headroom without letting it
// dominate small model windows.
const MAX_COMPACTION_RESERVE_RATIO = 0.25;

/** Caps compaction headroom so prompts retain at least three quarters of the model window. */
function resolveEffectiveCompactionReserveTokens(params: {
  contextTokenBudget: number;
  reserveTokens: number;
}): number {
  const contextTokenBudget = Math.max(1, Math.floor(params.contextTokenBudget));
  return Math.min(
    Math.max(0, Math.floor(params.reserveTokens)),
    Math.floor(contextTokenBudget * MAX_COMPACTION_RESERVE_RATIO),
  );
}

// Overflow-triggered compaction retries stop after this many attempts.
export const MAX_OVERFLOW_COMPACTION_ATTEMPTS = 3;
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

**Two complementary approaches:**

This pattern describes **reactive compaction** (detect overflow, compact, retry). An alternative approach is **preventive filtering** (reduce context at ingestion), used by systems like HyperAgent for browser accessibility tree extraction. Preventive filtering can delay or eliminate the need for reactive compaction by keeping context leaner from the start.

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

## Evidence

- **Evidence Grade:** `high` (documented production implementations)
- **Key Findings:**
  - OpenAI documents server-side compaction for Codex through the `/responses/compact` design (September 2026): a `compaction` item with `encrypted_content` preserves the model's compressed representation of the conversation, and `auto_compact_limit` triggers compaction automatically
  - OpenClaw implements reactive, client-side compaction: overflow detection, a reserve cap of 25% of the context budget, and at most 3 overflow compaction attempts
  - The Pi coding agent (earendil-works/pi) supplies the embedded session compaction core that OpenClaw's runner builds on
  - Beurer-Kellner et al. (2025) catalog context minimization as a complementary defense that removes untrusted content from context; they report no quantitative token-reduction figure
- **Unverified:** Whether other commercial products (Cursor, GitHub Copilot) publish their compaction strategies

## How to use it

1. **Configure reserve headroom**: Set compaction reserve tokens, and cap them at a fraction of the context budget (OpenClaw uses 25%) so headroom cannot crowd out the prompt.
2. **Handle overflow errors**: Catch API errors, detect overflow via error message matching, then trigger compaction.
3. **Validate transcripts**: Apply model-specific validation (Anthropic turns, Gemini ordering) before retry.
4. **Estimate post-compaction tokens**: Verify that compaction actually reduced token count before retrying.
5. **Use lane queuing**: Run compaction through hierarchical lanes to avoid deadlocks with concurrent operations.

**Pitfalls to avoid:**

- **Aggressive floor setting**: Reserve tokens too high may leave insufficient room for actual conversation content.
- **Missing model validation**: Skipping model-specific transcript validation can cause API errors on retry.
- **Token estimation drift**: Estimation heuristics may diverge from actual token counts; treat estimates as sanity checks only.
- **Infinite compaction loops**: If compaction fails to reduce tokens, avoid infinite retry loops. OpenClaw caps overflow compaction at 3 attempts.

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

- [OpenClaw compact.ts](https://github.com/openclaw/openclaw/blob/main/src/agents/embedded-agent-runner/compact.ts) - Compaction orchestration
- [OpenClaw agent-compaction-constants.ts](https://github.com/openclaw/openclaw/blob/main/src/agents/agent-compaction-constants.ts) - Reserve ratio cap and overflow attempt limit
- [OpenClaw context-window-guard.ts](https://github.com/openclaw/openclaw/blob/main/src/agents/context-window-guard.ts) - Context evaluation
- [Pi coding agent](https://github.com/earendil-works/pi) - Embedded session compaction core; formerly `mariozechner/pi-coding-agent`, now the earendil-works/pi monorepo
- [Unrolling the Codex agent loop | OpenAI Blog](https://openai.com/index/unrolling-the-codex-agent-loop/) - API-based `/responses/compact` endpoint approach
- Beurer-Kellner et al. (2025). "Design Patterns for Securing LLM Agents against Prompt Injections." [arXiv:2506.08837](https://arxiv.org/abs/2506.08837) - Context minimization as a complementary defense
- Related: [Context Window Anxiety Management](/patterns/context-window-anxiety-management) for proactive management
- Related: [Prompt Caching via Exact Prefix Preservation](/patterns/prompt-caching-via-exact-prefix-preservation)
