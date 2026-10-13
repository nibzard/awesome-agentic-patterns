---
title: "External Credential Sync"
status: "established"
authors: ["OpenClaw Contributors"]
based_on: ["OpenClaw, formerly Clawdbot (https://github.com/openclaw/openclaw)"]
category: "Security & Safety"
source: "https://github.com/openclaw/openclaw/blob/main/src/agents/auth-profiles/external-cli-sync.ts"
tags: [credentials, oauth, token-sync, keychain, cli-integration, auth-reuse]
summary: "Reads AI credentials from other tools' keychains and config files and syncs them into the agent's store, with TTL-cached reads, refresh fences, and persisted ownership"
signals: ["Users already sign in to the same providers through other CLIs or tools", "Stale or expired tokens cause auth failures during sessions", "Credentials drift between tools"]
anti_signals: ["Headless environments with no OS keychain access", "The agent is the only tool that holds credentials for the provider", "Policy forbids reading credentials owned by other tools"]
updated_at: "2026-10-13"
---

## Problem

Users manage AI API credentials across multiple tools—CLIs (Claude Code, Codex CLI), web portals, and local development environments. Manually re-entering credentials for each tool is friction-prone and leads to:

- **Stale tokens**: OAuth refresh tokens expire, causing authentication failures
- **Inconsistent state**: Credentials updated in one tool don't propagate to others
- **Token-only drift**: Some tools support OAuth refresh; others store static tokens that expire

Agents need automatic credential synchronization to reduce authentication friction while maintaining security (no plaintext storage, proper expiry handling).

## Solution

Cross-credential-source synchronization with freshness tracking, type-aware preference, and persisted ownership. The system reads credentials from external tool stores (keychain, config files) and syncs them into the agent's credential store, with careful rules for when an external snapshot may replace a stored profile.

In OpenClaw (renamed from Clawdbot in early 2026), one sync owner handles the MiniMax CLI, and per-provider plugins own every other external auth source. The core ideas below describe the pattern; the sketch reflects the current MiniMax owner, with a note on the earlier multi-source revision.

**Core concepts:**

- **Source readers**: Each external tool implements a credential reader that accesses its secure storage. Current OpenClaw readers cover the Codex CLI (macOS keychain or `~/.codex/auth.json`, presence used only as a discovery hint), the MiniMax CLI (`~/.minimax/oauth_creds.json`), and the Gemini CLI (`~/.gemini/oauth_creds.json`); other providers are owned by their plugins.
- **Bounded sync ownership**: A sync owner refreshes only the provider IDs it is responsible for. This keeps one tool's import rules from overriding another provider's plugin logic.
- **Refresh fences**: An external snapshot has no generation ordering proof. It must not clear a refresh fence and make an older single-use refresh token replayable.
- **Type-aware preference**: OAuth credentials are preferred over token-only credentials. Sync never downgrades OAuth to token-only, because that would lose auto-refresh.
- **Duplicate detection**: Compares credential values (access tokens, refresh tokens) to avoid creating duplicate profiles for the same underlying account.
- **TTL-based caching**: External reads are cached (`EXTERNAL_CLI_SYNC_TTL_MS`, 15 minutes) to avoid excessive keychain access while maintaining freshness.
- **Immutable profile IDs**: Each external source maps to a fixed profile ID (for example `minimax-cli` for the MiniMax CLI), allowing stable references across sync cycles.

**Implementation sketch:**

```typescript
const EXTERNAL_CLI_SYNC_TTL_MS = 15 * 60 * 1000;  // 15 minutes cache

/** Provider ids whose external CLI credentials can be refreshed by this owner. */
function listExternalCliSyncProviderIds(): string[] {
  return ["minimax-portal", "minimax", "minimax-cli"];
}

/** Read a CLI credential only for safe bootstrap of an unusable local profile. */
function readExternalCliBootstrapCredential(params: {
  profileId: string;
  credential: OAuthCredential;
}): OAuthCredential | null {
  if (!isMiniMaxCliProfile(params)) return null;
  const imported = readMiniMaxCliCredentialsCached({
    ttlMs: EXTERNAL_CLI_SYNC_TTL_MS,
  });
  if (imported && isOAuthRefreshFence(params.credential)) {
    // An external snapshot has no generation ordering proof. It must not
    // clear a fence and make an older single-use refresh token replayable.
    return null;
  }
  return imported;
}
```

