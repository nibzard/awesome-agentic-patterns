// ABOUTME: API endpoint for newsletter subscription, attribution tagging, and best-effort deliverable emails via Resend.

import type { APIRoute } from 'astro';
import {
  buildTransactionalEmail,
  normalizeResendTag,
  sanitizeDecisionBrief,
  sanitizeDeliverable,
  sanitizeSlug,
  sanitizeText,
} from '../../lib/newsletter-emails';

export const prerender = false;

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

// Rate limiting: Store IP addresses with timestamps in memory
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 6;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getServerEnv(name: string): string | undefined {
  const runtimeValue = process.env[name];
  if (typeof runtimeValue === 'string' && runtimeValue.trim()) {
    return runtimeValue.trim();
  }

  const buildEnv = import.meta.env as Record<string, string | undefined>;
  const buildValue = buildEnv[name];
  return typeof buildValue === 'string' && buildValue.trim() ? buildValue.trim() : undefined;
}

async function addContactToSegmentByEmail(email: string, resendApiKey: string, segmentId?: string) {
  if (!segmentId) return;

  const segmentResponse = await fetch(
    `https://api.resend.com/contacts/${encodeURIComponent(email)}/segments/${segmentId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!segmentResponse.ok) {
    const segmentError = await segmentResponse.json().catch(() => ({}));
    console.error('Resend segment API error:', segmentError);
  }
}

function getErrorMessage(errorData: unknown): string | undefined {
  if (!errorData || typeof errorData !== 'object') return undefined;
  const maybeMessage = (errorData as { message?: unknown }).message;
  return typeof maybeMessage === 'string' && maybeMessage.trim() ? maybeMessage : undefined;
}

function getErrorName(errorData: unknown): string | undefined {
  if (!errorData || typeof errorData !== 'object') return undefined;
  const maybeName = (errorData as { name?: unknown }).name;
  return typeof maybeName === 'string' && maybeName.trim() ? maybeName : undefined;
}

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

async function sendTransactionalEmail(params: {
  resendApiKey: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  html: string;
  text: string;
  tags: { name: string; value: string }[];
}): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: params.fromEmail,
        to: [params.toEmail],
        subject: params.subject,
        html: params.html,
        text: params.text,
        tags: params.tags,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Resend email delivery error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Resend email delivery error:', error);
    return false;
  }
}

function buildSuccessMessage(params: {
  alreadySubscribed: boolean;
  deliverable: string;
  emailSent: boolean;
}): string {
  if (params.deliverable === 'decision-brief') {
    return params.emailSent
      ? 'Sent! Check your inbox for your architecture brief and agent prompt.'
      : 'Subscribed! Your architecture brief is ready to copy or download below.';
  }

  if (params.deliverable === 'pack') {
    return params.emailSent
      ? 'Sent! Check your inbox for this pattern pack.'
      : 'Subscribed! You can open the full pattern pack (.md) below.';
  }

  if (params.alreadySubscribed) {
    return "You're already subscribed and will receive future updates.";
  }

  return params.emailSent
    ? 'Subscribed! Check your inbox for the Production Starter Pack.'
    : 'Thanks for subscribing! You can also open the Starter Pack (.md) below.';
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return jsonResponse({ error: 'Too many requests. Please try again later.' }, 429);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return jsonResponse({ error: 'Invalid request body.' }, 400);
    }

    const rawBody = body as Record<string, unknown>;
    const { email } = rawBody;

    // Validate email
    if (!email || typeof email !== 'string') {
      return jsonResponse({ error: 'Email address is required.' }, 400);
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return jsonResponse({ error: 'Please enter a valid email address.' }, 400);
    }

    const safeSource = sanitizeSlug(rawBody.source, 64) || 'unknown';
    const safePath = sanitizeText(rawBody.path, 200);
    const safeCategory = sanitizeText(rawBody.category, 80);
    const safeDeliverable = sanitizeDeliverable(rawBody.deliverable);
    const safePackSlug = sanitizeSlug(rawBody.packSlug, 80);
    const safeBrief = sanitizeDecisionBrief(rawBody.decisionBrief);

    // Get Resend API key from environment
    const resendApiKey = getServerEnv('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured');
      return jsonResponse(
        { error: 'Newsletter service is not configured. Please try again later.' },
        503
      );
    }

    const segmentId = getServerEnv('RESEND_SEGMENT_ID') ?? getServerEnv('RESEND_AUDIENCE_ID');

    // Create or update contact in Resend (keep payload strictly within Resend's contact schema)
    const resendResponse = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: trimmedEmail,
        unsubscribed: false,
        segments: segmentId ? [{ id: segmentId }] : undefined,
      }),
    });

    let alreadySubscribed = false;
    let contactId: string | undefined;

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json().catch(() => ({}));
      console.error('Resend API error:', errorData);

      const errorMessage = getErrorMessage(errorData);
      const errorName = getErrorName(errorData);

      if (resendResponse.status === 401 && errorName === 'restricted_api_key') {
        return jsonResponse(
          {
            error:
              'Newsletter service is misconfigured. The Resend API key does not have Contacts access.',
          },
          503
        );
      }

      if (resendResponse.status === 422) {
        alreadySubscribed = true;
        // Contact already exists. Ensure it is part of the configured newsletter segment.
        await addContactToSegmentByEmail(trimmedEmail, resendApiKey, segmentId);
      } else if (resendResponse.status === 400 && errorMessage) {
        return jsonResponse({ error: errorMessage }, 502);
      } else {
        return jsonResponse({ error: 'Failed to subscribe. Please try again.' }, 502);
      }
    } else {
      const data = (await resendResponse.json().catch(() => ({}))) as { id?: string };
      contactId = data.id;
    }

    const emailContent = buildTransactionalEmail({
      source: safeSource,
      category: safeCategory,
      deliverable: safeDeliverable,
      packSlug: safePackSlug,
      decisionBrief: safeBrief,
    });

    const fromEmail = getServerEnv('RESEND_FROM_EMAIL');
    const shouldSendEmail =
      Boolean(fromEmail) &&
      (!alreadySubscribed || safeDeliverable === 'decision-brief' || safeDeliverable === 'pack');

    let emailSent = false;
    if (shouldSendEmail && fromEmail) {
      const tags: { name: string; value: string }[] = [
        { name: 'source', value: normalizeResendTag(safeSource, 'unknown') },
        { name: 'deliverable', value: normalizeResendTag(safeDeliverable, 'starter_pack') },
      ];
      if (safeCategory) {
        tags.push({ name: 'category', value: normalizeResendTag(safeCategory, 'general') });
      }
      if (safePath) {
        tags.push({ name: 'path', value: normalizeResendTag(safePath, 'root') });
      }

      emailSent = await sendTransactionalEmail({
        resendApiKey,
        fromEmail,
        toEmail: trimmedEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        tags,
      });
    }

    return jsonResponse(
      {
        message: buildSuccessMessage({
          alreadySubscribed,
          deliverable: safeDeliverable,
          emailSent,
        }),
        contactId,
        alreadySubscribed,
        emailSent,
        downloadUrl: emailContent.downloadUrl,
      },
      200
    );
  } catch (error) {
    console.error('Subscription error:', error);
    return jsonResponse({ error: 'An unexpected error occurred. Please try again.' }, 500);
  }
};

// OPTIONS handler for CORS preflight
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
