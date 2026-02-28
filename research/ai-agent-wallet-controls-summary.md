# AI Agent Wallet Controls and Spending Limits - Research Summary

**Research Date:** February 27, 2026

---

## Incident Case Studies

### 1. Lethal Trifecta Financial Exploitation (Simon Willison, June 2025)

**What Happened:**
The "Lethal Trifecta" threat model documents how combining three agent capabilities creates straightforward paths for financial exploitation:
1. Access to private data (including wallet credentials)
2. Exposure to untrusted content (prompt injection)
3. Ability to externally communicate (initiate transactions)

**Vendor Incidents:**
- **Microsoft 365 Copilot:** Initial implementations exposed private documents + untrusted inputs + external sharing
- **GitHub MCP:** One implementation "mixed all three patterns in a single tool"
- **GitLab Duo Chatbot:** Risk of code/data exfiltration

**How It Relates to Non-Custodial Spending Controls:**
- Direct wallet signing in agent contexts creates the lethal trifecta
- Policy validation must occur outside the agent's prompt context
- Fail-closed behavior prevents bypass through prompt injection
- Audit trails are essential for incident response

**Lessons Learned:**
- Agents should never hold private keys directly
- Policy validation must be enforced in code, not prompts
- Non-custodial controls break the trifecta by separating signing from validation

### 2. Cost Control Failures in Production Agents

**What Happened:**
- Runaway token spend from agents routing to frontier models without cost consideration
- Infinite loops or recursive patterns continuing indefinitely
- No hard caps - soft budget guidance in prompts is insufficient

**Real-World Impact:**
- Teams reported LLM bills "growing faster than product value"
- Single runaway agent sessions costing thousands of dollars
- Quality degradation when attempting to manually throttle after overspending

**How It Relates to Non-Custodial Spending Controls:**
- Spending controls must be enforced in code/policy, not prompts
- Pre-flight cost estimation and circuit breaking are shared patterns
- Multi-level budgeting scales from tokens to financial transactions

**Lessons Learned:**
- Hard caps must be enforced before execution, not monitored after
- Multiple validation stages (pre-flight, runtime, post-call) provide defense in depth
- Budget visibility improves agent decision-making behavior

---

## Successful Deployments

### 1. PolicyLayer (https://policylayer.com)

**What It Offers:**
- Explicit policy enforcement layer between agent and transaction signing
- Intent-first workflow where agents never sign directly
- Non-custodial boundary - policy service validates but never stores private keys
- Fail-closed behavior when policy checks are unavailable

**Implementation Features:**
- Per-asset and per-endpoint spending budgets
- Cadence constraints (frequency/throttle) and daily/hourly spend caps
- Allowlists/blocklists for critical counterparties
- Structured audit logs for every denied/allowed decision

**How It Relates to Non-Custodial Spending Controls:**
- Core reference implementation for the pattern
- Demonstrates that policy validation can be separate from custody
- Shows that audit trails support governance and incident review

**Lessons Learned:**
- Latency per transaction is acceptable given security benefits
- High availability of policy service is operational requirement
- Policy misconfiguration can block legitimate work (requires careful design)

### 2. Coinbase Agentic Wallet Controls (https://www.coinbase.com)

**What It Offers:**
- Wallet controls specifically designed for AI agents
- Permission-based transaction validation
- Spending limit enforcement at infrastructure level
- Integration with agent frameworks

**How It Relates to Non-Custodial Spending Controls:**
- Demonstrates that major crypto infrastructure providers recognize agent wallet risk
- Shows that non-custodial controls can be integrated into existing platforms

**Lessons Learned:**
- Agent-specific controls are needed beyond standard wallet security
- Integration with popular agent frameworks drives adoption
- Real-time monitoring is essential for operational visibility

### 3. OpenFort (https://www.openfort.xyz)

**What It Offers:**
- Game and app wallet infrastructure with policy-based controls
- Session-based spending limits
- Per-action policy validation
- Transaction simulation before execution

**How It Relates to Non-Custodial Spending Controls:**
- Shows pattern applicability beyond pure financial apps
- Demonstrates that policy changes don't require prompt updates

**Lessons Learned:**
- Policy layer separation enables flexibility
- Transaction simulation prevents unexpected state changes
- Gaming context provides useful stress test for spending controls

### 4. LiteLLM Router (Cost Control Model)

**What It Offers:**
- Cost-based routing strategy with configurable `budget_limit` parameter
- Real-time cost monitoring across teams and users
- Multi-level budgeting at user, team, and organizational levels

**Production Results:**
- 49.5-70% cost reduction in documented deployments
- $3,000+ monthly savings with 40% lower response times

