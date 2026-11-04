import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from 'astro:env/server';

type LimitResult = { success: boolean; limit: number; remaining: number; reset: number };

const noopLimiter = {
  limit: async (): Promise<LimitResult> => ({
    success: true,
    limit: 10,
    remaining: 10,
    reset: Date.now() + 10_000,
  }),
};

let reactRateLimit: { limit: (id: string) => Promise<LimitResult> };
let contactRateLimit: { limit: (id: string) => Promise<LimitResult> };

if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  });
  reactRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit/react',
  });
  contactRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/contact',
  });
} else {
  reactRateLimit = noopLimiter;
  contactRateLimit = noopLimiter;
}

export { reactRateLimit, contactRateLimit };

// Default export alias for backward compatibility
export const ratelimit = contactRateLimit;
