// ABOUTME: Tests for choosing related patterns shown at the end of a pattern page.
// ABOUTME: Explicit links come first; shared tags fill the remaining slots.

import { describe, expect, test } from 'bun:test';
import { pickRelated } from './related';

const entry = (
  slug: string,
  tags: string[],
  category = 'Security & Safety',
  related?: string[]
) => ({
  id: slug,
  slug,
  title: slug,
  category,
  tags,
  related,
});

const all = [
  entry('a', ['injection', 'tools', 'safety'], 'Security & Safety', ['d', 'missing']),
  entry('b', ['injection', 'tools'], 'Security & Safety'),
  entry('c', ['injection'], 'Orchestration & Control'),
  entry('d', ['memory']),
  entry('e', ['injection', 'tools'], 'Orchestration & Control'),
  entry('f', ['unrelated']),
];

describe('pickRelated', () => {
  test('puts explicit related patterns first and skips unknown ids', () => {
    const result = pickRelated(all[0], all, 3);
    expect(result[0]).toMatchObject({ slug: 'd', reason: 'related' });
    expect(result.map((r) => r.slug)).not.toContain('missing');
  });

  test('fills with most shared tags, same category first on a tie', () => {
    const result = pickRelated(all[0], all, 4);
    expect(result.map((r) => r.slug)).toEqual(['d', 'b', 'e', 'c']);
    expect(result[1].reason).toBe('shared tags');
  });

  test('never returns the pattern itself or patterns with no link', () => {
    const result = pickRelated(all[0], all, 10);
    const slugs = result.map((r) => r.slug);
    expect(slugs).not.toContain('a');
    expect(slugs).not.toContain('f');
  });

  test('respects the limit', () => {
    expect(pickRelated(all[0], all, 2)).toHaveLength(2);
  });
});
