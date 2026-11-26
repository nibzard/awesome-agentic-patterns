// ABOUTME: Tests for the social share image: text fitting, title sizing, and the rendered 1200x630 PNG.
// ABOUTME: Renders real PNGs with Satori and resvg, so it also checks that the bundled fonts load.

import { describe, expect, test } from 'bun:test';
import { clampText, renderOgImage, titleSize } from './og-image';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function pngSize(png: Uint8Array): { width: number; height: number } {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

describe('clampText', () => {
  test('keeps short text unchanged', () => {
    expect(clampText('Dual LLM Pattern', 80)).toBe('Dual LLM Pattern');
  });

  test('cuts long text at a word boundary and adds an ellipsis', () => {
    const result = clampText('one two three four five six', 14);
    expect(result).toBe('one two three…');
    expect(result.length).toBeLessThanOrEqual(14);
  });

  test('collapses whitespace', () => {
    expect(clampText('  a\n  b   c ', 80)).toBe('a b c');
  });
});

describe('titleSize', () => {
  test('sets short titles larger than long ones', () => {
    expect(titleSize('Dual LLM Pattern')).toBeGreaterThan(
      titleSize('Canary Rollout and Automatic Rollback for Agent Policy Changes')
    );
  });
});

describe('renderOgImage', () => {
  test('renders a 1200x630 PNG for a pattern', async () => {
    const png = await renderOgImage({
      title: 'Dual LLM Pattern',
      eyebrow: 'Orchestration & Control',
    });
    expect(Array.from(png.slice(0, 8))).toEqual(PNG_SIGNATURE);
    expect(pngSize(png)).toEqual({ width: 1200, height: 630 });
  });

  test('renders a card without an eyebrow', async () => {
    const png = await renderOgImage({ title: 'Agent design patterns' });
    expect(pngSize(png)).toEqual({ width: 1200, height: 630 });
  });
});
