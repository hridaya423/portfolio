import type { MetadataRoute } from "next";
import { DATA } from "@/data/resume";
import { allCaseStudyMeta, latestUpdate } from "@/data/case-studies";
import { getAboutMeta } from "@/lib/about";

export default function sitemap(): MetadataRoute.Sitemap {
  const studies = allCaseStudyMeta();
  const latest = latestUpdate();
  return [
    { url: DATA.url, lastModified: latest, priority: 1 },
    { url: `${DATA.url}/projects`, lastModified: latest, priority: 0.9 },
    { url: `${DATA.url}/about`, lastModified: getAboutMeta().updatedAt, priority: 0.9 },
    ...studies.map((study) => ({
      url: `${DATA.url}/projects/${study.slug}`,
      lastModified: study.updatedAt,
      priority: 0.8,
      images: study.image ? [`${DATA.url}${study.image}`] : undefined,
    })),
  ];
}
