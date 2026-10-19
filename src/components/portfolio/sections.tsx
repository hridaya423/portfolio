import Image from "next/image";
import type { ReactNode } from "react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ArrowUpRight } from "lucide-react";
import { DATA } from "@/data/resume";
import { experience, projects } from "@/data/portfolio";
import { questionFont } from "./font";
import { ExperienceLightField } from "./experience-light-field";
import { HelloBoard } from "./hello-board";
import { ProjectVideo } from "./project-video";

export function SectionHead({
  id,
  index,
  label,
  children,
}: {
  id: string;
  index: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <header className="section-head">
      <p className="section-label" data-reveal="fade">
        <span className="section-index">{index}</span>
        {label}
      </p>
      <h2 id={id} className="section-title" data-reveal="words">
        {children}
      </h2>
    </header>
  );
}

function NoteArrow() {
  return (
    <svg viewBox="0 0 80 100" aria-hidden="true" className="note-arrow">
      <path d="M5 67C25 75 49 64 43 47C39 35 25 39 31 50C39 63 61 39 73 25" />
      <path d="M61 28Q67 26 73 25Q72 32 73 37" />
    </svg>
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
          <p className="section-label" data-reveal="fade">
            <span className="section-index">01</span>
            Selected work
          </p>
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
        <ol className="project-list">
          {projects.map((project, index) => (
            <li
              className="project"
              data-side={index % 2 ? "right" : "left"}
              key={project.id}
            >
              <div className="project-media" data-reveal="media">
                {"video" in project && project.video ? (
                  <ProjectVideo
                    href={project.href}
                    src={project.video}
                    poster={project.image}
                    label={`Open ${project.title}`}
                    width={project.previewWidth}
                    height={project.previewHeight}
                  />
                ) : (
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
                      sizes="(min-width: 1200px) 680px, (min-width: 768px) 58vw, 100vw"
                    />
                  </a>
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
              <div className="project-info">
                <div className="project-note" data-reveal="note">
                  <p className={questionFont.className}>{project.question}</p>
                  <NoteArrow />
                </div>
                <h3 data-reveal="rise">{project.title}</h3>
                <p className="project-description" data-reveal="rise">
                  {project.description}
                </p>
                <ul className="project-tags" aria-label="Built with" data-reveal="rise">
                  {project.technologies.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
                <a className="text-link" href={project.href} data-reveal="rise">
                  Open {project.title}
                  <ArrowUpRight aria-hidden="true" size={16} />
                </a>
              </div>
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
        <SectionHead id="experience-heading" index="02" label="Experience">
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
          <SectionHead id="about-heading" index="05" label="About">
            Most of my free time goes into building.
          </SectionHead>
          <p className="finale-lede" data-reveal="rise">
            Software and games, usually starting with a problem I&rsquo;ve run
            into. I&rsquo;m {DATA.name}, based in {DATA.location}.
          </p>
        </div>
        <HelloBoard />
        <div className="finale-contact">
          <div data-reveal="rise">
            <p className="finale-prompt">Have an idea worth following?</p>
            <a className="finale-email" href={DATA.contact.social.email.url}>
              {DATA.contact.email}
            </a>
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
        <p className="footer-colophon">{DATA.location}</p>
        <a href="#hero">Back to top</a>
      </div>
    </footer>
  );
}
