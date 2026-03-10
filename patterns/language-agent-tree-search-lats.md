---
title: "Language Agent Tree Search (LATS)"
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Zhou et al.", "University of Illinois"]
category: "Orchestration & Control"
source: "https://arxiv.org/abs/2310.04406"
tags: [search, monte-carlo, tree-search, reasoning, planning, reflection, evaluation]
---

## Problem

Current language agents often struggle with complex reasoning tasks that require exploration of multiple solution paths. Simple linear approaches like ReACT or basic reflection patterns can get stuck in local optima or fail to consider alternative strategies. This is particularly problematic for tasks requiring strategic planning, mathematical reasoning, or multi-step problem solving where early decisions significantly impact later outcomes.

## Solution

Language Agent Tree Search (LATS) combines Monte Carlo Tree Search (MCTS) with language model reflection and evaluation capabilities. The approach treats the problem-solving process as a tree where:

1. **Nodes** represent states (partial solutions or reasoning steps)
2. **Edges** represent actions (next steps in reasoning)
3. **Leaf nodes** are evaluated using the LLM's self-reflection capabilities
4. **Backpropagation** updates value estimates throughout the tree

The agent explores promising branches more deeply while maintaining breadth to avoid getting stuck. This creates a best-of-both-worlds approach combining systematic search with LLM reasoning.

**Selection uses the UCB (Upper Confidence Bound) formula:**

```
UCB(node) = Q(node) + c × √(ln(parent_visits) / node_visits)
```

Where Q(node) is the estimated value, c is the exploration constant (typically 1.4), and the logarithmic term balances exploration of less-visited nodes. This principled approach yields better sample efficiency than breadth-first or random exploration.

**Evaluation mechanisms** include: direct confidence scoring (0-1), critique-based evaluation, or multi-aspect scoring. The choice depends on task complexity and required precision.

## Example

```python
class LATSAgent:
    def __init__(self, llm, max_iterations=50, exploration_constant=1.4):
        self.llm = llm
        self.max_iterations = max_iterations
        self.c = exploration_constant  # UCB exploration parameter
        
    def search(self, initial_state, problem):
        root = Node(state=initial_state)
        
        for _ in range(self.max_iterations):
            # Selection: traverse tree using UCB
            node = self.select(root)
            
            # Expansion: generate possible actions
            if not node.is_terminal():
                actions = self.generate_actions(node.state, problem)
                for action in actions:
                    child_state = self.apply_action(node.state, action)
                    node.add_child(Node(state=child_state, action=action))
            
            # Simulation: evaluate the node
            value = self.evaluate(node, problem)
            
            # Backpropagation: update values up the tree
            self.backpropagate(node, value)
        
        return self.best_path(root)
    
    def select(self, node):
        """Select child using UCB (Upper Confidence Bound)"""
        while node.children:
            node = max(node.children, key=lambda n: self.ucb_score(n))
        return node
    
    def ucb_score(self, node):
        if node.visits == 0:
            return float('inf')
        exploitation = node.value / node.visits
        exploration = self.c * sqrt(log(node.parent.visits) / node.visits)
        return exploitation + exploration
    
    def evaluate(self, node, problem):
        """Use LLM to evaluate the quality of current state"""
        prompt = f"""
        Problem: {problem}
        Current solution state: {node.state}
        
        Evaluate this partial solution:
        1. Is this on the right track? (0-10)
        2. What are the strengths?
        3. What are potential issues?
        4. Estimated distance to complete solution?
        
        Overall value score (0-1):
        """
        evaluation = self.llm.generate(prompt)
        return self.parse_value_score(evaluation)
    
    def generate_actions(self, state, problem):
        """Use LLM to generate possible next steps"""
        prompt = f"""
        Problem: {problem}
        Current state: {state}
        
        Generate 3-5 possible next steps that could advance the solution.
        Each step should be different and explore various approaches.
        """
        return self.llm.generate(prompt).split('\n')
```

## Benefits

- **Better Performance**: Outperforms ReACT, Reflexion, and Tree of Thoughts on complex reasoning tasks
- **Strategic Exploration**: Balances exploration of new paths with exploitation of promising ones
- **Self-Improving**: Uses reflection to learn which paths are more promising
- **Robust**: Less likely to get stuck in dead ends compared to linear approaches

## Trade-offs

**Pros:**
- Significantly better performance on complex reasoning tasks
- Systematic exploration prevents getting stuck
- Naturally handles problems with multiple valid approaches
- Provides interpretable reasoning traces

**Cons:**
- Higher computational cost (5-20x more LLM calls than simpler approaches)
- Inherently sequential—unsuitable for real-time applications
- Implementation complexity requires correct MCTS and tree state management
- May be overkill for simple tasks where ReAct or ToT suffice

## How to use it

**When to use LATS:**
- Complex reasoning tasks requiring strategic planning and multi-step decision making
- Problems with multiple valid solution paths where exploration matters
- Mathematical reasoning, algorithm design, or debugging with multiple potential causes
- Budgets allow for higher computational cost (5-20x more LLM calls than simpler approaches)

**When to use alternatives:**
- Simple or linear tasks: use ReAct or Chain-of-Thought
- Real-time response requirements: use single-pass with Reflection Loop
- Cost-sensitive applications: use Tree-of-Thoughts with limited branching

**Implementation guidance:**
- Start with fixed iterations (10-25) before tuning exploration constant c
- Use lower temperature (0.1-0.3) for evaluation, higher (0.7-1.0) for expansion
- Consider LangGraph for graph infrastructure supporting MCTS-like workflows

## References

- [Language Agent Tree Search (LATS) Paper](https://arxiv.org/abs/2310.04406) - Zhou et al., 2023
- [Monte Carlo Tree Search: A Survey](https://doi.org/10.1109/TCIAIG.2012.2206890) - Browne et al., 2012 (foundational MCTS theory)
- [Tree of Thoughts: Deliberate Problem Solving](https://arxiv.org/abs/2305.10601) - Yao et al., NeurIPS 2023
- [Reflexion: Language Agents with Verbal RL](https://arxiv.org/abs/2303.11366) - Shinn et al., 2023
