# Action Selector Pattern - Industry Implementation Analysis

**Generated:** 2026-02-27
**Research Focus:** Real-world implementations of action selector patterns in production systems

---

## Executive Summary

The Action Selector Pattern has matured significantly from theoretical research to production implementations across major AI frameworks and enterprise deployments. This analysis identifies two distinct but complementary interpretations:

1. **Security-Focused Action Selector**: Prevents prompt injection by restricting LLMs to selecting from pre-approved actions with schema validation
2. **Orchestration-Focused Agent Routing**: Intelligently routes tasks to appropriate tools or agents in multi-agent systems

Both patterns are now validated-in-production at major companies including Anthropic, OpenAI, Microsoft, and Google.

---

## 1. Framework Support

### LangChain / LangGraph

**Status:** Most mature framework with 200+ tool integrations

**Implementation Approach:**
- **ReAct Pattern**: Thought → Action → Observation loop
- **Tool descriptions**: LLM selects tools based on descriptions
- **AgentExecutor**: Built-in action loop management
- **Multiple agent types**: ReAct, OpenAI Functions, XML

**Code Example:**
```python
from langchain.agents import AgentAction, AgentExecutor
from langchain.tools import tool
from langchain_openai import ChatOpenAI

@tool
def search(query: str) -> str:
    """Search network information"""
    return f"Search results for: {query}"

@tool
def calculator(expression: str) -> str:
    """Calculate mathematical expressions"""
    return str(eval(expression))

llm = ChatOpenAI(model="gpt-3.5-turbo")
tools = [search, calculator]
agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

**Key Features:**
- Tool selection via LLM reasoning from tool descriptions
- Built-in parameter validation
- Support for complex workflows with conditional edges (LangGraph)

---

### Anthropic Claude

**Status:** Production-validated with comprehensive tool use patterns

**Implementation Approach:**
- **Function calling**: Structured tool invocation with response schemas
- **Tool use safety**: Explicit tool registration and allowlisting
- **Standardized integration**: Adopted by LangChain and LlamaIndex

**Key Features:**
- Response schemas for output validation
- Explicit tool registration (allowlist)
- Parameter validation via schemas
- Tool result handling control

**Documentation:** https://docs.anthropic.com/en/docs/build-with-claude/tool-use

---

### OpenAI

**Status:** Multiple implementation approaches

**Function Calling Implementation:**
```python
import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

tools = [
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Search the web for current information",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query"
                    }
                },
                "required": ["query"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}],
    tools=tools
)
```

**OpenAI Swarm (Lightweight Multi-Agent Orchestration):**
- **Pattern**: Agent handoff via special function calls
- **Implementation**: `transfer_to_<agent_name>()` functions
- **Repository**: https://github.com/openai/swarm

**Swarm Example:**
```python
from swarm import Swarm, Agent

client = Swarm()

def transfer_to_agent_b():
    """Transfer control to Agent B"""
    return agent_b

agent_a = Agent(
    name="Agent A",
    instructions="You are a helpful assistant. Transfer to specialized agents when needed.",
    functions=[transfer_to_agent_b, transfer_to_agent_c],
)
```

**Key Features:**
- Handoff functions explicitly registered (allowlist)
- LLM cannot transfer to unregistered agents
- Shared context ensures state consistency
- Decentralized decision-making

---

### Microsoft AutoGen / Agent Framework

**Status:** Enterprise-grade multi-agent framework

**Legacy AutoGen:**
- **Repository**: https://github.com/microsoft/autogen
- **Pattern**: Multi-agent conversation with tool routing
- **Features**: Human-in-the-loop approval, max consecutive reply limits

**Microsoft Agent Framework (New):**
- **Documentation**: https://learn.microsoft.com/en-us/agent-framework/
- **Migration guide**: Available from AutoGen
- **Features**: Enhanced tool selection, MCP server integration, Agent-as-a-tool pattern

**Implementation Example:**
```python
from autogen import AssistantAgent, UserProxyAgent

