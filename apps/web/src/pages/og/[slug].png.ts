// ABOUTME: Build-time endpoint for /og/<slug>.png, the 1200x630 share image of one pattern.
// ABOUTME: Pattern pages point og:image and twitter:image at this file.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getAllPatterns } from '../../lib/patterns';
import { renderOgImage } from '../../lib/og-image';
import type { PatternEntry } from '../../types';

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const patterns = await getAllPatterns();
  return patterns.map((pattern) => ({ params: { slug: pattern.slug }, props: { pattern } }));
};

export const GET: APIRoute = async ({ props }) => {
  const { pattern } = props as { pattern: PatternEntry };
  const png = await renderOgImage({ title: pattern.title, eyebrow: pattern.category });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
