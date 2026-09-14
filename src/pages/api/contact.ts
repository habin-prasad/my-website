import type { APIRoute } from 'astro';
import { ratelimit } from '../../lib/r_limit';

import { TURNSTILE_SECRET_KEY, UPSTASH_REDIS_REST_URL } from 'astro:env/server';
export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // 1. Resolve client IP address
  const identifier =
    clientAddress ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    '127.0.0.1';

  // 2. Check rate limit
  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

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
    const data = await request.json();

    // 3. Complete Turnstile verification & email dispatch...
    
    return new Response(
      JSON.stringify({ message: 'Message sent successfully.' }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500 }
    );
  }
};