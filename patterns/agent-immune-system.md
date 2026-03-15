---
title: Agent Immune System Pattern
status: proposed
authors: ["Kang Zhou (@NeuZhou)"]
category: "Security & Safety"
source: "https://github.com/NeuZhou/clawguard"
tags: [security, prompt-injection, pii, agent-safety, owasp, runtime-protection]
---

## Problem

AI agents operating autonomously face multiple threat vectors that traditional security tools don't cover: prompt injection hidden in data, PII leakage through agent outputs, intent-action mismatches (agent says "read file" but actually deletes it), identity manipulation (rewriting SOUL.md/AGENTS.md), and supply chain attacks through compromised skills/plugins.

## Solution

Implement a **multi-layer immune system** for agents that provides:

1. **Installation Immunity** — scan skills/plugins before installation for embedded threats
2. **Runtime Immunity** — monitor agent actions in real-time for anomalies
3. **Self-Audit** — periodic security scans of the agent's own configuration

```yaml
# Example: ClawGuard configuration
security:
  scan_on_install: true
  rules:
    prompt-injection:
      enabled: true
      severity: critical
    pii-detection:
      enabled: true
      action: sanitize  # redact locally, zero cloud
    intent-action-mismatch:
      enabled: true
    identity-tampering:
      enabled: true
```

## Key Components

- **Threat Pattern Library** — extensible rules covering OWASP Agentic AI Top 10 (ASI01-ASI10)
- **PII Sanitizer** — local-only detection and redaction (emails, SSNs, API keys, credit cards)
- **Intent-Action Validator** — compares declared intent with actual tool calls
- **Identity Guard** — detects attempts to modify agent personality/instruction files
- **Supply Chain Scanner** — typosquatting, obfuscated code, reverse shell detection

## Implementation

[ClawGuard](https://github.com/NeuZhou/clawguard) is an open-source implementation with 285+ threat patterns and 229 tests:

```bash
# Scan a skill before installing
npx @neuzhou/clawguard scan ./path/to/skill

# Sanitize PII in agent output
npx @neuzhou/clawguard sanitize "send to john@example.com"

# Check text for prompt injection
npx @neuzhou/clawguard check "ignore previous instructions..."
```

## When to Use

- Any agent with file system access, shell execution, or API calls
- Skill/plugin marketplaces that need pre-installation scanning
- Multi-agent systems where agents communicate and could propagate attacks
- Compliance-sensitive environments requiring PII protection

## References

- [OWASP Agentic AI Security Initiative Top 10 (2026)](https://genai.owasp.org)
- [Agents Rule of Two — Meta (2025)](https://ai.meta.com/blog/practical-ai-agent-security/)