**How It Relates to Non-Custodial Spending Controls:**
- Demonstrates that hard caps can be enforced effectively
- Shows that multi-level budgeting scales to organizations

**Lessons Learned for Wallet Controls:**
- Hard caps are enforceable with proper architecture
- Distributed budget pooling enables multi-agent coordination
- Real-time monitoring supports operational decision-making

### 5. AgentBudget SDK (https://github.com/sahiljagtap08/agentbudget)

**What It Offers:**
- Hard dollar limits on agent sessions
- Zero infrastructure - pure Python SDK
- Automatic circuit breaking when budget exhausted
- Drop-in patching mode

**Implementation:**
```python
import agentbudget
agentbudget.init("$5.00")  # Hard budget cap
# All LLM calls now tracked
# Automatic circuit breaking when exceeded
```

**How It Relates to Non-Custodial Spending Controls:**
- Shows that hard caps can be enforced with SDK-level instrumentation
- Demonstrates that automatic circuit breaking prevents overspend

**Lessons Learned for Wallet Controls:**
- SDK-level enforcement is more reliable than application-level checks
- Automatic circuit breaking prevents "runaway" scenarios
- Zero-infrastructure approach accelerates adoption

### 6. Mandate Runtime Enforcement (https://github.com/kashaf12/mandate)

**What It Offers:**
- Runtime spending limit enforcement
- Multi-process budget sharing via Redis
- Per-call and total cost limits
- Distributed state management

**How It Relates to Non-Custodial Spending Controls:**
- Demonstrates distributed budget management for multi-agent systems
- Shows that Redis-backed state enables coordination

**Lessons Learned for Wallet Controls:**
- Multi-agent scenarios require shared budget state
- Atomic operations prevent race conditions

### 7. HumanLayer Approval Framework (https://docs.humanlayer.dev/)

**What It Offers:**
- Systematic human approval gates for high-risk functions
- Multi-channel approval interface (Slack, email, SMS, web)
- Lightweight feedback loops without blocking workflows

**Implementation:**
```python
from humanlayer import HumanLayer
hl = HumanLayer()

@hl.require_approval(channel="slack")
def execute_transaction(to: str, amount: float):
    """Execute transaction - requires approval"""
    return wallet.send(to, amount)
```

**How It Relates to Non-Custodial Spending Controls:**
- Provides additional safety layer for high-value transactions
- Demonstrates that approval gates don't require blocking all operations

**Lessons Learned for Wallet Controls:**
- Approval fatigue requires selective, not blanket, approvals
- Multi-channel support improves response times
- Audit trails enable compliance and debugging

---

## Relevant Standards

### 1. EIP-3074: Auth and Authcall Opcodes

**Status:** Ethereum Improvement Proposal
**Source:** https://eips.ethereum.org/EIPS/eip-3074

**What It Offers:**
- Two new opcodes: `AUTH` and `AUTHCALL`
- Transaction sponsors can sign intents on behalf of users
- Smart contract wallets can act as standalone accounts
- Batched transactions and gas sponsorship

**How It Relates to Non-Custodial Spending Controls:**
- Enables temporary delegation of signing to AI agents with time limits
- Allows policy enforcement through sponsor smart contracts
- Supports batched operations with single approval

**Agent Use Cases:**
- Time-limited delegation: Agent can sign for 1 hour, then authority expires
- Sponsored transactions: Agent operations don't require holding ETH for gas
- Policy-based delegation: Smart contract enforces spending limits per transaction

**Best Practices:**
- Set short time limits for delegation (minutes to hours)
- Implement per-transaction and cumulative spending limits
- Use allowlists for contract addresses
- Require renewal for extended operations

### 2. EIP-4337: Account Abstraction

**Status:** Final
**Source:** https://eips.ethereum.org/EIPS/eip-4337

**What It Offers:**
- Account abstraction without consensus-layer protocol changes
- UserOperations instead of regular transactions
- Smart contract wallets can pay gas fees for users (gasless transactions)
- Separated roles: Bundlers, paymasters, and aggregators

**How It Relates to Non-Custodial Spending Controls:**
- Smart contract wallets can enforce arbitrary spending policies
- Paymasters enable gasless agent operations
- UserOperations enable batched policy validation

**Agent Use Cases:**
- Policy-enforced wallets: Smart contract validates all agent operations
- Gas sponsorship: Paymaster covers gas so agent doesn't need ETH
- Batched operations: Multiple agent actions validated atomically
- Time-locked operations: Operations scheduled with delay for cancellation

**Best Practices:**
- Implement per-time-period spending limits (hourly, daily, weekly)
- Use allowlists for contracts and recipients
- Implement time-locks for high-value operations
- Enable owner override to revoke agent access

