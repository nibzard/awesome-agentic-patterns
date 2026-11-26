// ABOUTME: Audits academic citations and source URLs across patterns/*.md against the arXiv, Crossref, and DOI handle APIs.
// ABOUTME: Flags unknown arXiv IDs, cited titles that share no token with the real paper title, dead links, and GitHub repo redirects.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const patternsDir = path.join(repoRoot, 'patterns');

const USER_AGENT =
  'awesome-agentic-patterns-citation-audit/1.0 (+https://github.com/nibzard/awesome-agentic-patterns)';
const HTTP_CONCURRENCY = 6;
const HTTP_TIMEOUT_MS = 10_000;
const API_TIMEOUT_MS = 30_000;
const ARXIV_BATCH_SIZE = 20;
// The arXiv API terms ask for a three second gap between calls.
const ARXIV_BATCH_DELAY_MS = 3_000;
const CROSSREF_DELAY_MS = 1_000;
// A cited title must sit this close to its identifier on the same line to count as its label.
const MAX_TITLE_DISTANCE = 120;
const MIN_TITLE_TOKENS = 3;
const GET_FALLBACK_STATUS = new Set([403, 405, 501]);

const ARXIV_ID = /arXiv:\s*(\d{4}\.\d{4,5})(?:v\d+)?|arxiv\.org\/(?:abs|html|pdf)\/(\d{4}\.\d{4,5})(?:v\d+)?/g;
const DOI_ID = /10\.\d{4,9}\/[^\s)\]>,"']+/g;
// Parentheses stay allowed here so Wikipedia-style URLs survive; trimUrl removes a markdown closing paren.
const URL_PATTERN = /https?:\/\/[^\s<>\[\]"'`]+/g;
const IDENTIFIER_IN_URL = /(\d{4}\.\d{4,5})|(10\.\d{4,9}\/[^\s)\]>,"']+)/;

// Link text made only of these words and numbers locates a paper; it does not name it.
const LOCATOR_WORDS = new Set(
  (
    'arxiv paper pdf html abs abstract link links here source primary original citation citations doi http https www ' +
    'org com net full text section sections part chapter page pages pp version download view read see also preprint ' +
    'proceedings conference journal reference references repo repository github code implementation docs documentation ' +
    'blog post article video slides website site url'
  ).split(' ')
);

const STOP_WORDS = new Set(
  (
    'a an the and or but if then else of for in on at to from by with without via as is are was were be been being ' +
    'this that these those it its their our your his her they them we you he she not no nor so than too very can could ' +
    'may might must shall should will would do does did have has had about into over under between among across during ' +
    'while per each other more most less least few some any all both either neither own same such only just also using used ' +
    'use based et al pp vol eds ed proceedings conference journal workshop preprint arxiv doi org com www http https url ' +
    'link links pdf html abs abstract paper source primary original see also'
  ).split(' ')
);

type Severity = 'error' | 'warn' | 'info';

interface Finding {
  severity: Severity;
  category: 'arxiv' | 'doi' | 'link';
  file?: string;
  line?: number;
  message: string;
}

interface ArxivCitation {
  file: string;
  line: number;
  column: number;
  id: string;
  lineText: string;
}

interface DoiCitation {
  file: string;
  line: number;
  column: number;
  doi: string;
  lineText: string;
}

interface TitleSpan {
  text: string;
  start: number;
  end: number;
  url?: string;
}

interface UrlLocation {
  file: string;
  line: number;
}

interface UrlResult {
  status?: number;
  finalUrl?: string;
  error?: string;
}

interface CliOptions {
  offline: boolean;
  allLinks: boolean;
  reportPath?: string;
}

interface Extraction {
  arxiv: ArxivCitation[];
  dois: DoiCitation[];
  sourceUrls: Map<string, string>;
  allUrls: Map<string, UrlLocation>;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { offline: false, allLinks: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--offline') {
      options.offline = true;
    } else if (arg === '--all-links') {
      options.allLinks = true;
    } else if (arg === '--report') {
      options.reportPath = argv[i + 1];
      if (!options.reportPath) {
        console.error('--report needs a file path.');
        process.exit(2);
      }
      i += 1;
    } else {
      console.error(`Unknown argument: ${arg}`);
      console.error('Usage: bun scripts/audit-citations.ts [--offline] [--all-links] [--report <path>]');
      process.exit(2);
    }
  }

  return options;
}

