"use client";

import { CloudCanvas } from "./cloud-canvas";

export function EventArtwork({ text, title }: { text: string; title: string }) {
  const label = text === "San Francisco" ? "SAN\nFRANCISCO" : text.toUpperCase();
  return (
    <div className="event-visual event-cloud">
      <div className={`cloud-artwork${label.includes("\n") ? " cloud-artwork-stacked" : ""}`} role="img" aria-label={`${text}, formed from sunlit clouds`}>
        <CloudCanvas fontFamily="Arial, sans-serif" city={label} playing />
      </div>
      <div className="cloud-title">{title}</div>
    </div>
  );
}
