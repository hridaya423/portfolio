import type { MetadataRoute } from "next";
import { DATA } from "@/data/resume";

export default function robots(): MetadataRoute.Robots {
  return {
    // The review routes are section fixtures for visual checks, not pages.
    rules: { userAgent: "*", allow: "/", disallow: "/review/" },
    sitemap: `${DATA.url}/sitemap.xml`,
  };
}
