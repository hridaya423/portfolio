import Image from "next/image";
import Link from "next/link";
import { GitHubLogoIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { DATA } from "@/data/resume";
import { projectIndex } from "@/data/portfolio";
import { formatStars, getStars, starsFor } from "@/data/github";
import { EmailLink } from "./email-link";
import { questionFont } from "./font";
import { LcdChip } from "./lcd-chip";

const links = [
  { label: "Work", href: "/#projects" },
  { label: "Events", href: "/#hackathons" },
  { label: "About", href: "/#about" },
];

function IndexHeader() {
  return (
    <header className="site-header" data-shown="true">
      <div className="site-header-inner shell">
        <Link className="site-header-name" href="/">
          {DATA.name}
        </Link>
        <LcdChip text="PROJECTS" columns={10} dot={1.9} className="site-header-lcd" />
        <nav aria-label="Sections" className="site-header-nav">
          {links.map(({ label, href }) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export async function ProjectIndex() {
  const stars = await getStars();
  return (
    <>
      <IndexHeader />
      <section className="section index-section" aria-labelledby="index-heading">
        <div className="shell">
          <header className="index-head">
            <h1 id="index-heading">
              <span className="sr-only">Projects: what if?</span>
              <Image src="/what-if.svg" alt="" width={407} height={105} aria-hidden="true" priority />
            </h1>
            <p className="index-lede">
              Ideas I followed until they worked. Each one started as a question.
            </p>
          </header>
          <ol className="sheet">
            {projectIndex.map((entry, index) => {
              const starCount = starsFor(stars, entry.repo);
              const href = entry.href ?? entry.repo;
              return (
                <li className="sheet-item" key={entry.id} id={entry.id} data-lcd-host>
                  <div className="sheet-media">
                    <a href={href} className="sheet-frame" aria-label={`Open ${entry.title}`}>
                      {entry.image ? (
                        <Image
                          src={entry.image.src}
                          alt={`${entry.title} interface`}
                          width={entry.image.width}
                          height={entry.image.height}
                          sizes="(min-width: 1100px) 400px, (min-width: 700px) 46vw, 100vw"
                          loading={index < 3 ? "eager" : undefined}
                        />
                      ) : (
                        <span className="sheet-plate" aria-hidden="true">
                          {entry.title}
                        </span>
                      )}
                    </a>
                    {entry.repo && (
                      <a
                        href={entry.repo}
                        className="media-button source-link"
                        aria-label={`${entry.title} on GitHub${starCount ? `, ${starCount} stars` : ""}`}
                        data-stars={starCount ? "" : undefined}
                      >
                        <GitHubLogoIcon width={20} height={20} />
                        {starCount && (
                          <span className="star-count" aria-hidden="true">
                            <StarFilledIcon width={13} height={13} />
                            {formatStars(starCount)}
                          </span>
                        )}
                      </a>
                    )}
                  </div>
                  <p className={`sheet-question ${questionFont.className}`}>
                    <span className="sr-only">What if </span>
                    <span aria-hidden="true">…</span>
                    {entry.question}
                  </p>
                  <div className="sheet-title">
                    <h3>
                      <a href={href}>{entry.title}</a>
                    </h3>
                    <LcdChip
                      text={String(index + 1).padStart(2, "0")}
                      hoverText="->"
                      columns={2}
                      dot={2}
                    />
                  </div>
                  <p className="sheet-description">{entry.description}</p>
                </li>
              );
            })}
          </ol>
          <div className="index-close">
            <EmailLink
              email={DATA.contact.email}
              href={DATA.contact.social.email.url}
              prompt="Have an idea worth following?"
            />
          </div>
        </div>
      </section>
    </>
  );
}