assistant = AssistantAgent(
    name="assistant",
    llm_config={
        "tools": [
            {"type": "function", "function": {
                "name": "web_search",
                "description": "Search the web for current information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Search query"}
                    },
                    "required": ["query"]
                }
            }}
        ]
    }
)

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",
    max_consecutive_auto_reply=5,
)
```

**Key Features:**
- Human-in-the-loop approval
- Max consecutive reply limits (safety)
- Tool function schemas
- Conversation history tracking

---

### CrewAI

**Status:** Role-based multi-agent systems

**Repository:** https://github.com/joaomdmoura/crewai

**Implementation Pattern:**
```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role='Researcher',
    goal='Collect and analyze data',
    backstory='You are an expert researcher',
    tools=[web_search_tool, database_tool],
    verbose=True
)

writer = Agent(
    role='Writer',
    goal='Create compelling content',
    backstory='You are a skilled writer',
    tools=[file_tool, formatter_tool],
    verbose=True
)
```

**Key Features:**
- Agent specialization with tool assignment
- Per-agent tool allowlists
- Task-based execution
- Role-based collaboration

---

### ByteDance TRAE Agent

**Status:** Production-validated, high-performance

**Repository:** https://github.com/bytedance/TRAE-agent
**Performance:** 75.2% on SWE-bench Verified

**Implementation Pattern:**
```python
class TRAEAgent:
    """Tool Retrieval and Action Execution Agent"""

    def __init__(self, tools, models):
        self.tools = tools
        self.selector_agent = SelectorAgent(models)
        self.executor = ToolExecutor(tools)

    def select_action(self, query, available_tools):
        """
        Selector Agent chooses appropriate tool

        Process:
        1. Analyze query intent
        2. Rank tools by relevance
        3. Verify selection with multiple models
        4. Return validated tool choice
        """
        selections = []
        for model in self.models:
            selection = model.select_tool(query, available_tools)
            selections.append(selection)

        final_selection = self._verify_selections(selections)
        return final_selection
```

**Key Features:**
- Tool Retrieval: Semantic search for relevant tools
- Layered Pruning: Efficient tool selection for large toolsets
- Multi-Model Verification: Multiple models verify tool selection
- Action Replay: Cache and replay successful action sequences

---

## 2. Production Implementations

### Klarna AI Customer Service

**Status:** Production with documented lessons learned

**Initial Success (2024):**
- 2/3 of customer conversations handled by AI
- Resolution time: 11 min → 2 min
- 2.3M conversations processed

**Challenges Discovered:**
- Complex queries failed (disputes, payment issues)
- Customer satisfaction -22% in Nordic markets
- Q1 2025: $99M net loss (doubled)

**Strategic Pivot (May 2025):**
- Human-AI collaboration model
- AI: 80% simple queries
- Humans: Complex/emotional situations
- Emotion detection for escalation

**Key Insight:** Pure AI action selection insufficient for complex customer service scenarios

---

### Enterprise Approval Systems

#### Microsoft (Most Mature)
- **Products:** Power Automate + Copilot
- **Features:** Smart routing by type, amount, urgency
- **Integration:** Native Teams integration

#### Google (Beta 2025)
- **Products:** Workspace Flows + Gemini
- **Features:** Natural language workflow definition
- **Integration:** Context from Drive

#### Amazon (Developer-Focused)
- **Products:** Bedrock Agents + Step Functions
- **Features:** Visual workflow orchestration
- **Integration:** AWS ecosystem integration

---

### Clawdbot (Production Security Implementation)

**Repository:** https://github.com/clawdbot/clawdbot

**Pattern:** Sandboxed Tool Authorization with Action Selector

**Implementation:**
```typescript
type CompiledPattern =
  | { kind: "all" }
  | { kind: "exact"; value: string }
  | { kind: "regex"; value: RegExp };

