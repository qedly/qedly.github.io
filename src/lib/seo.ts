export function robotsTxt(launched: boolean, sitemapUrl: string): string {
  return launched ? `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n` : "User-agent: *\nDisallow: /\n";
}
