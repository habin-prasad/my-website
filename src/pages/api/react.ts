import type { APIRoute } from 'astro';
import { queryDb } from '../../lib/db';
import { reactRateLimit } from '../../lib/r_limit';
export const prerender = false; // Edge serverless route

// Helper to extract real IP across Cloudflare & reverse proxies
function getClientIP(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    '127.0.0.1'
  );
}

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
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Database query failed' }), { status: 500 });
  }
};

// ---------------------------------------------------------------------------
// POST: Increment reaction count with Upstash Redis Rate Limiting & Atomic UPSERT
// ---------------------------------------------------------------------------
export const POST: APIRoute = async ({ request }) => {
  const clientIP = getClientIP(request);
  
  // Upstash sliding window rate limit
  const { success, limit, remaining, reset } = await reactRateLimit.limit(`react_${clientIP}`);
  
  const rateLimitHeaders = {
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
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
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

    // Atomic UPSERT + RETURNING clause (1 DB roundtrip over Turso HTTP pipeline)
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