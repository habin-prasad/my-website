import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm?module';
import { getCollection } from 'astro:content';

export const prerender = true;

// 1. Tell Astro which static OG PNG files to generate at build time
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  
  return posts
    .filter((post) => post.slug && post.slug.trim() !== '') // Ensure no undefined or empty slugs
    .map((post) => ({
      params: { slug: post.slug },
      props: { title: post.data.title },
    }));
}

let wasmInitialized = false;

async function ensureWasm() {
  if (!wasmInitialized) {
    try {
      // Pass the imported WASM module directly (supported natively by Cloudflare/Vite)
      await initWasm(resvgWasm);
      wasmInitialized = true;
    } catch (e) {
      // Avoid re-initialization error during hot reloads
    }
  }
}



export async function GET({ props }: { props: { title: string } }) {
  await ensureWasm();

  const svg = await satori(
    {
      type: 'div',
      props: {
        children: props.title || 'Engineering Article',
        style: {
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#0f172a',
          color: '#38bdf8',
          fontSize: 60,
          fontWeight: 'bold',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        },
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [], // Pass your loaded font buffers here
    }
  );

  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}