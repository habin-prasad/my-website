import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initializes Redis client using environment variables
const redis = Redis.fromEnv();

// Allow 3 requests per 1-minute sliding window per IP
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/contact-form',
});