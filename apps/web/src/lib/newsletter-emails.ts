// ABOUTME: Sanitizers, Markdown export builders, and HTML/text transactional emails for Resend.
// ABOUTME: Uses static pack metadata and escaped HTML so the serverless API route needs no fs reads.

import type {
  DecisionBriefGroup,
  DecisionBriefPattern,
  DecisionBriefPayload,
  DeliverableType,
} from './newsletter-client';
import { SITE_URL } from './pattern-markdown';
import { STARTER_PACK, getPackCatalogEntry, type PackCatalogEntry } from './starter-pack';

export interface TransactionalEmailInput {
  source: string;
  category?: string;
  deliverable: DeliverableType;
  packSlug?: string;
  decisionBrief?: DecisionBriefPayload;
}

export interface TransactionalEmailOutput {
  subject: string;
  html: string;
  text: string;
  downloadUrl?: string;
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const VALID_DELIVERABLES = new Set<DeliverableType>([
  'digest',
  'starter-pack',
  'pack',
  'decision-brief',
]);

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

export function sanitizeText(value: unknown, maxLength = 200): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.replace(/[\r\n\t]+/g, ' ').trim();
  if (!normalized) return undefined;
  return normalized.slice(0, maxLength);
}

export function sanitizeSlug(value: unknown, maxLength = 80): string | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '');
  if (!cleaned) return undefined;
  return cleaned.slice(0, maxLength);
}

export function normalizeResendTag(value: string, fallback = 'unknown'): string {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
  return cleaned || fallback;
}

export function sanitizeDeliverable(value: unknown): DeliverableType {
  if (typeof value === 'string' && VALID_DELIVERABLES.has(value as DeliverableType)) {
    return value as DeliverableType;
  }
  return 'starter-pack';
}

export function sanitizeDecisionBrief(value: unknown): DecisionBriefPayload | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as Partial<DecisionBriefPayload>;

  const route = Array.isArray(candidate.route)
    ? candidate.route.slice(0, 8).flatMap((stop) => {
        if (!stop || typeof stop !== 'object') return [];
        const label = sanitizeText((stop as { label?: unknown }).label, 60);
        const val = sanitizeText((stop as { value?: unknown }).value, 120);
        return label && val ? [{ label, value: val }] : [];
      })
    : [];

  const summary = sanitizeText(candidate.summary, 600);
  if (!summary) return undefined;

  const avoid = Array.isArray(candidate.avoid)
    ? candidate.avoid
        .slice(0, 10)
        .map((item) => sanitizeText(item, 240))
        .filter((item): item is string => Boolean(item))
    : [];

  const groups: DecisionBriefGroup[] = Array.isArray(candidate.groups)
    ? candidate.groups.slice(0, 8).flatMap((group) => {
        if (!group || typeof group !== 'object') return [];
        const title = sanitizeText((group as { title?: unknown }).title, 100);
        const rawPatterns = (group as { patterns?: unknown }).patterns;
        if (!title || !Array.isArray(rawPatterns)) return [];
        const patterns: DecisionBriefPattern[] = rawPatterns.slice(0, 8).flatMap((pattern) => {
          if (!pattern || typeof pattern !== 'object') return [];
          const p = pattern as Partial<DecisionBriefPattern>;
          const slug = sanitizeSlug(p.slug, 100);
          const pTitle = sanitizeText(p.title, 120);
          const status = sanitizeText(p.status, 32) || 'production';
          const why = sanitizeText(p.why, 320) || '';
          return slug && pTitle ? [{ slug, title: pTitle, status, why }] : [];
        });
        return patterns.length > 0 ? [{ title, patterns }] : [];
      })
    : [];

  if (groups.length === 0) return undefined;

  return { route, summary, avoid, groups };
}

