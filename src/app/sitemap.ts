import type { MetadataRoute } from "next";
import { DATA } from "@/data/resume";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: DATA.url, priority: 1 },
    { url: `${DATA.url}/projects`, priority: 0.8 },
  ];
}
