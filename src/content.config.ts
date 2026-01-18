import { glob } from "astro/loaders"
import { defineCollection } from "astro:content"
import { z } from "astro/zod"

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/posts" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.string(),
    excerpt: z.string(),
  }),
})

const projects = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/projects" }),
  schema: z.object({
    title: z.string(),
    tech: z.array(z.string()),
  }),
})

export const collections = { posts, projects }