function listPatternFiles(): string[] {
  return fs
    .readdirSync(patternsDir)
    .filter((file) => file.endsWith('.md') && file !== 'TEMPLATE.md')
    .map((file) => path.join(patternsDir, file))
    .sort();
}

export function trimUrl(value: string): string {
  let trimmed = value.replace(/[.,;:!?']+$/, '');
  const opens = (trimmed.match(/\(/g) || []).length;
  const closes = (trimmed.match(/\)/g) || []).length;
  for (let i = closes; i > opens; i -= 1) {
    if (!trimmed.endsWith(')')) break;
    trimmed = trimmed.slice(0, -1).replace(/[.,;:!?']+$/, '');
  }
  return trimmed;
}

// Older DOIs contain balanced parentheses, which DOI_ID has to stop before.
export function completeDoi(line: string, match: RegExpMatchArray): string {
  let doi = match[0];
  let end = (match.index ?? 0) + doi.length;

  while ((doi.match(/\(/g) || []).length > (doi.match(/\)/g) || []).length && line[end] === ')') {
    const continuation = line.slice(end).match(/^\)[^\s)\]>,"']*/);
    if (!continuation) break;
    doi += continuation[0];
    end += continuation[0].length;
  }

  return doi.replace(/[.,;:]+$/, '');
}

// Empties fenced code blocks while keeping every line, so later line numbers still match the file.
function blankFencedCode(text: string): string {
  return text.replace(/```[\s\S]*?(?:```|$)/g, (block) => block.replace(/[^\n]/g, ''));
}

// Hosts that are loopback, reserved, or documentation placeholders; liveness checks on them mean nothing.
export function isUncheckableHost(url: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return true;
  }
  if (
    hostname === 'localhost' ||
    hostname === '[::1]' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return true;
  }
  if (/^(127\.|0\.0\.0\.0$|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname)) return true;
  if (/^your-[a-z0-9-]+\./.test(hostname)) return true;
  return /(^|\.)(example\.(com|net|org)|example|invalid|test)$/.test(hostname);
}

function extractAll(files: string[]): Extraction {
  const arxiv: ArxivCitation[] = [];
  const dois: DoiCitation[] = [];
  const sourceUrls = new Map<string, string>();
  const allUrls = new Map<string, UrlLocation>();
  const seenArxiv = new Set<string>();
  const seenDoi = new Set<string>();

  files.forEach((file) => {
    const raw = fs.readFileSync(file, 'utf-8');
    const relativeFile = path.relative(repoRoot, file);
    const { data } = matter(raw);
    // Liveness applies to prose and Markdown links; sample endpoints inside code are not references.
    const proseLines = blankFencedCode(raw).split('\n');

    if (typeof data.source === 'string' && data.source.trim()) {
      sourceUrls.set(relativeFile, data.source.trim());
    }

    raw.split('\n').forEach((lineText, index) => {
      const line = index + 1;

      for (const match of lineText.matchAll(ARXIV_ID)) {
        const id = match[1] || match[2];
        const key = `${relativeFile}:${line}:${id}`;
        if (seenArxiv.has(key)) continue;
        seenArxiv.add(key);
        arxiv.push({ file: relativeFile, line, column: match.index ?? 0, id, lineText });
      }

      for (const match of lineText.matchAll(DOI_ID)) {
        const doi = completeDoi(lineText, match);
        const key = `${relativeFile}:${line}:${doi}`;
        if (seenDoi.has(key)) continue;
        seenDoi.add(key);
        dois.push({ file: relativeFile, line, column: match.index ?? 0, doi, lineText });
      }

      const prose = (proseLines[index] || '').replace(/`[^`\n]*`/g, '');
      for (const match of prose.matchAll(URL_PATTERN)) {
        const url = trimUrl(match[0]);
        if (url && !allUrls.has(url)) allUrls.set(url, { file: relativeFile, line });
      }
    });
  });

  return { arxiv, dois, sourceUrls, allUrls };
}

function cleanTitle(text: string): string {
  return text
    .replace(/[`*_]/g, ' ')
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractTitleSpans(line: string): TitleSpan[] {
  const spans: TitleSpan[] = [];

  // The URL part admits one level of balanced parentheses, as in older Elsevier DOIs.
  for (const match of line.matchAll(/\[([^\]]+)\]\(([^\s()]+(?:\([^\s()]*\)[^\s()]*)*)(?:\s+"[^"]*")?\)/g)) {
    spans.push({
      text: cleanTitle(match[1]),
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
      url: match[2],
    });
  }
  for (const match of line.matchAll(/"([^"]+)"/g)) {
    spans.push({ text: cleanTitle(match[1]), start: match.index ?? 0, end: (match.index ?? 0) + match[0].length });
  }
  for (const match of line.matchAll(/“([^”]+)”/g)) {
    spans.push({ text: cleanTitle(match[1]), start: match.index ?? 0, end: (match.index ?? 0) + match[0].length });
  }
  for (const match of line.matchAll(/(?:^|[^*])\*([^*\n]+)\*(?!\*)/g)) {
    const start = (match.index ?? 0) + match[0].length - match[1].length - 1;
    spans.push({ text: cleanTitle(match[1]), start, end: start + match[1].length + 1 });
  }

  return spans;
}

export function isNonTitleLabel(text: string): boolean {
  const value = text.toLowerCase().replace(/\s+/g, ' ').trim();
  if (value.length === 0) return true;
  if (/^(arxiv:?)?\s*\d{4}\.\d{4,5}(v\d+)?$/.test(value)) return true;
  const tokens = value.split(/[^a-z0-9.]+/).filter(Boolean);
  return tokens.every((token) => LOCATOR_WORDS.has(token) || /^v?\d+(?:\.\d+)*$/.test(token));
}

export function pickTitleSpan(line: string, spans: TitleSpan[], identifier: string, column: number): TitleSpan | undefined {
  const linked = spans.find((span) => span.url?.includes(identifier));
  if (linked && !isNonTitleLabel(linked.text)) return linked;

  // A span whose link points at a different identifier labels that identifier, not this one.
  const candidates = spans.filter((span) => {
    if (isNonTitleLabel(span.text)) return false;
    if (!span.url) return true;
    const other = span.url.match(IDENTIFIER_IN_URL);
    return !other || span.url.includes(identifier);
  });

  const before = candidates
    .filter((span) => span.end <= column && column - span.end <= MAX_TITLE_DISTANCE)
    .sort((a, b) => column - a.end - (column - b.end))[0];
  if (before) return before;

  return candidates
    .filter((span) => span.start >= column && span.start - column <= MAX_TITLE_DISTANCE)
    .sort((a, b) => a.start - column - (b.start - column))[0];
}

function contentTokens(text: string): Set<string> {
  const tokens = new Set<string>();
  for (const token of text.toLowerCase().split(/[^a-z0-9]+/)) {
    if (token.length < 2 || STOP_WORDS.has(token) || /^v\d+$/.test(token)) continue;
    tokens.add(token);
  }
  return tokens;
}

export function hasTitleMismatch(citedTitle: string, realTitle: string): boolean {
  const cited = contentTokens(citedTitle);
  if (cited.size < MIN_TITLE_TOKENS) return false;
  const real = contentTokens(realTitle);
  return Array.from(cited).every((token) => !real.has(token));
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&');
}

function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/ENOTFOUND|getaddrinfo|resolve|unable to resolve/i.test(message)) return `DNS error (${message})`;
  if (/certificate|SSL|TLS|ERR_TLS/i.test(message)) return `TLS error (${message})`;
  if (/timeout|timed out|aborted/i.test(message)) return `timeout (${message})`;
  return message;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker(): Promise<void> {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function requestHeaders(): Record<string, string> {
  return { 'user-agent': USER_AGENT, accept: '*/*' };
}

async function fetchArxivTitles(ids: string[], findings: Finding[]): Promise<{ titles: Map<string, string>; unverified: Set<string> }> {
  const titles = new Map<string, string>();
  const unverified = new Set<string>();

  for (let start = 0; start < ids.length; start += ARXIV_BATCH_SIZE) {
    const chunk = ids.slice(start, start + ARXIV_BATCH_SIZE);
    const url = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(chunk.join(','))}&max_results=${chunk.length}`;

    try {
      const response = await fetch(url, { headers: requestHeaders(), signal: AbortSignal.timeout(API_TIMEOUT_MS) });
      if (!response.ok) throw new Error(`arXiv API returned HTTP ${response.status}`);

      const xml = await response.text();
      for (const entry of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
        const id = entry[1].match(/<id>\s*https?:\/\/arxiv\.org\/abs\/([^<\s]+)\s*<\/id>/);
        const title = entry[1].match(/<title>([\s\S]*?)<\/title>/);
        if (id && title) titles.set(id[1].replace(/v\d+$/, ''), decodeXml(title[1]).replace(/\s+/g, ' ').trim());
      }
    } catch (error) {
      chunk.forEach((id) => unverified.add(id));
      findings.push({
        severity: 'warn',
        category: 'arxiv',
        message: `arXiv API request failed for ${chunk.length} ID(s) (${chunk[0]} to ${chunk[chunk.length - 1]}): ${describeError(error)}`,
      });
    }

    if (start + ARXIV_BATCH_SIZE < ids.length) await sleep(ARXIV_BATCH_DELAY_MS);
  }

  return { titles, unverified };
}

interface ArxivStats {
  resolved: number;
  unresolved: number;
  unverified: number;
}

async function verifyArxiv(citations: ArxivCitation[], findings: Finding[]): Promise<ArxivStats> {
  const distinctIds = Array.from(new Set(citations.map((citation) => citation.id))).sort();
  console.error(`[audit-citations] Verifying ${distinctIds.length} distinct arXiv IDs in batches of ${ARXIV_BATCH_SIZE}...`);
  const { titles, unverified } = await fetchArxivTitles(distinctIds, findings);

  citations.forEach((citation) => {
    const realTitle = titles.get(citation.id);
    if (!realTitle) {
      if (!unverified.has(citation.id)) {
        findings.push({
          severity: 'error',
          category: 'arxiv',
          file: citation.file,
          line: citation.line,
          message: `arXiv ${citation.id} is not in the arXiv API response (unknown or malformed ID).`,
        });
      }
      return;
    }

    const span = pickTitleSpan(citation.lineText, extractTitleSpans(citation.lineText), citation.id, citation.column);
    if (span && hasTitleMismatch(span.text, realTitle)) {
      findings.push({
        severity: 'error',
        category: 'arxiv',
        file: citation.file,
        line: citation.line,
        message: `arXiv ${citation.id} is cited as "${span.text}" but the arXiv title is "${realTitle}".`,
      });
    }
  });

  return {
    resolved: titles.size,
    unresolved: distinctIds.filter((id) => !titles.has(id) && !unverified.has(id)).length,
    unverified: unverified.size,
  };
}

type CrossrefResult =
  | { status: 'ok'; title: string }
  | { status: 'not_found' }
  | { status: 'error'; error: string };

async function fetchCrossref(doi: string): Promise<CrossrefResult> {
  try {
    const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: requestHeaders(),
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (response.status === 404) return { status: 'not_found' };
    if (!response.ok) return { status: 'error', error: `Crossref returned HTTP ${response.status}` };

    const json = (await response.json()) as { message?: { title?: unknown; subtitle?: unknown } };
    const parts = [json.message?.title, json.message?.subtitle].flat().filter((part): part is string => typeof part === 'string');
    return { status: 'ok', title: parts.join(' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() };
  } catch (error) {
    return { status: 'error', error: describeError(error) };
  }
}

async function isRegisteredDoi(doi: string): Promise<boolean | null> {
  try {
    const response = await fetch(`https://doi.org/api/handles/${encodeURIComponent(doi)}`, {
      headers: requestHeaders(),
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    const json = (await response.json()) as { responseCode?: number };
    // 1 = handle found, 100 = handle not found; any other code is inconclusive.
    if (json.responseCode === 1) return true;
    if (json.responseCode === 100) return false;
    return null;
  } catch {
    return null;
  }
}

interface DoiStats {
  verified: number;
  unverified: number;
}

async function verifyDois(citations: DoiCitation[], findings: Finding[]): Promise<DoiStats> {
  const byDoi = new Map<string, DoiCitation[]>();
  citations.forEach((citation) => {
    byDoi.set(citation.doi, [...(byDoi.get(citation.doi) || []), citation]);
  });
  const distinctDois = Array.from(byDoi.keys()).sort();
  console.error(`[audit-citations] Verifying ${distinctDois.length} distinct DOIs via Crossref...`);

  let verified = 0;

  for (const [index, doi] of distinctDois.entries()) {
    const result = await fetchCrossref(doi);
    const uses = byDoi.get(doi) || [];
    const first = uses[0];

    if (result.status === 'error') {
      findings.push({
        severity: 'warn',
        category: 'doi',
        file: first.file,
        line: first.line,
        message: `DOI ${doi} could not be verified: ${result.error}.`,
      });
    } else if (result.status === 'not_found') {
      const registered = await isRegisteredDoi(doi);
      if (registered === false) {
        findings.push({
          severity: 'error',
          category: 'doi',
          file: first.file,
          line: first.line,
          message: `DOI ${doi} is not registered at Crossref or the DOI handle system.`,
        });
      } else {
        findings.push({
          severity: registered ? 'info' : 'warn',
          category: 'doi',
          file: first.file,
          line: first.line,
          message: registered
            ? `DOI ${doi} is registered through another agency (such as DataCite), not Crossref; title not verified.`
            : `DOI ${doi} is not in Crossref and the DOI handle system did not answer; not verified.`,
        });
      }
    } else {
      verified += 1;
      uses.forEach((citation) => {
        const span = pickTitleSpan(citation.lineText, extractTitleSpans(citation.lineText), citation.doi, citation.column);
        if (span && hasTitleMismatch(span.text, result.title)) {
          findings.push({
            severity: 'error',
            category: 'doi',
            file: citation.file,
            line: citation.line,
            message: `DOI ${doi} is cited as "${span.text}" but the Crossref title is "${result.title}".`,
          });
        }
      });
    }

    if (index < distinctDois.length - 1) await sleep(CROSSREF_DELAY_MS);
  }

  return { verified, unverified: distinctDois.length - verified };
}

async function checkUrl(url: string): Promise<UrlResult> {
  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: requestHeaders(),
      signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
    });

    if (GET_FALLBACK_STATUS.has(response.status)) {
      response = await fetch(url, {
        redirect: 'follow',
        headers: requestHeaders(),
        signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
      });
      try {
        await response.body?.cancel();
      } catch {
        // The body is not read; failing to cancel it does not affect the status.
      }
    }

    return { status: response.status, finalUrl: response.url || url };
  } catch (error) {
    return { error: describeError(error) };
  }
}

