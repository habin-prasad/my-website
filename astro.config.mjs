import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

import cloudflare from '@astrojs/cloudflare';
import { defineConfig, envField } from 'astro/config'; // <-- Ensure envField is imported here

export default defineConfig({
  site: 'https://my-website.habinprasad163.workers.dev/',
  integrations: [sitemap(), mdx()],
  output: 'server',
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro', // Match your dark glass theme
      wrap: false,
    },
  },
  adapter: cloudflare(),
  vite: {
    optimizeDeps: {
      exclude: ['@resvg/resvg-wasm'],
    },
  },
  env: {
    schema: {
      // Server-only secrets
      TURNSTILE_SECRET_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true, // Allows build to pass without key
      }),
      UPSTASH_REDIS_REST_URL: envField.string({
        context: 'server',
        access: 'secret',
      }),
      UPSTASH_REDIS_REST_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
      // Client-exposed variables
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({
        context: 'client',
        access: 'public',
        optional: true, // Allows build to pass without key
        
      }),
    },},
});

