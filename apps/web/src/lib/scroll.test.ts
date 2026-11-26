// ABOUTME: Tests for centering a child element inside its own scroll container.
// ABOUTME: The page itself must not scroll; only the container's scrollTop changes.

import { describe, expect, test } from 'bun:test';
import { centerInContainer } from './scroll';

const makeContainer = (clientHeight: number, top = 0) => ({
  clientHeight,
  scrollTop: 0,
  getBoundingClientRect: () => ({ top }),
});

const makeChild = (top: number, height: number) => {
  const child = {
    calls: 0,
    getBoundingClientRect: () => ({ top, height }),
    scrollIntoView: () => {
      child.calls += 1;
    },
  };
  return child;
};

describe('centerInContainer', () => {
  test('sets scrollTop so the child sits in the middle of the container', () => {
    const container = makeContainer(400, 100);
    const child = makeChild(1100, 20);
    centerInContainer(container, child);
    // Child is 1000px below the container top; center it in a 400px view.
    expect(container.scrollTop).toBe(1000 - 200 + 10);
  });

  test('does not call scrollIntoView, which also scrolls the window', () => {
    const container = makeContainer(400);
    const child = makeChild(900, 20);
    centerInContainer(container, child);
    expect(child.calls).toBe(0);
  });

  test('keeps scrollTop at zero when the child is already near the top', () => {
    const container = makeContainer(400);
    const child = makeChild(50, 20);
    centerInContainer(container, child);
    expect(container.scrollTop).toBe(0);
  });
});
