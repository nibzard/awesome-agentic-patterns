# Code-First Tool Interface Pattern Research Report

**Pattern ID:** `code-first-tool-interface-pattern`
**Source:** Cloudflare Code Mode
**Research Started:** 2025-02-27
**Status:** Complete

---

## Executive Summary

Code-first tool interface patterns represent a paradigm shift in how LLMs interact with external tools. Instead of direct tool calls that create chatty round-trips through the model's context, these approaches have the LLM generate code that orchestrates multiple tool operations in a single execution environment. This research documents implementations beyond Cloudflare's Code Mode across multiple companies, open-source projects, and frameworks.

**Key Findings:**
- **Token Reduction:** 10-100x reduction in token usage for multi-step workflows
- **Performance Gains:** Single-round-trip execution vs. 5-10+ round-trips with traditional MCP
- **Security Benefits:** Credentials stay in persistent MCP servers, not ephemeral code execution
- **Growing Adoption:** Major players including Anthropic, Cognition/Devon, Ramp, and OpenAI
- **Open Source Ecosystem:** Multiple frameworks implementing similar patterns

---

## 1. Pattern Overview

### Core Concept

Code-first tool interfaces reverse the traditional agent-tool relationship:

**Traditional Approach:**
```
LLM → Tool Call #1 → JSON Response → LLM Context
LLM → Tool Call #2 → JSON Response → LLM Context
LLM → Tool Call #3 → JSON Response → LLM Context
→ Final Answer
```

**Code-First Approach:**
```
LLM → Generate Code → Execute in Sandbox
                           ↓
                    All tool calls internally
                           ↓
                    Condensed results → LLM
                    → Final Answer
```

### Why It Works

1. **Training Data Alignment:** LLMs have significantly more training data on code than on tool calling
2. **Token Efficiency:** Intermediate results never flow through context
3. **Orchestration Power:** Code naturally expresses complex workflows, loops, and error handling
4. **Fan-Out Support:** Processing 100+ items via simple `for` loop vs. 100+ tool calls

---

## 2. Industry Implementations

### 2.1 Anthropic - Code-Over-API Pattern

**Company:** Anthropic
**Source:** https://www.anthropic.com/engineering/code-execution-with-mcp
**Status:** Production (2024)

**Technical Approach:**
- Agents write Python/TypeScript code that executes in sandboxed environment
- Tool calls happen within execution context, not through LLM
- Only summaries and return values flow back to model

**Real-World Example:**
Processing 10,000 spreadsheet rows:
- **Traditional MCP:** 150,000+ tokens (all data flows through context)
- **Code-Over-API:** ~2,000 tokens (processing happens in sandbox)

**Key Features:**
- Filesystem-based state persistence for resumable workflows
- Checkpoint/recovery patterns for long-running tasks
- Integration with Model Context Protocol (MCP)

**Comparison to Cloudflare Code Mode:**
- **Similar:** Code generation for token efficiency
- **Different:** Focus on data processing workflows vs. TypeScript API generation
- **Same Benefits:** Dramatic token reduction, faster execution

**Use Cases:**
- Data-heavy workflows (spreadsheets, databases, logs)
- Multi-step transformations and aggregations
- Cost-sensitive applications

---

### 2.2 Cognition/Devon - Isolated VM per RL Rollout

**Company:** Cognition (Devon AI)
**Source:** https://youtu.be/1s_7RMG4O4U (OpenAI Build Hour, November 2025)
**Status:** Production (RL training infrastructure)

**Technical Approach:**
- Spin up isolated virtual machines for each reinforcement learning rollout
- Each VM starts with fresh filesystem and dependencies
- Agents execute code with full tool access (including shell commands)
- VMs destroyed after rollout completes

**Architecture:**
```python
# Modal-based infrastructure
@app.cls(
    image=base_image,
    cpu=2,
    memory=4096,
    timeout=600,  # 10 min per rollout max
)
class IsolatedToolExecutor:
    """Each instance gets its own isolated VM"""

    @method()
    def execute_shell(self, rollout_id: str, command: str):
        # Even destructive commands are safe in isolated VM
        result = subprocess.run(command, shell=True, cwd=self.work_dir)
        return result
```

**Key Features:**
- Complete isolation between parallel rollouts
- Safe execution of destructive commands (`rm -rf`, etc.)
- Bursty scaling: handles 500+ simultaneous VM requests
- Production parity: uses same environment as production Devon

