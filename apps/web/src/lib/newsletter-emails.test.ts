// ABOUTME: Unit tests for newsletter email sanitization, Markdown export, and starter pack bundles.

import { describe, expect, test } from 'bun:test';
import {
  buildDecisionBriefMarkdown,
  buildTransactionalEmail,
  escapeHtml,
  normalizeResendTag,
  sanitizeDecisionBrief,
} from './newsletter-emails';
import { PACK_CATALOG, STARTER_PACK, buildStarterPackMarkdown } from './starter-pack';

describe('newsletter-emails', () => {
  test('escapeHtml escapes angle brackets, quotes, and ampersands', () => {
    expect(escapeHtml('<script>alert("x&y")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&amp;y&quot;)&lt;/script&gt;'
    );
  });

  test('normalizeResendTag limits to safe ASCII characters', () => {
    expect(normalizeResendTag('Security & Safety!')).toBe('security_safety');
    expect(normalizeResendTag('homepage-hero')).toBe('homepage-hero');
  });

  test('buildTransactionalEmail escapes decisionBrief HTML and builds Markdown text', () => {
    const brief = sanitizeDecisionBrief({
      route: [{ label: 'Failure mode', value: 'Prompt <injection>' }],
      summary: 'Isolate untrusted text & lock down egress.',
      avoid: ['Never trust raw <input>'],
      groups: [
        {
          title: 'For your failure mode',
          patterns: [
            {
              slug: 'dual-llm-pattern',
              title: 'Dual LLM Pattern',
              status: 'foundational',
              why: 'Splits privileged & quarantined models.',
            },
          ],
        },
      ],
    });

    expect(brief).toBeDefined();
    const email = buildTransactionalEmail({
      source: 'decision-export',
      deliverable: 'decision-brief',
      decisionBrief: brief,
    });

    expect(email.subject).toBe('Your Agentic Patterns architecture brief');
    expect(email.html).not.toContain('<injection>');
    expect(email.html).toContain('Prompt &lt;injection&gt;');
    expect(email.html).toContain('https://agentic-patterns.com/patterns/dual-llm-pattern.md');
    expect(email.text).toContain('# Agentic Patterns Architecture Brief');
    expect(buildDecisionBriefMarkdown(brief!)).toContain('Dual LLM Pattern');
  });

  test('buildTransactionalEmail builds pack and starter-pack emails with downloadUrl', () => {
    const packEmail = buildTransactionalEmail({
      source: 'pack-page',
      deliverable: 'pack',
      packSlug: 'coding-agent-mvp',
    });
    expect(packEmail.downloadUrl).toBe('/packs/coding-agent-mvp.md');
    expect(packEmail.subject).toContain('Coding Agent MVP');

    const starterEmail = buildTransactionalEmail({
      source: 'homepage-hero',
      category: 'Security & Safety',
      deliverable: 'starter-pack',
    });
    expect(starterEmail.downloadUrl).toBe(STARTER_PACK.downloadUrl);
    expect(starterEmail.html).toContain('Security &amp; Safety');
  });

  test('buildStarterPackMarkdown renders all starter items and pack catalog has 7 packs', () => {
    expect(Object.keys(PACK_CATALOG).length).toBe(7);
    const md = buildStarterPackMarkdown(
      STARTER_PACK.items.map((item) => ({
        slug: item.slug,
        title: item.title,
        status: 'production',
        category: item.group,
        authors: ['Test Author'],
        tags: ['agent'],
        body: '## Problem\n\nTest problem.\n',
      }))
    );
    expect(md).toContain('# Production Agent Starter Pack');
    expect(md).toContain('Lethal Trifecta Threat Model');
  });
});
