// ABOUTME: Renders every Mermaid diagram in patterns/*.md with Pele to prove the site can draw all of them.
// ABOUTME: A failure names the pattern file and the diagram index so the source can be fixed.

import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from 'pele';

const patternsDir = join(import.meta.dir, '../../../../patterns');

function mermaidBlocks(markdown: string): string[] {
  const blocks: string[] = [];
  const fence = /^(```|~~~)mermaid[^\n]*\n([\s\S]*?)^\1\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = fence.exec(markdown)) !== null) blocks.push(match[2]);
  return blocks;
}

const files = readdirSync(patternsDir).filter((name) => name.endsWith('.md'));
const diagrams = files.flatMap((file) =>
  mermaidBlocks(readFileSync(join(patternsDir, file), 'utf8')).map((source, index) => ({
    label: `${file} #${index + 1}`,
    source,
  }))
);

describe('Pele renders every pattern diagram', () => {
  test('finds the diagrams', () => {
    expect(diagrams.length).toBeGreaterThan(100);
  });

  test.each(diagrams.map((d) => [d.label, d.source]))('%s', (_label, source) => {
    const { svg } = render(source);
    expect(svg).toStartWith('<svg');
  });
});
