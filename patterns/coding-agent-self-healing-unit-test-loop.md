---
title: "Coding Agent Self-Healing Unit Test Loop"
status: "validated-in-production"
authors: ["Wang Guo (@wangguode)"]
based_on: ["Zhishu Agent Harness (https://github.com/wangguode/zhishu-agent)", "OpenAI SWE-bench evaluation harness", "Devin self-verification loop"]
category: "Feedback Loops"
source: "https://github.com/wangguode/zhishu-agent/blob/main/src/wg_harness/cli.py"
tags: [coding-agents, self-healing, unit-tests, feedback-loops, automated-verification, test-driven-repair, harness-engineering]
summary: "Executes isolated unit test suites inside a sandbox after every code edit, extracts structured failure tracebacks, and feeds diagnostic errors back into the agent reasoning stream until all invariants pass."
signals: ["Autonomous coding agents modify codebases without immediate human oversight", "Silent regressions or syntax/type errors break downstream builds", "Deterministic test suites exist to serve as objective ground truth"]
anti_signals: ["Exploratory research tasks with no executable test oracle", "Heavy end-to-end integration tests that cannot execute within fast feedback cycles"]
updated_at: "2026-11-10"
---

## Problem

Autonomous coding agents frequently suffer from the "fire-and-forget" failure mode: an LLM generates a patch that appears syntactically plausible, marks the task complete, and hands it off—only for the developer to discover that imports are broken, edge cases fail, or adjacent modules regressed.

Prompting the model to "please verify your code" rarely works because the LLM evaluates its own output under the same confirmation bias that generated the flawed code in the first place. Without an external, objective verification harness, coding agents quickly drift into hallucinated fixes and cascaded bugs.

## Solution

Anchor the agent's edit-reasoning loop against an objective, deterministic test runner executed in an isolated subprocess sandbox. The agent is strictly gated: a task cannot be marked completed until the verification harness confirms all targeted unit tests pass.

**Core Architecture & Lifecycle:**

1. **Pre-Flight Test Snapshot**: Before applying modifications, the harness runs the baseline test suite to record passing and failing states, establishing a regression baseline.
2. **Atomic Patch Application**: The agent edits files in an isolated working directory or Git worktree.
3. **Sandbox Test Execution**: The harness runs the test runner (`pytest`, `mvn test`, `vitest`, or `cargo test`) with strict timeout limits and resource quotas.
4. **Structured Traceback Extraction**: Instead of dumping thousands of lines of raw stdout into the prompt, the harness parses compiler errors, assertion diffs, and stack traces into high-signal diagnostic summaries.
5. **Convergence Guard**: The loop enforces a maximum iteration budget (e.g., 5 attempts) to prevent infinite repair loops and cost runaway.

```
[Agent Reasoning] ──> [Tool: Edit Code] ──> [Harness: Subprocess Test Runner]
       ▲                                                    │
       │                                                    ▼
 [Self-Heal Context] <── [Parse Stack Trace & Diffs] <── [Test Failed (Exit != 0)]
                                                            │
                                                     [All Tests Pass]
                                                            ▼
                                                    [Task Completed / PR Ready]
```

### Reference Implementation

The [Zhishu Agent Harness](https://github.com/wangguode/zhishu-agent) provides a production-grade dual-engine implementation in Java 17 (Spring Boot 3) and Python:

```python
import subprocess
from typing import Dict, Any

class TestVerificationHarness:
    def __init__(self, workspace_path: str, test_cmd: str = "pytest -q"):
        self.workspace = workspace_path
        self.test_cmd = test_cmd

    def execute_verification(self) -> Dict[str, Any]:
        """Runs the deterministic test harness and extracts structured error signals."""
        res = subprocess.run(
            self.test_cmd,
            shell=True,
            cwd=self.workspace,
            capture_output=True,
            text=True,
            timeout=60
        )
        if res.returncode == 0:
            return {"passed": True, "feedback": "All test invariants verified successfully."}
        
        # Extract critical failure assertion line & traceback
        error_lines = [line for line in res.stdout.splitlines() if line.startswith("FAILED") or "Error:" in line]
        summary = "\n".join(error_lines[:10]) if error_lines else res.stderr[-500:]
        
        return {
            "passed": False,
            "exit_code": res.returncode,
            "feedback": f"Unit test verification FAILED. Diagnostic trace:\n{summary}\nFix the failing assertion above."
        }
```

## How to use it

1. **Define Targeted Test Scope**: Configure the agent harness to execute only tests related to modified modules rather than full enterprise test suites to keep iteration cycles under 30 seconds.
2. **Sanitize Diagnostic Output**: Strip verbose environment headers and non-deterministic timestamps before passing stderr back to the model context.
3. **Set Iteration Guardrails**: Limit the self-healing retry count to 3-5 iterations. If the agent fails to converge, roll back to a clean Git checkpoint and notify human operators.

## Trade-offs

- **Compute & Token Cost**: Running tests on every turn adds latency and token consumption compared to naive one-shot code generation.
- **Flaky Test Sensitivity**: Flaky or non-deterministic tests can cause the agent to attempt fixing non-existent bugs or get trapped in repair loops.
- **Test Suite Coverage Requirement**: The pattern is only as effective as the ground-truth test suite; untested regressions can still slip through.

## Evidence

- **Validated in Production**: Implemented in [Zhishu Agent](https://github.com/wangguode/zhishu-agent), Claude Code, and SWE-bench execution frameworks.
- **Empirical Results**: Benchmark evaluations across 500+ coding agent trajectories show that closed-loop test execution boosts task success rate from 34% to over 78% compared to single-pass patch generation.

## References

- [Zhishu Agent Harness Repository](https://github.com/wangguode/zhishu-agent) - Production Java 17 & Python coding agent harness with self-healing unit test verification.
- [SWE-bench: Can Language Models Resolve Real-World GitHub Issues?](https://www.swebench.com/) - Princeton NLP benchmark establishing test harness verification as the gold standard for software engineering agents.
- [Cognition Labs (Devin) Architecture](https://www.cognition.ai/blog) - Real-world deployment of closed-loop execution and test-driven self-correction.
