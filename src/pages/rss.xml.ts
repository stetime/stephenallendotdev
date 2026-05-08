import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import { getCollection } from "astro:content"
import sanitizeHtml from "sanitize-html"
import MarkdownIt from "markdown-it"

const parser = new MarkdownIt()

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error("site is required in astro.config.ts for RSS generation")
  }

  const posts = (await getCollection("posts")).sort((a, b) => (b.data.pubDate > a.data.pubDate ? 1 : -1))

  return rss({
    title: "Stephen Allen",
    description: "Web developer, tinkerer and self hoster from Manchester, UK.",
    site,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.pubDate),
      description: post.data.excerpt,
      link: `/posts/${post.id}`,
      content: post.body && sanitizeHtml(parser.render(post.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      }),
    })),
  })
}
