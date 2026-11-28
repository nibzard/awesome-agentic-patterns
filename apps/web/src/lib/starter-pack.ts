// ABOUTME: Static Starter Pack and Pattern Pack catalog metadata plus Markdown bundle builders.
// ABOUTME: Imported by both static build endpoints (.md.ts) and the Vercel serverless subscribe API.

import { SITE_URL, patternToMarkdown, type MarkdownPattern } from './pattern-markdown';

export interface StarterPackItem {
  slug: string;
  title: string;
  group: 'Safety & Boundaries' | 'Context & Tools' | 'Evals & Reliability' | 'Execution & Control';
  why: string;
}

export interface PackCatalogEntry {
  slug: string;
  title: string;
  summary: string;
  domain: string;
  patterns: string[];
  downloadUrl: string;
}

export const STARTER_PACK = {
  slug: 'starter-pack',
  title: 'Production Agent Starter Pack',
  summary:
    '12 foundational and production patterns across safety boundaries, context discipline, evals, and execution control.',
  downloadUrl: '/starter-pack.md',
  items: [
    {
      slug: 'lethal-trifecta-threat-model',
      title: 'Lethal Trifecta Threat Model',
      group: 'Safety & Boundaries',
      why: 'Audit every tool path so private data, untrusted input, and external egress never meet.',
    },
    {
      slug: 'dual-llm-pattern',
      title: 'Dual LLM Pattern',
      group: 'Safety & Boundaries',
      why: 'Isolate a quarantined reader from the privileged tool-calling planner.',
    },
    {
      slug: 'egress-lockdown-no-exfiltration-channel',
      title: 'Egress Lockdown: No Exfiltration Channel',
      group: 'Safety & Boundaries',
      why: 'Block unauthorized outbound destinations even when an injection reaches the model.',
    },
    {
      slug: 'context-window-auto-compaction',
      title: 'Context Window Auto-Compaction',
      group: 'Context & Tools',
      why: 'Compact transcripts with headroom before hitting provider limits on long runs.',
    },
    {
      slug: 'prompt-caching-via-exact-prefix-preservation',
      title: 'Prompt Caching via Exact Prefix Preservation',
      group: 'Context & Tools',
      why: 'Keep static instructions first and append-only so cached prefixes stay hot.',
    },
    {
      slug: 'progressive-tool-discovery',
      title: 'Progressive Tool Discovery',
      group: 'Context & Tools',
      why: 'Load only core tools upfront and resolve specialized tools on demand.',
    },
    {
      slug: 'workflow-evals-with-mocked-tools',
      title: 'Workflow Evals with Mocked Tools',
      group: 'Evals & Reliability',
      why: 'Test full multi-step tool trajectories deterministically in CI before shipping.',
    },
    {
      slug: 'llm-observability',
      title: 'LLM Observability',
      group: 'Evals & Reliability',
      why: 'Capture span-level traces, cost, latency, and tool errors across every run.',
    },
    {
      slug: 'incident-to-eval-synthesis',
      title: 'Incident-to-Eval Synthesis',
      group: 'Evals & Reliability',
      why: 'Convert every production failure into an executable regression gate.',
    },
    {
      slug: 'filesystem-based-agent-state',
      title: 'Filesystem-Based Agent State',
      group: 'Execution & Control',
      why: 'Checkpoint intermediate artifacts on disk so interrupted jobs resume cleanly.',
    },
    {
      slug: 'human-in-loop-approval-framework',
      title: 'Human-in-Loop Approval Framework',
      group: 'Execution & Control',
      why: 'Gate high-impact writes behind explicit human review without slowing safe reads.',
    },
    {
      slug: 'rich-feedback-loops',
      title: 'Rich Feedback Loops',
      group: 'Execution & Control',
      why: 'Feed compiler, linter, and test output directly back so agents self-correct.',
    },
  ] satisfies StarterPackItem[],
};

