import type { APIRoute } from 'astro';
import { queryDb } from '../../lib/db';
import { rateLimit, getClientIP } from '../../lib/rateLimit';

export const prerender = false; // Edge serverless route

// ---------------------------------------------------------------------------
// GET: Fetch reaction count with Edge/Browser Caching
// ---------------------------------------------------------------------------
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
        // Cache on Edge CDN for 60s, serve stale up to 5 mins while revalidating
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Database query failed' }), { status: 500 });
  }
};

// ---------------------------------------------------------------------------
// POST: Increment reaction count using Atomic RETURNING (1 DB roundtrip)
// ---------------------------------------------------------------------------
export const POST: APIRoute = async ({ request }) => {
  const clientIP = getClientIP(request);

  // Rate Limiting: Max 5 claps per 60s per IP
  const limiter = rateLimit(clientIP, {
    windowMs: 60 * 1000,
    maxRequests: 5,
  });

  const rateLimitHeaders = {
    'X-RateLimit-Limit': limiter.limit.toString(),
    'X-RateLimit-Remaining': limiter.remaining.toString(),
    'X-RateLimit-Reset': limiter.resetInSeconds.toString(),
  };

  if (!limiter.success) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please wait a minute.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': limiter.resetInSeconds.toString(),
          ...rateLimitHeaders,
        },
      }
    );
  }

  try {
    const { slug } = await request.json();

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing slug' }), {
        status: 400,
        headers: rateLimitHeaders,
      });
    }

    // Atomic UPSERT + RETURNING clause (Eliminates separate SELECT query)
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
        headers: {
          'Content-Type': 'application/json',
          ...rateLimitHeaders,
        },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to update reaction' }), {
      status: 500,
      headers: rateLimitHeaders,
    });
  }
};