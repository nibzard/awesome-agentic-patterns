---
title: Skill Library Evolution
status: established
authors:
  - Nikola Balic (@nibzard)
based_on:
  - Anthropic Engineering Team
  - Will Larson (Imprint)
  - Amp (Nicolay)
category: Learning & Adaptation
source: 'https://www.anthropic.com/engineering/code-execution-with-mcp'
tags:
  - code-reuse
  - skills
  - learning
  - capabilities
  - evolution
  - progressive-disclosure
  - on-demand-loading
  - mcp
  - lazy-loading
slug: skill-library-evolution
id: skill-library-evolution
summary: "Saves working agent code as reusable skills in a skills directory, documents and tests them over time, and loads skill details only on demand"
signals: ["Agents solve similar problems across sessions", "Agents rewrite the same code and waste tokens", "Many skills or MCP tools would bloat context if loaded up front"]
anti_signals: ["One-off tasks with no repeated problems", "No capacity to test, review, and deprecate saved skills"]
updated_at: '2026-10-13'
---

## Problem

Agents frequently solve similar problems across different sessions or workflows. Without a mechanism to preserve and reuse working code, agents must rediscover solutions each time, wasting tokens and time. Organizations want agents to build up capability over time rather than starting from scratch every session.

## Solution

Agents persist working code implementations as reusable functions in a `skills/` directory. Over time, these implementations evolve into well-documented, tested "skills" that become higher-level capabilities the agent can leverage.

**Skill types:**

- **Atomic skills**: Single-purpose functions (e.g., `analyze_sentiment`) that serve as building blocks
- **Composite skills**: Multi-step workflows that combine atomic skills into higher-level capabilities

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

**Progressive disclosure with on-demand loading (Imprint approach):**

Instead of loading all skills into context, inject skill descriptions into system prompt and provide a `load_skills` tool for full content:

```yaml
# skills/pdf-processing/SKILL.md
---
name: pdf-processing
description: Extract text and tables from PDF documents
metadata:
  author: example-org
  version: "1.0"
---
```

```python
# System prompt injection
AVAILABLE_SKILLS = """
Available skills (use load_skills tool to read full content):

- pdf-processing: Extract text and tables from PDF documents
- slack-formatting: Format messages for Slack with proper mrkdwn
- large-file-handling: Handle files exceeding context window
"""

# Tool for on-demand loading
def load_skills(skill_names):
    """Load full skill content into context."""
    for name in skill_names:
        path = f"skills/{name}/SKILL.md"
        # Read and inject full content
```

**Benefits of progressive disclosure:**
- Reduces conflicting or unnecessary context
- Minimizes formatting inconsistencies (e.g., Markdown vs Slack mrkdwn)
- In-context learning examples stay focused on relevant tools

**Lazy-loading MCP tools via skills (Amp approach):**

MCP servers often expose many tools that consume significant context, so bind MCP servers to skills with selective tool loading. In Amp's published example, a chrome-devtools MCP server dropped from 26 tools (~17k tokens) to 4 loaded tools (~1.5k tokens). For the general techniques of discovering and loading tools on demand, see [Progressive Tool Discovery](progressive-tool-discovery.md) and [Tool Search Lazy Loading](tool-search-lazy-loading.md); the skill-binding specifics are:

```json
// skills/chrome-automation/mcp.json
{
  "chrome-devtools": {
    "command": "npx",
    "args": ["-y", "chrome-devtools-mcp@latest"],
    "includeTools": [
      "navigate_page",
      "take_screenshot",
      "new_page",
      "list_pages"
    ]
  }
}
```

The agent sees only the skill description initially. When invoked, only the specified tools are loaded into context.

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

**Anti-patterns to avoid:**

| Anti-Pattern | Consequence | Correct Approach |
|--------------|-------------|------------------|
| **Hard-coded values** | Not reusable | Parameterize inputs |
| **No documentation** | Not discoverable | Add docstrings and examples |
| **Monolithic skills** | Not composable | Split into atomic units |
| **No testing** | Unreliable | Add validation tests |
| **Prompt bloat** | Context overflow | Progressive disclosure |

## References

* [Code execution with MCP: Building more efficient agents](https://www.anthropic.com/engineering/code-execution-with-mcp) - Anthropic Engineering (November 2025)
* [Building an internal agent: Adding support for Agent Skills](https://lethain.com/agents-skills/) - Will Larson (December 2025)
* [Efficient MCP Tool Loading](https://ampcode.com/news/lazy-load-mcp-with-skills) - Amp (January 2026)
* [Voyager: An Open-Ended Embodied Agent with Large Language Models](https://arxiv.org/abs/2305.16291) - Wang et al. (2023) - originated the skill-library concept ("an ever-growing skill library of executable code")
* [agentskills.io](https://agentskills.io) - the open Agent Skills specification (SKILL.md folders, progressive disclosure) that Imprint and others follow

Distinct from [Progressive Tool Discovery](progressive-tool-discovery.md) and [Tool Search Lazy Loading](tool-search-lazy-loading.md), which manage when tool definitions enter context, and from [Iterative Prompt & Skill Refinement](iterative-prompt-skill-refinement.md), which is the maintenance loop around prompts and skills: this pattern is about what a skill is and how the library grows. Related: Compounding Engineering Pattern, CLI-First Skill Design
