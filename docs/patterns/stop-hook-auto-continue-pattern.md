---
title: Stop Hook Auto-Continue Pattern
status: emerging
authors: ["Boris Cherny (Anthropic)", "Claude Code Users"]
category: "Orchestration & Control"
source: "https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it"
tags: [hooks, automation, testing, determinism, success-criteria, continuous-execution]
---

## Problem

Agents complete their turn and return control to the user even when the task isn't truly done. Common scenarios:

- Code compiles but tests fail
- Changes made but quality checks haven't passed
- Feature implemented but integration tests broken
- Migrations run but verification steps not completed

Without intervention, the user must manually check and re-prompt the agent, creating friction.

## Solution

Use **stop hooks** to programmatically check success criteria after each agent turn. If criteria aren't met, automatically continue the agent's execution until the task is genuinely complete.

**Stop hook**: A script that runs when the agent finishes a turn. It can inspect state and decide whether to return control to the user or keep the agent running.

```pseudo
define_stop_hook() {
    # Runs after every agent turn completion

    test_result = run_tests()

    if test_result.failed:
        agent.continue_with_prompt(
            "Tests failed with: {test_result.errors}. Fix these issues."
        )
    else:
        agent.stop()  # Return control to user
}
```

**Combined with dangerous mode**: In containerized/sandboxed environments, this enables fully autonomous operation until success.

## How to use it

**Basic implementation:**

1. Define success criteria (tests pass, build succeeds, linter clean, etc.)
2. Create stop hook that checks these criteria
3. If criteria fail, inject feedback and continue agent execution
4. If criteria pass, return control to user

**Claude Code SDK example:**

```javascript
// Stop hook configuration
{
  "hooks": {
    "on_stop": {
      "command": "./scripts/check_success.sh",
      "auto_continue_on_failure": true
    }
  }
}
```

**Power user pattern (from transcript):**

> "You can define a stop hook that's like, if the tests don't pass, keep going. Essentially make the model keep going until the thing is done."

**Advanced usage with programmatic SDK:**

Combine with dangerous mode in containers for autonomous operation:

- Agent makes changes
- Stop hook checks tests
- If failing, agent continues autonomously
- Loops until tests pass or timeout
- Result: "Deterministic outcomes from non-deterministic processes"

## Trade-offs

**Pros:**

- **True task completion**: Don't stop until actually done
- **Reduced human intervention**: No manual re-prompting needed
- **Systematic quality**: Encoded success criteria, not human judgment
- **Autonomous operation**: Combined with SDK, enables fully hands-off tasks
- **Prevents premature completion**: Agent can't declare victory too early

**Cons:**

- **Runaway costs**: Agent might loop indefinitely if criteria impossible
- **Requires good criteria**: Bad success checks lead to infinite loops
- **Container overhead**: Safest in sandboxed environments
- **Debugging challenges**: Harder to inspect mid-execution state
- **Timeout management**: Need sensible limits to prevent infinite execution

**Safety considerations:**

- Use timeouts to bound execution
- Monitor token usage during loops
- Test hooks in safe environments first
- Start with simple criteria before complex checks
- Log all auto-continue decisions for debugging

## References

* Boris Cherny: "You can define a stop hook that's like, if the tests don't pass, keep going. Essentially you can just make the model keep going until the thing is done."
* Boris Cherny: "This is insane when you combine it with the SDK and this kind of programmatic usage. This is a stochastic thing, it's non-deterministic, but with scaffolding you can get these deterministic outcomes."
* [AI & I Podcast: How to Use Claude Code Like the People Who Built It](https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it)
