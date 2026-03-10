---
title: "Failover-Aware Model Fallback"
status: "validated-in-production"
authors: ["Clawdbot Contributors"]
based_on: ["Clawdbot Implementation (https://github.com/clawdbot/clawdbot)"]
category: "Reliability & Eval"
source: "https://github.com/clawdbot/clawdbot/blob/main/src/agents/model-fallback.ts"
tags: [fallback, reliability, error-classification, multi-model, failover, resilience]
---

## Problem

AI model requests fail for varied and often opaque reasons. Simple retry logic fails to distinguish between:

- **Transient failures** (timeouts, rate limits) that benefit from retry with backoff
- **Semantic failures** (auth errors, billing issues) where retry is futile
- **User aborts** where retry wastes resources and frustrates users

Agents using multiple models or providers need intelligent fallback strategies that respect failure semantics, avoid retry loops, and provide clear diagnostics.

## Solution

Semantic error classification with intelligent fallback chains. Each failure is categorized into a specific reason type, and fallback behavior is tailored to that reason. Multi-model fallback chains are configured per-request, with provider-specific allowlists and cooldown tracking.

**Core concepts:**

- **Error classification**: Failures are mapped to semantic reason types (`timeout`, `rate_limit`, `auth`, `billing`, `format`, `context_overflow`).
- **Reason-aware fallback**: Different reasons trigger different fallback behaviors:
  - `timeout`, `rate_limit`: Retry with next model in chain
  - `auth`, `billing`: Fail immediately; retry won't help
  - `format`, `context_overflow`: May retry with adjusted request
- **User abort detection**: Distinguishes user-initiated aborts from timeout-induced aborts. User aborts rethrow immediately; timeouts trigger fallback.
- **Multi-model chains**: Ordered list of `{provider, model}` candidates. Each attempt uses the next candidate until success or exhaustion.
- **Provider allowlists**: Optional per-provider model restrictions prevent fallback to incompatible models.
- **Diagnostics tracking**: Each failed attempt is recorded with error details, reason, status code, and provider/model for debugging.

**Implementation sketch:**

```typescript
type FailoverReason =
  | "timeout"
  | "rate_limit"
  | "auth"
  | "billing"
  | "format"
  | "context_overflow";

type ModelCandidate = {
  provider: string;
  model: string;
};

async function runWithModelFallback<T>(params: {
  candidates: ModelCandidate[];
  run: (provider: string, model: string) => Promise<T>;
}): Promise<{ result: T; provider: string; model: string; attempts: Attempt[] }> {
  const attempts: Attempt[] = [];

  for (const candidate of params.candidates) {
    try {
      const result = await params.run(candidate.provider, candidate.model);
      return { result, provider: candidate.provider, model: candidate.model, attempts };
    } catch (err) {
      const reason = classifyFailoverReason(err);
      if (reason === "auth" || reason === "billing") {
        throw err;  // Retry won't help
      }
      if (isUserAbort(err)) {
        throw err;  // User canceled; don't fallback
      }
      attempts.push({ provider: candidate.provider, model: candidate.model, error: err, reason });
      // Continue to next candidate
    }
  }

  throw new Error(`All models failed: ${attempts.map(a => a.error).join(" | ")}`);
}

function classifyFailoverReason(err: unknown): FailoverReason | null {
  const status = getStatusCode(err);
  if (status === 402) return "billing";
  if (status === 429) return "rate_limit";
  if (status === 401 || status === 403) return "auth";
  if (status === 408) return "timeout";

  const message = getErrorMessage(err).toLowerCase();
  if (message.includes("timeout") || message.includes("timed out")) return "timeout";
  if (message.includes("rate limit") || message.includes("too many requests")) return "rate_limit";
  if (message.includes("context window") || message.includes("context length")) return "context_overflow";

  return null;
}
```

**User abort vs. timeout distinction:**

```typescript
function isUserAbort(err: unknown): boolean {
  // Only treat explicit AbortError names as user aborts
  // Message-based checks (e.g., "aborted") can mask timeouts
  if (!err || typeof err !== "object") return false;
  const name = "name" in err ? String(err.name) : "";
  return name === "AbortError" && !isTimeoutError(err);
}
```

**Configuration example:**

```yaml
agents:
  defaults:
    model:
      primary: "anthropic/claude-sonnet-4-20250514"
      fallbacks:
        - "openai/gpt-4o"
        - "google/gemini-2.0-flash"
```

## How to use it

1. **Define fallback chains**: Specify ordered list of alternative models per use case (coding vs. general chat).
2. **Configure allowlists**: Restrict fallback to models that support your request format (e.g., image models only).
3. **Classify errors**: Map provider-specific error codes to semantic reasons for consistent handling.
4. **Track attempts**: Log each fallback attempt with provider, model, error, and reason for observability.
5. **Handle exhaustion**: When all candidates fail, aggregate error messages to provide actionable feedback.

**Pitfalls to avoid:**

- **Over-fallback**: Too many fallback chains can cascade failures across providers. Use exponential backoff.
- **Semantic mismatch**: Fallback models may have different capabilities (vision, tools). Filter by required features.
- **Silent failures**: Some errors (`format`) indicate request incompatibility. Fallback may fail identically.

## Trade-offs

**Pros:**

- **Resilience**: Transient failures (timeouts, rate limits) don't block the agent.
- **Cost optimization**: Fallback to cheaper models when premium models are unavailable.
- **Clear diagnostics**: Attempt history shows which models failed and why.
- **User abort respect**: Distinguishes user cancellation from timeout, avoiding unnecessary fallbacks.

**Cons/Considerations:**

- **Latency penalty**: Each failed attempt adds round-trip time before success.
- **Inconsistent outputs**: Different models may respond differently, affecting downstream parsing.
- **Cost accumulation**: Fallback chains may incur multiple API charges for a single logical request.
- **Complex configuration**: Managing allowlists, chains, and provider-specific behavior adds operational overhead.

## References

- [Clawdbot model-fallback.ts](https://github.com/clawdbot/clawdbot/blob/main/src/agents/model-fallback.ts) - Fallback orchestration
- [Clawdbot failover-error.ts](https://github.com/clawdbot/clawdbot/blob/main/src/agents/failover-error.ts) - Error classification
- [Clawdbot error helpers](https://github.com/clawdbot/clawdbot/blob/main/src/agents/pi-embedded-helpers/errors.ts) - Reason classification logic
- Related: [Extended Coherence Work Sessions](/patterns/extended-coherence-work-sessions) for reliability patterns
