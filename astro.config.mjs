import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from "@tailwindcss/vite";
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://habin.gatedqass.in/',
  integrations: [sitemap(), mdx()],
  output: 'server',
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',
      wrap: false,
    },
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      configPath: './wrangler.jsonc',
    },
  }),
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      TURNSTILE_SECRET_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      UPSTASH_REDIS_REST_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      UPSTASH_REDIS_REST_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
    },
  },
});