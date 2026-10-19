"use client";

import { useEffect, useRef, useState } from "react";
import { CloudCanvas } from "./cloud-canvas";

export function EventArtwork({ text, title, initiallyOpen }: { text: string; title: string; initiallyOpen: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  // Each cloud scene holds a WebGL context, so closed rows don't create one.
  const [open, setOpen] = useState(initiallyOpen);
  const label = text === "San Francisco" ? "SAN\nFRANCISCO" : text.toUpperCase();

  useEffect(() => {
    const details = ref.current?.closest("details");
    if (!details) return;
    const sync = () => { if (details.open) setOpen(true); };
    details.addEventListener("toggle", sync);
    return () => details.removeEventListener("toggle", sync);
  }, []);

  return (
    <div className="event-visual event-cloud" ref={ref}>
      <div className={`cloud-artwork${label.includes("\n") ? " cloud-artwork-stacked" : ""}`} role="img" aria-label={`${text}, formed from sunlit clouds`}>
        {open && <CloudCanvas fontFamily="Arial, sans-serif" city={label} playing />}
      </div>
      <div className="cloud-title">{title}</div>
    </div>
  );
}
