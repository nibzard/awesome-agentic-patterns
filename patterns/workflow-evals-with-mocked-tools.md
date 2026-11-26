---
title: Workflow Evals with Mocked Tools
status: production
authors:
  - Nikola Balic (@nibzard)
based_on:
  - Will Larson (lethain.com)
  - Sierra (chat/voice platform)
category: Reliability & Eval
source: 'https://lethain.com/agents-evals/'
tags:
  - evals
  - testing
  - ci-cd
  - mocked-tools
  - simulations
  - workflow-validation
  - end-to-end-testing
slug: workflow-evals-with-mocked-tools
id: workflow-evals-with-mocked-tools
summary: "Runs complete agent workflows against mocked tools in CI and checks which tools were called plus agent-as-judge quality criteria"
signals: ["Agent tools have side effects such as API or database writes", "Unit tests pass but prompts and tools fail together", "Need regression tests for agent behavior on each PR"]
anti_signals: ["Results must act as a strict CI gate, since non-determinism makes them flaky", "Team cannot keep mocks in sync with real tools"]
related: ["incident-to-eval-synthesis", "out-of-process-provider-boundary-replay", "evidence-layered-evaluation-for-interactive-agents", "anti-reward-hacking-grader-design", "progressive-autonomy-with-model-evolution"]
updated_at: '2026-10-13'
---

## Problem

Unit tests, linters, and typecheckers validate individual components but do not test agent workflows end to end. It is easy to create prompts that do not work well although every underlying piece is correct. You need to validate that prompts and tools work together effectively as a system.

## Solution

Implement **workflow evals (simulations)** that test complete agent workflows with mocked tools. The approach is Sierra-inspired and has four components.

**1. Dual tool implementations.** Every tool has both a `true` and a `mock` version:

```python
# True implementation: calls the real API
def search_knowledge_base_true(query: str) -> str:
    return kb_api.search(query)

# Mock implementation: returns static test data
def search_knowledge_base_mock(query: str) -> str:
    return TEST_KB_RESULTS.get(query, DEFAULT_RESULT)
```

**2. Simulation configuration.** Each eval defines the initial prompt, metadata (situation context available to the harness), and evaluation criteria:

```yaml
evals:
  - name: slack_reaction_jira_workflow
    initial_prompt: "Add a smiley reaction to the JIRA ticket in this Slack message"
    metadata:
      situation: "slack_message_with_jira_link"
    evaluation_criteria:
      objective:
        - tools_called: ["slack_get_message", "jira_get_ticket", "slack_add_reaction"]
        - tools_not_called: ["slack_send_message"]
      subjective:
        - agent_judge: "Response was helpful and accurate"
```

**3. Dual evaluation criteria.** Objective criteria check which tools were called, which tools were not called, and which tags or states the conversation gained (if applicable). Subjective criteria use agent-as-judge assessments (for example, "Was the response friendly?") and LLM evaluations of qualitative outcomes.

**4. CI/CD integration.** A run loads the eval configuration, swaps in the mock implementations for all tools, runs the agent with the prompt and metadata, and tracks the tool calls. It then evaluates the objective criteria, runs the agent-as-judge for the subjective criteria, and reports pass or fail with details. CI triggers the run on every PR.

## Evidence

- **Evidence Grade:** `medium` - Independent practitioner report plus vendor-published evaluation frameworks (2026)
- **Key Findings:**
  - Strong production use case: unit tests and linters don't validate prompt-tool integration effectively
  - Dual evaluation (objective + subjective) is standard across implementations
  - Anthropic's "Demystifying evals for AI agents" (January 2026) codifies the grading side: code-based, model-based, and human graders applied to the trajectory or the final answer, which is the trajectory-level extension of this pattern
  - Non-determinism remains the primary challenge; best used for directional guidance
- **Unclear:** Optimal mock fidelity requirements for valid evaluation

## How to use it

**Best for:** agent workflows where tools have side effects (APIs, databases), CI/CD pipelines that need workflow validation, prompt engineering and optimization, and regression testing for agent behavior changes.

**1. Create a mock layer for tools:**

