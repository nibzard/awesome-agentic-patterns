// ABOUTME: Tests for detecting whether a pattern body contains a code example.
// ABOUTME: Mermaid diagrams do not count as code; other fenced blocks do.

import { describe, expect, test } from 'bun:test';
import { hasCodeExample } from './code-example';

describe('hasCodeExample', () => {
  test('finds a fenced code block with a language', () => {
    expect(hasCodeExample('Text\n\n```python\nprint(1)\n```\n')).toBe(true);
  });

  test('finds a fenced code block without a language', () => {
    expect(hasCodeExample('```\nplain\n```')).toBe(true);
  });

  test('ignores a mermaid diagram, including its closing fence', () => {
    expect(hasCodeExample('```mermaid\ngraph TD\n  A-->B\n```\n\nMore text.')).toBe(false);
  });

  test('finds code that follows a mermaid diagram', () => {
    expect(hasCodeExample('```mermaid\ngraph TD\n```\n\n~~~ts\nconst a = 1;\n~~~\n')).toBe(true);
  });

  test('returns false for prose only', () => {
    expect(hasCodeExample('## Problem\n\nNo code here.')).toBe(false);
  });
});
