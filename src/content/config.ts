import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    domain: z.enum([
      'Platform & Infrastructure',
      'Quality & Automation',
      'Engineering Leadership',
      'Distributed Systems',
      'Developer Experience',
    ]),
    featured: z.boolean().default(false),
    technologies: z.array(z.string()),
    metrics: z.array(
      z.union([
        z.string(),
        z.object({
          value: z.string(),
          label: z.string(),
          description: z.string(),
        }),
      ])
    ).optional(),
    period: z.string().optional(),
    role: z.string().optional(),
  }),
});

export const collections = { projects };