export function buildDecisionBriefMarkdown(brief: DecisionBriefPayload): string {
  const allPatterns = brief.groups.flatMap((group) => group.patterns);
  const routeLines = brief.route.map((stop) => `- **${stop.label}:** ${stop.value}`);
  const groupSections = brief.groups.map((group) => {
    const items = group.patterns.map(
      (p) =>
        `- **[${p.title}](${SITE_URL}/patterns/${p.slug})** (${p.status}) — ${p.why}\n  Markdown: ${SITE_URL}/patterns/${p.slug}.md`
    );
    return `### ${group.title}\n\n${items.join('\n')}`;
  });
  const avoidLines = brief.avoid.map((item) => `- ${item}`);
  const mdLinks = allPatterns.map((p) => `${SITE_URL}/patterns/${p.slug}.md`).join('\n');

  return [
    '# Agentic Patterns Architecture Brief',
    '',
    ...(routeLines.length > 0 ? ['## Profile', '', ...routeLines, ''] : []),
    '## Recommended Approach',
    '',
    brief.summary,
    '',
    '## Recommended Patterns',
    '',
    groupSections.join('\n\n'),
    '',
    ...(avoidLines.length > 0 ? ['## What to Avoid', '', ...avoidLines, ''] : []),
    '## Prompt for Your Coding Agent',
    '',
    '```text',
    'Review this architecture brief and fetch the Markdown specs below.',
    'Compare each pattern\'s "Use when" and "Avoid when" criteria against this repo,',
    'and propose the minimal implementation plan before editing files:',
    '',
    mdLinks,
    '```',
    '',
  ].join('\n');
}

function wrapEmailHtml(heading: string, eyebrow: string, bodyHtml: string): string {
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<body style="margin:0;padding:24px 16px;background:#f7f7f5;color:#17181b;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;line-height:1.55;">',
    '<div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e0e0dc;border-top:3px solid #c2412d;border-radius:8px;padding:24px;">',
    `<p style="margin:0 0 6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#c2412d;font-weight:600;">${escapeHtml(eyebrow)}</p>`,
    `<h1 style="margin:0 0 14px;font-size:22px;line-height:1.25;color:#17181b;">${escapeHtml(heading)}</h1>`,
    bodyHtml,
    '<hr style="margin:24px 0 14px;border:0;border-top:1px solid #e0e0dc;" />',
    `<p style="margin:0;font-size:12px;color:#5c6069;">You are receiving this from <a href="${SITE_URL}" style="color:#c2412d;">Agentic Patterns</a>. We send 1–2×/month digests of newly vetted production patterns. Every newsletter includes a 1-click unsubscribe link.</p>`,
    '</div>',
    '</body>',
    '</html>',
  ].join('\n');
}

