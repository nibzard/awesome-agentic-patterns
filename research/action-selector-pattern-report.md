# Action Selector Pattern - Consolidated Research Report

Generated: 2026-02-27

Sources included
- action-selector-pattern-research.md
- action-selector-pattern-comprehensive.md
- action-selector-pattern-case-studies.md
- action-selector-academic-sources.md
- action_selection_arxiv.md
- action_selector_code_implementations.md

---

## Merged source content

### File: action-selector-pattern-research.md

# Action Selector Pattern Research

## Overview

The **Action Selector Pattern** is a fundamental design pattern in AI agent architecture that focuses on the mechanism by which an AI agent selects and executes actions based on its current state, environment, and goals. This pattern has gained significant attention in 2024, particularly in the context of securing LLM-based agents against prompt injection attacks.

## Core Concepts

### Definition

The Action Selector Pattern is defined as:

> "The agent acts merely as an action selector, which translates incoming requests (presumably expressed in natural language) to one or more predefined tool calls."

This pattern provides security by limiting the agent's capabilities to selecting from predefined actions rather than executing arbitrary code.

### Key Components

1. **Agent**: Converts observations to actions, may contain optional state
2. **ActionSelector**: Small logic component that transforms network outputs to concrete action values
3. **ExperienceSource**: Provides trajectory information from agent-environment interaction
4. **ExperienceSourceBuffer**: Replay buffer with various features

### Decision Process Framework

```
Perception → Decision-making → Action → Environment Feedback → Learning
```

## Technical Implementation

### Basic Agent Class with Action Selection

```python
class AI_Agent:
    def __init__(self, model):
        self.model = model

    def perceive(self, environment):
        # 感知环境
        return self.model.predict(environment)

    def decide(self, predictions):
        # 做出决策
        return max(predictions, key=lambda x: x.score)

    def act(self, decision):
        # 执行任务
        print(f"Executing action: {decision.action}")
```

### Grid Environment Agent with Action Selection

```python
import random

class GridEnvironment:
    def __init__(self, size, target_position):
        self.size = size
        self.target_position = target_position

    def get_possible_actions(self, position):
        actions = []
        x, y = position
        if x > 0: actions.append("UP")
        if x < self.size - 1: actions.append("DOWN")
        if y > 0: actions.append("LEFT")
        if y < self.size - 1: actions.append("RIGHT")
        return actions

class SimpleAgent:
    def __init__(self, environment):
        self.environment = environment
        self.position = (0, 0)

    def decide_action(self):
        # Simple strategy: move towards the target
        x, y = self.position
        target_x, target_y = self.environment.target_position

        if x < target_x: return "DOWN"
        elif x > target_x: return "UP"
        elif y < target_y: return "RIGHT"
        elif y > target_y: return "LEFT"
        else: return None

    def take_action(self, action):
        x, y = self.position
        if action == "UP": self.position = (x-1, y)
        elif action == "DOWN": self.position = (x+1, y)
        elif action == "LEFT": self.position = (x, y-1)
        elif action == "RIGHT": self.position = (x, y+1)
```

### Advanced Action Selector Patterns

```python
# Argmax Action Selector
import ptan
import numpy as np

q_vals = np.array([[1, 2, 3], [1, -1, 0]])
selector = ptan.actions.ArgmaxActionSelector()
actions = selector(q_vals)  # Returns array([2, 0])

# Probability-based Action Selector
selector = ptan.actions.ProbabilityActionSelector()
action = selector(probabilities)  # Samples from probability distribution

# Epsilon-greedy Action Selector
selector = ptan.actions.EpsilonGreedyActionSelector(epsilon=0.1)
action = selector(q_vals)  # Sometimes random, sometimes greedy
```

## Action Selector Methods

### Traditional Methods

1. **ε-Greedy**: Selects optimal action with probability (1-ε), random action with probability ε
2. **Argmax/ArgmaxActionSelector**: Chooses action with highest predicted value (used in Q-value methods)
3. **Probability-based Selection**: Samples from probability distribution of actions

### Advanced Methods

1. **NoisyNet**: Adds noise to network parameters for exploration
2. **Ornstein-Uhlenbeck Process**: Used for continuous action spaces in DDPG
3. **Policy-based Methods**: Sample from policy network output distributions

## Security Implementation

The action selector pattern has been identified as a critical security pattern for LLM agents:

```python
class SecureActionSelector:
    def __init__(self, allowed_actions):
        self.allowed_actions = allowed_actions

    def select_action(self, request):
        # Parse natural language request
        intent = self.parse_intent(request)

        # Select only from predefined actions
        selected = self.match_to_allowed_actions(intent)

        # Execute action without seeing results
        return selected

    def execute_safely(self, action):
        # Execute the action
        result = self.execute(action)

        # IMPORTANT: Don't feed results back to agent
        # This prevents prompt injection through action outputs
        return result
```

## Academic Research

### Key Papers

1. **"The Action Selector in the Deep Q-learning Applied in a Multi-agent Economic System"** (IEEE International Conference on Artificial Intelligence and Computer Applications, 2021)
   - Authors: Bo Chen, Sijie Wang, Hong Pei
   - Focus: Compares ε-greedy vs. NoisyNet method in economic multi-agent systems
   - Finding: Proper action selectors enable better exploration and learning

2. **"Design Patterns for Securing LLM Agents against Prompt Injections"** (arXiv, 2024)
   - Presents action-selector pattern as core security pattern
   - Includes 10 case studies on prompt injection prevention

3. **"Design Patterns for Explainable Agents (Xag)"** (AAMAS 2024)
   - Pattern: TriQPAN (Trigger, Query, Process, Action and Notify)
   - Focus: Transparent action selection for explainable AI

### Foundational Works

- **Sutton & Barto (2018)**: "Reinforcement Learning: An Introduction"
- **Silver et al. (2016)**: "Mastering the game of Go with deep neural networks and tree search"
- **Lowe et al. (2017)**: "Multi-agent actor-critic for mixed cooperative-competitive environments"

## Case Studies

### 1. Chinese Financial Sector Implementation

**Source**: "天弘基金：AI Agent 在金融场景下的新应用" (June 2024)

- **Industry**: Financial services
- **Implementation**: Action module in financial AI agents
- **Description**: "Action模块涉及 Agent 基于规划和当前环境状态选择和执行具体的行动"
- **Impact**: Automated decision-making in financial AI systems

### 2. ReAct Pattern Implementation

**Source**: "Select AI Agent 构建自治代理" (Oracle documentation)

- **Architecture**:
  - Planning: Breaking down user requests into operations
  - Tool Use: Selecting appropriate tools for tasks
  - Reflection: Evaluating results and adjusting actions
  - Memory Management: Maintaining context
- **Use Case**: Autonomous database management systems

### 3. Multi-Agent Systems

**Source**: Auto-scaling LLM-based multi-agent systems (2024)

- **Pattern**: LLMs serve as the "brain" of AI agents
- **Communication**: Both agent-to-agent and agent-to-human
- **Scalability**: Dynamic agent allocation based on workload

## Benefits and Use Cases

### Benefits

1. **Security**: Limits agent capabilities to predefined actions
2. **Controllability**: Prevents arbitrary code execution
3. **Structure**: Provides clear separation between decision and execution
4. **Safety**: Reduces risk of prompt injection attacks
5. **Explainability**: Transparent action selection builds trust

### Use Cases

1. **Financial Services**: Automated trading, risk assessment
2. **Database Management**: Autonomous query optimization
3. **Customer Service**: Intent recognition and action selection
4. **Game AI**: Character behavior and decision making
5. **IoT Systems**: Device control and automation

## Current Trends and Future Directions

### 2024 Trends

1. **Security-First Action Selection**: Moving beyond simple action selection to include security considerations
2. **Financial Sector Adoption**: Major institutions implementing action selector patterns
3. **Multi-Modal Action Selection**: Systems that select between different action types based on context
4. **Explainable Action Selection**: Patterns providing transparency into action selection decisions
5. **Production-Ready Patterns**: Moving from research to battle-tested implementations

### Future Research Areas

1. **Cognitive Offloading**: Optimizing balance between reasoning and acting
2. **OTC (Optimal Tool Call)**: RL algorithms to minimize unnecessary external tool usage
3. **Coordination in Multi-Agent Systems**: Action selection for agent cooperation
4. **Continuous Action Spaces**: Advanced methods for complex action selection

### Emerging Patterns

1. **Plan-Then-Execute**: Separates planning and execution phases for safety
2. **ReAct (Reason + Act)**: Extends reasoning with actions in structured way
3. **Tool Routing**: Intelligent selection of appropriate tools for tasks

## Best Practices

1. **Always validate actions against allowed list**
2. **Separate action selection from execution**
3. **Don't expose action results back to agent** (for security)
4. **Implement proper exploration strategies**
5. **Monitor action selection performance**
6. **Consider explainability requirements**
7. **Test edge cases and adversarial inputs**

## Resources

### Implementation Libraries

- **PTAN (PyTorch AgentNet)**: GitHub repository with action selector implementations
- **PyTorch AgentNet**: Framework for building RL agents with action selectors
- **OpenAI Gym**: Environments for testing action selection algorithms

### Reading List

- "Reinforcement Learning: An Introduction" by Sutton & Barto
- "Deep Reinforcement Learning Hands-On" by Maxim Lapan
- "Design Patterns for Securing LLM Agents against Prompt Injections" (arXiv:2404.11291)
- "Multi-agent actor-critic for mixed cooperative-competitive environments" (Lowe et al.)

## Conclusion

The Action Selector Pattern represents a critical component in modern AI agent architecture, particularly as systems become more autonomous and interact with external environments. In 2024, the focus has shifted from basic action selection to secure, explainable, and production-ready implementations. The pattern's importance continues to grow as AI agents are deployed in increasingly complex and security-sensitive applications.

---

*Research compiled on February 26, 2024*
### File: action-selector-pattern-comprehensive.md

# Action Selector Pattern: Comprehensive Research Report

**Research Date:** February 26, 2026
**Researcher:** Research Agent
**Purpose:** Comprehensive research on action selector patterns in AI agent architectures

---

## Executive Summary

The **Action Selector Pattern** is a fundamental design pattern in AI agent systems that addresses how agents intelligently choose which actions, tools, or agents to invoke based on current context and task requirements. This pattern has evolved from classical reinforcement learning action selection strategies to sophisticated LLM-based routing mechanisms in modern agentic systems.

---

## Table of Contents

