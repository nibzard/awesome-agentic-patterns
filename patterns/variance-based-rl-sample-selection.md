---
title: "Variance-Based RL Sample Selection"
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Theo (OpenAI Solutions Architect)", "Prashant (OpenAI RFT Team)"]
category: "Learning & Adaptation"
source: "https://youtu.be/1s_7RMG4O4U"
tags: [reinforcement-learning, sample-efficiency, variance, data-quality, agent-rft]
summary: "Runs the base model several times per sample and trains RL only on samples with score variance, skipping ones that are always right or always wrong"
signals: ["Planning reinforcement fine-tuning on a limited budget", "Dataset may contain many samples with no learning signal", "Need to estimate RL improvement potential before training"]
anti_signals: ["Very small dataset (under about 50 samples) with noisy variance estimates", "No budget for 3-5 baseline runs per sample"]
updated_at: "2026-10-13"
---

## Problem

Not all training samples are equally valuable for reinforcement learning. This pattern builds on **Prioritized Experience Replay** (Schaul et al., 2016), which introduced TD-error-based sample prioritization for value learning.

- **Zero-variance samples**: the model gets the same score every time (always correct or always wrong), so there is no learning signal
- **Wasted compute**: training on samples where the model has no uncertainty wastes expensive RL exploration
- **Poor data utilization**: with limited training budgets, you want to maximize learning from each sample
- **Unclear training potential**: it is hard to know if your dataset will support effective RL training

Baseline evaluations that Theo ran on the FinQA benchmark found that about 85% of samples had zero variance (the model always got them right or always wrong), so only about 15% of the samples could actually contribute to learning.

## Solution

**Run multiple baseline evaluations per sample to identify variance, then prioritize high-variance samples for training.**

**The Variance Plot Methodology:**

1. **Baseline Evaluation**: run your base model 3-5 times on each sample
2. **Visualize Variance**: plot the results to identify which samples have variance
3. **Categorize Samples**:
   - **Always correct** (variance = 0): the model already knows this
   - **Always incorrect** (variance = 0): the model cannot learn this (too hard, or it needs a different approach)
   - **Sometimes correct** (variance > 0): **prime candidates for RL**
4. **Focus Training**: prioritize, or exclusively use, the high-variance samples

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

**Implementation sketch:**

```python
import numpy as np

def run_baseline(agent, dataset, n_runs=3):
    """Score every sample n_runs times with the base model."""
    return {i: [agent.evaluate(sample) for _ in range(n_runs)]
            for i, sample in enumerate(dataset)}

def variance_metrics(results):
    """Mean, best, and variance of the scores for each sample."""
    return [{
        'sample_idx': i,
        'mean_score': np.mean(scores),
        'best_score': np.max(scores),
        'variance': np.var(scores),
    } for i, scores in results.items()]

def select_high_variance(metrics, dataset, variance_threshold=0.01):
    """Keep samples with meaningful variance that are not always right or wrong."""
    return [dataset[m['sample_idx']] for m in metrics
            if m['variance'] > variance_threshold and 0 < m['mean_score'] < 1.0]
```

For the variance plot, draw the mean score per sample with an error bar of one standard deviation (the thick blue bar), and overlay the best score per sample (the red cross). The improvement potential is the mean best-of-N score minus the mean score: it estimates how much RL could gain if the model always reached its best-of-N result.

## How to use it

**Step 1: Baseline Evaluation (Before Training)**

Run your base model 3-5 times on each sample in your training and validation sets.

**Step 2: Create the Variance Plot**

- **X-axis**: sample index
- **Y-axis**: score (0-1)
- **Red crosses**: best score achieved across runs
- **Blue bars**: mean score (thick) and variance range (thin)

**Step 3: Interpret the Results**

Good indicators for RL:

- **15-30% high variance samples**: enough learning opportunities
- **Best-of-N much higher than the mean**: the model has potential to improve with RL
- **Variance distributed across the dataset**: not concentrated in a few samples

Warning signs:

