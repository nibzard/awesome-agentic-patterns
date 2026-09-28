// ABOUTME: Tests for rendering pattern Markdown to HTML.
// ABOUTME: Covers links between pattern files, which use repository-relative .md paths.

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
