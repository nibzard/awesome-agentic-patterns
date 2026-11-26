// ABOUTME: Tests for the short source label shown in the pattern page rail.
// ABOUTME: URLs drop the scheme, "www.", and a trailing slash; other text stays as written.

import { describe, expect, test } from 'bun:test';
import { sourceLabel } from './source-label';

describe('sourceLabel', () => {
  test('drops the scheme from a URL', () => {
    expect(sourceLabel('https://arxiv.org/abs/2506.08837')).toBe('arxiv.org/abs/2506.08837');
  });

  test('drops www. and a trailing slash', () => {
    expect(sourceLabel('https://www.example.com/blog/post/')).toBe('example.com/blog/post');
  });

  test('keeps the query string', () => {
    expect(sourceLabel('https://www.youtube.com/watch?v=abc')).toBe('youtube.com/watch?v=abc');
  });

  test('returns text that is not a URL unchanged', () => {
    expect(sourceLabel('Internal practice at Example Corp')).toBe(
      'Internal practice at Example Corp'
    );
  });
});