export const PACK_CATALOG: Record<string, PackCatalogEntry> = {
  'coding-agent-mvp': {
    slug: 'coding-agent-mvp',
    title: 'Coding Agent MVP',
    summary:
      'Essential patterns for building a minimum viable AI coding agent that can write, debug, and improve code.',
    domain: 'Software Development',
    patterns: [
      'specification-driven-agent-development',
      'code-then-execute-pattern',
      'human-in-loop-approval-framework',
      'llm-observability',
    ],
    downloadUrl: '/packs/coding-agent-mvp.md',
  },
  'safety-first-stack': {
    slug: 'safety-first-stack',
    title: 'Safety-First Stack',
    summary:
      'Security-critical patterns for building AI agents that operate safely in production environments.',
    domain: 'Security & Safety',
    patterns: [
      'anti-reward-hacking-grader-design',
      'egress-lockdown-no-exfiltration-channel',
      'lethal-trifecta-threat-model',
      'deterministic-security-scanning-build-loop',
      'human-in-loop-approval-framework',
    ],
    downloadUrl: '/packs/safety-first-stack.md',
  },
  'untrusted-input-enterprise-agent': {
    slug: 'untrusted-input-enterprise-agent',
    title: 'Untrusted-Input Enterprise Agent',
    summary:
      'A defense-in-depth stack for agents that read untrusted content and act on enterprise systems.',
    domain: 'Security & Enterprise',
    patterns: [
      'lethal-trifecta-threat-model',
      'dual-llm-pattern',
      'context-minimization-pattern',
      'egress-lockdown-no-exfiltration-channel',
      'exact-action-authorization-binding',
      'policy-gated-tool-proxy',
    ],
    downloadUrl: '/packs/untrusted-input-enterprise-agent.md',
  },
  'long-running-autonomous-worker': {
    slug: 'long-running-autonomous-worker',
    title: 'Long-Running Autonomous Worker',
    summary:
      'Durability, cost, credential, and self-monitoring patterns for agent jobs that run unattended for hours or on a schedule.',
    domain: 'Autonomous Operations',
    patterns: [
      'filesystem-based-agent-state',
      'context-window-auto-compaction',
      'prompt-caching-via-exact-prefix-preservation',
      'credential-free-outbox',
      'dead-mans-switch-for-scheduled-agent-jobs',
    ],
    downloadUrl: '/packs/long-running-autonomous-worker.md',
  },
  'cost-controlled-multi-agent-fleet': {
    slug: 'cost-controlled-multi-agent-fleet',
    title: 'Cost-Controlled Multi-Agent Fleet',
    summary:
      'Patterns for fanning work out to parallel agents without file collisions, runaway spend, or lost cost visibility.',
    domain: 'Multi-Agent Systems',
    patterns: [
      'sub-agent-spawning',
      'design-time-file-partition',
      'lane-based-execution-queueing',
      'budget-aware-model-routing-with-hard-cost-caps',
      'agent-circuit-breaker',
      'intent-level-cost-attribution',
    ],
    downloadUrl: '/packs/cost-controlled-multi-agent-fleet.md',
  },
  'production-eval-release-pipeline': {
    slug: 'production-eval-release-pipeline',
    title: 'Production Eval Release Pipeline',
    summary:
      'A closed loop from CI evals to recorded traces, incident-derived cases, and canary rollouts with automatic rollback.',
    domain: 'Reliability & Evaluation',
    patterns: [
      'workflow-evals-with-mocked-tools',
      'deterministic-grader-in-the-loop',
      'incident-to-eval-synthesis',
      'out-of-process-provider-boundary-replay',
      'canary-rollout-and-automatic-rollback-for-agent-policy-changes',
    ],
    downloadUrl: '/packs/production-eval-release-pipeline.md',
  },
  'deep-research-retrieval-agent': {
    slug: 'deep-research-retrieval-agent',
    title: 'Deep Research Retrieval Agent',
    summary:
      'Patterns for agents that search in many rounds, read large documents on demand, and verify each claim they report.',
    domain: 'Research & Retrieval',
    patterns: [
      'agent-driven-research',
      'agentic-search-over-vector-embeddings',
      'progressive-disclosure-large-files',
      'semantic-context-filtering',
      'output-verification-loop',
    ],
    downloadUrl: '/packs/deep-research-retrieval-agent.md',
  },
};

export function getPackCatalogEntry(slug?: string): PackCatalogEntry | undefined {
  if (!slug) return undefined;
  return PACK_CATALOG[slug];
}

function renderBundlePatternSection(pattern: MarkdownPattern, why?: string): string {
  const lines = [
    `## ${pattern.title}`,
    '',
    `- URL: ${SITE_URL}/patterns/${pattern.slug}`,
    `- Markdown: ${SITE_URL}/patterns/${pattern.slug}.md`,
    `- Category: ${pattern.category || 'General'} | Status: ${pattern.status}`,
  ];

  if (why) lines.push(`- Why it matters: ${why}`);
  if (pattern.summary) lines.push('', `> ${pattern.summary}`);

  if (pattern.signals && pattern.signals.length > 0) {
    lines.push('', '### Use when', '', ...pattern.signals.map((item) => `- ${item}`));
  }

  if (pattern.anti_signals && pattern.anti_signals.length > 0) {
    lines.push('', '### Avoid when', '', ...pattern.anti_signals.map((item) => `- ${item}`));
  }

  lines.push(
    '',
    '<details>',
    '<summary>Full pattern specification</summary>',
    '',
    patternToMarkdown(pattern).trim(),
    '',
    '</details>'
  );

  return lines.join('\n');
}

