"use client";

import { CloudCanvas } from "./cloud-canvas";

export function EventArtwork({ city, title }: { city: string; title: string }) {
  const label = city === "San Francisco" ? "SAN\nFRANCISCO" : city.toUpperCase();
  return (
    <div className="event-visual event-cloud">
      <div className={`cloud-artwork${label.includes("\n") ? " cloud-artwork-stacked" : ""}`} role="img" aria-label={`${city}, formed from sunlit clouds`}>
        <CloudCanvas fontFamily="Arial, sans-serif" city={label} playing />
      </div>
      <div className="cloud-title">{title}</div>
    </div>
  );
}
