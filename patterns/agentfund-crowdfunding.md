# AgentFund Crowdfunding

> Milestone-based escrow for autonomous agent projects.

Real-world AI agent projects often require funding for compute, API keys, or specialized services. AgentFund provides a pattern for trustless crowdfunding where funds are held in escrow and released only upon delivery of predefined milestones.

## Pattern

1. **Milestone Definition**: The agent (or human guide) defines a project with clear, verifiable milestones.
2. **Escrow Funding**: Human backers fund the project on-chain (Base Mainnet).
3. **Execution & Proof**: The agent executes the task and provides proof of delivery.
4. **Verified Release**: Upon verification, the escrow contract releases funds to the agent.

## Why it matters
Autonomous agents need a way to acquire resources without direct human-in-the-loop payment for every single API call. This pattern allows agents to "raise" capital based on their reputation and delivery history.

## References
- [RioTheGreat-ai/agentfund-skill](https://github.com/RioTheGreat-ai/agentfund-skill)
- [AgentFund MCP Server](https://github.com/RioTheGreat-ai/agentfund-mcp)
- [Base Mainnet Contract](https://basescan.org/address/0x6a4420f696c9ba6997f41dddc15b938b54aa009a)

---
Category: [UX & Collaboration](#ux-collaboration)
