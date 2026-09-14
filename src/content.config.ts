import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: ['**/*.md', '**/*.mdx'], base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: ['**/*.md', '**/*.mdx'], base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    period: z.string(),
    summary: z.string(),
    domain: z.enum([
      'Platform & Infrastructure',
      'Quality & Automation',
      'Engineering Leadership',
    ]),
    metrics: z.array(z.string()).optional(), // <-- Add .optional() here
    technologies: z.array(z.string()),
    featured: z.boolean().default(false),
    leadershipHighlights: z.array(z.string()).optional(),
  }),
});

export const collections = { blog, projects };