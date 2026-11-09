import { DATA } from "@/data/resume";
import { events, projectIndex } from "@/data/portfolio";
import type { CaseStudyMeta } from "@/data/case-studies";

// The product subdomains reference PERSON_ID as their author; keep it stable.
export const SITE_URL = DATA.url;
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const SITE_TITLE = `${DATA.name}, AI engineer in London`;

export const SITE_IMAGE = {
  url: "/opengraph-image.png",
  width: 2400,
  height: 1260,
  alt: "Hridya Agrawal: I follow an idea until it works. A glass card reading 'what if?' stands in an aluminium tray with an orange LED that says HELLO.",
};

export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 };

export function questionFor(slug: string) {
  return projectIndex.find((entry) => entry.id === slug)?.question;
}

export function shareImage(meta: CaseStudyMeta) {
  const question = questionFor(meta.slug);
  return {
    url: `/projects/${meta.slug}/opengraph-image`,
    ...SHARE_IMAGE_SIZE,
    type: "image/png",
    alt: `${question ? `The handwritten question “what if ${question}” above the headline` : "The headline"} “${meta.headline}”, by ${DATA.name}.`,
  };
}

const social = DATA.contact.social;

export const sameAs = [social.GitHub.url, social.LinkedIn.url, social.X.url, "https://huggingface.co/hridya423"];

export const FEED = {
  url: "/feed.xml",
  type: "application/atom+xml",
  title: `${DATA.name}: project write-ups`,
};

export const feedAlternate = { [FEED.type]: [{ url: FEED.url, title: FEED.title }] };

function credentialNode({ issuer, name, link }: (typeof DATA.achievements)[number]) {
  return {
    "@type": "EducationalOccupationalCredential",
    name: name.startsWith(issuer) ? name : `${issuer} ${name}`,
    credentialCategory: "certificate",
    recognizedBy: { "@type": "Organization", name: issuer },
    url: link,
  };
}

export function personNode() {
  const awards = events
    .filter((event) => event.award)
    .map((event) => `${event.award}, ${event.title} (${event.date})`);
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: DATA.name,
    givenName: "Hridya",
    familyName: "Agrawal",
    alternateName: ["Hridaya Agrawal", "hridaya423", "AgrawalHridaya"],
    url: SITE_URL,
    image: `${SITE_URL}${DATA.avatarUrl}`,
    description: DATA.description,
    disambiguatingDescription: "AI engineer and software builder in London; author of Lexis, Foundry and Perry",
    jobTitle: "AI Engineer",
    worksFor: { "@type": "Organization", name: "Silver Suits AI", url: "https://www.silversuits.ai" },
    homeLocation: { "@type": "Place", name: DATA.location },
    knowsAbout: ["Software engineering", "macOS apps", "Developer tools", "Machine learning", "Game development"],
    award: awards,
    hasCredential: DATA.achievements.map(credentialNode),
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
    applicationCategory: meta.category ?? meta.kind,
    operatingSystem: meta.platform,
    url: meta.site ?? meta.repo ?? caseStudyUrl(meta.slug),
    ...(links.length ? { sameAs: links } : {}),
    ...(meta.image ? { image: `${SITE_URL}${meta.image}` } : {}),
    ...(meta.license ? { license: `https://spdx.org/licenses/${meta.license}.html` } : {}),
    datePublished: isoDateTime(meta.publishedAt),
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
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