**Persisted ownership marking:**

```typescript
const PERSISTED_EXTERNAL_CLI_AUTH_FLOW = "external-cli";

/** True when durable metadata assigns this stored profile to an external CLI owner. */
function isPersistedExternalCliAuthProfile(params: {
  profileId: string;
  credential: OAuthCredential;
}): boolean {
  if (!isMiniMaxCliProfile(params)) return false;
  // Historical native logins and CLI imports share an unmarked shape.
  // Only exact CLI token backfill may assign durable external ownership.
  return params.credential.authFlow === PERSISTED_EXTERNAL_CLI_AUTH_FLOW;
}
```

**Historical revision:** Earlier Clawdbot releases synced Claude Code, Codex CLI, and Qwen Portal credentials directly, with near-expiry triggers (~10 minutes), token-to-OAuth upgrades, and duplicate detection inside one sync pass. That logic now lives in per-provider plugins; only the MiniMax owner keeps the direct path shown above.

## How to use it

1. **Identify credential sources**: Map external tools that store credentials for the same providers (Anthropic, OpenAI, etc.).
2. **Implement credential readers**: For each source, write a function that reads credentials from its secure store (keychain, config file).
3. **Define profile IDs**: Assign stable IDs to each external source (e.g., `minimax-cli`, one profile per provider plugin).
4. **Sync on startup and timer**: Run sync when the agent starts and periodically (e.g., every hour) to refresh near-expiry credentials.
5. **Handle upgrade paths**: When OAuth becomes available for a token-only profile, upgrade automatically.
6. **Detect duplicates**: Before creating a new profile, check for existing profiles with the same credential values.

**Pitfalls to avoid:**

- **Excessive keychain reads**: Cache external reads (~15 minutes) to avoid triggering OS security prompts too frequently.
- **Missing expiry handling**: Some credentials don't carry expiry (Codex CLI auth records). Use a conservative fallback window; OpenClaw gives imported Codex credentials a one-hour fallback.
- **OAuth downgrade risk**: Never replace OAuth credentials with token-only credentials; this loses auto-refresh capability.
- **Race conditions**: Multiple syncs running concurrently can overwrite credentials. Use file locks with exponential backoff.

## Trade-offs

**Pros:**

- **Reduced friction**: Users authenticate once per provider; all tools benefit.
- **Proactive refresh**: Near-expiry detection prevents auth failures during active sessions.
- **Type upgrades**: OAuth adoption is automatic when tools upgrade from token-only to OAuth.
- **Duplicate elimination**: Avoids cluttering credential store with redundant profiles.

**Cons/Considerations:**

- **Keychain dependency**: Requires access to OS keychain, which may fail in headless environments.
- **Platform differences**: Windows, macOS, and Linux keychain APIs differ; need abstractions.
- **Privilege requirements**: Reading keychain credentials may require user permission or elevated privileges.
- **Sync lag**: Cached reads (~15 minute TTL) mean fresh credentials may not appear immediately.

## References

- [OpenClaw external-cli-sync.ts](https://github.com/openclaw/openclaw/blob/main/src/agents/auth-profiles/external-cli-sync.ts) - MiniMax CLI bootstrap and persisted ownership
- [OpenClaw CLI credential readers](https://github.com/openclaw/openclaw/blob/main/src/agents/cli-credentials.ts) - Codex, MiniMax, and Gemini readers
- [OpenClaw credential types](https://github.com/openclaw/openclaw/blob/main/src/agents/auth-profiles/types.ts) - Type definitions
- RFC 6749: [OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749) - Refresh token semantics
- RFC 9700: [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/rfc9700) - Token storage, expiry, and protection guidance
- Related: [PII Tokenization](/patterns/pii-tokenization) for credential security patterns
