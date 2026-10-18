import { DATA } from "./resume";

export const projects = DATA.projects.map((project) => ({
  ...project,
  alt: `${project.title} interface`,
}));
export type PortfolioEvent = {
  id: string;
  city: string;
  country: string;
  title: string;
  date: string;
  description: string;
  href: string;
  game?: { title: string; href: string; repo: string };
  project?: { title: string; repo: string };
  award?: string;
  // Defaults to the city, for events that weren't a trip.
  label?: string;
  cloud?: string;
};
export const events: PortfolioEvent[] = [
  {
    id: "reinvent-the-wheel",
    city: "London",
    country: "United Kingdom",
    title: "Reinvent the Wheel",
    date: "16–18 October 2026",
    description:
      "Built Locus at Reinvent the Wheel, a Tools for Science hackathon in King's Cross: ask for public datasets in plain English and it searches 891k of them across 18 repositories, counts case and control samples, and writes nf-core samplesheets. It took 1st place and the £1,000 grand prize.",
    href: "https://luma.com/vdq0qw9u",
    project: { title: "Locus", repo: "https://github.com/hridaya423/locus" },
    award: "1st place",
    label: "Reinvent the Wheel",
    cloud: "£1000",
  },
  {
    id: "juice",
    city: "Shanghai",
    country: "China",
    title: "Juice",
    date: "April 2025",
    description:
      "Made Undead Courier for Juice: 100 hours building a game for a gaming pop-up café in Shanghai.",
    href: "https://juice.hackclub.com",
    game: {
      title: "Undead Courier",
      href: "https://undeadcourier.hridya.tech/",
      repo: "https://github.com/hridaya423/undeadcourier",
    },
  },
  {
    id: "shiba",
    city: "Tokyo",
    country: "Japan",
    title: "Shiba",
    date: "November 2025",
    description:
      "Made Whisper for Shiba: 120 hours building a game for an arcade in Tokyo.",
    href: "https://shiba.hackclub.com",
    game: {
      title: "Whisper",
      href: DATA.hackathons[1].links[1].href,
      repo: "https://github.com/hridaya423/whisper",
    },
  },
  {
    id: "open-sauce",
    city: "San Francisco",
    country: "United States",
    title: "Open Sauce",
    date: "17–19 July 2026",
    description: "Open Sauce 2026 at the San Mateo County Event Center, in the San Francisco Bay Area.",
    href: "https://www.opensauce.com/",
  },
];
export const credentials = DATA.achievements.map((credential) => ({
  ...credential,
  href: credential.link,
  detail: credential.subtitle,
}));
export type Credential = (typeof credentials)[number];
export const experience = DATA.work;
