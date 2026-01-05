---
title: Filesystem-Based Agent State
status: established
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Anthropic Engineering Team"]
category: Context & Memory
source: "https://www.anthropic.com/engineering/code-execution-with-mcp"
tags: [state-management, persistence, resumption, long-running-tasks]
---

## Problem

Many agent workflows are long-running or may be interrupted (by errors, timeouts, or user intervention). Keeping all intermediate state in the model's context window is fragile and doesn't persist across sessions. When failures occur or when agents hit context limits, work is lost and must restart from scratch.

## Solution

Agents persist intermediate results and working state to files in the execution environment. This creates durable checkpoints that enable workflow resumption, recovery from failures, and support for tasks that exceed single-session context limits.

**Core pattern:**

```python
# Agent writes intermediate state to files
def multi_step_workflow():
    # Check if previous work exists
    if os.path.exists("state/step1_results.json"):
        print("Resuming from step 1...")
        step1_data = json.load(open("state/step1_results.json"))
    else:
        print("Starting from beginning...")
        step1_data = perform_step1()
        with open("state/step1_results.json", "w") as f:
            json.dump(step1_data, f)

    # Continue with step 2
    if os.path.exists("state/step2_results.json"):
        print("Resuming from step 2...")
        step2_data = json.load(open("state/step2_results.json"))
    else:
        step2_data = perform_step2(step1_data)
        with open("state/step2_results.json", "w") as f:
            json.dump(step2_data, f)

    # Final step
    return perform_step3(step2_data)
```

**State organization:**

```
workspace/
├── state/
│   ├── step1_results.json
│   ├── step2_results.json
│   └── progress.txt
├── data/
│   ├── input.csv
│   └── processed.csv
└── logs/
    └── execution.log
```

## How to use it

**Best for:**

- Multi-step workflows with expensive operations (API calls, data processing)
- Long-running tasks that may exceed session limits
- Workflows that need recovery from transient failures
- Collaborative tasks where multiple agents or sessions build on previous work
- Batch processing jobs with checkpointing

**Implementation patterns:**

1. **Checkpoint after expensive operations:**

   ```python
   def process_large_dataset():
       checkpoint_file = "state/processed_rows.json"

       # Load progress if exists
       if os.path.exists(checkpoint_file):
           processed = json.load(open(checkpoint_file))
           start_row = len(processed)
       else:
           processed = []
           start_row = 0

       # Process from checkpoint
       for i, row in enumerate(data[start_row:]):
           result = expensive_operation(row)
           processed.append(result)

           # Checkpoint every 100 rows
           if (i + 1) % 100 == 0:
               with open(checkpoint_file, "w") as f:
                   json.dump(processed, f)

       return processed
   ```

2. **State file with metadata:**

   ```json
   {
     "workflow_id": "abc-123",
     "current_step": "data_processing",
     "completed_steps": ["data_fetch", "validation"],
     "last_update": "2024-01-15T10:30:00Z",
     "data": {
       "records_processed": 1500,
       "errors_encountered": 3
     }
   }
   ```

3. **Progress logging for visibility:**

   ```python
   def log_progress(step, status, details=None):
       with open("logs/progress.log", "a") as f:
           timestamp = datetime.now().isoformat()
           log_entry = f"{timestamp} | {step} | {status}"
           if details:
               log_entry += f" | {json.dumps(details)}"
           f.write(log_entry + "\n")
           print(log_entry)  # Also show in agent context
   ```

## Trade-offs

**Pros:**

- Enables workflow resumption after interruption
- Protects against data loss from transient failures
- Supports long-running tasks beyond single-session limits
- Allows inspection of intermediate results
- Facilitates debugging (can examine state at each checkpoint)
- Multiple agents can collaborate by reading/writing shared state

**Cons:**

- Agents must write checkpoint/recovery logic
- File I/O adds overhead to workflow execution
- Requires discipline around state naming and organization
- Stale state files can cause confusion if not cleaned up
- Concurrent access needs coordination (file locking, atomic writes)
- Execution environment needs persistent storage

**Operational considerations:**

- Define state file cleanup policies (retention period, automatic cleanup)
- Use atomic writes to prevent corruption (write to temp, then rename)
- Include timestamps and version info in state files
- Consider state file size limits (don't checkpoint massive datasets)
- Secure state files if they contain sensitive data

## References

* Anthropic Engineering: Code Execution with MCP (2024)
* Related: Episodic Memory pattern (for conversation-level persistence)
