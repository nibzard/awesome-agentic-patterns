---
title: "Language Agent Tree Search (LATS)"
status: "emerging"
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Zhou et al.", "University of Illinois"]
category: "Orchestration & Control"
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
- Higher computational cost due to tree exploration
- Requires more LLM calls than simple approaches
- May be overkill for simple tasks
- Requires careful tuning of exploration parameters

## References

- [Language Agent Tree Search (LATS) Paper](https://arxiv.org/abs/2310.04406)
- [Comparison with ReACT, Reflexion, and Tree of Thoughts](https://www.langchain.com/langgraph)