function makeToolPolicyMatcher(policy: ToolPolicy) {
  const deny = compilePatterns(policy.deny);
  const allow = compilePatterns(policy.allow);
  return (name: string) => {
    const normalized = normalizeToolName(name);
    // Deny takes precedence
    if (matchesAny(normalized, deny)) return false;
    if (allow.length === 0) return true;
    if (matchesAny(normalized, allow)) return true;
    return false;
  };
}
```

**Profile-based Tiers:**
```typescript
const TOOL_PROFILES: Record<ToolProfileId, ToolProfilePolicy> = {
  minimal: {
    allow: ["session_status"],
  },
  coding: {
    allow: [
      "group:fs",
      "group:runtime",
      "group:sessions",
      "group:memory",
      "image",
    ],
  },
  messaging: {
    allow: [
      "group:messaging",
      "sessions_list",
      "sessions_history",
    ],
  },
  full: {},
};
```

**Key Features:**
- Pattern-based policies with deny-by-default
- Hierarchical policy inheritance
- Profile-based presets (minimal, coding, messaging, full)
- Tool groups for bulk policies

---

## 3. Implementation Patterns

### Allowlist Design

**Common Patterns:**

1. **Explicit Tool Registration**
   - Tools must be explicitly registered before use
   - LLM can only select from registered tools
   - Used by: LangChain, Anthropic, OpenAI Swarm

2. **Pattern-Based Matching**
   - Supports exact matches, wildcards, regex
   - Example: `fs:*` matches all filesystem tools
   - Used by: Clawdbot

3. **Profile-Based Tiers**
   - Predefined profiles for common use cases
   - Examples: minimal, coding, messaging, full
   - Used by: Clawdbot

4. **Hierarchical Inheritance**
   - Subagents inherit parent policies with additional restrictions
   - Used by: Clawdbot, Microsoft AutoGen

**Code Example:**
```python
# Profile-based allowlist
APPROVED_TOOLS = {
    "minimal": ["session_status"],
    "coding": ["read", "write", "edit", "exec", "search"],
    "messaging": ["message", "sessions_list"],
}

def select_action(agent_decision, profile="minimal"):
    action_name = agent_decision.get('action')
    if action_name not in APPROVED_TOOLS[profile]:
        raise SecurityError(f"Action '{action_name}' not approved")
    return execute(action_name)
```

---

### Parameter Validation

**Common Approaches:**

1. **Schema-Based Validation (Pydantic/BaseModel)**
   ```python
   from pydantic import BaseModel, Field

   class SearchInput(BaseModel):
       """Define search input parameters"""
       query: str = Field(..., description="Search query")
       limit: int = Field(default=10, ge=1, le=100)

   @tool(args_schema=SearchInput)
   def search(input: SearchInput) -> str:
       return f"Searching for: {input.query}"
   ```

2. **JSON Schema Validation**
   - Used by OpenAI function calling
   - Standardized schema format
   - Type checking and constraints

3. **Runtime Type Checking**
   - Validates parameters before execution
   - Raises errors for invalid inputs
   - Used by: Most production frameworks

**Production Validation Pattern:**
```python
class ActionSelector:
    def _validate_parameters(self, action_name, parameters):
        """Validate parameters against predefined schemas"""
        schema = self._get_action_schema(action_name)
        validated = schema(**parameters)
        return validated.dict()

    def select_and_execute(self, agent_decision):
        action_name = agent_decision.get('action')
        parameters = agent_decision.get('parameters', {})

        # Security: Check allowlist
        if action_name not in self.approved_actions:
            raise SecurityError(f"Action '{action_name}' not approved")

        # Security: Validate parameters
        validated_params = self._validate_parameters(action_name, parameters)

        return self.approved_actions[action_name](**validated_params)
