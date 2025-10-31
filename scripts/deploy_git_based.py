#!/usr/bin/env python3
"""
deploy_git_based.py

Simplified deployment script using git-based automatic pattern labeling.
No more manual tracker files - everything is automated through git history.

Usage:
    python scripts/deploy_git_based.py [--commit] [--deploy]
"""

import os
import sys
import subprocess
import argparse

def run_command(cmd, cwd=None, description=""):
    """Run a command and return success status."""
    try:
        print(f"🔄 {description}...")
        result = subprocess.run(cmd, cwd=cwd, shell=True, check=True, capture_output=True, text=True)
        if result.stdout.strip():
            print(f"   {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed: {e}")
        if e.stderr:
            print(f"   Error: {e.stderr}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Deploy with git-based pattern labeling')
    parser.add_argument('--commit', action='store_true',
                       help='Commit changes after updating labels')
    parser.add_argument('--deploy', action='store_true',
                       help='Deploy to production after updating')
    parser.add_argument('--message', default='Update documentation with git-based pattern labels',
                       help='Commit message to use')
    
    args = parser.parse_args()
    
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
    
    print("🚀 Starting git-based deployment with automatic pattern labeling")
    print(f"📁 Repository root: {repo_root}")
    
    # Step 1: Regenerate README.md and mkdocs.yaml with git-based labels
    if not run_command(
        "python3 scripts/build_readme.py",
        cwd=repo_root,
        description="Regenerating documentation with git-based pattern labels"
    ):
        return 1
    
    # Step 2: Copy patterns to docs/ for MkDocs
    if not run_command(
        "make site_link",
        cwd=repo_root,
        description="Copying patterns to docs directory"
    ):
        return 1
    
    # Step 3: Build the site
    if not run_command(
        "make site_build",
        cwd=repo_root,
        description="Building MkDocs site"
    ):
        return 1
    
    # Step 4: Commit changes if requested
    if args.commit:
        # Check if there are any changes to commit
        try:
            result = subprocess.run(
                ["git", "status", "--porcelain"], 
                cwd=repo_root, 
                capture_output=True, 
                text=True, 
                check=True
            )
            
            if result.stdout.strip():
                print("📝 Changes detected, committing...")
                
                # Add known files that should be committed
                files_to_add = [
                    "README.md",
                    "mkdocs.yaml",
                    "docs/",
                    "patterns/"
                ]
                
                for file_path in files_to_add:
                    full_path = os.path.join(repo_root, file_path)
                    if os.path.exists(full_path):
                        if not run_command(
                            f"git add {file_path}",
                            cwd=repo_root,
                            description=f"Adding {file_path}"
                        ):
                            return 1
                
                if not run_command(
                    f'git commit -m "{args.message}"',
                    cwd=repo_root,
                    description="Committing changes"
                ):
                    return 1
            else:
                print("ℹ️  No changes to commit")
        
        except subprocess.CalledProcessError as e:
            print(f"❌ Error checking git status: {e}")
            return 1
    
    # Step 5: Deploy if requested
    if args.deploy:
        if not run_command(
            "make site_deploy",
            cwd=repo_root,
            description="Deploying to production"
        ):
            return 1
    
    print("\n✅ Git-based deployment completed successfully!")
    
    if not args.commit:
        print("💡 Run with --commit to automatically commit the changes")
    if not args.deploy:
        print("💡 Run with --deploy to automatically deploy to production")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