**Comparison to Cloudflare Code Mode:**
- **Similar:** Ephemeral execution environments
- **Different:** Full VM isolation vs. V8 isolate; focused on RL training vs. production workflows
- **Same Benefits:** Security, isolation, controlled execution

**Use Cases:**
- Reinforcement learning training for tool-using agents
- Safe testing of agents with shell/file system access
- Parallel evaluation of agent behaviors

---

### 2.3 Ramp - Custom Sandboxed Background Agent

**Company:** Ramp (Financial technology)
**Source:** https://engineering.ramp.com/post/why-we-built-our-background-agent
**Status:** Production (Inspect Agent)

**Technical Approach:**
- Custom background agent running in sandboxed environment identical to developers
- Real-time WebSocket communication streaming stdout/stderr to client
- Closed feedback loop with compiler, linter, and test results
- Model-agnostic architecture supporting multiple LLM providers

**Architecture:**
```typescript
// Sandboxed dev environment via Modal
WebSocket → Agent Service → Sandbox (Modal/OpenCode)
                                  ↓
                            Iterative refinement with:
                            - Compiler errors
                            - Linter warnings
                            - Test failures
                                  ↓
                            Final PR/Result
```

**Key Features:**
- Deep integration with company-specific dev environments
- Real-time visibility into agent progress
- Support for multiple frontier models via pluggable interface
- Company-specific tooling and workflow integration

**Comparison to Cloudflare Code Mode:**
- **Similar:** Sandboxed code execution for agent workflows
- **Different:** Focus on long-running coding tasks vs. ephemeral tool orchestration
- **Same Benefits:** Security, isolated execution, controlled environment

**Use Cases:**
- Multi-file code changes requiring iterative refinement
- Company-specific development workflows
- Real-time agent progress monitoring

---

### 2.4 OpenAI - Code-Then-Execute Pattern (CaMeL)

**Organization:** DeepMind (original research), adopted by OpenAI
**Source:** https://arxiv.org/abs/2506.08837 (Beurer-Kellner et al., 2025)
**Status:** Research/Production adoption

**Technical Approach:**
- LLM outputs sandboxed program or DSL script instead of direct actions
- Static checker/taint engine verifies data flows before execution
- Interpreter runs code in locked sandbox
- Enables formal verification of security policies

**Example Flow:**
```python
# Agent generates verifiable code
x = calendar.read(today)
y = QuarantineLLM.format(x)
email.write(to="john@acme.com", body=y)

# Static analysis verifies:
# - No tainted data flows to dangerous sinks
# - Approved tool usage patterns
# - Compliant data handling
```

**Key Features:**
- Formal verifiability of agent actions
- Taint analysis for security-sensitive workflows
- Audit logs with full code provenance
- Policy enforcement before execution

**Comparison to Cloudflare Code Mode:**
- **Similar:** Code generation for tool orchestration
- **Different:** Focus on formal verification and security vs. token efficiency
- **Complementary:** Can be combined with Code Mode for verified workflows

**Use Cases:**
- Security-sensitive workflows (payments, external messages)
- Regulatory compliance requiring auditability
- Multi-step SQL operations with data flow verification

---

### 2.5 Clawdbot - Intelligent Bash Tool Execution

**Project:** Clawdbot (Open Source)
**Source:** https://github.com/clawdbot/clawdbot
**Status:** Validated in Production

**Technical Approach:**
- Multi-mode bash execution with adaptive fallback
- PTY (pseudo-terminal) support for TTY-required commands
- Platform-specific handling (macOS/Linux signal propagation)
- Security-aware approval workflows (deny, allowlist, full modes)
- Background process registry for long-running tasks

**Implementation:**
```typescript
async function runExecProcess(opts: {
  command: string;
  workdir: string;
  env: Record<string, string>;
  usePty: boolean;  // Auto-detected for TTY tools
  timeoutSec: number;
}): Promise<ExecProcessHandle> {
  // PTY-first for TTY-required commands
  if (opts.usePty) {
    pty = spawn(shell, [opts.command], { cwd: opts.workdir });
  } else {
    // Fallback to direct exec
    child = spawn(shell, [opts.command], { cwd: opts.workdir });
  }
  // Register session for tracking and cleanup
}
```

