// src/lib/env.ts
function getEnvVariable(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `CRITICAL ERROR: Environment variable "${key}" is missing or undefined.`
    );
  }
  return value;
}

export const ENV = {
  TURNSTILE_SECRET_KEY: getEnvVariable('TURNSTILE_SECRET_KEY'),
  UPSTASH_URL: getEnvVariable('UPSTASH_REDIS_REST_URL'),
  UPSTASH_TOKEN: getEnvVariable('UPSTASH_REDIS_REST_TOKEN'),
};