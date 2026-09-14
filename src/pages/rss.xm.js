import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');
  const publishedPosts = posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'Habin | Engineering Journal',
    description: 'Thoughts on software development, infrastructure, and web technologies.',
    site: context.site || 'https://yourname.com',
    items: publishedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      // Generates link matching your blog route structure
      link: `/blog/${post.slug ?? post.id.replace(/\.[^/.]+$/, '')}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}