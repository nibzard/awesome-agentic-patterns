---
title: "Self-Discover: LLM Self-Composed Reasoning Structures"
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Google DeepMind", "USC"]
category: "Feedback Loops"
source: "https://arxiv.org/abs/2402.03620"
tags: [reasoning, self-improvement, meta-learning, problem-solving, task-specific, optimization]
---

## Problem

Different reasoning tasks require different thinking strategies. While techniques like Chain-of-Thought (CoT) work well for some problems, they may be suboptimal for others. Current approaches typically use fixed reasoning patterns regardless of the specific problem at hand, leading to inefficient problem-solving and suboptimal performance on diverse tasks.

## Solution

Self-Discover enables LLMs to automatically discover and compose task-specific reasoning structures. The process involves:

1. **SELECT**: Choose 3-5 relevant reasoning modules from a predefined library of atomic reasoning primitives
2. **ADAPT**: Transform generic modules into task-specific reasoning steps tailored to the exact problem
3. **COMPOSE**: Organize adapted modules into a coherent reasoning structure with defined order of operations
4. **EXECUTE**: Solve the problem using the self-discovered structure

This approach allows the model to adapt its reasoning strategy to match the problem's unique characteristics, leading to significant performance improvements.

## Example

```python
class SelfDiscoverAgent:
    def __init__(self, llm):
        self.llm = llm
        self.reasoning_modules = [
            "Break the problem into smaller steps",
            "Think about similar problems you've seen",
            "Consider edge cases and exceptions",
            "Work backwards from the desired outcome",
            "Use concrete examples to test understanding",
            "Identify key constraints and requirements",
            "Consider multiple perspectives",
            "Check for logical consistency",
            "Simplify the problem first",
            "Look for patterns"
        ]
    
    def discover_reasoning_structure(self, task):
        # Step 1: Select relevant reasoning modules
        selection_prompt = f"""
        Task: {task}
        
        Available reasoning modules:
        {self.format_modules(self.reasoning_modules)}
        
        Select 3-5 most relevant modules for solving this task.
        Explain why each selected module is important for this problem.
        """
        selected_modules = self.llm.generate(selection_prompt)
        
        # Step 2: Adapt modules to the task
        adaptation_prompt = f"""
        Task: {task}
        Selected modules: {selected_modules}
        
        Adapt these generic modules into specific reasoning steps 
        tailored to this exact task. Make them concrete and actionable.
        """
        adapted_modules = self.llm.generate(adaptation_prompt)
        
        # Step 3: Compose into reasoning structure
        composition_prompt = f"""
        Task: {task}
        Adapted reasoning steps: {adapted_modules}
        
        Organize these into a coherent reasoning structure.
        Define the order of operations and how steps connect.
        Create a step-by-step reasoning plan.
        """
        reasoning_structure = self.llm.generate(composition_prompt)
        
        return reasoning_structure
    
    def solve_with_structure(self, task, reasoning_structure):
        solve_prompt = f"""
        Task: {task}
        
        Use this reasoning structure to solve the problem:
        {reasoning_structure}
        
        Follow each step carefully and show your work.
        """
        return self.llm.generate(solve_prompt)
    
    def self_discover_solve(self, task):
        # Discover optimal reasoning structure
        structure = self.discover_reasoning_structure(task)
        
        # Solve using discovered structure
        solution = self.solve_with_structure(task, structure)
        
        return {
            'reasoning_structure': structure,
            'solution': solution
        }
```

```mermaid
flowchart TD
    A[Input Task] --> B[Analyze Task Requirements]
    B --> C[Select Relevant Reasoning Modules]
    C --> D[Adapt Modules to Specific Task]
    D --> E[Compose Reasoning Structure]
    E --> F[Execute with Structure]
    F --> G[Solution]
    
    H[Module Library] --> C
    
    style E fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style H fill:#fff3e0,stroke:#e65100,stroke-width:2px
```

## Benefits

- **Task-Specific Optimization**: Reasoning approach dynamically matches problem requirements without manual prompt engineering
- **Performance Gains**: Up to 32% improvement over Chain-of-Thought on challenging reasoning benchmarks (arXiv:2402.03620, 2024)
- **Interpretability**: Explicit reasoning structure shows the problem-solving approach
- **Transferability**: Discovered structures can be cached and reused for similar problems

## Trade-offs

**Pros:**
- Significant performance improvements on diverse reasoning tasks
- More efficient than trying all reasoning strategies
- Creates reusable reasoning templates
- Adapts to novel problem types

**Cons:**
- Computational overhead: approximately 2-3x the cost of single-pass Chain-of-Thought due to multiple LLM calls
- Requires a diverse set of reasoning modules (typically 20-30 for good coverage)
- May over-engineer simple problems
- Structure quality depends on task analysis accuracy

## How to use it

- Use this for complex reasoning tasks where different problems require different reasoning strategies (mathematical problem solving, strategic planning, multi-step code generation)
- Best suited for applications where performance gains justify the additional computational overhead
- Consider when interpretability of reasoning approach is valuable
- Start with a diverse module library covering decomposition, verification, improvement, knowledge retrieval, and strategic reasoning

## References

- [Self-Discover: Large Language Models Self-Compose Reasoning Structures (2024)](https://arxiv.org/abs/2402.03620) - Google DeepMind & USC, arXiv:2402.03620
- [Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (2022)](https://arxiv.org/abs/2201.11903) - Wei et al., NeurIPS 2022
- [Reflexion: Language Agents with Verbal Reinforcement Learning (2023)](https://arxiv.org/abs/2303.11366) - Shinn et al., NeurIPS 2023
- [Tree of Thoughts: Deliberate Problem Solving with Large Language Models (2023)](https://arxiv.org/abs/2305.10601) - Yao et al., NeurIPS 2023
