# Code-Then-Execute Pattern Research Report

**Pattern ID:** code-then-execute-pattern
**Run ID:** 20260227-121204-2888537-code-then-execute-pattern
**Started:** 2026-02-27
**Status:** Completed

---

## Executive Summary

The **Code-Then-Execute Pattern** (also called **code-over-api**, **code-first tool interface**, or **code-as-tool**) represents a fundamental shift in how AI agents interact with tools. Instead of making direct tool calls that send all intermediate data through the model's context window, agents write code that executes in a sandboxed environment where tool calls happen locally.

**Key Finding:** Token reductions of **75-99.95%** are documented in production systems using this pattern, with major implementations from Anthropic, Cloudflare, Cognition/Devon, and Ramp.

---

## Core Definition

The Code-Then-Execute Pattern is defined by two primary formulations:

### Security-Focused Definition (Academic)
From Beurer-Kellner et al. (2025) - DeepMind CaMeL:
1. **LLM outputs sandboxed program/DSL script** instead of direct tool calls
2. **Static checker/Taint engine verifies data flows** before execution (e.g., preventing tainted variables from flowing to dangerous sinks like `send_email.recipient`)
3. **Interpreter runs code in a locked sandbox**

The key innovation is shifting from "reasoning about actions" to "compiling actions" into an inspectable artifact that can be formally verified.

### Industry Definition (Token-Optimization)
From Anthropic and Cloudflare:
- Agents write Python/TypeScript code that executes in a sandboxed environment
- Tool calls happen within execution context, not through LLM special tokens
- Only condensed results return to LLM context
- Dramatically reduces token usage for data-heavy workflows

---

## Key Architectural Components

### 1. Code Generation Phase
- LLM generates code (Python, TypeScript, DSL script)
- Code includes tool calls and data processing logic
- LLM receives complete API documentation/generated interfaces
- LLMs are "better at writing code to call tools, than at calling tools directly" (Cloudflare)

### 2. Static Analysis Phase (Security-Focused Implementations)
- Taint analysis for sensitive data flows
- Policy enforcement before execution
- Formal verification of security rules
- DSL-based agent control

### 3. Execution Environment

Multiple sandbox technologies with different trade-offs:

| Technology | Startup Time | Memory | Isolation | Best For |
|------------|--------------|--------|-----------|----------|
| **V8 Isolates** | Milliseconds | Few MB | Strong | Edge deployment, sub-second response |
| **Containers** | 2-5 seconds | Hundreds MB | Process-level | Full language flexibility |
| **VMs** | 10-60 seconds | 1GB+ | Hardware-level | Complete isolation, destructive ops |
| **WebAssembly** | Sub-millisecond | Minimal | Memory-safe | Emerging use cases |

### 4. Tool/Bindings Access
- **Bindings-Based Access**: TypeScript interfaces generated from MCP schemas
- **RPC Flow**: Sandboxed Code → TypeScript API Call → RPC to Agent Loop → MCP Server → External API
- **Credential Isolation**: API keys stay in persistent MCP servers, never in sandbox

---

## Real-World Implementations

### 1. Anthropic - Code-Over-API Pattern
- **Status:** Production (2024)
- **Source:** https://www.anthropic.com/engineering/code-execution-with-mcp
- **Technology:** Python/TypeScript sandboxes with MCP integration
- **Results:** Processing 10,000 spreadsheet rows: **150,000 tokens → ~2,000 tokens (98.7% reduction)**

### 2. Cloudflare - Code Mode
- **Status:** Closed Beta (Production 2025)
- **Source:** https://blog.cloudflare.com/code-mode/
- **Technology:** V8 isolates, TypeScript API transformation
- **Results:** Cloudflare API (2,500 endpoints): **2,000,000 tokens → 1,000 tokens (99.95% reduction)**

