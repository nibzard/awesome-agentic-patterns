# Technical Report: Agent Modes by Model Personality Frameworks and APIs

## Executive Summary

This report provides a comprehensive technical analysis of frameworks and APIs for implementing "agent modes by model personality" in 2024. The research covers major agent frameworks (LangChain, AutoGen, CrewAI), system prompt engineering techniques, temperature/parameter tuning, and multi-persona architectures.

---

## 1. Framework Comparison: LangChain, AutoGen, CrewAI

### 1.1 LangChain

**Architecture**: Chain-based, single-agent focused at core

**Personality Approach**: Traditional prompt engineering with role definitions

**Key Features**:
- Modular components for chains, tools, memory, and RAG
- Agent support added later as an extension
- Personality defined through system prompts and few-shot examples
- Best for general-purpose LLM applications with modular components

**Personality Configuration**:
```python
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI

llm = OpenAI(temperature=0.7)  # Temperature for creativity control
agent = initialize_agent(
    tools,
    llm,
    agent="chat-zero-shot-react-description",
    verbose=True
)
# Personality is set through the agent's system message
```

**Limitations**:
- Does not natively support multi-agent workflows
- Manual orchestration required for complex personality switching
- Limited built-in personality management features

### 1.2 AutoGen (Microsoft Research)

**Architecture**: Conversation-based, multi-agent dialogue driven

**Personality Approach**: System messages and conversation patterns

**Key Features**:
- Dynamic conversation modes (static and dynamic)
- Agent self-improvement through iterative dialogue
- Personality defined through `system_message` parameter
- Supports complex reasoning and error correction via agent feedback

**Personality Configuration**:
```python
from autogen import AssistantAgent, UserProxyAgent

assistant = AssistantAgent(
    name="assistant",
    system_message="You are a helpful research assistant...",  # Personality here
    llm_config={"config_list": [{"model": "gpt-4", "api_key": "..."}]}
)

user_proxy = UserProxyAgent(
    name="user_proxy",
    system_message="You are a user asking questions...",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=10
)
```

**Advanced Features**:
- Dynamic conversation modes for personality switching
- Agent self-improvement through dialogue
- Complex reasoning capabilities

**Limitations**:
- Steeper learning curve
- More complex setup for simple use cases
- Performance overhead from conversation management

### 1.3 CrewAI

**Architecture**: Role-based, team协作模拟

**Personality Approach**: Role-backstory-personality triad

**Key Features**:
- Each Agent has: `role`, `goal`, `backstory`
- Structured task delegation and feedback
- Personality defined through character background stories
- Built-in dynamic role switching

**Personality Configuration**:
```python
from crewai import Agent

researcher = Agent(
    role='Research Analyst',
    goal='Research market trends',
    backstory='Experienced analyst with 10 years in the field',
    tools=[search],
    allow_delegation=True,
    verbose=True
)
```

**Dynamic Role Switching**:
```python
# Enable dynamic role switching
agent.enable_dynamic_role_switching(policy="adaptive")

# Execute task with automatic role reassignment
task = Task(description="Analyze market trends", expected_output="Report")
crew.execute(task, allow_role_reassignment=True)
```

**Limitations**:
- Personality primarily defined through backstory
- Less flexible than system message approaches
- Structured format may limit personality expression

---

## 2. System Prompt Engineering for Personality Switching

### 2.1 System Prompt Structure

**Components**:
- Role description
- Experience background
- Language style preferences
- Behavioral constraints
- Response format specifications

**Template**:
```python
SYSTEM_PROMPT = """You are a [role] with [experience background].
Requirements:
1. [Specific behavioral rules]
2. [Language style requirements]
3. [Response format specifications]
"""
```

### 2.2 Personality Injection Examples

**Financial Analyst Agent**:
```python
"You are a 'senior financial analyst' with 20 years of experience in investment banking.
Requirements:
1. Use professional, data-driven language
2. Focus on ROI and market trends
3. Provide quantitative analysis with supporting metrics
"
```

**Customer Service Agent**:
```python
"You are Datawhale intelligent customer service assistant.
Requirements:
1. Use friendly, professional tone
2. Be empathetic to user concerns
3. Provide clear, step-by-step solutions
"
```

### 2.3 Advanced Prompt Patterns

**Role-based Personalization**:
- Interviewer agents
- Product demand analysts
- Paper reviewers
- Technical support specialists

