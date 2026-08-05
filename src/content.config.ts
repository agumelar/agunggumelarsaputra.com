import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const pembelajaran = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/pembelajaran" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(), // e.g. "Pemrograman Web", "Basis Data", "Algoritma", "OOP"
    level: z.enum(['Pemula', 'Menengah', 'Lanjutan']).default('Pemula'),
    order: z.number().default(1),
    duration: z.string().default('10 min'),
    tags: z.array(z.string()).default([]),
    teacherTip: z.string().optional(),
  }),
});

export const collections = { blog, pembelajaran };
