---
title: Self-Rewriting Meta-Prompt Loop
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Noah D. Goodman (Meta-Prompt)"]
category: Orchestration & Control
source: "https://noahgoodman.substack.com/p/meta-prompt-a-simple-self-improving"
tags: [meta-prompting, self-improvement, system-prompt, reflection]
---

## Problem
Static system prompts become stale or overly brittle as an agent encounters new tasks and edge-cases. Manually editing them is slow and error-prone.

## Solution
Let the agent **rewrite its own system prompt** after each interaction:

1. **Reflect** on the latest dialogue or episode.  
2. Draft improvements to the instructions (add heuristics, refine tool advice, retire bad rules).  
3. **Validate** the draft (internal sanity-check or external gate).  
4. Replace the old system prompt with the revised version; persist in version control.  
5. Use the new prompt on the next episode, closing the self-improvement loop.

```python
# pseudo-code
dialogue = run_episode()
delta = LLM("Reflect on dialogue and propose prompt edits", dialogue)
if passes_guardrails(delta):
    system_prompt += delta
    save(system_prompt)
```

## Trade-offs

**Pros:** rapid adaptation; no human in the loop for minor tweaks.
**Cons:** risk of drift or jailbreak—needs a strong guardrail step.

## References

* Goodman, *Meta-Prompt: A Simple Self-Improving Language Agent*. ([noahgoodman.substack.com](https://noahgoodman.substack.com/p/meta-prompt-a-simple-self-improving))