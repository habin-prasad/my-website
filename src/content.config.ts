import { defineCollection} from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
    projectId: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    domain: z.enum([
      "Platform & Infrastructure",
      "Quality & Automation",
      "Engineering Leadership",
      "Distributed Systems",
      "Developer Experience"
    ]),
    role: z.string().optional(),
    period: z.string().optional(),
    technologies: z.array(z.string()),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    metrics: z.array(
      z.union([
        z.string(),
        z.object({
          value: z.string(),
          label: z.string(),
          description: z.string()
        })
      ])
    ).optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { blog, projects, pages };