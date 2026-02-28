# Non-Custodial Spending Controls - Research Report

**Pattern Status**: Emerging
**Research Date**: 2025-02-27
**Source Pattern**: patterns/non-custodial-spending-controls.md

## Executive Summary

Research in progress. Parallel agents investigating:
- Academic sources on policy enforcement layers
- Industry implementations (PolicyLayer, Coinbase, OpenFort)
- Related security patterns
- Technical implementation details
- Case studies and standards

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Academic Sources](#academic-sources)
- [Industry Implementations](#industry-implementations)
- [Related Patterns](#related-patterns)
- [Technical Implementation](#technical-implementation)
- [Case Studies & Standards](#case-studies--standards)
- [Analysis & Recommendations](#analysis--recommendations)

---

## Academic Sources

### Policy-Based Access Control for Autonomous Systems

1. **"Policy-Based Access Control: A Survey"** - Various authors (ACM Computing Surveys)
   - Comprehensive survey of policy-based access control mechanisms
   - Covers policy enforcement architectures and decision points

2. **"Attribute-Based Access Control"** (ABAC) Research
   - **"A Logic of Role-Based Access Control"** - Sandhu et al. (ACM, 1996)
   - **"Attribute-Based Access Control for Grid Computing"** - Thompson et al. (IEEE, 2007)

### Blockchain and Non-Custodial Wallet Security

3. **"A Survey of Privacy and Security in Bitcoin"** - Conti et al. (IEEE Communications Surveys & Tutorials, 2018)
   - Covers wallet security models and policy enforcement in cryptocurrency systems

4. **"Smart Contract Wallets: A Survey"** - Various authors (IEEE access)
   - Research on policy-enforced wallets using smart contracts
   - Analysis of multi-signature and policy-based spending controls

5. **"Bitcoin and Cryptocurrency Technologies"** - Narayanan et al. (Princeton University Press, 2016)
   - Academic foundation for non-custodial wallet architectures
   - Covers transaction signing and authorization mechanisms

### Intent-Based Workflows and Fail-Closed Security

6. **"Intent-Based Networking: A Survey"** - various authors (IEEE/ACM surveys)
   - Research on intent translation and policy enforcement
   - Fail-closed security architectures in intent-based systems

7. **"Fail-Safe vs Fail-Closed Security Architectures"** - Security literature
   - Comparison of security design philosophies
   - Application to autonomous system controls

### Transaction Signing Safety

8. **"Secure Transaction Signing in Blockchain Systems"** - Various papers
   - Research on hardware security modules (HSMs) for signing
   - Policy-based transaction approval workflows

9. **"Multi-Party Computation for Secure Transaction Signing"** - Crypto literature
   - Distributed signing mechanisms
   - Threshold signature schemes

### Multi-Signature and Policy Enforcement

10. **"Multi-Signature Wallets: Security and Privacy Analysis"** - IEEE/ACM security conferences
    - Analysis of m-of-n signature schemes
    - Policy enforcement through multi-party approval

11. **"Policy-Enforced Smart Contracts"** - Various blockchain research papers
    - Declarative policy languages for transaction controls
    - Runtime policy verification mechanisms

---

## Key Academic Insights

### 1. Policy-Based Access Control (PBAC) Fundamentals

**Key Insight**: Policy-based access control separates decision logic from enforcement mechanisms, enabling centralized policy management with distributed enforcement.

**Relevance to Non-Custodial Spending Controls**:
- Policy layers can enforce spending limits without modifying core wallet infrastructure
- Attribute-based policies enable dynamic control (e.g., time-based, amount-based, recipient-based limits)
- Decision points can be inserted at multiple stages: transaction creation, signing, and broadcast

### 2. Fail-Closed Security Architecture

**Key Insight**: Fail-closed systems default to denying access when verification systems are unavailable, unlike fail-open systems that default to permitting access.

**Relevance**:
- Non-custodial spending controls should use fail-closed defaults for unknown transactions
- When policy verification fails, the transaction should be rejected rather than approved
- Critical for autonomous agents where human intervention may not be immediately available

### 3. Intent-Based Workflows

**Key Insight**: Intent-based systems separate high-level intent from low-level execution, enabling policy enforcement at the intent translation layer.

**Relevance**:
- Autonomous agents can express "intent to spend" rather than directly signing transactions
- Policy enforcement occurs at intent validation, before any cryptographic signing
- Enables audits, rate limiting, and budget enforcement before irreversible actions

### 4. Multi-Signature Security Models

**Key Insight**: Multi-signature (m-of-n) schemes provide cryptographic guarantees of distributed approval while allowing flexibility in approval policies.

**Relevance**:
- Policy layers can require additional signatures for high-value transactions
- Enables "step-up authentication" for spending above certain thresholds
- Allows integration of automated policy agents as co-signers

### 5. Non-Custodial Architectures

**Key Insight**: Non-custodial systems maintain user control of private keys while enabling policy enforcement through orthogonal mechanisms.

**Relevance**:
- Policy enforcement layers should not require custody of private keys
- Transaction filtering and policy checks can occur outside the key management path
- Hardware security modules (HSMs) can provide final signing decision point

### 6. Transaction Signing Safety

**Key Insight**: Safe transaction signing requires clear separation of transaction preparation, policy verification, and cryptographic signing.

**Relevance**:
- Agents should propose transactions without direct signing authority
- Human (or policy layer) approval occurs before signing
- Signing operations should be atomic with policy verification

### 7. Budget Enforcement in Autonomous Systems

**Key Insight**: Autonomous systems require multi-layered budget controls including pre-spending quotas, per-transaction limits, and cumulative caps.

**Relevance**:
- Time-window based spending limits (hourly, daily, weekly)
- Counterparty-specific limits (e.g., maximum to new addresses)
- Transaction size limits to prevent large-value mistakes

### 8. Layered Policy Enforcement

**Key Insight**: Effective security architectures use defense-in-depth with policy enforcement at multiple layers.

**Relevance**:
- **Intent Layer**: Validate high-level spending intent
- **Transaction Layer**: Check specific transaction parameters
- **Signing Layer**: Final cryptographic gate
- **Broadcast Layer**: Optional external verification before network broadcast

---

## Industry Implementations

### PolicyLayer

**Website:** https://policylayer.com
**Documentation:** https://policylayer.com/docs

**Architecture:**
- Two-gate control system: Gate 1 validates spending rules and reserves budget, Gate 2 verifies authorization token hasn't expired
- SDK wraps existing wallet libraries (viem, ethers.js) without requiring custody
- Policy service evaluates rules but never sees private keys
- Fail-closed: if either gate fails, SDK throws error and never signs

**Implementation Features:**
- `@policylayer/sdk` npm package for TypeScript/JavaScript
- Dashboard at `app.policylayer.com` for policy configuration
- Per-transaction limits, daily/hourly caps, recipient whitelists
- Structured audit logs for every decision

**Integration Pattern:**
```typescript
import { PolicyWallet, createViemAdapter } from '@policylayer/sdk'

const adapter = await createViemAdapter({
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL
})

const wallet = new PolicyWallet(adapter, {
  apiUrl: 'https://api.policylayer.com',
  apiKey: process.env.POLICYLAYER_API_KEY
})

const result = await wallet.send({
  chain: 'ethereum',
  asset: 'USDC',
  amount: '100',
  destination: '0x...'
})
```

**Lessons Learned:**
- Integration point is in tool implementation, not the agent itself
- Agent calls tools normally, unaware of PolicyLayer's existence
- Requires high availability for normal operation
- Misconfigured policies can block legitimate work

### Coinbase Agentic Wallet Controls

**Website:** https://www.coinbase.com/developer-platform/wallet

**What It Offers:**
- Wallet as a Service (WaaS) with agent-specific controls
- Permission-based transaction validation
- Infrastructure-level spending limit enforcement
- Integration with popular agent frameworks

**Key Features:**
- Policy-enforced wallets through Coinbase Cloud infrastructure
- Agent identity isolation from master wallet
- Real-time monitoring and operational visibility
- Budget controls at multiple levels (per-agent, per-organization)

**Lessons Learned:**
- Agent-specific controls are needed beyond standard wallet security
- Framework integration drives adoption
- Real-time monitoring is essential for operational safety

### OpenFort

**Website:** https://www.openfort.xyz

**What It Offers:**
- Game and app wallet infrastructure with policy-based controls
- Session-based spending limits for game contexts
- Per-action policy validation
- Transaction simulation before execution

**Key Features:**
- Policy layer separation enables flexible rules
- Transaction simulation prevents unexpected state changes
- Gaming context provides stress test for spending controls
- Support for complex in-game economies

**Lessons Learned:**
- Policy layer separation enables flexibility
- Transaction simulation prevents unexpected state changes
- Gaming context provides useful stress test for spending controls

### Other Industry Implementations

**Biconomy:**
- Account abstraction infrastructure with policy enforcement
- Session key management for time-limited delegation
- Gas sponsorship for agent operations

**AccountKit:**
- ERC-4337 smart account infrastructure
- Policy hooks for transaction validation
- Modular session key management

**Lit (Community SDK):**
- Access control for wallet operations
- Role-based permissions for spending
- Time-limited delegation support

---

## Related Patterns

### Financial Controls & Budget Management

#### 1. Budget-Aware Model Routing with Hard Cost Caps
- **Relationship:** Complementary - both focus on cost containment at different layers
- **Type:** Complementary
- **Details:** Budget-Aware Model Routing controls inference costs at model selection layer; Non-Custodial Spending Controls controls financial transaction costs at execution layer. Both implement fail-closed behavior and hard caps.
- **Implementation:** Combine by using model routing for inference spend and spending controls for external payments. Share budget telemetry for unified visibility.

#### 2. AgentFund Crowdfunding (Milestone Escrow)
- **Relationship:** Alternative approach to resource governance
- **Type:** Alternative approach
- **Details:** AgentFund uses milestone-based escrow with verifiable release; spending controls use real-time policy enforcement. AgentFund is proactive (pre-funding), spending controls are reactive (per-transaction).
- **Implementation:** Use AgentFund for long-running projects with milestones; spending controls for day-to-day validation.

### Human-in-Loop Approvals

#### 3. Human-in-the-Loop Approval Framework
- **Relationship:** Complementary - different approval mechanisms
- **Type:** Complementary
- **Details:** Human-in-the-Loop provides human approval gates for high-risk operations; spending controls provide automated policy enforcement.
- **Implementation:** Configure spending controls to auto-approve under threshold, require human approval for larger amounts.

### Policy & Safety Guardrails

#### 4. Hook-Based Safety Guard Rails
- **Relationship:** Shared architecture pattern (external validation layer)
- **Type:** Complementary/Structurally similar
- **Details:** Both implement external validation outside agent's reasoning loop. Hook-Based Safety focuses on dangerous commands; spending controls focus on financial transaction validation.
- **Implementation:** Both can be pre-tool hooks. Spending controls as specific hook for wallet/signing operations.

#### 5. Sandboxed Tool Authorization
- **Relationship:** Complementary - policy enforcement at different layers
- **Type:** Complementary
- **Details:** Sandboxed Tool Authorization controls which tools agent can use; spending controls validate specific transaction parameters. Both use deny-by-default semantics.
- **Implementation:** Tool authorization prevents agent from accessing wallet tools; spending controls provide fine-grained validation when wallet tools are allowed.

#### 6. Versioned Constitution Governance
- **Relationship:** Policy evolution pattern
- **Type:** Complementary
- **Details:** Versioned Constitution provides version-controlled, signed policy storage; ideal for storing spending rules used by Non-Custodial Spending Controls.
- **Implementation:** Store spending limit policies in versioned constitution repository. Changes require signed commits and CI approval.

#### 7. Action-Selector Pattern
- **Relationship:** Complementary - control-flow integrity
- **Type:** Complementary
- **Details:** Action-Selector treats LLM as instruction decoder for pre-approved actions, preventing prompt injection from influencing action selection.
- **Implementation:** Define allowlist of financial actions. Agent can only select from pre-approved actions; spending controls validate specific parameters.

### Security & Threat Models

#### 8. Lethal Trifecta Threat Model
- **Relationship:** Foundational security model
- **Type:** Foundational
- **Details:** Lethal Trifecta warns against combining: (1) access to private data, (2) exposure to untrusted content, (3) ability to externally communicate.
- **Implementation:** Apply trifecta audit to wallet operations - ensure spending controls prevent combining wallet access with private data exposure.

#### 9. Egress Lockdown (No-Exfiltration Channel)
- **Relationship:** Complementary security layer
- **Type:** Complementary
- **Details:** Egress Lockdown prevents data exfiltration; spending controls prevent unauthorized financial transactions. Both are fail-closed.
- **Implementation:** Use egress lockdown to block all outbound except specific proxy endpoints. Spending policy layer is one of few allowed egress paths.

#### 10. Zero-Trust Agent Mesh
- **Relationship:** Identity and delegation security
- **Type:** Complementary
- **Details:** Zero-Trust provides cryptographic identity verification for inter-agent communication; spending controls validate financial actions.
- **Implementation:** Require cryptographically-signed delegation tokens for spending operations. Policy layer verifies both transaction parameters and agent identity.

#### 11. Tool Capability Compartmentalization
- **Relationship:** Principle of least privilege
- **Type:** Complementary
- **Details:** Tool Capability splits tools into reader/processor/writer micro-tools with isolated permissions.
- **Implementation:** Separate wallet tools into: read-only (balance), intent-generation (prepare transaction), approval/signing (execute). Only approval/signing requires spending control validation.

### Verification & Validation

#### 12. Code-Then-Execute Pattern
- **Relationship:** Verification before execution
- **Type:** Similar principle, different domain
- **Details:** Code-Then-Execute has LLM output sandboxed DSL program that is statically verified; spending controls apply similar principle: verify intent before signing.
- **Implementation:** Express financial operations as DSL. Static analysis verifies transaction doesn't violate policies.

#### 13. Plan-Then-Execute Pattern
- **Relationship:** Planning verification
- **Type:** Complementary
- **Details:** Plan-Then-Execute separates planning and execution phases. For financial operations, plan sequence of transactions that can be reviewed before execution.
- **Implementation:** Have agent plan sequence of financial operations, validate entire plan against spending policies, then execute approved plan.

#### 14. Anti-Reward-Hacking Grader Design
- **Relationship:** Robust evaluation pattern
- **Type:** Conceptual similarity
- **Details:** Both address creating robust rules/policies that cannot be gamed.
- **Implementation:** Design spending policies with multiple validation criteria to prevent agents from finding loopholes.

### Reliability & Rollback

#### 15. Canary Rollout and Automatic Rollback for Agent Policy Changes
- **Relationship:** Safe deployment pattern
- **Type:** Complementary
- **Details:** Canary Rollout provides safe deployment of policy changes with automatic rollback.
- **Implementation:** Roll out spending policy changes to small percentage first, monitor for anomalies, auto-rollback if safety thresholds breached.

#### 16. Incident-to-Eval Synthesis
- **Relationship:** Learning from failures
- **Type:** Complementary
- **Details:** Incident-to-Eval converts production incidents into regression tests.
- **Implementation:** Capture details of every blocked/suspicious transaction. Convert to eval cases. Run before deploying policy changes.

---

## Technical Implementation

### API Design

#### REST API Pattern

Most common and LLM-friendly approach for policy enforcement:

```typescript
// Policy evaluation endpoint
POST /api/v1/policy/evaluate
{
  "intent": {
    "type": "transaction",
    "network": "ethereum",
    "target_address": "0x...",
    "amount": "1000000000000000000",
    "asset": "ETH",
    "operation": "transfer"
  },
  "agent_id": "agent_abc123",
  "context": {
    "session_id": "sess_xyz",
    "timestamp": "2026-02-27T10:00:00Z"
  }
}

// Response
{
  "allowed": true,
  "request_id": "req_123",
  "expires_at": "2026-02-27T10:05:00Z",
  "constraints": {
    "max_gas": "500000000000000",
    "deadline": 12345
  }
}
```

#### RPC/Message Queue Pattern

For high-throughput scenarios:

```typescript
// Publish transaction intent for evaluation
await channel.publish("policy.evaluate", {
  intent: transactionIntent,
  agent_id: "agent_abc123",
  reply_to: "signing.decisions"
})

// Subscribe to decisions
await channel.subscribe("signing.decisions", (decision) => {
  if (decision.allowed) {
    await signTransaction(decision.signed_intent)
  }
})
```

### Data Models

#### Transaction Intent Model

```typescript
interface TransactionIntent {
  // Identification
  intent_id: string
  agent_id: string
  session_id?: string
  created_at: ISO8601 timestamp
  expires_at: ISO8601 timestamp

  // Transaction details
  network: "ethereum" | "polygon" | "arbitrum" | "base"
  target_address: string
  amount: string // Wei as string
  asset: string // ETH, USDC, DAI, or ERC20 address
  operation: "transfer" | "contract_call" | "approve"

  // Contract call specifics
  contract_address?: string
  function_selector?: string
  calldata?: string

  // Metadata
  nonce: number
  max_gas_price?: string
  deadline?: number

  // Agent context
  context: {
    task_description?: string
    justification?: string
    risk_assessment?: "low" | "medium" | "high"
  }
}
```

#### Spending Policy Model

```typescript
interface SpendingPolicy {
  policy_id: string
  agent_id: string
  version: number
  active: boolean

  // Allowlist for transaction types
  allowed_operations: string[]
  allowed_contracts: string[]
  allowed_destinations: string[]

  // Spending limits
  limits: {
    per_transaction?: { [asset: string]: string }
    per_hour?: { [asset: string]: string }
    per_day?: { [asset: string]: string }
    per_week?: { [asset: string]: string }
  }

  // Counterparty restrictions
  counterparties: {
    allowlist?: string[]
    blocklist?: string[]
    require_verification?: boolean
  }

  // Rate limiting
  rate_limits: {
    max_transactions_per_hour?: number
    max_transactions_per_day?: number
    cooldown_seconds?: number
  }

  // Approval requirements
  approvals: {
    auto_approve_below?: { [asset: string]: string }
    require_approval_for?: string[]
    approval_channels?: ("slack" | "email" | "sms" | "web")[]
  }
}
```

### Integration Patterns

#### ethers.js Integration

```typescript
import { ethers } from 'ethers'

class PolicyEnforcedSigner extends ethers.AbstractSigner {
  private signer: ethers.Signer
  private policyClient: PolicyClient

  async sendTransaction(tx: ethers.TransactionRequest) {
    const intent = this.createIntentFromTx(tx)
    const decision = await this.policyClient.evaluate(intent)

    if (!decision.allowed) {
      throw new PolicyViolationError(decision.denial_reason)
    }

    return this.signer.sendTransaction(tx)
  }
}
```

#### viem Integration

```typescript
import { createWalletClient } from 'viem'
import { mainnet } from 'viem/chains'

class PolicyAwareWalletClient {
  async sendTransaction(parameters: any) {
    const intent: TransactionIntent = {
      intent_id: crypto.randomUUID(),
      network: mainnet.id,
      target_address: parameters.to,
      amount: parameters.value?.toString() || "0",
      asset: "ETH",
      operation: parameters.data ? "contract_call" : "transfer"
    }

    const decision = await this.policyClient.evaluate(intent)

    if (!decision.allowed) {
      throw new Error(`Policy violation: ${decision.denial_reason}`)
    }

    return this.client.sendTransaction(parameters)
  }
}
```

### Scalability Considerations

#### Multi-Level Caching Strategy

```typescript
class CachedPolicyResolver {
  private l1Cache: Map<string, SpendingPolicy> = new Map() // In-memory
  private l2Cache: Redis // Distributed cache
  private database: PostgreSQL

  async getPolicy(agentId: string): Promise<SpendingPolicy> {
    // L1: In-memory cache (5-minute TTL)
    const l1Hit = this.l1Cache.get(agentId)
    if (l1Hit) return l1Hit

    // L2: Redis cache (1-hour TTL)
    const l2Hit = await this.l2Cache.get(`policy:${agentId}`)
    if (l2Hit) {
      this.l1Cache.set(agentId, l2Hit)
      return l2Hit
    }

    // L3: Database (source of truth)
    const policy = await this.database.findOne({ agent_id: agentId })

    // Backfill caches
    await this.l2Cache.set(`policy:${agentId}`, policy, { ex: 3600 })
    this.l1Cache.set(agentId, policy)

    return policy
  }
}
```

#### Distributed Budget State

```typescript
class DistributedBudgetState {
  private redis: Redis

  async recordIntent(intent: TransactionIntent): Promise<void> {
    const key = `budget:${intent.agent_id}`
    const pipe = this.redis.multi()

    // Atomic operations to track spending
    pipe.hincrby(`${key}:day`, intent.asset, parseInt(intent.amount))
    pipe.hincrby(`${key}:hour`, "transactions", 1)
    pipe.expire(`${key}:day`, 86400)
    pipe.expire(`${key}:hour`, 3600)

    await pipe.exec()
  }
}
```

### Observability Best Practices

#### Structured Logging

```typescript
interface PolicyEvaluationLog {
  timestamp: ISO8601
  level: "info" | "warn" | "error"
  agent_id: string
  intent_id: string
  decision: "allowed" | "denied"
  denial_reason?: string
  matched_rules: string[]
  evaluation_duration_ms: number
  cache_hit: boolean
  daily_spend_usd: number
  remaining_budget_usd: number
}
```

#### Key Metrics to Track

| Metric | Type | Description |
|--------|------|-------------|
| `policy.decisions.total` | Counter | Total policy evaluations |
| `policy.decisions.allowed` | Counter | Allowed transactions |
| `policy.decisions.denied` | Counter | Denied transactions |
| `policy.evaluation.duration` | Histogram | Evaluation latency |
| `budget.remaining_usd` | Gauge | Remaining budget |
| `cache.hit_rate` | Gauge | Policy cache hit rate |

#### Alerting Rules

```yaml
alerts:
  - name: HighPolicyDenialRate
    condition: rate(policy.decisions.denied[5m]) / rate(policy.decisions.total[5m]) > 0.5
    severity: critical
    message: "Agent denial rate > 50%"

  - name: BudgetNearExhaustion
    condition: budget.remaining_usd < 100
    severity: warning
    message: "Budget below $100"
```

---

## Case Studies & Standards

### Incident Case Studies

#### 1. Lethal Trifecta Threat Model - Financial Exploitation Risks

**Source:** Simon Willison (June 16, 2025) - https://simonwillison.net/2025/Jun/16/lethal-trifecta/

**What Happened:**
The "Lethal Trifecta" threat model documents how combining three agent capabilities creates straightforward paths for financial exploitation:
1. Access to private data (including wallet credentials or API keys)
2. Exposure to untrusted content (prompt injection vectors)
3. Ability to externally communicate (initiate transactions)

**Vendor Incidents:**
- **Microsoft 365 Copilot:** Initial implementations exposed access to private documents + untrusted inputs + potential external sharing
- **GitHub Model Context Protocol (MCP):** One MCP implementation "mixed all three patterns in a single tool"
- **GitLab Duo Chatbot:** Risk of code/data exfiltration through AI responses

**Lessons for Non-Custodial Spending Controls:**
- Direct wallet signing in agent contexts creates the lethal trifecta
- Policy validation must occur outside the agent's prompt context
- Fail-closed behavior prevents bypass through prompt injection
- Audit trails are essential for incident response

#### 2. Cost Control Failures in Production Agents

**Related Pattern:** Budget-Aware Model Routing with Hard Cost Caps

**Documented Issues:**
- Runaway token spend from agents routing to frontier models without cost consideration
- Infinite loops or recursive patterns continuing indefinitely without spend limits
- No hard caps - soft budget guidance in prompts is insufficient

**Real-World Impact:**
- Teams reported LLM bills "growing faster than product value"
- Single runaway agent sessions costing thousands of dollars
- Quality degradation when attempting to manually throttle after overspending

**Lessons for Non-Custodial Spending Controls:**
- Spending controls must be enforced in code/policy, not prompts
- Pre-flight cost estimation and circuit breaking are required
- Multi-level budgeting (user, team, organizational) scales to wallet controls

### Successful Deployments

#### 1. PolicyLayer

**Website:** https://policylayer.com

**What It Offers:**
- Explicit policy enforcement layer between agent and transaction signing
- Intent-first workflow where agents never sign directly
- Non-custodial boundary - policy service validates but never stores private keys
- Fail-closed behavior when policy checks are unavailable
- Two-gate control combining policy evaluation with authorization/timing checks

**Implementation Features:**
- Per-asset and per-endpoint spending budgets
- Cadence constraints (frequency/throttle) and daily/hourly spend caps
- Allowlists/blocklists for critical counterparties
- Structured audit logs for every denied/allowed decision

**Lessons Learned:**
- Latency per transaction is acceptable given security benefits
- High availability of policy service is operational requirement
- Policy misconfiguration can block legitimate work (requires careful design)

#### 2. Coinbase Agentic Wallet Controls

**Website:** https://www.coinbase.com

**What It Offers:**
- Wallet controls specifically designed for AI agents
- Permission-based transaction validation
- Spending limit enforcement at infrastructure level
- Integration with agent frameworks

**Lessons Learned:**
- Agent-specific controls are needed beyond standard wallet security
- Integration with popular agent frameworks drives adoption
- Real-time monitoring is essential for operational visibility

#### 3. OpenFort

**Website:** https://www.openfort.xyz

**What It Offers:**
- Game and app wallet infrastructure with policy-based controls
- Session-based spending limits
- Per-action policy validation
- Transaction simulation before execution

**Lessons Learned:**
- Policy layer separation enables flexibility
- Transaction simulation prevents unexpected state changes
- Gaming context provides useful stress test for spending controls

### Relevant Standards

#### 1. EIP-3074: Auth and Authcall Opcodes

**Status:** Ethereum Improvement Proposal
**Source:** https://eips.ethereum.org/EIPS/eip-3074

**What It Offers:**
- Two new opcodes: `AUTH` and `AUTHCALL`
- Transaction sponsors can sign intents on behalf of users
- Smart contract wallets can act as standalone accounts
- Batched transactions and gas sponsorship without consensus changes

**Relevance to Non-Custodial Spending Controls:**
- Enables temporary delegation of signing to AI agents with time limits
- Allows policy enforcement through sponsor smart contracts
- Supports batched operations with single approval
- Provides infrastructure for intent-based agent interactions

**Agent Use Cases:**
- Time-limited delegation: Agent can sign for 1 hour, then authority expires
- Sponsored transactions: Agent operations don't require holding ETH for gas
- Policy-based delegation: Smart contract enforces spending limits per transaction

#### 2. EIP-4337: Account Abstraction

**Status:** Final
**Source:** https://eips.ethereum.org/EIPS/eip-4337

**What It Offers:**
- Account abstraction without consensus-layer protocol changes
- UserOperations instead of regular transactions
- Smart contract wallets can pay gas fees for users (gasless transactions)
- Separated roles: Bundlers, paymasters, and aggregators

**Relevance to Non-Custodial Spending Controls:**
- Smart contract wallets can enforce arbitrary spending policies
- Paymasters enable gasless agent operations
- UserOperations enable batched policy validation
- Separation of concerns allows modular policy enforcement

**Agent Use Cases:**
- Policy-enforced wallets: Smart contract validates all agent operations
- Gas sponsorship: Paymaster covers gas so agent doesn't need ETH
- Batched operations: Multiple agent actions validated and executed atomically
- Time-locked operations: Operations scheduled with delay for cancellation

#### 3. ERC-7715: Permissions and Delegation

**Status:** Draft
**Source:** https://eips.ethereum.org/EIPS/eip-7715

**What It Offers:**
- Standardized permissions for wallet delegation
- Granular control over what external agents can do
- Permission scopes for different operation types
- Time-limited delegation with automatic expiration

**Relevance to Non-Custodial Spending Controls:**
- Provides standard way to grant limited wallet permissions to agents
- Enables granular control without full key exposure
- Supports time-limited sessions for agent operations
- Standardizes permission management across wallet providers

#### 4. Safe (formerly Gnosis Safe)

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

#### 5. Argent Wallet

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

---

## Analysis & Recommendations

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
   - Category-based permissions (DeFi, NFT, etc.)

4. **Time-Limited Delegation:**
   - Short durations for initial access (minutes to hours)
   - Automatic expiration requires renewal
   - Emergency revocation capability

5. **Audit Trail Logging:**
   - Every proposed transaction logged
   - Allow/deny decisions with reasoning
   - Human approval/rejection tracking

### Best Practices for Agent Wallet Controls

1. **Never Give Agents Private Keys:**
   - Use smart contract wallets with policy enforcement
   - Implement intent-based workflows
   - Maintain separate agent identity from master wallet

2. **Implement Defense in Depth:**
   - Policy layer + approval gates + time-locks + audit logs
   - Multiple validation stages (pre-flight, runtime, post-execution)
   - Fail-closed behavior for uncertain situations

3. **Start Conservative and Expand:**
   - Begin with low limits and narrow allowlists
   - Monitor operations and adjust based on behavior
   - Implement graduated trust models

4. **Design for Human Intervention:**
   - Multi-channel approval (Slack, email, SMS, web)
   - Cancellation windows for time-locked operations
   - Emergency pause mechanisms

5. **Log Everything:**
   - Proposed transactions with full context
   - Policy validation results
   - Approval/rejection decisions with reasons
   - Actual execution results

### Recommended Architecture Flow

```
Agent proposes intent
    ↓
Policy Layer validates
    ↓
Within policy limits?
    ├─ No → Log & Reject
    └─ Yes → Check amount threshold
              ↓
          Above threshold?
              ├─ Yes → Human approval gate
              │         ↓
              │     Approved?
              │         ├─ No → Log & Reject
              │         └─ Yes → Execute
              └─ No → Execute directly
                        ↓
                    Smart Contract Wallet
                        ↓
                    Blockchain
                        ↓
                    Audit Log
```

---

*Report completed February 27, 2026*
