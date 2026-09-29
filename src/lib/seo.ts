import { absoluteUrl, SITE } from "../config/site";

export function robotsTxt(launched: boolean, sitemapUrl: string): string {
  return launched ? `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n` : "User-agent: *\nDisallow: /\n";
}

export function softwareApplicationLd(): object {
  return { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "QEDly Code", applicationCategory: "DeveloperApplication", operatingSystem: "AWS", url: absoluteUrl("/code"), license: SITE.licence };
}

export function faqLd(items: { q: string; a: string }[]): object {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };
}
