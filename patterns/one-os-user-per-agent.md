---
title: "One OS User per Agent"
slug: "one-os-user-per-agent"
status: "validated-in-production"
authors: ["5dive contributors (@5dive-bot)"]
category: "Security & Safety"
source: "https://github.com/5dive-ai/5dive/blob/main/systemd/5dive-agent%40.service"
tags: [isolation, multi-agent, systemd, process-identity, least-privilege, long-running-agents, audit-trail]
summary: "Give each long-lived agent its own OS user account and a templated init-system unit, so identity, supervision and privilege come from the host instead of from a per-agent container."
complexity: low
effort: hours
impact: medium
signals:
  - "Several persistent agents share one host and one working tree"
  - "You need distinct process identities and per-agent resource accounting"
  - "Each agent should hold a different privilege scope on the same machine"
anti_signals:
  - "Agents are ephemeral, one per task, and share no state"
  - "Workloads are untrusted or adversarial and need kernel-level containment"
  - "The fleet must scale horizontally across many machines"
prerequisites:
  - "An init system with templated units (systemd, or an equivalent supervisor)"
  - "Root on the host to create users and install units"
related: ["local-first-credential-broker", "custom-sandboxed-background-agent", "isolated-vm-per-rl-rollout"]
updated_at: "2026-09-26"
---

## Problem

A fleet of *long-lived* agents is a different problem from a fleet of ephemeral task runners. The
agents stay up for weeks, share one working tree, edit each other's files, and are expected to leave
an audit trail a human can read months later.

The reflex is a container or a VM per agent. For this shape it fits badly:

- **The shared working tree fights the boundary.** The whole point is that the agents collaborate on
  one repo, so most of the isolation gets punched back out as bind mounts.
- **You add a second supervisor.** The host already has one. Now there is an orchestrator on top of
  it, with its own restart semantics and its own failure modes.
- **Attribution needs deliberate identity mapping.** Containers can provide distinct identities,
  but shared mounts still need consistent host uid mapping and audit records to identify writers.
  A separate host uid per persistent agent is one direct way to organize process identity.
- **Per-agent privilege has nowhere to live.** Giving one agent the ability to restart a service, and
  denying it to the others, becomes bespoke policy rather than a line in `sudoers`.

Meanwhile the host already ships an identity primitive that supports these requirements, and is older than every
agent framework on it.

## Solution

**Make the OS user account the unit of agent identity.** One `useradd` per agent, one *templated*
init unit whose `User=` is derived mechanically from the instance name, a shared group for the
collaboration surface, and per-instance environment overlays for config and credentials.

```ini
# one template, N agents: systemctl enable --now myagent@researcher
[Unit]
Description=agent %i
StartLimitIntervalSec=120
StartLimitBurst=10

[Service]
# Identity derives from the instance name; collaboration uses a shared group.
User=agent-%i
Group=shared
# Shared files need group-write permission as well as setgid directories.
UMask=0002
EnvironmentFile=-/etc/agents/common.env
# Per-agent overlay; '-' means an absent file is tolerated.
EnvironmentFile=-/etc/agents/%i.env
ExecStart=/usr/local/bin/agent-start %i
Restart=on-failure
RestartSec=3
# The launcher must use these codes for permanent faults.
RestartPreventExitStatus=2 3

[Install]
WantedBy=multi-user.target
```

Five things fall out of those two lines:

1. **Process identity is kernel-enforced.** `ps` identifies the uid running a process. File
   ownership identifies the owner, not the last writer: a shared-group agent can overwrite another
   agent’s file without changing ownership. Enable OS auditing for writer attribution; Git author
   metadata is configurable and is not proof of process identity.
2. **Supervision is free.** Restart policy, backoff, crash-loop backstop and cgroup accounting come
   from the init system. `RestartPreventExitStatus` matters more than it looks: a *permanent* fault
   (missing binary, unknown agent type) must fail once and stay failed. Without it, a 3-second
   restart delay turned one missing binary into 9,563 restarts across a single day.
3. **Collaboration is the group, isolation is the user.** The shared work tree is group-owned and
   setgid. The agents are separate uids in that group. The boundary is drawn once, in the place the
   kernel already enforces it.
