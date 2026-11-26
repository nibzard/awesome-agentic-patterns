// ABOUTME: Short display label for a pattern source: host and path without scheme or "www.".
// ABOUTME: Text that is not an http(s) URL is returned as written.

export function sourceLabel(source: string): string {
  let url: URL;
  try {
    url = new URL(source);
  } catch {
    return source;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return source;
  const host = url.hostname.replace(/^www\./, '');
  const path = url.pathname.replace(/\/$/, '');
  return `${host}${path}${url.search}`;
}
