// ABOUTME: Tests for the social share image: text fitting and the rendered 1200x630 PNG.
// ABOUTME: Renders real PNGs with Satori and resvg, so it also checks that the bundled fonts load.

import { describe, expect, test } from 'bun:test';
import { clampText, renderOgImage } from './og-image';

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

describe('renderOgImage', () => {
  test('renders a 1200x630 PNG for a pattern', async () => {
    const png = await renderOgImage({
      title: 'Dual LLM Pattern',
      summary:
        'Splits work between a privileged LLM that calls tools but never sees untrusted data and a quarantined LLM that reads untrusted data but has no tools',
      category: 'Orchestration & Control',
      status: 'emerging',
    });
    expect(Array.from(png.slice(0, 8))).toEqual(PNG_SIGNATURE);
    expect(pngSize(png)).toEqual({ width: 1200, height: 630 });
  });

  test('renders the site card without category or status', async () => {
    const png = await renderOgImage({
      title: 'Agent design patterns',
      summary: 'An open catalog of patterns for building AI agents.',
    });
    expect(pngSize(png)).toEqual({ width: 1200, height: 630 });
  });
});
