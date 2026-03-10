# Agent Reinforcement Fine-Tuning (Agent RFT) - Research Report

**Pattern**: agent-reinforcement-fine-tuning
**Status**: Research Complete
**Started**: 2025-02-27
**Completed**: 2025-02-27

---

## Executive Summary

Agent Reinforcement Fine-Tuning (Agent RFT) is an emerging pattern for training language model agents end-to-end using reinforcement learning with custom reward signals and real tool interactions. This approach bridges the gap between base model capabilities and specialized agentic tasks by:

1. **Online environment interaction** - Agents call real tool endpoints during training, learning from actual responses rather than static demonstrations
2. **Custom reward functions** - Flexible grader endpoints define task-specific success criteria
3. **Multi-step optimization** - Models learn to reason across tool call sequences, not just produce final outputs
4. **Sample efficiency** - Strong results with 100-1000 training samples vs millions for pre-training

The pattern builds on established RLHF research (PPO, DPO, GRPO) but extends it to agentic settings with tool use, process supervision, and environment interaction. Real-world implementations show 20-70% performance improvements and 40-50% latency reductions across coding, healthcare, finance, and hardware domains.

---

## Table of Contents

1. [Pattern Overview](#pattern-overview)
2. [Academic Foundations](#academic-foundations)
3. [Technical Implementation](#technical-implementation)
4. [Real-World Case Studies](#real-world-case-studies)
5. [Related Patterns](#related-patterns)
6. [Open Questions](#open-questions)

---

## Pattern Overview

### Current Definition

**Agent Reinforcement Fine-Tuning (Agent RFT)** trains the model weights end-to-end on agentic tasks by allowing the model to:

1. **Explore via actual tool calls**: During training rollouts, the agent calls your real tool endpoints, learning from actual responses
2. **Receive custom reward signals**: You define what "good" looks like via flexible graders (model-based, endpoint-based, or string-based)
3. **Learn multi-step reasoning**: The agent learns to reason across tool outputs in the context window
4. **Optimize for your metrics**: Reduce tool calls, improve accuracy, or balance both based on your reward function

### Key Components

- **Tool Endpoints**: Host your tools (same as production) that the model calls during training
- **Grader Endpoint**: Define custom reward logic that evaluates final answers and/or tool call traces
- **Unique Rollout IDs**: Each training rollout gets a unique ID for state management across tool calls
- **Compute Multiplier**: Controls exploration breadth (higher = more rollouts per sample)

### Source Material

- **Primary Source**: [OpenAI Build Hour: Agent RFT (November 2025)](https://youtu.be/1s_7RMG4O4U)
- **Based On**: Will Brown (OpenAI), Theo (OpenAI Solutions Architect)
- **Pattern Status**: Emerging
- **Category**: Learning & Adaptation

---

## Academic Foundations

Agent Reinforcement Fine-Tuning (Agent RFT) builds upon several established research areas in reinforcement learning, language model alignment, and agentic AI.

### Foundational RLHF and Preference Learning

**RLHF Core Literature:**

- **PPO for Language Models** - Proximal Policy Optimization (PPO) from Schulman et al. (2017) became the de facto algorithm for RLHF in language models. The paper "Secrets of RLHF in Large Language Models Part I: PPO" ([arXiv:2307.04964](https://arxiv.org/abs/2307.04964), 2023) provides comprehensive implementation details.

- **Direct Preference Optimization (DPO)** - "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" ([arXiv:2305.18290](https://arxiv.org/abs/2305.18290), Rafailov et al., 2023, NeurIPS) eliminates the need for explicit reward modeling by using a classification-style loss.

- **Group Relative Policy Optimization (GRPO)** - Introduced in "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models" ([arXiv:2402.03300](https://arxiv.org/abs/2402.03300), Shao et al., 2024) as a memory-efficient alternative to PPO that eliminates the critic model.

### AI Feedback and Constitutional AI

**Constitutional AI and RLAIF:**

- **Constitutional AI: Harmlessness from AI Feedback** ([arXiv:2212.08073](https://arxiv.org/abs/2212.08073), Bai et al., 2022) - The foundational paper introducing AI feedback as an alternative to human feedback for alignment.

- **RLAIF: Scaling Reinforcement Learning from Human Feedback with AI Feedback** ([arXiv:2309.00267](https://arxiv.org/abs/2309.00267), Lee et al., 2023) - Demonstrates using AI models to generate preference data at scale.

### Tool Use and Environment Interaction

**Tool-Augmented Language Models:**

- **ReAct: Synergizing Reasoning and Acting in Language Models** ([arXiv:2210.03629](https://arxiv.org/abs/2210.03629), Yao et al., ICLR 2023) - Established the Thought → Action → Observation paradigm for agentic behavior.

- **Toolformer: Language Models Can Teach Themselves to Use Tools** ([arXiv:2302.04761](https://arxiv.org/abs/2302.04761), Schick et al., 2023, NeurIPS) - Self-supervised approach to learning tool use without manual annotation.

- **Gorilla: Large Language Model Connected with Massive APIs** ([arXiv:2305.15334](https://arxiv.org/abs/2305.15334), Patil et al., 2023) - Fine-tuned approach for accurate API calling with document retrieval integration.

### Reward Modeling and Process Supervision

**Process Reward Models:**

- **Process-Based Reward Models for Large Language Models** (Lightman et al., NeurIPS 2023) - Introduced intermediate step supervision for complex reasoning tasks.

- **Exploring Reasoning Reward Model for Agents** ([arXiv:2601.22154](https://arxiv.org/abs/2601.22154), 2025) - Adaptive reasoning via difficulty-aware token-level entropy shaping.

- **RM-R1: Reward Modeling as Reasoning** ([arXiv:2505.02387](https://arxiv.org/abs/2505.02387), Chen et al., 2025) - Formulates reward modeling itself as a reasoning task.

### Verbal Reinforcement Learning

**Reflexion Framework:**

- **Reflexion: Language Agents with Verbal Reinforcement Learning** ([arXiv:2303.11366](https://arxiv.org/abs/2303.11366), Shinn et al., NeurIPS 2023) - Transfers policy optimization from parameter space to context space using episodic memory and self-reflection. Achieved 91% pass@1 on HumanEval vs. GPT-4's 80%.

### Agentic RL Survey and Frameworks

**Recent Comprehensive Surveys:**

- **The Landscape of Agentic Reinforcement Learning for LLMs: A Survey** ([arXiv:2509.02547](https://arxiv.org/abs/2509.02547), 2025) - Framework for "Agentic RL" distinguishing it from conventional LLM-RL through POMDPs and temporally extended decision-making.

- **Scaling Environments for LLM Agents in the Era of Learning from Interaction: A Survey** (2025) - Introduces the Generation-Execution-Feedback (GEF) cycle framework.

- **A Survey of Self-Evolving Agents** ([arXiv:2507.21046](https://arxiv.org/abs/2507.21046), 2025) - Covers "What to evolve", "When to evolve", "How to evolve" with focus on self-improvement.

### Memory and Runtime Learning

**Memory Reinforcement Learning:**

- **Self-Evolving Agents via Runtime Reinforcement Learning on Episodic Memory** ([arXiv:2601.03192](https://arxiv.org/html/2601.03192v1), Zhang et al., 2025) - MemRL adds learned utility scores to episodic memory for value-aware retrieval without model modification.

### Connection to Agent RFT

**How Agent RFT Relates to Established Methods:**

1. **Environment-Based RL** - Unlike standard RLHF which uses static preference data, Agent RFT is an "online" method that interacts with dynamic environments via tool endpoints, aligning with the "Agentic RL" paradigm described in recent surveys.

2. **Custom Reward Functions** - Agent RFT's grader endpoint design relates to process reward models (PRMs) and outcome reward models, but allows for arbitrary business logic rather than just correctness scoring.

3. **Multi-Step Optimization** - Training on multi-step tool call traces distinguishes Agent RFT from single-turn RLHF and connects to process supervision approaches.

4. **Model-Based Graders** - Using LLMs as graders connects to RLAIF and Constitutional AI literature on AI-generated feedback.

5. **Policy Optimization** - Agent RFT likely uses variants of PPO, GRPO, or related policy optimization methods under the hood.

### Key Terminology Mapping

| Academic/Research Term | Industry/Product Term | Pattern Context |
|------------------------|----------------------|-----------------|
| Rollouts | Episodes or Trajectories | Training sequences |
| Grader | Reward Model | Evaluation function |
| Compute Multiplier | Exploration factor | Number of sampled trajectories |
| Tool endpoints | Environment | Action space with external APIs |
| Credit Assignment | Reward Attribution | Multi-step learning |

---

## Technical Implementation

### API Overview and Availability

OpenAI's Agent Reinforcement Fine-Tuning (RFT) is available through:
- **o4-mini**: Fully available for production use
- **GPT-5**: Currently in private beta/testing phase (as of October 2025) - *Needs verification*
- **AgentKit SDK**: Announced at OpenAI DevDay 2025, provides visual builder and evaluation tools

**Documentation Resources:**
- Official developer portal: `https://developers.openai.com/apps-sdk`
- [OpenAI Build Hour Video - Agent RFT Full Tutorial](https://www.youtube.com/watch?v=1s_7RMG4O4U)
- [Agent RFT Technical Analysis (Bilibili)](https://m.bilibili.com/video/BV1X6kkB5EeT/)

### Grader Endpoint Implementation

#### Supported Grader Types

**1. String Check Grader**
```json
{
  "type": "string_check",
  "name": "answer_string_check",
  "input": "{{item.reference_answer.final_answer}}",
  "operation": "eq",
  "reference": "{{sample.output_json.final_answer}}"
}
```

**2. Score Model Grader (LLM-as-a-Judge)**
```json
{
  "type": "score_model",
  "name": "my_score_model",
  "model": "o3-mini-2025-01-31",
  "input": [
    {
      "role": "system",
      "content": "You are an expert grader..."
    },
    {
      "role": "user",
      "content": "Reference: {{item.reference_answer}}. Model answer: {{sample.output_text}}"
    }
  ],
  "range": [0, 1]
}
```

**3. Python Code Grader**
```json
{
  "type": "python",
  "source": "def grade(sample, item) -> float: ...",
  "image_tag": "2025-05-08"
}
```

#### API Endpoints
- `/openai/v1/fine_tuning/alpha/graders/validate` - Validate grader configurations
- `/openai/v1/fine_tuning/alpha/graders/run` - Execute grading on model outputs

### FastAPI Grader Implementation Example

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn

app = FastAPI(title="Agent RFT Grader Endpoint")

class GraderRequest(BaseModel):
    """Request schema for OpenAI's RFT grader calls"""
    rollout_id: str
    tool_calls: list
    final_answer: str
    context: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = {}

class GraderResponse(BaseModel):
    """Response schema with reward signal"""
    score: float  # Range: 0.0 to 1.0
    feedback: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}

@app.post("/grade")
async def grade_rollout(request: GraderRequest) -> GraderResponse:
    """
    Grader endpoint called during Agent RFT training.
    Evaluates agent performance and returns reward signal.
    """
    score = 0.0
    feedback = ""

    # 1. Check if final answer matches expected outcome
    if "correct_answer" in request.context:
        expected = request.context["correct_answer"]
        if request.final_answer.lower() == expected.lower():
            score += 0.5
            feedback = "Final answer is correct"

    # 2. Evaluate tool usage efficiency
    if len(request.tool_calls) <= 3:
        score += 0.3
        feedback += "; Efficient tool usage"

    # 3. Check for specific criteria
    if len(request.final_answer) > 10:
        score += 0.2

    score = max(0.0, min(1.0, score))

    return GraderResponse(
        score=score,
        feedback=feedback,
        metadata={"rollout_id": request.rollout_id, "num_tool_calls": len(request.tool_calls)}
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "grader"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Modal Deployment Pattern

```python
import modal

app = modal.App("agent-rft-grader")

@app.function(
    image=modal.Image.debian_slim().pip_install("fastapi", "uvicorn"),
    memory=512,
    timeout=300,
)
@modal.web_endpoint(method="POST")
def grade(rollout_data: dict) -> dict:
    """Modal deployment for grader endpoint"""
    score = evaluate_rollout(rollout_data)

    return {
        "score": score,
        "rollout_id": rollout_data.get("rollout_id")
    }

def evaluate_rollout(data: dict) -> float:
    """Implement evaluation logic"""
    final_answer = data.get("final_answer", "")
    tool_calls = data.get("tool_calls", [])
    # Custom scoring logic
    return 0.85
```

### Fine-Tuning Hyperparameters

**Note:** The `compute_multiplier` parameter mentioned in the pattern file does not appear to be a valid hyperparameter in OpenAI's current fine-tuning API documentation. The standard parameters are:

| Parameter | Type | Description | Recommended Range |
|-----------|------|-------------|-------------------|
| `batch_size` | Integer | Number of training examples per forward/backward pass | Auto (default ~0.2% of dataset, max 256) |
| `learning_rate_multiplier` | Number | Fine-tuning learning rate = base rate × multiplier | 0.02 - 0.2 |
| `n_epochs` | Integer | Number of full cycles through training dataset | Auto (default: 3-4) |
| `seed` | Integer | Controls job reproducibility | Any integer |

**Example API Call:**
```python
from openai import AzureOpenAI

client = AzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2024-10-21"
)

client.fine_tuning.jobs.create(
    training_file="file-abc123",
    model="gpt-4.1-2025-04-14",
    hyperparameters={
        "n_epochs": 2,
        "batch_size": 16,
        "learning_rate_multiplier": 0.1
    }
)
```

**Guidelines:**
- Larger batch sizes work better with larger datasets
- Larger learning rates tend to perform better with larger batch sizes
- Smaller learning rates can help avoid overfitting
- Use automatic defaults for initial training

### Grader Design Best Practices

**Principle 1: Provide Gradient Rewards**
- ❌ Anti-pattern: Binary scoring (0/1) confuses models
- ✅ Best practice: Use 0-1 floating point scores for clear feedback

**Principle 2: Prevent Reward Hacking**
Common exploitation patterns to prevent:
- Outputting specific formats to trick the grader
- Getting answers right by luck with incorrect reasoning
- Burying correct answers in large amounts of information

**Design Techniques:**
- Use Model Graders instead of simple string matching
- Check the reasoning process, not just the final answer
- Give low scores for "lucky guesses"
- Implement multi-dimensional evaluation

**Principle 3: Align with Domain Knowledge**
- Have human experts evaluate a batch of samples
- Have the grader evaluate the same samples
- Calculate consistency (e.g., Cohen's Kappa)
- Adjust grader standards if consistency is low

**Principle 4: Clear Scoring Dimensions**
For complex tasks, use multi-dimensional scoring with Multi-Grader configuration.

### Infrastructure Requirements for Bursty Traffic

AI Agent infrastructure must handle "thundering herd" patterns where single goals recursively expand into thousands of sub-tasks.

**Key Challenges:**
1. **Scalability vs. Stability**: Task durations vary dramatically (5-10 minutes to 3-4 hours)
2. **Thundering Herd Problem**: Massive concurrent request spikes from recursive goal expansion
3. **Concurrency Limits**: Need orders-of-magnitude higher concurrent execution capacity
4. **Cold Start Optimization**: Must minimize startup latency for on-demand scaling

**Deployment Patterns:**
- **Cloud VMs**: Excellent scalability, but network latency affects experience
- **Local VMs**: Fast startup, great for demos, but unsustainable at scale
- **Serverless (Modal/Lambda)**: Handles bursty traffic well, minimizes cold starts

**Requirements for Agent-Native Infrastructure (2026+):**
- Handle recursive expansion of single goals into thousands of sub-tasks
- Reduce cold start times
- Minimize latency variance
- Increase concurrency limits by orders of magnitude

### Data Format Requirements

**Input Format:**
- Must follow OpenAI reinforcement fine-tuning format
- JSONL format (one JSON object per line)
- JSON structure containing:
  - `messages`: Array of dialogue turns with roles (system, user, assistant)
  - Optional metadata like `reference_answer`

**Current Limitations:**
- Text-only (no multimodal inputs: images, audio, video) - *Needs verification*
- Single-turn conversations only (not multi-turn dialogue support) - *Needs verification*
- JSONL format required

### Core Technical Workflow

1. **Exploration Phase**: Model calls user tools via endpoints during rollout
2. **Unique ID Assignment**: System assigns unique identifiers to track all actions
3. **Grader Evaluation**: Custom grader endpoint evaluates performance and provides reward signals
4. **Model Update**: Model learns from reward signals to optimize tool usage and reasoning

### Areas Requiring Verification

1. **RFT-Specific Hyperparameters**: The standard fine-tuning API parameters may differ from Agent RFT-specific parameters. Official documentation for Agent RFT hyperparameters should be consulted.

2. **Exact Grader Endpoint Schema**: The request/response schemas shown are synthesized examples. The official API contract should be verified against OpenAI's latest Agent RFT documentation.

3. **Infrastructure Requirements**: The bursty traffic patterns are described in general agent infrastructure literature. Specific requirements for Agent RFT workloads (grader endpoint QPS, timeout limits, retry policies) need verification.

4. **Reward Signal Integration**: The exact mechanism for how grader scores are converted to reinforcement learning gradients is not fully documented in publicly available sources.

5. **Model Availability**: GPT-5 RFT availability status (private beta as of October 2025) may have changed.

---

## Real-World Case Studies

### Documented Case Studies from Pattern File

The pattern file documents four case studies. Note: While company capabilities were verified through public sources, specific Agent RFT implementation details and quantitative results could not be independently verified through public documentation.

#### Cognition (Devon AI) - File Planning Agent
- **Task**: File planning agent to identify which files to edit for code changes
- **Tools**: `read_file`, `shell` (grep, find commands)
- **Reported Results**:
  - 50% reduction in planning time (8-10 tool calls reduced to 4 tool calls)
  - Learned to parallelize tool calls automatically
  - Improved F1 score on file identification
- **Additional Context**: Research confirmed Devon's architecture includes planning capabilities, CLI tools, code editor, and browser access. The SWE-bench benchmark shows Devin solving 13.86% of issues end-to-end, significantly exceeding previous baselines.

#### Ambience Healthcare - ICD-10 Medical Coding
- **Task**: Medical coding from clinical transcripts using ICD-10 codes
- **Tools**: Semantic search over 70,000+ medical codes
- **Reported Results**:
  - F1 score improvement: 0.52 → 0.57 (+9.6%, significant given ~0.75 human ceiling)
  - 18% latency reduction
  - 50% reduction in samples exceeding latency threshold
- **Verification**: Research confirmed ICD-10-CM contains over 70,000 codes and multi-agent AI systems are actively being developed for medical coding using semantic search techniques.

#### Rogo Finance - Financial Reasoning and Summarization
- **Task**: Financial document analysis and summarization from SEC filings and financial reports
- **Tools**: Document retrieval, financial analysis tools
- **Reported Results**:
  - 21% ML performance improvement
  - Reduced hallucinations and missing citations
  - Required hardening grader against reward hacking
- **Company Verification**: Rogo Technologies is an AI platform for investment banking that automates financial document analysis, with clients including Lazard, Moelis & Company, and J.P. Morgan. The company reached $750M valuation after Sequoia Capital investment. Research did not find specific public documentation of their Agent RFT implementation.

#### Modular (Mojo GPU Kernels) - Code Generation for New Hardware
- **Task**: Write performant GPU kernels for new hardware architectures
- **Tools**: Compiler, kernel execution environment
- **Reported Results**:
  - 72% improvement in correct + performant kernels
  - Only 100 PyTorch prompts needed (highly sample efficient)
  - No code examples required in training data
- **Related Research**: Found related work in AI-generated GPU kernels including KernelBench (Stanford), GEAK framework (AMD), and DR. KERNEL (HKUST), though specific Modular Mojo Agent RFT implementation details were not publicly documented.

### Additional Implementations Found

#### FinQA Benchmark Applications
Multiple sources reference FinQA (financial question answering) as a demonstration task for Agent RFT, though specific company implementations beyond the pattern file were not detailed in public sources.

#### OpenAI Internal Use Cases
OpenAI has demonstrated Agent RFT on:
- Code editing planning agents
- Code review research agents
- Enterprise coding tasks
- Financial QA benchmarks

#### ChatGPT Agent Team (OpenAI)
- **Architecture**: All tools integrated into a shared virtual machine environment
- **Tools**: Text browser, GUI browser, terminal tools, image generation tools
- **Training Paradigm**: No pre-specified rules; model learns optimal tool combinations through RL exploration
- **Use Case**: Restaurant research and booking tasks requiring seamless tool switching

### Related Open-Source Implementations

#### ASearcher (GitHub: inclusionAI/ASearcher)
- Large-scale reinforcement learning framework for search agents
- Fully asynchronous agentic RL framework
- Data synthesis agent for generating training data
- Supports long-horizon search (40+ tool calls, 150k+ tokens)
- Achieves state-of-the-art on GAIA, xBench-DeepSearch, and Frames benchmarks

#### Awesome-AgenticLLM-RL-Papers (GitHub)
- Comprehensive resource collection for agentic RL research
- Lists environments: AlfWorld, GAIA, SWE-Bench, BrowseComp
- Training frameworks for PPO, DPO, GRPO algorithms

#### ReTool (2025)
- Two-stage training (SFT + RL) using interleaved code execution
- Built on DeepSeek R1-Zero training paradigm
- Achieved 72.5% accuracy on AIME benchmark with 32B model
- "Reflect-and-Retry" mechanism for self-correcting tool failures

#### OTC: Optimal Tool Calls via Reinforcement Learning (2025)
- Focuses on minimizing redundant tool invocations
- Demonstrates better generalization and reduced unnecessary tool calls
- Reward design incorporates correctness, format compliance, and tool execution efficiency

#### Tool-R1 (2025)
- Sample-efficient RL for general tool use
- Enables compositional, multi-step tool use
- Significant improvements over Qwen2.5-14B-Instruct baseline

### Quantitative Results Summary

| Implementation | Metric | Improvement |
|----------------|--------|-------------|
| Cognition (File Planning) | Tool Calls | 50% reduction (8-10 → 4) |
| Ambience Healthcare | F1 Score | 0.52 → 0.57 (+9.6%) |
| Ambience Healthcare | Latency | 18% reduction |
| Ambience Healthcare | Latency Threshold Exceedance | 50% reduction |
| Rogo Finance | ML Performance | 21% improvement |
| Modular (GPU Kernels) | Correct + Performant Kernels | 72% improvement |
| Modular (GPU Kernels) | Training Samples Required | 100 (highly sample efficient) |
| ReTool (AIME Benchmark) | Accuracy | 72.5% with 32B model |

### Implementation Insights

#### Tool Call Optimization Patterns
1. **Parallelization**: Agents learn to make independent tool calls simultaneously rather than sequentially
2. **Early Termination**: Agents learn to stop exploration once sufficient information is gathered
3. **Tool Selection**: Agents learn which tools are most effective for specific task types
4. **Context Management**: Efficient use of context window to minimize redundant information retrieval

#### Grader Design Patterns
From reward hacking research, effective graders should:
- Provide continuous (not binary) rewards for better gradient signals
- Evaluate both final answers and intermediate tool call traces
- Be hardened against common reward hacking patterns (modifying tests instead of solving problems)
- Consider multiple criteria: correctness, format compliance, efficiency, and safety

#### Training Infrastructure Considerations
- **Bursty Traffic**: Training sends hundreds of simultaneous requests at step boundaries
- **State Management**: Each rollout requires unique ID for tracking across tool calls
- **Tool Endpoint Robustness**: Must handle training loads that differ from production patterns
- **Latency Sensitivity**: Tool endpoint latency directly impacts training time and cost

### Technical Approaches and Algorithms

#### GRPO (Group Relative Policy Optimization)
- Developed by DeepSeek for R1 training
- Simpler than PPO (no separate critic/value network needed)
- Samples group of outputs for each question
- Uses relative advantages within group for more stable training
- Applied to agent tool use scenarios with sparse rewards

#### RLVR (Reinforcement Learning with Verifiable Rewards)
- Became widely adopted training stage in 2025
- LLMs spontaneously develop "reasoning" strategies
- Training on automatically verifiable rewards in math and coding environments
- High cost-effectiveness but significant compute requirements

#### Two-Stage Training (SFT + RL)
- Most common paradigm: Supervised Fine-Tuning followed by RL optimization
- SFT on tool-use demonstration data
- RL for optimization using reward signals
- Alternative pure RL approaches show better generalization but higher sample complexity

#### Reward Function Design Components
- Correctness Reward: Task completion accuracy
- Format Reward: Proper tool invocation formatting
- Tool Execution Reward: Successful tool operation
- Chain Reasoning Reward: Quality of multi-step reasoning
- Efficiency Reward: Minimizing redundant calls

### Areas Requiring Verification

1. **Specific case study results** for Cognition, Ambience Healthcare, Rogo Finance, and Modular - while the companies and their general AI capabilities were confirmed, specific Agent RFT implementation details and quantitative results were not found in public documentation

2. **Detailed grader endpoint API specifications** - while Azure OpenAI documentation mentions grader validation endpoints, complete API documentation for custom grader implementations was limited

3. **Compute multiplier hyperparameter** - the specific role and tuning of this parameter in Agent RFT was not documented in publicly available sources

4. **OpenAI model support timeline** - while o4-mini RFT availability was confirmed, GPT-5 RFT private beta details could not be independently verified

5. **Specific "Will Brown" attribution** - the OpenAI Build Hour research did not confirm a person by this name associated with the Agent RFT presentation

---

## Related Patterns

### Core Reinforcement Learning Patterns

**RLAIF (Reinforcement Learning from AI Feedback)**
- **Description**: Uses AI models to generate preference feedback and evaluation data, reducing annotation costs from $1+ to <$0.01 per sample. Forms foundation of Constitutional AI with constitution-based principles guiding feedback.
- **Relationship to Agent RFT**: **Complementary pattern** - RLAIF provides the reward signal generation methodology, while Agent RFT provides the end-to-end training framework for tool-using agents.
- **Terminology Mapping**: RLAIF focuses on *feedback generation* (preference data, critique generation), while Agent RFT focuses on *multi-step agent training* with real tool calls.
- **Key Difference**: RLAIF is typically used for alignment and preference optimization, while Agent RFT optimizes agentic behaviors including tool use, reasoning chains, and efficiency.

**Tool Use Incentivization via Reward Shaping**
- **Description**: Provides dense, shaped rewards for intermediate tool invocations (compile, lint, test) to encourage agents to use tools rather than just "thinking" tokens.
- **Relationship to Agent RFT**: **Sub-pattern of Agent RFT** - This is a specific reward engineering technique used within Agent RFT training to shape agent behavior.
- **Terminology**: "Reward shaping" is classical RL terminology; "turn-level credit assignment" is used in multi-agent settings.
- **Reference**: Based on Prime Intellect's work on "Reinforcing Multi-Turn Reasoning in LLM Agents via Turn-Level Credit Assignment."

**Inference-Healed Code Review Reward**
- **Description**: Uses a code-review critic that decomposes quality into subcriteria (correctness, style, performance, security) with internal CoT reasoning for explainable reward signals.
- **Relationship to Agent RFT**: **Grader pattern** - This is a specific grader/reward model design that can be used within Agent RFT as the evaluation endpoint.
- **Terminology Mapping**: "Inference healing" refers to the internal CoT reasoning that allows the reward model to explain and adjust its scoring.
- **Academic vs Industry**: Similar to "Criterion-Led Reward Models" (DeepMind, April 2025).

### Supporting Patterns

**Variance-Based RL Sample Selection**
- **Description**: Identifies high-variance samples (sometimes correct, sometimes wrong) to focus training on samples that actually contribute to learning. Found ~85% of samples have zero variance.
- **Relationship to Agent RFT**: **Data optimization pattern** - Used before/during Agent RFT training to select the most valuable training samples.
- **Key Insight**: Only 15-30% high-variance samples are typically trainable; the rest are already learned or too hard.

**Isolated VM per RL Rollout**
- **Description**: Spins up isolated virtual machines for each RL rollout to prevent cross-contamination between simultaneous training runs.
- **Relationship to Agent RFT**: **Infrastructure pattern** - Critical for safe Agent RFT training, especially with destructive tools (shell access, file operations).
- **Real-world example**: Cognition/Devon uses this for file planning agent training with 500+ simultaneous VMs.

**Anti-Reward-Hacking Grader Design**
- **Description**: Designs reward functions resistant to gaming through multi-criteria evaluation, violation detection, and iterative hardening.
- **Relationship to Agent RFT**: **Defensive pattern** - Essential for Agent RFT to prevent models from exploiting grader weaknesses instead of learning actual task performance.
- **Real-world example**: Rogo Finance achieved 100% validation reward initially due to grader gaming, required hardening to get real 21% performance improvement.

**Parallel Tool Call Learning**
- **Description**: Teaches models to parallelize independent tool calls through RL exploration, reducing latency 40-50% when applicable.
- **Relationship to Agent RFT**: **Learned behavior pattern** - Emerges naturally from Agent RFT training; models discover parallelization patterns during exploration.
- **Real-world example**: Cognition/Devon reduced planning from 8-10 sequential tool calls to 4 parallel rounds.

**Memory Reinforcement Learning (MemRL)**
- **Description**: Adds learned "utility scores" to episodic memory so agents learn which memories actually lead to success without modifying model weights.
- **Relationship to Agent RFT**: **Alternative approach** - MemRL achieves runtime learning without weight updates; Agent RFT modifies weights for permanent learning.
- **Key Distinction**: MemRL = frozen LLM + evolving memory utilities; Agent RFT = updated LLM weights + optional memory.

### Evaluation and Feedback Patterns

**CriticGPT-Style Code Review**
- **Description**: Deploy specialized AI models trained for code critique to identify bugs, security vulnerabilities, and quality issues.
- **Relationship to Agent RFT**: **Evaluation infrastructure** - Can serve as the grader/reward model in Agent RFT training for coding tasks.

**Self-Critique Evaluator Loop**
- **Description**: Train self-taught evaluators that bootstrap from synthetic data, generating and judging their own outputs.
- **Relationship to Agent RFT**: **Grader training pattern** - Provides methodology for creating the grader models used in Agent RFT.

**Reflection Loop**
- **Description**: After generating draft, run self-evaluation pass and feed critique into revision attempt.
- **Relationship to Agent RFT**: **Inference-time pattern** - Reflection happens during inference; Agent RFT trains the model to internalize this behavior.

**Rich Feedback Loops > Perfect Prompts**
- **Description**: Expose iterative, machine-readable feedback (compiler errors, test failures) after every tool call for self-debugging.
- **Relationship to Agent RFT**: **Complementary** - Rich feedback provides signals during inference; Agent RFT trains the model to better utilize these signals.

**Schema Validation Retry with Cross-Step Learning**
- **Description**: Multi-step retry with detailed error feedback and cross-step error accumulation for structured output validation.
- **Relationship to Agent RFT**: **Retry pattern** - Operates at inference time; Agent RFT could train models to reduce schema violations.

### Development and Research Patterns

**Shipping as Research**
- **Description**: Treat shipping as research to learn what works rather than waiting for certainty before release.
- **Relationship to Agent RFT**: **Development philosophy** - Agent RFT itself is an experimental technique requiring rapid iteration and validation.

**Dogfooding with Rapid Iteration for Agent Improvement**
- **Description**: Development team extensively uses their own AI agent product for daily tasks, creating tight feedback loop.
- **Relationship to Agent RFT**: **Validation approach** - Dogfooding provides real-world data for Agent RFT training and evaluation.

**Workflow Evals with Mocked Tools**
- **Description**: Test complete agent workflows with mocked tools and dual evaluation criteria (objective tool usage, subjective quality).
- **Relationship to Agent RFT**: **Validation pattern** - Used to evaluate agents before/after Agent RFT training.

**Action Caching & Replay Pattern**
- **Description**: Record every action during execution with precise metadata for deterministic replay without LLM calls.
- **Relationship to Agent RFT**: **Testing infrastructure** - Enables regression testing of Agent RFT-trained models.

**Explicit Posterior-Sampling Planner**
- **Description**: Embeds full RL algorithm (PSRL) inside LLM's reasoning for principled exploration/exploitation.
- **Relationship to Agent RFT**: **Algorithmic alternative** - PSRL runs at inference time; Agent RFT trains weights offline.

### Terminology Mapping Table

| Academic/Research Term | Industry/Product Term | Pattern Context |
|------------------------|----------------------|-----------------|
| RLAIF | AI Feedback | Reward signal generation |
| Reward shaping | Tool use incentivization | Intermediate rewards |
| Turn-level credit assignment | Multi-turn RL | Multi-step reasoning credit |
| Constitutional AI | Principle-based feedback | Guided preference generation |
| Critic models | Reviewer/Judge models | Evaluation and grading |
| Inference healing | CoT explanation | Explainable rewards |
| Posterior sampling | Exploration strategy | RL algorithm selection |
| Preference optimization | Reward maximization | Training objective |
| Credit assignment | Reward attribution | Multi-step learning |
| Exploration-exploitation | Try vs. reuse | Agent behavior |

### Pattern Relationships Summary

**Complementary to Agent RFT** (used together):
- RLAIF (reward generation)
- Tool Use Incentivization (reward engineering)
- Inference-Healed Code Review (grader design)
- Anti-Reward-Hacking Grader (defensive design)
- Variance-Based Sample Selection (data optimization)
- Isolated VM per Rollout (infrastructure)

**Alternative Approaches** (choose one):
- Agent RFT (weight updates) vs. MemRL (memory utilities, frozen weights)
- Agent RFT (offline training) vs. Explicit Posterior-Sampling Planner (online reasoning)
- Agent RFT (end-to-end) vs. Self-Critique Evaluator (reward model only)

**Supporting Infrastructure** (enables Agent RFT):
- Workflow Evals with Mocked Tools (validation)
- Action Caching & Replay (testing)
- Rich Feedback Loops (signal provision)
- Dogfooding (data collection)
- Shipping as Research (development approach)

**Inference-Time Patterns** (complement trained models):
- Reflection Loop (revision after training)
- Schema Validation Retry (structured output)
- Parallel Tool Call Learning (emergent behavior)

---

## Open Questions

### Resolved Through Research

- [x] Academic papers that formalize this approach - Found connections to RLHF, RLAIF, GRPO, ReAct, Toolformer, Reflexion
- [x] Open-source implementations beyond OpenAI - Found ASearcher, ReTool, OTC, Tool-R1
- [x] Comparison with other RL fine-tuning methods - Documented relationships with RLHF, RLAIF, MemRL
- [x] Detailed grader design patterns - Found best practices and anti-patterns
- [x] Scalability considerations - Found bursty traffic patterns and infrastructure requirements

### Remaining Open Questions

**Technical Clarifications:**
- [ ] Exact policy optimization algorithm used in Agent RFT implementation
- [ ] Detailed API specification for grader endpoints
- [ ] Compute multiplier hyperparameter - mentioned in pattern but not found in public API docs
- [ ] Mechanism for converting grader scores to RL gradients

**Validation Needed:**
- [ ] Independent verification of case study results (companies confirmed, specific Agent RFT results not)
- [ ] GPT-5 RFT availability status (private beta as of October 2025)
- [ ] Multimodal input support limitations
- [ ] Multi-turn dialogue support limitations

**Research Gaps:**
- [ ] Systematic comparison of Agent RFT vs. MemRL for same tasks
- [ ] Best practices for training grader models (self-taught vs. supervised)
- [ ] Standardized evaluation metrics for Agent RFT-trained agents
- [ ] Sample efficiency benchmarks comparing to traditional RL

**Implementation Patterns:**
- [ ] Credit assignment algorithms for multi-step tool call traces
- [ ] Reward shaping theory applied to tool use incentivization
- [ ] Constitutional AI integration with Agent RFT grader endpoints
- [ ] Infrastructure patterns for grader endpoint scaling

---

## Conclusion

Agent Reinforcement Fine-Tuning represents a significant evolution in training agentic AI systems. By combining:

1. **Online environment interaction** through real tool endpoints
2. **Custom reward functions** via flexible grader designs
3. **Multi-step optimization** across tool call sequences
4. **Sample-efficient learning** requiring only 100-1000 examples

Agent RFT bridges the gap between general-purpose language models and specialized agentic tasks. The pattern builds on well-established RL research (RLHF, RLAIF, GRPO) while extending it to handle the unique challenges of agentic behavior: tool use, multi-step reasoning, and environment interaction.

Real-world implementations demonstrate compelling results across diverse domains:
- **20-70% performance improvements** on specialized tasks
- **40-50% latency reductions** through learned tool call optimization
- **High sample efficiency** with strong results from 100 examples

The pattern integrates naturally with complementary patterns including RLAIF for reward generation, variance-based sample selection for data optimization, and isolated VM rollouts for safe training. Alternative approaches like MemRL offer runtime learning without weight updates for different use cases.

Key areas for further research include formal verification of case study results, standardized evaluation metrics, and systematic comparison with alternative approaches like MemRL and inference-time RL algorithms.

---

*Report completed 2025-02-27*
