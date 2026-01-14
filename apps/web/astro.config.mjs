import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeMermaid from 'rehype-mermaid';

export default defineConfig({
  site: 'https://agentic-patterns.com',
  base: '/',
  outDir: 'dist',
  publicDir: 'public',
  integrations: [mdx()],
  markdown: {
    rehypePlugins: [rehypeMermaid],
  },
});
