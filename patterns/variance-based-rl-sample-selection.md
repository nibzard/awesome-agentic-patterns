---
title: "Variance-Based RL Sample Selection"
status: "emerging"
authors: ["Theo (OpenAI Solutions Architect)", "Prashant (OpenAI RFT Team)"]
category: "Learning & Adaptation"
source: "https://youtu.be/1s_7RMG4O4U"
tags: [reinforcement-learning, sample-efficiency, variance, data-quality, agent-rft]
---

## Problem

Not all training samples are equally valuable for reinforcement learning:

- **Zero-variance samples**: Model gets same score every time (always correct or always wrong) → no learning signal
- **Wasted compute**: Training on samples where the model has no uncertainty wastes expensive RL exploration
- **Poor data utilization**: With limited training budgets, you want to maximize learning from each sample
- **Unclear training potential**: Hard to know if your dataset will support effective RL training

When Theo ran baseline evaluations on the FinQA benchmark, he discovered that ~85% of samples had zero variance (model always got them right or always wrong), meaning only ~15% of samples could actually contribute to learning.

## Solution

**Run multiple baseline evaluations per sample to identify variance, then prioritize high-variance samples for training.**

**The Variance Plot Methodology:**

1. **Baseline Evaluation**: Run your base model 3-5 times on each sample
2. **Visualize Variance**: Plot results to identify which samples have variance
3. **Categorize Samples**:
   - **Always correct** (variance = 0): Model already knows this
   - **Always incorrect** (variance = 0): Model can't learn this (too hard or needs different approach)
   - **Sometimes correct** (variance > 0): **Prime candidates for RL**
4. **Focus Training**: Prioritize or exclusively use high-variance samples

**Understanding the Variance Plot:**

```
Score
1.0 ●━━━━━━━●━━━━━━●━━━━━━━●    ← Always correct (no learning)
    ┃       ┃      ┃       ┃
0.5 ┃   ●━━━●━━━●  ┃   ●━━━●━━━●    ← High variance (learn here!)
    ┃   ┃   ▼       ┃   ┃
0.0 ●━━━●━━━━━━●━━━●━━━━━━●━━━━━━●    ← Always wrong (no learning)
    └───┴───┴───┴───┴───┴───┴───→
        Sample Index

    ● = Best score (red cross in plots)
    ━ = Mean score (thick blue bar)
    ▼ = Variance range (thin blue bar)
```

**Implementation:**

```python
import numpy as np
import matplotlib.pyplot as plt
from collections import defaultdict

class VarianceAnalyzer:
    """
    Analyze baseline variance to identify high-value training samples
    """
    def __init__(self, agent, dataset, n_runs=3):
        self.agent = agent
        self.dataset = dataset
        self.n_runs = n_runs
        self.results = defaultdict(list)

    def run_baseline_evals(self):
        """
        Run agent multiple times on each sample
        """
        print(f"Running {self.n_runs} evaluations per sample...")

        for sample_idx, sample in enumerate(self.dataset):
            for run_idx in range(self.n_runs):
                score = self.agent.evaluate(sample)
                self.results[sample_idx].append(score)

            if sample_idx % 10 == 0:
                print(f"Completed {sample_idx}/{len(self.dataset)} samples")

        return self.results

    def compute_variance_metrics(self):
        """
        Calculate variance statistics for each sample
        """
        metrics = []

        for sample_idx in sorted(self.results.keys()):
            scores = self.results[sample_idx]

            metrics.append({
                'sample_idx': sample_idx,
                'mean_score': np.mean(scores),
                'best_score': np.max(scores),
                'worst_score': np.min(scores),
                'variance': np.var(scores),
                'std_dev': np.std(scores),
                'scores': scores
            })

        return metrics

    def plot_variance(self, metrics, title="Baseline Variance Analysis"):
        """
        Create variance visualization (like Theo's plots)
        """
        sample_indices = [m['sample_idx'] for m in metrics]
        mean_scores = [m['mean_score'] for m in metrics]
        best_scores = [m['best_score'] for m in metrics]
        std_devs = [m['std_dev'] for m in metrics]

        plt.figure(figsize=(14, 6))

        # Plot mean scores with error bars (variance)
        plt.errorbar(
            sample_indices,
            mean_scores,
            yerr=std_devs,
            fmt='o',
            linewidth=2,
            markersize=3,
            label='Mean ± Std Dev',
            color='cornflowerblue',
            elinewidth=1
        )

        # Overlay best scores
        plt.scatter(
            sample_indices,
            best_scores,
            marker='x',
            s=50,
            color='red',
            label='Best Score',
            alpha=0.7
        )

        plt.xlabel('Sample Index')
        plt.ylabel('Score')
        plt.title(title)
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()

        return plt

    def identify_high_variance_samples(self, metrics, variance_threshold=0.01):
        """
        Filter samples with meaningful variance
        """
        high_variance = [
            m for m in metrics
            if m['variance'] > variance_threshold
            and 0 < m['mean_score'] < 1.0  # Not always right or wrong
        ]

        print(f"\nVariance Analysis:")
        print(f"  Total samples: {len(metrics)}")
        print(f"  High variance samples: {len(high_variance)} "
              f"({100*len(high_variance)/len(metrics):.1f}%)")
        print(f"  Always correct: {sum(1 for m in metrics if m['best_score'] == 1.0 and m['variance'] == 0)}")
        print(f"  Always incorrect: {sum(1 for m in metrics if m['best_score'] == 0.0)}")

        return high_variance

    def compute_improvement_potential(self, metrics):
        """
        Calculate how much performance could improve if model
        always achieves best-of-N performance
        """
        current_avg = np.mean([m['mean_score'] for m in metrics])
        best_of_n_avg = np.mean([m['best_score'] for m in metrics])

        potential_gain = best_of_n_avg - current_avg

        print(f"\nImprovement Potential:")
        print(f"  Current average: {current_avg:.3f}")
        print(f"  Best-of-{self.n_runs} average: {best_of_n_avg:.3f}")
        print(f"  Potential gain: {potential_gain:.3f} "
              f"({100*potential_gain/current_avg:.1f}% relative improvement)")

        return {
            'current': current_avg,
            'best_of_n': best_of_n_avg,
            'potential_gain': potential_gain
        }


# Usage example
analyzer = VarianceAnalyzer(
    agent=my_agent,
    dataset=validation_set,
    n_runs=3
)

# Run baseline evaluations
results = analyzer.run_baseline_evals()

# Analyze variance
metrics = analyzer.compute_variance_metrics()

# Visualize
analyzer.plot_variance(metrics)

# Identify high-value samples
high_var_samples = analyzer.identify_high_variance_samples(metrics)

# Calculate improvement potential
potential = analyzer.compute_improvement_potential(metrics)

# Use high-variance samples for training
training_data = [
    dataset[m['sample_idx']]
    for m in high_var_samples
]
```

