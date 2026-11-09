import Link from "next/link";
import { DATA } from "@/data/resume";
import { LcdChip } from "./lcd-chip";
import { SiteName } from "./site-name";

const links = [
  { label: "Work", href: "/#projects" },
  { label: "Events", href: "/#hackathons" },
  { label: "About", href: "/about" },
];

export function IndexHeader({ label = "PROJECTS" }: { label?: string }) {
  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <header className="site-header" data-shown="true">
        <div className="site-header-inner shell">
          <Link className="site-header-name" href="/" aria-label={`${DATA.name}, home`}>
            <SiteName />
          </Link>
          <LcdChip text={label} columns={10} dot={1.9} className="site-header-lcd" />
          <nav aria-label="Sections" className="site-header-nav">
            {links.map(({ label, href }) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
