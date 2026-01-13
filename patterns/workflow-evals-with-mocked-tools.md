---
title: Workflow Evals with Mocked Tools
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Will Larson (lethain.com)", "Sierra (chat/voice platform)"]
category: Reliability & Eval
source: "https://lethain.com/agents-evals/"
tags: [evals, testing, ci-cd, mocked-tools, simulations, workflow-validation, end-to-end-testing]
---

## Problem

Unit tests, linters, and typecheckers validate individual components but don't test agent workflows end-to-end. It's easy to create prompts that don't work well despite all underlying pieces being correct.

You need to validate that prompts and tools work together effectively as a system.

## Solution

Implement **workflow evals (simulations)** that test complete agent workflows with mocked tools.

**Core components (Sierra-inspired approach):**

1. **Dual tool implementations**: Every tool has both `true` and `mock` versions

   ```python
   # True implementation - calls real APIs
   def search_knowledge_base_true(query: str) -> str:
       return kb_api.search(query)

   # Mock implementation - returns static/test data
   def search_knowledge_base_mock(query: str) -> str:
       return TEST_KB_RESULTS.get(query, DEFAULT_RESULT)
   ```

2. **Simulation configuration**: Each eval defines:
   - **Initial prompt**: What the agent receives
   - **Metadata**: Situation context available to harness
   - **Evaluation criteria**: Success/failure determination

   ```yaml
   evals:
     - name: slack_reaction_jira_workflow
       initial_prompt: "Add a smiley reaction to the JIRA ticket in this Slack message"
       metadata:
         situation: "slack_message_with_jira_link"
       expected_tools:
         - slack_get_message
         - jira_get_ticket
         - slack_add_reaction
       evaluation_criteria:
         objective:
           - tools_called: ["slack_get_message", "jira_get_ticket", "slack_add_reaction"]
           - tools_not_called: ["slack_send_message"]
         subjective:
           - agent_judge: "Response was helpful and accurate"
   ```

3. **Dual evaluation criteria**:

   **Objective criteria**:
   - Which tools were called
   - Which tools were NOT called
   - Tags/states added to conversation (if applicable)

   **Subjective criteria**:
   - Agent-as-judge assessments (e.g., "Was response friendly?")
   - LLM evaluations of qualitative outcomes

4. **CI/CD integration**: Run evals automatically on every PR

   ```pseudo
   # GitHub Actions workflow
   on: pull_request
   steps:
     - run: python scripts/run_agent_evals.py
       # Posts results as PR comment
   ```

```pseudo
# Eval execution flow
1. Load eval configuration
2. Swap in mock implementations for all tools
3. Run agent with initial prompt + metadata
4. Track which tools agent calls
5. Evaluate against objective criteria (tool usage)
6. Run agent-as-judge for subjective criteria
7. Report pass/fail with details
```

## How to use it

**Best for:**

- Agent workflows where tools have side effects (APIs, databases)
- CI/CD pipelines requiring workflow validation
- Prompt engineering and optimization
- Regression testing for agent behavior changes

**Implementation approach:**

**1. Create mock layer for tools:**

```python
class MockToolRegistry:
    def __init__(self, mode: str = "mock"):
        self.mode = mode

    def get_tool(self, tool_name: str):
        if self.mode == "mock":
            return self.mocks[tool_name]
        return self.real_tools[tool_name]

    # Register mock implementations
    mocks = {
        "slack_send_message": mock_slack_send_message,
        "jira_create_ticket": mock_jira_create_ticket,
        # ...
    }
```

**2. Define eval cases:**

```python
evals = [
    {
        "name": "login_support_flow",
        "prompt": "User can't log in, help them",
        "expected_tools": ["user_lookup", "password_reset"],
        "forbidden_tools": ["account_delete"],
        "subjective_criteria": "Response was empathetic and helpful"
    },
    # ... more evals
]
```

**3. Run and evaluate:**

```python
def run_eval(eval_config):
    # Run agent with mocked tools
    result = agent.run(
        prompt=eval_config["prompt"],
        tools=mock_registry
    )

    # Check objective criteria
    tools_called = result.tools_used
    passed = all(t in tools_called for t in eval_config["expected_tools"])
    passed &= all(t not in tools_called for t in eval_config["forbidden_tools"])

    # Check subjective criteria
    if passed:
        judge_prompt = f"""
        Evaluate this agent response: {result.response}
        Criteria: {eval_config['subjective_criteria']}
        Pass/fail?
        """
        passed = llm_evaluator(judge_prompt) == "PASS"

    return {"passed": passed, "details": result}
```

**4. Integrate with CI/CD:**

```yaml
# .github/workflows/agent_evals.yml
name: Agent Evals
on: pull_request
jobs:
  evals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: python scripts/run_evals.py --format github
      - uses: actions/github-script@v6
        with:
          script: |
            const results = require('./eval_results.json');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: formatResults(results)
            });
```

**Handling non-determinism:**

The article notes evals are "not nearly as well as I hoped" due to non-determinism:

- **Strong signal**: All pass or all fail
- **Weak signal**: Mixed results
- **Mitigation**: Retry failed evals (e.g., "at least once in three tries")

## Trade-offs

**Pros:**

- **End-to-end validation**: Tests prompts + tools together as a system
- **Fast feedback**: Catch regressions before they reach production
- **Safe testing**: Mocked tools avoid side effects during testing
- **Clear criteria**: Both objective (tool calls) and subjective (quality) measures
- **CI/CD integration**: Automated validation on every PR

**Cons:**

- **Non-deterministic**: LLM variability makes flaky tests common
- **Mock maintenance**: Need to keep mocks synced with real tool behavior
- **Prompt-driven fragility**: Prompt-dependent workflows (vs code-driven) more flaky
- **Not blocking-ready**: Hard to use as CI gate due to variability
- **Tuning overhead**: Need continuous adjustment of prompts and mock responses
- **Limited signal**: Mixed pass/fail results provide ambiguous guidance

**Operational challenges:**

> "This is working well, but not nearly as well as I had hoped... there's very strong signal when they all fail, and strong signal when they all pass, but most runs are in between."

> "Our reliance on prompt-driven workflows rather than code-driven workflows introduces a lot of non-determinism, which I don't have a way to solve without... prompt and mock tuning."

**Improvement strategies:**

1. **Retry logic**: "At least once in three tries" to reduce flakiness
2. **Tune prompts**: Make eval prompts more precise and deterministic
3. **Tune mocks**: Improve mock responses to be more realistic
4. **Code over prompts**: Move complex workflows from prompt-driven to code-driven
5. **Directional vs blocking**: Use for context rather than CI gates

## References

* [Building an internal agent: Evals to validate workflows](https://lethain.com/agents-evals/) - Will Larson (2025)
* Sierra platform: Simulations approach for agent testing
* Related: [Stop Hook Auto-Continue Pattern](stop-hook-auto-continue-pattern.md) - Post-execution testing
* Related: [Agent Reinforcement Fine-Tuning](agent-reinforcement-fine-tuning.md) - Training on agent workflows
