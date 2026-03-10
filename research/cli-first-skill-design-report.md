# CLI-First Skill Design Pattern - Research Report

**Pattern**: `cli-first-skill-design`
**Research Started**: 2026-02-27
**Status**: Completed

## Executive Summary

CLI-First Skill Design is a pattern where agent skills are designed as CLI tools first, making them naturally dual-use for both humans and AI agents. This research synthesized findings from four parallel tracks: academic foundations, real-world implementations, tooling frameworks, and related patterns.

**Key Findings:**
- The pattern builds on 50+ years of Unix philosophy and POSIX standards
- Production examples abound: GitHub CLI, kubectl, AWS CLI, Terraform, and the Claude Code skills ecosystem
- No major CLI framework provides built-in JSON output switching—all require manual implementation
- Strong relationships to 11 related patterns, especially Dual-Use Tool Design and Intelligent Bash Tool Execution
- The pattern represents a convergence of traditional CLI wisdom with modern AI agent needs

## Pattern Overview

CLI-First Skill Design is a pattern where agent skills (reusable capabilities) are designed as CLI tools first, making them naturally dual-use: humans can invoke them from terminals, and agents can invoke them via shell commands.

**Core Principles:**
1. **One script, one skill** - Each capability is a standalone executable
2. **Subcommands for operations** - `skill.sh list`, `skill.sh get <id>`, `skill.sh create`
3. **Structured output** - JSON for programmatic use, human-readable for TTY
4. **Exit codes** - 0 for success, non-zero for errors (enables `&&` chaining)
5. **Environment config** - Credentials via env vars, not hardcoded

---

## Research Track 1: Academic & Technical Foundations

### Unix Philosophy Origins

The CLI-first pattern directly applies Doug McIlroy's three foundational rules:

1. **"Write programs that do one thing and do it well"** - Each skill has a single purpose
2. **"Write programs to work together"** - Skills compose via pipes and chaining
3. **"Write programs to handle text streams, because that is a universal interface"** - stdin/stdout as the lingua franca

### Eric S. Raymond's 17 Unix Design Rules (Relevant Subset)

| Rule | Relevance to Agent Skills |
|------|---------------------------|
| **Modularity** | Skills should be single-purpose, composable units |
| **Clarity** | Clear skill interfaces for both humans and agents |
| **Composition** | Skills designed for chaining/pipelining |
| **Separation** | Logic separate from interface |
| **Simplicity** | Avoid over-engineering skills |
| **Transparency** | Observable skill execution |
| **Robustness** | Simple, transparent skills are more robust |
| **Least Surprise** | Predictable skill behavior |
| **Silence** | Only output meaningful results |
| **Repair** | Fail noisily and as soon as possible (exit codes) |

### POSIX Standards and Conventions

**Standard Command Structure:**
1. Command name (executable)
2. Subcommands (optional)
3. Options (short `-v` and long `--verbose` forms)
4. Arguments (operands)

**Exit Code Conventions:**

| Exit Code | Meaning | Agent Skill Relevance |
|-----------|---------|----------------------|
| **0** | Success | Agent knows skill succeeded |
| **1** | General error | Non-specific failure |
| **2** | Incorrect usage | Agent called skill incorrectly |
| **126** | Command found but not executable | Permission/configuration issue |
| **127** | Command not found | Skill not available |
| **128 + N** | Terminated by signal N | Interrupted operation |

### 2026 AI-Native CLI Principles

**"CLI as SDK for Agents":**

1. **`--help` as System Prompt** - Semantic parameter descriptions, 2-6 high-quality examples
2. **Default Non-interactive** - Avoid "Are you sure? (y/n)" prompts; provide `--yes` or `--force` flags
3. **Machine-readable Output** - `--json` is the foundation of stability

### TTY Detection for Dual Output Modes

**Pattern:**
- Detect if stdout is connected to a terminal (TTY)
- When `is_tty == true`: Friendly, colorful, formatted output
- When `is_tty == false`: Structured output suitable for parsing

**Implementation Examples:**
```python
# Python
if sys.stdout.isatty():
    click.secho("Running in terminal", fg="green")
else:
    click.echo("Piped output")
```

```rust
// Rust with atty
use atty::Stream;
let is_tty = atty::is(atty::Stream::Stdout);
```

```javascript
// Node.js
if (process.stdout.isTTY) {
    console.log("\x1b[32mRunning in terminal\x1b[0m");
}
```

### Shell Composition Patterns

**Core Composition Tools:**

| Tool | Purpose | Example |
|------|---------|---------|
| **Pipe (|)** | Pass stdout to stdin | `cat file.txt \| grep "word" \| sort` |
| **xargs** | Convert stdin to command arguments | `find . -name "*.txt" \| xargs cat` |
| **tee** | Split output to terminal AND file | `ps aux \| grep nginx \| tee log.txt` |
| **jq** | JSON processing | `curl api/data \| jq '.name'` |

