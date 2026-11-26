---
title: Skill Library Evolution
status: production
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
related: ["progressive-tool-discovery", "compounding-engineering-pattern", "dual-use-tool-design", "iterative-prompt-skill-refinement", "mcp-pattern-injection"]
updated_at: '2026-10-13'
---

## Problem

Agents frequently solve similar problems across different sessions or workflows. Without a mechanism to preserve and reuse working code, agents must rediscover solutions each time, which wastes tokens and time. Organizations want agents to build up capability over time rather than starting from scratch every session.

## Solution

Agents persist working code as reusable functions in a `skills/` directory. Over time, these implementations evolve into well-documented, tested "skills" that become higher-level capabilities the agent can use.

- **Atomic skills**: single-purpose functions (for example `analyze_sentiment`) that serve as building blocks
- **Composite skills**: multi-step workflows that combine atomic skills into higher-level capabilities

```mermaid
graph LR
    A[Ad-hoc Code] --> B[Save Working Solution]
    B --> C[Reusable Function]
    C --> D[Documented Skill]
    D --> E[Agent Capability]
```

**Save, then discover and reuse:**

```python
# Session 1: the agent writes code, confirms that it works, and saves it
with open("skills/analyze_sentiment.py", "w") as f:
    f.write(inspect.getsource(analyze_sentiment))

# Later session: the agent lists the skills directory, then imports what exists
os.listdir("skills/")                          # ['analyze_sentiment.py', 'extract_entities.py', ...]
from skills.analyze_sentiment import analyze_sentiment
result = analyze_sentiment("Customer feedback here...")
```

**Document each skill so that it stays discoverable:**

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
"""
def analyze_sentiment(text, granularity='binary'):
    ...
```

**Progressive disclosure with on-demand loading (Imprint approach):**

Do not load all skills into context. Inject skill descriptions into the system prompt and provide a `load_skills` tool for the full content. Each skill is a `SKILL.md` folder with a name and description in its front matter, following the open Agent Skills specification:

```yaml
# skills/pdf-processing/SKILL.md
---
name: pdf-processing
description: Extract text and tables from PDF documents
---
```

```python
AVAILABLE_SKILLS = """
Available skills (use load_skills tool to read full content):
- pdf-processing: Extract text and tables from PDF documents
- slack-formatting: Format messages for Slack with proper mrkdwn
- large-file-handling: Handle files exceeding context window
"""

def load_skills(skill_names):   # On-demand loading tool
    """Load full skill content into context."""
    for name in skill_names:
        read_and_inject(f"skills/{name}/SKILL.md")
```

Progressive disclosure reduces conflicting or unnecessary context, minimizes formatting inconsistencies (Markdown versus Slack mrkdwn), and keeps in-context learning examples focused on the relevant tools.

**Lazy-loading MCP tools through skills (Amp approach):**

MCP servers often expose many tools that consume significant context, so bind MCP servers to skills with selective tool loading. In Amp's published example, a chrome-devtools MCP server dropped from 26 tools (about 17k tokens) to 4 loaded tools (about 1.5k tokens). For the general techniques to discover and load tools on demand, see [Progressive Tool Discovery (Lazy Tool Loading)](progressive-tool-discovery.md). The skill-binding specifics:

```json
// skills/chrome-automation/mcp.json
{
  "chrome-devtools": {
    "command": "npx",
    "args": ["-y", "chrome-devtools-mcp@latest"],
    "includeTools": ["navigate_page", "take_screenshot", "new_page", "list_pages"]
  }
}
```

The agent sees only the skill description initially. When it invokes the skill, only the specified tools load into context.

## How to use it

**Implementation phases:**

1. **Ad-hoc to saved**: the agent writes code to solve the immediate problem. If the solution works, it saves the code to the `skills/` directory under a descriptive name (`skills/pdf_to_markdown.py`).
2. **Saved to reusable**: refactor for generalization (parameterize hard-coded values), add basic error handling, and settle the function signature.
3. **Reusable to documented**: add docstrings with purpose, parameters, returns, and examples. Include prerequisites and dependencies, and note when the skill was last tested or validated.
4. **Documented to capability**: the agent discovers skills through a directory listing, the skills become part of its effective capability set, and skills compose into higher-level workflows.

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
└── tests/
    └── test_sentiment.py     # Validation tests for skills
```

**Discovery:** list the skills directory and read the first docstring line of each file as its description. A skill without a docstring is not discoverable.

## Trade-offs

**Pros:**

- Builds agent capability over time, and reduces redundant problem-solving and token consumption across sessions
- Creates an organizational knowledge base in code form
- Skills can be tested, versioned, and improved
- Enables composition of higher-level capabilities

**Cons:**

- Requires the discipline to save and organize skills
- Skills can become stale or outdated
- Needs maintenance and testing infrastructure
- Agents must be prompted to check skills before they write new code
- Quality varies: not all saved code is good code

**Anti-patterns to avoid:**

| Anti-Pattern | Consequence | Correct Approach |
|--------------|-------------|------------------|
| **Hard-coded values** | Not reusable | Parameterize inputs |
| **No documentation** | Not discoverable | Add docstrings and examples |
| **Monolithic skills** | Not composable | Split into atomic units |
| **No testing** | Unreliable | Add validation tests |
| **Prompt bloat** | Context overflow | Progressive disclosure |

**Failure modes / gotchas:**

- **Namespace conflicts:** a large library collects colliding skill names. Use clear naming conventions from the start.
- **Stale skills:** saved code goes out of date as its dependencies change. Review skill quality and relevance on a schedule, with a deprecation policy for outdated skills.
- **Silent regressions:** a skill without a test can break without notice. Give each skill an example and a test case.

**Maintenance and curation:** document from the start, prompt agents to check the library before they write new code, review and curate the library on a periodic schedule, keep documentation standards for new skills, and use version control to track skill evolution.

## References

* [Code execution with MCP: Building more efficient agents](https://www.anthropic.com/engineering/code-execution-with-mcp) - Anthropic Engineering (November 2025)
* [Building an internal agent: Adding support for Agent Skills](https://lethain.com/agents-skills/) - Will Larson (December 2025)
* [Efficient MCP Tool Loading](https://ampcode.com/news/lazy-load-mcp-with-skills) - Amp (January 2026)
* [Voyager: An Open-Ended Embodied Agent with Large Language Models](https://arxiv.org/abs/2305.16291) - Wang et al. (2023) - originated the skill-library concept ("an ever-growing skill library of executable code")
* [agentskills.io](https://agentskills.io) - the open Agent Skills specification (`SKILL.md` folders, progressive disclosure) that Imprint and others follow

Distinct from [Progressive Tool Discovery (Lazy Tool Loading)](progressive-tool-discovery.md), which manages when tool definitions enter context, and from [Iterative Prompt & Skill Refinement](iterative-prompt-skill-refinement.md), which is the maintenance loop around prompts and skills: this pattern is about what a skill is and how the library grows. Related: [Compounding Engineering Pattern](compounding-engineering-pattern.md), [Dual-Use Tool Design](dual-use-tool-design.md).