export function buildStarterPackMarkdown(resolvedPatterns: MarkdownPattern[]): string {
  const bySlug = new Map(resolvedPatterns.map((p) => [p.slug, p]));
  const ordered = STARTER_PACK.items
    .map((item) => ({ item, pattern: bySlug.get(item.slug) }))
    .filter((entry): entry is { item: StarterPackItem; pattern: MarkdownPattern } =>
      Boolean(entry.pattern)
    );

  const frontMatter = [
    '---',
    `title: ${JSON.stringify(STARTER_PACK.title)}`,
    `summary: ${JSON.stringify(STARTER_PACK.summary)}`,
    `url: ${JSON.stringify(`${SITE_URL}${STARTER_PACK.downloadUrl}`)}`,
    `pattern_count: ${ordered.length}`,
    '---',
  ].join('\n');

  const indexTable = ordered
    .map(
      ({ item, pattern }, idx) =>
        `${idx + 1}. **${pattern.title}** (${item.group}) — ${item.why} ([page](${SITE_URL}/patterns/${pattern.slug}) | [.md](${SITE_URL}/patterns/${pattern.slug}.md))`
    )
    .join('\n');

  const sections = ordered
    .map(({ item, pattern }) => renderBundlePatternSection(pattern, item.why))
    .join('\n\n---\n\n');

  return [
    frontMatter,
    '',
    `# ${STARTER_PACK.title}`,
    '',
    `> ${STARTER_PACK.summary}`,
    '',
    '## How to use with your coding agent (AGENTS.md / CLAUDE.md)',
    '',
    'Paste this file or reference its `.md` pattern URLs in your project instructions:',
    '',
    '```text',
    'Review the patterns in this starter pack against our codebase.',
    'Compare each "Use when" and "Avoid when" list with our architecture,',
    'and propose the top 2 gaps to close first before editing any files.',
    '```',
    '',
    '## Included patterns',
    '',
    indexTable,
    '',
    '---',
    '',
    sections,
    '',
  ].join('\n');
}

export function buildPackMarkdown(
  pack: PackCatalogEntry,
  resolvedPatterns: MarkdownPattern[]
): string {
  const bySlug = new Map(resolvedPatterns.map((p) => [p.slug, p]));
  const ordered = pack.patterns
    .map((slug) => bySlug.get(slug))
    .filter((entry): entry is MarkdownPattern => Boolean(entry));

  const frontMatter = [
    '---',
    `title: ${JSON.stringify(pack.title)}`,
    `domain: ${JSON.stringify(pack.domain)}`,
    `summary: ${JSON.stringify(pack.summary)}`,
    `url: ${JSON.stringify(`${SITE_URL}/packs/${pack.slug}`)}`,
    `markdown_url: ${JSON.stringify(`${SITE_URL}${pack.downloadUrl}`)}`,
    `pattern_count: ${ordered.length}`,
    '---',
  ].join('\n');

  const indexList = ordered
    .map(
      (pattern, idx) =>
        `${idx + 1}. **${pattern.title}** — ${pattern.summary || pattern.category || ''} ([page](${SITE_URL}/patterns/${pattern.slug}) | [.md](${SITE_URL}/patterns/${pattern.slug}.md))`
    )
    .join('\n');

  const sections = ordered
    .map((pattern) => renderBundlePatternSection(pattern))
    .join('\n\n---\n\n');

  return [
    frontMatter,
    '',
    `# ${pack.title}`,
    '',
    `> ${pack.summary}`,
    '',
    `**Domain:** ${pack.domain}`,
    '',
    '## How to apply this stack with a coding agent',
    '',
    '```text',
    `Apply the "${pack.title}" pattern pack to this repository.`,
    'Check each pattern\'s "Use when" and "Avoid when" conditions against our codebase,',
    'identify gaps in order of risk, and list the files to update before making edits.',
    '```',
    '',
    '## Patterns in this pack',
    '',
    indexList,
    '',
    '---',
    '',
    sections,
    '',
  ].join('\n');
}
