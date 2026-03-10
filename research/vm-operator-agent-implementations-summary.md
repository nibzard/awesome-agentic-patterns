# Virtual Machine Operator Agent - Industry Implementations Summary

**Research Date**: 2026-02-27

This document provides a structured list of industry implementations of the Virtual Machine Operator Agent pattern.

---

## Commercial Implementations

### 1. Anthropic - Claude Computer Use

- **Company**: Anthropic
- **Product**: Claude Computer Use (formerly Claude Code)
- **Launch Date**: 2025 (public beta)
- **Status**: Production
- **Technical Approach**: VDI-based desktop environment with full GUI access, screen observation via screenshot APIs, input simulation (mouse/keyboard), direct CLI access
- **Key Features**: Multi-modal agent with GUI/CLI workflows, sandboxed execution with dev tools, real-time progress streaming, built-in safety measures
- **Documentation**: https://docs.anthropic.com/en/docs/build-with-claude/computer-use
- **Product URL**: https://claude.ai/code

---

### 2. Cognition AI - Devon

- **Company**: Cognition AI
- **Product**: Devin - AI Software Engineer
- **Launch Date**: March 2024
- **Status**: Production
- **Technical Approach**: Modal-based VM infrastructure with dedicated Linux development environment, shell tool access, git integration
- **Key Features**: Autonomous software engineering, shell command execution (grep, find, ls, rm), dependency management, file operations, test execution, RL-based learning
- **Documentation**: https://www.cognition.ai/blog/introducing-devin
- **Results**: 50% reduction in planning tool calls through RL fine-tuning (8-10 calls to 4 calls), safe handling of destructive commands via VM isolation
- **Case Study**: https://youtu.be/1s_7RMG4O4U (OpenAI Build Hour - Agent RFT)

---

### 3. OpenAI - Codex Agent & Code Interpreter

- **Company**: OpenAI
- **Products**: Codex Agent, Code Interpreter, Agent RFT Platform
- **Launch Date**: 2021 (Codex), 2025 (Agent RFT)
- **Status**: Production
- **Technical Approach**: Function calling framework, isolated Python execution environment, tool endpoint architecture for RL training
- **Key Features**: Code execution in isolated Python environment, data file processing, visualization generation, multi-step reasoning with tool use, custom tool integration via API endpoints
- **Documentation**:
  - https://platform.openai.com/docs/guides/function-calling
  - https://openai.com/index/unrolling-the-codex-agent-loop/
- **Advanced Features**: Prompt caching (75-99.95% token reduction), compute multiplier for training, grader endpoints for RL

---

### 4. Ramp - Inspect Agent

- **Company**: Ramp
- **Product**: Inspect Agent (internal background agent)
- **Launch Date**: 2024
- **Status**: Production (internal use)
- **Technical Approach**: Modal infrastructure with serverless sandboxed environments, WebSocket-based real-time communication, model-agnostic architecture
- **Key Features**: Sandboxed environments identical to developer machines, real-time stdout/stderr streaming, iterative refinement with machine-readable feedback, private repo access, team-specific customization
- **Documentation**: https://engineering.ramp.com/post/why-we-built-our-background-agent
- **Discussion**: https://news.ycombinator.com/item?id=46589842
- **Rationale**: Built in-house for deep integration with company-specific infrastructure, model flexibility, real-time visibility

---

## Open Source Implementations

### 5. OpenHands (formerly OpenDevin)

- **Organization**: OpenHands (open-source community)
- **Product**: OpenHands AI Agent Framework
- **Launch Date**: 2024 (originally as OpenDevin)
- **Status**: Open Source (active development)
- **Technical Approach**: Docker-based sandboxed execution, multi-agent architecture, pluggable LLM backend
- **Key Features**: Autonomous software engineering, issue resolution, bug fixing, feature implementation, web-based UI, extensible tool system
- **Repository**: https://github.com/All-Hands-AI/OpenHands
- **Documentation**: https://docs.all-hands.dev/
- **Characteristics**: Open source alternative to commercial solutions, modular architecture, production-ready for real software engineering tasks

---

## Cloud Provider Implementations

### 6. AWS Bedrock Agents

- **Company**: Amazon Web Services
- **Product**: Bedrock Agents
- **Launch Date**: 2023
- **Status**: Production
- **Technical Approach**: Managed agent service with Lambda function integration, foundation model access via Bedrock
- **Key Features**: No-code agent configuration, Lambda function tool execution, knowledge base integration with RAG, guardrails for safety, enterprise security
- **Documentation**: https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html
- **Relevance**: Serverless compute (Lambda) for code execution, native AWS infrastructure integration