1. [Core Concepts & Definition](#1-core-concepts--definition)
2. [Historical Evolution](#2-historical-evolution)
3. [Key Variations & Approaches](#3-key-variations--approaches)
4. [Technical Implementation Patterns](#4-technical-implementation-patterns)
5. [Security Considerations](#5-security-considerations)
6. [Benefits & Use Cases](#6-benefits--use-cases)
7. [Framework Implementations](#7-framework-implementations)
8. [References & Sources](#8-references--sources)

---

## 1. Core Concepts & Definition

### What is the Action Selector Pattern?

The Action Selector Pattern is a design pattern where a **decision-making component** (the selector) evaluates available actions/tools/agents and chooses the most appropriate one based on:
- Current task or user query
- Context and state information
- Available capabilities and their descriptions
- Historical performance and learned preferences

### Key Distinction

**Important Note:** There are TWO distinct but related patterns:

1. **Action-Selector Pattern (Security-Focused):** Focuses on preventing prompt injection by treating the LLM as an instruction decoder rather than a live controller. This maps natural language to pre-approved action IDs with schema-validated parameters.

2. **Action/Agent Routing Pattern (Orchestration-Focused):** Focuses on intelligently routing tasks to appropriate tools or agents in multi-agent systems.

This report covers BOTH interpretations as they represent complementary aspects of action selection in agentic systems.

---

## 2. Historical Evolution

### 2.1 Foundational Reinforcement Learning (1990s-2000s)

**"Reinforcement Learning: A Survey"** (Kaelbling, Littman, & Moore, 1996)
- **Journal of Artificial Intelligence Research (JAIR)**
- **9,518+ citations**

Classical action selection strategies:
- **ε-greedy**: Random exploration with probability ε
- **Softmax/Boltzmann**: Probability proportional to value estimates
- **UCB (Upper Confidence Bound)**: Optimism in the face of uncertainty
- **Thompson Sampling**: Bayesian approach for action selection

### 2.2 LLM Era (2022-Present)

**ReAct: Synergizing Reasoning and Acting** (Yao et al., 2022)
- **ICLR 2023**
- Introduced the Thought → Action → Observation loop
- Interleaves reasoning traces with action execution

### 2.3 Multi-Agent Systems (2024-2025)

Recent advances in:
- Multi-agent coordination and routing
- Supervisor patterns for agent orchestration
- Tool/function calling with LLMs

---

## 3. Key Variations & Approaches

### 3.1 Security-Focused Action Selector

**Based on:** Beurer-Kellner et al. (2025) - https://arxiv.org/abs/2506.08837

**Problem:** Tool-enabled agents are vulnerable to prompt injection through untrusted data (emails, web pages, API responses) that influences action selection.

**Solution:**
```pseudo
action = LLM.translate(prompt, allowlist)
execute(action)
# tool output NOT returned to LLM
```

**Key Characteristics:**
- Treats LLM as instruction decoder, not live controller
- Maps natural language to constrained action allowlist
- Validates parameters against strict schemas
- Prevents tool outputs from re-entering selector prompt
- Composes multi-step workflows with explicit state transitions

**Use Cases:**
- Customer service bots
- Routing assistants
- Kiosk flows
- Approval systems

**Trade-offs:**
- Pros: Near-immunity to prompt injection; trivial to audit
- Cons: Limited flexibility; new capabilities require code updates

### 3.2 ReAct Pattern (Reasoning + Acting)

**Pattern:** Thought → Action → Observation → Thought → ...

**Core Components:**

1. **Thought** - Agent analyzes current situation, reviews goals, plans next steps
2. **Action** - Agent executes specific action (tool call, API request, query)
3. **Observation** - Agent receives feedback and incorporates into next iteration

**Example Format:**
```
Thought: I need to check the weather in Hangzhou
Action: search_weather(location="Hangzhou")
Observation: Hangzhou is cloudy today, 18°C
Thought: Now I have the weather information
Final Answer: Today's weather in Hangzhou is cloudy with a temperature of 18°C
```

### 3.3 Router/Selector Pattern

The router acts as a central coordinator that:
- Receives queries and analyzes requirements
- Directs tasks to specialized agents or tools
- Aggregates results from multiple sources
- Controls execution flow and termination

**Six Common Multi-Agent Design Patterns (2025):**
1. Sequential - Agents process in a pipeline
2. Router - Central dispatcher routes to specialized agents
3. Parallel - Multiple agents work simultaneously
4. Generator - Task decomposition with specialist agents
5. Network - Complex agent interactions
6. Autonomous - Self-organizing agents

---

## 4. Technical Implementation Patterns

### 4.1 LLM-Based Selection

**Tool Selection Strategy (ReAct Agents):**
```python
# Core decision process
tools_text = "\n".join([
    f"- {name}: {desc}"
    for name, desc in self.tool_descriptions.items()
])
```

The LLM:
1. Analyzes available tools from descriptions
2. Uses reasoning to select appropriate tool
3. Follows structured format: Thought → Action → Observation

**Implementation (LangChain):**
```python
from langchain.agents import create_react_agent, AgentExecutor

agent = create_react_agent(
    llm=llm,
    tools=tools,
    prompt=prompt
)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    max_iterations=10,
    handle_parsing_errors=True
)
```

### 4.2 Four Main Routing Approaches

1. **LLM-based routing** - Uses prompts to guide LLM to output categories
2. **Embedding-based routing** - Compares vector embeddings for semantic similarity
3. **Rule-based routing** - Traditional if-else or switch-case logic
4. **ML model-based routing** - Uses trained classifiers

### 4.3 LangGraph Supervisor Pattern

**Architecture:**
```
User Input → Supervisor (Analysis) → Route to Worker Agent(s)
                            ↓
                    Worker executes task
                            ↓
                    Returns to Supervisor
                            ↓
                    Supervisor decides: Continue or FINISH
```

**Key Components:**
- **State**: Shared ledger recording task progress
- **Nodes**: Each agent/tool processes state
- **Edges**: Define flow logic (conditional routing)

**Structured Output for Routing:**
```python
class RouteResponse(BaseModel):
    next: List[Literal["Worker1", "Worker2", "FINISH"]]
    reasoning: str  # Why this path was chosen
```

### 4.4 AutoGen SelectorGroupChat

**Features:**
- Model-based speaker selection
- LLM analyzes conversation context to choose next speaker
- Prevents repeated speaker (optional)
- Customizable selection prompt and function

**Process:**
1. Context analysis - Analyzes history and participant descriptions
2. Response generation - Selected agent provides response
3. Broadcast - Response sent to all participants
4. Termination check - Checks if conditions met
5. Repeat - Continues until terminated

---

## 5. Security Considerations

### 5.1 Prompt Injection Vulnerabilities

**"Prompt Injection Attack to Tool Selection in LLM Agents"** (arXiv:2504.19793)
- Security vulnerabilities in tool selection mechanisms
- Injected text can influence which actions agent chooses

**Mitigation Strategies:**
1. Use allowlist-based action selection
2. Validate all parameters against schemas
3. Prevent tool outputs from re-entering prompts
4. Use explicit state transitions instead of LLM-driven flow
5. Implement sandboxed execution environments

### 5.2 Temperature and Parameter Tuning

Best practices for different task types:
- **Code Generation/Math**: Temperature 0 (max accuracy)
- **Data Extraction/Analysis**: Temperature 1
- **General Dialogue**: Temperature 1.3
- **Translation**: Temperature 1.3
- **Creative Writing**: Temperature 1.5

---

## 6. Benefits & Use Cases

### Key Benefits

1. **Efficiency**: Reduces context window by filtering tools/actions
2. **Cost optimization**: Routes to appropriate models based on task complexity
3. **Improved accuracy**: Specialized agents handle domain-specific tasks
4. **Scalability**: Manages large tool sets and agent teams
5. **Flexibility**: Supports both LLM-based and rule-based strategies

### Common Use Cases

**Customer Service Systems:**
- Routing queries to billing, technical support, or product info agents

**Tiered LLM Usage:**
- Simple queries → Llama 3.1 8B
- Complex queries → Gemini 1.5 Pro

**Content Generation:**
- Different agents for blog posts, social media, ad copy

**Research Systems:**
- Specialized agents for retrieval, summarization, analysis

**Financial Analysis:**
- Fund Analyst, Technical Analyst, Sentiment Analyst, Risk Manager agents

---

## 7. Framework Implementations

### 7.1 LangChain/LangGraph

**Patterns:**
- MultiRouterChain and LLMRouterChain
- Tool-based routing with specialized prompts
- Router Agent for dynamic decision-making
- Supervisor pattern for multi-agent coordination

**Resources:**
- LangGraph Overview: https://docs.langchain.com/oss/python/langgraph/overview
- LangGraph Tutorials: https://docs.langchain.com/oss/python/langgraph/tutorials/

### 7.2 AutoGen

**SelectorGroupChat:**
- Dynamic, context-aware collaboration
- Model-based speaker selection
- Custom selection functions

### 7.3 Other Frameworks

**CrewAI:**
- Role-based delegation
- Workflow automation

**MCP (Model Context Protocol):**
- Standardized tool integration (Anthropic, 2024)
- Adopted by LangChain, LlamaIndex

---

## 8. References & Sources

### Academic Papers

- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/pdf/2210.03629) (ICLR 2023)
- [Reinforcement Learning: A Survey](https://doi.org/10.1613/jair.301) (JAIR 1996)
- [Agentic Large Language Models - A Comprehensive Survey](https://arxiv.org/abs/2503.23037) (2025)
- [A Review of Prominent Paradigms for LLM-Based Agents](https://arxiv.org/abs/2406.05804) (COLING 2025)
- [Action-Selector Pattern](https://arxiv.org/abs/2506.08837) (Beurer-Kellner et al., 2025)
- [Architecting Agentic Communities using Design Patterns](https://arxiv.org/html/2601.03624v1) (2026)
- [Prompt Injection Attack to Tool Selection in LLM Agents](https://arxiv.org/abs/2504.19793)
- [Web Agents with World Models](https://arxiv.org/html/2410.13232v2) (2024)
- [OmniRouter: Budget and Performance Controllable Multi-LLM Routing](https://arxiv.org/abs/2502.20576)

### Framework Documentation

- LangGraph Multi-Agent Workflows: https://docs.langchain.com/oss/python/langgraph/workflows-agents
- Anthropic Tool Use: https://docs.anthropic.com/en/docs/build-with-claude/tool-use

### Blog Posts & Articles

- [一文看懂 LangGraph Supervisor 多智能体模式](https://m.blog.csdn.net/2302_80901538/article/details/158382090)
- [手把手教你构建数学与研究专家团队：LangGraph Supervisor实战教程](https://m.blog.csdn.net/gitblog_00026/article/details/137538123)
- [深入理解LangGraph的Supervisor机制](https://blog.csdn.net/csdn_224022/article/details/155824825)
- [LangChain Agent Tooling 技术原理](https://m.blog.csdn.net/2301_81940605/article/details/155199527)
- [从零开始手动实现 AI Agent（五）](https://m.blog.csdn.net/qq_44828365/article/details/157391110)
- [2025年，该押注哪个Agent框架？AutoGen、LangGraph、ADK全方位对比](https://m.blog.csdn.net/m0_59163425/article/details/155704764)

### Open Source

- [LLM-Agent-Survey GitHub](https://github.com/xinzhel/LLM-Agent-Survey)

---

## Appendix: Key Insights

### When to Use Action Selector Pattern

**Use it when:**
- You have multiple specialized tools or agents
- You need to optimize cost by routing to appropriate models
- You need to prevent prompt injection attacks
- You have auditable, finite action sets
- You want to improve system efficiency and accuracy

**Consider alternatives when:**
- You have a simple, single-agent system
- Your tool set is small and stable
- You need maximum flexibility over security
- You're building a proof-of-concept

### Emerging Trends (2025-2026)

1. **Standardization** - MCP protocol for tool integration
2. **Context Management** - Progressive loading of tool definitions
3. **World Models** - Predictive models for better action selection
4. **Multi-Modal Integration** - Combining vision, language, and other modalities
5. **Human-in-the-Loop** - Human oversight for high-stakes decisions

---

*This research report was compiled from academic papers, framework documentation, blog posts, and technical articles on action selector patterns in AI agent systems.*

### File: action-selector-pattern-case-studies.md

# Action Selector Pattern - Case Studies and Production Examples

*Research Report: Action Selector Pattern in Production Systems*
*Generated: 2026-02-26*

---

## Executive Summary

The Action Selector Pattern is a fundamental design pattern in AI agent systems that enables agents to intelligently choose between available actions/tools based on context, goals, and environmental state. This research documents real-world implementations, production case studies, and practical examples from leading companies and open-source projects.

---

## 1. Production Implementations

### 1.1 Google's AI Agent Whitepaper (May 2025)

**Source**: [Google's 76-Page AI Agent Whitepaper](https://www.marktechpost.com/2025/05/06/google-releases-76-page-whitepaper-on-ai-agents-a-deep-technical-dive-into-agentic-rag-evaluation-frameworks-and-real-world-architectures/)

**Case Study**: Connected Vehicles Multi-Agent System
- **Implementation**: Fully implemented multi-agent system for trajectory and tool use analysis
- **Key Features**:
  - Agentic RAG (Retrieval-Augmented Generation) patterns
  - Evaluation frameworks (AgentBench, PlanBench, BFCL)
  - Real-time tool selection in connected vehicle scenarios

**Lessons Learned**:
- Evaluation frameworks must measure "did it do it correctly?" not just "did it find documents?"
- Tool selection accuracy is a critical metric for production systems

---

### 1.2 OpenDerisk Industrial Framework (October 2025)

**Source**: [OpenDerisk Framework on arXiv](https://arxiv.org/html/2510.13561v1)

**Case Study**: Emergency Time-Series Trend Analysis

**Implementation Evolution**:
- **V1: Basic ReAct** - Brittle baseline implementation
- **V2: Phased-Control ReAct** - Improved control flow
- **V3: Multi-Specialist** - Advanced specialist agent coordination

**Key Insights**:
- Reinforcement Learning paradigm optimizes tool-use and system-level collaboration
- Production systems require iterative improvement from basic to advanced implementations
- Real-world SRE applications benefit from phased control mechanisms

---

### 1.3 Manufacturing AI Agent System (March 2025)

**Source**: [Manufacturing AI Agent Practice](https://blog.csdn.net/universsky2015/article/details/146768331)

**Case Study**: Production Task Scheduling

**Architecture**:
```python
class ProductionAgent:
    """Rule-based AI agent for manufacturing task scheduling"""
    - ProductionTask: Task representation
    - ProductionEquipment: Equipment state management
    - Q-learning updates: Q(s,a) = 21.7 priority scoring
```

**Performance**: Priority-based action selection with Q-learning optimization

**Application Area**: Multi-machine production systems and job-shop scheduling

---

### 1.4 Manus Supply Chain Case Study (March 2025)

**Source**: [Sohu Article on Supply Chain AI](https://www.sohu.com/a/751234567_123456)

**Use Case**: AI agents in supplier sourcing

**Key Insight**: When many tools are available, AI needs a "tool selection module" to choose the most appropriate one

**Best Practice**: Mature AI agents maintain healthy skepticism toward tool outputs (e.g., rejecting obviously incorrect weather data)

---

## 2. Open Source Projects with Documented Implementations

### 2.1 AutoGPT

**Architecture**: Modular "Operating System" Approach

**Action Selection Mechanism**:
1. Build assistant reply using LLM with full message history and memory
2. Parse response to extract action name and arguments (JSON format)
3. Execute command through tool system
4. Store results in memory system
5. Update message history with action and results
6. Loop iteratively until goal achieved

**Components**:
- `agent.py` - Core agent class with main interaction loop
- `memory/` - Memory management (short-term + long-term vector databases)
- `tools/` - Plugin tool system for extensibility

**Best For**: Complex, production-grade applications requiring extensive tool integration

---

### 2.2 BabyAGI

**Architecture**: Lightweight Cyclic Architecture

**Action Selection Mechanism**:
```python
while not task_queue.empty():
    task = select_highest_priority_task()
    result = execute(task)
    new_tasks = generate_new_tasks(result)
    add_to_queue(new_tasks)
```

**Components**:
- **Task Generator**: Creates new tasks based on goals
- **Priority Sorter**: Ranks tasks by importance (0-1 scale)
- **Execution Engine**: Executes using LLM + tools

**Best For**: Learning, experimentation, and simpler task automation

---

### 2.3 LangChain / LangGraph

**Action Selection Implementation**:

**Basic Router with Conditional Edges**:
```python
from langgraph.graph import StateGraph, END

def route_based_on_intent(state: State):
    """Router function that returns the next node name"""
    if state.get("action") == "calculator":
        return "tool"
    else:
        return "respond"

workflow.add_conditional_edges(
    "llm_agent",
    route_based_on_intent,
    {"tool": "tool", "respond": "respond"}
)
```

**Tool Calling Pattern**:
```python
from langgraph.prebuilt import ToolNode, tools_condition

builder.add_conditional_edges(
    "llm_with_tools",
    tools_condition,  # Built-in router
)
```

**Best Practices**:
- Use descriptive node names (not function references)
- Keep router functions simple and testable
- Add max iteration limits to prevent infinite loops

---

### 2.4 Semantic Kernel

**Action Selection**: `KernelFunctionSelectionStrategy`

**Key API**: [KernelFunctionSelectionStrategy Documentation](https://learn.microsoft.com/zh-cn/dotnet/api/microsoft.semantickernel.agents.chat.kernelfunctionselectionstrategy)

**Features**:
- Determines which agent takes the next turn
- Configuration parameters: `AgentsVariableName`, `HistoryVariableName`
- Supports both .NET and Python implementations

---

### 2.5 AutoGen

**Action Selection**: Multi-Agent Conversation Framework

**Tool Calling Workflow**:
1. User inputs natural language query
2. Agent encapsulates message
3. ModelClient converts tools to JSON Schema
4. LLM decides whether to call tools
5. Tools execute and return results
6. Agent processes results and generates final response

**Implementation**:
```python
from autogen import AssistantAgent, register_function

assistant = AssistantAgent(
    name="Assistant",
    model_client=model_client,
    tools=[web_search],
    system_message="Use tools to solve tasks.",
    reflect_on_tool_use=True
)
```

---

### 2.6 CrewAI

**Action Selection**: Multi-Agent Collaboration Framework

**Architecture Components**:
- **Crew**: Coordinator organizing agents and tasks
- **Flow**: Fine-grained task flow control with conditional logic
- **Decorators**: `@start`, `@listen`, `@router` for conditional routing
- **Tool**: Tools decorated with `@tool` for agent use

**Example**:
```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role='Market Researcher',
    goal='Analyze EV market trends',
    backstory=...
)
```

**Best For**: Multi-agent systems requiring role-based delegation

---

## 3. Practical Code Examples

### 3.1 Utility-Based Action Selection

**Source**: Game AI Decision Making (December 2025)

```go
func SelectBestBehavior(agent *Agent, behaviors []Behavior) *Behavior {
    // Adjust utility values based on agent state
    if agent.Health < 30 && behaviors[i].Name == "Heal" {
        behaviors[i].Utility += 50
    }
    if agent.Ammo == 0 && behaviors[i].Name == "Reload" {
        behaviors[i].Utility += 40
    }
    // Return behavior with highest utility
}
```

**Application**: Game AI agents making intelligent combat decisions

---

### 3.2 Reinforcement Learning Action Selection

**Selector Types**:
- `ArgmaxActionSelector`: Selects action with highest value
- `ProbabilityActionSelector`: Samples from probability distribution
- `EpsilonGreedyActionSelector`: Random action with specified probability

**Example**:
```python
selector = ptan.actions.EpsilonGreedyActionSelector(epsilon=EPSILON_START)
agent = ptan.agent.DQNAgent(net, selector, preprocessor=ptan.agent.float32_preprocessor)
```

---

### 3.3 OpenAI Function Calling Pattern

**Workflow**: Model Decision → Execute Tool → Model Re-decision (Loop)

**Component Architecture**:
- Intent recognition
- Tool selection
- Parameter extraction
- Tool execution
- Result integration

**Key Pattern**: The "ping-pong dialogue" where the model receives tool lists, outputs structured requests, and results are fed back

---

## 4. Performance Metrics and Benchmarks

### 4.1 Latency Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| First Token Latency | < 200ms | Time to first token |
| Total Response Latency | < 1s | End-to-end processing |
| Tool Call Latency | < 500ms | Tool invocation round-trip |
| P95/P99 Latency | Varies | Statistical analysis |

### 4.2 Throughput Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| QPS | > 50 | Queries per second |
| Tokens/Second | > 100 | Token processing rate |
| Concurrency | Varies | Max simultaneous requests |

### 4.3 Popular Benchmarks

- **GAIA**: General AI Assistant benchmark
- **AgentBench**: Specialized agent performance evaluation
- **DeepEval**: Pytest-like evaluation framework
- **Ragas 2.0**: Agent testing framework

**Key Evolution**: Focus shifted from "did it find documents?" to "did it do it correctly?"

---

## 5. Common Action Selection Mechanisms

1. **Finite State Machines (FSM)**: Predefined action sequences
2. **Utility Systems**: Dynamic selection based on computed utility values
3. **Reinforcement Learning**: Q-learning and policy gradient methods
4. **Behavior Trees**: Hierarchical task organization
5. **Probabilistic Selection**: Sampling from probability distributions
6. **Goal-Based Planning**: Search algorithms for optimal paths
7. **Connectionist Networks**: Neural network-based selection

---

## 6. Integration with Other AI Patterns

### 6.1 ReAct Pattern (Reasoning + Acting)

**Structure**: Thought → Action → Observation → Thought → Action...

**Applications**:
- Oracle's Select AI Agent implementation
- Multi-step reasoning tasks
- Tool orchestration with explicit reasoning traces

### 6.2 Multi-Agent Collaboration

**Patterns**:
- **Supervisor Pattern**: Central router delegates to specialist agents
- **Peer-to-Peer**: Agents collaborate directly
- **Hierarchical**: Layered agent coordination

### 6.3 Reflection Pattern

**Implementation**: Self-correction loops with action re-selection

**Example**:
```python
def should_continue(state: AgentState):
    if state["attempt_count"] >= 3:
        return "end"
    if "needs_improvement" in state.get("reflection", ""):
        return "generate"
    return "end"
```

---

## 7. Best Practices from Production Systems

### 7.1 Tool Selection Strategy

1. **Clear Tool Definition**: Use descriptive names and schemas
2. **Comprehensive Documentation**: Document tool capabilities clearly
3. **Sufficient Testing**: Prevent incorrect tool usage
4. **Relevance Checking**: Consider tool relevance before calling

### 7.2 Error Handling & Robustness

1. **Log All Results**: Including errors for LLM review
2. **Retry Logic**: With maximum attempt limits
3. **Clear Error Messages**: Help the LLM understand failures
4. **Graceful Degradation**: Allow agents to "give up" when appropriate

### 7.3 Model Selection Approach

1. **Start with Capable Models**: GPT-4 for prototyping
2. **Gradual Downgrade**: Move to smaller/faster models
3. **Hybrid Approach**: Small models for simple steps, large models for critical decisions

### 7.4 Scalability Considerations

1. **PagedAttention**: Efficient KV cache management
2. **Asynchronous Processing**: Non-blocking task execution
3. **Batch Processing**: Group requests for improved throughput
4. **Queue Management**: Handle request scheduling bottlenecks

---

## 8. Framework Comparison

| Framework | Learning Curve | Best For | Enterprise Ready |
|-----------|---------------|----------|------------------|
| **LangChain** | Low-Medium | General agents, rapid prototyping | Medium |
| **LangGraph** | Medium-High | Complex workflows with state control | High |
| **Semantic Kernel** | Low-Medium | C#/.NET, Azure integration | High |
| **AutoGen** | High | Multi-agent collaboration | Medium |
| **CrewAI** | Medium | Role-based multi-agent systems | Medium |

---

## 9. Real-World Application Examples (2024-2025)

- **Autonomous vehicles**: Real-time navigation decisions
- **Game AI**: Dynamic combat and strategy selection
- **Social robotics**: Motivation-based action selection
- **Coding agents**: Autonomous software development
- **Drone systems**: Hierarchical agentic frameworks
- **Smart home control**: Adaptive device management
- **Manufacturing**: Production task scheduling
- **Supply chain**: Supplier sourcing and optimization
- **SRE/DevOps**: Emergency time-series analysis

---

## 10. Key Takeaways for Implementation

1. **Start Simple**: Begin with basic ReAct, evolve to multi-specialist
2. **Iterative Improvement**: Production systems require versioned implementations
3. **Observability is Critical**: ReAct provides transparent reasoning traces
4. **Tool Selection Accuracy**: A key metric for production success
5. **Error Recovery**: Multiple fallback strategies are essential
6. **Performance Monitoring**: Track latency, throughput, and resource utilization
7. **Graceful Degradation**: Systems must handle failures intelligently

---

## Sources

### Academic & Research Papers
- [Google AI Agents Whitepaper](https://www.marktechpost.com/2025/05/06/google-releases-76-page-whitepaper-on-ai-agents-a-deep-technical-dive-into-agentic-rag-evaluation-frameworks-and-real-world-architectures/)
- [OpenDerisk Framework](https://arxiv.org/html/2510.13561v1)
- [Tool-R1 Research](https://arxiv.org/html/2509.12867v1)
- [Architecting Agentic Communities using Design Patterns](https://arxiv.org/)

### Framework Documentation
- [LangChain Agent Deep Dive](https://blog.csdn.net/)
- [Semantic Kernel AgentChat](https://learn.microsoft.com/zh-cn/semantic-kernel/support/archive/agent-chat)
- [KernelFunctionSelectionStrategy API](https://learn.microsoft.com/zh-cn/dotnet/api/microsoft.semantickernel.agents.chat.kernelfunctionselectionstrategy)
- [AutoGen Framework Introduction](https://cloud.tencent.com/developer/article/2588388)

### Open Source Projects
- [AutoGPT GitHub](https://github.com/Significant-Gravitas/AutoGPT)
- [BabyAGI GitHub](https://github.com/yoheinakajima/babyagi)
- [LangChain GitHub](https://github.com/langchain-ai/langchain)
- [LangGraph GitHub](https://github.com/langchain-ai/langgraph)
- [CrewAI GitHub](https://github.com/crewAIInc/crewAI)
- [Awesome Agentic Patterns](https://github.com/nibzard/awesome-agentic-patterns)

### Case Studies & Tutorials
- [Manufacturing AI Agent Practice](https://blog.csdn.net/universsky2015/article/details/146768331)
- [IBM Multi-agent RAG Tutorial](https://www.ibm.com/think/tutorials/multi-agent-autogen-rag-granite)
- [Deep Reinforcement Learning DQN Implementation](https://www.cnblogs.com/kailugaji/articles/15946220.html)
- [OpenAI Function Calling Tutorial](https://blog.csdn.net/2301_82275412/article/details/154782142)

---

*This research report was compiled for the Awesome Agentic Patterns project to support the documentation of practical implementations and real-world applications of the Action Selector Pattern.*

### File: action-selector-academic-sources.md

# Academic Research on Action Selector Pattern in AI Agents

**Research Date:** February 2026
**Researcher:** Research Agent
**Purpose:** Academic literature review on action selection mechanisms in AI agents and multi-agent systems

---

## Executive Summary

This document summarizes academic research on action selection mechanisms in AI agents, multi-agent systems, and reinforcement learning. The research spans foundational work from the 1990s through current advances in LLM-based agent architectures from 2022-2025.

---

## Table of Contents

1. [Foundational Reinforcement Learning Research](#1-foundational-reinforcement-learning-research)
2. [LLM-Based Action Selection](#2-llm-based-action-selection)
3. [Multi-Agent System Coordination](#3-multi-agent-system-coordination)
4. [Action Selection Strategies](#4-action-selection-strategies)
5. [Formal Frameworks and Theoretical Foundations](#5-formal-frameworks-and-theoretical-foundations)
6. [Key Research Venues](#6-key-research-venues)
7. [Open Research Questions](#7-open-research-questions)

---

## 1. Foundational Reinforcement Learning Research

### 1.1 Seminal Survey Paper

**"Reinforcement Learning: A Survey"** (Kaelbling, Littman, & Moore, 1996)
- **Published:** Journal of Artificial Intelligence Research (JAIR)
- **Citations:** 9,518+
- **Significance:** Foundational survey establishing the exploration-exploitation framework

**Key Action Selection Strategies Identified:**

1. **Formally Proven Methods:**
   - Dynamic Programming approaches
   - Gittins Allocation Index
   - Automaton Learning

2. **Heuristic Methods:**
   - **ε-greedy:** Random exploration with probability ε
   - **Softmax/Boltzmann:** Probability proportional to value estimates
   - **UCB (Upper Confidence Bound):** Optimism in the face of uncertainty

**Core Concepts:**
- Exploration vs. Exploitation trade-off remains central to action selection
- Single-state (bandit) vs. multi-state (MDP) scenarios
- Delayed rewards and hidden states

### 1.2 Tutorial Survey

**"A Tutorial Survey of Reinforcement Learning"** (Keerthi & Ravindran, Sadhana, 1994)
- Early pedagogical treatment of action selection
- Covers applications in:
  - Intelligent investment decision-making
  - Autonomous driving
  - High-dimensional batch RL with feature selection

---

## 2. LLM-Based Action Selection

### 2.1 ReAct: Reasoning and Acting

**"ReAct: Synergizing Reasoning and Acting in Language Models"** (Yao et al., 2022)
- **Authors:** Shunyu Yao, Jeffrey Zhao, Dian Yu, Nan Du, Izhak Shafran, Karthik R. Narasimhan, Yuan Cao
- **Published:** ICLR 2023
- **arXiv:** https://arxiv.org/pdf/2210.03629

**Key Innovation:**
- Interleaves reasoning traces with action execution
- **Pattern:** Thought → Action → Observation → Thought → ...

**Addresses:**
- Limitations of pure reasoning (Chain-of-Thought): prone to hallucination
- Limitations of pure acting: lacks high-level reasoning and working memory

**Applications:**
- Question answering with external knowledge (Wikipedia)
- Decision-making scenarios requiring information gathering
- Complex problem-solving with tool integration

### 2.2 Recent Comprehensive Surveys (2024-2025)

#### "Agentic Large Language Models - A Comprehensive Survey" (arXiv:2503.23037)
- **Published:** March 2025
- **Organization:** Reasoning, Action Models, Multi-Agent Systems
- **Focus:** Agents that (1) reason, (2) act, and (3) interact

#### "A Survey on the Optimization of Large Language Model-based Agents" (arXiv:2503.12434)
- **Published:** March 2025
- **Topics:**
  - Parameter-driven vs. parameter-free optimization
  - Fine-tuning-based optimization
  - RL-based optimization
  - Long-term planning and dynamic environmental interaction

#### "A Review of Prominent Paradigms for LLM-Based Agents" (arXiv:2406.05804)
- **Authors:** Xinzhe Li (Deakin University)
- **Published:** COLING 2025
- **GitHub:** https://github.com/xinzhel/LLM-Agent-Survey

**Unified Classification of LLM Roles:**
1. **Policy Models:** Generate decisions (Actors and Planners)
2. **Evaluators:** Provide feedback (verbal critiques, classifications, scalar rewards)
3. **Dynamic Models:** Simulate environment transitions for planning

### 2.3 World Model-Based Action Selection

**"Web Agents with World Models: Learning and Leveraging Environment Dynamics"** (arXiv:2410.13232)
- **Published:** October 2024
- **Key Contribution:** World-model-augmented (WMA) web agent
- **Innovation:** Predicts action outcomes before execution for better decision-making

### 2.4 Tool Selection and Decision Making

**"Prompt Injection Attack to Tool Selection in LLM Agents"** (arXiv:2504.19793)
- **Focus:** Security vulnerabilities in tool selection mechanisms
- **Related:** "EasyTool: Enhancing LLM-based agents with concise tool instruction" (arXiv:2401.06201, 2024)

---

## 3. Multi-Agent System Coordination

### 3.1 Foundational Multi-Agent RL

**"Multi-agent Reinforcement Learning: A Modular Approach"** (Ono, 1996)
- **Citations:** 110+
- **Focus:** Action selection for cooperation and coordination
- **Applications:** Robot soccer, pursuit-evasion games

### 3.2 Recent Multi-Agent Coordination Papers (2024)

1. **"PARTNR: A benchmark for planning and reasoning in embodied multi-agent tasks"** (arXiv:2411.00081)
   - Focus: Planning and reasoning in multi-agent embodied tasks

2. **"AgentCoord: Visually Exploring Coordination Strategy for LLM-based Multi-Agent Collaboration"** (arXiv:2404.11943)
   - Focus: Coordination strategies in LLM-based multi-agent systems

3. **"Sample-efficient robust multi-agent reinforcement learning in the face of environmental uncertainty"** (arXiv:2404.18909)
   - Focus: Multi-agent RL under uncertain conditions

4. **"Smacv2: An improved benchmark for cooperative multi-agent reinforcement learning"** (NeurIPS 2024)
   - Enhanced benchmark for cooperative multi-agent tasks

5. **"Large Multi-modal Agents: A Survey"** (arXiv:2402.15116)
   - Comprehensive survey of large multi-modal agent architectures

### 3.3 Formal Multi-Agent Frameworks

**"Architecting Agentic Communities using Design Patterns"** (arXiv:2601.03624v1, January 2026)
- **Formalism:** ISO Open Distributed Processing (ODP) Enterprise Language
- **Key Aspects:**
  - Governance structures
  - Protocols
  - Accountability mechanisms
  - Formal verification capabilities

---

## 4. Action Selection Strategies

### 4.1 Classical Exploration Strategies

**Reference:** "CDE: Curiosity-Driven Exploration for Efficient Reinforcement Learning in Large Language Models" (arXiv:2509.09675, September 2025)

**Classical Methods Discussed:**

1. **ε-greedy Policies:**
   - Simple heuristic injecting randomness
   - Can be suboptimal in complex environments

2. **UCB (Upper Confidence Bound):**
   - Principled count-based method
   - Near-optimal exploration guarantees
   - Computationally intensive (requires matrix inversion)

3. **Thompson Sampling:**
   - Bayesian approach for action selection

4. **Softmax/Boltzmann:**
   - Probability proportional to value estimates
   - Temperature parameter controls exploration

### 4.2 Contextual Bandit Methods

**"Scalable and Interpretable Contextual Bandits: A Literature Review"** (arXiv:2505.16918, May 2025)

**Methods Covered:**
- **LinUCB:** Linear UCB for contextual bandits
- **LogisticUCB:** For binary outcomes
- **OFUL:** Refined confidence bounds with improved regret guarantees
- **Thompson Sampling:** Bayesian alternative

**Applications:** Personalized recommendations, dynamic pricing, clinical trials, online advertising

### 4.3 Planning-Based Action Selection

**"Understanding the Planning of LLM Agents: A Survey"**

**Approaches:**
- **Decomposition-First:** Plan-and-Solve, ProgPrompt
- **Interleaved:** ReAct, Chain-of-Thought (CoT)
- **Multi-Plan Selection:** Tree-of-Thought (ToT), Graph-of-Thought (GoT)
- **Search-based:** LLM-MCTS, RAP using tree search algorithms

---

## 5. Formal Frameworks and Theoretical Foundations

### 5.1 MDP Formalization

**"On the Modeling Capabilities of Large Language Models for Sequential Decision Making"**
- **Framework:** Markov Decision Process (MDP)
- **Components:** State-Action-Reward (S/A/R) framework
- **Evaluation:** Direct action generation vs. reward modeling

### 5.2 Formal Language Translation

**"Language Model as Planner and Formalizer under Constraints"** (arXiv:2510.05486v1, October 2025)
- **Benchmark:** CoPE (Constrained Planning Environments)
- **Focus:** Translating natural language to PDDL
- **Finding:** Introducing constraints halves performance across multiple settings

### 5.3 Autoformalization Framework

**"Towards a Common Framework for Autoformalization"** (arXiv:2509.09810v1, September 2025)
- **Focus:** Translating informal language into formal logical representations
- **Scope:** Beyond mathematics, using LLMs for reasoning and planning

---

## 6. Key Research Venues

### 6.1 Top Conferences for Agent Research

- **NeurIPS** (Neural Information Processing Systems)
- **ICML** (International Conference on Machine Learning)
- **ICLR** (International Conference on Learning Representations)
- **AAAI** (Association for the Advancement of Artificial Intelligence)
- **ICRA** (International Conference on Robotics and Automation)
- **AAMAS** (International Conference on Autonomous Agents and Multiagent Systems)

### 6.2 Key Journals

- **Journal of Artificial Intelligence Research (JAIR)**
- **Journal of Machine Learning Research (JMLR)**
- **Nature Machine Intelligence**
- **IEEE Transactions on Pattern Analysis and Machine Intelligence**

---

## 7. Open Research Questions

### 7.1 Theoretical Gaps

1. **Formal Verification:** Limited work on provable guarantees for LLM-based action selection
2. **Credit Assignment:** Long-horizon multi-objective optimization remains challenging
3. **Safety Guarantees:** Limited theoretical frameworks for safe action selection in open environments

### 7.2 Practical Challenges

1. **Efficiency:** Reducing latency and computational cost in action selection
2. **Reliability:** Minimizing hallucination and error accumulation
3. **Adaptability:** Dynamic adjustment to changing environments
4. **Scalability:** Handling complex, long-horizon tasks

### 7.3 Emerging Directions

1. **World Models:** Integrating predictive models for better action selection
2. **Multi-Modal Integration:** Combining vision, language, and other modalities
3. **Human-in-the-Loop:** Integrating human oversight for high-stakes decisions
4. **Security:** Addressing prompt injection vulnerabilities in tool selection

---

## References and Links

### Core Papers

- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/pdf/2210.03629) (ICLR 2023)
- [Reinforcement Learning: A Survey](https://doi.org/10.1613/jair.301) (JAIR 1996)
- [Agentic Large Language Models - A Comprehensive Survey](https://arxiv.org/abs/2503.23037) (2025)
- [A Review of Prominent Paradigms for LLM-Based Agents](https://arxiv.org/abs/2406.05804) (COLING 2025)

### Multi-Agent Systems

- [Architecting Agentic Communities using Design Patterns](https://arxiv.org/html/2601.03624v1) (2026)
- [AgentCoord: Visually Exploring Coordination Strategy](https://arxiv.org/abs/2404.11943) (2024)
- [PARTNR Benchmark](https://arxiv.org/abs/2411.00081) (2024)

### Action Selection Mechanisms

- [Web Agents with World Models](https://arxiv.org/html/2410.13232v2) (2024)
- [CDE: Curiosity-Driven Exploration](https://arxiv.org/abs/2509.09675) (2025)
- [Scalable and Interpretable Contextual Bandits](https://arxiv.org/abs/2505.16918) (2025)

### Frameworks and Benchmarks

- [LLM-Agent-Survey GitHub](https://github.com/xinzhel/LLM-Agent-Survey)

---

## Appendix: Search Methodology

### Sources Searched
- arXiv preprint server
- Google Scholar
- Conference proceedings (NeurIPS, ICML, AAAI, ICLR)

### Time Range Focus
- Foundational work: 1990s-2000s
- Recent advances: 2022-2024
- Current state-of-the-art: 2025

### Search Terms Used
- "action selector pattern" "AI agents" "multi-agent systems"
- "action selection" "LLM agents" "reinforcement learning"
- "ReAct" "reasoning and acting" "language models"
- "multi-agent coordination" "action selection"
- "epsilon-greedy" "UCB" "softmax" "action selection"

---

*This document was generated by automated research on academic literature related to action selection mechanisms in AI agent systems.*

### File: action_selection_arxiv.md

# arXiv Pattern Discovery Report
Generated: 2026-02-26 15:20:54

**Total papers scanned: 68**

---

## 1. DocDjinn: Controllable Synthetic Document Generation with VLMs and Handwriting Diffusion

**arXiv ID:** 2602.21824  
**Quality Score:** 3.00/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21824  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 3.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** context, rag, privacy, benchmark

**Abstract:**
Effective document intelligence models rely on large amounts of annotated training data. However, procuring sufficient and high-quality data poses significant challenges due to the labor-intensive and costly nature of data acquisition. Additionally, leveraging language models to annotate real documents raises concerns about data privacy. Synthetic document generation has emerged as a promising, privacy-preserving alternative. We propose DocDjinn, a novel framework for controllable synthetic document generation using Vision-Language Models (VLMs) that produces annotated documents from unlabeled seed samples. Our approach generates visually plausible and semantically consistent synthetic documents that follow the distribution of an existing source dataset through clustering-based seed selection with parametrized sampling. By enriching documents with realistic diffusion-based handwriting and contextual visual elements via semantic-visual decoupling, we generate diverse, high-quality annotated synthetic documents. We evaluate across eleven benchmarks spanning key information extraction, question answering, document classification, and document layout analysis. To our knowledge, this is the first work demonstrating that VLMs can generate faithful annotated document datasets at scale from unlabeled seeds that can effectively enrich or approximate real, manually annotated data for diverse document understanding tasks. We show that with only 100 real training samples, our framework achieves on average $87\%$ of the performance of the full real-world dataset. We publicly release our code and 140k+ synthetic document samples.

---

## 2. Solaris: Building a Multiplayer Video World Model in Minecraft

**arXiv ID:** 2602.22208  
**Quality Score:** 2.88/10.0  
**Suggested Category:** Feedback Loops  
**URL:** https://arxiv.org/abs/2602.22208  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** agent, multi-agent, memory, evaluation, pipeline

**Abstract:**
Existing action-conditioned video generation models (video world models) are limited to single-agent perspectives, failing to capture the multi-agent interactions of real-world environments. We introduce Solaris, a multiplayer video world model that simulates consistent multi-view observations. To enable this, we develop a multiplayer data system designed for robust, continuous, and automated data collection on video games such as Minecraft. Unlike prior platforms built for single-player settings, our system supports coordinated multi-agent interaction and synchronized videos + actions capture. Using this system, we collect 12.64 million multiplayer frames and propose an evaluation framework for multiplayer movement, memory, grounding, building, and view consistency. We train Solaris using a staged pipeline that progressively transitions from single-player to multiplayer modeling, combining bidirectional, causal, and Self Forcing training. In the final stage, we introduce Checkpointed Self Forcing, a memory-efficient Self Forcing variant that enables a longer-horizon teacher. Results show our architecture and training design outperform existing baselines. Through open-sourcing our system and models, we hope to lay the groundwork for a new generation of multi-agent world models.

---

## 3. Force Policy: Learning Hybrid Force-Position Control Policy under Interaction Frame for Contact-Rich Manipulation

**arXiv ID:** 2602.22088  
**Quality Score:** 2.88/10.0  
**Suggested Category:** Feedback Loops  
**URL:** https://arxiv.org/abs/2602.22088  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** feedback

**Abstract:**
Contact-rich manipulation demands human-like integration of perception and force feedback: vision should guide task progress, while high-frequency interaction control must stabilize contact under uncertainty. Existing learning-based policies often entangle these roles in a monolithic network, trading off global generalization against stable local refinement, while control-centric approaches typically assume a known task structure or learn only controller parameters rather than the structure itself. In this paper, we formalize a physically grounded interaction frame, an instantaneous local basis that decouples force regulation from motion execution, and propose a method to recover it from demonstrations. Based on this, we address both issues by proposing Force Policy, a global-local vision-force policy in which a global policy guides free-space actions using vision, and upon contact, a high-frequency local policy with force feedback estimates the interaction frame and executes hybrid force-position control for stable interaction. Real-world experiments across diverse contact-rich tasks show consistent gains over strong baselines, with more robust contact establishment, more accurate force regulation, and reliable generalization to novel objects with varied geometries and physical properties, ultimately improving both contact stability and execution quality. Project page: https://force-policy.github.io/

---

## 4. SurGo-R1: Benchmarking and Modeling Contextual Reasoning for Operative Zone in Surgical Video

**arXiv ID:** 2602.21706  
**Quality Score:** 2.88/10.0  
**Suggested Category:** Feedback Loops  
**URL:** https://arxiv.org/abs/2602.21706  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** context, evaluation, benchmark

**Abstract:**
Minimally invasive surgery has dramatically improved patient operative outcomes, yet identifying safe operative zones remains challenging in critical phases, requiring surgeons to integrate visual cues, procedural phase, and anatomical context under high cognitive load. Existing AI systems offer binary safety verification or static detection, ignoring the phase-dependent nature of intraoperative reasoning. We introduce ResGo, a benchmark of laparoscopic frames annotated with Go Zone bounding boxes and clinician-authored rationales covering phase, exposure quality reasoning, next action and risk reminder. We introduce evaluation metrics that treat correct grounding under incorrect phase as failures, revealing that most vision-language models cannot handle such tasks and perform poorly. We then present SurGo-R1, a model optimized via RLHF with a multi-turn phase-then-go architecture where the model first identifies the surgical phase, then generates reasoning and Go Zone coordinates conditioned on that context. On unseen procedures, SurGo-R1 achieves 76.6% phase accuracy, 32.7 mIoU, and 54.8% hardcore accuracy, a 6.6$\times$ improvement over the mainstream generalist VLMs. Code, model and benchmark will be available at https://github.com/jinlab-imvr/SurGo-R1

---

## 5. Primary-Fine Decoupling for Action Generation in Robotic Imitation

**arXiv ID:** 2602.21684  
**Quality Score:** 2.88/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.21684  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** benchmark

**Abstract:**
Multi-modal distribution in robotic manipulation action sequences poses critical challenges for imitation learning. To this end, existing approaches often model the action space as either a discrete set of tokens or a continuous, latent-variable distribution. However, both approaches present trade-offs: some methods discretize actions into tokens and therefore lose fine-grained action variations, while others generate continuous actions in a single stage tend to produce unstable mode transitions. To address these limitations, we propose Primary-Fine Decoupling for Action Generation (PF-DAG), a two-stage framework that decouples coarse action consistency from fine-grained variations. First, we compress action chunks into a small set of discrete modes, enabling a lightweight policy to select consistent coarse modes and avoid mode bouncing. Second, a mode conditioned MeanFlow policy is learned to generate high-fidelity continuous actions. Theoretically, we prove PF-DAG's two-stage design achieves a strictly lower MSE bound than single-stage generative policies. Empirically, PF-DAG outperforms state-of-the-art baselines across 56 tasks from Adroit, DexArt, and MetaWorld benchmarks. It further generalizes to real-world tactile dexterous manipulation tasks. Our work demonstrates that explicit mode-level decoupling enables both robust multi-modal modeling and reactive closed-loop control for robotic manipulation.

---

## 6. LiLo-VLA: Compositional Long-Horizon Manipulation via Linked Object-Centric Policies

**arXiv ID:** 2602.21531  
**Quality Score:** 2.88/10.0  
**Suggested Category:** Feedback Loops  
**URL:** https://arxiv.org/abs/2602.21531  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** rag, planning, evaluation, benchmark

**Abstract:**
General-purpose robots must master long-horizon manipulation, defined as tasks involving multiple kinematic structure changes (e.g., attaching or detaching objects) in unstructured environments. While Vision-Language-Action (VLA) models offer the potential to master diverse atomic skills, they struggle with the combinatorial complexity of sequencing them and are prone to cascading failures due to environmental sensitivity. To address these challenges, we propose LiLo-VLA (Linked Local VLA), a modular framework capable of zero-shot generalization to novel long-horizon tasks without ever being trained on them. Our approach decouples transport from interaction: a Reaching Module handles global motion, while an Interaction Module employs an object-centric VLA to process isolated objects of interest, ensuring robustness against irrelevant visual features and invariance to spatial configurations. Crucially, this modularity facilitates robust failure recovery through dynamic replanning and skill reuse, effectively mitigating the cascading errors common in end-to-end approaches. We introduce a 21-task simulation benchmark consisting of two challenging suites: LIBERO-Long++ and Ultra-Long. In these simulations, LiLo-VLA achieves a 69% average success rate, outperforming Pi0.5 by 41% and OpenVLA-OFT by 67%. Furthermore, real-world evaluations across 8 long-horizon tasks demonstrate an average success rate of 85%. Project page: https://yy-gx.github.io/LiLo-VLA/.

---

## 7. Function-Space Empirical Bayes Regularisation with Student's t Priors

**arXiv ID:** 2602.22015  
**Quality Score:** 2.78/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.22015  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** 

**Abstract:**
Bayesian deep learning (BDL) has emerged as a principled approach to produce reliable uncertainty estimates by integrating deep neural networks with Bayesian inference, and the selection of informative prior distributions remains a significant challenge. Various function-space variational inference (FSVI) regularisation methods have been presented, assigning meaningful priors over model predictions. However, these methods typically rely on a Gaussian prior, which fails to capture the heavy-tailed statistical characteristics inherent in neural network outputs. By contrast, this work proposes a novel function-space empirical Bayes regularisation framework -- termed ST-FS-EB -- which employs heavy-tailed Student's $t$ priors in both parameter and function spaces. Also, we approximate the posterior distribution through variational inference (VI), inducing an evidence lower bound (ELBO) objective based on Monte Carlo (MC) dropout. Furthermore, the proposed method is evaluated against various VI-based BDL baselines, and the results demonstrate its robust performance in in-distribution prediction, out-of-distribution (OOD) detection and handling distribution shifts.

---

## 8. Learning to Fuse and Reconstruct Multi-View Graphs for Diabetic Retinopathy Grading

**arXiv ID:** 2602.21944  
**Quality Score:** 2.78/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21944  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** rag

**Abstract:**
Diabetic retinopathy (DR) is one of the leading causes of vision loss worldwide, making early and accurate DR grading critical for timely intervention. Recent clinical practices leverage multi-view fundus images for DR detection with a wide coverage of the field of view (FOV), motivating deep learning methods to explore the potential of multi-view learning for DR grading. However, existing methods often overlook the inter-view correlations when fusing multi-view fundus images, failing to fully exploit the inherent consistency across views originating from the same patient. In this work, we present MVGFDR, an end-to-end Multi-View Graph Fusion framework for DR grading. Different from existing methods that directly fuse visual features from multiple views, MVGFDR is equipped with a novel Multi-View Graph Fusion (MVGF) module to explicitly disentangle the shared and view-specific visual features. Specifically, MVGF comprises three key components: (1) Multi-view Graph Initialization, which constructs visual graphs via residual-guided connections and employs Discrete Cosine Transform (DCT) coefficients as frequency-domain anchors; (2) Multi-view Graph Fusion, which integrates selective nodes across multi-view graphs based on frequency-domain relevance to capture complementary view-specific information; and (3) Masked Cross-view Reconstruction, which leverages masked reconstruction of shared information across views to facilitate view-invariant representation learning. Extensive experimental results on MFIDDR, by far the largest multi-view fundus image dataset, demonstrate the superiority of our proposed approach over existing state-of-the-art approaches in diabetic retinopathy grading.

---

## 9. I/O Optimizations for Graph-Based Disk-Resident Approximate Nearest Neighbor Search: A Design Space Exploration

**arXiv ID:** 2602.21514  
**Quality Score:** 2.78/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21514  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** memory, rag

**Abstract:**
Approximate nearest neighbor (ANN) search on SSD-backed indexes is increasingly I/O-bound (I/O accounts for 70--90\% of query latency). We present an I/O-first framework for disk-based ANN that organizes techniques along three dimensions: memory layout, disk layout, and search algorithm. We introduce a page-level complexity model that explains how page locality and path length jointly determine page reads, and we validate the model empirically. Using consistent implementations across four public datasets, we quantify both single-factor effects and cross-dimensional synergies. We find that (i) memory-resident navigation and dynamic width provide the strongest standalone gains; (ii) page shuffle and page search are weak alone but complementary together; and (iii) a principled composition, OctopusANN, substantially reduces I/O and achieves 4.1--37.9\% higher throughput than the state-of-the-art system Starling and 87.5--149.5\% higher throughput than DiskANN at matched Recall@10=90\%. Finally, we distill actionable guidelines for selecting storage-centric or hybrid designs across diverse concurrency levels and accuracy constraints, advocating systematic composition rather than isolated tweaks when pushing the performance frontier of disk-based ANN.

---

## 10. FlowCorrect: Efficient Interactive Correction of Generative Flow Policies for Robotic Manipulation

**arXiv ID:** 2602.22056  
**Quality Score:** 2.75/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.22056  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** 

**Abstract:**
Generative manipulation policies can fail catastrophically under deployment-time distribution shift, yet many failures are near-misses: the robot reaches almost-correct poses and would succeed with a small corrective motion. We present FlowCorrect, a deployment-time correction framework that converts near-miss failures into successes using sparse human nudges, without full policy retraining. During execution, a human provides brief corrective pose nudges via a lightweight VR interface. FlowCorrect uses these sparse corrections to locally adapt the policy, improving actions without retraining the backbone while preserving the model performance on previously learned scenarios. We evaluate on a real-world robot across three tabletop tasks: pick-and-place, pouring, and cup uprighting. With a low correction budget, FlowCorrect improves success on hard cases by 85\% while preserving performance on previously solved scenarios. The results demonstrate clearly that FlowCorrect learns only with very few demonstrations and enables fast and sample-efficient incremental, human-in-the-loop corrections of generative visuomotor policies at deployment time in real-world robotics.

---

## 11. DynamicGTR: Leveraging Graph Topology Representation Preferences to Boost VLM Capabilities on Graph QAs

**arXiv ID:** 2602.21864  
**Quality Score:** 2.75/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.21864  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** rag

**Abstract:**
Vision-Language Models (VLMs) have emerged as versatile solutions for zero-shot question answering (QA) across various domains. However, enabling VLMs to effectively comprehend structured graphs and perform accurate, efficient QA remains challenging. Existing approaches typically rely on one single graph topology representation (GTR), such as fixed-style visual images or unified text descriptions. This ``one-size-fits-all'' strategy often neglects model-specific and task-specific preferences, resulting in inaccurate or over-lengthy responses to graph-related queries. To address this, we propose the $\mbox{DynamicGTR}$ framework, which dynamically selects the optimal GTR for each query during inference, thereby enhancing the zero-shot graph QA capabilities of VLMs with a customizable accuracy and brevity trade-off. Extensive experiments show that DynamicGTR not only improves VLM-based graph algorithm QA performance but also successfully transfers the experience trained from synthetic graph algorithm tasks to real-world applications like link prediction and node classification, without any additional training. Additionally, DynamicGTR demonstrates strong transferability across tasks, domains, and models, suggesting its potential as a flexible solution for broad graph scenarios.

---

## 12. Sparse Array Design for Near-Field MU-MIMO: Reconfigurable Array Thinning Approach

**arXiv ID:** 2602.21973  
**Quality Score:** 2.73/10.0  
**Suggested Category:** None  
**URL:** https://arxiv.org/abs/2602.21973  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** 

**Abstract:**
Future wireless networks, deploying thousands of antenna elements, may operate in the radiative near-field (NF), enabling spatial multiplexing across both angle and range domains. Sparse arrays have the potential to achieve comparable performance with fewer antenna elements. However, fixed sparse array designs are generally suboptimal under dynamic user distributions, while movable antenna architectures rely on mechanically reconfigurable elements, introducing latency and increased hardware complexity. To address these limitations, we propose a reconfigurable array thinning approach that selectively activates a subset of antennas to form a flexible sparse array design without physical repositioning. We first analyze grating lobes for uniform sparse arrays in the angle and range domains, showing their absence along the range dimension. Based on the analysis, we develop two particle swarm optimization-based strategies: a grating-lobe-based thinned array (GTA) for grating- lobe suppression and a sum-rate-based thinned array (STA) for multiuser sum-rate maximization. Simulation results demonstrate that GTA outperforms conventional uniform sparse arrays, while STA achieves performance comparable to movable antennas, thereby offering a practical and efficient array deployment strategy without the associated mechanical complexity.

---

## 13. RuCL: Stratified Rubric-Based Curriculum Learning for Multimodal Large Language Model Reasoning

**arXiv ID:** 2602.21628  
**Quality Score:** 2.73/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.21628  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** rag, benchmark

**Abstract:**
Reinforcement Learning with Verifiable Rewards (RLVR) has emerged as a prevailing paradigm for enhancing reasoning in Multimodal Large Language Models (MLLMs). However, relying solely on outcome supervision risks reward hacking, where models learn spurious reasoning patterns to satisfy final answer checks. While recent rubric-based approaches offer fine-grained supervision signals, they suffer from high computational costs of instance-level generation and inefficient training dynamics caused by treating all rubrics as equally learnable. In this paper, we propose Stratified Rubric-based Curriculum Learning (RuCL), a novel framework that reformulates curriculum learning by shifting the focus from data selection to reward design. RuCL generates generalized rubrics for broad applicability and stratifies them based on the model's competence. By dynamically adjusting rubric weights during training, RuCL guides the model from mastering foundational perception to tackling advanced logical reasoning. Extensive experiments on various visual reasoning benchmarks show that RuCL yields a remarkable +7.83% average improvement over the Qwen2.5-VL-7B model, achieving a state-of-the-art accuracy of 60.06%.

---

## 14. Iterative Closed-Loop Motion Synthesis for Scaling the Capabilities of Humanoid Control

**arXiv ID:** 2602.21599  
**Quality Score:** 2.73/10.0  
**Suggested Category:** Feedback Loops  
**URL:** https://arxiv.org/abs/2602.21599  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** rag, iteration, evaluation

**Abstract:**
Physics-based humanoid control relies on training with motion datasets that have diverse data distributions. However, the fixed difficulty distribution of datasets limits the performance ceiling of the trained control policies. Additionally, the method of acquiring high-quality data through professional motion capture systems is constrained by costs, making it difficult to achieve large-scale scalability. To address these issues, we propose a closed-loop automated motion data generation and iterative framework. It can generate high-quality motion data with rich action semantics, including martial arts, dance, combat, sports, gymnastics, and more. Furthermore, our framework enables difficulty iteration of policies and data through physical metrics and objective evaluations, allowing the trained tracker to break through its original difficulty limits. On the PHC single-primitive tracker, using only approximately 1/10 of the AMASS dataset size, the average failure rate on the test set (2201 clips) is reduced by 45\% compared to the baseline. Finally, we conduct comprehensive ablation and comparative experiments to highlight the rationality and advantages of our framework.

---

## 15. Solving Imperfect-Recall Games via Sum-of-Squares Optimization

**arXiv ID:** 2602.21722  
**Quality Score:** 2.70/10.0  
**Suggested Category:** Orchestration & Control  
**URL:** https://arxiv.org/abs/2602.21722  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 3.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** hierarchy

**Abstract:**
Extensive-form games (EFGs) provide a powerful framework for modeling sequential decision making, capturing strategic interaction under imperfect information, chance events, and temporal structure. Most positive algorithmic and theoretical results for EFGs assume perfect recall, where players remember all past information and actions. We study the increasingly relevant setting of imperfect-recall EFGs (IREFGs), where players may forget parts of their history or previously acquired information, and where equilibrium computation is provably hard. We propose sum-of-squares (SOS) hierarchies for computing ex-ante optimal strategies in single-player IREFGs and Nash equilibria in multi-player IREFGs, working over behavioral strategies. Our theoretical results show that (i) these hierarchies converge asymptotically, (ii) under genericity assumptions, the convergence is finite, and (iii) in single-player non-absentminded IREFGs, convergence occurs at a finite level determined by the number of information sets. Finally, we introduce the new classes of (SOS)-concave and (SOS)-monotone IREFGs, and show that in the single-player setting the SOS hierarchy converges at the first level, enabling equilibrium computation with a single semidefinite program (SDP).

---

## 16. GUI-Libra: Training Native GUI Agents to Reason and Act with Action-aware Supervision and Partially Verifiable RL

**arXiv ID:** 2602.22190  
**Quality Score:** 2.65/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.22190  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** agent, benchmark, pipeline

**Abstract:**
Open-source native GUI agents still lag behind closed-source systems on long-horizon navigation tasks. This gap stems from two limitations: a shortage of high-quality, action-aligned reasoning data, and the direct adoption of generic post-training pipelines that overlook the unique challenges of GUI agents. We identify two fundamental issues in these pipelines: (i) standard SFT with CoT reasoning often hurts grounding, and (ii) step-wise RLVR-tyle training faces partial verifiability, where multiple actions can be correct but only a single demonstrated action is used for verification. This makes offline step-wise metrics weak predictors of online task success. In this work, we present GUI-Libra, a tailored training recipe that addresses these challenges. First, to mitigate the scarcity of action-aligned reasoning data, we introduce a data construction and filtering pipeline and release a curated 81K GUI reasoning dataset. Second, to reconcile reasoning with grounding, we propose action-aware SFT that mixes reasoning-then-action and direct-action data and reweights tokens to emphasize action and grounding. Third, to stabilize RL under partial verifiability, we identify the overlooked importance of KL regularization in RLVR and show that a KL trust region is critical for improving offline-to-online predictability; we further introduce success-adaptive scaling to downweight unreliable negative gradients. Across diverse web and mobile benchmarks, GUI-Libra consistently improves both step-wise accuracy and end-to-end task completion. Our results suggest that carefully designed post-training and data curation can unlock significantly stronger task-solving capabilities without costly online data collection. We release our dataset, code, and models to facilitate further research on data-efficient post-training for reasoning-capable GUI agents.

---

## 17. Maximal Biclique Enumeration with Improved Worst-Case Time Complexity Guarantee: A Partition-Oriented Strategy

**arXiv ID:** 2602.21700  
**Quality Score:** 2.65/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21700  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** 

**Abstract:**
The maximal biclique enumeration problem in bipartite graphs is fundamental and has numerous applications in E-commerce and transaction networks. Most existing studies adopt a branch-and-bound framework, which recursively expands a partial biclique with a vertex until no further vertices can be added. Equipped with a basic pivot selection strategy, all state-of-the-art methods have a worst-case time complexity no better than $O(m\cdot (\sqrt{2})^n)$}, where $m$ and $n$ are the number of edges and vertices in the graph, respectively. In this paper, we introduce a new branch-and-bound (BB) algorithm \texttt{IPS}. In \texttt{IPS}, we relax the strict stopping criterion of existing methods by allowing termination when all maximal bicliques within the current branch can be outputted in the time proportional to the number of maximal bicliques inside, reducing the total number of branches required. Second, to fully unleash the power of the new termination condition, we propose an improved pivot selection strategy, which well aligns with the new termination condition to achieve better theoretical and practical performance. Formally, \texttt{IPS} improves the worst-case time complexity to $O(m\cdot α^n + n\cdot β)$, where $α(\approx 1.3954)$ is the largest positive root of $x^4-2x-1=0$ and $β$ represents the number of maximal bicliques in the graph, respectively. This result surpasses that of all existing algorithms given that $α$ is strictly smaller than $\sqrt{2}$ and $β$ is at most $(\sqrt{2})^n-2$ theoretically. Furthermore, we apply an inclusion-exclusion-based framework to boost the performance of \texttt{IPS}, improving the worst-case time complexity to $O(n\cdot γ^2\cdotα^γ+ γ\cdot β)$ for large sparse graphs ($γ$ is a parameter satisfying $γ\ll n$ for sparse graphs).

---

## 18. AdaSpot: Spend Resolution Where It Matters for Precise Event Spotting

**arXiv ID:** 2602.22073  
**Quality Score:** 2.62/10.0  
**Suggested Category:** Feedback Loops  
**URL:** https://arxiv.org/abs/2602.22073  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** evaluation, benchmark, autonomous

**Abstract:**
Precise Event Spotting aims to localize fast-paced actions or events in videos with high temporal precision, a key task for applications in sports analytics, robotics, and autonomous systems. Existing methods typically process all frames uniformly, overlooking the inherent spatio-temporal redundancy in video data. This leads to redundant computation on non-informative regions while limiting overall efficiency. To remain tractable, they often spatially downsample inputs, losing fine-grained details crucial for precise localization. To address these limitations, we propose \textbf{AdaSpot}, a simple yet effective framework that processes low-resolution videos to extract global task-relevant features while adaptively selecting the most informative region-of-interest in each frame for high-resolution processing. The selection is performed via an unsupervised, task-aware strategy that maintains spatio-temporal consistency across frames and avoids the training instability of learnable alternatives. This design preserves essential fine-grained visual cues with a marginal computational overhead compared to low-resolution-only baselines, while remaining far more efficient than uniform high-resolution processing. Experiments on standard PES benchmarks demonstrate that \textbf{AdaSpot} achieves state-of-the-art performance under strict evaluation metrics (\eg, $+3.96$ and $+2.26$ mAP$@0$ frames on Tennis and FineDiving), while also maintaining strong results under looser metrics. Code is available at: \href{https://github.com/arturxe2/AdaSpot}{https://github.com/arturxe2/AdaSpot}.

---

## 19. World Guidance: World Modeling in Condition Space for Action Generation

**arXiv ID:** 2602.22010  
**Quality Score:** 2.62/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.22010  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** rag, pipeline

**Abstract:**
Leveraging future observation modeling to facilitate action generation presents a promising avenue for enhancing the capabilities of Vision-Language-Action (VLA) models. However, existing approaches struggle to strike a balance between maintaining efficient, predictable future representations and preserving sufficient fine-grained information to guide precise action generation. To address this limitation, we propose WoG (World Guidance), a framework that maps future observations into compact conditions by injecting them into the action inference pipeline. The VLA is then trained to simultaneously predict these compressed conditions alongside future actions, thereby achieving effective world modeling within the condition space for action inference. We demonstrate that modeling and predicting this condition space not only facilitates fine-grained action generation but also exhibits superior generalization capabilities. Moreover, it learns effectively from substantial human manipulation videos. Extensive experiments across both simulation and real-world environments validate that our method significantly outperforms existing methods based on future prediction. Project page is available at: https://selen-suyue.github.io/WoGNet/

---

## 20. A Multi-Turn Framework for Evaluating AI Misuse in Fraud and Cybercrime Scenarios

**arXiv ID:** 2602.21831  
**Quality Score:** 2.62/10.0  
**Suggested Category:** Feedback Loops  
**URL:** https://arxiv.org/abs/2602.21831  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** evaluation

**Abstract:**
AI is increasingly being used to assist fraud and cybercrime. However, it is unclear whether current large language models can assist complex criminal activity. Working with law enforcement and policy experts, we developed multi-turn evaluations for three fraud and cybercrime scenarios (romance scams, CEO impersonation, and identity theft). Our evaluations focused on text-to-text model capabilities. In each scenario, we measured model capabilities in ways designed to resemble real-world misuse, such as breaking down requests for fraud into a sequence of seemingly benign queries, and measuring whether models provide actionable information, relative to a standard web search baseline.   We found that (1) current large language models provide minimal practical assistance with complex criminal activity, (2) open-weight large language models fine-tuned to remove safety guardrails provided substantially more help, and (3) decomposing requests into benign-seeming queries elicited more assistance than explicitly malicious framing or system-level jailbreaks. Overall, the results suggest that current risks from text-generation models are relatively minimal. However, this work contributes a reproducible, expert-grounded framework for tracking how these risks may evolve with time as models grow more capable and adversaries adapt.

---

## 21. Self-Curriculum Model-based Reinforcement Learning for Shape Control of Deformable Linear Objects

**arXiv ID:** 2602.21816  
**Quality Score:** 2.62/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.21816  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** evaluation

**Abstract:**
Precise shape control of Deformable Linear Objects (DLOs) is crucial in robotic applications such as industrial and medical fields. However, existing methods face challenges in handling complex large deformation tasks, especially those involving opposite curvatures, and lack efficiency and precision. To address this, we propose a two-stage framework combining Reinforcement Learning (RL) and online visual servoing. In the large-deformation stage, a model-based reinforcement learning approach using an ensemble of dynamics models is introduced to significantly improve sample efficiency. Additionally, we design a self-curriculum goal generation mechanism that dynamically selects intermediate-difficulty goals with high diversity through imagined evaluations, thereby optimizing the policy learning process. In the small-deformation stage, a Jacobian-based visual servo controller is deployed to ensure high-precision convergence. Simulation results show that the proposed method enables efficient policy learning and significantly outperforms mainstream baselines in shape control success rate and precision. Furthermore, the framework effectively transfers the policy trained in simulation to real-world tasks with zero-shot adaptation. It successfully completes all 30 cases with diverse initial and target shapes across DLOs of different sizes and materials. The project website is available at: https://anonymous.4open.science/w/sc-mbrl-dlo-EB48/

---

## 22. Multimodal Survival Modeling and Fairness-Aware Clinical Machine Learning for 5-Year Breast Cancer Risk Prediction

**arXiv ID:** 2602.21648  
**Quality Score:** 2.62/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21648  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** rag

**Abstract:**
Clinical risk prediction models often underperform in real-world settings due to poor calibration, limited transportability, and subgroup disparities. These challenges are amplified in high-dimensional multimodal cancer datasets characterized by complex feature interactions and a p &gt;&gt; n structure. We present a fully reproducible multimodal machine learning framework for 5-year overall survival prediction in breast cancer, integrating clinical variables with high-dimensional transcriptomic and copy-number alteration (CNA) features from the METABRIC cohort.   After variance- and sparsity-based filtering and dimensionality reduction, models were trained using stratified train/validation/test splits with validation-based hyperparameter tuning. Two survival approaches were compared: an elastic-net regularized Cox model (CoxNet) and a gradient-boosted survival tree model implemented using XGBoost. CoxNet provides embedded feature selection and stable estimation, whereas XGBoost captures nonlinear effects and higher-order interactions.   Performance was assessed using time-dependent area under the ROC curve (AUC), average precision (AP), calibration curves, Brier score, and bootstrapped 95 percent confidence intervals. CoxNet achieved validation and test AUCs of 98.3 and 96.6, with AP values of 90.1 and 80.4. XGBoost achieved validation and test AUCs of 98.6 and 92.5, with AP values of 92.5 and 79.9. Fairness diagnostics showed stable discrimination across age groups, estrogen receptor status, molecular subtypes, and menopausal state.   This work introduces a governance-oriented multimodal survival framework emphasizing calibration, fairness auditing, robustness, and reproducibility for high-dimensional clinical machine learning.

---

## 23. Leaky Coaxial Cable based Generalized Pinching-Antenna Systems with Dual-Port Feeding

**arXiv ID:** 2602.21856  
**Quality Score:** 2.60/10.0  
**Suggested Category:** Orchestration & Control  
**URL:** https://arxiv.org/abs/2602.21856  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** rag, benchmark

**Abstract:**
By leveraging the distributed leakage radiation of leaky coaxial cables (LCXs), the concept of pinching antennas can be generalized from the conventional high-frequency waveguide based architectures to cable based structures in lower-frequency scenarios. This paper investigates an LCX based generalized pinching-antenna system with dual-port feeding. By enabling bidirectional excitation along each cable, the proposed design significantly enhances spatial degrees of freedom. A comprehensive channel model is developed to characterize intra-cable attenuation, bidirectional phase progression, slot based radiation, and wireless propagation. Based on this model, both analog and hybrid beamforming frameworks are studied with the objective of maximizing the minimum achievable data rate. For analog transmission, slot activation, port selection, and power allocation are jointly optimized using matching theory, coalitional games, and bisection based power control. For hybrid transmission, zero-forcing (ZF) digital precoding is incorporated to eliminate inter-user interference, thereby simplifying slot activation and enabling closed-form optimal power allocation. Simulation results demonstrate that dual-port feeding provides notable performance gains over single-port LCX systems and fixed-antenna benchmarks, validating the effectiveness of the proposed beamforming and resource allocation designs under various transmit power levels and cable parameters.

---

## 24. fEDM+: A Risk-Based Fuzzy Ethical Decision Making Framework with Principle-Level Explainability and Pluralistic Validation

**arXiv ID:** 2602.21746  
**Quality Score:** 2.60/10.0  
**Suggested Category:** Reliability & Eval  
**URL:** https://arxiv.org/abs/2602.21746  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 3.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 1.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** context

**Abstract:**
In a previous work, we introduced the fuzzy Ethical Decision-Making framework (fEDM), a risk-based ethical reasoning architecture grounded in fuzzy logic. The original model combined a fuzzy Ethical Risk Assessment module (fERA) with ethical decision rules, enabled formal structural verification through Fuzzy Petri Nets (FPNs), and validated outputs against a single normative referent. Although this approach ensured formal soundness and decision consistency, it did not fully address two critical challenges: principled explainability of decisions and robustness under ethical pluralism. In this paper, we extend fEDM in two major directions. First, we introduce an Explainability and Traceability Module (ETM) that explicitly links each ethical decision rule to the underlying moral principles and computes a weighted principle-contribution profile for every recommended action. This enables transparent, auditable explanations that expose not only what decision was made but why, and on the basis of which principles. Second, we replace single-referent validation with a pluralistic semantic validation framework that evaluates decisions against multiple stakeholder referents, each encoding distinct principle priorities and risk tolerances. This shift allows principled disagreement to be formally represented rather than suppressed, thus increasing robustness and contextual sensitivity. The resulting extended fEDM, called fEDM+, preserves formal verifiability while achieving enhanced interpretability and stakeholder-aware validation, making it suitable as an oversight and governance layer for ethically sensitive AI systems.

---

## 25. Quantum Attacks Targeting Nuclear Power Plants: Threat Analysis, Defense and Mitigation Strategies

**arXiv ID:** 2602.21524  
**Quality Score:** 2.60/10.0  
**Suggested Category:** Orchestration & Control  
**URL:** https://arxiv.org/abs/2602.21524  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 3.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 1.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** 

**Abstract:**
The advent of Cryptographically Relevant Quantum Computers (CRQCs) presents a fundamental and existential threat to the forensic integrity and operational safety of Industrial Control Systems (ICS) and Operational Technology (OT) in critical infrastructure. This paper introduces a novel, forensics-first framework for achieving quantum resilience in high-consequence environments, with a specific focus on nuclear power plants. We systematically analyze the quantum threat landscape across the Purdue architecture (L0-L5), detailing how Harvest-Now, Decrypt-Later (HNDL) campaigns, enabled by algorithms like Shor's, can retroactively compromise cryptographic foundations, undermine evidence admissibility, and facilitate sophisticated sabotage. Through two detailed case studies, \textsc{Quantum~Scar} and \textsc{Quantum~Dawn}, we demonstrate multi-phase attack methodologies where state-level adversaries exploit cryptographic monoculture and extended OT lifecycles to degrade safety systems while creating unsolvable forensic paradoxes. Our probabilistic risk modeling reveals alarming success probabilities (up to 78\% for targeted facilities under current defenses), underscoring the criticality of immediate action. In response, we propose and validate a phased, defense-in-depth migration path to Post-Quantum Cryptography (PQC), integrating hybrid key exchange, cryptographic diversity, secure time synchronization, and side-channel resistant implementations aligned with ISA/IEC 62443 and NIST standards. The paper concludes that without urgent adoption of quantum-resilient controls, the integrity of both physical safety systems and digital forensic evidence remains at severe and irreversible risk.

---

## 26. Virtual Biopsy for Intracranial Tumors Diagnosis on MRI

**arXiv ID:** 2602.21613  
**Quality Score:** 2.57/10.0  
**Suggested Category:** Orchestration & Control  
**URL:** https://arxiv.org/abs/2602.21613  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** context, benchmark

**Abstract:**
Deep intracranial tumors situated in eloquent brain regions controlling vital functions present critical diagnostic challenges. Clinical practice has shifted toward stereotactic biopsy for pathological confirmation before treatment. Yet biopsy carries inherent risks of hemorrhage and neurological deficits and struggles with sampling bias due to tumor spatial heterogeneity, because pathological changes are typically region-selective rather than tumor-wide. Therefore, advancing non-invasive MRI-based pathology prediction is essential for holistic tumor assessment and modern clinical decision-making.   The primary challenge lies in data scarcity: low tumor incidence requires long collection cycles, and annotation demands biopsy-verified pathology from neurosurgical experts. Additionally, tiny lesion volumes lacking segmentation masks cause critical features to be overwhelmed by background noise. To address these challenges, we construct the ICT-MRI dataset - the first public biopsy-verified benchmark with 249 cases across four categories. We propose a Virtual Biopsy framework comprising: MRI-Processor for standardization; Tumor-Localizer employing vision-language models for coarse-to-fine localization via weak supervision; and Adaptive-Diagnoser with a Masked Channel Attention mechanism fusing local discriminative features with global contexts. Experiments demonstrate over 90% accuracy, outperforming baselines by more than 20%.

---

## 27. How to Take a Memorable Picture? Empowering Users with Actionable Feedback

**arXiv ID:** 2602.21877  
**Quality Score:** 2.55/10.0  
**Suggested Category:** Feedback Loops  
**URL:** https://arxiv.org/abs/2602.21877  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 3.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** feedback, evaluation, benchmark

**Abstract:**
Image memorability, i.e., how likely an image is to be remembered, has traditionally been studied in computer vision either as a passive prediction task, with models regressing a scalar score, or with generative methods altering the visual input to boost the image likelihood of being remembered. Yet, none of these paradigms supports users at capture time, when the crucial question is how to improve a photo memorability. We introduce the task of Memorability Feedback (MemFeed), where an automated model should provide actionable, human-interpretable guidance to users with the goal to enhance an image future recall. We also present MemCoach, the first approach designed to provide concrete suggestions in natural language for memorability improvement (e.g., "emphasize facial expression," "bring the subject forward"). Our method, based on Multimodal Large Language Models (MLLMs), is training-free and employs a teacher-student steering strategy, aligning the model internal activations toward more memorable patterns learned from a teacher model progressing along least-to-most memorable samples. To enable systematic evaluation on this novel task, we further introduce MemBench, a new benchmark featuring sequence-aligned photoshoots with annotated memorability scores. Our experiments, considering multiple MLLMs, demonstrate the effectiveness of MemCoach, showing consistently improved performance over several zero-shot models. The results indicate that memorability can not only be predicted but also taught and instructed, shifting the focus from mere prediction to actionable feedback for human creators.

---

## 28. Dual-Hop Joint Visible Light and Backscatter Communication Relaying under Finite Blocklength

**arXiv ID:** 2602.21744  
**Quality Score:** 2.53/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21744  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** rag, communication

**Abstract:**
This paper investigates a dual-hop joint visible light communication (VLC) and backscatter communication (BC) relaying framework under the finite blocklength (FBL) constraint, aiming at energy-neutral Ambient Internet of Things (A-IoT) deployments. In the proposed system, indoor LED access points are used to simultaneously provide illumination and transmit information over light to a backscatter device (BD), which harvests optical energy and backscatters the received messages to user equipments (UEs) equipped with radio frequency (RF) front ends. This forwarding of the information from VLC to RF channels is implemented without the need for carrier synthesizers and power amplifiers at the IoT node. By modeling the end-to-end communication link with short-packet IoT traffic and realistic levels of interference between adjacent VLC coverage areas, we analyze the outage performance and achievable data rate of the proposed system. Simulation results demonstrate that key factors, such as placement and orientation of the BD, as well as the selected code rate of the system affect reliability and data rate that can be achieved for communication purposes. The insights gained from this study pave the way for ambient power-enabled IoT solutions and future hybrid VLC/RF network designs.

---

## 29. CARE: A Molecular-Guided Foundation Model with Adaptive Region Modeling for Whole Slide Image Analysis

**arXiv ID:** 2602.21637  
**Quality Score:** 2.53/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.21637  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** rag, benchmark

**Abstract:**
Foundation models have recently achieved impressive success in computational pathology, demonstrating strong generalization across diverse histopathology tasks. However, existing models overlook the heterogeneous and non-uniform organization of pathological regions of interest (ROIs) because they rely on natural image backbones not tailored for tissue morphology. Consequently, they often fail to capture the coherent tissue architecture beyond isolated patches, limiting interpretability and clinical relevance. To address these challenges, we present Cross-modal Adaptive Region Encoder (CARE), a foundation model for pathology that automatically partitions WSIs into several morphologically relevant regions. Specifically, CARE employs a two-stage pretraining strategy: (1) a self-supervised unimodal pretraining stage that learns morphological representations from 34,277 whole-slide images (WSIs) without segmentation annotations, and (2) a cross-modal alignment stage that leverages RNA and protein profiles to refine the construction and representation of adaptive regions. This molecular guidance enables CARE to identify biologically relevant patterns and generate irregular yet coherent tissue regions, selecting the most representative area as ROI. CARE supports a broad range of pathology-related tasks, using either the ROI feature or the slide-level feature obtained by aggregating adaptive regions. Based on only one-tenth of the pretraining data typically used by mainstream foundation models, CARE achieves superior average performance across 33 downstream benchmarks, including morphological classification, molecular prediction, and survival analysis, and outperforms other foundation model baselines overall.

---

## 30. Humanizing Robot Gaze Shifts: A Framework for Natural Gaze Shifts in Humanoid Robots

**arXiv ID:** 2602.21983  
**Quality Score:** 2.52/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21983  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 2.5/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** context, rag, feedback, pipeline

**Abstract:**
Leveraging auditory and visual feedback for attention reorientation is essential for natural gaze shifts in social interaction. However, enabling humanoid robots to perform natural and context-appropriate gaze shifts in unconstrained human--robot interaction (HRI) remains challenging, as it requires the coupling of cognitive attention mechanisms and biomimetic motion generation. In this work, we propose the Robot Gaze-Shift (RGS) framework, which integrates these two components into a unified pipeline. First, RGS employs a vision--language model (VLM)-based gaze reasoning pipeline to infer context-appropriate gaze targets from multimodal interaction cues, ensuring consistency with human gaze-orienting regularities. Second, RGS introduces a conditional Vector Quantized-Variational Autoencoder (VQ-VAE) model for eye--head coordinated gaze-shift motion generation, producing diverse and human-like gaze-shift behaviors. Experiments validate that RGS effectively replicates human-like target selection and generates realistic, diverse gaze-shift motions.

---

## 31. An Empirical Study of Bugs in Modern LLM Agent Frameworks

**arXiv ID:** 2602.21806  
**Quality Score:** 2.52/10.0  
**Suggested Category:** Orchestration & Control  
**URL:** https://arxiv.org/abs/2602.21806  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 2.5/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** agent, multi-agent, coordination, api, workflow

**Abstract:**
LLM agents have been widely adopted in real-world applications, relying on agent frameworks for workflow execution and multi-agent coordination. As these systems scale, understanding bugs in the underlying agent frameworks becomes critical. However, existing work mainly focuses on agent-level failures, overlooking framework-level bugs. To address this gap, we conduct an empirical study of 998 bug reports from CrewAI and LangChain, constructing a taxonomy of 15 root causes and 7 observable symptoms across five agent lifecycle stages: 'Agent Initialization','Perception', 'Self-Action', 'Mutual Interaction' and 'Evolution'. Our findings show that agent framework bugs mainly arise from 'API misuse', 'API incompatibility', and 'Documentation Desync', largely concentrated in the 'Self-Action' stage. Symptoms typically appear as 'Functional Error', 'Crash', and 'Build Failure', reflecting disruptions to task progression and control flow.

---

## 32. Joint-Aligned Latent Action: Towards Scalable VLA Pretraining in the Wild

**arXiv ID:** 2602.21736  
**Quality Score:** 2.52/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.21736  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 2.5/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** 

**Abstract:**
Despite progress, Vision-Language-Action models (VLAs) are limited by a scarcity of large-scale, diverse robot data. While human manipulation videos offer a rich alternative, existing methods are forced to choose between small, precisely-labeled datasets and vast in-the-wild footage with unreliable hand tracking labels. We present JALA, a pretraining framework that learns Jointly-Aligned Latent Actions. JALA bypasses full visual dynamic reconstruction, instead learns a predictive action embedding aligned with both inverse dynamics and real actions. This yields a transition-aware, behavior-centric latent space for learning from heterogeneous human data. We scale this approach with UniHand-Mix, a 7.5M video corpus (&gt;2,000 hours) blending laboratory and in-the-wild footage. Experiments demonstrate that JALA generates more realistic hand motions in both controlled and unconstrained scenarios, significantly improving downstream robot manipulation performance in both simulation and real-world tasks. These results indicate that jointly-aligned latent actions offer a scalable pathway for VLA pretraining from human data.

---

## 33. Budgeted Active Experimentation for Treatment Effect Estimation from Observational and Randomized Data

**arXiv ID:** 2602.22021  
**Quality Score:** 2.50/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.22021  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.0/3.0
- Clarity (20%): 2.5/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** rag

**Abstract:**
Estimating heterogeneous treatment effects is central to data-driven decision-making, yet industrial applications often face a fundamental tension between limited randomized controlled trial (RCT) budgets and abundant but biased observational data collected under historical targeting policies. Although observational logs offer the advantage of scale, they inherently suffer from severe policyinduced imbalance and overlap violations, rendering standalone estimation unreliable. We propose a budgeted active experimentation framework that iteratively enhances model training for causal effect estimation via active sampling. By leveraging observational priors, we develop an acquisition function targeting uplift estimation uncertainty, overlap deficits, and domain discrepancy to select the most informative units for randomized experiments. We establish finite-sample deviation bounds, asymptotic normality via martingale Central Limit Theorems (CLTs), and minimax lower bounds to prove information-theoretic optimality. Extensive experiments on industrial datasets demonstrate that our approach significantly outperforms standard randomized baselines in cost-constrained settings.

---

## 34. Comparative Evaluation of Machine Learning Models for Predicting Donor Kidney Discard

**arXiv ID:** 2602.21876  
**Quality Score:** 2.48/10.0  
**Suggested Category:** Feedback Loops  
**URL:** https://arxiv.org/abs/2602.21876  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** context, evaluation, benchmark

**Abstract:**
A kidney transplant can improve the life expectancy and quality of life of patients with end-stage renal failure. Even more patients could be helped with a transplant if the rate of kidneys that are discarded and not transplanted could be reduced. Machine learning (ML) can support decision-making in this context by early identification of donor organs at high risk of discard, for instance to enable timely interventions to improve organ utilization such as rescue allocation. Although various ML models have been applied, their results are difficult to compare due to heterogenous datasets and differences in feature engineering and evaluation strategies. This study aims to provide a systematic and reproducible comparison of ML models for donor kidney discard prediction. We trained five commonly used ML models: Logistic Regression, Decision Tree, Random Forest, Gradient Boosting, and Deep Learning along with an ensemble model on data from 4,080 deceased donors (death determined by neurologic criteria) in Germany. A unified benchmarking framework was implemented, including standardized feature engineering and selection, and Bayesian hyperparameter optimization. Model performance was assessed for discrimination (MCC, AUC, F1), calibration (Brier score), and explainability (SHAP). The ensemble achieved the highest discrimination performance (MCC=0.76, AUC=0.87, F1=0.90), while individual models such as Logistic Regression, Random Forest, and Deep Learning performed comparably and better than Decision Trees. Platt scaling improved calibration for tree-and neural network-based models. SHAP consistently identified donor age and renal markers as dominant predictors across models, reflecting clinical plausibility. This study demonstrates that consistent data preprocessing, feature selection, and evaluation can be more decisive for predictive success than the choice of the ML algorithm.

---

## 35. Impact of Pointing Errors and Correlated Wall Blockages on Practical Grid-based Indoor Terahertz Communication Systems

**arXiv ID:** 2602.21558  
**Quality Score:** 2.48/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21558  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** rag, communication

**Abstract:**
Terahertz (THz) communications has emerged as a promising technology for future wireless systems due to its potential to support extremely high data rates. However, severe path loss, blockage effects, and sensitivity to beam misalignment pose major challenges to reliable indoor THz communications. In this paper, we investigate the coverage probability of downlink transmission in a three-dimensional (3D) indoor THz communication system under structured access point (AP) deployments, with a focus on square and hexagonal grid topologies. A tractable analytical framework is developed to jointly account for human blockages, correlated wall blockages across APs, beam training, and residual pointing error. Numerical results demonstrate that wall blockage correlation significantly reduces the association and coverage probabilities, and its impact cannot be neglected in system performance analysis. Compared with square grid AP deployments, hexagonal grids consistently achieve higher coverage by mitigating correlated wall blockage effects and reducing the distances between user equipments (UEs) and their associated APs. Furthermore, coverage performance is shown to strongly depend on the UE location, with noticeable degradation as the UE moves away from its nearest AP. Residual pointing error is found to introduce substantial coverage loss, especially for longer links. In addition, beam training analysis reveals a non-monotonic relationship between antenna array size and training overhead, highlighting an inherent tradeoff among antenna configuration, beamwidth selection, and beam training efficiency. These findings provide useful insights into the design and deployment of practical indoor THz communication systems.

---

## 36. Machine Learning-Based Estimation of Cumulants of Chiral Condensate via Multi-Ensemble Reweighting with Deborah.jl

**arXiv ID:** 2602.21617  
**Quality Score:** 2.47/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.21617  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** pipeline

**Abstract:**
We investigate a bias-corrected machine learning (ML) strategy for estimating traces of the inverse Dirac operator, $\text{Tr}\, M^{-n}$ ($n=1,2,3,4$), motivated by the need for higher-order cumulants of the chiral condensate near the finite-temperature QCD critical endpoint. Our supervised regression framework is trained on Wilson-clover ensembles with the Iwasaki gauge action, and we explore two input feature scenarios: one using $\text{Tr}\, M^{-1}$ and another relying solely on gauge observables (plaquette and rectangle), enabling a fully feature-based prediction pipeline. Using $\text{Tr}\, M^{-1}$ both as a physical input to cumulant construction and as a feature for predicting higher powers, we find that even with $\sim1\%$ labeled data, the resulting susceptibility, skewness, and kurtosis remain statistically consistent with fully measured baselines, reducing computational cost to about $26\%$. In the feature-only approach, where correlations rather than explicit stochastic traces drive the predictions, bias correction plays a more pronounced role. We quantify this impact through multi ensemble reweighting across nearby quark masses. Our results demonstrate that bias-corrected ML estimates can significantly reduce measurement overhead while preserving the stability of higher-order observables relevant for locating the QCD critical endpoint. Code for this work is available at https://github.com/saintbenjamin/Deborah.jl .

---

## 37. Self-Correcting VLA: Online Action Refinement via Sparse World Imagination

**arXiv ID:** 2602.21633  
**Quality Score:** 2.45/10.0  
**Suggested Category:** Feedback Loops  
**URL:** https://arxiv.org/abs/2602.21633  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 2.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** agent, context, rag, self-improve, planning, evaluation, benchmark

**Abstract:**
Standard vision-language-action (VLA) models rely on fitting statistical data priors, limiting their robust understanding of underlying physical dynamics. Reinforcement learning enhances physical grounding through exploration yet typically relies on external reward signals that remain isolated from the agent's internal states. World action models have emerged as a promising paradigm that integrates imagination and control to enable predictive planning. However, they rely on implicit context modeling, lacking explicit mechanisms for self-improvement. To solve these problems, we propose Self-Correcting VLA (SC-VLA), which achieve self-improvement by intrinsically guiding action refinement through sparse imagination. We first design sparse world imagination by integrating auxiliary predictive heads to forecast current task progress and future trajectory trends, thereby constraining the policy to encode short-term physical evolution. Then we introduce the online action refinement module to reshape progress-dependent dense rewards, adjusting trajectory orientation based on the predicted sparse future states. Evaluations on challenging robot manipulation tasks from simulation benchmarks and real-world settings demonstrate that SC-VLA achieve state-of-the-art performance, yielding the highest task throughput with 16% fewer steps and a 9% higher success rate than the best-performing baselines, alongside a 14% gain in real-world experiments. Code is available at https://github.com/Kisaragi0/SC-VLA.

---

## 38. JSAM: Privacy Straggler-Resilient Joint Client Selection and Incentive Mechanism Design in Differentially Private Federated Learning

**arXiv ID:** 2602.21844  
**Quality Score:** 2.45/10.0  
**Suggested Category:** Feedback Loops  
**URL:** https://arxiv.org/abs/2602.21844  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** rag, privacy, evaluation

**Abstract:**
Differentially private federated learning faces a fundamental tension: privacy protection mechanisms that safeguard client data simultaneously create quantifiable privacy costs that discourage participation, undermining the collaborative training process. Existing incentive mechanisms rely on unbiased client selection, forcing servers to compensate even the most privacy-sensitive clients ("privacy stragglers"), leading to systemic inefficiency and suboptimal resource allocation. We introduce JSAM (Joint client Selection and privacy compensAtion Mechanism), a Bayesian-optimal framework that simultaneously optimizes client selection probabilities and privacy compensation to maximize training effectiveness under budget constraints. Our approach transforms a complex 2N-dimensional optimization problem into an efficient three-dimensional formulation through novel theoretical characterization of optimal selection strategies. We prove that servers should preferentially select privacy-tolerant clients while excluding high-sensitivity participants, and uncover the counter-intuitive insight that clients with minimal privacy sensitivity may incur the highest cumulative costs due to frequent participation. Extensive evaluations on MNIST and CIFAR-10 demonstrate that JSAM achieves up to 15% improvement in test accuracy compared to existing unbiased selection mechanisms while maintaining cost efficiency across varying data heterogeneity levels.

---

## 39. Hierarchical LLM-Based Multi-Agent Framework with Prompt Optimization for Multi-Robot Task Planning

**arXiv ID:** 2602.21670  
**Quality Score:** 2.43/10.0  
**Suggested Category:** Orchestration & Control  
**URL:** https://arxiv.org/abs/2602.21670  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 1.0/3.0

**Tags:** agent, multi-agent, planning, planner, hierarchical, benchmark

**Abstract:**
Multi-robot task planning requires decomposing natural-language instructions into executable actions for heterogeneous robot teams. Conventional Planning Domain Definition Language (PDDL) planners provide rigorous guarantees but struggle to handle ambiguous or long-horizon missions, while large language models (LLMs) can interpret instructions and propose plans but may hallucinate or produce infeasible actions. We present a hierarchical multi-agent LLM-based planner with prompt optimization: an upper layer decomposes tasks and assigns them to lower-layer agents, which generate PDDL problems solved by a classical planner. When plans fail, the system applies TextGrad-inspired textual-gradient updates to optimize each agent's prompt and thereby improve planning accuracy. In addition, meta-prompts are learned and shared across agents within the same layer, enabling efficient prompt optimization in multi-agent settings. On the MAT-THOR benchmark, our planner achieves success rates of 0.95 on compound tasks, 0.84 on complex tasks, and 0.60 on vague tasks, improving over the previous state-of-the-art LaMMA-P by 2, 7, and 15 percentage points respectively. An ablation study shows that the hierarchical structure, prompt optimization, and meta-prompt sharing contribute roughly +59, +37, and +4 percentage points to the overall success rate.

---

## 40. Epoch-based Optimistic Concurrency Control in Geo-replicated Databases

**arXiv ID:** 2602.21566  
**Quality Score:** 2.43/10.0  
**Suggested Category:** Orchestration & Control  
**URL:** https://arxiv.org/abs/2602.21566  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** coordination, concurrent, async, evaluation, benchmark, protocol

**Abstract:**
Geo-distribution is essential for modern online applications to ensure service reliability and high availability. However, supporting high-performance serializable transactions in geo-replicated databases remains a significant challenge. This difficulty stems from the extensive over-coordination inherent in distributed atomic commitment, concurrency control, and fault-tolerance replication protocols under high network latency.   To address these challenges, we introduce Minerva, a unified distributed concurrency control designed for highly scalable multi-leader replication. Minerva employs a novel epoch-based asynchronous replication protocol that decouples data propagation from the commitment process, enabling continuous transaction replication. Optimistic concurrency control is used to allow any replicas to execute transactions concurrently and commit without coordination. In stead of aborting transactions when conflicts are detected, Minerva uses deterministic re-execution to resolve conflicts, ensuring serializability without sacrificing performance. To further enhance concurrency, we construct a conflict graph and use a maximum weight independent set algorithm to select the optimal subset of transactions for commitment, minimizing the number of re-executed transactions. Our evaluation demonstrates that Minerva significantly outperforms state-of-the-art replicated databases, achieving over $3\times$ higher throughput in scalability experiments and $2.8\times$ higher throughput during a high network latency simulation with the TPC-C benchmark.

---

## 41. RAMSeS: Robust and Adaptive Model Selection for Time-Series Anomaly Detection Algorithms

**arXiv ID:** 2602.21766  
**Quality Score:** 2.42/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21766  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 2.5/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** context, rag, testing

**Abstract:**
Time-series data vary widely across domains, making a universal anomaly detector impractical. Methods that perform well on one dataset often fail to transfer because what counts as an anomaly is context dependent. The key challenge is to design a method that performs well in specific contexts while remaining adaptable across domains with varying data complexities. We present the Robust and Adaptive Model Selection for Time-Series Anomaly Detection RAMSeS framework. RAMSeS comprises two branches: (i) a stacking ensemble optimized with a genetic algorithm to leverage complementary detectors. (ii) An adaptive model-selection branch identifies the best single detector using techniques including Thompson sampling, robustness testing with generative adversarial networks, and Monte Carlo simulations. This dual strategy exploits the collective strength of multiple models and adapts to dataset-specific characteristics. We evaluate RAMSeS and show that it outperforms prior methods on F1.

---

## 42. Revisiting RAG Retrievers: An Information Theoretic Benchmark

**arXiv ID:** 2602.21553  
**Quality Score:** 2.38/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21553  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 1.0/3.0

**Tags:** context, rag, retrieval, tool, evaluation, benchmark, pipeline

**Abstract:**
Retrieval-Augmented Generation (RAG) systems rely critically on the retriever module to surface relevant context for large language models. Although numerous retrievers have recently been proposed, each built on different ranking principles such as lexical matching, dense embeddings, or graph citations, there remains a lack of systematic understanding of how these mechanisms differ and overlap. Existing benchmarks primarily compare entire RAG pipelines or introduce new datasets, providing little guidance on selecting or combining retrievers themselves. Those that do compare retrievers directly use a limited set of evaluation tools which fail to capture complementary and overlapping strengths. This work presents MIGRASCOPE, a Mutual Information based RAG Retriever Analysis Scope. We revisit state-of-the-art retrievers and introduce principled metrics grounded in information and statistical estimation theory to quantify retrieval quality, redundancy, synergy, and marginal contribution. We further show that if chosen carefully, an ensemble of retrievers outperforms any single retriever. We leverage the developed tools over major RAG corpora to provide unique insights on contribution levels of the state-of-the-art retrievers. Our findings provide a fresh perspective on the structure of modern retrieval techniques and actionable guidance for designing robust and efficient RAG systems.

---

## 43. NESTOR: A Nested MOE-based Neural Operator for Large-Scale PDE Pre-Training

**arXiv ID:** 2602.22059  
**Quality Score:** 2.38/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.22059  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** 

**Abstract:**
Neural operators have emerged as an efficient paradigm for solving PDEs, overcoming the limitations of traditional numerical methods and significantly improving computational efficiency. However, due to the diversity and complexity of PDE systems, existing neural operators typically rely on a single network architecture, which limits their capacity to fully capture heterogeneous features and complex system dependencies. This constraint poses a bottleneck for large-scale PDE pre-training based on neural operators. To address these challenges, we propose a large-scale PDE pre-trained neural operator based on a nested Mixture-of-Experts (MoE) framework. In particular, the image-level MoE is designed to capture global dependencies, while the token-level Sub-MoE focuses on local dependencies. Our model can selectively activate the most suitable expert networks for a given input, thereby enhancing generalization and transferability. We conduct large-scale pre-training on twelve PDE datasets from diverse sources and successfully transfer the model to downstream tasks. Extensive experiments demonstrate the effectiveness of our approach.

---

## 44. Prompt Architecture Determines Reasoning Quality: A Variable Isolation Study on the Car Wash Problem

**arXiv ID:** 2602.21814  
**Quality Score:** 2.38/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21814  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 2.5/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** context, rag, retrieval, benchmark

**Abstract:**
Large language models consistently fail the "car wash problem," a viral reasoning benchmark requiring implicit physical constraint inference. We present a variable isolation study (n=20 per condition, 6 conditions, 120 total trials) examining which prompt architecture layers in a production system enable correct reasoning. Using Claude 3.5 Sonnet with controlled hyperparameters (temperature 0.7, top_p 1.0), we find that the STAR (Situation-Task-Action-Result) reasoning framework alone raises accuracy from 0% to 85% (p=0.001, Fisher's exact test, odds ratio 13.22). Adding user profile context via vector database retrieval provides a further 10 percentage point gain, while RAG context contributes an additional 5 percentage points, achieving 100% accuracy in the full-stack condition. These results suggest that structured reasoning scaffolds -- specifically, forced goal articulation before inference -- matter substantially more than context injection for implicit constraint reasoning tasks.

---

## 45. Adaptive Penalized Doubly Robust Regression for Longitudinal Data

**arXiv ID:** 2602.21711  
**Quality Score:** 2.35/10.0  
**Suggested Category:** Reliability & Eval  
**URL:** https://arxiv.org/abs/2602.21711  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 1.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** rag

**Abstract:**
Longitudinal data often involve heterogeneity, sparse signals, and contamination from response outliers or high-leverage observations especially in biomedical science. Existing methods usually address only part of this problem, either emphasizing penalized mixed effects modeling without robustness or robust mixed effects estimation without high-dimensional variable selection. We propose a doubly adaptive robust regression (DAR-R) framework for longitudinal linear mixed effects models. It combines a robust pilot fit, doubly adaptive observation weights for residual outliers and leverage points, and folded concave penalization for fixed effect selection, together with weighted updates of random effects and variance components. We develop an iterative reweighting algorithm and establish estimation and prediction error bounds, support recovery consistency, and oracle-type asymptotic normality. Simulations show that DAR-R improves estimation accuracy, false-positive control, and covariance estimation under both vertical outliers and bad leverage contamination. In the TADPOLE/ADNI Alzheimer's disease application, DAR-R achieves accurate and stable prediction of ADAS13 while selecting clinically meaningful predictors with strong resampling stability.

---

## 46. Excitation: Momentum For Experts

**arXiv ID:** 2602.21798  
**Quality Score:** 2.35/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.21798  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.0/3.0
- Clarity (20%): 2.5/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** memory

**Abstract:**
We propose Excitation, a novel optimization framework designed to accelerate learning in sparse architectures such as Mixture-of-Experts (MoEs). Unlike traditional optimizers that treat all parameters uniformly, Excitation dynamically modulates updates using batch-level expert utilization. It introduces a competitive update dynamic that amplifies updates to highly-utilized experts and can selectively suppress low-utilization ones, effectively sharpening routing specialization. Notably, we identify a phenomenon of "structural confusion" in deep MoEs, where standard optimizers fail to establish functional signal paths; Excitation acts as a specialization catalyst, "rescuing" these models and enabling stable training where baselines remain trapped. Excitation is optimizer-, domain-, and model-agnostic, requires minimal integration effort, and introduces neither additional per-parameter optimizer state nor learnable parameters, making it highly viable for memory-constrained settings. Across language and vision tasks, Excitation consistently improves convergence speed and final performance in MoE models, indicating that active update modulation is a key mechanism for effective conditional computation.

---

## 47. Behavioral Cloning for Robotic Connector Assembly: An Empirical Study

**arXiv ID:** 2602.22100  
**Quality Score:** 2.33/10.0  
**Suggested Category:** Feedback Loops  
**URL:** https://arxiv.org/abs/2602.22100  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** feedback

**Abstract:**
Automating the assembly of wire harnesses is challenging in automotive, electrical cabinet, and aircraft production, particularly due to deformable cables and a high variance in connector geometries. In addition, connectors must be inserted with limited force to avoid damage, while their poses can vary significantly. While humans can do this task intuitively by combining visual and haptic feedback, programming an industrial robot for such a task in an adaptable manner remains difficult. This work presents an empirical study investigating the suitability of behavioral cloning for learning an action prediction model for connector insertion that fuses force-torque sensing with a fixed position camera. We compare several network architectures and other design choices using a dataset of up to 300 successful human demonstrations collected via teleoperation of a UR5e robot with a SpaceMouse under varying connector poses. The resulting system is then evaluated against five different connector geometries under varying connector poses, achieving an overall insertion success rate of over 90 %.

---

## 48. MEDSYN: Benchmarking Multi-EviDence SYNthesis in Complex Clinical Cases for Multimodal Large Language Models

**arXiv ID:** 2602.21950  
**Quality Score:** 2.33/10.0  
**Suggested Category:** Orchestration & Control  
**URL:** https://arxiv.org/abs/2602.21950  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** benchmark, workflow

**Abstract:**
Multimodal large language models (MLLMs) have shown great potential in medical applications, yet existing benchmarks inadequately capture real-world clinical complexity. We introduce MEDSYN, a multilingual, multimodal benchmark of highly complex clinical cases with up to 7 distinct visual clinical evidence (CE) types per case. Mirroring clinical workflow, we evaluate 18 MLLMs on differential diagnosis (DDx) generation and final diagnosis (FDx) selection. While top models often match or even outperform human experts on DDx generation, all MLLMs exhibit a much larger DDx--FDx performance gap compared to expert clinicians, indicating a failure mode in synthesis of heterogeneous CE types. Ablations attribute this failure to (i) overreliance on less discriminative textual CE ($\it{e.g.}$, medical history) and (ii) a cross-modal CE utilization gap. We introduce Evidence Sensitivity to quantify the latter and show that a smaller gap correlates with higher diagnostic accuracy. Finally, we demonstrate how it can be used to guide interventions to improve model performance. We will open-source our benchmark and code.

---

## 49. ProactiveMobile: A Comprehensive Benchmark for Boosting Proactive Intelligence on Mobile Devices

**arXiv ID:** 2602.21858  
**Quality Score:** 2.33/10.0  
**Suggested Category:** Feedback Loops  
**URL:** https://arxiv.org/abs/2602.21858  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 3.0/3.0

**Tags:** agent, context, api, evaluation, benchmark, autonomous

**Abstract:**
Multimodal large language models (MLLMs) have made significant progress in mobile agent development, yet their capabilities are predominantly confined to a reactive paradigm, where they merely execute explicit user commands. The emerging paradigm of proactive intelligence, where agents autonomously anticipate needs and initiate actions, represents the next frontier for mobile agents. However, its development is critically bottlenecked by the lack of benchmarks that can address real-world complexity and enable objective, executable evaluation. To overcome these challenges, we introduce ProactiveMobile, a comprehensive benchmark designed to systematically advance research in this domain. ProactiveMobile formalizes the proactive task as inferring latent user intent across four dimensions of on-device contextual signals and generating an executable function sequence from a comprehensive function pool of 63 APIs. The benchmark features over 3,660 instances of 14 scenarios that embrace real-world complexity through multi-answer annotations. To ensure quality, a team of 30 experts conducts a final audit of the benchmark, verifying factual accuracy, logical consistency, and action feasibility, and correcting any non-compliant entries. Extensive experiments demonstrate that our fine-tuned Qwen2.5-VL-7B-Instruct achieves a success rate of 19.15%, outperforming o1 (15.71%) and GPT-5 (7.39%). This result indicates that proactivity is a critical competency widely lacking in current MLLMs, yet it is learnable, emphasizing the importance of the proposed benchmark for proactivity evaluation.

---

## 50. LLMTailor: A Layer-wise Tailoring Tool for Efficient Checkpointing of Large Language Models

**arXiv ID:** 2602.22158  
**Quality Score:** 2.32/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.22158  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** rag, tool, evaluation

**Abstract:**
Checkpointing is essential for fault tolerance in training large language models (LLMs). However, existing methods, regardless of their I/O strategies, periodically store the entire model and optimizer states, incurring substantial storage overhead and resource contention. Recent studies reveal that updates across LLM layers are highly non-uniform. Across training steps, some layers may undergo more significant changes, while others remain relatively stable or even unchanged. This suggests that selectively checkpointing only layers with significant updates could reduce overhead without harming training. Implementing such selective strategies requires fine-grained control over both weights and optimizer states, which no current tool provides. To address this gap, we propose \texttt{LLMTailor}, a checkpoint-merging framework that filters and assembles layers from different checkpoints to form a composite checkpoint. Our evaluation indicates that LLMTailor can work with different selective checkpointing strategies and effectively reduce checkpoint size (e.g., 4.3 times smaller for Llama3.1-8B) and checkpoint time (e.g., 2.8 times faster for Qwen2.5-7B) while maintaining model quality.

---

## 51. SPGen: Stochastic scanpath generation for paintings using unsupervised domain adaptation

**arXiv ID:** 2602.22049  
**Quality Score:** 2.32/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.22049  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 2.5/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** tool, testing

**Abstract:**
Understanding human visual attention is key to preserving cultural heritage We introduce SPGen a novel deep learning model to predict scanpaths the sequence of eye movementswhen viewers observe paintings.   Our architecture uses a Fully Convolutional Neural Network FCNN with differentiable fixation selection and learnable Gaussian priors to simulate natural viewing biases To address the domain gap between photographs and artworks we employ unsupervised domain adaptation via a gradient reversal layer allowing the model to transfer knowledge from natural scenes to paintings Furthermore a random noise sampler models the inherent stochasticity of eyetracking data.   Extensive testing shows SPGen outperforms existing methods offering a powerful tool to analyze gaze behavior and advance the preservation and appreciation of artistic treasures.

---

## 52. Solderable Microcontroller-Integrated E-Textiles using UV-Tape-Assisted Laser Patterning Technique

**arXiv ID:** 2602.21732  
**Quality Score:** 2.32/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21732  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** memory, api

**Abstract:**
In this study, we developed a UV-tape-assisted laser patterning (UT-Laser) technique that enables the simple transfer-based formation of wiring with line widths below 200 $μ$m onto textile substrates. With the rapid advancement of wearable devices capable of acquiring various types of physiological and environmental information, research on electronic textiles (e-textiles)-in which electronic components are integrated into fabrics and clothing-has progressed considerably. However, integrating high-performance, rigid electronic components onto textiles remains challenging: the diameter of textile fibers limits the formation of fine wiring, making reliable mounting of such components difficult. To address these challenges, we devised the UT-Laser technique, in which thin foil or film materials are laser vector-cut on UV tape, and the adhesive strength is controlled through UV exposure. The unnecessary portions are selectively and collectively peeled away to form fine wiring, which is subsequently transferred onto the textile substrate. This approach enables facile fabrication of fine wiring with line widths below 200 $μ$m on textiles. Furthermore, by forming fine wiring from a flexible copper clad laminate and transferring it onto heat-resistant glass cloth, electronic components can be soldered directly, allowing the fabrication of e-textile devices capable of withstanding more than 10,000 bending cycles. The prototype e-textile device fabricated using the proposed method integrates a microcontroller, USB connector, battery holder, flash memory, inertial measurement unit, and environmental sensors, and successfully acquires data related to stair climbing, respiration, and changes in body temperature during sleep.

---

## 53. Isotope-Resolved Ba and Xe Yields in Actinide Fission and Correlated Heavy--Light Fragment Systematics

**arXiv ID:** 2602.21692  
**Quality Score:** 2.32/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21692  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** rag, api, benchmark

**Abstract:**
Isotope-resolved post-neutron fission yields in the Ba and Xe chains are calculated and benchmarked against evaluated reference data, with emphasis on element-resolved isotopic chains $Y(N_f)$ at fixed fragment charge $Z$ and on the consistency of heavy--light fragment correlations. Calculations are performed within a four-dimensional (4D) Langevin framework employing Fourier-over-Spheroid shape parametrization. The benchmark covers spontaneous fission of selected Cm and Cf isotopes (including $^{244,246}$Cm and $^{250}$Cf) as well as neutron-induced fission at thermal and 14-MeV energies for representative actinides in the Th--Pu region (including $^{229}$Th, $^{235}$U, $^{239}$Pu, and $^{249}$Cf). The dominant neutron-number maxima are reproduced for a large fraction of the isotopic chains considered, indicating that the mean charge partition and the average neutron content of the main fission channels are described consistently. A systematic residual discrepancy is observed in the isotopic widths: the calculated yields often fall off too rapidly on the distribution tails, producing distributions that are narrower than the evaluated data, most notably for heavy-fragment chains.

---

## 54. When More Is Less: A Systematic Analysis of Spatial and Commonsense Information for Visual Spatial Reasoning

**arXiv ID:** 2602.21619  
**Quality Score:** 2.30/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21619  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 2.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** context, benchmark, pipeline

**Abstract:**
Visual spatial reasoning (VSR) remains challenging for modern vision-language models (VLMs), despite advances in multimodal architectures. A common strategy is to inject additional information at inference time, such as explicit spatial cues, external commonsense knowledge, or chain-of-thought (CoT) reasoning instructions. However, it remains unclear when such information genuinely improves reasoning and when it introduces noise. In this paper, we conduct a hypothesis-driven analysis of information injection for VSR across three representative VLMs and two public benchmarks. We examine (i) the type and number of spatial contexts, (ii) the amount and relevance of injected commonsense knowledge, and (iii) the interaction between spatial grounding and CoT prompting. Our results reveal a consistent pattern: more information does not necessarily yield better reasoning. Targeted single spatial cues outperform multi-context aggregation, excessive or weakly relevant commonsense knowledge degrades performance, and CoT prompting improves accuracy only when spatial grounding is sufficiently precise. These findings highlight the importance of selective, task-aligned information injection and provide practical guidance for designing reliable multimodal reasoning pipelines.

---

## 55. Linear Perturbations and Multi-Probe Diagnostics in Dark-Sector Selective $f(R,T_χ)$ Gravity

**arXiv ID:** 2602.21774  
**Quality Score:** 2.30/10.0  
**Suggested Category:** None  
**URL:** https://arxiv.org/abs/2602.21774  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 2.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 1.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** 

**Abstract:**
We develop a dark-sector selective trace-coupled extension of gravity in which the matter--curvature coupling depends exclusively on the trace of the dark-matter energy--momentum tensor, $T_χ$, defined from a canonical dark-matter field $χ$. This construction provides a microphysically specified trace sector, removes the usual matter-Lagrangian ambiguity of $f(R,T)$-type models, and preserves minimal coupling of visible matter by design. We derive the full field equations, the exact dark-sector exchange structure, and the linear scalar-perturbation system in gauge-ready form. In the sub-horizon regime, we derive effective modified-gravity functions governing structure growth and light deflection, and show that the model generically produces correlated, scale- and time-dependent departures from General Relativity in growth and lensing observables. Building on this structure, we formulate a perturbation-focused multi-probe framework based on redshift-space distortions, weak lensing, and CMB lensing, explicitly targeting degeneracy breaking beyond background-expansion tests. The analysis establishes the action-level and perturbation-level foundations of the model and provides a conservative, reproducible framework for translated linear-regime constraints within a dark-sector selective modified-gravity setting.

---

## 56. Generalized Multidimensional Contests with Asymmetric Players: Equilibrium and Optimal Prize Design

**arXiv ID:** 2602.21564  
**Quality Score:** 2.27/10.0  
**Suggested Category:** Reliability & Eval  
**URL:** https://arxiv.org/abs/2602.21564  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 1.0/3.0

**Tags:** 

**Abstract:**
We study the $n$-dimensional contest between two asymmetric players with different marginal effort costs, with each dimension (i.e., battle) modeled as a Tullock contest. We allow general identity-independent and budget-balanced prize allocation rules in which each player's prize increases weakly in the number of their victories, e.g., a majority rule if $n$ is odd. When the discriminatory power of the Tullock winner-selection mechanism is no greater than $2/(n+1)$, a unique equilibrium arises where each player exerts deterministic and identical effort across all dimensions. This condition applies uniformly to all eligible prize allocation rules and all levels of players' asymmetry, and it is tight. Under this condition, we derive the effort-maximizing prize allocation rule: the entire prize is awarded to the player who wins more battles than his opponent by a pre-specified margin, and the prize is split equally if neither player does. When $n$ is odd, and players are symmetric, the majority rule is optimal.

---

## 57. Dynamic Multimodal Activation Steering for Hallucination Mitigation in Large Vision-Language Models

**arXiv ID:** 2602.21704  
**Quality Score:** 2.25/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21704  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 2.0/3.0
- Clarity (20%): 2.5/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** context

**Abstract:**
Large Vision-Language Models (LVLMs) exhibit outstanding performance on vision-language tasks but struggle with hallucination problems. Through in-depth analysis of LVLM activation patterns, we reveal two key findings: 1) truthfulness and visual perception capabilities predominantly engage different subsets of attention heads within the model architecture; and 2) truthfulness steering vectors vary significantly across different semantic contexts. Based on these observations, we propose Dynamic Multimodal Activation Steering, a training-free approach for hallucination mitigation. Our method constructs a semantic-based truthfulness steering vector database and computes visual perception steering vectors, enabling context-aware interventions during inference by dynamically selecting the most relevant steering vectors based on input semantic similarity and applying them to the most influential attention heads. We conduct comprehensive experiments across multiple models and datasets, demonstrating that our approach significantly enhances model performance, outperforming existing state-of-the-art methods.

---

## 58. RADAR: Reasoning as Discrimination with Aligned Representations for LLM-based Knowledge Graph Reasoning

**arXiv ID:** 2602.21951  
**Quality Score:** 2.17/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.21951  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 2.5/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 1.0/3.0

**Tags:** rag, benchmark

**Abstract:**
Knowledge graph reasoning (KGR) infers missing facts, with recent advances increasingly harnessing the semantic priors and reasoning abilities of Large Language Models (LLMs). However, prevailing generative paradigms are prone to memorizing surface-level co-occurrences rather than learning genuine relational semantics, limiting out-of-distribution generalization. To address this, we propose RADAR, which reformulates KGR from generative pattern matching to discriminative relational reasoning. We recast KGR as discriminative entity selection, where reinforcement learning enforces relative entity separability beyond token-likelihood imitation. Leveraging this separability, inference operates directly in representation space, ensuring consistency with the discriminative optimization and bypassing generation-induced hallucinations. Across four benchmarks, RADAR achieves 5-6% relative gains on link prediction and triple classification over strong LLM baselines, while increasing task-relevant mutual information in intermediate representations by 62.9%, indicating more robust and transferable relational reasoning.

---

## 59. Holographic QCD equation of state constrained by lattice QCD: neural-ODE for probe-limit and a back-reaction test

**arXiv ID:** 2602.21618  
**Quality Score:** 2.17/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21618  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 1.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** 

**Abstract:**
We study the equation of state (EoS) of QCD matter in a bottom-up holographic setup that combines an Einstein-Maxwell-dilaton (EMD) sector with an improved Karch-Katz-Son-Stephanov (KKSS) flavor action. In the probe approximation, we perform an inverse reconstruction of the model functions by parameterizing them with neural networks and solving the EMD equations via a differentiable ODE solver (a neural ODE framework), calibrating the model to a $(2+1)$-flavor lattice-QCD EoS at finite temperature and finite baryon chemical potential. The reconstructed model functions are then parametrized and kept fixed across thermodynamic states. Next, viewing the EMD sector as an effective description of pure Yang--Mills theory, we fix its parameters by fitting the $μ_B=0$ lattice pure-glue EoS using a hybrid optimization strategy. Finally, we go beyond the probe limit and solve the coupled EMD$+$KKSS equations with back-reaction, using the pure-glue-calibrated EMD sector as a fixed input and varying the KKSS couplings to compare with the $μ_B=0$ two-flavor lattice EoS. We find a visible mismatch and a high-temperature behavior in which the back-reacted dimensionless ratios approach a nearly $β_1$-insensitive plateau close to the pure-glue baseline, providing a simple structural diagnostic for the present flavor-sector truncation.

---

## 60. Breaking Semantic-Aware Watermarks via LLM-Guided Coherence-Preserving Semantic Injection

**arXiv ID:** 2602.21593  
**Quality Score:** 2.13/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21593  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 3.0/3.0
- Completeness (10%): 1.0/3.0

**Tags:** rag, security

**Abstract:**
Generative images have proliferated on Web platforms in social media and online copyright distribution scenarios, and semantic watermarking has increasingly been integrated into diffusion models to support reliable provenance tracking and forgery prevention for web content. Traditional noise-layer-based watermarking, however, remains vulnerable to inversion attacks that can recover embedded signals. To mitigate this, recent content-aware semantic watermarking schemes bind watermark signals to high-level image semantics, constraining local edits that would otherwise disrupt global coherence. Yet, large language models (LLMs) possess structured reasoning capabilities that enable targeted exploration of semantic spaces, allowing locally fine-grained but globally coherent semantic alterations that invalidate such bindings. To expose this overlooked vulnerability, we introduce a Coherence-Preserving Semantic Injection (CSI) attack that leverages LLM-guided semantic manipulation under embedding-space similarity constraints. This alignment enforces visual-semantic consistency while selectively perturbing watermark-relevant semantics, ultimately inducing detector misclassification. Extensive empirical results show that CSI consistently outperforms prevailing attack baselines against content-aware semantic watermarking, revealing a fundamental security weakness of current semantic watermark designs when confronted with LLM-driven semantic perturbations.

---

## 61. SWE-Protégé: Learning to Selectively Collaborate With an Expert Unlocks Small Language Models as Software Engineering Agents

**arXiv ID:** 2602.22124  
**Quality Score:** 2.12/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.22124  

**Score Breakdown:**
- Reusability (30%): 3.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 2.5/3.0
- Evidence (15%): 1.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** agent, rag, feedback

**Abstract:**
Small language models (SLMs) offer compelling advantages in cost, latency, and adaptability, but have so far lagged behind larger models on long-horizon software engineering tasks such as SWE-bench, where they suffer from pervasive action looping and low resolution rates. We introduce SWE-Protégé, a post-training framework that reframes software repair as an expert-protégé collaboration problem. In SWE-Protégé, an SLM remains the sole decision-maker while learning to selectively seek guidance from a strong expert model, recognize stalled states, and follow through on expert feedback. Our approach combines supervised fine-tuning on expert-augmented trajectories with agentic reinforcement learning that explicitly discourages degenerative looping and unproductive expert collaboration. We lightly post-train Qwen2.5-Coder-7B-Instruct to achieve 42.4% Pass@1 on SWE-bench Verified, a +25.4% improvement over the prior SLM state of the art, while using expert assistance sparsely (~4 calls per task and 11% of total tokens).

---

## 62. Target controllability for a minimum time problem in a trait-structured chemostat model

**arXiv ID:** 2602.21999  
**Quality Score:** 2.12/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21999  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 2.5/3.0
- Clarity (20%): 2.5/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 1.0/3.0

**Tags:** rag, feedback

**Abstract:**
In this paper, we consider a minimum time control problem governed by a trait-structured chemostat model including mutation and one limiting substrate. Our first main result proves the well-posedness of the control-to-state mapping. We subsequently analyze the class of auxostat-type controls, feedback laws designed to regulate substrate concentration, and prove that the corresponding solutions converge to a stationary state of the system. These convergence results are used to show the reachability of a target set corresponding to the selection of a population with a low weighted averaged half-saturation constant. Finally, we show the existence of an optimal control for the minimum time problem associated with reaching the target set. These theoretical findings are completed by numerical simulations.

---

## 63. Understanding Artificial Theory of Mind: Perturbed Tasks and Reasoning in Large Language Models

**arXiv ID:** 2602.22072  
**Quality Score:** 2.10/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.22072  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 2.0/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 1.0/3.0

**Tags:** agent

**Abstract:**
Theory of Mind (ToM) refers to an agent's ability to model the internal states of others. Contributing to the debate whether large language models (LLMs) exhibit genuine ToM capabilities, our study investigates their ToM robustness using perturbations on false-belief tasks and examines the potential of Chain-of-Thought prompting (CoT) to enhance performance and explain the LLM's decision. We introduce a handcrafted, richly annotated ToM dataset, including classic and perturbed false belief tasks, the corresponding spaces of valid reasoning chains for correct task completion, subsequent reasoning faithfulness, task solutions, and propose metrics to evaluate reasoning chain correctness and to what extent final answers are faithful to reasoning traces of the generated CoT. We show a steep drop in ToM capabilities under task perturbation for all evaluated LLMs, questioning the notion of any robust form of ToM being present. While CoT prompting improves the ToM performance overall in a faithful manner, it surprisingly degrades accuracy for some perturbation classes, indicating that selective application is necessary.

---

## 64. Non-reciprocal electrooptic intermodal scattering with momentum engineered RF waves

**arXiv ID:** 2602.21527  
**Quality Score:** 2.08/10.0  
**Suggested Category:** Learning & Adaptation  
**URL:** https://arxiv.org/abs/2602.21527  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** tool

**Abstract:**
Spatiotemporal modulation approaches have been often employed as alternatives for producing optical non-reciprocity without magneto-optic materials. Unidirectional inter-modal scattering, enabled by either acousto-optic or electro-optic (EO) modulation, is a promising method in this category as it can directly modify optical dispersions and even enables linear non-reciprocal photonic devices in the strong coupling limit. While EO approaches are often preferred for their practicality, it is challenging to generate the large spatiotemporal momentum required for inter-modal phase matching without EO drive schemes involving multiple drive stimuli. Here, we demonstrate highly selective non-reciprocal inter-modal EO scattering enabled by a single high-index radiofrequency (RF) traveling wave stimulus. Our experimental demonstration is performed on a thin-film lithium niobate integrated photonics platform, in which we engineer a slow-wave radiofrequency (SWRF) transmission line with an effective RF index &gt; 9 that natively generates the required RF momentum while simultaneously maintaining strong RF-optical mode overlap. By additionally engineering the interaction length, we achieve a directional ~20 dB non-reciprocal scattering contrast. The SWRF architecture provides a scalable route to magnetic-free non-reciprocity and establishes momentum-engineered RF waves as a powerful tool for next-generation, fully integrated non-reciprocal photonic systems.

---

## 65. Purcell-enhanced Bright and Dark Exciton Emission from Perovskite Quantum Dots in Micro-ring Resonators

**arXiv ID:** 2602.22106  
**Quality Score:** 1.98/10.0  
**Suggested Category:** Orchestration & Control  
**URL:** https://arxiv.org/abs/2602.22106  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 1.0/3.0

**Tags:** rag

**Abstract:**
Colloidal quantum dots (QDs) integrated with waveguide-coupled dielectric resonators are promising building blocks for compact on-chip light sources. However, deterministic placement of QDs with strong mode overlap at the desired location remains a challenge. Here, we demonstrate a simple and scalable strategy for integrating colloidal QDs with a waveguide-coupled Si3N4 micro-ring resonator platform and for controlling the radiative dynamics of both bright and dark excitons via Purcell enhancement. We use strongly quantum-confined CsPbBr3 QDs, which exhibit bright-exciton emission at room-temperature, while emission at cryogenic temperatures originates from both bright and dark excitons. The CsPbBr3 QDs are selectively retained on the Si3N4 micro-ring cavities through a spin-coating/rinsing process, enabling efficient overlap with whispering-gallery modes and routing of the emission through integrated waveguides. We confirm accelerated decay of emission from both bright and dark excitons for CsPbBr3 QDs coupled to the micro-ring cavities. These results demonstrate an effective route to integrate colloidal QDs with Si3N4 micro-ring cavities and to leverage cavity-enhanced emission in scalable integrated photonic devices.

---

## 66. Analysis of the action of conventional trapped-ion entangling gates in qudit space

**arXiv ID:** 2602.21886  
**Quality Score:** 1.98/10.0  
**Suggested Category:** Orchestration & Control  
**URL:** https://arxiv.org/abs/2602.21886  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 2.5/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 2.0/3.0

**Tags:** decomposition

**Abstract:**
Qudits, or multi-level quantum information carriers, present a promising path for scaling quantum computers. However, their use introduces increased complexity in quantum logic, necessitating careful control of relative phases between different qudit levels. In trapped-ion systems, entangling operations accumulate phases on specific levels that are no longer global, unlike in qubit architectures. Furthermore, the structure of multi-level gates becomes increasingly intricate with higher-dimensional Hilbert spaces. This work explores the theory of these additional entangling and non-entangling phases, accumulated in Mølmer--Sørensen and Light-shift gates. We propose methods to actively compensate for these phases, enhance gate robustness against parameter fluctuations, and simplify native gates for more efficient circuit decomposition. Our results pave the way toward the practical and scalable implementation of qudit-based quantum processors.

---

## 67. Using Feasible Action-Space Reduction by Groups to fill Causal Responsibility Gaps in Spatial Interactions

**arXiv ID:** 2602.22041  
**Quality Score:** 1.93/10.0  
**Suggested Category:** UX & Collaboration  
**URL:** https://arxiv.org/abs/2602.22041  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 2.5/3.0
- Evidence (15%): 2.0/3.0
- Completeness (10%): 1.5/3.0

**Tags:** agent, autonomous

**Abstract:**
Heralding the advent of autonomous vehicles and mobile robots that interact with humans, responsibility in spatial interaction is burgeoning as a research topic. Even though metrics of responsibility tailored to spatial interactions have been proposed, they are mostly focused on the responsibility of individual agents. Metrics of causal responsibility focusing on individuals fail in cases of causal overdeterminism -- when many actors simultaneously cause an outcome. To fill the gaps in causal responsibility left by individual-focused metrics, we formulate a metric for the causal responsibility of groups. To identify assertive agents that are causally responsible for the trajectory of an affected agent, we further formalise the types of assertive influences and propose a tiering algorithm for systematically identifying assertive agents. Finally, we use scenario-based simulations to illustrate the benefits of considering groups and how the emergence of group effects vary with interaction dynamics and the proximity of agents.

---

## 68. Towards Polarization Routing of Magnetic and Electric Dipolar Emission with Dielectric Metasurfaces

**arXiv ID:** 2602.21729  
**Quality Score:** 1.83/10.0  
**Suggested Category:** Context & Memory  
**URL:** https://arxiv.org/abs/2602.21729  

**Score Breakdown:**
- Reusability (30%): 2.0/3.0
- Novelty (25%): 1.5/3.0
- Clarity (20%): 3.0/3.0
- Evidence (15%): 1.0/3.0
- Completeness (10%): 1.0/3.0

**Tags:** 

**Abstract:**
We investigate the polarization properties of emission associated with the magnetic dipole and electric dipole transitions of europium(III) coupled to an anisotropic dielectric metasurface with polarization-engineered electric and magnetic photonic local density of states. The metasurface consists of a square array of Mie-resonant elliptical a-Si:H dimers situated on an SiO$_2$ substrate and embedded in a PMMA film containing Eu(TTA)$_3$. Based on reciprocity principle, it was designed to achieve maximum electric (magnetic) field enhancement in the dimer gap at 610 nm (590 nm) for $x$-polarized ($y$-polarized) normally incident light in order to selectively enhance the electric dipole (magnetic dipole) emission into the $x$-polarized ($y$-polarized) emission channel, respectively. Momentum-resolved spectroscopy and back-focal plane imaging of emission of the fabricated light-emitting metasurface clearly reveal the intended polarization-dependent emission behaviour, with the $x$-polarized ($y$-polarized) emission showing a reduced (enhanced) ratio of the magnetic-/electric dipole emission intensity, correspondingly where the magnetic dipole emission is enhanced with a magnetic field enhancement from the nanostructures. The demonstrated polarization-dependent interaction of a designed nanostructure with the electric- and magnetic dipolar transitions of trivalent lanthanide ions opens an avenue towards routing of emission of different multipolar orders into different polarization channels.

---

### File: action_selector_code_implementations.md

# Action Selector Pattern - Code Implementations Research

**Research Date:** 2026-02-26
**Researcher:** Research Agent
**Focus:** Code implementations of the Action Selector pattern in AI agents and LLMs

---

## Executive Summary

The Action Selector pattern is a fundamental design pattern in AI agent systems where the agent functions as an intelligent dispatcher that selects and executes appropriate tools/actions based on natural language input. This research document catalogs real-world implementations, code examples, and best practices from popular AI frameworks.

---

## Table of Contents

1. [Core Pattern Structure](#core-pattern-structure)
2. [Popular Framework Implementations](#popular-framework-implementations)
3. [Code Examples by Pattern Type](#code-examples-by-pattern-type)
4. [GitHub Repositories](#github-repositories)
5. [Best Practices and Performance Considerations](#best-practices-and-performance-considerations)
6. [Common Libraries and Tools](#common-libraries-and-tools)

---

## Core Pattern Structure

### The Basic Action Selector Flow

```python
class ActionSelectorAgent:
    """
    Core action selector pattern implementation
    """
    def __init__(self, tools: list, llm):
        self.tools = tools
        self.llm = llm
        self.history = []

    def run(self, user_input: str, max_iterations: int = 10) -> str:
        """
        Main agent loop implementing the action selector pattern
        """
        self.history.append({"role": "user", "content": user_input})

        for iteration in range(max_iterations):
            # 1. REASON: Call LLM to decide what to do
            response = self.llm.generate(
                messages=self.history,
                tools=self._get_tool_schemas()
            )

            message = response.choices[0].message

            # 2. Check if done (no tool calls)
            if not message.tool_calls:
                return message.content

            # 3. ACT: Execute selected tools
            for tool_call in message.tool_calls:
                tool = self._get_tool_by_name(tool_call.function.name)
                result = tool.execute(**json.loads(tool_call.function.arguments))

                # 4. OBSERVE: Feed results back to LLM
                self.history.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": str(result)
                })

        return "Maximum iterations reached"
```

### Key Components

| Component | Responsibility |
|-----------|---------------|
| **Tool Registry** | Maintains available tools with metadata (name, description, schema) |
| **Selector Engine** | Uses LLM to choose appropriate tool based on context |
| **Executor** | Invokes selected tools with validated parameters |
| **Result Handler** | Processes tool outputs and feeds back to selector |
| **State Manager** | Maintains conversation history and context |

---

## Popular Framework Implementations

### 1. LangChain

LangChain is the most mature framework for action selection with 200+ tool integrations.

**Repository:** [langchain-ai/langchain](https://github.com/langchain-ai/langchain)

#### Core AgentAction Structure

```python
from langchain.agents import AgentAction, AgentExecutor
from langchain.tools import tool
from langchain_openai import ChatOpenAI

# Define tools with descriptions for selection
@tool
def search(query: str) -> str:
    """Search network information"""
    return f"Search results for: {query}"

@tool
def calculator(expression: str) -> str:
    """Calculate mathematical expressions"""
    return str(eval(expression))

# Create agent - LLM automatically selects tools based on descriptions
llm = ChatOpenAI(model="gpt-3.5-turbo")
tools = [search, calculator]

agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Agent handles tool selection automatically
result = agent_executor.invoke({"input": "What is 2+2?"})
```

**Key Features:**
- Tool selection via LLM reasoning from tool descriptions
- Built-in AgentExecutor for the action loop
- Multiple agent types: ReAct, OpenAI Functions, XML

---

### 2. TRAE Agent (ByteDance)

**Repository:** [bytedance/TRAE-agent](https://github.com/bytedance/TRAE-agent)
**Performance:** 75.2% on SWE-bench Verified

#### Selector Agent Implementation

TRAE Agent features a sophisticated **Selector Agent** for choosing the best solution among multiple AI-generated patches.

```python
# File structure:
# evaluation/patch_selection/
#   ├── selector.py              # CLI entry point
#   └── trae_selector/
#       └── selector_agent.py    # Core AI decision logic

class SelectorAgent:
    """
    TRAE Agent's sophisticated selector implementation

    Two Selection Strategies:
    1. LLM-as-a-Selector: Uses LLM to score and select patches
    2. Selector Agent (Enhanced): Syntax voting + multi-agent verification
    """

    def select_patch(self, candidate_patches: list[Patch]) -> Patch:
        """
        Multi-stage selection process:
        1. Run existing regression tests
        2. Check semantic similarity
        3. Layered pruning strategy
        4. Repository-level program understanding
        """
        # Filter by regression tests
        passing_patches = self._run_regression_tests(candidate_patches)

        # Semantic similarity clustering
        clusters = self._cluster_by_syntax(passing_patches)

        # Multi-agent verification for final selection
        best_patch = self._verify_with_multi_agent(clusters)

        return best_patch
```

**Key Innovations:**
- Layered pruning strategy for efficient selection
- Multi-agent verification for accuracy
- Repository-level program understanding

---

### 3. BabyAGI

**Repository:** [yoheinakajima/babyagi](https://github.com/yoheinakajima/babyagi)
**Documentation:** [Birth of BabyAGI](https://yoheinakajima.com/birth-of-babyagi/)

#### Task-Based Action Selection

BabyAGI uses three specialized agents for action selection:

```python
class BabyAGI:
    """
    BabyAGI implements action selection through task management
    """

    def __init__(self):
        self.task_creation_agent = TaskCreationAgent()
        self.task_prioritization_agent = TaskPrioritizationAgent()
        self.execution_agent = ExecutionAgent()

    def run(self, objective: str):
        """
        Main loop:
        1. Create new tasks based on objective
        2. Prioritize tasks
        3. Execute top task
        4. Repeat until complete
        """
        task_list = []

        while not self._is_complete(objective, task_list):
            # Task Creation Agent: Plans subtasks
            new_tasks = self.task_creation_agent.create(
                objective=objective,
                result=self.last_result
            )
            task_list.extend(new_tasks)

            # Task Prioritization Agent: Sorts by priority
            task_list = self.task_prioritization_agent.prioritize(
                tasks=task_list
            )

            # Execution Agent: Performs the top task
            top_task = task_list[0]
            self.last_result = self.execution_agent.execute(top_task)
```

**Key Differences from AutoGPT:**
- Streamlined framework with automatic task management
- Planning logic in external Python framework
- Uses Chroma/Weaviate for context storage and retrieval

---

### 4. AutoGPT

**Repository:** [Significant-Gravitas/AutoGPT](https://github.com/Significant-Gravitas/AutoGPT)

#### Prompt-Based Action Selection

```python
class AutoGPTAgent:
    """
    AutoGPT uses prompt-based reasoning with available tool lists
    """

    def decide_next_action(self, context: dict) -> Action:
        """
        LLM performs reasoning and tool selection
        External code handles tool execution
        """
        prompt = self._build_decision_prompt(
            goal=context["goal"],
            current_state=context["state"],
            available_tools=context["tools"],
            history=context["history"]
        )

        response = self.llm.generate(prompt)

        # Parse action from LLM response
        action = self._parse_action(response)
        return action
```

**Key Features:**
- Strong self-driven cycle system
- Focus on external tool usage (search engines, web browsing)
- Acts like a personal assistant

---

## Code Examples by Pattern Type

### 1. Function Calling with Tool Routing

Modern approach using OpenAI/DeepSeek function calling APIs:

```python
import os
import json
from openai import OpenAI

# Define tools with schemas for LLM selection
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather of a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA"
                    }
                },
                "required": ["location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_pizza_info",
            "description": "Get name and price of a pizza",
            "parameters": {
                "type": "object",
                "properties": {
                    "pizza_name": {
                        "type": "string",
                        "description": "The name of the pizza"
                    }
                },
                "required": ["pizza_name"]
            }
        }
    }
]

client = OpenAI(api_key=os.getenv("DEEPSEEK_API_KEY"),
                base_url="https://api.deepseek.com")

def get_pizza_info(pizza_name: str):
    return json.dumps({"name": pizza_name, "price": "10.99"})

def send_messages(messages):
    response = client.chat.completions.create(
        model="deepseek-reasoner",
        messages=messages,
        tools=tools  # LLM selects from these tools
    )
    return response.choices[0].message

# Example workflow
messages = [{"role": "user", "content": "What's the weather in Beijing?"}]
message1 = send_messages(messages)

# LLM returns which tool to use
tool = message1.tool_calls[0]

# Execute and feed back
messages.append(message1)
messages.append({
    "role": "tool",
    "tool_call_id": tool.id,
    "content": "24℃"
})

# Get final response
message2 = send_messages(messages)
print(message2.content)
```

---

### 2. ReAct Pattern (Reasoning + Acting)

```python
class ReActAgent:
    """
    ReAct: Combine reasoning traces with action selection
    """

    def plan(self, intermediate_steps, **kwargs):
        # Build thoughts from previous steps
        thoughts = ""
        for action, observation in intermediate_steps:
            thoughts += f"Action: {action.tool}\n"
            thoughts += f"Action Input: {action.tool_input}\n"
            thoughts += f"Observation: {observation}\n"

        input_str = kwargs["input"]
        thoughts += f"Thought: Need to solve {input_str}, considering available tools..."

        prompt = self.llm_chain.predict(input=thoughts)

        # Parse action from LLM response using regex
        action_match = re.search(
            r"Action: (.*?)\nAction Input:[\s]*(.*)",
            prompt,
            re.DOTALL
        )

        if action_match:
            tool = action_match.group(1).strip()
            tool_input = action_match.group(2).strip()
            return AgentAction(tool=tool, tool_input=tool_input, log=prompt)
```

**ReAct Loop:**
1. Thought: Reason about current state
2. Action: Select and execute tool
3. Observation: Capture tool output
4. Repeat until done

---

### 3. Router/Dispatcher Pattern

```python
from fastapi import APIRouter
from core.tool_manager import TaskDispatcher

router = APIRouter()
dispatcher = TaskDispatcher()

@router.post("/ask")
async def ask_llm(prompt: str):
    """Route request to appropriate tool"""
    task_id = str(uuid.uuid4())
    dispatcher.add_task(task_id, prompt)
    return {"task_id": task_id}

@router.get("/result/{task_id}")
async def get_result(task_id: str):
    """Get result from dispatched task"""
    return {"result": dispatcher.results.get(task_id, "Processing...")}
```

---

### 4. LangGraph Router Workflow

```python
def router_workflow(input_query: str, routes: Dict[str, str]) -> str:
    """
    Select best model/route for a given task
    """
    ROUTER_PROMPT = """Given a user prompt/query: {user_query},
    select the best option out of the following routes: {routes}.
    Answer only in JSON format."""

    # LLM selects the appropriate route
    selected_route = JSON_llm(
        ROUTER_PROMPT.format(user_query=input_query, routes=routes),
        Schema
    )

    # Execute using selected route
    response = run_llm(user_prompt=input_query, model=selected_route["route"])
    return response
```

---

### 5. SayCan Agent (Utility-Based Selection)

```python
def select_action(instruction: str, world_state: WorldState) -> Optional[str]:
    """
    SayCan: Combine language model scores with affordance (feasibility) scores

    P(action) = P(say|action) × P(can|action)
    """
    # Step 1: Language model scoring P(say)
    say_scores = lm.score_skills(instruction, context, skill_names)

    # Step 2: Feasibility scoring P(can)
    can_scores = {}
    for skill_name in skill_names:
        can_scores[skill_name] = affordance.evaluate(skill_name, world_state)

    # Step 3: Combined scoring
    combined_scores = {}
    for skill_name in skill_names:
        combined_scores[skill_name] = (
            say_scores.get(skill_name, 0) * can_scores.get(skill_name, 0)
        )

    # Select highest scoring skill
    if not combined_scores:
        return None
    best_skill = max(combined_scores, key=combined_scores.get)
    return best_skill
```

---

### 6. Simple State-Based Action Selection

```python
class SimpleAgent:
    """
    Basic perceive-decide-act cycle
    """
    def __init__(self, environment):
        self.environment = environment

    def perceive(self):
        """Get current environment state"""
        return self.environment.get_state()

    def decide(self, state):
        """Decide next action based on state"""
        if some_condition(state):
            action = 'move forward'
        elif another_condition(state):
            action = 'turn left'
        else:
            action = 'stop'
        return action

    def act(self, action):
        """Execute selected action"""
        self.environment.apply_action(action)
```

---

### 7. Prompt-Based Decision Agent

```python
class ActionSelectorAgent:
    """
    Uses structured prompts for action selection
    """
    def __init__(self, llm_model):
        self.llm = llm_model
        self.prompt_template = """
Goal: {goal}
Current State: {current_state}
Completed Steps: {completed_steps}
Available Tools: {available_tools}
History Feedback: {feedback}

Please output:
1. Next Action (must be one of available tools or "task_complete")
2. Action Parameters (key parameters for the tool)
3. Expected Result (state after executing this action)
"""

    def get_next_action(self, goal, current_state, completed_steps,
                       available_tools, feedback=""):
        prompt = self.prompt_template.format(
            goal=goal,
            current_state=current_state,
            completed_steps=completed_steps,
            available_tools=available_tools,
            feedback=feedback
        )

        response = self.llm.generate(prompt)
        # Parse and return action
        return self._parse_action(response)
```

---

### 8. Weighted Tool Selection

```python
class WeightedToolSelector:
    """
    For sophisticated action selection with priorities
    """
    def __init__(self, tools):
        self.tools = tools

    def select_tool(self, task_context):
        """
        Each tool has priority/weight for specific contexts
        LLM analyzes context and selects appropriate tool
        """
        analysis = self.llm(
            f"Task context: {task_context}, which tool should be used?"
        )

        for tool in self.tools:
            if tool.name in analysis:
                return tool
        return None
```

---

### 9. Tool Selector with Similarity Matching

```python
class ToolSelector:
    """
    Select tool based on semantic similarity
    """
    def select_tool(self, task_description, available_tools):
        best_tool = None
        highest_score = 0

        for tool in available_tools:
            # Calculate similarity between task and tool descriptions
            similarity = calculate_similarity(task_description, tool.description)
            # Combine with tool priority weight
            score = similarity * tool.priority_weight

            if score > highest_score:
                highest_score = score
                best_tool = tool

        return best_tool
```

---

## GitHub Repositories

| Repository | Description | Stars | Language | Key Feature |
|------------|-------------|-------|----------|-------------|
| [langchain-ai/langchain](https://github.com/langchain-ai/langchain) | Comprehensive agent framework | 100k+ | Python | Built-in action selection |
| [bytedance/TRAE-agent](https://github.com/bytedance/TRAE-agent) | Software engineering agent | - | Python | Advanced Selector Agent |
| [yoheinakajima/babyagi](https://github.com/yoheinakajima/babyagi) | Task management agent | - | Python | Three-agent architecture |
| [Significant-Gravitas/AutoGPT](https://github.com/Significant-Gravitas/AutoGPT) | Autonomous AI agent | 160k+ | Python | Prompt-based selection |
| [junfanz1/Code-Interpreter-ReAct-LangChain-Agent](https://github.com/junfanz1/Code-Interpreter-ReAct-LangChain-Agent) | ReAct agent example | - | Python | Tool calling examples |
| [langchain-ai/social-media-agent](https://github.com/langchain-ai/social-media-agent) | Complete agent workflow | - | Python | Production examples |
| [langchain-ai/agentevals](https://github.com/langchain-ai/agentevals) | Agent evaluation tools | - | Python | Behavior evaluation |

---

## Best Practices and Performance Considerations

### 1. Tool Description Quality

**Critical:** Tool descriptions are the primary mechanism for action selection.

```python
# Good: Clear, specific description
@tool
def search_web(query: str) -> str:
    """Search the web for current information about any topic"""
    return search_engine.query(query)

# Bad: Vague description
@tool
def search(query: str) -> str:
    """Search stuff"""
    return search_engine.query(query)
```

### 2. Input Validation with Pydantic

```python
from pydantic import BaseModel, Field
from langchain_core.tools import tool

class SearchInput(BaseModel):
    """Define search input parameters"""
    query: str = Field(description="Content you need to search")

@tool(args_schema=SearchInput)
def search_zh(query: str) -> str:
    """Search for information on the web"""
    return "42 degrees"
```

### 3. Error Handling and Self-Correction

```python
def execute_with_retry(action: AgentAction, max_retries: int = 3):
    """
    Execute tool with error handling
    Agent can self-correct when tool calls fail
    """
    for attempt in range(max_retries):
        try:
            result = tool.execute(action.tool_input)
            return result
        except Exception as e:
            if attempt == max_retries - 1:
                return f"Error after {max_retries} attempts: {str(e)}"
            # Feed error back to LLM for correction
            continue
```

### 4. State Management

- Maintain conversation history for context-aware selection
- Use vector stores (Chroma, Weaviate) for long-term memory
- Track tool usage patterns for optimization

### 5. Performance Optimization

| Strategy | Benefit | Trade-off |
|----------|---------|-----------|
| **Tool Caching** | Faster repeated operations | Memory usage |
| **Parallel Execution** | Concurrent tool calls | Complexity |
| **Layered Pruning** | Faster selection (TRAE) | Implementation cost |
| **Embedding Similarity** | Fast semantic matching | Vector database needed |

### 6. Evaluation Metrics

- **SWE-bench Score:** TRAE Agent achieves 75.2%
- **Tool Selection Accuracy:** Percentage of correct tool choices
- **Iteration Count:** Average iterations to completion
- **Token Efficiency:** Tokens used per successful task

---

## Common Libraries and Tools

### Python Libraries

| Library | Purpose | Installation |
|---------|---------|--------------|
| **langchain** | Agent framework | `pip install langchain` |
| **langchain-openai** | OpenAI integration | `pip install langchain-openai` |
| **openai** | OpenAI API | `pip install openai` |
| **pydantic** | Input validation | `pip install pydantic` |
| **chromadb** | Vector storage | `pip install chromadb` |
| **weaviate-client** | Vector storage | `pip install weaviate-client` |

### Key Classes and Interfaces

```python
# LangChain core classes
from langchain.agents import AgentAction, AgentExecutor, AgentFinish
from langchain.tools import BaseTool, StructuredTool, tool
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

# OpenAI function calling
from openai import OpenAI

# Pydantic for schemas
from pydantic import BaseModel, Field
```

---

## Action Selection Strategies Summary

| Strategy | Description | Use Case | Complexity |
|----------|-------------|----------|------------|
| **Function Calling** | LLM native tool selection | General purpose | Low |
| **ReAct Pattern** | Reasoning + Acting traces | Complex reasoning | Medium |
| **Prompt-Based** | Structured prompt decisions | Simple workflows | Low |
| **Utility-Based (SayCan)** | P(say) × P(can) scoring | Robotics/physical | High |
| **Router/Dispatcher** | Pattern matching routes | API gateways | Medium |
| **Multi-Agent Verification** | Multiple agents agree | High-stakes decisions | Very High |
| **Similarity Matching** | Semantic similarity | Large tool sets | Medium |
| **LLM-as-a-Selector** | LLM scores candidates | Selection from options | Medium |

---

## Implementation Checklist

When implementing an action selector pattern:

- [ ] Define clear tool descriptions
- [ ] Implement tool schema validation
- [ ] Set up conversation history tracking
- [ ] Add error handling and retry logic
- [ ] Implement observation/feedback loop
- [ ] Add iteration limits for safety
- [ ] Consider parallel tool execution
- [ ] Plan for state persistence
- [ ] Add logging and observability
- [ ] Implement evaluation metrics

---

## Academic References

1. **Design Patterns for Securing LLM Agents** (arXiv, June 2025)
   - Defines the Action-Selector Pattern formally
   - References framework by Debenedetti et al. (2025)

2. **TRAE Agent Paper** (ByteDance, July 2025)
   - Selector Agent with multi-model verification
   - Achieved 75.2% on SWE-bench Verified

---

## Sources

- [TRAE Agent (ByteDance) GitHub Repository](https://github.com/bytedance/TRAE-agent)
- [LangChain Agent Tooling Documentation](https://m.blog.csdn.net/2301_81940605/article/details/153041021)
- [通用LLM Agent构建指南](https://m.blog.csdn.net/CSDN_224022/article/details/153870445)
- [纯Python AI Agent](https://m.php.cn/faq/1977311.html)
- [简易通用智能Agent (<100行代码)](https://m.blog.csdn.net/2401_85373691/article/details/147549017)
- [Dify源码解析](https://m.blog.csdn.net/exlink2012/article/details/155342491)
- [BabyAGI GitHub Repository](https://github.com/yoheinakajima/babyagi)
- [AutoGPT GitHub Repository](https://github.com/Significant-Gravitas/AutoGPT)
- [Birth of BabyAGI](https://yoheinakajima.com/birth-of-babyagi/)
- [Design Patterns for Securing LLM Agents (arXiv)](https://arxiv.org/html/2506.08837v2)

---

## Notes

- This pattern is actively evolving with new implementations emerging regularly
- TRAE Agent represents the state-of-the-art for code-specific action selection
- LangChain remains the most comprehensive general-purpose framework
- Function calling APIs are becoming the de facto standard for tool selection

---

*Document generated by Research Agent on 2026-02-26*