function githubRepo(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com' && parsed.hostname !== 'www.github.com') return null;
    const [owner, repo] = parsed.pathname.split('/').filter(Boolean);
    return owner && repo ? `${owner}/${repo.replace(/\.git$/, '')}` : null;
  } catch {
    return null;
  }
}

function classifyUrl(url: string, result: UrlResult, isSource: boolean, location: UrlLocation): Finding[] {
  const label = isSource ? 'source URL' : 'link';
  const base = { category: 'link' as const, file: location.file, line: location.line };
  const findings: Finding[] = [];
  const status = result.status;

  if (result.error) {
    findings.push({ ...base, severity: 'warn', message: `${label} ${url} could not be reached: ${result.error}.` });
  } else if (status === 404 || status === 410) {
    findings.push({
      ...base,
      severity: isSource ? 'error' : 'warn',
      message: `Dead ${label} ${url} (HTTP ${status}).`,
    });
  } else if (status !== undefined && status >= 500) {
    findings.push({ ...base, severity: 'warn', message: `${label} ${url} returned HTTP ${status}; retry later.` });
  } else if (status === 429) {
    findings.push({ ...base, severity: 'warn', message: `${label} ${url} rate-limited the check (HTTP 429); not verified.` });
  } else if (status === 403 || status === 401) {
    findings.push({
      ...base,
      severity: 'info',
      message: `${label} ${url} blocks automated checks (HTTP ${status}); liveness not verified.`,
    });
  } else if (status !== undefined && status >= 300 && status < 400) {
    findings.push({ ...base, severity: 'warn', message: `${label} ${url} stopped at a redirect (HTTP ${status}).` });
  }

  const citedRepo = githubRepo(url);
  const finalRepo = result.finalUrl ? githubRepo(result.finalUrl) : null;
  if (citedRepo && finalRepo && citedRepo.toLowerCase() !== finalRepo.toLowerCase()) {
    findings.push({
      ...base,
      severity: 'warn',
      message: `GitHub redirect for ${label} ${url}: the repository moved from ${citedRepo} to ${finalRepo}.`,
    });
  } else if (citedRepo && result.finalUrl && !finalRepo && status !== undefined && status > 0) {
    findings.push({
      ...base,
      severity: 'warn',
      message: `GitHub redirect for ${label} ${url}: it now resolves to ${result.finalUrl}, which is not a GitHub repository.`,
    });
  }

  return findings;
}

