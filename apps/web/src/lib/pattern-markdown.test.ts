// ABOUTME: Tests for the Markdown and agent-prompt exports of a pattern.
// ABOUTME: These texts back the .md endpoint and the copy buttons on pattern pages.

import { describe, expect, test } from 'bun:test';
import matter from 'gray-matter';
import { patternToAgentPrompt, patternToMarkdown } from './pattern-markdown';

const pattern = {
  slug: 'agent-circuit-breaker',
  title: 'Agent Circuit Breaker',
  summary: 'Disables failing tools for a cool-down period so the agent stops "retrying" them',
  status: 'emerging',
  category: 'Reliability & Eval',
  authors: ['Jeel Thummar (@jeelthummar)'],
  source: 'https://martinfowler.com/bliki/CircuitBreaker.html',
  tags: ['circuit-breaker', 'resilience'],
  signals: ['Agent calls external APIs that can fail'],
  anti_signals: ['All tools are local and deterministic'],
  updated_at: '2026-03-26',
  body: '## Problem\n\nTools fail.\n\n## Solution\n\nTrip a breaker.\n',
};

describe('patternToMarkdown', () => {
  test('starts with front-matter that parses back to the pattern metadata', () => {
    const { data } = matter(patternToMarkdown(pattern));
    expect(data.title).toBe(pattern.title);
    expect(data.summary).toBe(pattern.summary);
    expect(data.status).toBe('emerging');
    expect(data.category).toBe('Reliability & Eval');
    expect(data.url).toBe('https://agentic-patterns.com/patterns/agent-circuit-breaker');
    expect(data.tags).toEqual(pattern.tags);
    expect(data.signals).toEqual(pattern.signals);
    expect(data.anti_signals).toEqual(pattern.anti_signals);
    expect(data.updated_at).toBe('2026-03-26');
  });

  test('includes the title, the use and avoid lists, and the full body', () => {
    const { content } = matter(patternToMarkdown(pattern));
    expect(content).toContain('# Agent Circuit Breaker');
    expect(content).toContain('## Use when\n\n- Agent calls external APIs that can fail');
    expect(content).toContain('## Avoid when\n\n- All tools are local and deterministic');
    expect(content).toContain('## Problem\n\nTools fail.');
    expect(content).toContain('## Solution\n\nTrip a breaker.');
  });

  test('leaves out optional fields that the pattern does not have', () => {
    const minimal = { ...pattern, summary: undefined, signals: undefined, anti_signals: undefined };
    const output = patternToMarkdown(minimal);
    expect(matter(output).data.summary).toBeUndefined();
    expect(output).not.toContain('## Use when');
    expect(output).not.toContain('## Avoid when');
  });
});

describe('patternToAgentPrompt', () => {
  test('wraps the Markdown in an instruction that names the pattern', () => {
    const prompt = patternToAgentPrompt(pattern);
    expect(prompt).toContain('"Agent Circuit Breaker"');
    expect(prompt).toContain('list the files you would change');
    expect(prompt).toContain(patternToMarkdown(pattern));
  });
});
