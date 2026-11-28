// ABOUTME: Static Markdown bundle for each curated pattern pack, served at /packs/<slug>.md.

import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { getAllPatterns } from '../../lib/patterns';
import { buildPackMarkdown, getPackCatalogEntry } from '../../lib/starter-pack';

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const packs = await getCollection('packs');
  return packs.map((pack: CollectionEntry<'packs'>) => ({
    params: { slug: pack.id },
    props: { pack },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { pack } = props as { pack: CollectionEntry<'packs'> };
  const allPatterns = await getAllPatterns();
  const entry = getPackCatalogEntry(pack.id) ?? {
    slug: pack.id,
    title: pack.data.title,
    summary: pack.data.summary,
    domain: pack.data.domain,
    patterns: pack.data.patterns,
    downloadUrl: `/packs/${pack.id}.md`,
  };

  return new Response(buildPackMarkdown(entry, allPatterns), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
