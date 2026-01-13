---
title: Progressive Disclosure for Large Files
status: emerging
authors: ["Nikola Balic (@nibzard)"]
based_on: ["Will Larson (lethain.com)"]
category: Context & Memory
source: "https://lethain.com/agents-large-files/"
tags: [progressive-disclosure, large-files, context-optimization, file-management, lazy-loading, file-handling, metadata]
---

## Problem

Large files (PDFs, DOCXs, images) overwhelm the context window when loaded naively. A 5-10MB PDF may contain only 10-20KB of relevant text/tables, but the entire file is often shoved into context, wasting tokens and degrading performance.

## Solution

Apply **progressive disclosure**: load file metadata first, then provide tools to load content on-demand.

**Core approach:**

1. **Always include file metadata** in the prompt (not full content):

   ```
   Files:
     - id: f_a1
       name: my_image.png
       size: 500,000
       preloaded: false
     - id: f_b3
       name: report.pdf
       size: 8500000
       preloaded: false
   ```

2. **Optionally preload first N KB** of appropriate mimetypes (configurable per-workflow, can be 0)

3. **Provide three file operations:**

   - `load_file(id)` - Load entire file into context
   - `peek_file(id, start, stop)` - Load a section of file
   - `extract_file(id)` - Transform PDF/DOCX/PPT into simplified text

4. **Include a `large_files` skill** explaining when/how to use these tools

```pseudo
# Agent workflow for document comparison
1. Prompt includes file metadata for report_2024.pdf and report_2025.pdf
2. Agent sees large PDFs, checks large_files skill
3. Agent calls: extract_file("report_2024.pdf")
4. Agent calls: extract_file("report_2025.pdf")
5. Agent compares extracted summaries using minimal context
```

```pseudo
# Agent workflow for image analysis
1. Prompt includes metadata for screenshot.png
2. Agent sees PNG type, calls: load_file("screenshot.png")
3. Image content is loaded, agent analyzes visual content
```

## How to use it

**Best for:**

- Document comparison workflows (multiple PDFs)
- Ticket systems with file attachments (images, PDFs)
- Data export analysis (large reports in various formats)
- Any workflow where agents need file content but files are large

**Implementation considerations:**

- File `id` should be a stable reference for tool calls
- `extract_file` should return simplified text (tables, text content)
- Consider making `extract_file` return a virtual `file_id` for very large extractions
- Preloading first N KB is optional - can give agent initial context without full load

**Tool design:**

```python
def load_file(file_id: str) -> str:
    """Load entire file content into context window."""

def peek_file(file_id: str, start: int, stop: int) -> str:
    """Load a specific byte range from file."""

def extract_file(file_id: str) -> str:
    """Convert PDF/DOCX/PPT to simplified text representation."""
```

## Trade-offs

**Pros:**

- Enables working with files much larger than context window
- Agent has control over what/when to load
- Reusable across workflows via `large_files` skill
- Extracted content is often 100x smaller than original file

**Cons:**

- Adds tool call overhead (multiple round-trips)
- Requires preloading heuristics (how much is enough?)
- Extraction from complex formats (DOCX) can be slow without native dependencies
- Agent may make poor loading decisions without proper guidance

**Trade-offs in preloading:**

- **Preloading**: Gives agent immediate context but reduces control
- **No preloading**: Maximum agent control but requires explicit load calls

## References

* [Building an internal agent: Progressive disclosure and handling large files](https://lethain.com/agents-large-files/) - Will Larson (2025)
* Related: [Progressive Tool Discovery](progressive-tool-discovery.md) - Similar lazy-loading concept for tools
* Related: [Context-Minimization Pattern](context-minimization-pattern.md) - Complementary pattern for reducing context bloat
