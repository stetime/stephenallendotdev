// @ts-check
import { defineConfig, fontProviders } from 'astro/config'
import { SITE_URL } from './src/consts'

export default defineConfig({
  site: SITE_URL,
  markdown: {
    syntaxHighlight: false
  },
  fonts: [
    {
      name: "Inter",
      cssVariable: "--font-sans",
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      formats: ["woff2", "woff"],
      fallbacks: ["ui-sans-serif", "sans-serif"]
    },
    {
      name: "DM Serif Display",
      cssVariable: "--font-heading",
      provider: fontProviders.fontsource(),
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
      formats: ["woff2", "woff"],
      fallbacks: ["Georgia", "serif"]
    },
    {
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      provider: fontProviders.fontsource(),
      subsets: ["latin"],
      formats: ["woff2", "woff"],
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
