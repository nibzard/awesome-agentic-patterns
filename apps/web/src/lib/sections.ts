// ABOUTME: Splits a pattern Markdown body into its level-2 sections for the pattern page.
// ABOUTME: Each section keeps its heading label, a URL-safe id, and its raw Markdown content.

export interface PatternSection {
  id: string;
  label: string;
  markdown: string;
}

const FENCE = /^\s*(```|~~~)/;
const HEADING = /^## (?!#)(.+?)\s*#*\s*$/;

function toId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function splitSections(body: string): PatternSection[] {
  const sections: { label: string; lines: string[] }[] = [];
  let current: { label: string; lines: string[] } | null = null;
  let inFence = false;

  for (const line of body.split('\n')) {
    if (FENCE.test(line)) inFence = !inFence;
    const heading = inFence ? null : line.match(HEADING);
    if (heading) {
      current = { label: heading[1], lines: [] };
      sections.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }

  const used = new Map<string, number>();
  return sections
    .map(({ label, lines }) => ({ label, markdown: lines.join('\n').trim() }))
    .filter((section) => section.markdown)
    .map((section) => {
      const base = toId(section.label) || 'section';
      const count = used.get(base) || 0;
      used.set(base, count + 1);
      return { id: count ? `${base}-${count + 1}` : base, ...section };
    });
}
