# Migration to Git-Based Pattern Labeling

## Overview

This repository has migrated from manual tracking files to a fully automated git-based pattern labeling system. This document explains the changes and migration process.

## What Changed

### Before (Manual System)
- Used `.new-patterns-tracker.txt` and `.updated-patterns-tracker.txt` files
- Required manual maintenance and updates
- Pattern labels were managed through tracking files
- Prone to inconsistencies and manual errors

### After (Git-Based System)
- Uses git commit history as the source of truth
- Fully automated with no manual maintenance required
- Pattern labels are determined by actual creation and modification dates
- Consistent and accurate labeling based on git history

## Changes Made

### New Files Added
- `scripts/git_pattern_dates.py` - Core git-based dating engine
- `scripts/deploy_git_based.py` - Simplified deployment script
- `MIGRATION-TO-GIT-LABELS.md` - This migration documentation

### Files Modified
- `scripts/build_readme.py` - Updated to use git-based detection
- `docs/css/extra.css` - Enhanced with UPDATED badge styling
- `Makefile` - Updated targets for git-based system
- `PATTERN-LABELING.md` - Complete rewrite for git-based system

### Files Removed
- `.new-patterns-tracker.txt` - No longer needed (git history used instead)
- `.updated-patterns-tracker.txt` - No longer needed (git history used instead)
- `scripts/update_pattern_labels.py` - Replaced by git-based detection
- `scripts/deploy_with_labels.py` - Replaced by `deploy_git_based.py`
- `scripts/reset_pattern_labels.py` - No longer needed (automatic expiration)

## New Labeling Logic

### NEW Badges (🆕)
- Patterns **created** within the last **7 days**
- Based on first git commit that added the file
- Automatically expire after 7 days

### UPDATED Badges (🔄)
- Patterns **created > 7 days ago** but **modified** within last **14 days**
- Based on last git commit that modified the file
- Automatically expire after 14 days
- NEW takes precedence over UPDATED

## Migration Commands

### View Current Labels
```bash
make show_labels
```

### Debug Specific Pattern
```bash
make debug_pattern
# Enter pattern name when prompted
```

### Deploy with New System
```bash
make deploy_auto
```

## Advantages of Git-Based System

1. **Zero Maintenance**: No manual tracking files to update
2. **Accurate**: Git history is the definitive source of truth
3. **Automatic**: Labels appear and expire automatically based on actual dates
4. **Consistent**: No human error in labeling
5. **Intuitive**: Time-based logic is easy to understand
6. **Handles Edge Cases**: Rebasing, squashing, multiple commits all work correctly

## For Contributors

Nothing changes for contributors! The new system automatically:
- Detects when you add new patterns (NEW label for 7 days)
- Detects when you modify existing patterns (UPDATED label for 14 days)
- Handles all labeling based on your git commits

Just commit your work as usual - the labeling happens automatically.

## Configuration

To adjust timeframes, edit `scripts/git_pattern_dates.py`:

```python
NEW_PATTERN_DAYS = 7      # NEW badge duration
UPDATED_PATTERN_DAYS = 14 # UPDATED badge duration
```

## Rollback (if needed)

If for any reason you need to rollback to the manual system:

1. Restore the old tracking files from git history
2. Revert changes to `scripts/build_readme.py` 
3. Restore the old deployment scripts

However, the git-based system is more reliable and requires no maintenance, so rollback should not be necessary.

## Support

For issues with the new git-based system:

1. Check `PATTERN-LABELING.md` for complete documentation
2. Use `make show_labels` to debug current state
3. Use `python3 scripts/git_pattern_dates.py pattern-name` to debug specific patterns

The git-based system is designed to be robust and self-maintaining.
