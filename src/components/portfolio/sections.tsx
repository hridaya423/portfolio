import Image from "next/image";
import type { ReactNode } from "react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ArrowUpRight } from "lucide-react";
import { Icons } from "@/components/icons";
import { DATA } from "@/data/resume";
import { experience, projects } from "@/data/portfolio";
import { questionFont } from "./font";
import { EmailLink } from "./email-link";
import { ExperienceLightField } from "./experience-light-field";
import { LcdChip } from "./lcd-chip";
import { LcdWall } from "./lcd-wall";
import { LondonClock } from "./london-clock";

export function SectionHead({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <header className="section-head">
      <h2 id={id} className="section-title" data-reveal="words">
        {children}
      </h2>
    </header>
  );
}

export function Projects() {
  return (
    <section
      id="projects"
      className="section projects-section"
      aria-labelledby="projects-heading"
      data-section-label="WORK"
    >
      <div className="shell">
        <header className="section-head">
          <h2 id="projects-heading" className="what-if-heading">
            <span className="sr-only">What if?</span>
            <Image
              src="/what-if.svg"
              alt=""
              width={407}
              height={105}
              aria-hidden="true"
              data-reveal="ink"
            />
          </h2>
        </header>
        <ol className="project-grid">
          {projects.map((project, index) => (
            <li className="project-card" key={project.id} data-lcd-host>
              <div className="project-media" data-reveal="media">
                <a
                  href={project.href}
                  className="project-frame"
                  aria-label={`Open ${project.title}`}
                >
                  <Image
                    src={project.image}
                    alt={project.alt}
                    width={project.previewWidth}
                    height={project.previewHeight}
                    sizes="(min-width: 1280px) 580px, (min-width: 860px) 46vw, 100vw"
                  />
                </a>
                {project.launch && (
                  <div className="launch-links">
                    <a
                      href={project.launch.x}
                      className="media-button"
                      aria-label={`${project.title} launch post on X`}
                    >
                      <Icons.x width={16} height={16} aria-hidden="true" />
                    </a>
                    <a
                      href={project.launch.linkedin}
                      className="media-button"
                      aria-label={`${project.title} launch post on LinkedIn`}
                    >
                      <Icons.linkedin width={17} height={17} aria-hidden="true" />
                    </a>
                  </div>
                )}
                {project.repo && (
                  <a
                    href={project.repo}
                    className="media-button source-link"
                    aria-label={`${project.title} on GitHub`}
                  >
                    <GitHubLogoIcon width={20} height={20} />
                  </a>
                )}
              </div>
              <div className="project-question" data-reveal="note">
                <p className={questionFont.className}>
                  <span className="sr-only">What if </span>
                  <span aria-hidden="true">…</span>
                  {project.question}
                </p>
              </div>
              <div className="project-title" data-reveal="rise">
                <h3>{project.title}</h3>
                <LcdChip
                  text={String(index + 1).padStart(2, "0")}
                  hoverText="->"
                  columns={2}
                  dot={2}
                  className="project-id"
                />
              </div>
              <p className="project-description" data-reveal="rise">
                {project.description}
              </p>
              <a className="text-link" href={project.href} data-reveal="rise">
                Open {project.title}
                <ArrowUpRight aria-hidden="true" size={16} />
              </a>
            </li>
          ))}
        </ol>
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
      className="section experience-section"
      aria-labelledby="experience-heading"
      data-section-label="EXPERIENCE"
    >
      <ExperienceLightField count={roles.length} />
      <div className="shell">
        <SectionHead id="experience-heading">
          Where I&rsquo;ve worked.
        </SectionHead>
        <ol className="experience-stack">
          {roles.map((role, index) => (
            <li className="experience-entry" key={`${role.company}-${role.start}`}>
              <span className="experience-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="experience-body" data-reveal="rise">
                <h3 className="experience-company">
                  <a href={role.href}>{role.company}</a>
                </h3>
                <p className="experience-meta">
                  <span>{role.title}</span>
                  <span className="experience-date">
                    {role.start}–{role.end ?? "Present"}
                  </span>
                </p>
                <p className="experience-summary">{role.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function About() {
  const socials = [
    { name: "Email", url: DATA.contact.social.email.url },
    DATA.contact.social.GitHub,
    DATA.contact.social.LinkedIn,
    DATA.contact.social.X,
  ];

  return (
    <section
      id="about"
      className="section finale-section"
      aria-labelledby="about-heading"
      data-section-label="ABOUT"
    >
      <div className="shell">
        <div className="finale-intro">
          <SectionHead id="about-heading">
            Most of my free time goes into building.
          </SectionHead>
          <p className="finale-lede" data-reveal="rise">
            Software and games, usually starting with a problem I&rsquo;ve run
            into. I&rsquo;m {DATA.name}, based in {DATA.location}.
          </p>
        </div>
      </div>
      <LcdWall />
      <div className="shell">
        <div className="finale-contact">
          <div data-reveal="rise">
            <EmailLink
              email={DATA.contact.email}
              href={DATA.contact.social.email.url}
              prompt="Have an idea worth following?"
            />
          </div>
          <ul className="finale-socials" aria-label="Elsewhere" data-reveal="rise">
            {socials.map((social) => (
              <li key={social.name}>
                <a href={social.url}>
                  {social.name}
                  <ArrowUpRight aria-hidden="true" size={16} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="portfolio-footer">
      <div className="shell">
        <p>© 2026 {DATA.name}</p>
        <LondonClock />
      </div>
    </footer>
  );
}
