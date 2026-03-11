import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const patternStatus = z.enum([
  'proposed',
  'emerging',
  'established',
  'validated-in-production',
  'best-practice',
  'experimental-but-awesome',
  'rapidly-improving',
]);

const patternCategory = z.enum([
  'Orchestration & Control',
  'Context & Memory',
  'Feedback Loops',
  'Learning & Adaptation',
  'Reliability & Eval',
  'Security & Safety',
  'Tool Use & Environment',
  'UX & Collaboration',
  'Uncategorized',
]);

const patternMaturity = z.enum(['early', 'maturing', 'mature']);
const patternComplexity = z.enum(['low', 'medium', 'high', 'very-high']);
const patternEffort = z.enum(['low', 'medium', 'high', 'very-high']);
const patternImpact = z.enum(['low', 'medium', 'high', 'transformative']);

// Patterns live in the monorepo root `patterns/` directory. Point Astro's
// content layer at that source so collection validation matches runtime data.
const patterns = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: '../../patterns',
  }),
  schema: z.object({
    title: z.string(),
    id: z.string().optional(),
    slug: z.string().optional(),
    status: patternStatus,
    authors: z.array(z.string()).min(1),
    based_on: z.array(z.string()).optional(),
    category: patternCategory,
    source: z.string().url(),
    tags: z.array(z.string()).min(1),
    summary: z.string().optional(),
    maturity: patternMaturity.optional(),
    complexity: patternComplexity.optional(),
    effort: patternEffort.optional(),
    impact: patternImpact.optional(),
    signals: z.array(z.string()).optional(),
    anti_signals: z.array(z.string()).optional(),
    prerequisites: z.array(z.string()).optional(),
    related: z.array(z.string()).optional(),
    anti_patterns: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    domains: z.array(z.string()).optional(),
    updated_at: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
});

const guides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().optional(),
  }),
});

const packs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    description: z.string().optional(),
    domain: z.string(),
    patterns: z.array(z.string()),
    order: z.number().optional(),
  }),
});

export const collections = {
  patterns,
  guides,
  packs,
};
