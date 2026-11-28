// ABOUTME: Static Markdown bundle for the 12-pattern Production Agent Starter Pack, served at /starter-pack.md.

import type { APIRoute } from 'astro';
import { getAllPatterns } from '../lib/patterns';
import { buildStarterPackMarkdown } from '../lib/starter-pack';

export const prerender = true;

export const GET: APIRoute = async () => {
  const patterns = await getAllPatterns();
  return new Response(buildStarterPackMarkdown(patterns), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
