# Virtual Machine Operator Agent - Industry Implementations Report

**Pattern**: virtual-machine-operator-agent
**Category**: Tool Use & Environment
**Status**: Established
**Research Date**: 2026-02-27

---

## Executive Summary

The **Virtual Machine Operator Agent** pattern represents a fundamental shift in AI agent capabilities - moving agents from being simple text/code generators to full-fledged computer operators with direct access to virtual machine environments. This pattern enables agents to execute code, manage system resources, install software, and operate applications in ways that were previously impossible.

**Key Finding**: Multiple major AI companies have implemented this pattern in production systems, representing a convergence on VM-based agent execution as a critical capability for advanced AI agents. The implementations span commercial SaaS products, open-source frameworks, and cloud provider services.

**Primary Use Case**: AI agents that need to perform complex, multi-step tasks requiring real code execution, filesystem manipulation, package installation, and application operation - essentially serving as autonomous software engineers or system administrators.

**Production Validation**: Major implementations by Anthropic (Claude Computer Use), OpenAI (Codex/Agent RFT), Cognition (Devon), and others demonstrate this pattern is production-ready at scale.

---

## 1. Industry Implementations

### 1.1 Anthropic - Claude Computer Use

**Company**: Anthropic
**Product**: Claude Computer Use (formerly Claude Code)
**Launch Date**: 2025 (public beta)
**Status**: Production

**Technical Approach**:
- **VDI-based Desktop Environment**: Agents connect to virtual desktop infrastructure providing full GUI access
- **Screen Observation**: Agents observe screen content via screenshot APIs
- **Input Simulation**: Mouse and keyboard events simulated to control applications
- **Direct CLI Access**: Terminal/shell access for command execution
- **Filesystem Access**: Read/write operations on sandboxed filesystems

**Key Features**:
- Multi-modal agent that can "see" and interact with graphical interfaces
- Supports both CLI and GUI-based workflows
- Sandboxed execution environment with full development tools
- Real-time progress streaming to user
- Built-in safety measures and human-in-loop controls

