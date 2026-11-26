// ABOUTME: Tests for rendering pattern Markdown to HTML.
// ABOUTME: Covers pattern file links, which use repository-relative .md paths, and auto-links for bare text.

import { describe, expect, test } from 'bun:test';
import { renderMarkdown } from './markdown';

describe('renderMarkdown pattern links', () => {
  test('turns a bare pattern file link into a site pattern URL', () => {
    const html = renderMarkdown('See [Breaker](agent-circuit-breaker.md).');
    expect(html).toContain('href="/patterns/agent-circuit-breaker"');
  });

  test('handles ./ and ../patterns/ prefixes and keeps the anchor', () => {
    expect(renderMarkdown('[a](./dual-llm-pattern.md)')).toContain(
      'href="/patterns/dual-llm-pattern"'
    );
    expect(renderMarkdown('[b](../patterns/reflection.md#solution)')).toContain(
      'href="/patterns/reflection#solution"'
    );
  });

  test('sends other repository files to GitHub', () => {
    const html = renderMarkdown('[report](/research/some-report.md)');
    expect(html).toContain(
      'href="https://github.com/nibzard/awesome-agentic-patterns/blob/main/research/some-report.md"'
    );
  });

  test('leaves external and site links alone', () => {
    const html = renderMarkdown('[x](https://example.com/readme.md) [y](/agents)');
    expect(html).toContain('href="https://example.com/readme.md"');
    expect(html).toContain('href="/agents"');
  });
});

describe('renderMarkdown auto-links', () => {
  test('keeps bare Markdown file names as text', () => {
    const html = renderMarkdown('Keep rules in CLAUDE.md and SKILL.md.');
    expect(html).not.toContain('<a');
    expect(html).toContain('CLAUDE.md and SKILL.md');
  });

  test('still links a URL that has a scheme', () => {
    const html = renderMarkdown('See https://example.com/docs and http://example.org');
    expect(html).toContain('href="https://example.com/docs"');
    expect(html).toContain('href="http://example.org');
  });

  test('still turns a Markdown pattern link into a site URL', () => {
    const html = renderMarkdown('See [Other](other-pattern.md).');
    expect(html).toContain('href="/patterns/other-pattern"');
  });
});
