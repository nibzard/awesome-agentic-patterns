---
title: "Intelligent Bash Tool Execution"
status: "validated-in-production"
authors: ["Clawdbot Contributors"]
based_on: ["Clawdbot Implementation (https://github.com/clawdbot/clawdbot)"]
category: "Tool Use & Environment"
source: "https://github.com/clawdbot/clawdbot/blob/main/src/agents/bash-tools.exec.ts"
tags: [bash, shell, pty, fallback, security, process-management, sandboxing]
---

## Problem

Secure, reliable command execution from agents is complex and error-prone:

- **PTY requirements**: TTY-required CLIs (coding agents, terminal UIs) fail with direct exec
- **Platform differences**: Linux and macOS behave differently for detached processes, signal handling
- **Security concerns**: Arbitrary command execution needs approval workflows, elevated mode detection
- **Background management**: Long-running processes need tracking, output aggregation, and cleanup

Agents need a multi-mode execution strategy that adapts to the command's requirements while maintaining security and reliability.

## Solution

Multi-mode execution with adaptive fallback: direct exec → PTY, with automatic selection based on command requirements and runtime capabilities. The system handles PTY spawn failures gracefully, manages background processes, and provides security-aware approval workflows.

**Core concepts:**

- **PTY-first for TTY-required commands**: Detects when commands need a pseudo-terminal (coding agents, interactive CLIs) and spawns via `node-pty`.
- **Graceful PTY fallback**: If PTY spawn fails (module missing, platform unsupported), falls back to direct exec with a warning.
- **Platform-specific handling**: macOS requires detached processes for proper signal propagation; Linux handles both modes.
- **Security-aware modes**: Elevated mode detection with approval workflows (deny, allowlist, full).
- **Background process registry**: Long-running processes are tracked with session IDs, output tailing, and exit notifications.
- **Proper signal propagation**: SIGTERM/SIGKILL are delivered correctly to child processes on timeout or abort.

**Implementation sketch:**

```typescript
async function runExecProcess(opts: {
  command: string;
  workdir: string;
  env: Record<string, string>;
  usePty: boolean;
  timeoutSec: number;
}): Promise<ExecProcessHandle> {
  let child: ChildProcess | null = null;
  let pty: PtyHandle | null = null;
  const warnings: string[] = [];

  if (opts.usePty) {
    try {
      const { spawn } = await import("@lydell/node-pty");
      pty = spawn(shell, [opts.command], {
        cwd: opts.workdir,
        env: opts.env,
        cols: 120,
        rows: 30,
      });
    } catch (err) {
      // PTY unavailable; fallback to direct exec
      warnings.push(`PTY spawn failed (${err}); retrying without PTY.`);
      const { child: spawned } = await spawnWithFallback({
        argv: [shell, opts.command],
        options: { cwd: opts.workdir, env: opts.env },
        fallbacks: [{ label: "no-detach", options: { detached: false } }],
      });
      child = spawned;
    }
  } else {
    // Direct exec without PTY
    const { child: spawned } = await spawnWithFallback({
      argv: [shell, opts.command],
      options: { cwd: opts.workdir, env: opts.env, detached: platform !== "win32" },
      fallbacks: [{ label: "no-detach", options: { detached: false } }],
    });
    child = spawned;
  }

  // Register session for tracking
  const session = {
    id: createSessionSlug(),
    command: opts.command,
    pid: child?.pid ?? pty?.pid,
    aggregated: "",
    tail: "",
    exited: false,
  };
  addSession(session);

  // Handle timeout with SIGKILL
  if (opts.timeoutSec > 0) {
    setTimeout(() => {
      if (!session.exited) {
        killSession(session);  // SIGTERM then SIGKILL
      }
    }, opts.timeoutSec * 1000);
  }

  return { session, promise /* resolves on exit */ };
}
```

**Spawn fallback for platform differences:**

```typescript
async function spawnWithFallback(params: {
  argv: string[];
  options: ChildProcess.SpawnOptions;
  fallbacks: Array<{ label: string; options: Partial<ChildProcess.SpawnOptions> }>;
}): Promise<{ child: ChildProcess }> {
  try {
    return { child: spawn(...params.argv, params.options) };
  } catch (err) {
    for (const fallback of params.fallbacks) {
      try {
        const mergedOptions = { ...params.options, ...fallback.options };
        const child = spawn(...params.argv, mergedOptions);
        // Warn about fallback
        logWarn(`spawn failed (${err}); retrying with ${fallback.label}.`);
        return { child };
      } catch {
        continue;
      }
    }
    throw err;
  }
}
```

