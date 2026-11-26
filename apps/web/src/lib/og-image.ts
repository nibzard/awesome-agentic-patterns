// ABOUTME: Renders the 1200x630 social share image for a page as a PNG, with Satori and resvg.
// ABOUTME: One large title, one small line above it, and the brand; built to read at thumbnail size.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
const PAD_X = 80;
const PAD_Y = 72;
// Satori sizes boxes as content-box: width and height exclude padding.
const CONTENT_WIDTH = OG_WIDTH - PAD_X * 2;
const CONTENT_HEIGHT = OG_HEIGHT - PAD_Y * 2;
const MARK_SIZE = 220;
const TEXT_WIDTH = CONTENT_WIDTH - MARK_SIZE - 80;

export interface OgCard {
  title: string;
  /** One short line above the title, for example the pattern category. */
  eyebrow?: string;
}

// Dark theme tokens from global.css.
const COLORS = {
  bg: '#0e0f11',
  text: '#e8e9eb',
  muted: '#9aa0a8',
  primary: '#f0826a',
};

/** Collapses whitespace and cuts text at a word boundary so it is at most `max` characters. */
export function clampText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  // Keep the last word when the cut lands exactly at its end.
  const endsAtWord = clean[max - 1] === ' ';
  const lastSpace = cut.lastIndexOf(' ');
  const kept = endsAtWord || lastSpace <= 0 ? cut : cut.slice(0, lastSpace);
  return `${kept.replace(/[\s,.;:]+$/, '')}…`;
}

/** Title font size in px: short titles are set larger so the card reads at thumbnail size. */
export function titleSize(title: string): number {
  const length = title.length;
  if (length <= 22) return 96;
  if (length <= 36) return 80;
  if (length <= 56) return 66;
  return 56;
}

type Font = { name: string; data: Buffer; weight: 400 | 700; style: 'normal' };
let fontCache: Font[] | null = null;

function loadFonts(): Font[] {
  if (fontCache) return fontCache;
  const require = createRequire(import.meta.url);
  // `geist/font` resolves to geist/dist/font.js; the TTF files are in geist/dist/fonts.
  // Node enforces the package `exports` map, so resolve an exported entry, not package.json.
  const fontsDir = join(dirname(require.resolve('geist/font')), 'fonts');
  const read = (file: string) => readFileSync(join(fontsDir, file));
  fontCache = [
    { name: 'Geist', data: read('geist-sans/Geist-Bold.ttf'), weight: 700, style: 'normal' },
    {
      name: 'Geist Mono',
      data: read('geist-mono/GeistMono-Regular.ttf'),
      weight: 400,
      style: 'normal',
    },
  ];
  return fontCache;
}

type Node = { type: string; props: Record<string, unknown> };
const el = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
  extra = {}
): Node => ({
  type,
  props: { style, children, ...extra },
});

// Same 2x2 mark as the site header: two solid cells on the diagonal, two outlined.
function mark(size: number): Node {
  const cell = (x: number, y: number, solid: boolean) =>
    el('rect', {}, undefined, {
      x: solid ? x : x + 1,
      y: solid ? y : y + 1,
      width: solid ? 9 : 7,
      height: solid ? 9 : 7,
      rx: solid ? 2 : 1.5,
      fill: solid ? COLORS.primary : 'none',
      stroke: solid ? 'none' : COLORS.primary,
      'stroke-width': 2,
    });
  return el(
    'svg',
    { flexShrink: 0 },
    [cell(2, 2, true), cell(13, 2, false), cell(2, 13, false), cell(13, 13, true)],
    { width: size, height: size, viewBox: '0 0 24 24' }
  );
}

function card({ title, eyebrow }: OgCard): Node {
  const text = clampText(title, 80);
  return el(
    'div',
    {
      width: CONTENT_WIDTH,
      height: CONTENT_HEIGHT,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${PAD_Y}px ${PAD_X}px`,
      background: COLORS.bg,
      color: COLORS.text,
    },
    [
      el(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: TEXT_WIDTH,
          height: CONTENT_HEIGHT,
        },
        [
          el(
            'div',
            { display: 'flex', fontFamily: 'Geist Mono', fontSize: 28, color: COLORS.primary },
            eyebrow || ' '
          ),
          el(
            'div',
            {
              display: 'flex',
              fontFamily: 'Geist',
              fontWeight: 700,
              fontSize: titleSize(text),
              lineHeight: 1.05,
              letterSpacing: -2,
            },
            text
          ),
          el(
            'div',
            { display: 'flex', fontFamily: 'Geist Mono', fontSize: 30, color: COLORS.muted },
            [
              el('span', { color: COLORS.text }, 'agentic'),
              el('span', {}, '/'),
              el('span', { color: COLORS.text }, 'patterns'),
            ]
          ),
        ]
      ),
      mark(MARK_SIZE),
    ]
  );
}

/** Renders the share card as a PNG. */
export async function renderOgImage(input: OgCard): Promise<Uint8Array> {
  const svg = await satori(card(input) as never, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: loadFonts(),
  });
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();
}
