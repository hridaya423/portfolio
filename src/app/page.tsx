import { events, credentials } from "@/data/portfolio";
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

export default function Page() {
  return (
    <>
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
