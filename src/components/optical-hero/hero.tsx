import { portfolioFont } from "@/components/portfolio/font";
import { DATA } from "@/data/resume";
import { IdeaEffect } from "./idea-effect";
import { Tray } from "./tray";
import "./hero.css";

export function OpticalHero() {
  return (
    <section
      id="hero"
      className={`optical-hero ${portfolioFont.variable}`}
      aria-labelledby="hero-heading"
    >
      {["base", "lip"].map((layer) => (
        <link
          key={`desktop-${layer}`}
          rel="preload"
          as="image"
          href={`/optical-tray/desktop-light-${layer}.webp`}
          media="(min-width: 768px)"
          fetchPriority="high"
        />
      ))}
      {["base", "lip"].map((layer) => (
        <link
          key={`mobile-${layer}`}
          rel="preload"
          as="image"
          href={`/optical-tray/mobile-light-${layer}.webp`}
          media="(width < 768px)"
          fetchPriority="high"
        />
      ))}
      <header className="optical-header">
        <a className="optical-name" href="#hero">
          {DATA.name}
        </a>
        <nav aria-label="Main navigation">
          <a className="desktop-link" href="#projects">
            Work
          </a>
          <a className="desktop-link" href="#about">
            About
          </a>
          <a href={DATA.contact.social.email.url}>Email</a>
        </nav>
      </header>
      <div className="hero-copy">
        <h1 id="hero-heading">
          I follow an <IdeaEffect />
          <br />
          until it works.
        </h1>
        <p>Software, games, and a few things in between.</p>
        <a className="explore-work" href="#projects">
          Explore my work
        </a>
      </div>
      <Tray />
    </section>
  );
}