function buildDecisionBriefEmail(brief: DecisionBriefPayload): TransactionalEmailOutput {
  const routeHtml = brief.route.length
    ? `<div style="margin:0 0 16px;padding:12px 14px;background:#f7f7f5;border-radius:6px;font-size:13px;">${brief.route
        .map(
          (stop) =>
            `<div><strong>${escapeHtml(stop.label)}:</strong> ${escapeHtml(stop.value)}</div>`
        )
        .join('')}</div>`
    : '';

  const groupsHtml = brief.groups
    .map(
      (group) =>
        `<h2 style="margin:18px 0 8px;font-size:16px;color:#17181b;">${escapeHtml(group.title)}</h2><ul style="margin:0;padding-left:18px;">${group.patterns
          .map(
            (p) =>
              `<li style="margin:0 0 10px;"><strong><a href="${SITE_URL}/patterns/${encodeURIComponent(p.slug)}" style="color:#c2412d;">${escapeHtml(p.title)}</a></strong> <span style="font-size:12px;color:#5c6069;">(${escapeHtml(p.status)})</span><br /><span style="font-size:14px;color:#44474e;">${escapeHtml(p.why)}</span><br /><a href="${SITE_URL}/patterns/${encodeURIComponent(p.slug)}.md" style="font-family:ui-monospace,monospace;font-size:12px;color:#5c6069;">Read as .md →</a></li>`
          )
          .join('')}</ul>`
    )
    .join('');

  const avoidHtml = brief.avoid.length
    ? `<div style="margin:18px 0 0;padding:12px 14px;background:#fbe7e2;border-left:3px solid #c2412d;border-radius:6px;"><strong style="display:block;margin-bottom:6px;font-size:14px;">What to avoid</strong><ul style="margin:0;padding-left:18px;font-size:13px;color:#44474e;">${brief.avoid
        .map((item) => `<li style="margin:0 0 4px;">${escapeHtml(item)}</li>`)
        .join('')}</ul></div>`
    : '';

  const briefMarkdown = buildDecisionBriefMarkdown(brief);
  const promptPreview = brief.groups
    .flatMap((group) => group.patterns)
    .map((p) => `${SITE_URL}/patterns/${p.slug}.md`)
    .join('\n');

  const bodyHtml = [
    routeHtml,
    `<p style="margin:0 0 14px;font-size:15px;color:#17181b;">${escapeHtml(brief.summary)}</p>`,
    groupsHtml,
    avoidHtml,
    `<div style="margin:20px 0 0;padding:12px 14px;background:#16181b;color:#e6e7e9;border-radius:6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;white-space:pre-wrap;">${escapeHtml(
      `Prompt for your coding agent:\nReview these pattern specs against our repo and propose a plan before editing:\n${promptPreview}`
    )}</div>`,
    `<p style="margin:16px 0 0;font-size:13px;color:#5c6069;">Want the full 12-pattern baseline too? <a href="${SITE_URL}${STARTER_PACK.downloadUrl}" style="color:#c2412d;">Open the Production Starter Pack (.md) →</a></p>`,
  ].join('\n');

  return {
    subject: 'Your Agentic Patterns architecture brief',
    html: wrapEmailHtml('Your Agent Architecture Brief', 'DECISION GUIDE BRIEF', bodyHtml),
    text: briefMarkdown,
    downloadUrl: STARTER_PACK.downloadUrl,
  };
}

function buildPackEmail(pack: PackCatalogEntry): TransactionalEmailOutput {
  const fullDownloadUrl = `${SITE_URL}${pack.downloadUrl}`;
  const fullPageUrl = `${SITE_URL}/packs/${pack.slug}`;

  const patternsHtml = `<ul style="margin:12px 0 18px;padding-left:18px;">${pack.patterns
    .map(
      (slug) =>
        `<li style="margin:0 0 8px;"><a href="${SITE_URL}/patterns/${encodeURIComponent(slug)}" style="color:#c2412d;font-weight:600;">${escapeHtml(slug)}</a> · <a href="${SITE_URL}/patterns/${encodeURIComponent(slug)}.md" style="font-family:ui-monospace,monospace;font-size:12px;color:#5c6069;">.md</a></li>`
    )
    .join('')}</ul>`;

  const bodyHtml = [
    `<p style="margin:0 0 12px;font-size:15px;color:#44474e;">${escapeHtml(pack.summary)}</p>`,
    `<p style="margin:0 0 16px;"><a href="${fullDownloadUrl}" style="display:inline-block;padding:10px 16px;background:#c2412d;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Download ${escapeHtml(pack.title)} (.md)</a> &nbsp; <a href="${fullPageUrl}" style="font-size:13px;color:#c2412d;">View pack page →</a></p>`,
    `<h2 style="margin:18px 0 6px;font-size:15px;">Included patterns (${pack.patterns.length})</h2>`,
    patternsHtml,
  ].join('\n');

  const text = [
    `${pack.title} (${pack.domain})`,
    '',
    pack.summary,
    '',
    `Full AGENTS.md bundle: ${fullDownloadUrl}`,
    `Pack page: ${fullPageUrl}`,
    '',
    'Patterns included:',
    ...pack.patterns.map(
      (slug) => `- ${SITE_URL}/patterns/${slug} (.md: ${SITE_URL}/patterns/${slug}.md)`
    ),
    '',
  ].join('\n');

  return {
    subject: `Your ${pack.title} pattern pack (AGENTS.md)`,
    html: wrapEmailHtml(pack.title, `PATTERN PACK · ${pack.domain.toUpperCase()}`, bodyHtml),
    text,
    downloadUrl: pack.downloadUrl,
  };
}