**Multi-dimensional Personas**:
- Emotional tone (friendly, professional, casual)
- Communication style (direct, detailed, concise)
- Decision-making patterns (analytical, intuitive, collaborative)

---

## 3. Temperature and Parameter Tuning for Personality Effects

### 3.1 Temperature Parameter Effects

| Temperature Range | Effect | Best Use Cases |
|-------------------|--------|----------------|
| 0.0-0.3 | Stable, consistent, controlled responses | Knowledge base assistants, technical support, code generation |
| 0.4-0.6 | Balanced creativity and stability | Most general applications, office automation |
| 0.7-1.0 | Random, creative, varied responses | Marketing copy, personalized content, exploratory tasks |

### 3.2 Implementation Examples

**Basic Temperature Control**:
```python
import openai

# Low temperature for stability
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=messages,
    temperature=0.2,  # Consistent, professional responses
    max_tokens=500
)

# High temperature for creativity
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=messages,
    temperature=0.9,  # Creative, varied responses
    max_tokens=500
)
```

**Advanced Parameter Combinations**:
```python
# Low creative mode
config = {
    "temperature": 0.1,
    "top_k": 5,
    "top_p": 0.5
}

# High creative mode
config = {
    "temperature": 1.2,
    "top_k": 50,
    "top_p": 0.99
}
```

### 3.3 Task-Based Temperature Optimization

**Agent-S Multi-Agent Architecture**:
```python
# Worker Agent - Low temperature for execution accuracy
worker_config = {"temperature": 0.2}

# Grounding Agent - Medium temperature for environmental adaptation
grounding_config = {"temperature": 0.5}

# Manager Agent - Dynamic temperature based on task complexity
manager_config = {"temperature": 0.3}  # Adjusted based on task complexity
```

---

## 4. Multi-Persona Agent Architectures

### 4.1 Context-Based Personality Switching

**Implementation Pattern**:
```python
class DynamicPersonalityAgent:
    def __init__(self):
        self.personalities = {
            "technical": "You are a technical expert responding with detailed explanations",
            "business": "You are a business consultant focusing on ROI and strategy",
            "creative": "You are a creative thinker responding with innovative ideas"
        }
        self.current_personality = "technical"

    def switch_personality(self, new_personality):
        """Switch to specified personality"""
        if new_personality in self.personalities:
            self.current_personality = new_personality
            return f"Switched to {new_personality} personality"
        return "Invalid personality type"

    def get_response(self, user_input):
        """Generate response based on current personality"""
        personality_prompt = self.personalities[self.current_personality]
        return f"[{self.current_personality.upper()}] {personality_prompt}: {user_input}"
```

### 4.2 Advanced Multi-Agent Personalization

**CrewAI with Dynamic Personality**:
```python
from agents import Agent, RunContextWrapper, Runner
from agents import RunConfig, OpenAIProvider

class CustomContext:
    def __init__(self, style: Literal["haiku", "pirate", "robot"]):
        self.style = style

def custom_instructions(
    run_context: RunContextWrapper[CustomContext],
    agent: Agent[CustomContext]
) -> str:
    context = run_context.context
    if context.style == "haiku":
        return "Only respond in haikus."
    elif context.style == "pirate":
        return "Respond as a pirate."
    else:
        return "Respond as a robot and say 'beep boop' a lot."

agent = Agent(
    name="Chat agent",
    instructions=custom_instructions,
    model="glm-4-flash"
)

# Usage
context = CustomContext(style="haiku")  # Switch personality
result = await Runner.run(agent, "Tell me a joke", context=context)
```

### 4.3 Specialized Frameworks

#### Persona Vectors (2025)
- Mathematical vectors for personality trait control
- Maps personality traits to linear directions in activation space
- Addresses personality drift in models like Bing Chat, Grok, GPT-4o

#### AFSPP Framework (January 2025)
- Agent Framework for Shaping Preference and Personality
- Uses Big Five personality model
- Incorporates subjective consciousness in LLM-based agent formation

#### Character-LLM
- Trains agents with specific person profiles, experiences, and emotional states
- Moves beyond simple prompt-based instruction to complex persona modeling

---

## 5. Limitations and Trade-offs

### 5.1 Common Limitations

