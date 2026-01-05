---
title: Lethal Trifecta Threat Model
status: best-practice
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Simon Willison"]
category: Reliability & Eval
source: "https://simonwillison.net/2025/Jun/16/lethal-trifecta/"
tags: [security, prompt-injection, threat-model, data-exfiltration]
---

## Problem
Combining three agent capabilities—
1. **Access to private data**
2. **Exposure to untrusted content**
3. **Ability to externally communicate**

—creates a straightforward path for prompt-injection attackers to steal sensitive information.  
LLMs cannot reliably distinguish "good" instructions from malicious ones once they appear in the same context window.

## Solution
Adopt a **Trifecta Threat Model**:  

- **Audit every tool** an agent can call and classify it against the three capabilities.  
- **Guarantee that at least one circle is missing** in any execution path. Options include:  
  
- Remove external network access (no exfiltration).  
  - Deny direct file/database reads (no private data).  
  - Sanitize or segregate untrusted inputs (no hostile instructions).  
- Enforce this at orchestration time, not with brittle prompt guardrails.

```python
# pseudo-policy
if tool.can_externally_communicate and
   tool.accesses_private_data and
   input_source == "untrusted":
       raise SecurityError("Lethal trifecta detected")
```

## How to use it

* Maintain a machine-readable capability matrix for every tool.
* Add a pre-execution policy check in your agent runner.
* Fail closed: if capability metadata is missing, treat the tool as high-risk.

## Trade-offs

**Pros:** Simple mental model; eliminates entire attack class.
**Cons:** Limits powerful "all-in-one" agents; requires disciplined capability tagging.

## References

* Willison, *The Lethal Trifecta for AI Agents* (June 16 2025).
* "Design Patterns for Securing LLM Agents against Prompt Injections" (June 13 2025).