async function verifyUrls(
  extraction: Extraction,
  allLinks: boolean,
  findings: Finding[]
): Promise<{ checked: number; failed: number; skipped: number }> {
  const targets = new Map<string, { locations: UrlLocation[]; isSource: boolean }>();

  if (allLinks) {
    extraction.allUrls.forEach((location, url) => targets.set(url, { locations: [location], isSource: false }));
  }
  extraction.sourceUrls.forEach((source, file) => {
    const entry = targets.get(source);
    const location = { file, line: 1 };
    if (entry) {
      entry.isSource = true;
      entry.locations.push(location);
    } else {
      targets.set(source, { locations: [location], isSource: true });
    }
  });

  const urls = Array.from(targets.keys()).filter((url) => !isUncheckableHost(url)).sort();
  const skipped = targets.size - urls.length;
  console.error(`[audit-citations] Checking ${urls.length} distinct URL(s) with concurrency ${HTTP_CONCURRENCY}...`);
  const results = await mapWithConcurrency(urls, HTTP_CONCURRENCY, async (url) => ({ url, result: await checkUrl(url) }));

  let failed = 0;
  results.forEach(({ url, result }) => {
    const target = targets.get(url);
    if (!target) return;
    const location = target.isSource ? target.locations[target.locations.length - 1] : target.locations[0];
    const urlFindings = classifyUrl(url, result, target.isSource, location);
    if (result.error || (result.status !== undefined && result.status >= 400)) failed += 1;
    findings.push(...urlFindings);
  });

  return { checked: urls.length, failed, skipped };
}

