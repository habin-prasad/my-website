import { defineCollection, z } from 'astro:content';

const projectCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    domain: z.enum([
      'API & Microservices',
      'Security & Auth',
      'Automation & CI/CD',
      'Performance Optimization',
      'Cloud Architecture',
    ]),
    featured: z.boolean().default(false),
    technologies: z.array(z.string()), // Maps directly to Tech Stack tile
    metrics: z.array(
      z.object({
        value: z.string(),       // e.g., "-400ms", "99.99%", "10x"
        label: z.string(),       // e.g., "Latency Reduction", "Uptime", "Deployment Speed"
        description: z.string(), // e.g., "p99 API response time via edge caching"
      })
    ).optional(),
    period: z.string().optional(),
    role: z.string().optional(),
  }),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    tags: z.array(z.string()), // Keywords used for command palette & filtering
    projectId: z.string().optional(), // Link directly to a related project ID
  }),
});

// New ATS Document Collections
const resumeCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    pdfFilename: z.string().optional(),
    lastUpdated: z.string().optional(),
  }),
});

const coverLetterCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    pdfFilename: z.string().optional(),
  }),
});

export const collections = {
  projects: projectCollection,
  blog: blogCollection,
  resume: resumeCollection,      
  coverLetter: coverLetterCollection,
};