```

---

### State Management

**For Multi-Step Workflows:**

1. **Explicit State Transitions (LangGraph)**
   ```python
   def tools_condition(state):
       last_message = state["messages"][-1]
       if hasattr(last_message, "tool_calls") and last_message.tool_calls:
           return "tools"
       return "__end__"

   graph_builder.add_conditional_edges(
       "chat_node",
       tools_condition,
       {"tools": "tool_node", "__end__": END}
   )
   ```

2. **Intent-Based Routing**
   ```python
   def route_to_skill(state):
       user_intent = state['user_intent']
       if user_intent == "查询天气":
           return "weather_query_node"
       elif user_intent == "预订机票":
           return "flight_booking_node"
       return END
   ```

3. **Agent Handoff with Shared Context (OpenAI Swarm)**
   - Functions return agent objects instead of data
   - Context preserved during handoffs
   - Decentralized decision-making

4. **Filesystem-Based State**
   - State persisted to files between steps
   - Survives interruptions and context limits
   - Used by: Production coding agents

---

### Safety Enforcement

**Prompt Injection Prevention:**

1. **No Feedback Loop Constraint**
   ```python
   # Security pattern from Beurer-Kellner et al.
   action = LLM.translate(prompt, allowlist)
   execute(action)
   # tool output NOT returned to LLM
   ```

2. **Context Minimization**
   - Remove untrusted content after use
   - Validated-in-production at Anthropic and OpenAI
   - 10-100x token reduction with security benefits

3. **Input Sanitization**
   - Format restrictions
   - Regex filtering
   - Length limits

4. **Output Filtering**
   - Sensitive data detection
   - Content safety policies
   - Structured output validation

**Production Safety Checklist:**
- [ ] Explicit tool registration (allowlist)
- [ ] Parameter schema validation
- [ ] No untrusted data in LLM context
- [ ] Human approval for critical actions
- [ ] Rate limiting and timeout enforcement
- [ ] Audit logging for all actions
- [ ] Sandbox execution environment

---

## 4. Framework Comparison

| Framework | Action Selection Approach | Key Feature | Best For | Security |
|-----------|---------------------------|-------------|----------|----------|
| **LangChain** | ReAct Pattern | Tool descriptions, validation | General purpose | Medium |
| **LangGraph** | Conditional Edges | State-based routing | Complex workflows | High |
| **OpenAI Swarm** | Handoff Functions | Decentralized agent transfer | Customer service | High |
| **AutoGen** | Human-in-the-loop | Tool functions | Multi-agent collaboration | High |
| **CrewAI** | Agent Scoping | Per-agent tools | Role-based systems | Medium |
| **Smolagents** | Code Generation | Direct Python output | Lightweight apps | Low |
| **TRAE Agent** | Multi-Model Verification | Semantic tool retrieval | Code editing | High |

---

## 5. Verification Status

### Industry-Validated Implementations
- **LangChain**: 100k+ GitHub stars, mature ecosystem
- **Anthropic Tool Use**: Standardized across frameworks
- **OpenAI Function Calling**: Widely adopted API standard
- **Microsoft Agent Framework**: Enterprise-grade deployment
- **Clawdbot**: Production security implementation

### Academic Research Support
- **Beurer-Kellner et al. (2025)**: "Design Patterns for Securing LLM Agents"
  - https://arxiv.org/abs/2506.08837
  - Introduces Action-Selector as core security pattern

### Production Metrics
- **Klarna**: 2.3M conversations processed (with lessons learned)
- **TRAE Agent**: 75.2% on SWE-bench Verified
- **Context Minimization**: 10-100x token reduction (Anthropic, OpenAI)

### Needs Verification
- Specific enterprise deployment metrics (beyond public case studies)
- Comparative performance benchmarks across frameworks
- Long-term security incident data

---

## 6. Best Practices Summary

### For New Implementations

1. **Start with Security**
   - Use explicit allowlists for all tools
   - Validate all parameters against schemas
   - Implement human approval for critical actions

2. **Choose the Right Framework**
   - General purpose: LangChain
   - Complex workflows: LangGraph
   - Customer service: OpenAI Swarm
   - Multi-agent: AutoGen/CrewAI

3. **Implement Proper State Management**
   - Use explicit state transitions
   - Persist state across sessions
   - Handle interruptions gracefully

4. **Add Safety Layers**
   - Rate limiting and timeouts
   - Audit logging
   - Sandbox execution
   - Output filtering

### For Production Deployment

1. **Hybrid Selection Strategy**
   - Simple queries: Autonomous selection
   - Critical workflows: Fixed tool chains
   - Security-sensitive: Action-Selector pattern
   - Complex reasoning: ReAct with planning

2. **Monitoring and Iteration**
   - Log all action selections
   - Track tool usage patterns
   - Update allowlists based on usage
   - Monitor for prompt injection attempts

3. **Human-in-the-Loop**
   - Require approval for:
     - Destructive operations
     - External communications
     - Data modifications
     - High-cost operations

---

## References

### Framework Documentation
- LangChain Agent Documentation
- LangGraph Multi-Agent Workflows
- Anthropic Tool Use Guide
- OpenAI Function Calling Documentation
- Microsoft Agent Framework
- OpenAI Swarm GitHub

### Academic Sources
- Beurer-Kellner et al. (2025). "Design Patterns for Securing LLM Agents against Prompt Injections"
- ReAct: Synergizing Reasoning and Acting (Yao et al., 2022)

### Production Implementations
- Klarna AI Customer Service Case Study
- ByteDance TRAE Agent (75.2% SWE-bench)
- Clawdbot Tool Authorization System
- Enterprise Approval Systems (Microsoft, Google, Amazon)

---

**Report Status:** Consolidated from existing research and documentation
**Last Updated:** 2026-02-27
