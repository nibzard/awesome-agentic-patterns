// ABOUTME: Static Markdown twin of every pattern page, served at /patterns/<slug>.md.
// ABOUTME: Agents and crawlers get the same front-matter and body that the copy button produces.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getAllPatterns } from '../../lib/patterns';
import { patternToMarkdown } from '../../lib/pattern-markdown';
import type { PatternEntry } from '../../types';

export const getStaticPaths: GetStaticPaths = async () => {
  const patterns = await getAllPatterns();
  return patterns.map((pattern) => ({
    params: { slug: pattern.slug },
    props: { pattern },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const { pattern } = props as { pattern: PatternEntry };
  return new Response(patternToMarkdown(pattern), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
