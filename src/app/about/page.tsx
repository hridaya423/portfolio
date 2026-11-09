import type { Metadata } from "next";
import { DATA } from "@/data/resume";
import { getAbout, getAboutMeta } from "@/lib/about";
import { Footer } from "@/components/portfolio/footer";
import { IndexHeader } from "@/components/portfolio/project-index";
import { monoFont, portfolioFont } from "@/components/portfolio/font";
import { feedAlternate, isoDateTime, jsonLd, PERSON_ID, personNode, SITE_IMAGE, SITE_URL, WEBSITE_ID } from "@/lib/structured-data";
import "@/components/portfolio/portfolio.css";
import "@/components/portfolio/case-study.css";

const title = `About | ${DATA.name}`;
const { description } = getAboutMeta();

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: { canonical: "/about", types: feedAlternate },
  openGraph: {
    type: "website",
    url: "/about",
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

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function AboutPage() {
  const about = await getAbout();
  const url = `${SITE_URL}/about`;
  const graph = jsonLd([
    {
      "@type": "AboutPage",
      "@id": `${url}#page`,
      url,
      name: about.title,
      description: about.description,
      dateModified: isoDateTime(about.updatedAt),
      inLanguage: "en-GB",
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": PERSON_ID },
    },
    personNode(),
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: DATA.name, item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "About", item: url },
      ],
    },
  ]);

  return (
    <main className={`portfolio-home ${portfolioFont.variable} ${monoFont.variable}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: graph }} />
      <IndexHeader label="ABOUT" />
      <article className="case shell" id="content">
        <header className="case-head">
          <h1>{about.title}</h1>
          <dl className="case-facts">
            <div>
              <dt>Updated</dt>
              <dd>
                <time dateTime={about.updatedAt}>{dateFormat.format(new Date(`${about.updatedAt}T00:00:00Z`))}</time>
              </dd>
            </div>
          </dl>
        </header>
        <div className="case-layout">
          {about.headings.length > 2 && (
            <nav aria-label="On this page" className="case-toc">
              <p>On this page</p>
              <ol>
                {about.headings.map((heading) => (
                  <li key={heading.id}>
                    <a href={`#${heading.id}`}>{heading.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="case-body" dangerouslySetInnerHTML={{ __html: about.html }} />
        </div>
      </article>
      <Footer />
    </main>
  );
}
