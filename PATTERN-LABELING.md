# Git-Based Pattern Labeling System

This repository uses an automated git-based pattern labeling system that displays "NEW" and "UPDATED" badges on patterns based on their git commit history. This eliminates manual tracking and provides accurate, date-based labeling.

## Overview

The git-based labeling system features:

- **NEW badges** 🆕: For patterns added within the last 7 days
- **UPDATED badges** 🔄: For patterns created >7 days ago but modified within 14 days
- **Automatic detection**: Uses git history as the source of truth
- **No manual maintenance**: No tracking files to manage
- **Date-based logic**: Intuitive time-based labeling

## Components

### 1. Badge Styling (`docs/css/extra.css`)

- `.new-badge`: Green gradient with animated glow for new patterns
- `.updated-badge`: Orange gradient with animated glow for updated patterns
- Responsive design for mobile devices

### 2. Git Date Detection (`scripts/git_pattern_dates.py`)

Core functionality for git-based pattern dating:
- **Creation date detection**: Uses `git log --follow --reverse` to find when a pattern was first added
- **Modification date detection**: Uses `git log -1` to find last modification
- **Configurable thresholds**: `NEW_PATTERN_DAYS = 7`, `UPDATED_PATTERN_DAYS = 14`
- **Label logic**: NEW takes precedence over UPDATED

### 3. Scripts

#### `scripts/build_readme.py` (Git-based)
- Regenerates README.md and mkdocs.yaml using git history
- No longer depends on manual tracker files
- Automatically detects and applies appropriate labels

#### `scripts/deploy_git_based.py` (Simplified)
- Streamlined deployment with git-based labeling
- No tracking file management needed
- Handles documentation generation and deployment

#### `scripts/git_pattern_dates.py` (Core Engine)
- Standalone utility for git-based pattern dating
- Supports debugging individual patterns
- Can be run directly to view current labels

### 4. Makefile Targets

```bash
# Git-based deployment with automatic labeling
make deploy_auto

# View current pattern labels
make show_labels

# Debug specific pattern dates
make debug_pattern

# Build with labels (no deployment)
make build_with_labels
```

## Usage

### Automatic Deployment
For regular deployments with git-based labeling:

```bash
make deploy_auto
```

This will:
1. Analyze git history to determine pattern labels
2. Regenerate documentation with appropriate badges
3. Commit changes
4. Deploy to production

### View Current Labels
See which patterns currently qualify for labels:

```bash
make show_labels
```

Example output:
```
🏷️  Pattern Labels (Git-based):
   NEW threshold: 7 days
   UPDATED threshold: 14 days

🆕 NEW patterns (2):
   - context-window-anxiety-management.md
   - proactive-agent-state-externalization.md

🔄 UPDATED patterns (1):
   - parallel-tool-execution.md
```

### Debug Pattern Dates
Investigate the git history for specific patterns:

```bash
make debug_pattern
# Enter pattern name: context-window-anxiety-management
```

### Manual Operations
For step-by-step control:

```bash
# 1. Regenerate docs with git-based labels
python3 scripts/build_readme.py

# 2. Build site
make site_build

# 3. Deploy
make site_deploy
```

## How It Works

### Git-Based Date Detection
1. **Creation Date**: `git log --follow --reverse -- patterns/filename.md` finds the first commit that added the file
2. **Modification Date**: `git log -1 -- patterns/filename.md` finds the last commit that modified the file
3. **Date Comparison**: Compares dates against configurable thresholds (7 days for NEW, 14 days for UPDATED)

### Labeling Logic
1. **NEW**: Pattern was first added within the last 7 days
2. **UPDATED**: Pattern was created >7 days ago but modified within last 14 days  
3. **Precedence**: NEW takes priority over UPDATED (a pattern can't be both)
4. **None**: Patterns older than 14 days with no recent modifications get no label

### Badge Display
1. `build_readme.py` calls `get_all_pattern_labels()` which queries git history
2. Generates README.md and mkdocs.yaml with appropriate badges based on git dates
3. CSS provides styling and animations
4. No manual tracking files needed

## Configuration

### Time Thresholds
Edit `scripts/git_pattern_dates.py` to adjust:

```python
NEW_PATTERN_DAYS = 7      # Patterns added in last 7 days = NEW
UPDATED_PATTERN_DAYS = 14 # Patterns modified in last 14 days = UPDATED
```

### Automatic Lifecycle Management
Labels automatically expire based on git dates:
- **NEW badges**: Automatically disappear after 7 days
- **UPDATED badges**: Automatically disappear after 14 days  
- **No manual cleanup needed**: Time-based logic handles everything

## Examples

### Pattern with NEW badge:
```markdown
- [Context Window Anxiety Management](patterns/context-window-anxiety-management.md) <span class='new-badge'>NEW</span>
```

### Pattern with UPDATED badge:
```markdown
- [Parallel Tool Execution](patterns/parallel-tool-execution.md) <span class='updated-badge'>UPDATED</span>
```

## Troubleshooting

### Labels not appearing
1. Check if patterns qualify for labels:
   ```bash
   make show_labels
   ```

2. Debug specific pattern:
   ```bash
   python3 scripts/git_pattern_dates.py pattern-name
   ```

3. Regenerate documentation:
   ```bash
   python3 scripts/build_readme.py
   ```

### Git detection issues
1. Ensure you're in a git repository with history:
   ```bash
   git log --oneline -- patterns/
   ```

2. Check if pattern exists in git:
   ```bash
   git log --follow -- patterns/pattern-name.md
   ```

3. Verify git commands work:
   ```bash
   git log --follow --format=%ct --reverse -- patterns/pattern-name.md
   ```

### Badge styling issues
1. Check CSS file: `docs/css/extra.css`
2. Ensure MkDocs is using the CSS file
3. Clear browser cache

## Contributing

When adding new patterns or modifying existing ones:

1. **New patterns**: Will be automatically labeled as NEW for 7 days after git commit
2. **Pattern updates**: Will be automatically labeled as UPDATED for 14 days after git commit
3. **Zero maintenance**: Git history provides all the information needed

The system is fully automated - just commit your changes and labels will appear automatically based on git dates. No manual tracking or cleanup required!
