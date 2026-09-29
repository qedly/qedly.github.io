/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

// getViteConfig lets Vitest compile .astro components, so they can be rendered in tests.
export default getViteConfig({
  test: { include: ["tests/**/*.test.ts"] },
});
