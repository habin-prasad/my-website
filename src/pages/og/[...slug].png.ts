import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIContext } from 'astro';

export const prerender = true;

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts
    .filter((post) => !post.data.draft)
    .map((post) => {
      const postSlug = (post as any).slug ?? post.id.replace(/\.[^/.]+$/, '');
      return {
        params: { slug: postSlug },
        props: { post },
      };
    });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateSvg(title: string): string {
  const safeTitle = escapeXml(title);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0f172a"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#38bdf8" font-size="60" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">${safeTitle}</text>
</svg>`;
}

export async function GET(context: APIContext) {
  const post = context.props.post as CollectionEntry<'blog'>;
  const title = post?.data?.title ?? 'Engineering Article';

  const svg = generateSvg(title);

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}