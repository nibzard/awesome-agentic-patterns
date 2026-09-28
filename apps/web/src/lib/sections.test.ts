// ABOUTME: Tests for splitting pattern Markdown bodies into level-2 sections.
// ABOUTME: Covers source order, unknown headings, nested headings, and fenced code.

import { describe, expect, test } from 'bun:test';
import { splitSections } from './sections';

const body = `## Problem

Agents call broken tools again and again.

## Solution

Track failures per tool.

### State machine

Closed, open, half-open.

## Evidence

- **Evidence Grade:** medium

## How to use it

Wrap each tool client.

## Trade-offs

More moving parts.

## References

- Release It!
`;

describe('splitSections', () => {
  test('keeps every level-2 section in source order', () => {
    expect(splitSections(body).map((s) => s.label)).toEqual([
      'Problem',
      'Solution',
      'Evidence',
      'How to use it',
      'Trade-offs',
      'References',
    ]);
  });

  test('keeps level-3 subsections inside their parent section', () => {
    const solution = splitSections(body).find((s) => s.label === 'Solution');
    expect(solution?.markdown).toContain('### State machine');
    expect(solution?.markdown).toContain('Closed, open, half-open.');
  });

  test('gives each section a stable URL-safe id', () => {
    expect(splitSections(body).map((s) => s.id)).toEqual([
      'problem',
      'solution',
      'evidence',
      'how-to-use-it',
      'trade-offs',
      'references',
    ]);
  });

  test('ignores headings inside fenced code blocks', () => {
    const withCode = '## Example\n\n```md\n## Not a heading\n```\n\n## References\n\n- a\n';
    const sections = splitSections(withCode);
    expect(sections.map((s) => s.label)).toEqual(['Example', 'References']);
    expect(sections[0].markdown).toContain('## Not a heading');
  });

  test('drops text before the first section and empty sections', () => {
    const sections = splitSections('Intro text\n\n## Problem\n\n## Solution\n\nDo X.\n');
    expect(sections.map((s) => s.label)).toEqual(['Solution']);
  });
});
