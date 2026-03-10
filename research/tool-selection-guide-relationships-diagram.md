# Tool Selection Guide Pattern - Relationship Diagrams

This document contains Mermaid diagrams visualizing the relationships between the Tool Selection Guide pattern and related agentic patterns.

## 1. Core Pattern Relationship Map

```mermaid
graph TB
    subgraph Core[Core Pattern]
        TSG[Tool Selection Guide]
    end

    subgraph Security[Security Layer]
        AS[Action Selector]
        TCC[Tool Capability Compartmentalization]
        STA[Sandboxed Tool Authorization]
        HBS[Hook-Based Safety Rails]
    end

    subgraph Orchestration[Orchestration Layer]
        SAS[Sub-Agent Spawning]
        DPS[Discrete Phase Separation]
        PTE[Plan-Then-Execute]
    end

    subgraph Performance[Performance Layer]
        PTE2[Parallel Tool Execution]
        PTCL[Parallel Tool Call Learning]
        PTD[Progressive Tool Discovery]
    end

    subgraph Workflow[Workflow Layer]
        AFW[Agent-Friendly Workflow]
        SH[Subject Hygiene]
        PS[Patch Steering]
    end

    TSG -->|Provides selection criteria| SAS
    TSG -->|Respects capability boundaries| TCC
    TSG -->|Filters by authorization| STA
    TSG -->|Validated at runtime| HBS
    TSG -->|Varies by phase| DPS
    TSG -->|Applies within execution phase| PTE
    TSG -->|Optimizes execution strategy| PTE2
    TSG -->|Learns parallel patterns| PTCL
    TSG -->|Uses discovered tools| PTD
    TSG -->|Implements principles| AFW
    TSG -->|Requires clear subjects| SH
    TSG -->|Specialized for patching| PS

    AS -->|Constrains available tools| TSG

    style TSG fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style AS fill:#ffebee
    style TCC fill:#ffebee
    style STA fill:#ffebee
    style HBS fill:#ffebee
    style SH fill:#fff3e0
```

## 2. Tool Selection Decision Tree

```mermaid
flowchart TD
    A[Task Arrives] --> B{Categorize Task}

    B -->|Exploration| C{Files or Content?}
    C -->|File discovery| D[Use Glob]
    C -->|Content search| E[Use Grep]
    C -->|Targeted inspection| F[Use Read]

    B -->|Modification| G{New or Existing?}
    G -->|New file| H[Use Write]
    G -->|Existing file| I[Read First]
    I --> J[Use Edit]

    B -->|Verification| K[Use Bash]
    K --> L{Success?}
    L -->|Yes| M[Proceed]
    L -->|No| N[Fix and Retry]

    B -->|Delegation| O[Define Clear Subject]
    O --> P{Independent Tasks?}
    P -->|Yes| Q[Parallel Delegation]
    P -->|No| R[Sequential Delegation]

    style D fill:#e1f5ff
    style E fill:#e1f5ff
    style F fill:#e1f5ff
    style H fill:#fff4e1
    style J fill:#fff4e1
    style K fill:#e8f5e9
    style Q fill:#f3e5f5
    style R fill:#f3e5f5
```

## 3. Sub-Agent Spawning Integration

```mermaid
flowchart LR
    A[Tool Selection Guide] --> B{Task Type?}
    B -->|Exploration| C{Independent?}
    C -->|Yes| D[Spawn Subagents]
    C -->|No| E[Explore Sequentially]
    B -->|Modification| F[Main Agent Edit]
    B -->|Delegation| G[Task Tool]

    D --> H[Subject Hygiene Check]
    H --> I[Clear Subject Required]
    I --> J[2-4 Parallel Subagents]
    J --> K[Synthesize Results]

    style D fill:#e8f5e9
    style G fill:#e8f5e9
    style H fill:#fff3e0
```

## 4. Discrete Phase Separation Integration

```mermaid
flowchart LR
    subgraph Research[Research Phase]
        R1[Task: Exploration]
        R2[Tools: Glob, Grep, Read]
    end

    subgraph Planning[Planning Phase]
        P1[Task: Analysis]
        P2[Tools: Read existing patterns]
    end

    subgraph Implementation[Implementation Phase]
        I1[Task: Modification]
        I2[Tools: Read, Edit, Bash verify]
    end

    Research --> Planning --> Implementation

    style R2 fill:#e1f5ff
    style P2 fill:#fff4e1
    style I2 fill:#e8f5e9
```

## 5. Security-First Tool Selection

```mermaid
flowchart TD
    A[Task Request] --> B{Security Context?}

    B -->|Trusted| C[Tool Selection Guide]
    B -->|Untrusted| D[Action Selector Pattern]

    C --> E[Choose optimal tool freely]
    D --> F[Choose from allowlist]

    E --> G[Capability Check]
    F --> G

    G --> H{Crosses Trust Zone?}
    H -->|Yes| I[Require Approval]
    H -->|No| J[Execute Tool]

    I --> J

    J --> K[Hook Validation]
    K --> L[Tool Execution]

    style C fill:#e8f5e9
    style D fill:#ffebee
    style I fill:#fff3e0
```

