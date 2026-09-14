import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export const prerender = true; // Renders PNGs at build time (no runtime serverless/WASM overhead)

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  
  return posts
    .filter(p => !p.data.draft)
    .map(post => ({
      params: { slug: post.slug ?? post.id.replace(/\.[^/.]+$/, "") },
      props: { 
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      },
    }));
}

export const GET: APIRoute = async ({ props }) => {
  const { title, description, pubDate } = props as { title: string; description: string; pubDate: string };

  // 1. Load a font (Satori requires TTF/WOFF font buffer for layout calculations)
  const fontData = await fetch(
    'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff'
  ).then((res) => res.arrayBuffer());

  // 2. Convert JSX/HTML structure into an SVG string via Satori
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0b0f19',
          backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(56, 189, 248, 0.25), transparent 70%)',
          padding: '60px',
          color: '#f3f4f6',
          fontFamily: 'Inter',
        },
        children: [
          // Header Badge
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '28px', fontWeight: 700, color: '#ffffff' },
                    children: 'habin.dev',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '18px',
                      color: '#38bdf8',
                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                      padding: '6px 16px',
                      borderRadius: '999px',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    },
                    children: pubDate,
                  },
                },
              ],
            },
          },
          // Content Title
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '16px' },
              children: [
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontSize: '56px',
                      fontWeight: 800,
                      color: '#ffffff',
                      lineHeight: 1.15,
                      margin: 0,
                    },
                    children: title,
                  },
                },
                {
                  type: 'p',
                  props: {
                    style: { fontSize: '24px', color: '#94a3b8', margin: 0, lineHeight: 1.5 },
                    children: description,
                  },
                },
              ],
            },
          },
          // Footer
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '24px',
                fontSize: '20px',
                color: '#94a3b8',
              },
              children: [
                { type: 'span', props: { children: 'Engineering Journal' } },
                { type: 'span', props: { style: { color: '#38bdf8' }, children: 'habin.dev/blog' } },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );

  // 3. Render SVG to PNG Buffer via Resvg
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const imageBuffer = resvg.render().asPng();

  return new Response(imageBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};