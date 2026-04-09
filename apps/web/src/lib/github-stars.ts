// ABOUTME: Reads the pre-fetched GitHub star count from the static data file.
// ABOUTME: The star count is fetched once by build-data.ts before the Astro build runs.

import starData from '../data/github-stars.json';

let cached: string | null = null;

export function getGithubStarCount(): string | null {
  if (cached !== null) return cached;
  cached = (starData as { formatted: string }).formatted ?? null;
  return cached;
}
