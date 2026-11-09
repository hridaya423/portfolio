import type { Metadata } from "next";
import { DATA } from "@/data/resume";
import { projectIndex } from "@/data/portfolio";
import { caseStudySlugs } from "@/data/case-studies";
import { Footer } from "@/components/portfolio/footer";
import { ProjectIndex } from "@/components/portfolio/project-index";
import { monoFont, portfolioFont } from "@/components/portfolio/font";
import { caseStudyUrl, feedAlternate, jsonLd, PERSON_ID, SITE_IMAGE, SITE_URL, WEBSITE_ID } from "@/lib/structured-data";
import "@/components/portfolio/portfolio.css";

const title = `Projects | ${DATA.name}`;
const description = `Every project ${DATA.name} has built: macOS apps, developer tools, machine learning experiments, games and hackathon winners, each with a write-up.`;

export const metadata: Metadata = {
  title: "Projects",
  description,
  alternates: { canonical: "/projects", types: feedAlternate },
  openGraph: {
    type: "website",
    url: "/projects",
    title,
    description,
    siteName: DATA.name,
    locale: "en_GB",
    images: [SITE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@AgrawalHridaya",
    images: [SITE_IMAGE.url],
  },
};

export default function ProjectsPage() {
  const studies = new Set(caseStudySlugs());
  const graph = jsonLd([
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/projects#page`,
      url: `${SITE_URL}/projects`,
      name: `Projects by ${DATA.name}`,
      isPartOf: { "@id": WEBSITE_ID },
      author: { "@id": PERSON_ID },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: projectIndex.map((entry, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: entry.title,
          url: studies.has(entry.id) ? caseStudyUrl(entry.id) : (entry.href ?? entry.repo),
        })),
      },
    },
  ]);
  return (
    <main className={`portfolio-home ${portfolioFont.variable} ${monoFont.variable}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: graph }} />
      <ProjectIndex />
      <Footer />
    </main>
  );
}
