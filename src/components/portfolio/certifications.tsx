"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ArrowRightIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import type { Credential } from "@/data/portfolio";
import { CredentialRefraction } from "./credential-refraction";

const issuerMarks: Record<string, string> = {
  Microsoft: "/issuers/microsoft.svg",
  Pega: "/issuers/pega.svg",
  Oracle: "/issuers/oracle.svg",
};

function labelFor(entry: Credential) {
  return entry.issuer === "Microsoft" ? entry.title : entry.issuer;
}

export function Certifications({ entries }: { entries: Credential[] }) {
  const group = useId();
  const [selected, setSelected] = useState(entries[0]?.id);
  const active = entries.find(entry => entry.id === selected) ?? entries[0];

  return <section id="achievements" className="certifications-section" aria-labelledby="certifications-heading">
    <h2 id="certifications-heading">Certifications</h2>
    <noscript><style>{`
      .credential-artwork, .credential-choice, .credential-radio, .credential-mobile-selection { display: none; }
      .credential-selection { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 40px; }
      .credential-detail { display: block; position: static; width: auto; grid-column: auto; grid-row: auto; }
    `}</style></noscript>
    {active ? <div className="credential-experience">
      <div className="credential-artwork"><CredentialRefraction inscription={labelFor(active)} /></div>
      <fieldset className="credential-selection">
        <legend className="credential-sr-only">Choose a certification</legend>
        {entries.map(entry => <div className="credential-item" key={entry.id}>
          <input className="credential-radio" type="radio" name={group} id={`${group}-${entry.id}`} value={entry.id} checked={entry.id === active.id} onChange={() => setSelected(entry.id)} aria-label={entry.name} />
          <label className="credential-choice" htmlFor={`${group}-${entry.id}`}>{labelFor(entry)}</label>
          <article className="credential-detail" data-credential={entry.id}>
            <div className="credential-issuer">
              {issuerMarks[entry.issuer] ? <Image unoptimized src={issuerMarks[entry.issuer]} alt={entry.issuer} width={150} height={32} />
                : entry.issuer === "GitHub" ? <><GitHubLogoIcon aria-hidden="true" /> GitHub</> : entry.issuer}
            </div>
            <h3>{entry.name.replace(/^Microsoft /, "")}</h3>
            <p className="credential-age">Earned at {entry.ageEarned}</p>
            <a className="credential-verify" href={entry.href} aria-label={`Verify ${entry.name}`}>Verify credential<ArrowRightIcon aria-hidden="true" /></a>
            {entry.id === "pega" && <details className="verification-help"><summary>Verification instructions</summary><p>{entry.detail}</p></details>}
          </article>
        </div>)}
      </fieldset>
      <label className="credential-mobile-selection">
        <span className="credential-sr-only">Choose a certification</span>
        <select value={active.id} onChange={event => setSelected(event.target.value)}>
          {entries.map(entry => <option key={entry.id} value={entry.id}>{labelFor(entry)} · {entry.name}</option>)}
        </select>
      </label>
    </div> : <p>No credentials in this collection yet.</p>}
  </section>;
}