function checkSyntax(extraction: Extraction, findings: Finding[]): void {
  const sourceProblem = (source: string): string | null => {
    if (/\s/.test(source)) return 'contains whitespace or trailing text';
    try {
      const parsed = new URL(source);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return 'is not an http(s) URL';
    } catch {
      return 'is not a valid URL';
    }
    return null;
  };

  extraction.sourceUrls.forEach((source, file) => {
    const problem = sourceProblem(source);
    if (problem) {
      findings.push({
        severity: 'error',
        category: 'link',
        file,
        line: 1,
        message: `source URL "${source}" ${problem}.`,
      });
    }
  });

  extraction.arxiv.forEach((citation) => {
    if (!/^\d{4}\.\d{4,5}$/.test(citation.id)) {
      findings.push({
        severity: 'error',
        category: 'arxiv',
        file: citation.file,
        line: citation.line,
        message: `arXiv ID "${citation.id}" is malformed.`,
      });
    }
  });

  extraction.dois.forEach((citation) => {
    if (!/^10\.\d{4,9}\/\S+$/.test(citation.doi)) {
      findings.push({
        severity: 'error',
        category: 'doi',
        file: citation.file,
        line: citation.line,
        message: `DOI "${citation.doi}" is malformed.`,
      });
    }
  });
}

