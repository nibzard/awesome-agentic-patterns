---
title: Skill Library Evolution
status: established
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Anthropic Engineering Team"]
category: Learning & Adaptation
source: "https://www.anthropic.com/engineering/code-execution-with-mcp"
tags: [code-reuse, skills, learning, capabilities, evolution]
---

## Problem

Agents frequently solve similar problems across different sessions or workflows. Without a mechanism to preserve and reuse working code, agents must rediscover solutions each time, wasting tokens and time. Organizations want agents to build up capability over time rather than starting from scratch every session.

## Solution

Agents persist working code implementations as reusable functions in a `skills/` directory. Over time, these implementations evolve into well-documented, tested "skills" that become higher-level capabilities the agent can leverage.

**Evolution path:**

```mermaid
graph LR
    A[Ad-hoc Code] --> B[Save Working Solution]
    B --> C[Reusable Function]
    C --> D[Documented Skill]
    D --> E[Agent Capability]
```

**Basic pattern:**

```python
# Session 1: Agent writes code to solve a problem
def analyze_sentiment(text):
    # Implementation discovered through experimentation
    response = llm.complete(f"Analyze sentiment: {text}")
    return parse_sentiment(response)

# Agent saves working solution
with open("skills/analyze_sentiment.py", "w") as f:
    f.write(inspect.getsource(analyze_sentiment))
```

**Later session: Agent discovers and uses existing skill**

```python
# Agent explores skills directory
skills = os.listdir("skills/")
# Finds: ['analyze_sentiment.py', 'extract_entities.py', ...]

# Imports and uses existing skill
from skills.analyze_sentiment import analyze_sentiment

result = analyze_sentiment("Customer feedback here...")
```

**Evolved skill with documentation:**

```python
# skills/analyze_sentiment.py
"""
SKILL: Sentiment Analysis

Analyzes text sentiment using LLM completion and structured parsing.

Args:
    text (str): Text to analyze
    granularity (str): 'binary' or 'fine-grained' (default: 'binary')

Returns:
    dict: {'sentiment': str, 'confidence': float, 'aspects': list}

Example:
    >>> analyze_sentiment("Great product, fast shipping!")
    {'sentiment': 'positive', 'confidence': 0.92, 'aspects': ['product', 'shipping']}

Tested: 2024-01-15
Success rate: 94% on validation set
"""
def analyze_sentiment(text, granularity='binary'):
    # Refined implementation
    pass
```

## How to use it

**Implementation phases:**

1. **Ad-hoc → Saved**

   - Agent writes code to solve immediate problem
   - If solution works, save to `skills/` directory
   - Use descriptive names: `skills/pdf_to_markdown.py`

2. **Saved → Reusable**

   - Refactor for generalization (parameterize hard-coded values)
   - Add basic error handling
   - Create simple function signature

3. **Reusable → Documented**

   - Add docstrings with purpose, parameters, returns, examples
   - Include any prerequisites or dependencies
   - Note when last tested or validated

4. **Documented → Capability**

   - Agent can discover skills through directory listing
   - Skills become part of agent's effective capability set
   - Skills are composed into higher-level workflows

**Skill organization:**

```
skills/
├── README.md                 # Index of available skills
├── data_processing/
│   ├── csv_to_json.py
│   └── filter_outliers.py
├── api_integration/
│   ├── github_pr_summary.py
│   └── slack_notify.py
├── text_analysis/
│   ├── sentiment.py
│   └── extract_entities.py
└── tests/
    └── test_sentiment.py     # Validation tests for skills
```

**Discovery pattern:**

```python
# Agent explores available skills
def discover_skills():
    """List available skills with descriptions."""
    skills = []
    for root, dirs, files in os.walk("skills/"):
        for file in files:
            if file.endswith(".py") and file != "__init__.py":
                path = os.path.join(root, file)
                # Extract docstring
                with open(path) as f:
                    content = f.read()
                    docstring = extract_docstring(content)
                skills.append({
                    'path': path,
                    'name': file[:-3],
                    'description': docstring.split('\n')[0] if docstring else ''
                })
    return skills
```

## Trade-offs

**Pros:**

- Builds agent capability over time
- Reduces redundant problem-solving across sessions
- Creates organizational knowledge base in code form
- Skills can be tested, versioned, and improved
- Enables composition of higher-level capabilities
- Reduces token consumption (reuse vs. rewrite)

**Cons:**

- Requires discipline to save and organize skills
- Skills can become stale or outdated
- Need maintenance and testing infrastructure
- Namespace conflicts if skills grow large
- Agents must be prompted to check skills before writing new code
- Quality varies (not all saved code is good code)

**Maintenance requirements:**

- Regular review of skill quality and relevance
- Testing framework for skill validation
- Deprecation policy for outdated skills
- Documentation standards for new skills
- Version control to track skill evolution

**Success factors:**

- Clear naming conventions
- Good documentation from the start
- Encourage skill reuse through prompting
- Periodic skill library review and curation
- Examples and test cases for each skill

## References

* Anthropic Engineering: Code Execution with MCP (2024)
* Related: Compounding Engineering Pattern
