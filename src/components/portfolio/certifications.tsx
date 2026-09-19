import Image from "next/image";
import { ArrowRightIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import type { Credential } from "@/data/portfolio";
import { questionFont } from "./font";

const microsoftBadges = ["az-900", "dp-900", "ai-900", "sc-900", "pl-900", "pl-100"];

const issuerMarks: Record<string, string> = {
  Microsoft: "/issuers/microsoft.svg",
  Pega: "/issuers/pega.svg",
  Oracle: "/issuers/oracle.svg",
};

function Issuer({ name }: { name: string }) {
  return <div className="credential-issuer">
    {issuerMarks[name] ? <Image unoptimized src={issuerMarks[name]} alt={name} width={150} height={32} />
      : name === "GitHub" ? <><GitHubLogoIcon aria-hidden="true" /> GitHub</> : name}
  </div>;
}

function CredentialEntry({ entry, showIssuer = false }: { entry: Credential; showIssuer?: boolean }) {
  return <article className="credential-card" data-credential={entry.id}>
    {showIssuer && <Issuer name={entry.issuer} />}
    {microsoftBadges.includes(entry.id) && <Image unoptimized className="credential-badge" src={`/credential-badges/${entry.id}.png`} alt="" width={672} height={352} />}
    <h3>{entry.issuer === "Microsoft" ? entry.title : entry.name}</h3>
    {entry.issuer === "Microsoft" && <p className="credential-name">{entry.name.replace(/^Microsoft /, "")}</p>}
    <div className="credential-footer">
      <span className={`stamp-earned ${questionFont.className}`}>Earned at {entry.ageEarned}</span>
      <a className="stamp-verify" href={entry.href} aria-label={`Verify ${entry.name}`}>Verify<ArrowRightIcon aria-hidden="true" /></a>
    </div>
  </article>;
}

export function Certifications({ entries }: { entries: Credential[] }) {
  const microsoft = entries.filter((entry) => entry.issuer === "Microsoft");
  const others = entries.filter((entry) => entry.issuer !== "Microsoft");
  const pega = entries.find((entry) => entry.id === "pega");

  return (
    <section id="achievements" className="certifications-section" aria-labelledby="certifications-heading">
      <header className="certifications-heading">
        <h2 id="certifications-heading">Certifications</h2>
        <p className={`certifications-note ${questionFont.className}`}>Always learning.</p>
      </header>
      {entries.length ? <div className="credential-book">
        <Image unoptimized className="book-render" src="/materials/certifications/book-polished.webp" alt="" width={2800} height={1610} />
        <div className="notebook-page microsoft-page">
          <Image unoptimized className="page-render" src="/materials/certifications/page-polished.webp" alt="" width={1400} height={2644} />
          <Issuer name="Microsoft" />
          <div className="microsoft-credentials">{microsoft.map((entry) => <CredentialEntry key={entry.id} entry={entry} />)}</div>
        </div>
        <div className="notebook-page other-credentials">
          <Image unoptimized className="page-render" src="/materials/certifications/page-polished.webp" alt="" width={1400} height={2644} />
          {others.map((entry) => <CredentialEntry key={entry.id} entry={entry} showIssuer />)}
        </div>
      </div> : <p>No credentials in this collection yet.</p>}
      {pega && <details className="verification-help"><summary>Pega verification instructions</summary><p>{pega.detail}</p></details>}
    </section>
  );
}
