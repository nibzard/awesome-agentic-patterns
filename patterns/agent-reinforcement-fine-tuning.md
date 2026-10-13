---
title: Agent Reinforcement Fine-Tuning (Agent RFT)
status: emerging
authors:
  - Nikola Balic (@nibzard)
based_on:
  - Theophile Sautory (OpenAI)
  - William Hang (OpenAI)
category: Learning & Adaptation
source: 'https://youtu.be/1s_7RMG4O4U'
tags:
  - reinforcement-learning
  - fine-tuning
  - tool-use
  - multi-step-rl
  - agent-training
  - exploration
slug: agent-reinforcement-fine-tuning
id: agent-reinforcement-fine-tuning-agent-rft
summary: "Trains model weights with reinforcement learning on real tool calls and custom graders to improve domain-specific tool use and multi-step reasoning"
signals: ["Agent still underperforms on domain tasks after prompt optimization", "Agent makes too many or wrong tool calls", "Task has agreed correct answers and non-zero baseline performance"]
anti_signals: ["Base model never solves the task", "Team cannot host tool and grader endpoints that mirror production", "No consensus on what a correct answer is"]
updated_at: '2026-10-13'
---

## Problem

After optimizing prompts and task design, agents may still underperform on your specific business tasks because:

- **Domain shift**: Your tools and business context differ from what the base model was trained on
- **Inefficient tool use**: Agents make too many tool calls or use wrong tools, leading to high latency
- **Suboptimal reasoning**: The model doesn't reason well across your specific tool outputs
- **Sample scarcity**: Some domains (e.g., new GPU hardware, specialized finance) lack training data

Traditional fine-tuning approaches don't work well because they can't train the agent end-to-end on multi-step tool interactions with your environment.

## Solution

**Agent Reinforcement Fine-Tuning (Agent RFT)** trains the model weights end-to-end on agentic tasks by allowing the model to:

1. **Explore via actual tool calls**: During training rollouts, the agent calls your real tool endpoints, learning from actual responses
2. **Receive custom reward signals**: You define what "good" looks like via flexible graders (model-based, endpoint-based, or string-based)
3. **Learn multi-step reasoning**: The agent learns to reason across tool outputs in the context window
4. **Optimize for your metrics**: Reduce tool calls, improve accuracy, or balance both based on your reward function

