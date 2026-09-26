---
title: "Out-of-Process Provider-Boundary Replay"
status: emerging
authors: ["Xingke Yan (@xizhuomengcontin)"]
based_on: ["VCR (Myron Marston)", "Polly.JS (Netflix)", "OrcaReplay"]
category: "Reliability & Eval"
source: "https://github.com/Continuum-AI-Corp/OrcaReplay"
tags: [record-replay, determinism, regression-testing, http-boundary, offline, instrumentation-free]
summary: "Capture an agent run at the model-provider HTTP boundary from outside the process, then serve those bytes back so the agent re-executes its own logic with no provider call."
maturity: "maturing"
complexity: "medium"
effort: "hours"
impact: "high"
signals: ["The agent is expensive or slow to re-run", "A bug reproduces only in a full session, not in a unit test", "The framework changes faster than any instrumentation you could write for it"]
anti_signals: ["You need the agent to reach a *live* model, e.g. to test prompt changes", "The run's tool calls are destructive and you have no sandbox", "Your provider traffic never leaves the process (a model compiled in, or an in-process stub)"]
prerequisites: ["The client reads its origin from configuration or the environment", "A place to store verbatim request/response bytes"]
related: ["action-caching-replay", "workflow-evals-with-mocked-tools"]
tools: ["proxy", "test-harness"]
domains: ["coding", "ops"]
updated_at: "2026-09-26"
---

## Problem

An agent session is expensive to reproduce. Re-running it costs tokens, needs the network, and the
model may not make the same choices twice — so "what did it actually do, and why" usually gets
answered from logs rather than from the run itself.

The usual fix is to instrument the framework: a callback handler, a tracing decorator, a monkey
patch around the client. That works until it doesn't:

- **It is per-framework.** Every agent library needs its own hook, and the hooks move between
  releases faster than the integrations that wrap them.
- **It records an interpretation, not the traffic.** A handler sees the objects the framework built,
  after the framework already normalised, retried, or merged streamed chunks.
- **It cannot capture what you did not anticipate.** A field added by a provider last week is not in
  your span schema, so it is not in your trace.
- **It changes the program under test.** The run you recorded is a run with your instrumentation in
  it.

## Solution

Record one layer lower and one process out: at the **HTTP boundary between the agent and its model
provider**, from a proxy the agent does not know about.

This is the old HTTP-fixture pattern — VCR's cassettes, Polly.JS's recordings — applied at the one
boundary that every agent framework has in common.

1. **Launch the agent as a child process** and set the provider-origin variables *for that process
   only* (`OPENAI_BASE_URL`, `ANTHROPIC_BASE_URL`, or whatever the client reads). Nothing is
   installed into the agent; its own code is unchanged.
2. **Store verbatim bytes.** Request and response exactly as they crossed the socket, including
   streamed frames and tool-call arguments — not a parsed summary of them.
3. **Restore the initial state, then replay.** Restore the working tree, tool fixtures, and configuration captured before recording; replay in a disposable sandbox. **Serve the recording back.** Run the same command again with the proxy in replay
   mode. The agent executes its own logic, its own control flow, its own tool dispatch; only the
   provider's answers come from the trace.
4. **Report divergence instead of hiding it.** When the replayed request does not match the
   recorded one byte for byte, say so and say by how much. A prompt carrying an absolute path or a
   session id will differ between runs; that is worth naming, not silently matching.
   In strict regression mode, a mismatch or missing exchange aborts replay without provider fallback.
   A diagnostic mode may continue only with explicit divergence labels; it is not a passing regression test.

```
record:  agent ──HTTP──▶ [proxy: forward + store] ──▶ provider
replay:  agent ──HTTP──▶ [proxy: match + serve from trace]     ✗ provider
```

The verdict from a replay is a number, not a vibe: how many exchanges were reused, how many matched
exactly, how many diverged, how many requests had no recorded counterpart at all.

## Evidence

- **Evidence Grade:** `medium`
- **Most Valuable Findings:**
  - The boundary generalises where instrumentation does not: the same proxy captures agent
    frameworks written in different languages, because the thing it hooks is HTTP, not an API.
  - Byte-level matching is what makes a replay falsifiable. If the harness normalises the request
    before comparing, an exact match and a lucky match become indistinguishable.
  - Denying provider egress during replay checks that no live response can silently substitute
    for a missing recording. Stopping a local mock origin is one additional check, not proof
    that requests cannot reach a hosted provider.
- **Unverified / Unclear:** How far this stretches for agents whose provider traffic is multiplexed
  with unrelated traffic on one connection, and for clients that pin certificates.

## How to use it

**Use it when** you want a run you can hand to someone else, a regression test that costs nothing to
run in CI, or a bug report that reproduces on a machine with no API key.

**Getting there:**

- Check that the client actually reads its origin from the environment. Some SDKs only honour a
  constructor argument, and some compile the origin in — those need a TLS-intercepting proxy with a
  trusted local CA, or they cannot be captured this way at all.
- Record the *shapes you really use*: streaming SSE, tool calls, and any non-chat endpoint. A
  harness proved against a single plain completion has proved very little.
- Capture the initial working tree and relevant tool inputs before recording, and the resulting diff
  afterward. Restore the initial snapshot for each replay; a final-state snapshot alone cannot reproduce
  the run. Live tool responses, clocks, and other uncontrolled inputs still limit determinism.
- Redact on the way in, not on the way out: an API key that reaches the trace file has already
  leaked.

## Trade-offs

**Pros**

- No instrumentation to write or keep up to date; the agent's code is untouched.
- Captures what actually went over the wire, including fields nobody modelled.
- Replays cost nothing and need no key, so they belong in CI and in bug reports.
- Framework-agnostic by construction.

**Cons**

- **Blocking provider egress is not sandboxing.** Replay stops the model call, but the agent still
  *executes its recorded tool calls for real* — a tool that shells out to `curl` will hit the
  network again. To stop all egress you still need a sandbox.
- Non-determinism inside the prompt (timestamps, absolute paths, session ids) shows up as
  divergence, so the harness needs a considered answer for it rather than a normalisation that
  hides it.
- Origins that are compiled in, or clients that pin certificates, are out of reach without a TLS
  intercept the user has to trust.
- A trace is a full transcript. It is exactly as sensitive as the conversation it recorded.

## References

- [VCR](https://github.com/vcr/vcr) — the original record/replay HTTP fixture library.
- [Polly.JS](https://github.com/Netflix/pollyjs) — the same idea for JavaScript, with request matching rules.
- [Docker Cagent](https://github.com/docker/cagent) — a proxy-and-cassette model for deterministic agent testing.
- [OrcaReplay](https://github.com/Continuum-AI-Corp/OrcaReplay) — an implementation at the agent's provider boundary, including the divergence verdict described above; maintained by this pattern’s author.
