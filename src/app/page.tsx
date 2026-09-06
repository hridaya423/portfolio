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
import { portfolioFont } from "@/components/portfolio/font";
import "@/components/portfolio/portfolio.css";

export default function Page() {
  return (
    <main className={`portfolio-home ${portfolioFont.variable}`}>
      <OpticalHero />
      <Projects />
      <Experience />
      <Events entries={events} />
      <Certifications entries={credentials} />
      <About />
      <Footer />
    </main>
  );
}