---

## Research Track 2: Real-World Implementations

### Claude Code Skills Ecosystem

**Official Repository:** [anthropics/skills](https://github.com/anthropics/skills) (45.9k stars)

**Standard Directory Structure:**
```
skill-name/
├── SKILL.md          # Required (core instruction file)
├── scripts/          # Optional (executable code)
├── references/       # Optional (reference docs)
└── assets/           # Optional (templates, resources)
```

**SKILL.md Format:**
```yaml
---
name: skill-name
description: Description of what this skill does
license: Apache-2.0
metadata:
  author: example-org
  version: "1.0"
---
# Markdown instructions follow
```

**Popular Community Collections:**
- [obra/superpowers](https://github.com/obra/superpowers) (22.1k stars) - 20+ practical skills
- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) (19.2k stars)
- [JackyST0/awesome-agent-skills](https://github.com/JackyST0/awesome-agent-skills) - Multi-platform

### GitHub CLI (gh) - Dual-Use Design Exemplar

**JSON Output for Automation:**
```bash
# List public repos with jq filtering
gh repo list --json nameWithOwner,isPrivate,updatedAt \
  --jq '.[] | select(.isPrivate == false) | .nameWithOwner'

# Export PR data to JSON
gh pr list --state open --json number,title,author,createdAt > prs.json
```

**GitHub Actions Integration:**
```yaml
- name: Auto-label PR
  run: |
    gh pr edit ${{ github.event.pull_request.number }} \
      --add-label "needs-review"
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Infrastructure CLIs - Automation Patterns

**kubectl (Kubernetes):**
```bash
# JSON output for automation
kubectl get pods -o json

# JSONPath for specific fields
kubectl get pods -o=jsonpath='{.items[*].metadata.name}'

# Extract with jq
kubectl get pods -o json | jq '.items[] | select(.status.phase == "Running") | .metadata.name'
```

**AWS CLI:**
```bash
# JSON output with jq pipeline
aws ec2 describe-instances --output json | \
  jq '.Reservations[].Instances[] | select(.State.Name == "running") | .InstanceId'

# DynamoDB export/import
aws dynamodb scan --table-name my-prod-table | \
  jq '{"my-local-table": [.Items[] | {PutRequest: {Item: .}}]}' > data.json
```

**Terraform CLI:**
```bash
# Output all values as JSON
terraform output -json

# Convert plan to JSON
terraform plan -out=tfplan
terraform show -json tfplan > plan.json

# Parse with jq
PUBLIC_IP=$(terraform output -json instance_info | jq -r '.public_ip')
```

### Shell Composition in Production

**Log Analysis:**
```bash
# Error counting and ranking
cat log.txt | grep "ERROR" | sort | uniq -c | sort -nr
```

**curl + jq Pattern:**
```bash
# Pretty print JSON for human reading
curl http://api.example.com/data | jq '.'

# Extract specific fields for automation
curl http://api.example.com/data | jq '.name'

# Filter and transform data
curl http://api.example.com/users | \
  jq '.[] | select(.age > 30) | {name, age}'
```

---

## Research Track 3: Tooling & Frameworks

### CLI Frameworks Comparative Analysis

**Key Finding:** None of the major frameworks provide built-in JSON output switching—all require manual implementation.

| Framework | Language | JSON Support | TTY Detection | Subcommands |
|-----------|----------|--------------|---------------|-------------|
| Click | Python | Manual | `sys.stdout.isatty()` | Groups |
| Typer | Python | Manual | `sys.stdout.isatty()` | Automatic |
| argparse | Python | Manual | `sys.stdout.isatty()` | Manual |
| Commander.js | Node.js | Manual | `process.stdout.isTTY` | Declarative |
| oclif | Node.js | Manual | `process.stdout.isTTY` | File-based |
| yargs | Node.js | Manual | `process.stdout.isTTY` | Complex |
| clap | Rust | Manual (serde) | `atty` crate | Enum-based |
| Cobra | Go | Manual | `terminal.IsTerminal()` | File-based |

### JSON Output Implementation Patterns

**Python (Click):**
```python
import click
import json

@click.command()
@click.option('--json', 'output_json', is_flag=True)
def main(output_json):
    data = {"status": "success", "value": 42}
    if output_json:
        click.echo(json.dumps(data))
    else:
        click.echo(f"Status: {data['status']}, Value: {data['value']}")
```

**Node.js (Commander.js):**
```typescript
import { Command } from 'commander';

const program = new Command();
program
  .option('--json', 'output as JSON')
  .action((options) => {
    const data = { status: 'ok', value: 42 };
    if (options.json) {
      console.log(JSON.stringify(data));
    } else {
      console.log(`Status: ${data.status}, Value: ${data.value}`);
    }
  });
```

**Rust (clap + serde):**
```rust
use clap::Parser;
use serde::Serialize;

#[derive(Parser)]
struct Cli {
    #[arg(long, action)]
    json: bool,
}

fn main() {
    let cli = Cli::parse();
    let data = Output { status: "ok".to_string(), value: 42 };
    if cli.json {
        println!("{}", serde_json::to_string(&data).unwrap());
    } else {
        println!("Status: {}, Value: {}", data.status, data.value);
    }
}
```

### Exit Code Best Practices

| Framework | Recommended Pattern |
|-----------|---------------------|
| Click | `sys.exit()` with IntEnum |
| Typer | `raise typer.Exit(code)` |
| argparse | `sys.exit()` |
| Commander.js | `process.exit(code)` |
| clap | `std::process::exit()` |
| Cobra | Automatic from command return |

**Python Exit Code Enum:**
```python
import sys
import enum

class ExitCodes(enum.IntEnum):
    OK = 0
    ERROR = 1
    BAD_PARAMS = 2
    API_ERROR = 3

try:
    # skill logic
    pass
except Exception as e:
    click.secho(str(e), fg="red", err=True)
    sys.exit(ExitCodes.ERROR)
```

### Testing Frameworks for CLI Tools

| Framework | Language | Style |
|-----------|----------|-------|
| Bats | Bash | TAP output |
| shunit2 | Shell | JUnit-like |
| assert.sh | Shell | Lightweight |
| ShellCheck | Static | Bash/sh analysis |

**Bats Example:**
```bash
#!/usr/bin/env bats

@test "Installation script rejects empty prefix argument" {
  run ./install.sh
  [ "$status" -eq 1 ]
  [[ "$output" == *"usage: $0 <prefix>"* ]]
}

@test "List command returns valid JSON" {
  run ./skill.sh list
  [ "$status" -eq 0 ]
  echo "$output" | jq . >/dev/null  # Validates JSON
}
```

### Agent Skill Scaffolding Tools (2026)

**skills.sh CLI:**
```bash
npx skills add vercel-labs/agent-skills
npx skills find [query]
npx skills list
```

**Skill Structure Standard:**
```
my_skill/
├── SKILL.md           # Core instructions (required)
├── docs/              # Additional documentation
└── scripts/           # Executable code (.py, .sh, etc.)
```

### Recommendations by Language

**For Python Skills:**
- Use Typer for quick development with type annotations
- Use Click for complex CLIs requiring custom behavior
- Integrate Rich for enhanced terminal output
- Always implement `--json` flag
- Use IntEnum for exit codes

**For Node.js/TypeScript Skills:**
- Use Commander.js for most use cases (90% of projects)
- Use oclif for enterprise-scale CLIs with plugins

**For Rust Skills:**
- Use clap v4+ with derive macros
- Use atty crate for TTY detection
- Use serde_json for JSON serialization

**For Go Skills:**
- Use Cobra for Kubernetes-style CLIs
- Use Viper for configuration management

---

## Research Track 4: Related Patterns

### Pattern Relationships Map

**Directly Related (Tool Use & Environment Category):**

1. **Dual-Use Tool Design** (best-practice)
   - *Relationship:* **Complements** - CLI-first is a specific implementation approach within broader dual-use design philosophy
   - *Shared principle:* "Everything you can do, Claude can do"

2. **Code-First Tool Interface Pattern** (established)
   - *Relationship:* **Alternative approach** - Uses TypeScript/JavaScript interfaces and V8 isolates instead of shell commands

3. **Intelligent Bash Tool Execution** (validated-in-production)
   - *Relationship:* **Implementation foundation** - Provides secure execution layer for CLI-first skills

4. **Agent-First Tooling and Logging** (emerging)
   - *Relationship:* **Design philosophy alignment** - Machine-readable output over human-centric design

5. **CLI-Native Agent Orchestration** (proposed)
   - *Relationship:* **Ecosystem extension** - Extends CLI-first concepts to entire agent workflows

**Patterns CLI-First Builds Upon:**

6. **Parallel Tool Execution** (validated-in-production)
   - *Relationship:* **Orchestration foundation** - Enables efficient composition of CLI-first skills

7. **Plan-Then-Execute Pattern** (emerging)
   - *Relationship:* **Safety framework** - CLI-first skills can be composed within plan-then-execute workflows

8. **Action-Selector Pattern** (emerging)
   - *Relationship:* **Security enhancement** - Maps natural language to pre-approved CLI commands

**Patterns That Could Use CLI-First Skills:**

9. **Code-Then-Execute Pattern** (emerging)
   - *Relationship:* **Execution model** - CLI-first skills serve as building blocks within code-then-execute workflows

10. **Tool Capability Compartmentalization** (emerging)
    - *Relationship:* **Security framework** - CLI-first skills can be categorized into capability classes

### Ecosystem Insights

**Progression Trends:**
- Individual tool design (Dual-Use, CLI-First)
- Tool orchestration (Parallel Execution)
- Higher-level control patterns (Plan-Then-Execute, Action-Selector)

**Security as Cross-Cutting Concern:**
- Execution safety (Intelligent Bash Execution)
- Control-flow integrity (Action-Selector, Plan-Then-Execute)
- Capability segregation (Tool Capability Compartmentalization)

**CLI-First Uniqueness:**
- Focus on executable scripts as the interface
- Contrasts with API-based approaches (Code-First Tool Interface)
- Contrasts with generated code approaches (Code-Then-Execute)

---

## Synthesis and Analysis

### What Makes CLI-First Work for Agents

1. **Universality** - Every system has a shell; no runtime dependencies
2. **Composability** - Unix pipes enable unlimited combinations
3. **Debuggability** - Run manually to test, inspect output
4. **Transparency** - Agent's tool calls are visible shell commands
5. **Testability** - Easy to write integration tests with Bats/shunit2

### Limitations and Trade-offs

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Shell limitations | Complex data structures awkward | Use JSON + jq |
| Error handling | Less structured than exceptions | Exit codes + stderr |
| Performance | Process spawn overhead | Accept for <100/sec |
| State management | No persistent state between invocations | Design stateless |
| Windows compatibility | Requires WSL or Git Bash | Document requirement |

### Anti-Patterns to Avoid

1. **Interactive prompts** - Breaks automation; always provide `--yes`/`--force` flags
2. **Non-standard output** - Always provide `--json` option for machine parsing
3. **Ignoring exit codes** - Agents use exit codes to determine success/failure
4. **Hardcoded credentials** - Use environment variables or config files
5. **Overly complex output** - Keep TTY output simple; JSON for complex data

### When NOT to Use CLI-First

- High-frequency calls (>100/sec): Use in-process functions
- Complex object graphs: Use structured API
- Real-time streaming: Use WebSocket/SSE
- Binary data transfer: Use file-based protocols

---

## Sources

### Academic & Technical
- POSIX Standards Documentation - Oracle getoptcvt Documentation
- GNU Coding Standards - Command-Line Interfaces
- The Art of Unix Programming - Eric S. Raymond (2003)
- IEEE Std 1003.1-2001 - POSIX Utility Syntax Guidelines

### Real-World Implementations
- [anthropics/skills](https://github.com/anthropics/skills) - Official Anthropic Skills Repository
- [obra/superpowers](https://github.com/obra/superpowers) - Community Skills Collection
- [cli/cli](https://github.com/cli/cli) - Official GitHub CLI Repository
- Kubernetes Documentation - kubectl Usage Conventions
- AWS CLI Output Format Documentation
- Terraform CLI Documentation

### Frameworks & Tooling
- [CLI Development Guide 2026 - Python](https://zenn.dev/gaku1234/articles/cli-automation-guide-2026-introduction)
- [clap Tutorial](https://docs.rs/clap/latest/clap/_tutorial/index.html)
- [Commander.js GitHub](https://github.com/tj/commander.js)
- [Cobra CLI Framework](https://github.com/spf13/cobra)
- [Bats Testing Framework](https://github.com/bats-core/bats-core)

### Design Principles
- ThoughtWorks CLI Design Guidelines
- Atlassian CLI Design Principles
- Rust CLI Development - clap and cargo subcommands guides
- Python CLI Frameworks - Click design documentation

### Related Patterns
- Awesome Agentic Patterns repository - patterns/ directory
- [Agent Skills Specification](https://github.com/modelcontextprotocol/skills)

---

## Conclusion

CLI-First Skill Design represents a practical, Unix-inspired approach to building agent capabilities that leverages decades of CLI tool design wisdom while addressing the unique requirements of AI-human collaboration.

The pattern's strength lies in its simplicity and universality—by following Unix philosophy and POSIX conventions, developers can create skills that are:
- Immediately useful to both humans and agents
- Composable through standard shell mechanisms
- Debuggable without special tooling
- Testable with established frameworks

As the AI agent ecosystem matures, CLI-first design serves as a bridge between traditional software engineering practices and emerging agent architectures, enabling gradual adoption without requiring entirely new paradigms.

---

**Research Completed:** 2026-02-27
**Research Method:** 4 parallel agents investigating distinct tracks
**Total Sources Analyzed:** 25+ documentation sources, repositories, and technical papers
