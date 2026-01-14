import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

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

function extractSection(body: string, sectionName: string): string | null {
  const regex = new RegExp(`## ${sectionName}\\n([\\s\\S]*?)(?=## |$)`, 'i');
  const match = body.match(regex);
  return match ? match[1].trim() : null;
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

function collectPatternFiles(target: string): string[] {
  const resolved = path.resolve(target);
  if (!fs.existsSync(resolved)) {
    return [];
  }

  const stats = fs.statSync(resolved);
  if (stats.isFile()) {
    return resolved.endsWith('.md') ? [resolved] : [];
  }

  if (!stats.isDirectory()) {
    return [];
  }

  return fs
    .readdirSync(resolved)
    .filter((file) => file.endsWith('.md') && file !== 'TEMPLATE.md')
    .map((file) => path.join(resolved, file));
}

function migratePatternFile(filePath: string, dryRun: boolean): boolean {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const fileSlug = path.basename(filePath, path.extname(filePath));

  const updates: Record<string, unknown> = {};

  if (!data.slug || typeof data.slug !== 'string' || data.slug.trim().length === 0) {
    updates.slug = slugify((data.title as string) || fileSlug);
  }

  if (!data.id || typeof data.id !== 'string' || data.id.trim().length === 0) {
    const source = (data.title as string) || (updates.slug as string) || fileSlug;
    updates.id = slugify(source);
  }

  if (!data.summary || typeof data.summary !== 'string' || data.summary.trim().length === 0) {
    const summary = deriveSummary(content);
    if (summary) {
      updates.summary = summary;
    }
  }

  if (!data.updated_at || typeof data.updated_at !== 'string' || data.updated_at.trim().length === 0) {
    updates.updated_at = getFileModDate(filePath);
  }

  const hasUpdates = Object.keys(updates).length > 0;
  if (!hasUpdates) return false;

  const newData = { ...data, ...updates };
  const updatedContent = matter.stringify(content, newData);

  if (!dryRun) {
    fs.writeFileSync(filePath, updatedContent);
  }

  const updateKeys = Object.keys(updates).join(', ');
  const prefix = dryRun ? 'DRY RUN' : 'UPDATED';
  console.log(`${prefix}: ${filePath} (${updateKeys})`);

  return true;
}

function main(): void {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const targets = args.filter((arg) => !arg.startsWith('--'));
  const target = targets[0] || 'patterns';

  const files = collectPatternFiles(target);
  if (files.length === 0) {
    console.error('No pattern files found to migrate.');
    process.exit(1);
  }

  let updatedCount = 0;
  files.forEach((file) => {
    if (migratePatternFile(file, dryRun)) {
      updatedCount += 1;
    }
  });

  if (updatedCount === 0) {
    console.log('No patterns required migration.');
  }
}

main();
