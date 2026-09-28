// ABOUTME: Chooses the related patterns shown at the end of a pattern page.
// ABOUTME: Explicit `related` links come first; patterns with shared tags fill the rest.

export interface RelatableEntry {
  id: string;
  slug: string;
  title: string;
  category: string;
  tags: string[];
  related?: string[];
}

export type RelatedReason = 'related' | 'shared tags';

export function pickRelated<T extends RelatableEntry>(
  pattern: T,
  all: T[],
  limit = 3
): (T & { reason: RelatedReason })[] {
  const byKey = new Map<string, T>();
  all.forEach((entry) => {
    byKey.set(entry.id, entry);
    byKey.set(entry.slug, entry);
  });

  const picked: (T & { reason: RelatedReason })[] = [];
  const seen = new Set<string>([pattern.slug]);

  for (const key of pattern.related || []) {
    const entry = byKey.get(key);
    if (entry && !seen.has(entry.slug)) {
      seen.add(entry.slug);
      picked.push({ ...entry, reason: 'related' });
    }
  }

  const tags = new Set(pattern.tags);
  const candidates = all
    .filter((entry) => !seen.has(entry.slug))
    .map((entry) => ({ entry, shared: entry.tags.filter((tag) => tags.has(tag)).length }))
    .filter(({ shared }) => shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        Number(b.entry.category === pattern.category) -
          Number(a.entry.category === pattern.category) ||
        a.entry.title.localeCompare(b.entry.title)
    );

  for (const { entry } of candidates) {
    picked.push({ ...entry, reason: 'shared tags' });
  }

  return picked.slice(0, limit);
}