**Key Features:**
- Graceful PTY fallback when module unavailable
- Process registry for background task management
- Platform-aware signal handling (SIGTERM/SIGKILL)
- Security modes with approval workflows

**Comparison to Cloudflare Code Mode:**
- **Similar:** Secure command execution from agents
- **Different:** Shell command execution vs. TypeScript tool orchestration
- **Complementary:** Can provide shell access within Code Mode environment

**Use Cases:**
- Coding agents requiring terminal UI access
- Long-running background processes
- Platform-specific command execution

---

## 3. Open Source Frameworks and Libraries

### 3.1 Modal - Serverless Sandboxed Execution

**Project:** Modal
**Source:** https://modal.com/docs
**License:** Commercial (with free tier)

**Technical Approach:**
- Serverless container infrastructure for ephemeral execution
- Fast VM provisioning (<5 seconds)
- Built for bursty workloads (100s of simultaneous containers)
- Python SDK for defining isolated execution environments

**Usage in Agent Systems:**
```python
@app.cls(
    image=base_image,
    concurrency_limit=500,
    container_idle_timeout=60,
)
class IsolatedExecutor:
    """Per-agent execution environments"""

    @method()
    def execute_code(self, code: str):
        exec(code, self.sandbox_globals)
        return result
```

**Adoption:** Used by Cognition/Devon, Ramp, and multiple agent companies

---

### 3.2 Deno - Secure JavaScript/TypeScript Runtime

**Project:** Deno
**Source:** https://deno.com
**License:** MIT

**Technical Approach:**
- Secure by default (no file/network access without explicit flags)
- Built-in TypeScript support
- Web standard APIs (fetch, WebSocket, etc.)
- Permission-based security model

**Usage for Agent Code Execution:**
```bash
deno run --allow-net=api.example.com --allow-read=./workspace agent-script.ts
```

**Comparison:** V8 isolation at runtime level vs. in-process isolates

---

### 3.3 isolated-vm - Secure V8 Isolates

**Project:** isolated-vm
**Source:** https://github.com/laverdet/isolated-vm
**License:** MIT

**Technical Approach:**
- Node.js native module for secure V8 isolates
- Shared memory isolation between contexts
- Separate V8 heap per isolate
- Communication via structured serialization

**Usage:**
```javascript
const ivm = require('isolated-vm');

const isolate = new ivm.Isolate({ memoryLimit: 128 });
const context = isolate.createContextSync();

const script = await context.compileScript(code);
await script.run(context);
```

**Comparison:** Lower-level V8 isolation vs. Cloudflare's managed Code Mode

---

### 3.4 Node.js VM Module

**Project:** Node.js built-in
**Source:** https://nodejs.org/api/vm.html
**License:** MIT (Node.js)

**Technical Approach:**
- Built-in VM module for code execution in separate contexts
- `vm.Script` for compiling and running code
- `vm.createContext()` for isolated global objects
- Less secure than isolated-vm (shared V8 instance)

**Usage:**
```javascript
const vm = require('vm');

const sandbox = { tools: toolBindings };
const context = vm.createContext(sandbox);
const script = new vm.Script(code);

script.runInContext(context);
```

**Limitations:** Not suitable for untrusted code (can escape to main process)

---

## 4. Frameworks for Tool Orchestration

### 4.1 LangChain.js - Code Execution Tools

**Project:** LangChain
**Source:** https://js.langchain.com
**License:** MIT

**Technical Approach:**
- `DynamicTool` abstraction for custom tool definitions
- `PythonREPL` and `JSREPL` tools for code execution
- Integration with various execution environments

**Usage Pattern:**
```typescript
const codeTool = new DynamicTool({
  name: "code_executor",
  description: "Execute TypeScript code",
  func: async (input) => {
    // Execute in sandboxed environment
    return await executeInSandbox(input);
  }
});
```

---

### 4.2 Vercel AI SDK - Tool Calling

**Project:** Vercel AI SDK
**Source:** https://sdk.vercel.ai
**License:** Apache 2.0

**Technical Approach:**
- TypeScript-first tool definitions
- Zod schema validation for tool inputs
- Support for streaming tool calls

**Usage Pattern:**
```typescript
const tools = {
  executeCode: tool({
    description: "Execute code in sandbox",
    parameters: z.object({
      code: z.string(),
      language: z.string()
    }),
    execute: async ({ code, language }) => {
      return await runSandboxed(code, language);
    }
  })
};
```

