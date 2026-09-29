import type { APIRoute } from 'astro';
import { contactRateLimit } from '../../lib/r_limit';
import { TURNSTILE_SECRET_KEY } from 'astro:env/server';

export const prerender = false;

interface ContactRequestBody {
  email?: string;
  message?: string;
  turnstileToken?: string;
}

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // 1. Resolve client IP across Cloudflare, proxies, and Astro clientAddress
  const identifier =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    clientAddress ||
    '127.0.0.1';

  // 2. Check Upstash rate limit
  const { success, limit, remaining, reset } = await contactRateLimit.limit(`contact_${identifier}`);

  if (!success) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please wait before trying again.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }

  try {
    let email: string | undefined;
    let message: string | undefined;
    let turnstileToken: string | undefined;

    const contentType = request.headers.get('content-type') || '';

    // Handle both JSON payload and FormData fallback
    if (contentType.includes('application/json')) {
      const body: ContactRequestBody = await request.json();
      email = body.email;
      message = body.message;
      turnstileToken = body.turnstileToken;
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      email = formData.get('email')?.toString();
      message = formData.get('message')?.toString();
      turnstileToken = formData.get('cf-turnstile-response')?.toString();
    }

    // Validate parameters
    if (!email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required email or message field.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Cloudflare Turnstile verification
    const secretKey = TURNSTILE_SECRET_KEY || import.meta.env.TURNSTILE_SECRET_KEY || '';
    if (secretKey && turnstileToken) {
      const verifyFormData = new URLSearchParams();
      verifyFormData.append('secret', secretKey);
      verifyFormData.append('response', turnstileToken);
      verifyFormData.append('remoteip', identifier);

      const turnstileRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          body: verifyFormData,
        }
      );

      const turnstileData: TurnstileVerifyResponse = await turnstileRes.json();

      if (!turnstileData.success) {
        return new Response(
          JSON.stringify({ error: 'Bot verification failed. Please refresh and try again.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Dispatch webhook / store message if configured
    const webhookUrl = import.meta.env.CONTACT_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message, ip: identifier, timestamp: new Date().toISOString() }),
      });
    }

    return new Response(
      JSON.stringify({ message: 'Sequence initiated successfully.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Contact endpoint exception:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error processing request.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};