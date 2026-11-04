import type { APIRoute } from 'astro';
import { queryDb } from '../../lib/db';
import { reactRateLimit } from '../../lib/r_limit';

export const prerender = false;

function getClientIP(request: Request, clientAddress?: string): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    clientAddress ||
    '127.0.0.1'
  );
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Missing slug parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const rows = await queryDb<{ count: number }>({
      sql: 'SELECT count FROM post_reactions WHERE slug = ?',
      args: [slug],
    });

    const count = rows[0]?.count ?? 0;

    return new Response(JSON.stringify({ slug, count }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Database query failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const clientIP = getClientIP(request, clientAddress);

  let success = true;
  let limit = 10;
  let remaining = 10;
  let reset = Date.now() + 10_000;
  try {
    const r = await reactRateLimit.limit(`react_${clientIP}`);
    success = r.success;
    limit = r.limit;
    remaining = r.remaining;
    reset = r.reset;
  } catch (e) {
    console.error('Rate limiter failed, allowing request', e);
  }

  const rateLimitHeaders = {
    'Content-Type': 'application/json',
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };

  if (!success) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment.' }),
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          ...rateLimitHeaders,
        },
      }
    );
  }

  try {
    const body = await request.json();
    const slug = body.slug;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing target slug' }), {
        status: 400,
        headers: rateLimitHeaders,
      });
    }

    const rows = await queryDb<{ count: number }>({
      sql: `
        INSERT INTO post_reactions (slug, count)
        VALUES (?, 1)
        ON CONFLICT(slug) DO UPDATE SET count = count + 1
        RETURNING count
      `,
      args: [slug],
    });

    const newCount = rows[0]?.count ?? 1;

    return new Response(
      JSON.stringify({ slug, count: newCount }),
      {
        status: 200,
        headers: rateLimitHeaders,
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to update reaction' }), {
      status: 500,
      headers: rateLimitHeaders,
    });
  }
};
