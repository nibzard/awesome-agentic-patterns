import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeMermaid from 'rehype-mermaid';
import { remarkAssetPaths } from './src/lib/remark-asset-paths.ts';

export default defineConfig({
  site: 'https://agentic-patterns.com',
  base: '/',
  outDir: 'dist',
  publicDir: 'public',
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [[remarkAssetPaths, { basePath: '' }]],
    rehypePlugins: [rehypeMermaid],
  },
});
