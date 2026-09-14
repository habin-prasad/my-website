import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yourname.com',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark', // Sets dark background and syntax token colors
    },
  },
});   