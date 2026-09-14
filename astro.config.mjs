import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://yourname.com',
  integrations: [sitemap(), mdx()],

  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro', // Match your dark glass theme
      wrap: false,
    },
  },
  adapter: cloudflare(),
  vite: {
    optimizeDeps: {
      exclude: ['@resvg/resvg-js'],
    },
  },
});