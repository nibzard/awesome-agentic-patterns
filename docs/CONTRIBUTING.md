# Contributing

Your contributions are always welcome!

## Guidelines

* Add one link per Pull Request.
    * Make sure the PR title is in the format of `Add project-name`.
    * Write down the reason why the library is awesome.
* Add the link: `* [project-name](http://example.com/) - A short description ends with a period.`
    * Keep descriptions concise and **short**.
* Add a section if needed.
    * Add the section description.
    * Add the section title to Table of Contents.
* Search previous Pull Requests or Issues before making a new one, as yours may be a duplicate.
* Don't mention `Python` in the description as it's implied.
* Check your spelling and grammar.
* Remove any trailing whitespace.

## Pattern file template

Create a new file under `patterns/` named with *kebab‑case* and follow the provided minimal [`TEMPLATE`](https://github.com/nibzard/awesome-agentic-patterns/blob/main/TEMPLATE.md).

*Keep it concise — max ~200 lines per pattern.*

A simple Python script (`scripts/build_readme.py`) parses front‑matter from every pattern, updates the tables in this README, and refreshes the MkDocs navigation. A GitHub Action runs the script on every `main` push so the site at **agentic‑patterns.com** is always up‑to‑date.

Just a gentle reminder: **Try not to submit your own project. Instead, wait for someone finds it useful and submits it for you.**