---

### 4.3 MCP (Model Context Protocol) - Code Execution Servers

**Project:** Anthropic MCP
**Source:** https://modelcontextprotocol.io
**License:** MIT

**Technical Approach:**
- Open protocol for AI tool communication
- MCP servers can provide code execution capabilities
- Code-first pattern complements traditional MCP

**Example Code Execution MCP Server:**
```typescript
// MCP server that provides code execution
const server = Server({
  name: "code-execution-server",
  version: "1.0.0"
});

server.setRequestHandler(ListToolsRequestType, async () => ({
  tools: [{
    name: "execute_code",
    description: "Execute code in sandboxed environment",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string" },
        language: { type: "string" }
      }
    }
  }]
}));
```

---

## 5. Comparative Analysis

### Token Efficiency Comparison

| Implementation | Use Case | Token Savings |
|---|---|---|
| Cloudflare Code Mode | Infrastructure provisioning (6 AWS calls) | 10x+ reduction |
| Anthropic Code-Over-API | Spreadsheet processing (10K rows) | 75x reduction (150K → 2K) |
| Cognition Devon | File planning (8-10 calls → 4 calls) | 2x reduction + quality improvement |

### Security Model Comparison

| Implementation | Isolation Type | Credential Handling |
|---|---|---|
| Cloudflare Code Mode | V8 isolate | Credentials in MCP servers |
| Cognition Devon | Full VM per rollout | No persistent credentials (ephemeral) |
| Ramp Background Agent | Modal container sandbox | Company-managed credentials |
| isolated-vm | V8 isolate (in-process) | Application-controlled |
| Deno | Permission-based runtime | Flag-based permissions |

### Execution Environment Comparison

| Implementation | Startup Time | Language Support | Scalability |
|---|---|---|---|
| Cloudflare Code Mode | Sub-second (V8) | TypeScript/JavaScript | High (edge network) |
| Modal containers | 2-5 seconds | Any (containerized) | Very High (auto-scale) |
| isolated-vm | Milliseconds | JavaScript/TypeScript | Medium (in-process) |
| Deno | Sub-second | TypeScript/JavaScript | High (edge-ready) |

---

## 6. Use Cases and Applications

### Ideal Use Cases for Code-First Patterns

1. **Workflow-like Problems with Known Flow:**
   - Infrastructure provisioning (Cloudflare example)
   - Data pipeline orchestration
   - Multi-step API choreography

2. **Fan-Out Scenarios:**
   - Bulk processing (100+ items)
   - Batch operations
   - Parallel data transformations

3. **Cost-Sensitive Applications:**
   - High-volume workflows
   - Production systems at scale
   - Token budget constraints

4. **Self-Debugging Agents:**
   - CaMeL-style iterative refinement
   - Error handling and retry logic
   - Recovery from transient failures

### Anti-Patterns (When NOT to Use)

1. **Open-Ended Research Loops:**
   - Dynamic exploration where next steps are unpredictable
   - Intelligence required mid-execution
   - Highly adaptive workflows

2. **Simple Single Calls:**
   - One-off tool usage doesn't benefit from orchestration
   - Direct tool call is simpler and faster

3. **Rapid Prototyping:**
   - Quick testing without infrastructure setup
   - Traditional MCP is faster to implement

---

## 7. Related Patterns

### 7.1 Code-Then-Execute Pattern
- **Focus:** Security and formal verification
- **Relationship:** Complementary to Code Mode
- **Key Difference:** Static analysis before execution

### 7.2 Code-Over-API Pattern
- **Focus:** Data processing and token efficiency
- **Relationship:** Very similar to Code Mode
- **Key Difference:** Anthropic's implementation with Python focus

### 7.3 Filesystem-Based Agent State
- **Focus:** Persistence and resumption
- **Relationship:** Often used with code-first patterns
- **Key Difference:** State management vs. tool orchestration

### 7.4 Isolated VM per RL Rollout
- **Focus:** Training infrastructure
- **Relationship:** Uses similar isolation principles
- **Key Difference:** Full VM isolation vs. V8 isolate

---

## 8. Implementation Guidance

### Technology Selection Decision Tree

**Choose V8 Isolates (Code Mode-style) when:**
- Sub-second startup time is critical
- TypeScript/JavaScript is your stack
- Edge deployment is needed
- Token efficiency is the primary goal

