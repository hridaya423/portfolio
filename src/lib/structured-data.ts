import { DATA } from "@/data/resume";
import { events } from "@/data/portfolio";
import type { CaseStudyMeta } from "@/data/case-studies";

// The product subdomains reference PERSON_ID as their author; keep it stable.
export const SITE_URL = DATA.url;
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const social = DATA.contact.social;

export const sameAs = [social.GitHub.url, social.LinkedIn.url, social.X.url];

export function personNode() {
  const awards = events
    .filter((event) => event.award)
    .map((event) => `${event.award}, ${event.title} (${event.date})`);
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: DATA.name,
    alternateName: ["Hridaya Agrawal", "hridaya423", "AgrawalHridaya"],
    url: SITE_URL,
    image: `${SITE_URL}${DATA.avatarUrl}`,
    description: DATA.description,
    jobTitle: "AI Engineer",
    worksFor: { "@type": "Organization", name: "Silver Suits AI", url: "https://www.silversuits.ai" },
    homeLocation: { "@type": "Place", name: DATA.location },
    knowsAbout: ["Software engineering", "macOS apps", "Developer tools", "Machine learning", "Game development"],
    award: awards,
    sameAs,
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: DATA.name,
    publisher: { "@id": PERSON_ID },
    inLanguage: "en-GB",
  };
}

export function caseStudyUrl(slug: string) {
  return `${SITE_URL}/projects/${slug}`;
}

export function softwareNode(meta: CaseStudyMeta) {
  const links = [meta.site, meta.repo].filter(Boolean);
  return {
    "@type": "SoftwareApplication",
    "@id": `${caseStudyUrl(meta.slug)}#software`,
    name: meta.title,
    description: meta.summary,
    applicationCategory: meta.kind,
    operatingSystem: meta.platform,
    url: meta.site ?? meta.repo ?? caseStudyUrl(meta.slug),
    ...(links.length ? { sameAs: links } : {}),
    author: { "@id": PERSON_ID },
  };
}

// Google's rich results want a full ISO 8601 datetime with a timezone,
// so a date-only "2026-11-04" becomes midnight UTC on that day.
export function isoDateTime(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00+00:00` : date;
}

// JSON.stringify does not escape "<", so a string containing "</script>"
// could close the tag. Escape it, as the Next.js JSON-LD guide recommends.
export function jsonLd(graph: object[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}
