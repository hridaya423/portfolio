import type { Metadata } from "next";
import { events, credentials } from "@/data/portfolio";
import { latestUpdate } from "@/data/case-studies";
import { OpticalHero } from "@/components/optical-hero/hero";
import {
  Projects,
  Experience,
  About,
  Footer,
} from "@/components/portfolio/sections";
import { Events } from "@/components/portfolio/events";
import { Certifications } from "@/components/portfolio/certifications";
import { SiteHeader } from "@/components/portfolio/site-header";
import { Choreography } from "@/components/portfolio/choreography";
import { monoFont, portfolioFont, questionFont } from "@/components/portfolio/font";
import "@/components/portfolio/portfolio.css";
import { feedAlternate, isoDateTime, jsonLd, personNode, websiteNode, PERSON_ID, SITE_TITLE, SITE_URL, WEBSITE_ID } from "@/lib/structured-data";

export const metadata: Metadata = { alternates: { canonical: "/", types: feedAlternate } };

const profile = jsonLd([
  {
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/#profile`,
    url: SITE_URL,
    name: SITE_TITLE,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": PERSON_ID },
    dateModified: isoDateTime(latestUpdate()),
  },
  personNode(),
  websiteNode(),
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: profile }} />
      <a className="skip-link" href="#projects">
        Skip to work
      </a>
      <main
        className={`portfolio-home ${portfolioFont.variable} ${monoFont.variable} ${questionFont.variable}`}
      >
        <SiteHeader />
        <OpticalHero />
        <Projects />
        <Experience />
        <Events entries={events} />
        <Certifications entries={credentials} />
        <About />
        <Footer />
      </main>
      <Choreography />
    </>
  );
}
