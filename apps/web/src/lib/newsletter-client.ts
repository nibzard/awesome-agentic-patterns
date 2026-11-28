// ABOUTME: Client-side state, attribution tracking, and submission helpers for newsletter capture.
// ABOUTME: Storage helpers accept an optional StorageLike interface so tests run without a DOM.

export type DeliverableType = 'digest' | 'starter-pack' | 'pack' | 'decision-brief';

export interface DecisionBriefPattern {
  slug: string;
  title: string;
  status: string;
  why: string;
}

export interface DecisionBriefGroup {
  title: string;
  patterns: DecisionBriefPattern[];
}

export interface DecisionBriefPayload {
  route: { label: string; value: string }[];
  summary: string;
  avoid: string[];
  groups: DecisionBriefGroup[];
}

export interface SubscribePayload {
  email: string;
  source: string;
  path?: string;
  category?: string;
  deliverable?: DeliverableType;
  packSlug?: string;
  decisionBrief?: DecisionBriefPayload;
}

export interface SubscribeResult {
  ok: boolean;
  message?: string;
  error?: string;
  alreadySubscribed?: boolean;
  emailSent?: boolean;
  downloadUrl?: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const SUBSCRIBED_KEY = 'aap_subscribed_v1';
export const NUDGE_DISMISSED_KEY = 'aap_nudge_dismissed_v1';
export const SLIDEIN_DISMISSED_KEY = 'aap_slidein_dismissed_v1';
export const VIEWS_SESSION_KEY = 'aap_content_views_v1';

export const SUBSCRIBED_EVENT = 'aap:subscribed';
export const NEWSLETTER_EVENT = 'aap:newsletter-event';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getBrowserLocalStorage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function getBrowserSessionStorage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export function isSubscribed(storage: StorageLike | null = getBrowserLocalStorage()): boolean {
  if (!storage) return false;
  try {
    const raw = storage.getItem(SUBSCRIBED_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { subscribedAt?: unknown };
    return typeof parsed?.subscribedAt === 'string' && parsed.subscribedAt.length > 0;
  } catch {
    return false;
  }
}

export function markSubscribed(
  source = 'unknown',
  storage: StorageLike | null = getBrowserLocalStorage(),
  now: Date = new Date()
): void {
  if (!storage) return;
  try {
    storage.setItem(
      SUBSCRIBED_KEY,
      JSON.stringify({
        subscribedAt: now.toISOString(),
        source,
      })
    );
  } catch {
    // Ignore storage failures in restricted browsing modes.
  }
}

export function isDismissedWithinDays(
  key: string,
  days = 30,
  storage: StorageLike | null = getBrowserLocalStorage(),
  now: Date = new Date()
): boolean {
  if (!storage) return false;
  try {
    const raw = storage.getItem(key);
    if (!raw) return false;
    const parsedMs = Date.parse(raw);
    if (!Number.isFinite(parsedMs)) return false;
    const ageMs = now.getTime() - parsedMs;
    return ageMs >= 0 && ageMs < days * MS_PER_DAY;
  } catch {
    return false;
  }
}

export function markDismissed(
  key: string,
  storage: StorageLike | null = getBrowserLocalStorage(),
  now: Date = new Date()
): void {
  if (!storage) return;
  try {
    storage.setItem(key, now.toISOString());
  } catch {
    // Ignore storage failures in restricted browsing modes.
  }
}

export function isContentPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return (
    (normalized.startsWith('/patterns/') && normalized.length > '/patterns/'.length) ||
    (normalized.startsWith('/guides/') && normalized.length > '/guides/'.length)
  );
}

export function recordContentView(
  pathname: string,
  storage: StorageLike | null = getBrowserSessionStorage()
): number {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (!storage) return isContentPath(normalized) ? 1 : 0;

  let views: string[] = [];
  try {
    const raw = storage.getItem(VIEWS_SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      views = parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    views = [];
  }

  if (isContentPath(normalized) && !views.includes(normalized)) {
    views = [...views, normalized];
    try {
      storage.setItem(VIEWS_SESSION_KEY, JSON.stringify(views));
    } catch {
      // Ignore storage failures in restricted browsing modes.
    }
  }

  return views.length;
}

export function trackNewsletterEvent(name: string, detail: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  try {
    const win = window as unknown as {
      va?: (command: string, payload: Record<string, unknown>) => void;
    };
    win.va?.('event', { name, data: detail });
    window.dispatchEvent(new CustomEvent(NEWSLETTER_EVENT, { detail: { name, ...detail } }));
  } catch {
    // Analytics must never interrupt user actions.
  }
}

async function parseJsonSafely(response: Response): Promise<Record<string, unknown>> {
  try {
    const parsed: unknown = await response.json();
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export async function submitSubscription(payload: SubscribePayload): Promise<SubscribeResult> {
  const path =
    payload.path ?? (typeof window !== 'undefined' ? window.location.pathname : undefined);

  const response = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      path,
    }),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    return {
      ok: false,
      error:
        typeof data.error === 'string' && data.error
          ? data.error
          : 'Something went wrong. Please try again.',
    };
  }

  markSubscribed(payload.source);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(SUBSCRIBED_EVENT, {
        detail: {
          source: payload.source,
          deliverable: payload.deliverable,
          packSlug: payload.packSlug,
        },
      })
    );
  }

  trackNewsletterEvent('newsletter_subscribe', {
    source: payload.source,
    deliverable: payload.deliverable || 'starter-pack',
    category: payload.category || '',
  });

  return {
    ok: true,
    message:
      typeof data.message === 'string' && data.message ? data.message : 'Thanks for subscribing.',
    alreadySubscribed: Boolean(data.alreadySubscribed),
    emailSent: Boolean(data.emailSent),
    downloadUrl: typeof data.downloadUrl === 'string' ? data.downloadUrl : undefined,
  };
}
