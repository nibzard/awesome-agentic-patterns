# 🛠️ Developer Setup Checklist

Use the following to-do list to get **awesome-agentic-patterns** up and running on your local machine. Tick each checkbox as you complete the step.

---

## 1. Clone & Prepare the Repository

- **Fork the repository (optional).**
  If you plan to contribute patterns or push changes, fork [nibzard/awesome-agentic-patterns](https://github.com/nibzard/awesome-agentic-patterns) to your own GitHub account.

- **Clone the repository to your local machine.**
  ```bash
  git clone https://github.com/<your-username>/awesome-agentic-patterns.git
  # OR, if you’re working from the upstream repo directly:
  git clone https://github.com/nibzard/awesome-agentic-patterns.git
  ```

* **Enter the project directory.**

  ```bash
  cd awesome-agentic-patterns
  ```

* **(Recommended) Create a Python virtual environment.**

  ```bash
  python3 -m venv .venv
  # On Windows:
  # python -m venv .venv
  ```

  * Activate the virtual environment:

    * macOS/Linux:

      ```bash
      source .venv/bin/activate
      ```
    * Windows (PowerShell):

      ```powershell
      .\.venv\Scripts\Activate.ps1
      ```

---

## 2. Install Dependencies

* **Install project requirements.**

  ```bash
  pip install --upgrade pip
  pip install -r requirements.txt
  ```

  * This will install:

    * `mkdocs==1.0.4`
    * `mkdocs-material==4.0.2`

* **Verify that MkDocs is installed correctly.**

  ```bash
  mkdocs --version
  ```

  * You should see output similar to:

    ```
    mkdocs, version 1.0.4 from ... (Python 3.x)
    ```

---

## 3. Link README to MkDocs

* **Ensure `README.md` is symlinked to `docs/index.md`.**
  The Makefile provides a shortcut to create this link:

  ```bash
  make site_link
  ```

  * This runs:

    ```bash
    ln -sf $(CURDIR)/README.md $(CURDIR)/docs/index.md
    ```
  * You can verify that `docs/index.md` points to the same content as `README.md`.

---

## 4. Explore Directory Structure

* **Review the top-level files:**

  * `CONTRIBUTING.md` – Contribution guidelines.
  * `LICENSE` – Apache 2.0 license.
  * `Makefile` – Common targets for building/deploying the site.
  * `mkdocs.yaml` – MkDocs configuration.
  * `requirements.txt` – Python libraries required.
  * `sort.py` – Utility script (not strictly necessary for initial setup).

* **Inspect the main folders:**

  * `patterns/` (create if missing) – where individual pattern `.md` files will live.
  * `scripts/` – helper scripts (e.g., `build_readme.py` to regenerate the README and nav).
  * `docs/` – MkDocs site content (note: `docs/index.md` is auto-symlinked to the README).
  * `docs/css/` – custom CSS for MkDocs.

---

## 5. Build & Preview the MkDocs Site Locally

* **Build the site (optional).**

  ```bash
  python scripts/build_readme.py
  ```

  * This generates static files in the `site/` directory but does not serve them.

* **Preview the site in “live-reload” mode.**

  ```bash
  make site_preview
  ```

  * This runs `mkdocs serve` and opens a local server (usually at `http://127.0.0.1:8000/`).
  * **Tip:** As you edit `README.md` or any `patterns/*.md`, the site will automatically reload.

* **(Optional) Test the generated HTML.**
  In a separate terminal (or after stopping `mkdocs serve`), run:

  ```bash
  make site_build
  ```

  Then open `site/index.html` in your browser to verify the static output.

---

## 6. Add Your First Pattern

> If you’re just exploring, skip to “Finalize Setup.” If you want to verify that the automation works, do the following:

* **Create a new Markdown file under `patterns/`.**

  ```bash
  mkdir -p patterns
  touch patterns/my-first-pattern.md
  ```

  * Use this minimal front-matter template inside `patterns/my-first-pattern.md`:

    ````markdown
    ---
    title: My First Pattern
    status: 🔬 validated-in-production
    authors: ["Your Name"]
    source: "https://example.com/my-first-pattern"
    tags: [example, agentic, demo]
    ---

    ## Problem
    Describe the real-world problem that multiple teams encounter…

    ## Solution
    Explain the core idea of how an AI agent solves it…

    ## Example (pseudo-flow)
    ```mermaid
    sequenceDiagram
      User->>Agent: "Do something important"
      Agent->>Tool: run `some-tool`
      …
    ````

    ## References

    * Blog: *My Demo of Agentic Patterns* – Published on 2025-05-30

    ```
    ```

* **Run the build script to regenerate the README & nav.**
  If the repository already contains `scripts/build_readme.py`, execute:

  ```bash
  python scripts/build_readme.py
  ```

  * **What this does:**

    * Scans all `.md` files in `patterns/`
    * Extracts their YAML front-matter (title, status, tags, source)
    * Updates the “Quick Tour of Categories” tables in `README.md`
    * Syncs the `nav:` section in `mkdocs.yaml` so your new pattern appears in the site nav automatically

* **Confirm that your new pattern shows up in the README & site.**

  * Re-run:

    ```bash
    make site_preview
    ```
  * Visit `http://127.0.0.1:8000/` and verify that:

    1. Your pattern title appears in the appropriate category table.
    2. A new item was added to the left-hand navigation (via MkDocs Material).

---

## 7. Finalize Setup & Create a Branch

* **Ensure you are on a clean `main` (or `master`) branch.**

  ```bash
  git checkout main
  git pull origin main
  ```

* **Create a feature branch for your work.**

  ```bash
  git checkout -b my-feature-branch
  ```

  * For example, if you plan to add multiple patterns or scripts, name the branch accordingly:

    ```
    git checkout -b add-inversion-of-control-pattern
    ```

* **Commit your local changes.**

  ```bash
  git add .
  git commit -m "feat: add my first agentic pattern"
  ```

* **Push your branch to GitHub.**

  ```bash
  git push origin my-feature-branch
  ```

---

## 8. (Optional) Run the Sorting Utility

> The repository includes a lightweight `sort.py` script that alphabetically orders pattern links within each category. It’s not strictly required, but helps keep the README tidy.

* **Execute the sort script.**

  ```bash
  python sort.py
  ```

  * This will:

    * Read `README.md`
    * Sort all bullet-point lists at the deepest indentation level
    * Optionally re-sort the top-level category blocks (depending on `sort.py` logic)
  * **Review the changes**:

    ```bash
    git diff README.md
    ```
  * If everything looks correct, commit the updated `README.md`:

    ```bash
    git add README.md
    git commit -m "chore: sort pattern entries in README"
    ```

---

## 9. Verify & Deploy

* **Run a final preview to ensure no build errors.**

  ```bash
  make site_preview
  ```

  * Fix any Markdown warnings or broken links that MkDocs reports.

* **(If you have write access) Trigger the GitHub Action.**

  * Pushing to `main` (or merging your branch via a PR) should invoke the “Build & Deploy” workflow:

    * `python scripts/build_readme.py`
    * `mkdocs gh-deploy --clean`
  * Check the Actions tab in GitHub to verify a successful deploy to `https://agentic-patterns.com`.

* **Review the live site** at [https://agentic-patterns.com](https://agentic-patterns.com) to confirm your changes are published.

---

## 10. (Optional) Set Up Tag Index & Search

> This step is optional but recommended if you plan to aggregate patterns by tag.

* **Create a `docs/tags.md` file.**

  ```bash
  touch docs/tags.md
  ```

  * Populate it with a short heading, e.g.:

    ```markdown
    # All Tags

    This page will list every tag and link to patterns in that category.
    ```

* **Write or reuse a script to generate “tags index.”**
  Example pseudocode logic:

  1. Parse all front-matter from `patterns/*.md`.
  2. Build a dictionary: `{ tag_name: [ (pattern_title, pattern_slug), … ] }`.
  3. Render Markdown sections:

     ```markdown
     ## orchestration
     - [Inversion of Control](patterns/inversion-of-control.md)
     - [Sub-Agent Spawning](patterns/sub-agent-spawning.md)

     ## memory
     - [Sliding-Window Curation](patterns/sliding-window-curation.md)
     ```
  4. Write the combined output back to `docs/tags.md`.
  5. Update `mkdocs.yaml` to include:

     ```yaml
     nav:
       - "Life is short, you need patterns.": "index.md"
       - Tags: "tags.md"
       # … other auto-generated entries …
     ```

  * **Run the tag-generation script** (if implemented) and verify `docs/tags.md` visually.

---

## 11. NEW Badge System

The repository automatically tracks which patterns should display "NEW" badges using a tracker file system.

### How It Works

* **Tracker File**: `.new-patterns-tracker.txt` maintains two sections:
  ```
  # Current NEW patterns (will show badges):
  abstracted-code-representation-for-review.md
  agent-assisted-scaffolding.md
  ...

  # Previous patterns (no longer new):
  agent-driven-research.md
  agent-friendly-workflow-design.md
  ...
  ```

* **Automatic Management**: When running `python scripts/build_readme.py`:
  1. **Loading NEW patterns**: Only reads patterns from "Current NEW patterns" section
  2. **Detecting changes**: Compares current files vs tracked files to find:
     - **Newly added**: Files that exist but aren't in tracker at all
     - **Deleted**: Files in tracker but no longer exist
  3. **Updating tracker**: When changes are detected:
     - Removes deleted patterns from both sections
     - If new patterns found: moves current NEW → Previous, adds new ones → NEW

### Adding New Patterns (Future)

When you add new pattern files:

1. **First run**: Script detects new files not in tracker
2. **Automatic promotion**: 
   - Current NEW patterns move to "Previous" section
   - New files become the NEW patterns
3. **Badge display**: Only the newly added files get NEW badges

**Example scenario:**
- Today: 10 patterns have NEW badges
- You add 3 new patterns next week
- After running script: Only those 3 new patterns get NEW badges
- The previous 10 lose their NEW badges and move to "Previous" section

### Manual Control

You can manually edit `.new-patterns-tracker.txt` to:
- Remove patterns from NEW section (they lose badges immediately)
- Move patterns between NEW/Previous sections
- Control which patterns show badges

The system ensures only genuinely new additions get highlighted, while maintaining a historical record of all patterns.

---

## 12. Housekeeping & Maintenance

* **Clean up untracked files.**

  ```bash
  git status
  git clean -fd
  ```

* **Ensure `.gitignore` is up to date.**
  Typical entries:

  ```
  .venv/
  __pycache__/
  site/
  *.pyc
  *.pyo
  .DS_Store
  ```

  * **If missing, add `.gitignore`** in the project root and commit it.

* **Review open issues and pull requests.**

  * Identify any unmerged patterns or build errors reported by CI.
  * Triage issues by applying labels: `proposal`, `needs-example`, `ready`, `duplicate`.

* **Schedule periodic cleanup.**

  * Decide on a cadence (e.g., every quarter) to:

    * Deprecate or archive stale patterns (tag them as `❌ deprecated` in front-matter).
    * Merge similar patterns (to avoid duplication).
    * Audit broken links or outdated sources.

---

🎉 **Congratulations!** You now have a fully working local copy of **awesome-agentic-patterns**.

* Feel free to add new patterns, refine existing ones, and enjoy a live preview of the MkDocs site at each step.
* When you’re ready, open a Pull Request—our GitHub Actions will regenerate and deploy the site automatically.

Happy pattern hunting! 🚀