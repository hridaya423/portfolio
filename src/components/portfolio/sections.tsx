import Image from "next/image";
import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { DATA } from "@/data/resume";
import { experience, projects } from "@/data/portfolio";
import { questionFont } from "./font";
import { ExperienceLightField } from "./experience-light-field";

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
              <p className={questionFont.className}>{project.question}</p>
              <svg viewBox="0 0 80 100" aria-hidden="true">
                <path d="M5 67C25 75 49 64 43 47C39 35 25 39 31 50C39 63 61 39 73 25" />
                <path d="M61 28Q67 26 73 25Q72 32 73 37" />
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
      <ExperienceLightField count={roles.length} />
      <header className="experience-heading">
        <h2 id="experience-heading">Experience</h2>
      </header>
      <div className="experience-stack">
        {roles.map((role, index) => (
          <article className="experience-entry" key={`${role.company}-${role.start}`}>
            <span className="experience-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="experience-company"><a href={role.href}>{role.company}</a></h3>
            <p className="experience-role">{role.title}</p>
            <span className="experience-date">{role.start}–{role.end ?? "Present"}</span>
            <p className="experience-summary">{role.summary}</p>
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
