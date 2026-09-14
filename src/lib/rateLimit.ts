interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds (e.g., 60,000 for 1 minute)
  maxRequests: number; // Max allowed requests per window
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

// In-memory store persistent across requests within a warm Cloudflare Worker instance
const ipStore = new Map<string, RequestRecord>();

export function rateLimit(ip: string, config: RateLimitConfig): {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
} {
  const now = Date.now();
  const record = ipStore.get(ip);

  // Lazy Cleanup: Prune expired entries when store grows to avoid memory leaks
  if (ipStore.size > 500) {
    for (const [key, value] of ipStore.entries()) {
      if (now > value.resetTime) {
        ipStore.delete(key);
      }
    }
  }

  // Case 1: IP not seen yet or previous window expired
  if (!record || now > record.resetTime) {
    const resetTime = now + config.windowMs;
    ipStore.set(ip, { count: 1, resetTime });

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetInSeconds: Math.ceil(config.windowMs / 1000),
    };
  }

  // Case 2: Limit reached
  if (record.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  // Case 3: Valid request within window
  record.count += 1;
  const remaining = config.maxRequests - record.count;
  const resetInSeconds = Math.ceil((record.resetTime - now) / 1000);

  return {
    success: true,
    limit: config.maxRequests,
    remaining,
    resetInSeconds,
  };
}

/**
 * Vendor-agnostic IP extraction across major edge hosts (Cloudflare, Vercel, Netlify, AWS)
 */
export function getClientIP(request: Request): string {
  // Check common provider IP headers in order of priority
  const cfIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  const xForwardedFor = request.headers.get('x-forwarded-for'); // Vercel, Netlify, AWS, standard proxies
  const xRealIP = request.headers.get('x-real-ip'); // Nginx / Custom Reverse Proxies

  if (cfIP) return cfIP.trim();
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim(); // First entry in chain is origin client IP
  if (xRealIP) return xRealIP.trim();

  return '127.0.0.1'; // Fallback for local development
}