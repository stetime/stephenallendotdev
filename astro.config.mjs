// @ts-check
import { defineConfig, fontProviders } from 'astro/config'
export default defineConfig({
  site: "https://stephenallen.dev",
  markdown: {
    shikiConfig: {
      theme: "github-dark"
    }
  },
  fonts: [
    {
      name: "Inter",
      cssVariable: "--font-sans",
      provider: fontProviders.fontsource(),
      weights: [400, 600],
      styles: ["normal"],
      formats: ["woff2", "woff"],
      fallbacks: ["ui-sans-serif", "sans-serif"]
    },
    {
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      provider: fontProviders.fontsource(),
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"]
    }
  ],
  server: {
    host: true,
    port: 3000,
    allowedHosts: [
      "localhost",
      "xnu"
    ]
  }
})
