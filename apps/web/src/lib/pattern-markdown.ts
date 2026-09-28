// ABOUTME: Builds the Markdown and agent-prompt text for one pattern.
// ABOUTME: The .md endpoint and the copy buttons on pattern pages use the same output.

export const SITE_URL = 'https://agentic-patterns.com';

export interface MarkdownPattern {
  slug: string;
  title: string;
  summary?: string;
  status: string;
  category?: string;
  authors: string[];
  source?: string;
  tags: string[];
  signals?: string[];
  anti_signals?: string[];
  updated_at?: string;
  body: string;
}

// JSON strings are valid YAML double-quoted scalars, so JSON.stringify gives safe quoting.
const yamlValue = (value: string | string[]) => JSON.stringify(value);

function bulletSection(heading: string, items?: string[]): string {
  if (!items || items.length === 0) return '';
  return `## ${heading}\n\n${items.map((item) => `- ${item}`).join('\n')}\n\n`;
}

export function patternToMarkdown(pattern: MarkdownPattern): string {
  const fields: [string, string | string[] | undefined][] = [
    ['title', pattern.title],
    ['summary', pattern.summary],
    ['status', pattern.status],
    ['category', pattern.category],
    ['url', `${SITE_URL}/patterns/${pattern.slug}`],
    ['source', pattern.source],
    ['authors', pattern.authors],
    ['tags', pattern.tags],
    ['signals', pattern.signals],
    ['anti_signals', pattern.anti_signals],
    ['updated_at', pattern.updated_at],
  ];

  const frontMatter = fields
    .filter(([, value]) => (Array.isArray(value) ? value.length > 0 : Boolean(value)))
    .map(([key, value]) => `${key}: ${yamlValue(value as string | string[])}`)
    .join('\n');

  let md = `---\n${frontMatter}\n---\n\n# ${pattern.title}\n\n`;
  if (pattern.summary) md += `> ${pattern.summary}\n\n`;
  md += bulletSection('Use when', pattern.signals);
  md += bulletSection('Avoid when', pattern.anti_signals);
  md += `${pattern.body.trim()}\n`;
  return md;
}

export function patternToAgentPrompt(pattern: MarkdownPattern): string {
  return [
    `Apply the "${pattern.title}" agent design pattern to the current project.`,
    'First read the pattern below. Then check if it fits: compare the "Use when" and "Avoid when" lists with the project.',
    'If it fits, list the files you would change and why, before you edit anything.',
    '',
    patternToMarkdown(pattern),
  ].join('\n');
}
