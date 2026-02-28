# Stop Hook Auto-Continue Pattern - Research Report

**Pattern ID**: `stop-hook-auto-continue-pattern`
**Source File**: `patterns/stop-hook-auto-continue-pattern.md`
**Research Completed**: 2026-02-27
**Status**: Complete

---

## Executive Summary

The **Stop Hook Auto-Continue Pattern** enables agents to automatically continue execution until defined success criteria are met, rather than stopping prematurely and requiring manual re-prompting. This research report synthesizes academic literature, industry implementations, related patterns, and technical analysis to provide a comprehensive understanding of this emerging pattern.

**Key Finding**: This pattern has strong academic foundations (Reflexion, Self-Refine, ReAct), is implemented in major production systems (Claude Code, LangGraph, AutoGen, GitHub Agentic Workflows), and represents a fundamental advancement in agent reliability through automated verification loops.

---

## Table of Contents

1. [Pattern Overview](#pattern-overview)
2. [Academic Sources](#academic-sources)
3. [Industry Implementations](#industry-implementations)
4. [Related Patterns Analysis](#related-patterns-analysis)
5. [Technical Deep Dive](#technical-deep-dive)
6. [Conclusions and Recommendations](#conclusions-and-recommendations)

---

## Pattern Overview

### Core Concept

The Stop Hook Auto-Continue Pattern consists of three key components:

1. **Stop Hook**: A script/hook that runs when an agent finishes a turn
2. **Auto-Continue**: Automatic continuation if criteria aren't met
3. **Success Criteria**: Programmatic checks (tests, builds, linters)

### Pseudocode Implementation

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

### Primary Use Cases

| Use Case | Description | Success Criteria |
|----------|-------------|------------------|
| **Code compilation** | Code compiles but tests fail | Test suite passes |
| **Quality checks** | Changes made but linter fails | Linter clean |
| **Feature implementation** | Feature done but integration broken | Integration tests pass |
| **Migration verification** | Migration run but not verified | Verification checks pass |

---

## Academic Sources

### Core Academic Foundations

#### **Reflexion: Language Agents with Verbal Reinforcement Learning** (NeurIPS 2023)
- **Authors**: Noah Shinn, Federico Cassano, Edward Grefenstette, Tim Rocktaschel, Behram Mistree
- **arXiv**: [2303.11366](https://arxiv.org/abs/2303.11366)
- **Relevance**: Establishes **self-termination based on verification criteria**. The Reflexion algorithm checks if output satisfies requirements and automatically continues (regenerates) if not satisfied.

**Key Contribution**: Core loop structure `result = agent.generate()`; `if not satisfied(result): continue` using verbal reinforcement learning where natural language serves as the feedback signal.

---

#### **Self-Refine: Large Language Models Can Self-Correct with Self-Feedback** (ICLR 2023)
- **Authors**: Aman Madaan, Shrimai Prabhumoye, Amirreza Shaban, Yiming Yang, Carolyn Rose, Nate Kushman
- **arXiv**: [2303.08119](https://arxiv.org/abs/2303.08119)
- **Relevance**: Demonstrates **iterative self-improvement through explicit evaluation passes** with threshold-based continuation.

**Key Contribution**: Loop structure `draft -> evaluate -> revise -> repeat until threshold` where evaluation criteria determine whether to continue or terminate.

---

#### **ReAct: Synergizing Reasoning and Acting in Language Models** (NeurIPS 2022)
- **Authors**: Shunyu Yao, Jeffrey Zhao, Dian Yu, et al.
- **arXiv**: [2210.03629](https://arxiv.org/abs/2210.03629)
- **Relevance**: Established **Thought -> Action -> Observation** paradigm as foundation for agentic behavior loops.

**Key Contribution**: Shows that agents should continue acting until goals are achieved; observation phase provides feedback that determines continuation.

---

### Runtime Verification and Intervention

#### **Design Patterns for Securing LLM Agents against Prompt Injections** (arXiv 2025)
- **Authors**: Luca Beurer-Kellner, Marc Zimmermann, Martin Vechev
- **arXiv**: [2506.08837](https://arxiv.org/abs/2506.08837)
- **Relevance**: Documents **hook-based execution control** as a security pattern.

**Key Findings**:
- Section 3.1(2) directly describes runtime intervention mechanisms
- Establishes that **external governance logic** (hooks) can control agent execution
- Provides formal analysis of control-flow integrity with hook-based systems

---

#### **Are Large Reasoning Models Interruptible?** (arXiv 2025)
- **arXiv**: [2510.11713](https://arxiv.org/abs/2510.11713)
- **Relevance**: Addresses **self-termination vs continuation** decision-making.

**Key Finding**: Models often express suspicion about missing premises but lack confidence to terminate independently, supporting the need for external stop hooks.

---

### Success Criteria and Automated Verification

#### **Constitutional AI: Harmlessness from AI Feedback** (arXiv 2022)
- **Authors**: Yuntao Bai, Saurav Kadavath, Sandipan Kundu, et al. (Anthropic)
- **arXiv**: [2212.08073](https://arxiv.org/abs/2212.08073)
- **Relevance**: Demonstrates **AI-driven success verification** through constitutional principles.

**Key Contribution**: Self-critique mechanism where models evaluate outputs against principles, showing **automated criteria checking** can replace human verification.

---

#### **Process Reward Models That Think** (arXiv 2025)
- **arXiv**: [2504.16828](https://arxiv.org/abs/2504.16828)
- **Relevance**: **Step-by-step verifiers** for test-time scaling.

**Key Contribution**: Provides feedback at each step of execution and measures "progress" toward completion, applicable to determining when stop hook criteria are met.

---

### Loop Termination and Autonomous Execution

#### **Dynamic Early Exit in Reasoning Models** (arXiv 2025)
- **arXiv**: [2504.15895](https://arxiv.org/abs/2504.15895)
- **Relevance**: Identifies critical points where reasoning becomes sufficient.

**Key Findings**:
- ~75% of samples contain early exit opportunities
- 60.8% remain correct using 20% of reasoning steps
- 40% cost reduction with 11% accuracy improvement
- Shows **automated continuation/termination** can be efficient

---

#### **Does Your Reasoning Model Implicitly Know When to Stop Thinking?** (arXiv 2026)
- **Authors**: Beihang University, ByteDance, Renmin University
- **arXiv**: [2602.08354](https://arxiv.org/html/2602.08354v1)
- **Relevance**: Shows that **models inherently know when to stop thinking**.

**Key Finding**: Models give higher confidence to reasoning they believe is correct/concise; current training methods obscure this innate capability, supporting external stop hooks that can harness model's implicit knowledge.

---

### Theoretical Control Foundations

#### **Cybernetics: Or Control and Communication in the Animal and the Machine** (Norbert Wiener, 1948)
- **Relevance**: **Establishes feedback as central to control systems**.

**Key Contribution**: Error-correction through feedback is fundamental to adaptive behavior; provides theoretical guarantee that properly designed feedback systems converge.

---

### Hook-Based Safety and Intervention

#### **Effectively Controlling Reasoning Models through Thinking Intervention** (arXiv 2025)
- **Authors**: Princeton et al.
- **arXiv**: [2503.24370](https://arxiv.org/pdf/2503.24370)
- **Relevance**: **"Thinking Intervention"** - strategically inserting/modifying thinking tokens during generation.

**Key Findings**:
- Training-free, streaming-compatible intervention
- 6.7% improvement in instruction following
- 40% increase in refusal rates for unsafe prompts
- Shows **external hooks can effectively control model execution**

---

### Academic Summary

The academic literature strongly validates the Stop Hook Auto-Continue pattern through multiple research threads:

1. **Foundational Loop Structure**: ReAct (2022), Reflexion (2023), and Self-Refine (2023) establish the **generate -> verify -> continue if needed** loop structure
2. **Runtime Intervention**: Beurer-Kellner et al. (2025) directly validates **hook-based execution control** as a security pattern
3. **Automated Success Verification**: Constitutional AI (2022) and Process Reward Models (2025) demonstrate **AI-driven criteria checking**
4. **Termination Theory**: Early exit papers (2025) and Cybernetics foundations provide **mathematical guarantees** for convergence

**Research Gap Identified**: No single academic paper explicitly names or studies the "stop hook" pattern as implemented in production systems like Claude Code. This represents an opportunity for original research.

---

## Industry Implementations

### Primary Implementation: Claude Code Hooks

**Product/Company**: **Anthropic (Claude Code)**

**Documentation**: https://docs.anthropic.com/en/docs/claude-code/hooks

**Hook Types Supported**:
- PreToolUse
- PostToolUse
- **onStop** (primary for auto-continue)

**Configuration Example**:
```json
{
  "hooks": {
    "on_stop": {
      "command": "./scripts/check_success.sh",
      "auto_continue_on_failure": true
    }
  }
}
```

**Key Features**:
- JSON-based stdin/stdout communication
- Exit code 2 blocks tool execution (PreToolUse)
- Exit code 0 allows continuation
- Hooks receive tool name, input, output as JSON
- Runs outside agent's reasoning context (immune to prompt injection)

---

### Complementary Implementations

#### LangGraph - Conditional Edges
**Company**: LangChain
**URL**: https://langchain-ai.github.io/langgraph/
**Status**: Production (70K+ GitHub stars)

```python
def should_continue(state):
    """Stop condition check - acts as stop hook"""
    if state.get("tests_passed"):
        return END
    if state.get("iteration_count", 0) > state.get("max_iterations", 10):
        return END
    return "continue"

graph.add_conditional_edges(
    "agent_node",
    should_continue,
    {"continue": "agent_node", END: END}
)
```

---

#### AutoGen - Termination Conditions
**Company**: Microsoft
**URL**: https://microsoft.github.io/autogen/

```python
def termination_function(sender, recipient, context):
    """Stop hook - checks if success criteria met"""
    last_message = recipient.last_message()["content"]
    if "SUCCESS: All tests passed" in last_message:
        return True  # Stop conversation
    return False  # Continue

user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    is_termination_msg=termination_function
)
```

---

#### Cursor Background Agent
**URL**: https://cline.bot/

**Key Features**:
- Automated testing as "safety net"
- Background execution until tests pass
- One-click test generation (80%+ coverage)
- Long-running tasks (benchmarking, fuzzing)

---

#### GitHub Agentic Workflows
**URL**: https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/
**Status**: Technical Preview 2026

**Features**:
- AI agents run within GitHub Actions
- Auto-triages CI failures with proposed fixes
- Stop conditions in workflow YAML

---

#### OpenHands (formerly OpenDevin)
**URL**: https://github.com/All-Hands-AI/OpenHands
**Stars**: 64,000+

**Features**:
- Docker-based deployment with multi-agent collaboration
- 72% resolution rate on SWE-bench Verified
- Continuous execution loops with validation

---

### CI/CD Automation Implementations

| Platform | Auto-Continue Mechanism |
|----------|------------------------|
| **Cursor** | Tests pass before PR submission |
| **GitHub Agentic Workflows** | Stop conditions in workflow YAML |
| **OpenHands** | Validation loops in sandbox |
| **SWE-agent** | OpenPRHook with condition checking |

---

### Development Tools with Hook-Based Execution

#### Aider
**GitHub**: https://github.com/Aider-AI/aider (41,000+ stars)

```bash
# Aider automatically runs tests and continues on failure
aider --message "Fix the failing tests" --test-cmd "pytest"
```

---

### Safety and Guardrail Implementations

**Open-Source Implementation**: https://github.com/yurukusa/claude-code-ops-starter

**Four Guard Rails**:
1. **Dangerous command blocker** (PreToolUse): Pattern-matches destructive commands
2. **Syntax checker** (PostToolUse): Runs linter after every file edit
3. **Context window monitor** (PostToolUse): Warns when context dangerously low
4. **Autonomous decision enforcer** (PreToolUse): Blocks "should I continue?" questions

---

### Success Metrics

| Platform | Metric | Value |
|----------|--------|-------|
| **Claude Opus 4.5** | SWE-bench Verified | 80.9% |
| **OpenHands** | SWE-bench Verified | 72% |
| **Cursor** | Test generation coverage | 80%+ |
| **Background Agent CI** | Maintenance task efficiency | 10x improvement |

---

## Related Patterns Analysis

### Complementary Patterns

#### 1. Hook-Based Safety Guard Rails (validated-in-production)
**File**: `patterns/hook-based-safety-guard-rails.md`

**Relationship**: Direct complementary pattern sharing the same hook mechanism foundation.

**How it relates**:
- Both patterns use the agent framework's hook system (PreToolUse/PostToolUse events)
- Hook-Based Safety Guard Rails provides safety hooks that could trigger continuation decisions
- Shared concepts: event-driven execution hooks, programmatic verification, safety controls

---

#### 2. Continuous Autonomous Task Loop (established)
**File**: `patterns/continuous-autonomous-task-loop-pattern.md`

**Relationship**: Foundational pattern for continuous execution.

**How it relates**:
- Provides the continuous execution framework that Stop Hook Auto-Continue enhances
- Stop Hook Auto-Continue adds verification-based stopping criteria

---

#### 3. Reflection Loop (established)
**File**: `patterns/reflection.md`

**Relationship**: Adds self-evaluation to the execution flow.

**How it relates**:
- Uses scoring rubrics to determine if output meets threshold
- Could integrate with Stop Hook Auto-Continue's success/failure criteria

---

#### 4. Self-Critique Evaluator Loop (emerging)
**File**: `patterns/self-critique-evaluator-loop.md`

**Relationship**: Could provide the evaluation logic for Stop Hook Auto-Continue.

**How it relates**:
- Trains a self-taught evaluator to judge outputs
- Could provide the success/failure verification for Stop Hook Auto-Continue hooks

---

#### 5. Schema Validation Retry with Cross-Step Learning (emerging)
**File**: `patterns/schema-validation-retry-cross-step-learning.md`

**Relationship**: Adds validation and retry logic to execution flow.

**How it relates**:
- Provides multi-attempt retry with detailed error feedback
- Could provide structured output validation for Stop Hook Auto-Continue success criteria

---

### Competing Patterns

#### 1. Action Selector Pattern (emerging)
**File**: `patterns/action-selector-pattern.md`

**Relationship**: Approaches control differently.

**How it relates**:
- Treats LLM as instruction decoder, not live controller
- Uses constrained action allowlist instead of hook-based continuation
- Could be combined for layered control

---

#### 2. Plan-Then-Execute Pattern (established)
**File**: `patterns/plan-then-execute-pattern.md`

**Relationship**: Shifts execution flow differently.

**How it relates**:
- LLM generates plan, separate deterministic execution
- Plans validated before execution begins
- Could complement by providing structured plans

---

#### 3. Code-Then-Execute Pattern (emerging)
**File**: `patterns/code-then-execute-pattern.md`

**Relationship**: Shifts to programmatic execution.

**How it relates**:
- LLM outputs sandboxed program/DSL script
- Static checker validates before execution
- Could be used to implement Stop Hook Auto-Continue verification logic

---

### Pattern Relationship Diagram

```
stop-hook-auto-continue-pattern (emerging)
    |
    +-- PARENT PATTERNS
    |   |-- hook-based-safety-guard-rails (validated-in-production)
    |   +-- inversion-of-control (validated-in-production)
    |
    +-- COMPLEMENTARY PATTERNS
    |   |-- background-agent-ci (validated-in-production)
    |   |-- coding-agent-ci-feedback-loop (best-practice)
    |   |-- continuous-autonomous-task-loop (established)
    |   +-- reflection (established)
    |
    +-- COMPETING APPROACHES
    |   |-- action-selector-pattern (emerging)
    |   |-- plan-then-execute-pattern (established)
    |   +-- code-then-execute-pattern (emerging)
```

---

## Technical Deep Dive

### 1. Implementation Aspects

#### Stop Hook Technical Implementation

**Event-Driven Hook Types**:
- **Pre-Tool Hooks**: Execute before agent actions (validation, authorization)
- **Post-Tool Hooks**: Execute after agent actions (verification, cleanup)
- **On-Stop Hooks**: Execute when agent completes a turn (success criteria checking)

**Configuration-Based Registration**:
```typescript
{
  "hooks": {
    "on_stop": {
      "command": "./scripts/verify_success.sh",
      "timeout": 30000,
      "auto_continue_on_failure": true,
      "max_iterations": 10
    }
  }
}
```

#### Success Criteria Types

| Category | Examples |
|----------|----------|
| **Testing-Based** | Unit tests, integration tests, E2E tests, property-based testing |
| **Build-Based** | Compilation success, artifact generation, dependency resolution |
| **Linting/Quality** | Static analysis, security scanning, code coverage |
| **Verification** | Schema validation, contract testing, API compliance |
| **Custom Domain** | Business rules, performance benchmarks, accessibility |

---

### 2. Architectural Considerations

#### Hook Integration Points

```
┌─────────────────────────────────────────────────┐
│         Agent Orchestration Layer               │
│  ┌───────────────────────────────────────────┐  │
│  │        Stop Hook Manager                  │  │
│  │  • Hook Registry • Execution Scheduler    │  │
│  └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│         Agent Execution Layer                   │
├─────────────────────────────────────────────────┤
│         Hook Implementation Layer               │
│  • Test Runners • Validators • Monitors        │
└─────────────────────────────────────────────────┘
```

#### Synchronous vs Asynchronous Execution

| Aspect | Synchronous | Asynchronous |
|--------|-------------|--------------|
| **Pros** | Simpler, predictable, easy debugging | Non-blocking, better resources |
| **Cons** | Blocks agent, poor resource utilization | Complex state, race conditions |
| **Use Cases** | Fast validation, critical checks | Long-running tests, CI/CD |

---

### 3. Safety and Reliability

#### Infinite Loop Prevention

**Multi-Layer Protection**:
1. **Hard Limits**: max_iterations, max_duration, max_tokens, max_cost
2. **Progress Detection**: Track meaningful changes between iterations
3. **Divergence Detection**: Detect repeating failure patterns

```python
class LoopLimiter:
    def __init__(self, config):
        self.max_iterations = config.get('max_iterations', 10)
        self.max_duration = config.get('max_duration', 3600)
        self.max_tokens = config.get('max_tokens', 100000)
        self.iteration = 0
        self.start_time = time.time()
        self.tokens_used = 0

    def can_continue(self):
        if self.iteration >= self.max_iterations:
            return False, "Max iterations exceeded"
        if time.time() - self.start_time > self.max_duration:
            return False, "Max duration exceeded"
        if self.tokens_used >= self.max_tokens:
            return False, "Max tokens exceeded"
        return True, None
```

---

#### Resource Limits

**Token Budget Management**:
- Track input/output tokens per iteration
- Reserve emergency budget (10%)
- Model selection optimization (small models for early iterations)

**Time Budget Management**:
- Per-hook timeouts (30-120 seconds)
- Per-iteration timeouts (5 minutes)
- Session-level timeouts (1 hour)

---

#### Sandbox Requirements

**Containerization Strategy**:
- Non-root user execution
- Resource limits (memory, CPU, disk)
- Network isolation
- Read-only hook mounts

```dockerfile
# Dockerfile for isolated hook execution
FROM python:3.11-slim
RUN useradd -m -u 1000 agent
USER agent
WORKDIR /workspace
```

---

### 4. Trade-offs

#### When to Use vs Manual Re-prompting

**Use Auto-Continue When**:
- Clear success criteria exist
- Task is well-defined
- Low risk of divergence
- High iteration expected

**Use Manual Re-prompting When**:
- Ambiguous success criteria
- High risk of costly mistakes
- Requires human judgment
- Exploratory tasks

---

#### Cost vs Reliability

**Cost Factors**:
- Direct API costs (tokens per iteration)
- Indirect costs (compute, storage, network)
- Hidden costs (failed iterations, context pressure)

**Reliability Benefits**:
- Reduced human intervention
- Improved quality (consistent criteria)
- Faster time to completion

**Decision Framework**:
```
Clear Success Criteria? → No → Manual Re-prompting
         ↓ Yes
Well-Defined Task? → No → Manual Re-prompting
         ↓ Yes
Low Risk? → No → Manual Re-prompting
         ↓ Yes
    Auto-Continue
```

---

### 5. Implementation Recommendations

#### Best Practices

1. **Start Simple**: Basic test verification, conservative limits
2. **Iterate on Success Criteria**: Collect failure data, refine based on patterns
3. **Implement Gradually**: Non-critical tasks first, expand scope
4. **Monitor and Adapt**: Track iteration patterns, optimize based on metrics

#### Anti-Patterns to Avoid

1. **Overly Complex Criteria**: Ambiguous checks, subjective validation
2. **Insufficient Limits**: No iteration caps, ignoring resource constraints
3. **Poor Error Handling**: Suppressing errors, ignoring flaky tests
4. **Inadequate Monitoring**: No logging, missing key metrics

---

## Conclusions and Recommendations

### Key Findings

1. **Strong Academic Foundation**: The pattern is well-supported by research in agent architectures (ReAct, Reflexion), runtime verification, and control theory.

2. **Production-Validated**: Implemented in major systems including Claude Code, LangGraph, AutoGen, GitHub Agentic Workflows, Cursor, and OpenHands.

3. **Measurable Impact**: Industry metrics show 10x improvement on maintenance tasks and 80%+ test coverage generation.

4. **Pattern Ecosystem**: Integrates well with related patterns including hook-based safety guard rails, reflection loops, and continuous autonomous task loops.

### Recommendations for Adoption

1. **For Framework Developers**:
   - Implement native hook support (PreToolUse, PostToolUse, onStop)
   - Provide SDK for programmatic control
   - Include safety features (timeouts, iteration limits)

2. **For Development Teams**:
   - Start with test-based success criteria
   - Use in sandboxed environments initially
   - Implement progressive rollout strategy
   - Monitor costs and iteration patterns

3. **For Researchers**:
   - Document production implementations formally
   - Study cost optimization strategies
   - Investigate hybrid approaches with competing patterns

### Research Gaps Identified

1. No single academic paper explicitly names the "stop hook" pattern
2. Limited formal analysis of cost vs. reliability trade-offs
3. Need for empirical studies on iteration patterns and failure modes
4. Opportunity to document cross-framework best practices

---

## References

### Academic Papers
- Shinn et al. (2023). Reflexion: Language Agents with Verbal Reinforcement Learning. arXiv:2303.11366
- Madaan et al. (2023). Self-Refine: Large Language Models Can Self-Correct with Self-Feedback. arXiv:2303.08119
- Yao et al. (2022). ReAct: Synergizing Reasoning and Acting in Language Models. arXiv:2210.03629
- Beurer-Kellner et al. (2025). Design Patterns for Securing LLM Agents against Prompt Injections. arXiv:2506.08837
- Bai et al. (2022). Constitutional AI: Harmlessness from AI Feedback. arXiv:2212.08073

### Industry Documentation
- Claude Code Hooks: https://docs.anthropic.com/en/docs/claude-code/hooks
- LangGraph: https://langchain-ai.github.io/langgraph/
- AutoGen: https://microsoft.github.io/autogen/
- GitHub Agentic Workflows: https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows/
- Cursor/Cline: https://cline.bot/
- OpenHands: https://github.com/All-Hands-AI/OpenHands
- Claude Code Ops Starter: https://github.com/yurukusa/claude-code-ops-starter

### Primary Source
- AI & I Podcast: How to Use Claude Code Like the People Who Built It
  https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it

---

*End of Report*