```python
class MockToolRegistry:
    def __init__(self, mode: str = "mock"):
        self.mode = mode
        self.mocks = {"slack_send_message": mock_slack_send_message, "jira_create_ticket": mock_jira_create_ticket}

    def get_tool(self, tool_name: str):
        return self.mocks[tool_name] if self.mode == "mock" else self.real_tools[tool_name]
```

**2. Define eval cases:**

```python
evals = [{
    "name": "login_support_flow",
    "prompt": "User can't log in, help them",
    "expected_tools": ["user_lookup", "password_reset"],
    "forbidden_tools": ["account_delete"],
    "subjective_criteria": "Response was empathetic and helpful",
}]
```

**3. Run and evaluate:**

```python
def run_eval(eval_config, mock_registry):
    result = agent.run(prompt=eval_config["prompt"], tools=mock_registry)
    tools_called = result.tools_used

    # Objective: tool usage
    passed = all(t in tools_called for t in eval_config["expected_tools"])
    passed &= all(t not in tools_called for t in eval_config["forbidden_tools"])

    # Subjective: agent-as-judge, only if the objective checks passed
    if passed:
        criteria = eval_config['subjective_criteria']
        passed = llm_evaluator(f"Evaluate this agent response: {result.response}\nCriteria: {criteria}\nPass/fail?") == "PASS"

    return {"passed": passed, "details": result}
```

**4. Integrate with CI/CD and post the results as a PR comment:**

```yaml
# .github/workflows/agent_evals.yml
name: Agent Evals
on: pull_request
jobs:
  evals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: python scripts/run_evals.py --format github   # writes eval_results.json
      - uses: actions/github-script@v6                   # then posts it as a PR comment
```

**Handling non-determinism:**

The article notes that the evals work "not nearly as well as I hoped it would" because of non-determinism:

- **Strong signal**: all pass or all fail
- **Weak signal**: mixed results
- **Mitigation**: retry failed evals (for example, "at least once in three tries")

## Trade-offs

**Pros:**

- **End-to-end validation**: tests prompts and tools together as a system
- **Fast feedback**: catches regressions before they reach production
- **Safe testing**: mocked tools avoid side effects during testing
- **Clear criteria**: objective (tool calls) and subjective (quality) measures
- **CI/CD integration**: automated validation on every PR

**Cons:**

- **Non-deterministic**: LLM variability makes flaky tests common
- **Mock maintenance and tuning overhead**: mocks must stay in sync with real tool behavior, and prompts and mock responses need continuous adjustment
- **Limited signal**: mixed pass/fail results provide ambiguous guidance

**Operational challenges:**

> "Ok, this is working well, but not nearly as well as I hoped it would... there's very strong signal when they all fail, and strong signal when they all pass, but most runs are in between."

> "Our reliance on prompt-driven workflows rather than code-driven workflows introduces a lot of non-determinism, which I don't have a way to solve without... prompt and mock tuning."

**Failure modes / gotchas:**

- **Hard CI gate:** non-determinism makes evals flaky, so a strict gate blocks PRs at random. Use the results as directional context, and retry failures ("at least once in three tries").
- **Prompt-driven fragility:** prompt-driven workflows are more flaky than code-driven ones. Move complex workflows from prompts into code.
- **Mock drift:** a mock that no longer matches the real tool passes evals that fail in production. Tune mocks to be realistic and keep them synced.
- **Judge noise:** a vague subjective criterion adds more variance. Tune eval prompts to be precise and deterministic.

## References

* [Building an internal agent: Evals to validate workflows](https://lethain.com/agents-evals/) - Will Larson (December 2025)
* [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) - Anthropic Engineering (January 2026); code-based, model-based, and human graders over trajectories or final answers
* Sierra platform: Simulations approach for agent testing
* [LangSmith Evaluation Platform](https://smith.langchain.com/) - Tool tracking and custom evaluators
* [Promptfoo](https://github.com/promptfoo/promptfoo) - Mock API responses and assertion-based testing
* Related: [Stop Hook Auto-Continue Pattern](stop-hook-auto-continue-pattern.md) - Post-execution testing
* Related: [Agent Reinforcement Fine-Tuning](agent-reinforcement-fine-tuning.md) - Training on agent workflows
