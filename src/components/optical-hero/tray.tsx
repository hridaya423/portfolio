"use client";

import type { CSSProperties, PointerEvent } from "react";
import geometry from "../../../public/optical-tray/manifest.json";

const destinations = [
  { label: "Work", href: "#projects" },
  { label: "Events", href: "#hackathons" },
  { label: "About", href: "#about" },
];

export function Tray() {
  function moveSheen(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--sheen-x",
      `${((event.clientX - bounds.left) / bounds.width) * 100}%`,
    );
  }

  return (
    <div className="optical-tray" onPointerMove={moveSheen}>
      <div className="tray-base" aria-hidden="true" />
      <div className="tray-sheen" aria-hidden="true" />
      <nav aria-label="Explore the portfolio" className="tray-navigation">
        {destinations.map(({ label, href }, index) => {
          const desktop = geometry["desktop-light"].tabs[index];
          const mobile = geometry["mobile-light"].tabs[index];
          return (
            <a
              key={label}
              href={href}
              className={`tray-tab tray-tab-${["work", "play", "about"][index]}`}
              style={
                {
                  "--tab-aspect": desktop.aspect,
                  "--mobile-aspect": mobile.aspect,
                  "--tab-x": `${desktop.x * 100}%`,
                  "--tab-y": `${desktop.y * 100}%`,
                  "--tab-w": `${desktop.width * 100}%`,
                  "--tab-h": `${desktop.height * 100}%`,
                  "--mobile-x": `${mobile.x * 100}%`,
                  "--mobile-y": `${mobile.y * 100}%`,
                  "--mobile-w": `${mobile.width * 100}%`,
                  "--mobile-h": `${mobile.height * 100}%`,
                } as CSSProperties
              }
            >
              <span className="tab-art" aria-hidden="true" />
              <span className="tab-label">{label}</span>
            </a>
          );
        })}
      </nav>
      <div className="tray-lip" aria-hidden="true" />
    </div>
  );
}