## How to use it

**Step 1: Baseline Evaluation (Before Training)**

Run your base model 3-5 times on each sample in your training and validation sets:

```python
# Run multiple times per sample
for sample in dataset:
    for run in range(3):
        score = agent.evaluate(sample)
        record_score(sample.id, score)
```

**Step 2: Create Variance Plot**

Visualize to understand your data:

- **X-axis**: Sample index
- **Y-axis**: Score (0-1)
- **Red crosses**: Best score achieved across runs
- **Blue bars**: Mean score (thick) and variance (thin)

**Step 3: Interpret Results**

Good indicators for RL:
- **15-30% high variance samples**: Enough learning opportunities
- **Best-of-N >> Mean**: Model has potential to improve with RL
- **Variance distributed across dataset**: Not concentrated in few samples

Warning signs:
- **<10% high variance**: Dataset may be too easy or too hard
- **Best-of-N ≈ Mean**: Model is very consistent (low improvement potential)
- **All variance in tail**: Most samples don't offer learning signal

**Step 4: Set Compute Multiplier**

The compute multiplier controls exploration during training:

- **Low variance (10-15%)**: Use compute multiplier 2-4 for more exploration
- **Medium variance (15-30%)**: Use compute multiplier 1-2
- **High variance (>30%)**: Compute multiplier 1 may suffice

**Step 5: Monitor During Training**

Track how variance evolves:
- Early training: Variance should decrease as model learns
- Plateau: Variance may increase as model explores new strategies
- Convergence: Variance should stabilize at lower level

## Real-World Example: FinQA Benchmark

**Task**: Answer financial questions using tool-based search (not given context)

**Baseline Analysis:**

- Dataset: 100 validation samples, 1000 training samples
- Runs per sample: 3
- Base model: GPT-4o

**Results:**

```
Variance Analysis:
  Total samples: 100
  High variance samples: 15 (15%)
  Always correct: 40 samples
  Always incorrect: 45 samples

Improvement Potential:
  Current average: 0.59
  Best-of-3 average: 0.73
  Potential gain: +0.14 (24% relative improvement)
```

**Interpretation:**

- Only 15% of samples had variance → training will focus learning on those
- 24% potential improvement if model learns to consistently hit best-of-3 performance
- Good candidate for RL despite low variance percentage (quality over quantity)

**Training Results:**

After 10 steps of agent RFT:
- Validation reward: 0.59 → 0.63 (+7%)
- Tool calls per rollout: 6.9 → 4.2 (-39%)
- Latency: ~10% reduction

The model improved toward the best-of-3 ceiling while also becoming more efficient.

## Trade-offs

**Pros:**

- **Data efficiency**: Focus training on samples that actually contribute to learning
- **Predictive**: Estimate improvement potential before expensive training
- **Diagnostic**: Understand if your task is suitable for RL
- **Guides hyperparameters**: Informs compute multiplier and training duration decisions

**Cons:**

- **Upfront cost**: Requires 3-5x baseline evaluations before training
- **Small samples**: With few samples (<50), variance estimates may be noisy
- **Doesn't guarantee success**: High variance is necessary but not sufficient
- **Dynamic variance**: Variance changes during training, so initial analysis may not hold

## References

- [OpenAI Build Hour: Agent RFT - Variance Analysis Demo (November 2025)](https://youtu.be/1s_7RMG4O4U)
- [Prior RFT Build Hour with Prashant](https://www.youtube.com/openai-build-hours)
- Related patterns: Agent Reinforcement Fine-Tuning, Inference-Time Scaling