---

### 7. Google Cloud Vertex AI Agent Builder

- **Company**: Google Cloud
- **Product**: Vertex AI Agent Builder
- **Launch Date**: 2023
- **Status**: Production
- **Technical Approach**: Vertex AI Extensions for tool integration, function calling, vector search for knowledge bases
- **Key Features**: Pre-built extensions, custom extension development, enterprise search integration, multi-model support (Gemini), enterprise security
- **Documentation**: https://cloud.google.com/vertex-ai/docs/extensions
- **Relevance**: Plugin system for tool access, deep Google Cloud service integration

---

### 8. Azure AI Agent Service

- **Company**: Microsoft Azure
- **Product**: Azure AI Agent Service
- **Launch Date**: 2024
- **Status**: Preview
- **Technical Approach**: Managed agent service with OpenAI integration, Python code interpreter
- **Key Features**: Low-code configuration, code interpreter for data analysis, Microsoft 365 integration, Azure security/compliance
- **Documentation**: https://learn.microsoft.com/en-us/azure/ai-studio/
- **Relevance**: Python execution for data tasks, Microsoft 365 context access

---

## Infrastructure Providers

### 9. Modal

- **Company**: Modal
- **Product**: Serverless compute platform for agents
- **Status**: Production
- **Technical Approach**: MicroVMs with fast provisioning (~1 second cold start)
- **Key Features**: GPU support, flexible container sizing, auto-scaling, automatic cleanup, Python-native API
- **Used By**: Cognition (Devon), Ramp (Inspect Agent)
- **Documentation**: https://modal.com/docs
- **Relevance**: Purpose-built for AI agent workloads, handles bursty traffic from parallel rollouts

---

### 10. E2B

- **Company**: E2B
- **Product**: Purpose-built agent sandboxes
- **Status**: Production
- **Technical Approach**: Firecracker microVMs with dedicated kernel
- **Key Features**: Fast startup (~1 second), network isolation, ephemeral filesystem, REST API, designed for AI agents
- **Documentation**: https://e2b.dev/docs
- **Relevance**: Purpose-built for AI agent execution, strong isolation (Firecracker), configurable egress

---

## Comparison Summary

### Isolation Technology Comparison

| Platform | Isolation Method | Startup Time | GPU Support |
|----------|-----------------|--------------|-------------|
| Claude Computer Use | Full VM (VDI) | ~30s | Yes |
| Cognition Devon | Modal Containers | ~1s | Yes |
| OpenAI Code Interpreter | Container | ~5s | No |
| Ramp Inspect | Modal Containers | ~1s | Yes |
| OpenHands | Docker | ~3s | Yes |
| AWS Bedrock | Lambda | ~1s | No |
| Modal | MicroVMs | ~1s | Yes |
| E2B | Firecracker microVMs | ~1s | Yes |

### Key Feature Comparison

| Feature | Claude | Devon | OpenAI | Ramp | OpenHands |
|---------|--------|-------|--------|------|-----------|
| Shell Access | Yes | Yes | Limited | Yes | Yes |
| Filesystem | Yes | Yes | Limited | Yes | Yes |
| Package Install | Yes | Yes | Limited | Yes | Yes |
| GUI Support | Yes | No | No | No | No |
| Network Access | Yes | Yes | No | Yes | Yes |
| Real-time Streaming | Yes | No | No | Yes | Yes |
| Custom Tools | Yes | Yes | Yes | Yes | Yes |
| Model-Agnostic | No | No | No | Yes | Yes |
| Open Source | No | No | No | No | Yes |

---

## Additional Context

### Related Patterns

- **Isolated VM per RL Rollout**: Training infrastructure pattern used by Cognition/OpenAI
- **Custom Sandboxed Background Agent**: Alternative implementation approach (Ramp)
- **Adaptive Sandbox Fanout Controller**: Scaling optimization for sandbox infrastructure
- **Sandboxed Tool Authorization**: Security layer for VM-based agents
- **Egress Lockdown**: Network security for VM isolation

### Implementation Categories

1. **Full Commercial Products**: Claude, Devon (end-user facing)
2. **Platform Services**: OpenAI, AWS, Google Cloud, Azure (developer platforms)
3. **Infrastructure Providers**: Modal, E2B (underlying infrastructure)
4. **Open Source**: OpenHands (community-driven)

---

## Sources

All documentation URLs are provided above for each implementation.

**Research Completed**: 2026-02-27
