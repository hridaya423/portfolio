import type { MetadataRoute } from "next";
import { DATA } from "@/data/resume";

// Search, answer-engine and training crawlers are all welcome. Naming them
// keeps the intent explicit if a CDN or firewall default ever changes.
const crawlers = [
  "Googlebot",
  "Bingbot",
  "Applebot",
  "DuckDuckBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  // The review routes are fixtures for visual checks. They stay crawlable
  // so that crawlers can read their noindex.
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...crawlers.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${DATA.url}/sitemap.xml`,
  };
}