function buildStarterPackEmail(category?: string): TransactionalEmailOutput {
  const fullDownloadUrl = `${SITE_URL}${STARTER_PACK.downloadUrl}`;
  const groups = [
    'Safety & Boundaries',
    'Context & Tools',
    'Evals & Reliability',
    'Execution & Control',
  ] as const;

  const groupedHtml = groups
    .map((group) => {
      const items = STARTER_PACK.items.filter((item) => item.group === group);
      return `<h3 style="margin:16px 0 6px;font-size:14px;color:#17181b;">${escapeHtml(group)}</h3><ul style="margin:0;padding-left:18px;font-size:14px;">${items
        .map(
          (item) =>
            `<li style="margin:0 0 6px;"><a href="${SITE_URL}/patterns/${encodeURIComponent(item.slug)}" style="color:#c2412d;font-weight:600;">${escapeHtml(item.title)}</a> — <span style="color:#44474e;">${escapeHtml(item.why)}</span></li>`
        )
        .join('')}</ul>`;
    })
    .join('');

  const categoryNote = category
    ? `<p style="margin:0 0 12px;font-size:14px;color:#44474e;">Subscribed while reading <strong>${escapeHtml(category)}</strong> patterns. We will prioritize practical architecture updates and trade-offs.</p>`
    : '';

  const bodyHtml = [
    categoryNote,
    `<p style="margin:0 0 14px;font-size:15px;color:#44474e;">${escapeHtml(STARTER_PACK.summary)}</p>`,
    `<p style="margin:0 0 18px;"><a href="${fullDownloadUrl}" style="display:inline-block;padding:10px 16px;background:#c2412d;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Open AGENTS.md Starter Pack (.md)</a></p>`,
    groupedHtml,
    `<p style="margin:18px 0 0;font-size:13px;color:#5c6069;">Want a tailored stack for your failure mode? Try the <a href="${SITE_URL}/decision" style="color:#c2412d;">4-question Decision Guide</a> or browse all <a href="${SITE_URL}/packs" style="color:#c2412d;">Pattern Packs</a>.</p>`,
  ].join('\n');

  const text = [
    'Welcome to Agentic Patterns!',
    '',
    STARTER_PACK.summary,
    '',
    `Download the full AGENTS.md Starter Pack: ${fullDownloadUrl}`,
    `Decision Guide: ${SITE_URL}/decision`,
    `All Pattern Packs: ${SITE_URL}/packs`,
    '',
    '12 Core Patterns:',
    ...STARTER_PACK.items.map(
      (item) =>
        `- ${item.title} (${item.group}): ${item.why} -> ${SITE_URL}/patterns/${item.slug}.md`
    ),
    '',
  ].join('\n');

  return {
    subject: 'Welcome to Agentic Patterns + Production Starter Pack',
    html: wrapEmailHtml(
      'Your Production Agent Starter Pack',
      'WELCOME · FREE STARTER PACK',
      bodyHtml
    ),
    text,
    downloadUrl: STARTER_PACK.downloadUrl,
  };
}

export function buildTransactionalEmail(input: TransactionalEmailInput): TransactionalEmailOutput {
  if (input.deliverable === 'decision-brief' && input.decisionBrief) {
    return buildDecisionBriefEmail(input.decisionBrief);
  }

  if (input.deliverable === 'pack') {
    const pack = getPackCatalogEntry(input.packSlug);
    if (pack) return buildPackEmail(pack);
  }

  return buildStarterPackEmail(input.category);
}
