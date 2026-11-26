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
    summary: `An open catalog of ${patterns.length} patterns for building AI agents. Each pattern is a plain Markdown file for people and agents.`,
  });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
