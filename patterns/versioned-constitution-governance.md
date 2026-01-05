---
title: Versioned Constitution Governance
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Hiveism (self-alignment loop)", "Anthropic (Constitutional AI)"]
category: Reliability & Eval
source: "https://substack.com/home/post/p-161422949?utm_campaign=post&utm_medium=web"
tags: [constitution, alignment, governance, signed-commits, policy]
---

## Problem
When an agent rewrites its own "constitution," it may accidentally violate safety or regress on alignment objectives if changes aren't reviewed.

## Solution
Store the constitution in a **version-controlled, signed repository**:

- YAML/TOML rules live in Git.  
- Each commit is signed (e.g., Sigstore); CI runs automated policy checks.  
- Only commits signed by approved reviewers or automated tests are merged.  
- The agent can *propose* changes, but a gatekeeper merges them.

## How to use it
- Require `git commit -S` or similar.  
- Run diff-based linting to flag deletions of critical rules.  
- Expose constitution `HEAD` as read-only context in every agent episode.

## References
- Hiveism, *Self-Alignment by Constitutional AI*
- Anthropic, *Constitutional AI* white-paper