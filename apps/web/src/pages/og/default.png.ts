// ABOUTME: Build-time endpoint for /og/default.png, the share image for every page without its own.
// ABOUTME: Shows the site title and the current pattern count.
import type { APIRoute } from 'astro';
import { getAllPatterns } from '../../lib/patterns';
import { renderOgImage } from '../../lib/og-image';

export const prerender = true;

export const GET: APIRoute = async () => {
  const patterns = await getAllPatterns();
  const png = await renderOgImage({
    title: 'Agent design patterns',
    eyebrow: `${patterns.length} patterns · open source`,
  });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
