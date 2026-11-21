import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/portfolio/footer";
import { IndexHeader } from "@/components/portfolio/index-header";
import { monoFont, portfolioFont, questionFont } from "@/components/portfolio/font";
import "@/components/portfolio/portfolio.css";
import "@/components/portfolio/case-study.css";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page doesn't exist. Try the projects index, the About page or head back home.",
  robots: { index: false, follow: true },
};

const links = [
  { label: "All projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Home", href: "/" },
];

export default function NotFound() {
  return (
    <main className={`portfolio-home ${portfolioFont.variable} ${monoFont.variable} ${questionFont.variable}`}>
      <IndexHeader label="404" />
      <article className="case shell missing" id="content">
        <header className="case-head">
          <p className={`case-question ${questionFont.className}`}>
            <span className="sr-only">What if </span>
            <span aria-hidden="true">…what if </span>
            this page existed?
          </p>
          <h1>This page doesn&rsquo;t exist.</h1>
          <p className="missing-lede">The link might be mistyped, or the page moved somewhere else.</p>
          <ul className="case-links">
            {links.map((link) => (
              <li key={link.href}>
                <Link className="text-link" href={link.href}>
                  {link.label}
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </header>
      </article>
      <Footer />
    </main>
  );
}