**Security-aware execution with approval:**

```typescript
async function executeWithApproval(params: {
  command: string;
  security: "deny" | "allowlist" | "full";
  ask: "off" | "on-miss" | "always";
  agentId: string;
}): Promise<ExecResult> {
  const approvals = resolveExecApprovals(params.agentId, {
    security: params.security,
    ask: params.ask,
  });

  const allowlistEval = evaluateShellAllowlist({
    command: params.command,
    allowlist: approvals.allowlist,
    safeBins: approvals.safeBins,
  });

  const requiresAsk = requiresExecApproval({
    ask: params.ask,
    security: params.security,
    analysisOk: allowlistEval.analysisOk,
    allowlistSatisfied: allowlistEval.allowlistSatisfied,
  });

  if (requiresAsk) {
    const approvalId = crypto.randomUUID();
    // Request approval via gateway; wait for decision
    const decision = await requestApproval(approvalId, params.command);
    if (decision === "deny") {
      throw new Error("exec denied: user rejected");
    }
  }

  // Execute command
  return runExecProcess(params);
}
```

**Background process management:**

```typescript
type ProcessSession = {
  id: string;
  command: string;
  pid?: number;
  aggregated: string;
  tail: string;
  exited: boolean;
  exitCode?: number | null;
  exitSignal?: NodeJS.Signals | null;
  backgrounded: boolean;
};

const sessions = new Map<string, ProcessSession>();

function addSession(session: ProcessSession) {
  sessions.set(session.id, session);
}

function markBackgrounded(session: ProcessSession) {
  session.backgrounded = true;
}

function killSession(session: ProcessSession) {
  if (session.child) {
    session.child.kill("SIGTERM");
    // Fallback to SIGKILL after grace period
    setTimeout(() => {
      if (!session.exited) {
        session.child?.kill("SIGKILL");
        markExited(session, null, "SIGKILL", "failed");
      }
    }, 1000);
  }
}
```

## How to use it

1. **Detect TTY requirements**: Check if the command is a TTY-required CLI (coding agent, interactive tool) and set `usePty: true`.
2. **Handle PTY failures**: Wrap PTY spawn in try-catch and fall back to direct exec with appropriate warnings.
3. **Configure security modes**: Set default security level (`deny`, `allowlist`, `full`) and approval behavior (`off`, `on-miss`, `always`).
4. **Register background processes**: Add sessions to a registry for tracking, polling, and cleanup.
5. **Propagate signals correctly**: Use SIGTERM then SIGKILL for graceful shutdown, and handle platform-specific detached process behavior.
6. **Aggregate output**: Collect stdout/stderr into `aggregated` and maintain a `tail` for user notifications.

**Pitfalls to avoid:**

- **Missing PTY module**: `node-pty` may not be available in all environments; always provide fallback.
- **Signal handling differences**: macOS detached processes don't receive signals; use process groups or alternative signaling.
- **Zombie processes**: Always handle the `"close"` event and clean up session registry entries.
- **Output truncation**: Large outputs can overwhelm memory; enforce `maxOutput` limits and truncate middle sections.

## Trade-offs

**Pros:**

- **TTY support**: PTY mode enables TTY-required tools that would otherwise fail.
- **Graceful degradation**: Falls back to direct exec when PTY is unavailable.
- **Security layers**: Multiple modes (deny, allowlist, full) provide flexible security policies.
- **Background tracking**: Process registry enables long-running task management and cleanup.
- **Platform awareness**: Handles macOS/Linux differences for signal propagation.

**Cons/Considerations:**

- **PTY dependency**: Requires `node-pty` native module, which may fail to compile in some environments.
- **Complexity**: Multi-mode execution increases code complexity and testing surface.
- **Output buffering**: Aggregating all output in memory can exhaust RAM for long-running, verbose processes.
- **Signal limitations**: Detached processes on macOS don't receive signals; requires workarounds.

## References

- [Clawdbot bash-tools.exec.ts](https://github.com/clawdbot/clawdbot/blob/main/src/agents/bash-tools.exec.ts) - Execution modes
- [Clawdbot bash-tools.process.ts](https://github.com/clawdbot/clawdbot/blob/main/src/agents/bash-tools.process.ts) - Process management
- [Clawdbot bash-process-registry.ts](https://github.com/clawdbot/clawdbot/blob/main/src/agents/bash-process-registry.ts) - Background registry
- Related: [Virtual Machine Operator Agent](/patterns/virtual-machine-operator-agent) for remote execution patterns
