import Image from "next/image";
import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { DATA } from "@/data/resume";
import { experience, projects } from "@/data/portfolio";

export function Projects() {
  return (
    <section id="projects" className="projects-section" aria-label="Projects">
      <h2 className="projects-heading">
        <span className="sr-only">What if?</span>
        <Image src="/what-if.svg" alt="" width={407} height={105} aria-hidden="true" />
      </h2>
      <div className="project-grid">
        {projects.map((project, index) => (
          <article
            className={`project-entry ${index % 2 ? "right-note" : "left-note"}`}
            key={project.id}
          >
            <div className="project-visual">
            <div className="project-question">
              <p>{project.question}</p>
              <svg viewBox="0 0 80 100" aria-hidden="true">
                <path d="M0 50H14Q26 50 26 38V24Q26 12 38 12H78" />
                <path d="M72 7L78 12L72 17" />
              </svg>
            </div>
            <a
              href={project.href}
              className="project-preview"
              aria-label={`Open ${project.title}`}
            >
              <Image
                src={project.image}
                alt={project.alt}
                width={project.previewWidth}
                height={project.previewHeight}
                sizes="(min-width: 1200px) 36vw, (min-width: 768px) 48vw, 100vw"
              />
            </a>
              {project.repo && <a href={project.repo} className="source-link" aria-label={`${project.title} on GitHub`}><GitHubLogoIcon width={20} height={20} /></a>}
            </div>
            <h3>{project.title}</h3>
            <div className="project-links">
              <a href={project.href}>Open project</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Experience({
  roles = experience,
}: {
  roles?: typeof experience;
}) {
  return (
    <section
      id="work"
      className="experience-section section-width"
      aria-labelledby="experience-heading"
    >
      <header className="experience-heading">
        <h2 id="experience-heading">Experience</h2>
        <Image src="/along-the-way.svg" alt="Along the way" width={150} height={23} />
      </header>
      <div className="experience-stack">
        {roles.map((role) => (
          <article className="experience-paper" key={`${role.company}-${role.start}`}>
            <picture className="experience-stock">
              <source media="(width < 768px)" srcSet="/materials/experience-mobile.webp" />
              <img src="/materials/experience-desktop.webp" alt="" width="1600" height="680" loading="lazy" />
            </picture>
            <header className="experience-card-heading">
              <h3 className="experience-company"><a href={role.href}>{role.company}</a></h3>
              <span className="experience-date">{role.start}–{role.end ?? "Present"}</span>
            </header>
            <p className="experience-role">{role.title}</p>
            <p className="experience-summary">{role.summary.split(/(mortgage calculator)/).map((part, index) => part === "mortgage calculator" ? <mark key={index}>{part}</mark> : part)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function About() {
  const GitHubIcon = DATA.contact.social.GitHub.icon;
  const EmailIcon = DATA.contact.social.email.icon;

  return (
    <section
      id="about"
      className="about-section section-width"
      aria-labelledby="about-heading"
    >
      <div className="about-identity">
        <h2 id="about-heading">About me</h2>
        <p>
          {DATA.name}
          <br />
          {DATA.location}
        </p>
      </div>
      <div className="about-note">
        <div className="about-copy">
          <p className="about-statement">
            Most of my free time
            <br className="desktop-break" /> goes into building.
          </p>
          <p className="about-description">
            Software and games, usually starting
            <br className="desktop-break" /> with a problem I’ve run {" "}
            into.
          </p>
        </div>
        <nav aria-label="About links" className="about-links">
          <a href="#projects">Back to the work</a>
          <a className="social-icon-link" href={DATA.contact.social.GitHub.url} aria-label="GitHub" title="GitHub">
            <GitHubIcon aria-hidden="true" width={19} height={19} />
          </a>
          <a className="social-icon-link" href={DATA.contact.social.email.url} aria-label="Email" title="Email">
            <EmailIcon aria-hidden="true" width={20} height={20} />
          </a>
        </nav>
      </div>
    </section>
  );
}

export function Footer() {
  const LinkedInIcon = DATA.contact.social.LinkedIn.icon;
  const XIcon = DATA.contact.social.X.icon;

  return (
    <footer className="portfolio-footer section-width">
      <a href="#hero">Hridya Agrawal</a>
      <nav aria-label="Social links">
        <a className="social-icon-link" href={DATA.contact.social.LinkedIn.url} aria-label="LinkedIn" title="LinkedIn">
          <LinkedInIcon aria-hidden="true" width={18} height={18} />
        </a>
        <a className="social-icon-link" href={DATA.contact.social.X.url} aria-label="X" title="X">
          <XIcon aria-hidden="true" width={18} height={18} />
        </a>
        <Link href="/blog">Blog</Link>
      </nav>
    </footer>
  );
}