## 6. Anti-Pattern Prevention Flow

```mermaid
flowchart TD
    A[Tool Selection Request] --> B{Check Anti-Patterns}

    B --> C{Using Write on existing file?}
    C -->|Yes| D[Use Edit Instead]
    C -->|No| E

    E --> {Skipping Read before Edit?}
    E -->|Yes| F[Read File First]
    E -->|No| G

    F --> G
    G --> {Empty task subject?}
    G -->|Yes| H[Define Clear Subject]
    G -->|No| I

    H --> I
    I --> {Can parallelize?}
    I -->|Yes| J[Use Parallel Execution]
    I -->|No| K[Use Sequential]

    J --> L[Proceed with Tool]
    K --> L

    style D fill:#c8e6c9
    style F fill:#c8e6c9
    style H fill:#c8e6c9
    style J fill:#c8e6c9
```

## 7. Progressive Tool Discovery Integration

```mermaid
sequenceDiagram
    participant Agent
    participant ToolDiscovery as Progressive Tool Discovery
    participant ToolSelection as Tool Selection Guide
    participant Tool

    Agent->>ToolDiscovery: "I need to search files"
    ToolDiscovery->>ToolDiscovery: search_tools("search*", "name+desc")
    ToolDiscovery-->>Agent: Returns: file_search, web_search, content_search

    Agent->>ToolSelection: "Task: Exploration, Available: [search tools]"
    ToolSelection->>ToolSelection: Apply selection rules
    Note over ToolSelection: Grep > web_search for codebase
    ToolSelection-->>Agent: "Use Grep for codebase search"

    Agent->>Tool: grep(pattern, "codebase/")
    Tool-->>Agent: Search results

    style ToolSelection fill:#e1f5ff
```

## 8. Verification-First Code Modification

```mermaid
flowchart TD
    A[Code Modification Request] --> B[Tool Selection: Edit Preferred]
    B --> C[Pre-Edit Hook Validation]
    C --> D[Read File First]
    D --> E[Content Matches Expected?]
    E -->|No| F[Abort/Retry]
    E -->|Yes| G[Apply Edit]
    G --> H[Post-Edit Hook Triggered]
    H --> I[Run Verification Bash]
    I --> J{Verification Success?}
    J -->|No| K[Rollback/Fix]
    J -->|Yes| L[Change Complete]

    style B fill:#e8f5e9
    style C fill:#fff3e0
    style I fill:#fff3e0
```

## 9. Pattern Composition Matrix

```mermaid
graph TD
    subgraph Strategy1[Security-First Composition]
        AS1[Action Selector] --> TCC1[Capability Compartmentalization]
        TCC1 --> TSG1[Tool Selection Guide]
        TSG1 --> HBS1[Hook-Based Safety]
    end

    subgraph Strategy2[Efficiency-First Composition]
        TSG2[Tool Selection Guide] --> PTD[Progressive Tool Discovery]
        PTD --> PTE[Parallel Tool Execution]
        PTE --> PTCL[Parallel Tool Call Learning]
    end

    subgraph Strategy3[Parallel-First Composition]
        DPS[Discrete Phase Separation] --> TSG3[Tool Selection Guide]
        TSG3 --> SAS[Sub-Agent Spawning]
        SAS --> SH[Subject Hygiene]
        SH --> PTCL2[Parallel Tool Call Learning]
    end

    subgraph Strategy4[Verification-First Composition]
        TSG4[Tool Selection Guide] --> HBS2[Hook-Based Safety]
        HBS2 --> IBTE[Intelligent Bash Execution]
        IBTE --> PTE2[Plan-Then-Execute]
    end

    style TSG1 fill:#e1f5ff
    style TSG2 fill:#e1f5ff
    style TSG3 fill:#e1f5ff
    style TSG4 fill:#e1f5ff
```

## 10. Tool Selection with Security Boundaries

```mermaid
flowchart TD
    A[Available Tools] --> B[Authorization Filter]
    B --> C[Authorized Tools]
    C --> D[Capability Separation]
    D --> E{Prevents Lethal Trifecta?}
    E -->|Yes| F[Safe Tool Set]
    E -->|No| G[Remove Risky Combinations]
    G --> F
    F --> H[Apply Selection Guide Preferences]
    H --> I[Recommended Tool]
    I --> J[Runtime Hook Validation]
    J --> K[Final Tool Selection]

    style B fill:#ffebee
    style D fill:#ffebee
    style H fill:#e1f5ff
    style J fill:#fff3e0
```