4. **Config and credentials overlay per instance.** Keying `EnvironmentFile` on `%i` lets two agents
   of the same type run against different accounts without a second unit.
5. **Privilege is granted per agent, in `sudoers`.** Each agent gets a narrow grant on a *mediated
   CLI*, not a broad grant on the filesystem. This is the part most implementations get backwards.
   See Trade-offs.

## Evidence

- **Evidence Grade:** `medium`
- **Most Valuable Findings:**
  - Running ~18 persistent agent seats as 18 OS users on a single host, one templated unit, has held
    in production. Marginal cost of an agent is a uid and a drop-in file.
  - Distinct uids make processes and resource accounting attributable per agent. File ownership
    remains useful context, but shared writes require audit records to identify the writer.
  - A shared group is a *deliberate hole* in the boundary, and is where implementations quietly leak
    (below). Distinct uids do not make shared-group secrets private.
- **Unverified / Unclear:** no measurement of how this degrades past a few dozen agents on one host,
  and no comparison against a rootless-container fleet under the same workload.

## How to use it

Reach for this when agents are **persistent, collaborating and mutually trusted-ish**: an internal
fleet on your own hardware, not untrusted tenant code.

1. Create one system user per agent, all in a shared group. Home directory per user.
2. Make the shared work tree group-owned and setgid, and set `UMask=0002` so new shared files are group-writable. Keep secrets outside it, with explicitly restrictive file and directory modes.
3. Write one templated unit with `User=agent-%i`, per-instance `EnvironmentFile` overlays, and a
   restart policy that distinguishes transient from permanent failure.
4. Keep credentials in private per-user directories or root-owned service configuration. Environment-injected secrets remain accessible to that agent. For elevated capabilities, grant only a narrow mediated command through `sudoers`; inspect its arguments and effects.
5. Enable an instance per agent. Adding agent number nineteen is `useradd` plus
   `systemctl enable --now`.

## Trade-offs

**Pros**

- No image to build, ship or rebuild. The agent runs against the host's real toolchain.
- Supervision, restart, log capture and cgroup limits come from the init system already running.
- Per-agent process identity and accounting; OS auditing can record writes to shared files.
- Per-agent privilege is a `sudoers` line, reviewable in one file.
- Survives reboot, and the marginal cost per agent is a uid.

**Cons**

- **A uid is not a sandbox.** Same kernel, same network namespace, no syscall filtering unless you
  add it. Against an adversarial agent this is the wrong tool. Use a VM.
- **The shared group leaks by design.** Anything group-readable is readable by *every* agent in the
  group. Private uid-owned directories can isolate credentials from other uids when permissions
  are restrictive; shared-group files cannot. Root-owned configuration and mediated commands
  are options for higher-privilege secrets, not guarantees that an agent cannot read its own tokens.
- **Root compromise is fleet-wide.** There is one kernel and one root.
- **Host-bound.** Scaling past one machine needs machinery this pattern does not provide.
- **Cross-user writes need the whole chain composed.** Group membership is necessary and not
  sufficient: a directory's setgid bit, the parent directories' traversal bits, and hardening
  sysctls such as `fs.protected_regular` each independently block a write that "should" work. Expect
  to debug a permission denial that looks like a missing grant and is not.

## References

- [Templated unit with `User=agent-%i`](https://github.com/5dive-ai/5dive/blob/main/systemd/5dive-agent%40.service), the unit this pattern is drawn from
- [`systemd.exec`: `User=`/`Group=`](https://www.freedesktop.org/software/systemd/man/systemd.exec.html#User=)
- [`systemd.service`: `Restart=`, `RestartPreventExitStatus=`](https://www.freedesktop.org/software/systemd/man/systemd.service.html#Restart=)
- [`systemd.unit`: template units and `%i`](https://www.freedesktop.org/software/systemd/man/systemd.unit.html)
- Related: `local-first-credential-broker` (complementary: it keeps secrets out of the
  process, where this pattern keeps agents out of each other's processes), `custom-sandboxed-background-agent` and
  `isolated-vm-per-rl-rollout` (the heavier boundaries this one trades against)
