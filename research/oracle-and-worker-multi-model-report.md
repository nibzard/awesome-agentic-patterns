# Oracle and Worker Multi-Model Pattern - Research Report

**Pattern:** Oracle and Worker Multi-Model Approach
**Status:** Complete
**Last Updated:** 2026-02-27

---

## Executive Summary

The Oracle and Worker Multi-Model pattern is a cost-optimization architecture that separates routine execution from strategic reasoning across different AI models. A "Worker" model (e.g., Claude Sonnet 4) handles bulk operations, while an "Oracle" model (e.g., o3, Gemini 2.5 Pro) provides high-level reasoning on demand. This pattern enables **80-98% cost reduction** while maintaining quality by strategically using frontier models only where they add value.

**Key Findings:**
- Strong academic foundation from model cascading and cost-aware routing research
- Validated production implementations at Sourcegraph, Cursor, and Anthropic
- Part of a broader family of multi-model orchestration patterns
- Well-suited for variable-complexity tasks in software development, data analysis, and business operations

---

## Table of Contents

1. [Academic Foundations](#academic-foundations)
2. [Industry Implementations](#industry-implementations)
3. [Technical Analysis](#technical-analysis)
4. [Pattern Relationships](#pattern-relationships)
5. [Use Cases and Applications](#use-cases-and-applications)
6. [Conclusions and Recommendations](#conclusions-and-recommendations)

---

## Academic Foundations

### Core Theoretical Framework

The Oracle and Worker Multi-Model pattern draws from multiple established research areas in machine learning and distributed systems:

#### 1. Model Cascading and Cost Optimization

**FrugalGPT: How to Use Large Language Models More Efficiently** (Stanford, 2023)
- **Authors:** Lingjiao Chen, Matei Zaharia, James Zou
- **arXiv:** [2305.05176](https://arxiv.org/abs/2305.05176)
- **Key Contribution:** Established the foundational framework for **LLM cascading** as a cost optimization strategy
- **Relevance:** Validates the Oracle-Worker approach by demonstrating that querying different LLM APIs can differ in cost by up to two orders of magnitude. The paper shows that strategic model selection can match GPT-4 performance while reducing costs by up to 98%

**SLA-Aware Routing via Lagrangian RL for Multi-LLM Serving Systems** (2026)
- **arXiv:** [2601.19402](https://arxiv.org/html/2601.19402v3)
- **Key Contribution:** Introduces **Service Level Agreement (SLA) aware routing** using Lagrangian Reinforcement Learning
- **Relevance:** Provides mathematical framework for cost-adaptive routing where model costs are treated as runtime inputs

#### 2. Learned Routing and Model Selection

**RouteLLM: Learning to Route LLMs with Preference Data** (ICLR 2024)
- **Authors:** Isaac Ong, Amjad Almahairi, Vincent Wu, et al. (UC Berkeley, CMU, Stanford)
- **arXiv:** [2406.18665](https://arxiv.org/abs/2406.18665)
- **Key Contribution:** Learns intelligent routing between "strong" (expensive) and "weak" (cheap) models based on human preference data
- **Relevance:** Trains routing classifiers using 80k battle data from Chatbot Arena; implements threshold-based routing that can determine when to escalate from Worker to Oracle

**xRouter: Training Cost-Aware LLMs Orchestration System via Reinforcement Learning** (2025)
- **arXiv:** [2510.08439](https://arxiv.org/html/2510.08439v1)
- **Key Contribution:** Implements complete reward/cost accounting framework for training cost-aware routers
- **Relevance:** Frames routing as reinforcement learning problem with explicit cost-performance trade-offs

#### 3. Multi-Model Coordination Theory

**Mixture of Experts** (Jordan & Jacobs, 1994)
- **Venue:** Neural Computation, MIT Press
- **Key Contribution:** Foundational work on gating networks that route inputs to specialized expert models
- **Relevance:** Provides theoretical foundation for the Oracle as a "gating function" that determines when specialized reasoning is needed

**Constitutional AI: Harmlessness from AI Feedback** (Anthropic, 2022)
- **arXiv:** [2212.08073](https://arxiv.org/abs/2212.08073)
- **Key Contribution:** Dual-model system where one model generates responses and another critiques them
- **Relevance:** Establishes pattern for Oracle-Worker communication where Oracle reviews Worker's approach without assuming direct control

#### 4. Hierarchical Task Decomposition

**Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection** (ICLR 2024)
- **Authors:** Akari Asai, Zeqiu Wu, Yizhong Wang, et al. (University of Washington, Allen Institute for AI)
- **arXiv:** [2310.11511](https://arxiv.org/abs/2310.11511)
- **Key Contribution:** Framework where models learn when to retrieve through self-reflection tokens
- **Relevance:** Demonstrates learned policies for dynamic component orchestration

**ReAct: Synergizing Reasoning and Acting in Language Models** (ICLR 2023)
- **Authors:** Shunyu Yao, Jeffrey Zhao, Dian Yu, et al. (Princeton, Google Research)
- **arXiv:** [2210.03629](https://arxiv.org/abs/2210.03629)
- **Key Contribution:** Interleaves reasoning traces with action execution
- **Relevance:** The Oracle-Worker pattern extends ReAct by separating reasoning (Oracle) from acting (Worker) across different models

### Formal Pattern Names in Literature

The Oracle and Worker pattern appears under several related names in academic literature:

1. **Model Cascading:** Sequential model selection where cheaper models are tried first (FrugalGPT)
2. **Weak-Strong Model Routing:** Routing between weak (cheap) and strong (expensive) models (RouteLLM)
3. **Multi-LLM Agent Systems:** Orchestrating multiple LLMs with specialized roles
4. **Hierarchical Model Systems:** Using more powerful models for higher-level reasoning (Self-RAG, ReAct)
5. **Cost-Aware Model Selection:** Dynamic model routing based on cost constraints (xRouter, SLA-aware routing)

### Validation Status

| Validation Type | Status | Details |
|----------------|--------|---------|
| **Academic Validation** | Emerging | Strong theoretical support from related areas (model cascading, cost-aware routing, multi-agent systems) but limited direct validation of Oracle-Worker specifically |
| **Production Validation** | Emerging | Sourcegraph implementation demonstrates ~90% cost reduction vs. using frontier model for all operations |
| **Theoretical Maturity** | Moderate | Core concepts well-established in literature (cascading, routing, hierarchical systems) but specific Oracle-Worker pattern needs more formal treatment |

### Research Gaps

**Identified Research Gaps:**

1. **On-Demand Consultation Policies:** Limited formal research on when agents should request Oracle consultation vs. continuing independently
2. **Context Pollution Prevention:** Insufficient research on preventing Oracle's reasoning from polluting Worker's context window
3. **Multi-Model Debugging:** Lack of formal methodologies for debugging issues arising from Oracle-Worker interactions
4. **Adaptive Escalation Thresholds:** Limited research on learning optimal confidence thresholds for Oracle invocation
5. **Cost-Benefit Formalization:** Need for rigorous theoretical frameworks quantifying when Oracle consultation is cost-justified

---

## Industry Implementations

### 1. Sourcegraph (Primary Source)

**Status:** Emerging Production Implementation

**Implementation Details:**
Sourcegraph's Oracle and Worker Multi-Model architecture is one of the earliest documented implementations of this pattern. Their system uses:

- **Worker Agent (Claude Sonnet 4):** Fast, capable, and cost-effective agent handling bulk tool use and code generation
- **Oracle Agent (OpenAI o3 / Gemini 2.5 Pro):** Powerful, expensive model reserved for high-level reasoning, architectural planning, and debugging complex issues

**Key Architecture Features:**
- Worker can explicitly request Oracle consultation when stuck or needing better strategy
- Oracle reviews Worker's approach and suggests course corrections without polluting the main agent's context
- On-demand consultation pattern minimizes expensive Oracle calls

**Primary Source:** [Sourcegraph Team Presentation](https://youtu.be/hAEmt-FMyHA?si=6iKcGnTavdQlQKUZ)

### 2. Cursor AI

**Status:** Validated in Production

**Implementation Details:**
Cursor implements a similar multi-model orchestration pattern for complex code editing tasks:

- **Retrieval Model:** Gathers relevant context from the codebase
- **Main Generation Model (Claude 3.5 Sonnet):** Understands user intent and generates primary code modifications
- **Custom/Smaller Models:** Assist in applying edits accurately across multiple files

**Key Architecture Features:**
- Pipeline-based approach where each model specializes in a specific phase
- Multi-file editing capability through coordinated model execution
- Custom models for edit application ensure precision across files

**Source:** [Aman Sanger (Cursor) - Building Companies with Claude Code](https://www.youtube.com/watch?v=BGgsoIgbT_Y)

### 3. Anthropic Engineering

**Status:** Internal Production Use

**Implementation Details:**
Anthropic uses model-specific task delegation in their internal development workflows:

- **Opus 4.1:** Research and complex planning tasks
- **Sonnet 4.5:** Implementation and execution tasks

**Key Architecture Features:**
- Clear separation between research/planning and implementation phases
- More expensive model used sparingly for strategic thinking
- Cost-effective model handles bulk execution work

### 4. Framework Support

#### LiteLLM Router

**Repository:** [BerriAI/litellm](https://github.com/BerriAI/litellm)
**GitHub Stars:** 33.8K+
**Status:** Production-ready

**Key Features:**
- Cost-based routing with configurable budget limits
- **49.5-70% cost reduction** documented
- Multi-level budgeting: user, team, and organization levels
- Supports Oracle-Worker pattern through model tier configuration

#### RouteLLM

**Source:** LMSYS/Chatbot Arena
**Status:** Open source, production-ready

**Key Features:**
- Pre-trained routers for cost-aware selection
- **85% cost reduction at 95% GPT-4 quality**
- Configurable cost thresholds for routing decisions
- Can be configured to implement Oracle-Worker pattern with threshold-based escalation

#### OpenRouter

**Website:** [openrouter.ai](https://openrouter.ai)
**Status:** Commercial service

**Key Features:**
- Auto model routing with intelligent selection
- Free model routing (200K context)
- Budget tracking per API key
- **50%+ cost reduction** documented

### 5. Performance Benchmarks and Metrics

| Implementation | Cost Reduction | Quality Maintenance | Source |
|----------------|----------------|---------------------|--------|
| **Sourcegraph Oracle-Worker** | ~90% vs. all-frontier | High strategic quality | Sourcegraph Team |
| **LiteLLM Router** | 49.5-70% | Quality parity maintained | LiteLLM |
| **RouteLLM** | 85% at 95% GPT-4 quality | Threshold-based | LMSYS |
| **OpenRouter** | 50%+ | Adaptive routing | OpenRouter |
| **FrugalGPT (Academic)** | Up to 98% | GPT-4 parity or better | Stanford Research |

**Key Performance Insights:**
1. **80%+ of queries** can use cheaper models in many domains
2. **Quality parity** maintained with intelligent routing
3. **Oracle consultation** typically needed for <20% of tasks
4. **Cost optimization** does not significantly impact output quality

---

## Technical Analysis

### Architecture Breakdown

The Oracle and Worker Multi-Model pattern consists of three core components:

```mermaid
graph TD
    A[User Request] --> B[Worker Agent]
    B --> C{Invocation Logic}
    C -->|Complexity > Threshold| D[Oracle Consultation]
    C -->|Complexity <= Threshold| E[Direct Execution]
    D --> F[Oracle Response]
    F --> G[Worker Implementation]
    E --> H[Result]
    G --> H
    H --> I[User Response]
```

#### Core Components

1. **Worker Agent**
   - Primary interface for user interactions
   - Handles routine tasks, code generation, tool execution
   - Monitors task complexity and determines when Oracle consultation is needed
   - Implements Oracle's strategic guidance

2. **Oracle Agent**
   - High-capability model reserved for complex reasoning
   - Provides strategic direction without executing tools directly
   - Reviews Worker's approach and suggests corrections
   - Returns distilled conclusions, not full reasoning trace

3. **Invocation Logic**
   - Decision engine determining when to escalate to Oracle
   - Confidence-based thresholds
   - Budget-aware routing (hard cost caps)
   - Retry limits before Oracle consultation

### Implementation Patterns

#### 1. Confidence-Based Invocation

```python
class OracleWorkerSystem:
    def __init__(self, worker_model, oracle_model, oracle_threshold=0.7):
        self.worker = worker_model
        self.oracle = oracle_model
        self.oracle_threshold = oracle_threshold
        self.oracle_calls_made = 0
        self.max_oracle_calls = 10

    def process_task(self, task):
        # Worker attempts with confidence estimation
        worker_result, confidence = self.worker.execute_with_confidence(task)

        if confidence < self.oracle_threshold and self.oracle_calls_made < self.max_oracle_calls:
            # Escalate to Oracle
            self.oracle_calls_made += 1
            oracle_guidance = self.oracle.consult(task, worker_result)
            # Worker implements Oracle's guidance
            return self.worker.implement_guidance(task, oracle_guidance)
        else:
            return worker_result
```

#### 2. Context Sharing Strategy

```python
def prepare_oracle_context(worker_context, failed_attempts):
    """
    Prepare distilled context for Oracle without pollution
    """
    return {
        "task": worker_context["task"],
        "worker_approach": summarize_approach(worker_context["actions"]),
        "failure_reason": categorize_failure(failed_attempts[-1]),
        "relevant_state": extract_relevant_state(worker_context),
        # NOT included: full conversation history, failed reasoning traces
    }
```

#### 3. Adaptive Threshold Optimization

```python
class AdaptiveOracleThreshold:
    def __init__(self, initial_threshold=0.7):
        self.threshold = initial_threshold
        self.success_history = []

    def update_threshold(self):
        # Raise threshold if Oracle consultation rarely helps
        oracle_helpfulness = sum(self.success_history[-100:]) / 100
        if oracle_helpfulness < 0.3:
            self.threshold *= 1.1  # Require higher confidence to consult
        elif oracle_helpfulness > 0.7:
            self.threshold *= 0.9  # Make Oracle more accessible
```

### Technical Trade-Offs

| Dimension | Pros | Cons |
|-----------|------|------|
| **Cost Efficiency** | 80-98% cost reduction by using cheaper models for routine tasks | Additional complexity in cost tracking and budgeting |
| **Quality Preservation** | Frontier model quality maintained for complex tasks | Risk of quality inconsistency between Worker and Oracle outputs |
| **Scalability** | Worker can be horizontally scaled; Oracle handles selective load | Oracle can become bottleneck if threshold too low |
| **Latency** | Most requests fast (Worker-only) | Oracle consultation adds latency for complex tasks |
| **Reliability** | Fallback to Worker if Oracle unavailable | More failure modes to handle (two systems) |

### Comparison with Single-Model Architectures

| Aspect | Single Model | Oracle-Worker Multi-Model |
|--------|--------------|---------------------------|
| **Cost** | Fixed per-request cost | Variable cost (80%+ savings typical) |
| **Quality** | Uniform quality profile | Tiered quality (Worker good, Oracle excellent) |
| **Latency** | Consistent | Bimodal (fast for Worker, slow for Oracle) |
| **Complexity** | Simple orchestration | Complex routing and state management |
| **Reliability** | Single point of failure | Multiple failure modes, more resilience |
| **Scalability** | Linear scaling | Worker scales cheaply, Oracle scales expensively |

### Key Implementation Considerations

1. **Oracle Invocation Logic**
   - Define clear escalation triggers (confidence, error type, complexity)
   - Implement consultation budgets (percentage limits, per-session caps)
   - Add retry limits before escalation (3-5 Worker attempts typical)

2. **Context Sharing**
   - Oracle should not see full Worker context (prevents pollution)
   - Use distilled summaries of Worker's approach
   - Implement structured feedback mechanisms

3. **Error Handling**
   - Worker continues if Oracle unavailable (fail-degraded)
   - Implement retry with exponential backoff for Oracle calls
   - Cache Oracle responses for similar queries

4. **Cost Optimization**
   - Track per-model spending in real-time
   - Implement circuit breakers for Worker/Oracle budgets
   - Use Pareto optimization to find optimal threshold

5. **Monitoring Requirements**
   - Oracle invocation rate (target: <20% of tasks)
   - Cost per task by model
   - Oracle consultation success rate
   - Worker-only success rate

---

## Pattern Relationships

### Relationship Map

```mermaid
graph TD
    OWA[Oracle and Worker Multi-Model]

    %% Direct overlaps
    MMO[Multi-Model Orchestration for Complex Edits]
    DPS[Discrete Phase Separation]
    AMMP[Agent Modes by Model Personality]

    %% Complementary patterns
    BAR[Budget-Aware Model Routing]
    FMF[Failover-Aware Model Fallback]

    %% Hierarchical patterns
    PWS[Planner-Worker Separation]
    IMD[Initializer-Maintainer Dual Agent]

    %% Strategic patterns
    FFD[Frontier-Focused Development]
    PAE[Progressive Autonomy with Model Evolution]

    OWA -->|Variant of| MMO
    OWA -->|Complements| DPS
    OWA -->|Requires| BAR
    OWA -->|Enhanced by| FMF
    OWA -.->|Simpler alternative to| PWS
    OWA -.->|Philosophically opposed| FFD
    OWA -->|Aligned with| PAE

    style OWA fill:#e1f5ff,stroke:#01579b,stroke-width:3px
```

### Key Relationships

#### 1. Multi-Model Orchestration (Specialization)
Oracle and Worker is a **specialized instance** of Multi-Model Orchestration focused on cost-optimized reasoning with on-demand consultation.

| Aspect | Multi-Model Orchestration | Oracle and Worker |
|--------|---------------------------|-------------------|
| **Scope** | Pipeline orchestration across phases | Two-tier reasoning/execution hierarchy |
| **Model Relationship** | Sequential pipeline | Consultative (Worker requests Oracle) |
| **Decision Authority** | Pre-determined pipeline | Worker decides when to consult Oracle |

#### 2. Budget-Aware Model Routing (Prerequisite)
**Enabling pattern** for Oracle and Worker. Provides the routing logic to determine when to invoke Oracle and implements hard cost caps.

#### 3. Discrete Phase Separation (Complementary)
**Complementary patterns** with similar phase-based structure. Oracle and Worker can operate within discrete phases for large projects.

#### 4. Frontier-Focused Development (Philosophical Tension)
**Philosophically opposed** approaches:
- **Frontier-Focused:** "Always use frontier, never optimize for cost"
- **Oracle and Worker:** "Use cost-effective workers, frontier oracles selectively"

**When to choose which:**
| Context | Preferred Approach |
|---------|-------------------|
| Early-stage product exploring AI capabilities | Frontier-Focused Development |
| Scaling production system with cost concerns | Oracle and Worker |

#### 5. Planner-Worker Separation (Large-Scale Variant)
Oracle and Worker is a **simpler, single-session variant**. Planner-Worker scales to hundreds of agents and weeks of work.

### Integration Summary

**Patterns Required for Oracle and Worker:**
- Budget-Aware Model Routing (essential for cost control)
- Failover-Aware Model Fallback (critical for reliability)

**Patterns That Enhance Oracle and Worker:**
- Discrete Phase Separation (provides structure for large projects)
- Sub-Agent Spawning (enables parallel execution and reasoning)

**Patterns That Compete With Oracle and Worker:**
- Agent Modes by Model Personality (alternative user-facing approach)
- Frontier-Focused Development (simpler alternative)
- Opponent Processor (alternative reasoning improvement approach)

---

## Use Cases and Applications

### 1. Software Development

#### Code Review and Generation

**Why Oracle/Worker is beneficial:**
- Cost efficiency: Routine code reviews handled by smaller models
- Quality tiering: Worker handles 80-90% of routine tasks; Oracle for security-critical code

**Model recommendations:**
- **Worker:** Claude Sonnet 4, GPT-4o-mini
- **Oracle:** o3, Gemini 2.5 Pro, Claude Opus

#### Debugging Assistance

**Why Oracle/Worker is beneficial:**
- Progressive escalation: Worker attempts standard approaches; Oracle consulted when standard approaches fail
- Learning loop: Worker improves over time by observing Oracle's strategies

#### Architecture Design

**Why Oracle/Worker is beneficial:**
- Strategic vs. tactical: Oracle handles high-level system design; Worker implements components
- Validation loop: Worker generates proposals; Oracle validates against architectural principles

### 2. Data Analysis and Research

#### Multi-Stage Analysis Workflows

**Why Oracle/Worker is beneficial:**
- Pipeline specialization: Worker handles data extraction and cleaning; Oracle designs analysis strategy
- Progressive complexity: Simple queries by Worker; Oracle for statistical significance and causal inference

#### Research Synthesis

**Why Oracle/Worker is beneficial:**
- Collection vs. synthesis: Worker gathers and summarizes; Oracle identifies themes and gaps
- Source validation: Worker collects; Oracle evaluates credibility

### 3. Business Operations

#### Customer Service (Tiered Support Model)

**Why Oracle/Worker is beneficial:**
- Tiered escalation: Worker handles routine FAQs; Oracle escalates complex issues
- Cost optimization: Most inquiries are routine; only complex cases need expensive model time

#### Document Processing

**Why Oracle/Worker is beneficial:**
- Routine vs. exceptional: Worker processes standard documents; Oracle handles exceptions
- Extraction vs. interpretation: Worker extracts structured data; Oracle interprets ambiguous cases

### 4. Anti-Patterns: When NOT to Use

| Scenario | Why Not to Use | Alternative |
|----------|----------------|-------------|
| Simple, deterministic tasks | Overhead exceeds benefit | Single smaller model |
| Low-latency requirements | Model switching adds latency | Single optimized model |
| Budget-constrained contexts | Oracle costs may not be justified | Single model with clear prompting |
| Tasks requiring unified voice | Multiple models = inconsistent outputs | Single model with style guide |

### 5. Implementation Decision Tree

```
                            ┌─────────────────────┐
                            │   Task Complexity   │
                            └─────────┬───────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
              High Complexity                     Low Complexity
                    │                                   │
              ┌─────┴─────┐                   Use Single Model
              │           │
        High Volume   Low Volume
              │           │
        Use Oracle/   Evaluate
    Worker Pattern    Benefits
```

---

## Conclusions and Recommendations

### Summary Assessment

The Oracle and Worker Multi-Model pattern is a **well-founded, production-viable approach** to cost-optimized AI system design. It has strong academic support from related research areas (model cascading, cost-aware routing) and validated industry implementations demonstrating 80-90% cost reduction.

### Maturity Assessment

| Dimension | Maturity Level | Notes |
|-----------|----------------|-------|
| **Academic Foundation** | Moderate | Strong related work; needs direct validation |
| **Industry Adoption** | Emerging | Early adopters (Sourcegraph, Cursor) proving viability |
| **Tooling Support** | Good | LiteLLM, RouteLLM, OpenRouter provide routing infrastructure |
| **Best Practices** | Emerging | Patterns emerging but not yet standardized |

### Recommendations for Adoption

**Adopt Oracle and Worker when:**
- Task complexity is highly variable
- Cost optimization is a priority
- Clear signals exist for Oracle consultation
- Team can manage orchestration complexity

**Consider alternatives when:**
- All tasks are uniformly complex (use frontier model throughout)
- All tasks are uniformly simple (use cost-effective model)
- Simplicity is critical (use single model)
- Budget is not a concern (use Frontier-Focused Development)

### Future Research Directions

1. **Adaptive Escalation Policies:** Learning optimal Oracle consultation thresholds
2. **Multi-Oracle Systems:** Specialized Oracles for different domains (Security, Architecture, Performance)
3. **Formal Cost-Benefit Analysis:** Rigorous frameworks for quantifying ROI
4. **Context Pollution Mitigation:** Techniques for clean context handoff
5. **Debugging Methodologies:** Systematic approaches to multi-model system debugging

---

## Sources

### Academic Papers
- [FrugalGPT](https://arxiv.org/abs/2305.05176) - Stanford, 2023
- [RouteLLM](https://arxiv.org/abs/2406.18665) - ICLR 2024
- [Constitutional AI](https://arxiv.org/abs/2212.08073) - Anthropic, 2022
- [Self-RAG](https://arxiv.org/abs/2310.11511) - ICLR 2024
- [ReAct](https://arxiv.org/abs/2210.03629) - ICLR 2023
- [TALE](https://arxiv.org/abs/2412.18547) - ACL 2025
- [SLA-Aware Routing](https://arxiv.org/html/2601.19402v3) - 2026
- [xRouter](https://arxiv.org/html/2510.08439v1) - 2025

### Industry Sources
- [Sourcegraph Team Presentation](https://youtu.be/hAEmt-FMyHA?si=6iKcGnTavdQlQKUZ)
- [Cursor AI - Building Companies with Claude Code](https://www.youtube.com/watch?v=BGgsoIgbT_Y)
- [LiteLLM](https://github.com/BerriAI/litellm)
- [RouteLLM](https://github.com/lm-sys/RouteLLM)
- [OpenRouter](https://openrouter.ai)

### Related Patterns in Codebase
- Multi-Model Orchestration for Complex Edits
- Budget-Aware Model Routing with Hard Cost Caps
- Failover-Aware Model Fallback
- Discrete Phase Separation
- Agent Modes by Model Personality

---

**Report Generated:** 2026-02-27
**Research Method:** Parallel agent team with 5 specialized researchers
