# Explicit Posterior-Sampling Planner - Industry Implementations Report

**Generated:** 2026-02-27
**Research Focus:** Real-world implementations of PSRL and Thompson sampling in LLM agent systems
**Pattern Status:** emerging
**Category:** Orchestration & Control

---

## Executive Summary

The **Explicit Posterior-Sampling Planner** pattern uses Posterior Sampling for Reinforcement Learning (PSRL) embedded in LLM reasoning to provide principled exploration/exploitation balancing. This report documents industry implementations and related patterns.

**Key Finding:** While the specific PSRL-in-LLM pattern is emerging, Thompson sampling and Bayesian exploration strategies are widely deployed in production systems for:
- A/B testing and variant selection
- Multi-armed bandit optimization
- Agent routing and selection
- Recommendation systems

---

## Table of Contents

1. [Direct Pattern Implementations](#1-direct-pattern-implementations)
2. [Thompson Sampling in Production](#2-thompson-sampling-in-production)
3. [Bayesian RL Frameworks](#3-bayesian-rl-frameworks)
4. [Related Industry Patterns](#4-related-industry-patterns)
5. [Code Repositories](#5-code-repositories)
6. [Use Cases and Applications](#6-use-cases-and-applications)
7. [Verification Status](#7-verification-status)

---

## 1. Direct Pattern Implementations

### Primary Academic Source

**Toward Efficient Exploration by LLM Agents**
- **Authors:** Dilip Arumugam, Thomas L. Griffiths
- **arXiv:** 2504.20997 (April 2025)
- **Source:** https://arxiv.org/abs/2504.20997
- **Status:** Academic research, not yet directly implemented in known production systems

**Pattern Description:**
- Embeds fully specified PSRL algorithm inside LLM reasoning
- Maintains Bayesian posterior over task models
- Samples models, computes optimal policies, updates posteriors
- Expresses each step in natural language for LLM execution

**Current Status:** The pattern is documented in the awesome-agentic-patterns repository as "emerging" status with no verified production implementations found.

---

## 2. Thompson Sampling in Production

### 2.1 Agent Experimentation Platforms

#### Dogfooding with Rapid Iteration Pattern
**Repository Context:** awesome-agentic-patterns
**File:** `/home/agent/awesome-agentic-patterns/research/dogfooding-with-rapid-iteration-for-agent-improvement-report.md`

**Implementation Pattern:**
```python
class AgentExperiment:
    def assign_variant(self, user_id: str) -> AgentVariant:
        """Assign variant using Thompson sampling"""
        # Thompson sampling for exploration/exploitation balance
        best_variant = max(
            self.variants,
            key=lambda v: self.sample_beta(v.id)
        )
        return best_variant
```

**Key Features:**
- Beta distribution sampling for variant selection
- Balances exploration of new variants vs. exploitation of known performers
- Real-time feedback integration for posterior updates
- Statistical winner determination with confidence intervals

**Use Case:** A/B testing multiple agent variants in production

---

### 2.2 Multi-Armed Bandit in Industry

**Common Production Applications:**

1. **Recommendation Systems**
   - Netflix, Amazon, Spotify: Content personalization
   - Thompson sampling for exploration/exploitation in item recommendation
   - Bayesian updates based on user engagement

2. **Online Advertising**
   - Google, Meta: Ad placement optimization
   - Real-time bid price optimization
   - Click-through rate maximization

3. **Web Optimization**
   - VWO, Optimizely: Website variant testing
   - Conversion rate optimization
   - Dynamic traffic allocation

4. **Clinical Trials**
   - Adaptive randomization for treatment assignment
   - Patient outcome-based response probability updates

**Key Implementation Pattern:**
```python
# Standard Thompson sampling for binary outcomes
class ThompsonSampler:
    def __init__(self, n_arms):
        self.alpha = np.ones(n_arms)  # Successes
        self.beta = np.ones(n_arms)   # Failures

    def select_arm(self):
        """Sample from Beta posterior for each arm"""
        samples = [np.random.beta(self.alpha[i], self.beta[i])
                   for i in range(len(self.alpha))]
        return np.argmax(samples)

    def update(self, arm, reward):
        """Update posterior with observed reward"""
        if reward == 1:
            self.alpha[arm] += 1
        else:
            self.beta[arm] += 1
```

---

## 3. Bayesian RL Frameworks

### 3.1 Open Source Implementations

#### RLax (DeepMind)
- **Repository:** https://github.com/deepmind/rlax
- **Description:** JAX-based RL library with Bayesian components
- **Features:** Distributional RL, uncertainty estimation

#### TensorFlow Probability
- **Repository:** https://github.com/tensorflow/probability
- **Description:** Probabilistic programming for Bayesian neural networks
- **Features:** Bayesian layers, distributions for RL

#### PyMC
- **Repository:** https://github.com/pymc-devs/pymc
- **Description:** Probabilistic programming in Python
- **Features:** MCMC, variational inference for RL applications

#### BORG (Bayesian Optimization for RL)
- **Repository:** Various implementations on GitHub
- **Description:** Bayesian optimization applied to RL hyperparameter tuning

#### rlberry
- **Repository:** https://github.com/rlberry-py/rlberry
- **Description:** RL framework with some Bayesian methods
- **Features:** Tools for RL research and experimentation

---

### 3.2 LLM Agent Frameworks with Exploration

#### LangChain / LangGraph
- **Status:** Most mature framework (200k+ GitHub stars)
- **Exploration Approach:** ReAct Pattern (Thought → Action → Observation)
- **Not PSRL:** Uses heuristic exploration, not principled Bayesian methods

**Pattern Implementation:**
```python
from langchain.agents import AgentExecutor
from langchain.tools import tool

@tool
def search(query: str) -> str:
    """Search network information"""
    return f"Search results for: {query}"

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

#### OpenAI Swarm
- **Repository:** https://github.com/openai/swarm
- **Pattern:** Lightweight multi-agent orchestration
- **Exploration:** Decentralized agent handoff via function calls
- **Not Bayesian:** Deterministic handoff based on LLM selection

#### Microsoft AutoGen / Agent Framework
- **Repository:** https://github.com/microsoft/autogen
- **Documentation:** https://learn.microsoft.com/en-us/agent-framework/
- **Exploration:** Multi-agent conversation with routing
- **Not PSRL:** Rule-based and LLM-guided routing

---

## 4. Related Industry Patterns

### 4.1 Agent RFT (Reinforcement Fine-Tuning)
**Relationship to PSRL:** Alternative approach

| Aspect | PSRL | Agent RFT |
|--------|------|-----------|
| **When Applied** | Inference time | Offline training |
| **Learning** | Online posterior updates | Weight updates |
| **Model** | Frozen LLM | Fine-tuned LLM |
| **Exploration** | Principled Bayesian | RL algorithm (PPO/GRPO) |

**Production Status:** Agent RFT is validated-in-production at:
- Cognition (Devon AI) - File planning
- Ambience Healthcare - ICD-10 coding
- Rogo Finance - Financial reasoning
- Modular - GPU kernel generation

---

### 4.2 Action Selector Pattern
**Repository Context:** `/home/agent/awesome-agentic-patterns/patterns/explicit-posterior-sampling-planner.md`

**Connection:** Both patterns address action selection, but:
- Action Selector: Security-focused, restricts LLM to pre-approved actions
- PSRL Planner: Exploration-focused, balances exploration/exploitation

**Industry Implementations:**
- Anthropic Claude Tool Use
- OpenAI Function Calling
- LangChain AgentExecutor
- Clawdbot (production security implementation)

---

### 4.3 Memory Reinforcement Learning (MemRL)
**Relationship:** Runtime learning without weight updates

| Aspect | MemRL | PSRL |
|--------|-------|------|
| **Model** | Frozen LLM | Frozen LLM |
| **Learning** | Memory utilities | Posterior updates |
| **Storage** | Episodic memory | Belief state |
| **Persistence** | Across sessions | Episode-bound |

---

## 5. Code Repositories

### 5.1 Direct PSRL Implementations

**No direct PSRL-in-LLM production repositories found.**

The pattern remains primarily academic with the following research sources:

1. **Arumugam & Griffiths (2025)**
   - Paper: "Toward Efficient Exploration by LLM Agents"
   - arXiv: 2504.20997
   - https://arxiv.org/abs/2504.20997

2. **awesome-agentic-patterns Pattern Definition**
   - File: `/home/agent/awesome-agentic-patterns/patterns/explicit-posterior-sampling-planner.md`
   - Status: emerging
   - Authors: Nikola Balic (@nibzard)

---

### 5.2 Related Thompson Sampling Repositories

#### Multi-Armed Bandit Libraries
1. **Vowpal Wabbit**
   - Repository: https://github.com/VowpalWabbit/vowpal_wabbit
   - Features: Contextual bandits, Thompson sampling
   - Production: Used at Microsoft and others

2. **Microsoft Decision Service**
   - Repository: https://github.com/microsoft/DecisionService
   - Features: Contextual bandit service
   - Production: Enterprise deployment

3. **TensorFlow Bandits**
   - Repository: https://github.com/google-research/tensorflow_bandits
   - Features: Bayesian optimization for bandits

#### LLM Agent Frameworks
1. **LangChain**
   - Repository: https://github.com/langchain-ai/langchain
   - Stars: 200k+
   - Status: Production-validated

2. **OpenAI Swarm**
   - Repository: https://github.com/openai/swarm
   - Status: Lightweight orchestration

3. **ByteDance TRAE Agent**
   - Repository: https://github.com/bytedance/TRAE-agent
   - Performance: 75.2% on SWE-bench Verified
   - Features: Tool retrieval and action execution

---

## 6. Use Cases and Applications

### 6.1 Documented Use Cases

#### A/B Testing and Agent Variant Selection
**Implementation:** Thompson sampling for variant assignment
**Location:** Dogfooding pattern documentation
**Application:**
- Selecting between agent variants during development
- Real-time performance-based traffic allocation
- Statistical winner determination

**Metrics Tracked:**
- Task success rate
- Output quality (CRScore, human ratings)
- Efficiency (token usage, latency, tool calls)
- User satisfaction (adoption, retention)
- Safety (policy violations)

---

#### Recommendation Systems
**Companies:** Netflix, Amazon, Spotify
**Method:** Thompson sampling on item selection
**Application:**
- Content personalization
- User engagement optimization
- Cold-start problem handling

---

#### Online Advertising
**Companies:** Google, Meta
**Method:** Bayesian bandit optimization
**Application:**
- Ad placement optimization
- Bid price tuning
- Click-through rate maximization

---

#### Clinical Trials
**Method:** Adaptive randomization
**Application:**
- Treatment arm assignment
- Response-adaptive randomization
- Patient outcome optimization

---

### 6.2 Potential LLM Agent Use Cases

**Unverified - Theoretical Applications:**

1. **Tool Selection in Multi-Tool Environments**
   - Balance exploration of new tools vs. exploiting known effective tools
   - Learn which tools work best for specific task types

2. **Agent Routing in Multi-Agent Systems**
   - Route tasks to agent variants based on posterior success probabilities
   - Adapt routing strategies based on performance feedback

3. **Prompt Template Selection**
   - Select between prompt variants based on task success
   - Explore new prompt strategies while exploiting known effective ones

4. **Code Generation Strategy Selection**
   - Choose between different code generation approaches
   - Balance trying new strategies vs. using proven methods

---

## 7. Verification Status

### Confirmed Implementations

1. **Thompson Sampling in A/B Testing**
   - Documented in dogfooding pattern
   - Used for agent variant selection
   - Beta distribution sampling implementation

2. **Bayesian Exploration in Industry**
   - Confirmed in recommendation systems
   - Confirmed in online advertising
   - Confirmed in web optimization platforms

3. **Related Agent Patterns**
   - Agent RFT: Production-validated
   - Action Selector: Production-validated
   - Memory RL: Conceptual pattern

---

### Not Found / Unverified

1. **Direct PSRL-in-LLM Implementations**
   - No production systems found embedding PSRL in LLM reasoning
   - Pattern remains academic/theoretical

2. **Bayesian RL in LLM Agents**
   - No frameworks implementing full Bayesian RL for LLM agents
   - Thompson sampling used only for variant selection, not action selection

3. **Posterior Maintenance in Production**
   - No evidence of production systems maintaining Bayesian posteriors over MDP models
   - Most systems use heuristic exploration (epsilon-greedy, UCB)

---

### Research Gaps

1. **Implementation Complexity**
   - PSRL requires maintaining and updating posteriors
   - Computationally expensive for large state/action spaces
   - LLM context window limitations

2. **Reward Design**
   - Requires well-specified reward functions
   - Credit assignment challenges in multi-step scenarios
   - Sparse rewards in many agentic tasks

3. **Scalability**
   - Posterior representation for complex tasks unclear
   - Approximation methods needed for real-world applications
   - Integration with LLM generation patterns

---

## 8. Best Practices for Implementation

### For Thompson Sampling (Production-Ready)

1. **Start Simple**
   - Use Beta-Bernoulli model for binary outcomes
   - Implement basic Thompson sampling before complex extensions

2. **Monitor Convergence**
   - Track posterior distributions over time
   - Detect when exploration can be reduced

3. **Handle Delayed Feedback**
   - Account for reward latency in updates
   - Use appropriate reward aggregation

4. **Ensure Orthogonality**
   - Separate exploration policy from core agent logic
   - Allow swapping exploration strategies

---

### For PSRL in LLMs (Experimental)

1. **Bounded Environments**
   - Start with small, well-defined tasks
   - Use measurable reward signals

2. **Explicit State Management**
   - Track posterior as explicit state variable
   - Include in agent context window

3. **Instrumentation**
   - Log posterior updates for debugging
   - Monitor exploration/exploitation balance

4. **Reward Design**
   - Use dense, shaped rewards
   - Prevent reward hacking with multi-criteria evaluation

---

## 9. Conclusion

The **Explicit Posterior-Sampling Planner** pattern is an emerging approach that remains primarily academic. While Thompson sampling and Bayesian exploration are widely deployed in production systems for A/B testing, recommendation, and optimization, direct implementation of PSRL embedded in LLM reasoning has not been found in production systems.

**Key Findings:**

1. **Thompson Sampling Production-Validated:** Widely used for variant selection and bandit optimization
2. **PSRL in LLMs Emerging:** No production implementations found; pattern documented but not deployed
3. **Related Patterns Mature:** Agent RFT, Action Selector have production validation
4. **Implementation Complexity:** Posterior maintenance and reward design present challenges

**Recommendations:**

- For production: Use Thompson sampling for variant selection (well-understood, stable)
- For research: Explore PSRL-in-LLM in bounded environments with clear rewards
- For frameworks: Consider adding posterior sampling as an exploration strategy option

---

## References

### Primary Sources
- Arumugam & Griffiths (2025). "Toward Efficient Exploration by LLM Agents"
  - https://arxiv.org/abs/2504.20997
- awesome-agentic-patterns repository
  - Pattern: /patterns/explicit-posterior-sampling-planner.md

### Related Documentation
- Agent Reinforcement Fine-Tuning Report
- Action Selector Industry Implementations Report
- Dogfooding with Rapid Iteration Report

### Frameworks
- LangChain: https://github.com/langchain-ai/langchain
- OpenAI Swarm: https://github.com/openai/swarm
- Vowpal Wabbit: https://github.com/VowpalWabbit/vowpal_wabbit
- TensorFlow Bandits: https://github.com/google-research/tensorflow_bandits

---

**Report Status:** Research complete
**Last Updated:** 2026-02-27
**Verification:** No direct PSRL-in-LLM production implementations found; pattern remains emerging