### 3. Cognition/Devon - Isolated VM per RL Rollout
- **Status:** Production (RL training infrastructure)
- **Source:** https://youtu.be/1s_7RMG4O4U
- **Technology:** Modal-based full VM isolation
- **Results:** File planning: **8-10 tool calls → 4 tool calls (50% reduction + quality improvement)**

### 4. Ramp - Custom Sandboxed Background Agent
- **Status:** Production (Inspect Agent)
- **Source:** https://engineering.ramp.com/post/why-we-built-our-background-agent
- **Technology:** Modal containers, WebSocket streaming
- **Features:** Real-time progress, model-agnostic

### 5. OpenAI/DeepMind - Code-Then-Execute (CaMeL)
- **Status:** Research/Production adoption
- **Source:** https://arxiv.org/abs/2506.08837
- **Focus:** Formal verification, taint tracking, audit logs
- **Authors:** Luca Beurer-Kellner et al. (2025)

### 6. Clawdbot - Open Source
- **Status:** Validated in Production
- **Source:** https://github.com/clawdbot/clawdbot
- **Features:** Multi-mode bash execution, PTY support, platform-aware

---

## Common Use Cases

### Data Analysis and Processing
- Spreadsheet processing (filtering, transforming, aggregating large datasets)
- Database operations with post-processing
- Log analysis at scale
- Data visualization generation

### Infrastructure and DevOps
- Infrastructure provisioning (multi-step cloud resource creation)
- CI/CD automation (build, test, deployment workflows)
- Configuration management (multi-file updates)

### Software Development
- Code refactoring (multi-file transformations)
- Testing and validation
- Code generation and execution

### Scientific Computing
- Numerical computing with pandas/numpy
- Simulation and modeling
- Statistical analysis

### Web Scraping and Automation
- Batch processing multiple URLs
- Data extraction and transformation
- API choreography

---

## Benefits and Trade-offs

### Benefits
| Benefit | Impact |
|---------|--------|
| **Token Reduction** | 75-99.95% reduction in API costs |
| **Security** | Formal verification, taint tracking, auditability |
| **Performance** | Parallel execution, reduced latency |
| **Quality** | Self-debugging, iterative refinement (CaMeL) |
| **Cost** | Lower API + infrastructure costs |

### Trade-offs
| Trade-off | Consideration |
|-----------|---------------|
| **Infrastructure Complexity** | Requires sandboxed execution environment |
| **Code Quality Dependency** | Agents must write correct code |
| **Startup Overhead** | Container/VM provisioning adds latency |
| **Debugging Difficulty** | Errors in execution, not LLM context |

### Anti-Patterns (When NOT to Use)
1. **Open-ended research loops** - Dynamic exploration where next steps are unpredictable
2. **Simple single calls** - One-off tool usage doesn't benefit from orchestration
3. **Rapid prototyping** - Traditional MCP is faster to implement
4. **Intelligence required mid-execution** - LLM calls needed inside loops

---

## Security Considerations

### Essential Security Measures
- **Default-deny network egress** (or no network access)
- **CPU and memory limits** enforced
- **Execution timeouts** configured
- **Credentials never passed** to sandbox
- **Read-only root filesystem**
- **All capabilities dropped**
- **User namespaces enabled**
- **Seccomp profiles applied**

### Credential Management
- Keep credentials in persistent MCP servers
- Never pass secrets to ephemeral code execution
- Use short-lived tokens with minimal scope

### Taint Analysis (CaMeL)
- Static analysis verifies data flows
- Tracks sensitive data through generated code
- Prevents tainted data from reaching dangerous sinks

---

## Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Code-Over-API** | Similar concept; different focus (token optimization vs. security) |
| **Sandboxed Tool Authorization** | Provides policy framework for tool access |
| **Deterministic Security Scanning Build Loop** | Integrates security scanning before execution |
| **PII Tokenization** | Works alongside for sensitive data protection |
| **Egress Lockdown** | Security foundation for sandbox environments |

---

## Open Source Frameworks and Libraries

