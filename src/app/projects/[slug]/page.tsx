import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { DATA } from "@/data/resume";
import { projectIndex } from "@/data/portfolio";
import { caseStudySlugs, getCaseStudy, getCaseStudyMeta } from "@/data/case-studies";
import { Footer } from "@/components/portfolio/sections";
import { IndexHeader } from "@/components/portfolio/project-index";
import { monoFont, portfolioFont, questionFont } from "@/components/portfolio/font";
import { caseStudyUrl, isoDateTime, jsonLd, PERSON_ID, personNode, SITE_URL, softwareNode, WEBSITE_ID } from "@/lib/structured-data";
import "@/components/portfolio/portfolio.css";
import "@/components/portfolio/case-study.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = getCaseStudyMeta(slug);
  if (!meta) return {};
  const url = `/projects/${slug}`;
  const images = meta.image ? [{ url: meta.image, alt: `${meta.title} interface` }] : undefined;
  return {
    title: { absolute: meta.headline },
    description: meta.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: meta.headline,
      description: meta.summary,
      siteName: DATA.name,
      publishedTime: meta.publishedAt,
      modifiedTime: meta.updatedAt,
      authors: [DATA.url],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.headline,
      description: meta.summary,
      creator: "@AgrawalHridaya",
      images: images?.map((image) => image.url),
    },
  };
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

function formatDate(date: string) {
  return dateFormat.format(new Date(`${date}T00:00:00Z`));
}

function nextStudy(slug: string) {
  const slugs = caseStudySlugs();
  const order = projectIndex.map((entry) => entry.id).filter((id) => slugs.includes(id));
  const at = order.indexOf(slug);
  return at === -1 ? null : getCaseStudyMeta(order[(at + 1) % order.length]);
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) notFound();
  const url = caseStudyUrl(slug);
  const next = nextStudy(slug);
  const question = projectIndex.find((entry) => entry.id === slug)?.question;

  const graph = jsonLd([
    {
      "@type": "TechArticle",
      "@id": `${url}#article`,
      url,
      headline: study.headline,
      description: study.summary,
      datePublished: isoDateTime(study.publishedAt),
      dateModified: isoDateTime(study.updatedAt),
      wordCount: study.words,
      inLanguage: "en-GB",
      ...(study.image ? { image: `${SITE_URL}${study.image}` } : {}),
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": `${url}#software` },
      mainEntityOfPage: url,
    },
    softwareNode(study),
    personNode(),
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: DATA.name, item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/projects` },
        { "@type": "ListItem", position: 3, name: study.title, item: url },
      ],
    },
  ]);

  const links = [
    study.site && { label: "Open site", href: study.site },
    study.repo && { label: "Source on GitHub", href: study.repo },
  ].filter((link): link is { label: string; href: string } => Boolean(link));

  return (
    <main className={`portfolio-home ${portfolioFont.variable} ${monoFont.variable} ${questionFont.variable}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: graph }} />
      <IndexHeader label={study.title.toUpperCase().slice(0, 10)} />
      <article className="case shell">
        <header className="case-head">
          {question && (
            <p className={`case-question ${questionFont.className}`}>
              <span className="sr-only">What if </span>
              <span aria-hidden="true">…what if </span>
              {question}
            </p>
          )}
          <h1>{study.headline}</h1>
          <dl className="case-facts">
            <div>
              <dt>Runs on</dt>
              <dd>{study.platform}</dd>
            </div>
            <div>
              <dt>First released</dt>
              <dd>
                <time dateTime={study.publishedAt}>{formatDate(study.publishedAt)}</time>
              </dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>
                <time dateTime={study.updatedAt}>{formatDate(study.updatedAt)}</time>
              </dd>
            </div>
            {study.award && (
              <div>
                <dt>Award</dt>
                <dd>{study.award}</dd>
              </div>
            )}
          </dl>
          {links.length > 0 && (
            <ul className="case-links">
              {links.map((link) => (
                <li key={link.href}>
                  <a className="text-link" href={link.href}>
                    {link.label}
                    <ArrowUpRight aria-hidden="true" size={16} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </header>
        <div className="case-layout">
          {study.headings.length > 2 && (
            <nav aria-label="On this page" className="case-toc">
              <p>On this page</p>
              <ol>
                {study.headings.map((heading) => (
                  <li key={heading.id}>
                    <a href={`#${heading.id}`}>{heading.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="case-body" dangerouslySetInnerHTML={{ __html: study.html }} />
        </div>
        <footer className="case-end">
          <Link className="text-link" href="/projects">
            All projects
          </Link>
          {next && next.slug !== slug && (
            <Link className="case-next" href={`/projects/${next.slug}`}>
              <span>Next</span>
              {next.title}
            </Link>
          )}
        </footer>
      </article>
      <Footer />
    </main>
  );
}
