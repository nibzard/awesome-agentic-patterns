// ABOUTME: Detects whether a pattern body contains a code example (a fenced block that is not a diagram).
// ABOUTME: The catalog uses this for its "has code" filter.

const FENCE = /^\s*(```|~~~)\s*([\w-]*)/;
const DIAGRAM_LANGUAGES = new Set(['mermaid']);

export function hasCodeExample(body: string): boolean {
  let inFence = false;
  for (const line of body.split('\n')) {
    const match = line.match(FENCE);
    if (!match) continue;
    if (inFence) {
      inFence = false;
      continue;
    }
    inFence = true;
    if (!DIAGRAM_LANGUAGES.has(match[2].toLowerCase())) return true;
  }
  return false;
}
