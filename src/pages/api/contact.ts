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
  // 1. Resolve client IP address
  const identifier =
    clientAddress ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    '127.0.0.1';

  // 2. Check rate limit
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
    // 3. Parse JSON Body
    const body: ContactRequestBody = await request.json();
    const { email, message, turnstileToken } = body;

    // Validate required fields
    if (!email || !message || !turnstileToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Verify Turnstile Token with Cloudflare
    const verifyFormData = new URLSearchParams();
    verifyFormData.append('secret', TURNSTILE_SECRET_KEY);
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
        JSON.stringify({ error: 'Bot verification failed. Please try again.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Process your email dispatch or store in database here
    // e.g., await sendEmail({ email, message });

    return new Response(
      JSON.stringify({ message: 'Message sent successfully.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Contact endpoint error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};