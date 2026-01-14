import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import RSS from 'rss';
import { create } from 'xmlbuilder2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const patternsDir = path.join(repoRoot, 'patterns');
const publicDir = path.join(repoRoot, 'apps', 'web', 'public');
const dataDir = path.join(publicDir, 'data');
const dataPatternsDir = path.join(dataDir, 'patterns');
const legacyPatternsDir = path.join(publicDir, 'patterns');

const SITE_URL = 'https://agentic-patterns.com';

const ASSET_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
]);

interface ParsedPattern {
  title: string;
  status: string;
  authors: string[];
  based_on?: string[];
  category: string;
  source: string;
  tags: string[];
  slug: string;
  id: string;
  summary?: string;
  maturity?: string;
  complexity?: string;
  effort?: string;
  impact?: string;
  signals?: string[];
  anti_signals?: string[];
  prerequisites?: string[];
  related?: string[];
  anti_patterns?: string[];
  tools?: string[];
  domains?: string[];
  updated_at?: string;
  excerpt?: string;
  body: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function getFileModDate(filePath: string): string {
  return toDateString(new Date(fs.statSync(filePath).mtime));
}

function toStringArray(value: unknown, fallback?: string[]): string[] | undefined {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (typeof value === 'string') {
    return [value];
  }
  return fallback;
}

function extractSection(body: string, sectionName: string): string | null {
  const regex = new RegExp(`## ${sectionName}\\n([\\s\\S]*?)(?=## |$)`, 'i');
  const match = body.match(regex);
  return match ? match[1].trim() : null;
}

function extractSectionWithHeading(body: string, sectionName: string): string | null {
  const section = extractSection(body, sectionName);
  return section ? `\n## ${sectionName}\n${section}` : null;
}

function deriveSummary(body: string): string | undefined {
  const problemSection = extractSection(body, 'Problem');
  if (!problemSection) return undefined;

  const withoutCode = problemSection.replace(/```[\s\S]*?```/g, ' ');
  const cleaned = withoutCode
    .replace(/[#*_>`-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return undefined;

  const sentenceMatch = cleaned.match(/(.+?[.!?])\s/);
  return sentenceMatch ? sentenceMatch[1] : cleaned.slice(0, 160);
}

function parsePatternFile(filePath: string): ParsedPattern {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const fileSlug = path.basename(filePath, path.extname(filePath));

  const title = (data.title as string) || fileSlug;
  const slug = (data.slug as string) || fileSlug;
  const id = (data.id as string) || slugify(title);
  const summary = (data.summary as string) || deriveSummary(content);
  const updatedAt = (data.updated_at as string) || getFileModDate(filePath);

  const excerpt = extractSectionWithHeading(content, 'Problem') || '';

  return {
    title,
    status: (data.status as string) || 'proposed',
    authors: toStringArray(data.authors, []) || [],
    based_on: toStringArray(data.based_on),
    category: (data.category as string) || 'Uncategorized',
    source: (data.source as string) || '',
    tags: toStringArray(data.tags, []) || [],
    slug,
    id,
    summary,
    maturity: data.maturity as string | undefined,
    complexity: data.complexity as string | undefined,
    effort: data.effort as string | undefined,
    impact: data.impact as string | undefined,
    signals: toStringArray(data.signals),
    anti_signals: toStringArray(data.anti_signals),
    prerequisites: toStringArray(data.prerequisites),
    related: toStringArray(data.related),
    anti_patterns: toStringArray(data.anti_patterns),
    tools: toStringArray(data.tools),
    domains: toStringArray(data.domains),
    updated_at: updatedAt,
    excerpt,
    body: content,
  };
}

function parseAllPatterns(): ParsedPattern[] {
  const files = fs
    .readdirSync(patternsDir)
    .filter((file) => file.endsWith('.md') && file !== 'TEMPLATE.md');

  return files.map((file) => parsePatternFile(path.join(patternsDir, file)));
}

function generateLlmsTxt(patterns: ParsedPattern[]): string {
  const lines = ['# Awesome Agentic Patterns', '', 'A curated catalogue of AI agent design patterns.', '', '## Patterns', ''];

  patterns.forEach((pattern) => {
    const summary = pattern.summary || '';
    lines.push(`### ${pattern.slug}`);
    lines.push(`${pattern.title}: ${summary}`.trim());
    lines.push(`URL: ${SITE_URL}/patterns/${pattern.slug}`);
    lines.push('');
  });

  return lines.join('\n');
}

function generateLlmsFullTxt(patterns: ParsedPattern[]): string {
  const lines = ['# Awesome Agentic Patterns - Full Content', ''];

  patterns.forEach((pattern, index) => {
    lines.push(`## ${pattern.title}`);
    lines.push('');
    lines.push(`**Status:** ${pattern.status}`);
    lines.push(`**Category:** ${pattern.category}`);
    lines.push(`**Authors:** ${pattern.authors.join(', ')}`);
    lines.push(`**Source:** ${pattern.source}`);
    lines.push('');
    lines.push(pattern.body.trim());
    lines.push('');
    if (index < patterns.length - 1) {
      lines.push('---');
      lines.push('');
    }
  });

  return lines.join('\n');
}

function generateSitemapXml(patterns: ParsedPattern[]): string {
  const urlset = create({ version: '1.0', encoding: 'UTF-8' }).ele('urlset', {
    xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
  });

  const addUrl = (loc: string, lastmod?: string) => {
    const url = urlset.ele('url');
    url.ele('loc').txt(loc);
    if (lastmod) {
      url.ele('lastmod').txt(lastmod);
    }
  };

  addUrl(`${SITE_URL}/`);
  addUrl(`${SITE_URL}/patterns`);
  addUrl(`${SITE_URL}/compare`);
  addUrl(`${SITE_URL}/decision`);
  addUrl(`${SITE_URL}/graph`);
  addUrl(`${SITE_URL}/packs`);
  addUrl(`${SITE_URL}/guides`);

  patterns.forEach((pattern) => {
    addUrl(`${SITE_URL}/patterns/${pattern.slug}`, pattern.updated_at);
  });

  return urlset.end({ prettyPrint: true });
}

function generateRssFeed(patterns: ParsedPattern[]): string {
  const feed = new RSS({
    title: 'Awesome Agentic Patterns',
    description: 'New and updated AI agent design patterns.',
    site_url: SITE_URL,
    feed_url: `${SITE_URL}/rss.xml`,
  });

  const sorted = [...patterns].sort((a, b) => {
    return (b.updated_at || '').localeCompare(a.updated_at || '');
  });

  sorted.slice(0, 20).forEach((pattern) => {
    feed.item({
      title: pattern.title,
      description: pattern.summary || '',
      url: `${SITE_URL}/patterns/${pattern.slug}`,
      date: pattern.updated_at ? new Date(pattern.updated_at) : new Date(),
      categories: [pattern.category, ...pattern.tags],
    });
  });

  return feed.xml({ indent: true });
}

function copyImageAssets(): void {
  const assets = fs.readdirSync(patternsDir).filter((file) => {
    return ASSET_EXTENSIONS.has(path.extname(file).toLowerCase());
  });

  if (assets.length === 0) return;

  fs.mkdirSync(legacyPatternsDir, { recursive: true });

  assets.forEach((file) => {
    fs.copyFileSync(path.join(patternsDir, file), path.join(legacyPatternsDir, file));
  });
}

function writeOutputs(patterns: ParsedPattern[]): void {
  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(dataPatternsDir, { recursive: true });
  fs.mkdirSync(legacyPatternsDir, { recursive: true });

  const nodeIds = new Set(patterns.map((pattern) => pattern.id));

  const patternIndex = patterns.map((pattern) => ({
    title: pattern.title,
    status: pattern.status,
    authors: pattern.authors,
    based_on: pattern.based_on,
    category: pattern.category,
    source: pattern.source,
    tags: pattern.tags,
    slug: pattern.slug,
    id: pattern.id,
    summary: pattern.summary,
    maturity: pattern.maturity,
    complexity: pattern.complexity,
    effort: pattern.effort,
    impact: pattern.impact,
    signals: pattern.signals,
    anti_signals: pattern.anti_signals,
    prerequisites: pattern.prerequisites,
    related: pattern.related,
    anti_patterns: pattern.anti_patterns,
    tools: pattern.tools,
    domains: pattern.domains,
    updated_at: pattern.updated_at,
    excerpt: pattern.excerpt,
  }));

  const graph = {
    nodes: patterns.map((pattern) => ({
      id: pattern.id,
      title: pattern.title,
      category: pattern.category,
      status: pattern.status,
      slug: pattern.slug,
      tags: pattern.tags,
      summary: pattern.summary,
      maturity: pattern.maturity,
      domains: pattern.domains,
    })),
    edges: patterns.flatMap((pattern) => {
      const relatedEdges =
        pattern.related
          ?.filter((id) => nodeIds.has(id))
          .map((id) => ({ source: pattern.id, target: id, type: 'related' as const })) || [];
      const antiEdges =
        pattern.anti_patterns
          ?.filter((id) => nodeIds.has(id))
          .map((id) => ({ source: pattern.id, target: id, type: 'anti-pattern' as const })) || [];
      return [...relatedEdges, ...antiEdges];
    }),
  };

  fs.writeFileSync(path.join(publicDir, 'patterns.json'), JSON.stringify(patternIndex, null, 2));
  fs.writeFileSync(path.join(dataDir, 'patterns.json'), JSON.stringify(patternIndex, null, 2));
  fs.writeFileSync(path.join(publicDir, 'graph.json'), JSON.stringify(graph, null, 2));
  fs.writeFileSync(path.join(dataDir, 'graph.json'), JSON.stringify(graph, null, 2));

  patterns.forEach((pattern) => {
    const patternJson = {
      title: pattern.title,
      status: pattern.status,
      authors: pattern.authors,
      based_on: pattern.based_on,
      category: pattern.category,
      source: pattern.source,
      tags: pattern.tags,
      slug: pattern.slug,
      id: pattern.id,
      summary: pattern.summary,
      maturity: pattern.maturity,
      complexity: pattern.complexity,
      effort: pattern.effort,
      impact: pattern.impact,
      signals: pattern.signals,
      anti_signals: pattern.anti_signals,
      prerequisites: pattern.prerequisites,
      related: pattern.related,
      anti_patterns: pattern.anti_patterns,
      tools: pattern.tools,
      domains: pattern.domains,
      updated_at: pattern.updated_at,
      body: pattern.body,
    };

    fs.writeFileSync(
      path.join(legacyPatternsDir, `${pattern.slug}.json`),
      JSON.stringify(patternJson, null, 2)
    );
    fs.writeFileSync(
      path.join(dataPatternsDir, `${pattern.slug}.json`),
      JSON.stringify(patternJson, null, 2)
    );
  });

  fs.writeFileSync(path.join(publicDir, 'llms.txt'), generateLlmsTxt(patterns));
  fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), generateLlmsFullTxt(patterns));
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), generateSitemapXml(patterns));
  fs.writeFileSync(path.join(publicDir, 'rss.xml'), generateRssFeed(patterns));
}

function main(): void {
  const patterns = parseAllPatterns().sort((a, b) => a.title.localeCompare(b.title));
  copyImageAssets();
  writeOutputs(patterns);
}

main();
