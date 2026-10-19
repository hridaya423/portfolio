"use client";

import { useEffect, useState } from "react";
import { DATA } from "@/data/resume";
import { LedText } from "./led-text";

const links = [
  { label: "Work", href: "#projects" },
  { label: "Events", href: "#hackathons" },
  { label: "About", href: "#about" },
];

/**
 * The compact header that takes over once the hero's own header scrolls away.
 * Its LED plaque reads out the section in view, like the panel on the tray.
 */
export function SiteHeader() {
  const [label, setLabel] = useState("HELLO");
  const [shown, setShown] = useState(false);
  const EmailIcon = DATA.contact.social.email.icon;

  useEffect(() => {
    // Takes over once the tray, the hero's own navigation, has left the screen.
    const tray = document.querySelector(".optical-tray");
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section-label]"),
    );
    const header = new IntersectionObserver(([entry]) =>
      setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    if (tray) header.observe(tray);
    const current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting)
            setLabel((entry.target as HTMLElement).dataset.sectionLabel ?? "");
        }
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    sections.forEach((section) => current.observe(section));
    return () => {
      header.disconnect();
      current.disconnect();
    };
  }, []);

  return (
    <header className="site-header" data-shown={shown} inert={!shown}>
      <div className="site-header-inner shell">
        <a className="site-header-name" href="#hero">
          {DATA.name}
        </a>
        <div className="led-plaque">
          <LedText text={label} capacity={10} className="led-panel" />
        </div>
        <nav aria-label="Sections" className="site-header-nav">
          {links.map(({ label, href }) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
          <a
            className="social-icon-link"
            href={DATA.contact.social.email.url}
            aria-label="Email"
            title="Email"
          >
            <EmailIcon aria-hidden="true" width={18} height={18} />
          </a>
        </nav>
      </div>
    </header>
  );
}
