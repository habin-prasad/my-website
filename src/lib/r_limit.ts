import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from 'astro:env/server';

const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

/**
 * High-throughput sliding window for interactive article claps/reactions:
 * Allows up to 10 requests per 10-second window.
 */
export const reactRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit/react',
});

/**
 * Strict sliding window for contact form submissions:
 * Allows up to 3 requests per 1-minute window to stop spam.
 */
export const contactRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/contact',
});

// Default export alias for backward compatibility
export const ratelimit = contactRateLimit;