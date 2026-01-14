import { defineConfig } from 'astro/config';
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
  markdown: {
    remarkPlugins: [[remarkAssetPaths, { basePath: '' }]],
    rehypePlugins: [rehypeMermaid],
  },
  vite: {
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
});