function locationOf(finding: Finding): string {
  return finding.file ? `${finding.file}${finding.line ? `:${finding.line}` : ''}` : '-';
}

function renderReport(
  options: CliOptions,
  patternCount: number,
  extraction: Extraction,
  verification: Verification,
  findings: Finding[]
): string {
  const errors = findings.filter((finding) => finding.severity === 'error');
  const warnings = findings.filter((finding) => finding.severity === 'warn');
  const infos = findings.filter((finding) => finding.severity === 'info');
  const distinctArxiv = new Set(extraction.arxiv.map((citation) => citation.id)).size;
  const distinctDois = new Set(extraction.dois.map((citation) => citation.doi)).size;
  const lines: string[] = ['# Citation Audit Report', ''];

  lines.push(`- Mode: ${options.offline ? 'offline (extraction and syntax checks only)' : 'live'}`);
  lines.push(`- Patterns scanned: ${patternCount}`);
  lines.push(
    `- arXiv IDs: ${distinctArxiv} distinct (${extraction.arxiv.length} citations)${
      options.offline
        ? ''
        : `; ${verification.arxivResolved} resolved, ${verification.arxivUnresolved} unknown, ${verification.arxivUnverified} unverified`
    }`
  );
  lines.push(
    `- DOIs: ${distinctDois} distinct (${extraction.dois.length} citations)${options.offline ? '' : `; ${verification.doiVerified} resolved via Crossref`}`
  );
  lines.push(
    `- URLs: ${extraction.allUrls.size} distinct (prose and links, code excluded)${
      options.allLinks ? ', all checked' : ''
    }; ${extraction.sourceUrls.size} source URLs${
      options.offline
        ? ''
        : `; ${verification.urlsChecked} checked, ${verification.urlsFailed} unreachable or >=400, ${verification.urlsSkipped} skipped (loopback or placeholder hosts)`
    }`
  );
  lines.push(`- Findings: ${errors.length} error(s), ${warnings.length} warning(s), ${infos.length} info`);
  lines.push('');

  const section = (title: string, items: Finding[]) => {
    lines.push(`## ${title} (${items.length})`, '');
    if (items.length === 0) {
      lines.push('None.', '');
      return;
    }
    items.forEach((finding) => {
      lines.push(`- **[${finding.category}]** \`${locationOf(finding)}\` ${finding.message}`);
    });
    lines.push('');
  };

  section(options.offline ? 'Errors (syntax only; offline mode does not fail)' : 'Errors (fail the audit)', errors);
  section('Warnings', warnings);
  section('Notes', infos);

  return lines.join('\n');
}

