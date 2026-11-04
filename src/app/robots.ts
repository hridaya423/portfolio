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
  // The review routes are section fixtures for visual checks, not pages.
  const disallow = "/review/";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...crawlers.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${DATA.url}/sitemap.xml`,
  };
}
