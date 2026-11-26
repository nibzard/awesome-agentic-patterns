# Principles

Lessons from teams that build agent products: product strategy, team habits, developer learning, and general software architecture. They are not agent patterns.

## Why this directory exists

`patterns/` is for repeatable, agent-centric technical architectures and control loops. A pattern tells you how an AI agent senses, reasons, remembers, uses tools, or stays safe. The root [README](../README.md) sets that bar: repeatable, agent-centric, traceable.

The entries here are valuable, and they came from building agent products, but they do not meet that bar. They describe how teams decide and work, or how to structure software in general. If they sat in `patterns/`, they would dilute the technical catalog, the Decision Explorer, and `llms.txt`.

Each entry keeps the front-matter and section structure of a pattern, so you can read it the same way. Where an entry depends on a technical pattern, it links to `../patterns/`. Add an entry here only when it fails the pattern bar but is still worth keeping.

## Product & strategy

| Principle | Summary |
|---|---|
| [Burn the Boats](burn-the-boats.md) | Removes working but obsolete features on a hard, announced deadline so the team and users move to the new approach |
| [Frontier-Focused Development](frontier-focused-development.md) | Targets only state-of-the-art models, picks the best model per use case with no user model selector, and expects to rework the product every few months |
| [Latent Demand Product Discovery](latent-demand-product-discovery.md) | Builds hackable, extensible products, watches how power users repurpose them, and turns the most frequent workarounds into supported features |
| [Shipping as Research](shipping-as-research.md) | Releases reversible, instrumented features to learn whether they work, then doubles down or removes them based on usage data and feedback |

## Team & workflow habits

| Principle | Summary |
|---|---|
| [Dev Tooling Assumptions Reset](dev-tooling-assumptions-reset.md) | Audits dev tools for human-effort assumptions and replaces tickets, PR ceremony, and sprints with immediate agent dispatch, variations, and automated tests |
| [Dogfooding with Rapid Iteration for Agent Improvement](dogfooding-with-rapid-iteration-for-agent-improvement.md) | The agent team uses its own agent for daily work, collects feedback in low-friction channels, and ships features internally first to validate or discard them |
| [No-Token-Limit Magic](no-token-limit-magic.md) | Removes hard token limits during prototyping to learn what good behavior needs, then compresses context only after quality is stable and measured |

## Industry & learning

| Principle | Summary |
|---|---|
| [AI-Accelerated Learning and Skill Development](ai-accelerated-learning-and-skill-development.md) | Uses AI assistants as tutors that explain errors and concepts, offer alternatives, and fade support as the developer gains skill |
| [Democratization of Tooling via Agents](democratization-of-tooling-via-agents.md) | Non-programmers describe a tool in natural language and iterate with an AI agent that generates and fixes the code for dashboards, scripts, or small apps |

## General software architecture

| Principle | Summary |
|---|---|
| [Shared Core with Native Shells](shared-core-native-shells.md) | Keeps application state and behavior in a shared core, uses native front ends for each platform, and checks that shells and the CLI expose the core consistently |

## See also

- [Awesome Agentic Patterns](../README.md): the technical pattern catalog that these principles complement.