interface Verification {
  arxivResolved: number;
  arxivUnresolved: number;
  arxivUnverified: number;
  doiVerified: number;
  urlsChecked: number;
  urlsFailed: number;
  urlsSkipped: number;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const files = listPatternFiles();
  const extraction = extractAll(files);
  const findings: Finding[] = [];

  checkSyntax(extraction, findings);

  const verification: Verification = {
    arxivResolved: 0,
    arxivUnresolved: 0,
    arxivUnverified: 0,
    doiVerified: 0,
    urlsChecked: 0,
    urlsFailed: 0,
    urlsSkipped: 0,
  };

  if (!options.offline) {
    const arxiv = await verifyArxiv(extraction.arxiv, findings);
    verification.arxivResolved = arxiv.resolved;
    verification.arxivUnresolved = arxiv.unresolved;
    verification.arxivUnverified = arxiv.unverified;

    const dois = await verifyDois(extraction.dois, findings);
    verification.doiVerified = dois.verified;

    const urls = await verifyUrls(extraction, options.allLinks, findings);
    verification.urlsChecked = urls.checked;
    verification.urlsFailed = urls.failed;
    verification.urlsSkipped = urls.skipped;
  }

  findings.sort((a, b) => {
    const order = { error: 0, warn: 1, info: 2 };
    return (
      order[a.severity] - order[b.severity] ||
      (a.file || '').localeCompare(b.file || '') ||
      (a.line || 0) - (b.line || 0) ||
      a.message.localeCompare(b.message)
    );
  });

  const report = renderReport(options, files.length, extraction, verification, findings);
  console.log(report);

  if (options.reportPath) {
    fs.writeFileSync(options.reportPath, `${report}\n`);
    console.error(`[audit-citations] Report written to ${options.reportPath}`);
  }

  // Offline mode reports syntax problems but never fails; only live verification produces hard failures.
  const hasErrors = findings.some((finding) => finding.severity === 'error');
  process.exit(!options.offline && hasErrors ? 1 : 0);
}

if (import.meta.main) await main();
