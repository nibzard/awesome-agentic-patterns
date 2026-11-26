import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import rehypeMermaid from 'rehype-mermaid';
import { remarkAssetPaths } from './src/lib/remark-asset-paths.ts';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://agentic-patterns.com',
  base: '/',
  outDir: 'dist',
  publicDir: 'public',
  integrations: [mdx()],
  adapter: vercel(),
  compressHTML: true,
  markdown: {
    processor: unified({
      remarkPlugins: [[remarkAssetPaths, { basePath: '' }]],
      rehypePlugins: [rehypeMermaid],
    }),
    shikiConfig: {
      // Pattern files use these fence labels for pseudocode; render them as plain text.
      langAlias: { pseudo: 'plaintext', dsl: 'plaintext' },
    },
  },
  vite: {
    build: {
      rolldownOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
});
