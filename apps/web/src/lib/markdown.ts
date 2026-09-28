// ABOUTME: Renders pattern Markdown to HTML with markdown-it for pattern pages.
// ABOUTME: Handles Mermaid fences, absolute image paths, and links between pattern files.
import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
});

const defaultFence =
  markdown.renderer.rules.fence ||
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

markdown.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const info = (token.info || '').trim().toLowerCase();

  if (info === 'mermaid') {
    return `<div class="mermaid">${markdown.utils.escapeHtml(token.content)}</div>`;
  }

  return defaultFence(tokens, idx, options, env, self);
};

const REPO_BLOB_URL = 'https://github.com/nibzard/awesome-agentic-patterns/blob/main/';
const PATTERN_FILE_LINK =
  /^(?:\.\/|\.\.\/patterns\/|\/?patterns\/)?([a-z0-9][a-z0-9-]*)\.md(#.*)?$/i;
const REPO_MARKDOWN_LINK = /^(?!\w+:|\/\/)(.+\.md)(#.*)?$/i;

// Pattern files link to each other as `other-pattern.md`, which works on GitHub but not on the
// site. Point those links at the pattern page, and other repository Markdown files at GitHub.
export function rewritePatternLink(href: string): string {
  const pattern = href.match(PATTERN_FILE_LINK);
  if (pattern) return `/patterns/${pattern[1]}${pattern[2] || ''}`;
  const repoFile = href.match(REPO_MARKDOWN_LINK);
  if (repoFile) {
    const path = repoFile[1].replace(/^(\.\.?\/)+/, '').replace(/^\//, '');
    return `${REPO_BLOB_URL}${path}${repoFile[2] || ''}`;
  }
  return href;
}

const defaultLinkOpen =
  markdown.renderer.rules.link_open ||
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet('href');
  if (href) tokens[idx].attrSet('href', rewritePatternLink(href));
  return defaultLinkOpen(tokens, idx, options, env, self);
};

export function renderMarkdown(source: string, basePath = '/'): string {
  if (!source) return '';
  const html = markdown.render(source);
  return ensureAbsoluteImagePaths(html, basePath);
}

function ensureAbsoluteImagePaths(html: string, basePath: string): string {
  return html.replace(
    /<img([^>]*\s)src=("|')([^"']+)(\2)([^>]*)>/gi,
    (match, before, quote, src, _closingQuote, after) => {
      if (isAbsoluteUrl(src)) {
        return match;
      }
      const normalizedSrc = normalizePath(src, basePath);
      return `<img${before}src=${quote}${normalizedSrc}${quote}${after}>`;
    }
  );
}

function isAbsoluteUrl(url: string): boolean {
  return (
    url.startsWith('/') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('#')
  );
}

function normalizePath(path: string, basePath: string): string {
  let normalized = path.replace(/^(\.\.?\/)+/, '');

  if (!normalized.startsWith('/')) {
    normalized = `${basePath}/${normalized}`;
  }

  return normalized.replace(/\/+/g, '/');
}
