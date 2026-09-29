import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  const publishedPosts = posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const siteUrl = context.site?.toString() || 'https://habin.gatedqass.in/';

  return rss({
    title: 'Habin | Engineering Journal',
    description: 'Thoughts on software quality engineering, architecture briefs, and system reliability.',
    site: siteUrl,
    items: publishedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id.replace(/\.[^/.]+$/, '')}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}