| Framework | Tool | License | Notes |
|-----------|------|---------|-------|
| **Modal** | Serverless containers | Commercial | Used by Cognition/Devon, Ramp |
| **Deno** | Secure JS/TS runtime | MIT | Permission-based security |
| **isolated-vm** | V8 isolates | MIT | Node.js native module |
| **LangChain.js** | DynamicTool, PythonREPL | MIT | Code execution tools |
| **Vercel AI SDK** | Tool Calling | Apache 2.0 | TypeScript-first |
| **MCP** | Code Execution Servers | MIT | Open protocol for AI tools |

---

## Implementation Guidance

### Core Flow
1. LLM generates code using provided TypeScript/Python APIs
2. Code runs in isolated environment (V8 isolate, container, or VM)
3. Bindings provide controlled access to tools
4. Only condensed results return to LLM context

### Error Handling Patterns
- Graceful PTY fallback when module unavailable
- Double-kill (SIGTERM → SIGKILL) for timeouts
- Infrastructure error handling that returns retryable errors

### Resource Limiting Example
```javascript
const isolate = new ivm.Isolate({ memoryLimit: 128 }); // 128 MB
result = subprocess.run(command, timeout=60)  // 60 second max
```

---

## Pattern Metadata

- **Status:** emerging
- **Category:** Tool Use & Environment
- **Tags:** dsl, sandbox, program-synthesis, auditability
- **Based On:** DeepMind CaMeL, Luca Beurer-Kellner et al. (2025)
- **Primary Source:** https://arxiv.org/abs/2506.08837

---

## References

### Academic Sources
1. [Beurer-Kellner et al. (2025) - Comprehensive framework for secure LLM agent execution](https://arxiv.org/abs/2506.08837)
2. [Debenedetti et al. (2025) - CaMeL: Code-Augmented Language Model for Tool Use](https://arxiv.org/abs/2506.08837)

### Industry Sources
3. [Anthropic Engineering: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)
4. [Cloudflare Code Mode Blog Post](https://blog.cloudflare.com/code-mode/)
5. [OpenAI Build Hour: Agent RFT - Cognition Case Study](https://youtu.be/1s_7RMG4O4U)
6. [Why We Built Our Own Background Agent - Ramp Engineering](https://engineering.ramp.com/post/why-we-built-our-background-agent)

### Open Source Implementations
7. [Clawdbot](https://github.com/clawdbot/clawdbot) - Production agent with intelligent bash execution
8. [isolated-vm](https://github.com/laverdet/isolated-vm) - Secure V8 isolates
9. [Model Context Protocol](https://modelcontextprotocol.io/) - Open protocol for tool communication
10. [Modal Documentation](https://modal.com/docs) - Serverless container infrastructure

### Pattern Sources
11. [Code-Then-Execute Pattern](https://github.com/anthropics/awesome-agentic-patterns/blob/main/patterns/code-then-execute-pattern.md)
12. [Code-Over-API Pattern](https://github.com/anthropics/awesome-agentic-patterns/blob/main/patterns/code-over-api-pattern.md)
13. [Code Mode MCP Tool Interface Pattern](https://github.com/anthropics/awesome-agentic-patterns/blob/main/patterns/code-first-tool-interface-pattern.md)

---

## Conclusion

The Code-Then-Execute pattern has moved from research to production with documented token savings of 75-99.95% in real-world deployments. The pattern serves two distinct but complementary purposes:

1. **Security & Verifiability** (Academic focus): Formal verification, taint tracking, auditability
2. **Token Optimization** (Industry focus): Dramatic cost reduction through local execution

Major companies including Anthropic, Cloudflare, Cognition/Devon, and Ramp have implemented variations of this pattern. The pattern is particularly effective for data-heavy workflows, multi-step API choreography, fan-out scenarios, and cost-sensitive applications.

Key success factors include proper sandboxing, resource limiting, and binding-based security. The pattern complements rather than replaces traditional tool calling, with selection depending on workflow characteristics and cost sensitivity.
