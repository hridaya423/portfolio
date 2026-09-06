import { Events } from "@/components/portfolio/events";
import { Certifications } from "@/components/portfolio/certifications";
import { Experience } from "@/components/portfolio/sections";
import { events, credentials, experience } from "@/data/portfolio";
import { portfolioFont } from "@/components/portfolio/font";
import "@/components/portfolio/portfolio.css";

export const metadata = { robots: { index: false, follow: false } };
export default async function Fixtures({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const eventEntries =
    state === "empty"
      ? []
      : state === "single"
        ? events.slice(0, 1)
        : [
            ...events,
            {
              ...events[0],
              id: "fixture-shanghai",
              title: "Second Shanghai event",
              date: "Fixture",
              description: "Layout test for a second event in the same city.",
            },
            {
              ...events[1],
              id: "fixture-long",
              city: "San Cristóbal de las Casas",
              country: "Mexico",
              title: "Long city fixture",
              date: "Fixture",
              description: "Layout test for a long city name.",
              game: undefined,
            },
          ];
  const credentialEntries =
    state === "empty"
      ? []
      : state === "single"
        ? credentials.slice(0, 1)
        : [
            ...credentials,
            {
              ...credentials[0],
              id: "fixture-extra",
              title: "Additional credential",
              name: "A longer credential display name for layout verification",
            },
          ];
  return (
    <main className={`portfolio-home ${portfolioFont.variable}`}>
      <p>Review fixtures. These entries are not portfolio claims.</p>
      <Events entries={eventEntries} />
      <Certifications entries={credentialEntries} />
      <Experience
        roles={[
          ...experience,
          {
            ...experience[0],
            company: "Another employer",
            title: "Role fixture",
            summary:
              "A concise responsibility summary for layout verification.",
          },
        ]}
      />
    </main>
  );
}
