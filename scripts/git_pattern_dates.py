#!/usr/bin/env python3
"""
git_pattern_dates.py

Git-based pattern dating utilities for automatic NEW/UPDATED labeling.
Uses git history to determine when patterns were created and last modified.
"""

import os
import subprocess
import time
from datetime import datetime, timezone

# Configuration
NEW_PATTERN_DAYS = 7      # Patterns added in last 7 days = NEW
UPDATED_PATTERN_DAYS = 14 # Patterns modified in last 14 days = UPDATED

def get_pattern_creation_date(repo_root, pattern_file):
    """
    Get the creation date (first commit) of a pattern file.
    Returns Unix timestamp or None if not found.
    """
    pattern_path = os.path.join("patterns", pattern_file)
    
    try:
        # Get the first commit that added this file (creation date)
        cmd = [
            "git", "log", 
            "--follow",           # Track renames
            "--format=%ct",       # Unix timestamp
            "--reverse",          # Oldest first
            "--",                 # Separator
            pattern_path
        ]
        
        result = subprocess.run(
            cmd, 
            cwd=repo_root, 
            capture_output=True, 
            text=True, 
            check=True
        )
        
        timestamps = result.stdout.strip().split('\n')
        if timestamps and timestamps[0]:
            return int(timestamps[0])  # First (creation) timestamp
        
        return None
        
    except (subprocess.CalledProcessError, ValueError) as e:
        print(f"Warning: Could not get creation date for {pattern_file}: {e}")
        return None

def get_pattern_modification_date(repo_root, pattern_file):
    """
    Get the last modification date of a pattern file.
    Returns Unix timestamp or None if not found.
    """
    pattern_path = os.path.join("patterns", pattern_file)
    
    try:
        # Get the most recent commit that modified this file
        cmd = [
            "git", "log", 
            "-1",                 # Most recent only
            "--format=%ct",       # Unix timestamp
            "--",                 # Separator
            pattern_path
        ]
        
        result = subprocess.run(
            cmd, 
            cwd=repo_root, 
            capture_output=True, 
            text=True, 
            check=True
        )
        
        timestamp = result.stdout.strip()
        if timestamp:
            return int(timestamp)
        
        return None
        
    except (subprocess.CalledProcessError, ValueError) as e:
        print(f"Warning: Could not get modification date for {pattern_file}: {e}")
        return None

def get_pattern_label(repo_root, pattern_file, current_time=None):
    """
    Determine the appropriate label (NEW, UPDATED, or None) for a pattern.
    
    Logic:
    - NEW: Pattern created within NEW_PATTERN_DAYS
    - UPDATED: Pattern created > NEW_PATTERN_DAYS ago but modified within UPDATED_PATTERN_DAYS
    - None: Pattern is older than UPDATED_PATTERN_DAYS with no recent modifications
    
    Returns: 'NEW', 'UPDATED', or None
    """
    if current_time is None:
        current_time = int(time.time())
    
    creation_date = get_pattern_creation_date(repo_root, pattern_file)
    modification_date = get_pattern_modification_date(repo_root, pattern_file)
    
    # If we can't get git dates, return None (no label)
    if creation_date is None or modification_date is None:
        return None
    
    # Calculate time thresholds
    new_threshold = current_time - (NEW_PATTERN_DAYS * 24 * 60 * 60)
    updated_threshold = current_time - (UPDATED_PATTERN_DAYS * 24 * 60 * 60)
    
    # NEW takes precedence: created within NEW_PATTERN_DAYS
    if creation_date >= new_threshold:
        return 'NEW'
    
    # UPDATED: created before NEW window but modified within UPDATED window
    if creation_date < new_threshold and modification_date >= updated_threshold:
        return 'UPDATED'
    
    # No label for older patterns
    return None

def get_all_pattern_labels(repo_root, patterns_dir):
    """
    Get labels for all patterns in the patterns directory.
    
    Returns:
    - new_patterns: set of filenames that should have NEW labels
    - updated_patterns: set of filenames that should have UPDATED labels
    """
    new_patterns = set()
    updated_patterns = set()
    
    if not os.path.isdir(patterns_dir):
        print(f"Warning: Patterns directory not found: {patterns_dir}")
        return new_patterns, updated_patterns
    
    current_time = int(time.time())
    
    # Process all markdown files in patterns directory
    for filename in os.listdir(patterns_dir):
        if not filename.endswith('.md') or filename == 'TEMPLATE.md':
            continue
        
        label = get_pattern_label(repo_root, filename, current_time)
        
        if label == 'NEW':
            new_patterns.add(filename)
        elif label == 'UPDATED':
            updated_patterns.add(filename)
    
    return new_patterns, updated_patterns

def format_timestamp(timestamp):
    """Helper function to format Unix timestamp for debugging."""
    if timestamp is None:
        return "Unknown"
    return datetime.fromtimestamp(timestamp, tz=timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')

def debug_pattern_dates(repo_root, pattern_file):
    """
    Debug function to show detailed date information for a pattern.
    Useful for troubleshooting the labeling logic.
    """
    print(f"\n📅 Debug info for {pattern_file}:")
    
    creation_date = get_pattern_creation_date(repo_root, pattern_file)
    modification_date = get_pattern_modification_date(repo_root, pattern_file)
    current_time = int(time.time())
    
    print(f"   Creation date: {format_timestamp(creation_date)}")
    print(f"   Last modified: {format_timestamp(modification_date)}")
    print(f"   Current time:  {format_timestamp(current_time)}")
    
    if creation_date and modification_date:
        creation_days_ago = (current_time - creation_date) / (24 * 60 * 60)
        modification_days_ago = (current_time - modification_date) / (24 * 60 * 60)
        
        print(f"   Created {creation_days_ago:.1f} days ago")
        print(f"   Modified {modification_days_ago:.1f} days ago")
        
        label = get_pattern_label(repo_root, pattern_file, current_time)
        print(f"   Label: {label or 'None'}")
        
        # Show thresholds
        print(f"   NEW threshold: {NEW_PATTERN_DAYS} days")
        print(f"   UPDATED threshold: {UPDATED_PATTERN_DAYS} days")

if __name__ == "__main__":
    # Example usage / testing
    import sys
    
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
    patterns_dir = os.path.join(repo_root, "patterns")
    
    if len(sys.argv) > 1:
        # Debug specific pattern
        pattern_file = sys.argv[1]
        if not pattern_file.endswith('.md'):
            pattern_file += '.md'
        debug_pattern_dates(repo_root, pattern_file)
    else:
        # Show all pattern labels
        print("🏷️  Pattern Labels (Git-based):")
        print(f"   NEW threshold: {NEW_PATTERN_DAYS} days")
        print(f"   UPDATED threshold: {UPDATED_PATTERN_DAYS} days")
        
        new_patterns, updated_patterns = get_all_pattern_labels(repo_root, patterns_dir)
        
        if new_patterns:
            print(f"\n🆕 NEW patterns ({len(new_patterns)}):")
            for pattern in sorted(new_patterns):
                print(f"   - {pattern}")
        
        if updated_patterns:
            print(f"\n🔄 UPDATED patterns ({len(updated_patterns)}):")
            for pattern in sorted(updated_patterns):
                print(f"   - {pattern}")
        
        if not new_patterns and not updated_patterns:
            print("\nℹ️  No patterns qualify for NEW or UPDATED labels")
