// ABOUTME: Renders the 1200x630 social share image for a page as a PNG, with Satori and resvg.
// ABOUTME: Uses the dark site palette and the Geist fonts from the geist package, so builds need no network.

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { SITE_URL } from './pattern-markdown';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
const PAD_X = 72;
const PAD_Y = 56;
const TOP_BORDER = 6;
// Satori sizes boxes as content-box: width and height exclude padding and border.
const CONTENT_WIDTH = OG_WIDTH - PAD_X * 2;
const CONTENT_HEIGHT = OG_HEIGHT - PAD_Y * 2 - TOP_BORDER;

export interface OgCard {
  title: string;
  summary?: string;
  category?: string;
  status?: string;
}

// Dark theme tokens from global.css.
const COLORS = {
  bg: '#0e0f11',
  text: '#e8e9eb',
  muted: '#9aa0a8',
  border: '#262a30',
  primary: '#f0826a',
};

const STATUS_COLORS: Record<string, { fg: string; bg: string }> = {
  foundational: { fg: '#7fa7e6', bg: 'rgba(127, 167, 230, 0.14)' },
  production: { fg: '#5fbf8a', bg: 'rgba(95, 191, 138, 0.14)' },
  emerging: { fg: '#e0b04d', bg: 'rgba(224, 176, 77, 0.14)' },
  proposed: { fg: '#9aa0a8', bg: '#202328' },
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

let fontCache: { name: string; data: Buffer; weight: 400 | 600; style: 'normal' }[] | null = null;

function loadFonts() {
  if (fontCache) return fontCache;
  const require = createRequire(import.meta.url);
  // `geist/font` resolves to geist/dist/font.js; the TTF files are in geist/dist/fonts.
  // Node enforces the package `exports` map, so resolve an exported entry, not package.json.
  const fontsDir = join(dirname(require.resolve('geist/font')), 'fonts');
  const read = (file: string) => readFileSync(join(fontsDir, file));
  fontCache = [
    { name: 'Geist', data: read('geist-sans/Geist-Regular.ttf'), weight: 400, style: 'normal' },
    { name: 'Geist', data: read('geist-sans/Geist-SemiBold.ttf'), weight: 600, style: 'normal' },
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
    {},
    [cell(2, 2, true), cell(13, 2, false), cell(2, 13, false), cell(13, 13, true)],
    { width: size, height: size, viewBox: '0 0 24 24' }
  );
}

function card({ title, summary, category, status }: OgCard): Node {
  const statusColor = status ? STATUS_COLORS[status] || STATUS_COLORS.proposed : null;
  const host = SITE_URL.replace(/^https?:\/\//, '');
  const footerItems: Node[] = [];
  if (status && statusColor) {
    footerItems.push(
      el(
        'div',
        {
          display: 'flex',
          flexShrink: 0,
          padding: '6px 14px',
          borderRadius: 6,
          background: statusColor.bg,
          color: statusColor.fg,
          fontFamily: 'Geist Mono',
          fontSize: 22,
        },
        status
      )
    );
  }
  if (category) {
    footerItems.push(
      el('div', { display: 'flex', flexShrink: 0, color: COLORS.muted, fontSize: 24 }, category)
    );
  }
  footerItems.push(
    el(
      'div',
      {
        display: 'flex',
        marginLeft: 'auto',
        color: COLORS.muted,
        fontFamily: 'Geist Mono',
        fontSize: 22,
      },
      host
    )
  );

  return el(
    'div',
    {
      width: CONTENT_WIDTH,
      height: CONTENT_HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      padding: `${PAD_Y}px ${PAD_X}px`,
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: 'Geist',
      borderTop: `${TOP_BORDER}px solid ${COLORS.primary}`,
    },
    [
      el('div', { display: 'flex', alignItems: 'center', gap: 16 }, [
        mark(40),
        el('div', { display: 'flex', fontFamily: 'Geist Mono', fontSize: 28 }, [
          el('span', {}, 'agentic'),
          el('span', { color: COLORS.muted }, '/'),
          el('span', {}, 'patterns'),
        ]),
      ]),
      el(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flexGrow: 1,
          width: CONTENT_WIDTH,
        },
        [
          el(
            'div',
            { display: 'flex', fontSize: 64, fontWeight: 600, lineHeight: 1.1, letterSpacing: -1 },
            clampText(title, 90)
          ),
          summary
            ? el(
                'div',
                {
                  display: 'flex',
                  marginTop: 24,
                  fontSize: 28,
                  lineHeight: 1.4,
                  color: COLORS.muted,
                },
                clampText(summary, 170)
              )
            : el('div', { display: 'flex' }),
        ]
      ),
      el(
        'div',
        {
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          width: CONTENT_WIDTH,
          paddingTop: 28,
          borderTop: `1px solid ${COLORS.border}`,
        },
        footerItems
      ),
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