1. **Temperature Balance Dilemma**: High creativity vs. high uncertainty trade-off
2. **Task Type Mismatch**: Using same temperature across different task types
3. **Resource Efficiency**: High temperatures increase computation costs
4. **Consistency Issues**: Temperature affects output repeatability

### 5.2 Framework-Specific Trade-offs

**LangChain**:
- Pros: Flexible, modular, extensive ecosystem
- Cons: Limited multi-agent support, manual orchestration required

**AutoGen**:
- Pros: Strong conversation-based personality adaptation, multi-agent dialogue
- Cons: Steeper learning curve, complex setup, performance overhead

**CrewAI**:
- Pros: Built-in role switching, structured personality definition
- Cons: Personality primarily through backstory, less flexible

### 5.3 Performance Trade-offs

| Setting | Speed | Quality | Creativity | Consistency |
|---------|-------|---------|------------|-------------|
| Low Temperature | Fast | High | Low | High |
| Medium Temperature | Medium | Medium | Medium | Medium |
| High Temperature | Slow | Variable | High | Low |

### 5.4 Critical Challenges

1. **State Management**: Maintaining conversation context across persona switches
2. **Transition Handling**: Smooth personality switching without losing conversation flow
3. **Multi-agent Orchestration**: Limited native support in LangChain for complex workflows
4. **Dynamic Adaptation**: Real-time persona adjustment based on user interaction patterns

---

## 6. Implementation Recommendations

### 6.1 Best Practices

1. **Start with Low Temperature**: Begin with 0.2-0.3 and gradually increase
2. **Task-Based Configuration**: Different temperature settings for different task types
3. **Monitor Key Metrics**: Track success rates, response times, resource utilization
4. **Implement Dynamic Adjustment**: Create adaptive temperature systems

### 6.2 Architecture Patterns

1. **Context Management**: Use context classes to maintain personality state
2. **Conditional Prompting**: Different system prompts based on personality type
3. **Agent Reassignment**: Dynamic task assignment to personality-appropriate agents
4. **Multi-style Communication**: Support for various creative styles

### 6.3 Future Directions

1. **Vector-based Personality Control**: Mathematical models for precise personality control
2. **Adaptive Personality Systems**: Real-time adjustment based on user interaction
3. **Cross-agent Personality Coordination**: Multi-agent personality compatibility
4. **Emotional State Integration**: Combining personality with emotional awareness

---

## 7. Code Examples Summary

### 7.1 Basic Personality Switching
```python
class PersonalityAgent:
    def __init__(self):
        self.personalities = {
            "professional": "You are a professional assistant...",
            "friendly": "You are a friendly assistant..."
        }

    def switch_personality(self, personality_type):
        if personality_type in self.personalities:
            self.current_personality = personality_type

    def respond(self, message):
        system_prompt = self.personalities[self.current_personality]
        return self.generate_response(system_prompt, message)
```

### 7.2 Temperature-Enhanced Personality
```python
class TemperatureControlledAgent:
    def __init__(self, base_temperature=0.5):
        self.base_temperature = base_temperature
        self.personality_temperatures = {
            "professional": 0.2,
            "creative": 0.8,
            "balanced": 0.5
        }

    def get_response(self, message, personality):
        temp = self.personality_temperatures.get(personality, self.base_temperature)
        return self.llm.generate(
            message,
            temperature=temp,
            system_prompt=self.get_system_prompt(personality)
        )
```

---

## 8. Conclusion

The field of agent personality management has evolved significantly in 2024, moving from simple static prompts to sophisticated dynamic systems. Key findings:

1. **LangChain** offers flexibility but requires manual orchestration for personality switching
2. **AutoGen** excels in conversation-based personality adaptation
3. **CrewAI** provides structured role-based personality management
4. **Temperature tuning** is crucial for controlling personality expression
5. **Multi-persona systems** are becoming more sophisticated with context management

The future trend is toward more systematic, controllable personality systems using mathematical models and adaptive configurations.

---

## Sources

1. LangChain AutoGen CrewAI agent personality modes system prompts 2024
2. System prompt engineering temperature tuning agent personality OpenAI API 2024
3. Multi-persona agent architecture personality switching LangChain state management 2024
4. "Personality switching" agent implementation code examples LangChain CrewAI 2024
5. Agent personality limitations trade-offs temperature tuning framework comparison 2024
6. Specialized agent frameworks personality management Character-LLM AutoPal persona systems 2024