### 3. ERC-7715: Permissions and Delegation

**Status:** Draft
**Source:** https://eips.ethereum.org/EIPS/eip-7715

**What It Offers:**
- Standardized permissions for wallet delegation
- Granular control over what external agents can do
- Permission scopes for different operation types
- Time-limited delegation with automatic expiration

**How It Relates to Non-Custodial Spending Controls:**
- Provides standard way to grant limited wallet permissions to agents
- Enables granular control without full key exposure
- Supports time-limited sessions for agent operations

**Agent Use Cases:**
- Scoped permissions: Agent can only interact with specific contracts
- Amount limits: Agent can spend up to X total per time period
- Time-limited sessions: Agent permissions expire after set duration

**Best Practices:**
- Use short durations for initial delegation (extend if needed)
- Implement per-contract allowlists rather than blanket permissions
- Set conservative spending limits with manual override

### 4. Safe (formerly Gnosis Safe)

**Website:** https://safe.global

**What It Offers:**
- Multi-signature wallet with configurable threshold
- Transaction proposal and approval workflow
- Advanced access controls for spending limits
- Module system for extending functionality

**Agent Integration Patterns:**
- Agent as Proposer: Agent proposes transactions, human approves
- Spending Limit Module: Agent can execute within limits without approvals
- Time-Locked Operations: Agent proposes, delay before execution

**Best Practices for Agents:**
- Configure agent as signer with low threshold for small amounts
- Use spending limit modules for automated operations
- Implement time-locks for high-value transactions
- Maintain separate Safe for agent operations vs main treasury

### 5. Argent Wallet

**Website:** https://www.argent.xyz

**What It Offers:**
- Social recovery mechanism
- Guard system for transaction validation
- Limit modules for spending controls
- Multicall support for batched operations

**Agent Integration Patterns:**
- Agent as Guardian with limited approval powers
- Transaction Guards: Validate all outgoing transactions
- Limit Modules: Daily or weekly spending limits

**Best Practices for Agents:**
- Implement custom guard contracts with agent-specific logic
- Use limit modules to cap daily/weekly spend
- Configure separate recovery process for agent-compromise scenarios
- Test guard logic thoroughly before mainnet deployment

---

## Synthesis and Recommendations

### Common Patterns Across Implementations

1. **Intent-First Workflow:**
   - Agents never sign directly
   - Policy validation precedes signing
   - Separation of proposal and execution

2. **Multi-Level Budgeting:**
   - Per-transaction limits
   - Per-time-period caps (hourly, daily, weekly)
   - Cumulative lifetime limits

3. **Allowlist/Blocklist Enforcement:**
   - Allowed contracts and recipients
   - Blocked addresses and risky protocols

4. **Time-Limited Delegation:**
   - Short durations for initial access
   - Automatic expiration requires renewal
   - Emergency revocation capability

5. **Audit Trail Logging:**
   - Every proposed transaction logged
   - Allow/deny decisions with reasoning

### Best Practices for Agent Wallet Controls

1. **Never Give Agents Private Keys**
   - Use smart contract wallets with policy enforcement
   - Implement intent-based workflows
   - Maintain separate agent identity from master wallet

2. **Implement Defense in Depth**
   - Policy layer + approval gates + time-locks + audit logs
   - Multiple validation stages
   - Fail-closed behavior for uncertain situations

3. **Start Conservative and Expand**
   - Begin with low limits and narrow allowlists
   - Monitor operations and adjust based on behavior
   - Implement graduated trust models

4. **Design for Human Intervention**
   - Multi-channel approval (Slack, email, SMS, web)
   - Cancellation windows for time-locked operations
   - Emergency pause mechanisms

5. **Log Everything**
   - Proposed transactions with full context
   - Policy validation results
   - Approval/rejection decisions with reasons

---

## Sources

- [PolicyLayer](https://policylayer.com)
- [Coinbase Agentic Wallet](https://www.coinbase.com)
- [OpenFort](https://www.openfort.xyz)
- [LiteLLM Router](https://docs.litellm.ai/)
- [AgentBudget SDK](https://github.com/sahiljagtap08/agentbudget)
- [Mandate Runtime Enforcement](https://github.com/kashaf12/mandate)
- [HumanLayer](https://docs.humanlayer.dev/)
- [EIP-3074](https://eips.ethereum.org/EIPS/eip-3074)
- [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337)
- [ERC-7715](https://eips.ethereum.org/EIPS/eip-7715)
- [Safe Smart Contract Wallet](https://safe.global)
- [Argent Wallet](https://www.argent.xyz)
- [Lethal Trifecta Threat Model](https://simonwillison.net/2025/Jun/16/lethal-trifecta/)