> Provider status (October 2026): OpenAI is winding down its fine-tuning platform; it is "no longer accessible to new users," and current RFT docs support o-series reasoning models only (o4-mini), with graders scoring tool-call contents in the training data rather than calling live endpoints during rollouts. Treat the OpenAI flow below as the demoed path from the Build Hour, now deprecated/limited, and use provider-agnostic frameworks such as [TRL](https://github.com/huggingface/trl) (GRPO/DPO trainers) or [verl](https://github.com/volcengine/verl) (PPO/GRPO/DAPO with tool rollout support) for new work.

This is the umbrella pattern for the loop; see the distinct-from note under References for how the four sibling patterns mined from the same video split it.

**Key Components:**

- **Tool Endpoints**: Host your tools (same as production) that the model calls during training
- **Grader Endpoint**: Define custom reward logic that evaluates final answers and/or tool call traces
- **Unique Rollout IDs**: Each training rollout gets a unique ID for state management across tool calls

**Grader Design Best Practices:**

- **Use gradient rewards**: Provide 0-1 floating point scores rather than binary 0/1 for clearer learning signals
- **Prevent reward hacking**: Evaluate reasoning process, not just final answers; detect "lucky guesses"
- **Align with domain knowledge**: Measure grader-human consistency (e.g., Cohen's Kappa) before training
- **Multi-dimensional evaluation**: Consider correctness, format compliance, efficiency, and safety

```python
# Agent RFT Training Setup (OpenAI demo path; see provider status note above)
from openai import OpenAI

client = OpenAI()

# 1. Define your tools with hosted endpoints
tools = [
    {
        "name": "search",
        "url": "https://your-tools.modal.run/search",
        "headers": {"Authorization": "Bearer YOUR_TOKEN"}
    },
    {
        "name": "read_file",
        "url": "https://your-tools.modal.run/read_file",
        "headers": {"Authorization": "Bearer YOUR_TOKEN"}
    }
]

# 2. Define your grader (model-based or endpoint-based)
grader = {
    "type": "model",  # or "endpoint" for custom grading logic
    "model": "gpt-4o",
    "response_format": {
        "type": "json_schema",
        "json_schema": {
            "name": "grader_response",
            "schema": {
                "type": "object",
                "properties": {
                    "score": {"type": "number"},  # 0.0 to 1.0
                    "reasoning": {"type": "string"}
                }
            }
        }
    },
    "prompt": """
    Evaluate the agent's answer based on:
    1. Correctness vs ground truth
    2. Completeness of reasoning

    Ground truth: {ground_truth}
    Agent answer: {final_answer}

    Provide score (0-1) and reasoning.
    """
}

# 3. Start fine-tuning job
job = client.fine_tuning.jobs.create(
    training_file="file-abc123",
    model="gpt-4o-2024-08-06",
    method="rft",
    rft={
        "tools": tools,
        "grader": grader,
        "hyperparameters": {
            "n_epochs": 3,
            "batch_size": 16,
            "compute_multiplier": 1  # Exploration factor
        }
    }
)
```

## How to use it

**Prerequisites:**

- Well-specified, constrained task with consensus on correct answers
- Non-zero baseline performance (model sometimes gets it right)
- Quality training data (100-1000 samples, quality over quantity)
- Hosted tool endpoints that mirror production behavior

**Training Process:**

1. **Baseline evaluation**: Run your base model multiple times per sample to measure variance
2. **Host tools**: Deploy tool endpoints (FastAPI, Modal, etc.) that handle bursty traffic
3. **Design grader**: Create reward function that's hard to game, provides gradient (not just binary)
4. **Monitor training**: Watch reward curves, tool call distributions, and reasoning token counts
5. **Evaluate results**: Compare fine-tuned model on validation set for accuracy and latency

**What Agent RFT Optimizes:**

- **ML Performance**: Better final answer quality through improved reasoning and tool use
- **Latency**: Fewer tool calls and reasoning tokens (in the Build Hour demo: tool calls per rollout fell from 6.9 to 4.2 and latency dropped roughly 10%)
- **Sample Efficiency**: Can achieve strong results with as few as 100 quality samples

**Tool Call Optimization Patterns:**

Models naturally learn to optimize tool use through exploration:
- **Parallelization**: Make independent tool calls simultaneously rather than sequentially
- **Early termination**: Stop exploration once sufficient information is gathered
- **Tool selection**: Learn which tools are most effective for specific task types

```mermaid
graph TD
    A[Training Sample] --> B[Model Generates Rollout]
    B --> C{Tool Call?}
    C -->|Yes| D[Call Your Tool Endpoint]
    D --> E[Tool Response]
    E --> F[Add to Context]
    F --> B
    C -->|No| G[Final Answer]
    G --> H[Call Your Grader]
    H --> I[Reward Signal]
    I --> J[Update Model Weights]
    J --> K[Next Sample]

    style D fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style H fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style J fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
```

## Real-World Examples

**Cognition (Devin)**

- Task: File planning agent to identify which files to edit
- Tools: `read_file`, `shell` (grep, find)
- Results:

- Cut planning back-and-forths from 8-10 to 4
  - Learned to parallelize tool calls automatically
  - Improved F1 score on file identification

**Ambience Healthcare**

- Task: ICD-10 medical coding from transcripts
- Tools: Semantic search over 70K medical codes
- Results:
  
- F1 score: 0.52 → 0.57 (significant given 0.75 human ceiling)
  - 18% latency reduction
  - 50% reduction in samples exceeding latency threshold

**Rogo Finance**

- Task: Financial reasoning and summarization from filings
- Tools: Document retrieval, analysis tools
- Results:
  
- 21% ML performance improvement
  - Reduced hallucinations and missing citations
  - Required hardening grader against reward hacking

**Modular (Mojo GPU Kernels)**

- Task: Write performant GPU kernels for new hardware
- Tools: Compiler, kernel execution environment
- Results:
  
- 72% improvement in correct + performant kernels
  - Only 100 PyTorch prompts needed (sample efficient)
  - No code examples required in training data

## Trade-offs

**Pros:**

- **End-to-end optimization**: Trains the entire agent loop, not just final outputs
- **Sample efficient**: Can work with 100-1000 samples vs millions for pre-training
- **Flexible rewards**: Support for complex, multi-criteria grading logic
- **Natural speedups**: Models learn to use fewer tokens and tool calls organically
- **Domain adaptation**: Closes distribution gap between base model and your business context

**Cons:**

- **Infrastructure complexity**: Must host robust tool and grader endpoints
- **Bursty traffic**: Training sends 100s of simultaneous requests at training step boundaries
- **Grader design effort**: Requires careful reward engineering to avoid gaming
- **Training cost**: More expensive than supervised fine-tuning due to exploration
- **Debugging difficulty**: Hard to trace why model learned certain behaviors

## References

- [OpenAI Build Hour: Agent RFT (November 2025)](https://youtu.be/1s_7RMG4O4U) - presented by Theophile Sautory and William Hang
- [OpenAI fine-tuning guide](https://developers.openai.com/api/docs/guides/fine-tuning) - documents the platform wind-down ("no longer accessible to new users")
- [OpenAI reinforcement fine-tuning docs](https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning) - grader design, o4-mini-only support, tool-call grading in data
- [TRL (Transformers Reinforcement Learning)](https://github.com/huggingface/trl) - open-source SFT/GRPO/DPO trainers
- [verl](https://github.com/volcengine/verl) - open-source RL post-training framework with multi-turn tool rollout support
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629) (Yao et al., ICLR 2023)
- [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366) (Shinn et al., NeurIPS 2023)
- [DeepSeekMath: GRPO for Mathematical Reasoning](https://arxiv.org/abs/2402.03300) (Shao et al., 2024)

Distinct from the four sibling patterns mined from the same video: [Tool Use Incentivization via Reward Shaping](tool-use-incentivization-via-reward-shaping.md) (dense per-tool rewards), [Parallel Tool Call Learning](parallel-tool-call-learning.md) (batching rewards), [Variance-Based RL Sample Selection](variance-based-rl-sample-selection.md) (choosing which samples to train on), and [Isolated VM per RL Rollout](isolated-vm-per-rl-rollout.md) (rollout infrastructure) each isolate one design decision of this loop.