- **Under 10% high variance**: the dataset may be too easy or too hard
- **Best-of-N close to the mean**: the model is very consistent, with low improvement potential
- **All variance in the tail**: most samples do not offer learning signal

**Step 4: Set the Compute Multiplier**

The compute multiplier controls exploration during training:

- **Low variance (10-15%)**: use a compute multiplier of 2-4 for more exploration
- **Medium variance (15-30%)**: use a compute multiplier of 1-2
- **High variance (over 30%)**: a compute multiplier of 1 may suffice

**Step 5: Monitor During Training**

Track how variance evolves. Early in training, variance should decrease as the model learns. At a plateau, variance may increase as the model explores new strategies. At convergence, variance should stabilize at a lower level.

### Worked example: FinQA benchmark (webinar demo)

**Task**: answer financial questions using tool-based search (the context is not given).

**Baseline analysis:**

- Dataset: 100 validation samples, 1000 training samples
- Runs per sample: 3
- Base model: GPT-5 (GPT-4.1 served as the model grader)

**Results:**

```
Variance Analysis:
  Total samples: 100
  High variance samples: 15 (15%)

Improvement Potential:
  Current average: 0.59
  Best-of-3 ceiling: compute from your own runs; the demo did not publish one
```

**Interpretation:**

- Only 15% of samples had variance, so training will focus learning on those
- A good candidate for RL despite the low variance percentage (quality over quantity)

**Training results (webinar demo, not a production benchmark):** after 10 steps of agent RFT:

- Validation reward: 0.59 → 0.63 (+7%)
- Tool calls per rollout: 6.9 → 4.2 (-39%)
- Latency: about 10% reduction

The model improved and also became more efficient.

**Other demoed use cases from the same webinar:**

- **Ambience Healthcare, ICD-10 coding**: F1 score 0.52 → 0.57 (+9.6%), 18% latency reduction
- **Cognition (Devin), file planning**: planning back-and-forths cut from 8-10 to 4

Note: the production results above validated agent RFT broadly. The variance-selection technique itself was shown in a webinar demo, which is why this pattern carries a lower status than the umbrella [Agent RFT](agent-reinforcement-fine-tuning.md) entry. Distinct from that umbrella entry: this pattern is only the pre-training step of deciding which samples to train on.

## Trade-offs

**Pros:**

- **Data efficiency**: training focuses on samples that actually contribute to learning
- **Predictive**: estimate the improvement potential before the expensive training
- **Diagnostic**: understand if your task is suitable for RL
- **Guides hyperparameters**: informs the compute multiplier and training duration decisions

**Cons:**

- **Upfront cost**: requires 3-5x baseline evaluations before training
- **Small samples**: with few samples (under 50), variance estimates may be noisy
- **Doesn't guarantee success**: high variance is necessary but not sufficient
- **Dynamic variance**: variance changes during training, so the initial analysis may not hold

**Failure modes / gotchas:**

- **Noisy variance on a small dataset:** a few runs on few samples produce variance by chance. Treat the thresholds as approximate below about 50 samples.
- **Always-wrong samples mistaken for learnable:** zero-variance failures are excluded together with zero-variance successes, because RL on them wastes budget. They need a different approach.
- **Stale selection:** the high-variance set from the baseline shrinks as the model learns. Re-run the variance analysis when training plateaus.

## References

- [OpenAI Build Hour: Agent RFT - Variance Analysis Demo (November 2025)](https://youtu.be/1s_7RMG4O4U)
- [Prior RFT Build Hour with Prashant](https://www.youtube.com/openai-build-hours)
- [Prioritized Experience Replay (Schaul et al., ICLR 2016)](https://arxiv.org/abs/1511.05952) - Foundation paper introducing TD-error-based sample prioritization
- [DAPO: An Open-Source LLM Reinforcement Learning System at Scale](https://arxiv.org/abs/2503.14476) - names dynamic sampling (resampling to skip prompts whose rollouts all succeed or all fail) among its four key techniques; the research grounding for discarding zero-advantage samples
- Related patterns: Agent Reinforcement Fine-Tuning, Inference-Time Scaling
