import type { MetadataRoute } from "next";
import { DATA } from "@/data/resume";
import { allCaseStudyMeta } from "@/data/case-studies";

export default function sitemap(): MetadataRoute.Sitemap {
  const studies = allCaseStudyMeta();
  const latest = studies.map((study) => study.updatedAt).sort().at(-1);
  return [
    { url: DATA.url, lastModified: latest, priority: 1 },
    { url: `${DATA.url}/projects`, lastModified: latest, priority: 0.9 },
    ...studies.map((study) => ({
      url: `${DATA.url}/projects/${study.slug}`,
      lastModified: study.updatedAt,
      priority: 0.8,
      images: study.image ? [`${DATA.url}${study.image}`] : undefined,
    })),
  ];
}
