import { events, credentials } from "@/data/portfolio";
import { notFound } from "next/navigation";
import { Projects, Experience, About } from "@/components/portfolio/sections";
import { Events } from "@/components/portfolio/events";
import { Certifications } from "@/components/portfolio/certifications";
import { portfolioFont } from "@/components/portfolio/font";
import "@/components/portfolio/portfolio.css";

export const metadata = { robots: { index: false, follow: false } };
const sections = {
  projects: Projects,
  experience: Experience,
  events: () => <Events entries={events} />,
  certifications: () => <Certifications entries={credentials} />,
  about: About,
};
export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}
export default async function Review({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!(section in sections)) notFound();
  const Section = sections[section as keyof typeof sections];
  return (
    <main className={`portfolio-home review-page ${portfolioFont.variable}`}>
      <Section />
    </main>
  );
}
