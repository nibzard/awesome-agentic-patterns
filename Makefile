site_install:
	pip install -r requirements.txt

site_link:
	mkdir -p $(CURDIR)/docs
	ln -sf $(CURDIR)/README.md $(CURDIR)/docs/index.md
	cp $(CURDIR)/CONTRIBUTING.md $(CURDIR)/docs/CONTRIBUTING.md
	cp $(CURDIR)/LICENSE $(CURDIR)/docs/LICENSE
	cp $(CURDIR)/TEMPLATE.md $(CURDIR)/docs/TEMPLATE.md
	cp $(CURDIR)/agentic-patterns.jpeg $(CURDIR)/docs/agentic-patterns.jpeg
	mkdir -p $(CURDIR)/docs/patterns
	cp -R $(CURDIR)/patterns/* $(CURDIR)/docs/patterns/

site_preview: site_link
	mkdocs serve

site_build: site_link
	mkdocs build

site_deploy: site_link
	mkdocs gh-deploy --clean