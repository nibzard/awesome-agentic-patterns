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
