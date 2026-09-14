import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://my-website.habinprasad163.workers.dev/',
  integrations: [sitemap(), mdx()],

  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro', // Match your dark glass theme
      wrap: false,
    },
  },
  adapter: cloudflare(),

});