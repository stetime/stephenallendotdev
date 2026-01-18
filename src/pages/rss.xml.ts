import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import { getCollection } from "astro:content"

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error("site is required in astro.config.ts for RSS generation")
  }

  const posts = await getCollection("posts")

  return rss({
    title: "test",
    description: "test",
    site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.pubDate),
      description: post.data.excerpt,
      link: `/posts/${post.id}/`,
    })),
  })
}
