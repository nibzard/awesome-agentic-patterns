site_install:
	pip install -r requirements.txt

site_link:
	mkdir -p $(CURDIR)/docs
	ln -sf $(CURDIR)/README.md $(CURDIR)/docs/index.md
	cp $(CURDIR)/CONTRIBUTING.md $(CURDIR)/docs/CONTRIBUTING.md
	cp $(CURDIR)/LICENSE $(CURDIR)/docs/LICENSE
	cp $(CURDIR)/TEMPLATE.md $(CURDIR)/docs/TEMPLATE.md
	cp $(CURDIR)/agentic-patterns.jpeg $(CURDIR)/docs/agentic-patterns.jpeg
	rm -rf $(CURDIR)/docs/patterns
	mkdir -p $(CURDIR)/docs/patterns
	cp -R $(CURDIR)/patterns/* $(CURDIR)/docs/patterns/

site_preview: site_link
	mkdocs serve

site_build: site_link
	mkdocs build

site_deploy: site_link
	mkdocs gh-deploy --clean

# Git-based deployment with automatic pattern labeling
deploy_auto: 
	python3 scripts/deploy_git_based.py --commit --deploy

# View current pattern labels (git-based)
show_labels:
	python3 scripts/git_pattern_dates.py

# Debug specific pattern dates
debug_pattern:
	@read -p "Enter pattern name (without .md): " pattern; python3 scripts/git_pattern_dates.py $$pattern

# Build with git-based labels (without deployment)
build_with_labels:
	python3 scripts/deploy_git_based.py

# Lint pattern front-matter for schema drift
lint_front_matter:
	python3 scripts/lint_front_matter.py

# Auto-fix missing sections and reference hygiene in patterns
fix_pattern_quality:
	python3 scripts/fix_pattern_quality.py

PROJECT_PINNED_CLAUDE_BIN ?=

research_loop:
	PROJECT_PINNED_CLAUDE_BIN="$(PROJECT_PINNED_CLAUDE_BIN)" ./scripts/claude-research-loop.sh

# Update patterns from existing research reports using Claude Code
# Examples:
#   make update_patterns_from_research
#   make update_patterns_from_research PATTERN=action-selector-pattern
#   make update_patterns_from_research TEMPLATE_LINK="https://.../TEMPLATE.md"
PATTERN ?=
CLAUDE_BIN ?=
CLAUDE_MODEL ?=
PATTERNS_DIR ?=
RESEARCH_DIR ?=
LOG_DIR ?=
LOOP_DELAY_SECONDS ?=
TEMPLATE_LINK ?=

update_patterns_from_research:
	@if [ -n "$(PATTERN)" ]; then \
		PATTERNS_DIR="$(PATTERNS_DIR)" \
		RESEARCH_DIR="$(RESEARCH_DIR)" \
		LOG_DIR="$(LOG_DIR)" \
		CLAUDE_BIN="$(CLAUDE_BIN)" \
		CLAUDE_MODEL="$(CLAUDE_MODEL)" \
		LOOP_DELAY_SECONDS="$(LOOP_DELAY_SECONDS)" \
		TEMPLATE_LINK="$(TEMPLATE_LINK)" \
		./scripts/update-patterns-from-research.sh --pattern "$(PATTERN)"; \
	else \
		PATTERNS_DIR="$(PATTERNS_DIR)" \
		RESEARCH_DIR="$(RESEARCH_DIR)" \
		LOG_DIR="$(LOG_DIR)" \
		CLAUDE_BIN="$(CLAUDE_BIN)" \
		CLAUDE_MODEL="$(CLAUDE_MODEL)" \
		LOOP_DELAY_SECONDS="$(LOOP_DELAY_SECONDS)" \
		TEMPLATE_LINK="$(TEMPLATE_LINK)" \
		./scripts/update-patterns-from-research.sh; \
	fi
