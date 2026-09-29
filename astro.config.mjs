// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { SITE } from "./src/config/site.ts";

export default defineConfig({
  site: SITE.url,
  integrations: [
    starlight({
      title: SITE.name,
      description: "QEDly is where people and AI agents take work from a hunch to a proven result.",
      logo: {
        light: "./src/assets/brand/wordmark.svg",
        dark: "./src/assets/brand/wordmark-dark.svg",
        replacesTitle: true,
      },
      favicon: "/brand/favicon.svg",
      customCss: ["./src/styles/starlight.css"],
      social: [{ icon: "github", label: "GitHub", href: `https://github.com/${SITE.siteRepo}` }],
      head: [
        { tag: "meta", attrs: { property: "og:image", content: `${SITE.url}/brand/og.png` } },
        { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" } },
        ...(SITE.launched ? [] : [{ tag: "meta", attrs: { name: "robots", content: "noindex,nofollow" } }]),
      ],
      sidebar: [
        { label: "Start", items: [{ label: "Overview", slug: "docs" }] },
        { label: "QEDly Code", items: [{ autogenerate: { directory: "docs/agentx" } }] },
      ],
    }),
  ],
});
