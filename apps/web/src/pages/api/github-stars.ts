import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const response = await fetch('https://api.github.com/repos/nibzard/awesome-agentic-patterns', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);

    const { stargazers_count: count } = await response.json();
    if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid GitHub star count');

    const formatted = new Intl.NumberFormat('en-US', {
      notation: count >= 1000 ? 'compact' : 'standard',
      maximumFractionDigits: 1,
    }).format(count);

    return new Response(JSON.stringify({ count, formatted }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.warn('[github-stars] Could not fetch GitHub stars:', error);
    return new Response(null, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
};
