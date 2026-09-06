"use client";

import Image from "next/image";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useState, useSyncExternalStore, type CSSProperties } from "react";
import type { Credential } from "@/data/portfolio";

const subscribe = () => () => {};
const featuredIds = ["az-900", "pega", "oracle", "ai-900", "github"];
const issuerMarks: Record<string, string> = {
  Microsoft: "/issuers/microsoft.png",
  Pega: "/issuers/pega.svg",
  Oracle: "/issuers/oracle.gif",
};

export function Certifications({ entries }: { entries: Credential[] }) {
  const enhanced = useSyncExternalStore(subscribe, () => true, () => false);
  const [issuer, setIssuer] = useState("All");
  const filtered = entries.filter((entry) => issuer === "All" || entry.issuer === issuer);
  const featured = issuer === "All"
    ? [...featuredIds.flatMap((id) => filtered.filter((entry) => entry.id === id)), ...filtered.filter((entry) => !featuredIds.includes(entry.id))].slice(0, 5)
    : filtered.slice(0, 5);
  const pega = filtered.find((entry) => entry.id === "pega");

  return (
    <section id="achievements" className="certifications-section section-width" aria-labelledby="certifications-heading">
      <header>
        <h2 id="certifications-heading">Certifications</h2>
        {enhanced && (
          <div className="issuer-filters" aria-label="Filter by issuer">
            {["All", ...new Set(entries.map((entry) => entry.issuer))].map((name) => (
              <button key={name} aria-pressed={issuer === name} onClick={() => setIssuer(name)}>{name}</button>
            ))}
          </div>
        )}
      </header>
      <div className="credential-deck">
        {featured.map((entry) => (
          <article className="credential-card" key={entry.id}>
            <Image unoptimized className="material" src="/materials/card.webp" alt="" width={1600} height={1186} loading="lazy" />
            <div className="credential-issuer">
              {issuerMarks[entry.issuer] ? (
                <Image unoptimized className="issuer-mark" src={issuerMarks[entry.issuer]} alt={entry.issuer} width={110} height={26} />
              ) : entry.issuer === "GitHub" ? <><GitHubLogoIcon width={22} height={22} /> GitHub</> : entry.issuer}
            </div>
            <h3>{entry.id === "pega" ? "System Architect" : entry.id === "oracle" ? "Gen AI" : entry.title}</h3>
            {entry.id !== "pega" && entry.name.toLowerCase() !== entry.title.toLowerCase() && <p>{entry.name}</p>}
            <div className="credential-card-bottom">
              <span>{`Earned at ${entry.ageEarned}`}</span>
              <a href={entry.href} aria-label={`Verify ${entry.title}`}>Verify</a>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && <p>No credentials in this collection yet.</p>}
      <div className="credential-index" style={{ "--index-rows": Math.max(1, Math.ceil(filtered.length / 3)) } as CSSProperties}>
        {filtered.map((entry, index) => (
          <div className="credential-index-entry" key={entry.id}>
            <span className="credential-number">{index + 1}</span>
            <span className="credential-title">{entry.title}</span>
            {entry.id !== "pega" && entry.name.toLowerCase() !== entry.title.toLowerCase() && <span className="credential-name">{entry.name}</span>}
            <span className="credential-age">Age {entry.ageEarned}</span>
            <a href={entry.href} aria-label={`Verify ${entry.title}`}>Verify</a>
          </div>
        ))}
      </div>
      {pega && (
        <details className="verification-help">
          <summary>Pega verification instructions</summary>
          <p>{pega.detail}</p>
        </details>
      )}
    </section>
  );
}
