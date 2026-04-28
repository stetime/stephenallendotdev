// @ts-check
import { defineConfig } from 'astro/config'
export default defineConfig({
  site: "https://stephenallen.dev",
  markdown: {
    shikiConfig: {
      theme: "vesper"
    }
  },
  server: {
    host: true,
    port: 3000,
    allowedHosts: [
      "localhost",
      "xnu"
    ]
  }
})
