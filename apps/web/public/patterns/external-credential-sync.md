---
title: "External Credential Sync"
status: "validated-in-production"
authors: ["Clawdbot Contributors"]
based_on: ["Clawdbot Implementation (https://github.com/clawdbot/clawdbot)"]
category: "Security & Safety"
source: "https://github.com/clawdbot/clawdbot/blob/main/src/agents/auth-profiles/external-cli-sync.ts"
tags: [credentials, oauth, token-sync, keychain, cli-integration, auth-reuse]
---

## Problem

Users manage AI API credentials across multiple tools—CLIs (Claude Code, Codex CLI), web portals, and local development environments. Manually re-entering credentials for each tool is friction-prone and leads to:

- **Stale tokens**: OAuth refresh tokens expire, causing authentication failures
- **Inconsistent state**: Credentials updated in one tool don't propagate to others
- **Token-only drift**: Some tools support OAuth refresh; others store static tokens that expire

Agents need automatic credential synchronization to reduce authentication friction while maintaining security (no plaintext storage, proper expiry handling).

## Solution

Cross-credential-source synchronization with near-expiry detection, type-aware upgrades, and duplicate detection. The system reads credentials from external tool stores (keychain, config files) and syncs them into the agent's credential store, with intelligent merging and freshness tracking.

**Core concepts:**

- **Source plugins**: Each external tool (Claude CLI, Codex CLI, Qwen Portal) implements a credential reader that accesses its secure storage (keychain, encrypted config).
- **Near-expiry detection**: Credentials within 24 hours of expiration trigger proactive refresh, preventing auth failures during active sessions.
- **Type-aware upgrades**: OAuth credentials are preferred over token-only credentials. When sync detects an OAuth credential for a profile that previously had a token-only credential, it upgrades to enable auto-refresh.
- **Duplicate detection**: Compares credential values (access tokens, refresh tokens) to avoid creating duplicate profiles for the same underlying account.
- **TTL-based caching**: External reads are cached for 5 minutes to avoid excessive keychain access while maintaining freshness.
- **Immutable profile IDs**: Each external source maps to a fixed profile ID (e.g., `claude-cli`, `codex-cli`), allowing stable references across sync cycles.

**Implementation sketch:**

```typescript
const EXTERNAL_CLI_NEAR_EXPIRY_MS = 24 * 60 * 60 * 1000;  // 24 hours
const EXTERNAL_CLI_SYNC_TTL_MS = 5 * 60 * 1000;             // 5 minutes cache

function isExternalProfileFresh(cred: Credential, now: number): boolean {
  if (cred.type !== "oauth" && cred.type !== "token") return false;
  if (!["anthropic", "openai-codex", "qwen-portal"].includes(cred.provider)) return false;
  if (typeof cred.expires !== "number") return true;  // No expiry = assume fresh
  return cred.expires > now + EXTERNAL_CLI_NEAR_EXPIRY_MS;
}

function syncExternalCliCredentials(store: CredentialStore): boolean {
  let mutated = false;
  const now = Date.now();

  // Sync from Claude Code CLI
  const existingClaude = store.profiles["claude-cli"];
  const shouldSyncClaude = !existingClaude || !isExternalProfileFresh(existingClaude, now);

  if (shouldSyncClaude) {
    const claudeCreds = readClaudeCliCredentialsCached({
      ttlMs: EXTERNAL_CLI_SYNC_TTL_MS,
    });
    if (claudeCreds) {
      // Upgrade token->oauth if CLI now has OAuth
      const shouldUpgrade = existingClaude?.type === "token" && claudeCreds.type === "oauth";
      const isMoreRecent = claudeCreds.expires > (existingClaude?.expires ?? 0);

      if (shouldUpgrade || isMoreRecent) {
        store.profiles["claude-cli"] = claudeCreds;
        mutated = true;
      }
    }
  }

  // Repeat for other sources (Codex CLI, Qwen Portal)...
  return mutated;
}
```

**Duplicate detection for Codex CLI:**

```typescript
function findDuplicateCodexProfile(store: CredentialStore, creds: OAuthCredential): string | undefined {
  for (const [profileId, profile] of Object.entries(store.profiles)) {
    if (profileId === "codex-cli") continue;
    if (profile.provider !== "openai-codex") continue;
    if (profile.access === creds.access && profile.refresh === creds.refresh) {
      return profileId;  // Same credentials exist under different profile
    }
  }
  return undefined;
}
```

**Type upgrade preference:**

```typescript
// Prefer OAuth over token-only (enables auto-refresh)
if (existing?.type === "token" && claudeCreds.type === "oauth") {
  store.profiles[CLAUDE_CLI_PROFILE_ID] = claudeCreds;
  mutated = true;
}
// Never downgrade OAuth to token
if (existing?.type === "oauth" && claudeCreds.type === "token") {
  // Skip update; preserve OAuth capability
}
```

## How to use it

1. **Identify credential sources**: Map external tools that store credentials for the same providers (Anthropic, OpenAI, etc.).
2. **Implement credential readers**: For each source, write a function that reads credentials from its secure store (keychain, config file).
3. **Define profile IDs**: Assign stable IDs to each external source (e.g., `claude-cli`, `codex-cli`).
4. **Sync on startup and timer**: Run sync when the agent starts and periodically (e.g., every hour) to refresh near-expiry credentials.
5. **Handle upgrade paths**: When OAuth becomes available for a token-only profile, upgrade automatically.
6. **Detect duplicates**: Before creating a new profile, check for existing profiles with the same credential values.

**Pitfalls to avoid:**

- **Excessive keychain reads**: Cache external reads to avoid triggering OS security prompts too frequently.
- **Missing expiry handling**: Some credentials don't carry expiry (Codex CLI). Use file mtime as a heuristic.
- **OAuth downgrade risk**: Never replace OAuth credentials with token-only credentials; this loses auto-refresh capability.
- **Race conditions**: Multiple syncs running concurrently can overwrite credentials. Use file locks or mutexes.

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
- **Sync lag**: Cached reads (5-minute TTL) mean fresh credentials may not appear immediately.

## References

- [Clawdbot external-cli-sync.ts](https://github.com/clawdbot/clawdbot/blob/main/src/agents/auth-profiles/external-cli-sync.ts) - Sync logic
- [Clawdbot CLI credential readers](https://github.com/clawdbot/clawdbot/blob/main/src/agents/cli-credentials.ts) - Keychain access
- [Clawdbot credential types](https://github.com/clawdbot/clawdbot/blob/main/src/agents/auth-profiles/types.ts) - Type definitions
- Related: [PII Tokenization](/patterns/pii-tokenization) for credential security patterns