**Public Documentation**:
- [Anthropic Claude Computer Use Documentation](https://docs.anthropic.com/en/docs/build-with-claude/computer-use)
- [Claude Code Agent](https://claude.ai/code)

**Relevance to VM Operator Pattern**:
- **Full Computer Control**: Claude can operate any application available in its VM environment
- **Development Environment**: Pre-configured with standard development tools (git, npm, python, etc.)
- **Stateful Workspace**: Maintains filesystem state across interactions
- **Network Access**: Can install packages, clone repos, fetch dependencies

**Pattern Characteristics**:
- **Isolation Level**: Full VM with OS-level isolation
- **Persistence**: Stateful workspace for ongoing tasks
- **User Visibility**: Real-time observation of agent actions
- **Safety**: Egress controls and activity monitoring

---

### 1.2 Cognition AI - Devon

**Company**: Cognition AI
**Product**: Devon - AI Software Engineer
**Launch Date**: March 2024 (public announcement)
**Status**: Production

**Technical Approach**:
- **Modal-based VM Infrastructure**: Serverless containers for rapid provisioning
- **Dedicated Development Environment**: Full Linux environment with dev tools
- **Shell Tool Access**: Direct shell command execution capability
- **Git Integration**: Native version control operations
- **Multi-step Task Execution**: Complex planning and execution capabilities

**Key Features**:
- Autonomous software engineering capabilities
- Can execute shell commands (grep, find, ls, rm, etc.)
- Installs dependencies and manages packages
- Creates and modifies files
- Runs tests and interprets results
- Learns from task execution via RL fine-tuning

**Public Documentation**:
- [Introducing Devin - Cognition AI Blog](https://www.cognition.ai/blog/introducing-devin)
- [Cognition AI Website](https://www.cognition-labs.com/)
- [Case Study: OpenAI Build Hour - Agent RFT (November 2025)](https://youtu.be/1s_7RMG4O4U)

**Relevance to VM Operator Pattern**:
- **Production-Validated**: First widely-publicized VM-based AI agent
- **Shell Access**: Full command-line capabilities including potentially destructive commands
- **File Planning**: Trained to optimize file operations (reduced from 8-10 calls to 4)
- **Parallel Execution**: Learned to execute multiple tools in parallel
- **RL Training**: Agent fine-tuned using reinforcement learning with isolated VM rollouts

**Pattern Characteristics**:
- **Isolation Level**: Container-based (Modal)
- **Provisioning**: Fast (~1 second cold start)
- **Scalability**: Handles 500+ concurrent VMs during training
- **Tool Surface**: Shell, file operations, search, git

**Real-World Results**:
- 50% reduction in planning tool calls through RL fine-tuning
- Safe handling of destructive commands via VM isolation
- Successfully processes complex, multi-step software engineering tasks

---

### 1.3 OpenAI - Codex Agent & Agent RFT Platform

**Company**: OpenAI
**Products**: Codex Agent, Agent RFT Platform
**Launch Date**: 2021 (Codex), 2025 (Agent RFT)
**Status**: Production

**Technical Approach**:
- **Function Calling**: Agent can invoke predefined tools/functions
- **Code Interpreter**: Python execution environment for data analysis and computation
- **Agent RFT Platform**: Reinforcement fine-tuning with tool endpoint architecture
- **Rollout ID Tracking**: State management across tool invocations
- **Bursty Traffic Handling**: Supports 100-500 simultaneous requests

**Key Features**:
- Code execution in isolated Python environment
- Data file upload and processing
- Visualization generation
- Multi-step reasoning with tool use
- Custom tool integration via API endpoints

**Public Documentation**:
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [Unrolling the Codex agent loop | OpenAI Blog](https://openai.com/index/unrolling-the-codex-agent-loop/)
- [OpenAI Fine-tuning Guide](https://platform.openai.com/docs/guides/fine-tuning)

**Relevance to VM Operator Pattern**:
- **Code Execution**: Python code interpreter for data analysis and computation
- **Tool Orchestration**: Platform for building tool-using agents
- **State Management**: Rollout ID tracking for multi-step workflows
- **RFT Integration**: Reinforcement learning platform for training VM operators
- **Custom Tools**: Extensible architecture for domain-specific tooling

**Pattern Characteristics**:
- **Isolation Level**: Container-based
- **Execution**: Python interpreter with common data science libraries
- **State Management**: In-memory state with optional persistence
- **Extensibility**: Custom tool endpoints via HTTP APIs

**Advanced Features**:
- **Prompt Caching**: `/responses/compact` endpoint for 75-99.95% token reduction
- **Compute Multiplier**: Control exploration breadth in training
- **Grader Endpoints**: Custom reward evaluation for RL fine-tuning
- **Tool Timeouts**: Built-in safety controls

---

### 1.4 Ramp - Inspect Agent (Custom Sandboxed Background Agent)

**Company**: Ramp
**Product**: Inspect Agent (internal background agent)
**Launch Date**: 2024
**Status**: Production (internal use)

**Technical Approach**:
- **Modal Infrastructure**: Serverless sandboxed environments
- **Real-time Communication**: WebSocket-based progress streaming
- **Model-Agnostic**: Pluggable LLM provider interface
- **Closed Feedback Loop**: Compiler/linter/test integration
- **Company-Specific Integration**: Deep integration with internal tooling

**Key Features**:
- Runs in sandboxed environments identical to developer machines
- Real-time stdout/stderr streaming via WebSocket
- Iterative refinement with machine-readable feedback
- Access to private repos and internal infrastructure
- Customized to team-specific development practices

**Public Documentation**:
- [Why We Built Our Own Background Agent - Ramp Engineering](https://engineering.ramp.com/post/why-we-built-our-background-agent)
- [Hacker News Discussion](https://news.ycombinator.com/item?id=46589842)

**Relevance to VM Operator Pattern**:
- **Custom Implementation**: Building VM-based agent in-house vs. buying off-the-shelf
- **Deep Integration**: Company-specific dev environments and workflows
- **Real-time Visibility**: WebSocket streaming of agent progress
- **Model Flexibility**: Not locked into single LLM provider
- **Iterative Loops**: Closed feedback loops with compiler/linter/test output

**Pattern Characteristics**:
- **Isolation Level**: Modal containers
- **Communication**: WebSocket bidirectional streaming
- **Feedback Integration**: Parser for compiler/linter/test output
- **VCS Integration**: Git for branch/PR creation

**Build vs. Buy Rationale**:
- Off-the-shelf agents (Devin, Cursor) work great for generic tasks
- Custom agent enables deep integration with company-specific infrastructure
- Optimized for specific workflows, tools, and security requirements

---

### 1.5 OpenHands (formerly OpenDevin)

**Organization**: OpenHands (open-source community)
**Product**: OpenHands AI Agent Framework
**Launch Date**: 2024 (originally as OpenDevin)
**Status**: Open Source (active development)

**Technical Approach**:
- **Open Source Framework**: Community-driven agent framework
- **Sandboxed Execution**: Isolated environments for code execution
- **Multi-Agent Support**: Supports multiple specialized agents
- **Pluggable Backend**: Supports various LLM providers
- **Extensible Tool System**: Custom tool development framework

**Key Features**:
- Autonomous software engineering capabilities
- Issue resolution and bug fixing
- Feature implementation
- Docker-based sandboxing
- Web-based UI for task management

**Public Documentation**:
- [OpenHands GitHub Repository](https://github.com/All-Hands-AI/OpenHands)
- [OpenHands Documentation](https://docs.all-hands.dev/)

**Relevance to VM Operator Pattern**:
- **Open Source Implementation**: Democratizes VM-based agent capabilities
- **Community-Driven**: Rapid iteration and feature development
- **Modular Architecture**: Pluggable components for extensibility
- **Production-Ready**: Used by organizations for real software engineering tasks

**Pattern Characteristics**:
- **Isolation Level**: Docker containers
- **UI**: Web-based task and progress interface
- **Agent Types**: Multiple specialized agents (coding, planning, etc.)
- **Provider Support**: OpenAI, Anthropic, local models

---

### 1.6 Cloud Provider Implementations

#### 1.6.1 AWS Bedrock Agents

**Company**: Amazon Web Services
**Product**: Bedrock Agents
**Launch Date**: 2023
**Status**: Production

**Technical Approach**:
- **Managed Agent Service**: Fully managed agent orchestration
- **Foundation Model Access**: Multiple model choices via Bedrock
- **Tool Integration**: Lambda functions, APIs, knowledge bases
- **Orchestration Layer**: Built-in agent reasoning and planning
- **Enterprise Integration**: Native AWS service integration

**Key Features**:
- No-code agent configuration
- Lambda function tool execution
- Knowledge base integration with RAG
- Guardrails for safety and compliance
- Enterprise-grade security and monitoring

**Public Documentation**:
- [AWS Bedrock Agents Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html)

**Relevance to VM Operator Pattern**:
- **Lambda Integration**: Serverless compute for code execution
- **Enterprise Context**: Native integration with AWS infrastructure
- **Scalability**: Automatic scaling for agent deployments
- **Security**: Built-in guardrails and compliance features

#### 1.6.2 Google Cloud Vertex AI

**Company**: Google Cloud
**Product**: Vertex AI Agent Builder
**Launch Date**: 2023
**Status**: Production

**Technical Approach**:
- **Vertex AI Extensions**: Pre-built integrations for tools and APIs
- **Function Calling**: Native function calling capabilities
- **Vector Search**: Knowledge base integration
- **Enterprise Integration**: Google Workspace and Cloud integration

**Key Features**:
- Pre-built extensions for common tools
- Custom extension development
- Enterprise search integration
- Multi-model support (Gemini, etc.)
- Enterprise security and governance

**Public Documentation**:
- [Google Cloud Vertex AI Extensions](https://cloud.google.com/vertex-ai/docs/extensions)

**Relevance to VM Operator Pattern**:
- **Extension Architecture**: Plugin system for tool access
- **Cloud Integration**: Deep integration with Google Cloud services
- **Enterprise Context**: Access to Workspace and Cloud APIs

#### 1.6.3 Azure AI Agent Service

**Company**: Microsoft Azure
**Product**: Azure AI Agent Service
**Launch Date**: 2024
**Status**: Preview

**Technical Approach**:
- **Managed Agent Service**: Serverless agent deployment
- **OpenAI Integration**: Native GPT model access
- **Code Interpreter**: Python execution environment
- **Enterprise Integration**: Microsoft 365 and Azure services

**Key Features**:
- Low-code agent configuration
- Code interpreter for data analysis
- Enterprise data integration
- Azure security and compliance
- Managed infrastructure

**Public Documentation**:
- [Azure AI Agent Service](https://learn.microsoft.com/en-us/azure/ai-studio/)

**Relevance to VM Operator Pattern**:
- **Code Interpreter**: Python execution for data tasks
- **Enterprise Context**: Microsoft 365 integration
- **Managed Infrastructure**: Reduced operational overhead

---

### 1.7 Infrastructure Providers for VM-Based Agents

#### 1.7.1 Modal

**Company**: Modal
**Product**: Serverless compute platform
**Use Case**: Infrastructure for VM-based agents
**Status**: Production

**Key Features**:
- Fast container provisioning (~1 second cold start)
- GPU support for ML/AI workloads
- Flexible container sizing (CPU, memory)
- Auto-scaling for bursty traffic
- Automatic cleanup after idle timeout
- Python-native API

**Used By**: Cognition (Devon), Ramp (Inspect Agent)

**Public Documentation**:
- [Modal Documentation](https://modal.com/docs)

**Relevance to VM Operator Pattern**:
- **Purpose-Built for Agents**: Designed for AI agent workloads
- **Fast Provisioning**: Handles bursty traffic from parallel rollouts
- **GPU Support**: Enables model inference within agent VMs
- **Developer Experience**: Python-native API for easy integration

#### 1.7.2 E2B

**Company**: E2B
**Product**: Purpose-built agent sandboxes
**Use Case**: Sandboxed execution environments for AI agents
**Status**: Production

**Key Features**:
- Firecracker microVMs with dedicated kernel
- Fast startup (~1 second provisioning)
- Network isolation with configurable outbound access
- Ephemeral filesystem (no persistent storage)
- Purpose-built for AI agent execution
- REST API for agent integration

**Public Documentation**:
- [E2B Documentation](https://e2b.dev/docs)

**Relevance to VM Operator Pattern**:
- **Purpose-Built**: Designed specifically for AI agent execution
- **Strong Isolation**: Firecracker microVMs for security
- **Fast Startup**: Sub-second provisioning for responsive agents
- **Network Control**: Configurable egress for security

---

## 2. Technical Comparison

### 2.1 Isolation Technology Comparison

| Platform | Isolation Method | Startup Time | Max Runtime | GPU Support | Use Case |
|----------|-----------------|--------------|-------------|-------------|----------|
| **Claude Computer Use** | Full VM (VDI) | ~30s | Hours | Yes | Complex GUI workflows |
| **Cognition Devon** | Modal Containers | ~1s | Hours | Yes | Software engineering |
| **OpenAI Code Interpreter** | Container | ~5s | Hours | No | Data analysis |
| **Ramp Inspect** | Modal Containers | ~1s | Hours | Yes | Custom dev workflows |
| **OpenHands** | Docker | ~3s | Hours | Yes | Open-source agents |
| **AWS Bedrock** | Lambda | ~1s | 15 min | No | Enterprise agents |
| **Modal** | MicroVMs | ~1s | Unlimited | Yes | Agent infrastructure |
| **E2B** | Firecracker microVMs | ~1s | Unlimited | Yes | Agent sandboxes |
| **Kubernetes Jobs** | Container pods | 5-30s | Unlimited | Yes | Self-hosted agents |

### 2.2 Feature Comparison Matrix

| Feature | Claude | Devon | OpenAI | Ramp | OpenHands | Cloud Providers |
|---------|--------|-------|--------|------|-----------|-----------------|
| **Shell Access** | Yes | Yes | Limited | Yes | Yes | Varies |
| **Filesystem** | Yes | Yes | Limited | Yes | Yes | Varies |
| **Package Install** | Yes | Yes | Limited | Yes | Yes | Limited |
| **GUI Support** | Yes | No | No | No | No | No |
| **Network Access** | Yes | Yes | No | Yes | Yes | Varies |
| **Real-time Streaming** | Yes | No | No | Yes | Yes | Varies |
| **Custom Tools** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Model-Agnostic** | No | No | No | Yes | Yes | No |
| **Open Source** | No | No | No | No | Yes | No |
| **Self-Hostable** | No | No | No | Yes | Yes | No |

---

## 3. Implementation Patterns

### 3.1 Provisioning Strategies

#### A. Serverless Containers (Modal/Lambda) - Recommended for Most

**Characteristics**:
- Startup Time: <5 seconds for cold starts
- Isolation Level: Container-based with namespace isolation
- Cost Model: Pay-per-use with automatic scaling
- Best For: Production agents with variable traffic patterns

**Key Advantages**:
- Fast provisioning enables responsive agent behavior
- Automatic resource management reduces operational overhead
- Native support for GPU workloads (Modal)
- Built-in image layering for efficient base image caching

**Implementations**: Cognition Devon, Ramp Inspect, Modal-based agents

#### B. Full Virtual Machines - Maximum Capability

**Characteristics**:
- Startup Time: 30-120 seconds
- Isolation Level: Full hardware virtualization
- Best For: Complex GUI workflows, highest security requirements

**Key Considerations**:
- Enables full desktop application support
- 10-20x slower startup than containers
- Higher cost but maximum capability
- Requires pre-provisioning for acceptable latency

**Implementations**: Anthropic Claude Computer Use

#### C. Purpose-Built MicroVMs - Optimized for Agents

**Characteristics**:
- Startup Time: ~1 second
- Isolation Level: MicroVM with dedicated kernel
- Best For: Production agent deployments requiring fast provisioning

**Key Advantages**:
- Near-instant provisioning
- Strong isolation (Firecracker)
- Purpose-built for agent workloads
- Configurable network controls

**Implementations**: E2B, Modal

### 3.2 Communication Patterns

#### A. Real-Time Streaming (WebSocket)

**Use Case**: User-visible agent execution
**Implementation**: Ramp Inspect Agent
**Benefits**:
- Real-time progress visibility
- Lower latency for user feedback
- Better user experience for long-running tasks

#### B. Polling-Based Updates

**Use Case**: Asynchronous task processing
**Implementation**: OpenAI Code Interpreter, cloud providers
**Benefits**:
- Simpler infrastructure
- Better for firewalled environments
- Easier to scale horizontally

#### C. Direct Terminal/UI Access

**Use Case**: Interactive agent sessions
**Implementation**: Claude Computer Use, Devon
**Benefits**:
- Direct user control
- Interactive debugging
- Visual confirmation of actions

### 3.3 State Management Patterns

#### A. Stateful Workspace (Claude, Devon)

**Approach**: Maintain filesystem state across interactions
**Use Case**: Multi-step tasks requiring intermediate state
**Benefits**:
- Natural for complex workflows
- Supports iterative development
- Maintains context across operations

#### B. Stateless Execution (Code Interpreter)

**Approach**: Fresh environment for each execution
**Use Case**: Isolated computation tasks
**Benefits**:
- Cleaner security model
- Easier scaling
- No state contamination

#### C. Rollout-Based State (OpenAI Agent RFT)

**Approach**: State keyed by rollout ID across tool calls
**Use Case**: Reinforcement learning training
**Benefits**:
- Enables parallel training rollouts
- Clear state isolation
- Supports bursty traffic patterns

---

## 4. Production Considerations

### 4.1 Security Considerations

#### Network Security
- **Egress Lockdown**: Default-deny outbound network access
- **VPC Isolation**: Private network deployment
- **API Authentication**: Secure tool endpoint access

#### Execution Security
- **Sandboxed Tool Authorization**: Policy-based tool access control
- **Resource Quotas**: CPU/memory limits to prevent abuse
- **Execution Timeouts**: Maximum runtime per operation
- **Output Sanitization**: Limit returned data sizes

#### Operational Security
- **Comprehensive Logging**: Immutable audit trails
- **Activity Monitoring**: Real-time behavior tracking
- **Human-in-Loop**: Approval for destructive operations
- **Post-Mortem Analysis**: Incident investigation capabilities

### 4.2 Scalability Considerations

#### Bursty Traffic Handling

RL training creates unique burst patterns:
- Training step boundaries: 100-500 simultaneous rollout requests
- Tool call latency: Brief pauses while model generates next action
- Cleanup phase: Mass VM destruction after step completion

**Scaling Configuration**:
```python
concurrency_limit=500  # Handle peak burst
container_idle_timeout=60  # Quick cleanup after burst
keep_warm=2  # Maintain warm pool for next burst
```

#### Performance Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| VM provisioning time | <5s | >10s |
| Tool execution latency | <2s | >5s |
| Infrastructure error rate | <1% | >5% |
| Concurrent agent capacity | Expected | Expected + 50% |

### 4.3 Cost Optimization

#### Pricing Model Comparison

| Platform | Cost Model | Best For |
|----------|------------|----------|
| **Claude Computer Use** | Subscription + Usage | Individual developers |
| **Devon** | Subscription + Usage | Teams requiring autonomy |
| **OpenAI Code Interpreter** | Per-execution | Data analysis tasks |
| **Modal** | Per-second compute | Variable workloads |
| **E2B** | Per-second compute | Agent sandboxes |
| **AWS Bedrock** | Per-request + Lambda | Enterprise deployments |
| **OpenHands** | Self-hosted | Cost-sensitive organizations |

#### Cost Optimization Strategies

1. **Prompt Caching**: Reduce context costs with cached prefixes
2. **Adaptive Scaling**: Right-size compute based on actual needs
3. **Idle Timeout**: Quick cleanup of unused resources
4. **Spot Instances**: Use spot pricing for fault-tolerant workloads
5. **Parallel Execution**: Maximize throughput per VM

---

## 5. Key Findings and Recommendations

### 5.1 Industry Trends

1. **Convergence on VM-Based Execution**: All major AI agent platforms provide some form of VM-based execution capability

2. **Container Dominance**: Most implementations use container-based isolation rather than full VMs for performance reasons

3. **Real-Time Visibility**: Growing emphasis on streaming agent progress to users (WebSocket adoption)

4. **Model Agnosticism**: Custom implementations (Ramp, OpenHands) prioritize multi-model support

5. **RL Training Integration**: Production systems (OpenAI, Cognition) are using VM-based execution for reinforcement learning

6. **Open Source Emergence**: OpenHands/OpenDevin demonstrates community demand for open-source VM-based agents

### 5.2 Implementation Recommendations

#### For Organizations Starting Implementation:

1. **Start with container-based isolation** (Modal, E2B, or self-hosted Docker)
   - Fastest path to production
   - Good balance of security and performance
   - Lower operational overhead

2. **Implement comprehensive monitoring before scaling**
   - Provisioning times
   - Tool execution latency
   - Infrastructure error rates
   - Resource utilization

3. **Design for bursty traffic patterns**
   - Auto-scaling with warm pools
   - Queue management for sudden spikes
   - Graceful degradation under load

4. **Implement layered security**
   - Network isolation (VPC, egress controls)
   - Tool authorization (policy-based access)
   - Resource limits (quotas, timeouts)
   - Comprehensive logging

5. **Consider build vs. buy carefully**
   - Off-the-shelf (Claude, Devon) for generic tasks
   - Custom for company-specific workflows
   - Open source (OpenHands) for cost-sensitive deployments

#### For Existing Implementations:

1. **Review infrastructure error rates** - Target <1%
2. **Audit resource cleanup** - Prevent resource leaks
3. **Optimize base images** - Reduce provisioning time
4. **Consider adaptive scaling** - Optimize resource usage
5. **Evaluate real-time streaming** - Improve user experience

### 5.3 Technology Selection Guide

| Use Case | Recommended Technology |
|----------|----------------------|
| **Individual developer** | Claude Computer Use, Cursor |
| **Team software engineering** | Devon, custom Modal-based agent |
| **Data analysis** | OpenAI Code Interpreter, Azure AI |
| **Enterprise deployment** | AWS Bedrock, Azure AI Agent Service |
| **Open-source preference** | OpenHands |
| **Custom workflows** | Ramp-style custom agent with Modal |
| **Agent infrastructure** | Modal, E2B |
| **Self-hosted** | OpenHands, Kubernetes Jobs |

### 5.4 Maturity Path

**Stage 1 (MVP)**: Basic container execution with shell access
- Manual orchestration
- Limited tool surface
- Basic monitoring

**Stage 2 (Production)**: Auto-scaling with monitoring
- Container orchestration (Modal, K8s)
- Comprehensive monitoring
- Security controls

**Stage 3 (Optimized)**: Advanced features and cost optimization
- Adaptive scaling
- Prompt caching
- Advanced security (egress controls, tool authorization)
- Real-time streaming

**Stage 4 (Enterprise)**: Multi-region and compliance
- Multi-region deployment
- Advanced observability
- Compliance features (SOC2, HIPAA)
- Fine-grained access controls

---

## 6. Sources

### Primary Sources

- [Anthropic Claude Computer Use Documentation](https://docs.anthropic.com/en/docs/build-with-claude/computer-use)
- [Introducing Devin - Cognition AI](https://www.cognition.ai/blog/introducing-devin)
- [Why We Built Our Own Background Agent - Ramp Engineering](https://engineering.ramp.com/post/why-we-built-our-background-agent)
- [OpenAI Build Hour: Agent RFT - Cognition Case Study](https://youtu.be/1s_7RMG4O4U)
- [Unrolling the Codex agent loop | OpenAI Blog](https://openai.com/index/unrolling-the-codex-agent-loop/)
- [AWS Bedrock Agents Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html)
- [Modal Documentation](https://modal.com/docs)
- [E2B Documentation](https://e2b.dev/docs)
- [OpenHands GitHub Repository](https://github.com/All-Hands-AI/OpenHands)

### Related Patterns in This Repository

- [Virtual Machine Operator Agent Pattern](/home/agent/awesome-agentic-patterns/patterns/virtual-machine-operator-agent.md)
- [Isolated VM per RL Rollout](/home/agent/awesome-agentic-patterns/patterns/isolated-vm-per-rl-rollout.md)
- [Custom Sandboxed Background Agent](/home/agent/awesome-agentic-patterns/patterns/custom-sandboxed-background-agent.md)
- [Adaptive Sandbox Fanout Controller](/home/agent/awesome-agentic-patterns/patterns/adaptive-sandbox-fanout-controller.md)
- [Agent Reinforcement Fine-Tuning](/home/agent/awesome-agentic-patterns/patterns/agent-reinforcement-fine-tuning.md)
- [Sandboxed Tool Authorization](/home/agent/awesome-agentic-patterns/patterns/sandboxed-tool-authorization.md)
- [Egress Lockdown (No-Exfiltration Channel)](/home/agent/awesome-agentic-patterns/patterns/egress-lockdown-no-exfiltration-channel.md)

---

**Research Completed**: 2026-02-27

**Pattern Status**: Established - Multiple production implementations across major AI companies

**Implementation Confidence**: High - Pattern is well-documented and production-validated

---

*Note: This report is based on publicly available documentation and known implementations as of February 2026. Some implementation details may change as products evolve.*
