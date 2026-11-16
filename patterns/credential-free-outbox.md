---
title: "Credential-Free Outbox"
status: emerging
authors: ["tpoxa (@tpoxa)"]
based_on: ["tiny (https://github.com/tiny-systems/tiny)", "Transactional outbox (microservices pattern)"]
category: "Security & Safety"
source: "https://tinysystems.io/blog/the-outbox/"
tags: [credentials, prompt-injection, least-privilege, git, ci, containment, outbox]
summary: "The agent writes finished work as a file to an outbox and a separate short-lived job with its own token delivers it, so the agent never holds a credential that can publish anything"
signals: ["Agent reads untrusted text (issues, READMEs, dependency docs) and must also publish results", "Results can be expressed as a file: a git bundle, a patch, a report", "A CI system can run a credentialed job on a schedule or event"]
anti_signals: ["The agent needs an interactive, authenticated session with an outside system mid-task", "Results must be published synchronously within the agent's turn", "There is no separate trusted runner to hold the credential"]
updated_at: "2026-11-08"
---

## Problem

A coding agent has to publish its work: push a branch, open a pull request, post a comment. The obvious way is to give it a token. But the same agent reads untrusted text all day, so a prompt injection can use that token for anything it allows: force-push, reach other repositories, open a pull request somewhere it shouldn't. Short-lived CI tokens don't fix this cleanly either. GitHub revokes a job's token when the job ends, often before a long-running agent has finished.

## Solution

The agent holds no publishing credentials at all. It writes its finished work as a file to an outbox, and a separate, short-lived, credentialed job delivers it.

- **Agent:** commits on a branch, then runs `git bundle create outbox/<branch>.bundle main..<branch>`. No remote, no token.
- **Courier:** a CI job with its own fresh token lists the outbox, validates each bundle name against a strict pattern, fetches the bundle, rebases it onto the current main and pushes.
- **Acknowledge after delivery:** the courier deletes a bundle only after the push succeeds. A failed push leaves it in place for the next run, so nothing is lost or delivered twice.
- **Identity-bearing side effects** (opening the PR, posting a comment) are done by the courier too, never by the agent.

```pseudo
agent:
    work(); commit(branch)
    write_bundle("outbox/" + branch + ".bundle")

courier (scheduled or event-driven, outside the agent sandbox):
    for b in list(outbox) where name matches ^[A-Za-z0-9][A-Za-z0-9._-]*\.bundle$:
        fetch(b)                 # argv-only channel, no shell
        rebase(onto = "main")
        push(token)
        open_pr(token)
        ack(b)                   # only after the push succeeded
```

## How to use it

- Run the courier outside the agent's sandbox, with a token scoped to the target repository and as short-lived as the platform allows.
- Read bundles through an argv-only channel and never interpolate agent-written text into a shell command. The bundle name allow-list is part of the pattern, not decoration.
- Rebase in the courier. A bundle made from an old clone can carry stale workflow files, and some CI tokens are not allowed to push changes to workflows even incidentally.
- On GitHub, pushes made with the job's `GITHUB_TOKEN` don't trigger further workflows, so the courier has to open the pull request itself rather than relying on a push-triggered job.

## Trade-offs

- **Pros:** a hijacked agent has no token to push, force-push or reach other repositories with. Nothing in the sandbox needs rotating. Every delivery is done and logged by one auditable job.
- **Cons:** delivery is asynchronous, so there is a delay between "done" and "visible". The courier needs read access to the agent's outbox, which is its own small trust boundary. The model API key usually still lives in the sandbox, so this narrows the blast radius rather than eliminating it.

## References

- https://tinysystems.io/blog/the-outbox/
- https://github.com/tiny-systems/tiny
- https://microservices.io/patterns/data/transactional-outbox.html