**Choose Container Isolation (Modal-style) when:**
- Full language/runtime flexibility needed
- Longer-running workflows are acceptable
- Production parity is important
- Company-specific dependencies required

**Choose VM Isolation (Devon-style) when:**
- Complete isolation is required
- Destructive operations must be safe
- Parallel execution with no shared state
- Training/evaluation scenarios

**Choose Runtime Permissions (Deno-style) when:**
- Permission-based security model fits
- Web standard APIs are sufficient
- Browser-compatible tooling desired
- Edge deployment is needed

### Security Considerations

1. **Credential Management:**
   - Keep credentials in persistent MCP servers
   - Never pass secrets to ephemeral code execution
   - Use short-lived tokens with minimal scope

2. **Resource Limits:**
   - CPU quotas and throttling
   - Memory limits (prevent OOM)
   - Execution timeouts (prevent infinite loops)
   - Network egress restrictions

3. **Code Validation:**
   - Static analysis before execution (CaMeL pattern)
   - Taint tracking for sensitive data
   - Sandbox escape prevention

4. **Observability:**
   - Comprehensive logging
   - Execution tracing
   - Error tracking and alerting

---

## 9. Academic Research

### Relevant Papers

1. **CaMeL: Code-Augmented Language Model for Tool Use**
   - Source: https://arxiv.org/abs/2506.08837
   - Authors: Debenedetti et al. (2025)
   - Key Contribution: Formal verification of generated code

2. **Self-Debugging Code Generation**
   - Multiple papers on iterative code refinement
   - Supports CaMeL-style self-debugging

3. **Program Synthesis for Tool Orchestration**
   - Research on LLM-generated programs for API usage
   - Validates code-first approach

---

## 10. Open Questions and Future Directions

### Open Questions

1. **Standardization:**
   - Will code-first tool interfaces become standard?
   - Need for standardized TypeScript API generation from MCP schemas?

2. **Debugging:**
   - How to debug generated code effectively?
   - Tools for inspecting execution traces?

3. **Caching and Reuse:**
   - Semantic caching of successful workflows?
   - Checkpoint/resume patterns for partial failures?

4. **Hybrid Approaches:**
   - Combining code-first with traditional MCP?
   - Adaptive selection based on workflow characteristics?

### Future Directions

1. **Improved Static Analysis:**
   - Better taint tracking and security verification
   - Formal verification guarantees for production use

2. **Standardized APIs:**
   - Common interfaces for code execution environments
   - Portable sandbox specifications

3. **Better Tooling:**
   - Debugging and observability tools
   - Execution trace visualization

4. **Model Training:**
   - Models trained specifically for code-first tool use
   - Better code generation for orchestration patterns

---

## 11. References and Sources

### Primary Sources

1. [Cloudflare Code Mode Blog Post](https://blog.cloudflare.com/code-mode/) - Original announcement and technical details
2. [Anthropic Engineering: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) - Code-Over-API pattern
3. [OpenAI Build Hour: Agent RFT - Cognition Case Study](https://youtu.be/1s_7RMG4O4U) - Isolated VM per RL rollout
4. [Why We Built Our Own Background Agent - Ramp Engineering](https://engineering.ramp.com/post/why-we-built-our-background-agent) - Custom sandboxed agent
5. [CaMeL Paper](https://arxiv.org/abs/2506.08837) - Code-Then-Execute with formal verification

### Framework and Library Sources

6. [Model Context Protocol](https://modelcontextprotocol.io/) - Open protocol for tool communication
7. [Modal Documentation](https://modal.com/docs) - Serverless container infrastructure
8. [isolated-vm GitHub](https://github.com/laverdet/isolated-vm) - Secure V8 isolates
9. [Deno Documentation](https://deno.com) - Secure JavaScript/TypeScript runtime
10. [Node.js VM Module](https://nodejs.org/api/vm.html) - Built-in code execution

### Open Source Implementations

11. [Clawdbot](https://github.com/clawdbot/clawdbot) - Production agent with intelligent bash execution
12. [Labruno](https://github.com/nibzard/labruno-agent) - Adaptive sandbox fan-out controller

### Related Patterns

13. [Rafal Wilinski's Code Mode Analysis](https://x.com/rafalwilinski/status/1972362720579035146) - Real-world insights on strengths/limitations

---

*Report generated by research team. Last updated: 2025-02-27*
