// ABOUTME: Unit tests for newsletter client storage state, view counting, and dismissal windows.

import { describe, expect, test } from 'bun:test';
import {
  NUDGE_DISMISSED_KEY,
  SUBSCRIBED_KEY,
  isContentPath,
  isDismissedWithinDays,
  isSubscribed,
  markDismissed,
  markSubscribed,
  recordContentView,
  type StorageLike,
} from './newsletter-client';

function createMemoryStorage(): StorageLike {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

describe('newsletter-client storage helpers', () => {
  test('isSubscribed reflects markSubscribed state', () => {
    const storage = createMemoryStorage();
    expect(isSubscribed(storage)).toBe(false);

    markSubscribed('homepage-hero', storage, new Date('2026-11-28T09:00:00Z'));
    expect(isSubscribed(storage)).toBe(true);
    expect(JSON.parse(storage.getItem(SUBSCRIBED_KEY) || '{}').source).toBe('homepage-hero');
  });

  test('isDismissedWithinDays respects 30-day cooldown', () => {
    const storage = createMemoryStorage();
    const day0 = new Date('2026-11-01T00:00:00Z');
    markDismissed(NUDGE_DISMISSED_KEY, storage, day0);

    expect(
      isDismissedWithinDays(NUDGE_DISMISSED_KEY, 30, storage, new Date('2026-11-15T00:00:00Z'))
    ).toBe(true);
    expect(
      isDismissedWithinDays(NUDGE_DISMISSED_KEY, 30, storage, new Date('2026-12-05T00:00:00Z'))
    ).toBe(false);
  });

  test('recordContentView counts unique pattern and guide views only', () => {
    const session = createMemoryStorage();
    expect(isContentPath('/')).toBe(false);
    expect(isContentPath('/patterns')).toBe(false);
    expect(isContentPath('/patterns/dual-llm-pattern')).toBe(true);
    expect(isContentPath('/guides/pattern-selection')).toBe(true);

    expect(recordContentView('/', session)).toBe(0);
    expect(recordContentView('/patterns/dual-llm-pattern', session)).toBe(1);
    expect(recordContentView('/patterns/dual-llm-pattern/', session)).toBe(1);
    expect(recordContentView('/guides/pattern-selection', session)).toBe(2);
  });
});
